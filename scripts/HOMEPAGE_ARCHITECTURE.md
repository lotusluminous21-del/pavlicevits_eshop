# Homepage Re-Architecture — Desktop Schematic

**Premise.** Paint isn't decoration; it's a *continuity mechanism*. Its job
is to (a) physically guide the eye downward toward the CTAs, (b) bind
neighbouring sections into one breathing composition, and (c) enact the
brand's cognitive arc — Attention → Recognition → Curiosity →
Understanding → Feeling → Trust → Action — through visual gravity, not
labels. Copy stays as written. Layouts get rethought. Paint compositions
are engineered as schematic elements, not stand-alone art.

This document is desktop-first (≥1280px). Mobile follows separately,
preserving the same flow rules adapted to a single column.

---

## 1. The arc, mapped

| Stage | Cognitive target | Section | Paint job |
|---|---|---|---|
| 1. Attention | "Different. Calm. Quality." | **Hero** | A horizon arc anchors the page. Right-end of the arc *drips down* past the fold — the first scroll cue. |
| 2. Recognition | "They know what they're doing." | **WhyChoose** | The drip from Hero re-enters at the top, *braids* through the three differentiators, exits at the bottom-right. |
| 3. Curiosity (chemistry) | "What do they actually stock?" | **MaterialSystem** | A horizontal river beneath the products; products read as objects emerging from the same paint substance. River flows *rightward*, terminates with a downward fall. |
| 3b. Curiosity (domain) | "And for whom?" | **Categories** | Paint *fall* from MaterialSystem fans into 6 streams; each finish portrait sits at the end of a stream. |
| 4. Understanding | "These are for people like me." | **FeaturedProject** | Paint pools beneath the project photo like a wet floor — proof has weight. A single thread from the pool drips into the next section. |
| 5. Feeling | "I want what they have." | **PullQuote** | A single decisive *manifesto stroke* underlines the quote — bigger and more deliberate than current. The stroke is the page's loudest visual moment. |
| 6a. Trust (proof) | "These numbers are real." | **CounterStrip** | A thin vertical *thread* of paint runs through the centre of the stat row — proof of continuity, not silence. |
| 6b. Trust (clarity) | "Anything I'd worry about is already answered." | **FAQ** | Corner flourish at bottom-left fans up-and-right *toward* the accordion column, not away from it. Tendrils visibly point at the questions. |
| 7. Action | "Let's talk." | **CTABanner** | All the page's paint *converges* here — a centred bloom rising from below, the copy plate emerges from the bloom. Clear sense of arrival. |

**No "rest" sections.** The current layout has CounterStrip as a calm
beat. The new layout makes it a *thread* — silence isn't blank, it's a
single line. Calm doesn't mean disconnected.

---

## 2. The 9-section schematic

For each section: **copy** (verbatim from `messages/en.json`, no edits),
**layout** (desktop wireframe in ASCII), **paint role** (what the asset
*does*), **eye-flow** (where the gaze travels), **handoff** (how the
section ends and what the next one inherits).

Wireframe legend:
```
═══  hard horizontal mass of paint
░░░  diffuse / atmospheric paint
│    vertical paint thread
↓    paint-induced eye direction
[..] glass card / framed content
TXT  text block
```

---

### § 1 — Hero (ATTENTION) · ~88vh

**Copy.** `home.eyebrow` · `home.headlineLight` + `home.headlineHeavy`
(2-line italic-then-bold) · `home.lead` · `ctaPrimary` (filled) +
`ctaSecondary` (text link).

**Layout.** Headline+CTAs occupy upper 60% of viewport, *centered*.
Paint occupies lower 40% as a **horizon arc** that peaks slightly
right-of-centre and *cascades off the right edge* into a thin drip.

```
                    [Premium paint house · since 1990]

                       The right paint.
                       For work that has to last.

              A specialist paint house in Kalamaria…

              [Explore our work]    Talk to a specialist →

                                                    ↓
        ════════ horizon arc ═════════════════════╲
                                                   ╲ drip → next section
                                                    ╲
- - - - - - - - - - - - - viewport fold - - - - - - -╲- - - - - -
                                                      ↓
```

