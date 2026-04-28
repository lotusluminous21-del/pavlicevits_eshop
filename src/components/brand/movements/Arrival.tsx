"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

import { EyebrowChip } from "@/components/brand/EyebrowChip";
import { MonadFrame } from "@/components/brand/MonadFrame";
import { HeroParallax } from "@/components/brand/motion/HeroParallax";
import { Reveal } from "@/components/brand/motion/Reveal";

/**
 * Movement 1 — Arrival.
 *
 * Desktop: the painted swirl spans the full viewport width and rides
 * a 1.6s wave-themed entrance — a left-leaning translate with residual
 * scale and a camera-blur that clears as it settles. The image is
 * still the LCP candidate (priority + fetchPriority="high" on the
 * underlying <img>); the entrance just opacity-ramps a layer the
 * browser has already decoded. Headline elements ride their own
 * delays on top.
 *
 *   t=0     painted swirl         (desktop) — 1.6s wave-themed entrance
 *   t=0.10  eyebrow chip          fade + 16 px lift
 *   t=0.25  rule line             scale-x from centre (brushstroke)
 *   t=0.35  italic headline       fade + 24 px lift
 *   t=0.50  bold headline         fade + 24 px lift
 *   t=0.75  lead                  fade + 16 px lift
 *   t=0.95  primary CTA           fade + 16 px lift
 *   t=1.05  secondary CTA         fade + 16 px lift
 *   t=1.20  closing painted swirl (mobile only — fade + scale 0.96→1)
 *
 * Mobile inverts the image/headline relationship: headline is the
 * first visible content (text-native to portrait), and the painted
 * swirl arrives last as a closing flourish below the CTAs.
 */
const EASE_OUT = [0, 0, 0.2, 1] as const;

export function Arrival() {
  const t = useTranslations("home.movements.arrival");
  const reducedMotion = useReducedMotion();

  // Headline DOM is shared between mobile (in flow) and desktop
  // (overlaid on the painted swirl via HeroParallax). Reveal-mount
  // wrappers fire on mount, not whileInView — above-the-fold content
  // shouldn't wait for an IntersectionObserver to fire after first
  // paint.
  const headline = (
    <div className="flex max-w-md flex-col items-center text-center">
      <Reveal mount delay={0.10} className="mb-2">
        <EyebrowChip>{t("eyebrow")}</EyebrowChip>
      </Reveal>

      {/* Rule line — brushstroke metaphor: scale-x from centre.
          Inline motion.span (not Reveal) because Reveal's variant is
          fade-up; this needs a different transform. */}
      {reducedMotion ? (
        <span aria-hidden className="mb-2 block h-px w-12 bg-primary/60" />
      ) : (
        <motion.span
          aria-hidden
          className="mb-2 block h-px w-12 bg-primary/60"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.25 }}
          style={{ originX: 0.5 }}
        />
      )}

      <h1 className="font-heading text-[2.75rem] leading-[1.0] tracking-tight text-foreground sm:text-[2.875rem] md:text-[2.5rem] lg:text-[2.75rem] xl:text-[3rem]">
        <Reveal
          mount
          delay={0.35}
          as="span"
          className="block font-normal italic text-foreground/90"
        >
          {t("headlineLight")}
        </Reveal>
        <Reveal mount delay={0.5} as="span" className="block font-black">
          {t("headlineHeavy")}
        </Reveal>
      </h1>
    </div>
  );

  return (
    <section className="relative flex flex-col items-center overflow-hidden px-4 pt-10 pb-16 sm:px-6 lg:px-8 lg:pt-0 lg:pb-16">
      {/* MOBILE — headline takes the lead. */}
      <div className="mt-2 md:hidden">{headline}</div>

      {/* DESKTOP — swirl breaks out to full viewport width. The
          section's `items-center` already centers its children, so an
          explicit `w-screen` child renders symmetrically across the
          viewport (100vw item in a narrower content box → equal
          overflow on both sides, clipped by section's overflow-hidden).
          width/height match the natural webp (2912×1412); passing the
          right ratio is what stops the canvas from vertically
          stretching the paint. */}
      <div className="relative hidden w-screen md:block">
        {reducedMotion ? (
          <HeroParallax
            className="relative mx-auto w-full"
            monad={
              <MonadFrame
                asset="arrivalAnchor"
                width={2912}
                height={1412}
                priority
              />
            }
          >
            {headline}
          </HeroParallax>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 1.05, x: -28, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, x: 0, filter: "blur(0px)" }}
            transition={{
              duration: 1.6,
              ease: [0.16, 1, 0.3, 1],
              opacity: { duration: 1.1, ease: "easeOut" },
            }}
          >
            <HeroParallax
              className="relative mx-auto w-full"
              monad={
                <MonadFrame
                  asset="arrivalAnchor"
                  width={2912}
                  height={1412}
                  priority
                />
              }
            >
              {headline}
            </HeroParallax>
          </motion.div>
        )}
      </div>

      <Reveal
        mount
        delay={0.75}
        className="mt-8 max-w-xl text-balance text-center text-base leading-relaxed text-muted-foreground md:text-lg"
      >
        <p>{t("lead")}</p>
      </Reveal>

      {/* CTAs animate as a unit — one Reveal mount wrapper containing
          the row. A single fade-up reads more confidently here than
          two staggered button entrances would. */}
      <Reveal
        mount
        delay={0.95}
        className="mt-8 flex w-full max-w-md flex-col items-center gap-4 sm:w-auto sm:max-w-none sm:flex-row sm:gap-6"
      >
        <Link
          href="/projects"
          className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground shadow-[0_0_0_1px_hsl(var(--primary)/0.4)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_8px_24px_-12px_hsl(var(--primary)/0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:h-11 sm:w-auto"
        >
          {t("ctaPrimary")}
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
        <Link
          href="/contact"
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground/85 transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {t("ctaSecondary")}
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </Reveal>

      {/* MOBILE — closing visual flourish. Fade-in PLUS subtle scale
          (0.96 → 1) so the paint reads as "settling into place" — like
          a stamp pressing down. priority={false}: not an LCP element
          on mobile (the headline above is). */}
      {reducedMotion ? (
        <div className="mt-12 w-full md:hidden">
          <MonadFrame asset="arrivalAnchor" width={1456} height={706} />
        </div>
      ) : (
        <motion.div
          className="mt-12 w-full md:hidden"
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.0, ease: EASE_OUT, delay: 1.2 }}
        >
          <MonadFrame asset="arrivalAnchor" width={1456} height={706} />
        </motion.div>
      )}
    </section>
  );
}
