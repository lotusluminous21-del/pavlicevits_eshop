"""
Upscale paint monad PNGs via FAL and convert to optimized WebP.

Why both: 2× upscale gives the source enough resolution for retina
displays (Next.js Image will downsample as needed); WebP at quality 92
+ method 6 gives 60-70% smaller files than PNG with no perceptible
quality loss, and supports alpha natively.

Why split RGB / alpha: FAL upscalers (clarity-upscaler, aura-sr, etc.)
operate on RGB only — they do not preserve alpha channels. Sending an
RGBA PNG either drops the alpha or composites it onto an opaque
background. So the workflow per image is:

  1. Open RGBA -> split into RGB (composited on black) and alpha (mode L).
  2. Save the RGB temporarily and upload to FAL.
  3. FAL clarity-upscaler returns a 2× upscaled RGB image.
  4. Locally upscale the original alpha channel 2× via Lanczos
     (high-quality grayscale resampling — alpha doesn't need an AI
     upscaler, and this avoids any FAL noise touching the mask).
  5. Combine upscaled RGB + upscaled alpha -> encode as WebP.

After the WebP is written, the manifest gets refreshed via the shared
`write_version_manifest()`, scanning .webp files (now that they're the
canonical source).

Usage:
  python scripts/upscale-and-webp.py
  python scripts/upscale-and-webp.py --register vortex-orbital
  python scripts/upscale-and-webp.py --only arrival-anchor held-note
  python scripts/upscale-and-webp.py --force            # overwrite existing
  python scripts/upscale-and-webp.py --dry-run
  python scripts/upscale-and-webp.py --workers 2
"""

from __future__ import annotations

import argparse
import importlib.util
import io
import json
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import requests
from PIL import Image

import fal_client


_HERE = Path(__file__).resolve().parent
_MAIN_PATH = _HERE / "generate-paint-assets-fal.py"
_spec = importlib.util.spec_from_file_location("paint_pipeline", _MAIN_PATH)
assert _spec is not None and _spec.loader is not None
_pipeline = importlib.util.module_from_spec(_spec)
sys.modules["paint_pipeline"] = _pipeline
_spec.loader.exec_module(_pipeline)


# fal-ai/clarity-upscaler — the most reliable general-purpose 2×/4×
# upscaler on FAL. Returns PNG. RGB only (alpha handled locally below).
UPSCALE_MODEL = "fal-ai/clarity-upscaler"
SCALE_FACTOR = 2

# WebP encoding: lossy at q=92 for RGB (no perceptible quality loss vs
# source) + alpha_quality=100 to keep the alpha mask pristine. method=6
# is the slowest / best-compression encoder mode.
WEBP_QUALITY = 92
WEBP_ALPHA_QUALITY = 100
WEBP_METHOD = 6


def _on_queue(label: str):
    """Mirror of the pipeline's queue logger but quieter."""

    def cb(update):
        kind = type(update).__name__
        if kind != "InProgress":
            print(f"[{label}] {kind}")

    return cb


def upscale_rgb(rgb_bytes: bytes, label: str) -> bytes:
    """Upload an RGB image to FAL clarity-upscaler, return the
    upscaled PNG bytes. Retries on transient failures."""
    last_err: Exception | None = None
    for attempt in range(3):
        try:
            # fal_client.upload bytes-like via temp upload: write to
            # bytes buffer and stream as file.
            ref_url = fal_client.upload(rgb_bytes, "image/png")
            result = fal_client.subscribe(
                UPSCALE_MODEL,
                arguments={
                    "image_url": ref_url,
                    "scale_factor": SCALE_FACTOR,
                },
                with_logs=True,
                on_queue_update=_on_queue(label),
            )
            image_obj = result.get("image") or {}
            url = image_obj.get("url")
            if not url:
                raise RuntimeError(
                    f"no image.url in result: {json.dumps(result)[:300]}"
                )
            return _pipeline.download_bytes(url, label)
        except Exception as exc:
            last_err = exc
            print(f"[{label}] upscale attempt {attempt + 1} failed: {exc}")
            time.sleep(3 + attempt * 3)
    raise RuntimeError(f"[{label}] upscale failed after 3 attempts: {last_err}")


