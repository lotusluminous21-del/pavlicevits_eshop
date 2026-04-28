"""
Apply smooth-cut edge feathering to an existing PNG WITHOUT re-deriving
alpha from RGB.

The pipeline's `--reprocess` flag rebuilds the alpha channel from the
RGB content via a luminance/chroma threshold — which is fine for
freshly-generated PNGs (their backgrounds are pure black so the
threshold cleanly separates paint from background) but DESTRUCTIVE for
manually-edited PNGs where dark-but-meant-to-be-opaque pixels exist:
the alpha derivation reads them as background-like and turns them
semi-transparent, creating holes.

This script keeps the user's existing alpha channel verbatim and ONLY
runs the cosine-ramp edge-feather pass on it. Then it triggers the
shared version-manifest writer so the cache busts cleanly.

Usage:
  python scripts/feather-edges-only.py <register>/<asset>
  python scripts/feather-edges-only.py vortex-orbital/arrival-anchor
  python scripts/feather-edges-only.py wave-horizon/held-note
  # Batch mode: pass a register name to process every PNG in it.
  python scripts/feather-edges-only.py vortex-orbital
  # Multiple targets in one call (manifest written once at end):
  python scripts/feather-edges-only.py vortex-orbital/held-note vortex-orbital/rising-bloom
"""

from __future__ import annotations

import argparse
import importlib.util
import sys
from pathlib import Path

import numpy as np
from PIL import Image


_HERE = Path(__file__).resolve().parent
_MAIN_PATH = _HERE / "generate-paint-assets-fal.py"
_spec = importlib.util.spec_from_file_location("paint_pipeline", _MAIN_PATH)
assert _spec is not None and _spec.loader is not None
_pipeline = importlib.util.module_from_spec(_spec)
sys.modules["paint_pipeline"] = _pipeline
_spec.loader.exec_module(_pipeline)


def feather_only(path: Path, feather_frac: float) -> int:
    """Run only the edge-feather pass; keep the existing alpha channel
    untouched everywhere else. Returns the new file size in bytes.

    Monkey-patches the pipeline module's `FEATHER_FRAC` constant for
    the duration of the call so the feather band width is configurable
    per invocation. Default in the pipeline is 0.07 (7% of frame
    dimension) which is wide enough to fade detail and read as
    blurriness; this script defaults to 0.025 (~2.5%) for crisp edges
    that still smooth out hard frame cuts.
    """
    img = Image.open(path).convert("RGBA")
    rgba = np.array(img, dtype=np.uint8)
    saved = _pipeline.FEATHER_FRAC
    try:
        _pipeline.FEATHER_FRAC = feather_frac
        rgba = _pipeline._apply_edge_feather(rgba)
    finally:
        _pipeline.FEATHER_FRAC = saved
    Image.fromarray(rgba, mode="RGBA").save(path, format="PNG", optimize=True)
    return path.stat().st_size


def _resolve_targets(specs: list[str]) -> list[Path]:
    """Expand a list of target specs into a flat list of file paths.
    Each spec is either "<register>/<asset>" (one file) or "<register>"
    (every PNG in that register's output directory)."""
    paths: list[Path] = []
    for spec in specs:
        if "/" in spec:
            register_key, asset = spec.split("/", 1)
            if register_key not in _pipeline.REGISTERS:
                raise SystemExit(
                    f"ERROR: unknown register '{register_key}' in '{spec}'. "
                    f"Valid: {sorted(_pipeline.REGISTERS.keys())}"
                )
            path = _pipeline.REGISTERS[register_key].out_dir / f"{asset}.png"
            if not path.exists():
                raise SystemExit(f"ERROR: file not found: {path}")
            paths.append(path)
        else:
            if spec not in _pipeline.REGISTERS:
                raise SystemExit(
                    f"ERROR: '{spec}' is neither a register name nor "
                    f"<register>/<asset>. Valid registers: "
                    f"{sorted(_pipeline.REGISTERS.keys())}"
                )
            register = _pipeline.REGISTERS[spec]
            for p in sorted(register.out_dir.glob("*.png")):
                paths.append(p)
    return paths


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "targets",
        nargs="+",
        help=(
            "One or more targets. Each is either "
            "<register>/<asset> for a single file, or "
            "<register> alone for every PNG in that register."
        ),
    )
    parser.add_argument(
        "--feather-frac",
        type=float,
        default=0.025,
        help=(
            "Feather band width as a fraction of the frame dimension "
            "(default 0.025 = 2.5%%). Lower values = crisper edges with "
            "less detail fade; higher values = smoother fade but more "
            "perceived blur. The pipeline's default for fresh "
            "generations is 0.07."
        ),
    )
    args = parser.parse_args()

    paths = _resolve_targets(args.targets)
    if not paths:
        print("No matching files found.", file=sys.stderr)
        return 1

    print(
        f"Feathering {len(paths)} file(s) (alpha-preserving, "
        f"feather_frac={args.feather_frac}):\n"
    )
    for path in paths:
        size = feather_only(path, args.feather_frac)
        print(
            f"  OK  {path.relative_to(_pipeline.ROOT)}  ({size / 1024:.1f}KB)"
        )

    print()
    _pipeline.write_version_manifest()
    return 0


if __name__ == "__main__":
    sys.exit(main())
