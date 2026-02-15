import os
import logging
import json
from firebase_admin import firestore
from firebase_functions import firestore_fn, options
from google import genai
from google.genai import types
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

from core.llm_config import LLMConfig
from google.cloud import storage as gcs_storage
import base64
import requests

import logging
import json
import urllib3

# Suppress SSL warnings since we use verify=False for some extractors
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

logger = logging.getLogger(__name__)

import time
import random
import uuid
from firebase_admin import storage

def upload_image_to_storage(image_bytes: bytes, mime_type: str, sku: str) -> str:
    """
    Uploads raw image bytes to Firebase Storage and returns the public URL.
    """
    try:
        bucket = storage.bucket() # Uses default bucket
        filename = f"{uuid.uuid4()}.jpg"
        blob_path = f"generated-images/{sku}/{filename}"
        blob = bucket.blob(blob_path)
        
        blob.upload_from_string(image_bytes, content_type=mime_type)
        blob.make_public()
        
        return blob.public_url
    except Exception as e:
        logger.error(f"Failed to upload image for {sku}: {e}")
        raise e

def generate_with_retry(client, model, contents, config, retries=3, initial_delay=1):
    """
    Wraps generate_content with exponential backoff for 429 errors.
    """
    delay = initial_delay
    for attempt in range(retries + 1):
        try:
            return client.models.generate_content(
                model=model,
                contents=contents,
                config=config
            )
        except Exception as e:
            # Check for 429 or Resource Exhausted
            error_str = str(e)
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                if attempt < retries:
                    sleep_time = delay + random.uniform(0, 1) # Add jitter
                    logger.warning(f"Rate limited (429). Retrying in {sleep_time:.2f}s... (Attempt {attempt+1}/{retries})")
                    time.sleep(sleep_time)
                    delay *= 2 # Exponential backoff
                    continue
            # Re-raise other errors or if retries exhausted
            raise e

def clean_json(text: str) -> str:
    """Removes potential markdown code blocks from the JSON string."""
    text = text.strip()
    if text.startswith("```"):
        # Find the first { and the last }
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1:
            return text[start:end+1]
    return text


def generate_metadata(product_name: str, sku: str, search_results: list) -> dict:
    """
    Generates metadata, variants, categories and tags using Gemini based on search results.
    """
    client = LLMConfig.get_client()

    # Construct context from search results
    context_text = "\n".join([f"- {r['title']}: {r['snippet']}" for r in search_results])

    prompt = f"""
    You are an expert e-commerce copywriter for a premium paints and sprays shop.
    Create a compelling, SEO-optimized product description for a Shopify store.
    The description should be PLAIN TEXT ONLY, NO HTML TAGS.
    
    You must also:
    1. Provide a high-quality translation of the description in Greek.
    2. Provide a customer-friendly product title in Greek.
    3. DISCOVER VARIANTS: From the context, identify if this product has variants (colors, sizes, volumes). 
       List them clearly.
    4. SUGGEST CATEGORIES & TAGS: Based on the product type (e.g., Spray Paint, Primer, Wood Varnish).

    Product: {product_name} (SKU: {sku})
    
    Context from Search:
    {context_text}
    
    Output JSON format:
    {{
        "title_el": "Greek Title",
        "description": "English description",
        "description_el": "Greek description",
        "short_description": "...",
        "tags": ["tag1", "tag2"],
        "category": "Main Category",
        "variants": [
            {{
                "sku_suffix": "suffix (e.g. RED)",
                "variant_name": "Color: Red",
                "option_name": "Color",
                "option_value": "Red",
                "pylon_sku": "{sku}"
            }}
        ],
        "attributes": {{"key": "value"}},
        "confidence_score": 0.0-1.0
    }}
    """

    try:
        model_name = LLMConfig.get_model_name(complex=True)
        logger.info(f"Calling Gemini ({model_name}) for SKU {sku}")
        
        response = client.models.generate_content(
            model=model_name,
            contents=[prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.3
            )
        )
        
        if not response or not response.text:
            logger.error(f"Gemini returned empty text for {sku}")
            return {}

        logger.info(f"Gemini Response for {sku}: {response.text}")
        cleaned_text = clean_json(response.text)
        data = json.loads(cleaned_text)
        return data
    except Exception as e:
        logger.error(f"Gemini metadata generation failed for {sku}: {str(e)}", exc_info=True)
        return {"error": str(e)}

