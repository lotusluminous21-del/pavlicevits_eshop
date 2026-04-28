# Homepage Layered Architecture — v2

**Premise.** Every section is a *two-layer composition*. The bottom layer
is paint (vibrant interwoven petrol-teal + clean orange, glossy liquid
on pure black). The top layer is content (typography, glass cards, CTAs).
Both layers must work as *independent gems*: the paint layer beautiful
on its own, the content layer readable on its own, and the two layers
*intertwine* at deliberate touch-points where one supports the other
without competing.

The paint never fights the text; the text never explains away the paint.
They co-exist like a soundtrack and dialogue in a film — each carrying
half the meaning.

---

## 1. The visual register

Every paint asset shares a single aesthetic register, derived from the
brand's reference: **vibrant glossy liquid paint mid-flight**, two
pigments interwoven (petrol-teal dominant, clean warm orange threading
through as accent ribbons), photographic macro detail with surface-
tension droplets and specular highlights, on pure black. Each asset has
its own *gesture* (horizon, braid, river-with-fall, cascade, puddle,
manifesto-stroke, corner-flourish, rising-bloom) — but the colour,
glossiness, and energy register are shared.

The result: scrolling the page should feel like watching a single
continuous paint performance from nine angles.

---

## 2. The layer stack (CSS z-index)

```
z-30  Glass cards / glass plates       (brand-glass, blurred, 80%+ opacity)
z-20  Inline content                   (eyebrow chips, headlines, body text, CTAs)
z-10  (optional) wash overlay          (only used to soften paint where text overlaps)
z-0   Paint asset                      (positioned absolute, fills section zone)
```

**Rule of thumb**: text at z-20 and above always reads on canvas (white
in light mode, near-black in dark mode), never directly on top of paint
pixels — unless wrapped in a glass card at z-30.

---

## 3. Per-section layered schema

For each section: **content blocks** (verbatim copy from `messages/en.json`,
no edits), **paint zone** (where the asset sits), **negative-space
contract** (the rectangle of the asset that must remain transparent to
host content), **intertwining** (the deliberate touch-point where the
two layers meet).

### § 1 Hero — wide horizon (2688×1536)

```
                    [Premium paint house · since 1990]   ← eyebrow chip
                                                            (z-20, centred, top 12%)
                       The right paint.                  ← headline, 2 lines
                       For work that has to last.           italic+bold, max-w-3xl
                                                            (z-20, centred, 22-42% down)
              A specialist paint house in Kalamaria…    ← lead, max-w-2xl
                                                            (z-20, centred, 48% down)
              [Explore our work]    Talk to a specialist → ← CTAs, centred 58% down

  ─────────────────────────────────────────────────────  ← optical fold ~62% down
                                                          (paint emerges below)
        ════ vibrant horizon flow with right-end drip ══════════
              petrol-teal + orange braided, glossy, 2688×1536
              positioned absolute bottom 0, height ~40vh
                                          (z-0)
```

**Negative-space contract.** The paint asset's UPPER 60% must be pure
black (transparent after bg-removal). The CTA pair sits at the seam
between content zone and paint zone — visible canvas above, paint below.

**Intertwining.** The paint's gesture rises *toward* the CTA buttons
without ever touching them. The right-end drip exits below the fold —
unseen on first paint, but reveals itself on scroll as the paint
continues into WhyChoose.

---

### § 2 WhyChoose — diagonal descent + tall braid (1536×2688)

```
                    [Why Pavlicevits]                      ← eyebrow chip
                                                              (z-20, centred top)
         Material quality you can specify with confidence. ← title, max-w-2xl
              We don't sell every paint…                      (z-20, centred 0-15%)

      ╲     ┌──────────────────────┐                        ← Card 1 anchored LEFT,
       ╲    │  Curated, not stocked │                          col-span-5, ~22% down
        ╲   │  Every product on...  │                          (z-30, brand-glass)
         ╲  └──────────────────────┘
          ╲
           ════ NODE 1 (braid thickening)                    ← Paint visibly weaves
                                                                between cards
            ╲          ┌──────────────────────┐             ← Card 2 anchored CENTRE,
             ╲         │  Specifier-grade…    │                col-span-5 col-start-4
              ╲        │  Architects, contr… │                ~50% down
               ╲       └──────────────────────┘                (z-30, brand-glass)

                ════ NODE 2 (braid thickening)

                 ╲              ┌──────────────────────┐    ← Card 3 anchored RIGHT,
                  ╲             │  Built for longevity │       col-span-5 col-start-7
                   ╲            │  Systems chosen for… │       ~78% down
                    ╲           └──────────────────────┘       (z-30, brand-glass)

                     ════ NODE 3 (braid exit-thickening)
```

