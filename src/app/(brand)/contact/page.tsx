import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";

import { ChapterHero } from "@/components/brand/sections/ChapterHero";
import { Reveal } from "@/components/brand/motion/Reveal";
import { ContactForm } from "./contact-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contact.meta");
  return { title: t("title"), description: t("description") };
}

const SIDE_PANELS = ["phone", "visit", "hours", "email"] as const;

const MAP_SRC =
  "https://www.google.com/maps?q=Leoforos%20Ethnikis%20Antistaseos%2066%2C%20Kalamaria%2055133%2C%20Thessaloniki&output=embed";
const MAP_LINK =
  "https://www.google.com/maps/search/?api=1&query=Leoforos%20Ethnikis%20Antistaseos%2066%2C%20Kalamaria%2055133%2C%20Thessaloniki";

export default function ContactPage() {
  const t = useTranslations("contact");
  const tBrand = useTranslations("brand");
  return (
    <>
      <ChapterHero
        chapter="06"
        caption={`${tBrand("chapterWord")} 06 · ${tBrand("chapters.contact")}`}
        eyebrow={t("hero.eyebrow")}
        headlineHeavy={t("hero.headlineHeavy")}
        headlineLight={t("hero.headlineLight")}
        lead={t("hero.lead")}
      />

      <section className="relative px-6 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto grid w-full max-w-7xl gap-10 md:grid-cols-12">
          <Reveal className="md:col-span-7">
            <ContactForm />
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-5">
            <ul className="space-y-8">
              {SIDE_PANELS.map((p) => (
                <li key={p}>
                  <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
                    {t(`side.${p}.eyebrow`)}
                  </span>
                  <div className="mt-3 space-y-1 text-sm leading-relaxed text-foreground md:text-base">
                    {p === "email" ? (
                      <a
                        href={`mailto:${t("side.email.value")}`}
                        className="text-foreground transition-colors hover:text-primary"
                      >
                        {t("side.email.value")}
                      </a>
                    ) : (
                      (
                        t.raw(`side.${p}.lines`) as readonly string[]
                      ).map((line, i) => <p key={i}>{line}</p>)
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Map */}
      <section className="relative px-6 pb-24 lg:px-8 lg:pb-32">
        <div className="mx-auto w-full max-w-7xl">
          <Reveal>
            <div className="mb-6 flex items-end justify-between gap-6">
              <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                {t("map.title")}
              </h2>
              <a
                href={MAP_LINK}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.16em] text-foreground/85 transition-colors hover:text-primary"
              >
                {t("map.openIn")}
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl ring-1 ring-foreground/10 dark:ring-white/10">
              <iframe
                src={MAP_SRC}
                title={t("map.title")}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
