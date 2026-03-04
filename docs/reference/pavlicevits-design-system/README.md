# Pavlicevits Design System

A comprehensive design system for industrial e-commerce applications built with React, TypeScript, and Tailwind CSS. Designed to integrate seamlessly with [shadcn/ui](https://ui.shadcn.com/).

## Features

- 🎨 **Dark Purple & Teal Color Palette** - Industrial, professional aesthetic
- 📦 **16+ Custom Components** - Ready-to-use React components
- 🎯 **shadcn/ui Compatible** - Extends and overrides standard components
- 💱 **Design Tokens** - Exportable tokens for programmatic access
- 📱 **Responsive** - Mobile-first design approach
- ♿ **Accessible** - Focus states, ARIA labels, keyboard navigation
- 🌙 **Dark Mode Ready** - CSS variables for theme switching

## Installation

### 1. Copy Files to Your Project

```bash
# Copy styles
cp styles/globals.css your-project/src/styles/

# Copy components
cp -r components/* your-project/src/components/pavlicevits/

# Copy design tokens (optional)
cp lib/design-tokens.ts your-project/src/lib/
```

### 2. Import Global Styles

In your main CSS file or `app/globals.css`:

```css
@import './pavlicevits-globals.css';

/* Or merge the CSS variables with your existing globals */
```

### 3. Install Dependencies

Make sure you have the required dependencies:

```bash
npm install clsx tailwind-merge
```

### 4. Add `cn` Utility (if not already present)

Create `lib/utils.ts`:

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## File Structure

```
pavlicevits-design-system/
├── styles/
│   └── globals.css          # Complete CSS with variables & component styles
├── components/
│   ├── index.ts             # Barrel exports
│   ├── ProductCard.tsx      # Product display card
│   ├── StatusBadge.tsx      # Order status badges
│   ├── StatsCard.tsx        # Dashboard stat cards
│   ├── OrderTable.tsx       # Orders table
│   ├── ChatMessage.tsx      # AI chat bubbles
│   ├── ProjectProgress.tsx  # Progress tracker
│   ├── TechLogs.tsx         # Technical logs display
│   ├── TechSpecs.tsx        # Product specifications
│   ├── SolutionPlan.tsx     # AI solution with phases
│   ├── CartItem.tsx         # Shopping cart item
│   ├── CheckoutForm.tsx     # Multi-step checkout
│   ├── ProductFilters.tsx   # Category filters
│   ├── QuickActionButton.tsx# Pill-shaped action buttons
│   ├── ServiceCard.tsx      # Professional services
│   ├── CollectionCard.tsx   # Product collections
│   └── Footer.tsx           # Site footer
├── lib/
│   └── design-tokens.ts     # Exportable design tokens
└── README.md
```

## Customizing Colors

### Option 1: Edit CSS Variables

Modify the `:root` section in `globals.css`:

```css
:root {
  /* Change primary color (Dark Purple) */
  --primary: 234 30% 14%;           /* HSL values */
  --primary-foreground: 0 0% 100%;
  --primary-light: 234 25% 22%;
  --primary-dark: 234 35% 8%;
  
  /* Change accent color (Dark Teal) */
  --accent: 175 60% 35%;
  --accent-foreground: 0 0% 100%;
  --accent-light: 175 50% 45%;
  --accent-dark: 175 70% 25%;
}
```

### Option 2: Use Design Tokens

```typescript
import { colors } from '@/lib/design-tokens';

// Access programmatically
console.log(colors.primary.DEFAULT); // 'hsl(234, 30%, 14%)'
console.log(colors.accent.light);    // 'hsl(175, 50%, 45%)'
```

### Color Conversion Helper

To convert hex to HSL for CSS variables:

```typescript
function hexToHSL(hex: string): string {
  // Convert hex to RGB, then to HSL
  // Return format: "H S% L%" (without hsl() wrapper)
}
```

## Component Usage Examples

### ProductCard

```tsx
import { ProductCard } from '@/components/pavlicevits';

<ProductCard
  id="1"
  title="Ultra-Chrome X90"
  category="Polymer Series"
  categoryColor="primary"
  price={289.00}
  priceUnit="5 gallon"
  image="/products/chrome-x90.jpg"
  badge="New Arrival"
  badgeVariant="new"
  onAddToCart={() => addToCart('1')}
/>
```

### StatusBadge

```tsx
import { StatusBadge } from '@/components/pavlicevits';

<StatusBadge status="in-transit" />
<StatusBadge status="delivered" size="lg" />
<StatusBadge status="pending" label="Awaiting Review" />
```

### ChatMessage

```tsx
import { ChatMessage } from '@/components/pavlicevits';

<ChatMessage
  variant="assistant"
  senderName="PAVLICEVITS AI SUPPORT"
  content="Welcome to the industrial coating specialist."
  actions={[
    { label: 'ISO C4: Industrial/Coastal', onClick: () => {} },
    { label: 'ISO C5: Offshore/Severe', onClick: () => {} },
  ]}
/>

<ChatMessage
  variant="user"
  senderName="SITE ENGINEER"
  content="I am working with structural carbon steel."
/>
```

### OrderTable

```tsx
import { OrderTable, Order } from '@/components/pavlicevits';

const orders: Order[] = [
  {
    id: '1',
    reference: '#PV-9821-X',
    date: 'Oct 12, 2023',
    projectName: 'Steel Bridge Revitalization',
    status: 'in-transit',
    volume: '450 Gal',
    value: 12400.00,
  },
];

<OrderTable
  orders={orders}
  onRowClick={(order) => navigate(`/orders/${order.id}`)}
/>
```

### SolutionPlan

```tsx
import { SolutionPlan } from '@/components/pavlicevits';

<SolutionPlan
  subtitle="Customized industrial coating protocol for high-corrosion environments."
  summary={{
    surfaceType: 'Galvanized Steel',
    totalArea: '4,500 sq. ft.',
    atmosphere: 'C5-I Industrial',
    primaryGoal: 'Corrosion Control',
    estimatedDuration: '8-12 Days',
  }}
  phases={[
    {
      id: '1',
      number: 1,
      title: 'Preparation',
      description: 'Abrasive blast cleaning to ISO 8501-1 Sa 2.5 standard.',
      features: ['Chloride testing', 'Profile depth verification'],
    },
  ]}
  onExportPDF={() => exportToPDF()}
/>
```

### CheckoutForm

```tsx
import { CheckoutForm } from '@/components/pavlicevits';

<CheckoutForm
  steps={[
    { id: 'shipping', number: 1, label: 'Shipping' },
    { id: 'method', number: 2, label: 'Method' },
    { id: 'payment', number: 3, label: 'Payment' },
  ]}
  currentStep={1}
  shippingMethods={[
    { id: 'freight', name: 'Freight Transport (LTL)', description: 'Palletized delivery for bulk orders', price: 145.00 },
    { id: 'priority', name: 'Priority Freight', description: 'Next-day industrial dispatch', price: 290.00 },
  ]}
  selectedShippingId="freight"
  onShippingMethodChange={setShippingMethod}
  onSubmit={handleCheckout}
/>
```

## Utility Classes

The design system includes utility classes for common patterns:

```css
/* Industrial typography */
.industrial-heading    /* Large uppercase headings */
.industrial-subheading /* Small caps labels */

/* Labels */
.label-tag            /* Tag-style labels */
.label-tag--accent    /* Accent color variant */
.label-tag--outline   /* Outline variant */

/* Form labels */
.form-label           /* Uppercase form field labels */

/* Progress */
.progress-bar         /* Progress bar container */
.progress-bar__fill   /* Progress bar fill */

/* Animations */
.animate-fade-in
.animate-fade-in-up
.animate-slide-in-right
.animate-scale-in
.animate-pulse
.animate-spin
```

## shadcn Component Overrides

The `globals.css` file includes overrides for all standard shadcn components:

- Button (all variants: default, secondary, outline, ghost, destructive)
- Card (with header, content, footer)
- Input, Textarea, Select
- Badge (with status variants)
- Table
- Dialog/Modal
- Tabs (including underline variant)
- Avatar
- Checkbox, Radio, Switch
- Tooltip
- Dropdown Menu
- Toast/Alert
- Skeleton
- Separator
- Accordion
- Breadcrumb
- Pagination

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - Feel free to use in personal and commercial projects.

---

Built with ❤️ for industrial-grade interfaces.
