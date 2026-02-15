"""
Parallel Studio Processor — Fire-and-forget with real-time Firestore updates.

Architecture:
  1. start_studio_session(skus) → Called by the callable. Creates tracking doc,
     marks products as BATCH_GENERATING, returns immediately (<1 second).
  2. process_studio_queue(batch_id) → Called by Firestore onCreate trigger.
     Processes products ONE AT A TIME with 30s delay between each.
     Writes results to Firestore after EACH product completes.
  3. check_and_process_batches() → Cron safety net for crash recovery.

Rate Limiting:
  - Hard 30-second delay between requests (no 429 errors)
  - Exponential backoff on any 429: 30s → 60s → 120s → 240s
  - Max 5 retries per product
"""

import os
import json
import uuid
import logging
import base64
import time
import random
import requests
import urllib3
from typing import List, Dict, Any, Optional

from firebase_admin import firestore
from google.genai import types

from core.llm_config import LLMConfig

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
DELAY_BETWEEN_REQUESTS = 30   # Hard 30s between each image generation
MAX_RETRIES = 5               # Retries per product on 429
INITIAL_BACKOFF = 30          # Starting backoff on 429 (doubles each retry)
REQUEST_TIMEOUT = 20          # Image download timeout

STUDIO_PROMPTS = {
    "clean": """Edit this product image to create a professional e-commerce studio shot.
1.  **Subject Isolation**: EXTRACT A SINGLE ITEM. If the source image shows multiple items (e.g., a set of markers), identify the main product unit and generate ONLY ONE single item. Do not show a group or bundle.
2.  **Accuracy**: PRESERVE THE EXACT APPEARANCE of the product. Retain all text, labels, logos, colors, and textures from the source. Do not hallucinate new details or text.
3.  **Composition & Angle**: Show the product from a straight-on, front-facing eye-level angle. Center the product vertically and horizontally. The product should occupy approximately 75-80% of the canvas height. Ensure the entire product is visible (not cut off).
4.  **Background**: Use a pure white (#FFFFFF) background with NO texture or horizon line.
5.  **Lighting & Style**: Use soft, even, high-key studio lighting to minimize harsh shadows. Create a clean, minimal, commercial look suitable for a premium catalog. High resolution, sharp focus.""",

    "realistic": """Edit this product image.
Replace the background with a clean, light-grey polished concrete surface.
Background is a softly blurred, minimalist workshop setting with neutral earth tones.
Keep the product EXACTLY as it appears in the source image — preserve all labels, text, branding, colors, shape, and proportions.
Do NOT modify, redraw, translate, or reimagine the product itself in any way.
Lighting is soft, natural daylight from the side, creating realistic soft shadows.
Authentic aesthetic, premium yet practical."""
}

# Default environment for backward compatibility
DEFAULT_ENVIRONMENT = "clean"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _upload_image_to_storage(image_bytes: bytes, mime_type: str, sku: str) -> str:
    """Upload raw image bytes to Firebase Storage, return public URL."""
    from firebase_admin import storage as fb_storage

    bucket = fb_storage.bucket()
    filename = f"{uuid.uuid4()}.jpg"
    blob_path = f"generated-images/{sku}/{filename}"
    blob = bucket.blob(blob_path)
    blob.upload_from_string(image_bytes, content_type=mime_type)
    blob.make_public()
    return blob.public_url


def _download_source_image(url: str) -> tuple:
    """Download an image from a URL, return (bytes, mime_type)."""
    resp = requests.get(url, timeout=REQUEST_TIMEOUT, verify=False)
    resp.raise_for_status()
    mime_type = resp.headers.get("Content-Type", "image/jpeg")
    return resp.content, mime_type


