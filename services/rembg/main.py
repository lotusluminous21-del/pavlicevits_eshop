"""
Background Removal Microservice (rembg)
Deployed as a Cloud Run container.

Endpoints:
  POST /remove-bg  — Remove background from an image URL
  GET  /health     — Health check
"""

import os
import io
import logging
import requests as http_requests
from flask import Flask, request, jsonify
from rembg import remove, new_session
from PIL import Image

import firebase_admin
from firebase_admin import credentials, storage

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Initialize Firebase Admin (uses default credentials in Cloud Run)
try:
    firebase_admin.initialize_app(options={
        'storageBucket': os.environ.get('FIREBASE_STORAGE_BUCKET', 'pavlicevits-9a889.firebasestorage.app')
    })
except ValueError:
    pass  # Already initialized

# Pre-load the rembg session at startup for faster inference
logger.info("Loading rembg u2net model...")
rembg_session = new_session("u2net")
logger.info("Model loaded successfully.")


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "model": "u2net"}), 200


@app.route('/remove-bg', methods=['POST'])
def remove_bg():
    """
    Remove background from an image.
    
    Request JSON:
        {
            "image_url": "https://example.com/product.jpg",
            "sku": "PRODUCT-SKU-001"
        }
    
    Response JSON:
        {
            "result_url": "https://storage.googleapis.com/.../bg-removed.png",
            "original_url": "https://example.com/product.jpg"
        }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON body required"}), 400

    image_url = data.get("image_url")
    sku = data.get("sku", "unknown")

    if not image_url:
        return jsonify({"error": "image_url is required"}), 400

    try:
        # 1. Download the source image
        logger.info(f"Downloading image for SKU {sku}: {image_url}")
        resp = http_requests.get(image_url, timeout=30, headers={
            "User-Agent": "Mozilla/5.0 (compatible; ProductImageBot/1.0)"
        })
        resp.raise_for_status()

        # 2. Open with PIL
        input_image = Image.open(io.BytesIO(resp.content)).convert("RGBA")
        
        # 2.5 Resize if too large (u2net is slow on massive images)
        MAX_SIZE = 2048
        if max(input_image.size) > MAX_SIZE:
            logger.info(f"Resizing image from {input_image.size} to {MAX_SIZE}px max dimension")
            input_image.thumbnail((MAX_SIZE, MAX_SIZE), Image.Resampling.LANCZOS)

        # 3. Remove background
        logger.info(f"Removing background for SKU {sku} (size: {input_image.size})...")
        output_image = remove(input_image, session=rembg_session)

        # 4. Convert to PNG bytes
        output_buffer = io.BytesIO()
        output_image.save(output_buffer, format="PNG", optimize=True)
        output_buffer.seek(0)
        png_bytes = output_buffer.getvalue()

        # 5. Upload to Firebase Storage
        bucket = storage.bucket()
        safe_sku = sku.lower().replace(" ", "-").replace("/", "-")
        blob_path = f"product-images/{safe_sku}/bg-removed.png"
        blob = bucket.blob(blob_path)
        blob.upload_from_string(png_bytes, content_type="image/png")

        # Make publicly accessible
        blob.make_public()
        result_url = blob.public_url

        logger.info(f"Background removed for SKU {sku}. Result: {result_url}")

        return jsonify({
            "result_url": result_url,
            "original_url": image_url,
            "sku": sku,
            "size_bytes": len(png_bytes)
        }), 200

    except http_requests.RequestException as e:
        logger.error(f"Failed to download image: {e}")
        return jsonify({"error": f"Failed to download image: {str(e)}"}), 400
    except Exception as e:
        logger.error(f"Background removal failed: {e}")
        return jsonify({"error": f"Processing failed: {str(e)}"}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=False)
