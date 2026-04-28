import type { ReactNode } from "react";
import { EyebrowChip } from "@/components/brand/EyebrowChip";
import { Reveal } from "@/components/brand/motion/Reveal";
import { MixedHeadline } from "./MixedHeadline";

type Align = "center" | "start" | "split";

/**
 * Eyebrow + mixed-weight headline + optional lead, used to open every
 * content section. `align` switches between the centered-narrow opener
 * (for editorial sections like values, philosophy) and the split 7/5
 * grid used for sections that pair the title with a paragraph
 * (Breadth, Material curation).
 */
export function SectionHeader({
  eyebrow,
  headlineHeavy,
  headlineLight,
  lead,
  align = "start",
  className = "",
}: {
  eyebrow: string;
  headlineHeavy: ReactNode;
  headlineLight: ReactNode;
  lead?: ReactNode;
  align?: Align;
  className?: string;
}) {
  if (align === "center") {
    return (
      <Reveal
        className={
          "mx-auto flex max-w-3xl flex-col items-center text-center " +
          className
        }
      >
        <EyebrowChip tone="primary">{eyebrow}</EyebrowChip>
        <span aria-hidden className="mt-4 block h-px w-16 bg-primary/60" />
        <MixedHeadline
          heavy={headlineHeavy}
          light={headlineLight}
          size="section"
          className="mt-5"
        />
        {lead ? (
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {lead}
          </p>
        ) : null}
      </Reveal>
    );
  }

  if (align === "split") {
    return (
      <div
        className={
          "mx-auto grid w-full max-w-7xl gap-8 md:grid-cols-12 md:items-end md:gap-10 " +
          className
        }
      >
        <Reveal className="md:col-span-7">
          <EyebrowChip tone="primary">{eyebrow}</EyebrowChip>
          <span aria-hidden className="mt-4 block h-px w-16 bg-primary/60" />
          <MixedHeadline
            heavy={headlineHeavy}
            light={headlineLight}
            size="section"
            className="mt-5"
          />
        </Reveal>
        {lead ? (
          <Reveal delay={0.1} className="md:col-span-5">
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
              {lead}
            </p>
          </Reveal>
        ) : null}
      </div>
    );
  }

  return (
    <Reveal className={"max-w-3xl " + className}>
      <EyebrowChip tone="primary">{eyebrow}</EyebrowChip>
      <span aria-hidden className="mt-4 block h-px w-16 bg-primary/60" />
      <MixedHeadline
        heavy={headlineHeavy}
        light={headlineLight}
        size="section"
        className="mt-5"
      />
      {lead ? (
        <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
          {lead}
        </p>
      ) : null}
    </Reveal>
  );
}