def _generate_image_with_backoff(client, image_data: bytes, mime_type: str, prompt: str) -> Any:
    """
    Call Gemini image generation with aggressive exponential backoff.
    """
    delay = INITIAL_BACKOFF

    for attempt in range(MAX_RETRIES + 1):
        try:
            response = client.models.generate_content(
                model=LLMConfig.get_image_model_name(),
                contents=[
                    types.Content(
                        role="user",
                        parts=[
                            types.Part.from_bytes(data=image_data, mime_type=mime_type),
                            types.Part.from_text(text=prompt)
                        ]
                    )
                ],
                config=types.GenerateContentConfig(
                    temperature=0.2,
                ),
            )
            return response

        except Exception as e:
            error_str = str(e)
            if ("429" in error_str or "RESOURCE_EXHAUSTED" in error_str) and attempt < MAX_RETRIES:
                sleep_time = delay + random.uniform(0, 5)
                logger.warning(
                    f"Rate limited (429). Waiting {sleep_time:.0f}s... "
                    f"(attempt {attempt + 1}/{MAX_RETRIES})"
                )
                time.sleep(sleep_time)
                delay *= 2  # 30 → 60 → 120 → 240
                continue
            raise


def _extract_image_from_response(response) -> Optional[bytes]:
    """Extract generated image bytes from Gemini response."""
    if hasattr(response, 'generated_image') and response.generated_image:
        return None  # URL-only, not applicable

    if response.candidates and response.candidates[0].content.parts:
        for part in response.candidates[0].content.parts:
            if part.inline_data:
                return part.inline_data.data
    return None


# ---------------------------------------------------------------------------
# 1. Start Studio Session (returns immediately — called by Cloud Function)
# ---------------------------------------------------------------------------

def start_studio_session(skus: List[str], environment: str = None, priority: str = "normal") -> dict:
    """
    Creates tracking doc + marks products. Returns in <1 second.
    Actual processing is triggered by Firestore onCreate on enrichment_batches.

    Args:
        skus: List of product SKUs to process.
        environment: "clean" (white bg) or "realistic" (workshop bg). Defaults to DEFAULT_ENVIRONMENT.
        priority: "high" or "normal". High-priority batches are processed first.

    Returns: {"batch_id": str, "count": int}
    """
    db = firestore.client()
    batch_id = str(uuid.uuid4())
    env = environment or DEFAULT_ENVIRONMENT

    logger.info(f"[Studio {batch_id}] Creating session for {len(skus)} SKUs (env={env}, priority={priority})")

    # Create tracking document
    sku_results = {sku: {"status": "QUEUED", "error": None} for sku in skus}
    db.collection("enrichment_batches").document(batch_id).set({
        "job_name": f"parallel-studio-{batch_id}",
        "mode": "parallel",
        "status": "QUEUED",  # Will be picked up by Firestore trigger
        "skus": skus,
        "sku_results": sku_results,
        "total_count": len(skus),
        "completed_count": 0,
        "failed_count": 0,
        "environment": env,
        "priority": priority,
        "created_at": firestore.SERVER_TIMESTAMP,
        "updated_at": firestore.SERVER_TIMESTAMP,
    })

    # Mark all products as batch generating
    for sku in skus:
        try:
            db.collection("staging_products").document(sku).update({
                "status": "BATCH_GENERATING",
                "enrichment_message": "Queued for Studio Generation..."
            })
        except Exception as e:
            logger.error(f"[Studio {batch_id}] Failed to mark {sku}: {e}")

    logger.info(f"[Studio {batch_id}] Session created. Processing will start via trigger.")
    return {"batch_id": batch_id, "count": len(skus)}


# ---------------------------------------------------------------------------
# 2. Process Studio Queue (called by Firestore trigger or cron)
# ---------------------------------------------------------------------------

