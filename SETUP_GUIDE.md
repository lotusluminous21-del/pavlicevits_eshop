# Greek E-Shop Template Setup Guide

This guide will walk you through setting up the Greek E-Shop Template. This project is designed to be a "plug-and-play" solution for e-commerce in Greece, featuring integrations with local payment providers (Viva Wallet, Everypay) and AADE for compliance, built on top of Next.js, Shopify Storefront API, and Firebase.

## Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js**: v18 or later (v20+ recommended).
*   **Python**: v3.10 or later (for Cloud Functions).
*   **Firebase CLI**: Install via `npm install -g firebase-tools`.
*   **Git**: For version control.

## 1. Project Initialization

### Clone and Install Dependencies

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd eshop_template
    ```

2.  Install frontend dependencies:
    ```bash
    npm install
    ```

## 2. Configuration Setup

### Environment Variables

1.  Copy the example environment file:
    ```bash
    cp .env.local.example .env.local
    ```

2.  Open `.env.local` and fill in the required values:

    **Shopify Configuration:**
    *   `SHOPIFY_STORE_DOMAIN`: Your Shopify store domain (e.g., `your-store.myshopify.com`).
    *   `SHOPIFY_STOREFRONT_ACCESS_TOKEN`: Generated from Shopify Admin > Settings > Apps > Develop apps.

    **Firebase Configuration:**
    *   Create a new project in the [Firebase Console](https://console.firebase.google.com/).
    *   Navigate to Project Settings > General to find your web app config.
    *   Fill in `NEXT_PUBLIC_FIREBASE_API_KEY`, `AUTH_DOMAIN`, `PROJECT_ID`, etc.

    **Payment & AI (Optional):**
    *   **AI Features**: `NEXT_PUBLIC_ENABLE_AI=true` (Set to `false` to disable Chatbot/Catalogue).
    *   **Payment Providers**: Only configured providers will be active.
        *   `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` -> Enables Stripe
        *   `VIVA_CLIENT_ID`... -> Enables Viva
    *   `GOOGLE_CLOUD_PROJECT`, `GOOGLE_AI_API_KEY`: Required only if `NEXT_PUBLIC_ENABLE_AI=true`.

### Firebase Project Setup

Since this project uses Firebase Functions and Authentication, you need to configure the project locally.

1.  Login to Firebase:
    ```bash
    firebase login
    ```

2.  Initialize Firebase in the project root:
    ```bash
    firebase init
    ```
    *   **Select features**: `Firestore`, `Functions`, `Emulators` (optional).
    *   **Select project**: Choose the project you created earlier.
    *   **Firestore**: Accept defaults (`firestore.rules`, `firestore.indexes.json`).
    *   **Functions**:
        *   Language: **Python**
        *   Source directory: `functions` (The directory already exists, so proceed carefuly to not overwrite `main.py` if prompted, or back it up first. **Note:** The template already provides `functions/`, so usually you just need to link the project).
        *   Install dependencies: **No** (We will do it manually to be safe).

    > **Note:** If `firebase init` asks to overwrite existing files (like `functions/main.py`), say **NO**.

## 3. Backend Setup (Cloud Functions)

The backend logic for Payments (Everypay, Viva) and AADE lives in `functions/`.

1.  Navigate to the functions directory:
    ```bash
    cd functions
    ```

2.  Create and activate a Python virtual environment:
    ```bash
    # Windows
    python -m venv venv
    venv\Scripts\activate

    # macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  Install Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Important:** You need to set your secret keys in Firebase Functions.
    ```bash
    firebase functions:secrets:set STRIPE_SECRET_KEY
    firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
    firebase functions:secrets:set VIVA_CLIENT_ID
    firebase functions:secrets:set VIVA_CLIENT_SECRET
    firebase functions:secrets:set EVERYPAY_SECRET_KEY
    ```
    (Paste the respective keys when prompted).

## 4. Running the Project

### Development Server

1.  Start the Next.js development server:
    ```bash
    npm run dev
    ```
    The site will be available at `http://localhost:3000`.

    > **Note:** The root page (`/`) currently displays the default Next.js template. You can find the shop pages at your configured routes (check `src/app` structure). You may want to modify `src/app/page.tsx` to redirect to your shop home or replace it with your landing page.

### Deploying Functions

To deploy your backend functions to Firebase:

```bash
firebase deploy --only functions
```

## 5. "Plug-and-Play" Checklist

To ensure everything is ready:

- [ ] **Shopify**: Products are visible in the frontend.
- [ ] **Auth**: Users can sign up/login (enable Email/Google Auth in Firebase Console).
- [ ] **Payments**:
    -   Verify `functions/main.py` is deployed.
    -   Test the payment flow with test credentials.
