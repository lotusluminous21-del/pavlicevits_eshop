# PAVLICEVITS COLORS — brand one-pager

Cinematic scroll site for the Pavlicevits paint shop (Kalamaria, Thessaloniki).
Greek-first, dark, lead-gen only. Petrol `#0F4C5C` is the sole accent.
Standalone project — fully independent of the e-shop codebase in the repo root.

Built from `design-pack/10_ONE_SHOT_WEBSITE_PROMPT.md`.

## Stack

- Vite + vanilla TypeScript
- GSAP ScrollTrigger (pinned reveals, counters) + Lenis (smooth scroll)
- Hero: Seedance 2.0 clip rebuilt as AVIF frame sets (deduped, RIFE-interpolated, Real-ESRGAN 4×), scrubbed on a `<canvas>`: decoded in workers (`src/decode.ts`), drawn with WebGL (`src/render.ts`, 2D canvas fallback), frame size picked by a quality ladder that times the device (`src/scrub.ts`); links followed from inside the hero play the film first, in 2 s, from a reel of frames put on the GPU while the intro runs (`src/journey.ts`)
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
and `OPENING_END` for `src/scrub.ts`. The screen caps which sets it may use;
the device's measured decode speed and dropped frames pick among them (see
the header of `src/scrub.ts`). In `npm run dev`, `__hero()` in the console
shows the set in use, the ladder and the timings.

Requires ffmpeg on PATH. Generation source jobs (Higgsfield, 2026-07-16):
hero image `ea3dc3db`, hero bloom `001a8fad`, material `781b6b17`,
work/project `58b1bd61`, shop `1c735fd4` (first take `e4ec075b`).

## Brand assets

The logo is the **heritage seal** (concept F of the 2026 logo exploration in
`../design-pack/logo-exploration/`, chosen by the client): a heavy outer ring,
a hairline ring and the inner circle; PAVLICEVITS COLORS on the upper arc,
SINCE 1990 on the lower one, a drop at each end of the horizontal; at its
centre the P whose counter is the hero film's drop, leaning 45° into the
corner where the bowl meets the stem. Below about 32 px the P stands alone.

Every file is generated from geometry and the site's own Inter (ring text
outlined, kerned, laid on the arcs), so nothing drifts:

```sh
python scripts/brand-marks.py     # needs fontTools + brotli, Pillow, Chrome
```

| Output | Use |
|---|---|
| `public/brand/emblem.svg`, `emblem-light.svg` | the seal on dark / light grounds (footer, 404, print) |
| `public/brand/mark.svg` | the P, cropped to its ink (site header, privacy, terms) |
| `public/brand/lockup.svg`, `lockup-light.svg` | P + PAVLICEVITS COLORS on one line, set like the site header |
| `index.html` (between the `emblem:` markers) | the inline seal the intro draws and the hero shows |
| `public/favicon.svg`, `../src/app/favicon.ico` | the P, optically centred; the SVG follows light/dark tabs |
| `public/apple-touch-icon.png`, `public/brand/emblem-512.png` | home-screen icon; the JSON-LD logo |
| `public/og-image.jpg` | share card: the seal over the bloom (1200 × 630) |
| `../public/svg/pavlicevits_logo.svg`, `_mark.svg` | the parked e-shop's header lockup and chat badge |

Colours: rings and text `#F2F6F8`, P and drops `#5BC5DB` on dark; `#0A0E1A`
and `#0F4C5C` on light. Lockups follow the presenter's rule: the P at 1.65 ×
the wordmark's cap height, centred on the cap band, 0.9 cap heights from it.

## Deployment

This site is the MAIN page of the deployed app: the root `next.config.ts`
rewrites `/` to the built copy in `../public/brand-site/` (assets stay
under `/brand-site/`; the old `/brand-site` URL redirects to `/`).
To refresh after changes here:

```sh
npm run build:staging
```

then commit and push to `main` (production rolls out in about 8 minutes).

## SEO / GEO

- Canonical, Open Graph, Twitter cards and JSON-LD (HardwareStore +
  WebSite) are baked into `index.html` at build time from `VITE_SITE_URL`
  in `vite.config.ts` — **switch it to `https://pavlicevits.gr` and rebuild when the
  custom domain is connected**.
- `../public/llms.txt` is the AI-crawler handshake; `../src/app/robots.ts`
  explicitly allows GPTBot, ClaudeBot, PerplexityBot, etc.
- OG image: `public/og-image.jpg` (1200×630, the seal over the bloom; `scripts/brand-marks.py`).
- Strategy source: `design-pack/06_AI_SEARCH_STRATEGY.md`.

## Before go-live

- Wire the lead form to a real inbox (see TODO in `src/form.ts`) — it currently
  validates client-side and shows the success state without sending.
- Clips are 720p (credit-budget decision). To upgrade: regenerate at
  std/1080p with the same prompts + reference image, re-run the pipeline —
  no code changes needed.
