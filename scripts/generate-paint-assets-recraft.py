"""
Generate the Pavlicevits paint asset library via Recraft API.

Two style channels, both produced from the SAME composition prompts:
  - oil    — Dravart-aesthetic painterly anime (digital_illustration base)
  - liquid — photographic high-pigment paint     (realistic_image base)

Each style is locked to a Recraft custom style_id created from a
single reference image. The style_id carries the visual register;
the per-asset prompt carries the composition. This separation is
what lets us regenerate the whole library with a different aesthetic
just by swapping the reference image — no per-prompt rewriting.

Pipeline per asset:
  1. (one time) POST reference image to /v1/styles → style_id
     cached in scripts/.recraft-style-cache.json keyed by ref-image
     hash so reruns don't re-create styles.
  2. POST /v1/images/generations with {prompt, style_id, size}
  3. POST result through /v1/images/removeBackground
  4. Download to public/brand/paint/{oil|liquid}/{name}.png

Output writes to a NEW namespace (oil/, liquid/) so existing
*-v2.png and *-A.png stay intact as fallback. Once the new library
is approved, src/lib/brand/paint-assets.ts is repointed at the new
paths.

Idempotency: if {output_path} already exists, the asset is skipped
(no Recraft credits burned). Delete the file to force regeneration.

Setup:
  1. RECRAFT_API_KEY env var (or read from .env.local).
  2. Place reference images at:
       design-pack/references/00_oil_paint_reference.webp     (default)
       design-pack/references/00_realistic_paint_reference.*  (default)
     OR pass paths via --oil-ref / --liquid-ref CLI flags.
  3. (optional) RECRAFT_MODEL env to override model
     (default: recraftv3; alternatives: recraftv2).

Run:
  python scripts/generate-paint-assets-recraft.py
  python scripts/generate-paint-assets-recraft.py --only oil
  python scripts/generate-paint-assets-recraft.py --only liquid --regen pigment-dust
  python scripts/generate-paint-assets-recraft.py --dry-run
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Iterable

import requests


# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

ROOT = Path(__file__).resolve().parent.parent
PUBLIC_PAINT = ROOT / "public" / "brand" / "paint"
REFS_DIR = ROOT / "design-pack" / "references"
CACHE_PATH = ROOT / "scripts" / ".recraft-style-cache.json"

BASE_URL = "https://external.api.recraft.ai/v1"
MODEL = os.environ.get("RECRAFT_MODEL", "recraftv4_pro").strip()
# Recraft v4 quality tier. "high" produces the cleanest output; v4 also
# accepts unset (default) — set to empty string to skip the param.
QUALITY = os.environ.get("RECRAFT_QUALITY", "high").strip()


# Default reference image paths (overridable via --oil-ref / --liquid-ref).
# The user's pick:
#   oil    → vortex-orbital-v2.png   (the anime-painterly Dravart-aesthetic
#                                     swirl with cyan/orange flecks on black)
#   liquid → wave-horizon-A.png      (the photorealistic glossy splash)
# These are STYLE seeds only — the per-asset prompt drives composition.
DEFAULT_OIL_REF = PUBLIC_PAINT / "vortex-orbital-v2.png"
DEFAULT_LIQUID_REF_CANDIDATES = [
    # Drop-in override slot for a purpose-shot photo:
    REFS_DIR / "00_realistic_paint_reference.png",
    REFS_DIR / "00_realistic_paint_reference.jpg",
    REFS_DIR / "00_realistic_paint_reference.webp",
    # Default: the existing wave-horizon-A photorealistic seed.
    PUBLIC_PAINT / "wave-horizon-A.png",
]


# Recraft v4 does NOT accept style_id at generation time (the /styles
# endpoint accepts model=recraftv4 and returns a v4-bound style_id, but
# /images/generations rejects it: "Recraft V4 doesn't support style
# references"). And /images/imageToImage locks the output geometry to
# the input image, which kills our composition control.
#
# So the visual register difference between oil and liquid has to come
# from the prompt language alone. Each channel gets a distinct preamble
# that encodes the aesthetic — anime-painterly for oil, photographic-
# liquid for liquid — and both channels run the SAME composition
# prompts on top of those preambles.
V4_BASE_STYLE = "any"

# Brand palette — VIBRANT register, two interwoven pigment families:
# petrol-teal (saturated blue-green, dominant) + clean warm orange
# (accent ribbons, threading through). Inspired by the brand's real
# liquid-paint reference: glossy, photographic, both colours present
# in roughly 70/25/5 weighting (teal/orange/cream-highlight). Petrol
# leans BLUE-GREEN, NOT pastel cyan, NOT muddy navy — saturated and
# luminous like wet ocean glass.
BRAND_PALETTE_RGB = [
    [8, 30, 38],      # near-black petrol shadow (deep recess)
    [15, 76, 92],     # #0F4C5C petrol-primary (blue-green dark)
    [22, 95, 100],    # deeper teal-green mid
    [43, 158, 178],   # cyan-teal bright (saturated, slight green lean)
    [77, 188, 200],   # cyan-vibrant (lifted edges)
    [220, 116, 64],   # warm orange vibrant (clean, not muddy)
    [240, 145, 80],   # light orange highlight (lifted edges)
    [245, 235, 220],  # cream highlight (specular surface tension)
]

# Atmospheric framing — paint floats in vast emptiness, edges dissolve.
ATMOSPHERIC_FRAMING = (
    "The composition floats as a singular gesture in the centre of a "
    "VAST EMPTY BLACK VOID — abundant negative space surrounds it on "
    "every side. Wherever the paint approaches the canvas edges it "
    "dissolves to nothing long before touching them. "
)

# Color directive — drives the model toward the vibrant interwoven
# look from the brand reference. Two pigments BRAID through each
# other, not segregated zones.
COLOR_DIRECTIVE = (
    "COLOUR — the paint is TWO INTERWOVEN PIGMENTS braiding through "
    "each other like ribbons in a single continuous flow. The "
    "DOMINANT pigment (about 70 percent) is a saturated petrol "
    "BLUE-GREEN teal — vivid hex 0F4C5C through 2BA8C2, with the "
    "deeper hex 08323D in the recesses. The ACCENT pigment (about 25 "
    "percent) is a CLEAN WARM ORANGE — vivid hex D87440 through "
    "E89150 — threading through the teal as smaller ribbons and "
    "swirls. About 5 percent is CREAM specular highlights on the "
    "wettest leading edges. The two pigments TWIST AROUND EACH "
    "OTHER inside the same paint flow, never separating into distinct "
    "zones. Saturated and VIBRANT, NOT muddy, NOT dark, NOT pastel. "
)

# Both channels share the same vibrant register — "oil" leans more
# painterly/illustrated, "liquid" leans more photographic — but the
# colour palette and energy are the same.
OIL_PREAMBLE = (
    "An abstract painterly composition of glossy liquid paint mid-"
    "flight, with stylized contoured edges and bold gestural energy. "
    "Like high-end editorial illustration of paint in motion — "
    "calligraphic confidence married to fluid liquid behaviour. "
    + COLOR_DIRECTIVE
    + "Pure black background. NO text, NO logos, NO landscape, NO "
    "ocean, NO mountains, NO figures, NO objects, NO recognizable "
    "imagery — just abstract paint as gesture. "
    + ATMOSPHERIC_FRAMING
    + "The gesture: "
)

LIQUID_PREAMBLE = (
    "A macro-photographic image of high-pigment glossy liquid paint "
    "in motion on a pure black studio backdrop. Vibrant wet surface, "
    "specular highlights, fine surface-tension droplets along the "
    "leading edges of the paint mass. Like a magazine product-shot "
    "of paint — sophisticated, photographic, abstract. "
    + COLOR_DIRECTIVE
    + "Pure black background. NO text, NO logos, NO landscape, NO "
    "ocean, NO mountains, NO figures, NO objects, NO recognizable "
    "imagery — just abstract paint as gesture. "
    + ATMOSPHERIC_FRAMING
    + "The gesture: "
)

CHANNELS = {
    "oil": {
        "base_style": V4_BASE_STYLE,
        "out_dir": PUBLIC_PAINT / "oil",
        "preamble": OIL_PREAMBLE,
    },
    "liquid": {
        "base_style": V4_BASE_STYLE,
        "out_dir": PUBLIC_PAINT / "liquid",
        "preamble": LIQUID_PREAMBLE,
    },
}


# Logical assets — composition prompt + Recraft size. Each prompt is
# engineered to its destination section AND to inter-section continuity
# per scripts/HOMEPAGE_ARCHITECTURE.md. Sizes use Recraft's supported
# preset values (1820x1024 ≈ 16:9, 2048x1024 = 2:1, 1024x1820 = 9:16,
# 1365x1024 = 4:3).
#
# Architectural rules baked into every prompt:
#   1. Paint never closes the frame on all four sides — at least one
#      edge has a deliberate exit gesture (drip / filament / thread).
#   2. Negative space (empty black) is ALWAYS specified explicitly,
#      because Recraft's bg-removal turns black into transparent and
#      empty zones are where content lives.
#   3. ONE gesture per asset — no chaotic spatter, no competing marks.
#      The page reads as one continuous painted gesture across nine
#      sections, not nine independent splatters.
ASSETS = [
    (
        # § 1 Hero — ATTENTION. Horizon arc that tapers cleanly inside
        # all four edges. CSS handles inter-section continuity, not the
        # asset itself.
        "hero-horizon",
        "2688x1536",
        (
            "A single broad horizontal flow of vibrant glossy liquid "
            "paint sweeping confidently across the lower half of the "
            "canvas. Within this single flow, two pigments — petrol-"
            "teal and warm orange — twist and braid around each other "
            "like ribbons in a single continuous gesture. The flow's "
            "shape is one elegant elongated S-curve or gentle arc. A "
            "single thin filament of paint drips downward from the "
            "right portion of the flow, dissolving into mid-air. The "
            "upper 60 percent of the canvas is empty pure black."
        ),
    ),
    (
        # § 2 WhyChoose — RECOGNITION. Tall vertical braid with three
        # nodes. Both ends taper to nothing before the top/bottom edges.
        "braid-diagonal",
        "1536x2688",
        (
            "A single elegant strand of vibrant glossy liquid paint "
            "descending diagonally through tall empty space, like "
            "two pigments pouring slowly down a silk thread. Within "
            "the strand, petrol-teal and warm orange ribbons twist "
            "around each other — interwoven, never separated. The "
            "strand has three subtle gathering points where it "
            "thickens slightly, then thins again. Smooth, fluid, "
            "elegant. NOT a tentacle, NOT a creature, NOT bumpy or "
            "textured. The strand begins thin near the upper region "
            "of the canvas and ends thin near the lower region, both "
            "ends dissolving in mid-air."
        ),
    ),
    (
        # § 3 MaterialSystem — CURIOSITY (chemistry). Horizontal river
        # with right-side downward bend that tapers in-frame.
        "river-with-fall",
        "2688x1536",
        (
            "A long horizontal flow of vibrant glossy liquid paint "
            "stretching across the lower-middle of the canvas. Within "
            "the flow, petrol-teal and warm orange pigments interweave "
            "as braided ribbons twisting through each other. The flow "
            "has three or four gentle swells along its length and a "
            "few small surface-tension droplets above its upper "
            "surface. At the right end of the flow, the paint bends "
            "gracefully downward into a short descending fall that "
            "tapers and dissolves in mid-air. NOT an ocean wave, NOT "
            "a sea, NOT a landscape — just an abstract horizontal "
            "paint flow with a right-side downward exit."
        ),
    ),
    (
        # § 4 Categories — CURIOSITY (domain). Six descending streams
        # all tapering inside the frame.
        "cascade-six-streams",
        "2688x1536",
        (
            "A small source of vibrant glossy liquid paint at the "
            "upper-centre of the canvas branches into six elegant thin "
            "streams that fan outward and descend gracefully into "
            "empty space below. Each stream contains interwoven "
            "ribbons of petrol-teal and warm orange twisting through "
            "each other as the paint flows downward. The streams "
            "diverge — three angle leftward, three rightward — and "
            "each tapers and dissolves in mid-air before reaching the "
            "lower portion of the canvas. THIN delicate streams, like "
            "a chandelier of paint, NOT thick walls of paint, NOT "
            "stalagmites, NOT a curtain."
        ),
    ),
    (
        # § 5 FeaturedProject — UNDERSTANDING. Reflective puddle with
        # thread, all tapering inside the frame.
        "puddle-with-thread",
        "2688x1536",
        (
            "A horizontal pool of vibrant glossy wet liquid paint "
            "resting in the lower-middle of the canvas, like a small "
            "spill of fresh paint on a black floor. The pool's surface "
            "is wet and reflective with specular highlights. Within "
            "the pool, petrol-teal and warm orange pigments swirl "
            "together — interwoven ribbons twisting through each "
            "other. A few small surface-tension droplets sit just "
            "above the pool's edge. From the pool's lowest point, a "
            "single thin paint thread leaks downward and dissolves "
            "in mid-air. Calm, settled, reflective."
        ),
    ),
    (
        # § 6 PullQuote — FEELING. Bold decisive diagonal that tapers
        # cleanly inside the frame on both ends.
        "manifesto-stroke",
        "2688x1536",
        (
            "ONE bold confident diagonal stroke of vibrant glossy "
            "liquid paint sweeping decisively from lower-left toward "
            "upper-right across the canvas. Within the stroke, petrol-"
            "teal and warm orange pigments interweave as braided "
            "ribbons twisting around each other along the stroke's "
            "entire length. The stroke is THICK at its centre spine "
            "and tapers to thin filaments at both ends, both ends "
            "dissolving in mid-air well clear of the corners. Like a "
            "calligrapher's signature — ONE single decisive mark, "
            "glossy and wet with a few surface-tension droplets along "
            "the spine. NOT an ocean, NOT waves, NOT multiple strokes."
        ),
    ),
    (
        # § 8 FAQ — TRUST (clarity). Corner-mass flourish with tendrils
        # all tapering inside the frame.
        "flourish-corner-bl-pointing",
        "2560x1792",
        (
            "An abstract paint flourish anchored in the lower-left of "
            "the canvas. Within the flourish, vibrant petrol-teal and "
            "warm orange pigments interweave as braided ribbons "
            "twisting through each other. From the small main mass, "
            "elegant thin tendrils reach UP-AND-RIGHTWARD like wind-"
            "blown ribbons, glossy and wet, dissolving as they travel "
            "toward the upper-right of the canvas. A few surface-"
            "tension droplets scatter along the tendrils. NOT a "
            "creature, NOT a plant, NOT a hand — just an abstract "
            "paint gesture with directional reach."
        ),
    ),
    (
        # § 9 CTABanner — ACTION. Rising bloom with hollow centre, all
        # taper-bounded inside the frame.
        "bloom-rising-centre",
        "2688x1536",
        (
            "A vibrant glossy paint bloom rising from below in the "
            "centre of the canvas, surging upward and outward in a "
            "horseshoe or U shape with a clearly hollow empty centre. "
            "Within the bloom's mass, petrol-teal and warm orange "
            "pigments interweave as braided ribbons twisting through "
            "each other. The hollow centre is pure empty black. The "
            "bloom's outer edges dissolve into mid-air, with surface-"
            "tension droplets scattered along the leading edges. Like "
            "ink dropped in water unfolding upward — sophisticated, "
            "vibrant, photographic. NOT a flower, NOT a creature, "
            "NOT a landscape."
        ),
    ),
]


# ---------------------------------------------------------------------------
# Auth + .env.local fallback
# ---------------------------------------------------------------------------

def _read_env_local_fallback(name: str) -> str:
    """If the env var isn't set, peek at .env.local — keeps the script
    runnable from a plain shell without sourcing dotenv."""
    env_path = ROOT / ".env.local"
    if not env_path.exists():
        return ""
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        k, _, v = line.partition("=")
        if k.strip() == name:
            return v.strip().strip('"').strip("'")
    return ""


API_KEY = (
    os.environ.get("RECRAFT_API_KEY", "").strip()
    or _read_env_local_fallback("RECRAFT_API_KEY")
)


def _require_key() -> None:
    if not API_KEY:
        print(
            "ERROR: RECRAFT_API_KEY is not set. Add it to .env.local or export "
            "it in your shell.",
            file=sys.stderr,
        )
        sys.exit(1)


# ---------------------------------------------------------------------------
# Recraft API helpers
# ---------------------------------------------------------------------------

def _post_json(path: str, payload: dict, label: str) -> dict:
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
    last_err = None
    for attempt in range(3):
        try:
            resp = requests.post(
                BASE_URL + path, headers=headers, json=payload, timeout=240
            )
            if resp.ok:
                return resp.json()
            last_err = f"status={resp.status_code} body={resp.text[:300]}"
            print(f"[{label}] attempt {attempt + 1} failed: {last_err}")
        except Exception as exc:
            last_err = str(exc)
            print(f"[{label}] attempt {attempt + 1} error: {last_err}")
        time.sleep(2 + attempt * 2)
    raise RuntimeError(f"POST {path} failed: {last_err}")


def _post_multipart(
    path: str,
    files: dict,
    data: dict | None,
    label: str,
) -> dict:
    headers = {"Authorization": f"Bearer {API_KEY}"}
    last_err = None
    for attempt in range(3):
        try:
            resp = requests.post(
                BASE_URL + path,
                headers=headers,
                files=files,
                data=data or {},
                timeout=240,
            )
            if resp.ok:
                return resp.json()
            last_err = f"status={resp.status_code} body={resp.text[:300]}"
            print(f"[{label}] attempt {attempt + 1} failed: {last_err}")
        except Exception as exc:
            last_err = str(exc)
            print(f"[{label}] attempt {attempt + 1} error: {last_err}")
        time.sleep(2 + attempt * 2)
    raise RuntimeError(f"POST {path} (multipart) failed: {last_err}")


def _hash_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(64 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()[:16]


def _load_cache() -> dict:
    if not CACHE_PATH.exists():
        return {}
    try:
        return json.loads(CACHE_PATH.read_text(encoding="utf-8"))
    except Exception:
        return {}


def _save_cache(cache: dict) -> None:
    CACHE_PATH.write_text(json.dumps(cache, indent=2), encoding="utf-8")


def get_or_create_style_id(
    ref_path: Path | None,
    base_style: str,
    cache: dict,
    label: str,
) -> str | None:
    """Create (or reuse) a Recraft custom style_id for the given reference.

    Cache key includes MODEL + base_style + file hash, so swapping any
    of those invalidates correctly. /v1/styles requires the `model`
    field too — Recraft pins each style_id to a specific model and
    rejects cross-model use ("doesn't match the style's model").

    Returns None when no reference is available — caller should fall
    back to plain `style`."""
    if ref_path is None or not ref_path.exists():
        print(
            f"[{label}] no reference at {ref_path} — falling back to plain "
            f"style={base_style} (no style_id)"
        )
        return None

    key = f"{MODEL}:{base_style}:{_hash_file(ref_path)}"
    if key in cache:
        cached = cache[key]
        print(f"[{label}] reusing cached style_id={cached}")
        return cached

    print(f"[{label}] creating Recraft style ({MODEL}) from {ref_path.name}...")
    with ref_path.open("rb") as fh:
        suffix = ref_path.suffix.lower().lstrip(".")
        mime = {
            "png": "image/png",
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
            "webp": "image/webp",
        }.get(suffix, "application/octet-stream")
        files = {"file": (ref_path.name, fh, mime)}
        result = _post_multipart(
            "/styles",
            files=files,
            data={"style": base_style, "model": MODEL},
            label=f"{label}/style",
        )

    style_id = result.get("id") or result.get("style_id")
    if not style_id:
        raise RuntimeError(
            f"[{label}] /styles returned no id: {json.dumps(result)[:300]}"
        )
    print(f"[{label}] style_id={style_id}")
    cache[key] = style_id
    _save_cache(cache)
    return style_id


def _model_supports_style_refs(model: str) -> bool:
    """Recraft v4 generations rejects `style_id`. Only v3 (and older)
    let you bind a custom style at generation time."""
    return model.startswith("recraftv3") or model.startswith("recraftv2")


def generate_image(
    prompt: str,
    size: str,
    style_id: str | None,
    base_style: str,
    label: str,
) -> str:
    payload: dict = {
        "prompt": prompt,
        "n": 1,
        "size": size,
        "model": MODEL,
        "response_format": "url",
        "controls": {
            "colors": [{"rgb": rgb} for rgb in BRAND_PALETTE_RGB],
        },
    }
    if QUALITY:
        payload["quality"] = QUALITY
    if style_id and _model_supports_style_refs(MODEL):
        payload["style_id"] = style_id
    else:
        payload["style"] = base_style

    result = _post_json("/images/generations", payload, label=f"{label}/gen")
    images = result.get("data") or []
    if not images:
        raise RuntimeError(f"[{label}] no images: {json.dumps(result)[:300]}")
    url = images[0].get("url")
    if not url:
        raise RuntimeError(f"[{label}] no url: {json.dumps(images[0])[:300]}")
    return url


def remove_background(image_url: str, label: str) -> str:
    """Recraft's bg removal endpoint takes a file (multipart). We download
    the generated image first, then upload it for bg removal."""
    print(f"[{label}] downloading for bg removal...")
    src_resp = requests.get(image_url, timeout=120)
    src_resp.raise_for_status()

    files = {"file": ("source.png", src_resp.content, "image/png")}
    result = _post_multipart(
        "/images/removeBackground",
        files=files,
        data=None,
        label=f"{label}/bg",
    )

    # Recraft bg-removal response has historically returned either
    #   {"image": {"url": "..."}}        (older shape)
    # or {"data": [{"url": "..."}]}      (newer aligned shape)
    if isinstance(result.get("image"), dict) and result["image"].get("url"):
        return result["image"]["url"]
    if isinstance(result.get("data"), list) and result["data"]:
        u = result["data"][0].get("url")
        if u:
            return u
    raise RuntimeError(
        f"[{label}] removeBackground returned no url: {json.dumps(result)[:300]}"
    )


def download_to(url: str, out_path: Path, label: str) -> int:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with requests.get(url, stream=True, timeout=120) as r:
        r.raise_for_status()
        with out_path.open("wb") as fh:
            shutil.copyfileobj(r.raw, fh)
    return out_path.stat().st_size


# ---------------------------------------------------------------------------
# Pipeline
# ---------------------------------------------------------------------------

def generate_one(
    channel: str,
    style_id: str | None,
    base_style: str,
    preamble: str,
    out_dir: Path,
    name: str,
    size: str,
    composition: str,
    regen: set[str],
) -> tuple[str, bool, str]:
    label = f"{channel}/{name}"
    out_path = out_dir / f"{name}.png"

    if out_path.exists() and name not in regen:
        size_kb = out_path.stat().st_size / 1024
        return f"{channel}/{name}", True, f"skip (exists, {size_kb:.1f}KB)"

    full_prompt = preamble + composition

    try:
        gen_url = generate_image(
            full_prompt,
            size=size,
            style_id=style_id,
            base_style=base_style,
            label=label,
        )
        print(f"[{label}] gen ok -> {gen_url}")

        bg_url = remove_background(gen_url, label=label)
        print(f"[{label}] bg ok -> {bg_url}")

        size_bytes = download_to(bg_url, out_path, label=label)
        size_kb = size_bytes / 1024
        print(f"[{label}] saved {out_path.relative_to(ROOT)} ({size_kb:.1f} KB)")
        return f"{channel}/{name}", True, f"saved {size_kb:.1f}KB"
    except Exception as exc:
        return f"{channel}/{name}", False, f"exception: {exc}"


def find_liquid_ref(explicit: Path | None) -> Path | None:
    if explicit is not None:
        return explicit if explicit.exists() else None
    for cand in DEFAULT_LIQUID_REF_CANDIDATES:
        if cand.exists():
            return cand
    return None


def run(
    channels: Iterable[str],
    oil_ref: Path | None,
    liquid_ref: Path | None,
    regen: set[str],
    dry_run: bool,
) -> int:
    cache = _load_cache()
    plan: list[dict] = []

    for channel in channels:
        cfg = CHANNELS[channel]
        if channel == "oil":
            ref = oil_ref if oil_ref else (DEFAULT_OIL_REF if DEFAULT_OIL_REF.exists() else None)
        else:
            ref = liquid_ref if liquid_ref else find_liquid_ref(None)

        plan.append(
            {
                "channel": channel,
                "ref": str(ref) if ref else None,
                "base_style": cfg["base_style"],
                "out_dir": str(cfg["out_dir"].relative_to(ROOT)),
                "assets": [a[0] for a in ASSETS],
            }
        )

    print("Recraft generation plan:")
    print(json.dumps(plan, indent=2))
    if dry_run:
        print("\n--dry-run: not generating anything.")
        return 0

    _require_key()

    failures = 0

    for channel in channels:
        cfg = CHANNELS[channel]
        if channel == "oil":
            ref = oil_ref if oil_ref else (DEFAULT_OIL_REF if DEFAULT_OIL_REF.exists() else None)
        else:
            ref = liquid_ref if liquid_ref else find_liquid_ref(None)

        # v4 cannot consume a style_id at /generations time. Skip the
        # /styles upload entirely so we don't burn credits on a token
        # we'll never use. Style register comes from each channel's
        # preamble instead.
        if _model_supports_style_refs(MODEL):
            style_id = get_or_create_style_id(
                ref, cfg["base_style"], cache, label=channel
            )
        else:
            print(
                f"[{channel}] {MODEL} doesn't support style_id at gen time — "
                f"skipping /styles upload (ref kept for record: {ref.name if ref else None})"
            )
            style_id = None
        cfg["out_dir"].mkdir(parents=True, exist_ok=True)

        # Pre-filter to skip already-existing files BEFORE allocating the
        # threadpool, so the concurrency log is honest about what's running.
        to_run = [
            (n, sz, comp)
            for (n, sz, comp) in ASSETS
            if (not (cfg["out_dir"] / f"{n}.png").exists()) or (n in regen)
        ]
        skipped = [n for (n, _sz, _c) in ASSETS if (n, None, None) not in to_run]
        if skipped:
            print(f"[{channel}] {len(skipped)} already on disk, skipping: {', '.join(skipped)}")

        if not to_run:
            print(f"[{channel}] nothing to generate.")
            continue

        print(f"\n[{channel}] generating {len(to_run)} asset(s) in parallel...\n")
        with ThreadPoolExecutor(max_workers=4) as pool:
            futures = {
                pool.submit(
                    generate_one,
                    channel,
                    style_id,
                    cfg["base_style"],
                    cfg["preamble"],
                    cfg["out_dir"],
                    name,
                    size,
                    composition,
                    regen,
                ): name
                for (name, size, composition) in to_run
            }
            results = [fut.result() for fut in as_completed(futures)]

        print(f"\n=== Summary ({channel}) ===")
        for fq_name, ok, msg in sorted(results):
            marker = "OK " if ok else "FAIL"
            print(f"{marker}  {fq_name}  --  {msg}")
            if not ok:
                failures += 1

    return 1 if failures else 0


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument(
        "--only",
        choices=["oil", "liquid"],
        help="Run only one channel.",
    )
    p.add_argument(
        "--oil-ref",
        type=Path,
        help=f"Override oil-style reference image (default: {DEFAULT_OIL_REF.relative_to(ROOT)}).",
    )
    p.add_argument(
        "--liquid-ref",
        type=Path,
        help=(
            "Override liquid-style reference image (default: scan "
            "design-pack/references/00_realistic_paint_reference.{png,jpg,webp})."
        ),
    )
    p.add_argument(
        "--regen",
        nargs="*",
        default=[],
        help="Asset names to force-regenerate even if file exists (e.g. pigment-dust hero-centerpiece).",
    )
    p.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the generation plan and exit without calling the API.",
    )
    return p.parse_args()


def main() -> int:
    args = parse_args()
    channels = [args.only] if args.only else ["oil", "liquid"]
    return run(
        channels=channels,
        oil_ref=args.oil_ref,
        liquid_ref=args.liquid_ref,
        regen=set(args.regen),
        dry_run=args.dry_run,
    )


if __name__ == "__main__":
    sys.exit(main())