**Paint role.** A *horizon* — broad and low, peak around 60% of the
section height at x≈55%. The right end of the arc tapers into a single
thin filament that drips downward past the section boundary.

**Eye-flow.** Eyebrow → headline (centred, gravity pulls down) → lead →
CTA pair → arc-peak (right-of-centre) → drip (right edge, downward).

**Handoff.** The drip continues *behind* the WhyChoose section's top
border on the right side. There is no margin between Hero and
WhyChoose — the drip is the seam.

**Asset.** `hero-horizon` (16:9, 1820×1024) — replaces
`hero-centerpiece`.

---

### § 2 — WhyChoose (RECOGNITION) · ~110vh

**Copy.** `home.why.eyebrow` · `home.why.title` · `home.why.lead` ·
3 cards: `curation`, `specifier`, `longevity`.

**Layout — REFACTORED.** Title block centred at top. The three cards
are *not* a flat horizontal grid — they are arranged in a **diagonal
descent** with paint braiding through them. Reading goes top-left →
bottom-right, which is the natural Western scan and the page's downward
gravity vector.

```
                    [Why Pavlicevits]

         Material quality you can specify with confidence.
                  We don't sell every paint…

   ↓ drip enters from Hero
  ╲ braid
   ╲
    ╲   [Card 1 — Curated, not stocked]
     ╲       (anchored left)
      ╲
       ═══════════════════════
                ╲
                 ╲   [Card 2 — Specifier-grade advice]
                  ╲       (centred, slightly lower)
                   ╲
                    ═══════════════════════
                              ╲
                               ╲   [Card 3 — Built for longevity]
                                ╲       (anchored right)
                                 ╲
                                  ╲ drip continues → next section
```

**Paint role.** A single *braid* — paint enters top-left as a continuation
of Hero's drip, weaves diagonally past three card anchor points, exits
bottom-right as another drip. Each card sits at a "node" where the braid
visibly thickens.

**Eye-flow.** Title → drip-in → Card 1 → braid → Card 2 → braid →
Card 3 → drip-out (bottom-right corner).

**Handoff.** The drip from Card 3's lower-right re-enters the top-right
of MaterialSystem, signalling "the chemistry below is what powers the
discipline above."

**Asset.** `braid-diagonal` (9:16 vertical or 4:5; 1024×1820) — NEW.
The asset is a tall narrow ribbon. CSS positions it spanning the full
section vertically; cards are absolutely placed at the braid's nodes.

> ⚠ This is the layout's biggest break from current. If the user wants
> something less unconventional, fallback option: keep horizontal cards
> but add a strong **downward-flowing waterfall** of paint behind them
> with the bottom of the waterfall trailing into the next section.

---

### § 3 — MaterialSystem (CURIOSITY · chemistry) · ~70vh

**Copy.** `home.system.eyebrow` · `home.system.title` (two lines:
"From substrate prep to topcoat.") · `home.system.lead` · 9 product items
· `home.system.footnote`.

**Layout — REFINED.** Title-and-lead grid stays (col-span-7 + col-span-5).
The 9 products are a single horizontal river. The river is a literal
paint river running *across the entire section width*; products sit on
top of crests in the river's surface.

```
[The complete material system]                          and the lead text…
From substrate prep
to topcoat.
                                                                    ↓ drip
                                                                       in
  ┌──────── 9 products in a single horizontal scroll, products ON the river ─┐
  │  🥡    🥫    🥤    🪣    🧴    🪥    🪤    🧹    🧴    │
  │       ════════════════════════════════════════════════                   │
  │  ═══════════════ horizontal paint river ═══════════════                  │
  └──────────────────────────────────────────────────────────────────────────┘
                                              ↓ river bends into a fall
                                              ↓
        Stocked on the wall. Specified by us. Documented for the job.
                                              ↓
                                              ↓ falls into Categories ↓
```

**Paint role.** A *river* with crests for product anchorage. The river
flows left-to-right but at the right edge **bends downward** and
terminates as a fall — the section's exit cue.

**Eye-flow.** Title → lead → first product → scan rightward across products →
fall → footnote (centred below) → fall continues into Categories.

**Handoff.** The fall lands in CategoryTeaser's top-centre and *fans
into 6 streams* (next section).

