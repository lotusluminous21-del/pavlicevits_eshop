# 02 — Visual Direction

**The aesthetic. Where the brand becomes visible.**

*Companion documents: `01_BRAND_MANIFESTO.md` for the why; `03_DESIGN_SYSTEM.md` for the precise tokens; `references/` folder for visual artifacts.*

---

## 0. The reference and the brief

Two reference artifacts live in the `references/` folder of this pack:

- **The DRAVART screenshot** (provided by the brand owner) — the closest available example of the aesthetic register we want to land in.
- **`01_motion_reference.mp4`** — the motion / aesthetic feel we want to evoke.

Both are reference, not instruction. Pavlicevits is not DRAVART. We are a paint vendor with 36 years of trade history in Northern Greece, a Pellachrom partnership, and a working family at the counter. But the **theatrical confidence**, the **photographic drama**, the **dual-mode polish**, the **vibrant chromatic energy**, and the **glass-morphism polish** seen in the reference — these we carry forward and adapt to our own substance.

This document defines the adaptation: what we keep, what we change, and why.

---

## 1. The aesthetic position in one paragraph

Pavlicevits Colors is a paint specialist for **tradespeople and specifiers** — automotive body shops, marine yards, hospitality projects, architects, industrial applications. It is **not** an art-supplies brand and must never be visually positioned as one. The brand has **two equally important pillars: narrative + material quality**. Visually, the brand operates in a **dual-mode system (dark + light)**, with deliberate, restrained use of dramatic on-brand-color paint imagery, minimal layout density, and a single signature accent (petrol). Imagine the discipline of Linear, the editorial restraint of Aesop and Aimé Leon Dore, paired with the dramatic photographic register of DRAVART — but stripped of decorative noise, simplified to its load-bearing elements, and anchored in the actual color palette of the brand we sell.

### 1.1 Minimalism as a structural principle

The DRAVART reference shows what to aspire to in **drama and photographic ambition** — not in **density**. Many DRAVART surfaces have visible decorative elements (orbs, gradients, blur clouds) that we will *not* import. Our version is significantly more minimal: the hero photo, the typography, the petrol accent, and breathing space carry the page. Decorative orbs, secondary background gradients, and ambient color forms appear sparingly — never as default surface treatment. Whitespace and blackspace are signals of confidence; clutter is a signal of insecurity.

If a section can be removed without weakening the page's job, it must be removed.

---

## 2. Why this direction works for Pavlicevits

The DRAVART aesthetic is a fit for three converging reasons:

**(a)** It puts **material quality at center stage.** The dramatic paint photography is not decoration — it's the visual evidence of the product. Every paint swirl, every sample, every can in dramatic lighting communicates: *this is real, this is rich, this is the substance you came for.* For a brand whose owners explicitly request material quality as a primary message, this is structurally aligned.

**(b)** It matches the brand owner's actual personality duality. The **dark mode** carries the disciplined-noir-romantic register of his personal aesthetic ("I owe it to myself," cinematic restraint, monochrome control). The **light mode** carries the editorial-clean-vibrant register of the public-facing professional ("Making your life colorful," chromatic generosity, openness). The dual-mode toggle is not a UI feature — it's the brand's honest self-portrait.

**(c)** It's photographically achievable with the actual product. We sell paint. Paint photographs beautifully — pigment in motion, color blooming through medium, finishes catching light. We don't need to invent visuals; we need to capture what's already in the cans on our shelves.

---

## 3. The dual-mode philosophy

The site, social, and brand expressions live in **two visual modes**, both first-class, both fully designed.

### 3.1 Dark mode — the dramatic register

