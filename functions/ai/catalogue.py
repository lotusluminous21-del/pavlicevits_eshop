import os
import json
import tempfile
import time
from firebase_functions import https_fn, storage_fn, options
from firebase_admin import firestore, storage, initialize_app
from google import genai
from google.genai import types
from .config import AIConfig

# Initialize Firebase if not already done
try:
    initialize_app()
except ValueError:
    pass

# Decorator moved to main.py
def process_catalogue_upload(event: storage_fn.CloudEvent[storage_fn.StorageObjectData]):
    """
    Triggered when a file is uploaded to the catalogue bucket.
    Extracts product data and stores it in Firestore 'staging_products'.
    Tracks progress in 'ingestion_jobs'.
    """
    bucket_name = event.data.bucket
    file_path = event.data.name
    
    # Only process files in the 'catalogues/' path
    if not file_path.startswith("catalogues/"):
        print(f"Skipping file {file_path} (not in catalogues/)")
        return

    # Extract Job ID from metadata or filename
    metadata = event.data.metadata or {}
    job_id = metadata.get("jobId")
    
    db = firestore.client()
    bucket = storage.bucket(bucket_name)

    # If no job_id in metadata, try to find/create one based on filename
    if not job_id:
        # Check if a job already exists for this file
        jobs_ref = db.collection("ingestion_jobs")
        existing_jobs = jobs_ref.where("file_path", "==", file_path).limit(1).get()
        if existing_jobs:
            job_id = existing_jobs[0].id
        else:
            # Create a new job record if missing (e.g. manual upload via console)
            job_doc = jobs_ref.document()
            job_id = job_doc.id
            job_doc.set({
                "file_path": file_path,
                "status": "processing",
                "progress": 0,
                "created_at": firestore.SERVER_TIMESTAMP,
                "type": "automatic"
            })

    job_ref = db.collection("ingestion_jobs").document(job_id)
    
    def update_job(status=None, progress=None, message=None, stats=None):
        update = {"updated_at": firestore.SERVER_TIMESTAMP}
        if status: update["status"] = status
        if progress is not None: update["progress"] = progress
        if message: update["message"] = message
        if stats: update["stats"] = stats
        job_ref.update(update)

    update_job(status="processing", message="Downloading file...")
    print(f"Processing catalogue file: {file_path}")

    # Initialize Gemini Client (might be needed for PDF or for enhancement)
    client = genai.Client(
        vertexai=True, 
        project=AIConfig.PROJECT_ID, 
        location=AIConfig.LOCATION
    )

    gcs_uri = f"gs://{bucket_name}/{file_path}"
    blob = bucket.blob(file_path)
    content_type = event.data.content_type or ""

    products_data = []
    
    # 1. Branching: CSV vs Gemini Extraction
    if file_path.lower().endswith(".csv") or content_type == "text/csv":
        update_job(message="Parsing Pylon CSV...")
        try:
            from pylon.ingest import parse_pylon_csv
            csv_content = blob.download_as_text()
            products_data = parse_pylon_csv(csv_content)
            # Products from ingest.py are already formatted for staging_products
            print(f"Parsed {len(products_data)} products from CSV.")
        except Exception as e:
            print(f"CSV Parsing Failed: {e}")
            update_job(status="failed", message=f"CSV Parsing Failed: {str(e)}")
            return
    else:
        # Use Gemini Extraction for PDFs or other documents
        update_job(message="Extracting data with Gemini...")
        prompt = """
        You are an expert e-commerce data entry specialist.
        Analyze this catalogue file and extract ALL products found.
        For each product, return a JSON object with:
        - title: Product name
        - description: Detailed description
        - price: Price as a number (if found, else null)
        - currency: Currency code (e.g., EUR)
        - sku: SKU or identifier (if found, else null)
        - tags: List of relevant category tags
        
        Return the response as a JSON object with a key "products" containing the list.
        """
        
        try:
            response = client.models.generate_content(
                model=AIConfig.MODEL_NAME,
                contents=[
                    types.Content(
                        role="user",
                        parts=[
                            types.Part.from_uri(file_uri=gcs_uri, mime_type=content_type),
                            types.Part.from_text(text=prompt)
                        ]
                    )
                ],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json", 
                    temperature=0.1
                )
            )
            raw_data = json.loads(response.text)
            raw_products = raw_data.get("products", [])
            
            # Convert Gemini format to staging_products format
            from datetime import datetime
            for p in raw_products:
                products_data.append({
                    "sku": p.get("sku") or f"GEN-{int(time.time())}-{len(products_data)}",
                    "source": "ai_catalogue",
                    "pylon_data": {
                        "name": p.get("title"),
                        "price_retail": p.get("price"),
                        "stock_quantity": 0,
                        "active": True
                    },
                    "ai_data": {
                        "description": p.get("description"),
                        "tags": p.get("tags", [])
                    },
                    "status": "PENDING_ENRICHMENT",
                    "updated_at": datetime.utcnow().isoformat()
                })
            
            print(f"Extracted {len(products_data)} products via Gemini.")
        except Exception as e:
            print(f"Gemini Extraction Failed: {e}")
            update_job(status="failed", message=f"Gemini Extraction Failed: {str(e)}")
            return

    if not products_data:
        update_job(status="completed", message="No products found in file.", progress=100)
        return

    # 2. Ingest into 'staging_products'
    update_job(message=f"Ingesting {len(products_data)} products...")
    
    try:
        from pylon.ingest import ingest_products_to_firestore
        # Our helper handles chunking, batching, and status preservation
        stats = ingest_products_to_firestore(products_data, db)
        processed = stats.get("total", len(products_data))
    except Exception as e:
        print(f"Ingestion helper failed, falling back to basic loop: {e}")
        # Fallback if helper fails for some reason
        batch = db.batch()
        processed = 0
        for product in products_data:
            sku = product.get("sku")
            if not sku: continue
            doc_ref = db.collection("staging_products").document(sku)
            batch.set(doc_ref, product, merge=True)
            processed += 1
            if processed % 50 == 0:
                batch.commit()
                batch = db.batch()
        if processed % 50 != 0:
            batch.commit()

    update_job(
        status="completed", 
        progress=100, 
        message="Catalogue processing complete.",
        stats={"total": total, "processed": processed}
    )
    print("Catalogue processing complete.")
