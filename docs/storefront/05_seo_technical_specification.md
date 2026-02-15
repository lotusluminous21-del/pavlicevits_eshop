# Pavlicevits E-Shop: SEO & Technical Specification

**Document Version:** 1.0  
**Date:** February 15, 2026  
**Status:** Final Specification  
**Purpose:** SEO strategy, technical SEO requirements, and performance specifications

---

## Table of Contents
1. [SEO Strategy Overview](#1-seo-strategy-overview)
2. [Keyword Strategy](#2-keyword-strategy)
3. [On-Page SEO](#3-on-page-seo)
4. [Technical SEO](#4-technical-seo)
5. [Schema Markup (Structured Data)](#5-schema-markup-structured-data)
6. [Core Web Vitals & Performance](#6-core-web-vitals--performance)
7. [Sitemap & Indexing](#7-sitemap--indexing)
8. [Local SEO](#8-local-seo)
9. [Content SEO Strategy](#9-content-seo-strategy)
10. [E-Commerce SEO](#10-e-commerce-seo)
11. [Analytics & Tracking](#11-analytics--tracking)
12. [SEO Maintenance Checklist](#12-seo-maintenance-checklist)

---

## 1. SEO Strategy Overview

### 1.1 SEO Goals

| Goal | Target | Timeline |
|------|--------|----------|
| Organic traffic growth | +50% in 12 months | Year 1 |
| Greek keyword rankings (Top 10) | 100 keywords | 6 months |
| Local pack visibility | Position 1-3 for Thessaloniki | 3 months |
| Product page indexation | 95% of products indexed | 2 months |
| Core Web Vitals | All "Good" scores | Launch |

### 1.2 Target Audience Search Intent

| Intent Type | Example Queries | Page Type |
|-------------|-----------------|-----------|
| **Navigational** | "pavlicevits", "hb body thessaloniki" | Homepage, Brand pages |
| **Informational** | "πώς να βάψω αυτοκίνητο", "τι είναι 2k βερνίκι" | Guides, Blog |
| **Commercial** | "καλύτερο clear coat 2k", "σύγκριση αστάρια" | Category, Comparison |
| **Transactional** | "αγορά spray βαφής", "hb body p961 τιμή" | Product pages |

### 1.3 Competitive Landscape

**Primary Greek Competitors:**
- autoservice.gr
- motogroup.gr  
- paintcorner.gr
- chroma.com.gr

**Strategy:** Focus on local (Thessaloniki) + technical expertise + Greek content

---

## 2. Keyword Strategy

### 2.1 Primary Keywords (High Priority)

| Greek Keyword | English Equivalent | Monthly Searches | Difficulty | Target Page |
|---------------|-------------------|------------------|------------|-------------|
| βαφή αυτοκινήτου | car paint | 1,200 | Medium | Category |
| spray βαφής | paint spray | 2,900 | Low | Category |
| βερνίκι αυτοκινήτου | car clear coat | 590 | Medium | Category |
| αστάρι αυτοκινήτου | car primer | 480 | Low | Category |
| hb body | HB Body | 880 | Low | Brand page |
| χρώμα αυτοκινήτου κωδικός | car color code | 320 | Low | Color Finder |

### 2.2 Long-Tail Keywords

| Keyword | Intent | Target Page |
|---------|--------|-------------|
| πώς να βάψω γρατσουνιά αυτοκινήτου | Informational | Guide article |
| τιμή βαφής αυτοκινήτου θεσσαλονίκη | Commercial | Service page |
| hb body p961 τιμή | Transactional | Product page |
| spray βαφής μαύρο ματ | Transactional | Product category |
| διαλυτικό ακρυλικής βαφής | Transactional | Product category |
| που βρίσκεται ο κωδικός χρώματος vw | Informational | Color guide |

### 2.3 Keyword Mapping

```
Homepage: βαφές αυτοκινήτου, χρώματα βαφής, pavlicevits

/proionta/vafes/
  Primary: βαφές αυτοκινήτου, automotive paints
  Secondary: επαγγελματικές βαφές, βαφές οχημάτων

/proionta/vafes/vases-aftokinitou/
  Primary: βαφή βάσης αυτοκινήτου, basecoat
  Secondary: 1k βαφή, 2k βαφή, metallic βαφή

/proionta/spray/
  Primary: spray βαφής, βαφή spray
  Secondary: spray αυτοκινήτου, σπρέι βαφής

/vres-xroma/
  Primary: κωδικός χρώματος αυτοκινήτου, χρώμα αυτοκινήτου
  Secondary: βρες χρώμα vin, κωδικός βαφής

/markes/hb-body/
  Primary: hb body, hb body greece
  Secondary: hb body προϊόντα, hb body τιμές
```

---

## 3. On-Page SEO

### 3.1 Title Tag Templates

```typescript
const titleTemplates = {
  homepage: {
    el: 'Pavlicevits | Χρώματα & Βερνίκια Αυτοκινήτου | Θεσσαλονίκη',
    en: 'Pavlicevits | Automotive Paints & Coatings | Thessaloniki',
    maxLength: 60,
  },
  
  category: {
    el: '{Category} | Pavlicevits - Βαφές & Αξεσουάρ',
    en: '{Category} | Pavlicevits - Paints & Accessories',
    example: 'Βαφές Αυτοκινήτου | Pavlicevits - Βαφές & Αξεσουάρ',
  },
  
  product: {
    el: '{Product Name} | {Brand} | Pavlicevits',
    en: '{Product Name} | {Brand} | Pavlicevits',
    example: 'P961 Clear Coat 2K HS | HB Body | Pavlicevits',
  },
  
  brand: {
    el: '{Brand} Προϊόντα | Pavlicevits - Επίσημος Διανομέας',
    en: '{Brand} Products | Pavlicevits - Official Distributor',
  },
  
  blog: {
    el: '{Title} | Blog | Pavlicevits',
    en: '{Title} | Blog | Pavlicevits',
  },
  
  colorFinder: {
    el: 'Βρείτε τον Κωδικό Χρώματος | Pavlicevits',
    en: 'Find Your Color Code | Pavlicevits',
  },
};
```

### 3.2 Meta Description Templates

```typescript
const metaDescriptionTemplates = {
  homepage: {
    el: 'Βαφές, βερνίκια και αξεσουάρ αυτοκινήτου στη Θεσσαλονίκη. 40+ χρόνια εμπειρίας. Δωρεάν αποστολή άνω €50. HB Body, Sikkens, 3M. ☎ 2310-XXX-XXX',
    maxLength: 155,
  },
  
  category: {
    el: 'Ανακαλύψτε {category} από τις καλύτερες μάρκες. {product_count} προϊόντα σε απόθεμα. Δωρεάν αποστολή. Τεχνική υποστήριξη. Παράδοση σε 1-3 ημέρες.',
    example: 'Ανακαλύψτε βαφές αυτοκινήτου από τις καλύτερες μάρκες. 156 προϊόντα σε απόθεμα. Δωρεάν αποστολή. Τεχνική υποστήριξη. Παράδοση σε 1-3 ημέρες.',
  },
  
  product: {
    el: '{Product Name} από {Brand}. {Short description}. Τιμή: €{price}. Άμεσα διαθέσιμο. Δωρεάν αποστολή άνω €50.',
    example: 'P961 Clear Coat 2K HS από HB Body. Βερνίκι υψηλών στερεών 2:1. Τιμή: €39.90. Άμεσα διαθέσιμο. Δωρεάν αποστολή άνω €50.',
  },
  
  brand: {
    el: 'Προϊόντα {Brand} στην Ελλάδα. Επίσημος διανομέας. Βαφές, αστάρια, βερνίκια και αξεσουάρ. Αγοράστε online με δωρεάν αποστολή.',
  },
};
```

### 3.3 Heading Structure (H1-H6)

```html
<!-- Homepage -->
<h1>Χρώματα & Βερνίκια Αυτοκινήτου</h1>
<h2>Κατηγορίες Προϊόντων</h2>
<h2>Δημοφιλή Προϊόντα</h2>
<h2>Βρείτε το Χρώμα σας</h2>
<h2>Γιατί Pavlicevits</h2>

<!-- Category Page -->
<h1>Βαφές Αυτοκινήτου</h1>
<h2>Υποκατηγορίες</h2>
<h3>Βαφές Βάσης</h3>
<h3>Metallic Βαφές</h3>
<h2>Δημοφιλείς Μάρκες</h2>
<h2>Οδηγοί & Συμβουλές</h2>

<!-- Product Page -->
<h1>HB Body P961 Clear Coat 2K HS 1L</h1>
<h2>Περιγραφή Προϊόντος</h2>
<h2>Τεχνικά Χαρακτηριστικά</h2>
<h2>Οδηγίες Εφαρμογής</h2>
<h2>Αξιολογήσεις Πελατών</h2>
<h2>Σχετικά Προϊόντα</h2>
```

### 3.4 Image SEO

```typescript
interface ImageSEO {
  naming: {
    format: '{brand}-{product-name}-{variant}.webp';
    example: 'hb-body-p961-clear-coat-2k-1l.webp';
    avoidNumbers: true;
    useDashes: true;
  };
  
  altText: {
    product: '{Brand} {Product Name} - {Variant} | Pavlicevits';
    example: 'HB Body P961 Clear Coat 2K - 1L | Pavlicevits';
    maxLength: 125;
  };
  
  optimization: {
    format: 'webp';
    fallback: 'jpeg';
    quality: 85;
    maxDimensions: {
      thumbnail: { width: 400, height: 400 };
      gallery: { width: 800, height: 800 };
      zoom: { width: 1600, height: 1600 };
    };
    lazyLoading: true;
    srcset: true;
  };
}
```

### 3.5 Internal Linking Strategy

```typescript
const internalLinkingRules = {
  productPage: {
    breadcrumbs: true,
    relatedProducts: 4,
    complementaryProducts: 4,
    categoryLink: true,
    brandLink: true,
    howToGuide: 'if_exists',
  },
  
  categoryPage: {
    breadcrumbs: true,
    subcategories: 'all',
    topProducts: 6,
    relatedCategories: 3,
    brandFilters: 'linked',
  },
  
  blogPost: {
    relatedPosts: 3,
    productMentions: 'linked_to_product_page',
    categoryMentions: 'linked_to_category',
    ctaToProducts: true,
  },
  
  anchorTextVariation: {
    exact: 30, // %
    partial: 40,
    branded: 20,
    natural: 10,
  },
};
```

---

## 4. Technical SEO

### 4.1 URL Structure

```
✅ Good URLs:
/proionta/vafes/
/proionta/vafes/vases-aftokinitou/
/proionta/vafes/vases-aftokinitou/hb-body-p961-clear-coat-2k/
/markes/hb-body/
/vres-xroma/anazhthsh-vin/

❌ Bad URLs:
/products?category=123&subcategory=456
/p/12345
/collections/all?filter.v.vendor=HB+Body
```

### 4.2 Canonical Tags

```html
<!-- Product page (main) -->
<link rel="canonical" href="https://pavlicevits.gr/proionta/vafes/vases-aftokinitou/hb-body-p961/" />

<!-- Product page with variant (canonical to main) -->
<link rel="canonical" href="https://pavlicevits.gr/proionta/vafes/vases-aftokinitou/hb-body-p961/" />

<!-- Category page with filters (canonical to unfiltered) -->
<link rel="canonical" href="https://pavlicevits.gr/proionta/vafes/" />

<!-- Category page with pagination -->
<link rel="canonical" href="https://pavlicevits.gr/proionta/vafes/" />
<!-- Plus pagination hints: -->
<link rel="prev" href="https://pavlicevits.gr/proionta/vafes/?page=1" />
<link rel="next" href="https://pavlicevits.gr/proionta/vafes/?page=3" />
```

### 4.3 Robots.txt

```
# Pavlicevits Robots.txt
User-agent: *

# Allow all content except checkout and account
Allow: /

# Disallow checkout and account pages
Disallow: /checkout/
Disallow: /kalathi/
Disallow: /logariasmos/
Disallow: /api/
Disallow: /admin/

# Disallow filtered pages (prevent duplicate content)
Disallow: /*?*sort=
Disallow: /*?*filter=
Disallow: /*?*page=2
Disallow: /*?*page=3

# Allow CSS and JS for rendering
Allow: /*.css$
Allow: /*.js$
Allow: /*.jpg$
Allow: /*.png$
Allow: /*.webp$

# Sitemap location
Sitemap: https://pavlicevits.gr/sitemap.xml
Sitemap: https://pavlicevits.gr/sitemap-products.xml
Sitemap: https://pavlicevits.gr/sitemap-categories.xml
Sitemap: https://pavlicevits.gr/sitemap-pages.xml
```

### 4.4 Hreflang Tags

```html
<!-- Greek (default) page -->
<link rel="alternate" hreflang="el" href="https://pavlicevits.gr/proionta/vafes/" />
<link rel="alternate" hreflang="en" href="https://pavlicevits.gr/en/products/paints/" />
<link rel="alternate" hreflang="x-default" href="https://pavlicevits.gr/proionta/vafes/" />

<!-- English page -->
<link rel="alternate" hreflang="el" href="https://pavlicevits.gr/proionta/vafes/" />
<link rel="alternate" hreflang="en" href="https://pavlicevits.gr/en/products/paints/" />
<link rel="alternate" hreflang="x-default" href="https://pavlicevits.gr/proionta/vafes/" />
```

### 4.5 Redirect Rules

```nginx
# Trailing slash normalization (redirect to non-trailing)
rewrite ^(.+)/$ $1 permanent;

# WWW to non-WWW
server {
    server_name www.pavlicevits.gr;
    return 301 https://pavlicevits.gr$request_uri;
}

# HTTP to HTTPS
server {
    listen 80;
    server_name pavlicevits.gr;
    return 301 https://pavlicevits.gr$request_uri;
}

# Old URL redirects (if migrating from old site)
location /products {
    rewrite ^/products(.*)$ /proionta$1 permanent;
}

# 404 to search
error_page 404 /404.html;
```

### 4.6 HTTP Headers

```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com;" always;

# Caching
location ~* \.(jpg|jpeg|png|gif|webp|ico|css|js|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location ~* \.(html)$ {
    expires 1h;
    add_header Cache-Control "public, must-revalidate";
}
```

---

## 5. Schema Markup (Structured Data)

### 5.1 Organization Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Pavlicevits",
  "alternateName": "Παυλιτσεβιτς",
  "url": "https://pavlicevits.gr",
  "logo": "https://yt3.googleusercontent.com/UosbqSMTZiWg7ZnHL9TostPNyE0mjPF8ntLurzrdGCVEltyXxbqxzgtQtVk8lA8c7GlP1pJ2=s900-c-k-c0x00ffffff-no-rj",
  "description": "Χρώματα, βερνίκια και αξεσουάρ αυτοκινήτου στη Θεσσαλονίκη από το 1985",
  "foundingDate": "1985",
  "founders": [
    {
      "@type": "Person",
      "name": "Pavlicevits Family"
    }
  ],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Οδός Καλαμαριάς XX",
    "addressLocality": "Καλαμαριά",
    "addressRegion": "Θεσσαλονίκη",
    "postalCode": "551XX",
    "addressCountry": "GR"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+30-2310-XXX-XXX",
    "contactType": "customer service",
    "availableLanguage": ["Greek", "English"]
  },
  "sameAs": [
    "https://www.facebook.com/pavlicevits",
    "https://www.instagram.com/pavlicevits"
  ]
}
```

### 5.2 LocalBusiness Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Store",
  "name": "Pavlicevits",
  "image": "https://i.pinimg.com/736x/73/26/62/7326628f913d675dba50fb8f9c9e511b.jpg",
  "url": "https://pavlicevits.gr",
  "telephone": "+30-2310-XXX-XXX",
  "priceRange": "€€",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Οδός Καλαμαριάς XX",
    "addressLocality": "Καλαμαριά",
    "addressRegion": "Θεσσαλονίκη",
    "postalCode": "551XX",
    "addressCountry": "GR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "40.XXXXXX",
    "longitude": "22.XXXXXX"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "18:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Saturday",
      "opens": "09:00",
      "closes": "14:00"
    }
  ],
  "hasMap": "https://www.google.com/maps?cid=XXXXXXX"
}
```

### 5.3 Product Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "HB Body P961 Clear Coat 2K HS 1L",
  "image": [
    "https://i.ebayimg.com/images/g/ELwAAOSwgetnjcME/s-l1200.jpg",
    "https://hbbody.com/wp-content/uploads/2023/06/WEB-699000.png-500x500.png"
  ],
  "description": "Βερνίκι υψηλών στερεών 2K για επαγγελματική χρήση. Αναλογία μίξης 2:1 με σκληρυντή P962.",
  "sku": "HB-P961-1L",
  "mpn": "P961",
  "brand": {
    "@type": "Brand",
    "name": "HB Body"
  },
  "manufacturer": {
    "@type": "Organization",
    "name": "HB Body"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://pavlicevits.gr/proionta/vernikia/hb-body-p961/",
    "priceCurrency": "EUR",
    "price": "39.90",
    "priceValidUntil": "2026-12-31",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition",
    "seller": {
      "@type": "Organization",
      "name": "Pavlicevits"
    },
    "shippingDetails": {
      "@type": "OfferShippingDetails",
      "shippingRate": {
        "@type": "MonetaryAmount",
        "value": "4.50",
        "currency": "EUR"
      },
      "shippingDestination": {
        "@type": "DefinedRegion",
        "addressCountry": "GR"
      },
      "deliveryTime": {
        "@type": "ShippingDeliveryTime",
        "handlingTime": {
          "@type": "QuantitativeValue",
          "minValue": "1",
          "maxValue": "2",
          "unitCode": "DAY"
        },
        "transitTime": {
          "@type": "QuantitativeValue",
          "minValue": "1",
          "maxValue": "3",
          "unitCode": "DAY"
        }
      }
    },
    "hasMerchantReturnPolicy": {
      "@type": "MerchantReturnPolicy",
      "applicableCountry": "GR",
      "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
      "merchantReturnDays": "14",
      "returnMethod": "https://schema.org/ReturnByMail",
      "returnFees": "https://schema.org/FreeReturn"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": "23"
  },
  "review": [
    {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      },
      "author": {
        "@type": "Person",
        "name": "Γιώργος Π."
      },
      "reviewBody": "Εξαιρετικό βερνίκι με γυαλάδα και αντοχή."
    }
  ]
}
```

### 5.4 BreadcrumbList Schema

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Αρχική",
      "item": "https://pavlicevits.gr"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Προϊόντα",
      "item": "https://pavlicevits.gr/proionta/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Βερνίκια",
      "item": "https://pavlicevits.gr/proionta/vernikia/"
    },
    {
      "@type": "ListItem",
      "position": 4,
      "name": "HB Body P961 Clear Coat 2K HS"
    }
  ]
}
```

### 5.5 FAQ Schema (for FAQ pages)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Ποια είναι η διαφορά μεταξύ 1K και 2K βερνικιού;",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Το 1K βερνίκι στεγνώνει με εξάτμιση διαλύτη, ενώ το 2K απαιτεί σκληρυντή και προσφέρει μεγαλύτερη αντοχή και γυαλάδα."
      }
    },
    {
      "@type": "Question",
      "name": "Πώς βρίσκω τον κωδικό χρώματος του αυτοκινήτου μου;",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ο κωδικός χρώματος βρίσκεται συνήθως σε μια ετικέτα στην κάσα της πόρτας του οδηγού ή στο καπό. Μπορείτε επίσης να χρησιμοποιήσετε τον αριθμό πλαισίου (VIN) στο εργαλείο μας."
      }
    }
  ]
}
```

### 5.6 HowTo Schema (for guides)

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "Πώς να βάψετε μια γρατσουνιά στο αυτοκίνητο",
  "description": "Οδηγός βήμα-βήμα για επισκευή γρατσουνιών αυτοκινήτου με spray βαφής",
  "totalTime": "PT2H",
  "estimatedCost": {
    "@type": "MonetaryAmount",
    "currency": "EUR",
    "value": "30"
  },
  "supply": [
    { "@type": "HowToSupply", "name": "Spray βαφής με τον κωδικό χρώματος" },
    { "@type": "HowToSupply", "name": "Spray αστάρι" },
    { "@type": "HowToSupply", "name": "Spray βερνίκι" },
    { "@type": "HowToSupply", "name": "Γυαλόχαρτο P800" }
  ],
  "tool": [
    { "@type": "HowToTool", "name": "Masking tape" },
    { "@type": "HowToTool", "name": "Πανί καθαρισμού" }
  ],
  "step": [
    {
      "@type": "HowToStep",
      "name": "Καθαρισμός",
      "text": "Καθαρίστε την επιφάνεια με απολιπαντικό",
      "image": "https://www.monogramcleanforce.com/-/media/Monogram/Images/Product-Resources/MCF-All-Surface-Floor-Cleaner_Cleaning-Procedures_54208.ashx?la=en&h=738&w=570&mw=570&hash=F697AA07E19B8F683655742750FF133A"
    },
    {
      "@type": "HowToStep",
      "name": "Τρίψιμο",
      "text": "Τρίψτε την περιοχή με γυαλόχαρτο P800",
      "image": "https://i.ytimg.com/vi/Ll1gPb28lDk/sddefault.jpg"
    }
  ]
}
```

---

## 6. Core Web Vitals & Performance

### 6.1 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **LCP** (Largest Contentful Paint) | < 2.5s | Good |
| **FID** (First Input Delay) | < 100ms | Good |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Good |
| **TTFB** (Time to First Byte) | < 600ms | - |
| **FCP** (First Contentful Paint) | < 1.8s | - |
| **Speed Index** | < 3.4s | - |

### 6.2 Image Optimization

```typescript
interface ImageOptimization {
  formats: {
    primary: 'webp';
    fallback: 'jpeg';
    icons: 'svg';
  };
  
  compression: {
    quality: {
      thumbnail: 80;
      gallery: 85;
      hero: 90;
    };
  };
  
  srcset: {
    widths: [320, 640, 960, 1280, 1920];
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw';
  };
  
  lazyLoading: {
    enabled: true;
    threshold: '200px'; // Load when 200px from viewport
    placeholder: 'blur' | 'skeleton';
  };
  
  preload: {
    hero: true;
    aboveFold: true;
    criticalImages: 3;
  };
}
```

### 6.3 JavaScript Optimization

```typescript
const jsOptimization = {
  bundling: {
    strategy: 'code_splitting';
    criticalChunks: ['vendor', 'main', 'analytics'];
    lazyChunks: ['product_zoom', 'reviews', 'chat'];
  };
  
  loading: {
    critical: 'inline';
    nonCritical: 'defer';
    thirdParty: 'async';
  };
  
  caching: {
    strategy: 'stale-while-revalidate';
    maxAge: '1 year';
    immutable: true; // for hashed filenames
  };
  
  prefetch: {
    onHover: ['product_page'];
    onIdle: ['cart', 'checkout'];
  };
};
```

### 6.4 CSS Optimization

```typescript
const cssOptimization = {
  criticalCSS: {
    inline: true;
    extract: ['above_fold', 'fonts'];
  };
  
  loading: {
    critical: 'inline';
    nonCritical: 'preload';
  };
  
  purge: {
    enabled: true;
    safelist: ['dynamic-classes', 'js-added-classes'];
  };
  
  minification: {
    enabled: true;
    removeComments: true;
    mergeRules: true;
  };
};
```

### 6.5 Caching Strategy

```typescript
const cachingStrategy = {
  browser: {
    static: {
      maxAge: '1 year';
      immutable: true;
      assets: ['js', 'css', 'images', 'fonts'];
    };
    html: {
      maxAge: '1 hour';
      revalidate: true;
    };
    api: {
      maxAge: '5 minutes';
      staleWhileRevalidate: '1 hour';
    };
  };
  
  cdn: {
    provider: 'cloudflare' | 'vercel';
    edgeCaching: true;
    bypassCookie: 'cart_id'; // Don't cache when user has cart
  };
  
  serviceWorker: {
    enabled: true;
    strategy: 'network-first';
    offlineFallback: '/offline.html';
    precache: ['critical-css', 'fonts', 'logo'];
  };
};
```

---

## 7. Sitemap & Indexing

### 7.1 XML Sitemap Structure

```
sitemap.xml (index)
├── sitemap-pages.xml (static pages)
├── sitemap-categories.xml (category pages)
├── sitemap-products.xml (product pages)
├── sitemap-brands.xml (brand pages)
├── sitemap-blog.xml (blog posts)
└── sitemap-images.xml (product images)
```

### 7.2 Sitemap Generation

```typescript
interface SitemapConfig {
  updateFrequency: {
    homepage: 'daily';
    categories: 'daily';
    products: 'weekly';
    staticPages: 'monthly';
    blog: 'weekly';
  };
  
  priority: {
    homepage: 1.0;
    categories: 0.9;
    products: 0.8;
    brands: 0.7;
    blog: 0.6;
    staticPages: 0.5;
  };
  
  maxUrlsPerSitemap: 50000;
  
  exclude: [
    '/checkout/*',
    '/kalathi/*',
    '/logariasmos/*',
    '/api/*',
    '/*?*', // Query parameters
  ];
  
  images: {
    include: true;
    maxPerPage: 10;
  };
  
  hreflang: {
    include: true;
    languages: ['el', 'en'];
  };
}
```

### 7.3 Indexing Guidelines

```html
<!-- Standard indexable page -->
<meta name="robots" content="index, follow">

<!-- Category page with filters (noindex but follow links) -->
<meta name="robots" content="noindex, follow">

<!-- Paginated pages (page 2+) -->
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="https://pavlicevits.gr/proionta/vafes/">

<!-- Out of stock product (keep indexed for traffic) -->
<meta name="robots" content="index, follow">

<!-- Account/Cart pages -->
<meta name="robots" content="noindex, nofollow">

<!-- Old/discontinued product -->
<meta name="robots" content="noindex, follow">
<!-- 410 status code preferred -->
```

---

## 8. Local SEO

### 8.1 Google Business Profile Optimization

```yaml
Business Name: Pavlicevits - Χρώματα & Βερνίκια
Primary Category: Paint Store
Secondary Categories:
  - Auto Parts Store
  - Industrial Equipment Supplier

Address:
  Street: Οδός Καλαμαριάς XX
  City: Καλαμαριά
  Region: Θεσσαλονίκη
  PostalCode: 551XX
  Country: Greece

Phone: +30 2310 XXX XXX
Website: https://pavlicevits.gr

Hours:
  Monday-Friday: 09:00-18:00
  Saturday: 09:00-14:00
  Sunday: Closed

Attributes:
  - In-store shopping: Yes
  - Delivery: Yes
  - Curbside pickup: Yes
  - Wheelchair accessible: Yes
  - Credit cards: Yes

Photos:
  - Storefront (exterior)
  - Interior (products)
  - Team photos
  - Product photos
  - Logo

Posts:
  - Weekly updates
  - New product announcements
  - Special offers
  - How-to tips
```

### 8.2 Local Schema Enhancement

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Pavlicevits",
  "areaServed": [
    {
      "@type": "City",
      "name": "Θεσσαλονίκη"
    },
    {
      "@type": "Country",
      "name": "Ελλάδα"
    }
  ],
  "serviceArea": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": "40.XXXXXX",
      "longitude": "22.XXXXXX"
    },
    "geoRadius": "500000"
  }
}
```

### 8.3 Local Content Strategy

| Content Type | Topic | Target Keywords |
|--------------|-------|-----------------|
| Landing page | Thessaloniki services | "βαφές αυτοκινήτου θεσσαλονίκη" |
| Blog post | Local delivery info | "αποστολή θεσσαλονίκη αυθημερόν" |
| FAQ | Store location | "που βρίσκεται pavlicevits" |
| Guide | Local suppliers | "αγορά χρωμάτων θεσσαλονίκη" |

---

## 9. Content SEO Strategy

### 9.1 Content Calendar

| Month | Blog Posts | Guides | Updates |
|-------|------------|--------|---------|
| January | 4 | 1 | Products |
| February | 4 | 1 | Products |
| March | 4 | 1 | Spring prep |
| April | 4 | 1 | Products |
| May | 4 | 1 | Products |
| June | 4 | 1 | Summer tips |

### 9.2 Content Types & SEO Goals

```typescript
const contentStrategy = {
  blog: {
    frequency: 'weekly';
    wordCount: { min: 800, target: 1500 };
    types: ['how-to', 'product-comparison', 'industry-news', 'tips'];
    seoGoals: ['long-tail-keywords', 'internal-linking', 'engagement'];
  };
  
  guides: {
    frequency: 'monthly';
    wordCount: { min: 2000, target: 3000 };
    types: ['complete-guide', 'step-by-step', 'buying-guide'];
    seoGoals: ['pillar-content', 'featured-snippets', 'backlinks'];
  };
  
  productDescriptions: {
    wordCount: { min: 150, target: 300 };
    elements: ['benefits', 'specifications', 'usage', 'compatibility'];
    seoGoals: ['transactional-keywords', 'rich-snippets'];
  };
  
  categoryDescriptions: {
    wordCount: { min: 200, target: 500 };
    elements: ['overview', 'subcategories', 'buying-tips', 'brands'];
    seoGoals: ['commercial-keywords', 'internal-linking'];
  };
};
```

### 9.3 Featured Snippet Optimization

```
Target snippet types:
1. Paragraph snippets - "Τι είναι 2K βερνίκι;"
2. List snippets - "Βήματα για βαφή αυτοκινήτου"
3. Table snippets - "Σύγκριση αστάρια"

Format for paragraph snippets:
<p>Το 2K βερνίκι είναι ένα δισυστατικό βερνίκι που απαιτεί την ανάμιξη 
βάσης και σκληρυντή πριν την εφαρμογή. Προσφέρει ανώτερη αντοχή, 
γυαλάδα και προστασία UV σε σχέση με τα 1K βερνίκια.</p>

Format for list snippets:
<h2>Πώς να βάψετε αυτοκίνητο βήμα-βήμα</h2>
<ol>
  <li>Προετοιμασία επιφάνειας</li>
  <li>Εφαρμογή αστάρι</li>
  <li>Εφαρμογή βαφής βάσης</li>
  <li>Εφαρμογή βερνικιού</li>
  <li>Γυάλισμα</li>
</ol>
```

---

## 10. E-Commerce SEO

### 10.1 Product Page SEO Checklist

```markdown
□ Unique, descriptive title (60 chars)
□ Compelling meta description (155 chars)
□ H1 with primary keyword
□ Structured product description (300+ words)
□ High-quality images with alt text
□ Product schema markup
□ Breadcrumb navigation
□ Customer reviews
□ Related products
□ Clear CTA
□ Mobile-friendly
□ Fast loading (< 3s)
```

### 10.2 Category Page SEO Checklist

```markdown
□ Unique H1 and title
□ Category description (200+ words)
□ Subcategory links
□ Filter options (without creating duplicate URLs)
□ Product count displayed
□ Pagination with canonical/prev/next
□ Breadcrumb navigation
□ Category schema if applicable
□ Internal links to related categories
□ Featured products
```

### 10.3 Out-of-Stock Product Handling

```typescript
const outOfStockStrategy = {
  temporary: {
    keepIndexed: true;
    showPage: true;
    message: 'Προσωρινά εκτός αποθέματος';
    showBackInStock: true;
    showAlternatives: true;
  };
  
  discontinued: {
    keepIndexed: false; // 6 months of traffic data first
    redirect: 'category_page';
    statusCode: 301;
    // or
    statusCode: 410; // If no good redirect
  };
  
  seasonal: {
    keepIndexed: true;
    message: 'Διαθέσιμο ξανά την άνοιξη';
    showPreOrder: true;
  };
};
```

---

## 11. Analytics & Tracking

### 11.1 Google Analytics 4 Setup

```typescript
const ga4Config = {
  measurementId: 'G-XXXXXXXXXX';
  
  events: {
    pageView: 'automatic';
    purchase: 'enhanced_ecommerce';
    addToCart: 'enhanced_ecommerce';
    viewItem: 'enhanced_ecommerce';
    search: 'custom';
    colorLookup: 'custom';
    chatOpen: 'custom';
  };
  
  conversions: [
    'purchase',
    'begin_checkout',
    'add_to_cart',
    'sign_up',
    'contact_form_submit',
  ];
  
  customDimensions: {
    userType: 'b2b' | 'b2c';
    customerTier: 'bronze' | 'silver' | 'gold' | 'platinum';
    productCategory: string;
    brand: string;
  };
};
```

### 11.2 Enhanced E-Commerce Tracking

```javascript
// View item
gtag('event', 'view_item', {
  currency: 'EUR',
  value: 39.90,
  items: [{
    item_id: 'HB-P961-1L',
    item_name: 'HB Body P961 Clear Coat 2K HS 1L',
    item_brand: 'HB Body',
    item_category: 'Βερνίκια',
    item_category2: '2K Clear Coat',
    price: 39.90,
    quantity: 1
  }]
});

// Add to cart
gtag('event', 'add_to_cart', {
  currency: 'EUR',
  value: 39.90,
  items: [{
    item_id: 'HB-P961-1L',
    item_name: 'HB Body P961 Clear Coat 2K HS 1L',
    price: 39.90,
    quantity: 1
  }]
});

// Purchase
gtag('event', 'purchase', {
  transaction_id: 'T12345',
  value: 89.80,
  currency: 'EUR',
  tax: 17.21,
  shipping: 4.50,
  items: [...]
});
```

### 11.3 Search Console Setup

```yaml
Properties:
  - Domain: pavlicevits.gr
  - URL Prefix: https://pavlicevits.gr/

Sitemaps:
  - /sitemap.xml
  - /sitemap-products.xml

Verification: DNS TXT record

Monitoring:
  - Index coverage
  - Core Web Vitals
  - Mobile usability
  - Manual actions
  - Security issues
  - Links report

Alerts:
  - Coverage issues > 5%
  - Core Web Vitals failures
  - Security issues
  - Manual actions
```

---

## 12. SEO Maintenance Checklist

### 12.1 Daily Tasks

- [ ] Monitor site uptime
- [ ] Check for crawl errors
- [ ] Review order/conversion data

### 12.2 Weekly Tasks

- [ ] Review Search Console for errors
- [ ] Check Core Web Vitals
- [ ] Review keyword rankings
- [ ] Publish 1+ blog posts
- [ ] Update Google Business Profile
- [ ] Check for broken links
- [ ] Review analytics trends

### 12.3 Monthly Tasks

- [ ] Full technical audit
- [ ] Content audit (top 20 pages)
- [ ] Competitor analysis
- [ ] Backlink profile review
- [ ] Schema validation
- [ ] Mobile usability test
- [ ] Page speed audit
- [ ] Review and update meta descriptions
- [ ] Check indexed pages count
- [ ] Review search queries report

### 12.4 Quarterly Tasks

- [ ] Full SEO audit
- [ ] Keyword strategy review
- [ ] Content gap analysis
- [ ] Technical infrastructure review
- [ ] Goal and KPI review
- [ ] Sitemap audit
- [ ] Redirect audit
- [ ] International SEO review

---

*Document prepared by DeepAgent | February 2026*  
*For Pavlicevits E-Shop Blueprint Development*
