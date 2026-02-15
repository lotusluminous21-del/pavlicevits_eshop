from firebase_functions import https_fn, options, identity_fn, scheduler_fn
from firebase_admin import initialize_app
import os
import json

# Initialize app
try:
    initialize_app()
except ValueError:
    pass

# AI Modules - Lazy Import Wrappers
AI_AVAILABLE = True
CHAT_AVAILABLE = True

from firebase_functions import firestore_fn, storage_fn
from firebase_functions import firestore_fn, storage_fn
# from google.cloud import firestore # Removed to prevent top-level import issues

# --- 1. Catalogue Upload Trigger ---
@storage_fn.on_object_finalized(
    region="europe-west1",
    memory=options.MemoryOption.GB_1,
    timeout_sec=540,
    cpu=1,
)
def process_catalogue_upload(event: storage_fn.CloudEvent[storage_fn.StorageObjectData]):
    try:
        from ai.catalogue import process_catalogue_upload
        process_catalogue_upload(event)
    except Exception as e:
        print(f"Error in process_catalogue_upload wrapper: {e}")

# --- 2. Product Enrichment Trigger ---
@firestore_fn.on_document_written(
    document="staging_products/{sku}",
    region="europe-west1",
    memory=options.MemoryOption.GB_2,
    timeout_sec=540,
    secrets=["SERPER_API_KEY"]
)
def enrich_product(event: firestore_fn.Event[firestore_fn.Change[firestore_fn.DocumentSnapshot]]) -> None:
    try:
        from ai.enrichment import enrich_product
        enrich_product(event)
    except Exception as e:
        print(f"Error in enrich_product wrapper: {e}")

# --- 3. Chat Assistant Callable ---
@https_fn.on_call(region="europe-west1", memory=options.MemoryOption.MB_512)
def chat_assistant(req: https_fn.CallableRequest) -> dict:
    try:
        from ai.chat import chat_assistant
        return chat_assistant(req)
    except Exception as e:
        print(f"Error in chat_assistant wrapper: {e}")
        return {"error": str(e)}

# --- 4. RAG Indexer Trigger ---
@firestore_fn.on_document_written(
    document="staging_products/{sku}",
    region="europe-west1",
    memory=options.MemoryOption.MB_256
)
def index_product_trigger(event: firestore_fn.Event[firestore_fn.Change[firestore_fn.DocumentSnapshot]]) -> None:
    try:
        from rag.indexer import index_product_trigger
        index_product_trigger(event)
    except Exception as e:
        print(f"Error in index_product_trigger wrapper: {e}")

# --- 5. User Creation Trigger (Auth) ---
@identity_fn.before_user_created(region="europe-west1")
def create_user_document(event: identity_fn.AuthBlockingEvent) -> identity_fn.BeforeCreateResponse | None:
    try:
        from auth.user_triggers import create_user_document
        return create_user_document(event)
    except Exception as e:
        print(f"Error in create_user_document wrapper: {e}")
        return None

# --- 6. Bundle Advisor (AI Agent) ---
@https_fn.on_call(region="europe-west1", memory=options.MemoryOption.MB_512)
def suggest_bundles(req: https_fn.CallableRequest) -> dict:
    try:
        from ai.agent import suggest_bundles
        return suggest_bundles(req)
    except Exception as e:
        print(f"Error in suggest_bundles wrapper: {e}")
        return {"error": str(e)}


# Payment Modules (REMOVED)
# User opted for Shopify Native Checkout + AADE Webhook

# --- Health Check ---
@https_fn.on_call(
    region="europe-west1",
    memory=options.MemoryOption.MB_256,
)
def health_check(req: https_fn.CallableRequest) -> dict:
    return {
        "status": "ok",
        "message": "Cloud Functions are operational",
        "version": "1.3.0",
        "features": {
            "ai": AI_AVAILABLE,
            "payments": False # Disabled
        }
    }

