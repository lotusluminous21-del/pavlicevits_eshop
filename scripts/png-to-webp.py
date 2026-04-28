"""
Convert all PNGs under given directories to .webp siblings, using the
same encoding settings as the paint pipeline (q=92, alpha_quality=100,
method=6). Idempotent: skips a target whose .webp already exists and is
newer than the .png, unless --force is passed.

The brand has three non-monad image registers — products, projects,
and finishes (which the category teasers consume) — that originally
shipped as 200–700 KB PNGs. WebP at the same quality settings cuts
those by 60-80% with no perceptible quality loss; on a marketing
homepage that's a meaningful saving across the catalogue strip and
the project case study.

Usage:
  python scripts/png-to-webp.py
  python scripts/png-to-webp.py --force
  python scripts/png-to-webp.py public/brand/products
"""
from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]

# Default set of directories under public/brand to walk. The paint
# directory is intentionally excluded — its webp pipeline is more
# complex (FAL upscale + alpha-resample), see upscale-and-webp.py.
DEFAULT_DIRS = [
    ROOT / "public" / "brand" / "products",
    ROOT / "public" / "brand" / "projects",
    ROOT / "public" / "brand" / "finishes",
]

WEBP_QUALITY = 92
WEBP_ALPHA_QUALITY = 100
WEBP_METHOD = 6


def convert(png_path: Path, force: bool) -> tuple[bool, str]:
    """Convert a single PNG to .webp. Returns (did_convert, message)."""
    webp_path = png_path.with_suffix(".webp")
    if (
        not force
        and webp_path.exists()
        and webp_path.stat().st_mtime >= png_path.stat().st_mtime
    ):
        return False, f"skip (up-to-date)"

    img = Image.open(png_path).convert("RGBA")
    img.save(
        webp_path,
        format="WEBP",
        quality=WEBP_QUALITY,
        alpha_quality=WEBP_ALPHA_QUALITY,
        method=WEBP_METHOD,
        exact=True,
    )
    png_kb = png_path.stat().st_size / 1024
    webp_kb = webp_path.stat().st_size / 1024
    saving = (1 - webp_kb / png_kb) * 100 if png_kb else 0
    return True, f"{webp_kb:.0f} KB (-{saving:.0f}% from {png_kb:.0f} KB PNG)"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "dirs",
        nargs="*",
        type=Path,
        help="Optional explicit directories to process. Defaults to "
        "products / projects / finishes under public/brand.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Re-encode .webp even when it's newer than its .png sibling.",
    )
    args = parser.parse_args()

    dirs = args.dirs if args.dirs else DEFAULT_DIRS
    total_pngs = 0
    converted = 0

    for d in dirs:
        d = Path(d).resolve()
        if not d.exists():
            print(f"\n{d}: not found, skipping")
            continue
        pngs = sorted(d.glob("*.png"))
        if not pngs:
            print(f"\n{d}: no PNGs")
            continue
        print(f"\n{d.relative_to(ROOT)}  ({len(pngs)} PNG(s))")
        for png in pngs:
            total_pngs += 1
            try:
                did, msg = convert(png, args.force)
            except Exception as exc:
                print(f"  {png.name}: ERROR — {exc}")
                continue
            if did:
                converted += 1
            print(f"  {png.name}: {msg}")

    print(f"\nDone. Converted {converted}/{total_pngs}.")


if __name__ == "__main__":
    main()
