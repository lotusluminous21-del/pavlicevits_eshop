from PIL import Image, ImageOps
import io
import logging

logger = logging.getLogger(__name__)

def get_tight_bbox(img, threshold=30):
    """Finds a tight bounding box for the content on a white background."""
    # Convert to grayscale
    gray = img.convert('L')
    # Invert so content is white on black background
    inverted = ImageOps.invert(gray)
    # Threshold to remove artifacts
    thresholded = inverted.point(lambda p: 255 if p > threshold else 0)
    return thresholded.getbbox()

def normalize_product_image(image_bytes: bytes, target_size: int = 1024, padding_ratio: float = 0.8) -> bytes:
    """
    Normalizes a product image by:
    1. Detecting the product's bounding box.
    2. Resizing the product to occupy a fixed ratio of the target canvas.
    3. Centering the product on a white background.
    """
    try:
        # Load image
        img = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGBA to handle transparency if present
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
            
        # Try alpha channel first
        alpha = img.getchannel('A')
        bbox = alpha.getbbox()
        
        # If no alpha contrast, use color thresholding
        if not bbox or bbox == (0, 0, img.width, img.height):
            bbox = get_tight_bbox(img)
            
        if not bbox:
            logger.warning("Could not detect product bounding box. Returning original image.")
            return image_bytes
            
        # Crop to the detected product
        product = img.crop(bbox)
        
        # Calculate scaling to fit padding_ratio of target_size
        p_width, p_height = product.size
        scale = (target_size * padding_ratio) / max(p_width, p_height)
        
        new_width = int(p_width * scale)
        new_height = int(p_height * scale)
        
        # Resize product
        product = product.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Create target canvas (white background)
        canvas = Image.new('RGB', (target_size, target_size), (255, 255, 255))
        
        # Center the product
        offset = ((target_size - new_width) // 2, (target_size - new_height) // 2)
        
        # Paste
        if product.mode == 'RGBA':
            canvas.paste(product, offset, mask=product)
        else:
            canvas.paste(product, offset)
            
        # Save to bytes
        output = io.BytesIO()
        canvas.save(output, format='JPEG', quality=95)
        return output.getvalue()
        
    except Exception as e:
        logger.error(f"Failed to normalize image: {e}")
        return image_bytes
