# Pavlicevits E-Shop: Internationalization (i18n) Specification

**Document Version:** 1.0  
**Date:** February 15, 2026  
**Status:** Final Specification  
**Purpose:** Bilingual (Greek/English) implementation guidelines and localization standards

---

## Table of Contents
1. [Internationalization Overview](#1-internationalization-overview)
2. [Language Configuration](#2-language-configuration)
3. [URL Structure & Routing](#3-url-structure--routing)
4. [Translation Management](#4-translation-management)
5. [Date, Time & Number Formats](#5-date-time--number-formats)
6. [Currency Handling](#6-currency-handling)
7. [Content Localization](#7-content-localization)
8. [UI Component Translations](#8-ui-component-translations)
9. [SEO for Multiple Languages](#9-seo-for-multiple-languages)
10. [Testing & QA](#10-testing--qa)
11. [Future Expansion](#11-future-expansion)

---

## 1. Internationalization Overview

### 1.1 Scope

| Aspect | Greek (el) | English (en) |
|--------|------------|--------------|
| Primary market | Greece | International (expats, tourists, EU) |
| Default language | ✅ Yes | No |
| Full translation | ✅ Yes | ✅ Yes |
| SEO optimization | ✅ Yes | ✅ Yes |
| Customer support | ✅ Phone, Chat, Email | ✅ Chat, Email |

### 1.2 Language Strategy

```typescript
interface LanguageConfig {
  defaultLanguage: 'el';
  supportedLanguages: ['el', 'en'];
  
  detection: {
    order: [
      'url',                           // /en/products/
      'cookie',                        // lang=en
      'browser',                       // Accept-Language
      'default',                       // Greek
    ];
    cookieName: 'lang';
    cookieExpiry: '365 days';
  };
  
  fallback: {
    missingTranslation: 'default';     // Show Greek if English missing
    logMissing: true;                  // Log missing translations
  };
}
```

### 1.3 Implementation Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          TRANSLATION SOURCES                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                │
│  │  UI Strings │    │   Product   │    │   Content   │                │
│  │  (JSON)     │    │  Data (CMS) │    │  (Markdown) │                │
│  └─────────────┘    └─────────────┘    └─────────────┘                │
│         │                  │                  │                        │
│         └──────────────────┼──────────────────┘                        │
│                            │                                           │
│                     ┌──────▼──────┐                                    │
│                     │ Translation │                                    │
│                     │    Layer    │                                    │
│                     └──────┬──────┘                                    │
│                            │                                           │
│              ┌─────────────┼─────────────┐                             │
│              │             │             │                             │
│         ┌────▼────┐  ┌─────▼─────┐  ┌───▼────┐                        │
│         │  Greek  │  │  English  │  │ Future │                        │
│         │  (el)   │  │   (en)    │  │ (de?)  │                        │
│         └─────────┘  └───────────┘  └────────┘                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Language Configuration

### 2.1 Language Metadata

```typescript
const languages = {
  el: {
    code: 'el',
    name: 'Ελληνικά',
    nameEnglish: 'Greek',
    locale: 'el-GR',
    direction: 'ltr',
    flag: '🇬🇷',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    numberFormat: {
      decimal: ',',
      thousand: '.',
    },
    currency: {
      code: 'EUR',
      symbol: '€',
      position: 'after',            // 39,90€
    },
  },
  
  en: {
    code: 'en',
    name: 'English',
    nameEnglish: 'English',
    locale: 'en-GB',                // British English for EU
    direction: 'ltr',
    flag: '🇬🇧',
    dateFormat: 'DD/MM/YYYY',       // Keep European format
    timeFormat: 'HH:mm',
    numberFormat: {
      decimal: '.',
      thousand: ',',
    },
    currency: {
      code: 'EUR',
      symbol: '€',
      position: 'before',           // €39.90
    },
  },
};
```

### 2.2 Language Switcher

```typescript
interface LanguageSwitcher {
  position: {
    desktop: 'header_right';
    mobile: 'hamburger_menu';
  };
  
  display: {
    style: 'dropdown' | 'flags' | 'text';
    showFlag: true;
    showName: true;
    showNativeName: true;
  };
  
  behavior: {
    preserveCurrentPage: true;      // Stay on same page
    updateUrl: true;                // /proionta/ → /en/products/
    setCookie: true;
    redirectToEquivalent: true;     // Find equivalent page
  };
}
```

**Visual:**
```
Desktop:
┌─────────────────┐
│ 🇬🇷 Ελληνικά ▼ │
├─────────────────┤
│ 🇬🇷 Ελληνικά   │ ← Current (checked)
│ 🇬🇧 English    │
└─────────────────┘

Mobile (in menu):
┌─────────────────────────────────────────────────┐
│                                                 │
│  Γλώσσα / Language                             │
│  ─────────────────────────────────────────     │
│  🇬🇷 Ελληνικά                        [●]      │
│  🇬🇧 English                         [ ]      │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 3. URL Structure & Routing

### 3.1 URL Pattern

```
Greek (Default):
https://pavlicevits.gr/proionta/vafes/
https://pavlicevits.gr/proionta/vafes/hb-body-p961/
https://pavlicevits.gr/vres-xroma/
https://pavlicevits.gr/epikoinonia/

English:
https://pavlicevits.gr/en/products/paints/
https://pavlicevits.gr/en/products/paints/hb-body-p961/
https://pavlicevits.gr/en/find-color/
https://pavlicevits.gr/en/contact/
```

### 3.2 URL Mapping

```typescript
const urlMap = {
  // Category URLs
  '/proionta/': '/en/products/',
  '/proionta/vafes/': '/en/products/paints/',
  '/proionta/astaria/': '/en/products/primers/',
  '/proionta/vernikia/': '/en/products/clear-coats/',
  '/proionta/spray/': '/en/products/spray/',
  '/proionta/stokkoi/': '/en/products/fillers/',
  '/proionta/dialytika/': '/en/products/thinners/',
  '/proionta/exoplismos/': '/en/products/equipment/',
  '/proionta/analwsima/': '/en/products/consumables/',
  
  // Feature pages
  '/vres-xroma/': '/en/find-color/',
  '/vres-xroma/anazhthsh-vin/': '/en/find-color/vin-lookup/',
  '/markes/': '/en/brands/',
  
  // Content pages
  '/odigos/': '/en/guides/',
  '/blog/': '/en/blog/',
  '/epikoinonia/': '/en/contact/',
  '/sxetika/': '/en/about/',
  '/ypothirixh/': '/en/support/',
  
  // Account
  '/logariasmos/': '/en/account/',
  '/kalathi/': '/en/cart/',
  '/checkout/': '/en/checkout/',
  
  // Legal
  '/nomika/oroi-xrisis/': '/en/legal/terms-of-service/',
  '/nomika/politiki-aporritou/': '/en/legal/privacy-policy/',
  '/nomika/politiki-epistrofwn/': '/en/legal/return-policy/',
};
```

### 3.3 Routing Logic

```typescript
// Next.js/Remix style routing
const routes = {
  // Greek routes
  '/proionta/:category?/:subcategory?/:product?': 'ProductPage',
  '/markes/:brand?': 'BrandPage',
  '/vres-xroma/:tool?': 'ColorFinderPage',
  
  // English routes (prefixed)
  '/en/products/:category?/:subcategory?/:product?': 'ProductPage',
  '/en/brands/:brand?': 'BrandPage',
  '/en/find-color/:tool?': 'ColorFinderPage',
};

// Middleware for language detection
function languageMiddleware(request) {
  const path = request.path;
  const lang = path.startsWith('/en/') ? 'en' : 'el';
  
  // Set language context
  request.lang = lang;
  request.locale = languages[lang].locale;
  
  return next(request);
}
```

### 3.4 Hreflang Implementation

```html
<!-- Greek page: /proionta/vafes/ -->
<link rel="alternate" hreflang="el" href="https://pavlicevits.gr/proionta/vafes/" />
<link rel="alternate" hreflang="en" href="https://pavlicevits.gr/en/products/paints/" />
<link rel="alternate" hreflang="x-default" href="https://pavlicevits.gr/proionta/vafes/" />

<!-- English page: /en/products/paints/ -->
<link rel="alternate" hreflang="el" href="https://pavlicevits.gr/proionta/vafes/" />
<link rel="alternate" hreflang="en" href="https://pavlicevits.gr/en/products/paints/" />
<link rel="alternate" hreflang="x-default" href="https://pavlicevits.gr/proionta/vafes/" />
```

---

## 4. Translation Management

### 4.1 Translation File Structure

```
/locales/
├── el/
│   ├── common.json          # Shared strings
│   ├── navigation.json      # Nav items
│   ├── product.json         # Product-related
│   ├── checkout.json        # Checkout flow
│   ├── account.json         # Account area
│   ├── errors.json          # Error messages
│   └── legal.json           # Legal texts
├── en/
│   ├── common.json
│   ├── navigation.json
│   ├── product.json
│   ├── checkout.json
│   ├── account.json
│   ├── errors.json
│   └── legal.json
└── index.ts                 # Export all
```

### 4.2 Translation Key Conventions

```typescript
// Key naming convention: {namespace}.{section}.{element}

// Good examples:
"common.cta.add_to_cart"
"product.availability.in_stock"
"checkout.shipping.free_threshold"
"errors.form.email_invalid"

// Bad examples:
"addToCart"                    // No namespace
"PRODUCT_TITLE"               // Shouty
"txt1"                        // Meaningless
```

### 4.3 Sample Translation Files

**el/common.json:**
```json
{
  "site": {
    "name": "Pavlicevits",
    "tagline": "Χρώματα & Βερνίκια",
    "description": "Βαφές, βερνίκια και αξεσουάρ αυτοκινήτου στη Θεσσαλονίκη"
  },
  "cta": {
    "add_to_cart": "Προσθήκη στο Καλάθι",
    "buy_now": "Αγορά Τώρα",
    "view_all": "Δείτε Όλα",
    "learn_more": "Μάθετε Περισσότερα",
    "contact_us": "Επικοινωνήστε",
    "subscribe": "Εγγραφή",
    "search": "Αναζήτηση",
    "apply": "Εφαρμογή",
    "clear": "Καθαρισμός",
    "save": "Αποθήκευση",
    "cancel": "Ακύρωση",
    "continue": "Συνέχεια",
    "back": "Πίσω"
  },
  "labels": {
    "price": "Τιμή",
    "quantity": "Ποσότητα",
    "total": "Σύνολο",
    "subtotal": "Υποσύνολο",
    "shipping": "Αποστολή",
    "tax": "ΦΠΑ",
    "discount": "Έκπτωση",
    "free": "Δωρεάν",
    "required": "Υποχρεωτικό",
    "optional": "Προαιρετικό"
  },
  "shipping": {
    "free_shipping": "Δωρεάν αποστολή",
    "free_over": "Δωρεάν αποστολή για αγορές άνω των {{amount}}",
    "estimated_delivery": "Εκτιμώμενη παράδοση",
    "business_days": "εργάσιμες ημέρες"
  },
  "trust": {
    "secure_payment": "Ασφαλής Πληρωμή",
    "money_back": "Εγγύηση Επιστροφής Χρημάτων",
    "free_returns": "Δωρεάν Επιστροφές",
    "support_available": "Τεχνική Υποστήριξη"
  }
}
```

**en/common.json:**
```json
{
  "site": {
    "name": "Pavlicevits",
    "tagline": "Paints & Coatings",
    "description": "Automotive paints, coatings, and accessories in Thessaloniki"
  },
  "cta": {
    "add_to_cart": "Add to Cart",
    "buy_now": "Buy Now",
    "view_all": "View All",
    "learn_more": "Learn More",
    "contact_us": "Contact Us",
    "subscribe": "Subscribe",
    "search": "Search",
    "apply": "Apply",
    "clear": "Clear",
    "save": "Save",
    "cancel": "Cancel",
    "continue": "Continue",
    "back": "Back"
  },
  "labels": {
    "price": "Price",
    "quantity": "Quantity",
    "total": "Total",
    "subtotal": "Subtotal",
    "shipping": "Shipping",
    "tax": "VAT",
    "discount": "Discount",
    "free": "Free",
    "required": "Required",
    "optional": "Optional"
  },
  "shipping": {
    "free_shipping": "Free shipping",
    "free_over": "Free shipping on orders over {{amount}}",
    "estimated_delivery": "Estimated delivery",
    "business_days": "business days"
  },
  "trust": {
    "secure_payment": "Secure Payment",
    "money_back": "Money Back Guarantee",
    "free_returns": "Free Returns",
    "support_available": "Technical Support"
  }
}
```

### 4.4 Interpolation & Pluralization

```typescript
// Interpolation examples
t('shipping.free_over', { amount: '€50' })
// EL: "Δωρεάν αποστολή για αγορές άνω των €50"
// EN: "Free shipping on orders over €50"

// Pluralization (Greek)
const pluralRulesEL = {
  "items_count": {
    "one": "{{count}} προϊόν",
    "other": "{{count}} προϊόντα"
  },
  "days": {
    "one": "{{count}} ημέρα",
    "other": "{{count}} ημέρες"
  }
};

// Pluralization (English)
const pluralRulesEN = {
  "items_count": {
    "one": "{{count}} item",
    "other": "{{count}} items"
  },
  "days": {
    "one": "{{count}} day",
    "other": "{{count}} days"
  }
};
```

---

## 5. Date, Time & Number Formats

### 5.1 Date Formatting

```typescript
const dateFormats = {
  el: {
    short: 'DD/MM/YYYY',              // 15/02/2026
    medium: 'D MMM YYYY',              // 15 Φεβ 2026
    long: 'D MMMM YYYY',               // 15 Φεβρουαρίου 2026
    full: 'dddd, D MMMM YYYY',         // Κυριακή, 15 Φεβρουαρίου 2026
    
    monthNames: [
      'Ιανουαρίου', 'Φεβρουαρίου', 'Μαρτίου', 'Απριλίου',
      'Μαΐου', 'Ιουνίου', 'Ιουλίου', 'Αυγούστου',
      'Σεπτεμβρίου', 'Οκτωβρίου', 'Νοεμβρίου', 'Δεκεμβρίου'
    ],
    monthNamesShort: [
      'Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μαϊ', 'Ιουν',
      'Ιουλ', 'Αυγ', 'Σεπ', 'Οκτ', 'Νοε', 'Δεκ'
    ],
    dayNames: [
      'Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη',
      'Πέμπτη', 'Παρασκευή', 'Σάββατο'
    ],
    dayNamesShort: ['Κυρ', 'Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ'],
  },
  
  en: {
    short: 'DD/MM/YYYY',              // Keep European format
    medium: 'D MMM YYYY',              // 15 Feb 2026
    long: 'D MMMM YYYY',               // 15 February 2026
    full: 'dddd, D MMMM YYYY',         // Sunday, 15 February 2026
  },
};
```

### 5.2 Time Formatting

```typescript
const timeFormats = {
  el: {
    short: 'HH:mm',                    // 14:30
    long: 'HH:mm:ss',                  // 14:30:45
  },
  en: {
    short: 'HH:mm',                    // 14:30 (24h for EU)
    long: 'HH:mm:ss',
  },
};
```

### 5.3 Number Formatting

```typescript
const numberFormats = {
  el: {
    decimal: ',',
    thousand: '.',
    examples: {
      integer: '1.234',                // One thousand two hundred thirty-four
      decimal: '1.234,56',             // With decimals
      percentage: '12,5%',
    },
  },
  en: {
    decimal: '.',
    thousand: ',',
    examples: {
      integer: '1,234',
      decimal: '1,234.56',
      percentage: '12.5%',
    },
  },
};

// Implementation
function formatNumber(value: number, locale: string): string {
  const config = numberFormats[locale];
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}
```

---

## 6. Currency Handling

### 6.1 Currency Configuration

```typescript
const currencyConfig = {
  default: 'EUR',
  supported: ['EUR'],                  // Only EUR for now
  
  display: {
    el: {
      format: '{{amount}}€',           // 39,90€
      position: 'after',
      space: false,
      decimal: ',',
    },
    en: {
      format: '€{{amount}}',           // €39.90
      position: 'before',
      space: false,
      decimal: '.',
    },
  },
};

// Implementation
function formatPrice(amount: number, locale: string): string {
  const config = currencyConfig.display[locale];
  
  const formattedAmount = amount.toFixed(2).replace(
    '.',
    config.decimal
  );
  
  if (config.position === 'before') {
    return `€${config.space ? ' ' : ''}${formattedAmount}`;
  }
  return `${formattedAmount}${config.space ? ' ' : ''}€`;
}

// Examples:
// formatPrice(39.90, 'el') → "39,90€"
// formatPrice(39.90, 'en') → "€39.90"
```

### 6.2 Price Display Rules

| Context | Greek | English |
|---------|-------|---------|
| Product price | 39,90€ | €39.90 |
| Original price | ~~49,90€~~ | ~~€49.90~~ |
| Savings | -10,00€ | -€10.00 |
| Free | Δωρεάν | Free |
| From price | από 39,90€ | from €39.90 |
| Price range | 39,90€ - 129,90€ | €39.90 - €129.90 |

---

## 7. Content Localization

### 7.1 Product Content Translation

```typescript
interface ProductTranslation {
  // Always translated
  title: {
    el: 'HB Body P961 Clear Coat 2K HS 1L',
    en: 'HB Body P961 Clear Coat 2K HS 1L',  // Usually same for products
  };
  
  // Translated
  description: {
    el: 'Βερνίκι υψηλών στερεών 2K για επαγγελματική χρήση...',
    en: 'High solid 2K clear coat for professional use...',
  };
  
  // Translated
  shortDescription: {
    el: 'Βερνίκι 2K με υψηλή γυαλάδα',
    en: '2K clear coat with high gloss',
  };
  
  // Keep original (technical)
  sku: 'HB-P961-1L';
  
  // Translate specification labels, not values
  specifications: {
    el: [
      { label: 'Τύπος', value: '2K Ακρυλικό' },
      { label: 'Αναλογία Μίξης', value: '2:1' },
    ],
    en: [
      { label: 'Type', value: '2K Acrylic' },
      { label: 'Mixing Ratio', value: '2:1' },
    ],
  };
}
```

### 7.2 Content That Needs Translation

| Content Type | Translate? | Notes |
|--------------|------------|-------|
| Product titles | Sometimes | Keep brand names, translate descriptors |
| Product descriptions | Yes | Full translation |
| Category names | Yes | Full translation |
| Navigation | Yes | Full translation |
| UI labels | Yes | Full translation |
| Error messages | Yes | Full translation |
| Legal pages | Yes | Full translation |
| Blog posts | Per post | Can have some posts in both |
| Reviews | No | Keep original language |
| Brand names | No | Keep as-is |
| SKUs/Codes | No | Keep as-is |
| Technical specs | Partial | Translate labels, keep values |

### 7.3 SEO Content Translation

```typescript
const seoTranslations = {
  homepage: {
    el: {
      title: 'Pavlicevits | Χρώματα & Βερνίκια Αυτοκινήτου | Θεσσαλονίκη',
      description: 'Βαφές, βερνίκια και αξεσουάρ αυτοκινήτου στη Θεσσαλονίκη. 40+ χρόνια εμπειρίας...',
    },
    en: {
      title: 'Pavlicevits | Automotive Paints & Coatings | Thessaloniki Greece',
      description: 'Automotive paints, coatings, and accessories in Thessaloniki. 40+ years of experience...',
    },
  },
  
  category_paints: {
    el: {
      title: 'Βαφές Αυτοκινήτου | Pavlicevits',
      description: 'Βαφές βάσης, metallic, candy και περλέ για αυτοκίνητα...',
    },
    en: {
      title: 'Automotive Paints | Pavlicevits',
      description: 'Basecoats, metallic, candy, and pearl paints for cars...',
    },
  },
};
```

---

## 8. UI Component Translations

### 8.1 Navigation

**el/navigation.json:**
```json
{
  "main": {
    "products": "Προϊόντα",
    "brands": "Μάρκες",
    "find_color": "Βρες Χρώμα",
    "guides": "Οδηγοί",
    "contact": "Επικοινωνία"
  },
  "account": {
    "login": "Σύνδεση",
    "register": "Εγγραφή",
    "my_account": "Ο Λογαριασμός μου",
    "orders": "Παραγγελίες",
    "addresses": "Διευθύνσεις",
    "wishlist": "Αγαπημένα",
    "logout": "Αποσύνδεση"
  },
  "categories": {
    "paints": "Βαφές",
    "primers": "Αστάρια",
    "clear_coats": "Βερνίκια",
    "spray": "Spray",
    "fillers": "Στόκοι",
    "thinners": "Διαλυτικά",
    "equipment": "Εξοπλισμός",
    "consumables": "Αναλώσιμα"
  }
}
```

**en/navigation.json:**
```json
{
  "main": {
    "products": "Products",
    "brands": "Brands",
    "find_color": "Find Color",
    "guides": "Guides",
    "contact": "Contact"
  },
  "account": {
    "login": "Login",
    "register": "Register",
    "my_account": "My Account",
    "orders": "Orders",
    "addresses": "Addresses",
    "wishlist": "Wishlist",
    "logout": "Logout"
  },
  "categories": {
    "paints": "Paints",
    "primers": "Primers",
    "clear_coats": "Clear Coats",
    "spray": "Spray",
    "fillers": "Fillers",
    "thinners": "Thinners",
    "equipment": "Equipment",
    "consumables": "Consumables"
  }
}
```

### 8.2 Product Page

**el/product.json:**
```json
{
  "availability": {
    "in_stock": "Διαθέσιμο",
    "low_stock": "Μόνο {{count}} σε απόθεμα",
    "out_of_stock": "Εξαντλημένο",
    "preorder": "Προ-παραγγελία",
    "notify_me": "Ειδοποιήστε με"
  },
  "labels": {
    "sku": "Κωδικός",
    "brand": "Μάρκα",
    "size": "Μέγεθος",
    "color": "Χρώμα",
    "quantity": "Ποσότητα"
  },
  "tabs": {
    "description": "Περιγραφή",
    "specifications": "Τεχνικά Χαρακτηριστικά",
    "documents": "TDS/MSDS",
    "how_to": "Οδηγίες Χρήσης",
    "reviews": "Αξιολογήσεις"
  },
  "reviews": {
    "title": "Αξιολογήσεις Πελατών",
    "write_review": "Γράψτε Αξιολόγηση",
    "verified_purchase": "Επαληθευμένη Αγορά",
    "helpful": "Ήταν χρήσιμο;",
    "pros": "Πλεονεκτήματα",
    "cons": "Μειονεκτήματα"
  },
  "related": {
    "bought_together": "Συχνά Αγοράζονται Μαζί",
    "similar": "Σχετικά Προϊόντα",
    "recently_viewed": "Είδατε Πρόσφατα"
  }
}
```

### 8.3 Checkout

**el/checkout.json:**
```json
{
  "steps": {
    "contact": "Στοιχεία Επικοινωνίας",
    "shipping": "Στοιχεία Αποστολής",
    "payment": "Πληρωμή",
    "review": "Επιβεβαίωση"
  },
  "fields": {
    "email": "Email",
    "phone": "Τηλέφωνο",
    "first_name": "Όνομα",
    "last_name": "Επώνυμο",
    "company": "Εταιρεία (προαιρετικό)",
    "address": "Διεύθυνση",
    "apartment": "Διαμέρισμα, όροφος κλπ.",
    "city": "Πόλη",
    "postal_code": "Ταχυδρομικός Κώδικας",
    "region": "Περιοχή"
  },
  "shipping_methods": {
    "standard": "Κανονική Αποστολή",
    "express": "Ταχεία Αποστολή",
    "sameday": "Αυθημερόν (Θεσσαλονίκη)",
    "pickup": "Παραλαβή από Κατάστημα"
  },
  "payment_methods": {
    "card": "Πιστωτική/Χρεωστική Κάρτα",
    "paypal": "PayPal",
    "bank_transfer": "Τραπεζική Μεταφορά",
    "cod": "Αντικαταβολή"
  },
  "messages": {
    "order_placed": "Η παραγγελία σας καταχωρήθηκε!",
    "confirmation_email": "Θα λάβετε email επιβεβαίωσης στο {{email}}",
    "processing": "Επεξεργασία παραγγελίας..."
  }
}
```

---

## 9. SEO for Multiple Languages

### 9.1 Hreflang Implementation

```html
<!-- Every page needs both language alternates -->
<head>
  <!-- Greek page -->
  <link rel="alternate" hreflang="el" href="https://pavlicevits.gr/proionta/vafes/" />
  <link rel="alternate" hreflang="en" href="https://pavlicevits.gr/en/products/paints/" />
  <link rel="alternate" hreflang="x-default" href="https://pavlicevits.gr/proionta/vafes/" />
  
  <!-- Canonical (same as current page) -->
  <link rel="canonical" href="https://pavlicevits.gr/proionta/vafes/" />
</head>
```

### 9.2 Sitemap Configuration

```xml
<!-- sitemap.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://pavlicevits.gr/proionta/vafes/</loc>
    <xhtml:link rel="alternate" hreflang="el" href="https://pavlicevits.gr/proionta/vafes/"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://pavlicevits.gr/en/products/paints/"/>
    <lastmod>2026-02-15</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://pavlicevits.gr/en/products/paints/</loc>
    <xhtml:link rel="alternate" hreflang="el" href="https://pavlicevits.gr/proionta/vafes/"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://pavlicevits.gr/en/products/paints/"/>
    <lastmod>2026-02-15</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

### 9.3 Language-Specific Meta Tags

```html
<!-- Greek page -->
<html lang="el">
<head>
  <meta property="og:locale" content="el_GR" />
  <meta property="og:locale:alternate" content="en_GB" />
  <title>Βαφές Αυτοκινήτου | Pavlicevits</title>
  <meta name="description" content="Βαφές βάσης, metallic, candy..." />
</head>

<!-- English page -->
<html lang="en">
<head>
  <meta property="og:locale" content="en_GB" />
  <meta property="og:locale:alternate" content="el_GR" />
  <title>Automotive Paints | Pavlicevits</title>
  <meta name="description" content="Basecoats, metallic, candy paints..." />
</head>
```

---

## 10. Testing & QA

### 10.1 Translation QA Checklist

```markdown
## Pre-Launch Translation QA

### Coverage
- [ ] All UI strings have translations
- [ ] All static pages translated
- [ ] All product categories translated
- [ ] All navigation items translated
- [ ] All form labels/errors translated
- [ ] All email templates translated

### Quality
- [ ] No machine translation errors
- [ ] Consistent terminology
- [ ] Correct pluralization
- [ ] Proper capitalization
- [ ] No untranslated strings visible
- [ ] No text overflow/truncation

### Technical
- [ ] Hreflang tags on all pages
- [ ] Language switcher works
- [ ] URLs redirect correctly
- [ ] Cookie persistence works
- [ ] Browser detection works
- [ ] Sitemap includes both languages

### SEO
- [ ] Unique title tags per language
- [ ] Unique meta descriptions
- [ ] Canonical tags correct
- [ ] Schema markup in correct language
```

### 10.2 Testing Scenarios

| Scenario | Expected Behavior |
|----------|-------------------|
| First visit (Greek browser) | Load Greek version |
| First visit (English browser) | Load Greek (default), show switcher |
| Switch to English | Navigate to /en/, set cookie |
| Return visit (cookie set) | Load saved language |
| Direct link to /en/products/ | Load English version |
| Search in English | Show English results |
| Add to cart in English | Cart in English |
| Switch language mid-checkout | Stay on current step in new language |

### 10.3 Automated Testing

```typescript
// Cypress/Playwright test examples
describe('i18n', () => {
  it('should load Greek by default', () => {
    cy.visit('/');
    cy.get('html').should('have.attr', 'lang', 'el');
    cy.contains('Προϊόντα');
  });
  
  it('should switch to English', () => {
    cy.visit('/');
    cy.get('[data-testid="language-switcher"]').click();
    cy.get('[data-testid="lang-en"]').click();
    cy.url().should('include', '/en/');
    cy.get('html').should('have.attr', 'lang', 'en');
    cy.contains('Products');
  });
  
  it('should have correct hreflang tags', () => {
    cy.visit('/proionta/vafes/');
    cy.get('link[hreflang="el"]')
      .should('have.attr', 'href', 'https://pavlicevits.gr/proionta/vafes/');
    cy.get('link[hreflang="en"]')
      .should('have.attr', 'href', 'https://pavlicevits.gr/en/products/paints/');
  });
  
  it('should remember language preference', () => {
    cy.visit('/en/');
    cy.getCookie('lang').should('have.property', 'value', 'en');
    cy.visit('/');
    cy.url().should('include', '/en/');
  });
});
```

---

## 11. Future Expansion

### 11.1 Adding New Languages

```typescript
// Steps to add German (de):
const newLanguage = {
  code: 'de',
  name: 'Deutsch',
  locale: 'de-DE',
  urlPrefix: '/de/',
  
  steps: [
    '1. Create /locales/de/ folder',
    '2. Copy all JSON files from /locales/en/',
    '3. Translate all strings',
    '4. Add URL mapping to routing',
    '5. Update language switcher',
    '6. Add hreflang tags',
    '7. Update sitemaps',
    '8. Test thoroughly',
  ],
};
```

### 11.2 Potential Future Languages

| Language | Priority | Market |
|----------|----------|--------|
| German (de) | Medium | EU expats, tourists |
| Bulgarian (bg) | Low | Neighboring country |
| Romanian (ro) | Low | Neighboring country |
| Russian (ru) | Low | Tourists |

### 11.3 Translation Workflow (Scaled)

```
For 3+ languages, consider:
├── Translation Management System (TMS)
│   ├── Crowdin
│   ├── Lokalise
│   └── Phrase
├── Automated sync with codebase
├── Professional translation agency
├── In-context translation preview
└── Translation memory for consistency
```

---

*Document prepared by DeepAgent | February 2026*  
*For Pavlicevits E-Shop Blueprint Development*