- **Canvas**: deep near-black (not pure black — slightly blue-shifted for depth).
- **Photography**: hero-scale paint imagery as the centerpiece — swirls, drips, samples, application moments — full chromatic intensity, lit dramatically against dark surrounds.
- **Typography**: white and high-contrast, with **mixed-weight emphasis**: heavy display sans paired with lighter italic accents (drawing inspiration from the DRAVART headline treatment "Where Color Meets True ***Artistic Mastery***").
- **Surface treatment**: glass-morphism cards (semi-transparent dark surfaces with subtle blur and 1px luminous border), petrol glow accents, gentle ambient light bleed from chromatic background forms.
- **Mood**: theatrical, confident, intimate. The viewer is in the room with the paint.

### 3.2 Light mode — the editorial register

- **Canvas**: pure white.
- **Photography**: same paint imagery, but reframed for clarity — paint samples photographed against bright, cleanly-lit backdrops; product shots with natural shadow play.
- **Typography**: ink-on-white, same mixed-weight system, slightly more restrained.
- **Surface treatment**: subtle off-white card surfaces or transparent with hairline borders (bone, cream warm surfaces); petrol accents remain primary.
- **Mood**: museum-clean, generous, calm. The viewer is in a gallery viewing the work.

### 3.3 The toggle and which is default

- **Default mode**: dark. The brand's signature register is the theatrical one. This is also a meaningful signal — it tells the visitor immediately that this is not a generic shop.
- **Toggle**: visible in the header, persistent across navigation. Smooth crossfade transition (`motion/dur/calm` per the design system).
- **Respect**: `prefers-color-scheme` media query is honored on first visit. After explicit toggle, user preference stored.

### 3.4 Both modes share

- The same petrol signature color.
- The same typography system.
- The same component anatomy.
- The same content.
- The same accessibility commitments.

What changes between modes is only **canvas, surface, and treatment of imagery**. The brand voice, structure, and messaging are identical.

---

## 4. Photography direction — the new center of gravity

Photography is the most visible signal of the new direction. The brand's visual identity will be carried more by photography than by typography or chrome. This is a deliberate shift from the previous direction.

### 4.1 Five photo modes

#### Mode A — Pigment in motion (the brand's signature shot)
The single most important visual asset of the brand: paint mid-swirl, drip mid-fall, brushstroke captured at the moment of maximum visual interest. **Photographed exclusively in the brand color palette** — petrol, deep navy, teal, with white highlights — *never* multicolored, *never* rainbow.

**Why on-brand-color rather than multicolor (correcting from the DRAVART reference)**: DRAVART is an oil-paint brand for artists; multicolor swirls are on-brand for them because their customer is making art. We are a specialist paint vendor for trades — automotive, marine, industrial, architectural. Our hero photography must communicate **the material we sell, in the color that is our signature**. A multicolored swirl says "art." A petrol-and-navy swirl says "Pavlicevits." The brand owner has supplied a set of petrol-toned paint imagery (see `09_VISUAL_ASSETS_BRIEF.md`) that exemplifies this exact direction.