**Asset.** `river-with-fall` (2:1, 2048×1024) — replaces `wave-pool`.
A horizontal river that bends downward at the right end into a single
falling stream.

---

### § 4 — Categories (CURIOSITY · domain) · ~65vh

**Copy.** `home.categories.eyebrow` · `home.categories.title` ·
`home.categories.lead` · 6 finish items + finish words · `cta`.

**Layout — REFACTORED.** The fall from MaterialSystem hits the top-centre
of this section and **branches into 6 streams**. Each stream descends
into a finish portrait card. Cards arranged in a 3×2 grid (no horizontal
scroll on desktop — visitors should see all six categories at once,
since "specialist categories" is the domain claim and partial visibility
undermines it).

```
                               ↓ fall from MaterialSystem
                               │
                          ┌────┴────┐
                          │ 6 streams branch
                          │
        ╱   ╱   ╱     ╲   ╲   ╲
       ╱   ╱   ╱       ╲   ╲   ╲
      ╱   ╱   ╱         ╲   ╲   ╲

  [Decorative]  [Marine]    [Industrial]
  Smooth        High-gloss  Rugged

  [Wood]        [Metal]     [Specialty]
  Richly fin.   Satin       Iridescent

                  [See all categories →]
                          │
                          │ → drip continues into FeaturedProject
```

**Paint role.** *Six descending streams* converging into the 6 cards.
Each stream is thin, with subtle variation so each category's stream
looks unique without being garish. Below the cards, the streams pool
into a thin horizontal puddle that drips into the next section.

**Eye-flow.** Title → "the lead reads them as 6 specialist domains" →
left column of streams → 3×2 grid scan (Z-pattern) → CTA → drip out.

**Handoff.** Single drip from the puddle continues into FeaturedProject
top-centre.

**Asset.** `cascade-six-streams` (16:9, 1820×1024) — NEW. Replaces the
simple hairline stripe.

> ⚠ This is the second big break. If 6 streams feels too literal, the
> fallback is one *converging delta* — many streams up top merging into
> one trunk at the bottom, no per-card alignment, just an overall
> "branching" feel.

---

### § 5 — FeaturedProject (UNDERSTANDING) · ~80vh

**Copy.** `home.featured.eyebrow` · title · body · 3 stat label/value
pairs · cta.

**Layout — REFINED.** Photo grows from the current `max-w-md` (~448px)
to ~720px, occupying col-span-6 in a 12-col grid. Text sits in
col-span-5 (offset 1) with the stat list and CTA. The photo is the
section's protagonist. The vertical droplet seam is replaced by a
**puddle** beneath the photo's bottom edge — a wet pool that the photo
*sits in*, with a single thread descending from the puddle into the
PullQuote section.

```
   ↓ drip from Categories enters here
  
  [Featured project]
  
  ┌──────────────────────────┐         Hellenic Coast Restoration — 2024
  │                          │
  │       VAN PHOTO          │         Salt-spray exposure, bare steel,
  │        (col-6, ~720px,   │         eight months of weather. We specified…
  │         4:5 aspect)      │
  │                          │         ─────────────────
  │                          │         System    3-coat marine epoxy
  │                          │         Substrate Bare structural steel
  │                          │         Location  Thermaikos Gulf
  │                          │         ─────────────────
  └──────────────────────────┘
       ════ wet puddle ════                    Read the case study →
              │
              │ thin thread descends
              │
              ↓ enters PullQuote
```

**Paint role.** A *puddle* with reflective sheen beneath the photo,
tying the photographic proof to the paint substance. A thin thread
descends from the puddle's lowest point.

**Eye-flow.** Eyebrow → photo (the protagonist) → title (right column) →
body → stats list → CTA → puddle → thread down.

**Handoff.** Thread enters PullQuote top-centre.

**Asset.** `puddle-with-thread` (16:9, 1820×1024) — NEW. Bottom-anchored,
with a horizontal puddle reflecting under the photo zone.

---

### § 6 — PullQuote (FEELING) · ~80vh

**Copy.** `home.quote.body` · `home.quote.attribution`.

