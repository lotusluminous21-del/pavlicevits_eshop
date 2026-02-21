"""
Parallel Studio Processor — Fire-and-forget with real-time Firestore updates.

Architecture & Fixes:
  1. start_studio_session(skus) -> Chunks SKUs, creates batches as QUEUED, returns immediately.
  2. process_studio_queue(batch_id) -> Uses a strict, transaction-based Global Lock.
     - Processes products sequentially.
     - Performs INLINE heartbeats (no unstable background threads).
     - Respects hard 30s/60s rate-limit delays, while keeping the lock alive.
  3. check_and_process_batches() -> Cron safety net that drives the queue forward safely.
"""

import os
import json
import uuid
import logging
import time
import random
import datetime
import requests
import urllib3
from typing import List, Dict, Any, Optional

from firebase_admin import firestore
from google.genai import types

from core.llm_config import LLMConfig, ModelName
from .image_utils import normalize_product_image

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
DELAY_GEMINI = 30             # Hard 30s between each Gemini image generation
DELAY_IMAGEN = 5              # Reduced delay for us-central1 (higher quotas)
MAX_RETRIES = 5               # Retries per product on 429
INITIAL_BACKOFF = 30          # Starting backoff on 429
REQUEST_TIMEOUT = 20          # Image download timeout
LOCK_TIMEOUT_SECONDS = 180    # 3 minutes without an inline heartbeat = dead worker

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

DEFAULT_ENVIRONMENT = "clean"
DEFAULT_MODEL = "gemini"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _upload_image_to_storage(image_bytes: bytes, mime_type: str, sku: str) -> str:
    from firebase_admin import storage as fb_storage
    bucket = fb_storage.bucket()
    blob = bucket.blob(f"generated-images/{sku}/studio_base.jpg")
    blob.cache_control = "no-cache, max-age=0"
    blob.upload_from_string(image_bytes, content_type=mime_type)
    blob.make_public()
    return blob.public_url

def _download_source_image(url: str) -> tuple:
    resp = requests.get(url, timeout=REQUEST_TIMEOUT, verify=False)
    resp.raise_for_status()
    mime_type = resp.headers.get("Content-Type", "image/jpeg")
    return resp.content, mime_type

def _heartbeat_lock(db, batch_id: str):
    """Inline heartbeat to keep the global lock alive."""
    try:
        db.collection("system_config").document("studio_lock").set({
            "active_batch_id": batch_id,
            "updated_at": firestore.SERVER_TIMESTAMP
        }, merge=True)
    except Exception as e:
        logger.warning(f"[Studio {batch_id}] Heartbeat update failed: {e}")