**Direction**: pure black backdrop in dark-mode contexts (these shots' native habitat). In light-mode contexts, the same imagery is treated differently — composited or recolored against white surrounds — see Section 4.2 below. Movement frozen, dramatic lighting, no tools or human elements visible. The paint *is* the subject.

#### Mode B — Sample portrait (product)
Paint samples — squeezed onto small surfaces, applied to chip cards, dropped from tubes. Photographed individually as objects of dignity. Inspired by the DRAVART "Premium Quality Pigment" section: each sample as a portrait, isolated against gradient or solid backdrop, lit to reveal the actual pigment quality.

**Direction**: 4:5 vertical aspect; one sample per frame; uniform composition rules across a series; subtle lighting variation that reveals color depth without distorting the actual hue.

#### Mode C — Application moment (real)
Real moments of paint being applied — roller mid-stroke, brush meeting wood, spray gun at the body shop, antifouling on a hull at a Halkidiki marina. Documentary, on-site, real conditions.

**Direction**: natural light; real subjects; no posed smiles; technical accuracy in caption (substrate, system, product).

#### Mode D — Finished result (project)
After-shots of completed work: a hotel facade catching evening light, a yacht hull post-application, an industrial floor reflecting overhead light, a residential interior in finished color. Editorial restraint, architectural-photography discipline.

**Direction**: 16:9 or 21:9 hero aspect for major projects; 4:3 for detail shots; available in both day and golden-hour conditions; never filtered.

#### Mode E — Counter human (warm, rare)
The shop, the team, the human warmth. Rarely used — once or twice per page at most. Always candid, often partial (hands, profile, back of head). B&W or warm light when appropriate.

**Direction**: same as previous direction's Mode C — preserved here.

### 4.2 Dual-mode treatment of paint imagery

The same source photographs work in **both modes** with different compositing — not different photo shoots. This is critical for production efficiency and brand consistency.

**Dark mode (default)**: paint-on-black source files used as-is. The black backdrop fades into the dark canvas seamlessly. Hero shots fill 50-70% of the viewport. Petrol/navy/teal of the paint reads as luminous against the dark surround.

**Light mode**: same source paint imagery, but composited against white. Two compositing techniques:

1. **Inversion-aware re-composite**: the paint is masked from its black backdrop and placed on white canvas. Where this works depends on the highlight structure of the original — most of our shots support this.
2. **Inset framing**: the paint imagery stays on its black ground, but is framed as a contained block (rounded rectangle, hairline border) within a white surround. This treats the photograph as a portrait — paint-on-black as object, surrounded by editorial white space. This is the **preferred** light-mode treatment because it preserves the dramatic intensity of the original.

The inset-framing approach is the one to use as default; inversion is a secondary option for hero scenarios where edge-to-edge bleed is required.

### 4.3 What we never do photographically

- No stock imagery. Period.
- No filtered Instagram-style color grades.
- No vignettes, no fake film grain, no faux-vintage.
- No people posed smiling at the camera.
- No flat-lay product shots that look like e-commerce.
- No AI-generated imagery for editorial use (only for internal mockups, always labeled).

### 4.4 The DRAVART parallel — what we adopt and what we don't

| Adopt | Don't adopt |
|---|---|
| Dark canvas with dramatic paint imagery | Multicolored / rainbow hero swirls — ours stay petrol-palette only |
| Pill-shaped chip badges for eyebrow labels | Decorative gradient orbs and ambient blur clouds in every section |
| Mixed-weight bold + light italic typography | Generic "premium oil paint for artists" positioning |
| Single hero image as section anchor | Multiple competing decorative elements per section |
| Glass-morphism cards with subtle glow (used sparingly) | Glass-morphism applied to every surface |
| Generous white/black space as the signal | Filling negative space with secondary visuals |
| Full-bleed product imagery in the brand palette | Stock photography or art-supply imagery |
| Photo-led storytelling | Decoration-led visuals with photo as afterthought |

**The summary**: we adopt DRAVART's photographic ambition and dramatic register. We adopt the dual-mode polish. We do **not** adopt its visual density or its multicolored-creative positioning. We keep the moves that signal substance; we drop the moves that signal decoration.

---

## 5. Typography vibe — the spirit, not the spec

Typography specs live in `03_DESIGN_SYSTEM.md`. Here we describe the *feel*.

### Display
Heavy sans for the dominant headline, with **mixed-weight emphasis** technique: a portion of the headline in heavy weight, a key phrase or modifier in lighter italic, creating editorial rhythm within a single sentence.

Example pattern:
> **Where Color Meets**
> ***True Artistic Mastery***

For Pavlicevits, adapted to brand voice and English/Greek:
> **The Right Solution.**
> ***Not Just the Available One.***

> **Made for Walls That**
> ***Have to Last.***

### Body
Restrained. Clean. Readable. Same family (Inter), regular and medium weights, comfortable line-height for both English and Greek.

### Eyebrow chips
Small UPPERCASE pills with hairline borders, semi-transparent backgrounds. The signal: this section has structure. The DRAVART reference uses these consistently — we adopt the device.

---

## 6. Surface and texture treatments

### 6.1 Glass-morphism cards (dark mode)

Cards in dark mode use the glass-morphism treatment:
- Background: ~10-15% white over canvas, with backdrop-blur of 12-16px.
- Border: 1px solid, with petrol or warm-white at 30-40% opacity.
- Optional inner glow: subtle radial gradient at low opacity to suggest light bloom from edge.

### 6.2 Solid editorial cards (light mode)

Cards in light mode use solid surface treatment:
- Background: subtle off-white or bone surface.
- Border: 1px solid, hairline in border/subtle token.
- No drop-shadows. Border-only differentiation.

### 6.3 Background ambient forms (both modes)

Throughout sections, large soft chromatic forms — smoke-like swirls, color blooms — drift in the background at low opacity (5-15%), providing chromatic energy without competing with foreground content. Used sparingly: hero sections, FAQ, transitions between major page blocks. Never on dense content sections.

In dark mode, these forms appear as luminous color clouds.
In light mode, they appear as soft watercolor stains.

Both are derivative of the same source imagery (paint pigment in motion) — captured/processed differently per mode.

---

## 7. Motion direction

Motion is theatrical but never gimmicky. Paint imagery on the hero may have subtle continuous motion (slow drift, color cycling at low intensity) reinforcing the "pigment in motion" idea. Section reveals on scroll use gentle fade + small upward translate. Card hovers have subtle lift + petrol border glow intensification. Mode toggle is a calm crossfade.

Specifics in `03_DESIGN_SYSTEM.md` Section 5. Forbidden patterns inherited: no auto-play sliders, no parallax, no bounce easing, no rotational decoration.

The motion video reference (`references/01_motion_reference.mp4`) shows the kind of continuous, slow, deliberate motion we evoke for ambient hero backgrounds. Not for navigation or component interaction.

---

## 8. Iconography & marks

- **Icons**: Lucide library, 2px stroke, neutral by default; petrol when emphasized.
- **Logo treatment**: existing wordmark and droplet, in white-on-dark and ink-on-white versions per mode. Optional petrol glow halo behind droplet for hero brand moments in dark mode (subtle, never carnival).
- **Pill chips**: rounded-full or generous radius (6-8px) for eyebrow labels.
- **Buttons**: rounded (4-6px) for primary CTAs; pill-shaped (rounded-full) only for tertiary actions.

---

## 9. Composition rules — what every page section follows

1. **One focal element per section.** If there's a hero photo, the typography supports it. If there's a typographic statement, the imagery supports it. Never two equal focal elements competing.
2. **Generous breathing.** Section padding is large — `space/10` to `space/12` per design system. The brand's confidence shows in its willingness to use empty space.
3. **One color emphasis per section.** Either the section is petrol-led, or it features one extension chromatic accent. Never multi-color carnival within one section.
4. **The signature is petrol.** Every page surfaces petrol somewhere — even if only as an accent line, an eyebrow chip border, a button background.
5. **The product is always close.** No section should be more than one scroll-away from a paint sample, application moment, or product reference. We're not a marketing site; we're a paint vendor.

---

## 10. Mood references — adjacent brands to study

Beyond DRAVART, the design crew should study these references for tone, layout, and execution polish. Note: we are not them — they are reference points only.

| Brand | What to study |
|---|---|
| **Aimé Leon Dore** | The discipline. Editorial restraint in product photography. Greek-American heritage handled with quiet confidence. |
| **Aesop** | The respect for material. The way packaging photography becomes brand expression. The negative space. |
| **Liquid Death** | The bold dark + vibrant accent contrast. The willingness to be theatrical without being silly. |
| **Linear** | The dual-mode polish. The dark-mode primary. The motion design. The way technical seriousness is expressed in interface. |
| **Vercel** | Glass-morphism and gradient ambient backgrounds done with restraint. |
| **Carhartt WIP** | The respect for trade craft. The way product photography honors function. |
| **DRAVART** (provided reference) | The specific aesthetic register we are adapting. Paint-as-art photography. Glass cards. Vibrant chromatic energy. |

The composite goal: take DRAVART's photographic ambition and dual-mode polish, layer in Aesop's respect for material, anchor in Aimé Leon Dore's editorial restraint, and infuse with the silent intensity of a 36-year Northern-Greek family business that knows exactly what it sells and to whom.

---

## 11. Material quality as a visual obsession

Because material quality is a primary brand pillar (per `01_BRAND_MANIFESTO.md` Section 4), the visual system must communicate it constantly — not as marketing claim, but as visual proof.

### 11.1 The photographic obligation

Every product photograph must be **technically faithful**:
- True color reproduction (no grading that shifts the actual pigment).
- Visible texture (the brushed surface of an applied coat, the bead of fresh paint).
- Honest lighting (light that reveals, doesn't flatter).

This is non-negotiable. A photograph that looks beautiful but lies about the product's actual color or finish is forbidden.

### 11.2 The technical-content obligation

Material quality is also communicated in **what we say next to the photographs**: substrate, system, products, application notes, durability claims, certifications. Never marketing fluff. Always specific. Examples:

- ✓ "Pellachrom 2-pack epoxy antifouling, applied over primer + tie coat. Sithonia exposure, 7-year service life."
- ✗ "Premium quality marine paint for stunning results."

### 11.3 The product-prominence obligation

Product cans, samples, and application materials should appear visibly throughout the site — not only in dedicated product galleries. The "Why Choose" section, the homepage hero, the project case studies, even the FAQ — all should feature the material somehow. The visitor should never go more than 1-2 scroll-distances without seeing the actual paint we sell.

### 11.4 The certification visibility

Where applicable (eco-certifications, technical certifications, standards compliance), these are surfaced **as supporting evidence**, with the certification body and the specific claim. We don't pile generic "trust badges" — we show what's actually certified, by whom.

---

## 12. The signature elements — recognizable across any surface

Six elements that, in combination, identify any visual asset as Pavlicevits:

1. **Petrol** as the recurring accent — somewhere, every time.
2. **On-brand-color paint imagery** — petrol, navy, teal, white. Never multicolored. The signature shot is *the brand's color in motion*, not "creative paint vibes."
3. **Mixed-weight typography** with bold + light-italic emphasis pairs.
4. **Pill-shaped eyebrow chips** with semi-transparent backgrounds and hairline borders.
5. **Glass-morphism cards** used sparingly in dark mode, or bone-surface cards in light mode — never default raw white.
6. **Minimal density** — one focal element per section, generous breathing, no decorative orbs as default treatment.

If a design includes these six, it reads as Pavlicevits. If it omits more than two, it has drifted.

---

## 13. What a designer does next

Reading order for the design crew, after this document:

1. `03_DESIGN_SYSTEM.md` — the precise tokens (color for both modes, typography, spacing, motion, etc.).
2. `04_COMPONENT_ARCHITECTURE.md` — what to build, what to take from shadcn, what to bespoke.
3. `05_EXPERIENCE_ARCHITECTURE.md` — how the pages flow, what each does, narrative architecture.
4. `06_AI_SEARCH_STRATEGY.md` — schema and discoverability requirements.
5. `08_WEBSITE_COPY.md` — page-by-page copy in the brand voice.
6. `09_VISUAL_ASSETS_BRIEF.md` — the supplied paint imagery, art direction, dual-mode treatment.
7. `references/01_motion_reference.mp4` — the motion feel.
8. The DRAVART screenshot (provided to the team separately) — the aesthetic register, *for ambition not for replication*.
9. The supplied petrol paint imagery (in `references/paint-imagery/`) — the actual hero photography for the site.

When designing a new section or page, return here for the question: *does this feel like Pavlicevits in light + dark, with material quality visible?* If yes, proceed to design system. If no, adjust before continuing.

---

> *"The single most important thing on our shelves is what's in the can."*
>
> The visual direction exists to make that truth feel like the most important thing on the screen, too.

---

**v1.0 · April 2026 · Visual direction for design crew**
