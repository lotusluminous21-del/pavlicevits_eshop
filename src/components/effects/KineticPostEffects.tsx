'use client';

import { ReactNode, useId, useState, useEffect } from 'react';
import { useLenis } from 'lenis/react';
import { useMotionValue, useTransform, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface KineticPostEffectsProps {
  children: ReactNode;
  /**
   * Pixels of vertical Gaussian blur applied at maximum scroll velocity.
   * Default 8 is subtle ambient feel; values around 14–18 read as a clear
   * "feel the speed" trail and are appropriate on hero-paint pages where
   * visual impact is part of the brand. Above ~22 the type starts to
   * smear unreadably during fast flicks.
   */
  maxBlur?: number;
  /**
   * Lenis velocity that maps to maxBlur. Lower values reach max sooner
   * (more blur for less scrolling). Default 60 is calibrated for desktop
   * mouse-wheel; touchpads can hit higher peaks naturally.
   */
  velocityCeiling?: number;
  /** Optional className applied to the inner motion wrapper. */
  className?: string;
}

/**
 * Velocity-driven vertical motion blur over its children. Subscribes to
 * Lenis's per-frame velocity callback and feeds it into the stdDeviation
 * of an SVG `feGaussianBlur` filter wrapping the content.
 *
 * Scope of this component is intentionally narrow — only the kinetic blur.
 * The viscous-paint shimmer that used to live here was scoped down to
 * individual monads (see `PaintShimmer`) because it was bleeding onto
 * the type and glass surfaces and didn't read well at full-page scope.
 */
export function KineticPostEffects({
  children,
  maxBlur = 8,
  velocityCeiling = 60,
  className = 'w-full relative min-h-screen z-0',
}: KineticPostEffectsProps) {
  const pathname = usePathname();

  // Each instance needs its own filter id so two consumers (e.g. brand
  // and legacy layouts) on the same page wouldn't clash. useId() gives a
  // stable, SSR-safe value.
  const filterId = `kinetic-motion-blur-${useId().replace(/:/g, '-')}`;

  // Disable kinetic scroll effects on pages with complex inner scroll areas
  // to avoid scroll fighting and jarring full-page blur artifacts.
  const pathnameIsDisabled = pathname?.startsWith('/categories') || pathname?.startsWith('/expert') || pathname?.startsWith('/admin');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isKineticDisabled = pathnameIsDisabled || isMobile;

  const velocityY = useMotionValue(0);

  useLenis((lenis) => {
    velocityY.set(Math.abs(lenis.velocity));
  });

  // Map absolute velocity → vertical Gaussian blur. The `0,` prefix in
  // stdDeviation keeps the X axis sharp, so the blur reads as a vertical
  // streak in the scroll direction rather than a uniform fog.
  const blurY = useTransform(velocityY, [0, velocityCeiling], [0, maxBlur]);

  // Quantize to 0.5px steps and snap sub-0.5 to 0. The quantization lets
  // consecutive frames at similar velocity reuse the cached filter result
  // instead of invalidating it every Lenis tick; the snap-to-zero matters
  // because a non-`none` filter forces an offscreen composition pass even
  // when stdDeviation rounds to 0 — toggling `filter` to 'none' below the
  // perceptual threshold removes that pass entirely while at rest.
  const blurYQuantized = useTransform(blurY, (val) => {
    const rounded = Math.round(val * 2) / 2;
    return rounded < 0.5 ? 0 : rounded;
  });
  const blurYString = useTransform(blurYQuantized, (val) => `0, ${val}`);
  const filterValue = useTransform(blurYQuantized, (val) =>
    val === 0 ? 'none' : `url(#${filterId})`,
  );

  if (isKineticDisabled) {
    return <>{children}</>;
  }

  return (
    <>
      <svg
        style={{ width: 0, height: 0, position: 'absolute', pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <defs>
          <filter id={filterId}>
            <motion.feGaussianBlur
              in="SourceGraphic"
              stdDeviation={blurYString as unknown as string}
            />
          </filter>
        </defs>
      </svg>

      {/* will-change: filter is crucial for the SVG filter to be cached
          on its own compositor layer; without it Safari re-rasterises
          every velocity tick and the effect drops to ~30fps. */}
      <motion.div
        style={{
          filter: filterValue,
          willChange: 'filter, transform',
          transform: 'translateZ(0)',
        }}
        className={className}
      >
        {children}
      </motion.div>
    </>
  );
}