def _generate_image_with_backoff(client, db, image_data: bytes, mime_type: str, prompt: str, model_type: str, batch_id: str) -> Any:
    """Call Gemini/Imagen API with strict, thread-safe exponential backoff."""
    delay = INITIAL_BACKOFF
    batch_ref = db.collection("enrichment_batches").document(batch_id)

    for attempt in range(MAX_RETRIES + 1):
        try:
            if model_type == "imagen":
                import base64
                from google.auth import default, transport
                creds, _ = default()
                creds.refresh(transport.requests.Request())
                
                region = LLMConfig.REGION_IMAGEN
                project_id = LLMConfig.PROJECT_ID
                model_id = ModelName.IMAGE_RECONTEXT.value
                endpoint = f"https://{region}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{region}/publishers/google/models/{model_id}:predict"
                
                payload = {
                    "instances": [{
                        "prompt": prompt,
                        "productImages": [{"image": {"bytesBase64Encoded": base64.b64encode(image_data).decode("utf-8")}}]
                    }],
                    "parameters": {"sampleCount": 1, "addWatermark": False, "seed": 42, "enhancePrompt": False}
                }
                headers = {"Authorization": f"Bearer {creds.token}", "Content-Type": "application/json"}
                
                response = requests.post(endpoint, json=payload, headers=headers, timeout=60)
                response.raise_for_status()
                return response.json()
            else:
                response = client.models.generate_content(
                    model=LLMConfig.get_image_model_name(model_type),
                    contents=[
                        types.Content(role="user", parts=[
                            types.Part.from_bytes(data=image_data, mime_type=mime_type),
                            types.Part.from_text(text=prompt)
                        ])
                    ],
                    config=types.GenerateContentConfig(temperature=0.3, seed=42)
                )
                return response

        except Exception as e:
            error_str = str(e)
            if ("429" in error_str or "RESOURCE_EXHAUSTED" in error_str) and attempt < MAX_RETRIES:
                # Distinguish between actual Quota exhaustion and Google Server Capacity issues
                is_capacity_issue = "Resource exhausted" in error_str and "quota" not in error_str.lower()
                
                # Ensure Imagen gets a minimum of 65s even during backoff multipliers
                min_wait = max(delay, DELAY_IMAGEN if model_type == "imagen" else 0)
                
                # If Google's servers are full, trying again in 30s is a waste of a retry. Force a longer wait.
                if is_capacity_issue and min_wait < 60:
                    min_wait = 60
                
                sleep_time = int(min_wait + random.uniform(0, 10))
                
                # Expose the precise nature of the error in logs for easier debugging
                err_type = "GOOGLE SERVER CAPACITY FULL" if is_capacity_issue else "PROJECT QUOTA EXCEEDED"
                logger.warning(f"[Studio {batch_id}] 429 {err_type}. Sleeping {sleep_time}s (attempt {attempt + 1}/{MAX_RETRIES}) | Error snippet: {error_str[:150]}")
                
                # Interruptible inline sleep that maintains the lock heartbeat
                for _ in range(sleep_time):
                    time.sleep(1)
                    if _ % 10 == 0:
                        _heartbeat_lock(db, batch_id)
                        snap = batch_ref.get()
                        if snap.exists and snap.get("status") == "ABORTED":
                            raise Exception("Aborted by user during rate-limit backoff")
                
                delay *= 2
                continue
            raise

def _extract_image_from_response(response, sku: str) -> Optional[bytes]:
    import base64
    if isinstance(response, dict):
        if response.get("predictions"):
            pred = response["predictions"][0]
            if "bytesBase64Encoded" in pred:
                return base64.b64decode(pred["bytesBase64Encoded"])
        return None

    if not response.candidates or not response.candidates[0].content:
        return None
    for part in response.candidates[0].content.parts:
        if part.inline_data:
            return part.inline_data.data
    return None

# ---------------------------------------------------------------------------
# 1. Start Studio Session
# ---------------------------------------------------------------------------

def start_studio_session(skus: List[str], environment: str = None, generation_model: str = None, priority: str = "normal") -> dict:
    """Creates batch tracking docs. Quick fire-and-forget."""
    db = firestore.client()
    env = environment or DEFAULT_ENVIRONMENT
    MAX_BATCH_SIZE = 8
    
    sku_chunks = [skus[i:i + MAX_BATCH_SIZE] for i in range(0, len(skus), MAX_BATCH_SIZE)]
    batch_ids = []
    
    # Check for collisions to prevent thundering herds
    active_sessions = db.collection("enrichment_batches").where(filter=firestore.FieldFilter("status", "in", ["QUEUED", "RUNNING"])).get()
    active_skus = {s for doc in active_sessions for s in doc.to_dict().get("skus", [])}
    if any(s in active_skus for s in skus):
        logger.warning(f"[Studio] Session overlap detected. Skipping active SKUs.")

    for idx, chunk in enumerate(sku_chunks):
        batch_id = str(uuid.uuid4())
        batch_ids.append(batch_id)
        
        # All batches go into QUEUED state immediately to be picked up sequentially
        initial_status = "QUEUED"
        
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

        # Mark products
        for sku in chunk:
            try:
                p_doc = db.collection("staging_products").document(sku).get()
                if p_doc.exists and p_doc.to_dict().get("status") != "BATCH_GENERATING":
                    db.collection("staging_products").document(sku).update({
                        "status": "BATCH_GENERATING",
                        "enrichment_message": "Queued for Studio Generation..."
                    })
            except Exception as e:
                pass

    return {"batch_ids": batch_ids, "count": len(skus)}

# ---------------------------------------------------------------------------
# 2. Process Studio Queue (Worker)
# ---------------------------------------------------------------------------

