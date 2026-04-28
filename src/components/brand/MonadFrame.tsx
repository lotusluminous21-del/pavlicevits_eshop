"use client";

import monadVersions from "@/lib/brand/monad-versions.json";
import {
  getPaintAsset,
  type PaintAsset,
  type PaintStyle,
} from "@/lib/brand/paint-assets";
import { usePaintStyle } from "@/providers/PaintStyleProvider";
import { PaintGLCanvas } from "@/components/effects/PaintGLCanvas";

/**
 * Map a PaintStyle key (camelCase) to the kebab-case directory the FAL
 * pipeline writes to (and that the version manifest is keyed on).
 */
const REGISTER_DIR: Record<PaintStyle, string> = {
  waveHorizon: "wave-horizon",
  vortexOrbital: "vortex-orbital",
};

/**
 * Pre-built lookup of every (style, asset) → manifest version. Built
 * once at module load instead of running the camelCase→kebab regex on
 * every MonadFrame render (≈8 instances on the homepage). The manifest
 * is static at deploy time, so memoising the keys is safe.
 */
const VERSION_LOOKUP: Record<string, string | null> = (() => {
  const out: Record<string, string | null> = {};
  for (const style of ["waveHorizon", "vortexOrbital"] as const) {
    const dir = REGISTER_DIR[style];
    for (const key of Object.keys(monadVersions) as Array<keyof typeof monadVersions>) {
      // Manifest keys look like "wave-horizon/arrival-anchor"; we only
      // care about ones in the current register's directory. The lookup
      // is keyed on `${style}|${asset}` so callers can hit it in O(1)
      // without doing case conversion at call time.
      if (!key.startsWith(dir + "/")) continue;
      const kebab = key.slice(dir.length + 1);
      const camel = kebab.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
      out[`${style}|${camel}`] = monadVersions[key];
    }
  }
  return out;
})();

function versionFor(asset: PaintAsset, style: PaintStyle): string | null {
  return VERSION_LOOKUP[`${style}|${asset}`] ?? null;
}

type MonadFrameProps = {
  asset: PaintAsset;
  /** Natural width of the monad PNG (post auto-crop). */
  width: number;
  /** Natural height of the monad PNG (post auto-crop). */
  height: number;
  /**
   * Optional cap on the rendered width. Defaults to `width` (no upscale
   * beyond natural size). Pass a smaller number to render the monad at
   * a reduced presentation size — useful when the natural PNG would
   * dominate the layout vertically (the horizon-sweep band).
   */
  maxDisplayWidth?: number;
  /** Tailwind classes appended to the wrapper. */
  className?: string;
  /** LCP priority hint forwarded to the underlying <img>. */
  priority?: boolean;
};

/**
 * Renders one monad — a fully-framed, transparent-background paint
 * webp — through the WebGL2 fragment-shader pipeline (PaintGLCanvas).
 * That handles its own <img> element for LCP timing AND for the
 * fallback path (mobile, prefers-reduced-motion, no WebGL2). The
 * shader applies a slow viscous warp + per-pixel wet-glaze specular
 * with a slowly rotating light, all driven by image-derived data.
 *
 * The wrapper is constrained to the monad's natural width via
 * `max-width`, which stops upscaling on huge displays. Aspect ratio
 * is enforced inside PaintGLCanvas so layout never shifts after
 * texture load.
 *
 * The active style register is resolved at render time from
 * PaintStyleProvider so toggling between waveHorizon and vortexOrbital
 * swaps the painted pixels without touching the layout (silhouettes
 * are matched at generation time per scripts/COMPOSITION_PLAN_V3.md).
 */
export function MonadFrame({
  asset,
  width,
  height,
  maxDisplayWidth,
  className = "",
  priority = false,
}: MonadFrameProps) {
  const { style } = usePaintStyle();
  const baseSrc = getPaintAsset(asset, style);
  const version = versionFor(asset, style);
  const src = version ? `${baseSrc}?v=${version}` : baseSrc;
  const cap = maxDisplayWidth ?? width;

  return (
    <div
      aria-hidden
      className={`pointer-events-none relative w-full ${className}`}
      style={{ maxWidth: cap }}
    >
      <PaintGLCanvas
        key={src}
        src={src}
        width={width}
        height={height}
        priority={priority}
        className="block w-full"
      />
    </div>
  );
}
