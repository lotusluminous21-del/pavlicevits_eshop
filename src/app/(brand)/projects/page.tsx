import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

import { ChapterHero } from "@/components/brand/sections/ChapterHero";
import { CTABanner } from "@/components/brand/sections/CTABanner";
import { ProjectsGrid } from "./projects-grid";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("projects.meta");
  return { title: t("title"), description: t("description") };
}

export default function ProjectsIndexPage() {
  const t = useTranslations("projects");
  const tBrand = useTranslations("brand");
  return (
    <>
      <ChapterHero
        chapter="03"
        caption={`${tBrand("chapterWord")} 03 · ${tBrand("chapters.projects")}`}
        eyebrow={t("hero.eyebrow")}
        headlineHeavy={t("hero.headlineHeavy")}
        headlineLight={t("hero.headlineLight")}
        lead={t("hero.lead")}
      />

      <section className="relative px-6 py-12 lg:px-8 lg:py-16">
        <ProjectsGrid />
      </section>

      <CTABanner
        eyebrow={t("indexCta.eyebrow")}
        headlineHeavy={t("indexCta.headlineHeavy")}
        headlineLight={t("indexCta.headlineLight")}
        lead={t("indexCta.lead")}
        ctaPrimary={{ label: t("indexCta.ctaPrimary"), href: "/contact" }}
      />
    </>
  );
}
