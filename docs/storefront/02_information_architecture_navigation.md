# Pavlicevits E-Shop: Information Architecture & Navigation Specification

**Document Version:** 1.0  
**Date:** February 15, 2026  
**Status:** Final Specification  
**Purpose:** Complete sitemap, navigation structure, and URL architecture for Pavlicevits e-commerce platform

---

## Table of Contents
1. [Site Structure Overview](#1-site-structure-overview)
2. [Complete Sitemap](#2-complete-sitemap)
3. [URL Structure & Conventions](#3-url-structure--conventions)
4. [Primary Navigation](#4-primary-navigation)
5. [Secondary & Utility Navigation](#5-secondary--utility-navigation)
6. [Footer Navigation](#6-footer-navigation)
7. [Mobile Navigation](#7-mobile-navigation)
8. [Breadcrumb Logic](#8-breadcrumb-logic)
9. [Search Functionality](#9-search-functionality)
10. [Filter & Faceted Navigation](#10-filter--faceted-navigation)
11. [Category Taxonomy](#11-category-taxonomy)
12. [Internal Linking Strategy](#12-internal-linking-strategy)
13. [Error & Redirect Handling](#13-error--redirect-handling)

---

## 1. Site Structure Overview

### 1.1 Information Architecture Principles

| Principle | Implementation |
|-----------|----------------|
| **User-Centric** | Organized by user tasks, not internal structure |
| **Flat Hierarchy** | Max 3 clicks to any product |
| **Scannable** | Clear labels, logical groupings |
| **SEO-Optimized** | Keyword-rich URLs and categories |
| **Scalable** | Structure supports catalog growth |

### 1.2 High-Level Site Map

```
pavlicevits.gr
├── / (Homepage)
├── /proionta/ (Products Hub)
│   ├── /proionta/vafes/ (Paints)
│   ├── /proionta/astaria/ (Primers)
│   ├── /proionta/vernikia/ (Clear Coats)
│   ├── /proionta/spray/ (Spray Products)
│   ├── /proionta/stokkoi/ (Fillers)
│   ├── /proionta/dialytika/ (Thinners/Solvents)
│   ├── /proionta/exoplismos/ (Equipment)
│   └── /proionta/analwsima/ (Consumables)
├── /markes/ (Brands)
├── /vres-xroma/ (Color Finder)
├── /epaggelmatiki-agora/ (Professional/B2B)
├── /odigos/ (Guides/How-To)
├── /blog/ (Blog/Articles)
├── /ypothirixh/ (Support)
├── /epikoinonia/ (Contact)
├── /sxetika/ (About)
├── /kalathi/ (Cart)
├── /checkout/ (Checkout)
├── /logariasmos/ (Account)
└── /nomika/ (Legal Pages)
```

---

## 2. Complete Sitemap

### 2.1 Primary Pages

```yaml
Homepage:
  - path: /
  - path: /en/ (English)
  - priority: 1.0
  - changefreq: daily

Products Hub:
  - path: /proionta/
  - path: /en/products/
  - priority: 0.9
  - changefreq: daily

Category Pages:
  - path: /proionta/vafes/
    children:
      - /proionta/vafes/vases-aftokinitou/
      - /proionta/vafes/vases-epaggelmatikes/
      - /proionta/vafes/vases-spitio/
      - /proionta/vafes/kandis-perlas/
      - /proionta/vafes/thermoantoches/
  
  - path: /proionta/astaria/
    children:
      - /proionta/astaria/epokseidika/
      - /proionta/astaria/akrylika/
      - /proionta/astaria/plastikon/
      - /proionta/astaria/antiskoriaka/
      - /proionta/astaria/spray/
  
  - path: /proionta/vernikia/
    children:
      - /proionta/vernikia/2k-clear-coat/
      - /proionta/vernikia/1k-clear-coat/
      - /proionta/vernikia/hs-clear-coat/
      - /proionta/vernikia/matte/
  
  - path: /proionta/spray/
    children:
      - /proionta/spray/vafi-spray/
      - /proionta/spray/astari-spray/
      - /proionta/spray/verniki-spray/
      - /proionta/spray/eidikes-xriseis/
  
  - path: /proionta/stokkoi/
    children:
      - /proionta/stokkoi/polyester/
      - /proionta/stokkoi/acryl/
      - /proionta/stokkoi/alouminiou/
      - /proionta/stokkoi/fiberglass/
  
  - path: /proionta/dialytika/
    children:
      - /proionta/dialytika/akrylikon/
      - /proionta/dialytika/nitro/
      - /proionta/dialytika/epokseidika/
      - /proionta/dialytika/katharistika/
  
  - path: /proionta/exoplismos/
    children:
      - /proionta/exoplismos/pistoletia/
      - /proionta/exoplismos/kompresser/
      - /proionta/exoplismos/prostasia/
      - /proionta/exoplismos/gyalismatos/
  
  - path: /proionta/analwsima/
    children:
      - /proionta/analwsima/masking-tapes/
      - /proionta/analwsima/gyaloxarta/
      - /proionta/analwsima/sfoungaria/
      - /proionta/analwsima/pangia/

Product Detail Pages:
  - pattern: /proionta/{category}/{subcategory}/{product-handle}/
  - example: /proionta/vafes/vases-aftokinitou/hb-body-p961-clear-coat-2k/
  - priority: 0.8
  - changefreq: weekly

Brand Pages:
  - path: /markes/
  - children:
      - /markes/hb-body/
      - /markes/sikkens/
      - /markes/spies-hecker/
      - /markes/cromax/
      - /markes/dupont/
      - /markes/3m/
      - /markes/mirka/
      - /markes/sata/
  - priority: 0.7
  - changefreq: weekly
```

### 2.2 Color Finder Pages

```yaml
Color Finder:
  - path: /vres-xroma/
  - children:
      - /vres-xroma/anazhthsh-vin/
      - /vres-xroma/anazhthsh-kwdikou/
      - /vres-xroma/pou-vrisko-ton-kwdiko/
      - /vres-xroma/katalogos-xromatwn/
  
  - Manufacturer Guides:
      - /vres-xroma/odigoi/toyota/
      - /vres-xroma/odigoi/volkswagen/
      - /vres-xroma/odigoi/bmw/
      - /vres-xroma/odigoi/mercedes/
      - /vres-xroma/odigoi/ford/
      - /vres-xroma/odigoi/opel/
      - /vres-xroma/odigoi/fiat/
      - /vres-xroma/odigoi/peugeot/
      - /vres-xroma/odigoi/renault/
      - /vres-xroma/odigoi/nissan/
      - /vres-xroma/odigoi/honda/
      - /vres-xroma/odigoi/hyundai/
  - priority: 0.9
  - changefreq: monthly
```

### 2.3 Content & Support Pages

```yaml
Guides (How-To):
  - path: /odigos/
  - children:
      - /odigos/pos-na-vapsw-aftokinito/
      - /odigos/epilogi-swstou-astariou/
      - /odigos/xrisi-pistoletias/
      - /odigos/egkatastasi-prostasias/
      - /odigos/epidiorthosi-gratsounnies/
      - /odigos/gyalisma-aftokinitou/
  - priority: 0.7
  - changefreq: monthly

Blog/Articles:
  - path: /blog/
  - pattern: /blog/{year}/{slug}/
  - example: /blog/2026/tips-gia-teleia-vafi/
  - priority: 0.6
  - changefreq: weekly

Support:
  - path: /ypothirixh/
  - children:
      - /ypothirixh/tds-msds/
      - /ypothirixh/syxnes-erotiseis/
      - /ypothirixh/video-tutorials/
      - /ypothirixh/technikos-odigos/
      - /ypothirixh/eggyisi-epistrofes/
  - priority: 0.6
  - changefreq: monthly

About:
  - path: /sxetika/
  - children:
      - /sxetika/istoria/
      - /sxetika/to-katastima/
      - /sxetika/kariera/
  - priority: 0.5
  - changefreq: monthly

Contact:
  - path: /epikoinonia/
  - priority: 0.7
  - changefreq: monthly
```

### 2.4 E-Commerce & Account Pages

```yaml
Cart:
  - path: /kalathi/
  - noindex: true

Checkout:
  - path: /checkout/
  - children:
      - /checkout/stoixeia/
      - /checkout/apostoli/
      - /checkout/pliromi/
      - /checkout/epivevaiosi/
  - noindex: true

Account:
  - path: /logariasmos/
  - children:
      - /logariasmos/syndesmi/ (Login)
      - /logariasmos/eggrafi/ (Register)
      - /logariasmos/epanaforakkodikoy/ (Password Reset)
      - /logariasmos/pinax/ (Dashboard)
      - /logariasmos/paraggelles/ (Orders)
      - /logariasmos/diefthinseis/ (Addresses)
      - /logariasmos/agapimena/ (Wishlist)
      - /logariasmos/stoixeia/ (Profile)
  - noindex: true (except login/register)

Order Confirmation:
  - pattern: /paraggelia/{order-id}/
  - noindex: true
```

### 2.5 Legal & Policy Pages

```yaml
Legal:
  - path: /nomika/
  - children:
      - /nomika/oroi-xrisis/ (Terms of Service)
      - /nomika/politiki-aporritou/ (Privacy Policy)
      - /nomika/politiki-cookies/ (Cookie Policy)
      - /nomika/politiki-apostolwn/ (Shipping Policy)
      - /nomika/politiki-epistrofwn/ (Returns Policy)
      - /nomika/politiki-pliromon/ (Payment Policy)
  - priority: 0.3
  - changefreq: yearly
```

### 2.6 Professional/B2B Pages

```yaml
Professional:
  - path: /epaggelmatiki-agora/
  - children:
      - /epaggelmatiki-agora/pleonektimata/
      - /epaggelmatiki-agora/aitisi/
      - /epaggelmatiki-agora/timokatalogos/
  - priority: 0.7
  - changefreq: monthly
```

---

## 3. URL Structure & Conventions

### 3.1 URL Rules

| Rule | Example | Notes |
|------|---------|-------|
| Lowercase only | `/proionta/vafes/` | Never `/Proionta/` |
| Greek transliteration | `/vafes/` not `/βαφές/` | ASCII characters only |
| Hyphens for spaces | `/spray-vafis/` | Never underscores |
| No trailing slash | `/proionta/vafes` | Except root `/` |
| No file extensions | `/epikoinonia` | Never `.html` |
| Max 115 characters | Keep URLs concise | SEO best practice |

### 3.2 Greek Transliteration Map

```
α → a    ι → i    ρ → r
β → v    κ → k    σ/ς → s
γ → g    λ → l    τ → t
δ → d    μ → m    υ → y
ε → e    ν → n    φ → f
ζ → z    ξ → x    χ → ch
η → i    ο → o    ψ → ps
θ → th   π → p    ω → o

Combined:
αι → ai   ει → ei   οι → oi   ου → ou
αυ → av   ευ → ev   γγ → ng   γκ → gk
μπ → mp/b ντ → nt/d τσ → ts   τζ → tz
```

### 3.3 URL Patterns by Page Type

```
Homepage:           /
                    /en/

Category L1:        /proionta/{category}/
                    /en/products/{category}/

Category L2:        /proionta/{category}/{subcategory}/
                    /en/products/{category}/{subcategory}/

Product:            /proionta/{category}/{subcategory}/{handle}/
                    /en/products/{category}/{subcategory}/{handle}/

Brand:              /markes/{brand}/
                    /en/brands/{brand}/

Blog Post:          /blog/{year}/{slug}/
                    /en/blog/{year}/{slug}/

Guide:              /odigos/{slug}/
                    /en/guides/{slug}/

Search:             /anazhthsh/?q={query}
                    /en/search/?q={query}

Filter (params):    /proionta/vafes/?marka=hb-body&timi=0-50
```

### 3.4 Canonical URL Rules

```html
<!-- Category page -->
<link rel="canonical" href="https://pavlicevits.gr/proionta/vafes/" />

<!-- Filtered page (canonical to unfiltered) -->
<link rel="canonical" href="https://pavlicevits.gr/proionta/vafes/" />

<!-- Paginated page (canonical to first page) -->
<link rel="canonical" href="https://pavlicevits.gr/proionta/vafes/" />

<!-- Product page -->
<link rel="canonical" href="https://pavlicevits.gr/proionta/vafes/vases-aftokinitou/hb-body-p961/" />

<!-- Language variant -->
<link rel="canonical" href="https://pavlicevits.gr/en/products/paints/automotive-paints/hb-body-p961/" />
```

---

## 4. Primary Navigation

### 4.1 Desktop Navigation Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [Logo]   Προϊόντα ▼   Μάρκες   Βρες Χρώμα   Οδηγοί   [Search]  [🛒] [👤]│
└─────────────────────────────────────────────────────────────────────────┘

Mega Menu (Προϊόντα):
┌─────────────────────────────────────────────────────────────────────────┐
│ Βαφές         │ Αστάρια        │ Βερνίκια      │ Εξοπλισμός           │
│ ─────────     │ ─────────      │ ─────────     │ ─────────            │
│ Αυτοκινήτου   │ Εποξειδικά     │ 2K Clear Coat │ Πιστολέτια           │
│ Επαγγελματικές│ Ακρυλικά       │ 1K Clear Coat │ Κομπρεσέρ            │
│ Σπιτιού       │ Πλαστικών      │ HS Clear Coat │ Προστασία            │
│ Candy/Perla   │ Αντισκουριακά  │ Matte         │ Γυαλίσματος          │
│ Θερμοάντοχες  │ Spray          │               │                      │
│               │                │               │                      │
│ Spray         │ Στόκοι         │ Διαλυτικά     │ Αναλώσιμα            │
│ ─────────     │ ─────────      │ ─────────     │ ─────────            │
│ Βαφής Spray   │ Polyester      │ Ακρυλικών     │ Masking Tapes        │
│ Αστάρι Spray  │ Acryl          │ Nitro         │ Γυαλόχαρτα           │
│ Βερνίκι Spray │ Αλουμινίου     │ Εποξειδικά    │ Σφουγγάρια           │
│ Ειδικές Χρήσ. │ Fiberglass     │ Καθαριστικά   │ Πανιά                │
│                                                                         │
│ [Δείτε Όλα τα Προϊόντα →]      [Επαγγελματική Αγορά →]               │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Navigation Items

```typescript
// types/navigation.ts
interface NavItem {
  label: string;
  labelEn: string;
  href: string;
  children?: NavItem[];
  highlight?: boolean;
  icon?: string;
}

const primaryNav: NavItem[] = [
  {
    label: "Προϊόντα",
    labelEn: "Products",
    href: "/proionta/",
    children: [
      {
        label: "Βαφές",
        labelEn: "Paints",
        href: "/proionta/vafes/",
        children: [
          { label: "Αυτοκινήτου", labelEn: "Automotive", href: "/proionta/vafes/vases-aftokinitou/" },
          { label: "Επαγγελματικές", labelEn: "Professional", href: "/proionta/vafes/vases-epaggelmatikes/" },
          { label: "Σπιτιού", labelEn: "House", href: "/proionta/vafes/vases-spitio/" },
          { label: "Candy & Perla", labelEn: "Candy & Pearl", href: "/proionta/vafes/kandis-perlas/" },
          { label: "Θερμοάντοχες", labelEn: "High Temp", href: "/proionta/vafes/thermoantoches/" },
        ]
      },
      {
        label: "Αστάρια",
        labelEn: "Primers",
        href: "/proionta/astaria/",
        children: [
          { label: "Εποξειδικά", labelEn: "Epoxy", href: "/proionta/astaria/epokseidika/" },
          { label: "Ακρυλικά", labelEn: "Acrylic", href: "/proionta/astaria/akrylika/" },
          { label: "Πλαστικών", labelEn: "Plastic", href: "/proionta/astaria/plastikon/" },
          { label: "Αντισκουριακά", labelEn: "Anti-Rust", href: "/proionta/astaria/antiskoriaka/" },
          { label: "Spray", labelEn: "Spray", href: "/proionta/astaria/spray/" },
        ]
      },
      // ... additional categories
    ]
  },
  {
    label: "Μάρκες",
    labelEn: "Brands",
    href: "/markes/",
  },
  {
    label: "Βρες Χρώμα",
    labelEn: "Find Color",
    href: "/vres-xroma/",
    highlight: true,
    icon: "Palette",
  },
  {
    label: "Οδηγοί",
    labelEn: "Guides",
    href: "/odigos/",
  },
];
```

### 4.3 Navigation Behavior

| Interaction | Behavior |
|-------------|----------|
| Hover on "Προϊόντα" | Mega menu opens with 200ms delay |
| Click on "Προϊόντα" | Navigates to /proionta/ |
| Mouse leaves mega menu | Closes after 300ms |
| Tab into mega menu | Opens, keyboard navigable |
| Escape key | Closes mega menu |

---

## 5. Secondary & Utility Navigation

### 5.1 Top Bar (Above Main Nav)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 📞 2310-XXX-XXX │ 📍 Καλαμαριά, Θεσσαλονίκη │ Δωρεάν αποστολή άνω €50 │ 🇬🇷/🇬🇧 │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Utility Navigation (Top Right)

```typescript
const utilityNav: NavItem[] = [
  { label: "Τηλ: 2310-XXX-XXX", href: "tel:+302310XXXXXX", icon: "Phone" },
  { label: "Καλαμαριά, Θεσσαλονίκη", href: "/epikoinonia/", icon: "MapPin" },
  { label: "Δωρεάν αποστολή άνω €50", href: "/nomika/politiki-apostolwn/", icon: "Truck" },
];

const languageSwitcher = {
  current: "el",
  options: [
    { code: "el", label: "Ελληνικά", flag: "🇬🇷" },
    { code: "en", label: "English", flag: "🇬🇧" },
  ]
};
```

### 5.3 Account/Cart Navigation

```typescript
const accountNav: NavItem[] = [
  {
    label: "Αναζήτηση",
    labelEn: "Search",
    href: "/anazhthsh/",
    icon: "Search",
    action: "openSearch",
  },
  {
    label: "Λογαριασμός",
    labelEn: "Account",
    href: "/logariasmos/",
    icon: "User",
    children: [
      { label: "Σύνδεση", href: "/logariasmos/syndesmi/" },
      { label: "Εγγραφή", href: "/logariasmos/eggrafi/" },
      { label: "Παραγγελίες", href: "/logariasmos/paraggelles/" },
      { label: "Αγαπημένα", href: "/logariasmos/agapimena/" },
    ],
  },
  {
    label: "Καλάθι",
    labelEn: "Cart",
    href: "/kalathi/",
    icon: "ShoppingCart",
    badge: "cartCount",
  },
];
```

---

## 6. Footer Navigation

### 6.1 Footer Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  [LOGO]                                                                 │
│  Χρώματα & Βερνίκια                                                    │
│  Καλαμαριά, Θεσσαλονίκη                                                │
│  Εξυπηρετούμε επαγγελματίες                                            │
│  και ερασιτέχνες από το 1985.                                          │
│                                                                         │
│  [Facebook] [Instagram] [YouTube]                                       │
│                                                                         │
├─────────────┬─────────────┬─────────────┬─────────────────────────────┤
│             │             │             │                             │
│  Προϊόντα   │  Πληροφορίες│  Υποστήριξη │  Επικοινωνία               │
│  ─────────  │  ─────────  │  ─────────  │  ─────────                 │
│  Βαφές      │  Σχετικά    │  TDS/MSDS   │  📍 Οδός XX, Καλαμαριά    │
│  Αστάρια    │  Ιστορία    │  FAQ        │     551XX Θεσσαλονίκη     │
│  Βερνίκια   │  Καριέρα    │  Tutorials  │                           │
│  Spray      │  Blog       │  Εγγύηση    │  📞 2310-XXX-XXX          │
│  Εξοπλισμός │             │  Επιστροφές │  📧 info@pavlicevits.gr   │
│  Αναλώσιμα  │             │             │                           │
│                                                                         │
│  Όλες οι Κατηγορίες       │             │  🕐 Ωράριο:                │
│  Όλες οι Μάρκες           │             │  Δευ-Παρ: 09:00-18:00     │
│                                         │  Σάβ: 09:00-14:00         │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Τρόποι Πληρωμής: [Visa] [Mastercard] [Viva] [PayPal] [Αντικαταβολή]   │
│  Αποστολή: [ACS] [ELTA] [BIZ]                                          │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  © 2026 Pavlicevits. Με επιφύλαξη παντός δικαιώματος.                  │
│  Όροι Χρήσης  |  Πολιτική Απορρήτου  |  Πολιτική Cookies              │
│                                                                         │
│  🇬🇷 Ελληνικά  |  🇬🇧 English                                           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Footer Navigation Data

```typescript
const footerNav = {
  products: {
    title: "Προϊόντα",
    titleEn: "Products",
    links: [
      { label: "Βαφές", href: "/proionta/vafes/" },
      { label: "Αστάρια", href: "/proionta/astaria/" },
      { label: "Βερνίκια", href: "/proionta/vernikia/" },
      { label: "Spray", href: "/proionta/spray/" },
      { label: "Εξοπλισμός", href: "/proionta/exoplismos/" },
      { label: "Αναλώσιμα", href: "/proionta/analwsima/" },
      { label: "Όλες οι Κατηγορίες", href: "/proionta/" },
      { label: "Όλες οι Μάρκες", href: "/markes/" },
    ]
  },
  info: {
    title: "Πληροφορίες",
    titleEn: "Information",
    links: [
      { label: "Σχετικά με εμάς", href: "/sxetika/" },
      { label: "Ιστορία", href: "/sxetika/istoria/" },
      { label: "Καριέρα", href: "/sxetika/kariera/" },
      { label: "Blog", href: "/blog/" },
    ]
  },
  support: {
    title: "Υποστήριξη",
    titleEn: "Support",
    links: [
      { label: "TDS/MSDS", href: "/ypothirixh/tds-msds/" },
      { label: "Συχνές Ερωτήσεις", href: "/ypothirixh/syxnes-erotiseis/" },
      { label: "Video Tutorials", href: "/ypothirixh/video-tutorials/" },
      { label: "Εγγύηση & Επιστροφές", href: "/ypothirixh/eggyisi-epistrofes/" },
    ]
  },
  legal: {
    links: [
      { label: "Όροι Χρήσης", href: "/nomika/oroi-xrisis/" },
      { label: "Πολιτική Απορρήτου", href: "/nomika/politiki-aporritou/" },
      { label: "Πολιτική Cookies", href: "/nomika/politiki-cookies/" },
    ]
  },
  social: [
    { platform: "Facebook", href: "https://facebook.com/pavlicevits", icon: "Facebook" },
    { platform: "Instagram", href: "https://instagram.com/pavlicevits", icon: "Instagram" },
    { platform: "YouTube", href: "https://youtube.com/pavlicevits", icon: "Youtube" },
  ]
};
```

---

## 7. Mobile Navigation

### 7.1 Mobile Menu Structure

```
┌─────────────────────────────────────────────────┐
│  [X Close]                      [🛒 Cart (3)]   │
├─────────────────────────────────────────────────┤
│                                                 │
│  🔍 Αναζήτηση προϊόντων...                     │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  Προϊόντα                              [→]      │
│  ─────────────────────────────────────────     │
│  Μάρκες                                [→]      │
│  ─────────────────────────────────────────     │
│  🎨 Βρες Χρώμα                         ★       │
│  ─────────────────────────────────────────     │
│  Οδηγοί                                        │
│  ─────────────────────────────────────────     │
│  Blog                                          │
│  ─────────────────────────────────────────     │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  👤 Λογαριασμός                        [→]      │
│  ─────────────────────────────────────────     │
│  📞 2310-XXX-XXX                               │
│  ─────────────────────────────────────────     │
│  📍 Καλαμαριά, Θεσσαλονίκη                     │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  🇬🇷 Ελληνικά  |  🇬🇧 English                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 7.2 Mobile Sub-Navigation (After clicking "Προϊόντα →")

```
┌─────────────────────────────────────────────────┐
│  [← Πίσω]                               [X]     │
│                                                 │
│  Προϊόντα                                       │
├─────────────────────────────────────────────────┤
│                                                 │
│  Δείτε Όλα τα Προϊόντα                         │
│  ─────────────────────────────────────────     │
│  Βαφές                                 [→]      │
│  ─────────────────────────────────────────     │
│  Αστάρια                               [→]      │
│  ─────────────────────────────────────────     │
│  Βερνίκια                              [→]      │
│  ─────────────────────────────────────────     │
│  Spray                                 [→]      │
│  ─────────────────────────────────────────     │
│  Στόκοι                                [→]      │
│  ─────────────────────────────────────────     │
│  Διαλυτικά                             [→]      │
│  ─────────────────────────────────────────     │
│  Εξοπλισμός                            [→]      │
│  ─────────────────────────────────────────     │
│  Αναλώσιμα                             [→]      │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 7.3 Mobile Navigation Behavior

| Gesture/Action | Result |
|----------------|--------|
| Hamburger tap | Slide-in menu from left |
| Swipe right | Open menu |
| Swipe left | Close menu |
| Tap backdrop | Close menu |
| Category with [→] | Slide to subcategory |
| [← Πίσω] tap | Return to previous level |

---

## 8. Breadcrumb Logic

### 8.1 Breadcrumb Rules

| Page Type | Breadcrumb Pattern |
|-----------|-------------------|
| Category L1 | Αρχική > Προϊόντα > {Category} |
| Category L2 | Αρχική > Προϊόντα > {Category} > {Subcategory} |
| Product | Αρχική > Προϊόντα > {Category} > {Subcategory} > {Product} |
| Brand | Αρχική > Μάρκες > {Brand} |
| Brand + Category | Αρχική > Μάρκες > {Brand} > {Category} |
| Blog Post | Αρχική > Blog > {Post Title} |
| Guide | Αρχική > Οδηγοί > {Guide Title} |
| Search Results | Αρχική > Αναζήτηση > "{Query}" |

### 8.2 Breadcrumb Examples

```html
<!-- Category L2 Page -->
<nav aria-label="Breadcrumb">
  <ol itemscope itemtype="https://schema.org/BreadcrumbList">
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a itemprop="item" href="/"><span itemprop="name">Αρχική</span></a>
      <meta itemprop="position" content="1" />
    </li>
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a itemprop="item" href="/proionta/"><span itemprop="name">Προϊόντα</span></a>
      <meta itemprop="position" content="2" />
    </li>
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a itemprop="item" href="/proionta/vafes/"><span itemprop="name">Βαφές</span></a>
      <meta itemprop="position" content="3" />
    </li>
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <span itemprop="name">Βαφές Αυτοκινήτου</span>
      <meta itemprop="position" content="4" />
    </li>
  </ol>
</nav>
```

### 8.3 Breadcrumb Component

```typescript
// components/Breadcrumb.tsx
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumb">
      <ol className="breadcrumb__list">
        {items.map((item, index) => (
          <li key={index} className="breadcrumb__item">
            {item.href ? (
              <a href={item.href} className="breadcrumb__link">
                {item.label}
              </a>
            ) : (
              <span className="breadcrumb__current" aria-current="page">
                {item.label}
              </span>
            )}
            {index < items.length - 1 && (
              <ChevronRightIcon className="breadcrumb__separator" aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

---

## 9. Search Functionality

### 9.1 Search Specification

| Feature | Description |
|---------|-------------|
| **Type** | Full-text search with autocomplete |
| **Scope** | Products, Categories, Brands, Blog |
| **Language** | Greek-optimized with accent normalization |
| **Autocomplete** | Show after 2 characters, max 8 suggestions |
| **Recent Searches** | Store last 5 searches per user |
| **Popular Searches** | Display top 5 trending searches |

### 9.2 Search Autocomplete UI

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🔍 spray vaf                                                    [X]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Προϊόντα                                                              │
│  ───────────────────────────────────────────────────────────────       │
│  🖼 Spray Βαφής Μαύρο Γυαλιστερό HB Body - €8.50                      │
│  🖼 Spray Βαφής Ασημί Metallic Sikkens - €12.90                       │
│  🖼 Spray Αστάρι για Πλαστικά 3M - €15.00                             │
│                                                                         │
│  Κατηγορίες                                                            │
│  ───────────────────────────────────────────────────────────────       │
│  📁 Spray Βαφής                                                        │
│  📁 Spray Αστάρια                                                      │
│                                                                         │
│  Μάρκες                                                                │
│  ───────────────────────────────────────────────────────────────       │
│  🏷 HB Body Spray                                                      │
│                                                                         │
│  [Δείτε όλα τα αποτελέσματα για "spray vaf" →]                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 9.3 Search API Response

```typescript
interface SearchResult {
  query: string;
  totalResults: number;
  products: {
    id: string;
    title: string;
    image: string;
    price: number;
    href: string;
    category: string;
  }[];
  categories: {
    name: string;
    href: string;
    productCount: number;
  }[];
  brands: {
    name: string;
    href: string;
    productCount: number;
  }[];
  articles: {
    title: string;
    href: string;
    excerpt: string;
  }[];
  suggestions: string[]; // "Did you mean...?"
}
```

### 9.4 Search URL Parameters

```
/anazhthsh/?q=spray+vafis              # Basic search
/anazhthsh/?q=spray&sort=price_asc     # With sorting
/anazhthsh/?q=spray&brand=hb-body      # With filter
/anazhthsh/?q=spray&page=2             # Paginated
```

### 9.5 Greek Search Normalization

```typescript
// lib/search/normalize.ts
export function normalizeGreekText(text: string): string {
  return text
    .toLowerCase()
    // Remove accents
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Map Greek characters to Latin for broader matching
    .replace(/[άαa]/g, 'a')
    .replace(/[έεe]/g, 'e')
    .replace(/[ήηi]/g, 'i')
    .replace(/[ίιϊi]/g, 'i')
    .replace(/[όοo]/g, 'o')
    .replace(/[ύυϋy]/g, 'y')
    .replace(/[ώωo]/g, 'o')
    // Handle common misspellings
    .replace(/vafi/g, 'βαφη')
    .replace(/spray/g, 'σπρεϊ');
}
```

---

## 10. Filter & Faceted Navigation

### 10.1 Filter Categories

| Filter | Type | Values |
|--------|------|--------|
| **Τιμή** (Price) | Range slider | €0 - €500+ |
| **Μάρκα** (Brand) | Multi-select | HB Body, Sikkens, 3M, etc. |
| **Κατάσταση** (Stock) | Toggle | Διαθέσιμο / Όλα |
| **Σειρά** (Product Line) | Multi-select | PRO, Series 6, Standard |
| **Τύπος** (Type) | Multi-select | 1K, 2K, Spray |
| **Χρώμα** (Color) | Multi-select | Color swatches |
| **Χρήση** (Application) | Multi-select | Αυτοκίνητο, Σπίτι, etc. |
| **Μέγεθος** (Size) | Multi-select | 400ml, 1L, 4L, etc. |

### 10.2 Filter UI Layout

```
┌────────────────────┬────────────────────────────────────────────────────┐
│                    │                                                    │
│  Φίλτρα            │  [Grid ▢] [List ≡]    Ταξινόμηση: [Δημοφιλή ▼]   │
│  ───────────       │                                                    │
│                    │  Βρέθηκαν 156 προϊόντα                            │
│  Τιμή              │  ─────────────────────────────────────────────    │
│  [●────────────●]  │                                                    │
│  €0      -    €200 │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐     │
│                    │  │ Prod 1 │ │ Prod 2 │ │ Prod 3 │ │ Prod 4 │     │
│  Μάρκα             │  └────────┘ └────────┘ └────────┘ └────────┘     │
│  ☑ HB Body (45)   │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐     │
│  ☑ Sikkens (23)   │  │ Prod 5 │ │ Prod 6 │ │ Prod 7 │ │ Prod 8 │     │
│  ☐ 3M (18)        │  └────────┘ └────────┘ └────────┘ └────────┘     │
│  ☐ Cromax (12)    │                                                    │
│  [Δείτε περισσότ.]│  [1] [2] [3] ... [13] [Επόμενη →]                │
│                    │                                                    │
│  Σειρά Προϊόντων   │                                                    │
│  ☐ PRO (34)       │                                                    │
│  ☐ Series 6 (56)  │                                                    │
│  ☐ Standard (66)  │                                                    │
│                    │                                                    │
│  Διαθεσιμότητα     │                                                    │
│  ● Μόνο Διαθέσιμα │                                                    │
│  ○ Όλα τα Προϊόντα│                                                    │
│                    │                                                    │
│  [Καθαρισμός Όλων]│                                                    │
│                    │                                                    │
└────────────────────┴────────────────────────────────────────────────────┘
```

### 10.3 Filter URL Parameters

```
# Basic filters
/proionta/vafes/?marka=hb-body,sikkens
/proionta/vafes/?timi_min=10&timi_max=100
/proionta/vafes/?diathesimo=true

# Combined filters
/proionta/vafes/?marka=hb-body&seira=pro&timi_max=50

# Sorting
/proionta/vafes/?taxinomisi=timi_asc
/proionta/vafes/?taxinomisi=timi_desc
/proionta/vafes/?taxinomisi=neo
/proionta/vafes/?taxinomisi=dimofili

# Pagination
/proionta/vafes/?selida=2
```

### 10.4 Mobile Filter UI

```
Mobile: Full-screen filter overlay

┌─────────────────────────────────────────────────┐
│  [X Κλείσιμο]        Φίλτρα & Ταξινόμηση        │
├─────────────────────────────────────────────────┤
│                                                 │
│  Ταξινόμηση                             [→]     │
│  ─────────────────────────────────────────     │
│  Τιμή                                   [→]     │
│  ─────────────────────────────────────────     │
│  Μάρκα                          (2 επιλεγμ.)   │
│  ─────────────────────────────────────────     │
│  Σειρά Προϊόντων                        [→]     │
│  ─────────────────────────────────────────     │
│  Διαθεσιμότητα                          [→]     │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  [Καθαρισμός]           [Εφαρμογή (156 προϊ.)] │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 11. Category Taxonomy

### 11.1 Product Category Hierarchy

```yaml
Βαφές (Paints):
  - slug: vafes
  - Βαφές Αυτοκινήτου (Automotive Paints):
      - slug: vases-aftokinitou
      - attributes: [color_code, finish, base_type]
  - Βαφές Επαγγελματικές (Professional Paints):
      - slug: vases-epaggelmatikes
      - attributes: [coverage, voc, system]
  - Βαφές Σπιτιού (House Paints):
      - slug: vases-spitio
      - attributes: [surface_type, finish, coverage]
  - Candy & Perla (Candy & Pearl):
      - slug: kandis-perlas
      - attributes: [effect_type, base_required]
  - Θερμοάντοχες (High Temperature):
      - slug: thermoantoches
      - attributes: [max_temp, application]

Αστάρια (Primers):
  - slug: astaria
  - Εποξειδικά (Epoxy Primers):
      - slug: epokseidika
      - attributes: [mixing_ratio, pot_life]
  - Ακρυλικά (Acrylic Primers):
      - slug: akrylika
      - attributes: [sanding_time, coats]
  - Πλαστικών (Plastic Primers):
      - slug: plastikon
      - attributes: [plastic_types]
  - Αντισκουριακά (Anti-Rust):
      - slug: antiskoriaka
      - attributes: [protection_type]
  - Αστάρια Spray (Spray Primers):
      - slug: astaria-spray

Βερνίκια (Clear Coats):
  - slug: vernikia
  - 2K Clear Coat:
      - slug: 2k-clear-coat
      - attributes: [hardener, gloss_level]
  - 1K Clear Coat:
      - slug: 1k-clear-coat
  - HS Clear Coat:
      - slug: hs-clear-coat
      - attributes: [solid_content]
  - Matte Clear Coat:
      - slug: matte

Spray:
  - slug: spray
  - Βαφή Spray (Paint Spray):
      - slug: vafi-spray
  - Αστάρι Spray (Primer Spray):
      - slug: astari-spray
  - Βερνίκι Spray (Clear Spray):
      - slug: verniki-spray
  - Ειδικές Χρήσεις (Special Purpose):
      - slug: eidikes-xriseis

Στόκοι (Fillers):
  - slug: stokkoi
  - Polyester:
      - slug: polyester
  - Acryl:
      - slug: acryl
  - Αλουμινίου (Aluminum):
      - slug: alouminiou
  - Fiberglass:
      - slug: fiberglass

Διαλυτικά (Thinners/Solvents):
  - slug: dialytika
  - Ακρυλικών (Acrylic Thinners):
      - slug: akrylikon
  - Nitro:
      - slug: nitro
  - Εποξειδικά (Epoxy Thinners):
      - slug: epokseidika-dialytika
  - Καθαριστικά (Cleaners):
      - slug: katharistika

Εξοπλισμός (Equipment):
  - slug: exoplismos
  - Πιστολέτια (Spray Guns):
      - slug: pistoletia
      - attributes: [nozzle_size, type]
  - Κομπρεσέρ (Compressors):
      - slug: kompreser
      - attributes: [cfm, tank_size]
  - Προστασία (Protection):
      - slug: prostasia
  - Γυαλίσματος (Polishing):
      - slug: gyalismatos

Αναλώσιμα (Consumables):
  - slug: analwsima
  - Masking Tapes:
      - slug: masking-tapes
  - Γυαλόχαρτα (Sandpaper):
      - slug: gyaloxarta
      - attributes: [grit, type]
  - Σφουγγάρια (Pads):
      - slug: sfoungaria
  - Πανιά (Cloths):
      - slug: pangia
```

### 11.2 Category Attributes

```typescript
interface CategoryAttribute {
  id: string;
  label: string;
  labelEn: string;
  type: 'select' | 'multiselect' | 'range' | 'boolean' | 'color';
  values?: { value: string; label: string }[];
  unit?: string;
}

const categoryAttributes: Record<string, CategoryAttribute[]> = {
  'vases-aftokinitou': [
    {
      id: 'finish',
      label: 'Φινίρισμα',
      labelEn: 'Finish',
      type: 'multiselect',
      values: [
        { value: 'gloss', label: 'Γυαλιστερό' },
        { value: 'matte', label: 'Ματ' },
        { value: 'satin', label: 'Σατινέ' },
        { value: 'metallic', label: 'Μεταλλικό' },
        { value: 'pearl', label: 'Περλέ' },
      ]
    },
    {
      id: 'base_type',
      label: 'Τύπος',
      labelEn: 'Type',
      type: 'select',
      values: [
        { value: '1k', label: '1K (Μονοσυστατικό)' },
        { value: '2k', label: '2K (Δισυστατικό)' },
      ]
    }
  ],
  'gyaloxarta': [
    {
      id: 'grit',
      label: 'Κόκκος',
      labelEn: 'Grit',
      type: 'multiselect',
      values: [
        { value: 'p80', label: 'P80 (Χοντρό)' },
        { value: 'p120', label: 'P120' },
        { value: 'p180', label: 'P180' },
        { value: 'p240', label: 'P240' },
        { value: 'p320', label: 'P320' },
        { value: 'p400', label: 'P400' },
        { value: 'p600', label: 'P600' },
        { value: 'p800', label: 'P800' },
        { value: 'p1000', label: 'P1000 (Λεπτό)' },
        { value: 'p1500', label: 'P1500' },
        { value: 'p2000', label: 'P2000' },
      ]
    }
  ]
};
```

---

## 12. Internal Linking Strategy

### 12.1 Automatic Internal Links

| Source | Target | Logic |
|--------|--------|-------|
| Product Page | Related Products | Same category, similar price |
| Product Page | Complementary Products | Primer with paint, hardener with clear coat |
| Category Page | Featured Products | Best sellers in category |
| Blog Post | Related Products | Products mentioned in content |
| Blog Post | Related Articles | Same topic/category |
| Color Finder | Products | Matching color code |

### 12.2 Related Products Logic

```typescript
// lib/products/related.ts
interface RelatedProductsConfig {
  sameCategory: number;      // Max from same category
  complementary: number;     // Max complementary products
  sameBrand: number;         // Max from same brand
  recentlyViewed: number;    // Max from user's history
}

const defaultConfig: RelatedProductsConfig = {
  sameCategory: 4,
  complementary: 4,
  sameBrand: 2,
  recentlyViewed: 4,
};

// Complementary product rules
const complementaryRules: Record<string, string[]> = {
  'vafes': ['astaria', 'vernikia', 'dialytika'],
  'astaria': ['vafes', 'stokkoi'],
  'vernikia': ['vafes', 'dialytika', 'gyalismatos'],
  '2k-clear-coat': ['sklirintes'],
  'pistoletia': ['kompreser', 'analwsima'],
};
```

### 12.3 Breadcrumb-Based Contextual Links

```html
<!-- Category page sidebar -->
<aside class="category-context">
  <h3>Σε αυτή την κατηγορία</h3>
  <ul>
    <li><a href="/proionta/vafes/vases-aftokinitou/">Βαφές Αυτοκινήτου</a></li>
    <li><a href="/proionta/vafes/vases-epaggelmatikes/">Επαγγελματικές</a></li>
    <!-- ... -->
  </ul>
  
  <h3>Σχετικές Κατηγορίες</h3>
  <ul>
    <li><a href="/proionta/astaria/">Αστάρια</a></li>
    <li><a href="/proionta/vernikia/">Βερνίκια</a></li>
  </ul>
</aside>
```

---

## 13. Error & Redirect Handling

### 13.1 404 Page Specification

**URL:** /404 (rendered for any non-existent page)

**Content:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                              🔍                                         │
│                                                                         │
│               Η σελίδα δεν βρέθηκε                                      │
│                                                                         │
│        Η σελίδα που ψάχνετε δεν υπάρχει ή                              │
│        έχει μετακινηθεί σε άλλη διεύθυνση.                             │
│                                                                         │
│        [🏠 Πίσω στην Αρχική]   [🔍 Αναζήτηση]                          │
│                                                                         │
│  ──────────────────────────────────────────────────────────────────    │
│                                                                         │
│        Δημοφιλή Προϊόντα                                               │
│        ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                     │
│        │  Prod  │ │  Prod  │ │  Prod  │ │  Prod  │                     │
│        └────────┘ └────────┘ └────────┘ └────────┘                     │
│                                                                         │
│  ──────────────────────────────────────────────────────────────────    │
│                                                                         │
│        Χρειάζεστε βοήθεια;                                             │
│        📞 2310-XXX-XXX  |  📧 info@pavlicevits.gr                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 13.2 Redirect Rules

```nginx
# nginx.conf or next.config.js redirects

# Old URL structure → New
/products/         → /proionta/               (301)
/category/*        → /proionta/*              (301)
/brands/*          → /markes/*                (301)

# Language redirects
/el/*              → /*                       (301) # Greek is default
/gr/*              → /*                       (301) # Common typo

# Trailing slash normalization
/*/*.html          → /*/*                     (301)
/*/*/              → /*/*                     (301)

# Common misspellings
/proiodata/*       → /proionta/*              (301)
/produkta/*        → /proionta/*              (301)

# Deleted products → Category
/proionta/*/deleted-product → /proionta/*/   (301)

# Out of stock → Search
# (handled in application logic)
```

### 13.3 Redirect Implementation (Next.js)

```javascript
// next.config.js
module.exports = {
  async redirects() {
    return [
      // Old English structure
      {
        source: '/products/:path*',
        destination: '/proionta/:path*',
        permanent: true,
      },
      // Trailing slashes
      {
        source: '/:path+/',
        destination: '/:path+',
        permanent: true,
      },
      // HTML extensions
      {
        source: '/:path*.html',
        destination: '/:path*',
        permanent: true,
      },
      // Language prefix (Greek is default)
      {
        source: '/el/:path*',
        destination: '/:path*',
        permanent: true,
      },
    ];
  },
};
```

### 13.4 Error Page Status Codes

| Error | Status | Page | Behavior |
|-------|--------|------|----------|
| Page not found | 404 | /404 | Show search, popular products |
| Server error | 500 | /500 | Apologize, contact info |
| Maintenance | 503 | /maintenance | Estimated return time |
| Forbidden | 403 | /403 | Login prompt if applicable |
| Product unavailable | 410 | Custom | Suggest alternatives |

---

## Appendix: XML Sitemap Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- Homepage -->
  <url>
    <loc>https://pavlicevits.gr/</loc>
    <xhtml:link rel="alternate" hreflang="el" href="https://pavlicevits.gr/"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://pavlicevits.gr/en/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://pavlicevits.gr/"/>
    <lastmod>2026-02-15</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Category page with image -->
  <url>
    <loc>https://pavlicevits.gr/proionta/vafes/</loc>
    <xhtml:link rel="alternate" hreflang="el" href="https://pavlicevits.gr/proionta/vafes/"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://i.ytimg.com/vi/4SxczXEVSgk/mqdefault.jpg>
    <lastmod>2026-02-14</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <image:image>
      <image:loc>https://d1ymz67w5raq8g.cloudfront.net/Pictures/2000xAny/8/3/7/516837_gettyimages471258645_801524.jpg</image:loc>
      <image:title>Βαφές - Pavlicevits</image:title>
    </image:image>
  </url>
  
  <!-- Product page -->
  <url>
    <loc>https://pavlicevits.gr/proionta/vafes/vases-aftokinitou/hb-body-p961/</loc>
    <lastmod>2026-02-10</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>https://i.ytimg.com/vi/reVmSuYQr9U/maxresdefault.jpg</image:loc>
      <image:title>HB Body P961 Clear Coat</image:title>
    </image:image>
  </url>
  
</urlset>
```

---

*Document prepared by DeepAgent | February 2026*  
*For Pavlicevits E-Shop Blueprint Development*
