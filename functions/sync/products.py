import logging
import asyncio
from firebase_admin import firestore
# from pylon.client import PylonClient 
from shopify.client import ShopifyClient

logger = logging.getLogger(__name__)

async def sync_products_job():
    """
    Syncs 'APPROVED' products from Firestore Staging to Shopify.
    """
    db = firestore.client()
    shopify = ShopifyClient()
    
    logger.info("Starting Staged Product Sync Job...")
    
    # 1. Fetch APPROVED products
    docs = db.collection("staging_products").where("status", "==", "APPROVED").stream()
    
    products_to_sync = []
    for doc in docs:
        product_data = doc.to_dict()
        product_data["sku"] = doc.id # Ensure SKU is present
        products_to_sync.append(product_data)
    
    if not products_to_sync:
        logger.info("No approved products to sync.")
        return

    logger.info(f"Found {len(products_to_sync)} approved products. Sycning to Shopify...")
    
    synced_count = 0
    failed_count = 0
    
    for p in products_to_sync:
        sku = p.get("sku")
        pylon = p.get("pylon_data", {})
        ai = p.get("ai_data", {})
        
        # Check if already exists in Shopify
        if p.get("shopify_product_id"):
             logger.info(f"Product {sku} already synced (ID: {p.get('shopify_product_id')}). Skipping.")
             continue

        # Double check via API (expensive)
        existing_inventory_id = shopify.get_inventory_item_id_by_sku(sku)
        if existing_inventory_id:
            logger.info(f"Product {sku} exists in Shopify (Inventory ID: {existing_inventory_id}). Marking as SYNCED.")
            # Update status to SYNCED so we don't process again
            db.collection("staging_products").document(sku).update({"status": "SYNCED"})
            continue
            
        # Create Payload
        selected_image = ai.get("selected_image_url")
        images = [{"src": selected_image}] if selected_image else []
        
        # Parse tags
        tags_list = ai.get("tags", [])
        if isinstance(tags_list, str):
            tags_str = tags_list
        else:
            tags_str = ", ".join(tags_list)

        # Prepare Metafields (Skipping English translation per Greek-only rule)
        metafields = []
        
        # Build dynamic options and variants
        options = []
        variants_data = []
        ai_variants = ai.get("variants", [])
        
        if ai_variants:
            option_names = []
            for v in ai_variants:
                for i in range(1, 4):
                    opt_name = v.get(f"option{i}_name")
                    if opt_name and opt_name not in option_names:
                        option_names.append(opt_name)
                        
            for name in option_names:
                options.append({"name": name})
                
            for v in ai_variants:
                var_payload = {
                    "sku": f"{sku}{v.get('sku_suffix', '')}",
                    "price": str(pylon.get("price_retail", "0")),
                    "inventory_management": None  # DO NOT TRACK INVENTORY
                }
                for i in range(1, 4):
                    opt_name = v.get(f"option{i}_name")
                    opt_value = v.get(f"option{i}_value")
                    if opt_name and opt_value:
                        try:
                            # Shopify uses option1, option2, option3 matching the order in the options array
                            opt_index = option_names.index(opt_name) + 1
                            var_payload[f"option{opt_index}"] = opt_value
                        except ValueError:
                            pass
                variants_data.append(var_payload)
        else:
            # Default single variant
            variants_data = [
                {
                    "price": str(pylon.get("price_retail", "0")),
                    "sku": sku,
                    "inventory_management": None  # DO NOT TRACK INVENTORY
                }
            ]

        new_product_payload = {
            "title": ai.get("title") or pylon.get("name"),
            "body_html": f"<p>{ai.get('description', '')}</p>",
            "vendor": "Pylon Import",
            "product_type": "Hardware",
            "status": "draft", 
            "tags": tags_str,
            "images": images,
            "metafields": metafields,
            "variants": variants_data
        }
        
        if options:
            new_product_payload["options"] = options
        
        # Call Shopify
        try:
            product_id = shopify.create_product(new_product_payload)
            if product_id:
                logger.info(f"Successfully created product {sku} in Shopify (ID: {product_id})")
                
                # Update Firestore
                db.collection("staging_products").document(sku).update({
                    "status": "SYNCED",
                    "shopify_product_id": str(product_id),
                    "synced_at": firestore.SERVER_TIMESTAMP
                })
                # Trigger RAG Indexing here if needed (or separate trigger)
                synced_count += 1
            else:
                logger.error(f"Failed to create product {sku} in Shopify.")
                failed_count += 1
                
        except Exception as e:
            logger.error(f"Exception syncing {sku}: {e}")
            failed_count += 1

    logger.info(f"Sync Completed. Synced: {synced_count}, Failed: {failed_count}")
