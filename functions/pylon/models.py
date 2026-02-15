from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# --- Pylon Data Models ---

class PylonStockItem(BaseModel):
    sku: str
    quantity: float
    warehouse_id: str = "DEFAULT"

class PylonCustomer(BaseModel):
    code: Optional[str] = None
    email: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    vat_number: Optional[str] = None
    address_street: Optional[str] = None
    address_city: Optional[str] = None
    address_zip: Optional[str] = None

class PylonOrderItem(BaseModel):
    sku: str
    quantity: float
    price_unit: float
    discount_percent: float = 0.0
    tax_percent: float = 24.0 # Default VAT

class PylonOrder(BaseModel):
    order_code: str # Shopify Order Name (e.g., #1001)
    date: datetime
    customer: PylonCustomer
    items: List[PylonOrderItem]
    total_amount: float
    currency: str = "EUR"
    payment_method: str = "Credit Card" # Default or mapped
    notes: Optional[str] = None

class PylonCreditNote(BaseModel):
    original_order_code: str
    date: datetime
    items: List[PylonOrderItem]
    total_amount: float
    reason: str = "Return"
    currency: str = "EUR"

class PylonProduct(BaseModel):
    sku: str
    name: str
    description: Optional[str] = None
    price_retail: float
    price_wholesale: Optional[str] = None
    barcode: Optional[str] = None
    category_id: Optional[str] = None
    stock_quantity: float
    active: bool = True