**Layout — REFINED.** Quote is the page's loudest moment. Glass card
grows to `max-w-5xl`, quote text grows to `text-5xl` md:`text-6xl`. A
single bold paint stroke runs **diagonally beneath** the quote — not
behind it as currently, but visibly **anchoring** it. The stroke peaks
in thickness directly under the quote's last word.

```
  ↓ thread from FeaturedProject

       "
                                                              ╲
       We're not a hardware store.                             ╲
       We're the people the hardware store                      ╲
       calls when the job has to hold.                           ════
                                                                  ╲
       — The house manifesto                                       ╲
                                                                    ╲
                                                                     ╲ → exits bottom-right

```

**Paint role.** *Manifesto stroke* — a single bold paint slash that runs
beneath the quote's text. Acts as both an underline and a visual signature.
Tapers to a thin filament at the bottom-right, exiting the section as
the next handoff.

**Eye-flow.** Thread-in → quote text (impossible to miss at scale) →
attribution → stroke (acts like a punctuation mark) → tapered filament
exits bottom-right.

**Handoff.** Filament enters CounterStrip top-right.

**Asset.** `manifesto-stroke` (2:1, 2048×1024) — refined version of
current `stroke-diagonal`. Thicker at spine, decisive ends, no
chaotic spatter.

---

### § 7 — CounterStrip (TRUST · proof) · ~30vh

**Copy.** `35+` years specifying · `240` documented projects · `6` house
partners · `1.2k` products tested and rejected.

**Layout — REFINED.** Four stats in a single row. A **thin vertical
paint thread** runs through the centre of the row, dividing it into
2+2 visually. The thread is the only paint here — silence but with a
through-line.

```
  ↓ filament from PullQuote

  35+              240        │      6              1.2k
  YEARS            DOC.       │      HOUSE          PRODUCTS
  SPECIFYING      PROJECTS    │      PARTNERS       TESTED & REJECTED
                              │
                              │ thread continues into FAQ ↓
```

**Paint role.** A single vertical thread, ~2px wide, with subtle
variation in alpha. It enters from the top (continuation of PullQuote's
filament) and exits at the bottom into the FAQ section.

**Eye-flow.** Stats read left-to-right (the ascending intensity:
years → projects → partners → rejected). Thread acts as a centre tick.

**Handoff.** Thread re-emerges in FAQ top-centre.

**Asset.** No new generated asset needed; CSS handles the thread via
a 1px gradient line.

---

### § 8 — FAQ (TRUST · clarity) · ~90vh

**Copy.** `home.faq.eyebrow` · `home.faq.title` · 6 Q&A · `cta`.

**Layout — REFINED.** Title in upper-left (col-span-4). Accordion in the
right (col-span-7, col-start-6). The corner flourish is **redirected** —
instead of fanning *up-and-right* away from the accordion column, it
fans *up-and-toward* the accordion. Tendrils visibly *point at* the
questions, suggesting "these flow into the answers."

```
  ↓ thread from CounterStrip enters top-centre, splits
                ╱
               ╱ tendrils reach toward accordion
              ╱
  [FAQ]      ╱      ┌────────────────────────────────────┐
              ╲    │  Q: Do you sell to non-professionals?│
   Questions,  ╲   ├────────────────────────────────────┤
   straight     ╲  │  Q: Can you specify a system…       │
   answered.     ╲ ├────────────────────────────────────┤
                  ╲│  Q: Which brands do you carry?      │
  ╲                ├────────────────────────────────────┤
   ╲ flourish     │  Q: Do you supply outside Thess…    │
    ╲ anchored    ├────────────────────────────────────┤
     ╲ bottom-    │  Q: Can you tint to a specific…     │
      ╲ left      ├────────────────────────────────────┤
       ╲          │  Q: Do you offer on-site cons…      │
        ╲         └────────────────────────────────────┘
         ╲
          ╲                     Contact us with your question →
           ╲
            ╲ tendril continues into CTA
```

**Paint role.** *Corner flourish* anchored bottom-left, tendrils fanning
up-and-RIGHT toward the accordion column. The lowest tendril continues
past the section's bottom edge into CTABanner.

**Eye-flow.** Title (col-4, top-left) → accordion (col-7, right) → first
Q at top → scroll down through Qs → CTA → flourish at bottom-left → tendril
exits.

