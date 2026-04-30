import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, Plus } from "lucide-react";

import { EyebrowChip } from "@/components/brand/EyebrowChip";
import { MonadFrame } from "@/components/brand/MonadFrame";
import { Reveal } from "@/components/brand/motion/Reveal";
import {
  RevealStagger,
  RevealStaggerItem,
} from "@/components/brand/motion/RevealStagger";

const FAQ_KEYS = ["q1", "q2", "q3"] as const;

/**
 * Movement 5 — Invitation.
 *
 * The rising-bloom monad is the page's closer: a tall fountain shape
 * rising from the lower-centre. FAQ (3 items + link) sits to its left,
 * CTA copy + buttons to its right at md+. On mobile the order becomes
 * FAQ → CTA → Bloom (closer flourish), so the CTA isn't pushed below
 * the fold by the tall monad.
 */
export function Invitation() {
  const t = useTranslations("home.movements.invitation");
  return (
    <section className="relative px-6 pb-32 pt-24 lg:px-8 lg:pb-40 lg:pt-28">
      <Reveal className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
        <EyebrowChip tone="primary">{t("eyebrow")}</EyebrowChip>
        <span aria-hidden className="mt-4 block h-px w-16 bg-primary/60" />
      </Reveal>

      <div className="mx-auto mt-12 flex w-full max-w-7xl flex-col gap-y-16 md:mt-16 md:grid md:grid-cols-12 md:items-center md:gap-x-0 md:gap-y-0">
        <Reveal className="order-1 md:order-none md:col-span-4 md:px-6">
          <h3 className="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            {t("faqTitle")}
          </h3>
          <RevealStagger as="ul" stagger={0.07} className="relative z-10 mt-6 space-y-3">
            {FAQ_KEYS.map((k) => (
              <RevealStaggerItem as="li" key={k}>
                <details className="group rounded-2xl border border-border bg-card/70 backdrop-blur-sm transition-colors hover:border-primary/50 open:border-primary dark:bg-card/50">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:text-base [&::-webkit-details-marker]:hidden">
                    <span>{t(`faqItems.${k}.q`)}</span>
                    <Plus
                      className="h-4 w-4 shrink-0 text-primary transition-transform duration-200 group-open:rotate-45"
                      strokeWidth={2}
                    />
                  </summary>
                  <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground md:text-base">
                    {t(`faqItems.${k}.a`)}
                  </div>
                </details>
              </RevealStaggerItem>
            ))}
          </RevealStagger>
          <div className="mt-6 flex justify-end">
            <Link
              href="/faq"
              className="group inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-foreground/85 transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {t("faqReadAll")}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>

        <Reveal
          delay={0.15}
          className="order-3 md:order-none md:col-span-4 md:flex md:items-center md:justify-center"
        >
          <div className="mx-auto w-full max-w-[360px]">
            <MonadFrame
              asset="risingBloom"
              width={752}
              height={1392}
              maxDisplayWidth={360}
            />
          </div>
        </Reveal>

        <Reveal
          delay={0.1}
          className="order-2 md:order-none md:col-span-4 md:px-6"
        >
          <h3 className="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            {t("ctaTitle")}
          </h3>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
            {t("ctaLead")}
          </p>
          <div className="relative z-10 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/contact"
              className="group inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground shadow-[0_0_0_1px_hsl(var(--primary)/0.4)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_8px_24px_-12px_hsl(var(--primary)/0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {t("ctaPrimary")}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-11 items-center px-2 text-sm font-medium text-foreground/85 transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {t("ctaSecondary")}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
