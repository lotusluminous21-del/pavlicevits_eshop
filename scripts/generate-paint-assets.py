"""
Generate the 5 custom paint assets for the homepage redesign via FAL.ai.

Pipeline per asset:
  1. Submit prompt to fal-ai/flux-pro/v1.1-ultra (sync endpoint).
  2. Submit returned image URL to fal-ai/bria/background/remove.
  3. Download the bg-removed PNG to public/brand/paint/.

Run:
  FAL_KEY=... python scripts/generate-paint-assets.py
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
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


# Universal style prefix appended to every prompt — keeps the assets in
# the same painterly oil-paint register and the petrol palette
# consistent across all 5 outputs.
STYLE_SUFFIX = (
    "Painterly oil-paint texture with visible brush hairs, fluid drips, "
    "and natural alpha falloff at the edges of the paint. Deep petrol "
    "teal hex 0F4C5C is the dominant 80%+ of the composition with "
    "luminous teal-cyan highlights and subtle warm rust hex C46A3A "
    "embers as accents. Pure black background. No text, no logos, no "
    "figurative imagery, no human figures, no objects."
)


# Each entry: (filename, fal aspect_ratio, prompt body)
ASSETS = [
    (
        "hero-centerpiece.png",
        "16:9",
        (
            "A single decisive oil-paint brushstroke arc sweeping "
            "left-to-right across the frame, dramatic and confident, "
            "soft luminous foam halo at the stroke's leading edge. "
            "The arc occupies the central 70% of the frame with the "
            "four corners empty. " + STYLE_SUFFIX
        ),
    ),
    (
        "wave-pool.png",
        "21:9",
        (
            "A wide low horizontal pool of flowing oil paint with "
            "crests rising from the bottom edge and whitewater foam "
            "highlights, fluid wave-pool motion as if paint were "
            "settling in a tray. The lower 60% of the frame is dense "
            "paint with crests and ripples; the upper 40% is empty. "
            + STYLE_SUFFIX
        ),
    ),
    (
        "vortex-orbital.png",
        "16:9",
        (
            "A horizontally elongated rotational oil-paint composition "
            "with a CLEAR LOW-DENSITY EMPTY CENTER (a soft empty eye "
            "in the middle), with paint tendrils swirling around the "
            "perimeter, fluid as if paint were spinning around a still "
            "center. The central 40% of the frame is empty; the "
            "surrounding 60% is dense rotational paint motion with "
            "soft falloff at the outer edges. " + STYLE_SUFFIX
        ),
    ),
    (
        "stroke-diagonal.png",
        "21:9",
        (
            "A single decisive oil-paint brushstroke cutting diagonally "
            "across the frame from bottom-left to top-right at "
            "approximately 20 to 25 degrees, soft tapered ends. The "
            "stroke occupies a diagonal band roughly 35% of the "
            "frame's width; the four corners are empty. " + STYLE_SUFFIX
        ),
    ),
    (
        "flourish-corner-bottomleft.png",
        "4:3",
        (
            "A large flowing oil-paint flourish emerging from the "
            "bottom-left corner of the frame, dense paint anchored "
            "at the bottom-left with elegant tendrils, drips, and "
            "ribbons fanning UP-AND-TO-THE-RIGHT into the frame's "
            "upper-middle area. The bottom-left 50% is dense paint "
            "with intricate brush motion; the upper-right 50% has "
            "only soft trailing tendrils that fade into emptiness. "
            + STYLE_SUFFIX
        ),
    ),
]


def _fal_post(url: str, payload: dict, attempt_label: str) -> dict:
    """POST to FAL with retry. Returns parsed JSON response."""
    headers = {
        "Authorization": f"Key {FAL_KEY}",
        "Content-Type": "application/json",
    }
    last_err = None
    for attempt in range(3):
        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=180)
            if resp.ok:
                return resp.json()
            last_err = f"status={resp.status_code} body={resp.text[:300]}"
            print(f"[{attempt_label}] attempt {attempt + 1} failed: {last_err}")
        except Exception as exc:
            last_err = str(exc)
            print(f"[{attempt_label}] attempt {attempt + 1} error: {last_err}")
        time.sleep(2 + attempt * 2)
    raise RuntimeError(f"FAL POST {url} failed after 3 attempts: {last_err}")


def generate_one(filename: str, aspect_ratio: str, prompt: str) -> tuple[str, bool, str]:
    """Generate, BG-remove, download. Returns (filename, ok, message)."""
    label = filename.replace(".png", "")
    out_path = OUTPUT_DIR / filename

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
            attempt_label=f"{label}/gen",
        )
        images = gen.get("images") or []
        if not images:
            return filename, False, f"no images in gen response: {json.dumps(gen)[:300]}"
        gen_url = images[0].get("url")
        if not gen_url:
            return filename, False, f"no url in gen response: {json.dumps(images[0])[:300]}"
        print(f"[{label}] gen ok -> {gen_url}")

        print(f"[{label}] bg removal...")
        bg = _fal_post(
            BG_ENDPOINT,
            {"image_url": gen_url},
            attempt_label=f"{label}/bg",
        )
        bg_url = (bg.get("image") or {}).get("url")
        if not bg_url:
            return filename, False, f"no url in bg response: {json.dumps(bg)[:300]}"
        print(f"[{label}] bg ok -> {bg_url}")

        print(f"[{label}] downloading...")
        with requests.get(bg_url, stream=True, timeout=120) as r:
            r.raise_for_status()
            with open(out_path, "wb") as fh:
                shutil.copyfileobj(r.raw, fh)
        size_kb = out_path.stat().st_size / 1024
        print(f"[{label}] saved {out_path} ({size_kb:.1f} KB)")
        return filename, True, f"saved {size_kb:.1f}KB"
    except Exception as exc:
        return filename, False, f"exception: {exc}"


def main() -> int:
    print(f"Output dir: {OUTPUT_DIR}")
    print(f"Generating {len(ASSETS)} paint assets in parallel...\n")

    with ThreadPoolExecutor(max_workers=5) as pool:
        futures = {
            pool.submit(generate_one, fn, ar, pr): fn
            for fn, ar, pr in ASSETS
        }
        results = []
        for fut in as_completed(futures):
            results.append(fut.result())

    print("\n=== Summary ===")
    failed = 0
    for filename, ok, msg in sorted(results):
        marker = "OK " if ok else "FAIL"
        print(f"{marker}  {filename}  —  {msg}")
        if not ok:
            failed += 1
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