**Negative-space contract.** The paint asset (1536×2688, tall) is
positioned absolute, full section height, *not* full-width — it occupies
a vertical band at ~25-40% across (between left-anchored Card 1 and
centred Card 2's leading edges). The braid's path zig-zags slightly
left-right across that band but never extends to where the cards sit.

**Intertwining.** Each card's bottom-trailing corner ALMOST TOUCHES the
braid's next node. The eye reads: card → braid bulge → next card → braid
bulge → next card. The braid is the connective tissue that gives the
diagonal stagger its rhythm. Without paint, the cards would feel
arbitrary; without cards, the braid would feel decorative. Together
they're a system.

---

### § 3 MaterialSystem — horizontal river (2688×1536)

```
[The complete material system]                          ← eyebrow chip (z-20, top-left)
From substrate prep                                     ← title (z-20, col-span-7)
to topcoat.                  Primers, paints…           ← lead (z-20, col-span-5 right)
                                                          ─────────── 30% down

  product strip — 9 products in horizontal scroll     ← (z-20, products + labels)
   🥡    🥫    🥤    🪣    🧴    🪥    🪤    🧹    🧴       items=end aligned to bottom
                                                          of paint zone

  ════ vibrant horizontal river ════════════════════╲   ← Paint asset (z-0)
        petrol-teal + orange, ends in right-side    ╲     positioned absolute,
        downward bend                                ╲    bottom-anchored
                                                      ╲ drip exits

  Stocked on the wall. Specified by us. Documented…   ← footnote (z-20, centred ~88%)
```

**Negative-space contract.** The river's mass occupies the lower 50%
of the asset; the upper 50% is pure black (transparent). Products sit on
the river's crests; product labels sit BELOW products on canvas (NOT
on paint), and the asset's negative-space upper 50% is where the title
+ lead grid lives.

**Intertwining.** Products literally *float on* the river — bottom of
each product PNG aligns with the river's crest line. Drop-shadows beneath
products appear to be *cast onto* the river surface. The product strip
and the river are one composition, not two.

---

### § 4 Categories — cascade + 3×2 grid (2688×1536)

```
[Specialist categories]                                  ← eyebrow chip (z-20)
From listed façades to engine rooms.                     ← title (z-20, col-7)
                          Six performance categories.    ← lead (z-20, col-5 right)
                          One disciplined house behind them.

                  ╲   ╲   ╲    │    ╱   ╱   ╱            ← cascade source at top-centre
                   ╲   ╲   ╲   │   ╱   ╱   ╱                six streams fan outward
                    ╲   ╲   ╲  │  ╱   ╱   ╱                 (z-0)
                     ╲    ╲   ╲│╱   ╱    ╱

  ┌──────────┐  ┌──────────┐  ┌──────────┐                ← Card grid 3×2
  │ Decorat. │  │ Marine   │  │ Industr. │                  (z-20)
  │ Smooth   │  │ High-glo │  │ Rugged   │                  Each finish portrait sits
  └──────────┘  └──────────┘  └──────────┘                  at the END of one stream
       ↓ stream 1   ↓ stream 2   ↓ stream 3                  (top row)
  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │ Wood     │  │ Metal    │  │ Special. │                ← Bottom row of cards
  │ Richly f │  │ Satin    │  │ Iridesc. │                  (continuation, no streams)
  └──────────┘  └──────────┘  └──────────┘

                           [See all categories →]         ← CTA (z-20, right-aligned)
```

**Negative-space contract.** The cascade asset's upper 25% has the
single source; the next 50% has the 6 streams diverging; the lower 25%
where streams *terminate* must be transparent so it doesn't bleed into
the second row of cards.

