
import os
import sys
import uuid
import json
import base64
import requests
from firebase_admin import firestore, initialize_app, storage
from google.cloud import storage as gcs_storage
from google.genai import types

# Add parent directory to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

from core.llm_config import LLMConfig

def test_trigger(sku):
    try:
        initialize_app()
        db = firestore.client()
        client = LLMConfig.get_client()
        
        doc_ref = db.collection("staging_products").document(sku)
        doc = doc_ref.get()
        if not doc.exists:
            print(f"SKU {sku} not found")
            return
            
        data = doc.to_dict()
        ai_data = data.get("ai_data", {})
        name = data.get("pylon_data", {}).get("name", "Test Product")
        source_url = ai_data.get("selected_images", {}).get("base")
        
        if not source_url:
            print(f"No source image for {sku}")
            return

        print(f"Downloading image from {source_url}...")
        resp = requests.get(source_url, timeout=10, verify=False)
        resp.raise_for_status()
        b64_data = base64.b64encode(resp.content).decode("utf-8")
        
        request_payload = {
            "request": {
                "contents": [
                    {
                        "parts": [
                            {"inline_data": {"mime_type": "image/jpeg", "data": b64_data}},
                            {"text": f"Professional product photography of {name}. Clean workshop background."}
                        ]
                    }
                ]
            }
        }
        
        batch_id = str(uuid.uuid4())
        print(f"Generated Batch ID: {batch_id}")
        
        jsonl_content = json.dumps(request_payload)
        storage_client = gcs_storage.Client()
        bucket_name = LLMConfig.BATCH_INPUT_GCS_PATH.replace("gs://", "")
        bucket = storage_client.bucket(bucket_name)
        
        blob_name = f"input_test_{batch_id}.jsonl"
        blob = bucket.blob(blob_name)
        blob.upload_from_string(jsonl_content, content_type="application/jsonl")
        
        input_uri = f"{LLMConfig.BATCH_INPUT_GCS_PATH}/{blob_name}"
        output_uri = f"{LLMConfig.BATCH_OUTPUT_GCS_PATH}/test_{batch_id}"
        
        print(f"Input URI: {input_uri}")
        print(f"Output URI: {output_uri}")
        
        print("Creating Gemini Batch Job...")
        job = client.batches.create(
            model=LLMConfig.get_image_model_name(),
            src=input_uri,
            config=types.CreateBatchJobConfig(dest=output_uri)
        )
        
        print(f"Job Created Successfully!")
        print(f"Job Name: {job.name}")
        print(f"Job State: {job.state}")
        print(f"Job Source: {job.src}")
        if hasattr(job, 'config'):
            print(f"Job Config: {job.config}")
            
    except Exception as e:
        print(f"Error: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    import traceback
    # Use a real SKU from the system
    test_trigger("SP100201")