def validate_image(image_url: str, product_name: str) -> float:
    return 0.8 

# Decorator moved to main.py for lazy loading
def enrich_product(event: firestore_fn.Event[firestore_fn.Change[firestore_fn.DocumentSnapshot]]) -> None:
    """
    Main dispatcher for the Product Enrichment Wizard.
    """
    try:
        logger.info(f"Triggered enrich_product for event: {event.id}")
        new_doc = event.data.after
        if not new_doc:
            return

        data = new_doc.to_dict()
        if not data:
            return

        status = data.get("status")
        sku = data.get("sku")
        pylon_data = data.get("pylon_data", {})
        name = pylon_data.get("name", "")

        # PHASE 1: Metadata & Variant Discovery
        if status == "PENDING_METADATA":
            handle_metadata_phase(new_doc.reference, data, firestore.client())
        
        # PHASE 2: Image Sourcing
        elif status == "PENDING_IMAGE_SOURCING":
            handle_image_sourcing_phase(new_doc.reference, data, firestore.client())

        # PHASE 3: Nano Banana Studio Generation
        elif status == "PENDING_NANO_BANANA":
            # For now, we still allow individual processing if triggered by a doc write (e.g. manual retry)
            # but the UI will favor the bulk trigger.
            handle_nano_banana_phase(new_doc.reference, sku, name, data.get("ai_data", {}))

        # PHASE 3.5: Batch Generation In Progress
        elif status == "BATCH_GENERATING":
            # Just wait for the batch process to complete
            pass

        # PHASE 4: Final BG Removal & Prep
        elif status == "PENDING_BG_REMOVAL":
            handle_bg_removal_phase(new_doc.reference, sku, data.get("ai_data", {}))

    except Exception as e:
        logger.error(f"Global enrichment trigger error: {e}", exc_info=True)
        # Try to report to doc if possible
        try:
            event.data.after.reference.update({
                "enrichment_message": f"Global Trigger Error: {str(e)[:50]}"
            })
        except:
            pass


from core.discovery_service import DiscoveryService
from core.content_extractor import ContentExtractor

# --- Pydantic Models for Structured Output ---
class ProductVariant(BaseModel):
    sku_suffix: str
    variant_name: str
    option_name: str
    option_value: str
    pylon_sku: Optional[str] = None

class ProductImage(BaseModel):
    url: str
    description: Optional[str] = None

class ProductEnrichmentData(BaseModel):
    title_el: str = Field(description="Customer-friendly product title in Greek")
    description_el: str = Field(description="SEO-optimized product description in Greek")
    description: str = Field(description="Product description in English")
    short_description: str = Field(description="Brief summary for collections")
    tags: List[str] = Field(description="List of relevant tags")
    category: str = Field(description="Main product category")
    variants: List[ProductVariant] = Field(description="Discovered product variants", default=[])
    attributes: Dict[str, Any] = Field(description="Key-value product attributes", default={})
    confidence_score: float = Field(description="Confidence score 0.0-1.0")

