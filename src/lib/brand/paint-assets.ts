/**
 * Paint asset registry — V3 (monad collage).
 *
 * The desktop homepage is composed from 7 logical monads, each available
 * in two stylistic registers ("waveHorizon" and "vortexOrbital"). Both
 * registers must share the same monad silhouettes so the layout doesn't
 * shift when the user toggles between them — see
 * `scripts/COMPOSITION_PLAN_V3.md` for the per-monad spec.
 *
 *   - "waveHorizon"   — composed, painterly, single-gesture liquid paint.
 *                       Petrol teal dominant with measured copper accents.
 *                       The home page's default voice.
 *
 *   - "vortexOrbital" — glossy photoreal liquid splash. Petrol teal +
 *                       dark navy depth. No warm tones. Kinetic, sensory.
 *
 * Sections reference monads by their LOGICAL key (e.g. "arrivalAnchor").
 * The active register is resolved at render time from PaintStyleProvider.
 */

export type PaintStyle = "waveHorizon" | "vortexOrbital";

export const paintAssetSets = {
  waveHorizon: {
    /** Movement 1 — wide swirl with central negative-space eye. */
    arrivalAnchor: "/brand/paint/wave-horizon/arrival-anchor.webp",
    /** Movement 2 — small drop with separating satellite. */
    propositionA: "/brand/paint/wave-horizon/proposition-a.webp",
    /** Movement 2 — small swirl coil. */
    propositionB: "/brand/paint/wave-horizon/proposition-b.webp",
    /** Movement 2 — short diagonal braid. */
    propositionC: "/brand/paint/wave-horizon/proposition-c.webp",
    /** Movement 3 — long horizontal sweep that acts as a horizon line. */
    horizonSweep: "/brand/paint/wave-horizon/horizon-sweep.webp",
    /** Movement 4 — vertical falling-droplet contemplation. */
    heldNote: "/brand/paint/wave-horizon/held-note.webp",
    /** Movement 5 — fountain bloom rising from the lower-centre. */
    risingBloom: "/brand/paint/wave-horizon/rising-bloom.webp",
  },
  vortexOrbital: {
    arrivalAnchor: "/brand/paint/vortex-orbital/arrival-anchor.webp",
    propositionA: "/brand/paint/vortex-orbital/proposition-a.webp",
    propositionB: "/brand/paint/vortex-orbital/proposition-b.webp",
    propositionC: "/brand/paint/vortex-orbital/proposition-c.webp",
    horizonSweep: "/brand/paint/vortex-orbital/horizon-sweep.webp",
    heldNote: "/brand/paint/vortex-orbital/held-note.webp",
    risingBloom: "/brand/paint/vortex-orbital/rising-bloom.webp",
  },
} as const satisfies Record<PaintStyle, Record<string, string>>;

export type PaintAsset = keyof typeof paintAssetSets.waveHorizon;

/**
 * Resolve a logical monad key against the active style register. Movement
 * components never need to know which register is active — they call this
 * with the key and the style returned by `usePaintStyle()`.
 */
export function getPaintAsset(asset: PaintAsset, style: PaintStyle): string {
  return paintAssetSets[style][asset];
}