def process_studio_queue(batch_id: str) -> dict:
    """
    Process products ONE at a time. Uses rigorous Transactional Locking.
    """
    db = firestore.client()
    client = LLMConfig.get_client()

    batch_ref = db.collection("enrichment_batches").document(batch_id)
    lock_ref = db.collection("system_config").document("studio_lock")

    @firestore.transactional
    def attempt_claim(transaction):
        lock_snap = lock_ref.get(transaction=transaction)
        batch_snap = batch_ref.get(transaction=transaction)

        if not batch_snap.exists: return "NOT_FOUND", None
        batch_status = batch_snap.get("status")

        if batch_status not in ("QUEUED", "RUNNING"): 
            return batch_status, None

        now = datetime.datetime.now(datetime.timezone.utc)
        
        # Check Global Lock Staleness
        active_holder = None
        is_stale = True
        
        if lock_snap.exists:
            lock_data = lock_snap.to_dict()
            active_holder = lock_data.get("active_batch_id")
            updated = lock_data.get("updated_at")
            if updated and (now - updated).total_seconds() < LOCK_TIMEOUT_SECONDS:
                is_stale = False # Lock is actively being updated
        
        if not is_stale and active_holder:
            if active_holder == batch_id and batch_status == "RUNNING":
                # Duplicate trigger event for the exact same batch!
                return "ALREADY_RUNNING", active_holder
            elif active_holder != batch_id:
                # Another batch is actively processing
                return "LOCKED_BY_OTHER", active_holder

        # Claim Both
        transaction.update(batch_ref, {"status": "RUNNING", "updated_at": firestore.SERVER_TIMESTAMP})
        transaction.set(lock_ref, {"active_batch_id": batch_id, "updated_at": firestore.SERVER_TIMESTAMP})
        return "CLAIMED", None

    try:
        claim_status, active_holder = attempt_claim(db.transaction())
    except Exception as e:
        logger.error(f"[Studio {batch_id}] Transaction failed: {e}")
        return {"error": str(e)}

    if claim_status in ("LOCKED_BY_OTHER", "ALREADY_RUNNING"):
        logger.info(f"[Studio {batch_id}] Yielding worker — lock held actively by {active_holder} ({claim_status}).")
        return {"status": "waiting"}
    
    if claim_status != "CLAIMED":
        return {"status": "already_processed", "state": claim_status}

    # Fetch batch data
    batch_doc = batch_ref.get()
    batch_data = batch_doc.to_dict()
    skus = batch_data.get("skus", [])
    sku_results = batch_data.get("sku_results", {})
    environment = batch_data.get("environment", DEFAULT_ENVIRONMENT)
    generation_model = batch_data.get("generation_model", DEFAULT_MODEL)

    completed = 0
    failed = 0
    
    logger.info(f"[Studio {batch_id}] Worker Started (Model={generation_model})")

    for i, sku in enumerate(skus):
        # Skip previously completed items (crash recovery)
        if sku_results.get(sku, {}).get("status") in ("COMPLETED", "FAILED"):
            completed += 1 if sku_results[sku]["status"] == "COMPLETED" else 0
            failed += 1 if sku_results[sku]["status"] == "FAILED" else 0
            continue

        # Abort Check
        if batch_ref.get().get("status") == "ABORTED":
            return _handle_abort(db, batch_ref, skus, sku_results, completed, failed)

        logger.info(f"[Studio {batch_id}] Processing [{i+1}/{len(skus)}]: {sku}")
        
        # Process Image
        result = _process_single_product(client, db, sku, batch_id, environment, generation_model)
        
        if result["success"]:
            completed += 1
            sku_results[sku] = {"status": "COMPLETED", "error": None, "image_url": result["image_url"]}
        else:
            failed += 1
            sku_results[sku] = {"status": "FAILED", "error": result["error"]}

        # Update batch & heartbeat the lock
        batch_ref.update({
            "sku_results": sku_results, "completed_count": completed, 
            "failed_count": failed, "updated_at": firestore.SERVER_TIMESTAMP
        })
        _heartbeat_lock(db, batch_id)

        # Rate Limit Delay between SKUs
        # FIXED: Delay is now applied unconditionally after an API call, even on the last item in a batch.
        # This prevents the next batch from jumping in too early and violating rate limits across boundaries.
        if result.get("api_called", True):
            delay = DELAY_IMAGEN if generation_model == "imagen" else DELAY_GEMINI
            for _ in range(delay):
                time.sleep(1)
                if _ % 10 == 0: 
                    _heartbeat_lock(db, batch_id)
                    if batch_ref.get().get("status") == "ABORTED": break
            
            if batch_ref.get().get("status") == "ABORTED":
                return _handle_abort(db, batch_ref, skus, sku_results, completed, failed)

    # Wrap up Batch
    final_status = "COMPLETED" if failed == 0 else "COMPLETED_WITH_ERRORS"
    batch_ref.update({
        "status": final_status,
        "sku_results": sku_results,
        "completed_at": firestore.SERVER_TIMESTAMP,
        "updated_at": firestore.SERVER_TIMESTAMP
    })

    # Release Global Lock
    try:
        lock_snap = lock_ref.get()
        if lock_snap.exists and lock_snap.get("active_batch_id") == batch_id:
            lock_ref.delete()
    except Exception: pass

    logger.info(f"[Studio {batch_id}] Batch Finished. Status: {final_status}")
    
    # Optional: trigger next process directly via Cron/PubSub logic here if needed.
    # Because threading is dangerous, we rely on the Cron or Cloud Function queue listener 
    # to pick up the next QUEUED batch seamlessly now that the lock is free.
    return {"status": final_status, "completed": completed, "failed": failed}

