"""
Generate the Pavlicevits paint-asset library via FAL.ai (KONTEXT).

Two style registers, both produced via fal-ai/flux-pro/kontext/max with
their own anchor reference image. The reference image carries the visual
register; each monad's per-asset prompt carries the composition.

  - "wave-horizon"   — painterly oil-paint, deep petrol teal dominant
                       with subtle warm copper embers and luminous cyan
                       highlights. Anchor: WAVE_HORIZON_REF_URL.
  - "vortex-orbital" — painterly mid-air oil-paint, deep petrol teal
                       with navy/indigo darks and white droplets around
                       the perimeter. Anchor: VORTEX_ORBITAL_REF_URL.

Pipeline per monad+register:
  1. Build a positive prompt = register's "preserve aesthetic of this
     reference image — [palette/texture spec] — redraw the composition
     as: [gesture]" preamble + per-monad gesture + edge contract.
  2. Call fal-ai/flux-pro/kontext/max with the prompt + anchor image_url
     and the monad's aspect_ratio.
  3. Download the generated PNG, compute alpha locally from per-pixel
     luminance (max channel) — pure-black backgrounds become transparent;
     interior empty pockets are also transparent. This bypasses
     BiRefNet's segmentation errors that wrecked the prior run.
  4. Save to public/brand/paint/{wave-horizon|vortex-orbital}/{key}.png.

Idempotency: skip if the output PNG already exists. Use --force to
regenerate one or more keys, or delete the PNG.

Pre-flight:
  - FAL_KEY env var (or .env.local fallback). The canonical value lives
    in Firebase Secret Manager for pavlicevits-9a889.
  - PIL (Pillow) and numpy installed (already in standard env).

Run:
  python scripts/generate-paint-assets-fal.py
  python scripts/generate-paint-assets-fal.py --register wave-horizon
  python scripts/generate-paint-assets-fal.py --only arrival-anchor
  python scripts/generate-paint-assets-fal.py --force rising-bloom held-note
  python scripts/generate-paint-assets-fal.py --dry-run
"""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

import numpy as np
import requests
from PIL import Image

try:
    import fal_client  # type: ignore
except ImportError:
    fal_client = None  # surfaced at runtime in _require_fal()


# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

ROOT = Path(__file__).resolve().parent.parent
PUBLIC_PAINT = ROOT / "public" / "brand" / "paint"
VERSION_MANIFEST_PATH = ROOT / "src" / "lib" / "brand" / "monad-versions.json"


# ---------------------------------------------------------------------------
# FAL model
# ---------------------------------------------------------------------------

# KONTEXT/max preserves the reference image's aesthetic while applying the
# prompt's composition. Both registers route through the same model with
# different reference images.
GEN_MODEL = os.environ.get("FAL_GEN_MODEL", "fal-ai/flux-pro/kontext/max").strip()


# ---------------------------------------------------------------------------
# Reference images (hosted on FAL CDN)
# ---------------------------------------------------------------------------

# wave-horizon anchor — painterly oil with copper embers + cyan highlights.
WAVE_HORIZON_REF_URL = (
    "https://v3b.fal.media/files/b/0a97f273/"
    "1NGrAYXvsZjrt9cYmgSAY_b3642089932742fe8f62b695b9bc2486.png"
)
# vortex-orbital anchor — painterly mid-air oil with navy darks + white droplets.
VORTEX_ORBITAL_REF_URL = (
    "https://v3b.fal.media/files/b/0a97f293/"
    "nnqZ9ug1IKMEYBTRCN7uQ_wave-horizon.png"
)


# ---------------------------------------------------------------------------
# Register style preambles — verbatim from user's validated FAL prompts
# ---------------------------------------------------------------------------

WAVE_HORIZON_PREAMBLE = (
    "Preserving the EXACT painterly oil-paint aesthetic of this reference "
    "image — deep petrol teal hex 0F4C5C as the dominant 80%+ pigment, "
    "luminous teal-cyan highlights, subtle warm rust hex C46A3A embers as "
    "accents at the periphery, painterly oil-paint texture with visible "
    "brush hairs and fluid drips, natural alpha falloff at the edges of "
    "the paint, pure black background — redraw the composition as: "
)

