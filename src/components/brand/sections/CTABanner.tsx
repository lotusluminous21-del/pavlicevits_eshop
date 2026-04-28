import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import { EyebrowChip } from "@/components/brand/EyebrowChip";
import { MonadFrame } from "@/components/brand/MonadFrame";
import { Reveal } from "@/components/brand/motion/Reveal";
import { MixedHeadline } from "./MixedHeadline";
import type { PaintAsset } from "@/lib/brand/paint-assets";

type CTABannerProps = {
  eyebrow?: string;
  headlineHeavy: ReactNode;
  headlineLight: ReactNode;
  lead?: ReactNode;
  ctaPrimary: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
  /** Closer monad — defaults to risingBloom for narrative continuity. */
  monad?: PaintAsset;
};

/**
 * The narrative-exit pattern for every interior page (per
 * 05_EXPERIENCE_ARCHITECTURE.md §4.4). Two CTAs maximum: one
 * "next-step-in-journey" + one "convert" (per §6.1 archetypes).
 *
 * The closing monad is a rising-bloom by default — the same shape that
 * closes the homepage Invitation movement, so every page ends with the
 * same paint flourish.
 */
export function CTABanner({
  eyebrow,
  headlineHeavy,
  headlineLight,
  lead,
  ctaPrimary,
  ctaSecondary,
  monad = "risingBloom",
}: CTABannerProps) {
  return (
    <section className="relative px-6 py-24 lg:px-8 lg:py-32">
      <div className="mx-auto grid w-full max-w-7xl gap-12 md:grid-cols-12 md:items-center md:gap-10">
        <Reveal className="order-2 md:order-1 md:col-span-7">
          {eyebrow ? <EyebrowChip tone="primary">{eyebrow}</EyebrowChip> : null}
          <span aria-hidden className="mt-4 block h-px w-16 bg-primary/60" />
          <MixedHeadline
            heavy={headlineHeavy}
            light={headlineLight}
            size="section"
            className="mt-5"
          />
          {lead ? (
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {lead}
            </p>
          ) : null}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <Link
              href={ctaPrimary.href}
              className="group inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground shadow-[0_0_0_1px_hsl(var(--primary)/0.4)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_8px_24px_-12px_hsl(var(--primary)/0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {ctaPrimary.label}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            {ctaSecondary ? (
              <Link
                href={ctaSecondary.href}
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground/85 transition-colors duration-200 hover:text-primary"
              >
                {ctaSecondary.label}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            ) : null}
          </div>
        </Reveal>

        <Reveal
          delay={0.15}
          className="order-1 md:order-2 md:col-span-5 md:flex md:items-center md:justify-end"
        >
          <div className="mx-auto w-full max-w-[320px] opacity-70 md:opacity-100">
            <MonadFrame
              asset={monad}
              width={752}
              height={1392}
              maxDisplayWidth={320}
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