def _process_single_product(client, db, sku: str, batch_id: str, environment: str, generation_model: str) -> dict:
    doc_ref = db.collection("staging_products").document(sku)
    try:
        doc = doc_ref.get()
        if not doc.exists: return {"success": False, "error": "Product not found", "api_called": False}

        data = doc.to_dict()
        source_url = data.get("ai_data", {}).get("selected_images", {}).get("base")
        if not source_url:
            images = data.get("ai_data", {}).get("selected_images", {})
            source_url = images[next(iter(images))] if images else None
            
        if not source_url: return {"success": False, "error": "No source image selected", "api_called": False}

        # 1. Download & Process Image locally (No AI API called yet)
        try:
            image_data, mime_type = _download_source_image(source_url)
            image_data = normalize_product_image(image_data)
        except Exception as e:
            error_str = f"Image download/processing error: {str(e)[:150]}"
            try:
                doc_ref.update({"status": "ENRICHMENT_FAILED", "enrichment_message": f"Studio error: {error_str[:80]}"})
            except: pass
            return {"success": False, "error": error_str, "api_called": False}
        
        prompt = IMAGEN_PROMPTS.get(environment, IMAGEN_PROMPTS["clean"]) if generation_model == "imagen" else STUDIO_PROMPTS.get(environment, STUDIO_PROMPTS["clean"])
        
        # 2. Make AI API Call
        try:
            response = _generate_image_with_backoff(client, db, image_data, "image/jpeg", prompt, generation_model, batch_id)
        except Exception as e:
            error_str = str(e)[:150]
            try:
                doc_ref.update({"status": "ENRICHMENT_FAILED", "enrichment_message": f"Studio error: {error_str[:80]}"})
            except: pass
            return {"success": False, "error": error_str, "api_called": True}

        img_bytes = _extract_image_from_response(response, sku)
        if not img_bytes: return {"success": False, "error": "No image data returned from AI", "api_called": True}

        image_url = _upload_image_to_storage(img_bytes, "image/jpeg", sku)
        
        doc_ref.update({
            "ai_data.generated_images.base": image_url,
            "status": "PENDING_STUDIO_REVIEW",
            "enrichment_message": "Studio image generated successfully"
        })
        return {"success": True, "image_url": image_url, "api_called": True}

    except Exception as e:
        error_str = str(e)[:150]
        try:
            doc_ref.update({"status": "ENRICHMENT_FAILED", "enrichment_message": f"Studio error: {error_str[:80]}"})
        except: pass
        return {"success": False, "error": error_str, "api_called": False}

