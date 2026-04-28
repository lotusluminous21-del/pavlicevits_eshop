# Pavlicevits Colors — Design Pack

**Brand foundation, visual direction, design system, and component architecture for the 2026 site rebuild.**

*Kalamaria, Thessaloniki — Since 1990.*

---

## What's in this folder

This pack is the complete handoff to the design and development crew. Reading order matters — start with `07_HANDOFF_BRIEF.md` for orientation, then proceed numerically.

```
design-pack/
├── README.md                          ← you are here (folder map)
├── 01_BRAND_MANIFESTO.md              ← the why — story, voice, audiences, slogan, two pillars
├── 02_VISUAL_DIRECTION.md             ← the aesthetic — dual-mode, photography, minimalism
├── 03_DESIGN_SYSTEM.md                ← tokens — color (light + dark), type, spacing, motion
├── 04_COMPONENT_ARCHITECTURE.md       ← components — atomic design, shadcn/ui deltas, inventory
├── 05_EXPERIENCE_ARCHITECTURE.md      ← experience — entry to lead, page flow, narrative
├── 06_AI_SEARCH_STRATEGY.md           ← discoverability — schema, llms.txt, content patterns
├── 07_HANDOFF_BRIEF.md                ← one-pager for the crew (read this first)
├── 08_WEBSITE_COPY.md                 ← page-by-page English copy in the brand voice
├── 09_VISUAL_ASSETS_BRIEF.md          ← art direction for the supplied paint imagery + dual-mode use
└── references/
    ├── 00_dravart_aesthetic_reference.webp  ← DRAVART homepage — aesthetic register reference
    ├── 01_motion_reference.mp4              ← motion / aesthetic feel reference
    ├── paint-imagery/                       ← supplied petrol paint hero imagery (drop files here)
    ├── paint-samples/                       ← to be commissioned (per 09 §5.1)
    ├── projects/                            ← to be commissioned (per 09 §5.2)
    └── counter/                             ← to be commissioned (per 09 §5.3)
```

---

## The two pillars (read first)

Pavlicevits Colors stands on two co-equal brand pillars. Every visual, content, and product decision must serve both.

1. **Brand narrative & character** — the story (since 1990, Kalamaria, two generations), the disciplined-craft soul, the quiet confidence, the "Making Your Life Colorful" promise.
2. **Material quality** — the substance behind the brand. The curated portfolio. The Pellachrom partnership. The technical truth in every can. *Owners explicitly request this be felt as primary, not secondary.*

If a draft serves only one of these, it's incomplete.

---

## The aesthetic register in one paragraph

The brand operates in a **dual-mode visual system** (dark primary + light first-class alternative — both fully designed, neither a "theme"). The dark mode carries the theatrical, intimate, cinematic register; the light mode carries the editorial, generous, gallery-clean register. Photography is the new center of gravity — and crucially, **all hero photography uses the brand's own color palette** (petrol, navy, teal, white) — never multicolored. We are a paint vendor for trades, not for artists; the visual must say so. The signature accent color is **petrol** (#0F4C5C in light mode, #2BA8C2 lifted in dark mode). Typography is **all-Inter, mixed-weight emphasis** (heavy sans + light italic accents). Chip-style eyebrow pills, glass-morphism cards used sparingly, and the on-brand-color paint imagery as hero anchors round out the visual vocabulary. **Minimalism is the structural rule** — significantly more restrained than the DRAVART reference, which we adopt for photographic ambition but not for decorative density. The DRAVART screenshot in `references/` and `references/01_motion_reference.mp4` show the aesthetic register we are adapting; the `references/paint-imagery/` folder holds the supplied petrol-toned imagery that defines our actual hero photography.

---

## How to use this pack

### If you're the design lead

Read in order: **07 → 01 → 02 → 03 → 04 → 05 → 06**. The Handoff Brief (07) is your navigation map. Each subsequent doc gives you a single layer.

### If you're a designer working on a specific component

Skim 07 for context. Then read **04** (Component Architecture) for that component's contract. Reference back to **03** (Design System) for tokens. Reference back to **02** (Visual Direction) for aesthetic intent.

### If you're a developer (production phase)

Same path: **07 → 04 → 03**, then implement. Tokens from 03 become CSS custom properties. Components from 04 become shadcn/ui customizations + bespoke pieces. Schema from 06 goes into page heads.

### If you're a content writer / copywriter

Read **01** (Manifesto) and **02** (Visual Direction). Then **05** (Experience Architecture) for narrative role of each page. Voice, tone, microcopy patterns are codified across all of these.

### If you're a photographer / art director

Read **01** (Manifesto, especially Section 4 on material quality) and **02** (Visual Direction, especially Section 4 on the five photo modes). Reference the DRAVART screenshot and `references/01_motion_reference.mp4` for the aesthetic register.

---

## Tech stack assumptions

- **Framework**: Next.js 14+ with App Router.
- **Styling**: Tailwind CSS with CSS custom properties for tokens.
- **Component library**: shadcn/ui (copied into project, customized per `04_COMPONENT_ARCHITECTURE.md`).
- **Icons**: Lucide.
- **Typography**: Inter (variable woff2, self-hosted, subsetted to latin/latin-ext/greek/greek-ext).
- **Languages**: Greek primary (most pages), English available where international audiences require it.
- **Modes**: dark default, light first-class. Toggle persistent. `prefers-color-scheme` honored on first visit.

The current Next.js codebase exists in this repo and contains e-commerce features that are currently hidden. The rebuild will reuse the framework but **rebuild the design from scratch** per these documents — no carrying-forward of existing styles.

---

## Non-negotiables (carried across all docs)

1. **Petrol on every page.**
2. **On-brand-color paint imagery** (petrol, navy, teal, white) somewhere on every page — never multicolored.
3. **Material quality made visible** — no marketing fluff replacing technical truth.
4. **Dual-mode parity** — light and dark are both fully designed, both first-class. Neither is a theme on top of the other.
5. **Minimalism by default** — one focal element per section, generous breathing, no decorative orbs as default treatment. Significantly more restrained than the DRAVART reference.
6. **Greek-language readiness** in typography and contrast.
7. **Negative space as feature**, not as wasted space.
8. **Performance budget honored** (LCP <1.5s, CLS <0.05, INP <100ms).
9. **Accessibility AA minimum** (focus rings, 44px targets, motion-safe).

---

## Version & contact

- **v1.0 · April 2026**
- **Brand owner contact**: info@pavlicevits.gr
- **Address**: Leoforos Ethnikis Antistaseos 66, Kalamaria, 55133 Thessaloniki, Greece
- **Telephone**: +30 2310 447 033

---

> *"We're not making your life better. We're making it colorful."*
>
> *— Pavlicevits Colors, Kalamaria, since 1990*
