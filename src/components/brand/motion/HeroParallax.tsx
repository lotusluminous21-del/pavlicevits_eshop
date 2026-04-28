import type { ReactNode } from "react";

type HeroParallaxProps = {
  /** The painted layer — typically a MonadFrame. Sits behind the headline. */
  monad: ReactNode;
  /** The foreground layer — typically eyebrow + headline. Static. */
  children: ReactNode;
  /** Wrapper class names (max-width, mx-auto, etc). */
  className?: string;
};

/**
 * Hero composition primitive. The painted layer is static; a slow soft
 * sheen (CSS-animated radial gradient) drifts diagonally across it,
 * suggesting light catching wet paint. The headline layer is fully
 * static — no scroll, pointer, or scale effects — and anchors inside
 * the swirl's negative-space eye on desktop.
 *
 * Mobile: headline flows below the swirl as its own block (no overlap).
 * Desktop: headline absolute-anchors with a `pb-[6%]` bias so it sits
 * slightly higher than geometric centre. After the headline was scaled
 * down to fit cleanly inside the eye, the smaller block sits naturally
 * close to the eye's visual centre and only needs a modest upward
 * nudge — a heavier bias would leave a visible void at the bottom of
 * the eye. `pb-6%` of an 850-px-tall hero ≈ 51 px of bottom padding,
 * which shifts the centred content up by ~26 px in display coords.
 */
export function HeroParallax({
  monad,
  children,
  className,
}: HeroParallaxProps) {
  const headlineClass =
    "relative mt-10 flex items-center justify-center px-6 md:absolute md:inset-0 md:mt-0 md:pb-[6%]";

  return (
    <div className={className}>
      <div className="relative">
        {monad}
        <div aria-hidden className="hero-paint-sheen" />
      </div>
      <div className={headlineClass}>{children}</div>
    </div>
  );
}