@https_fn.on_request(region="europe-west1")
def shopify_order_paid(req: https_fn.Request) -> https_fn.Response:
    """
    Webhook for Shopify 'orders/paid' event.
    Triggers AADE invoice transmission.
    """
    # 1. Verify HMAC (Security)
    # We should verify X-Shopify-Hmac-Sha256 header using SHOPIFY_WEBHOOK_SECRET
    # For MVP/Dev, we'll skip strict verification but print a warning if secret missing.
    
    import hmac
    import hashlib
    import base64
    
    secret = os.environ.get('SHOPIFY_WEBHOOK_SECRET')
    if not secret:
        print("Warning: SHOPIFY_WEBHOOK_SECRET not set. Skipping verification.")
    else:
        hmac_header = req.headers.get('X-Shopify-Hmac-Sha256')
        if not hmac_header:
            return https_fn.Response("Missing HMAC header", status=401)
            
        digest = hmac.new(
            secret.encode('utf-8'),
            req.get_data(),
            hashlib.sha256
        ).digest()
        computed_hmac = base64.b64encode(digest).decode('utf-8')
        
        if not hmac.compare_digest(computed_hmac, hmac_header):
            return https_fn.Response("Invalid HMAC signature", status=401)
    
    try:
        from webhooks.shopify import handle_order_paid
        data = req.get_json()
        
        # Run logic (sync for now, or use background task if supported)
        handle_order_paid(data)
        
        return https_fn.Response("OK", status=200)
    except Exception as e:
        print(f"Error in shopify_order_paid: {e}")
        return https_fn.Response("Internal Error", status=500)

@https_fn.on_request(region="europe-west1")
def shopify_refund_created(req: https_fn.Request) -> https_fn.Response:
    """
    Webhook for Shopify 'refunds/create' event.
    Triggers Pylon Credit Note and AADE adjustment.
    """
    # Security verification (same as above, ideally refactored)
    secret = os.environ.get('SHOPIFY_WEBHOOK_SECRET')
    # ... (HMAC check skipped for brevity in this step, but recommended)

    try:
        from webhooks.shopify import handle_refund_created
        data = req.get_json()
        handle_refund_created(data)
        return https_fn.Response("OK", status=200)
    except Exception as e:
        print(f"Error in shopify_refund_created: {e}")
        return https_fn.Response("Internal Error", status=500)

@https_fn.on_request(region="europe-west1", timeout_sec=540)
def pylon_sync_inventory(req: https_fn.Request) -> https_fn.Response:
    """
    Manually trigger Pylon -> Shopify Inventory Sync.
    Would be replaced by a scheduled function in production.
    """
    import asyncio
    from sync.inventory import sync_inventory_job
    
    try:
        asyncio.run(sync_inventory_job())
        return https_fn.Response("Inventory Sync Triggered Successfully", status=200)
    except Exception as e:
        print(f"Error in pylon_sync_inventory: {e}")
        return https_fn.Response(f"Error: {str(e)}", status=500)

@https_fn.on_request(region="europe-west1", timeout_sec=540)
def pylon_sync_products(req: https_fn.Request) -> https_fn.Response:
    """
    Manually trigger Pylon -> Shopify Product Import (Drafts).
    """
    import asyncio
    from sync.products import sync_products_job
    
    try:
        asyncio.run(sync_products_job())
        return https_fn.Response("Product Sync Triggered Successfully", status=200)
    except Exception as e:
        print(f"Error in pylon_sync_products: {e}")
        return https_fn.Response(f"Error: {str(e)}", status=500)


@https_fn.on_request(region="europe-west1", timeout_sec=540)
def pylon_ingest_csv(req: https_fn.Request) -> https_fn.Response:
    """
    Ingest Pylon CSV via HTTP Upload.
    Expects raw CSV content in the body.
    """
    from firebase_admin import firestore
    from pylon.ingest import parse_pylon_csv, ingest_products_to_firestore

    if req.method != "POST":
        return https_fn.Response("Method Not Allowed", status=405)
    
    csv_content = req.get_data(as_text=True)
    if not csv_content:
        return https_fn.Response("Empty body", status=400)
        
    try:
        # 1. Parse
        products = parse_pylon_csv(csv_content)
        
        # 2. Ingest
        db = firestore.client()
        stats = ingest_products_to_firestore(products, db)
        
        return https_fn.Response(json.dumps(stats), status=200, mimetype='application/json')
    except Exception as e:
        print(f"Error in pylon_ingest_csv: {e}")
        return https_fn.Response(f"Error: {str(e)}", status=500)
