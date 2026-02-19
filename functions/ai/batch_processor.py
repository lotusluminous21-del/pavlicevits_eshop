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
import datetime
from typing import List, Dict, Any, Optional

from firebase_admin import firestore
from google.genai import types

from core.llm_config import LLMConfig
from .image_utils import normalize_product_image

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
    "clean": """Using the provided image ONLY as a reference for the product's labels, colors, and shape, generate a BRAND NEW photography with these exact rules:
1.  **COMMAND**: Ignore the camera angle, perspective, and lighting of the source image. Re-render the product from scratch, resting on an **invisible, seamless pure white studio floor**.
2.  **NEGATIVE INSTRUCTIONS**: DO NOT inherit the tilt, depth of field, or shadow placement from the original photo. **Wipe out all original specular highlights.** No visible pedestals or platforms.
3.  **Composition & Angle**: Show the product from a straight-on, front-facing eye-level angle. Center it vertically/horizontally. The product should occupy 75-80% of the canvas height. Full visibility (not cut off).
4.  **Lighting & style**: Use soft, even, high-key studio lighting. **The floor and background must be identical pure white (#FFFFFF), with only a realistic soft shadow at the base to indicate the surface.** Generate new, clean geometric highlights from studio softboxes on the product.
5.  **Subject Isolation**: EXTRACT A SINGLE ITEM. If the source shows multiple items, generate ONLY ONE single item. Do not show a group.
6.  **Identity Accuracy**: PRESERVE THE IDENTITY (text, labels, logos, colors). Ensure all text on the label is legible and identical to the source, but allow the product's physical orientation to be corrected to the straight-on angle defined in Point 3.
7.  **Background**: Pure white (#FFFFFF) background with NO texture.""",

    "realistic": """Using the provided image ONLY as a reference for the product's labels, colors, and shape, generate a BRAND NEW photography with these exact rules:
1.  **COMMAND**: Ignore the camera angle, perspective, and lighting of the source image. Re-render the product from scratch.
2.  **NEGATIVE INSTRUCTIONS**: DO NOT inherit the lighting direction or camera tilt from the source.
3.  **Composition & Lighting**: Side-on natural daylight creating realistic soft shadows. Show the product from a straight-on, eye-level angle.
4.  **Atmosphere**: Clean, light-grey polished concrete surface. Background is a softly blurred, minimalist workshop setting.
5.  **Identity Accuracy**: Keep the branding and labels EXACTLY as they appear — preserve all text and logos, but render them from the new documentation perspective.
6.  **Aesthetic**: Authentic, premium yet practical workshop vibe.""",

    "modern": """Using the provided image ONLY as a reference for the product's labels, colors, and shape, generate a BRAND NEW photography with these exact rules:
1.  **COMMAND**: Ignore the camera angle, perspective, and lighting of the source image. Re-render the product from scratch, resting on an **invisible, seamless pure white studio floor**.
2.  **NEGATIVE INSTRUCTIONS**: DO NOT follow the orientation or perspective of the original image. **Completely discard original lighting and reflections.** No visible pedestals or platforms.
3.  **Composition & Camera**: Straight-on, front-facing eye-level angle. Center vertically/horizontally. Product occupies 75-80% of canvas height.
4.  **Vibrant Lighting**: Professional multi-point studio lighting with subtle colored rim lighting (teal and purple) on the product edges. **The product surface must actively capture sharp reflections from the surrounding liquid splashes.**
5.  **Explosive Visuals**: SURROUND the product with a mild, artistic crown of dynamic high-viscosity liquid splashes and droplets in dark teal and deep purple. 
6.  **Identity Accuracy**: Extract the main product unit. PRESERVE THE BRANDING AND TEXT Identity, but re-render the physical position to be straight-on.
7.  **Background**: Pure white (#FFFFFF) background; the floor and background are the same color, differentiated only by the splashes and the product's soft contact shadow.
8.  **Aesthetic**: Tech-premium, sharp focus, high contrast with vibrant decorative accents."""
}

