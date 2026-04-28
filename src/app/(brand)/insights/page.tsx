import type { Metadata } from "next";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";

import { ChapterHero } from "@/components/brand/sections/ChapterHero";
import { CTABanner } from "@/components/brand/sections/CTABanner";
import {
  RevealStagger,
  RevealStaggerItem,
} from "@/components/brand/motion/RevealStagger";
import { INSIGHTS } from "@/lib/brand/insights-data";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("insights.meta");
  return { title: t("title"), description: t("description") };
}

export default function InsightsIndexPage() {
  const t = useTranslations("insights");
  const tBrand = useTranslations("brand");
  return (
    <>
      <ChapterHero
        chapter="05"
        caption={`${tBrand("chapterWord")} 05 · ${tBrand("chapters.insights")}`}
        eyebrow={t("hero.eyebrow")}
        headlineHeavy={t("hero.headlineHeavy")}
        headlineLight={t("hero.headlineLight")}
        lead={t("hero.lead")}
      />

      <section className="relative px-6 py-12 lg:px-8 lg:py-16">
        <RevealStagger
          as="ul"
          stagger={0.05}
          className="mx-auto grid w-full max-w-7xl gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3"
        >
          {INSIGHTS.map((article) => (
            <RevealStaggerItem as="li" key={article.slug}>
              <Link
                href={`/insights/${article.slug}`}
                className="group block focus-visible:outline-none"
              >
                <div className="brand-glass flex h-full flex-col gap-4 rounded-2xl p-7">
                  <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-primary">
                    {t(`items.${article.slug}.category`)}
                  </span>
                  <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary md:text-xl">
                    {t(`items.${article.slug}.title`)}
                  </h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t(`items.${article.slug}.excerpt`)}
                  </p>
                  <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-4">
                    <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      {t(`items.${article.slug}.date`)} ·{" "}
                      {t(`items.${article.slug}.readTime`)} {t("minRead")}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-foreground/85 transition-colors group-hover:text-primary">
                      {t("readArticle")}
                      <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </RevealStaggerItem>
          ))}
        </RevealStagger>
      </section>

      <CTABanner
        headlineHeavy={t("single.ctaTitle")}
        headlineLight={t("hero.headlineLight")}
        ctaPrimary={{ label: t("single.ctaPrimary"), href: "/contact" }}
      />
    </>
  );
}