**Intertwining.** Each top-row card's x-position aligns with one stream's
bottom tip. The card "catches" its stream. Visually: stream pours into
card. The bottom row of cards lives below the cascade, on canvas — no
paint behind them, just a calm presentation grid.

---

### § 5 FeaturedProject — wet puddle beneath photo (2688×1536)

```
  [Featured project]                                       ← eyebrow chip (z-20)

  ┌─────────────────┐         Hellenic Coast Restoration   ← title (z-20)
  │                 │         — 2024
  │   VAN PHOTO     │
  │  (col-span-6)   │         Salt-spray exposure, bare    ← body (z-20)
  │  4:5 aspect,    │         steel, eight months…
  │  ~600px tall    │
  │  (z-20)         │         ─────────────────             ← stat list (z-20)
  │                 │         System    3-coat marine epoxy
  │                 │         Substrate Bare structural st.
  │                 │         Location  Thermaikos Gulf
  └─────────────────┘         ─────────────────

  ════ wet puddle (z-0) ════                              ← Paint asset
        beneath photo edge                                  positioned absolute
        thread descends into next section                   bottom-anchored, full-width
                                                              petrol-teal + orange,
                                                              glossy

                                          Read the case study →
```

**Negative-space contract.** Asset's upper 70% transparent (so it doesn't
overlap photo or text). Puddle mass sits in lower 30% only. The single
descending thread is the only paint that crosses past the section.

**Intertwining.** The puddle visibly "pools beneath" the van photo's
bottom edge. Drop-shadow of the photo + the puddle's reflective sheen
combine — the photo appears to be sitting in fresh paint, an evocative
proof-of-craft moment.

---

### § 6 PullQuote — manifesto stroke beneath quote (2688×1536)

```
  ╱
   ╱
    ════ One bold confident diagonal stroke ════         ← Paint asset (z-0)
              petrol-teal + orange braided                  positioned absolute,
                                                            full-width, vertically
                                                            centred behind the card
                ╱
                 ╱
                  ┌────────────────────────────────────┐
                  │  "                                  │  ← Quote card (z-30)
                  │   We're not a hardware store.      │     brand-glass, max-w-5xl
                  │   We're the people the hardware    │     centred, text-5xl/6xl
                  │   store calls when the job has to  │     italic
                  │   hold.                             │
                  │  "                                  │
                  │   — The house manifesto             │
                  └────────────────────────────────────┘
                          ╱
                           ╱
                            ╱ stroke continues to top-right corner area
```

**Negative-space contract.** The stroke is full-width — no specific
transparent zone. The stroke's visual weight is balanced left-right so
the centred glass card sits at the stroke's peak thickness.

**Intertwining.** The glass card's backdrop-blur softens the stroke
underneath — paint visibly bleeds through the card's glass at low
opacity. On either side of the card, the stroke is at full intensity.
This is the page's *visual peak*: paint and quote share centre.

---

### § 7 CounterStrip — typography only (no asset)

```
  35+              240        │    6              1.2k
  YEARS            DOCUMENTED  │    HOUSE          PRODUCTS
  SPECIFYING      PROJECTS     │    PARTNERS       TESTED & REJECTED
                               │
                          (centre divider — 1px CSS gradient line, petrol-tinted)
```

**No paint asset.** Calm rest beat. CSS-only vertical hairline at centre.

---

### § 8 FAQ — corner flourish + accordion (2560×1792)

```
  [FAQ]                          ┌────────────────────────────────────┐
                                  │ Q: Do you sell to non-pros?         │
   Questions,                     ├────────────────────────────────────┤
   straight                       │ Q: Can you specify a system…       │
   answered.                      ├────────────────────────────────────┤
                                  │ Q: Which brands do you carry?      │
   ╱  tendrils reaching          ├────────────────────────────────────┤
    ╱   toward accordion          │ Q: Do you supply outside Thess…   │
     ╲                            ├────────────────────────────────────┤
      ╲                           │ Q: Can you tint to a specific…    │
       ╲                          ├────────────────────────────────────┤
        ╲                         │ Q: Do you offer on-site cons…     │
   ════ flourish anchored         └────────────────────────────────────┘
        bottom-left
        (z-0)                              Contact us with your question →
        petrol-teal + orange
        glossy
```

