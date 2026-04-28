import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

import { ChapterHero } from "@/components/brand/sections/ChapterHero";
import { CTABanner } from "@/components/brand/sections/CTABanner";
import { Reveal } from "@/components/brand/motion/Reveal";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal.terms.meta");
  return { title: t("title"), description: t("description") };
}

const SECTIONS = ["s1", "s2", "s3", "s4"] as const;

export default function TermsPage() {
  const t = useTranslations("legal.terms");
  const tBrand = useTranslations("brand");
  return (
    <>
      <ChapterHero
        chapter="09"
        caption={`${tBrand("chapterWord")} 09 · ${tBrand("chapters.terms")}`}
        eyebrow={t("eyebrow")}
        headlineHeavy={t("headlineHeavy")}
        headlineLight={t("headlineLight")}
        lead={t("updated")}
      />

      <article className="relative px-6 pb-24 lg:px-8 lg:pb-32">
        <div className="mx-auto w-full max-w-3xl space-y-12">
          {SECTIONS.map((s) => (
            <Reveal key={s}>
              <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                {t(`sections.${s}.title`)}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
                {t(`sections.${s}.body`)}
              </p>
            </Reveal>
          ))}
        </div>
      </article>

      <CTABanner
        headlineHeavy={t("headlineHeavy")}
        headlineLight={t("headlineLight")}
        ctaPrimary={{ label: "info@pavlicevits.gr", href: "mailto:info@pavlicevits.gr" }}
      />
    </>
  );
}