VORTEX_ORBITAL_PREAMBLE = (
    "Preserving the EXACT painterly mid-air oil-paint aesthetic of this "
    "reference image — deep petrol teal pigment with navy and indigo "
    "darks, white droplets and splatters around the perimeter, fluid "
    "liquid-paint motion, transparent background, no canvas, no frame, "
    "the paint floating in empty space — redraw the composition as: "
)

NEGATIVE_TAIL = (
    " The paint is a FLAT painterly composition viewed straight on, NOT "
    "a 3D rendered object. The paint composition is FULLY CONTAINED "
    "inside the image frame with deliberate margin to all four edges; "
    "no part of the paint touches or runs off the frame edge. No text, "
    "no logos, no figurative imagery, no human figures, no objects, "
    "no recognizable subjects, no spheres, no planets, no 3D balls, "
    "no globes, no orbs, no marbles, no polished solids, no smooth "
    "shiny rendered surfaces, no clouds, no flowers, no creatures."
)


# ---------------------------------------------------------------------------
# Registers
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class Register:
    key: str
    ref_url: str
    preamble: str
    out_dir: Path


REGISTERS: dict[str, Register] = {
    "wave-horizon": Register(
        key="wave-horizon",
        ref_url=WAVE_HORIZON_REF_URL,
        preamble=WAVE_HORIZON_PREAMBLE,
        out_dir=PUBLIC_PAINT / "wave-horizon",
    ),
    "vortex-orbital": Register(
        key="vortex-orbital",
        ref_url=VORTEX_ORBITAL_REF_URL,
        preamble=VORTEX_ORBITAL_PREAMBLE,
        out_dir=PUBLIC_PAINT / "vortex-orbital",
    ),
}


# ---------------------------------------------------------------------------
# Monads — per-asset gesture descriptions (composition only — palette and
# texture come from each register's preamble, not from these strings).
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class Monad:
    key: str           # kebab-case, used for filenames
    width: int
    height: int
    aspect_ratio: str  # KONTEXT accepts these labels
    gesture: str       # composition-only; preamble supplies style


