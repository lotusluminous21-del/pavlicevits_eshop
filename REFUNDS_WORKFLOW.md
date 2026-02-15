# Refund & Return Workflow Guide (Greece)

This guide explains how to handle product returns and refunds legally and operationally in your E-shop, ensuring compliance with Greek tax laws (AADE MyData) and synchronization with your Pylon ERP.

## 1. The Legal Requirement
In Greece, when a product is returned and money is refunded, you must issue a **Credit Note (Πιστωτικό Τιμολόγιο)**. 
- If the original sale was a **Retail Receipt (ΑΠΥ)**, you issue a **Retail Credit Note**.
- If the original sale was a **Commercial Invoice (ΤΔΑ)**, you issue a **Commercial Credit Note**.

## 2. Operational Workflow

### Step 1: Physical Receipt
1. The customer ships the product back to your warehouse.
2. Inspect the product for damages.

### Step 2: Shopify Refund (The Trigger)
1. Go to **Shopify Admin > Orders**.
2. Select the order and click **Refund**.
3. Select the items being returned and the refund amount.
4. **Restock items**: Ensure this is checked if the items are going back into inventory.
5. Click **Refund**.

### Step 3: Pylon Synchronization (Automated)
Once the refund is issued in Shopify:
1. The Bridge sends a notification to **Pylon**.
2. Pylon automatically generates a **Pending Credit Note (Προσωρινό Πιστωτικό)**.
3. The items are technically "restocked" in Pylon once the Credit Note is finalized.

### Step 4: Accounting Review & AADE
1. Your accountant or shop manager reviews the Pending Credit Note in Pylon.
2. **Finalize**: The Credit Note is finalized.
3. **MyData**: Pylon transmits the Credit Note to AADE MyData (Type 5.1/5.2) automatically.

## 3. Handling Replacements (Exchanges)
If the customer wants a different product instead of money back:
1. Use the **Exchange** feature in Shopify Admin.
2. Shopify will create a new order (parented by the old one) and handle the price difference.
3. The Bridge will:
   - Create a **Credit Note** for the original item in Pylon.
   - Create a **new Sales Order** for the new item in Pylon.

## 4. Troubleshooting
- **Refund didn't appear in Pylon**: Check the `shopify_refund_created` logs in Firebase Console.
- **Stock mismatch**: Ensure "Restock items" was checked during the Shopify refund process.
- **MyData Error**: Correct the error inside Pylon (e.g., missing VAT number for business returns) and re-transmit from the Pylon MyData Hub.
