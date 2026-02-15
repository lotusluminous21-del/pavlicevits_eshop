import logging
import datetime
from typing import Dict, Any, Optional

# AADE imports removed as Pylon handles compliance
# from aade.types import AADEInvoice, InvoiceType, Party, InvoiceRow, InvoiceSummary
# from aade.invoice_generator import InvoiceGenerator
# from aade.invoice_transmitter import InvoiceTransmitter

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def handle_order_paid(payload: Dict[str, Any]):
    """
    Handles 'orders/paid' webhook from Shopify.
    Generates and transmits an invoice to AADE.
    """
    order_id = payload.get("id")
    order_name = payload.get("name")
    
    logger.info(f"Processing paid order: {order_name} ({order_id})")
    
    try:
        # DEPRECATED: Direct AADE Transmit (Pylon now handles this)
        # invoice = map_shopify_to_aade(payload)
        # transmitter = InvoiceTransmitter()
        # result = transmitter.submit_invoice_sync(invoice) 
        
        # 1. Transmit to Pylon ERP (Primary route)
        try:
            pylon_success = transmit_order_to_pylon(payload)
            if pylon_success:
                logger.info(f"Successfully synced order {order_name} to Pylon.")
            else:
                logger.error(f"Failed to sync order {order_name} to Pylon.")
        except Exception as p_err:
            logger.error(f"Error syncing to Pylon: {p_err}")

    except Exception as e:
        logger.error(f"Error processing order {order_name}: {e}")

def handle_refund_created(payload: Dict[str, Any]):
    """
    Handles 'refunds/create' webhook from Shopify.
    Generates a Credit Note for AADE and Pylon.
    """
    refund_id = payload.get("id")
    order_id = payload.get("order_id")
    
    logger.info(f"Processing refund {refund_id} for order {order_id}")
    
    try:
        # In a real scenario, we'd fetch the full order to get customer details
        # For now, we'll use the refund payload which contains line items being refunded
        
        # 1. Map to Pylon Credit Note
        pylon_success = transmit_refund_to_pylon(payload)
        if pylon_success:
            logger.info(f"Successfully synced refund {refund_id} to Pylon.")
        
        # 2. Map to AADE Credit Note -> Handled by Pylon
        pass

    except Exception as e:
        logger.error(f"Error processing refund {refund_id}: {e}")

def transmit_refund_to_pylon(refund_data: Dict[str, Any]) -> bool:
    import asyncio
    from pylon.client import PylonClient
    from pylon.models import PylonCreditNote, PylonOrderItem
    
    try:
        items = []
        for line in refund_data.get("refund_line_items", []):
            line_item = line.get("line_item", {})
            items.append(PylonOrderItem(
                sku=line_item.get("sku") or "UNKNOWN",
                quantity=float(line.get("quantity", 1)),
                price_unit=float(line_item.get("price", 0.0))
            ))
            
        credit_note = PylonCreditNote(
            original_order_code=str(refund_data.get("order_id")), # Or name if available
            date=datetime.datetime.now(),
            items=items,
            total_amount=sum(i.price_unit * i.quantity for i in items)
        )
        
        client = PylonClient()
        return asyncio.run(client.create_credit_note(credit_note))
    except Exception as e:
        logger.error(f"Pylon Refund Transmission Error: {e}")
        return False

def transmit_order_to_pylon(order_data: Dict[str, Any]) -> bool:
    """
    Maps Shopify order to Pylon format and transmits it.
    Uses asyncio.run() to bridge sync/async.
    """
    import asyncio
    from pylon.client import PylonClient 
    
    try:
        pylon_order = map_shopify_to_pylon(order_data)
        if not pylon_order:
            logger.warning("Skipping Pylon sync: Could not map order.")
            return False

        client = PylonClient()
        
        async def _async_transmit():
            return await client.create_sales_order(pylon_order)
            
        return asyncio.run(_async_transmit())
    except Exception as e:
        logger.error(f"Pylon Transmission Error: {e}")
        return False

def map_shopify_to_pylon(order: Dict[str, Any]) -> Optional['PylonOrder']:
    """
    Maps Shopify JSON to PylonOrder Pydantic model.
    """
    from pylon.models import PylonOrder, PylonCustomer, PylonOrderItem
    
    try:
        # Customer Mapping
        billing = order.get("billing_address", {})
        customer_email = order.get("email") or "no-email@example.com"
        
        customer = PylonCustomer(
            email=customer_email,
            first_name=billing.get("first_name", "Guest"),
            last_name=billing.get("last_name", "User"),
            phone=billing.get("phone"),
            vat_number=find_vat_number(order), # Re-use existing helper
            address_street=billing.get("address1"),
            address_city=billing.get("city"),
            address_zip=billing.get("zip")
        )
        
        # Items Mapping
        items = []
        for line in order.get("line_items", []):
            items.append(PylonOrderItem(
                sku=line.get("sku") or "UNKNOWN-SKU",
                quantity=float(line.get("quantity", 1)),
                price_unit=float(line.get("price", 0.0)),
                # Discount Logic if needed
            ))
            
        pylon_order = PylonOrder(
            order_code=order.get("name"),
            date=datetime.datetime.fromisoformat(order.get("created_at").replace("Z", "+00:00")),
            customer=customer,
            items=items,
            total_amount=float(order.get("total_price", 0.0)),
            currency=order.get("currency", "EUR"),
            notes=order.get("note")
        )
        return pylon_order
        
    except Exception as e:
        logger.error(f"Error mapping to Pylon Order: {e}")
        return None