def handle_metadata_phase(product_ref, data, db):
    """
    Phase 1: Generate Metadata AND Search for Images using Gemini Grounding + Scraper.
    """
    sku = data.get("sku", "")
    name = data.get("name") or data.get("pylon_data", {}).get("name", "")
    
    if not name:
        logger.error(f"Missing name for SKU {sku}")
        product_ref.update({
            "status": "MISSING_DATA",
            "enrichment_message": "Missing product name. Check input data."
        })
        return

    logger.info(f"Starting Grounding + Scraper Enrichment for {sku}")
    
    try:
        # Initialize Services
        discovery_service = DiscoveryService()
        content_extractor = ContentExtractor()

        # --- STEP 1: Grounded Search (Text + Source URLs) ---
        search_result = discovery_service.search_and_enrich(name)
        
        if search_result.get("error"):
            raise Exception(f"Discovery Service Failed: {search_result['error']}")
            
        generated_text = search_result.get("text", "")
        source_urls = search_result.get("source_urls", [])
        
        logger.info(f"Discovery complete. Found {len(source_urls)} sources.")

        # --- STEP 2: Image Extraction (Scraper) ---
        found_images = []
        if source_urls:
            logger.info(f"Extracting images from {len(source_urls)} sources...")
            images = content_extractor.fetch_images_from_urls(source_urls, limit=5)
            # Format as expected by frontend/firestore
            found_images = [{"url": img, "score": 0.9, "source": "web_scrape"} for img in images]
            logger.info(f"Extracted {len(found_images)} images.")
        
        # --- STEP 3: Structure Data (Gemini) ---
        client = LLMConfig.get_client()
        model_name = LLMConfig.get_model_name(complex=True)
        
        structure_prompt = f"""You are a Shopify Data Expert. 
        Extract product information into a valid JSON structure based on the text below.
        
        SOURCE TEXT:
        {generated_text}
        
        REQUIREMENTS:
        - Description must be in Greek, professional, and SEO-friendly.
        - Create a catchy Greek Title.
        - Identify variants if mentioned in the text.
        """
        
        structure_response = client.models.generate_content(
            model=model_name,
            contents=[structure_prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ProductEnrichmentData,
                temperature=0.0
            )
        )
        
        import json
        structured_data = json.loads(structure_response.text)
        
        # Combine extracted images with structured data
        # We store them in 'variant_images.base' as a starting point
        
        ai_data = {
            "title_el": structured_data.get("title_el", ""),
            "description_el": structured_data.get("description_el", ""),
            "description": structured_data.get("description", ""),
            "tags": structured_data.get("tags", []),
            "category": structured_data.get("category", ""),
            "variants": structured_data.get("variants", []),
            "attributes": structured_data.get("attributes", {}),
            "generated_at": firestore.SERVER_TIMESTAMP,
            "model": model_name,
            "variant_images": {
                "base": found_images
            },
            "grounding_sources": source_urls,
            "grounding_text": generated_text # Store raw text for debugging
        }
        
        # Update Firestore
        product_ref.update({
            "status": "PENDING_METADATA_REVIEW",
            "ai_data": ai_data,
            "enrichment_message": f"Enrichment Complete. Found {len(found_images)} images."
        })
        logger.info(f"Enrichment successful for {sku}")

    except Exception as e:
        logger.error(f"Enrichment Failed for {sku}: {e}", exc_info=True)
        product_ref.update({
            "status": "NEEDS_REVIEW", 
            "enrichment_message": f"AI Error: {str(e)}"
        })

def handle_image_sourcing_phase(product_ref, data, db):
    """
    Phase 2: Legacy/Retry Image Search. 
    Now primarily a verify/supplement step if Phase 1 missed images.
    """
    # For now, if we are triggered here, it means we need to TRY AGAIN using the same logic
    # or just advance if we have images.
    sku = data.get("sku", "")
    ai_data = data.get("ai_data", {})
    existing_images = ai_data.get("variant_images", {}).get("base", [])
    
    if existing_images:
        logger.info(f"Images already present for {sku}, skipping search.")
        product_ref.update({
            "status": "PENDING_IMAGE_SELECTION",
            "enrichment_message": "Images ready for selection."
        })
        return

    # If no images, trigger the enrichment logic again (reuse handle_metadata_phase or similar logic)
    # For simplicity, we redirect to metadata phase effectively
    logger.info(f"Retrying enrichment for {sku} in Phase 2...")
    handle_metadata_phase(product_ref, data, db)


