import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";

import { ChapterHero } from "@/components/brand/sections/ChapterHero";
import { CTABanner } from "@/components/brand/sections/CTABanner";
import { Reveal } from "@/components/brand/motion/Reveal";
import {
  RevealStagger,
  RevealStaggerItem,
} from "@/components/brand/motion/RevealStagger";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("faq.meta");
  return { title: t("title"), description: t("description") };
}

const GROUPS = [
  { key: "general", items: ["g1", "g2", "g3"] },
  { key: "technical", items: ["t1", "t2", "t3", "t4"] },
  { key: "logistics", items: ["l1", "l2", "l3"] },
] as const;

export default function FaqPage() {
  const t = useTranslations("faq");
  const tBrand = useTranslations("brand");
  return (
    <>
      <ChapterHero
        chapter="07"
        caption={`${tBrand("chapterWord")} 07 · ${tBrand("chapters.faq")}`}
        eyebrow={t("hero.eyebrow")}
        headlineHeavy={t("hero.headlineHeavy")}
        headlineLight={t("hero.headlineLight")}
        lead={t("hero.lead")}
      />

      <section className="relative px-6 py-12 lg:px-8 lg:py-16">
        <div className="mx-auto w-full max-w-4xl space-y-16">
          {GROUPS.map((group) => (
            <Reveal key={group.key}>
              <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                {t(`groups.${group.key}.title`)}
              </h2>
              <RevealStagger as="ul" stagger={0.05} className="mt-6 space-y-3">
                {group.items.map((id) => (
                  <RevealStaggerItem as="li" key={id}>
                    <details className="group rounded-2xl border border-border bg-card/70 backdrop-blur-sm transition-colors hover:border-primary/50 open:border-primary dark:bg-card/50">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-foreground md:text-base [&::-webkit-details-marker]:hidden">
                        <span>{t(`groups.${group.key}.items.${id}.q`)}</span>
                        <Plus
                          className="h-4 w-4 shrink-0 text-primary transition-transform duration-200 group-open:rotate-45"
                          strokeWidth={2}
                        />
                      </summary>
                      <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground md:text-base">
                        {t(`groups.${group.key}.items.${id}.a`)}
                      </div>
                    </details>
                  </RevealStaggerItem>
                ))}
              </RevealStagger>
            </Reveal>
          ))}
        </div>
      </section>

      <CTABanner
        headlineHeavy={t("cta.headlineHeavy")}
        headlineLight={t("cta.headlineLight")}
        lead={t("cta.lead")}
        ctaPrimary={{ label: t("cta.ctaPrimary"), href: "/contact" }}
      />
    </>
  );
}