def map_shopify_to_aade(order: Dict[str, Any]) -> Optional[AADEInvoice]:
    """
    Maps Shopify Order JSON to AADEInvoice object.
    """
    # 1. Determine Invoice Type & Counterpart
    # Simplified logic: If company name exists, it's an Invoice (1.1). Else Receipt (11.1).
    
    billing_address = order.get("billing_address", {})
    company = billing_address.get("company")
    
    issuer = Party(
        vat_number="000000000", # Replace with YOUR Company VAT
        country="GR",
        branch=0
    )
    
    if company:
        # Business Invoice
        # Note: Shopify doesn't enforce VAT number field by default. 
        # We assume it's stored in 'company' or a custom attribute/note_attribute.
        # For this MVP, we'll try to find a VAT number in note_attributes or assume company has it.
        vat_number = find_vat_number(order)
        if not vat_number:
            logger.warning("Business order detected but no VAT number found. Defaulting to Retail Receipt.")
            invoice_type = InvoiceType.RETAIL_RECEIPT
            counterpart = None
        else:
            invoice_type = InvoiceType.SALES_INVOICE
            counterpart = Party(
                vat_number=vat_number,
                country=billing_address.get("country_code", "GR"),
                name=company,
                address=billing_address.get("address1", ""),
                city=billing_address.get("city", ""),
                postal_code=billing_address.get("zip", "")
            )
    else:
        # Retail Receipt
        invoice_type = InvoiceType.RETAIL_RECEIPT
        counterpart = None # No counterpart needed for 11.1

    # 2. Map Rows
    rows = []
    line_number = 1
    total_net = 0.0
    total_vat = 0.0
    
    for line in order.get("line_items", []):
        # Shopify prices are usually strings
        price = float(line.get("price", "0.0"))
        quantity = int(line.get("quantity", 1))
        
        # Calculate Net & VAT
        # Shopify lines include tax info if configured.
        # Simplified: We take the price as the Gross or Net depending on shop settings.
        # Usually 'price' is unit price. 'tax_lines' has the tax.
        
        # Let's assume standard 24% VAT for now or calculate from line
        # This is complex in Shopify. We will use a simplified approach:
        # Treat 'price' as Gross (tax included) if taxes_included is True, else Net.
        taxes_included = order.get("taxes_included", False)
        
        row_total = price * quantity
        
        if taxes_included:
            # Reverse calculate Net from Gross (assuming 24%)
            # net = gross / 1.24
            # This is risky. Better to use tax_lines.
            pass
        
        # Better: Use the 'pre_tax_price' if available, otherwise calculate.
        # For this MVP -> We will assume 'price' is NET for now to verify data flow.
        net_value = price * quantity
        vat_rate_val = 0.24 
        vat_amount = net_value * vat_rate_val
        
        row = InvoiceRow(
            line_number=line_number,
            net_value=net_value,
            vat_category=1, # 1=24%
            vat_amount=vat_amount
        )
        rows.append(row)
        total_net += net_value
        total_vat += vat_amount
        line_number += 1
        
    # 3. Summary
    total_gross = total_net + total_vat
    summary = InvoiceSummary(
        total_net_value=total_net,
        total_vat_amount=total_vat,
        total_gross_value=total_gross
    )
    
    # 4. Create Invoice
    now = datetime.datetime.now()
    uid = f"{order.get('id')}-{now.timestamp()}"
    
    invoice = AADEInvoice(
        uid=uid,
        issuer=issuer,
        counterpart=counterpart,
        invoice_type=invoice_type,
        series="A",
        aa=str(order.get("order_number")),
        issue_date=now.date(),
        currency=order.get("currency", "EUR"),
        rows=rows,
        summary=summary
    )
    
    return invoice

def find_vat_number(order: Dict[str, Any]) -> Optional[str]:
    """Helper to find VAT number in order attributes."""
    # Check note_attributes
    for attr in order.get("note_attributes", []):
        name = attr.get("name", "").lower()
        if "vat" in name or "afm" in name:
            return attr.get("value")
    return None
