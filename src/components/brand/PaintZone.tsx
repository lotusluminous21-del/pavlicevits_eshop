import type { ReactNode } from "react";
import { PaintBackdrop } from "@/components/brand/PaintBand";
import type { PaintAsset } from "@/lib/brand/paint-assets";

type PaintZoneProps = {
  asset: PaintAsset;
  /** `default` = 520/640/720 min-height; `sm` = 420/520/600. */
  height?: "default" | "sm";
  /**
   * Override for the paint image's object-fit / blend / rotation.
   * Defaults to centered, contained, with the standard dual-mode blend.
   */
  imageClassName?: string;
  /**
   * Petrol radial wash strength. `none` = no wash (default — sections
   * opt IN, since most don't need a halo); `default` = 10/26%; `quiet`
   * = 8/20%.
   */
  washIntensity?: "default" | "quiet" | "none";
  /** next/image sizes hint, forwarded to the inner PaintBackdrop. */
  sizes?: string;
  /** Forwards LCP priority to the inner PaintBackdrop. */
  priority?: boolean;
  /** Vertical alignment of children inside the zone. Default `center`. */
  items?: "center" | "end" | "start";
  /** Extra classes appended to the outer wrapper. */
  className?: string;
  /** Section content; sits in front of the paint, wrap your own container. */
  children: ReactNode;
};

const washClasses: Record<"default" | "quiet", string> = {
  default:
    "bg-[radial-gradient(ellipse_60%_70%_at_50%_50%,hsl(var(--primary)/0.10)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_60%_70%_at_50%_50%,hsl(var(--primary)/0.26)_0%,transparent_70%)]",
  quiet:
    "bg-[radial-gradient(ellipse_60%_70%_at_50%_50%,hsl(var(--primary)/0.08)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_60%_70%_at_50%_50%,hsl(var(--primary)/0.20)_0%,transparent_70%)]",
};

/**
 * Paint+glass section sandwich primitive — the WhyChoose recipe in one tag.
 *
 * Composes (in z-order, back to front):
 *   1. (optional) petrol radial wash, beneath the paint — opt-in via
 *      `washIntensity="default" | "quiet"`. Default is `none` so the
 *      page's ground state is bare canvas; sections opt in only where
 *      a localised halo earns its place (Hero, CTABanner do this with
 *      their own inline radials, not via PaintZone).
 *   2. PaintBackdrop with `lg:-inset-x-12` edge bleed and dual-mode blend
 *   3. children, sitting in flow above the paint
 *
 * Children are NOT wrapped in a max-width container — callers add their
 * own (`mx-auto max-w-7xl px-6 lg:px-8`, or any other shape) so sections
 * that need full-bleed content (like horizontal scroll strips) can opt
 * out of the constrained centre. `items` controls vertical alignment of
 * children inside the zone; default is `center`.
 *
 * Sized by the `.paint-zone` / `.paint-zone-sm` utilities so paint always
 * has visible breathing room past whatever content sits inside it.
 */
export function PaintZone({
  asset,
  height = "default",
  imageClassName = "object-contain object-center mix-blend-multiply dark:mix-blend-normal",
  washIntensity = "none",
  sizes = "(min-width: 1024px) 110vw, 100vw",
  priority = false,
  items = "center",
  className = "",
  children,
}: PaintZoneProps) {
  const heightClass = height === "sm" ? "paint-zone-sm" : "paint-zone";
  const itemsClass =
    items === "end" ? "items-end" : items === "start" ? "items-start" : "items-center";
  return (
    <div className={`relative flex ${heightClass} ${itemsClass} ${className}`}>
      {washIntensity !== "none" ? (
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 -z-10 ${washClasses[washIntensity]}`}
        />
      ) : null}
      <PaintBackdrop
        asset={asset}
        className="absolute inset-0 lg:-inset-x-12"
        imageClassName={imageClassName}
        sizes={sizes}
        priority={priority}
      />

      <div className="relative w-full">{children}</div>
    </div>
  );
}
