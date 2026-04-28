# 07 — Handoff Brief

**One-pager for the design crew. Read this first.**

---

## Who we are

Pavlicevits Colors. Paint vendor. Kalamaria, Thessaloniki. Founded 1990 with trade roots back to 1982. Family-owned, two generations working today. Specialized in four product categories — architectural, automotive, marine, special applications — and nothing outside them. Exclusive Pellachrom partner.

## What we are not

A generic paint store. A discount-led shop. A premium-decorative-only operation. A volume-driven retailer. A site that exists to convert quickly.

## The two pillars (this matters most)

Every visual, every word, every decision must communicate both:

1. **Brand narrative & character** — the story, the discipline, the dual personality (light/shadow), the slogan.
2. **Material quality** — substance over surface. The curated portfolio. Technical truth visible everywhere.

The owners explicitly request material quality as a primary message — not a side mention.

## The aesthetic register

Two co-equal modes — both fully designed, neither a "theme" applied on top of the other:

- **Dark mode (default)**: theatrical, cinematic, intimate. Deep blue-black canvas, on-brand-color paint imagery (petrol/navy/teal/white) on black, glass-morphism cards used sparingly, petrol glow accents.
- **Light mode**: editorial, gallery-clean, generous. Pure white canvas, the same paint imagery treated as inset gallery objects (preferred treatment), bone/cream warm surfaces, petrol primary accent.

Both modes share: the same petrol signature, the same typography, the same component anatomy, the same content. Only canvas, surface, and image-treatment shift.

**Critical aesthetic rules**:

- **On-brand-color paint imagery only.** Petrol, navy, teal, white. Never multicolored. We are a paint vendor for trades, not for artists.
- **Minimalism by default.** Significantly more restrained than the DRAVART reference. We adopt DRAVART's photographic ambition but not its decorative density.
- **One focal element per section.** Decorative orbs / blur clouds / gradient blooms used sparingly, never as default surface treatment.

**Aesthetic references** (in `references/`):
- `00_dravart_aesthetic_reference.webp` — the DRAVART homepage. *Use for photographic ambition and dual-mode polish, not for decorative density.*
- `01_motion_reference.mp4` — motion feel.
- `paint-imagery/` — supplied on-brand-color paint imagery. **This is our actual hero photography.** See `09_VISUAL_ASSETS_BRIEF.md` for the full catalog and use rules.
- ALD (Aimé Leon Dore), Aesop, Linear — secondary references for editorial restraint, material reverence, and dual-mode polish respectively.

## The slogan

> ## Making Your Life Colorful.

Always English. Never translated. Italic, in petrol, often paired with mixed-weight headline treatments.

## The signature elements

Six visual elements that, in combination, identify any asset as Pavlicevits:

1. **Petrol** as recurring accent.
2. **On-brand-color paint imagery** (petrol/navy/teal/white) as signature shot. Never multicolored.
3. **Mixed-weight typography** (heavy sans + light italic emphasis pairs).
4. **Pill-shaped eyebrow chips** with semi-transparent backgrounds.
5. **Glass-morphism cards** (dark mode, sparingly) / **bone-surface cards** (light mode).
6. **Minimal density** — one focal element per section, generous breathing.

## The audience priority

| Tier | Audience | Voice calibration |
|---|---|---|
| 1 | Professional painters & contractors (esp. millennial / Gen-Z) | Peer-to-peer technical |
| 2 | Architects, designers, hotel PMs, marine pros | Editorial-respectful, portfolio-led |
| 3 | Discerning local homeowners | Knowledgeable advisor |
| 4 | DIY mass-market | Served in store, not pursued in marketing |

Voice is calibrated to Tier 1. When Tier 1 trusts us, the rest follow.

## Non-negotiable principles (carried across all docs)

1. Petrol visible on every page.
2. **On-brand-color paint imagery** (petrol/navy/teal/white) somewhere on every page — never multicolored.
3. Material quality made visible — never hidden behind marketing fluff.
4. **Dual-mode parity** — both modes fully designed, both first-class.
5. **Minimalism by default** — one focal element per section, generous breathing.
6. Greek-language readiness in typography and contrast.
7. Negative space treated as a quality signal, not empty wasted space.
8. Performance budget: LCP <1.5s, CLS <0.05, INP <100ms.
9. Accessibility AA minimum, focus states always visible.

## Forbidden patterns

- Discount banners.
- Auto-play sliders / carousels.
- Newsletter pop-ups.
- Live chat.
- Stock photography.
- Generic CTAs ("Click here," "Buy now," "Get started").
- Translation of the slogan.
- AI-generated imagery for editorial use (only for internal mockups, always labeled).
- Carnival-color combinations (multiple accent colors competing in one frame).

