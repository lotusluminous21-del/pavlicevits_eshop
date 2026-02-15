import logging
import asyncio
from typing import List
from pylon.client import PylonClient
from shopify.client import ShopifyClient

logger = logging.getLogger(__name__)

async def sync_inventory_job():
    """
    Cron job to sync inventory from Pylon to Shopify.
    """
    pylon = PylonClient()
    shopify = ShopifyClient()
    
    logger.info("Starting Inventory Sync Job...")
    
    # 1. Get changed stock from Pylon
    # In a real scenario, we might store the 'last_sync_time' in Firestore
    # For now, we fetch a mock list or all items
    stock_items = await pylon.get_stock_levels() 
    
    if not stock_items:
        logger.info("No stock changes found.")
        return

    logger.info(f"Found {len(stock_items)} items to sync from Pylon.")
    
    # 2. Map SKUs to Shopify InventoryItemIDs
    # This is the "expensive" part if we don't have a local map.
    # We will do it one by one for now (or optimize later with a local cache in Firestore).
    
    adjustments = []
    
    for item in stock_items:
        # Resolve SKU to InventoryItemID
        # TODO: Optimize this with batch queries or caching
        inventory_item_id = shopify.get_inventory_item_id_by_sku(item.sku)
        
        if inventory_item_id:
            adjustments.append({
                "inventoryItemId": inventory_item_id,
                "quantity": int(item.quantity)
            })
        else:
            logger.warning(f"Could not find Shopify Inventory Item for SKU: {item.sku}")
    
    # 3. Batch Update Shopify
    if adjustments:
        # Shopify accepts max 250 items per batch.
        batch_size = 200 # Safe margin
        for i in range(0, len(adjustments), batch_size):
            batch = adjustments[i:i + batch_size]
            logger.info(f"Updating batch {i//batch_size + 1} with {len(batch)} items...")
            success = shopify.update_inventory_bulk(batch)
            if not success:
                logger.error(f"Failed to update batch {i//batch_size + 1}")
    
    logger.info("Inventory Sync Job Completed.")
