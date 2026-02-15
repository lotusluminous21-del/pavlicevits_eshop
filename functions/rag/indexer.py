import logging
import json
import requests
import google.auth
import google.auth.transport.requests
from firebase_admin import firestore
from firebase_functions import firestore_fn, options

logger = logging.getLogger(__name__)

# Constants
PROJECT_ID = "pavlicevits-9a889"
LOCATION = "global"
DATA_STORE_ID = "product-search-store"
COLLECTION = "default_collection"
BRANCH = "0"

BASE_URL = f"https://discoveryengine.googleapis.com/v1beta/projects/{PROJECT_ID}/locations/{LOCATION}/collections/{COLLECTION}/dataStores/{DATA_STORE_ID}/branches/{BRANCH}"

def get_access_token():
    """Gets an access token using application default credentials."""
    credentials, _ = google.auth.default()
    auth_request = google.auth.transport.requests.Request()
    credentials.refresh(auth_request)
    return credentials.token

def index_product_to_vertex(product_data: dict, sku: str):
    """
    Uploads/updates a product document in Vertex AI Search using the REST API.
    Uses POST to create, PATCH to update if already exists.
    """
    try:
        token = get_access_token()

        pylon = product_data.get("pylon_data", {})
        ai = product_data.get("ai_data", {})

        # Extract images
        selected_images = ai.get("selected_images", {})
        generated_images = ai.get("generated_images", {})
        
        source_url = selected_images.get("base", "")
        generated_url = generated_images.get("base", "")
        
        # Prioritize generated image for the main display, but keep source
        main_image = generated_url if generated_url else source_url

        # Build the structured data payload
        struct_data = {
            "sku": sku,
            "title": pylon.get("name", ""),
            "description": ai.get("description", ""),
            "description_el": ai.get("description_el", ""),
            "price": pylon.get("price_retail"),
            "tags": ai.get("tags", []),
            "url": f"https://pavlicevits.gr/products/{sku}",
            "image_url": main_image,
            "source_image_url": source_url,
            "generated_image_url": generated_url
        }

        payload = {
            "structData": struct_data
        }

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        # Use document ID = SKU (lowercase, safe chars only)
        doc_id = sku.lower().replace(" ", "-")

        # Try to create via POST
        # Use PATCH with allowMissing=True to Upsert (Create or Update)
        # This avoids the 409 Conflict error and simplifies the logic.
        update_url = f"{BASE_URL}/documents/{doc_id}?allowMissing=true"
        
        logger.info(f"Upserting document {doc_id} to Vertex AI Search...")
        response = requests.patch(update_url, headers=headers, json=payload)

        response.raise_for_status()
        logger.info(f"Successfully indexed/updated product {sku} (doc: {doc_id}) to Vertex AI Search.")

    except Exception as e:
        logger.error(f"Failed to index {sku} to Vertex AI Search: {e}")
        if hasattr(e, 'response') and e.response is not None:
            logger.error(f"Response body: {e.response.text}")

# Decorator moved to main.py
def index_product_trigger(event: firestore_fn.Event[firestore_fn.Change[firestore_fn.DocumentSnapshot]]) -> None:
    """
    Triggers when a product status transitions to 'APPROVED' or 'SYNCED'.
    Pushes the product data to Vertex AI Search for the RAG knowledge base.
    """
    new_doc = event.data.after
    old_doc = event.data.before

    if not new_doc:
        return  # Document was deleted

    new_data = new_doc.to_dict()
    old_data = old_doc.to_dict() if old_doc else {}

    status = new_data.get("status")
    old_status = old_data.get("status")

    # Only index on transition to APPROVED or SYNCED
    if status in ["APPROVED", "SYNCED"] and old_status != status:
        logger.info(f"Indexing product {new_doc.id} to Knowledge Base (status: {status})...")
        index_product_to_vertex(new_data, new_doc.id)
