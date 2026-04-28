import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

import { EyebrowChip } from "@/components/brand/EyebrowChip";
import { MonadFrame } from "@/components/brand/MonadFrame";
import { CountUp } from "@/components/brand/motion/CountUp";
import { Reveal } from "@/components/brand/motion/Reveal";
import {
  RevealStagger,
  RevealStaggerItem,
} from "@/components/brand/motion/RevealStagger";
import { projectAssets } from "@/lib/brand/project-assets";

type CounterKey = "years" | "projects" | "partners" | "rejected";

type Counter = {
  key: CounterKey;
  target: number;
  suffix?: string;
  format?: "integer" | "thousands";
};

const COUNTERS: readonly Counter[] = [
  { key: "years", target: 35, suffix: "+" },
  { key: "projects", target: 240 },
  { key: "partners", target: 6 },
  { key: "rejected", target: 1200, format: "thousands" },
] as const;

/**
 * Movement 4 — Proof.
 *
 * The held-note monad is the slowest, most contemplative paint moment:
 * a tall vertical drip with a terminal bead. It sits as the right-hand
 * column's full-height anchor; the project case study takes the left
 * column. The monad's terminal drip points downward toward the pull
 * quote that opens beneath it, so the quote reads as having "fallen
 * out of" the paint. Counters close the movement full-width.
 */
export function Proof() {
  const t = useTranslations("home.movements.proof");
  return (
    <section className="relative px-6 py-24 lg:px-8 lg:py-32">
      <div className="mx-auto grid w-full max-w-7xl gap-10 md:grid-cols-12 md:items-start md:gap-12">
        <div className="md:col-span-7">
          <Reveal>
            <EyebrowChip tone="primary">{t("eyebrow")}</EyebrowChip>
            <span aria-hidden className="mt-4 block h-px w-16 bg-primary/60" />
            <h2 className="mt-5 font-heading text-3xl leading-[1.08] tracking-tight text-foreground md:text-4xl lg:text-[2.5rem]">
              {t("title")}
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-8 md:grid-cols-12 md:items-start md:gap-10">
            <Reveal className="md:col-span-7">
              <div className="relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-2xl ring-1 ring-foreground/10 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.35)] dark:ring-white/10 dark:shadow-[0_24px_60px_-30px_rgba(0,0,0,0.7)]">
                <Image
                  src={projectAssets.hellenicCoastVan}
                  alt={t("title")}
                  fill
                  sizes="(min-width: 1024px) 38vw, (min-width: 768px) 42vw, 100vw"
                  className="object-cover object-center"
                />
              </div>
            </Reveal>
            <Reveal delay={0.1} className="md:col-span-5">
              <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                {t("body")}
              </p>
              <dl className="mt-6 divide-y divide-border/60 border-y border-border/60">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-baseline justify-between gap-4 py-3"
                  >
                    <dt className="text-[10px] font-medium uppercase tracking-[0.18em] text-primary">
                      {t(
                        `stat${i}Label` as
                          | "stat1Label"
                          | "stat2Label"
                          | "stat3Label"
                      )}
                    </dt>
                    <dd className="text-right text-sm font-medium text-foreground">
                      {t(
                        `stat${i}Value` as
                          | "stat1Value"
                          | "stat2Value"
                          | "stat3Value"
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
              <Link
                href="/projects"
                className="group mt-6 inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {t("projectCta")}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </Reveal>
          </div>
        </div>

        <Reveal
          delay={0.15}
          className="flex md:col-span-5 md:items-start md:justify-center"
        >
          <div className="mx-auto w-full max-w-[480px]">
            <MonadFrame
              asset="heldNote"
              width={752}
              height={1392}
              maxDisplayWidth={480}
            />
          </div>
        </Reveal>
      </div>

      {/* Pull quote opens directly under the held-note's terminal drip. */}
      <Reveal as="figure" className="mx-auto mt-16 max-w-3xl text-center md:mt-20">
        <svg
          aria-hidden
          viewBox="0 0 32 24"
          className="mx-auto h-7 w-9 text-primary/80"
          fill="currentColor"
        >
          <path d="M0 24V12.8C0 5.728 4.512 1.024 13.536 0v5.12C9.248 6.144 6.464 8.96 6.144 12.8H13.6V24H0Zm18.4 0V12.8C18.4 5.728 22.912 1.024 31.936 0v5.12c-4.288 1.024-7.072 3.84-7.392 7.68H32V24H18.4Z" />
        </svg>
        <blockquote className="mt-5 font-heading text-2xl font-light italic leading-[1.25] tracking-tight text-foreground md:text-3xl lg:text-4xl">
          &ldquo;{t("quoteBody")}&rdquo;
        </blockquote>
        <figcaption className="mt-6 text-[11px] font-medium uppercase tracking-[0.2em] text-foreground/70">
          {t("quoteAttribution")}
        </figcaption>
      </Reveal>

      <RevealStagger
        as="dl"
        stagger={0.1}
        className="mx-auto mt-20 grid w-full max-w-6xl grid-cols-2 gap-x-6 gap-y-10 md:mt-24 md:grid-cols-4 md:gap-x-10"
      >
        {COUNTERS.map(({ key, target, suffix, format }) => (
          <RevealStaggerItem
            key={key}
            className="flex flex-col items-start gap-3 border-l-2 border-primary/40 pl-5 md:pl-6"
          >
            <dt className="font-heading text-4xl font-black leading-none tracking-tight text-foreground md:text-5xl">
              <CountUp target={target} suffix={suffix} format={format} />
            </dt>
            <dd className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {t(`counters.${key}.label`)}
            </dd>
          </RevealStaggerItem>
        ))}
      </RevealStagger>
    </section>
  );
}
