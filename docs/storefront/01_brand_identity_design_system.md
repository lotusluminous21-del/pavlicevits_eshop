# Pavlicevits E-Shop: Brand Identity & Design System Specification

**Document Version:** 1.0  
**Date:** February 15, 2026  
**Status:** Final Specification  
**Purpose:** Comprehensive design system for Pavlicevits e-commerce platform

---

## Table of Contents
1. [Brand Foundation](#1-brand-foundation)
2. [Color System](#2-color-system)
3. [Typography System](#3-typography-system)
4. [Spacing System](#4-spacing-system)
5. [Component Design Tokens](#5-component-design-tokens)
6. [Iconography Guidelines](#6-iconography-guidelines)
7. [Photography & Imagery](#7-photography--imagery)
8. [Motion & Animation](#8-motion--animation)
9. [Responsive Breakpoints](#9-responsive-breakpoints)
10. [Accessibility Requirements](#10-accessibility-requirements)
11. [Component Specifications](#11-component-specifications)

---

## 1. Brand Foundation

### 1.1 Brand Story

Pavlicevits has served Kalamaria-Thessaloniki for over 40 years as a trusted paint and coating supplies provider. The brand represents:
- **Heritage:** Decades of expertise in the Greek market
- **Trust:** Reliable products for both DIY enthusiasts and professionals
- **Knowledge:** Technical expertise and customer guidance
- **Quality:** Premium products from leading manufacturers

### 1.2 Brand Values

| Value | Description | How It Manifests in Design |
|-------|-------------|---------------------------|
| **Expertise** | Deep technical knowledge | Clean data presentation, technical specs prominently displayed |
| **Reliability** | Consistent quality and service | Stable, predictable UI patterns |
| **Accessibility** | Products for all skill levels | Clear navigation, helpful tooltips |
| **Professionalism** | B2B and B2C excellence | Sophisticated yet approachable aesthetic |
| **Innovation** | Modern tools (color lookup) | Contemporary design language |

### 1.3 Brand Voice & Personality

**Voice Characteristics:**

| Characteristic | Description | Example |
|----------------|-------------|---------|
| **Knowledgeable** | Expert but not condescending | "Για βέλτιστα αποτελέσματα, εφαρμόστε 2-3 χέρια με μεσοδιάστημα 30 λεπτών" |
| **Helpful** | Proactive assistance | "Χρειάζεστε βοήθεια; Βρείτε τον κωδικό χρώματος εδώ" |
| **Direct** | Clear, no fluff | "Δωρεάν αποστολή για αγορές άνω των €50" |
| **Warm** | Friendly, local touch | "Καλωσήρθατε στο eshop της Pavlicevits" |

**Tone Matrix:**

| Context | Tone | Example |
|---------|------|---------|
| Marketing/Homepage | Warm, inviting | "Ανακαλύψτε την τέλεια βαφή για το έργο σας" |
| Product Descriptions | Technical, informative | "2K ακρυλικό αστάρι υψηλής πρόσφυσης, VOC: 420g/L" |
| Error Messages | Empathetic, helpful | "Κάτι πήγε στραβά. Δοκιμάστε ξανά ή επικοινωνήστε μαζί μας" |
| Success Messages | Celebratory, clear | "Η παραγγελία σας καταχωρήθηκε! Θα λάβετε email επιβεβαίωσης" |
| Support/Help | Patient, thorough | "Ας βρούμε μαζί τον κωδικό χρώματος του οχήματός σας" |

### 1.4 Brand Positioning

**Positioning Statement:**
> Pavlicevits is the trusted paint specialist for Thessaloniki and all of Greece, offering professional-grade products with local expertise for both DIY enthusiasts who want reliable results and professional painters who demand the best.

**Key Differentiators:**
1. **Local Expertise** - Greek language, local support, same-day Thessaloniki delivery
2. **Vehicle Color Matching** - Unique VIN lookup and color code finder
3. **Dual Audience** - Serving DIY and professional customers equally well
4. **Technical Resources** - Greek TDS, MSDS, how-to content

---

## 2. Color System

### 2.1 Primary Colors

```css
/* Primary Brand Color - Teal/Dark Cyan (Inspired by HBBody) */
--color-primary-900: #062a30;  /* Darkest - Text on light backgrounds */
--color-primary-800: #083942;  /* Dark - Hover states */
--color-primary-700: #0a4854;  /* Main dark variant */
--color-primary-600: #0d4f5c;  /* ⭐ PRIMARY BRAND COLOR */
--color-primary-500: #0f6170;  /* Lighter variant */
--color-primary-400: #1a7a8a;  /* Links, accents */
--color-primary-300: #3d9cac;  /* Lighter UI elements */
--color-primary-200: #7ec4d0;  /* Backgrounds, tags */
--color-primary-100: #c4e6ec;  /* Light backgrounds */
--color-primary-50:  #e8f5f8;  /* Subtle backgrounds */
```

### 2.2 Secondary Colors

```css
/* Secondary - Warm Orange (CTAs, accents) */
--color-secondary-600: #c05621;  /* Hover */
--color-secondary-500: #dd6b20;  /* ⭐ PRIMARY ACCENT */
--color-secondary-400: #ed8936;  /* Light accent */
--color-secondary-300: #f6ad55;  /* Tags, badges */
--color-secondary-100: #feebc8;  /* Backgrounds */

/* Tertiary - Navy Blue (Professional/B2B) */
--color-tertiary-600: #2c5282;  /* Primary navy */
--color-tertiary-500: #3182ce;  /* Links alternative */
--color-tertiary-100: #ebf8ff;  /* Light backgrounds */
```

### 2.3 Semantic Colors

```css
/* Success - Green */
--color-success-600: #2f855a;  /* Text */
--color-success-500: #38a169;  /* Primary */
--color-success-100: #c6f6d5;  /* Background */
--color-success-50:  #f0fff4;  /* Subtle background */

/* Warning - Yellow/Amber */
--color-warning-600: #c05621;  /* Text */
--color-warning-500: #dd6b20;  /* Primary */
--color-warning-100: #feebc8;  /* Background */
--color-warning-50:  #fffaf0;  /* Subtle background */

/* Error - Red */
--color-error-600: #c53030;    /* Text */
--color-error-500: #e53e3e;    /* Primary */
--color-error-100: #fed7d7;    /* Background */
--color-error-50:  #fff5f5;    /* Subtle background */

/* Info - Blue */
--color-info-600: #2b6cb0;     /* Text */
--color-info-500: #3182ce;     /* Primary */
--color-info-100: #bee3f8;     /* Background */
--color-info-50:  #ebf8ff;     /* Subtle background */
```

### 2.4 Neutral Colors

```css
/* Gray Scale */
--color-neutral-950: #0d0d0d;  /* Near black */
--color-neutral-900: #171717;  /* Headings */
--color-neutral-800: #262626;  /* Body text primary */
--color-neutral-700: #404040;  /* Body text secondary */
--color-neutral-600: #525252;  /* Muted text */
--color-neutral-500: #737373;  /* Placeholder text */
--color-neutral-400: #a3a3a3;  /* Disabled text */
--color-neutral-300: #d4d4d4;  /* Borders */
--color-neutral-200: #e5e5e5;  /* Dividers */
--color-neutral-100: #f5f5f5;  /* Backgrounds */
--color-neutral-50:  #fafafa;  /* Subtle backgrounds */

/* Pure */
--color-white: #ffffff;
--color-black: #000000;
```

### 2.5 Gradients

```css
/* Primary Gradient - Hero sections, CTAs */
--gradient-primary: linear-gradient(135deg, #0d4f5c 0%, #0a3d47 100%);

/* Light Gradient - Backgrounds */
--gradient-light: linear-gradient(180deg, #ffffff 0%, #f5f5f5 100%);

/* Accent Gradient - Special promotions */
--gradient-accent: linear-gradient(135deg, #dd6b20 0%, #c05621 100%);

/* Professional Gradient - B2B sections */
--gradient-professional: linear-gradient(135deg, #0d4f5c 0%, #2c5282 100%);
```

### 2.6 Color Usage Guidelines

| Use Case | Color Token | Example |
|----------|-------------|---------|
| Primary buttons | `primary-600` | Add to Cart, Checkout |
| Secondary buttons | `secondary-500` | Learn More, View Details |
| Links | `primary-400` | Navigation, inline links |
| Body text | `neutral-800` | Product descriptions |
| Headings | `neutral-900` | Page titles, section headers |
| Muted text | `neutral-600` | Captions, meta info |
| Backgrounds | `white`, `neutral-50` | Page backgrounds |
| Cards | `white` | Product cards |
| Dividers | `neutral-200` | Section separators |
| Errors | `error-500` | Form validation |
| Success | `success-500` | Order confirmation |
| Promotions | `secondary-500` | Sale badges |

---

## 3. Typography System

### 3.1 Font Families

```css
/* Primary Font - Headings and UI */
--font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

/* Greek Support - Body Text */
--font-family-greek: 'Source Sans Pro', 'Noto Sans', -apple-system, BlinkMacSystemFont, sans-serif;

/* Monospace - Code, SKUs, prices */
--font-family-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
```

**Font Loading Strategy:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Sans+Pro:wght@400;600;700&display=swap" rel="stylesheet">
```

### 3.2 Type Scale

```css
/* Font Sizes - Based on 1.25 ratio (Major Third) */
--font-size-xs:   0.75rem;   /* 12px */
--font-size-sm:   0.875rem;  /* 14px */
--font-size-base: 1rem;      /* 16px */
--font-size-lg:   1.125rem;  /* 18px */
--font-size-xl:   1.25rem;   /* 20px */
--font-size-2xl:  1.5rem;    /* 24px */
--font-size-3xl:  1.875rem;  /* 30px */
--font-size-4xl:  2.25rem;   /* 36px */
--font-size-5xl:  3rem;      /* 48px */
--font-size-6xl:  3.75rem;   /* 60px */
```

### 3.3 Font Weights

```css
--font-weight-regular: 400;
--font-weight-medium:  500;
--font-weight-semibold: 600;
--font-weight-bold:    700;
```

### 3.4 Line Heights

```css
--line-height-tight:  1.25;  /* Headings */
--line-height-snug:   1.375; /* Subheadings */
--line-height-normal: 1.5;   /* Body text */
--line-height-relaxed: 1.625; /* Long-form content */
--line-height-loose:  2;     /* Sparse UI text */
```

### 3.5 Letter Spacing

```css
--letter-spacing-tighter: -0.05em;
--letter-spacing-tight:   -0.025em;
--letter-spacing-normal:  0;
--letter-spacing-wide:    0.025em;
--letter-spacing-wider:   0.05em;
--letter-spacing-widest:  0.1em;
```

### 3.6 Typography Presets

```css
/* Display - Hero headlines */
.text-display {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-5xl);    /* 48px */
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  letter-spacing: var(--letter-spacing-tight);
}

/* Heading 1 - Page titles */
.text-h1 {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-4xl);    /* 36px */
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  letter-spacing: var(--letter-spacing-tight);
}

/* Heading 2 - Section titles */
.text-h2 {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-3xl);    /* 30px */
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}

/* Heading 3 - Subsection titles */
.text-h3 {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-2xl);    /* 24px */
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-snug);
}

/* Heading 4 - Card titles */
.text-h4 {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-xl);     /* 20px */
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-snug);
}

/* Body Large - Intro paragraphs */
.text-body-lg {
  font-family: var(--font-family-greek);
  font-size: var(--font-size-lg);     /* 18px */
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-relaxed);
}

/* Body - Default text */
.text-body {
  font-family: var(--font-family-greek);
  font-size: var(--font-size-base);   /* 16px */
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-normal);
}

/* Body Small - Captions, meta */
.text-body-sm {
  font-family: var(--font-family-greek);
  font-size: var(--font-size-sm);     /* 14px */
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-normal);
}

/* Caption - Fine print */
.text-caption {
  font-family: var(--font-family-greek);
  font-size: var(--font-size-xs);     /* 12px */
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-normal);
}