def process_one(png_path: Path, force: bool) -> tuple[str, bool, str]:
    """Upscale + WebP-encode one PNG, return (label, ok, message)."""
    label = f"{png_path.parent.name}/{png_path.stem}"
    webp_path = png_path.with_suffix(".webp")

    if webp_path.exists() and not force:
        size_kb = webp_path.stat().st_size / 1024
        return label, True, f"skip (exists, {size_kb:.1f}KB)"

    try:
        # 1. Open RGBA, split RGB / alpha.
        img = Image.open(png_path).convert("RGBA")
        original_w, original_h = img.size
        rgb_only = Image.new("RGB", img.size, (0, 0, 0))
        rgb_only.paste(img, mask=img.split()[3])  # composite on black via alpha
        alpha = img.split()[3]  # mode L

        # 2. Encode RGB to bytes for upload.
        rgb_buf = io.BytesIO()
        rgb_only.save(rgb_buf, format="PNG", optimize=False)
        rgb_bytes = rgb_buf.getvalue()

        # 3. Upscale via FAL.
        print(f"[{label}] upscaling {original_w}x{original_h} -> "
              f"{original_w * SCALE_FACTOR}x{original_h * SCALE_FACTOR}...")
        upscaled_rgb_bytes = upscale_rgb(rgb_bytes, label)

        # 4. Open upscaled RGB. Resize alpha to match.
        upscaled_rgb = Image.open(io.BytesIO(upscaled_rgb_bytes)).convert("RGB")
        upscaled_w, upscaled_h = upscaled_rgb.size
        upscaled_alpha = alpha.resize(
            (upscaled_w, upscaled_h),
            Image.Resampling.LANCZOS,
        )

        # 5. Combine and encode WebP.
        r, g, b = upscaled_rgb.split()
        upscaled_rgba = Image.merge("RGBA", (r, g, b, upscaled_alpha))
        upscaled_rgba.save(
            webp_path,
            format="WEBP",
            quality=WEBP_QUALITY,
            alpha_quality=WEBP_ALPHA_QUALITY,
            method=WEBP_METHOD,
            exact=True,
        )

        size_kb = webp_path.stat().st_size / 1024
        png_kb = png_path.stat().st_size / 1024
        savings = (1 - size_kb / png_kb) * 100 if png_kb else 0
        return (
            label,
            True,
            f"saved {webp_path.relative_to(_pipeline.ROOT)} "
            f"({upscaled_w}x{upscaled_h}, {size_kb:.1f}KB, "
            f"{savings:+.0f}% vs PNG)",
        )
    except Exception as exc:
        return label, False, f"exception: {exc}"


def write_webp_manifest() -> None:
    """Write a fresh version manifest scanning .webp files (which are
    now the canonical source). Mirrors `write_version_manifest()` from
    the pipeline but for the WebP extension."""
    manifest: dict[str, str] = {}
    for register in _pipeline.REGISTERS.values():
        if not register.out_dir.exists():
            continue
        for path in sorted(register.out_dir.glob("*.webp")):
            key = f"{register.key}/{path.stem}"
            manifest[key] = _pipeline._file_hash_short(path)
    _pipeline.VERSION_MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    _pipeline.VERSION_MANIFEST_PATH.write_text(
        json.dumps(manifest, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    print(
        f"\nWrote version manifest: "
        f"{_pipeline.VERSION_MANIFEST_PATH.relative_to(_pipeline.ROOT)} "
        f"({len(manifest)} entries)"
    )


def collect_pngs(register_keys: list[str], only: list[str]) -> list[Path]:
    """Collect target PNGs across the requested registers."""
    paths: list[Path] = []
    only_set = set(only)
    for key in register_keys:
        register = _pipeline.REGISTERS[key]
        if not register.out_dir.exists():
            continue
        for png in sorted(register.out_dir.glob("*.png")):
            if only_set and png.stem not in only_set:
                continue
            paths.append(png)
    return paths


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    p.add_argument(
        "--register",
        choices=sorted(_pipeline.REGISTERS.keys()),
        action="append",
        help="Limit to one register (repeat for multiple). Default: both.",
    )
    p.add_argument(
        "--only",
        nargs="+",
        default=[],
        help="Only process the named monad keys (e.g. arrival-anchor).",
    )
    p.add_argument("--force", action="store_true", help="Overwrite existing WebPs.")
    p.add_argument("--workers", type=int, default=3, help="Parallelism (default 3).")
    p.add_argument("--dry-run", action="store_true")
    return p.parse_args()


def main() -> int:
    args = parse_args()
    register_keys = args.register or sorted(_pipeline.REGISTERS.keys())
    pngs = collect_pngs(register_keys, args.only)

    if not pngs:
        print("No matching PNG files found.", file=sys.stderr)
        return 1

    print(f"Plan: upscale {len(pngs)} PNG(s) via {UPSCALE_MODEL} "
          f"(scale {SCALE_FACTOR}×), encode WebP q={WEBP_QUALITY}.")
    for png in pngs:
        webp = png.with_suffix(".webp")
        marker = "FORCE" if args.force else ("SKIP" if webp.exists() else "DO  ")
        print(f"  {marker}  {png.relative_to(_pipeline.ROOT)}")

    if args.dry_run:
        print("\n--dry-run: not calling FAL.")
        return 0

    _pipeline._require_fal()

    print(f"\nDispatching at concurrency={args.workers}...\n")
    failures = 0
    results: list[tuple[str, bool, str]] = []
    with ThreadPoolExecutor(max_workers=max(1, args.workers)) as pool:
        futures = {pool.submit(process_one, p, args.force): p for p in pngs}
        for fut in as_completed(futures):
            label, ok, msg = fut.result()
            results.append((label, ok, msg))
            print(f"{'OK  ' if ok else 'FAIL'}  {label}  --  {msg}")

    print("\n=== Summary ===")
    successes = 0
    for label, ok, msg in sorted(results):
        if ok:
            successes += 1
        else:
            failures += 1
        print(f"{'OK  ' if ok else 'FAIL'}  {label}  --  {msg}")

    # Only refresh the manifest if at least one new WebP exists. Empty
    # results would otherwise wipe the existing PNG-based manifest with
    # an empty `{}`, breaking every cache-busted URL on the site.
    if successes:
        write_webp_manifest()
    else:
        print(
            "\nNo successes; leaving existing manifest untouched.",
            file=sys.stderr,
        )
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