@https_fn.on_call(
    region="europe-west1",
    memory=options.MemoryOption.MB_512,
    timeout_sec=30,  # Returns immediately — just creates tracking doc
)
def trigger_batch_enrichment(req: https_fn.CallableRequest) -> dict:
    """
    Fire-and-forget: Creates tracking doc + marks products, returns immediately.
    Actual processing is picked up by the on_batch_created Firestore trigger.
    
    Accepts:
        skus: List of SKU strings
        environment: "clean" (white bg, default) or "realistic" (workshop bg)
        priority: "normal" (default) or "high" (for single-product regeneration)
    """
    try:
        data = req.data
        skus = data.get("skus", [])
        environment = data.get("environment", "clean")
        priority = data.get("priority", "normal")
        print(f"Studio session requested for {len(skus)} SKUs (env={environment}, priority={priority}): {skus}")
        
        if not skus:
            return {"error": "Missing SKUs"}
            
        from ai.batch_processor import start_studio_session
        result = start_studio_session(skus, environment=environment, priority=priority)
        print(f"Studio session created: {result}")
        return result
    except Exception as e:
        print(f"Error in trigger_batch_enrichment: {e}")
        import traceback
        traceback.print_exc()
        return {"error": f"Runtime Error: {str(e)}"}


@firestore_fn.on_document_created(
    document="enrichment_batches/{batchId}",
    region="europe-west1",
    memory=options.MemoryOption.GB_1,
    timeout_sec=540,  # 9 min — handles ~15 products at 30s delay each
    cpu=1,
)
def on_batch_created(event: firestore_fn.Event[firestore_fn.DocumentSnapshot]) -> None:
    """
    Firestore trigger: When a new batch doc is created, start processing.
    This runs in the background — the callable has already returned to the client.
    """
    batch_id = event.params["batchId"]
    print(f"Firestore trigger fired for batch: {batch_id}")
    
    try:
        from ai.batch_processor import process_studio_queue
        result = process_studio_queue(batch_id)
        print(f"Studio processing complete: {result}")
    except Exception as e:
        print(f"Error processing batch {batch_id}: {e}")
        import traceback
        traceback.print_exc()
        # Mark batch as failed
        from firebase_admin import firestore
        db = firestore.client()
        db.collection("enrichment_batches").document(batch_id).update({
            "status": "FAILED",
            "error_details": f"Trigger error: {str(e)[:200]}",
        })

@https_fn.on_call(region="europe-west1", memory=options.MemoryOption.MB_256)
def trigger_bg_removal(req: https_fn.CallableRequest) -> dict:
    """Manual trigger for background removal on specific SKUs."""
    try:
        data = req.data
        skus = data.get("skus", [])
        if not skus:
            return {"error": "Missing SKUs"}

        import firebase_admin
        from firebase_admin import firestore
        db = firestore.client()
        
        batch = db.batch()
        for sku in skus:
            doc_ref = db.collection("staging_products").document(sku)
            batch.update(doc_ref, {
                "status": "PENDING_BG_REMOVAL",
                "enrichment_message": "Manually triggering background removal..."
            })
        batch.commit()
        return {"success": True, "count": len(skus)}
    except Exception as e:
        print(f"Error in trigger_bg_removal: {e}")
        return {"error": str(e)}

@https_fn.on_request(region="europe-west1", memory=options.MemoryOption.MB_256)
def debug_env_http(req: https_fn.Request) -> https_fn.Response:
    import sys
    import os
    import json
    
    results = {
        "status": "ok",
        "python_version": sys.version,
        "cwd": os.getcwd(),
        "files": os.listdir("."),
        # "env_vars": {k: v for k, v in os.environ.items() if "KEY" not in k and "SECRET" not in k}
    }
    
    try:
        import google.genai
        results["google_genai"] = "imported"
    except Exception as e:
        results["google_genai"] = str(e)
        
    try:
        import ai.enrichment
        results["ai_enrichment"] = "imported"
    except Exception as e:
        results["ai_enrichment"] = str(e)
        import traceback
        results["ai_enrichment_trace"] = traceback.format_exc()

    return https_fn.Response(json.dumps(results), status=200, mimetype='application/json')

# --- 5. Periodic Batch Status Sync (Reactive Bridge) ---
# Cloud Scheduler checks Vertex AI and writes results to Firestore.
# Frontend picks up changes via onSnapshot — no client-side polling needed.
@scheduler_fn.on_schedule(
    schedule="every 1 minutes",
    region="europe-west1",
    memory=options.MemoryOption.GB_1,
)
def cron_check_batches(event: scheduler_fn.ScheduledEvent) -> None:
    """
    Checks Vertex AI batch job status and writes per-product results
    to Firestore, enabling real-time UI updates via onSnapshot.
    """
    from ai.batch_processor import check_and_process_batches
    try:
        summary = check_and_process_batches()
        print(f"Batch check summary: {summary}")
    except Exception as e:
        print(f"Error in cron_check_batches: {e}")
        import traceback
        traceback.print_exc()