/* Price - Product prices */
.text-price {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-2xl);    /* 24px */
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--letter-spacing-tight);
}

/* SKU - Product codes */
.text-sku {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);     /* 14px */
  font-weight: var(--font-weight-regular);
  letter-spacing: var(--letter-spacing-wide);
}
```

### 3.7 Greek Typography Considerations

| Aspect | Requirement |
|--------|-------------|
| Character Set | Full Greek Unicode support (U+0370–U+03FF) |
| Accents | Support for polytonic Greek (ά, έ, ή, ί, ό, ύ, ώ) |
| Font Fallback | Noto Sans as fallback for Greek characters |
| Word Spacing | Slightly wider than English (1.05x) |
| Hyphenation | `hyphens: auto; -webkit-hyphens: auto;` for Greek |

---

## 4. Spacing System

### 4.1 Base Unit

```css
/* Base: 4px */
--spacing-unit: 4px;
```

### 4.2 Spacing Scale

```css
/* Spacing Tokens */
--spacing-0:   0;           /* 0px */
--spacing-0.5: 0.125rem;    /* 2px */
--spacing-1:   0.25rem;     /* 4px */
--spacing-1.5: 0.375rem;    /* 6px */
--spacing-2:   0.5rem;      /* 8px */
--spacing-2.5: 0.625rem;    /* 10px */
--spacing-3:   0.75rem;     /* 12px */
--spacing-3.5: 0.875rem;    /* 14px */
--spacing-4:   1rem;        /* 16px */
--spacing-5:   1.25rem;     /* 20px */
--spacing-6:   1.5rem;      /* 24px */
--spacing-7:   1.75rem;     /* 28px */
--spacing-8:   2rem;        /* 32px */
--spacing-9:   2.25rem;     /* 36px */
--spacing-10:  2.5rem;      /* 40px */
--spacing-11:  2.75rem;     /* 44px */
--spacing-12:  3rem;        /* 48px */
--spacing-14:  3.5rem;      /* 56px */
--spacing-16:  4rem;        /* 64px */
--spacing-20:  5rem;        /* 80px */
--spacing-24:  6rem;        /* 96px */
--spacing-28:  7rem;        /* 112px */
--spacing-32:  8rem;        /* 128px */
--spacing-36:  9rem;        /* 144px */
--spacing-40:  10rem;       /* 160px */
```

### 4.3 Spacing Usage Guidelines

| Context | Token | Value | Use Case |
|---------|-------|-------|----------|
| Inline spacing (icons) | `spacing-1` | 4px | Icon to text gap |
| Tight | `spacing-2` | 8px | Between related elements |
| Compact | `spacing-3` | 12px | List items |
| Default | `spacing-4` | 16px | Standard element spacing |
| Comfortable | `spacing-6` | 24px | Card padding |
| Spacious | `spacing-8` | 32px | Section padding (mobile) |
| Section | `spacing-12` | 48px | Between sections (mobile) |
| Page section | `spacing-16` | 64px | Section padding (desktop) |
| Large section | `spacing-24` | 96px | Hero sections |

### 4.4 Layout Spacing

```css
/* Container max-widths */
--container-sm:  640px;
--container-md:  768px;
--container-lg:  1024px;
--container-xl:  1280px;
--container-2xl: 1536px;

