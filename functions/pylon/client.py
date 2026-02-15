import os
import logging
import httpx
from datetime import datetime
from typing import List, Optional, Dict, Any
from .models import PylonOrder, PylonStockItem, PylonProduct

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PylonClient:
    """
    Client for interacting with Epsilon Net Pylon ERP Key.
    Supports MOCK_MODE for development without live credentials.
    """

    def __init__(self):
        self.base_url = os.environ.get("PYLON_API_URL", "https://api.pylon-erp.com/v1")
        self.api_key = os.environ.get("PYLON_API_KEY", "MOCK_KEY")
        self.mock_mode = os.environ.get("PYLON_MOCK_MODE", "true").lower() == "true"
        self.invoice_series = os.environ.get("PYLON_INVOICE_SERIES", "A")
        self.order_series = os.environ.get("PYLON_ORDER_SERIES", "E-SH")
        self.credit_series = os.environ.get("PYLON_CREDIT_SERIES", "ΠΙΣ")
        self.db_alias = os.environ.get("PYLON_DATABASE_ALIAS", "DEFAULT")
        
        if self.mock_mode:
            logger.info("Initializing PylonClient in MOCK MODE")
        else:
            if not self.api_key or self.api_key == "MOCK_KEY":
                logger.error("PYLON_API_KEY is missing but MOCK_MODE is false!")
            logger.info(f"Initializing PylonClient in LIVE MODE (URL: {self.base_url}, Alias: {self.db_alias})")

    def _get_headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "X-Database-Alias": self.db_alias, # Used to switch between Prod/Test databases
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

    async def get_stock_levels(self, skus: List[str] = None, changes_since: datetime = None) -> List[PylonStockItem]:
        """
        Fetches stock levels from Pylon.
        If `changes_since` is provided, asks for delta updates.
        """
        if self.mock_mode:
            logger.info(f"[MOCK] Fetching stock for {len(skus) if skus else 'ALL'} items")
            # Mock response: Randomize stock for requested SKUs or return a dummy list
            mock_items = []
            if skus:
                for sku in skus:
                    mock_items.append(PylonStockItem(sku=sku, quantity=10.0)) # Default 10 for safety
            else:
                # Delta fetch simulation
                mock_items = [
                    PylonStockItem(sku="SKU-001", quantity=50.0),
                    PylonStockItem(sku="SKU-002", quantity=5.0)
                ]
            return mock_items

        # Real Implementation
        params = {}
        if changes_since:
            params["since"] = changes_since.isoformat()
        
        async with httpx.AsyncClient() as client:
            try:
                # Hypothetical Pylon endpoint
                url = f"{self.base_url}/inventory/stock" 
                response = await client.get(url, headers=self._get_headers(), params=params)
                response.raise_for_status()
                data = response.json()
                # Map raw JSON to PylonStockItem
                return [PylonStockItem(**item) for item in data]
            except Exception as e:
                logger.error(f"Failed to fetch stock from Pylon: {e}")
                return []

    async def create_sales_order(self, order: PylonOrder) -> bool:
        """
        Pushes a Sales Order to Pylon.
        """
        if self.mock_mode:
            logger.info(f"[MOCK] Creating Pylon Order for {order.order_code} - Total: {order.total_amount}")
            return True

        async with httpx.AsyncClient() as client:
            try:
                url = f"{self.base_url}/sales/orders"
                payload = order.dict() 
                payload["series"] = self.order_series # Inject the series from config
                response = await client.post(url, headers=self._get_headers(), json=payload)
                response.raise_for_status()
                logger.info(f"Successfully created Pylon order: {response.json().get('id')}")
                return True
            except Exception as e:
                logger.error(f"Failed to create Pylon order: {e}")
                return False

    async def create_credit_note(self, credit_note: 'PylonCreditNote') -> bool:
        """
        Pushes a Credit Note (Πιστωτικό) to Pylon for a return/refund.
        """
        if self.mock_mode:
            logger.info(f"[MOCK] Creating Pylon Credit Note for {credit_note.original_order_code} - Total: {credit_note.total_amount}")
            return True

        async with httpx.AsyncClient() as client:
            try:
                url = f"{self.base_url}/sales/credit-notes"
                payload = credit_note.dict()
                payload["series"] = self.credit_series # Use configured credit series
                response = await client.post(url, headers=self._get_headers(), json=payload)
                response.raise_for_status()
                logger.info(f"Successfully created Pylon credit note: {response.json().get('id')}")
                return True
            except Exception as e:
                logger.error(f"Failed to create Pylon credit note: {e}")
                return False

    async def get_products(self, since: datetime = None) -> List[PylonProduct]:
        """
        Fetches product master data for listing sync.
        """
        if self.mock_mode:
            logger.info("[MOCK] Fetching products list")
            return [
                PylonProduct(sku="MOCK-PROD-01", name="Mock T-Shirt", price_retail=25.0, stock_quantity=100),
                PylonProduct(sku="MOCK-PROD-02", name="Mock Jeans", price_retail=55.0, stock_quantity=20),
            ]
        
        # Real Implementation
        async with httpx.AsyncClient() as client:
            try:
                url = f"{self.base_url}/items"
                params = {"since": since.isoformat()} if since else {}
                response = await client.get(url, headers=self._get_headers(), params=params)
                response.raise_for_status()
                return [PylonProduct(**item) for item in response.json()]
            except Exception as e:
                logger.error(f"Error fetching products: {e}")
                return []