# Aspect ratio labels accepted by fal-ai/flux-pro/kontext/max. We pick the
# closest preset to each monad's natural pixel size.
MONADS: tuple[Monad, ...] = (
    Monad(
        key="arrival-anchor",
        width=1792,
        height=1024,
        aspect_ratio="16:9",
        gesture=(
            "a wide horizontal paint passage filling the upper-left, "
            "lower-right, and the perimeter of the frame, leaving a soft "
            "empty oval region near the centre about 38% of the frame "
            "width and 33% of the frame height. The painted areas show "
            "generous brush loading with multiple layered passes, ridges "
            "of pigment catching light, and natural alpha falloff at the "
            "outer edges. The composition celebrates the paint material "
            "itself — its weight, its texture, its layered depth. Edge "
            "breathing room: every side of the frame has at least 6% of "
            "pure black margin where no paint is present and no paint "
            "touches the edge."
        ),
    ),
    Monad(
        key="proposition-a",
        width=1024,
        height=1024,
        aspect_ratio="1:1",
        gesture=(
            "a substantive painterly paint passage occupying about 75% of "
            "the frame, centred. The paint mass is rich with material "
            "weight — multiple layered brush passes converging inward "
            "toward a brighter central concentration of pigment, with "
            "visible brush hairs, ridges of paint, layered colour "
            "variation, and small splatters along the perimeter. This is "
            "a FLAT painterly composition celebrating the paint material "
            "itself — NOT a 3D sphere, NOT a planet, NOT a ball, NOT a "
            "polished orb, NOT a marble. Edge breathing room: at least "
            "11% of pure black margin on every side."
        ),
    ),
    Monad(
        key="proposition-b",
        width=1024,
        height=1024,
        aspect_ratio="1:1",
        gesture=(
            "a substantive painterly paint passage occupying about 75% of "
            "the frame area — a sweeping diagonal mass of paint with a "
            "thick body and softly tapered ends, running from one corner "
            "toward the opposite corner. The mass shows rich brush motion "
            "across its length, layered pigment passes, ridges of paint, "
            "and small splatters trailing alongside it. This is a FLAT "
            "painterly composition with material thickness, NOT a closed "
            "ring, NOT a wreath, NOT a halo. Edge breathing room: at "
            "least 11% of pure black margin on every side."
        ),
    ),
    Monad(
        key="proposition-c",
        width=1024,
        height=1024,
        aspect_ratio="1:1",
        gesture=(
            "a substantive painterly paint passage occupying about 78% of "
            "the frame area — multiple horizontal paint streams stacked "
            "and woven across the centre of the frame, with visible "
            "material thickness, ridges of pigment, and shadowed recesses "
            "between layered passes. Rich brush motion across each "
            "stream, with the whole formation reading as a roughly "
            "horizontal lozenge of layered paint. Edge breathing room: "
            "at least 11% of pure black margin on every side."
        ),
    ),
    Monad(
        key="horizon-sweep",
        width=1920,
        height=320,
        aspect_ratio="21:9",
        gesture=(
            "a long horizontal paint passage spanning about 88% of the "
            "frame width, with sweeping rises and falls along its length "
            "— three or four soft cresting rises in the upper half and a "
            "slowly flowing trough in the lower half. The leftmost and "
            "rightmost ends taper softly to nothing well inside the "
            "frame, dissolving into pure black before reaching the side "
            "edges. The top and bottom bands of the frame are pure "
            "black. Material weight: visible brush motion, ridges of "
            "pigment, and rich pigment depth. Edge breathing room: at "
            "least 6% on left and right; at least 12% on top and bottom."
        ),
    ),
    Monad(
        key="held-note",
        width=768,
        height=1196,
        aspect_ratio="9:16",
        gesture=(
            "a substantive vertical paint passage descending through the "
            "centre of the tall frame, occupying about 50% of the frame "
            "width and 88% of the frame height. The passage starts as a "
            "thick mass at the top, swells to its widest in the middle, "
            "and tapers into a denser concentration with several falling "
            "droplets at the lower third. Material weight throughout — "
            "visible brush motion, ridges of pigment, layered colour "
            "play across the body of the column. Edge breathing room: at "
            "least 22% of pure black margin on left and right, 4% top, "
            "6% bottom."
        ),
    ),
    Monad(
        key="rising-bloom",
        width=896,
        height=1280,
        aspect_ratio="9:16",
        gesture=(
            "a substantive vertical paint passage filling the tall frame "
            "from the lower portion upward — a dense painterly mass "
            "anchored across the lower 40% of the frame, expanding "
            "upward through about 86% of the frame height. The mass is "
            "wide at the bottom and narrows as it rises, with rich "
            "layered brush passes, ridges of pigment, and material "
            "thickness throughout. The apex tapers into sparse painterly "
            "splatters; the base is substantial. Edge breathing room: at "
            "least 8% of pure black margin on every side."
        ),
    ),
)

MONAD_KEYS = tuple(m.key for m in MONADS)


def build_prompt(register: Register, monad: Monad) -> str:
    return register.preamble + monad.gesture + NEGATIVE_TAIL


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

def _read_env_local_fallback(name: str) -> str:
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


def _resolve_fal_key() -> str:
    return (
        os.environ.get("FAL_KEY", "").strip()
        or os.environ.get("FAL_API_KEY", "").strip()
        or _read_env_local_fallback("FAL_KEY")
        or _read_env_local_fallback("FAL_API_KEY")
    )


def _require_fal() -> None:
    if fal_client is None:
        print(
            "ERROR: fal-client is not installed. Run: pip install fal-client",
            file=sys.stderr,
        )
        sys.exit(1)
    key = _resolve_fal_key()
    if not key:
        print(
            "ERROR: FAL_KEY is not set. Add it to .env.local or export it. "
            "Pull the canonical value with:\n"
            "    firebase functions:secrets:access FAL_KEY\n",
            file=sys.stderr,
        )
        sys.exit(1)
    os.environ["FAL_KEY"] = key