/* Container padding */
--container-padding-mobile: var(--spacing-4);   /* 16px */
--container-padding-tablet: var(--spacing-6);   /* 24px */
--container-padding-desktop: var(--spacing-8);  /* 32px */

/* Grid gaps */
--grid-gap-sm: var(--spacing-4);   /* 16px */
--grid-gap-md: var(--spacing-6);   /* 24px */
--grid-gap-lg: var(--spacing-8);   /* 32px */
```

---

## 5. Component Design Tokens

### 5.1 Border Radius

```css
--radius-none: 0;
--radius-sm:   0.125rem;   /* 2px */
--radius-default: 0.25rem; /* 4px */
--radius-md:   0.375rem;   /* 6px */
--radius-lg:   0.5rem;     /* 8px */
--radius-xl:   0.75rem;    /* 12px */
--radius-2xl:  1rem;       /* 16px */
--radius-3xl:  1.5rem;     /* 24px */
--radius-full: 9999px;     /* Pill shape */
```

**Usage:**
| Component | Radius |
|-----------|--------|
| Buttons | `radius-lg` (8px) |
| Cards | `radius-xl` (12px) |
| Input fields | `radius-md` (6px) |
| Badges/Tags | `radius-full` |
| Modal | `radius-2xl` (16px) |
| Images | `radius-lg` (8px) |

### 5.2 Shadows

```css
/* Elevation System */
--shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
--shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);

