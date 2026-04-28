import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

import { EyebrowChip } from "@/components/brand/EyebrowChip";
import { MonadFrame } from "@/components/brand/MonadFrame";
import { Reveal } from "@/components/brand/motion/Reveal";
import {
  RevealStagger,
  RevealStaggerItem,
} from "@/components/brand/motion/RevealStagger";
import { productAssets, type ProductAsset } from "@/lib/brand/product-assets";

/**
 * Movement 3 — Breadth.
 *
 * The horizon-sweep monad runs near full-bleed as a long horizontal
 * paint wave that visually divides the title-zone above from the
 * product strip below. Products are sized to feel "carried" by the
 * wave — they sit immediately below the sweep with a soft drop shadow
 * that reads as a reflection on the painted surface.
 */
const PRODUCTS: readonly ProductAsset[] = [
  "putty",
  "primer",
  "paintBucket",
  "hardener",
  "brushes",
] as const;

/**
 * Per-product visual-size compensation. The 1024×1024 PNGs vary in
 * how much of the frame the actual silhouette occupies (paint-bucket's
 * solid is ~64%×83%; hardener's bottle is only 33% wide). Rendered into
 * an identical aspect-square cell, the smaller silhouettes read as
 * "less mass" than their siblings. Per-item scale, anchored at the
 * bottom (so labels stay aligned), brings them back to optical parity.
 */
const PRODUCT_SCALE: Partial<Record<ProductAsset, string>> = {
  paintBucket: "scale-[1.18]",
  hardener: "scale-[1.12]",
  primer: "scale-[1.08]",
};

const DOMAINS = ["decorative", "marine", "industrial", "specialty"] as const;

export function Breadth() {
  const t = useTranslations("home.movements.breadth");
  return (
    <section className="relative py-24 lg:py-32">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-12 md:items-end md:gap-10">
          <Reveal className="md:col-span-7">
            <EyebrowChip tone="primary">{t("eyebrow")}</EyebrowChip>
            <span aria-hidden className="mt-4 block h-px w-16 bg-primary/60" />
            <h2 className="mt-5 font-heading text-3xl leading-[1.05] tracking-tight text-foreground md:text-4xl lg:text-5xl">
              {t("title")}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-5">
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
              {t("lead")}
            </p>
          </Reveal>
        </div>
      </div>

      {/* Horizon-sweep: aligns with the 1216px content strip below.
          The PNG aspect is ~2.76:1; capping at 1216px renders ~440px
          tall — reads as a horizon line, not a wall. */}
      <Reveal delay={0.2} className="relative mt-12 flex w-full justify-center md:mt-16">
        <MonadFrame
          asset="horizonSweep"
          width={1568}
          height={568}
          maxDisplayWidth={1216}
        />
      </Reveal>

      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <RevealStagger
          as="ul"
          stagger={0.06}
          className="mx-auto mt-2 grid max-w-5xl grid-cols-3 justify-items-center gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-5 md:gap-6 lg:gap-10"
        >
          {PRODUCTS.map((key) => (
            <RevealStaggerItem
              as="li"
              key={key}
              className="group flex flex-col items-center text-center"
            >
              <div
                className={`relative aspect-square w-full max-w-[140px] origin-bottom transition-transform duration-300 ease-out group-hover:-translate-y-1.5 md:max-w-[180px] ${
                  PRODUCT_SCALE[key] ?? ""
                }`}
              >
                <Image
                  src={productAssets[key]}
                  alt={t(`products.${key}.name`)}
                  fill
                  sizes="(min-width: 1024px) 180px, (min-width: 768px) 18vw, 33vw"
                  className="object-contain object-bottom drop-shadow-[0_22px_36px_rgba(0,0,0,0.22)] dark:drop-shadow-[0_22px_36px_rgba(0,0,0,0.45)]"
                />
              </div>
              <h3 className="mt-3 font-heading text-sm font-semibold tracking-tight text-foreground md:text-base">
                {t(`products.${key}.name`)}
              </h3>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {t(`products.${key}.note`)}
              </p>
            </RevealStaggerItem>
          ))}
        </RevealStagger>

        <RevealStagger
          stagger={0.05}
          className="mt-16 flex w-full flex-wrap items-center justify-center gap-3 md:mt-20 md:gap-4"
        >
          {DOMAINS.map((d) => (
            <RevealStaggerItem key={d}>
              <Link
                href="/services"
                className="inline-flex items-center rounded-full border border-border/70 bg-card/40 px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-foreground/85 transition-colors hover:border-primary/50 hover:text-primary md:text-sm"
              >
                {t(`domains.${d}`)}
              </Link>
            </RevealStaggerItem>
          ))}
          <RevealStaggerItem>
            <Link
              href="/services"
              className="group inline-flex items-center gap-2 px-4 py-2 text-xs font-medium tracking-tight text-foreground/85 transition-colors hover:text-primary md:text-sm"
            >
              {t("domainsCta")}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </RevealStaggerItem>
        </RevealStagger>
      </div>
    </section>
  );
}
