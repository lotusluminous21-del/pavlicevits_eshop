"use client";

import Image from "next/image";
import { getPaintAsset, type PaintAsset } from "@/lib/brand/paint-assets";
import { usePaintStyle } from "@/providers/PaintStyleProvider";

type PaintBackdropProps = {
  asset: PaintAsset;
  /**
   * Tailwind position/sizing classes applied to the absolute container.
   * Defaults to a full-bleed horizontal band centered vertically.
   */
  className?: string;
  /** Image fit/positioning. Defaults to cover/center. */
  imageClassName?: string;
  priority?: boolean;
  /** next/image sizes hint. */
  sizes?: string;
};

/**
 * A clean, opaque, free-flowing paint PNG positioned as a section backdrop.
 *
 * The PNGs have transparent backgrounds (preprocessed once) so they composite
 * directly onto whatever surface they sit on — white in light, near-black in
 * dark. Asset URL is resolved at render time against the active paint style
 * from PaintStyleProvider, so toggling between "brand" and "realistic"
 * swaps every backdrop on the page in one go.
 */
export function PaintBackdrop({
  asset,
  className = "absolute inset-x-0 top-1/2 h-[520px] -translate-y-1/2",
  imageClassName = "object-cover object-center",
  priority = false,
  sizes = "100vw",
}: PaintBackdropProps) {
  const { style } = usePaintStyle();
  const src = getPaintAsset(asset, style);
  return (
    <div aria-hidden className={"pointer-events-none -z-10 " + className}>
      <Image
        key={src}
        src={src}
        alt=""
        fill
        sizes={sizes}
        priority={priority}
        className={imageClassName}
      />
    </div>
  );
}

type PaintArtworkProps = {
  asset: PaintAsset;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
};

/**
 * Standalone paint piece used as inline editorial artwork (hero centerpiece,
 * featured project visual). No frame, no mount, no shadows. The paint is the
 * composition; caller controls aspect/size via className. Asset URL is
 * resolved against the active paint style — same toggle behavior as
 * PaintBackdrop.
 */
export function PaintArtwork({
  asset,
  className = "",
  imageClassName = "object-contain object-center",
  priority = false,
  sizes = "(min-width: 1024px) 1024px, 100vw",
}: PaintArtworkProps) {
  const { style } = usePaintStyle();
  const src = getPaintAsset(asset, style);
  return (
    <div className={"relative " + className}>
      <Image
        key={src}
        src={src}
        alt=""
        fill
        sizes={sizes}
        priority={priority}
        className={imageClassName}
      />
    </div>
  );
}
