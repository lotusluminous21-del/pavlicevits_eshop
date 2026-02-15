# 00_documentation_map.md

**Document Version:** 1.0
**Purpose:** Master index and usage instructions for the AI Coder Agent.
**Context:** This project is a Headless E-commerce Store (Next.js + Tailwind) using Shopify (Product Data/Checkout) and Firebase (User Auth/B2B Logic).

---

## 🚨 CRITICAL INSTRUCTION FOR AI AGENT

**Separation of Concerns:**
1.  **Style & Layout:** STRICTLY FOLLOW Docs `01`, `02`, `09`.
2.  **Data:** NEVER hardcode product data (prices, names, SKUs) found in the specs. All product data must be fetched dynamically via the APIs defined in `08`.
3.  **Copy:** Use Doc `10` for *static* UI elements (buttons, labels). Product descriptions come from the API.

---

## 🏗️ Technical Documentation Index

### Group A: The "Strict Rules" (Style, Structure & Logic)
*These documents define the immutable constraints of the codebase.*

| Doc ID | Filename | Content Summary | **Agent Instruction** |
| :--- | :--- | :--- | :--- |
| **01** | `01_brand_identity_design_system.md` | Colors, Typography, Spacing, Shadow tokens, Component specs (Buttons, Cards). | **STRICTLY FOLLOW.** Use these exact Tailwind classes and CSS variables. Do not invent new colors or spacing. |
| **02** | `02_information_architecture_navigation.md` | Sitemap, URL structure, Menu hierarchy, Breadcrumb logic. | **STRICTLY FOLLOW.** Implement the router and navigation components exactly as defined here. |
| **07** | `07_internationalization_spec.md` | Language config (EL/EN), URL routing, Translation keys, Date/Currency formatting. | **IMPLEMENT LOGIC.** Use this to set up the i18n framework. Use the JSON structures provided for your locale files. |
| **08** | `08_shopify_integration_guidelines.md` | GraphQL queries, Data schemas, Metafield definitions, Cart/Checkout logic. | **DATA BIBLE.** Use these exact queries to fetch data. Define TypeScript interfaces based on the schemas here. |

### Group B: The "Blueprints" (Layout & Features)
*These documents define WHAT to build. The content inside is MOCK DATA.*

| Doc ID | Filename | Content Summary | **Agent Instruction** |
| :--- | :--- | :--- | :--- |
| **04** | `04_feature_specifications.md` | Functional logic for Hero, Search, Filters, Color Finder, B2B Accounts. | **BUILD LOGIC.** Implement the functionality described. **IGNORE** specific product examples (e.g., "HB Body P961")—fetch real data instead. |
| **09** | `09_page_specifications.md` | Wireframes for Homepage, PLP, PDP, Cart, Account pages. | **BUILD LAYOUT.** Translate these ASCII wireframes into React components. Use the layout structure, but populate with dynamic API data. |
| **11** | `11_implementation_roadmap.md` | Step-by-step development phases. | **FOLLOW ORDER.** Execute tasks in this sequence to ensure dependencies are met. |

### Group C: The "Voice" (Static Content & UX)
*These documents guide the user experience and static text.*

| Doc ID | Filename | Content Summary | **Agent Instruction** |
| :--- | :--- | :--- | :--- |
| **05** | `05_seo_technical_specification.md` | Meta tags, Sitemap config, Schema markup, Core Web Vitals targets. | **IMPLEMENT TAGS.** Use these templates for `<head>` metadata and `sitemap.xml` generation. |
| **06** | `06_conversion_optimization.md` | UX patterns for trust, urgency, and funnel optimization. | **APPLY PATTERNS.** Use these guidelines when building UI transitions, empty states, and CTA placements. |
| **10** | `10_communications_copy_guidelines.md` | Brand voice, Error messages, Button labels, Email templates. | **COPY SOURCE.** Use this text for *static* UI elements (e.g., "Add to Cart", "404 Error"). Do *not* use for product descriptions. |

### Group D: Background Context (Non-Technical)
*Read only for understanding user intent.*

| Doc ID | Filename | Content Summary | **Agent Instruction** |
| :--- | :--- | :--- | :--- |
| **03** | `03_user_personas_journeys.md` | User profiles (B2B vs B2C) and flows. | **CONTEXT ONLY.** Use to understand *why* a feature exists, but do not use for code generation. |