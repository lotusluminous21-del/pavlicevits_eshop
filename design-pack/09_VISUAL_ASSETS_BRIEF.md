# 09 — Visual Assets Brief

**Art direction for the brand's actual photography. The supplied petrol paint imagery, additional shoots needed, dual-mode treatment, and use rules.**

*Reads after `02_VISUAL_DIRECTION.md` (which establishes the photographic philosophy). This document is the operational extension of Section 4 of that file.*

---

## 0. The premise

The brand owner has supplied a set of paint imagery in the actual brand color palette: deep petrol, navy, teal, with white highlights, on pure black backgrounds. These are not stock photos. They are the brand's hero photography. They define the visual identity more than any other element.

This document tells the design crew:
- **What each supplied asset is** and how to recognize it.
- **Where to use it** — page by page, section by section.
- **How to treat it in both modes** (the same asset works in both, with different compositing).
- **What additional photography is needed** that we don't yet have.
- **Naming convention** for the asset library.

---

## 1. The supplied imagery — inventory

The brand owner has supplied **10+ paint imagery files**. Each one shows fluid paint in motion in the brand palette (petrol / navy / teal / white) on pure black backgrounds. They differ in composition, energy, and aspect ratio. Each one has a different ideal use case.

**File naming convention** (apply on receipt; place all files in `references/paint-imagery/`):

```
paint-[composition-type]-[number].jpg
```

For example:
- `paint-vortex-01.jpg` — the spiral vortex composition
- `paint-brushstroke-01.jpg` — single elegant curved brushstroke
- `paint-waves-parallel-01.jpg` — multiple parallel waves
- `paint-splash-s-01.jpg` — the S-shaped splash
- `paint-banner-horizontal-01.jpg` — long horizontal sweep
- `paint-waves-active-01.jpg` — wavy active forms
- `paint-splash-diagonal-01.jpg` — diagonal directional splash
- `paint-explosion-01.jpg` — the wild splash explosion
- `paint-wave-calm-01.jpg` — calm horizontal wave
- `paint-ribbon-01.jpg` — smooth sculptural ribbon

Future additions follow the same scheme.

### 1.1 Catalog with use recommendations

| File | Composition | Energy | Recommended primary use | Aspect notes |
|---|---|---|---|---|
| `paint-vortex-01.jpg` | Centered spiral vortex of petrol/navy/teal/white | High, focal | **Home hero** (dark mode) — the brand's signature shot | ~16:9, can crop to 4:3 or square |
| `paint-brushstroke-01.jpg` | Single elegant curved brushstroke | Mid, sculptural | Inline accents in editorial sections, dividers, illustrative pulls | ~16:9, supports cropping |
| `paint-waves-parallel-01.jpg` | Multiple parallel curved waves | Mid, sequenced | Section dividers, background pattern at low opacity, transitions between major content blocks | Can be tiled horizontally |
| `paint-splash-s-01.jpg` | S-shaped splash with droplets | Mid-high, dynamic | Secondary hero, accent for service category cards, social tiles | Versatile aspect; usable 16:9 or square |
| `paint-banner-horizontal-01.jpg` | Long horizontal petrol-to-navy sweep | Mid, gradient | **CTA banners, full-bleed sections, footer background** — the workhorse for breaking up text-heavy pages | 21:9 or wider; great for cinematic banners |
| `paint-waves-active-01.jpg` | Active wavy forms with white highlights | Mid-high, fluid | Hero alternates, section heros for "what we do" type sections | 16:9 |
| `paint-splash-diagonal-01.jpg` | Diagonal splash with directional droplets | High, directional | About page hero, project hero with directional energy | 16:9 |
| `paint-explosion-01.jpg` | Wild full-frame splash explosion | Highest energy | Reserved for the biggest brand moments — campaign hero, year-launch announcements | Square or 16:9; use sparingly |
| `paint-wave-calm-01.jpg` | Calm restrained horizontal wave | Low-mid, subdued | Secondary heros, ambient backgrounds at 20-40% opacity, FAQ section background | 16:9 |
| `paint-ribbon-01.jpg` | Sculptural smooth ribbon curve | Mid, controlled | Inline accents in articles, illustration-as-mark, decorative flourishes for editorial sections | Versatile |

### 1.2 The hero hierarchy

When a designer is selecting an image for a section, this is the **hierarchy of dramatic intensity** to follow:

1. **Highest drama** (`paint-explosion-01`, `paint-vortex-01`): only on Home hero or major campaign moments.
2. **High drama** (`paint-splash-s-01`, `paint-splash-diagonal-01`, `paint-waves-active-01`): page heros for non-Home pages, featured project moments.
3. **Mid drama** (`paint-brushstroke-01`, `paint-banner-horizontal-01`, `paint-ribbon-01`): editorial sections, dividers, CTA banners.
4. **Low drama / ambient** (`paint-wave-calm-01`, `paint-waves-parallel-01` at low opacity): backgrounds, secondary surfaces, transitions.

**One image per section, never two.** If a section uses a hero paint asset, no other paint asset competes within the same scroll-distance.

---

## 2. Dual-mode treatment of the supplied imagery

The same source files work in **both modes** with different compositing. Re-shoots are not required.

### 2.1 Dark mode treatment (default — these images' native habitat)

Direct use. Black backdrop bleeds into the canvas. No masking, no framing. The asset spans 60-80% of the section width and acts as the gravitational center.

Example: Home hero with `paint-vortex-01` placed full-bleed or in an asymmetric 7-col block, with text on the remaining 5 cols.

### 2.2 Light mode treatment (preferred: inset framing)

The paint imagery on its black ground stays as a **contained photograph** within a white surround — like a portrait hung on a gallery wall. Treatment specifics:

- The image is placed in a rounded-corner frame (12px radius) with a hairline 1px border.
- The black backdrop of the photo is preserved as part of the photograph itself (not masked).
- Padding around the framed image (white surround) is generous: 96-128px on each side at desktop, 32-48px at mobile.
- The photograph reads as **art object on gallery wall**, which reinforces material reverence.

This treatment is the **preferred light-mode handling** because it preserves the dramatic intensity of the original.

### 2.3 Light mode treatment (alternate: masked recomposite)

For full-bleed scenarios in light mode where edge-to-edge bleed is required (rare — banner sections, image-heavy CTA blocks), the paint can be masked from its black ground and composited against white.

Caveats:
- Not all source files support clean masking — some have soft edges or fine droplets that don't separate cleanly.
- The visual intensity drops noticeably without the dark surround.
- Test before deciding; if masking degrades the image, fall back to inset framing.

### 2.4 What to never do

- Recolor the paint imagery to non-brand colors. The petrol/navy/teal palette is the point.
- Crop so tightly that the painting motion is illegible.
- Apply filters (blur, sepia, duotone other than for ambient backgrounds — see Section 4).
- Use as a literal background behind text without adequate contrast adjustment (text on paint imagery requires a darkening overlay or careful placement).
- Place two paint assets in the same viewport.

---

## 3. Use cases — page by page

This section maps each supplied asset to its canonical use, integrating with the templates from `04_COMPONENT_ARCHITECTURE.md` and the page narrative roles from `05_EXPERIENCE_ARCHITECTURE.md`.

### 3.1 Home

**Hero** (per `04_COMPONENT_ARCHITECTURE.md` 5.2.1 `hero/cover`):
> Use `paint-vortex-01.jpg` as the dominant hero asset. Place asymmetric 7-cols (right side for desktop) with text on the left 5-cols. In dark mode, full-bleed into surrounding canvas. In light mode, inset frame with generous white surround.

**Material Spotlight section** (per `04_COMPONENT_ARCHITECTURE.md` 5.10):
> No paint imagery in this section — the spotlight is the **paint sample portraits** (Mode B from `02_VISUAL_DIRECTION.md`), which are a separate shoot we need to commission. See Section 5 below.

**Featured project block**:
> Use the project's own photograph. Paint imagery from this set is *not* used here.

**CTA banner / footer**:
> Use `paint-banner-horizontal-01.jpg` as the section background, behind the call-to-action text. Apply a 60-70% darkening overlay so the text remains AAA-contrast.

### 3.2 About

**Hero** (`hero/page`):
> Use `paint-splash-diagonal-01.jpg` — the directional energy fits the "since 1990, moving forward" narrative.

**History three-acts section**:
> No paint imagery. Text-led, with optional small accent rules in petrol.

**Material curation section**:
> Optional small ribbon accent (`paint-ribbon-01.jpg` cropped) as an inline illustrative element. Used sparingly.

**Pellachrom partnership block**:
> Photo of the Pellachrom relationship (e.g., shop interior, a real Pellachrom can on display, or an Edessa factory shot if available) — not from this paint imagery set.

### 3.3 Services

