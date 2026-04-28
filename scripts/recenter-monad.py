"""
Re-center a monad's negative-space "eye" to the geometric centre of
the canvas.

The Arrival hero monad has its largest inscribed circle (the "eye"
where headline content sits) offset from image centre. The page lays
the headline out at the image's geometric centre, so the result is a
visible misalignment — the user sees the type sitting off-axis from
the painted vortex around it.

This script detects the offset and translates the paint within the
canvas so that the eye lands on the geometric centre.

Detection algorithm (pure numpy + a deque, no scipy):

  1. Threshold alpha → binary paint mask.
  2. BFS flood-fill from canvas borders to identify exterior background
     (everything reachable from an edge that isn't paint).
  3. Interior "holes" are pixels that are neither paint nor exterior.
  4. Multi-source BFS distance transform from paint pixels — gives, for
     every hole pixel, the L1-Manhattan distance to the nearest paint.
  5. The maximum of that distance restricted to holes IS the radius of
     the largest inscribed circle that fits inside the eye, and its
     argmax is the centre.

Why the inscribed-circle centre instead of the alpha-weighted centroid:
the centroid is pulled around by the alpha distribution (e.g. the long
trailing drips on the right of the wave-horizon Arrival anchor pull
the centroid toward the trail). What you actually want when laying a
text block inside a hole is the largest empty disc — which is what an
inscribed-circle metric returns.

Translation is done by numpy slicing — paint shifts within the same
canvas, padded with transparency where it leaves a side empty. No
upscaling, no FAL round-trip.

After modifying the PNG the script re-encodes the .webp sibling using
the same WebP settings as upscale-and-webp.py (q=92, alpha_quality=
100, method=6) and refreshes the version manifest so the cache busts.

Aborts safely if no significant interior eye is found (largest
inscribed-circle radius below MIN_EYE_RADIUS). Prints metrics first;
the actual file write only happens with --apply.

Usage:
  python scripts/recenter-monad.py wave-horizon/arrival-anchor
  python scripts/recenter-monad.py wave-horizon/arrival-anchor --apply
  python scripts/recenter-monad.py wave-horizon/arrival-anchor wave-horizon/horizon-sweep
"""
from __future__ import annotations

import argparse
import importlib.util
import sys
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

# Reuse the pipeline module's REGISTERS / write_version_manifest. We
# load it the same way feather-edges-only.py does — the file isn't a
# regular package module because of the hyphenated filename.
_HERE = Path(__file__).resolve().parent
_MAIN_PATH = _HERE / "generate-paint-assets-fal.py"
_spec = importlib.util.spec_from_file_location("paint_pipeline", _MAIN_PATH)
assert _spec is not None and _spec.loader is not None
_pipeline = importlib.util.module_from_spec(_spec)
sys.modules["paint_pipeline"] = _pipeline
_spec.loader.exec_module(_pipeline)


# Match the upscale-and-webp.py defaults so the re-encoded webp is
# byte-for-byte equivalent in encoding parameters.
WEBP_QUALITY = 92
WEBP_ALPHA_QUALITY = 100
WEBP_METHOD = 6

# Pixels with alpha at or below this are considered "not paint".
ALPHA_PAINT_THRESHOLD = 30

# If the largest inscribed circle inside the negative space is smaller
# than this radius (in source-pixel units), the image probably doesn't
# have a clean "eye" composition and we shouldn't auto-recentre. The
# wave-horizon Arrival anchor has a radius around 340 pixels, so 80 is
# a comfortable floor.
MIN_EYE_RADIUS = 80

# If the detected shift is below this many pixels in both axes, treat
# the image as already aligned and skip writing.
MIN_SHIFT = 5


def find_inscribed_circle(rgba: np.ndarray) -> tuple[int, int, int]:
    """Return (cx, cy, radius) in pixels for the largest disc that
    fits inside an interior negative-space hole. radius==0 means no
    interior hole was found at all.
    """
    h, w = rgba.shape[:2]
    paint = rgba[:, :, 3] > ALPHA_PAINT_THRESHOLD

    # Flood-fill exterior from every border pixel that isn't paint.
    exterior = np.zeros((h, w), dtype=np.uint8)
    queue: deque[tuple[int, int]] = deque()

    def push_border(y: int, x: int) -> None:
        if not paint[y, x]:
            exterior[y, x] = 1
            queue.append((y, x))

    for x in range(w):
        push_border(0, x)
        push_border(h - 1, x)
    for y in range(h):
        push_border(y, 0)
        push_border(y, w - 1)

    while queue:
        y, x = queue.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and not paint[ny, nx] and not exterior[ny, nx]:
                exterior[ny, nx] = 1
                queue.append((ny, nx))

    holes = (~paint) & (exterior == 0)
    if not holes.any():
        return -1, -1, 0

    # Multi-source BFS distance transform from paint pixels. dist[y,x]
    # is the L1 distance from (y,x) to the nearest paint pixel.
    dist = np.full((h, w), -1, dtype=np.int32)
    paint_q: deque[tuple[int, int]] = deque()
    paint_ys, paint_xs = np.where(paint)
    dist[paint_ys, paint_xs] = 0
    paint_q.extend(zip(paint_ys.tolist(), paint_xs.tolist()))
    while paint_q:
        y, x = paint_q.popleft()
        d = dist[y, x] + 1
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and dist[ny, nx] == -1:
                dist[ny, nx] = d
                paint_q.append((ny, nx))

    hole_dist = np.where(holes, dist, -1)
    radius = int(hole_dist.max())
    if radius <= 0:
        return -1, -1, 0
    locs = np.where(hole_dist == radius)
    cy = int(locs[0][0])
    cx = int(locs[1][0])
    return cx, cy, radius


