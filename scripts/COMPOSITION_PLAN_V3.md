# Paint asset composition plan — V3 (FAL.ai, monad collage)

This is the architectural brief that drives every prompt in
`scripts/generate-paint-assets-fal.py`. Two style **registers** —
wave-horizon and vortex-orbital — share the same per-monad composition
spec; only the *register descriptor* in each prompt's preamble differs.

V1 (Recraft, 9 sections, seam-bleeding paint) is retired.
V2 (Recraft, 8 monads with seam-crossing continuity) is retired.
V3 (FAL.ai, 7 fully-framed monads in a collage) is the active plan.

---

## 1. The monad-collage thesis

Each PNG is a **monad**: a self-contained, fully-framed paint composition
sitting on a transparent field, with breathing room on all four sides.
Monads are never cropped, never tiled, never bled to the page edge. They
are arranged on the desktop homepage as a deliberate constellation, with
empty black space between them carrying as much compositional weight as
the painted areas.

This is the inverse of V2's continuity philosophy. V2 monads were
designed to bleed across section seams. V3 monads are designed to be
*placed* — the bleed is replaced by deliberate negative space.

---

## 2. The two registers

### Register A — `wave-horizon`

Painterly **oil paint** with visible brush hairs, fluid drips, and
natural alpha falloff at the edges of the paint. Deep **petrol teal**
(hex `0F4C5C`) is the dominant pigment, occupying **80% or more** of
the painted mass. Luminous **teal-cyan highlights** (hex `2BA8C2` →
`4DBCC8`) lift the wettest brush strokes. **Subtle warm rust embers**
(hex `C46A3A`) appear sparingly as small accent flecks at the
periphery — never dominant, never as ribbons, just embers.

This is *painterly oil texture*, NOT glossy liquid splash. Confident,
slow, editorial — like the centrepiece of a high-end magazine spread.

Stylistic anchor: the user-supplied reference image saved at
`scripts/refs/wave-horizon.png`. The arrangement of the example
(rotational paint mass around a soft empty centre) is a **form
reference** — used directly for `arrivalAnchor`, but each other
monad's form is tailored to its role in the homepage canvas, not
copied verbatim. The example's *style* (oil texture, palette weighting,
alpha falloff) applies register-wide.

### Register B — `vortex-orbital`

Glossy, photoreal, kinetic liquid splash. Dominant **petrol teal** (~70%)
woven with **dark navy / indigo** depth (~25%) and small **bright cyan-
white specular** highlights (~5%). NO copper. NO orange. NO warm tones.
Surface-tension droplets in the air, captured-moment energy — the paint
is *just landing* or *just bursting*, not at rest. Photographic macro
detail with depth-of-field falloff at the edges.

Stylistic anchors: the user-supplied reference image saved at
`scripts/refs/vortex-orbital.png` (a teal-and-navy glossy splash, no warm
tones, surface-tension droplets, mid-air dynamic).

### Why two registers, not eight

V1's "oil vs liquid" was an aesthetic toggle of the same gesture.
V3 keeps the same idea: **two registers, one composition spec**. The user
toggles between them via the existing `PaintStyleProvider`. Same monad
slots, same content layout, same silhouettes — only the painted pixels
change.

---

## 3. The 7 monads (composition specs)

Each monad ships in **two variants** (wave-horizon and vortex-orbital),
with **matched silhouettes** (outer bounding box ±5%). The composition
prompt below is shared; only the register descriptor (§ 2) is swapped at
generation time.

For every monad, the prompt MUST include:
- The composition gesture (per-monad, below)
- The register descriptor (§ 2)
- The shared discipline (§ 4)
- The negative prompt (§ 4)
- Pure black background, edge breathing room

---

### Monad 1 — `arrivalAnchor` · 16:9 · 1792×1024

**Lives in**: Movement 1 (Arrival), centred horizontally, content (eyebrow + headline) sits in the negative-space eye.

**Composition gesture.** A wide horizontal paint swirl forming a *single
elegant orbital arc* with a clear central negative-space eye. The paint
mass occupies the upper-left and lower-right of the frame in two
interleaving lobes that meet around an empty centre, creating a soft oval
"eye" approximately 40% width × 35% height of the frame, vertically
centred. The lobes have flowing curvature like a slow ribbon mid-rotation.
Edge breathing room: paint never closer than 8% to any frame edge.

**Negative-space contract.** The central eye (40% × 35% at frame centre)
must be pure black/transparent. The four corners must also be transparent
for breathing room.

**Why this monad.** The page's first paint statement: a centred,
composed "stage" that frames the brand voice inside its own eye.

---

### Monad 2 — `propositionA` · 1:1 · 768×768

**Lives in**: Movement 2 (Proposition), card 1's adjacent monad. Small.

**Composition gesture.** A single round paint **drop** suspended mid-air,
caught at the moment a smaller satellite droplet has just separated from
its underside. The main drop occupies ~55% of the frame at the upper-
right. The satellite droplet sits ~15% size at the lower-left. A thin
trailing ribbon connects them — about to snap. Edge breathing room ≥10%
on all sides.

**Negative-space contract.** Lower-right and upper-left corners
transparent. Centre line clear.

---

### Monad 3 — `propositionB` · 1:1 · 768×768

**Lives in**: Movement 2 (Proposition), card 2's adjacent monad.

**Composition gesture.** A small paint **swirl** — one tight orbital coil
viewed from above, like a slow whirlpool. The paint forms a soft loop
with a defined leading edge and tapering trailing edge that fades into
small droplets. Coil occupies ~60% of frame, centred. Edge breathing
room ≥10%.

**Negative-space contract.** Frame corners transparent; centre of the
coil has a small pinhole of negative space.

---