**Handoff.** Lowest tendril enters CTABanner top-left.

**Asset.** `flourish-corner-bottomleft-pointing` (4:3, 1365×1024) —
refined version of current `flourish-corner-bottomleft`. Density bias
shifted: more reach into the upper-right quadrant.

---

### § 9 — CTABanner (ACTION) · ~85vh

**Copy.** `home.cta.eyebrow` · title · lead · `primary` (filled) +
`secondary` (glass).

**Layout — REFACTORED.** Currently has a glass plate on the left and
a bloom on the right. The new layout is a **convergence** — the page's
visual energy gathers here. The copy plate is centred horizontally; a
**centred bloom rises from below** the plate, with the plate emerging
from the bloom like a stone rising from a pool. The lowest tendril of
FAQ's flourish enters from the top-left and feeds into the bloom.

```
   ↓ tendril from FAQ enters top-left
  
                    [Start a conversation]
  
            Have a substrate, a deadline, and a finish
                       that has to last?
  
            Tell us about the project. We'll come back
                  with a system, not a catalog.
  
              [Contact a specialist]   See the work
  
              ╲╲ ╱╱  ╲╲╲ ╲ ╱ ╱╱   ╱╱╲╲ ╲╲╲ ╱╱
              ╲╲╲╲╲   ════════════════   ╱╱╱╱
                ════════ centre bloom rising ════════
              ╱╱  ╱╱╱╲╲╲   ╲╲   ╱╱   ╲╲╲ ╱╱╱  ╲╲
                       ↓
                  (page footer below)
```

**Paint role.** A *rising bloom* centred horizontally, emerging from
below the page fold and surging up to surround the copy plate. The
plate sits at the bloom's quietest zone (its centre, which is hollow
in the asset). The bloom's edges fade outward and downward.

**Eye-flow.** Eyebrow → title → lead → CTA pair (primary first, then
secondary) → bloom (provides energetic punctuation, not distraction) →
the page ends with a sense of *culmination*, not just "another section
ended."

**Handoff.** None — this is the page exit. The bloom DOES extend
slightly into the footer's top edge for visual continuity, but the
CTA buttons are the actual exit.

**Asset.** `bloom-rising-centre` (16:9, 1820×1024) — replaces
`bloom-right`. Bottom-anchored bloom with a hollow centre where the
copy plate sits.

---

## 3. Inter-section continuity rules

Three rules govern how paint crosses section boundaries:

1. **No section is a closed box.** Every section's paint asset has at
   least one filament/tendril/drip designed to *exit* the frame. The
   next section's asset has a corresponding *entry* gesture.

2. **Direction is monotonic-down.** Paint never asks the eye to scroll
   *up*. Filaments exit the bottom of one section and enter the top of
   the next. Sideways excursions (Hero's right-bias drip, FAQ's
   leftward flourish) only happen *en route* to the next downward beat.

3. **The page has one centre of mass per section, but the centres
   alternate left-centre-right-centre-left-centre-right-left-centre.**
   This zig-zag rhythm prevents the eye from falling asleep on a single
   axis. Specifically:
   - Hero: centre-right (arc peak right-of-centre)
   - WhyChoose: centre (braid)
   - MaterialSystem: right (river ends in fall on right)
   - Categories: centre (streams converge centrally)
   - FeaturedProject: left-centre (photo on left, photo dominates)
   - PullQuote: centre (quote)
   - CounterStrip: centre (thread)
   - FAQ: bottom-left (flourish)
   - CTABanner: centre (rising bloom)

---

## 4. New asset list (replaces current set)

