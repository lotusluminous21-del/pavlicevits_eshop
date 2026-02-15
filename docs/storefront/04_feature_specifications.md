# Pavlicevits E-Shop: Feature Specifications

**Document Version:** 1.0  
**Date:** February 15, 2026  
**Status:** Final Specification  
**Purpose:** Detailed feature specifications for all e-shop functionality

---

## Table of Contents
1. [Homepage Features](#1-homepage-features)
2. [Product Listing Page (PLP)](#2-product-listing-page-plp)
3. [Product Detail Page (PDP)](#3-product-detail-page-pdp)
4. [Vehicle Color Code Lookup](#4-vehicle-color-code-lookup)
5. [Paint Calculator](#5-paint-calculator)
6. [Shopping Cart](#6-shopping-cart)
7. [Checkout Flow](#7-checkout-flow)
8. [User Account](#8-user-account)
9. [Search & Autocomplete](#9-search--autocomplete)
10. [Wishlist & Favorites](#10-wishlist--favorites)
11. [Reviews & Ratings](#11-reviews--ratings)
12. [Product Recommendations](#12-product-recommendations)
13. [Live Chat & Support](#13-live-chat--support)
14. [Professional Account Features](#14-professional-account-features)

---

## 1. Homepage Features

### 1.1 Hero Section

**User Story:** As a visitor, I want to immediately understand what Pavlicevits offers and access key actions.

**Specification:**

```typescript
interface HeroSection {
  layout: 'full-width-image' | 'split-content';
  
  primarySlide: {
    headline: string;          // "Χρώματα & Βερνίκια για κάθε έργο"
    subheadline: string;       // "40+ χρόνια εμπειρίας στη Θεσσαλονίκη"
    primaryCTA: {
      text: string;            // "Δείτε τα Προϊόντα"
      href: string;            // "/proionta/"
    };
    secondaryCTA: {
      text: string;            // "Βρείτε το Χρώμα σας"
      href: string;            // "/vres-xroma/"
    };
    backgroundImage: string;
    mobileBackgroundImage: string;
  };
  
  carousel?: {
    enabled: boolean;
    autoPlay: boolean;
    interval: number;          // 5000ms
    slides: HeroSlide[];
    indicators: boolean;
    navigation: boolean;
  };
}
```

**Visual Layout:**
```
Desktop:
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│        [Background Image with overlay]                                  │
│                                                                         │
│        Χρώματα & Βερνίκια                                              │
│        για κάθε έργο                                                    │
│                                                                         │
│        40+ χρόνια εμπειρίας στη Θεσσαλονίκη                            │
│                                                                         │
│        [Δείτε τα Προϊόντα]   [Βρείτε το Χρώμα σας]                     │
│                                                                         │
│        ● ○ ○                                                            │
└─────────────────────────────────────────────────────────────────────────┘

Mobile:
┌─────────────────────────────────┐
│    [Background Image]          │
│                                 │
│    Χρώματα & Βερνίκια          │
│    για κάθε έργο               │
│                                 │
│    [Δείτε τα Προϊόντα]         │
│    [Βρείτε το Χρώμα σας]       │
│                                 │
└─────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Hero loads within 2.5s (LCP target)
- [ ] Background image is responsive and optimized (WebP)
- [ ] CTAs are above the fold on all devices
- [ ] Carousel auto-advances but pauses on hover/focus
- [ ] Keyboard accessible (arrow keys for navigation)

---

### 1.2 Category Navigation Grid

**User Story:** As a visitor, I want to quickly browse main product categories visually.

**Specification:**

```typescript
interface CategoryGrid {
  layout: 'grid' | 'carousel';
  columns: {
    mobile: 2;
    tablet: 3;
    desktop: 4;
  };
  
  categories: CategoryCard[];
}

interface CategoryCard {
  id: string;
  title: string;           // "Βαφές"
  titleEn: string;         // "Paints"
  description?: string;    // "Αυτοκινήτου, σπιτιού, επαγγελματικές"
  image: string;
  href: string;            // "/proionta/vafes/"
  productCount?: number;
  badge?: string;          // "Δημοφιλής"
}
```

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ΠΕΡΙΗΓΗΘΕΙΤΕ ΣΤΙΣ ΚΑΤΗΓΟΡΙΕΣ                                          │
│                                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │    [img]     │ │    [img]     │ │    [img]     │ │    [img]     │   │
│  │              │ │              │ │              │ │              │   │
│  │    Βαφές     │ │   Αστάρια    │ │  Βερνίκια    │ │    Spray     │   │
│  │   (156)      │ │    (89)      │ │    (45)      │ │   (234)      │   │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │
│                                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │    [img]     │ │    [img]     │ │    [img]     │ │    [img]     │   │
│  │              │ │              │ │              │ │              │   │
│  │   Στόκοι     │ │  Διαλυτικά   │ │  Εξοπλισμός  │ │  Αναλώσιμα   │   │
│  │    (67)      │ │    (34)      │ │    (78)      │ │   (123)      │   │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 1.3 Featured Products Section

**User Story:** As a visitor, I want to see popular and featured products.

**Specification:**

```typescript
interface FeaturedProductsSection {
  title: string;                    // "Δημοφιλή Προϊόντα"
  tabs: {
    id: string;
    label: string;
    filter: ProductFilter;
  }[];
  
  productsPerPage: {
    mobile: 2;
    tablet: 3;
    desktop: 5;
  };
  
  showMoreLink: {
    text: string;                   // "Δείτε Όλα"
    href: string;
  };
}

// Tab examples
const tabs = [
  { id: 'bestsellers', label: 'Δημοφιλή', filter: { sort: 'bestselling' } },
  { id: 'new', label: 'Νέα', filter: { sort: 'newest' } },
  { id: 'offers', label: 'Προσφορές', filter: { onSale: true } },
];
```

---

### 1.4 Color Finder CTA Banner

**User Story:** As a visitor, I want easy access to the vehicle color lookup feature.

**Specification:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🎨                                                                     │
│  ΒΡΕΙΤΕ ΤΟ ΧΡΩΜΑ ΤΟΥ ΟΧΗΜΑΤΟΣ ΣΑΣ                                      │
│                                                                         │
│  Χρησιμοποιήστε τον αριθμό πλαισίου (VIN) ή τον κωδικό χρώματος        │
│  για να βρείτε ακριβώς τη σωστή βαφή.                                  │
│                                                                         │
│  [Ξεκινήστε Τώρα →]                                                    │
│                                                                         │
│  [img: color swatches illustration]                                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 1.5 Trust Signals Bar

**User Story:** As a visitor, I want to see indicators that build confidence in the store.

```typescript
interface TrustSignal {
  icon: string;
  title: string;
  description: string;
}

const trustSignals: TrustSignal[] = [
  {
    icon: 'Truck',
    title: 'Δωρεάν Αποστολή',
    description: 'Για αγορές άνω των €50',
  },
  {
    icon: 'Shield',
    title: 'Ασφαλής Πληρωμή',
    description: 'Κάρτα, PayPal, Αντικαταβολή',
  },
  {
    icon: 'Clock',
    title: '40+ Χρόνια Εμπειρίας',
    description: 'Αξιοπιστία από το 1985',
  },
  {
    icon: 'Headphones',
    title: 'Τεχνική Υποστήριξη',
    description: '2310-XXX-XXX',
  },
];
```

---

## 2. Product Listing Page (PLP)

### 2.1 Overview

**User Story:** As a shopper, I want to browse products by category with filtering and sorting options.

### 2.2 Header Section

```typescript
interface PLPHeader {
  breadcrumb: BreadcrumbItem[];
  
  title: string;                      // Category name
  description?: string;               // SEO description
  productCount: number;               // "156 προϊόντα"
  
  banner?: {
    image: string;
    title: string;
    description: string;
  };
}
```

### 2.3 Toolbar

```typescript
interface PLPToolbar {
  viewToggle: {
    options: ['grid', 'list'];
    default: 'grid';
  };
  
  sortOptions: {
    id: string;
    label: string;
    sortField: string;
    sortOrder: 'asc' | 'desc';
  }[];
  
  resultsPerPage: number[];           // [24, 48, 96]
  
  filterToggle: {
    mobileLabel: string;              // "Φίλτρα"
    activeFilterCount: number;
  };
}

const sortOptions = [
  { id: 'relevance', label: 'Σχετικότητα', sortField: 'relevance', sortOrder: 'desc' },
  { id: 'price_asc', label: 'Τιμή: Χαμηλή → Υψηλή', sortField: 'price', sortOrder: 'asc' },
  { id: 'price_desc', label: 'Τιμή: Υψηλή → Χαμηλή', sortField: 'price', sortOrder: 'desc' },
  { id: 'newest', label: 'Νεότερα', sortField: 'created_at', sortOrder: 'desc' },
  { id: 'bestselling', label: 'Δημοφιλία', sortField: 'sales_count', sortOrder: 'desc' },
  { id: 'rating', label: 'Αξιολόγηση', sortField: 'avg_rating', sortOrder: 'desc' },
];
```

### 2.4 Filter Sidebar

```typescript
interface FilterSidebar {
  position: 'left' | 'right';
  sticky: boolean;
  collapsible: boolean;
  
  filters: Filter[];
  
  actions: {
    clearAll: {
      label: string;              // "Καθαρισμός Όλων"
      visible: boolean;           // Only when filters active
    };
    apply: {
      label: string;              // "Εφαρμογή" (mobile only)
    };
  };
}

interface Filter {
  id: string;
  type: 'checkbox' | 'radio' | 'range' | 'color' | 'size';
  label: string;
  expanded: boolean;              // Default expanded state
  searchable?: boolean;           // For long lists
  showCount?: boolean;            // Show product count per option
  options?: FilterOption[];
  range?: {
    min: number;
    max: number;
    step: number;
    unit?: string;                // "€"
  };
}

interface FilterOption {
  value: string;
  label: string;
  count?: number;
  color?: string;                 // For color swatches
  disabled?: boolean;             // If no products match
}
```

**Filter Configuration for Paint Products:**

```typescript
const paintFilters: Filter[] = [
  {
    id: 'price',
    type: 'range',
    label: 'Τιμή',
    expanded: true,
    range: { min: 0, max: 500, step: 5, unit: '€' },
  },
  {
    id: 'brand',
    type: 'checkbox',
    label: 'Μάρκα',
    expanded: true,
    searchable: true,
    showCount: true,
    options: [
      { value: 'hb-body', label: 'HB Body', count: 145 },
      { value: 'sikkens', label: 'Sikkens', count: 89 },
      { value: 'cromax', label: 'Cromax', count: 67 },
      { value: '3m', label: '3M', count: 45 },
      // ...
    ],
  },
  {
    id: 'product_line',
    type: 'checkbox',
    label: 'Σειρά Προϊόντων',
    expanded: true,
    options: [
      { value: 'pro', label: 'PRO', count: 56 },
      { value: 'series6', label: 'Series 6', count: 78 },
      { value: 'standard', label: 'Standard', count: 123 },
    ],
  },
  {
    id: 'type',
    type: 'checkbox',
    label: 'Τύπος',
    expanded: true,
    options: [
      { value: '1k', label: '1K (Μονοσυστατικό)', count: 89 },
      { value: '2k', label: '2K (Δισυστατικό)', count: 156 },
      { value: 'spray', label: 'Spray', count: 234 },
    ],
  },
  {
    id: 'availability',
    type: 'radio',
    label: 'Διαθεσιμότητα',
    expanded: false,
    options: [
      { value: 'all', label: 'Όλα τα Προϊόντα' },
      { value: 'in_stock', label: 'Μόνο Διαθέσιμα' },
    ],
  },
  {
    id: 'size',
    type: 'checkbox',
    label: 'Μέγεθος',
    expanded: false,
    options: [
      { value: '400ml', label: '400ml', count: 89 },
      { value: '1l', label: '1L', count: 123 },
      { value: '4l', label: '4L', count: 67 },
      { value: '20l', label: '20L', count: 23 },
    ],
  },
];
```

### 2.5 Product Grid/List

```typescript
interface ProductGrid {
  layout: 'grid' | 'list';
  
  gridColumns: {
    mobile: 2;
    tablet: 3;
    desktop: 4;
    wide: 5;
  };
  
  cardVariant: 'compact' | 'standard' | 'detailed';
  
  pagination: {
    type: 'numbered' | 'load_more' | 'infinite_scroll';
    itemsPerPage: number;
    showPageInfo: boolean;         // "Σελίδα 2 από 13"
  };
}
```

### 2.6 Product Card Component

```typescript
interface ProductCard {
  // Data
  id: string;
  handle: string;
  title: string;
  vendor: string;                   // Brand
  price: Money;
  compareAtPrice?: Money;           // Original price if on sale
  images: ProductImage[];
  rating?: {
    average: number;
    count: number;
  };
  availability: 'in_stock' | 'low_stock' | 'out_of_stock' | 'preorder';
  badges: ProductBadge[];
  
  // Actions
  quickView: boolean;               // Enable quick view modal
  addToCart: boolean;               // Show add to cart button
  addToWishlist: boolean;
}

interface ProductBadge {
  type: 'sale' | 'new' | 'bestseller' | 'pro' | 'limited' | 'custom';
  text: string;
  color?: string;
}
```

**Product Card Visual:**
```
┌────────────────────────────┐
│  [SALE -20%]     [♡]      │
│  ┌────────────────────┐   │
│  │                    │   │
│  │    [Product        │   │
│  │     Image]         │   │
│  │                    │   │
│  └────────────────────┘   │
│                           │
│  HB Body                  │  ← Vendor/Brand
│  P961 Clear Coat 2K HS    │  ← Title (2 lines max)
│  ★★★★☆ (23)              │  ← Rating
│                           │
│  €39.90  €49.90           │  ← Price + Compare at
│                           │
│  [Προσθήκη στο Καλάθι]    │  ← Add to Cart
└────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Product cards load with skeleton placeholders
- [ ] Images lazy load with blur-up placeholder
- [ ] Hover shows secondary image (if available)
- [ ] Add to cart triggers mini-cart slide-in
- [ ] Quick view opens modal with full product info
- [ ] Mobile: 2 columns, no hover states, tap for actions
- [ ] Out of stock products show "Εξαντλημένο" badge

---

## 3. Product Detail Page (PDP)

### 3.1 Overview

**User Story:** As a shopper, I want complete product information to make a purchase decision.

### 3.2 Page Structure

```typescript
interface ProductDetailPage {
  breadcrumb: BreadcrumbItem[];
  
  mainSection: {
    gallery: ProductGallery;
    info: ProductInfo;
  };
  
  tabs: ProductTab[];
  
  relatedProducts: ProductSection;
  recentlyViewed: ProductSection;
}
```

### 3.3 Product Gallery

```typescript
interface ProductGallery {
  mainImage: {
    zoom: boolean;                  // Enable zoom on hover/tap
    zoomType: 'hover' | 'click' | 'lightbox';
  };
  
  thumbnails: {
    position: 'bottom' | 'left';
    scrollable: boolean;
    maxVisible: number;
  };
  
  video?: {
    enabled: boolean;
    autoplay: boolean;
    thumbnail: string;
  };
  
  mobileSwipe: boolean;
  indicators: boolean;              // Dots for mobile carousel
}
```

**Visual Layout:**
```
Desktop:
┌─────────────────────────────────────────────────────────────────────────┐
│  [Thumb 1]  ┌─────────────────────────────────────────────────────┐     │
│  [Thumb 2]  │                                                     │     │
│  [Thumb 3]  │              [Main Product Image]                   │     │
│  [Thumb 4]  │                   (zoomable)                        │     │
│  [▶ Video]  │                                                     │     │
│             └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘

Mobile:
┌─────────────────────────────────┐
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │    [Swipeable Gallery]    │  │
│  │                           │  │
│  └───────────────────────────┘  │
│         ● ○ ○ ○ ○              │
└─────────────────────────────────┘
```

### 3.4 Product Info Section

```typescript
interface ProductInfo {
  // Header
  vendor: string;                   // Brand name with link
  title: string;
  sku: string;
  
  // Rating
  rating?: {
    average: number;
    count: number;
    link: string;                   // Scroll to reviews
  };
  
  // Price
  price: Money;
  compareAtPrice?: Money;
  pricePerUnit?: {
    amount: string;
    unit: string;                   // "€15.90/L"
  };
  vatIncluded: boolean;
  
  // Availability
  availability: {
    status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'preorder';
    quantity?: number;              // Show if < 5
    restockDate?: Date;             // For preorder
    deliveryEstimate?: string;      // "Παράδοση σε 1-3 ημέρες"
  };
  
  // Short description
  shortDescription?: string;
  
  // Variants
  variants?: ProductVariant[];
  
  // Quantity & Actions
  quantitySelector: {
    min: number;
    max: number;
    step: number;
  };
  
  actions: {
    addToCart: boolean;
    buyNow: boolean;
    addToWishlist: boolean;
    share: boolean;
  };
  
  // Trust signals
  trustSignals: TrustSignal[];
}
```

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  HB Body                                              ← Brand link      │
│                                                                         │
│  P961 Clear Coat 2K HS High Solid 2:1                ← Title           │
│                                                                         │
│  SKU: HB-P961-1L                                     ← SKU             │
│  ★★★★☆ 4.5 (23 αξιολογήσεις)                        ← Rating          │
│                                                                         │
│  €39.90  €49.90                                      ← Price           │
│  (€39.90/L, με ΦΠΑ)                                  ← Price per unit  │
│                                                                         │
│  ✓ Διαθέσιμο - Παράδοση σε 1-3 ημέρες               ← Availability    │
│                                                                         │
│  Μέγεθος:                                           ← Variants         │
│  [1L (€39.90)] [4L (€129.90)] [Σετ με Σκληρυντή]                       │
│                                                                         │
│  Ποσότητα:  [−] 1 [+]                               ← Quantity         │
│                                                                         │
│  [🛒 Προσθήκη στο Καλάθι]                           ← Add to Cart      │
│  [⚡ Αγορά Τώρα]                                    ← Buy Now          │
│                                                                         │
│  [♡ Προσθήκη στα Αγαπημένα]  [↗ Κοινοποίηση]       ← Secondary actions│
│                                                                         │
│  ──────────────────────────────────────────────────                    │
│                                                                         │
│  🚚 Δωρεάν αποστολή για αγορές άνω των €50                             │
│  🔒 Ασφαλής πληρωμή                                                    │
│  ↩️ Επιστροφή εντός 14 ημερών                                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.5 Product Tabs

```typescript
interface ProductTab {
  id: string;
  label: string;
  content: TabContent;
}

const productTabs: ProductTab[] = [
  {
    id: 'description',
    label: 'Περιγραφή',
    content: {
      type: 'html',
      data: productDescription,
    },
  },
  {
    id: 'specifications',
    label: 'Τεχνικά Χαρακτηριστικά',
    content: {
      type: 'table',
      data: specifications,
    },
  },
  {
    id: 'documents',
    label: 'TDS/MSDS',
    content: {
      type: 'downloads',
      data: documents,
    },
  },
  {
    id: 'howto',
    label: 'Οδηγίες Χρήσης',
    content: {
      type: 'video_and_text',
      data: howToContent,
    },
  },
  {
    id: 'reviews',
    label: 'Αξιολογήσεις (23)',
    content: {
      type: 'reviews',
      data: reviews,
    },
  },
];
```

**Specifications Table Example:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│  ΤΕΧΝΙΚΑ ΧΑΡΑΚΤΗΡΙΣΤΙΚΑ                                                │
├─────────────────────────────────────────────────────────────────────────┤
│  Τύπος                    │  2K Ακρυλικό Βερνίκι HS                     │
│  Αναλογία Μίξης           │  2:1 (με σκληρυντή P962)                    │
│  Χρόνος Στεγνώματος       │  20-30 λεπτά (στο άγγιγμα)                  │
│  Χρόνος Σκλήρυνσης        │  24 ώρες (20°C)                             │
│  Pot Life                 │  4-6 ώρες                                   │
│  VOC                      │  420 g/L                                    │
│  Στερεά κ.β.              │  52% ± 2                                    │
│  Κάλυψη                   │  8-10 m²/L                                  │
│  Μέγεθος Μπεκ             │  1.3-1.4 mm                                 │
│  Πίεση Εφαρμογής          │  1.8-2.0 bar                                │
│  Συμβατό Αστάρι           │  P980, P981, P982                           │
│  Συσκευασίες              │  1L, 4L                                     │
│  Χώρα Παραγωγής           │  Ελλάδα                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Vehicle Color Code Lookup

### 4.1 Feature Overview

**User Story:** As a customer looking for automotive paint, I want to find the exact color code for my vehicle using VIN or manufacturer/model selection.

### 4.2 Detailed Specification

```typescript
interface ColorCodeLookup {
  // VIN Lookup
  vinLookup: {
    enabled: boolean;
    api: {
      provider: 'vinaudit' | 'carapi' | 'custom';
      endpoint: string;
      rateLimit: number;            // requests per minute
      cacheResults: boolean;
    };
    
    validation: {
      length: 17;
      regex: /^[A-HJ-NPR-Z0-9]{17}$/;
      errorMessage: string;
    };
    
    fallback: {
      enabled: boolean;
      message: string;              // "Ο κωδικός δεν βρέθηκε. Δοκιμάστε χειροκίνητη αναζήτηση."
    };
  };
  
  // Direct Code Search
  codeSearch: {
    enabled: boolean;
    fuzzyMatching: boolean;
    minLength: 2;
    showSuggestions: boolean;
  };
  
  // Manual Lookup Guide
  manualGuide: {
    enabled: boolean;
    manufacturers: ManufacturerGuide[];
  };
  
  // Results
  results: {
    showColorSwatch: boolean;
    showProducts: boolean;
    showAlternatives: boolean;      // Similar colors
    bundleOffer: boolean;           // Suggest complete kit
  };
}

interface ManufacturerGuide {
  id: string;
  name: string;                     // "Volkswagen"
  logo?: string;
  codeLocation: string;             // Description of where to find code
  codeLocationImage: string;        // Image showing location
  codeFormat: string;               // "LY9T, LA7W"
  exampleCode: string;
  models?: {
    name: string;
    years: string;
    specificLocation?: string;
  }[];
}
```

### 4.3 UX Flow

```
Step 1: Choose Method
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                   🎨 ΒΡΕΙΤΕ ΤΟ ΧΡΩΜΑ ΣΑΣ                               │
│                                                                         │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐           │
│  │   Αριθμός VIN   │ │  Κωδικός        │ │   Πού είναι ο   │           │
│  │                 │ │  Χρώματος       │ │   κωδικός;      │           │
│  │   [17 chars]    │ │  [Search...]    │ │   [Select ▼]    │           │
│  │                 │ │                 │ │                 │           │
│  │  [Αναζήτηση]    │ │  [Αναζήτηση]    │ │  [Δείξε μου]    │           │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

Step 2A: VIN Results (Success)
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ✅ Βρέθηκε!                                                           │
│                                                                         │
│  Volkswagen Golf 2019                                                  │
│  Κωδικός Χρώματος: LY9T                                                │
│  Όνομα: Oryx White Pearl                                               │
│                                                                         │
│  [████████████████████]  ← Color swatch                                │
│                                                                         │
│  ──────────────────────────────────────────────────────────────────    │
│                                                                         │
│  📦 Προτεινόμενα Προϊόντα για LY9T:                                    │
│                                                                         │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────────────┐   │
│  │ Basecoat   │ │ Clear Coat │ │ Primer     │ │ ⭐ Πλήρες Κιτ     │   │
│  │ LY9T       │ │ P961       │ │ P980       │ │    Εξοικονόμηση   │   │
│  │            │ │            │ │            │ │    €25!           │   │
│  │ €65.00     │ │ €45.00     │ │ €38.00     │ │    €123.00        │   │
│  │ [+ Καλάθι] │ │ [+ Καλάθι] │ │ [+ Καλάθι] │ │    [+ Καλάθι]     │   │
│  └────────────┘ └────────────┘ └────────────┘ └────────────────────┘   │
│                                                                         │
│  💬 Χρειάζεστε βοήθεια; [Chat με εμάς]                                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

Step 2B: VIN Results (Not Found - Fallback)
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ⚠️ Ο κωδικός χρώματος δεν βρέθηκε αυτόματα                            │
│                                                                         │
│  Μην ανησυχείτε! Μπορείτε να βρείτε τον κωδικό στο αυτοκίνητό σας:    │
│                                                                         │
│  Volkswagen                                                            │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  [Image: VW door jamb with color code highlighted]              │   │
│  │                                                                 │   │
│  │  Ο κωδικός βρίσκεται στην κάσα της πόρτας του οδηγού           │   │
│  │  σε μια ετικέτα κοντά στο κλείδωμα.                            │   │
│  │                                                                 │   │
│  │  Μορφή κωδικού: LY9T, LA7W κλπ.                                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Βρήκατε τον κωδικό; Εισάγετέ τον εδώ:                                │
│  ┌───────────────────────────────────────┐                             │
│  │                                       │ [Αναζήτηση]                 │
│  └───────────────────────────────────────┘                             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.4 Error Handling

| Scenario | Error Message | Recovery Action |
|----------|---------------|-----------------|
| Invalid VIN format | "Ο αριθμός πλαισίου πρέπει να είναι 17 χαρακτήρες" | Highlight field, show format hint |
| VIN not found in DB | "Ο κωδικός δεν βρέθηκε" | Show manual lookup guide |
| Color code not in catalog | "Δεν έχουμε αυτό το χρώμα σε απόθεμα" | Show contact for special order |
| API timeout | "Υπήρξε πρόβλημα. Δοκιμάστε ξανά." | Retry button, fallback to manual |
| Rate limit exceeded | "Πολλές αναζητήσεις. Περιμένετε λίγο." | Show countdown timer |

---

## 5. Paint Calculator

### 5.1 Feature Overview

**User Story:** As a customer, I want to calculate how much paint I need based on the area I want to cover.

### 5.2 Specification

```typescript
interface PaintCalculator {
  inputs: {
    area: {
      type: 'dimensions' | 'direct_sqm';
      
      dimensions?: {
        length: { unit: 'cm' | 'm'; min: 1; max: 1000 };
        width: { unit: 'cm' | 'm'; min: 1; max: 1000 };
        height?: { unit: 'cm' | 'm'; min: 1; max: 500 }; // For rooms
      };
      
      directSqm?: {
        min: 0.1;
        max: 500;
      };
    };
    
    coats: {
      min: 1;
      max: 5;
      default: 2;
    };
    
    productId?: string;             // Selected product
  };
  
  calculation: {
    coveragePerLiter: number;       // m²/L from product specs
    wastePercent: number;           // Default 10%
  };
  
  output: {
    totalArea: number;              // m²
    paintNeeded: number;            // Liters
    recommendedSize: ProductSize;   // "4L" 
    numberOfCans: number;
    totalCost: number;
  };
}
```

### 5.3 Calculator UI

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  🧮 ΥΠΟΛΟΓΙΣΤΗΣ ΠΟΣΟΤΗΤΑΣ ΒΑΦΗΣ                                        │
│                                                                         │
│  ──────────────────────────────────────────────────────────────────    │
│                                                                         │
│  Επιφάνεια προς βαφή:                                                  │
│                                                                         │
│  ○ Εισαγωγή διαστάσεων                                                 │
│  ● Γνωρίζω τα τετραγωνικά μέτρα                                        │
│                                                                         │
│  Τετραγωνικά μέτρα: [____15____] m²                                    │
│                                                                         │
│  Αριθμός χεριών:    [−] 2 [+]                                          │
│                                                                         │
│  Προϊόν: HB Body P961 Clear Coat (κάλυψη: 8-10 m²/L)                   │
│                                                                         │
│  [Υπολογισμός]                                                         │
│                                                                         │
│  ──────────────────────────────────────────────────────────────────    │
│                                                                         │
│  📊 ΑΠΟΤΕΛΕΣΜΑ                                                         │
│                                                                         │
│  Συνολική επιφάνεια:       30 m² (15m² × 2 χέρια)                      │
│  Βαφή που χρειάζεστε:      ~3.3 L (+10% απώλεια)                       │
│                                                                         │
│  ✅ Προτείνουμε: 1 × 4L συσκευασία                                     │
│                                                                         │
│  ┌────────────────────────────────┐                                    │
│  │  [img]  P961 Clear Coat 4L    │                                    │
│  │         €129.90               │                                    │
│  │         [Προσθήκη στο Καλάθι] │                                    │
│  └────────────────────────────────┘                                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Shopping Cart

### 6.1 Cart Drawer (Mini Cart)

**User Story:** As a shopper, I want to quickly view and manage my cart without leaving the current page.

```typescript
interface CartDrawer {
  trigger: 'click' | 'hover';
  position: 'right';
  width: '400px';
  
  header: {
    title: string;                  // "Καλάθι"
    itemCount: boolean;
    closeButton: boolean;
  };
  
  body: {
    emptyState: {
      message: string;              // "Το καλάθι σας είναι άδειο"
      cta: {
        text: string;               // "Ξεκινήστε τις αγορές"
        href: string;
      };
    };
    
    items: CartItem[];
    
    maxVisibleItems: number;        // Before scroll
  };
  
  footer: {
    subtotal: boolean;
    freeShippingProgress?: {
      threshold: number;            // €50
      message: string;              // "Απομένουν €X για δωρεάν αποστολή"
    };
    
    actions: {
      viewCart: { text: string; href: string };
      checkout: { text: string; href: string };
    };
  };
}

interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  title: string;
  variantTitle?: string;
  image: string;
  price: Money;
  compareAtPrice?: Money;
  quantity: number;
  maxQuantity: number;
  
  actions: {
    updateQuantity: boolean;
    remove: boolean;
    saveForLater: boolean;
  };
}
```

**Cart Drawer Visual:**
```
┌────────────────────────────────────┐
│  Καλάθι (3)               [X]     │
├────────────────────────────────────┤
│                                    │
│  ┌──────┐  P961 Clear Coat        │
│  │[img] │  1L                     │
│  │      │  €39.90                 │
│  └──────┘  [−] 1 [+]  [🗑]        │
│                                    │
│  ──────────────────────────────   │
│                                    │
│  ┌──────┐  P962 Hardener          │
│  │[img] │  500ml                  │
│  │      │  €19.90                 │
│  └──────┘  [−] 1 [+]  [🗑]        │
│                                    │
│  ──────────────────────────────   │
│                                    │
│  ┌──────┐  Masking Tape 50mm      │
│  │[img] │                         │
│  │      │  €4.50                  │
│  └──────┘  [−] 2 [+]  [🗑]        │
│                                    │
├────────────────────────────────────┤
│                                    │
│  ████████████░░░░░░░░ €36 ακόμη   │
│  για δωρεάν αποστολή!             │
│                                    │
│  Υποσύνολο:           €68.80      │
│                                    │
│  [Δείτε το Καλάθι]                │
│  [Ολοκλήρωση Αγοράς →]            │
│                                    │
└────────────────────────────────────┘
```

### 6.2 Cart Page

```typescript
interface CartPage {
  url: '/kalathi/';
  
  layout: {
    main: 'items_list';
    sidebar: 'order_summary';
  };
  
  features: {
    quantityUpdate: boolean;
    itemRemoval: boolean;
    saveForLater: boolean;
    couponCode: boolean;
    giftWrapping: boolean;
    estimatedDelivery: boolean;
    crossSell: boolean;
  };
}
```

---

## 7. Checkout Flow

### 7.1 Checkout Types

```typescript
type CheckoutType = 'guest' | 'registered' | 'express';

interface CheckoutConfiguration {
  guestCheckout: {
    enabled: true;
    createAccountPrompt: boolean;   // Offer account creation at end
  };
  
  expressCheckout: {
    enabled: true;
    providers: ['shop_pay', 'apple_pay', 'google_pay', 'paypal'];
  };
  
  steps: CheckoutStep[];
}
```

### 7.2 Checkout Steps

```typescript
const checkoutSteps: CheckoutStep[] = [
  {
    id: 'contact',
    label: 'Στοιχεία Επικοινωνίας',
    labelEn: 'Contact',
    fields: [
      { name: 'email', type: 'email', required: true },
      { name: 'phone', type: 'tel', required: true },
      { name: 'newsletter', type: 'checkbox', required: false },
    ],
  },
  {
    id: 'shipping',
    label: 'Στοιχεία Αποστολής',
    labelEn: 'Shipping',
    fields: [
      { name: 'firstName', type: 'text', required: true },
      { name: 'lastName', type: 'text', required: true },
      { name: 'company', type: 'text', required: false },
      { name: 'address', type: 'text', required: true },
      { name: 'apartment', type: 'text', required: false },
      { name: 'city', type: 'text', required: true },
      { name: 'postalCode', type: 'text', required: true },
      { name: 'region', type: 'select', required: true },
    ],
    shippingMethods: ShippingMethod[],
  },
  {
    id: 'payment',
    label: 'Πληρωμή',
    labelEn: 'Payment',
    paymentMethods: PaymentMethod[],
    billingAddress: 'same_as_shipping' | 'different',
  },
  {
    id: 'review',
    label: 'Επιβεβαίωση',
    labelEn: 'Review',
    editable: true,
  },
];
```

### 7.3 Payment Methods

```typescript
const paymentMethods: PaymentMethod[] = [
  {
    id: 'card',
    label: 'Πιστωτική/Χρεωστική Κάρτα',
    icon: ['visa', 'mastercard', 'maestro'],
    provider: 'viva_wallet',
    fees: 0,
  },
  {
    id: 'paypal',
    label: 'PayPal',
    icon: 'paypal',
    provider: 'paypal',
    fees: 0,
  },
  {
    id: 'bank_transfer',
    label: 'Τραπεζική Μεταφορά',
    icon: 'bank',
    provider: 'manual',
    fees: 0,
    note: 'Η παραγγελία αποστέλλεται μετά την πίστωση',
  },
  {
    id: 'cod',
    label: 'Αντικαταβολή',
    icon: 'cash',
    provider: 'manual',
    fees: 2.50,
    note: 'Χρέωση €2.50',
    maxOrderValue: 200,
  },
];
```

### 7.4 Shipping Methods

```typescript
const shippingMethods: ShippingMethod[] = [
  {
    id: 'standard',
    label: 'Κανονική Αποστολή',
    carrier: 'ACS',
    deliveryEstimate: '2-4 εργάσιμες',
    price: 4.50,
    freeThreshold: 50,
  },
  {
    id: 'express',
    label: 'Ταχεία Αποστολή',
    carrier: 'ACS',
    deliveryEstimate: '1-2 εργάσιμες',
    price: 8.90,
    freeThreshold: null,
  },
  {
    id: 'sameday',
    label: 'Αυθημερόν (Θεσσαλονίκη)',
    carrier: 'BIZ Courier',
    deliveryEstimate: 'Σήμερα (παραγγελία πριν τις 14:00)',
    price: 5.90,
    freeThreshold: null,
    restrictions: {
      regions: ['Θεσσαλονίκη'],
      cutoffTime: '14:00',
    },
  },
  {
    id: 'pickup',
    label: 'Παραλαβή από Κατάστημα',
    carrier: null,
    deliveryEstimate: 'Έτοιμο σε 2 ώρες',
    price: 0,
    freeThreshold: 0,
    location: {
      address: 'Οδός Καλαμαριάς XX, 551XX',
      hours: 'Δευ-Παρ 09:00-18:00, Σάβ 09:00-14:00',
    },
  },
];
```

### 7.5 Checkout Validation

```typescript
interface CheckoutValidation {
  contact: {
    email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/; required: true };
    phone: { pattern: /^(\+30|0030)?[0-9]{10}$/; required: true };
  };
  
  shipping: {
    firstName: { minLength: 2; maxLength: 50; required: true };
    lastName: { minLength: 2; maxLength: 50; required: true };
    address: { minLength: 5; maxLength: 200; required: true };
    postalCode: { pattern: /^[0-9]{5}$/; required: true };
    city: { minLength: 2; maxLength: 100; required: true };
  };
  
  payment: {
    cardNumber: { provider: 'viva_wallet'; tokenized: true };
    billingAddress: { sameAsShipping: boolean };
  };
}
```

---

## 8. User Account

### 8.1 Account Dashboard

```typescript
interface AccountDashboard {
  sections: [
    {
      id: 'overview',
      label: 'Επισκόπηση',
      content: ['recent_orders', 'saved_addresses', 'quick_actions'],
    },
    {
      id: 'orders',
      label: 'Παραγγελίες',
      content: ['order_list', 'order_detail', 'track_order', 'reorder'],
    },
    {
      id: 'addresses',
      label: 'Διευθύνσεις',
      content: ['address_list', 'add_address', 'edit_address', 'set_default'],
    },
    {
      id: 'wishlist',
      label: 'Αγαπημένα',
      content: ['wishlist_items', 'move_to_cart', 'share_wishlist'],
    },
    {
      id: 'profile',
      label: 'Προφίλ',
      content: ['personal_info', 'password_change', 'email_preferences'],
    },
  ];
}
```

### 8.2 Order History

```typescript
interface OrderHistory {
  list: {
    itemsPerPage: 10;
    sortBy: 'date_desc';
    filters: ['status', 'date_range'];
  };
  
  orderCard: {
    fields: [
      'orderNumber',
      'date',
      'status',
      'total',
      'itemCount',
      'trackingLink',
    ];
    actions: ['view_details', 'track', 'reorder', 'request_return'];
  };
  
  orderDetail: {
    sections: [
      'order_summary',
      'items',
      'shipping_address',
      'billing_address',
      'payment_method',
      'timeline',
    ];
  };
}
```

---

## 9. Search & Autocomplete

### 9.1 Search Bar Specification

```typescript
interface SearchBar {
  placeholder: {
    el: 'Αναζήτηση προϊόντων...';
    en: 'Search products...';
  };
  
  autocomplete: {
    enabled: true;
    minChars: 2;
    debounceMs: 300;
    maxSuggestions: {
      products: 5;
      categories: 3;
      brands: 2;
      articles: 2;
    };
  };
  
  recentSearches: {
    enabled: true;
    maxItems: 5;
    storage: 'localStorage';
  };
  
  popularSearches: {
    enabled: true;
    maxItems: 5;
    source: 'analytics';
  };
  
  voiceSearch: {
    enabled: true;
    language: 'el-GR';
  };
}
```

### 9.2 Search Results

```typescript
interface SearchResults {
  filters: Filter[];                // Same as PLP
  sorting: SortOption[];
  
  results: {
    products: Product[];
    totalCount: number;
  };
  
  noResults: {
    message: string;                // "Δεν βρέθηκαν αποτελέσματα για '{query}'"
    suggestions: string[];          // Spelling corrections
    popularProducts: Product[];
    helpText: string;               // "Δοκιμάστε με λιγότερες λέξεις"
  };
}
```

---

## 10. Wishlist & Favorites

### 10.1 Specification

```typescript
interface Wishlist {
  storage: 'account' | 'localStorage';
  
  maxItems: 100;
  
  features: {
    multipleListsˡ false;           // Single wishlist for simplicity
    shareList: true;
    priceDropAlerts: true;
    backInStockAlerts: true;
  };
  
  actions: {
    addItem: boolean;
    removeItem: boolean;
    moveToCart: boolean;
    moveAllToCart: boolean;
  };
  
  guestBehavior: {
    storageMethod: 'localStorage';
    mergeOnLogin: true;
    promptToLogin: boolean;
  };
}
```

---

## 11. Reviews & Ratings

### 11.1 Review System

```typescript
interface ReviewSystem {
  moderation: {
    autoApprove: false;
    moderationQueue: true;
    profanityFilter: true;
  };
  
  submission: {
    requirePurchase: false;         // Verified Purchase badge if true
    allowAnonymous: false;
    requireLogin: true;
    
    fields: {
      rating: { required: true; min: 1; max: 5 };
      title: { required: false; maxLength: 100 };
      body: { required: true; minLength: 20; maxLength: 2000 };
      pros: { required: false; maxItems: 5 };
      cons: { required: false; maxItems: 5 };
      photos: { required: false; maxFiles: 5; maxSizeMb: 5 };
    };
  };
  
  display: {
    sortOptions: ['newest', 'highest', 'lowest', 'helpful'];
    filterByRating: true;
    showVerifiedBadge: true;
    helpfulVoting: true;
    ownerResponses: true;
  };
}
```

### 11.2 Review Display

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ΑΞΙΟΛΟΓΗΣΕΙΣ ΠΕΛΑΤΩΝ                                                  │
│                                                                         │
│  ┌─────────────────────────┐  ┌──────────────────────────────────────┐  │
│  │                         │  │ Γράψτε αξιολόγηση                    │  │
│  │   ★★★★☆  4.5/5          │  │                                      │  │
│  │   Βάσει 23 αξιολογήσεων │  │ [Γράψτε την αξιολόγησή σας]          │  │
│  │                         │  │                                      │  │
│  │   ★★★★★  ████████ 15    │  └──────────────────────────────────────┘  │
│  │   ★★★★☆  ████     5     │                                          │
│  │   ★★★☆☆  ██       2     │  Ταξινόμηση: [Πιο πρόσφατες ▼]          │
│  │   ★★☆☆☆  █        1     │  Φίλτρο: [Όλες] [5★] [4★] [3★]         │
│  │   ★☆☆☆☆            0     │                                          │
│  │                         │                                          │
│  └─────────────────────────┘                                          │
│                                                                         │
│  ──────────────────────────────────────────────────────────────────    │
│                                                                         │
│  ★★★★★  Εξαιρετικό βερνίκι                                            │
│  Γιώργος Π. | Επαληθευμένη Αγορά | 15/02/2026                         │
│                                                                         │
│  Χρησιμοποίησα το P961 για ολική βαφή καπό. Εξαιρετική γυαλάδα και    │
│  εύκολη εφαρμογή. Στέγνωσε γρήγορα χωρίς φυσαλίδες.                   │
│                                                                         │
│  👍 Πλεονεκτήματα: Γυαλάδα, Αντοχή, Εύκολη εφαρμογή                   │
│  👎 Μειονεκτήματα: Τιμή                                                │
│                                                                         │
│  [📷 Φωτογραφίες (2)]                                                  │
│                                                                         │
│  Ήταν χρήσιμο; [👍 12] [👎 1]                                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 12. Product Recommendations

### 12.1 Recommendation Types

```typescript
interface RecommendationEngine {
  types: {
    relatedProducts: {
      label: 'Σχετικά Προϊόντα';
      algorithm: 'same_category_similar_price';
      maxProducts: 8;
      placement: ['pdp'];
    };
    
    complementary: {
      label: 'Συχνά Αγοράζονται Μαζί';
      algorithm: 'bought_together';
      maxProducts: 4;
      placement: ['pdp', 'cart'];
    };
    
    recentlyViewed: {
      label: 'Είδατε Πρόσφατα';
      algorithm: 'user_history';
      maxProducts: 8;
      placement: ['pdp', 'homepage'];
    };
    
    trending: {
      label: 'Δημοφιλή Αυτή τη Στιγμή';
      algorithm: 'trending_sales';
      maxProducts: 8;
      placement: ['homepage', 'plp'];
    };
    
    personalized: {
      label: 'Προτάσεις για Εσάς';
      algorithm: 'collaborative_filtering';
      maxProducts: 8;
      placement: ['homepage', 'account'];
    };
  };
}
```

### 12.2 "Frequently Bought Together" Bundle

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ΣΥΧΝΑ ΑΓΟΡΑΖΟΝΤΑΙ ΜΑΖΙ                                                │
│                                                                         │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐                        │
│  │  [img]   │  +  │  [img]   │  +  │  [img]   │  =  €121.80           │
│  │ P961     │     │ P962     │     │ Masking  │     (Εξοικ. €6.00)    │
│  │ €39.90   │     │ €19.90   │     │ €8.00    │                        │
│  │          │     │          │     │          │                        │
│  │ ☑        │     │ ☑        │     │ ☐        │                        │
│  └──────────┘     └──────────┘     └──────────┘                        │
│                                                                         │
│  [Προσθήκη Επιλεγμένων στο Καλάθι]                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 13. Live Chat & Support

### 13.1 Chat Specification

```typescript
interface LiveChat {
  provider: 'tidio' | 'intercom' | 'custom';
  
  availability: {
    hours: {
      weekdays: { start: '09:00', end: '18:00' };
      saturday: { start: '09:00', end: '14:00' };
      sunday: null;
    };
    timezone: 'Europe/Athens';
  };
  
  offlineMode: {
    showContactForm: true;
    showFAQLink: true;
    expectedResponseTime: '24 ώρες';
  };
  
  features: {
    fileSharing: true;
    imageSharing: true;
    productCards: true;             // Send product recommendations
    orderLookup: true;              // Agent can check order status
    chatHistory: true;
  };
  
  triggers: {
    proactiveChat: {
      enabled: true;
      delay: 30000;                 // 30 seconds on page
      pages: ['pdp', 'cart', 'color_finder'];
      message: 'Χρειάζεστε βοήθεια; Ρωτήστε μας!';
    };
  };
  
  bot: {
    enabled: true;
    handoffToHuman: true;
    commonQuestions: [
      { q: 'Ωράριο καταστήματος', a: '...' },
      { q: 'Κόστος αποστολής', a: '...' },
      { q: 'Τρόποι πληρωμής', a: '...' },
      { q: 'Παρακολούθηση παραγγελίας', a: '...' },
    ];
  };
}
```

---

## 14. Professional Account Features

### 14.1 B2B Account Specification

```typescript
interface ProfessionalAccount {
  registration: {
    requireApproval: true;
    requiredFields: [
      'companyName',
      'taxId',                       // ΑΦΜ
      'taxOffice',                   // ΔΟΥ
      'activity',                    // Δραστηριότητα (e.g., "Βαφείο Αυτοκινήτων")
      'estimatedMonthlyVolume',
    ];
  };
  
  pricing: {
    tieredDiscounts: {
      tier1: { name: 'Bronze', minMonthly: 100, discount: 5 };
      tier2: { name: 'Silver', minMonthly: 300, discount: 10 };
      tier3: { name: 'Gold', minMonthly: 500, discount: 15 };
      tier4: { name: 'Platinum', minMonthly: 1000, discount: 20 };
    };
    showRetailPrice: true;          // Cross out retail, show pro price
    customPriceLists: true;
  };
  
  ordering: {
    savedLists: {
      maxLists: 10;
      shareWithTeam: true;
    };
    quickOrderBySku: true;
    bulkUpload: {
      formats: ['csv', 'xlsx'];
      template: '/downloads/bulk-order-template.xlsx';
    };
    recurringOrders: {
      enabled: true;
      frequencies: ['weekly', 'biweekly', 'monthly'];
    };
  };
  
  payment: {
    creditTerms: {
      enabled: true;
      options: ['net_30', 'net_60'];
      creditLimitDefault: 1000;
    };
    invoicing: {
      automatic: true;
      format: 'pdf';
      aadeIntegration: true;
    };
  };
  
  support: {
    dedicatedManager: true;
    priorityPhone: true;
    whatsappChat: true;
  };
}
```

### 14.2 Professional Dashboard

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Καλωσήρθατε, AUTO COLORS                                  [Αποσύνδεση] │
│  Επίπεδο: Gold (15% έκπτωση)                                           │
│                                                                         │
├────────────────┬────────────────────────────────────────────────────────┤
│                │                                                        │
│  📊 Επισκόπηση│  Παραγγελίες Μήνα: €1,250.00                          │
│  📦 Παραγγελ. │  Υπολειπόμενη Πίστωση: €750.00                         │
│  📋 Λίστες    │  Επόμενο Επίπεδο (Platinum): €750 ακόμη                │
│  🧾 Τιμολόγια │                                                        │
│  📞 Υποστήριξη│  ┌──────────────────────────────────────────────────┐  │
│               │  │  Γρήγορη Παραγγελία με SKU                       │  │
│               │  │  ┌────────────────────────────────────────────┐  │  │
│               │  │  │  HB-P961-1L, 2                             │  │  │
│               │  │  │  HB-P962-500, 1                            │  │  │
│               │  │  │  ...                                       │  │  │
│               │  │  └────────────────────────────────────────────┘  │  │
│               │  │  [Προσθήκη στο Καλάθι]                          │  │  │
│               │  └──────────────────────────────────────────────────┘  │
│               │                                                        │
│               │  Πρόσφατες Παραγγελίες:                                │
│               │  #1234 | 14/02/2026 | €345.00 | Παραδόθηκε            │
│               │  #1198 | 01/02/2026 | €567.00 | Παραδόθηκε            │
│               │                                                        │
└────────────────┴────────────────────────────────────────────────────────┘
```

---

## Appendix: Feature Priority Matrix

| Feature | Priority | Complexity | Phase |
|---------|----------|------------|-------|
| Product listing & filtering | Critical | Medium | 1 |
| Product detail page | Critical | Medium | 1 |
| Shopping cart | Critical | Low | 1 |
| Basic checkout | Critical | High | 1 |
| User accounts | High | Medium | 1 |
| Search | High | Medium | 1 |
| Color code lookup | High | High | 2 |
| Reviews & ratings | Medium | Medium | 2 |
| Wishlist | Medium | Low | 2 |
| Paint calculator | Medium | Low | 2 |
| Live chat | Medium | Low | 2 |
| Product recommendations | Medium | High | 3 |
| Professional accounts | Medium | High | 3 |
| Recurring orders | Low | Medium | 3 |

---

*Document prepared by DeepAgent | February 2026*  
*For Pavlicevits E-Shop Blueprint Development*