IMAGEN_PROMPTS = {
    "clean": "Ultra-sharp professional studio product photography. The product is center-framed and resting on a seamless, invisible pure white studio floor in a high-key, pure white setting. Lighting: **Recalibrated** clean 5500K daylight spectrum softbox lighting; the floor and background merge perfectly into #FFFFFF, with only a **soft, realistic ambient occlusion shadow at the base**. No pedestals. New geometric highlights override the original image lighting.",
    "realistic": "Professional cinematic product photography. The product sits on a high-texture, dark-grey polished concrete surface with realistic micro-reflections. Environment: A minimalist, high-end design workshop with soft, volumetric natural daylight streaming from a side window. Lighting: Warm 4000K sunlight with subtle lens bloom and soft, elongated natural shadows. Camera: 50mm f/1.8 depth of field, sharp focus on the product label with a creamy background blur.",
    "modern": "High-end commercial avant-garde photography. The product rests on an invisible white studio floor and is surrounded by a mild decorative crown of high-viscosity glossy liquid splashes in deep teal and vibrant neon purple. Lighting: **Environment-driven** tech-premium setup; the floor and background merge into pure #FFFFFF. The product surface must **reflect the vibrant teal and magenta colors from the splashes**, replacing original specular highlights. Shadow: Soft, subtle contact shadow at the base."
}

# Default environment for backward compatibility
DEFAULT_ENVIRONMENT = "clean"
DEFAULT_MODEL = "gemini"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _upload_image_to_storage(image_bytes: bytes, mime_type: str, sku: str) -> str:
    """Upload raw image bytes to Firebase Storage, return public URL. Overwrites previous version."""
    from firebase_admin import storage as fb_storage

    bucket = fb_storage.bucket()
    # Use a fixed filename to allow overwriting and efficient storage
    filename = "studio_base.jpg"
    blob_path = f"generated-images/{sku}/{filename}"
    blob = bucket.blob(blob_path)
    blob.cache_control = "no-cache, max-age=0"
    blob.upload_from_string(image_bytes, content_type=mime_type)
    blob.make_public()
    return blob.public_url


def _download_source_image(url: str) -> tuple:
    """Download an image from a URL, return (bytes, mime_type)."""
    resp = requests.get(url, timeout=REQUEST_TIMEOUT, verify=False)
    resp.raise_for_status()
    mime_type = resp.headers.get("Content-Type", "image/jpeg")
    return resp.content, mime_type


def _generate_image_with_backoff(client, image_data: bytes, mime_type: str, prompt: str, model_type: str = "gemini", batch_id: str = None) -> Any:
    """
    Call Gemini or Imagen image generation with aggressive exponential backoff.
    """
    import base64
    import requests
    from core.llm_config import ModelName

    delay = INITIAL_BACKOFF

    for attempt in range(MAX_RETRIES + 1):
        try:
            if model_type == "imagen":
                # Imagen Recontext via REST predict API
                from google.auth import default, transport
                creds, project = default()
                auth_req = transport.requests.Request()
                creds.refresh(auth_req)
                
                region = LLMConfig.REGION
                project_id = LLMConfig.PROJECT_ID
                model_id = ModelName.IMAGE_RECONTEXT.value
                
                endpoint = f"https://{region}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{region}/publishers/google/models/{model_id}:predict"
                
                payload = {
                    "instances": [
                        {
                            "prompt": prompt,
                            "productImages": [
                                {
                                    "image": {
                                        "bytesBase64Encoded": base64.b64encode(image_data).decode("utf-8")
                                    }
                                }
                            ]
                        }
                    ],
                    "parameters": {
                        "sampleCount": 1,
                        "addWatermark": False, # Set to False to enable 'seed'
                        "seed": 42, # Standardized seed for consistency
                        "enhancePrompt": False # Disable to ensure prompt instructions are strictly followed
                    }
                }
                
                headers = {
                    "Authorization": f"Bearer {creds.token}",
                    "Content-Type": "application/json"
                }
                
                response = requests.post(endpoint, json=payload, headers=headers, timeout=60)
                response.raise_for_status()
                return response.json() # Return dict for Imagen
            else:
                # Standard Gemini Image Generation
                response = client.models.generate_content(
                    model=LLMConfig.get_image_model_name(model_type),
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
                    temperature=0.3,
                    seed=42,
                ),
                )
                return response

        except Exception as e:
            error_str = str(e)
            if ("429" in error_str or "RESOURCE_EXHAUSTED" in error_str) and attempt < MAX_RETRIES:
                # europe-west1 Imagen 1 QPM logic:
                # If we hit 429, we MUST wait a full minute to cross the quota boundary.
                # Standard 30s backoff is too aggressive for 1 QPM.
                min_wait = 65 if model_type == "imagen" else delay
                sleep_time = int(min_wait + random.uniform(0, 15))
                
                logger.warning(
                    f"Rate limited (429) for {model_type}. Waiting {sleep_time}s... "
                    f"(attempt {attempt + 1}/{MAX_RETRIES})"
                )

                # Interruptible sleep for 429 backoff
                from firebase_admin import firestore
                db = firestore.client()
                for _ in range(sleep_time):
                    time.sleep(1)
                    if _ % 5 == 0 and batch_id:
                        try:
                            snap = db.collection("enrichment_batches").document(batch_id).get()
                            if snap.exists and snap.get("status") == "ABORTED":
                                logger.info(f"[Studio {batch_id}] Abort detected during backoff.")
                                raise Exception("Aborted by user during rate-limit backoff")
                        except Exception as ae:
                            if "Aborted" in str(ae): raise
                
                delay *= 2  # 30 -> 60 -> 120 -> 240 -> 480
                continue
            raise