- [ ] **AADE**: If using invoicing, ensure your certificates/keys are configured in the Python logic (currently custom implementation in `functions/`).

## Troubleshooting

-   **Firebase Config Missing**: If you see errors about missing config, ensure `.env.local` is correct and loaded.
-   **Function Errors**: Check Firebase Console > Functions > Logs for traceback.
-   **"Plug-and-Play" Status**: This template provides the *core logic* (Payments, AADE, Auth). You will still need to design your frontend UI in `src/app` or use the provided components in `src/components` to build your unique store layout.

## 6. Pylon-Shopify AI Sync Setup

This project includes an advanced pipeline to sync products from Pylon (or CSV) to Shopify, enriched with AI-generated descriptions and images found via Google Search.

### Prerequisites

1.  **Google Cloud APIs** (enable in [API Library](https://console.cloud.google.com/apis/library)):
    *   **Vertex AI API**: For Gemini.
    *   **Discovery Engine API**: For Vertex AI Search (RAG).

2.  **Serper.dev (Google Search)**:
    *   Go to [serper.dev](https://serper.dev) and sign up.
    *   Get your **API Key**.
    *   (We use Serper because Google Programmable Search Engine deprecated "Entire Web" search for new projects in Jan 2026).

### Configuration

Add to `.env.local`:
```bash
SERPER_API_KEY=your_key_here
GCP_PROJECT_ID=pavlicevits-9a889
GCP_REGION=europe-west1
```

Set the secret in Firebase:
```bash
firebase functions:secrets:set SERPER_API_KEY
```

### Usage Workflow

1.  **Access the Admin UI**:
    *   Navigate to `http://localhost:3000/admin/products`.
    *   (Ensure you have run `npm run dev`).

2.  **Ingest Products**:
    *   Click **"Upload CSV"**.
    *   Select your Pylon export CSV (e.g., `spray gia foti.csv`).
    *   This triggers the `pylon_ingest_csv` cloud function.

3.  **AI Enrichment (Automated)**:
    *   The ingestion automatically triggers `enrich_product` for each item.
    *   The Agent searches Google for the SKU/Name, generates an SEO description using Gemini, and finds manufacturer image URLs.
    *   Status moves from `PENDING_ENRICHMENT` -> `PENDING_REVIEW`.

4.  **Human Review**:
    *   Refresh the Admin UI.
    *   Click **Review** on a product.
    *   Edit the AI-generated description if needed.
    *   Select the best image from the sidebar (found via search).
    *   Click **"Approve & Sync"**.

5.  **Sync & Index**:
    *   The product is created in Shopify (as Draft).
    *   The product is automatically indexed into **Vertex AI Search** for the "Sales Consultant" chatbot.

### RAG Data Store Setup (Vertex AI Search)

The RAG Data Store is the "brain" for your AI Sales Consultant chatbot. It stores approved product data so the AI can answer customer questions about your specific inventory.

> **Important**: The Data Store must be created via CLI. The Google Cloud Console UI does not expose "API" as a clickable data source for the wizard.

**Step 1: Create the Data Store**

Run this command in PowerShell (ensure `gcloud` is authenticated):

```powershell
$token = gcloud auth print-access-token
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
    "X-Goog-User-Project" = "pavlicevits-9a889"
}
$body = '{"displayName": "Product Search Store", "industryVertical": "GENERIC", "solutionTypes": ["SOLUTION_TYPE_SEARCH"]}'

Invoke-RestMethod -Method POST `
    -Uri "https://discoveryengine.googleapis.com/v1alpha/projects/pavlicevits-9a889/locations/global/collections/default_collection/dataStores?dataStoreId=product-search-store" `
    -Headers $headers -Body $body -ContentType "application/json"
```

**Step 2: Create the Search App**

```powershell
$body = '{"displayName": "Product Search Assistant", "solutionType": "SOLUTION_TYPE_SEARCH", "searchEngineConfig": {"searchTier": "SEARCH_TIER_STANDARD"}, "dataStoreIds": ["product-search-store"]}'

Invoke-RestMethod -Method POST `
    -Uri "https://discoveryengine.googleapis.com/v1alpha/projects/pavlicevits-9a889/locations/global/collections/default_collection/engines?engineId=product-search-app" `
    -Headers $headers -Body $body -ContentType "application/json"
```

**Step 3: Verify**

```powershell
Invoke-RestMethod -Method GET `
    -Uri "https://discoveryengine.googleapis.com/v1alpha/projects/pavlicevits-9a889/locations/global/collections/default_collection/dataStores/product-search-store" `
    -Headers $headers
```

You should see `solutionTypes: SOLUTION_TYPE_SEARCH` in the response.

> **Note**: These steps have already been completed for the `pavlicevits-9a889` project. You only need to run them again if you are setting up a new project/environment.

### Architecture Overview

```
CSV Upload → pylon_ingest_csv → Firestore (staging_products)
                                      ↓ (status: PENDING_ENRICHMENT)
                              enrich_product (Gemini + Serper)
                                      ↓ (status: PENDING_REVIEW)
                              Admin UI → Human Review
                                      ↓ (status: APPROVED)
                    ┌─────────────────┴─────────────────┐
              Sync to Shopify              index_product_trigger
              (as Draft)                   (→ Vertex AI Search)
                                                  ↓
                                          Chat Assistant
                                    (RAG-powered product Q&A)
```

### Dependencies (Cloud Functions)

The Python backend uses lightweight dependencies to avoid container startup timeouts:

```
firebase-functions    # Firebase Cloud Functions SDK
firebase-admin        # Firestore, Storage, Auth admin
google-genai          # Gemini API (lightweight SDK)
google-auth           # Authentication for REST API calls
httpx                 # Async HTTP client
pydantic              # Data validation
requests              # HTTP client for REST APIs
```

> **Why not `google-cloud-aiplatform`?** The `vertexai` SDK from `google-cloud-aiplatform` is ~500MB+ and causes "container-failed-to-start" errors in Cloud Functions. We use `google-genai` instead, which provides the same Gemini capabilities in a much smaller package.

---

## 7. Background Removal (rembg)

Product images found via Google Image Search often have cluttered backgrounds. The pipeline includes a **Cloud Run microservice** running `rembg` (u2net model) for one-click background removal in the Admin UI.

### How It Works

```
Admin clicks "Remove BG" → Next.js proxy (/api/remove-bg)
    → Cloud Run (rembg-service)
        → Downloads image → Removes background (u2net)
        → Uploads result to Firebase Storage
        → Returns public URL
    → Admin UI shows cleaned image with "BG Removed" badge
```

### Deployment (Already Done)

The service is deployed at: `https://rembg-service-879284048895.europe-west1.run.app`

To redeploy (e.g., after updating the model or code):

```powershell
# Ensure correct project
gcloud config set project pavlicevits-9a889

# Deploy from source
gcloud run deploy rembg-service `
    --source services/rembg `
    --region europe-west1 `
    --memory 2Gi --cpu 2 `
    --timeout 120 `
    --min-instances 0 --max-instances 3 `
    --set-env-vars "FIREBASE_STORAGE_BUCKET=pavlicevits-9a889.firebasestorage.app" `
    --allow-unauthenticated
```

### Configuration

Add to `.env.local`:
```bash
REMBG_SERVICE_URL="https://rembg-service-879284048895.europe-west1.run.app"
```

### Usage

1. Go to **Admin** → **Products** → Click **Review** on a product
2. Click **"Remove BG"** on any image candidate
3. Wait for processing (spinner shows — first call ~90s cold start, subsequent calls are fast)
4. The cleaned image replaces the original with a purple **"BG Removed"** badge
5. Click **"Approve & Sync"** — the cleaned image URL is sent to Shopify

### Cost

Cloud Run scales to **zero** when idle. You only pay for actual processing time (~$0.00002/vCPU-second). For typical use (a few dozen images/day) the cost is effectively **$0**.

### Key Files

| File | Purpose |
|------|---------|
| `services/rembg/Dockerfile` | Docker container with u2net model baked in |
| `services/rembg/main.py` | Flask API (`POST /remove-bg`, `GET /health`) |
| `src/app/api/remove-bg/route.ts` | Next.js proxy (keeps Cloud Run URL server-side) |
---

## 8. Pylon Bridge Production Setup

This bridge synchronizes products, stock, and sales orders between Epsilon Net Pylon (On-Premises or Cloud) and Shopify.

### Phase 1: Pylon ERP Configuration (ERP Admin)

1.  **Enable Web Services**: Ensure the Pylon Application Server is running with the Web Services/REST module active.
2.  **Generate API Code**:
    *   Navigate to **Tools > Parameters > Connectivity > External Applications**.
    *   Create a new profile named "Shopify Bridge".
    *   Note the generated **API Code** (this is your `PYLON_API_KEY`).
3.  **Define Series**: Create a specific Series for E-shop orders (e.g., `E-SH`) to differentiate them from physical store sales.

### Phase 2: Network Setup (IT/Network Admin)

*Required only if Pylon is installed on-premises (Local Server).*

1.  **Static IP/DDNS**: Ensure your office has a Static Public IP or a stable Dynamic DNS (e.g., No-IP).
2.  **Port Forwarding**: Forward a chosen external port (e.g., `8443`) to the internal IP of the Pylon Server on the Web Service port (usually `8080`).
3.  **Security**: Configure your firewall to allow incoming traffic on the chosen port (ideally restricted to Firebase IP ranges).

### Phase 3: Environment Configuration

1.  Find your **Shopify Location ID**:
    *   Go to **Shopify Admin > Settings > Locations**.
    *   Click on your main location and copy the numeric ID from the end of the URL.
2.  Update the `functions/.env` file:

```bash
# Disable Mock Mode
PYLON_MOCK_MODE="false"

# API Credentials
PYLON_API_URL="https://your-public-address:8443/api/v1"
PYLON_API_KEY="your-pylon-api-code"

# Shopify Mapping
SHOPIFY_LOCATION_ID="123456789" # Your numeric Location ID

# Accounting Series
PYLON_INVOICE_SERIES="A"
PYLON_ORDER_SERIES="E-SH"
```

3.  **Deploy**:
    ```bash
    firebase deploy --only functions
    ```

### Synchronization Logic

| Feature | Trigger | Action |
|---------|---------|--------|
| **Orders** | `orders/paid` | Pushes Shopify order to Pylon as a "Sales Order" in Series `E-SH`. |
| **Invoicing** | Automated | Pylon converts the Sales Order into a Retail Receipt (MyData compliant). |
| **Returns** | `refunds/create`| Pushes a Credit Note (Πιστωτικό) to Pylon for returning items. |

### Handling Product Returns (Greece Compliance)

Since AADE compliance is handled by Pylon, the bridge must notify Pylon whenever a refund is issued in Shopify so a Credit Note can be generated.

1.  **Configure Webhook**:
    *   URL: `https://europe-west1-pavlicevits-9a889.cloudfunctions.net/shopify_refund_created`
    *   Event: **Refund creation**.
2.  **Environment Variable**:
    *   Ensure `PYLON_CREDIT_SERIES` is set in `functions/.env` (e.g., `PYLON_CREDIT_SERIES="ΠΙΣ"`).
3.  **Process**:
    *   When the shop owner issues a refund in Shopify Admin, the bridge automatically creates a matching **Credit Note** in Pylon.
    *   Accounting staff should then review and finalize the Credit Note in Pylon to transmit to AADE MyData.

---

## 9. Safe Testing Strategy (UAT)

To test the bridge without affecting your live production ERP database, follow this User Acceptance Testing (UAT) workflow.

### Step 1: Create a Sandbox Environment

1.  **Pylon Test Alias**: Ask your Pylon Admin to restore a backup of the production database to a new instance (e.g., `Pavlicevits_Test`) and create a **Database Alias** pointing to it.
2.  **Shopify Bogus Gateway**:
    *   In your Shopify Dev Store, go to **Settings > Payments**.
    *   Activate **"(for testing) Bogus Gateway"**. This allows you to simulate successful payments with card number `1`.

### Step 2: Configure the Bridge for Testing

Update `functions/.env` with the test credentials:

```bash
PYLON_MOCK_MODE="false" # Enable real API calls
PYLON_DATABASE_ALIAS="Pavlicevits_Test" # Point to the Sandbox
# Use same API URL/KEY as production unless you have a dedicated dev server
```

### Step 3: Execution Checklist

| Test Case | Procedure | Expected Result |
| :--- | :--- | :--- |
| **Product Push** | In Admin UI, approve a product for sync. | Product appears in Shopify (Drafts) with matching SKU/Price. |
| **B2C Transaction** | Buy an item on the storefront using Bogus Gateway. | Order appears in Pylon (Test Alias) under Series `E-SH`. |
| **B2B Transaction** | Buy an item and add a Company/VAT in checkout. | Order in Pylon includes the VAT/Tax ID in the customer profile. |
| **Stock Pull** | Update stock to `99` in Pylon Test Db manually. | After sync job runs, Shopify stock matches `99`. |
| **MyData Check** | (Optional) Check Pylon's MyData hub in the Test Db. | Ensure the order is "ready for transmission" with correct VAT. |

### How to Clean Up
After testing, simply:
1.  Set `PYLON_MOCK_MODE="true"` to stop sync.
2.  Alternatively, point `PYLON_DATABASE_ALIAS` back to `PRODUCTION` (usually named `DEFAULT` or `PYLON`) when you are ready to go live.