**Negative-space contract.** Asset upper-right 50% transparent (where
accordion lives). Flourish mass in lower-left, tendrils reaching
diagonally up-and-right but tapering well before reaching the accordion
column.

**Intertwining.** Tendrils visibly *point at* the accordion. The eye
traces from the title in upper-left → down the flourish mass → up along
tendrils → into the accordion's first question. The flourish leads the
reader to the questions.

---

### § 9 CTABanner — rising bloom around copy plate (2688×1536)

```
                        [Start a conversation]            ← eyebrow chip (z-20)

                Have a substrate, a deadline, and        ← title (z-20)
                a finish that has to last?                 centred max-w-2xl

                Tell us about the project. We'll come     ← lead (z-20)
                back with a system, not a catalog.

                   [Contact a specialist]   See the work  ← CTAs (z-20)

         ╱╲  ╱╲╲   ╲ ╱  ╱╲    ╱╲ ╲╲╲ ╱╱                ← Paint asset (z-0)
        ╱╱╲ ╱╱╲╲╲    ════════════    ╲╲╲╱╱╲              positioned absolute,
       ╱╱╱╱╱╱╱╱  rising bloom around   ╲╲╲╲╲╲╲           full-bleed, hollow-centre
        ╱  ╱╱  copy plate's hollow    ╲╲  ╲╲             aligned with copy plate
                centre
```

**Negative-space contract.** Asset has a literal HOLLOW CENTRE pocket
(28-72% across, 32-58% down) that's pure black/transparent — that's
where the copy plate sits. Bloom mass surrounds the copy plate's bottom
half in a horseshoe.

**Intertwining.** The copy plate isn't just *over* the paint — the paint
*surrounds* the plate from below and the sides. The eye reads the plate
as emerging FROM the bloom. Strong sense of arrival; paint feels
generated by the page's content.

---

## 4. Asset list — final

| Logical key | Aspect | Size | Section | Negative space | Gesture |
|---|---|---|---|---|---|
| `hero-horizon` | 16:9 | 2688×1536 | Hero | upper 60% transparent | broad horizon arc, right-end drip |
| `braid-diagonal` | 9:16 | 1536×2688 | WhyChoose | sides + corners transparent | thin twisting strand, 3 swells |
| `river-with-fall` | 16:9 | 2688×1536 | MaterialSystem | upper 50% transparent | horizontal flow with right-bend |
| `cascade-six-streams` | 16:9 | 2688×1536 | Categories | lower 25% transparent | 6 streams from one source |
| `puddle-with-thread` | 16:9 | 2688×1536 | FeaturedProject | upper 70% transparent | wet puddle, descending thread |
| `manifesto-stroke` | 16:9 | 2688×1536 | PullQuote | TL/BR corner wedges transparent | one decisive diagonal stroke |
| `flourish-corner-bl-pointing` | 4:3 | 2560×1792 | FAQ | upper-right 50% transparent | corner mass + reaching tendrils |
| `bloom-rising-centre` | 16:9 | 2688×1536 | CTABanner | hollow centre pocket | rising bloom in horseshoe |

8 logical keys × 2 channels (oil, liquid) = 16 PNGs.

---

## 5. The visual register, applied across all 8

Shared across every prompt:
- **Vibrant** glossy liquid paint mid-flight, photographic motion blur
- **Two interwoven pigments**: petrol-teal as the dominant ~70% (a
  saturated blue-green, NOT pastel cyan), warm clean orange as accent
  ribbons threading ~25% through the teal mass, ~5% cream/highlight
  specular spots
- **Surface tension droplets** at the gesture's leading edges
- **Glossy specular highlights** on raised paint surfaces
- **Pure black** background (becomes transparent post-bg-removal)
- The pigments **interweave like a braid** — not separate zones, but
  ribbons threading through each other

This is the look of the user's reference: vibrant, sophisticated,
interwoven, glossy, photographic — not the dark muddy thick-oil register
my previous outputs produced.
