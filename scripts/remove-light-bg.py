"""
Remove light/grey background from product icons.

Strategy: sample the 4 corner pixels, treat that color as background,
mark any pixel within `tolerance` distance as transparent. Works well
for product icons rendered on a flat studio background.

Usage:
  python scripts/remove-light-bg.py public/brand/products/*.png
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image

TOLERANCE = 28  # per-channel distance

def process(path: Path) -> None:
    img = Image.open(path).convert("RGBA")
    arr = np.array(img)
    h, w = arr.shape[:2]
    # Sample 4 corners + 4 mid-edges to be robust against vignettes
    samples = arr[
        [0, 0, h - 1, h - 1, 0, h - 1, h // 2, h // 2],
        [0, w - 1, 0, w - 1, w // 2, w // 2, 0, w - 1],
        :3,
    ].astype(np.float32)
    bg = np.median(samples, axis=0)
    rgb = arr[:, :, :3].astype(np.float32)
    # Per-channel max-distance check (more selective than euclidean)
    is_bg = np.all(np.abs(rgb - bg) < TOLERANCE, axis=2)
    # Smooth alpha falloff for half-bg pixels (anti-alias)
    diff = np.abs(rgb - bg).max(axis=2)
    soft = np.clip((diff - TOLERANCE * 0.5) / (TOLERANCE * 0.5), 0, 1)
    new_alpha = np.where(is_bg, 0, np.minimum(arr[:, :, 3], (soft * 255).astype(np.uint8)))
    # Preserve original alpha where it was already lower
    arr[:, :, 3] = np.minimum(arr[:, :, 3], new_alpha + np.where(is_bg, 0, 255 - (soft * 255).astype(np.uint8)))
    arr[:, :, 3] = np.where(is_bg, 0, arr[:, :, 3])
    Image.fromarray(arr).save(path, optimize=True)
    print(f"  ok {path.name}")

def main(args: list[str]) -> None:
    paths = []
    for a in args:
        p = Path(a)
        if p.is_dir():
            paths.extend(sorted(p.glob("*.png")))
        elif "*" in str(p):
            paths.extend(sorted(p.parent.glob(p.name)))
        else:
            paths.append(p)
    print(f"Processing {len(paths)} file(s)")
    for p in paths:
        process(p)
    print("Done.")

if __name__ == "__main__":
    main(sys.argv[1:])