| Logical key | Aspect | Size | Section | Composition role |
|---|---|---|---|---|
| `hero-horizon` | 16:9 | 1820×1024 | Hero | Broad horizon arc with right-bias drip exiting bottom-right |
| `braid-diagonal` | 9:16 | 1024×1820 | WhyChoose | Tall vertical braid with three thickening "node" points |
| `river-with-fall` | 2:1 | 2048×1024 | MaterialSystem | Horizontal river bending into a vertical fall on the right |
| `cascade-six-streams` | 16:9 | 1820×1024 | Categories | One source at top fanning into 6 descending streams |
| `puddle-with-thread` | 16:9 | 1820×1024 | FeaturedProject | Bottom-anchored reflective puddle with descending thread |
| `manifesto-stroke` | 2:1 | 2048×1024 | PullQuote | Single decisive diagonal stroke, thick spine, decisive ends |
| `flourish-corner-bl-pointing` | 4:3 | 1365×1024 | FAQ | Corner mass with tendrils reaching up-and-right toward accordion |
| `bloom-rising-centre` | 16:9 | 1820×1024 | CTABanner | Rising bloom centred horizontally, hollow centre for copy plate |

**8 logical keys × 2 styles (oil + liquid) = 16 PNGs to generate.**

CounterStrip uses a CSS gradient line — no asset.
CategoryTeaser's hairline stripe is replaced by `cascade-six-streams`.

Estimated cost: ~16 × 40 + 1 style creation = **~680 credits ≈ $0.68**.

---

## 5. Implementation roadmap

### Phase A — script + assets (no React changes yet)
- Replace `ASSETS` list in `scripts/generate-paint-assets-recraft.py` with the 8 keys above and their per-asset architectural prompts.
- Run pipeline → 16 PNGs at `public/brand/paint/oil/*.png` and `liquid/*.png`.
- Visually QA the 16 assets *as standalone images* before any layout work.

### Phase B — registry + render plumbing
- `src/lib/brand/paint-assets.ts` — register the 8 new logical keys (kept alongside existing ones for back-compat).
- No changes to PaintBackdrop / PaintZone / PaintBand primitives.

### Phase C — section-by-section refactors

The big rewrites:
- **WhyChoose** — replace flat 3-card row with diagonal-descent layout + braid asset.
- **Categories** — replace horizontal scroll + hairline stripe with 3×2 grid + cascade asset; remove `paint-stripe-accent-l` here (utility stays in CSS for other uses).
- **FeaturedProject** — bigger photo, replace vertical-droplet seam with puddle-with-thread asset beneath.
- **CTABanner** — copy plate centred, bloom rising from below.

The smaller refinements:
- **Hero** — same layout, swap `heroCenterpiece` for `heroHorizon`, ensure the asset bleeds into WhyChoose's top-right.
- **MaterialSystem** — same horizontal scroll, swap `wavePool` for `riverWithFall`.
- **PullQuote** — quote bigger (text-6xl on lg), glass card wider (max-w-5xl), swap `strokeDiagonal` for `manifestoStroke`.
- **CounterStrip** — add a centred 1px vertical paint-tinted gradient line, no asset.
- **FAQ** — swap `flourishCornerBottomleft` for the pointing variant.

### Phase D — overflow / bleed plumbing
This is the part that makes inter-section continuity actually work:
- Each section has `overflow-hidden` removed *along the boundary edge that hands off*. Specifically:
  - Hero: `overflow-x-hidden overflow-y-visible` so the bottom drip can extend.
  - WhyChoose: same on top edge.
  - …etc.
- Or simpler: lift the paint assets into a *page-level decoration layer* (one fixed-position layer behind all sections) where each asset is positioned by section anchor. This is the cleaner long-term approach but requires a larger refactor.

**Recommendation:** start with per-section assets that bleed via
`overflow-y-visible`. If the continuity reads broken in QA, lift to a
page-level layer in Phase E.

---

## 6. Open calls before generating

These are the design decisions where I made strong picks but the user
should confirm before I burn 680 credits on assets:

1. **WhyChoose diagonal stagger.** Big departure from current. Confirm
   yes / no — fallback is horizontal cards + waterfall paint behind.
2. **Categories 3×2 grid + 6 streams.** Removes horizontal scroll;
   shows all 6 categories at once. Confirm yes / no — fallback is
   keep horizontal scroll but add cascade asset above it.
3. **PullQuote scale.** Quote text grows to text-5xl/6xl. Confirm OK —
   fallback is keep current text-2xl/4xl scale, just thicker stroke.
4. **CTABanner bloom-from-below.** Replaces left-glass + right-bloom
   with centre-glass + rising-bloom. Confirm OK — fallback is keep
   current asymmetric layout, just generate a more architectural
   bloom-right.