**Hero** (`hero/page`):
> Use `paint-waves-active-01.jpg`. The active wave imagery suggests motion / capability without being too dramatic for an interior page.

**Services grid (6 cards)**:
> No paint imagery in card backgrounds. Each card uses an icon (Lucide) and clean type. Paint imagery appears only at section transitions or banners.

**Process steps section (4 steps)**:
> Optional `paint-waves-parallel-01.jpg` as a low-opacity (15-25%) background behind the process steps, hinting at sequence. Optional, not required.

**Bottom CTA**:
> Use `paint-banner-horizontal-01.jpg` as section background.

### 3.4 Projects (index)

**Hero**:
> Use `paint-brushstroke-01.jpg` — the calm, sculptural single brushstroke fits the "the work speaks for itself" tone. Less dramatic than home; more curated.

**Project grid**:
> Each project card uses its own project photograph. Paint imagery from this set is not used in the cards themselves.

**Bottom CTA**:
> Use `paint-banner-horizontal-01.jpg` or `paint-wave-calm-01.jpg`.

### 3.5 Single project page

**Hero**:
> The project's own hero photograph (real conditions documentary) — full-bleed 16:9 or 21:9. Paint imagery from this set is not used here.

**Tech grid**:
> Pure typography. No background imagery.

**Body editorial**:
> Optional inline `paint-ribbon-01.jpg` or `paint-brushstroke-01.jpg` as a small illustrative break between body sections. Used sparingly.

**Photo gallery**:
> Project's own photographs.

**Bottom CTA**:
> `paint-banner-horizontal-01.jpg` or related.

### 3.6 Partnerships page

**Hero**:
> Use `paint-splash-s-01.jpg` — the S-shape implies relationship, connection, flow.

**Pellachrom block**:
> Real Pellachrom photography (factory, can, partnership context) — not from this paint set.

**Other partners cards**:
> Each one with brand logo + clean type. No paint imagery in cards.

**Bottom CTA**:
> `paint-banner-horizontal-01.jpg`.

### 3.7 Insights (blog) index

**Hero**:
> Use `paint-wave-calm-01.jpg` — calm, restrained, fits the "notes from the counter" register.

**Article cards**:
> Each article has its own hero image. Paint imagery from this set is not used in cards.

### 3.8 Single article

**Hero**:
> The article's own hero image. If no specific image exists, use a topical paint asset:
> - Marine articles: `paint-wave-calm-01.jpg` (sea-evocative)
> - Color theory / matching articles: `paint-vortex-01.jpg`
> - Technical / process articles: `paint-brushstroke-01.jpg`

### 3.9 Contact

**Hero**:
> Use `paint-ribbon-01.jpg` — the controlled sculptural ribbon fits "tell us about the work" — calm, deliberate, not dramatic.

**Form block + side panel**:
> No paint imagery. Form needs maximum focus.

### 3.10 404 / 500 error

**Background**:
> Optional very faded `paint-explosion-01.jpg` at 10-20% opacity behind the centered minimal hero. The explosion fits the "something blistered" / "didn't adhere" theme with a hint of self-awareness.

---

## 4. Ambient background forms — derivative use

Beyond use as primary hero imagery, paint assets can be processed into **ambient background forms** that drift behind content at low opacity.

### 4.1 How to derive

Take a paint asset (preferably calmer compositions like `paint-wave-calm-01` or `paint-waves-parallel-01`). Apply:

1. Gaussian blur (radius 30-60px depending on resolution).
2. Reduce opacity to 5-15% in light mode, 15-30% in dark mode.
3. Optional: slow subtle drift animation (`motion/dur/cinematic`, 4-8 second cycle).
4. Position behind hero or major content blocks.

### 4.2 When to use

Sparingly. Maximum **one ambient form per page**, ideally only on the hero. Other sections stay clean.

### 4.3 When not to use

- On dense content sections (services grid, project tiles, contact form).
- On any page where the primary paint asset is already at full intensity.
- As a default treatment — it's a deliberate choice, not a fallback.

---

## 5. Additional photography we still need to commission

The supplied paint imagery covers hero/banner/ambient needs. Three additional photo shoots are required to complete the brand's visual asset library:

### 5.1 Paint sample portraits (Mode B from `02_VISUAL_DIRECTION.md`)

For the **Material Spotlight** section on Home, Services pages, and elsewhere. Each sample photographed individually as an object of dignity.