def process_studio_queue(batch_id: str) -> dict:
    """
    Process products one at a time with 30s delay between each.
    Each result is written to Firestore immediately for real-time UI.

    Returns: {"completed": int, "failed": int, "total": int}
    """
    db = firestore.client()
    client = LLMConfig.get_client()

    batch_ref = db.collection("enrichment_batches").document(batch_id)
    batch_doc = batch_ref.get()

    if not batch_doc.exists:
        logger.error(f"[Studio {batch_id}] Batch doc not found")
        return {"error": "Batch not found"}

    batch_data = batch_doc.to_dict()
    skus = batch_data.get("skus", [])
    sku_results = batch_data.get("sku_results", {})
    environment = batch_data.get("environment", DEFAULT_ENVIRONMENT)

    # Mark as RUNNING
    batch_ref.update({
        "status": "RUNNING",
        "updated_at": firestore.SERVER_TIMESTAMP,
    })

    logger.info(f"[Studio {batch_id}] Processing {len(skus)} products with {DELAY_BETWEEN_REQUESTS}s delay")

    completed = 0
    failed = 0

    for i, sku in enumerate(skus):
        # Skip already-processed SKUs (for crash recovery)
        existing = sku_results.get(sku, {})
        if existing.get("status") in ("COMPLETED", "FAILED"):
            if existing["status"] == "COMPLETED":
                completed += 1
            else:
                failed += 1
            logger.info(f"[Studio {batch_id}] Skipping {sku} — already {existing['status']}")
            continue

        logger.info(f"[Studio {batch_id}] [{i + 1}/{len(skus)}] Processing {sku}")

        # Update product message with queue position
        try:
            db.collection("staging_products").document(sku).update({
                "enrichment_message": f"Generating studio image ({i + 1} of {len(skus)})..."
            })
        except Exception:
            pass

        # Process single product
        result = _process_single_product(client, db, sku, batch_id, environment)

        if result["success"]:
            completed += 1
            sku_results[sku] = {
                "status": "COMPLETED",
                "error": None,
                "image_url": result.get("image_url"),
            }
        else:
            failed += 1
            sku_results[sku] = {
                "status": "FAILED",
                "error": result["error"],
            }

        # Update batch tracking (real-time for UI)
        batch_ref.update({
            "sku_results": sku_results,
            "completed_count": completed,
            "failed_count": failed,
            "updated_at": firestore.SERVER_TIMESTAMP,
        })

        # Hard 30s delay between requests (skip after last)
        if i < len(skus) - 1:
            remaining_pending = [s for s in skus[i+1:] if sku_results.get(s, {}).get("status") not in ("COMPLETED", "FAILED")]
            if remaining_pending:
                logger.info(f"[Studio {batch_id}] Waiting {DELAY_BETWEEN_REQUESTS}s before next request...")
                time.sleep(DELAY_BETWEEN_REQUESTS)

    # Mark batch as complete
    final_status = "COMPLETED" if failed == 0 else "COMPLETED_WITH_ERRORS"
    batch_ref.update({
        "status": final_status,
        "completed_at": firestore.SERVER_TIMESTAMP,
        "updated_at": firestore.SERVER_TIMESTAMP,
    })

    summary = {
        "batch_id": batch_id,
        "completed": completed,
        "failed": failed,
        "total": len(skus),
    }
    logger.info(f"[Studio {batch_id}] Done: {json.dumps(summary)}")
    return summary


def _process_single_product(client, db, sku: str, batch_id: str, environment: str = None) -> dict:
    """
    Process ONE product: download source → generate image → upload → update Firestore.
    Returns {"success": True, "image_url": str} or {"success": False, "error": str}.
    """
    env = environment or DEFAULT_ENVIRONMENT
    doc_ref = db.collection("staging_products").document(sku)

    try:
        doc = doc_ref.get()
        if not doc.exists:
            error = "Product not found"
            doc_ref.update({"status": "ENRICHMENT_FAILED", "enrichment_message": error})
            return {"success": False, "error": error}

        data = doc.to_dict()
        ai_data = data.get("ai_data", {})
        selected_images = ai_data.get("selected_images", {})

        source_url = selected_images.get("base")
        if not source_url and selected_images:
            first_key = next(iter(selected_images))
            source_url = selected_images[first_key]

        if not source_url:
            error = "No source image selected"
            doc_ref.update({"status": "ENRICHMENT_FAILED", "enrichment_message": error})
            return {"success": False, "error": error}

        # Download source image
        image_data, mime_type = _download_source_image(source_url)

        # Generate studio image — select prompt based on environment
        prompt = STUDIO_PROMPTS.get(env, STUDIO_PROMPTS["clean"])
        response = _generate_image_with_backoff(client, image_data, mime_type, prompt)

        # Extract image
        img_bytes = _extract_image_from_response(response)
        if not img_bytes:
            error = "No image data in Gemini response"
            doc_ref.update({"status": "ENRICHMENT_FAILED", "enrichment_message": error})
            return {"success": False, "error": error}

        # Upload to Firebase Storage
        image_url = _upload_image_to_storage(img_bytes, "image/jpeg", sku)
        logger.info(f"[Studio {batch_id}] ✓ {sku}")

        # Update product — this triggers onSnapshot in the frontend
        doc_ref.update({
            "ai_data.generated_images": {"base": image_url},
            "status": "PENDING_STUDIO_REVIEW",
            "enrichment_message": "Studio image ready for review",
        })

        return {"success": True, "image_url": image_url}

    except Exception as e:
        error_str = str(e)[:150]
        logger.error(f"[Studio {batch_id}] ✗ {sku} — {error_str}")
        try:
            doc_ref.update({
                "status": "ENRICHMENT_FAILED",
                "enrichment_message": f"Studio error: {error_str[:80]}",
            })
        except Exception:
            pass
        return {"success": False, "error": error_str}


