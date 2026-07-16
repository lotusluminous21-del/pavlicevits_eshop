# PAVLICEVITS COLORS — brand one-pager

Cinematic scroll site for the Pavlicevits paint shop (Kalamaria, Thessaloniki).
Greek-first, dark, lead-gen only. Petrol `#0F4C5C` is the sole accent.
Standalone project — fully independent of the e-shop codebase in the repo root.

Built from `design-pack/10_ONE_SHOT_WEBSITE_PROMPT.md`.

## Stack

- Vite + vanilla TypeScript
- GSAP ScrollTrigger (pinned reveals, counters) + Lenis (smooth scroll)
- Hero: Seedance 2.0 clip extracted to a webp frame sequence, scrubbed on a `<canvas>`
- Fonts: Inter Variable + Noto Serif Display Variable (both with full Greek glyph coverage), self-hosted via Fontsource

## Run

```sh
npm install
npm run dev      # localhost:5173
npm run build    # production build in dist/
```

## Media pipeline

All visuals were generated with Seedance 2.0 (Higgsfield MCP) from one petrol-bloom
reference image so the palette stays identical across clips. To swap a clip
(e.g. rotating the featured-project slot per campaign):

```sh
# ambient clips — names the site expects: material, project, shop
node scripts/prepare-media.mjs clip <new-clip.mp4> project

# hero scrub sequence (prints frame count — sync FRAME_COUNT in src/scrub.ts)
node scripts/prepare-media.mjs hero <new-hero.mp4>
```

Requires ffmpeg on PATH. Generation source jobs (Higgsfield, 2026-07-16):
hero image `ea3dc3db`, hero bloom `001a8fad`, material `781b6b17`,
work/project `58b1bd61`, shop `1c735fd4` (first take `e4ec075b`).

## Brand assets

`public/brand/` holds the generated logo (Higgsfield job `a248a4ba`, 2026-07-16):
`logo-lockup.png/.webp` (mark + wordmark) and `logo-mark.png/.webp` (drop only).
Their flat background is `#0C1420`, slightly off the site canvas `#0A0E1A` —
for use inside the site (header, hero), trace the mark to SVG or knock out
the background first; as a standalone lockup (proposals, social, print on
dark) it works as-is.

## Before go-live

- Wire the lead form to a real inbox (see TODO in `src/form.ts`) — it currently
  validates client-side and shows the success state without sending.
- Clips are 720p (credit-budget decision). To upgrade: regenerate at
  std/1080p with the same prompts + reference image, re-run the pipeline —
  no code changes needed.
