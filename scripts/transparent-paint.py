"""
Convert paint PNGs (black background + colorful paint) to transparent-background.

Strategy: per-pixel alpha = min(255, max(R, G, B) * boost). Pure black -> alpha 0.
Bright paint -> alpha 255. Mid-tones get smooth anti-aliased falloff so edges
don't look chopped.

Run once. Idempotent: re-running on already-transparent files is safe (alpha
recomputed from RGB channels, which are still the paint colors).
"""
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "public" / "brand" / "paint"
THRESHOLD = 60  # luminance below this is fully/partially transparent
BOOST = 255 / THRESHOLD  # so any pixel >= THRESHOLD is fully opaque

def process(path: Path) -> None:
    img = np.array(Image.open(path).convert("RGBA"))
    rgb = img[:, :, :3].astype(np.float32)
    # max channel = a reasonable proxy for "how non-black is this pixel"
    lum = rgb.max(axis=2)
    alpha = np.clip(lum * BOOST, 0, 255).astype(np.uint8)
    img[:, :, 3] = alpha
    Image.fromarray(img).save(path, optimize=True)
    print(f"  ok {path.name}")

def main() -> None:
    files = sorted(ROOT.glob("*.png"))
    print(f"Processing {len(files)} PNG(s) in {ROOT.relative_to(ROOT.parents[2])}")
    for f in files:
        process(f)
    print("Done.")

if __name__ == "__main__":
    main()
