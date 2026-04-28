import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

import { ChapterHero } from "@/components/brand/sections/ChapterHero";
import { SectionHeader } from "@/components/brand/sections/SectionHeader";
import { CounterStrip } from "@/components/brand/sections/CounterStrip";
import { CTABanner } from "@/components/brand/sections/CTABanner";
import { MonadFrame } from "@/components/brand/MonadFrame";
import { Reveal } from "@/components/brand/motion/Reveal";
import {
  RevealStagger,
  RevealStaggerItem,
} from "@/components/brand/motion/RevealStagger";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about.meta");
  return { title: t("title"), description: t("description") };
}

const ACT_KEYS = ["act1", "act2", "act3"] as const;
const VALUE_KEYS = ["v1", "v2", "v3", "v4", "v5"] as const;
const COUNTER_KEYS = ["years", "categories", "customers", "partners"] as const;

export default function AboutPage() {
  const t = useTranslations("about");
  const tBrand = useTranslations("brand");
  const counterTargets: Record<(typeof COUNTER_KEYS)[number], { target: number; suffix?: string; format?: "thousands" }> = {
    years: { target: 36, suffix: "+" },
    categories: { target: 4 },
    customers: { target: 1200, format: "thousands" },
    partners: { target: 6 },
  };

  return (
    <>
      <ChapterHero
        chapter="01"
        caption={`${tBrand("chapterWord")} 01 · ${tBrand("chapters.about")}`}
        eyebrow={t("hero.eyebrow")}
        headlineHeavy={t("hero.headlineHeavy")}
        headlineLight={t("hero.headlineLight")}
        lead={t("hero.lead")}
      />

      {/* History — three acts on a vertical timeline rail */}
      <section className="relative px-6 py-24 lg:px-8 lg:py-32">
        <SectionHeader
          eyebrow={t("history.eyebrow")}
          headlineHeavy={t("history.headlineHeavy")}
          headlineLight={t("history.headlineLight")}
          align="center"
        />
        <RevealStagger
          as="ol"
          stagger={0.1}
          className="mx-auto mt-16 grid w-full max-w-5xl gap-10 md:grid-cols-3 md:gap-8"
        >
          {ACT_KEYS.map((key) => (
            <RevealStaggerItem
              as="li"
              key={key}
              className="relative flex flex-col gap-3 border-l-2 border-primary/30 pl-6 md:border-l-0 md:border-t-2 md:pl-0 md:pt-6"
            >
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
                {t(`history.acts.${key}.title`)}
              </span>
              <h3 className="font-heading text-3xl font-black leading-none tracking-tight text-foreground md:text-4xl">
                {t(`history.acts.${key}.year`)}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                {t(`history.acts.${key}.body`)}
              </p>
            </RevealStaggerItem>
          ))}
        </RevealStagger>
      </section>

      {/* Philosophy — five values in editorial cards */}
      <section className="relative px-6 py-24 lg:px-8 lg:py-32">
        <SectionHeader
          eyebrow={t("philosophy.eyebrow")}
          headlineHeavy={t("philosophy.headlineHeavy")}
          headlineLight={t("philosophy.headlineLight")}
          align="split"
        />
        <RevealStagger
          as="ul"
          stagger={0.07}
          className="mx-auto mt-16 grid w-full max-w-7xl gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3"
        >
          {VALUE_KEYS.map((k, i) => (
            <RevealStaggerItem
              as="li"
              key={k}
              className="brand-glass flex flex-col gap-4 rounded-2xl p-6 md:p-7"
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground md:text-xl">
                {t(`philosophy.values.${k}.title`)}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t(`philosophy.values.${k}.body`)}
              </p>
            </RevealStaggerItem>
          ))}
        </RevealStagger>
      </section>

      {/* Shop — two-column editorial with held-note paint anchor */}
      <section className="relative px-6 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto grid w-full max-w-7xl gap-12 md:grid-cols-12 md:items-center md:gap-10">
          <Reveal className="order-2 md:order-1 md:col-span-7">
            <SectionHeader
              eyebrow={t("shop.eyebrow")}
              headlineHeavy={t("shop.headlineHeavy")}
              headlineLight={t("shop.headlineLight")}
            />
            <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              <p>{t("shop.para1")}</p>
              <p>{t("shop.para2")}</p>
            </div>
          </Reveal>
          <Reveal
            delay={0.15}
            className="order-1 md:order-2 md:col-span-5 md:flex md:justify-end"
          >
            <div className="mx-auto w-full max-w-[360px]">
              <MonadFrame
                asset="heldNote"
                width={752}
                height={1392}
                maxDisplayWidth={360}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Counter strip */}
      <section className="relative px-6 py-24 lg:px-8 lg:py-28">
        <Reveal className="mx-auto mb-12 max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full border border-border/70 bg-card/40 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-sm">
            {t("counters.eyebrow")}
          </span>
        </Reveal>
        <CounterStrip
          items={COUNTER_KEYS.map((k) => ({
            key: k,
            target: counterTargets[k].target,
            suffix: counterTargets[k].suffix,
            format: counterTargets[k].format,
            label: t(`counters.items.${k}.label`),
          }))}
        />
      </section>

      <CTABanner
        eyebrow={t("cta.eyebrow")}
        headlineHeavy={t("cta.headlineHeavy")}
        headlineLight={t("cta.headlineLight")}
        lead={t("cta.lead")}
        ctaPrimary={{ label: t("cta.ctaPrimary"), href: "/contact" }}
        ctaSecondary={{ label: t("cta.ctaSecondary"), href: "/projects" }}
      />
    </>
  );
}
