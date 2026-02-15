import asyncio
import os
import sys
from dotenv import load_dotenv

# Add the current directory to sys.path to allow imports from local modules
sys.path.append(os.getcwd())

# Load environment variables from .env file
load_dotenv(".env")

from pylon.client import PylonClient
from pylon.models import PylonOrder, PylonCustomer, PylonOrderItem
from datetime import datetime

async def run_connectivity_test():
    """
    Directly tests the Pylon connection using the credentials in .env.
    This bypasses Shopify and focuses strictly on Pylon ERP.
    """
    print("=== Pylon Connectivity Test ===")
    
    # 1. Initialize Client
    client = PylonClient()
    
    # Verify we are NOT in mock mode if testing live
    if client.mock_mode:
        print("\n[!] WARNING: Client is in MOCK MODE. This will NOT test real connectivity.")
        print("To test live, set PYLON_MOCK_MODE=false in your .env")
    else:
        print(f"\n[+] Testing LIVE Connection to: {client.base_url}")
        print(f"[+] Target Database Alias: {client.db_alias}")

    # 2. Test Read: Stock Levels
    print("\n--- Testing: Fetch Stock ---")
    try:
        stock = await client.get_stock_levels(skus=["SKU-001"]) 
        print(f"    [SUCCESS] Received {len(stock)} items from Pylon.")
    except Exception as e:
        print(f"    [ERROR] Failed to fetch stock: {e}")

    # 3. Test Read: Products
    print("\n--- Testing: Fetch Products ---")
    try:
        products = await client.get_products()
        print(f"    [SUCCESS] Received {len(products)} products from Pylon.")
    except Exception as e:
        print(f"    [ERROR] Failed to fetch products: {e}")

    # 4. Test Write (Simulation or Sandbox)
    print("\n--- Testing: Create Test Order ---")
    test_order = PylonOrder(
        order_code=f"#TEST-CONN-{int(datetime.now().timestamp())}",
        date=datetime.now(),
        customer=PylonCustomer(email="test@pavlicevits.gr", first_name="Test", last_name="Connectivity"),
        items=[PylonOrderItem(sku="TEST-SKU", quantity=1.0, price_unit=10.0)],
        total_amount=10.0
    )
    
    try:
        success = await client.create_sales_order(test_order)
        if success:
            print(f"    [SUCCESS] Order {test_order.order_code} pushed successfully.")
        else:
            print("    [FAIL] Pylon rejected the order.")
    except Exception as e:
        print(f"    [ERROR] Write error: {e}")

if __name__ == "__main__":
    asyncio.run(run_connectivity_test())
