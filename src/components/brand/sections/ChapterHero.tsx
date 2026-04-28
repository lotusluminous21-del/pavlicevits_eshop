import type { ReactNode } from "react";

import { EyebrowChip } from "@/components/brand/EyebrowChip";
import { Reveal } from "@/components/brand/motion/Reveal";
import { MixedHeadline } from "./MixedHeadline";

type ChapterHeroProps = {
  /** Chapter slot in the brand sequence — "01" through "09". */
  chapter: string;
  /** Caption sitting under the rule, already localised. */
  caption: string;
  eyebrow: string;
  headlineHeavy: ReactNode;
  headlineLight: ReactNode;
  lead?: ReactNode;
  /** CTA row / filter chips slotted under the lead. */
  children?: ReactNode;
};

/**
 * Interior-page hero. Used on every route that doesn't earn its
 * photography — i.e. everything except the home narrative arc, the
 * closer CTABanner, and project/article detail heroes (which use real
 * photography).
 *
 * Identity per page comes from typography only — a giant italic petrol
 * numeral on the right, plus the route's eyebrow + mixed headline on
 * the left. Cohesion across pages comes from the same template + the
 * shared petrol corner vignette.
 */
export function ChapterHero({
  chapter,
  caption,
  eyebrow,
  headlineHeavy,
  headlineLight,
  lead,
  children,
}: ChapterHeroProps) {
  return (
    <section className="relative overflow-hidden px-6 pt-20 pb-24 lg:px-8 lg:pt-28 lg:pb-32">
      <div
        aria-hidden
        className="paint-vignette-corner-bl pointer-events-none absolute inset-0 -z-10"
      />
      <div className="mx-auto grid w-full max-w-7xl gap-14 md:grid-cols-12 md:items-center md:gap-10">
        <Reveal className="md:col-span-7">
          <EyebrowChip tone="primary">{eyebrow}</EyebrowChip>
          <span aria-hidden className="mt-4 block h-px w-16 bg-primary/60" />
          <MixedHeadline
            heavy={headlineHeavy}
            light={headlineLight}
            size="page"
            as="h1"
            className="mt-6"
          />
          {lead ? (
            <p className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {lead}
            </p>
          ) : null}
          {children ? <div className="mt-8">{children}</div> : null}
        </Reveal>

        <Reveal
          delay={0.15}
          className="md:col-span-5 md:flex md:items-center md:justify-end"
        >
          <ChapterMark chapter={chapter} caption={caption} />
        </Reveal>
      </div>
    </section>
  );
}

/**
 * The numeral mark itself. Decorative — the eyebrow already names the
 * section for assistive tech, so the whole block is aria-hidden.
 *
 * The leading-[0.85] is deliberate: at this size Inter's italic
 * descender on `9` and the cap-height on `1` produce a lot of optical
 * whitespace, and tightening the line-height lets the numeral sit on
 * the rule below it without a gulf of dead space.
 */
function ChapterMark({
  chapter,
  caption,
}: {
  chapter: string;
  caption: string;
}) {
  return (
    <div aria-hidden className="relative inline-block text-left">
      <span className="block font-heading text-[10rem] font-light italic leading-[0.85] tracking-tighter text-primary md:text-[14rem] lg:text-[16rem]">
        {chapter}
      </span>
      <span className="mt-3 block h-px w-full bg-primary/40" />
      <span className="mt-3 block text-[10px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
        {caption}
      </span>
    </div>
  );
}
