# Pavlicevits E-Shop: Shopify Integration Guidelines

**Document Version:** 1.0  
**Date:** February 15, 2026  
**Status:** Final Specification  
**Purpose:** Technical guidelines for Shopify implementation with custom headless frontend

---

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Shopify Store Configuration](#2-shopify-store-configuration)
3. [Storefront API Integration](#3-storefront-api-integration)
4. [Product Data Structure](#4-product-data-structure)
5. [Collection & Category Mapping](#5-collection--category-mapping)
6. [Checkout Integration](#6-checkout-integration)
7. [Customer Accounts](#7-customer-accounts)
8. [Inventory Management](#8-inventory-management)
9. [Order Management](#9-order-management)
10. [Payment Integration](#10-payment-integration)
11. [Shipping Configuration](#11-shipping-configuration)
12. [App Recommendations](#12-app-recommendations)
13. [Migration & Data Import](#13-migration--data-import)

---

## 1. Architecture Overview

### 1.1 Headless Commerce Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Custom)                               │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Next.js / Remix / Hydrogen                                      │   │
│  │  - Custom React components                                       │   │
│  │  - Tailwind CSS styling                                          │   │
│  │  - Greek/English i18n                                            │   │
│  │  - Custom features (Color Finder, Calculator)                    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              │                                          │
│                              │ Storefront API (GraphQL)                 │
│                              ▼                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                         SHOPIFY BACKEND                                 │
│                                                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │  Products   │ │ Collections │ │  Checkout   │ │  Customers  │      │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘      │
│                                                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │   Orders    │ │  Inventory  │ │  Payments   │ │  Shipping   │      │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Admin API
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         INTEGRATIONS                                    │
│                                                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │ Viva Wallet │ │    ACS      │ │ AADE MyData │ │  Analytics  │      │
│  │  (Payment)  │ │  (Shipping) │ │ (Invoicing) │ │   (GA4)     │      │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 14+ / Hydrogen | React framework with SSR/SSG |
| Styling | Tailwind CSS | Utility-first CSS |
| State | Zustand / Jotai | Cart, user state |
| API | Storefront API | Product, collection, checkout |
| Admin | Admin API | Order, inventory, customer sync |
| Hosting | Vercel / Shopify Oxygen | Edge deployment |
| CDN | Cloudflare / Vercel Edge | Static assets, caching |

### 1.3 Shopify Plan Recommendation

**Recommended: Shopify Plus** or **Shopify Advanced**

| Feature | Basic | Shopify | Advanced | Plus |
|---------|-------|---------|----------|------|
| Storefront API | ✅ | ✅ | ✅ | ✅ |
| Checkout customization | Limited | Limited | Limited | ✅ Full |
| Multi-language | App | App | ✅ Native | ✅ Native |
| B2B features | ❌ | ❌ | Limited | ✅ |
| API rate limits | Low | Medium | High | Highest |
| Price | €29/mo | €79/mo | €289/mo | ~€2000/mo |

**Recommendation:** Start with **Advanced**, upgrade to **Plus** when B2B features needed.

---

## 2. Shopify Store Configuration

### 2.1 Store Settings

```yaml
Store Name: Pavlicevits
Primary Domain: pavlicevits.gr
Currency: EUR
Weight Unit: kg
Default Language: Greek (el)
Additional Languages: English (en)
Timezone: Europe/Athens
Tax Included: Yes (Greece requires VAT-inclusive pricing)
```

### 2.2 Markets Configuration

```yaml
Primary Market:
  Name: Greece
  Countries: Greece
  Currency: EUR
  Language: Greek
  Domain: pavlicevits.gr/

Secondary Market:
  Name: Europe (English)
  Countries: EU countries
  Currency: EUR
  Language: English
  Domain: pavlicevits.gr/en/
  Shipping: Varies by country
```

### 2.3 Tax Configuration

```yaml
Greece VAT:
  Standard Rate: 24%
  Reduced Rate: 13% (for certain goods)
  
Configuration:
  Tax Included: Yes
  Show Tax Breakdown: Yes
  Tax Registration: ΑΦΜ XXXXXXXXX
  
EU VAT (for cross-border):
  Use Shopify Tax: Yes
  Auto-calculate: Yes
```

---

## 3. Storefront API Integration

### 3.1 API Configuration

```typescript
// lib/shopify.ts
import { createStorefrontClient } from '@shopify/hydrogen-react';

const client = createStorefrontClient({
  storeDomain: 'pavlicevits.myshopify.com',
  publicStorefrontToken: process.env.SHOPIFY_STOREFRONT_TOKEN,
  storefrontApiVersion: '2024-01',
});

export const storefront = client.storefront;
```

### 3.2 Key Queries

**Fetch Products:**
```graphql
query GetProducts($first: Int!, $after: String, $query: String) {
  products(first: $first, after: $after, query: $query) {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      node {
        id
        handle
        title
        descriptionHtml
        vendor
        productType
        tags
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
          maxVariantPrice {
            amount
            currencyCode
          }
        }
        compareAtPriceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 5) {
          edges {
            node {
              url
              altText
              width
              height
            }
          }
        }
        variants(first: 10) {
          edges {
            node {
              id
              title
              sku
              price {
                amount
                currencyCode
              }
              compareAtPrice {
                amount
                currencyCode
              }
              availableForSale
              quantityAvailable
              selectedOptions {
                name
                value
              }
            }
          }
        }
        metafields(identifiers: [
          {namespace: "custom", key: "product_line"},
          {namespace: "custom", key: "product_type"},
          {namespace: "custom", key: "mixing_ratio"},
          {namespace: "custom", key: "coverage"},
          {namespace: "custom", key: "drying_time"},
          {namespace: "custom", key: "voc"},
          {namespace: "custom", key: "tds_url"},
          {namespace: "custom", key: "msds_url"}
        ]) {
          key
          value
          type
        }
        seo {
          title
          description
        }
      }
    }
  }
}
```

**Fetch Single Product:**
```graphql
query GetProduct($handle: String!, $language: LanguageCode) 
  @inContext(language: $language) {
  product(handle: $handle) {
    id
    handle
    title
    descriptionHtml
    vendor
    productType
    tags
    # ... (full product fields)
  }
}
```

**Fetch Collections:**
```graphql
query GetCollections($first: Int!) {
  collections(first: $first) {
    edges {
      node {
        id
        handle
        title
        description
        image {
          url
          altText
        }
        products(first: 4) {
          edges {
            node {
              id
              handle
              title
              # ... basic product fields
            }
          }
        }
      }
    }
  }
}
```

### 3.3 Cart Operations

```graphql
# Create Cart
mutation CreateCart($lines: [CartLineInput!]!) {
  cartCreate(input: { lines: $lines }) {
    cart {
      id
      checkoutUrl
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                price {
                  amount
                  currencyCode
                }
                product {
                  title
                  handle
                  images(first: 1) {
                    edges {
                      node {
                        url
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      cost {
        subtotalAmount {
          amount
          currencyCode
        }
        totalAmount {
          amount
          currencyCode
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}

# Add to Cart
mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
  cartLinesAdd(cartId: $cartId, lines: $lines) {
    cart {
      # ... cart fields
    }
    userErrors {
      field
      message
    }
  }
}

# Update Cart Line
mutation UpdateCartLine($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
  cartLinesUpdate(cartId: $cartId, lines: $lines) {
    cart {
      # ... cart fields
    }
  }
}

# Remove from Cart
mutation RemoveFromCart($cartId: ID!, $lineIds: [ID!]!) {
  cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
    cart {
      # ... cart fields
    }
  }
}
```

---

## 4. Product Data Structure

### 4.1 Product Metafields Schema

```typescript
const productMetafields = {
  // Technical specifications
  'custom.product_line': {
    type: 'single_line_text_field',
    name: 'Product Line',
    description: 'PRO, Series 6, Standard, etc.',
  },
  'custom.product_type_paint': {
    type: 'single_line_text_field',
    name: 'Paint Type',
    description: '1K, 2K, Spray',
  },
  'custom.mixing_ratio': {
    type: 'single_line_text_field',
    name: 'Mixing Ratio',
    description: '2:1, 4:1, etc.',
  },
  'custom.coverage': {
    type: 'single_line_text_field',
    name: 'Coverage',
    description: 'm²/L',
  },
  'custom.drying_time': {
    type: 'single_line_text_field',
    name: 'Drying Time',
    description: 'minutes or hours',
  },
  'custom.pot_life': {
    type: 'single_line_text_field',
    name: 'Pot Life',
    description: 'hours',
  },
  'custom.voc': {
    type: 'single_line_text_field',
    name: 'VOC',
    description: 'g/L',
  },
  'custom.solid_content': {
    type: 'single_line_text_field',
    name: 'Solid Content',
    description: 'percentage',
  },
  'custom.nozzle_size': {
    type: 'single_line_text_field',
    name: 'Nozzle Size',
    description: 'mm',
  },
  'custom.application_pressure': {
    type: 'single_line_text_field',
    name: 'Application Pressure',
    description: 'bar',
  },
  
  // Documents
  'custom.tds_url': {
    type: 'url',
    name: 'Technical Data Sheet URL',
    description: 'Link to TDS PDF',
  },
  'custom.tds_url_en': {
    type: 'url',
    name: 'Technical Data Sheet URL (English)',
    description: 'Link to English TDS PDF',
  },
  'custom.msds_url': {
    type: 'url',
    name: 'Safety Data Sheet URL',
    description: 'Link to MSDS PDF',
  },
  
  // Related products
  'custom.hardener_product': {
    type: 'product_reference',
    name: 'Compatible Hardener',
    description: 'Link to hardener product',
  },
  'custom.thinner_product': {
    type: 'product_reference',
    name: 'Compatible Thinner',
    description: 'Link to thinner product',
  },
  'custom.primer_products': {
    type: 'list.product_reference',
    name: 'Compatible Primers',
    description: 'List of compatible primer products',
  },
  
  // Color matching
  'custom.color_code': {
    type: 'single_line_text_field',
    name: 'Color Code',
    description: 'Manufacturer color code (e.g., LY9T)',
  },
  'custom.color_name': {
    type: 'single_line_text_field',
    name: 'Color Name',
    description: 'Color name (e.g., Oryx White Pearl)',
  },
  'custom.compatible_makes': {
    type: 'list.single_line_text_field',
    name: 'Compatible Makes',
    description: 'Car manufacturers this color is for',
  },
  
  // Translations
  'custom.description_en': {
    type: 'multi_line_text_field',
    name: 'Description (English)',
    description: 'English product description',
  },
  'custom.title_en': {
    type: 'single_line_text_field',
    name: 'Title (English)',
    description: 'English product title',
  },
};
```

### 4.2 Product Variant Options

```typescript
const variantOptions = {
  // Size options
  size: {
    name: 'Μέγεθος',
    nameEn: 'Size',
    values: [
      { value: '400ml', sortOrder: 1 },
      { value: '500ml', sortOrder: 2 },
      { value: '1L', sortOrder: 3 },
      { value: '2.5L', sortOrder: 4 },
      { value: '4L', sortOrder: 5 },
      { value: '5L', sortOrder: 6 },
      { value: '10L', sortOrder: 7 },
      { value: '20L', sortOrder: 8 },
    ],
  },
  
  // Kit options
  kit: {
    name: 'Τύπος',
    nameEn: 'Type',
    values: [
      { value: 'Μόνο Βάση', valueEn: 'Base Only' },
      { value: 'Σετ με Σκληρυντή', valueEn: 'Kit with Hardener' },
      { value: 'Πλήρες Σετ', valueEn: 'Complete Kit' },
    ],
  },
  
  // Color options (for colored products)
  color: {
    name: 'Χρώμα',
    nameEn: 'Color',
    values: [
      { value: 'Λευκό', valueEn: 'White' },
      { value: 'Μαύρο', valueEn: 'Black' },
      { value: 'Γκρι', valueEn: 'Grey' },
      // ... more colors
    ],
  },
};
```

### 4.3 Product Tags Strategy

```typescript
const productTags = {
  // Category tags (for filtering)
  category: [
    'paint', 'primer', 'clear-coat', 'spray', 'filler',
    'thinner', 'equipment', 'consumable',
  ],
  
  // Subcategory tags
  subcategory: [
    'basecoat', 'metallic', 'candy', 'pearl',
    'epoxy-primer', 'acrylic-primer', 'plastic-primer',
    '2k-clear', '1k-clear', 'hs-clear', 'matte-clear',
  ],
  
  // Product line tags
  productLine: [
    'pro-line', 'series-6', 'standard', 'economy',
  ],
  
  // Type tags
  type: [
    '1k', '2k', 'spray', 'solvent-based', 'water-based',
  ],
  
  // Feature tags
  features: [
    'fast-drying', 'high-solid', 'uv-resistant',
    'scratch-resistant', 'low-voc',
  ],
  
  // Marketing tags
  marketing: [
    'bestseller', 'new', 'professional', 'diy-friendly',
  ],
};
```

---

## 5. Collection & Category Mapping

### 5.1 Collection Structure

```typescript
const collections = {
  // Main categories
  main: [
    {
      handle: 'vafes',
      handleEn: 'paints',
      title: 'Βαφές',
      titleEn: 'Paints',
      rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'paint' }],
    },
    {
      handle: 'astaria',
      handleEn: 'primers',
      title: 'Αστάρια',
      titleEn: 'Primers',
      rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'primer' }],
    },
    {
      handle: 'vernikia',
      handleEn: 'clear-coats',
      title: 'Βερνίκια',
      titleEn: 'Clear Coats',
      rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'clear-coat' }],
    },
    // ... more categories
  ],
  
  // Subcategories (nested)
  subcategories: [
    {
      parent: 'vafes',
      handle: 'vases-aftokinitou',
      handleEn: 'automotive-paints',
      title: 'Βαφές Αυτοκινήτου',
      titleEn: 'Automotive Paints',
      rules: [
        { column: 'TAG', relation: 'EQUALS', condition: 'paint' },
        { column: 'TAG', relation: 'EQUALS', condition: 'automotive' },
      ],
    },
    {
      parent: 'vafes',
      handle: 'vases-spitio',
      handleEn: 'house-paints',
      title: 'Βαφές Σπιτιού',
      titleEn: 'House Paints',
      rules: [
        { column: 'TAG', relation: 'EQUALS', condition: 'paint' },
        { column: 'TAG', relation: 'EQUALS', condition: 'house' },
      ],
    },
    // ... more subcategories
  ],
  
  // Brand collections
  brands: [
    {
      handle: 'hb-body',
      title: 'HB Body',
      rules: [{ column: 'VENDOR', relation: 'EQUALS', condition: 'HB Body' }],
    },
    {
      handle: 'sikkens',
      title: 'Sikkens',
      rules: [{ column: 'VENDOR', relation: 'EQUALS', condition: 'Sikkens' }],
    },
    // ... more brands
  ],
  
  // Smart collections
  smart: [
    {
      handle: 'new-arrivals',
      handleEn: 'new-arrivals',
      title: 'Νέες Αφίξεις',
      titleEn: 'New Arrivals',
      rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'new' }],
      sortOrder: 'CREATED_DESC',
    },
    {
      handle: 'bestsellers',
      title: 'Δημοφιλή',
      titleEn: 'Bestsellers',
      rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'bestseller' }],
      sortOrder: 'BEST_SELLING',
    },
    {
      handle: 'offers',
      handleEn: 'offers',
      title: 'Προσφορές',
      titleEn: 'Offers',
      rules: [{ column: 'VARIANT_COMPARE_AT_PRICE', relation: 'IS_SET' }],
    },
  ],
};
```

### 5.2 Collection Metafields

```typescript
const collectionMetafields = {
  'custom.description_en': {
    type: 'multi_line_text_field',
    name: 'Description (English)',
  },
  'custom.seo_title_en': {
    type: 'single_line_text_field',
    name: 'SEO Title (English)',
  },
  'custom.seo_description_en': {
    type: 'multi_line_text_field',
    name: 'SEO Description (English)',
  },
  'custom.url_handle_en': {
    type: 'single_line_text_field',
    name: 'URL Handle (English)',
  },
  'custom.banner_image': {
    type: 'file_reference',
    name: 'Category Banner Image',
  },
};
```

---

## 6. Checkout Integration

### 6.1 Shopify Checkout (Recommended)

For initial launch, use Shopify's hosted checkout:

```typescript
// Redirect to Shopify Checkout
const goToCheckout = async (cartId: string) => {
  const { cart } = await storefront.query(GetCartQuery, { cartId });
  
  if (cart?.checkoutUrl) {
    // Add language parameter
    const checkoutUrl = new URL(cart.checkoutUrl);
    checkoutUrl.searchParams.set('locale', currentLocale);
    
    window.location.href = checkoutUrl.toString();
  }
};
```

### 6.2 Checkout Customization (Shopify Plus)

If using Shopify Plus, customize checkout.liquid:

```liquid
{% comment %} checkout.liquid customizations {% endcomment %}

{% section 'checkout-header' %}

{{ content_for_header }}

{% section 'checkout-contact-information' %}
{% section 'checkout-shipping-method' %}
{% section 'checkout-payment-method' %}

{% section 'checkout-footer' %}

{% comment %} Greek/English language {% endcomment %}
{% if checkout.locale == 'el' %}
  {% assign checkout_title = 'Ολοκλήρωση Παραγγελίας' %}
{% else %}
  {% assign checkout_title = 'Checkout' %}
{% endif %}
```

### 6.3 Cart Attributes for Custom Data

```typescript
// Add custom attributes to cart
const updateCartAttributes = async (cartId: string, attributes: CartAttribute[]) => {
  return await storefront.mutate(CartAttributesUpdateMutation, {
    cartId,
    attributes: [
      { key: 'customer_type', value: 'b2b' },
      { key: 'tax_id', value: userTaxId },
      { key: 'company_name', value: companyName },
      { key: 'order_notes', value: orderNotes },
    ],
  });
};
```

---

## 7. Customer Accounts

### 7.1 Customer API Integration

```graphql
# Create Customer
mutation CustomerCreate($input: CustomerCreateInput!) {
  customerCreate(input: $input) {
    customer {
      id
      email
      firstName
      lastName
      phone
      acceptsMarketing
    }
    customerUserErrors {
      field
      message
    }
  }
}

# Customer Login
mutation CustomerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
  customerAccessTokenCreate(input: $input) {
    customerAccessToken {
      accessToken
      expiresAt
    }
    customerUserErrors {
      field
      message
    }
  }
}

# Get Customer
query GetCustomer($customerAccessToken: String!) {
  customer(customerAccessToken: $customerAccessToken) {
    id
    email
    firstName
    lastName
    phone
    acceptsMarketing
    defaultAddress {
      id
      address1
      address2
      city
      province
      zip
      country
      phone
    }
    addresses(first: 10) {
      edges {
        node {
          id
          address1
          address2
          city
          province
          zip
          country
        }
      }
    }
    orders(first: 10) {
      edges {
        node {
          id
          orderNumber
          processedAt
          financialStatus
          fulfillmentStatus
          totalPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
}
```

### 7.2 Customer Metafields (B2B)

```typescript
const customerMetafields = {
  'custom.customer_type': {
    type: 'single_line_text_field',
    name: 'Customer Type',
    description: 'b2c, b2b_bronze, b2b_silver, b2b_gold, b2b_platinum',
  },
  'custom.tax_id': {
    type: 'single_line_text_field',
    name: 'Tax ID (ΑΦΜ)',
  },
  'custom.tax_office': {
    type: 'single_line_text_field',
    name: 'Tax Office (ΔΟΥ)',
  },
  'custom.company_name': {
    type: 'single_line_text_field',
    name: 'Company Name',
  },
  'custom.credit_limit': {
    type: 'number_decimal',
    name: 'Credit Limit',
  },
  'custom.payment_terms': {
    type: 'single_line_text_field',
    name: 'Payment Terms',
    description: 'net_30, net_60, prepaid',
  },
  'custom.discount_percentage': {
    type: 'number_decimal',
    name: 'Discount Percentage',
  },
};
```

---

## 8. Inventory Management

### 8.1 Inventory Configuration

```yaml
Inventory Settings:
  Track Inventory: Yes
  Continue Selling When Out of Stock: No (for most products)
  
Locations:
  - Name: Κατάστημα Καλαμαριάς
    Address: Οδός Καλαμαριάς XX, 551XX
    Type: Retail + Fulfillment
    
Fulfillment Priority:
  1. Κατάστημα Καλαμαριάς
```

### 8.2 Low Stock Alerts

```typescript
// Admin API: Get low stock products
const getLowStockProducts = async () => {
  const query = `
    query GetLowStockProducts {
      products(first: 100, query: "inventory_total:<10") {
        edges {
          node {
            id
            title
            totalInventory
            variants(first: 10) {
              edges {
                node {
                  id
                  sku
                  inventoryQuantity
                }
              }
            }
          }
        }
      }
    }
  `;
  
  return await adminClient.query(query);
};
```

---

## 9. Order Management

### 9.1 Order Webhooks

```typescript
// Webhook handlers
const webhookHandlers = {
  'orders/create': async (order) => {
    // Send to AADE MyData
    await sendToMyData(order);
    
    // Send notification email
    await sendOrderNotification(order);
    
    // Update analytics
    await trackPurchase(order);
  },
  
  'orders/paid': async (order) => {
    // Mark for fulfillment
    await markReadyForFulfillment(order);
  },
  
  'orders/fulfilled': async (order) => {
    // Send shipping notification
    await sendShippingNotification(order);
  },
  
  'orders/cancelled': async (order) => {
    // Process refund if needed
    // Update inventory
  },
};
```

### 9.2 Order Metafields

```typescript
const orderMetafields = {
  'custom.invoice_number': {
    type: 'single_line_text_field',
    name: 'Invoice Number',
  },
  'custom.mydata_mark': {
    type: 'single_line_text_field',
    name: 'AADE MyData Mark',
  },
  'custom.tracking_number': {
    type: 'single_line_text_field',
    name: 'Tracking Number',
  },
  'custom.courier': {
    type: 'single_line_text_field',
    name: 'Courier Service',
  },
};
```

---

## 10. Payment Integration

### 10.1 Payment Gateway Configuration

```yaml
Primary Gateway: Viva Wallet (Greece)
  - Credit/Debit Cards
  - Apple Pay
  - Google Pay
  
Secondary Gateways:
  - PayPal
  - Manual (Bank Transfer)
  - Manual (Cash on Delivery)
```

### 10.2 Viva Wallet Setup

```typescript
// Viva Wallet configuration
const vivaWalletConfig = {
  merchantId: process.env.VIVA_MERCHANT_ID,
  apiKey: process.env.VIVA_API_KEY,
  clientId: process.env.VIVA_CLIENT_ID,
  clientSecret: process.env.VIVA_CLIENT_SECRET,
  
  environment: 'production', // or 'demo'
  
  supportedMethods: [
    'card',
    'apple_pay',
    'google_pay',
  ],
};
```

### 10.3 Payment Methods Display

```typescript
const paymentMethods = [
  {
    id: 'viva_wallet',
    name: { el: 'Κάρτα', en: 'Card' },
    icon: ['visa', 'mastercard', 'maestro'],
    fee: 0,
    description: {
      el: 'Πιστωτική ή χρεωστική κάρτα',
      en: 'Credit or debit card',
    },
  },
  {
    id: 'paypal',
    name: { el: 'PayPal', en: 'PayPal' },
    icon: 'paypal',
    fee: 0,
    description: {
      el: 'Πληρώστε με τον λογαριασμό PayPal σας',
      en: 'Pay with your PayPal account',
    },
  },
  {
    id: 'bank_transfer',
    name: { el: 'Τραπεζική Μεταφορά', en: 'Bank Transfer' },
    icon: 'bank',
    fee: 0,
    description: {
      el: 'Η παραγγελία αποστέλλεται μετά την πίστωση',
      en: 'Order ships after payment confirmation',
    },
  },
  {
    id: 'cod',
    name: { el: 'Αντικαταβολή', en: 'Cash on Delivery' },
    icon: 'cash',
    fee: 2.50,
    maxAmount: 200,
    description: {
      el: 'Πληρωμή κατά την παράδοση (+€2.50)',
      en: 'Pay on delivery (+€2.50)',
    },
  },
];
```

---

## 11. Shipping Configuration

### 11.1 Shipping Zones & Rates

```yaml
Zone 1: Thessaloniki
  Countries: Greece
  Postal Codes: 54xxx, 55xxx, 56xxx, 57xxx
  Rates:
    - Standard (ACS): €3.50 (Free over €50)
    - Same-day: €5.90 (cutoff 14:00)
    - Store Pickup: Free

Zone 2: Rest of Greece
  Countries: Greece
  Rates:
    - Standard (ACS): €4.50 (Free over €50)
    - Express (ACS): €8.90

Zone 3: Cyprus
  Countries: Cyprus
  Rates:
    - Standard: €12.00
    - Express: €18.00

Zone 4: EU
  Countries: Austria, Belgium, Bulgaria, ...
  Rates:
    - Standard: €15.00-25.00 (varies by country)
```

### 11.2 Carrier Service Integration

```typescript
// ACS Courier integration
const acsConfig = {
  apiKey: process.env.ACS_API_KEY,
  username: process.env.ACS_USERNAME,
  password: process.env.ACS_PASSWORD,
  
  services: {
    standard: 'ACS_STANDARD',
    express: 'ACS_EXPRESS',
    sameday: 'ACS_SAMEDAY',
  },
  
  labelFormat: 'PDF',
  
  webhooks: {
    tracking: '/webhooks/acs/tracking',
  },
};

// Create shipment
const createACSShipment = async (order) => {
  const shipment = await acsClient.createShipment({
    senderAddress: storeAddress,
    recipientAddress: order.shippingAddress,
    packages: calculatePackages(order.lineItems),
    service: getServiceType(order),
    cod: order.paymentGateway === 'cod' ? order.totalPrice : null,
  });
  
  return shipment;
};
```

---

## 12. App Recommendations

### 12.1 Essential Apps

| App | Purpose | Priority |
|-----|---------|----------|
| **Langify** or **Weglot** | Multi-language | Critical |
| **Judge.me** | Reviews | High |
| **Klaviyo** | Email marketing | High |
| **ACS Courier** | Shipping integration | High |
| **MyData Greece** | AADE invoicing | Critical |
| **Gorgias** or **Tidio** | Customer support | Medium |
| **Recharge** | Recurring orders (B2B) | Low |
| **Shopify Flow** | Automation | Medium |

### 12.2 Custom App Development

```typescript
// Custom Shopify App for Color Finder
const colorFinderApp = {
  name: 'Pavlicevits Color Finder',
  
  endpoints: {
    '/api/colors/vin-lookup': {
      method: 'POST',
      description: 'Lookup color by VIN',
    },
    '/api/colors/code-search': {
      method: 'GET',
      description: 'Search by color code',
    },
    '/api/colors/products': {
      method: 'GET',
      description: 'Get products for color code',
    },
  },
  
  database: {
    colorCodes: 'Vehicle color codes',
    vinData: 'VIN lookup cache',
    productMappings: 'Color to product mappings',
  },
};
```

---

## 13. Migration & Data Import

### 13.1 Product Import Format

```csv
Handle,Title,Body (HTML),Vendor,Product Category,Type,Tags,Published,Option1 Name,Option1 Value,Variant SKU,Variant Price,Variant Compare At Price,Variant Inventory Qty,Image Src,Image Alt Text,Metafield: custom.product_line,Metafield: custom.mixing_ratio
hb-body-p961-clear-coat-2k,"HB Body P961 Clear Coat 2K HS","<p>Βερνίκι υψηλών στερεών...</p>",HB Body,Automotive > Paint > Clear Coat,clear-coat,"clear-coat, 2k, hs, bestseller",TRUE,Μέγεθος,1L,HB-P961-1L,39.90,49.90,25,https://hbbody.com/wp-content/uploads/2023/12/WEB-961P00-1-1024x1024.png Body P961 Clear Coat 2K 1L",PRO,2:1
hb-body-p961-clear-coat-2k,,,,,,,,Μέγεθος,4L,HB-P961-4L,129.90,159.90,10,https://i.ebayimg.com/00/s/MTYwMFgxNDM2/z/UAwAAOSwgd1ax85e/$_12.JPG?set_id=880000500F Body P961 Clear Coat 2K 4L",,
```

### 13.2 Migration Checklist

```markdown
## Pre-Migration
- [ ] Export all products from current system
- [ ] Map categories to Shopify collections
- [ ] Prepare product images (optimized)
- [ ] Create metafield definitions
- [ ] Set up translations

## Migration
- [ ] Import products via CSV
- [ ] Import customers (if existing)
- [ ] Set up collections
- [ ] Configure shipping rates
- [ ] Configure payment gateways
- [ ] Set up tax rates

## Post-Migration
- [ ] Verify all products imported correctly
- [ ] Test checkout flow
- [ ] Test payment processing
- [ ] Verify shipping calculations
- [ ] Test email notifications
- [ ] Set up redirects from old URLs
```

### 13.3 Data Sync Strategy

```typescript
// Continuous sync for inventory updates
const inventorySync = {
  source: 'ERP_SYSTEM', // or manual
  frequency: 'every_15_minutes',
  
  sync: async () => {
    // Fetch inventory from source
    const inventory = await erpClient.getInventory();
    
    // Update Shopify
    for (const item of inventory) {
      await shopifyAdmin.inventoryLevel.set({
        inventoryItemId: item.shopifyInventoryId,
        locationId: primaryLocationId,
        available: item.quantity,
      });
    }
  },
};
```

---

## Appendix: API Rate Limits

### Storefront API

| Plan | Rate Limit |
|------|------------|
| Basic/Shopify | 50 calls/second |
| Advanced | 100 calls/second |
| Plus | 200 calls/second |

### Admin API

| Plan | Rate Limit |
|------|------------|
| Basic | 2 calls/second |
| Shopify | 4 calls/second |
| Advanced | 8 calls/second |
| Plus | 20 calls/second |

### Best Practices

```typescript
// Implement rate limiting
const rateLimiter = {
  maxRetries: 3,
  backoffMs: 1000,
  
  async request(fn: () => Promise<any>) {
    for (let i = 0; i < this.maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (error.code === 'THROTTLED') {
          await sleep(this.backoffMs * Math.pow(2, i));
        } else {
          throw error;
        }
      }
    }
  },
};
```

---

*Document prepared by DeepAgent | February 2026*  
*For Pavlicevits E-Shop Blueprint Development*
