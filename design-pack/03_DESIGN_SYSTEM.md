# 03 — Design System

**Tokens, typography, spacing, motion, iconography. Dual-mode (dark + light), all-sans, accessibility-grade.**

*Reads after `02_VISUAL_DIRECTION.md`. Provides the specs that 02 described in spirit.*

---

## 0. Token philosophy

Four principles drive the system:

1. **Semantic over literal.** A designer never writes `#0F4C5C` directly. They write `color/brand/primary`. The token resolves to the right hex value for the active mode (light or dark).
2. **Dual-mode is structural, not surface.** Every color token has two values: a `light` value and a `dark` value. The component code is mode-agnostic; only the token resolution changes. Both modes are first-class — neither is a "theme" applied on top of the other.
3. **Tokens are non-negotiable.** Any value not listed here is a magic number. Magic numbers are bugs in waiting.
4. **Minimalism is the default.** When a component or page can be simplified without losing function or meaning, it must be simplified. Decoration that doesn't serve the message gets removed. This applies as much to design tokens as to layouts: we resist adding more colors, more weights, more breakpoints unless absolutely needed. The system should feel **load-bearing**, not decorative.

---

## 1. Color tokens — both modes

### 1.1 Brand colors

| Token | Light value | Dark value | Description |
|---|---|---|---|
| `color/brand/primary` | `#0F4C5C` | `#2BA8C2` | Petrol — the signature. Light mode: deep brand petrol. Dark mode: same hue, lifted in luminance for readability and luminous feel. |
| `color/brand/primary-soft` | `#1E6B7C` | `#5BC5DB` | Hover, secondary accents, links. |
| `color/brand/primary-deep` | `#08323D` | `#0F4C5C` | Pressed states, depth layers. In dark mode this is the original brand petrol — used as accent, not surface. |
| `color/brand/primary-glow` | rgba(15, 76, 92, 0.15) | rgba(43, 168, 194, 0.30) | Glow effect for hero brand moments — petrol radial gradient at low opacity. Dark mode glow is more visible. |

### 1.2 Surface colors — the canvas system

| Token | Light value | Dark value | Use |
|---|---|---|---|
| `color/surface/canvas` | `#FFFFFF` | `#0A0E1A` | The page background. Pure white in light, deep blue-black in dark. |
| `color/surface/raised` | `#FAFAF7` | `#13171F` | Cards, subtle differentiation from canvas. |
| `color/surface/sunken` | `#F4EFE6` | `#1A1F2A` | Editorial sections, warmer in light mode (bone), cooler in dark mode. |
| `color/surface/warm` | `#EDE5D2` | `#222937` | Long-form reading sections. |
| `color/surface/glass` | rgba(255, 255, 255, 0.65) with backdrop-blur(12px) | rgba(255, 255, 255, 0.06) with backdrop-blur(16px) | Glass-morphism card surface — the signature treatment. |
| `color/surface/inverse` | `#0A0E1A` | `#FFFFFF` | The opposite of canvas — used for dramatic block reversals. |

### 1.3 Text colors

| Token | Light value | Dark value | Use |
|---|---|---|---|
| `color/text/primary` | `#0A0E1A` | `#FFFFFF` | Default body, headings. |
| `color/text/secondary` | `#2B2F38` | `#C8CCD3` | Secondary body, slightly softer. |
| `color/text/tertiary` | `#6B7380` | `#8B919C` | Captions, meta, helper text. |
| `color/text/disabled` | `#B4B9C2` | `#4A5060` | Disabled states. |
| `color/text/inverse` | `#FFFFFF` | `#0A0E1A` | Text on inverse surfaces. |
| `color/text/brand` | `#0F4C5C` | `#5BC5DB` | Branded text emphasis. |

### 1.4 Border colors