### Monad 4 — `propositionC` · 1:1 · 768×768

**Lives in**: Movement 2 (Proposition), card 3's adjacent monad.

**Composition gesture.** A short paint **braid** — two ribbons of paint
twisting around each other in a brief 2-3 turn helix. The braid runs
diagonally from lower-left to upper-right at ~30°. Tapered ends. Length
~70% of frame diagonal. Edge breathing room ≥10%.

**Negative-space contract.** Upper-left and lower-right corners
transparent.

---

### Monad 5 — `horizonSweep` · ~6:1 · 1920×320

**Lives in**: Movement 3 (Breadth), runs as a horizon line with content above and below.

**Composition gesture.** A long, slow horizontal paint **wave** — one
continuous flowing gesture spanning ~85% of the frame width, with three
gentle cresting peaks and two valleys. The wave's body has visible flow
direction (left-to-right). Maximum height ~70% of frame height,
positioned at the vertical centre. Edge breathing room ≥7% on left and
right; ≥15% top and bottom.

**Negative-space contract.** Top and bottom bands of the frame
transparent (where content sits above/below the sweep).

---

### Monad 6 — `heldNote` · 9:14 · 768×1196

**Lives in**: Movement 4 (Proof), single contemplative gesture beside the project photo and above the pull quote.

**Composition gesture.** A single composed **falling-droplet** gesture —
a vertical paint column that begins as a thin trickle at the top of the
frame, swells slightly in the middle, and terminates at the lower-third
in a single suspended bead about to detach. One or two micro-droplets
hang to the side of the main column. The whole gesture occupies the
central 50% of the frame width. Slow, deliberate, contemplative.
Edge breathing room ≥12% on left and right; ≥6% top; ≥10% bottom.

**Negative-space contract.** Left and right thirds of the frame
transparent. The bottom 10% transparent below the terminal bead so the
pull quote can sit visually beneath the drip.

---

### Monad 7 — `risingBloom` · 7:10 · 896×1280

**Lives in**: Movement 5 (Invitation), final statement; bloom rises between the FAQ on the left and CTA on the right.

**Composition gesture.** A paint **bloom rising** from the lower portion
of the frame — a denser mass at the bottom-centre that arches upward in
a fountain-like spread, with smaller secondary tendrils reaching up and
slightly outward to the upper-left and upper-right corners (without
touching them). The shape is broadly *fountain-silhouette*: wider at the
top, narrower at the base. Dense paint mass in the lower 50% of the
frame; tendrils in the upper 50% are sparse with significant breathing
room. Edge breathing room ≥10% on all sides.

**Negative-space contract.** Upper-left and upper-right corners largely
transparent (sparse tendrils only). The bottom edge has a small
breathing band.

---

## 4. Shared style discipline (every prompt)

**Always include in the positive prompt:**
- Vibrant, glossy liquid paint mid-flight, photographic macro detail
- Pure black background (will be made transparent in post)
- Surface tension droplets at gesture's leading edges
- Specular highlights on raised paint surfaces
- The register descriptor from § 2 (palette + energy)
- Edge breathing room: paint never touches frame edges
- Single coherent gesture, not chaotic splatter

**Always include in the negative prompt:**
- text, letters, watermark, signature, logos
- people, faces, hands, figures
- objects, products, tools, brushes
- chaotic splatter, mess, formless splash without composition
- frame edges touched by paint, paint cropped at edges
- pastel cyan, neon, radioactive colours
- (for vortex-orbital only) warm tones, orange, copper, yellow, red

**Generation parameters:**
- Aspect ratios as specified per monad
- Quality: highest available tier
- Steps/guidance: model-default unless results need tuning
- Seed: random per generation; cache successful seeds in `.fal-style-cache.json`

---

## 5. Pipeline & output spec

**Models** (subject to FAL availability):
- Primary generation: `fal-ai/flux-pro/v1.1-ultra` (excellent compositional control)
- Style reference: pass `image_url` parameter for the register's anchor
  reference image when supported by the chosen model variant
- Background removal: `fal-ai/birefnet/v2` (alpha-channel quality is
  critical — paint edges must remain crisp after rembg)

**Output paths:**
- `public/brand/paint/wave-horizon/{monad-key-kebab}.png`
- `public/brand/paint/vortex-orbital/{monad-key-kebab}.png`

Where `{monad-key-kebab}` = `arrival-anchor`, `proposition-a`,
`proposition-b`, `proposition-c`, `horizon-sweep`, `held-note`,
`rising-bloom`.

**Idempotency:**
- Skip if output PNG already exists.
- `--force <key>` flag forces regeneration of one monad (one or both registers).
- `--register <wave-horizon|vortex-orbital>` flag scopes a run to a single register.
- `--all` flag regenerates everything.

**Style-ref cache:**
`scripts/.fal-style-cache.json` records (register, ref-file-hash) → FAL
upload-id, so we don't re-upload the same reference between runs.

---

## 6. Cost / time estimate

- 7 monads × 2 registers = 14 generations
- 14 background-removal calls
- 2 reference uploads (cached after first run)

Approximate FAL.ai cost (Flux Pro v1.1 Ultra at ~$0.05/image,
birefnet at ~$0.005/image): **≈ $0.78 per full regeneration**.

Wall-clock time at 4-way parallel + ~30s per generation: ~3 min.

---

## 7. Required pre-flight files (user)

Before running the script, the two **canonical style references** must be
present in the repo at:

- `scripts/refs/wave-horizon.png` (the swirl-with-eye reference image)
- `scripts/refs/vortex-orbital.png` (the glossy splash reference image)

These are the *authoritative aesthetic anchors* for the two registers.
The script verifies their presence at startup and exits with a clear
error if they're missing.
