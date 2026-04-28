import Link from "next/link";
import { useTranslations } from "next-intl";
import { Wordmark } from "./Wordmark";

const COMPANY_LINKS = [
  { key: "about", href: "/about" },
  { key: "partnerships", href: "/partnerships" },
  { key: "insights", href: "/insights" },
  { key: "faq", href: "/faq" },
] as const;

const SERVICES_LINKS = [
  { key: "architectural", href: "/services" },
  { key: "automotive", href: "/services" },
  { key: "marine", href: "/services" },
  { key: "specialty", href: "/services" },
  { key: "colorMatch", href: "/services" },
  { key: "customColor", href: "/services" },
] as const;

const SOCIAL_LINKS = [
  { key: "instagram", href: "https://instagram.com/pavlicevits" },
  { key: "facebook", href: "https://facebook.com/pavlicevits" },
] as const;

const LEGAL_LINKS = [
  { key: "privacy", href: "/privacy" },
  { key: "terms", href: "/terms" },
] as const;

/**
 * Site-wide footer (per design pack §9). Four-column nav, contact strip,
 * legal links, and the brand slogan as the closing flourish — italic,
 * petrol, full width.
 */
export function SiteFooter() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-32 border-t border-border/60 bg-card/30">
      <div className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        {/* Top section: logo + columns */}
        <div className="grid gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-4">
            <Wordmark />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t("tagline")}
            </p>
          </div>

          <div className="md:col-span-2">
            <h3 className="mb-4 text-[11px] font-medium uppercase tracking-[0.18em] text-foreground/85">
              {t("columns.company")}
            </h3>
            <ul className="space-y-2.5 text-sm">
              {COMPANY_LINKS.map((l) => (
                <li key={l.key}>
                  <Link
                    href={l.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t(`links.${l.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="mb-4 text-[11px] font-medium uppercase tracking-[0.18em] text-foreground/85">
              {t("columns.services")}
            </h3>
            <ul className="space-y-2.5 text-sm">
              {SERVICES_LINKS.map((l) => (
                <li key={l.key}>
                  <Link
                    href={l.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t(`links.${l.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="mb-4 text-[11px] font-medium uppercase tracking-[0.18em] text-foreground/85">
              {t("columns.contact")}
            </h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <a
                  href="tel:+302310447033"
                  className="transition-colors hover:text-foreground"
                >
                  +30 2310 447 033
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@pavlicevits.gr"
                  className="transition-colors hover:text-foreground"
                >
                  info@pavlicevits.gr
                </a>
              </li>
              <li>{t("address")}</li>
            </ul>

            <h3 className="mb-3 mt-8 text-[11px] font-medium uppercase tracking-[0.18em] text-foreground/85">
              {t("columns.social")}
            </h3>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {SOCIAL_LINKS.map((l) => (
                <li key={l.key}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t(`links.${l.key}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="mt-16 flex flex-col gap-6 border-t border-border/60 pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-muted-foreground">
            © {year} Pavlicevits Colors · {t("rights")}
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs">
            {LEGAL_LINKS.map((l) => (
              <li key={l.key}>
                <Link
                  href={l.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t(`links.${l.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Slogan flourish */}
        <p className="mt-12 font-heading text-xl font-light italic tracking-tight text-primary md:text-2xl">
          {t("slogan")}
        </p>
      </div>
    </footer>
  );
}