# ---------------------------------------------------------------------------
# FAL helpers
# ---------------------------------------------------------------------------

def _on_queue(label: str):
    """Log queue updates from fal_client.subscribe() at moderate verbosity."""

    def cb(update):
        kind = type(update).__name__
        logs = getattr(update, "logs", None)
        if logs:
            last = logs[-1] if isinstance(logs, list) else None
            msg = last.get("message") if isinstance(last, dict) else None
            if msg:
                print(f"[{label}] {kind}: {msg}")
                return
        # Skip verbose InProgress pings — only log status transitions.
        if kind != "InProgress":
            print(f"[{label}] {kind}")

    return cb


def fal_generate(monad: Monad, register: Register) -> str:
    """Call KONTEXT with the register's reference image + monad gesture
    prompt. Returns the generated image URL."""
    label = f"{register.key}/{monad.key}"
    prompt = build_prompt(register, monad)

    arguments = {
        "prompt": prompt,
        "image_url": register.ref_url,
        "aspect_ratio": monad.aspect_ratio,
        "num_images": 1,
        "guidance_scale": 3.5,
        "safety_tolerance": "5",
        "output_format": "png",
    }

    print(f"[{label}] generating ({monad.aspect_ratio} via {GEN_MODEL})...")
    last_err: Exception | None = None
    for attempt in range(3):
        try:
            result = fal_client.subscribe(  # type: ignore[union-attr]
                GEN_MODEL,
                arguments=arguments,
                with_logs=True,
                on_queue_update=_on_queue(label),
            )
            images = result.get("images") or []
            if not images:
                raise RuntimeError(f"no images in result: {json.dumps(result)[:300]}")
            url = images[0].get("url")
            if not url:
                raise RuntimeError(f"no url in image: {json.dumps(images[0])[:300]}")
            return url
        except Exception as exc:  # broad: retry on any transient
            last_err = exc
            print(f"[{label}] gen attempt {attempt + 1} failed: {exc}")
            time.sleep(3 + attempt * 3)
    raise RuntimeError(f"[{label}] generation failed after 3 attempts: {last_err}")


# ---------------------------------------------------------------------------
# Local background removal (luminance → alpha)
# ---------------------------------------------------------------------------

# Chroma-aware alpha formula. Plain luminance-only was wiping deep navy
# (RGB ~(10,15,35), max=35) — making genuine dark-pigment paint pixels
# semi-transparent. This formula classifies a pixel as foreground if it
# has *either* meaningful brightness OR meaningful saturation: pure black
# (0,0,0) has neither and goes to alpha=0; dark navy is dim but chromatic
# and stays opaque.
#
#   paint_strength = max(luminance, chroma * CHROMA_GAIN)
#
# where luminance = max(R,G,B) and chroma = max(R,G,B) - min(R,G,B).
# A linear ramp between ALPHA_FLOOR and ALPHA_CEILING then gives the
# usual soft edge falloff.
ALPHA_FLOOR = 8.0
ALPHA_CEILING = 32.0
CHROMA_GAIN = 4.0

# Auto-crop keeps a narrow padding fraction so the saved PNG fits the
# actual paint extent — eliminates huge transparent bands at the top and
# bottom of wide-aspect outputs (the horizon-sweep "HUGE" problem).
AUTOCROP_PADDING_FRAC = 0.04
AUTOCROP_ALPHA_THRESHOLD = 8

# Edge-aware alpha feathering. KONTEXT often paints right up to the
# reference image's frame edges (the references themselves bleed off-
# frame as a stylistic property), and auto-crop preserves those edge-
# touching pixels at the new frame boundary — producing visible
# rectangular cuts that read as the paint sitting "inside an invisible
# container." This pass detects which edges actually have a cut (a row
# or column of opaque pixels at the boundary) and applies a graded
# alpha falloff only on those edges, so the cut becomes a smooth fade
# instead of a hard line. Edges that already have natural transparent
# falloff are left untouched.
FEATHER_FRAC = 0.07
FEATHER_EDGE_ALPHA_THRESHOLD = 80