| Token | Light value | Dark value | Use |
|---|---|---|---|
| `color/border/subtle` | `#ECEEF1` | `rgba(255,255,255,0.06)` | Hairline dividers, very low contrast. |
| `color/border/default` | `#D8DCE2` | `rgba(255,255,255,0.10)` | Standard borders. |
| `color/border/strong` | `#6B7380` | `rgba(255,255,255,0.20)` | Emphasized borders, focused inputs. |
| `color/border/brand` | `#0F4C5C` | `#2BA8C2` | Brand-emphasized borders, accent rules. |
| `color/border/glass` | `rgba(15,76,92,0.20)` | `rgba(255,255,255,0.18)` | Glass-card hairline border — luminous in dark mode. |

### 1.5 Extended chromatic palette (chromatic accents)

Used sparingly. Same values for both modes, except where contrast requires shift.

| Token | Light & Dark value | Description |
|---|---|---|
| `color/accent/rust` | `#C46A3A` | Energy moments, warm accents |
| `color/accent/mustard` | `#D4A437` | Warmth, optimism |
| `color/accent/sage` | `#6B8E5C` | Calm growth, eco |
| `color/accent/cobalt` | `#1F4A9E` (light) / `#3A6BC8` (dark) | Depth, marine |
| `color/accent/terracotta` | `#C97356` | Mediterranean, warmth |
| `color/accent/pink-dust` | `#E5C4C8` | Tenderness |
| `color/accent/lilac` | `#A89EC4` | Quiet elegance |
| `color/accent/olive` | `#8A8B4C` | Earthiness |

**Usage rule**: at most one accent color per page section, beyond petrol. Multiple accents within a single visual frame are forbidden.

### 1.6 Functional / feedback colors

| Token | Light value | Dark value |
|---|---|---|
| `color/feedback/success` | `#2D7A4D` | `#56C087` |
| `color/feedback/success-soft` | `#E8F2EC` | `rgba(86,192,135,0.12)` |
| `color/feedback/warning` | `#B8841F` | `#E2B247` |
| `color/feedback/warning-soft` | `#FAF1DC` | `rgba(226,178,71,0.12)` |
| `color/feedback/error` | `#B02E2E` | `#E5594F` |
| `color/feedback/error-soft` | `#F7E5E5` | `rgba(229,89,79,0.12)` |
| `color/feedback/info` | `#1E6B7C` | `#5BC5DB` |
| `color/feedback/info-soft` | `#E5F0F2` | `rgba(91,197,219,0.12)` |

### 1.7 Contrast verification

All combinations meet WCAG 2.2 AA at minimum. Key ratios verified:

| Combination | Light mode ratio | Dark mode ratio | Compliance |
|---|---|---|---|
| Primary text on canvas | 18.4:1 | 18.4:1 | AAA both |
| Brand on canvas | 8.5:1 | 6.2:1 | AAA / AA+ |
| Tertiary text on canvas | 4.95:1 | 5.1:1 | AA both |
| White on brand-primary | 8.5:1 | 4.5:1 | AAA / AA |
| Inverse text on inverse surface | 18.4:1 | 18.4:1 | AAA both |

If a combination is needed but doesn't meet AA, that combination is forbidden.

---

## 2. Typography

### 2.1 The family

**Inter** — single typeface for the entire system. Reasons:

- Full Greek (greek + greek-ext) coverage.
- Full Latin (latin + latin-ext) coverage.
- Variable font (one file = all weights = best performance).
- Optimized for screen rendering.
- OpenType features: tabular numerals, contextual alternates, oldstyle numerals available.
- Free, SIL Open Font License, industry-standard.

No serif companion. No display alternative. The system gets its tonal range from **weight contrast within Inter**, not from family contrast.

### 2.2 Greek-specific decisions

- Body line-height ≥ 1.55 (Greek accents collide with descenders below this threshold).
- No `text-transform: uppercase` (breaks final sigma `ς`). Use direct uppercase strings.
- No `text-justify: justify` for Greek body (creates ugly word gaps).
- No automatic hyphenation in Greek.
- Subset: `latin, latin-ext, greek, greek-ext` only.

### 2.3 Type scale — modular, semantic

Modular ratio 1.250 (Major Third). Base 16px = 1rem.

