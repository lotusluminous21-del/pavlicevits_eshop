"""
One-off: regenerate `vortex-orbital/arrival-anchor.png` using the
`wave-horizon/arrival-anchor.png` as the KONTEXT reference image.

Why: the user wants the vortex-orbital arrival-anchor's COMPOSITION
(wide swirl with empty central eye) to match the wave-horizon
version, while keeping the vortex-orbital STYLE (realistic glossy
paint, navy darks, white perimeter droplets). KONTEXT preserves the
reference image's overall composition + aesthetic and re-skins it
with the prompt — so feeding it the wave-horizon arrival-anchor as
reference + the vortex-orbital style preamble + the arrival-anchor
gesture gives us the exact hybrid we want.

Usage:
  python scripts/regen-vortex-arrival-from-wave.py
  python scripts/regen-vortex-arrival-from-wave.py --dry-run
"""

from __future__ import annotations

import argparse
import importlib.util
import sys
from pathlib import Path

import fal_client


# Import the main pipeline module by file path (its filename has hyphens
# so a normal `import` would fail).
_HERE = Path(__file__).resolve().parent
_MAIN_PATH = _HERE / "generate-paint-assets-fal.py"
_spec = importlib.util.spec_from_file_location("paint_pipeline", _MAIN_PATH)
assert _spec is not None and _spec.loader is not None
_pipeline = importlib.util.module_from_spec(_spec)
# Register in sys.modules BEFORE exec so dataclass can resolve its __module__
# (Python 3.14+ requirement).
sys.modules["paint_pipeline"] = _pipeline
_spec.loader.exec_module(_pipeline)


def build_directive_composition_prompt() -> str:
    """Style-transfer prompt: keep the wave-horizon anchor's exact
    composition, change only the rendering medium.

    Reference is the existing wave-horizon arrival-anchor PNG, so
    KONTEXT already has the shape we want (two waves wrapping a
    central eye, spanning the wide 16:9 frame). The prompt focuses
    entirely on swapping the MEDIUM — painterly oil-paint with brush
    hairs → realistic glossy liquid paint with smooth wet surfaces and
    bubble droplets — without any composition description that could
    be misinterpreted.
    """
    return (
        "Re-render this reference image with a different rendering "
        "MEDIUM, while preserving its EXACT composition, shape, and "
        "spatial layout pixel-for-pixel. "
        # NEW MEDIUM — focus purely on the surface/texture swap.
        "NEW MEDIUM: photorealistic liquid paint photographed mid-"
        "splash, with smooth glossy wet surfaces, deep petrol teal "
        "pigment, navy and indigo darks, luminous teal-cyan highlights "
        "catching light off the wet curves, scattered white bubble "
        "droplets and splatters dispersed across the composition, "
        "fluid liquid-paint motion frozen mid-air, transparent black "
        "background. The paint is FLUID and WET, like fresh poured "
        "paint mid-motion — NOT painterly oil-paint with brush hairs. "
        # EXPLICIT TEXTURE SWAPS — what to remove from the reference.
        "REPLACE these reference textures: replace the visible brush "
        "hairs with smooth glossy wet surfaces; replace the painterly "
        "ridges of pigment with fluid wet curves; replace the warm "
        "rust copper embers with small white bubble droplets; replace "
        "the matte oil-paint texture with reflective glossy paint that "
        "catches light. "
        # COMPOSITION — explicit lock to reference, no description.
        "PRESERVE from the reference: the exact composition, the "
        "exact shape of every paint stroke, the exact position of the "
        "central empty eye, the exact spread across the wide frame, "
        "the exact wave-curling motions. Do not move, resize, or "
        "rearrange any element of the composition. The shape stays "
        "identical; only the medium changes. "
        # SAFETY TAIL — strengthened against 3D objects.
        "The result is a FLAT 2D image of liquid paint suspended in "
        "empty black space, viewed straight on. NOT a 3D rendered "
        "scene. The central empty region of the composition stays "
        "EMPTY — pure transparent black with NOTHING inside it: no "
        "sphere, no orb, no ball, no marble, no bubble, no globe, no "
        "object of any kind. No text, no logos, no figurative imagery, "
        "no human figures, no recognizable subjects, no clouds, no "
        "flowers, no creatures."
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    monad = next(m for m in _pipeline.MONADS if m.key == "arrival-anchor")
    register = _pipeline.REGISTERS["vortex-orbital"]
    out_path = register.out_dir / f"{monad.key}.png"

    # Use the wave-horizon arrival-anchor PNG itself as the reference.
    # It has the EXACT composition we want (two waves wrapping the
    # central eye, spanning the wide 16:9 frame). The prompt then asks
    # KONTEXT to keep this composition pixel-for-pixel and only swap
    # the rendering medium from painterly oil-paint to realistic
    # glossy liquid paint.
    wave_path = (
        _pipeline.PUBLIC_PAINT / "wave-horizon" / "arrival-anchor.png"
    )
    if not wave_path.exists():
        print(f"ERROR: source reference missing: {wave_path}", file=sys.stderr)
        return 2

    prompt = build_directive_composition_prompt()

    print("Plan:")
    print(f"  reference   : {wave_path.relative_to(_pipeline.ROOT)}")
    print(f"               (uploaded to FAL — provides exact composition)")
    print(f"  output      : {out_path.relative_to(_pipeline.ROOT)}")
    print(f"  aspect      : {monad.aspect_ratio}")
    print(f"  model       : {_pipeline.GEN_MODEL}")
    print(f"  approach    : preserve wave shape + swap medium to glossy realistic")
    print(f"\nFull prompt:\n{prompt}\n")

    if args.dry_run:
        print("--dry-run: not calling FAL.")
        return 0

    _pipeline._require_fal()

    print(f"Uploading wave-horizon anchor as reference...")
    ref_url = fal_client.upload_file(str(wave_path))
    print(f"  uploaded as: {ref_url}\n")

    arguments = {
        "prompt": prompt,
        "image_url": ref_url,
        "aspect_ratio": monad.aspect_ratio,
        "num_images": 1,
        # Standard guidance — higher values led to the model over-
        # interpreting prompt instructions and producing tight contained
        # shapes. 3.5 lets the reference's spatial layout shine through
        # while the prompt swaps the medium.
        "guidance_scale": 3.5,
        "safety_tolerance": "5",
        "output_format": "png",
    }

    label = "vortex-orbital/arrival-anchor [directive-composition]"
    print(f"[{label}] generating...")
    result = fal_client.subscribe(
        _pipeline.GEN_MODEL,
        arguments=arguments,
        with_logs=True,
        on_queue_update=_pipeline._on_queue(label),
    )
    images = result.get("images") or []
    if not images:
        print(f"ERROR: no images in result: {result}", file=sys.stderr)
        return 1
    gen_url = images[0].get("url")
    if not gen_url:
        print(f"ERROR: no url in image[0]: {images[0]}", file=sys.stderr)
        return 1

    print(f"[{label}] downloading: {gen_url}")
    raw = _pipeline.download_bytes(gen_url, label)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    size_bytes = _pipeline.alpha_from_luminance(raw, out_path)
    print(
        f"[{label}] saved {out_path.relative_to(_pipeline.ROOT)} "
        f"({size_bytes / 1024:.1f}KB)"
    )

    _pipeline.write_version_manifest()
    return 0


if __name__ == "__main__":
    sys.exit(main())