def _extract_image_from_response(response, sku: str) -> Optional[bytes]:
    """Extract generated image bytes from Gemini or Imagen response."""
    # Case Imagen (dict from JSON)
    if isinstance(response, dict):
        if "predictions" in response and len(response["predictions"]) > 0:
            pred = response["predictions"][0]
            if "bytesBase64Encoded" in pred:
                import base64
                return base64.b64decode(pred["bytesBase64Encoded"])
        return None

    # Case Gemini (google-genai object)
    if hasattr(response, 'generated_image') and response.generated_image:
        return None  # URL-only, not applicable

    if not response.candidates or not response.candidates[0].content:
        logger.warning(f"No candidates for {sku}. Response status: {getattr(response, 'status', 'Unknown')}")
        # Log safety ratings if available
        if response.candidates and response.candidates[0].safety_ratings:
            ratings = [f"{r.category}: {r.probability}" for r in response.candidates[0].safety_ratings]
            logger.warning(f"Safety Ratings for {sku}: {', '.join(ratings)}")
        return None

    if response.candidates[0].content.parts:
        for part in response.candidates[0].content.parts:
            if part.inline_data:
                return part.inline_data.data
    
    logger.warning(f"No inline_data found for {sku} in first candidate parts.")
    return None


# ---------------------------------------------------------------------------
# 1. Start Studio Session (returns immediately — called by Cloud Function)
# ---------------------------------------------------------------------------