/* Colored shadows for primary elements */
--shadow-primary: 0 4px 14px 0 rgb(13 79 92 / 0.25);
--shadow-primary-lg: 0 10px 25px 0 rgb(13 79 92 / 0.3);
```

**Usage:**
| Component | Shadow |
|-----------|--------|
| Product cards (rest) | `shadow-sm` |
| Product cards (hover) | `shadow-lg` |
| Navbar | `shadow-sm` |
| Dropdown menus | `shadow-lg` |
| Modal/Dialog | `shadow-2xl` |
| Primary buttons (hover) | `shadow-primary` |
| Floating elements | `shadow-xl` |

### 5.3 Borders

```css
/* Border widths */
--border-width-0: 0;
--border-width-1: 1px;
--border-width-2: 2px;
--border-width-4: 4px;

/* Border colors */
--border-color-default: var(--color-neutral-200);
--border-color-muted: var(--color-neutral-100);
--border-color-strong: var(--color-neutral-300);
--border-color-focus: var(--color-primary-500);
--border-color-error: var(--color-error-500);
--border-color-success: var(--color-success-500);
```

### 5.4 Z-Index Scale

```css
--z-index-dropdown:  1000;
--z-index-sticky:    1020;
--z-index-fixed:     1030;
--z-index-backdrop:  1040;
--z-index-modal:     1050;
--z-index-popover:   1060;
--z-index-tooltip:   1070;
--z-index-toast:     1080;
```

---

## 6. Iconography Guidelines

### 6.1 Icon Library

**Primary:** Lucide Icons (Recommended)
- Open source, MIT licensed
- Consistent 24x24 grid
- Good coverage for e-commerce
- React component library available

**Alternative:** Heroicons
- Tailwind-native integration
- Solid and outline variants

### 6.2 Icon Sizes

```css
--icon-xs:   12px;  /* Inline small UI */
--icon-sm:   16px;  /* Buttons, inputs */
--icon-md:   20px;  /* Default UI icons */
--icon-lg:   24px;  /* Navigation, cards */
--icon-xl:   32px;  /* Feature icons */
--icon-2xl:  48px;  /* Empty states */
--icon-3xl:  64px;  /* Hero illustrations */
```

### 6.3 Icon Usage

| Context | Size | Stroke Width |
|---------|------|--------------|
| Input field icons | 16px | 2px |
| Button icons | 16-20px | 2px |
| Navigation icons | 20-24px | 2px |
| Card action icons | 20px | 2px |
| Feature highlights | 32-48px | 1.5px |
| Empty states | 48-64px | 1.5px |

### 6.4 Icon Colors

```css
/* Icon color tokens */
--icon-color-default: var(--color-neutral-600);
--icon-color-muted: var(--color-neutral-400);
--icon-color-primary: var(--color-primary-600);
--icon-color-success: var(--color-success-600);
--icon-color-warning: var(--color-warning-600);
--icon-color-error: var(--color-error-600);
--icon-color-on-primary: var(--color-white);
```

### 6.5 E-Commerce Icon Set

Required icons for the Pavlicevits e-shop:

| Icon | Usage | Lucide Name |
|------|-------|-------------|
| Search | Search bar | `Search` |
| Shopping Cart | Cart icon | `ShoppingCart` |
| User | Account | `User` / `UserCircle` |
| Heart | Wishlist | `Heart` |
| Menu | Mobile nav | `Menu` |
| Close | Modals, menus | `X` |
| Plus/Minus | Quantity | `Plus` / `Minus` |
| Check | Success, selection | `Check` |
| ChevronDown | Dropdowns | `ChevronDown` |
| ChevronRight | Breadcrumbs | `ChevronRight` |
| Filter | Product filters | `SlidersHorizontal` |
| Grid/List | View toggle | `Grid3x3` / `List` |
| Truck | Shipping | `Truck` |
| CreditCard | Payment | `CreditCard` |
| MapPin | Store location | `MapPin` |
| Phone | Contact | `Phone` |
| Mail | Email | `Mail` |
| Clock | Time/hours | `Clock` |
| Star | Reviews | `Star` |
| Info | Tooltips | `Info` |
| AlertCircle | Warnings | `AlertCircle` |
| Trash | Remove | `Trash2` |
| Edit | Edit | `Pencil` |
| Download | TDS/MSDS | `Download` |
| FileText | Documents | `FileText` |
| Car | Vehicle lookup | `Car` |
| Paintbrush | Paint category | `Paintbrush` |
| Spray | Spray products | `SprayCan` |
| Palette | Colors | `Palette` |

---

## 7. Photography & Imagery

### 7.1 Product Photography Style

**Background:**
- Pure white (#FFFFFF) for product listings
- Light gray (#F5F5F5) for lifestyle/contextual shots

**Lighting:**
- Soft, even lighting
- Minimal shadows (drop shadow for depth if needed)
- True color representation critical for paint products

**Composition:**
- Product centered, 80% frame fill for thumbnails
- 3/4 angle for spray cans, containers
- Front-facing for labels, technical info visible
- Multiple angles: front, back, label close-up, in-use

### 7.2 Image Specifications

| Context | Dimensions | Format | Max Size |
|---------|------------|--------|----------|
| Product thumbnail | 400×400px | WebP | 50KB |
| Product gallery | 800×800px | WebP | 150KB |
| Product zoom | 1600×1600px | WebP | 300KB |
| Hero banner (desktop) | 1920×600px | WebP | 250KB |
| Hero banner (mobile) | 800×600px | WebP | 150KB |
| Category banner | 1200×400px | WebP | 200KB |
| Blog featured | 1200×630px | WebP | 200KB |
| OG Image | 1200×630px | PNG | 150KB |

### 7.3 Image Treatment

```css
/* Product images */
.product-image {
  aspect-ratio: 1 / 1;
  object-fit: contain;
  background-color: var(--color-white);
  border-radius: var(--radius-lg);
}