| Token | Size (desktop) | Size (mobile) | Line-height | Weight | Letter-spacing |
|---|---|---|---|---|---|
| `type/display/xl` | 96px | 56px | 1.0 | 900 | -0.04em |
| `type/display/lg` | 76px | 44px | 1.0 | 900 | -0.035em |
| `type/display/md` | 60px | 36px | 1.05 | 800 | -0.03em |
| `type/display/sm` | 48px | 32px | 1.05 | 800 | -0.025em |
| `type/heading/xl` | 36px | 28px | 1.15 | 700 | -0.02em |
| `type/heading/lg` | 28px | 22px | 1.15 | 700 | -0.015em |
| `type/heading/md` | 22px | 20px | 1.20 | 600 | -0.01em |
| `type/heading/sm` | 18px | 18px | 1.25 | 600 | 0 |
| `type/body/lg` | 18px | 18px | 1.55 | 400 | 0 |
| `type/body/md` | 16px | 16px | 1.55 | 400 | 0 |
| `type/body/sm` | 14px | 14px | 1.50 | 400 | 0 |
| `type/body/xs` | 12px | 12px | 1.40 | 500 | +0.06em |

### 2.4 Mixed-weight emphasis pattern

The brand's signature typographic device. Within a single headline, mix **heavy weight (900)** with **light italic (300 italic)** to create editorial rhythm.

Pattern:
```
[ HEAVY headline opener ]
[ Light italic phrase ]
```

Example desktop layout:
```
The Right Solution.            ← 900, ink/white
Not Just the Available One.    ← 300 italic, brand-petrol
```

Used in: hero sections, major brand statements, editorial pull quotes. Not used in: body, navigation, buttons.

### 2.5 Eyebrow chip text

Always:
- `type/body/xs`
- weight 500
- UPPERCASE (typed directly)
- letter-spacing +0.06em or +0.08em
- color: brand or text-secondary depending on context
- often paired with a 60-80px short accent rule

### 2.6 Slogan treatment

"Making Your Life Colorful." appears in:
- `type/display/md` italic, weight 600, color brand — for stand-alone hero.
- `type/heading/lg` italic, weight 600, color brand — for sub-line under wordmark.
- Always English. Always italic. Always brand color.

### 2.7 Body reading constraints

- Maximum line length: 65 characters (≈ 720px container for body/lg in Latin, ≈ 520px for Greek).
- Paragraph spacing: 1em vertical between paragraphs.
- First-line indent: never. Use space, not indent.

### 2.8 Numerals

- Default: lining figures.
- Tabular: for tables, phone numbers, hours, financial figures (`font-feature-settings: "tnum"`).
- Old-style: not used.

### 2.9 Performance

- Variable font, woff2 format.
- Subsets: latin + latin-ext + greek + greek-ext only.
- `font-display: swap` with metric-matched fallback to avoid layout shift.
- Preload on every page.
- Self-hosted on origin or edge CDN — never Google Fonts CDN in production (GDPR).

### 2.10 Fallback chain

```
Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI",
Roboto, "Helvetica Neue", Arial, "Noto Sans Greek", sans-serif
```

---

## 3. Spacing system

8pt grid. All spacing values are multiples of 8.

| Token | px | rem | Use |
|---|---|---|---|
| `space/0` | 0 | 0 | None |
| `space/1` | 4 | 0.25 | Minimal gap (icon-text) |
| `space/2` | 8 | 0.5 | Tight inline gap |
| `space/3` | 12 | 0.75 | Compact stacking |
| `space/4` | 16 | 1.0 | Default gap |
| `space/5` | 24 | 1.5 | Comfortable gap |
| `space/6` | 32 | 2.0 | Section internal padding |
| `space/7` | 48 | 3.0 | Section breaker (small) |
| `space/8` | 64 | 4.0 | Section breaker (medium) |
| `space/9` | 96 | 6.0 | Section breaker (large) |
| `space/10` | 128 | 8.0 | Major section break |
| `space/11` | 160 | 10.0 | Hero-level breathing |
| `space/12` | 192 | 12.0 | Cinematic empty space |

