import csv
import io
import logging
from typing import List, Dict, Any
from firebase_admin import firestore
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

STAGING_COLLECTION = "staging_products"

def parse_float_greek(value: str) -> float:
    """Parses a float string with Greek locale (comma as decimal)."""
    if not value:
        return 0.0
    try:
        # Remove thousands separator (.) and replace decimal comma (,) with dot (.)
        clean_value = value.replace(".", "").replace(",", ".")
        return float(clean_value)
    except ValueError:
        logger.warning(f"Could not parse float value: {value}")
        return 0.0

def parse_pylon_csv(csv_content: str) -> List[Dict[str, Any]]:
    """
    Parses the Pylon export CSV content into a list of dictionaries.
    Resilient to BOM, encoding issues, and slight header variations.
    """
    if not csv_content:
        return []

    # 1. Strip BOM if present
    csv_content = csv_content.lstrip('\ufeff')

    # 2. Detect delimiter
    first_line = csv_content.splitlines()[0] if csv_content else ""
    delimiter = ";" if ";" in first_line else ","
    logger.info(f"Using CSV delimiter: '{delimiter}'")

    f = io.StringIO(csv_content)
    reader = csv.DictReader(f, delimiter=delimiter)
    
    products = []
    
    # Helper to find value by partial key match (resilient to Greek characters/BOM)
    def find_val(row_dict, possible_keywords):
        for k, v in row_dict.items():
            if not k: continue
            k_clean = k.strip().lower()
            for pk in possible_keywords:
                if pk.lower() in k_clean:
                    return v
        return None

    # Common Greek headers for Pylon
    SKU_KEYS = ["Κωδικός", "Kwdivko", "SKU", "Code"]
    NAME_KEYS = ["Όνομα", "Onoma", "Name", "Περιγραφή"]
    STOCK_KEYS = ["Υπόλοιπο", "Stock", "Quantity", "Ποσότητα"]
    PRICE_RETAIL_KEYS = ["Λιανική", "Retail", "Price", "Τιμή"]
    PRICE_BULK_KEYS = ["Χονδρική", "Hondriki", "Bulk", "Wholesale"]
    ACTIVE_KEYS = ["Ενεργό", "Active", "Status"]

    for row in reader:
        # Map CSV columns to our schema using fuzzy matching
        sku = find_val(row, SKU_KEYS)
        if not sku:
            continue

        name = find_val(row, NAME_KEYS)
        stock_val = find_val(row, STOCK_KEYS) or "0"
        stock = parse_float_greek(str(stock_val))
        
        price_retail_val = find_val(row, PRICE_RETAIL_KEYS) or "0"
        price_retail = parse_float_greek(str(price_retail_val))

        price_bulk_val = find_val(row, PRICE_BULK_KEYS) or "0"
        price_bulk = parse_float_greek(str(price_bulk_val))
        
        active_raw = find_val(row, ACTIVE_KEYS) or "Ναι"
        active = str(active_raw).lower() in ["ναι", "yes", "true", "1"]

        product_data = {
            "sku": str(sku).strip(),
            "source": "manual_csv",
            "pylon_data": {
                "name": str(name).strip() if name else "",
                "price_retail": price_retail,
                "price_bulk": price_bulk,
                "stock_quantity": stock,
                "active": active,
                "raw_csv_row": row
            },
            "updated_at": datetime.utcnow().isoformat()
        }
        # Initial status for new products. 
        # We don't overwrite status if it's already being processed or reviewed.
        product_data["status"] = "IMPORTED" 
        
        products.append(product_data)
        
    return products

def ingest_products_to_firestore(products: List[Dict[str, Any]], db: firestore.client) -> Dict[str, int]:
    """
    Upserts parsed products into the staging_products collection.
    Preserves status if the product has already been processed.
    """
    count = 0
    total_processed = 0
    results = {"created": 0, "updated": 0, "errors": 0}

    # For status preservation, we need to know what's already there.
    # We'll process in chunks to avoid hitting Firestore limits and to keep it efficient.
    chunk_size = 100
    for i in range(0, len(products), chunk_size):
        chunk = products[i:i + chunk_size]
        skus = [p["sku"] for p in chunk]
        
        # 1. Fetch existing docs to check statuses
        existing_docs = {doc.id: doc.to_dict() for doc in db.collection(STAGING_COLLECTION).where("sku", "in", skus).get()}
        
        batch = db.batch()
        for p in chunk:
            sku = p["sku"]
            doc_ref = db.collection(STAGING_COLLECTION).document(sku)
            
            existing = existing_docs.get(sku)
            if existing:
                # PRESERVATION LOGIC:
                # If the product is already ENRICHED, APPROVED, or in a specific wizard step, 
                # we don't want to reset it to "IMPORTED".
                current_status = existing.get("status")
                if current_status and current_status != "IMPORTED":
                    # Keep existing status
                    p["status"] = current_status
                results["updated"] += 1
            else:
                results["created"] += 1

            batch.set(doc_ref, p, merge=True)
            count += 1
            total_processed += 1

        batch.commit()
        logger.info(f"Committed batch of {len(chunk)} products.")

    results["total"] = total_processed
    return results
