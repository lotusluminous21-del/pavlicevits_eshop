import { useTranslations } from "next-intl";
import { ShieldCheck, Compass, Hammer } from "lucide-react";

import { EyebrowChip } from "@/components/brand/EyebrowChip";
import { MonadFrame } from "@/components/brand/MonadFrame";
import { Reveal } from "@/components/brand/motion/Reveal";
import {
  RevealStagger,
  RevealStaggerItem,
} from "@/components/brand/motion/RevealStagger";
import type { PaintAsset } from "@/lib/brand/paint-assets";

type PropositionItem = {
  key: "curation" | "specifier" | "longevity";
  monad: PaintAsset;
  Icon: typeof ShieldCheck;
};

/**
 * Movement 2 — Proposition.
 *
 * Three pair-tiles arranged as a constellation. Each tile is dominated
 * by a large painterly monad (vortex / calligraphic flourish / layered
 * formation), with a glass content plate sitting below it with a
 * deliberate negative-margin overlap so the paint and the card visibly
 * intertwine without paint being covered by the card.
 */
const ITEMS: readonly PropositionItem[] = [
  { key: "curation", monad: "propositionA", Icon: ShieldCheck },
  { key: "specifier", monad: "propositionB", Icon: Compass },
  { key: "longevity", monad: "propositionC", Icon: Hammer },
] as const;

export function Proposition() {
  const t = useTranslations("home.movements.proposition");
  return (
    <section className="relative px-6 py-24 lg:px-8 lg:py-32">
      <Reveal className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <EyebrowChip tone="primary">{t("eyebrow")}</EyebrowChip>
        <span aria-hidden className="mt-4 block h-px w-16 bg-primary/60" />
        <h2 className="mt-5 font-heading text-3xl leading-[1.05] tracking-tight text-foreground md:text-4xl lg:text-5xl">
          {t("title")}
        </h2>
      </Reveal>

      <RevealStagger
        as="ul"
        stagger={0.1}
        className="mx-auto mt-14 grid w-full max-w-7xl gap-y-16 md:mt-20 md:grid-cols-3 md:gap-x-6 md:gap-y-0 lg:gap-x-10"
      >
        {ITEMS.map(({ key, monad, Icon }, i) => (
          <RevealStaggerItem
            as="li"
            key={key}
            className={`relative flex flex-col items-stretch ${
              i === 1 ? "md:translate-y-10" : ""
            }`}
          >
            <div className="relative mx-auto w-full max-w-[420px]">
              <MonadFrame
                asset={monad}
                width={1024}
                height={1024}
                maxDisplayWidth={420}
              />
            </div>

            <div className="brand-glass relative isolate -mt-16 mx-auto max-w-[360px] overflow-hidden rounded-2xl p-6 md:p-7 lg:-mt-20">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/30">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <h3 className="mt-5 font-heading text-xl font-semibold tracking-tight text-foreground">
                {t(`items.${key}.title`)}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                {t(`items.${key}.body`)}
              </p>
            </div>
          </RevealStaggerItem>
        ))}
      </RevealStagger>
    </section>
  );
}
