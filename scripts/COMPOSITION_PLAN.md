# Recraft v4 — Paint asset composition plan

This is the architectural brief that drives every prompt in
`generate-paint-assets-recraft.py`. Two style channels (oil, liquid)
share these compositions; the visual register comes from the style_id
created from the reference image.

**Reading order matches the homepage scroll**: each asset is engineered
to its section's content layout, negative-space requirements, and the
visual rhythm of its neighbours.

## The page rhythm

```
1. Hero                — bottom horizontal arc      (paint anchors bottom)
2. WhyChoose           — atmospheric pigment cloud  (paint diffuses behind cards)
3. MaterialSystem      — bottom horizontal pool     (paint rises under products)
4. CategoryTeaser      — NO PAINT                   (calm beat #1, hairline only)
5. FeaturedProject     — vertical droplet seam      (paint drips between columns)
6. PullQuote           — diagonal slash             (paint cuts across section)
7. CounterStrip        — NO PAINT                   (calm beat #2, stats only)
8. FAQ                 — bottom-left corner anchor  (paint flourishes from corner)
9. CTABanner           — right-anchored bloom       (paint feeds the closing CTA)
```

Repetition guard: the only "bottom-anchored" sections are Hero and
MaterialSystem (separated by WhyChoose). They differ by **gesture**:
Hero = single thin arc; MaterialSystem = broad pool with crests.

---

## Per-asset architectural specs

### 1. `hero-centerpiece` — 1820×1024 (16:9)
**Lives in**: `Hero.tsx`, absolute bottom 420–640px band, full width.
**Content above paint**: italic+bold headline (max-w-3xl, centered),
lead paragraph, primary + secondary CTAs.
**Negative space**: top 60–70% of the asset must be transparent black.
The arc may peak at ~60% up the frame at center but tapers down to the
bottom-left and bottom-right corners.
**Composition**: ONE elegant horizontal arc — a stage-curtain wave
rising gently in the middle, tapering at both ends. Sparse droplets
fall off the top of the arc into transparent space.
**Why it works**: anchors the page like a horizon line. The headline
"emerges from" the wave.

### 2. `pigment-dust` — 1820×1024 (16:9)
**Lives in**: `WhyChoose.tsx`, full-bleed behind 3 glass cards
(`brand-glass`) in a horizontal row.
**Content over paint**: 3 glass cards (rounded-2xl, p-7), middle card
translated up 16px.
**Negative space**: there is no hard negative space — but the paint
must be SOFT enough that text inside the glass cards still reads at
1.0 backdrop-blur+saturate without competing.
**Composition**: an edgeless horizontal pigment cloud — diffuse,
atmospheric, NO defined contour. Concentration peaks at the vertical
center, fading to transparent at top, bottom, and the left/right edges.
**Why it works**: provides texture without competing with cards. The
cloud is structural haze, not a focal element.

### 3. `wave-pool` — 2048×1024 (2:1, ≈ 21:9)
**Lives in**: `MaterialSystem.tsx`, anchored to the bottom of the
PaintZone (object-bottom, items=end). Products sit on top of crests.
**Content over paint**: horizontal scroll strip of 9 product PNGs;
labels below products on canvas (NOT on paint).
**Negative space**: upper 40% transparent so labels and overflow
don't fight paint. Lower 50–60% is the pool.
**Composition**: a low horizontal pool with 5–7 gentle crests rising
across the width, valleys between crests where products will settle.
A few rising droplets break above the crests and fall back. Pure black
above the highest crest.
**Why it works**: products read as objects emerging from the paint
material — paint as the literal "system" beneath them.

### 4. `vertical-droplet` — 1024×1820 (9:16)
**Lives in**: `FeaturedProject.tsx`, 80–100px wide vertical strip at
the column gap between the photo (md:col-span-5) and the text
(md:col-span-7). md+ only.
**Content over paint**: nothing — it lives in the gap.
**Negative space**: left and right thirds must be transparent so the
strip can sit between two columns without bleeding into either.
**Composition**: ONE thin vertical column of liquid paint trickling
straight down, tapered at the top, beading at the bottom into a small
hanging drop. 1–2 minor side droplets falling away from the main
column. The main column occupies only the central 30% of the (tall)
frame width.
**Why it works**: a literal seam — a wet drip connecting two ideas
(the documentary photo, the project text).

