# 11_implementation_roadmap.md

**Document Version:** 1.0
**Purpose:** Step-by-step execution plan for the Pavlicevits E-Shop.
**Base State:** Existing Next.js Repomix (Validate against Step 1.1).

---

## Phase 1: Foundation & Configuration (Days 1-3)
*Goal: Establish the Design System and API connections.*

### 1.1 Project Validation (vs. Repomix)
- [ ] **Audit:** Check current `tailwind.config.ts` against **Doc 01**. Update colors/fonts if they differ.
- [ ] **Audit:** Check folder structure (`app/`, `components/`, `lib/`) against **Doc 02** URL structure.
- [ ] **Task:** Install required dependencies (Lucide React, Headless UI, etc.) per **Doc 01**.

### 1.2 Design System Setup
- [ ] **Task:** Create `styles/globals.css` with CSS variables for colors/spacing (**Doc 01**, Sec 2 & 4).
- [ ] **Task:** Create base UI atoms: `Button`, `Input`, `Badge`, `Container` (**Doc 01**, Sec 11).
- [ ] **Task:** Set up font loading (Inter/Source Sans Pro) in `layout.tsx` (**Doc 01**, Sec 3).

### 1.3 API Layer Configuration
- [ ] **Task:** Create `lib/shopify.ts`. Implement the Shopify Client using **Doc 08**.
- [ ] **Task:** Create `types/shopify.ts`. Define TypeScript interfaces for Product, Variant, Cart based on **Doc 08**.
- [ ] **Task:** Initialize Firebase SDK in `lib/firebase.ts` (Auth, Firestore).

---

## Phase 2: Core Commerce Components (Days 4-7)
*Goal: Build the visual building blocks (The "Dumb" Components).*

### 2.1 Global UI Components
- [ ] **Task:** Build `Navbar` and `Footer` (**Doc 09**, Sec 1 & **Doc 02**, Sec 4).
- [ ] **Task:** Implement `MobileMenu` with animation (**Doc 01**, Sec 11.5).

### 2.2 Product Components
- [ ] **Task:** Build `ProductCard` (**Doc 01**, Sec 11.2).
    * *Constraint:* Must accept a `Product` interface prop.
    * *Constraint:* Must handle "Skeleton" loading state.
- [ ] **Task:** Build `PriceDisplay` component to handle currency formatting (**Doc 07**, Sec 6).
- [ ] **Task:** Build `StockIndicator` component (**Doc 06**, Sec 7.1).

### 2.3 Feature Components
- [ ] **Task:** Build `HeroSection` (**Doc 04**, Sec 1.1).
- [ ] **Task:** Build `TrustBar` (**Doc 04**, Sec 1.5).

---

## Phase 3: Data Integration & Dynamic Routing (Days 8-12)
*Goal: Connect components to real Shopify Data.*

### 3.1 Data Fetching Hooks
- [ ] **Task:** Create `hooks/useShopifyProducts.ts` using queries from **Doc 08**.
- [ ] **Task:** Create `hooks/useCart.ts` (Zustand store) wrapping Shopify Cart API (**Doc 08**, Sec 3.3).

### 3.2 Product Listing Pages (PLP)
- [ ] **Task:** Build `app/proionta/page.tsx` (Catalog).
- [ ] **Task:** Build `app/proionta/[category]/page.tsx` (**Doc 09**, Sec 2).
- [ ] **Task:** Implement `FilterSidebar` component (**Doc 04**, Sec 2.4).
    * *Logic:* Filters must be generated from available Product Tags/Metafields.

### 3.3 Product Detail Pages (PDP)
- [ ] **Task:** Build `app/proionta/[category]/[subcategory]/[handle]/page.tsx` (**Doc 09**, Sec 3).
- [ ] **Task:** Implement `ProductGallery` and `ProductInfo` sections.
- [ ] **Task:** Implement `RelatedProducts` logic (**Doc 02**, Sec 12.2).

---

## Phase 4: Specialized Features (Days 13-16)
*Goal: Implement the unique value propositions.*

### 4.1 Color Finder Tool
- [ ] **Task:** Build `app/vres-xroma/page.tsx` (**Doc 04**, Sec 4).
- [ ] **Task:** Implement `VINLookup` component (Connect to mocked API or Firebase Function placeholder).
- [ ] **Task:** Create `ManufacturerGuide` static pages (**Doc 04**, Sec 4.2).

### 4.2 Search & Discovery
- [ ] **Task:** Implement `SearchModal` with autocomplete (**Doc 04**, Sec 9).
- [ ] **Task:** Connect search bar to Shopify Storefront Search Query.

---

## Phase 5: User Accounts & B2B Logic (Days 17-20)
*Goal: Integrate Firebase Auth and B2B specific features.*

### 5.1 Authentication
- [ ] **Task:** Build `app/logariasmos/syndesmi/page.tsx` (Login) & Register page (**Doc 09**, Sec 7).
- [ ] **Task:** Implement Firebase Auth context provider.

### 5.2 Dashboard
- [ ] **Task:** Build `AccountDashboard` layout (**Doc 04**, Sec 8).
- [ ] **Task:** Implement `OrderHistory` (Fetch orders via Shopify Customer API using email match).

### 5.3 B2B Features
- [ ] **Task:** Implement "Wholesale Pricing" toggle.
    * *Logic:* If Firebase User has `role: 'b2b'`, apply discount logic defined in **Doc 04**, Sec 14.

---

## Phase 6: Polish & Optimization (Days 21-23)
*Goal: SEO, i18n, and Performance.*

### 6.1 SEO & Metadata
- [ ] **Task:** Implement `Metadata` generation for all dynamic pages using templates in **Doc 05**.
- [ ] **Task:** Add JSON-LD Schema (Product, Breadcrumb, LocalBusiness) (**Doc 05**, Sec 5).

### 6.2 Internationalization
- [ ] **Task:** Implement `middleware.ts` for locale detection (**Doc 07**, Sec 3.3).
- [ ] **Task:** Refactor static text to use `dictionaries/el.json` and `en.json`.

### 6.3 Performance
- [ ] **Task:** optimize images using `next/image` properties defined in **Doc 05**, Sec 6.2.
- [ ] **Task:** audit Core Web Vitals (LCP/CLS) and adjust loading states.

---

## Phase 7: Final QA & Launch Prep (Day 24+)

- [ ] **Test:** Full checkout flow (Guest & B2B).
- [ ] **Test:** Mobile responsiveness check.
- [ ] **Test:** 404 and Error pages.
- [ ] **Deploy:** Connect to Vercel/Netlify and configure Environment Variables.