def start_studio_session(skus: List[str], environment: str = None, generation_model: str = None, priority: str = "normal") -> dict:
    """
    Creates tracking doc + marks products. Returns in <1 second.
    Actual processing is triggered by Firestore onCreate on enrichment_batches.
    """
    db = firestore.client()
    env = environment or DEFAULT_ENVIRONMENT
    
    # --- Cleanup: Mark old 'stuck' batches as FAILED ---
    try:
        stuck = db.collection("enrichment_batches").where("status", "==", "RUNNING").get()
        import datetime
        now = datetime.datetime.now(datetime.timezone.utc)
        for doc in stuck:
            data = doc.to_dict()
            created = data.get("created_at")
            # Aggressive cleanup: 10 mins instead of 30
            if created and (now - created).total_seconds() > 600: 
                batch_id = doc.id
                logger.info(f"Marking orphaned batch {batch_id} as FAILED")
                # Mark batch
                doc.reference.update({"status": "FAILED", "error_details": "Orphaned/Timed out during previous execution"})
                
                # Mark products in that batch
                batch_skus = data.get("skus", [])
                for s_sku in batch_skus:
                    try:
                        p_doc = db.collection("staging_products").document(s_sku).get()
                        if p_doc.exists:
                            p_status = p_doc.to_dict().get("status")
                            if p_status == "BATCH_GENERATING":
                                db.collection("staging_products").document(s_sku).update({
                                    "status": "ENRICHMENT_FAILED",
                                    "enrichment_message": "Session timed out — please retry"
                                })
                    except Exception as pe:
                        logger.warning(f"Failed to reset sku {s_sku} during cleanup: {pe}")
    except Exception as e:
        logger.error(f"Cleanup error: {e}")

    # --- Chunking Logic (Max 8 SKUs per batch to avoid 9m timeout) ---
    # With 65s delay per product, 8 products = ~8.6 minutes.
    MAX_BATCH_SIZE = 8
    sku_chunks = [skus[i:i + MAX_BATCH_SIZE] for i in range(0, len(skus), MAX_BATCH_SIZE)]
    
    batch_ids = []
    
    for idx, chunk in enumerate(sku_chunks):
        batch_id = str(uuid.uuid4())
        batch_ids.append(batch_id)
        
        # Determine status: Only the first chunk starts immediately
        # Subsequent chunks stay in 'WAITING_FOR_QUEUE' until the trigger chain picks them up
        initial_status = "QUEUED" if idx == 0 else "WAITING_FOR_QUEUE"
        
        logger.info(f"[Studio {batch_id}] Creating {initial_status} chunk session for {len(chunk)} SKUs (env={env}, priority={priority})")

        # Create tracking document
        sku_results = {sku: {"status": initial_status, "error": None} for sku in chunk}
        db.collection("enrichment_batches").document(batch_id).set({
            "job_name": f"parallel-studio-{batch_id}",
            "mode": "parallel",
            "status": initial_status,
            "skus": chunk,
            "sku_results": sku_results,
            "total_count": len(chunk),
            "completed_count": 0,
            "failed_count": 0,
            "environment": env,
            "generation_model": generation_model or DEFAULT_MODEL,
            "priority": priority,
            "created_at": firestore.SERVER_TIMESTAMP,
            "updated_at": firestore.SERVER_TIMESTAMP,
        })

        # Mark products as batch generating
        for sku in chunk:
            try:
                # Check current status to avoid redundant trigger noise
                product_doc = db.collection("staging_products").document(sku).get()
                if product_doc.exists and product_doc.to_dict().get("status") == "BATCH_GENERATING":
                    logger.info(f"[Studio {batch_id}] {sku} already in BATCH_GENERATING. Skipping redundant update.")
                    continue

                db.collection("staging_products").document(sku).update({
                    "status": "BATCH_GENERATING",
                    "enrichment_message": "Queued for Studio Generation..."
                })
            except Exception as e:
                logger.error(f"[Studio {batch_id}] Failed to mark {sku}: {e}")

    # --- Collision Prevention: Check if requested SKUs are already being processed ---
    # We allow the session to BE CREATED (for tracking), but if collisions found,
    # we mark those specific SKUs as SKIPPED in the new batch to avoid thundering herd.
    active_sessions = db.collection("enrichment_batches").where("status", "in", ["QUEUED", "RUNNING"]).get()
    active_skus = set()
    for s_doc in active_sessions:
        if s_doc.id in batch_ids: continue # Skip ourselves
        active_skus.update(s_doc.to_dict().get("skus", []))
    
    if any(s in active_skus for s in skus):
        colliding = [s for s in skus if s in active_skus]
        logger.warning(f"[Studio] Session collision detected for SKUs: {colliding}. Overlap will be skipped in new batches.")

    return {"batch_ids": batch_ids, "count": len(skus)}


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
    generation_model = batch_data.get("generation_model", DEFAULT_MODEL)

    # --- Early Abort Check ---
    if batch_data.get("status") == "ABORTED":
        logger.info(f"[Studio {batch_id}] Batch already ABORTED. Cleaning up.")
        return _handle_batch_abort(db, batch_ref, batch_doc, skus, sku_results, completed=0, failed=0)

    # --- Global Sequential Lock Mechanism ---
    # We use a singleton document 'system_config/studio_lock' to ensure 
    # that across all concurrent triggers, only one worker can be RUNNING at a time.
    lock_ref = db.collection("system_config").document("studio_lock")

    try:
        @firestore.transactional
        def claim_batch_and_lock(transaction, b_ref, l_ref):
            # 1. Check Global Lock
            lock_snap = l_ref.get(transaction=transaction)
            current_lock = lock_snap.to_dict() if lock_snap.exists else {}
            active_batch = current_lock.get("active_batch_id")
            
            # If lock is held by someone else, check if it's "stale" (safety net)
            if active_batch and active_batch != batch_id:
                last_heartbeat = current_lock.get("updated_at")
                if last_heartbeat:
                    now = datetime.datetime.now(datetime.timezone.utc)
                    # If lock hasn't been updated in 5 mins, assume crashed and allow stealing
                    if (now - last_heartbeat).total_seconds() > 300: 
                        # Stale lock, allow this batch to claim it
                        logger.warning(f"[Studio {batch_id}] Stealing stale global lock from {active_batch}.")
                    else:
                        return "LOCK_HELD", active_batch
            
            # 2. Check Batch Status
            snapshot = b_ref.get(transaction=transaction)
            if not snapshot.exists: return "NOT_FOUND", None
            curr_status = snapshot.get("status")
            if curr_status != "QUEUED": return curr_status, None
            
            # 3. Claim both
            transaction.update(b_ref, {
                "status": "RUNNING",
                "updated_at": firestore.SERVER_TIMESTAMP,
                "claimed_at": firestore.SERVER_TIMESTAMP
            })
            transaction.set(l_ref, {
                "active_batch_id": batch_id,
                "updated_at": firestore.SERVER_TIMESTAMP
            })
            return "CLAIMED", None

        claim_result, holder = claim_batch_and_lock(db.transaction(), batch_ref, lock_ref)
        
        if claim_result == "LOCK_HELD":
            logger.info(f"[Studio {batch_id}] Global lock held by {holder}. Staying in QUEUE.")
            return {"status": "waiting", "message": f"Global lock held by {holder}"}
        if claim_result == "NOT_FOUND":
             logger.error(f"[Studio {batch_id}] Batch doc not found during claim")
             return {"error": "Batch not found"}
        if claim_result != "CLAIMED":
            logger.info(f"[Studio {batch_id}] Batch already {claim_result}. Skipping concurrent worker.")
            return {"status": "already_running", "process": claim_result}
            
    except Exception as e:
        logger.error(f"[Studio {batch_id}] Global claim transaction failed: {e}")
        return {"error": f"Claim failed: {e}"}

    # Heartbeat thread to keep global lock alive for long runs
    def heartbeat():
        try:
            while True:
                # Check if batch is still running
                snap = batch_ref.get()
                if not snap.exists or snap.get("status") not in ("RUNNING"):
                    break
                # Update lock timestamp
                try:
                    lock_ref.update({"updated_at": firestore.SERVER_TIMESTAMP})
                except Exception as he:
                    logger.warning(f"[Studio {batch_id}] Heartbeat failed to update lock: {he}")
                time.sleep(60)
        except Exception:
            pass # Thread safety

    import threading
    h_thread = threading.Thread(target=heartbeat, daemon=True)
    h_thread.start()

    # Re-fetch the data after successful claim to get freshest results
    batch_doc = batch_ref.get()
    batch_data = batch_doc.to_dict()
    sku_results = batch_data.get("sku_results", {})

    logger.info(f"[Studio {batch_id}] Processing {len(skus)} products with {DELAY_BETWEEN_REQUESTS}s delay (model={generation_model})")

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

        # 0. Check for ABORT signal
        batch_doc = batch_ref.get()
        if batch_doc.exists and batch_doc.to_dict().get("status") == "ABORTED":
            return _handle_batch_abort(db, batch_ref, batch_doc, skus, sku_results, completed, failed)

        logger.info(f"[Studio {batch_id}] [{i + 1}/{len(skus)}] Processing {sku}")

        # Process single product
        result = _process_single_product(client, db, sku, batch_id, environment, generation_model)

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

        # Delay between requests
        if i < len(skus) - 1:
            actual_delay = 60 if generation_model == "imagen" else DELAY_BETWEEN_REQUESTS
            logger.info(f"[Studio {batch_id}] Waiting {actual_delay}s before next request (model={generation_model})...")
            
            # Interruptible sleep: check for abort every 1 second
            for _ in range(actual_delay):
                time.sleep(1)
                # Inline status check to break the delay immediately if user aborts
                if _ % 5 == 0: 
                    b_snap = batch_ref.get()
                    if b_snap.exists and b_snap.get("status") == "ABORTED":
                        logger.info(f"[Studio {batch_id}] Abort detected during delay. Ending.")
                        break
            
            # Check final status after sleep
            b_snap = batch_ref.get()
            if b_snap.exists and b_snap.get("status") == "ABORTED":
                break

    # Final status update
    current_snap = batch_ref.get()
    current_status = current_snap.get("status") if current_snap.exists else "UNKNOWN"

    if current_status == "ABORTED":
        return _handle_batch_abort(db, batch_ref, current_snap, skus, sku_results, completed, failed)

    final_status = "COMPLETED" if failed == 0 else "COMPLETED_WITH_ERRORS"
    batch_ref.update({
        "status": final_status,
        "completed_at": firestore.SERVER_TIMESTAMP,
        "updated_at": firestore.SERVER_TIMESTAMP,
        "sku_results": sku_results,
        "completed_count": completed,
        "failed_count": failed,
    })

    # --- Release Global Lock ---
    try:
        lock_ref = db.collection("system_config").document("studio_lock")
        lock_snap = lock_ref.get()
        if lock_snap.exists and lock_snap.get("active_batch_id") == batch_id:
            lock_ref.delete()
            logger.info(f"[Studio {batch_id}] Released global lock.")
    except Exception as le:
        logger.error(f"Failed to release global lock: {le}")

    # Sequential Chaining: Trigger the next batch in line immediately
    _trigger_next_queued_batch()

    summary = {
        "batch_id": batch_id,
        "completed": completed,
        "failed": failed,
        "total": len(skus),
        "status": final_status
    }
    logger.info(f"[Studio {batch_id}] Done: {json.dumps(summary)}")
    return summary