### 5. `stroke-diagonal` — 2048×1024 (2:1, ≈ 21:9)
**Lives in**: `PullQuote.tsx`, full-bleed (lg:-inset-x-12),
600px tall, vertically centered. Glass quote card sits IN FRONT,
horizontally centered.
**Content over paint**: glass blockquote with italic quote text
(max-w-3xl). Quote card overlays the paint's MIDDLE; paint must
continue visibly to BOTH sides of the card.
**Negative space**: top-left wedge and bottom-right wedge (the two
"corners outside the diagonal band") fully transparent.
**Composition**: ONE decisive diagonal sweep from bottom-left corner
to top-right corner at ~20–25°. Tapered ends, thicker at the spine,
small perpendicular spatters along the trail.
**Why it works**: one gesture — like a paintbrush dragged decisively
across the canvas. The quote card sits at the gesture's pivot point.

### 6. `flourish-corner-bottomleft` — 1365×1024 (4:3)
**Lives in**: `FAQ.tsx`, `-bottom-12 -left-8` to `-bottom-16 -left-12`
at lg, 480×640 → 560×760 px. Image position `object-left-bottom`.
**Content over paint**: section title (col-span-4, upper-left of grid)
sits ABOVE the flourish; accordion (col-span-7 col-start-6) is in
the right half — must remain uncrowded.
**Negative space**: upper-right ~50% of the asset transparent. Title
sits above; accordion sits to the right.
**Composition**: dense paint mass anchored in the bottom-left 50%,
with elegant tendrils + drips + small spatters fanning UP-AND-TO-
THE-RIGHT into the upper-middle area. Upper-right 50% has only the
softest trailing tendrils fading to transparent.
**Why it works**: a corner gesture — paint blooms from the bottom-
left and "reaches" toward the accordion without crossing it.

### 7. `bloom-right` — 1820×1024 (16:9)
**Lives in**: `CTABanner.tsx`, full-bleed (lg:-inset-x-12), image
position `object-right`. Glass copy plate sits on the LEFT half
(max-w-2xl).
**Content over paint**: glass plate with eyebrow + title + lead +
two CTA buttons. Plate occupies the left 50% of the section.
**Negative space**: left 40% of the asset transparent so the glass
plate sits paint-light. Right 60% is dense bloom.
**Composition**: large bloom anchored on the RIGHT edge — dense
paint there with tendrils, drips, and small spatters fanning LEFT
into the middle. Left 40% has only soft trailing tendrils that fade
to transparent.
**Why it works**: closes the page with energy on the right while the
copy plate remains clear and readable on the left.

---

## Shared style discipline

Every prompt prepends a short preamble that locks down:
- **Palette**: deep petrol teal `#0F4C5C` dominant, navy + indigo
  darks, bright cyan-white highlights.
- **Background**: pure black (becomes transparent after Recraft
  `/v1/images/removeBackground`).
- **What to exclude**: NO text, NO logos, NO figurative content, NO
  objects, NO human figures, NO chaotic splatter. The paint is a
  single decisive gesture, not a mess.
- **Edge behaviour**: paint never touches all four frame edges at once
  — there is always a transparent corner or band that defines the
  composition's "negative space."

The visual register (oil-anime vs. photographic-liquid) comes from
the `style_id` Recraft creates from the reference image, NOT from the
prompts. Both channels run the same prompts; only the style_id
differs.

---

## Reference seeds

| Channel | Reference | Visual register |
|---|---|---|
| oil | `public/brand/paint/vortex-orbital-v2.png` | Painterly, anime-ish, clean edges, bright cyan + warm rust accents on petrol — Dravart-aesthetic. |
| liquid | `public/brand/paint/wave-horizon-A.png` | Photographic, glossy, wet, deep saturation, brush hairs visible — high-pigment liquid paint. |

These are STYLE seeds only. Composition comes from the per-asset
prompts above; arrangement comes from the section layout, not the
reference.

---

## Cost / time estimate

- 1 liquid-channel style creation: ~40 credits
- (oil-channel style already cached, 0 credits)
- 14 generations × ~40 credits each: ~560 credits
- 14 background-removal calls: cost TBD (Recraft typically charges
  little for bg-removal; could be ~140 credits at most)
- **Total ceiling: ~740 credits ≈ $0.74**

Expected wall time at 4-way parallel + ~25s per generation: ~3 min.
