# Pylon-Shopify Bridge Testing Guide (Sandbox)

This document outlines the steps to verify the infrastructure after your **Pylon Sandbox Database Alias** is ready.

## 1. Prerequisites
1.  **Pylon Sandbox**: Ensure you have a database alias (e.g., `Pavlicevits_Test`) pointing to a test database.
2.  **Mock Mode OFF**: In `functions/.env`, set `PYLON_MOCK_MODE="false"`.
3.  **Database Alias**: In `functions/.env`, set `PYLON_DATABASE_ALIAS="Pavlicevits_Test"`.

---

## 2. Technical Connectivity Test
Before testing Shopify, confirm the bridge can "talk" to the ERP.

1.  Navigate to the functions folder: `cd functions`
2.  Run the auth test: `python test_pylon_auth.py`
3.  **Expected Result**:
    - The script should fetch a list of products from the sandbox.
    - It should successfully push a `#TEST-CONN-...` order to the sandbox.
    - *If this fails, check your Port Forwarding and API Key.*

---

## 3. Webhook & Invoicing Test
Test the flow: **Shopify Signal → Firebase Function → AADE (Mock) → Pylon (Sandbox)**.

1.  Get your `SHOPIFY_WEBHOOK_SECRET` from the Firebase Console (Environment Secrets).
2.  Run the webhook script: `python test_webhook_live.py`
3.  Enter the secret when prompted.
4.  **Expected Result**:
    - **Console**: You should see a "200 Success" response.
    - **Pylon**: Open the Sandbox ERP. Go to **Sales > Orders**. You should see order `#TEST-LIVE-001`.
    - **AADE**: Check the Cloud Function logs in GCP to see the XML generated for the invoice.

---

## 4. Manual End-to-End Test (Optional but Recommended)
Test the actual storefront Experience.

1.  **Setup**: Ensure "Bogus Gateway" is active in Shopify Admin.
2.  **Purchase**: Go to your e-shop website and buy any product.
3.  **Payment**: Use credit card number `1` (for Bogus Gateway).
4.  **Verification**:
    - **Shopify**: Check that the order appears as **Paid**.
    - **Pylon**: Refresh the Sales Orders in your Sandbox ERP. The order should appear within seconds.

---

## 5. Inventory Sync Test
Verify that changes in Pylon reach your Shopify store.

1.  **ERP Side**: In the Pylon Sandbox, change the stock of a specific SKU to `777`.
2.  **Trigger Sync**: Wait for the scheduled function or run `python test_sync_dry_run.py` (after disabling mocks in-script).
3.  **Shopify Side**: Refresh the product in Shopify Admin. Stock should now show `777`.

---

## Troubleshooting List
- **401 Unauthorized**: Problem with `PYLON_API_KEY`.
- **Connection Timeout**: Problem with Network Port Forwarding or Firewall.
- **404 Not Found**: The Pylon Web Service URL is incorrect.
- **Signature Errors**: The `SHOPIFY_WEBHOOK_SECRET` used in the test script doesn't match the one on the server.