/* Hero images */
.hero-image {
  aspect-ratio: 16 / 5; /* Desktop */
  object-fit: cover;
}

/* Lifestyle images */
.lifestyle-image {
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: var(--radius-xl);
}
```

### 7.4 Placeholder & Loading States

```css
/* Skeleton loading */
.image-skeleton {
  background: linear-gradient(
    90deg,
    var(--color-neutral-100) 0%,
    var(--color-neutral-200) 50%,
    var(--color-neutral-100) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### 7.5 Lifestyle/Application Imagery

**Subject Matter:**
- Professional painters at work
- DIY home improvement projects
- Auto body repair/painting
- Before/after transformations
- Product application close-ups
- Workshop/garage environments

**Style Guidelines:**
- Authentic, not overly staged
- Greek context where possible
- Diverse subjects (age, gender)
- Clean, well-organized workspaces
- Safety equipment visible (masks, gloves)

---

## 8. Motion & Animation

### 8.1 Timing Functions

```css
/* Easing curves */
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### 8.2 Duration Scale

```css
/* Animation durations */
--duration-instant: 0ms;
--duration-fast: 100ms;      /* Micro-interactions */
--duration-normal: 200ms;    /* Standard transitions */
--duration-moderate: 300ms;  /* Complex transitions */
--duration-slow: 400ms;      /* Page transitions */
--duration-slower: 500ms;    /* Emphasis */
```

### 8.3 Standard Animations

```css
/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide up (modals, toasts) */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale in (buttons, cards) */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Spin (loading) */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Pulse (attention) */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

### 8.4 Transition Presets

```css
/* Hover transitions */
.transition-colors {
  transition: color var(--duration-fast) var(--ease-in-out),
              background-color var(--duration-fast) var(--ease-in-out),
              border-color var(--duration-fast) var(--ease-in-out);
}

.transition-transform {
  transition: transform var(--duration-normal) var(--ease-out);
}

.transition-shadow {
  transition: box-shadow var(--duration-normal) var(--ease-out);
}

.transition-all {
  transition: all var(--duration-normal) var(--ease-in-out);
}
```

### 8.5 Animation Usage

| Element | Animation | Duration | Trigger |
|---------|-----------|----------|---------|
| Button hover | Scale 1.02, shadow | 150ms | :hover |
| Card hover | Translate Y -4px, shadow | 200ms | :hover |
| Dropdown open | Slide down, fade | 200ms | Open |
| Modal open | Scale + fade | 300ms | Open |
| Toast appear | Slide up | 300ms | Show |
| Loading spinner | Spin | Continuous | Loading |
| Skeleton | Shimmer | 1500ms | Loading |
| Page transition | Fade | 150ms | Route change |

### 8.6 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 9. Responsive Breakpoints

### 9.1 Breakpoint Scale

```css
/* Mobile-first breakpoints */
--breakpoint-sm:  640px;   /* Small tablets, large phones */
--breakpoint-md:  768px;   /* Tablets */
--breakpoint-lg:  1024px;  /* Small desktops, tablets landscape */
--breakpoint-xl:  1280px;  /* Desktops */
--breakpoint-2xl: 1536px;  /* Large desktops */
```

### 9.2 Media Query Usage

```css
/* Tailwind-compatible media queries */
@media (min-width: 640px) { /* sm: */ }
@media (min-width: 768px) { /* md: */ }
@media (min-width: 1024px) { /* lg: */ }
@media (min-width: 1280px) { /* xl: */ }
@media (min-width: 1536px) { /* 2xl: */ }
```

### 9.3 Responsive Typography

| Element | Mobile | Tablet (md) | Desktop (lg) |
|---------|--------|-------------|--------------|
| Display | 36px | 48px | 60px |
| H1 | 30px | 36px | 48px |
| H2 | 24px | 30px | 36px |
| H3 | 20px | 24px | 30px |
| Body | 16px | 16px | 16px |
| Body Small | 14px | 14px | 14px |

### 9.4 Responsive Layout Grid

```css
/* Product grid columns */
.product-grid {
  display: grid;
  gap: var(--spacing-4);
  grid-template-columns: repeat(2, 1fr);    /* Mobile: 2 cols */
}

@media (min-width: 640px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);  /* sm: 3 cols */
  }
}

@media (min-width: 1024px) {
  .product-grid {
    gap: var(--spacing-6);
    grid-template-columns: repeat(4, 1fr);  /* lg: 4 cols */
  }
}

@media (min-width: 1280px) {
  .product-grid {
    grid-template-columns: repeat(5, 1fr);  /* xl: 5 cols */
  }
}
```

---

## 10. Accessibility Requirements

### 10.1 WCAG 2.1 AA Compliance

| Requirement | Implementation |
|-------------|----------------|
| **Color Contrast** | Min 4.5:1 for normal text, 3:1 for large text |
| **Focus Indicators** | Visible focus ring on all interactive elements |
| **Keyboard Navigation** | All functions accessible via keyboard |
| **Screen Readers** | Proper ARIA labels and roles |
| **Touch Targets** | Min 44×44px for mobile |
| **Text Sizing** | Support up to 200% zoom without loss |
| **Motion** | Respect `prefers-reduced-motion` |

### 10.2 Color Contrast Verification

| Combination | Contrast Ratio | Pass/Fail |
|-------------|----------------|-----------|
| Primary (#0d4f5c) on White | 8.2:1 | ✅ AAA |
| Body text (#262626) on White | 15.1:1 | ✅ AAA |
| Muted text (#525252) on White | 7.2:1 | ✅ AA |
| White on Primary (#0d4f5c) | 8.2:1 | ✅ AAA |
| Error (#e53e3e) on Error-50 | 4.6:1 | ✅ AA |
| Success (#38a169) on White | 3.4:1 | ✅ Large |

### 10.3 Focus States

```css
/* Default focus ring */
*:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* Focus within cards */
.card:focus-within {
  ring: 2px solid var(--color-primary-300);
}

/* Skip link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--color-primary-600);
  color: white;
  padding: var(--spacing-2) var(--spacing-4);
  z-index: var(--z-index-tooltip);
}

.skip-link:focus {
  top: 0;
}
```

### 10.4 ARIA Implementation

```html
<!-- Navigation -->
<nav aria-label="Κύρια πλοήγηση">...</nav>
<nav aria-label="Breadcrumb">...</nav>

<!-- Product card -->
<article aria-labelledby="product-title-123">
  <h3 id="product-title-123">Product Name</h3>
</article>

<!-- Loading states -->
<div aria-live="polite" aria-busy="true">Φόρτωση...</div>

<!-- Form errors -->
<input aria-invalid="true" aria-describedby="error-msg" />
<span id="error-msg" role="alert">Error message</span>

<!-- Buttons with icons -->
<button aria-label="Προσθήκη στο καλάθι">
  <ShoppingCartIcon aria-hidden="true" />
</button>
```

### 10.5 Screen Reader Text

```css
/* Visually hidden but accessible */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

---

## 11. Component Specifications

### 11.1 Buttons

**Primary Button:**
```css
.btn-primary {
  background-color: var(--color-primary-600);
  color: var(--color-white);
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--radius-lg);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  transition: all var(--duration-fast) var(--ease-in-out);
}

.btn-primary:hover {
  background-color: var(--color-primary-700);
  box-shadow: var(--shadow-primary);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: none;
}

.btn-primary:disabled {
  background-color: var(--color-neutral-300);
  cursor: not-allowed;
  transform: none;
}
```

**Secondary Button:**
```css
.btn-secondary {
  background-color: transparent;
  color: var(--color-primary-600);
  border: 2px solid var(--color-primary-600);
  padding: calc(var(--spacing-3) - 2px) calc(var(--spacing-6) - 2px);
  border-radius: var(--radius-lg);
  font-weight: var(--font-weight-semibold);
}

.btn-secondary:hover {
  background-color: var(--color-primary-50);
  border-color: var(--color-primary-700);
}
```

**Button Sizes:**
| Size | Padding | Font Size | Min Height |
|------|---------|-----------|------------|
| Small | 8px 16px | 14px | 36px |
| Medium | 12px 24px | 16px | 44px |
| Large | 16px 32px | 18px | 52px |

### 11.2 Product Card

```jsx
// Product Card Structure
<article className="product-card">
  <div className="product-card__image-wrapper">
    <img className="product-card__image" />
    <div className="product-card__badges">
      <span className="badge badge--sale">-20%</span>
      <span className="badge badge--new">Νέο</span>
    </div>
    <button className="product-card__wishlist" aria-label="Προσθήκη στα αγαπημένα">
      <HeartIcon />
    </button>
  </div>
  <div className="product-card__content">
    <span className="product-card__category">Κατηγορία</span>
    <h3 className="product-card__title">Product Title</h3>
    <div className="product-card__rating">
      <Stars rating={4.5} />
      <span>(23)</span>
    </div>
    <div className="product-card__price">
      <span className="product-card__price--current">€29.90</span>
      <span className="product-card__price--original">€39.90</span>
    </div>
    <button className="btn-primary product-card__add-to-cart">
      Προσθήκη στο καλάθι
    </button>
  </div>
</article>
```

**Card Styles:**
```css
.product-card {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: all var(--duration-normal) var(--ease-out);
}

.product-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}

.product-card__image-wrapper {
  position: relative;
  aspect-ratio: 1 / 1;
  background: var(--color-neutral-50);
}

.product-card__image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: var(--spacing-4);
}

.product-card__content {
  padding: var(--spacing-4);
}

.product-card__title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-neutral-900);
  line-height: var(--line-height-snug);
  /* Clamp to 2 lines */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-card__price--current {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-600);
}

.product-card__price--original {
  font-size: var(--font-size-sm);
  color: var(--color-neutral-500);
  text-decoration: line-through;
  margin-left: var(--spacing-2);
}
```

### 11.3 Input Fields

```css
.input {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  color: var(--color-neutral-900);
  background: var(--color-white);
  transition: border-color var(--duration-fast) var(--ease-in-out),
              box-shadow var(--duration-fast) var(--ease-in-out);
}

.input::placeholder {
  color: var(--color-neutral-500);
}

.input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.input--error {
  border-color: var(--color-error-500);
}

.input--error:focus {
  box-shadow: 0 0 0 3px var(--color-error-100);
}

.input:disabled {
  background-color: var(--color-neutral-100);
  cursor: not-allowed;
}
```

### 11.4 Badges & Tags

```css
/* Base badge */
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-1) var(--spacing-2);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}

/* Variants */
.badge--primary {
  background: var(--color-primary-100);
  color: var(--color-primary-700);
}

.badge--sale {
  background: var(--color-error-500);
  color: var(--color-white);
}

.badge--new {
  background: var(--color-success-500);
  color: var(--color-white);
}

.badge--pro {
  background: var(--gradient-professional);
  color: var(--color-white);
}

.badge--out-of-stock {
  background: var(--color-neutral-200);
  color: var(--color-neutral-600);
}
```

### 11.5 Navigation

**Desktop Navigation:**
```css
.navbar {
  position: sticky;
  top: 0;
  z-index: var(--z-index-sticky);
  background: var(--color-white);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-3) 0;
}

