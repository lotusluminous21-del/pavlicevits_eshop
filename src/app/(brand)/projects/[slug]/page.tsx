import type { Metadata } from "next";
import Image from "next/image";
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
import { findProject, PROJECTS, type ProjectSlug } from "@/lib/brand/projects-data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

/**
 * Only the slugs with a full case study are statically rendered. Other
 * slugs return 404 — better than rendering an empty page that the
 * navigation says exists.
 */
export function generateStaticParams() {
  return PROJECTS.filter((p) => p.hasCaseStudy).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project || !project.hasCaseStudy) return {};
  const t = await getTranslations("projects");
  const title = `${t(`items.${project.slug}.title`)} — ${t("meta.title")}`;
  const description = t(`items.${project.slug}.summary`);
  return { title, description };
}

const TECH_KEYS = [
  "substrate",
  "conditions",
  "system",
  "products",
  "application",
  "lifespan",
] as const;

const BODY_KEYS = ["brief", "spec", "application", "result"] as const;

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project || !project.hasCaseStudy) notFound();
  return <Detail slug={project.slug as ProjectSlug} />;
}

function Detail({ slug }: { slug: ProjectSlug }) {
  const t = useTranslations("projects");
  const project = findProject(slug)!;
  const related = PROJECTS.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <>
      {/* Back link */}
      <div className="mx-auto w-full max-w-7xl px-6 pt-8 lg:px-8">
        <Link
          href="/projects"
          className="group inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-foreground/85 transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
          {t("filters.all")}
        </Link>
      </div>

      {/* Hero */}
      <section className="relative px-6 pt-10 pb-20 lg:px-8 lg:pt-12 lg:pb-24">
        <div className="mx-auto w-full max-w-7xl">
          <Reveal>
            <EyebrowChip tone="primary">
              {t(`items.${slug}.year`)} · {t(`items.${slug}.categoryLabel`)}
            </EyebrowChip>
            <MixedHeadline
              heavy={t(`items.${slug}.title`)}
              light={t(`items.${slug}.subtitle`)}
              size="page"
              as="h1"
              className="mt-6 max-w-3xl"
            />
          </Reveal>
          <Reveal delay={0.1} className="mt-12">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl ring-1 ring-foreground/10 dark:ring-white/10">
              <Image
                src={project.image}
                alt={t(`items.${slug}.title`)}
                fill
                priority
                sizes="(min-width: 1280px) 1216px, 100vw"
                className="object-cover object-center"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Tech grid */}
      <section className="relative px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto grid w-full max-w-7xl gap-12 md:grid-cols-12 md:gap-10">
          <Reveal className="md:col-span-4">
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
              {t("single.techGrid.title")}
            </span>
            <h2 className="mt-4 font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {t(`items.${slug}.title`)}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-8">
            <dl className="divide-y divide-border/60 border-y border-border/60">
              {TECH_KEYS.map((k) => (
                <div
                  key={k}
                  className="grid grid-cols-1 gap-2 py-5 sm:grid-cols-12 sm:gap-6"
                >
                  <dt className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground sm:col-span-4">
                    {t(`single.techGrid.${k}`)}
                  </dt>
                  <dd className="text-sm leading-relaxed text-foreground sm:col-span-8 md:text-base">
                    {t(`single.${slug}.tech.${k}`)}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* Body — editorial paragraphs */}
      <section className="relative px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto w-full max-w-3xl space-y-12">
          {BODY_KEYS.map((k) => (
            <Reveal key={k}>
              <h3 className="font-heading text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                {t(`single.body.${k}Title`)}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
                {t(`single.${slug}.body.${k}`)}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Related */}
      <section className="relative px-6 py-20 lg:px-8 lg:py-28">
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
            {related.map((p) => (
              <RevealStaggerItem as="li" key={p.slug}>
                <Link href={`/projects/${p.slug}`} className="group block">
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl ring-1 ring-foreground/10 dark:ring-white/10">
                    <Image
                      src={p.image}
                      alt={t(`items.${p.slug}.title`)}
                      fill
                      sizes="(min-width: 1024px) 30vw, 90vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="mt-4">
                    <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-primary">
                      {t(`items.${p.slug}.year`)} · {t(`items.${p.slug}.categoryLabel`)}
                    </span>
                    <h3 className="mt-2 font-heading text-base font-semibold tracking-tight text-foreground md:text-lg">
                      {t(`items.${p.slug}.title`)}
                    </h3>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.16em] text-foreground/85 transition-colors group-hover:text-primary">
                      {t("viewCase")}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </RevealStaggerItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      <CTABanner
        headlineHeavy={t("single.cta.headlineHeavy")}
        headlineLight={t("single.cta.headlineLight")}
        ctaPrimary={{ label: t("single.cta.ctaPrimary"), href: "/contact" }}
      />
    </>
  );
}