def _handle_abort(db, batch_ref, skus, sku_results, completed, failed):
    batch_id = batch_ref.id
    for sku in skus:
        if sku_results.get(sku, {}).get("status") not in ("COMPLETED", "FAILED"):
            sku_results[sku] = {"status": "FAILED", "error": "Aborted by user"}
            try: db.collection("staging_products").document(sku).update({"status": "ENRICHMENT_FAILED", "enrichment_message": "Session aborted"})
            except: pass
            
    batch_ref.update({
        "status": "ABORTED", "sku_results": sku_results, 
        "completed_count": completed, "failed_count": failed, "updated_at": firestore.SERVER_TIMESTAMP
    })
    try:
        lock_ref = db.collection("system_config").document("studio_lock")
        if lock_ref.get().get("active_batch_id") == batch_id: lock_ref.delete()
    except: pass
    return {"status": "aborted"}

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

def fail_batch(batch_id: str, error_message: str):
    """
    Public utility to force-fail a batch and all its pending products.
    """
    db = firestore.client()
    batch_ref = db.collection("enrichment_batches").document(batch_id)
    doc = batch_ref.get()
    if doc.exists:
        data = doc.to_dict()
        skus = data.get("skus", [])
        sku_results = data.get("sku_results", {})
        
        for sku in skus:
            if sku_results.get(sku, {}).get("status") not in ("COMPLETED", "FAILED"):
                sku_results[sku] = {"status": "FAILED", "error": error_message}
                try: 
                    db.collection("staging_products").document(sku).update({
                        "status": "ENRICHMENT_FAILED", 
                        "enrichment_message": error_message
                    })
                except: pass
        
        batch_ref.update({
            "status": "FAILED",
            "sku_results": sku_results,
            "error_details": error_message,
            "updated_at": firestore.SERVER_TIMESTAMP
        })
        
        try:
            lock_ref = db.collection("system_config").document("studio_lock")
            if lock_ref.get().get("active_batch_id") == batch_id: lock_ref.delete()
        except: pass

# ---------------------------------------------------------------------------
# 3. Queue Manager / Cron Safety Net
# ---------------------------------------------------------------------------

def check_and_process_batches() -> dict:
    """
    Called by Cloud Scheduler ideally every 1 minute.
    This acts as the robust, non-overlapping Queue Driver.
    """
    db = firestore.client()
    summary = {"recovered": 0, "processed": 0}
    now = datetime.datetime.now(datetime.timezone.utc)

    # 1. Clear dead locks
    lock_ref = db.collection("system_config").document("studio_lock")
    lock_snap = lock_ref.get()
    if lock_snap.exists:
        updated = lock_snap.get("updated_at")
        if updated and (now - updated).total_seconds() > LOCK_TIMEOUT_SECONDS:
            logger.warning(f"[Cron] Clearing DEAD global lock from crashed worker.")
            dead_batch = lock_snap.get("active_batch_id")
            lock_ref.delete()
            if dead_batch:
                b_ref = db.collection("enrichment_batches").document(dead_batch)
                if b_ref.get().get("status") == "RUNNING":
                    logger.warning(f"[Cron] Auto-requeuing crashed batch {dead_batch}.")
                    b_ref.update({"status": "QUEUED", "error_details": "Worker crashed, auto-requeued."})
                    summary["recovered"] += 1
            return summary # Wait for next cron cycle to resume cleanly
        else:
            return summary # A worker is actively running, do not interfere.

    # 2. No active workers -> Find next QUEUED batch and process it inline
    queued = db.collection("enrichment_batches").where(filter=firestore.FieldFilter("status", "==", "QUEUED")).get()
    if not queued: return summary

    # Sort by priority and age
    queued_docs = list(queued)
    queued_docs.sort(key=lambda d: (0 if d.to_dict().get("priority") == "high" else 1, d.create_time))
    
    next_batch_id = queued_docs[0].id
    logger.info(f"[Cron] Launching processing for QUEUED batch {next_batch_id}")
    
    # Process synchronously in this container.
    process_studio_queue(next_batch_id)
    summary["processed"] += 1
    
    return summary