def _handle_batch_abort(db, batch_ref, batch_doc, skus, sku_results, completed, failed):
    """Refactored helper to clean up an aborted batch."""
    batch_id = batch_ref.id
    logger.info(f"[Studio {batch_id}] Handling abort/cleanup.")
    
    # Mark all unfinished SKUs as failed
    for sku in skus:
        if sku_results.get(sku, {}).get("status") not in ("COMPLETED", "FAILED"):
            sku_results[sku] = {"status": "FAILED", "error": "Aborted by user"}
            try:
                db.collection("staging_products").document(sku).update({
                    "status": "ENRICHMENT_FAILED",
                    "enrichment_message": "Session aborted by user"
                })
            except Exception: pass
            
    batch_ref.update({
        "status": "ABORTED",
        "sku_results": sku_results,
        "completed_count": completed,
        "failed_count": failed,
        "updated_at": firestore.SERVER_TIMESTAMP,
    })
    
    # Release Global Lock
    try:
        lock_ref = db.collection("system_config").document("studio_lock")
        lock_snap = lock_ref.get()
        if lock_snap.exists and lock_snap.get("active_batch_id") == batch_id:
            lock_ref.delete()
            logger.info(f"[Studio {batch_id}] Released global lock after abort.")
    except Exception: pass

    # Trigger NEXT batch (which might also be ABORTED, so it will clean itself and move on)
    _trigger_next_queued_batch()
    
    return {"status": "aborted", "completed": completed, "failed": failed}