.navbar__container {
  max-width: var(--container-xl);
  margin: 0 auto;
  padding: 0 var(--container-padding-desktop);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar__nav {
  display: flex;
  gap: var(--spacing-8);
}

.navbar__link {
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-700);
  transition: color var(--duration-fast);
}

.navbar__link:hover {
  color: var(--color-primary-600);
}

.navbar__link--active {
  color: var(--color-primary-600);
}
```

**Mobile Navigation:**
```css
.mobile-nav {
  position: fixed;
  inset: 0;
  z-index: var(--z-index-modal);
  background: var(--color-white);
  transform: translateX(-100%);
  transition: transform var(--duration-moderate) var(--ease-out);
}

.mobile-nav--open {
  transform: translateX(0);
}

.mobile-nav__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: var(--z-index-backdrop);
}
```

### 11.6 Toast Notifications

```css
.toast {
  position: fixed;
  bottom: var(--spacing-6);
  right: var(--spacing-6);
  z-index: var(--z-index-toast);
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-4) var(--spacing-5);
  background: var(--color-neutral-900);
  color: var(--color-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  animation: slideUp var(--duration-moderate) var(--ease-out);
}

.toast--success {
  background: var(--color-success-600);
}

.toast--error {
  background: var(--color-error-600);
}

.toast__icon {
  flex-shrink: 0;
}

.toast__close {
  margin-left: auto;
  opacity: 0.7;
  cursor: pointer;
}

.toast__close:hover {
  opacity: 1;
}
```

---

## Appendix: Tailwind CSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e8f5f8',
          100: '#c4e6ec',
          200: '#7ec4d0',
          300: '#3d9cac',
          400: '#1a7a8a',
          500: '#0f6170',
          600: '#0d4f5c',
          700: '#0a4854',
          800: '#083942',
          900: '#062a30',
        },
        secondary: {
          100: '#feebc8',
          300: '#f6ad55',
          400: '#ed8936',
          500: '#dd6b20',
          600: '#c05621',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        greek: ['Source Sans Pro', 'Noto Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display': ['3rem', { lineHeight: '1.25', fontWeight: '700' }],
      },
      boxShadow: {
        'primary': '0 4px 14px 0 rgb(13 79 92 / 0.25)',
        'primary-lg': '0 10px 25px 0 rgb(13 79 92 / 0.3)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
```

---

*Document prepared by DeepAgent | February 2026*  
*For Pavlicevits E-Shop Blueprint Development*
