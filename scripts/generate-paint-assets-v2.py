"""
Generate Set B of the homepage paint assets. Most are derived from
public/brand/paint/wave-horizon.png as the visual style reference (via
FAL's Flux Kontext model, which preserves visual style while accepting
strong compositional edits from the prompt). A small number of new
motifs whose composition is too far from the wave reference are
generated ref-free via flux-pro/v1.1-ultra with the same petrol-paint
style directives in-prompt.

Set A (the original 5 generations) is NOT touched — Set B writes to
*-v2.png filenames so both sets coexist in public/brand/paint/.

Idempotency: if {name}-v2.png already exists on disk, the asset is
skipped (no FAL credits burned). Delete the file to force regeneration.

Pipeline per asset:
  1. (kontext path) Upload reference waveHorizon to FAL storage once
     (cached). Call fal-ai/flux-pro/kontext with reference + prompt.
     OR (t2i path) Call fal-ai/flux-pro/v1.1-ultra with prompt only.
  2. Pass the result through fal-ai/bria/background/remove.
  3. Download to public/brand/paint/{name}-v2.png.

Run:
  FAL_KEY=... python scripts/generate-paint-assets-v2.py
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

# Flux Kontext — style-preserving image editor with strong prompt steering.
EDIT_ENDPOINT = "https://fal.run/fal-ai/flux-pro/kontext"
# Flux v1.1-ultra — ref-free t2i, used for compositions where the wave
# reference would be visually hostile (e.g. vertical motion).
T2I_ENDPOINT = "https://fal.run/fal-ai/flux-pro/v1.1-ultra"
BG_ENDPOINT = "https://fal.run/fal-ai/bria/background/remove"
UPLOAD_ENDPOINT = "https://rest.alpha.fal.ai/storage/upload/initiate"

ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = ROOT / "public" / "brand" / "paint"
REFERENCE_PATH = OUTPUT_DIR / "wave-horizon.png"

if not REFERENCE_PATH.exists():
    print(f"ERROR: Reference {REFERENCE_PATH} not found.", file=sys.stderr)
    sys.exit(1)


# Style instruction shared by every prompt — articulates the visual
# register of waveHorizon explicitly so Kontext respects the painterly
# oil-paint aesthetic and petrol palette while transforming the
# composition. Putting this up front is crucial: Kontext follows the
# leading directives most strictly.
STYLE_PREAMBLE = (
    "Preserving the EXACT painterly mid-air oil-paint aesthetic of "
    "this reference image — deep petrol teal pigment with navy and "
    "indigo darks, white droplets and splatters around the perimeter, "
    "fluid liquid-paint motion, transparent background, no canvas, no "
    "frame, the paint floating in empty space — redraw the composition as: "
)


# Each entry: (filename stem, fal aspect_ratio, composition description,
#   reference). reference="wave-horizon" routes through Kontext using the
#   uploaded wave-horizon.png; reference=None routes through t2i v1.1-ultra
#   with no image_url (used when the wave reference's horizontal motion
#   would fight the target composition).
ASSETS = [
    (
        "hero-centerpiece",
        "16:9",
        (
            "A single decisive paint-splash arc sweeping left-to-right "
            "across the centre of the frame, occupying the central 70% "
            "with the four corners empty. One sweeping confident motion "
            "instead of the reference's clustered gesture."
        ),
        "wave-horizon",
    ),
    (
        "wave-pool",
        "21:9",
        (
            "A wide low horizontal pool of paint anchored along the "
            "bottom edge of the frame with crests and droplets rising "
            "from below. The lower 60% of the frame is dense paint with "
            "crests; the upper 40% is empty space."
        ),
        "wave-horizon",
    ),
    (
        "vortex-orbital",
        "16:9",
        (
            "A horizontally elongated rotational paint vortex with a "
            "CLEAR EMPTY CENTRE — the central 40% of the frame is empty "
            "transparent space with the paint forming a ring of swirling "
            "tendrils and droplets around the perimeter. Like paint "
            "spinning around a still empty eye."
        ),
        "wave-horizon",
    ),
    (
        "stroke-diagonal",
        "21:9",
        (
            "A single diagonal paint-splash sweep cutting from the "
            "bottom-left corner to the top-right corner at approximately "
            "20-25 degrees. Tapered ends, clear diagonal axis. The four "
            "corners outside the diagonal band are empty."
        ),
        "wave-horizon",
    ),
    (
        "flourish-corner-bottomleft",
        "4:3",
        (
            "A large flowing paint flourish anchored at the BOTTOM-LEFT "
            "corner of the frame, with dense paint in the lower-left and "
            "elegant tendrils, drips, and splatters fanning UP-AND-TO-THE"
            "-RIGHT into the upper-middle area. The bottom-left 50% is "
            "dense paint; the upper-right 50% has only soft trailing "
            "tendrils that fade to empty space."
        ),
        "wave-horizon",
    ),
    (
        "pigment-dust",
        "16:9",
        (
            "An atmospheric cloud of dispersed pigment particles in deep "
            "petrol teal — no defined edge, no contour, just diffuse paint "
            "dust suspended in air with extremely soft tonal gradient from "
            "centre out to fully transparent. The dust occupies the central "
            "70% horizontally with intensity peaking around the lower-mid "
            "frame and feathering outward into empty space. NO splashes, NO "
            "droplets, NO motion lines — pure atmospheric diffusion only."
        ),
        "wave-horizon",
    ),
    (
        "vertical-droplet",
        "9:16",
        (
            "A single thin vertical column of liquid paint trickling "
            "straight down through the centre of a vertically-tall frame, "
            "like paint dripped from above the canvas. Tapered at the top, "
            "beading at the bottom into a small puddle, with one or two "
            "minor side droplets. The column occupies the central 30% "
            "horizontally; the rest of the frame is empty space."
        ),
        None,
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
    raise RuntimeError(f"FAL POST {url} failed after 3 attempts: {last_err}")


def upload_reference() -> str:
    """Upload waveHorizon to FAL storage, return the access URL."""
    print(f"Uploading reference {REFERENCE_PATH.name} to FAL storage...")
    headers = {"Authorization": f"Key {FAL_KEY}", "Content-Type": "application/json"}
    init = requests.post(
        UPLOAD_ENDPOINT,
        headers=headers,
        json={
            "file_name": REFERENCE_PATH.name,
            "content_type": "image/png",
        },
        timeout=60,
    )
    init.raise_for_status()
    data = init.json()
    upload_url = data["upload_url"]
    file_url = data["file_url"]

    with open(REFERENCE_PATH, "rb") as fh:
        put = requests.put(
            upload_url,
            data=fh,
            headers={"Content-Type": "image/png"},
            timeout=120,
        )
    put.raise_for_status()
    print(f"Uploaded -> {file_url}")
    return file_url


def generate_one(
    stem: str,
    aspect_ratio: str,
    composition: str,
    reference: str | None,
    ref_url: str | None,
) -> tuple[str, bool, str]:
    label = stem
    out_path = OUTPUT_DIR / f"{stem}-v2.png"

    if out_path.exists():
        size_kb = out_path.stat().st_size / 1024
        return out_path.name, True, f"skip (exists, {size_kb:.1f}KB)"

    full_prompt = STYLE_PREAMBLE + composition

    try:
        if reference is not None:
            if ref_url is None:
                return out_path.name, False, "kontext path requested but ref_url missing"
            print(f"[{label}] kontext edit (aspect={aspect_ratio})...")
            gen = _fal_post(
                EDIT_ENDPOINT,
                {
                    "prompt": full_prompt,
                    "image_url": ref_url,
                    "aspect_ratio": aspect_ratio,
                    "num_images": 1,
                    "output_format": "png",
                    "guidance_scale": 4.5,
                    "safety_tolerance": "5",
                },
                label=f"{label}/edit",
            )
        else:
            print(f"[{label}] t2i v1.1-ultra (aspect={aspect_ratio})...")
            gen = _fal_post(
                T2I_ENDPOINT,
                {
                    "prompt": full_prompt,
                    "aspect_ratio": aspect_ratio,
                    "num_images": 1,
                    "output_format": "png",
                    "enable_safety_checker": True,
                    "safety_tolerance": "5",
                    "raw": False,
                },
                label=f"{label}/gen",
            )

        images = gen.get("images") or []
        if not images:
            return out_path.name, False, f"no images: {json.dumps(gen)[:300]}"
        gen_url = images[0].get("url")
        if not gen_url:
            return out_path.name, False, f"no url: {json.dumps(images[0])[:300]}"
        print(f"[{label}] gen ok -> {gen_url}")

        print(f"[{label}] bg removal...")
        bg = _fal_post(
            BG_ENDPOINT,
            {"image_url": gen_url},
            label=f"{label}/bg",
        )
        bg_url = (bg.get("image") or {}).get("url")
        if not bg_url:
            return out_path.name, False, f"no bg url: {json.dumps(bg)[:300]}"
        print(f"[{label}] bg ok -> {bg_url}")

        print(f"[{label}] downloading...")
        with requests.get(bg_url, stream=True, timeout=120) as r:
            r.raise_for_status()
            with open(out_path, "wb") as fh:
                shutil.copyfileobj(r.raw, fh)
        size_kb = out_path.stat().st_size / 1024
        print(f"[{label}] saved {out_path.name} ({size_kb:.1f} KB)")
        return out_path.name, True, f"saved {size_kb:.1f}KB"
    except Exception as exc:
        return out_path.name, False, f"exception: {exc}"


def main() -> int:
    print(f"Output dir: {OUTPUT_DIR}")

    # Only upload the wave reference if at least one asset still needs
    # the kontext path AND the file isn't already on disk. Skips the
    # upload when re-running to fill in only ref-free additions.
    needs_ref = any(
        ref == "wave-horizon" and not (OUTPUT_DIR / f"{stem}-v2.png").exists()
        for stem, _ar, _comp, ref in ASSETS
    )
    ref_url = upload_reference() if needs_ref else None

    print(f"\nGenerating {len(ASSETS)} v2 assets in parallel...\n")

    with ThreadPoolExecutor(max_workers=5) as pool:
        futures = {
            pool.submit(generate_one, stem, ar, comp, ref, ref_url): stem
            for stem, ar, comp, ref in ASSETS
        }
        results = []
        for fut in as_completed(futures):
            results.append(fut.result())

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