def _process_single_product(client, db, sku: str, batch_id: str, environment: str = None, generation_model: str = None) -> dict:
    """
    Process ONE product: download source → generate image → upload → update Firestore.
    Returns {"success": True, "image_url": str} or {"success": False, "error": str}.
    """
    env = environment or DEFAULT_ENVIRONMENT
    gen_model = generation_model or DEFAULT_MODEL
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
            return {"success": False, "error": error}

        # Download source image
        # doc_ref.update({"enrichment_message": "Optimizing frame & perspective..."})
        image_data, mime_type = _download_source_image(source_url)
        
        # Normalize product sizing and centering
        image_data = normalize_product_image(image_data)
        mime_type = "image/jpeg"

        # Generate studio image
        # doc_ref.update({"enrichment_message": "Synthesizing visual..."})
        
        prompt = IMAGEN_PROMPTS.get(env, IMAGEN_PROMPTS["clean"]) if gen_model == "imagen" else STUDIO_PROMPTS.get(env, STUDIO_PROMPTS["clean"])
        
        logger.info(f"[Studio {batch_id}] Calling {gen_model} for {sku}")
        response = _generate_image_with_backoff(client, image_data, mime_type, prompt, gen_model, batch_id)

        # Extract image
        img_bytes = _extract_image_from_response(response, sku)
        if not img_bytes:
            error = "No image data in response"
            return {"success": False, "error": error}

        # Upload to Firebase Storage
        image_url = _upload_image_to_storage(img_bytes, "image/jpeg", sku)
        
        # Final update
        doc_ref.update({
            "ai_data.generated_images": {"base": image_url},
            "status": "PENDING_STUDIO_REVIEW",
            "enrichment_message": "Studio image generated successfully",
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
    - Parallel jobs that crashed mid-run (> 3 min silent, still RUNNING)
    - QUEUED jobs that never got their Firestore trigger (pick up and process)
    - WAITING_FOR_QUEUE jobs if the sequential chain broke
    """
    db = firestore.client()
    summary = {"checked": 0, "recovered": 0, "processed": 0}

    # 1. Check for RUNNING batches (Deadly silence check)
    running = db.collection("enrichment_batches").where("status", "==", "RUNNING").get()
    active_exists = False
    
    for doc in running:
        summary["checked"] += 1
        update_age = _get_doc_last_update_age(doc)
        if update_age > 180:  # 3 minutes of silence = crashed
            logger.warning(f"[Cron] Recovering crashed running batch {doc.id} (silent for {update_age:.0f}s)")
            _recover_crashed_batch(db, doc, "Process stalled — auto-recovered by system")
            summary["recovered"] += 1
        else:
            active_exists = True # Still alive

    # 2. Check for QUEUED batches (Missed trigger check)
    queued = db.collection("enrichment_batches").where("status", "==", "QUEUED").get()
    for doc in queued:
        summary["checked"] += 1
        age = _get_doc_age_seconds(doc)
        if age > 120:  # Queued for more than 2 minutes — trigger missed
            logger.warning(f"[Cron] Picking up orphaned QUEUED batch {doc.id}")
            try:
                process_studio_queue(doc.id)
                summary["processed"] += 1
                active_exists = True
            except Exception as e:
                logger.error(f"[Cron] Failed to process {doc.id}: {e}")
        else:
            active_exists = True # Just queued, give it time

    # 3. Chain Recovery (Lost link check)
    # If no batch is RUNNING or QUEUED, but we have WAITING_FOR_QUEUE, the chain broke.
    if not active_exists:
        waiting = db.collection("enrichment_batches").where("status", "==", "WAITING_FOR_QUEUE").get()
        if waiting:
            logger.warning("[Cron] Sequential chain appears broken. Restarting queue.")
            _trigger_next_queued_batch()
            summary["processed"] += 1

    logger.info(f"[Cron] Summary: {json.dumps(summary)}")
    return summary


def _get_doc_last_update_age(doc) -> float:
    """Get the seconds since the last update of a document."""
    data = doc.to_dict()
    updated = data.get("updated_at")
    if updated:
        now = datetime.datetime.now(datetime.timezone.utc)
        return (now - updated).total_seconds()
    return _get_doc_age_seconds(doc) # Fallback to creation age


def _get_doc_age_seconds(doc) -> float:
    """Get the seconds since a document was created."""
    created_at = doc.create_time
    if created_at:
        now = datetime.datetime.now(datetime.timezone.utc)
        return (now - created_at).total_seconds()
    return 0.0


def fail_batch(batch_id: str, error_message: str):
    """
    Public utility to force-fail a batch and all its pending products.
    """
    db = firestore.client()
    batch_ref = db.collection("enrichment_batches").document(batch_id)
    doc = batch_ref.get()
    if doc.exists:
        _recover_crashed_batch(db, doc, error_message)

def _recover_crashed_batch(db, batch_doc, error_message: str = "Process interrupted"):
    """Mark unfinished products as failed in a crashed batch."""
    data = batch_doc.to_dict()
    skus = data.get("skus", [])
    sku_results = data.get("sku_results", {})

    for sku in skus:
        result = sku_results.get(sku, {})
        if result.get("status") not in ("COMPLETED", "FAILED"):
            sku_results[sku] = {"status": "FAILED", "error": error_message}
            try:
                db.collection("staging_products").document(sku).update({
                    "status": "ENRICHMENT_FAILED",
                    "enrichment_message": error_message,
                })
            except Exception:
                pass

    batch_doc.reference.update({
        "status": "FAILED",
        "sku_results": sku_results,
        "error_details": error_message,
        "updated_at": firestore.SERVER_TIMESTAMP,
    })

    # --- Release Global Lock on Failure ---
    try:
        lock_ref = db.collection("system_config").document("studio_lock")
        lock_snap = lock_ref.get()
        if lock_snap.exists and lock_snap.get("active_batch_id") == batch_doc.id:
            lock_ref.delete()
    except Exception: pass
    
    # Sequential Chaining: Trigger the next batch in line immediately
    _trigger_next_queued_batch()


def abort_studio_session(batch_ids: List[str]) -> dict:
    """
    Sets the status of one or more batches to ABORTED.
    The process_studio_queue loop will pick this up and stop.
    """
    db = firestore.client()
    count = 0
    for b_id in batch_ids:
        try:
            batch_ref = db.collection("enrichment_batches").document(b_id)
            batch_doc = batch_ref.get()
            if batch_doc.exists:
                status = batch_doc.to_dict().get("status")
                if status in ("QUEUED", "RUNNING"):
                    batch_ref.update({
                        "status": "ABORTED",
                        "updated_at": firestore.SERVER_TIMESTAMP
                    })
                    count += 1
        except Exception as e:
            logger.error(f"Failed to abort batch {b_id}: {e}")
            
    return {"aborted_count": count}


def _trigger_next_queued_batch():
    """
    Finds the next WAITING_FOR_QUEUE batch, promotes it to QUEUED, and triggers it.
    Ensures sequential run without clashing.
    """
    db = firestore.client()
    try:
        # Get next waiting batch, sorted by priority and age
        waiting = db.collection("enrichment_batches").where("status", "==", "WAITING_FOR_QUEUE").get()
        if not waiting:
            logger.info("[Studio] Sequential Chaining: No more batches in WAITING_FOR_QUEUE.")
            return

        waiting_docs = list(waiting)
        # Sort by priority (high=0, normal=1) then by creation age
        waiting_docs.sort(key=lambda d: (0 if d.to_dict().get("priority") == "high" else 1, _get_doc_age_seconds(d)))
        
        next_batch_doc = waiting_docs[0]
        next_batch_id = next_batch_doc.id
        
        logger.info(f"[Studio] Sequential Chaining: Promoting batch {next_batch_id} to QUEUED")
        
        # Promote to QUEUED
        # Note: This status change will NOT trigger on_batch_created (since that only fires on CREATE)
        # so we MUST manually trigger the processing thread below.
        next_batch_doc.reference.update({
            "status": "QUEUED",
            "updated_at": firestore.SERVER_TIMESTAMP
        })
        
        # Run in a separate thread/background
        import threading
        thread = threading.Thread(target=process_studio_queue, args=(next_batch_id,))
        thread.start()
        
    except Exception as e:
        logger.error(f"Failed to trigger next batch: {e}")
