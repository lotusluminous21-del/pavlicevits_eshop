/* eslint-disable @next/next/no-html-link-for-pages -- "/" is the static one-pager behind a rewrite; client-side <Link> would fetch an app route that isn't there */
import type { Metadata } from "next";
import { Inter, Noto_Serif_Display } from "next/font/google";
import { useTranslations } from "next-intl";

import styles from "./not-found.module.css";

/**
 * Global 404, in the brand one-pager's design: dark canvas, the site's own
 * header and footer, the heavy + light-italic headline, and the hero film's
 * first frame (a lone drop at the water's surface) behind it. Lives at the
 * root so every unmatched path resolves here; plain <a> links because "/" is
 * served by a rewrite to the static one-pager, not an app route.
 */

const sans = Inter({ subsets: ["latin", "greek"], display: "swap", variable: "--nf-sans" });
const serif = Noto_Serif_Display({
  subsets: ["latin", "greek"],
  style: ["italic"],
  display: "swap",
  variable: "--nf-serif",
});

// Next.js already sends noindex for 404 responses
export const metadata: Metadata = {
  title: { absolute: "Η σελίδα δεν βρέθηκε — PAVLICEVITS COLORS" },
};

export default function NotFound() {
  const t = useTranslations("errors.notFound");
  return (
    <div className={`${styles.page} ${sans.variable} ${serif.variable}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.backdrop} src="/brand-site/media/hero-poster.webp" alt="" aria-hidden="true" />
      <div className={styles.shade} aria-hidden="true" />

      <header className={styles.header}>
        <a className={styles.brand} href="/" aria-label="PAVLICEVITS COLORS — αρχική σελίδα">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.mark} src="/brand-site/brand/roundel.svg" alt="" aria-hidden="true" width={100} height={100} />
          <span className={styles.word}>
            <span className={styles.name}>PAVLICEVITS</span>
            <span className={styles.colors}>Colors</span>
          </span>
        </a>
        <a className={styles.cta} href="/#epikoinonia">
          Μιλήστε μας
        </a>
      </header>

      <main className={styles.main}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.emblem} src="/brand-site/brand/emblem.svg" alt="" aria-hidden="true" width={100} height={100} />
        <p className={styles.eyebrow}>{t("eyebrow")}</p>
        <h1 className={styles.headline}>
          <span className={styles.heavy}>{t("headlineHeavy")}</span>
          <span className={styles.light}>{t("headlineLight")}</span>
        </h1>
        <p className={styles.lead}>{t("lead")}</p>
        <a className={styles.button} href="/">
          {t("cta")}
          <span aria-hidden="true">→</span>
        </a>
      </main>

      <footer className={styles.footer}>
        <p className={styles.slogan}>Making Your Life Colorful.</p>
        <p className={styles.meta}>
          <span>PAVLICEVITS COLORS</span>
          <span aria-hidden="true">·</span>
          <span>Καλαμαριά, Θεσσαλονίκη</span>
          <span aria-hidden="true">·</span>
          <a href="/privacy">Πολιτική Απορρήτου</a>
          <span aria-hidden="true">·</span>
          <a href="/terms">Όροι Χρήσης</a>
        </p>
      </footer>
    </div>
  );
}
