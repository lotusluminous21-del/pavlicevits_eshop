import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { EyebrowChip } from "@/components/brand/EyebrowChip";
import { MixedHeadline } from "@/components/brand/sections/MixedHeadline";
import { CTABanner } from "@/components/brand/sections/CTABanner";
import { Reveal } from "@/components/brand/motion/Reveal";
import {
  RevealStagger,
  RevealStaggerItem,
} from "@/components/brand/motion/RevealStagger";
import { findInsight, INSIGHTS, type InsightSlug } from "@/lib/brand/insights-data";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return INSIGHTS.filter((i) => i.hasArticle).map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = findInsight(slug);
  if (!article || !article.hasArticle) return {};
  const t = await getTranslations("insights");
  return {
    title: `${t(`items.${article.slug}.title`)} — ${t("meta.title")}`,
    description: t(`items.${article.slug}.excerpt`),
  };
}

const BODY_KEYS = ["p1", "p2", "p3"] as const;

export default async function InsightDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = findInsight(slug);
  if (!article || !article.hasArticle) notFound();
  return <Article slug={article.slug as InsightSlug} />;
}

function Article({ slug }: { slug: InsightSlug }) {
  const t = useTranslations("insights");
  const related = INSIGHTS.filter((i) => i.slug !== slug).slice(0, 3);

  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-6 pt-8 lg:px-8">
        <Link
          href="/insights"
          className="group inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-foreground/85 transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
          {t("single.backToIndex")}
        </Link>
      </div>

      <section className="relative px-6 pt-10 pb-16 lg:px-8 lg:pt-12 lg:pb-20">
        <Reveal className="mx-auto w-full max-w-3xl">
          <EyebrowChip tone="primary">{t(`items.${slug}.category`)}</EyebrowChip>
          <MixedHeadline
            heavy={t(`items.${slug}.title`).split(":")[0] || t(`items.${slug}.title`)}
            light={
              t(`items.${slug}.title`).includes(":")
                ? t(`items.${slug}.title`).split(":").slice(1).join(":").trim()
                : ""
            }
            size="page"
            as="h1"
            className="mt-6"
          />
          <p className="mt-7 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {t("publishedBy")} · {t(`items.${slug}.date`)} ·{" "}
            {t(`items.${slug}.readTime`)} {t("minRead")}
          </p>
        </Reveal>
      </section>

      <article className="relative px-6 py-12 lg:px-8 lg:py-16">
        <div className="mx-auto w-full max-w-3xl space-y-12 text-base leading-relaxed text-muted-foreground md:text-lg">
          <Reveal>
            <p className="font-heading text-xl font-light italic leading-relaxed text-foreground/85 md:text-2xl">
              {t("single.body.lead")}
            </p>
          </Reveal>
          {BODY_KEYS.map((k) => (
            <Reveal key={k}>
              <h2 className="mb-4 font-heading text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                {t(`single.body.${k}Title`)}
              </h2>
              <p>{t(`single.body.${k}`)}</p>
            </Reveal>
          ))}
          <Reveal>
            <p className="border-l-2 border-primary/40 pl-5 italic text-foreground/85">
              {t("single.body.outro")}
            </p>
          </Reveal>
        </div>
      </article>

      <section className="relative px-6 py-20 lg:px-8 lg:py-24">
        <div className="mx-auto w-full max-w-7xl">
          <Reveal>
            <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {t("single.relatedTitle")}
            </h2>
          </Reveal>
          <RevealStagger
            as="ul"
            stagger={0.06}
            className="mt-10 grid gap-x-8 gap-y-10 md:grid-cols-3"
          >
            {related.map((article) => (
              <RevealStaggerItem as="li" key={article.slug}>
                <Link
                  href={`/insights/${article.slug}`}
                  className="group brand-glass flex h-full flex-col gap-3 rounded-2xl p-6"
                >
                  <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-primary">
                    {t(`items.${article.slug}.category`)}
                  </span>
                  <h3 className="font-heading text-base font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary md:text-lg">
                    {t(`items.${article.slug}.title`)}
                  </h3>
                  <span className="mt-auto inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-foreground/85 transition-colors group-hover:text-primary">
                    {t("readArticle")}
                    <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </RevealStaggerItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      <CTABanner
        headlineHeavy={t("single.ctaTitle")}
        headlineLight={t("hero.headlineLight")}
        ctaPrimary={{ label: t("single.ctaPrimary"), href: "/contact" }}
      />
    </>
  );
}