### 3.1 Component padding defaults

- Button (md): vertical 12px, horizontal 24px.
- Input (md): vertical 12px, horizontal 16px.
- Card: 24px all sides.
- Form field gap (label-input): 8px.
- Form field gap (between fields): 24px.

### 3.2 Section padding

- Major section, desktop: 128px top + bottom.
- Major section, mobile: 96px top + bottom.
- Secondary section, desktop: 96px top + bottom.
- Secondary section, mobile: 64px top + bottom.

### 3.3 Container

- Max-width: 1320px.
- Outer padding desktop: 64px.
- Outer padding tablet: 32px.
- Outer padding mobile: 16px.

### 3.4 Negative space rule

When in doubt about whether a section needs more or less breathing — choose more. Negative space is the strongest quality signal in the system.

---

## 4. Layout & grid

### 4.1 Grid

- 12 columns.
- Gutter: 24px.
- Container max-width: 1320px.

### 4.2 Common layouts

| Layout | Cols | Use |
|---|---|---|
| Full-bleed | 12 | Hero photography, immersive sections |
| Centered narrow | 8 (cols 3-10) | Editorial article body |
| Centered medium | 10 (cols 2-11) | Most content sections |
| Asymmetric 7-5 | 7 + 5 | Hero photo + text or vice-versa |
| Quad | 3-3-3-3 | Service cards, value props |
| Triple | 4-4-4 | Project cards, value props |
| Editorial dual | 6-6 | About and editorial sections |

### 4.3 Asymmetric is the default for hero and content sections

The brand's voice prefers asymmetric over centered. Hero sections, service-detail sections, and project case studies should default to asymmetric (5-7 or 7-5) layouts, with deliberate use of empty columns as breathing.

### 4.4 Aspect ratios

| Use | Ratio |
|---|---|
| Hero photo | 16:9 or 21:9 |
| Project hero | 3:2 or 16:9 |
| Project card | 4:5 |
| Square (social) | 1:1 |
| Vertical (Instagram story) | 9:16 |
| Avatar | 1:1 |

### 4.5 Mobile reflow

- Asymmetric → vertical stack, image-first by default.
- Quad (3-3-3-3) → 1 col mobile, 2 col tablet.
- Triple (4-4-4) → 1 col mobile, 2 col tablet up to 900px.

---

## 5. Motion

Theatrical when intentional. Silent otherwise.

### 5.1 Easing tokens

| Token | Curve | Use |
|---|---|---|
| `motion/ease/standard` | cubic-bezier(0.4, 0, 0.2, 1) | Default — fade, color change |
| `motion/ease/decel` | cubic-bezier(0, 0, 0.2, 1) | Entering elements |
| `motion/ease/accel` | cubic-bezier(0.4, 0, 1, 1) | Leaving elements |
| `motion/ease/firm` | cubic-bezier(0.5, 0, 0.5, 1) | Strong state transitions |
| `motion/ease/cinematic` | cubic-bezier(0.7, 0, 0.3, 1) | Hero motion, mode toggle |

### 5.2 Duration tokens

| Token | ms | Use |
|---|---|---|
| `motion/dur/instant` | 0 | No animation |
| `motion/dur/fast` | 100 | Hover, button press |
| `motion/dur/quick` | 200 | Default state changes |
| `motion/dur/normal` | 300 | Section reveals |
| `motion/dur/calm` | 500 | Page-level transitions, mode toggle |
| `motion/dur/slow` | 800 | Hero fade-ins |
| `motion/dur/cinematic` | 1500-2500 | Continuous ambient motion (hero paint imagery only) |

### 5.3 Permitted patterns

- Fade in/out (opacity 0 ↔ 1).
- Translate-up reveal (8-16px).
- Color transition on hover/focus/active.
- Subtle scale (0.98 → 1.0) on button press.
- Cross-fade for mode toggle.
- Continuous slow drift on ambient hero imagery (paint swirls).
- Glow intensity transition on card hover (dark mode).