def alpha_from_luminance(img_bytes: bytes, out_path: Path) -> int:
    """Convert an RGB PNG (pure-black background per prompt) into an RGBA
    PNG, with chroma-aware alpha + content-fitting crop. Deterministic;
    preserves interior negative-space pockets and saturated-dark paint
    pixels equally; trims empty margins to the paint's real extent."""
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    arr = np.array(img, dtype=np.uint8)
    return _save_with_threshold_alpha(arr, out_path)


def _compute_alpha(rgb: np.ndarray) -> np.ndarray:
    rgb_f = rgb.astype(np.float32)
    luminance = rgb_f.max(axis=-1)
    chroma = rgb_f.max(axis=-1) - rgb_f.min(axis=-1)
    paint_strength = np.maximum(luminance, chroma * CHROMA_GAIN)
    alpha = np.clip(
        (paint_strength - ALPHA_FLOOR) / (ALPHA_CEILING - ALPHA_FLOOR),
        0.0,
        1.0,
    ) * 255.0
    return alpha.astype(np.uint8)


def _autocrop_rgba(rgba: np.ndarray) -> np.ndarray:
    """Trim transparent margins, keeping a padding fraction of the
    original frame on every side."""
    h, w = rgba.shape[:2]
    visible = rgba[..., 3] > AUTOCROP_ALPHA_THRESHOLD
    rows = np.any(visible, axis=1)
    cols = np.any(visible, axis=0)
    if not rows.any() or not cols.any():
        return rgba
    rmin, rmax = int(np.argmax(rows)), h - int(np.argmax(rows[::-1]))
    cmin, cmax = int(np.argmax(cols)), w - int(np.argmax(cols[::-1]))
    pad_y = int(round(h * AUTOCROP_PADDING_FRAC))
    pad_x = int(round(w * AUTOCROP_PADDING_FRAC))
    rmin = max(0, rmin - pad_y)
    rmax = min(h, rmax + pad_y)
    cmin = max(0, cmin - pad_x)
    cmax = min(w, cmax + pad_x)
    return rgba[rmin:rmax, cmin:cmax]


def _apply_edge_feather(rgba: np.ndarray) -> np.ndarray:
    """Detect frame edges where paint reaches the boundary with high
    alpha (a hard cut) and apply a graded alpha falloff only on those
    edges. Edges that already have natural transparent falloff are
    left untouched."""
    h, w = rgba.shape[:2]
    if h < 4 or w < 4:
        return rgba

    alpha = rgba[..., 3]

    top_has_cut = bool((alpha[0, :] > FEATHER_EDGE_ALPHA_THRESHOLD).any())
    bottom_has_cut = bool((alpha[h - 1, :] > FEATHER_EDGE_ALPHA_THRESHOLD).any())
    left_has_cut = bool((alpha[:, 0] > FEATHER_EDGE_ALPHA_THRESHOLD).any())
    right_has_cut = bool((alpha[:, w - 1] > FEATHER_EDGE_ALPHA_THRESHOLD).any())

    if not (top_has_cut or bottom_has_cut or left_has_cut or right_has_cut):
        return rgba

    feather_y = max(2, int(round(h * FEATHER_FRAC)))
    feather_x = max(2, int(round(w * FEATHER_FRAC)))

    # Build per-axis falloff: 1.0 in the interior, ramping to 0 at the
    # cut edges only. Cosine ramp gives a perceptually smoother fade
    # than a linear one.
    y_mask = np.ones(h, dtype=np.float32)
    if top_has_cut:
        ramp = np.arange(feather_y, dtype=np.float32) / feather_y
        y_mask[:feather_y] = np.minimum(y_mask[:feather_y], ramp)
    if bottom_has_cut:
        ramp = np.arange(feather_y, dtype=np.float32)[::-1] / feather_y
        y_mask[-feather_y:] = np.minimum(y_mask[-feather_y:], ramp)

    x_mask = np.ones(w, dtype=np.float32)
    if left_has_cut:
        ramp = np.arange(feather_x, dtype=np.float32) / feather_x
        x_mask[:feather_x] = np.minimum(x_mask[:feather_x], ramp)
    if right_has_cut:
        ramp = np.arange(feather_x, dtype=np.float32)[::-1] / feather_x
        x_mask[-feather_x:] = np.minimum(x_mask[-feather_x:], ramp)

    # Cosine smoothing applied to each axis ramp.
    y_mask = 0.5 - 0.5 * np.cos(np.clip(y_mask, 0.0, 1.0) * np.pi)
    x_mask = 0.5 - 0.5 * np.cos(np.clip(x_mask, 0.0, 1.0) * np.pi)

    edge_mask = y_mask[:, None] * x_mask[None, :]
    new_alpha = alpha.astype(np.float32) * edge_mask

    rgba_out = rgba.copy()
    rgba_out[..., 3] = np.clip(new_alpha, 0.0, 255.0).astype(np.uint8)
    return rgba_out


