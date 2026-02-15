import asyncio
import os
import sys

# Ensure we can import from functions directory
sys.path.append(os.path.join(os.getcwd(), 'functions'))

# --- FORCE MOCK MODE and SAFETY ---
os.environ["PYLON_MOCK_MODE"] = "true"
os.environ["PYLON_API_KEY"] = "TEST_KEY"
# We deliberately do NOT set SHOPIFY_ADMIN_ACCESS_TOKEN here to ensure no accidental calls
# The code should handle missing credentials gracefully or we will mock the Shopify Client too.

print("--- STARTING DRY RUN TEST (SAFE MODE) ---")

from pylon.client import PylonClient
from pylon.models import PylonOrder, PylonCustomer, PylonOrderItem
from datetime import datetime


async def test_pylon_mock():
    print("\n1. Testing Pylon Client (Mock Mode)...")
    client = PylonClient()
    
    # Test Stock Fetch
    stock = await client.get_stock_levels()
    print(f"   [OK] Fetched {len(stock)} mock stock items.")
    for item in stock[:2]:
        print(f"      - SKU: {item.sku}, Qty: {item.quantity}")

    # Test Product Fetch
    products = await client.get_products()
    print(f"   [OK] Fetched {len(products)} mock products.")
    for p in products[:2]:
        print(f"      - SKU: {p.sku}, Name: {p.name}, Price: {p.price_retail}")

    # Test Order Creation
    print("\n2. Testing Order Push to Pylon (Mock)...")
    dummy_order = PylonOrder(
        order_code="#TEST-DRY-RUN",
        date=datetime.now(),
        customer=PylonCustomer(
            email="test@example.com", 
            first_name="Test", 
            last_name="User"
        ),
        items=[
            PylonOrderItem(sku="MOCK-PROD-01", quantity=1, price_unit=25.0),
            PylonOrderItem(sku="MOCK-PROD-02", quantity=2, price_unit=55.0)
        ],
        total_amount=135.0
    )
    
    success = await client.create_sales_order(dummy_order)
    if success:
        print("   [OK] Order creation simulated successfully.")
    else:
        print("   [FAIL] Order creation failed.")

async def test_sync_logic():
    print("\n3. Testing Sync Logic Modules...")
    
    # We need to mock ShopifyClient to avoid actual API calls
    # Dynamic patching of the class
    from shopify.client import ShopifyClient
    
    # Mock methods
    ShopifyClient.get_inventory_item_id_by_sku = lambda self, sku: f"gid://shopify/InventoryItem/MOCK-{sku}"
    ShopifyClient.update_inventory_bulk = lambda self, adjustments: True
    ShopifyClient.create_product = lambda self, data: f"gid://shopify/Product/MOCK-{data['title']}"

    print("   [INFO] ShopifyClient mocked safely.")

    # Import jobs
    from sync.inventory import sync_inventory_job
    from sync.products import sync_products_job


    print("\n   --- Running Inventory Sync Job ---")
    await sync_inventory_job()
    
    print("\n   --- Running Product Sync Job ---")
    await sync_products_job()

if __name__ == "__main__":
    asyncio.run(test_pylon_mock())
    asyncio.run(test_sync_logic())
    print("\n--- DRY RUN COMPLETED SUCCESSFULLY ---")