# ---------------------------------------------------------------------------
# 3. Cron Safety Net — crash recovery for parallel jobs
# ---------------------------------------------------------------------------

def check_and_process_batches() -> dict:
    """
    Called by Cloud Scheduler. Safety net for:
    - Parallel jobs that crashed mid-run (>15 min old, still RUNNING)
    - QUEUED jobs that never got their Firestore trigger (pick up and process)
    """
    db = firestore.client()
    summary = {"checked": 0, "recovered": 0, "processed": 0}

    # Check for QUEUED batches that may not have triggered
    # Process high-priority batches first
    queued = db.collection("enrichment_batches").where("status", "==", "QUEUED").get()
    queued_docs = list(queued)
    queued_docs.sort(key=lambda d: (0 if d.to_dict().get("priority") == "high" else 1, _get_doc_age_seconds(d)))
    for doc in queued_docs:
        age = _get_doc_age_seconds(doc)
        if age > 60:  # Queued for more than 1 minute — trigger missed
            logger.warning(f"[Cron] Picking up orphaned QUEUED batch {doc.id} (priority={doc.to_dict().get('priority', 'normal')})")
            try:
                process_studio_queue(doc.id)
                summary["processed"] += 1
            except Exception as e:
                logger.error(f"[Cron] Failed to process {doc.id}: {e}")
        summary["checked"] += 1

    # Check for crashed RUNNING batches
    running = db.collection("enrichment_batches").where("status", "==", "RUNNING").get()
    for doc in running:
        data = doc.to_dict()
        mode = data.get("mode", "batch")
        age = _get_doc_age_seconds(doc)

        if mode == "parallel" and age > 900:  # 15 min
            logger.warning(f"[Cron] Recovering crashed parallel batch {doc.id}")
            _recover_crashed_batch(db, doc)
            summary["recovered"] += 1

        summary["checked"] += 1

    logger.info(f"[Cron] Summary: {json.dumps(summary)}")
    return summary


def _get_doc_age_seconds(doc) -> float:
    """Get the age of a document in seconds."""
    import datetime
    data = doc.to_dict()
    created = data.get("created_at")
    if created:
        now = datetime.datetime.now(datetime.timezone.utc)
        return (now - created).total_seconds()
    return 0


def _recover_crashed_batch(db, batch_doc):
    """Mark unfinished products as failed in a crashed batch."""
    data = batch_doc.to_dict()
    skus = data.get("skus", [])
    sku_results = data.get("sku_results", {})

    for sku in skus:
        result = sku_results.get(sku, {})
        if result.get("status") not in ("COMPLETED", "FAILED"):
            sku_results[sku] = {"status": "FAILED", "error": "Process interrupted"}
            try:
                db.collection("staging_products").document(sku).update({
                    "status": "ENRICHMENT_FAILED",
                    "enrichment_message": "Studio process interrupted — retry available",
                })
            except Exception:
                pass

    batch_doc.reference.update({
        "status": "FAILED",
        "sku_results": sku_results,
        "error_details": "Crashed or timed out",
        "updated_at": firestore.SERVER_TIMESTAMP,
    })