def _save_with_threshold_alpha(
    rgb: np.ndarray,
    out_path: Path,
    *,
    autocrop: bool = True,
) -> int:
    alpha = _compute_alpha(rgb)
    rgba = np.dstack((rgb, alpha)).astype(np.uint8)
    if autocrop:
        rgba = _autocrop_rgba(rgba)
    rgba = _apply_edge_feather(rgba)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(rgba, mode="RGBA").save(out_path, format="PNG", optimize=True)
    return out_path.stat().st_size


def reprocess_existing(out_path: Path) -> int:
    """Re-derive alpha + re-feather for an existing RGBA PNG, keeping
    the underlying RGB untouched. Skips auto-crop because the existing
    file is already cropped — re-cropping would shrink the canvas a few
    percent every time you reprocess."""
    img = Image.open(out_path).convert("RGB")
    arr = np.array(img, dtype=np.uint8)
    return _save_with_threshold_alpha(arr, out_path, autocrop=False)


def _file_hash_short(path: Path) -> str:
    """8-char content hash for cache-busting on the client side."""
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(64 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()[:8]


def write_version_manifest() -> None:
    """Walk the two register output dirs and write a JSON of
    `<register>/<key>` → 8-char content hash so MonadFrame can append
    ?v=<hash> to image URLs for automatic cache-busting on regen."""
    manifest: dict[str, str] = {}
    for register in REGISTERS.values():
        if not register.out_dir.exists():
            continue
        for png in sorted(register.out_dir.glob("*.png")):
            key = f"{register.key}/{png.stem}"
            manifest[key] = _file_hash_short(png)
    VERSION_MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    VERSION_MANIFEST_PATH.write_text(
        json.dumps(manifest, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    print(f"\nWrote version manifest: {VERSION_MANIFEST_PATH.relative_to(ROOT)} "
          f"({len(manifest)} entries)")


def download_bytes(url: str, label: str) -> bytes:
    last_err: Exception | None = None
    for attempt in range(3):
        try:
            r = requests.get(url, timeout=180)
            r.raise_for_status()
            return r.content
        except Exception as exc:
            last_err = exc
            print(f"[{label}] download attempt {attempt + 1} failed: {exc}")
            time.sleep(2 + attempt * 2)
    raise RuntimeError(f"[{label}] download failed after 3 attempts: {last_err}")


# ---------------------------------------------------------------------------
# Orchestration
# ---------------------------------------------------------------------------

def generate_one(monad: Monad, register: Register, force: set[str]) -> tuple[str, bool, str]:
    label = f"{register.key}/{monad.key}"
    out_path = register.out_dir / f"{monad.key}.png"

    if out_path.exists() and monad.key not in force:
        size_kb = out_path.stat().st_size / 1024
        return label, True, f"skip (exists, {size_kb:.1f}KB)"

    try:
        gen_url = fal_generate(monad, register)
        raw = download_bytes(gen_url, label)
        size_bytes = alpha_from_luminance(raw, out_path)
        rel = out_path.relative_to(ROOT)
        return label, True, f"saved {rel} ({size_bytes / 1024:.1f}KB)"
    except Exception as exc:
        return label, False, f"exception: {exc}"


def run(
    register_keys: Iterable[str],
    monad_keys: Iterable[str],
    force: set[str],
    dry_run: bool,
    max_workers: int,
) -> int:
    selected_registers = [REGISTERS[k] for k in register_keys]
    selected_monads = [m for m in MONADS if m.key in set(monad_keys)]

    plan = []
    for r in selected_registers:
        plan.append(
            {
                "register": r.key,
                "ref_url": r.ref_url,
                "out_dir": str(r.out_dir.relative_to(ROOT)),
                "monads": [
                    {
                        "key": m.key,
                        "aspect": m.aspect_ratio,
                        "exists": (r.out_dir / f"{m.key}.png").exists(),
                        "force": m.key in force,
                    }
                    for m in selected_monads
                ],
            }
        )

    print("FAL generation plan:")
    print(json.dumps(plan, indent=2))

    if dry_run:
        print("\n--dry-run: not generating anything.")
        return 0

    _require_fal()

    for r in selected_registers:
        r.out_dir.mkdir(parents=True, exist_ok=True)

    jobs: list[tuple[Monad, Register]] = [
        (m, r) for r in selected_registers for m in selected_monads
    ]

    print(f"\nDispatching {len(jobs)} job(s) at concurrency={max_workers}...\n")
    failures = 0
    results: list[tuple[str, bool, str]] = []
    with ThreadPoolExecutor(max_workers=max_workers) as pool:
        futures = {pool.submit(generate_one, m, r, force): (m, r) for (m, r) in jobs}
        for fut in as_completed(futures):
            result = fut.result()
            results.append(result)
            label, ok, msg = result
            marker = "OK  " if ok else "FAIL"
            print(f"{marker}  {label}  --  {msg}")

    print("\n=== Summary ===")
    for label, ok, msg in sorted(results):
        marker = "OK  " if ok else "FAIL"
        print(f"{marker}  {label}  --  {msg}")
        if not ok:
            failures += 1

    write_version_manifest()
    return 1 if failures else 0


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument(
        "--register",
        choices=sorted(REGISTERS.keys()),
        action="append",
        help="Limit to one register (repeat to select multiple). Default: both.",
    )
    p.add_argument(
        "--only",
        nargs="+",
        choices=MONAD_KEYS,
        help="Only generate the named monad keys.",
    )
    p.add_argument(
        "--force",
        nargs="+",
        default=[],
        choices=MONAD_KEYS,
        help="Force regeneration of these monad keys even if files exist.",
    )
    p.add_argument(
        "--workers",
        type=int,
        default=4,
        help="Parallelism (default 4).",
    )
    p.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the generation plan and exit without calling the API.",
    )
    p.add_argument(
        "--reprocess",
        action="store_true",
        help=(
            "Re-derive alpha for existing PNGs on disk using the current "
            "formula (no FAL calls). Use after tweaking ALPHA_FLOOR / "
            "ALPHA_CEILING to refresh outputs without spending credits."
        ),
    )
    return p.parse_args()


def reprocess_run(register_keys: Iterable[str], monad_keys: Iterable[str]) -> int:
    selected_registers = [REGISTERS[k] for k in register_keys]
    selected_keys = set(monad_keys)
    failures = 0
    touched = 0
    for r in selected_registers:
        for m in MONADS:
            if m.key not in selected_keys:
                continue
            p = r.out_dir / f"{m.key}.png"
            if not p.exists():
                continue
            try:
                size = reprocess_existing(p)
                print(f"OK    {r.key}/{m.key}  --  reprocessed ({size / 1024:.1f}KB)")
                touched += 1
            except Exception as exc:
                print(f"FAIL  {r.key}/{m.key}  --  {exc}")
                failures += 1
    print(f"\nReprocessed {touched} file(s); {failures} failure(s).")
    write_version_manifest()
    return 1 if failures else 0


def main() -> int:
    args = parse_args()
    register_keys = args.register or sorted(REGISTERS.keys())
    monad_keys = args.only or list(MONAD_KEYS)
    if args.reprocess:
        return reprocess_run(register_keys, monad_keys)
    return run(
        register_keys=register_keys,
        monad_keys=monad_keys,
        force=set(args.force),
        dry_run=args.dry_run,
        max_workers=max(1, args.workers),
    )


if __name__ == "__main__":
    sys.exit(main())
