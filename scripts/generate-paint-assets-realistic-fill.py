"""
Fill the realistic style coverage gap. The brand style already has
waveHorizon, bloomCorner, strokeSweep, and bloomRight — we need
realistic-style counterparts so the in-app toggle has parity.

Idempotency: if {name}-A.png already exists on disk, the asset is
skipped (no FAL credits burned). Delete the file to force regeneration.

Pipeline per asset:
  1. POST to fal-ai/flux-pro/v1.1-ultra (sync, no style ref).
  2. POST returned URL to fal-ai/bria/background/remove.
  3. Download to public/brand/paint/{name}-A.png.
"""

from __future__ import annotations

import os
import sys
import time
import json
import shutil
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import requests


FAL_KEY = os.environ.get("FAL_KEY", "").strip()
if not FAL_KEY:
    print("ERROR: FAL_KEY env var is not set.", file=sys.stderr)
    sys.exit(1)


GEN_ENDPOINT = "https://fal.run/fal-ai/flux-pro/v1.1-ultra"
BG_ENDPOINT = "https://fal.run/fal-ai/bria/background/remove"
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "public" / "brand" / "paint"


# Realistic register: photographic high-pigment paint with dramatic
# splash energy, brighter cyan highlights, more chromatic detail than
# the brand mid-air style.
STYLE_SUFFIX = (
    "Photographic high-pigment oil paint with visible brush hairs, "
    "fluid drips, and dramatic foam edges. Deep petrol teal hex "
    "0F4C5C is the dominant 80%+ of the composition with luminous "
    "teal-cyan highlights and subtle warm rust hex C46A3A embers as "
    "accents. Pure black background. No text, no logos, no figurative "
    "imagery, no human figures, no objects."
)


# Each entry: (filename, fal aspect_ratio, prompt body).
ASSETS = [
    (
        "wave-horizon-A.png",
        "21:9",
        (
            "A horizontal flowing oil-paint wave sweeping across the "
            "frame, with a centred dense band of paint and soft "
            "tapered foam droplets fading toward the left and right "
            "edges. The composition fills the central 80% horizontally "
            "with the corners empty. " + STYLE_SUFFIX
        ),
    ),
    (
        "bloom-corner-A.png",
        "5:4",
        (
            "An oil-paint bloom emerging from the bottom-left corner "
            "of the frame, dense paint anchored at the bottom-left "
            "fanning UP-AND-TO-THE-RIGHT with elegant tendrils and "
            "splatters. The bottom-left 50% is dense paint; the "
            "upper-right 50% has only soft trailing tendrils that "
            "fade to empty space. " + STYLE_SUFFIX
        ),
    ),
    (
        "stroke-sweep-A.png",
        "5:4",
        (
            "A short decisive oil-paint sweep emerging from the "
            "bottom-left corner of the frame and curving gently up "
            "and to the right, like a single confident brush flick. "
            "The bottom-left 60% holds the paint; the rest of the "
            "frame is empty. " + STYLE_SUFFIX
        ),
    ),
    (
        "bloom-right-A.png",
        "16:9",
        (
            "A large oil-paint bloom anchored on the RIGHT side of "
            "the frame, with dense paint on the right edge and "
            "tendrils, drips, and splatters fanning LEFT into the "
            "frame's middle. The right 60% is dense paint; the left "
            "40% has only soft trailing tendrils. " + STYLE_SUFFIX
        ),
    ),
    (
        "pigment-dust-A.png",
        "16:9",
        (
            "An atmospheric cloud of dispersed pigment particles in deep "
            "petrol teal — no defined edge, no contour, just diffuse paint "
            "dust suspended in air with extremely soft tonal gradient from "
            "centre out to fully transparent. The dust occupies the central "
            "70% horizontally with intensity peaking around the lower-mid "
            "frame and feathering outward into empty space. NO splashes, NO "
            "droplets, NO motion lines — pure atmospheric diffusion only. "
            + STYLE_SUFFIX
        ),
    ),
    (
        "vertical-droplet-A.png",
        "9:16",
        (
            "A single thin vertical column of liquid paint trickling "
            "straight down through the centre of a vertically-tall frame, "
            "like paint dripped from above the canvas. Tapered at the top, "
            "beading at the bottom into a small puddle, with one or two "
            "minor side droplets. The column occupies the central 30% "
            "horizontally; the rest of the frame is empty space. "
            + STYLE_SUFFIX
        ),
    ),
]


def _fal_post(url: str, payload: dict, label: str) -> dict:
    headers = {
        "Authorization": f"Key {FAL_KEY}",
        "Content-Type": "application/json",
    }
    last_err = None
    for attempt in range(3):
        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=240)
            if resp.ok:
                return resp.json()
            last_err = f"status={resp.status_code} body={resp.text[:300]}"
            print(f"[{label}] attempt {attempt + 1} failed: {last_err}")
        except Exception as exc:
            last_err = str(exc)
            print(f"[{label}] attempt {attempt + 1} error: {last_err}")
        time.sleep(2 + attempt * 2)
    raise RuntimeError(f"FAL POST {url} failed: {last_err}")


def generate_one(filename: str, aspect_ratio: str, prompt: str) -> tuple[str, bool, str]:
    label = filename.replace(".png", "")
    out_path = OUTPUT_DIR / filename

    if out_path.exists():
        size_kb = out_path.stat().st_size / 1024
        return filename, True, f"skip (exists, {size_kb:.1f}KB)"

    try:
        print(f"[{label}] generating (aspect={aspect_ratio})...")
        gen = _fal_post(
            GEN_ENDPOINT,
            {
                "prompt": prompt,
                "aspect_ratio": aspect_ratio,
                "num_images": 1,
                "enable_safety_checker": True,
                "safety_tolerance": "5",
                "output_format": "png",
                "raw": False,
            },
            label=f"{label}/gen",
        )
        gen_url = (gen.get("images") or [{}])[0].get("url")
        if not gen_url:
            return filename, False, f"no url in gen: {json.dumps(gen)[:300]}"
        print(f"[{label}] gen ok -> {gen_url}")

        print(f"[{label}] bg removal...")
        bg = _fal_post(
            BG_ENDPOINT,
            {"image_url": gen_url},
            label=f"{label}/bg",
        )
        bg_url = (bg.get("image") or {}).get("url")
        if not bg_url:
            return filename, False, f"no url in bg: {json.dumps(bg)[:300]}"
        print(f"[{label}] bg ok -> {bg_url}")

        print(f"[{label}] downloading...")
        with requests.get(bg_url, stream=True, timeout=120) as r:
            r.raise_for_status()
            with open(out_path, "wb") as fh:
                shutil.copyfileobj(r.raw, fh)
        size_kb = out_path.stat().st_size / 1024
        print(f"[{label}] saved {filename} ({size_kb:.1f} KB)")
        return filename, True, f"saved {size_kb:.1f}KB"
    except Exception as exc:
        return filename, False, f"exception: {exc}"


def main() -> int:
    print(f"Output dir: {OUTPUT_DIR}")
    print(f"Generating {len(ASSETS)} realistic-fill assets in parallel...\n")

    with ThreadPoolExecutor(max_workers=4) as pool:
        futures = {
            pool.submit(generate_one, fn, ar, pr): fn
            for fn, ar, pr in ASSETS
        }
        results = [fut.result() for fut in as_completed(futures)]

    print("\n=== Summary ===")
    failed = 0
    for filename, ok, msg in sorted(results):
        marker = "OK " if ok else "FAIL"
        print(f"{marker}  {filename}  --  {msg}")
        if not ok:
            failed += 1
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
