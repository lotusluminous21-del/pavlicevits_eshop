"use client";

import { useEffect, useState } from "react";
import { Brush, Camera } from "lucide-react";

import { usePaintStyle } from "@/providers/PaintStyleProvider";

/**
 * Toggles the homepage paint register between the two style families
 * defined in scripts/COMPOSITION_PLAN_V3.md:
 *   - "waveHorizon"   — composed, painterly, copper-accented (default)
 *   - "vortexOrbital" — glossy photoreal liquid splash, teal + navy
 *
 * Defers icon swap until after mount to avoid hydration mismatch, since
 * the effective register only resolves once localStorage is read.
 */
export function PaintStyleToggle() {
  const { style, toggle } = usePaintStyle();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const showVortex = mounted ? style === "vortexOrbital" : false;

  return (
    <button
      type="button"
      aria-label={
        showVortex
          ? "Switch to wave-horizon paint register"
          : "Switch to vortex-orbital paint register"
      }
      title={
        showVortex
          ? "Vortex-orbital — click for wave-horizon"
          : "Wave-horizon — click for vortex-orbital"
      }
      onClick={toggle}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card/40 text-foreground/80 transition-colors hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Brush
        className={`h-4 w-4 transition-all ${
          showVortex ? "scale-0 rotate-90" : "scale-100 rotate-0"
        }`}
      />
      <Camera
        className={`absolute h-4 w-4 transition-all ${
          showVortex ? "scale-100 rotate-0" : "scale-0 -rotate-90"
        }`}
      />
    </button>
  );
}