def shift_paint(rgba: np.ndarray, dx: int, dy: int) -> np.ndarray:
    """Translate paint within the canvas by (dx, dy). Vacated regions
    become fully transparent. Regions that move past the canvas edge
    are cropped — typically negligible because the paint we're
    shifting away from a wall still sits well inside the bounding box.
    """
    h, w = rgba.shape[:2]
    out = np.zeros_like(rgba)
    src_x0, src_y0 = max(0, -dx), max(0, -dy)
    src_x1, src_y1 = min(w, w - dx), min(h, h - dy)
    dst_x0, dst_y0 = max(0, dx), max(0, dy)
    dst_x1 = dst_x0 + (src_x1 - src_x0)
    dst_y1 = dst_y0 + (src_y1 - src_y0)
    out[dst_y0:dst_y1, dst_x0:dst_x1] = rgba[src_y0:src_y1, src_x0:src_x1]
    return out


def encode_webp(png_path: Path) -> Path:
    """Read the PNG sibling and re-encode it to WebP using the same
    quality settings as the upscale pipeline. Returns the webp path.
    """
    webp_path = png_path.with_suffix(".webp")
    Image.open(png_path).convert("RGBA").save(
        webp_path,
        format="WEBP",
        quality=WEBP_QUALITY,
        alpha_quality=WEBP_ALPHA_QUALITY,
        method=WEBP_METHOD,
        exact=True,
    )
    return webp_path


def parse_target(spec: str) -> Path:
    """Resolve a "<register>/<asset>" string to its on-disk PNG path."""
    if "/" not in spec:
        raise SystemExit(f"target must be <register>/<asset>, got '{spec}'")
    register_key, asset = spec.split("/", 1)
    if register_key not in _pipeline.REGISTERS:
        raise SystemExit(
            f"unknown register '{register_key}'. valid: {sorted(_pipeline.REGISTERS.keys())}"
        )
    path = _pipeline.REGISTERS[register_key].out_dir / f"{asset}.png"
    if not path.exists():
        raise SystemExit(f"file not found: {path}")
    return path


def main() -> None:
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "targets",
        nargs="+",
        help="One or more <register>/<asset> identifiers, e.g. wave-horizon/arrival-anchor",
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Write changes to disk. Without this flag the script just reports.",
    )
    args = parser.parse_args()

    wrote_anything = False

    for spec in args.targets:
        png_path = parse_target(spec)
        rgba = np.array(Image.open(png_path).convert("RGBA"))
        h, w = rgba.shape[:2]
        cx, cy, radius = find_inscribed_circle(rgba)

        print(f"\n{spec}  ({w}x{h})")

        if radius < MIN_EYE_RADIUS:
            print(
                f"  no significant interior eye (largest hole radius "
                f"{radius} < {MIN_EYE_RADIUS}px). Skipping."
            )
            continue

        target_x = w // 2
        target_y = h // 2
        dx = target_x - cx
        dy = target_y - cy

        print(f"  inscribed-circle centre: ({cx}, {cy})  radius: {radius}")
        print(f"  image centre:            ({target_x}, {target_y})")
        print(f"  shift required:          ({dx:+}, {dy:+})")

        if abs(dx) < MIN_SHIFT and abs(dy) < MIN_SHIFT:
            print(f"  already aligned (within {MIN_SHIFT} px), skipping write.")
            continue

        if not args.apply:
            print(f"  dry-run; pass --apply to write.")
            continue

        shifted = shift_paint(rgba, dx, dy)
        Image.fromarray(shifted, mode="RGBA").save(png_path, format="PNG", optimize=True)
        png_kb = png_path.stat().st_size / 1024
        print(f"  wrote {png_path.relative_to(_pipeline.ROOT)} ({png_kb:.0f} KB)")

        webp_path = encode_webp(png_path)
        webp_kb = webp_path.stat().st_size / 1024
        print(f"  wrote {webp_path.relative_to(_pipeline.ROOT)} ({webp_kb:.0f} KB)")
        wrote_anything = True

    if wrote_anything:
        _pipeline.write_version_manifest()


if __name__ == "__main__":
    main()
