'use client';

import {
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Filter ID is shared across every PaintShimmer instance on the page.
 * The browser parses one `<filter>` element once and applies it to N
 * elements that reference it via `filter: url(#paint-shimmer)`. This
 * means the SMIL animations inside the filter run ONCE in the DOM
 * regardless of how many monads consume the filter — a major perf win
 * vs the previous per-instance approach (which booted N parallel SMIL
 * timelines for a homepage with seven monads).
 */
const FILTER_ID = 'paint-shimmer';

/**
 * Mount this once per page (typically in the brand layout). Renders
 * the shared SVG `<defs>` containing the paint-shimmer filter.
 *
 * Rendered as `null` when the user prefers reduced motion or is on a
 * mobile viewport. SMIL animations run inside `<filter>` even when the
 * filter isn't referenced by any element, so guarding the defs at the
 * source avoids burning CPU on a page where no monad is consuming the
 * filter.
 */
export function PaintShimmerDefs() {
  const reducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (reducedMotion || isMobile) return null;

  return (
    <svg
      style={{ width: 0, height: 0, position: 'absolute', pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <defs>
        {/*
          colorInterpolationFilters="sRGB" is roughly 2× faster than the
          spec-default "linearRGB" because the browser doesn't need to
          gamma-decode source pixels before each primitive and gamma-
          re-encode after. Visually indistinguishable at the scales of
          warp and glaze used here.
        */}
        <filter id={FILTER_ID} colorInterpolationFilters="sRGB">
          {/*
            ── DERIVED: smooth gradient field from the paint itself ──
            Gaussian blur of SourceGraphic gives a smoothed copy of the
            painted structure — used as the displacement reference for
            the primary warp. The warp pattern is entirely image-
            derived (xChannelSelector="R" / yChannelSelector="G" mean
            cyan paint pushes one way, copper accents the opposite).

            ── DYNAMIC ① ── stdDeviation animates 6 → 14 → 6 over 9 s
            linearly. When σ is small the gradient retains paint detail
            (the warp is fine-grained, local micro-flows); when large
            the gradient is smoothed across whole regions (the warp
            becomes broad whole-monad sweeps). The visible effect is a
            "structural zoom" between micro and macro flow — costs no
            extra primitive because the blur already recomputes each
            frame for the chained displacement.
          */}
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation="10"
            result="smoothGradient"
          >
            <animate
              attributeName="stdDeviation"
              dur="9s"
              values="6; 14; 6"
              keyTimes="0; 0.5; 1"
              repeatCount="indefinite"
              calcMode="linear"
            />
          </feGaussianBlur>

          {/*
            ── DYNAMIC ② ── primary warp scale.
            3 → 7 → 3 px over 7 s linear. Bigger range than v6 (was
            2–4) and slightly faster cycle so the pulse is clearly
            felt. 7 px peak on a 1500-px monad is ~0.5% — the eye
            tracks the breathing without edges going soft.
          */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="smoothGradient"
            scale="3"
            xChannelSelector="R"
            yChannelSelector="G"
            result="primaryFlow"
          >
            <animate
              attributeName="scale"
              dur="7s"
              values="3; 7; 3"
              keyTimes="0; 0.5; 1"
              repeatCount="indefinite"
              calcMode="linear"
            />
          </feDisplacementMap>

          {/*
            ── DERIVED: luminance heightmap ──
            Rec.601 luminance from the original (un-warped) source.
            Used as the specular heightmap and also reused below to
            gate the glaze intensity.
          */}
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0.299 0.587 0.114 0 0
                    0.299 0.587 0.114 0 0
                    0.299 0.587 0.114 0 0
                    0 0 0 1 0"
            result="lumGray"
          />

          {/*
            ── DYNAMIC ③ ── specular wet-glaze.
            Highlights are computed against the luminance heightmap so
            they sit on the actual painted bright spots. v7 boosts the
            glaze considerably:
              · surfaceScale 3 → 4   (more relief perception)
              · specularConstant 1.4 → 1.8   (brighter sheen)
              · specularExponent 22 → 18   (broader highlight, more
                visible than a tight pinpoint)
              · azimuth 15° → 80° → 15° over 22 s   (wider arc, faster
                crawl — glaze is clearly travelling across the paint)
          */}
          <feSpecularLighting
            in="lumGray"
            surfaceScale="4"
            specularConstant="1.8"
            specularExponent="18"
            lightingColor="white"
            result="rawSpecular"
          >
            <feDistantLight azimuth="45" elevation="60">
              <animate
                attributeName="azimuth"
                dur="22s"
                values="15; 80; 15"
                keyTimes="0; 0.5; 1"
                repeatCount="indefinite"
                calcMode="linear"
              />
            </feDistantLight>
          </feSpecularLighting>

          {/*
            ── BIND: glaze gated by source luminance ──
            Multiplying the specular output by lumGray (channel-wise
            arithmetic, k1=1) means dark folds receive almost no glaze
            even if the lighting calculation produced a highlight there.
            Bright paint catches the sheen; dark areas don't.
          */}
          <feComposite
            in="rawSpecular"
            in2="lumGray"
            operator="arithmetic"
            k1="1"
            k2="0"
            k3="0"
            k4="0"
            result="lumModulatedSpecular"
          />

          {/*
            ── BIND: alpha layer masks the glaze ──
            Without this, the lighting computation would spill onto the
            transparent canvas around the paint and produce a phantom
            rectangular halo.
          */}
          <feComposite
            in="lumModulatedSpecular"
            in2="primaryFlow"
            operator="in"
            result="paintGlaze"
          />

          {/*
            ── Final additive composite ──
            Screen blend brightens, never darkens. Glaze overlays the
            warped paint without obscuring its colour.
          */}
          <feBlend in="primaryFlow" in2="paintGlaze" mode="screen" />
        </filter>
      </defs>
    </svg>
  );
}

interface PaintShimmerProps {
  children: ReactNode;
  /** Tailwind / class names forwarded to the wrapper. */
  className?: string;
}

/**
 * Apply the shared paint-shimmer filter to its children. Every
 * consumer references the same SVG filter id, so the SMIL animation
 * timelines run only once for the whole page no matter how many
 * monads are visible.
 *
 * Disabled on mobile (filter cost prohibitive on small/integrated
 * GPUs and there's no hover-feel benefit) and on
 * `prefers-reduced-motion`. In both cases the children render plain.
 */
export function PaintShimmer({
  children,
  className = 'block w-full',
}: PaintShimmerProps) {
  const reducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (reducedMotion || isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      style={{
        filter: `url(#${FILTER_ID})`,
        // will-change: filter is what tells the compositor to keep the
        // filter result on its own GPU layer between frames; without
        // it Safari re-rasterises the input on every animation tick.
        willChange: 'filter',
        transform: 'translateZ(0)',
      }}
      className={className}
    >
      {children}
    </div>
  );
}