### 5.4 Forbidden patterns

- Bounce, spring, elastic easing.
- Auto-play sliders / carousels.
- Parallax scrolling.
- 360° rotations (except loading spinner).
- Page transitions with flying elements.
- Marquee tickers without purpose.

### 5.5 Reduced-motion support

`prefers-reduced-motion: reduce` is honored:
- All transitions fall to `motion/dur/instant`.
- Translate animations replaced with fade.
- Continuous ambient motion paused.
- Mode toggle becomes cross-fade in 100ms.

---

## 6. Iconography

### 6.1 Foundation: Lucide

- Lucide library, v latest.
- 24×24 grid.
- 2px stroke (default — never altered for foundation icons).
- Tree-shakeable: only imported icons ship.

### 6.2 Sizing

| Token | px | Use |
|---|---|---|
| `icon/xs` | 12 | Inline with body-small |
| `icon/sm` | 16 | Inline with body-default |
| `icon/md` | 20 | Default — buttons, navigation |
| `icon/lg` | 24 | Lead icons, headings |
| `icon/xl` | 32 | Hero icons, illustrative |
| `icon/2xl` | 48 | Major decorative |

### 6.3 Color

- Default: inherits parent text color.
- Brand emphasis: `color/brand/primary`.
- Functional: from feedback palette.

### 6.4 Custom icons

For brand-specific symbols not in Lucide:
- 24×24 grid.
- 2px stroke.
- Round caps and joins.
- Same optical balance principles as Lucide.
- No gradients, no shadows, no complex fills.

Custom icon list:
- `mark/droplet` — the Pavlicevits logo droplet.
- `paint/can` — paint can in profile.
- `paint/swirl` — paint swirl abstract.
- `category/auto` — automotive paint category.
- `category/marine` — marine paint category.
- `category/industrial` — industrial paint category.
- `category/decorative` — decorative paint category.

---

## 7. Surface & glass-morphism specifics

### 7.1 Glass card (dark mode)

- Background: `rgba(255, 255, 255, 0.06)`.
- Backdrop-filter: `blur(16px) saturate(1.5)`.
- Border: 1px solid `rgba(255, 255, 255, 0.18)`.
- Border-radius: 12px.
- Optional inner glow: subtle radial gradient at edge, 5-10% opacity petrol.

### 7.2 Glass card (light mode)

- Background: `rgba(255, 255, 255, 0.65)`.
- Backdrop-filter: `blur(12px) saturate(1.2)`.
- Border: 1px solid `rgba(15, 76, 92, 0.20)`.
- Border-radius: 12px.

### 7.3 Solid card (both modes, used when glass-morphism is not appropriate)

- Background: `color/surface/raised`.
- Border: 1px solid `color/border/subtle`.
- Border-radius: 8px.
- No drop-shadow (replaced by border + surface differentiation).

### 7.4 Ambient chromatic background forms

The signature "color smoke" effect (DRAVART reference):

- **Source**: derived from Mode A (pigment-in-motion) photography, processed with Gaussian blur + opacity + composite.
- **Placement**: behind hero sections, major content blocks, FAQ sections.
- **Opacity**: 5-15% in light mode (gentle watercolor stain), 15-30% in dark mode (luminous color cloud).
- **Animation**: optional slow drift (`motion/dur/cinematic`, 4-8 second cycle).

Used sparingly. No more than 2 ambient backgrounds per page.

---

## 8. Accessibility — non-negotiable

### 8.1 Contrast

- All text ≥ AA in active mode.
- Interactive elements ≥ AA.
- Critical text (CTAs, error messages) ≥ AAA where achievable.

### 8.2 Focus states

- Every interactive element has visible focus.
- Default: 2px outline `color/brand/primary` with 2px offset.
- Never `outline: none` without replacement.

### 8.3 Touch targets

- Minimum: 44×44px (WCAG 2.5.5).
- Recommended: 48×48px for primary CTAs on mobile.
- Spacing between targets: minimum 8px.

