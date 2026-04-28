"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

import {
  PROJECTS,
  PROJECT_CATEGORIES,
  type ProjectCategory,
} from "@/lib/brand/projects-data";
import {
  RevealStagger,
  RevealStaggerItem,
} from "@/components/brand/motion/RevealStagger";

/**
 * Client-side filterable project grid. The filter state lives here so
 * the page wrapper can stay an RSC and pre-render the static heroes /
 * CTAs above and below.
 */
export function ProjectsGrid() {
  const t = useTranslations("projects");
  const [active, setActive] = useState<ProjectCategory>("all");

  const visible = useMemo(() => {
    if (active === "all") return PROJECTS;
    return PROJECTS.filter((p) => p.category === active);
  }, [active]);

  return (
    <>
      <div className="mx-auto mb-12 flex w-full max-w-7xl flex-wrap items-center justify-center gap-3 md:gap-4">
        {PROJECT_CATEGORIES.map((c) => {
          const isActive = active === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setActive(c)}
              className={
                "inline-flex items-center rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] transition-colors md:text-sm " +
                (isActive
                  ? "border-primary/60 bg-primary/15 text-primary"
                  : "border-border/70 bg-card/40 text-foreground/85 hover:border-primary/40 hover:text-primary")
              }
            >
              {t(`filters.${c}`)}
            </button>
          );
        })}
      </div>

      <RevealStagger
        as="ul"
        stagger={0.05}
        className="mx-auto grid w-full max-w-7xl gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3"
      >
        {visible.map((p, i) => (
          <RevealStaggerItem
            as="li"
            key={p.slug}
            className={i % 5 === 1 ? "md:translate-y-8" : ""}
          >
            <Link
              href={`/projects/${p.slug}`}
              className="group block focus-visible:outline-none"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl ring-1 ring-foreground/10 dark:ring-white/10">
                <Image
                  src={p.image}
                  alt={t(`items.${p.slug}.title`)}
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 90vw"
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="mt-5 flex flex-col gap-2">
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-primary">
                  {t(`items.${p.slug}.year`)} · {t(`items.${p.slug}.categoryLabel`)}
                </span>
                <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground md:text-xl">
                  {t(`items.${p.slug}.title`)}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t(`items.${p.slug}.summary`)}
                </p>
                <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.16em] text-foreground/85 transition-colors group-hover:text-primary">
                  {t("viewCase")}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          </RevealStaggerItem>
        ))}
      </RevealStagger>
    </>
  );
}