## Reading order

1. **`07_HANDOFF_BRIEF.md`** ← this file. Read first.
2. **`01_BRAND_MANIFESTO.md`** — the why.
3. **`02_VISUAL_DIRECTION.md`** — the aesthetic. Mood, photography, dual-mode, minimalism.
4. **`03_DESIGN_SYSTEM.md`** — tokens. Color (per mode), typography, spacing, motion.
5. **`04_COMPONENT_ARCHITECTURE.md`** — components. Atomic design, shadcn deltas, inventory.
6. **`05_EXPERIENCE_ARCHITECTURE.md`** — experience flow. Entry to lead. Page roles.
7. **`06_AI_SEARCH_STRATEGY.md`** — discoverability. Schema, llms.txt, image-prompt library.
8. **`08_WEBSITE_COPY.md`** — page-by-page English copy in the brand voice.
9. **`09_VISUAL_ASSETS_BRIEF.md`** — art direction for the supplied paint imagery, dual-mode use, asset library structure.

Plus visual references in `references/`:
- `00_dravart_aesthetic_reference.webp` — DRAVART homepage aesthetic register.
- `01_motion_reference.mp4` — motion feel.
- `paint-imagery/` — the brand's actual hero photography (supplied; place per §1.1 of doc 09).

## What we expect from the design crew

### Phase 1 — Discovery (week 1)
- Read the pack end-to-end.
- Review the DRAVART screenshot and motion reference.
- Schedule kick-off call to align on interpretation.

### Phase 2 — Design (weeks 2-6)
- Visual exploration: mood board adapted to Pavlicevits (not DRAVART pixel-by-pixel).
- Brand identity refinement: logo treatment in both modes, color refinement, type spec finalization.
- Component design: atoms → molecules → organisms in Figma (or chosen tool), both modes.
- Page templates: Home, About, Services, Projects, Single Project, Contact, Insights — both modes.
- Photography direction document: art direction for the photo shoot we will commission.
- Motion specs: timing, easing, key motion moments.

### Phase 3 — Production handoff (weeks 6-8)
- Figma file with components and templates organized for dev consumption.
- Token JSON or CSS variables (matching `03_DESIGN_SYSTEM.md`).
- Asset export specs.
- Walkthrough sessions with development team.

### Phase 4 — Implementation oversight (ongoing)
- Design QA on dev builds.
- Iteration on edge cases and states.

## What stays in our court (the brand owner)

- Final approval on brand expression.
- Photography direction final word (we may commission a Greek photographer who knows Northern Greek light).
- Copy approval (Greek copy is owned by us; design crew supplies English templates only where needed).
- Pellachrom partnership content — we coordinate this with Pellachrom directly.
- Project case study content — we own the technical details.

## Decision authority

When in conflict between docs:
- `01_BRAND_MANIFESTO.md` wins over all others.
- `02_VISUAL_DIRECTION.md` wins over `03-06` for aesthetic.
- `03_DESIGN_SYSTEM.md` wins for token specifics.
- `05_EXPERIENCE_ARCHITECTURE.md` wins for page structure.

When still ambiguous: **consult brand owner before deciding**. Better one extra question than five revisions.

## Success criteria

When this rebuild ships, the following must be true:

- A visitor entering from any vector (AI search, Google, IG, walk-by, referral) understands within 30 seconds: who we are, what we sell, that we are not generic.
- A specifier (architect, hotel PM) can review our Projects page and recommend us upstream after one visit.
- A tradesperson Tier-1 visitor leaves with the impression "these people are for people like me."
- A returning visitor finds something new each time (fresh project, article, material spotlight).
- ChatGPT/Gemini/Perplexity, when asked "best paint store in Thessaloniki for [marine / automotive / industrial]," return Pavlicevits among the top 3.
- The site loads in under 1.5s on mobile 4G.
- Both light and dark modes are equally polished and accessibility-compliant.

## Final word

This pack is the result of months of brand work: the manifesto is the soul, the visual direction is the look, the design system is the language, the component architecture is the grammar, the experience architecture is the choreography, the AI search strategy is the audibility.

The job of the design crew is not to add to it. It's to **realize** it — with craftsmanship, attention to detail, and respect for both pillars (narrative + material quality).

If something feels missing, ask. If something feels wrong, push back — that's part of the partnership. If something feels right, ship it.

We are Pavlicevits Colors. Kalamaria. Since 1990. Making your life colorful.

---

**v1.0 · April 2026 · Handoff brief for design crew**
