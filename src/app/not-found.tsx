import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

import { EyebrowChip } from "@/components/brand/EyebrowChip";
import { MixedHeadline } from "@/components/brand/sections/MixedHeadline";
import { MonadFrame } from "@/components/brand/MonadFrame";
import { SiteHeader } from "@/components/brand/SiteHeader";
import { SiteFooter } from "@/components/brand/SiteFooter";

/**
 * Global 404. Lives at the root (outside route groups) so any
 * un-matched path resolves through it. Mirrors the brand layout
 * structure manually because root-level not-found pages bypass the
 * `(brand)` layout.
 */
export default function NotFound() {
  const t = useTranslations("errors.notFound");
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden px-6 pt-20 pb-32 lg:px-8 lg:pt-28">
          <div className="mx-auto grid w-full max-w-7xl gap-12 md:grid-cols-12 md:items-center md:gap-10">
            <div className="md:col-span-7">
              <EyebrowChip tone="primary">{t("eyebrow")}</EyebrowChip>
              <MixedHeadline
                heavy={t("headlineHeavy")}
                light={t("headlineLight")}
                size="page"
                as="h1"
                className="mt-6"
              />
              <p className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {t("lead")}
              </p>
              <Link
                href="/"
                className="group mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground shadow-[0_0_0_1px_hsl(var(--primary)/0.4)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_8px_24px_-12px_hsl(var(--primary)/0.6)]"
              >
                {t("cta")}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>
            <div className="md:col-span-5">
              <div className="mx-auto w-full max-w-[360px]">
                <MonadFrame
                  asset="propositionA"
                  width={1024}
                  height={1024}
                  maxDisplayWidth={360}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
