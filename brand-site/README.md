# PAVLICEVITS COLORS — brand one-pager

Cinematic scroll site for the Pavlicevits paint shop (Kalamaria, Thessaloniki).
Greek-first, dark, lead-gen only. Petrol `#0F4C5C` is the sole accent.
Standalone project — fully independent of the e-shop codebase in the repo root.

Built from `design-pack/10_ONE_SHOT_WEBSITE_PROMPT.md`.

## Stack

- Vite + vanilla TypeScript
- GSAP ScrollTrigger (pinned reveals, counters) + Lenis (smooth scroll)
- Hero: Seedance 2.0 clip rebuilt as AVIF frame sets (deduped, RIFE-interpolated, Real-ESRGAN 4×), scrubbed on a `<canvas>`
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

```

The hero film has its own pipeline (needs a GPU, see the script header for
the RIFE and Real-ESRGAN ncnn-vulkan builds it expects):

```sh
python scripts/hero-film.py <hero-bloom.mp4> --work <scratch dir> --rife <dir> --esrgan <dir>
```

It removes the master's repeated frames (Seedance repeats every other frame
in the opening, then two a second), fills the gaps with RIFE in-betweens in
proportion to the motion, upscales every frame 4× with Real-ESRGAN, and
writes `public/media/hero/{m,l,xl,p}/NNNN.avif` (1920, 2560, 3840 wide and a
1296 × 2160 portrait crop) plus `hero-poster.webp`. It prints `FRAME_COUNT`
and `OPENING_END` for `src/scrub.ts`, which picks the set per screen.

Requires ffmpeg on PATH. Generation source jobs (Higgsfield, 2026-07-16):
hero image `ea3dc3db`, hero bloom `001a8fad`, material `781b6b17`,
work/project `58b1bd61`, shop `1c735fd4` (first take `e4ec075b`).

## Brand assets

The production mark is `public/brand/logo-mark.svg` — the "strata" mark:
three horizontal layers of liquid paint (bright cyan top coat, petrol mid,
pale base), generated as vector, background removed and viewBox cropped to
the artwork. The header and footer reference it via `<img>`, so swapping
the mark is a one-file change; `public/favicon.svg` embeds the same paths
inside a dark rounded tile. Wordmark text is always set in type, never as
part of the image.

`logo-lockup.png/.webp` and `logo-mark.png/.webp` are the earlier
AI-generated raster exploration (Higgsfield job `a248a4ba`, 2026-07-16),
kept for reference only.

## Deployment

This site is the MAIN page of the deployed app: the root `next.config.ts`
rewrites `/` to the built copy in `../public/brand-site/` (assets stay
under `/brand-site/`; the old `/brand-site` URL redirects to `/`).
To refresh after changes here:

```sh
npm run build:staging
```

then commit and push (`staging` → verify → merge to `main`).

## SEO / GEO

- Canonical, Open Graph, Twitter cards and JSON-LD (HardwareStore +
  WebSite) are baked into `index.html` at build time from `VITE_SITE_URL`
  in `vite.config.ts` — **switch it to `https://pavlicevits.gr` and rebuild when the
  custom domain is connected**.
- `../public/llms.txt` is the AI-crawler handshake; `../src/app/robots.ts`
  explicitly allows GPTBot, ClaudeBot, PerplexityBot, etc.
- OG image: `public/og-image.jpg` (1200×630, from the hero reference).
- Strategy source: `design-pack/06_AI_SEARCH_STRATEGY.md`.

## Before go-live

- Wire the lead form to a real inbox (see TODO in `src/form.ts`) — it currently
  validates client-side and shows the success state without sending.
- Clips are 720p (credit-budget decision). To upgrade: regenerate at
  std/1080p with the same prompts + reference image, re-run the pipeline —
  no code changes needed.
