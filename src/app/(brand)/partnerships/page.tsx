import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

import { ChapterHero } from "@/components/brand/sections/ChapterHero";
import { SectionHeader } from "@/components/brand/sections/SectionHeader";
import { CTABanner } from "@/components/brand/sections/CTABanner";
import { EyebrowChip } from "@/components/brand/EyebrowChip";
import { MixedHeadline } from "@/components/brand/sections/MixedHeadline";
import { MonadFrame } from "@/components/brand/MonadFrame";
import { Reveal } from "@/components/brand/motion/Reveal";
import {
  RevealStagger,
  RevealStaggerItem,
} from "@/components/brand/motion/RevealStagger";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("partnerships.meta");
  return { title: t("title"), description: t("description") };
}

const OTHER_PARTNERS = [
  "vivechrom",
  "vechro",
  "kraft",
  "vitex",
  "isomat",
] as const;

const TEST_KEYS = ["t1", "t2", "t3", "t4", "t5", "t6"] as const;

export default function PartnershipsPage() {
  const t = useTranslations("partnerships");
  const tBrand = useTranslations("brand");
  return (
    <>
      <ChapterHero
        chapter="04"
        caption={`${tBrand("chapterWord")} 04 · ${tBrand("chapters.partnerships")}`}
        eyebrow={t("hero.eyebrow")}
        headlineHeavy={t("hero.headlineHeavy")}
        headlineLight={t("hero.headlineLight")}
        lead={t("hero.lead")}
      />

      {/* Pellachrom — full editorial block */}
      <section className="relative px-6 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto grid w-full max-w-7xl gap-14 md:grid-cols-12 md:items-start md:gap-10">
          <Reveal className="md:col-span-7">
            <EyebrowChip tone="primary">{t("pellachrom.eyebrow")}</EyebrowChip>
            <span aria-hidden className="mt-4 block h-px w-16 bg-primary/60" />
            <MixedHeadline
              heavy={t("pellachrom.headlineHeavy")}
              light={t("pellachrom.headlineLight")}
              size="section"
              className="mt-5"
            />
            <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              <p>{t("pellachrom.para1")}</p>
              <p>{t("pellachrom.para2")}</p>
              <p>{t("pellachrom.para3")}</p>
              <p>{t("pellachrom.para4")}</p>
            </div>
          </Reveal>
          <Reveal delay={0.15} className="md:col-span-5 md:flex md:justify-end">
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

      {/* Other partners */}
      <section className="relative px-6 py-24 lg:px-8 lg:py-32">
        <SectionHeader
          eyebrow={t("others.eyebrow")}
          headlineHeavy={t("others.headlineHeavy")}
          headlineLight={t("others.headlineLight")}
          align="center"
        />
        <RevealStagger
          as="ul"
          stagger={0.07}
          className="mx-auto mt-16 grid w-full max-w-6xl gap-6 md:grid-cols-2"
        >
          {OTHER_PARTNERS.map((k) => (
            <RevealStaggerItem
              as="li"
              key={k}
              className="brand-glass flex flex-col gap-4 rounded-2xl p-7"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-heading text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                  {t(`others.items.${k}.name`)}
                </h3>
              </div>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
                {t(`others.items.${k}.subtitle`)}
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                {t(`others.items.${k}.body`)}
              </p>
            </RevealStaggerItem>
          ))}
        </RevealStagger>
      </section>

      {/* Curation — six tests */}
      <section className="relative px-6 py-24 lg:px-8 lg:py-32">
        <SectionHeader
          eyebrow={t("curation.eyebrow")}
          headlineHeavy={t("curation.headlineHeavy")}
          headlineLight={t("curation.headlineLight")}
          align="split"
          lead={t("curation.intro")}
        />
        <RevealStagger
          as="ol"
          stagger={0.05}
          className="mx-auto mt-16 grid w-full max-w-6xl gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3"
        >
          {TEST_KEYS.map((k, i) => (
            <RevealStaggerItem
              as="li"
              key={k}
              className="flex flex-col gap-3 border-l-2 border-primary/30 pl-5"
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground">
                {t(`curation.tests.${k}.title`)}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t(`curation.tests.${k}.body`)}
              </p>
            </RevealStaggerItem>
          ))}
        </RevealStagger>
        <Reveal className="mx-auto mt-12 max-w-3xl text-center">
          <p className="font-heading text-lg font-light italic text-foreground/85 md:text-xl">
            {t("curation.outro")}
          </p>
        </Reveal>
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