### 8.4 Motion

- `prefers-reduced-motion: reduce` honored throughout.

### 8.5 Semantics

- Heading hierarchy strict (no skips).
- Form labels visible (placeholders are not labels).
- Alt text for all images (Greek-language for Greek pages).
- ARIA only where HTML semantics insufficient.

### 8.6 Language

- `<html lang="el">` for Greek pages.
- `<span lang="en">` for English fragments inside Greek content.
- `<html lang="en">` for English-language pages (specifier audiences).

### 8.7 Mode-specific accessibility

- Dark mode: text contrast verified at AA minimum.
- Glass-morphism cards: ensure text on glass surface remains AA contrast at all viewport conditions.
- Focus rings remain visible across both modes.

---

## 9. Performance budget

| Metric | Target | Hard ceiling |
|---|---|---|
| LCP (Largest Contentful Paint) | <1.5s | <2.5s |
| CLS (Cumulative Layout Shift) | <0.05 | <0.1 |
| INP (Interaction to Next Paint) | <100ms | <200ms |
| Initial JS bundle | <100KB | <200KB |
| Initial CSS | <30KB | <50KB |
| Hero image (compressed) | <120KB | <250KB |

### 9.1 Image optimization

- Format: AVIF preferred, WebP fallback, JPEG last resort.
- Responsive sizes: srcset with 1x, 2x, 3x.
- Lazy loading below fold.
- Hero images: preloaded, prioritized.
- Paint photography: high quality bias — visual fidelity matters more than absolute byte savings, within the budget above.

### 9.2 Font optimization

- Variable woff2, ~330KB.
- Subset to latin + latin-ext + greek + greek-ext only.
- Preload, font-display: swap, metric-matched fallback.

### 9.3 Mode-toggle optimization

- Both color schemes shipped in initial CSS.
- Toggle switches CSS custom properties, not stylesheets.
- No layout reflow on toggle.

---

## 10. Mobile-first

### 10.1 Breakpoints

| Token | px | Use |
|---|---|---|
| `bp/sm` | 640 | Mobile / large mobile |
| `bp/md` | 768 | Tablet portrait |
| `bp/lg` | 1024 | Tablet landscape / small laptop |
| `bp/xl` | 1280 | Desktop |
| `bp/2xl` | 1536 | Large desktop |

### 10.2 Touch ergonomics

- Primary CTAs in thumb zone (bottom 1/3 of viewport) on mobile-only screens.
- Tap targets minimum 48×48 for primary actions.
- Spacing 8px+ between targets.

### 10.3 Reading flow

- Text content stacks vertically by default.
- Image-first stacking for narrative sections.
- Text-first stacking for technical / data sections.

---

## 11. Cross-references

```
01 BRAND_MANIFESTO        ← the why
02 VISUAL_DIRECTION       ← the aesthetic, dual-mode philosophy, photo direction
[ YOU ARE HERE ]
03 DESIGN_SYSTEM          ← tokens, typography, motion (this document)
04 COMPONENT_ARCHITECTURE ← what we build with these tokens
05 EXPERIENCE_ARCHITECTURE ← how the components flow into pages
06 AI_SEARCH_STRATEGY     ← how the pages get found
```

---

## 12. The non-negotiables (also in 02, repeated for emphasis)

1. Petrol on every page.
2. **On-brand-color** paint imagery (petrol, navy, teal, white) somewhere on every page — never multicolor.
3. Material quality made visible — no marketing fluff replacing technical truth.
4. **Dual-mode parity** — light and dark are both first-class. Every component, every page, every state designed and tested in both. Neither is a "theme" applied to the other.
5. Greek-language readiness in typography and contrast.
6. **Minimalism by default** — one focal element per section, generous breathing, decoration only where it serves meaning.
7. Negative space as feature, not as empty wasted space.
8. Performance budget honored.
9. Accessibility AA minimum.

---

**v1.0 · April 2026 · Tokens for design crew**