**Direction**:
- Single paint sample (extruded onto a small ceramic chip or similar) per frame.
- Photographed against gradient backdrop transitioning from deep navy to subtle petrol (dark mode) or against bone-cream (light mode).
- 4:5 vertical aspect.
- Soft directional studio light reveals the paint's actual color and texture.
- Sharp focus on paint surface.
- At minimum, a 4-up grid: petrol (signature), deep navy, terracotta (warm accent), white/cream (light alternative).
- Expand later to include warm yellow, sage green, cobalt blue — the extension palette.

**Why we need this**: the supplied imagery shows paint *in motion*. The Material Spotlight needs paint as *object* — to communicate the actual product on the shelf.

### 5.2 Project documentary photography (Mode C / D from `02_VISUAL_DIRECTION.md`)

Real conditions, real projects:
- Yacht hull with antifouling, at a Halkidiki yard (golden-hour light).
- Hotel facade post-application.
- Industrial floor with epoxy finish.
- Body shop in operation, paint cabinet door open showing a Pellachrom or Vivechrom can.
- Color matching session at the counter.

**Why we need this**: every project case study needs its own photograph. Generic stock or AI-generated imagery is forbidden.

### 5.3 Counter human photography (Mode E)

Quiet, intimate, sparingly used. Shop interior, hands at work, color samples being compared. Black and white preferred for warmth.

---

## 6. Naming and asset organization

```
references/
  01_motion_reference.mp4           (existing)
  paint-imagery/                    (place supplied paint files here)
    paint-vortex-01.jpg
    paint-brushstroke-01.jpg
    paint-waves-parallel-01.jpg
    paint-splash-s-01.jpg
    paint-banner-horizontal-01.jpg
    paint-waves-active-01.jpg
    paint-splash-diagonal-01.jpg
    paint-explosion-01.jpg
    paint-wave-calm-01.jpg
    paint-ribbon-01.jpg
    [additional]
  paint-samples/                    (commission per Section 5.1)
    sample-petrol.jpg
    sample-navy.jpg
    [...]
  projects/                         (commission per Section 5.2)
    project-yacht-sithonia-2024-hero.jpg
    project-hotel-halkidiki-2025-hero.jpg
    [...]
  counter/                          (commission per Section 5.3)
    counter-color-matching.jpg
    [...]
```

When delivered to production, these are cataloged in the codebase under `/public/img/` with the same structure.

---

## 7. Format and delivery specifications

For each asset destined for the live site:

- **Format**: AVIF preferred, WebP fallback, JPEG last resort.
- **Resolution**: 1× = displayed size; 2× = retina; 3× = ultra-retina (mobile).
- **Compression**: visual fidelity bias — paint texture must be preserved. Within performance budget per `03_DESIGN_SYSTEM.md` Section 9.
- **Color profile**: sRGB.
- **Alt text**: descriptive of the visual + technical context. Example: `"Petrol-toned paint in mid-spiral, hero photography for Pavlicevits Colors brand"`.

---

## 8. The minimalism principle applied to imagery

Even with strong imagery available, the discipline is to **use less of it, not more**. The supplied paint set is a tool — it's tempting to use it everywhere because each frame is beautiful. We resist that.

The rule:
- **Hero of a page**: yes, use a paint asset.
- **Section transitions / banners**: yes, sparingly, maybe one or two per page.
- **Decorative fill in dense content**: no.
- **Backgrounds for buttons or cards**: no.
- **Multiple paint assets in same scroll-distance**: no.

If a designer wants to use a paint asset somewhere, the test is: *does this page need this image to do its job?* If yes, use it. If it's just because the page felt "empty," resist — empty is on-brand.

---

## 9. Cross-references

```
01 BRAND_MANIFESTO        ← the why
02 VISUAL_DIRECTION       ← photographic philosophy (this doc is its operational extension)
03 DESIGN_SYSTEM          ← tokens and minimalism principles
04 COMPONENT_ARCHITECTURE ← components that consume the imagery
05 EXPERIENCE_ARCHITECTURE ← page roles
06 AI_SEARCH_STRATEGY     ← discoverability + AI image-prompt library
07 HANDOFF_BRIEF          ← reading order
08 WEBSITE_COPY           ← copy that pairs with imagery
[ YOU ARE HERE ]
09 VISUAL_ASSETS_BRIEF    ← art direction for the supplied imagery
```

---

> *"The asset is petrol in motion. The brand is petrol with discipline. The photography exists to remind the visitor that the substance is real."*

---

**v1.0 · April 2026 · Visual asset brief for design crew**