def handle_nano_banana_phase(doc_ref, sku, name, ai_data):
    logger.info(f"Phase 3: Nano Banana Studio for {sku}")
    
    # Import requests locally if not available globally
    import requests
    
    # Environment-specific prompts matching batch_processor.py
    NANO_PROMPTS = {
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
    
    try:
        client = LLMConfig.get_client()
        selected_images = ai_data.get("selected_images", {})
        generated_images = {}
        environment = ai_data.get("environment", "clean")
        
        # Select a single source image (prioritize 'base', else take the first one)
        source_url = selected_images.get("base")
        active_suffix = "base"
        
        if not source_url and selected_images:
            first_key = next(iter(selected_images))
            source_url = selected_images[first_key]
        
        if source_url:
            prompt = NANO_PROMPTS.get(environment, NANO_PROMPTS["clean"])
            
            try:
                # Download image to bypass robots.txt restriction on Vertex AI
                logger.info(f"Downloading source image for {sku} from {source_url}...")
                img_resp = requests.get(source_url, timeout=15, verify=False)
                img_resp.raise_for_status()
                image_data = img_resp.content
                logger.info(f"Downloaded {len(image_data)} bytes of image data for {sku}")
                mime_type = img_resp.headers.get('Content-Type', 'image/jpeg')
                
                logger.info(f"Calling Gemini to generate studio image for {sku} (env={environment})...")
                response = generate_with_retry(
                    client=client,
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
                    retries=4,
                    initial_delay=2
                )
                
                # Handle response
                image_url = None
                
                # Case 1: Standard generated_image (Imagen models)
                if hasattr(response, 'generated_image') and response.generated_image:
                    image_url = response.generated_image.url
                
                # Case 2: Raw data in candidates (Gemini Flash Image)
                elif response.candidates and response.candidates[0].content.parts:
                    for part in response.candidates[0].content.parts:
                        if part.inline_data:
                            import base64
                            img_bytes = part.inline_data.data
                            image_url = upload_image_to_storage(img_bytes, "image/jpeg", sku)
                            break
                        elif part.file_data:
                             image_url = part.file_data.file_uri
                             break

                if image_url:
                    generated_images["base"] = image_url
                    
            except Exception as e:
                logger.warning(f"Failed to generate single image from {source_url}: {e}")
        
        doc_ref.update({
            "ai_data.generated_images": generated_images,
            "status": "PENDING_STUDIO_REVIEW",
            "enrichment_message": "Ready for Studio Review"
        })
        
    except Exception as e:
        logger.error(f"Nano Banana phase failed for {sku}: {e}")
        doc_ref.update({"status": "ENRICHMENT_FAILED", "enrichment_message": f"Nano Banana error: {str(e)}"})


def handle_bg_removal_phase(doc_ref, sku, ai_data):
    logger.info(f"Phase 4: Bulk BG Removal for {sku}")
    # doc_ref.update({"enrichment_message": "Final background removal for uniform transparency..."})
    
    import requests
    import os
    
    service_url = os.environ.get("REMBG_SERVICE_URL")
    generated_images = ai_data.get("generated_images", {})
    final_images = {}
    
    try:
        # Use a simplistic retry mechanism
        for suffix, img_url in generated_images.items():
            success = False
            for attempt in range(3):
                try:
                    resp = requests.post(
                        f"{service_url}/remove-bg",
                        json={"image_url": img_url, "sku": f"{sku}_{suffix}"},
                        timeout=60
                    )
                    if resp.ok:
                        final_images[suffix] = resp.json().get("result_url")
                        success = True
                        break
                    else:
                        logger.warning(f"BG removal attempt {attempt+1} failed for {sku}: {resp.status_code} {resp.text}")
                except Exception as e:
                    logger.warning(f"BG removal attempt {attempt+1} error for {sku}: {e}")
            
            if not success:
                logger.error(f"Failed to remove background for {sku} after 3 attempts")

        # Final transition to APPROVED
        if final_images:
            doc_ref.update({
                "ai_data.images": [ {"url": url, "suffix": s} for s, url in final_images.items()],
                "status": "APPROVED",
                "enrichment_message": "Ready to sync to Shopify"
            })
        else:
            doc_ref.update({
                "enrichment_message": "BG removal failed. Retaining original images.",
                "status": "APPROVED", # Fallback to approved with original? Or stay in pending?
                # User probably prefers to move forward. 
                # Let's keep it simple: If detailed failure, we update message but maybe not images.
            })
            
    except Exception as e:
        logger.error(f"BG removal phase failed for {sku}: {e}")
        doc_ref.update({"status": "ENRICHMENT_FAILED", "enrichment_message": f"BG removal error: {str(e)}"})


