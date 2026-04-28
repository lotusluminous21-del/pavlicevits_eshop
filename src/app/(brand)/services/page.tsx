import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import {
  ShieldCheck,
  Compass,
  Hammer,
  Anchor,
  Palette,
  FlaskConical,
} from "lucide-react";

import { ChapterHero } from "@/components/brand/sections/ChapterHero";
import { SectionHeader } from "@/components/brand/sections/SectionHeader";
import { CounterStrip } from "@/components/brand/sections/CounterStrip";
import { CTABanner } from "@/components/brand/sections/CTABanner";
import { Reveal } from "@/components/brand/motion/Reveal";
import {
  RevealStagger,
  RevealStaggerItem,
} from "@/components/brand/motion/RevealStagger";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("services.meta");
  return { title: t("title"), description: t("description") };
}

const SERVICE_ITEMS = [
  { key: "architectural", Icon: ShieldCheck },
  { key: "automotive", Icon: Compass },
  { key: "marine", Icon: Anchor },
  { key: "industrial", Icon: Hammer },
  { key: "colorMatch", Icon: Palette },
  { key: "customColor", Icon: FlaskConical },
] as const;

const PROCESS_KEYS = ["step1", "step2", "step3", "step4"] as const;
const COUNTER_KEYS = ["years", "categories", "customers", "specialServices"] as const;

export default function ServicesPage() {
  const t = useTranslations("services");
  const tBrand = useTranslations("brand");
  const counterTargets: Record<(typeof COUNTER_KEYS)[number], { target: number; suffix?: string; format?: "thousands" }> = {
    years: { target: 36, suffix: "+" },
    categories: { target: 4 },
    customers: { target: 1200, format: "thousands" },
    specialServices: { target: 6 },
  };

  return (
    <>
      <ChapterHero
        chapter="02"
        caption={`${tBrand("chapterWord")} 02 · ${tBrand("chapters.services")}`}
        eyebrow={t("hero.eyebrow")}
        headlineHeavy={t("hero.headlineHeavy")}
        headlineLight={t("hero.headlineLight")}
        lead={t("hero.lead")}
      />

      {/* Counter strip */}
      <section className="relative px-6 pt-12 pb-20 lg:px-8 lg:pt-8 lg:pb-24">
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

      {/* Six services */}
      <section className="relative px-6 py-24 lg:px-8 lg:py-32">
        <SectionHeader
          eyebrow={t("grid.eyebrow")}
          headlineHeavy={t("grid.headlineHeavy")}
          headlineLight={t("grid.headlineLight")}
          align="center"
        />
        <RevealStagger
          as="ul"
          stagger={0.07}
          className="mx-auto mt-16 grid w-full max-w-7xl gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3"
        >
          {SERVICE_ITEMS.map(({ key, Icon }) => (
            <RevealStaggerItem
              as="li"
              key={key}
              className="brand-glass flex flex-col gap-5 rounded-2xl p-7"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/30">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground md:text-xl">
                {t(`grid.items.${key}.title`)}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t(`grid.items.${key}.body`)}
              </p>
            </RevealStaggerItem>
          ))}
        </RevealStagger>
      </section>

      {/* Process — four steps */}
      <section className="relative px-6 py-24 lg:px-8 lg:py-32">
        <SectionHeader
          eyebrow={t("process.eyebrow")}
          headlineHeavy={t("process.headlineHeavy")}
          headlineLight={t("process.headlineLight")}
          align="center"
        />
        <RevealStagger
          as="ol"
          stagger={0.08}
          className="mx-auto mt-16 grid w-full max-w-6xl gap-10 md:grid-cols-4 md:gap-6"
        >
          {PROCESS_KEYS.map((k) => (
            <RevealStaggerItem
              as="li"
              key={k}
              className="relative flex flex-col gap-4 border-t-2 border-primary/30 pt-6"
            >
              <span className="font-heading text-3xl font-black leading-none tracking-tight text-primary">
                {t(`process.steps.${k}.number`)}
              </span>
              <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground">
                {t(`process.steps.${k}.title`)}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t(`process.steps.${k}.body`)}
              </p>
            </RevealStaggerItem>
          ))}
        </RevealStagger>
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
