"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

import { Wordmark } from "./Wordmark";
import { ModeToggle } from "./ModeToggle";
import { PaintStyleToggle } from "./PaintStyleToggle";
import { LocaleSwitcher } from "./LocaleSwitcher";

const NAV_LINKS = [
  { href: "/about", key: "about" },
  { href: "/services", key: "services" },
  { href: "/projects", key: "projects" },
  { href: "/partnerships", key: "partnerships" },
  { href: "/insights", key: "insights" },
] as const;

/**
 * Match the current pathname against a nav link. Treats `/projects` as
 * the parent of `/projects/<slug>` so the tab stays highlighted while
 * the user is reading a case study; same for `/insights`.
 */
function isActiveRoute(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function SiteHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // 1px sentinel observed at the very top of the document — fires twice
  // per crossing, no scroll listener cost. See docstring in the
  // previous revision; behaviour is unchanged.
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0, rootMargin: "0px 0px -8px 0px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  // Close the mobile menu on every route change so the drawer never
  // lingers across navigations. `pathname` is the trigger.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const contactActive = isActiveRoute(pathname, "/contact");

  return (
    <>
      <div
        ref={sentinelRef}
        aria-hidden
        className="absolute left-0 top-0 h-px w-px"
      />
      <header
        // translateZ promotes the header to its own compositor layer so
        // the sticky bar can't smear during fast scrolls. Not declaring
        // `will-change` keeps the layer's memory transient.
        style={{ transform: "translateZ(0)", isolation: "isolate" }}
        className={
          "sticky top-0 z-40 w-full transition-[background-color,border-color,backdrop-filter] duration-300 " +
          (scrolled || menuOpen
            ? "border-b border-border/60 bg-background/85 backdrop-blur-md"
            : "border-b border-transparent bg-background/0")
        }
      >
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-6 lg:px-8">
          {/* Left zone — brand mark, flex-1 so the nav stays optically centered. */}
          <div className="flex flex-1 items-center justify-start">
            <Wordmark />
          </div>

          {/* Center zone — primary nav. Hidden on mobile; replaced by the
              drawer below the bar. */}
          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {NAV_LINKS.map((l) => {
                const active = isActiveRoute(pathname, l.href);
                return (
                  <li key={l.key}>
                    <Link
                      href={l.href}
                      aria-current={active ? "page" : undefined}
                      className={
                        "group relative inline-flex items-center px-3 py-2 text-sm tracking-tight transition-colors duration-200 " +
                        (active
                          ? "text-foreground"
                          : "text-foreground/65 hover:text-foreground")
                      }
                    >
                      {t(l.key)}
                      {/* The hover/active bar. Uses inset-x-3 to align
                          with the link text padding. Scale animation
                          gives it a subtle reveal from the centre on
                          hover; goes full-width and full-opacity on
                          active. */}
                      <span
                        aria-hidden
                        className={
                          "pointer-events-none absolute inset-x-3 bottom-1 h-px origin-center transition-all duration-300 " +
                          (active
                            ? "scale-x-100 bg-primary opacity-100"
                            : "scale-x-0 bg-primary/60 opacity-0 group-hover:scale-x-100 group-hover:opacity-100")
                        }
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Right zone — locale + theme toggles + contact pill + mobile
              menu trigger. flex-1 + justify-end mirrors the left zone. */}
          <div className="flex flex-1 items-center justify-end gap-2">
            <div className="hidden items-center gap-2 sm:flex">
              <LocaleSwitcher />
              <PaintStyleToggle />
              <ModeToggle />
            </div>

            <Link
              href="/contact"
              aria-current={contactActive ? "page" : undefined}
              className={
                "hidden h-9 items-center rounded-full px-4 text-sm font-medium transition-all duration-200 sm:inline-flex " +
                (contactActive
                  ? "bg-primary text-primary-foreground shadow-[0_0_0_1px_hsl(var(--primary)/0.4),0_8px_24px_-12px_hsl(var(--primary)/0.6)]"
                  : "bg-primary text-primary-foreground hover:-translate-y-px hover:shadow-[0_8px_24px_-12px_hsl(var(--primary)/0.6)]")
              }
            >
              {t("contact")}
            </Link>

            {/* Mobile menu trigger — only visible below md, since the
                nav above is already shown md+. */}
            <button
              type="button"
              aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card/40 text-foreground/80 transition-colors hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:hidden"
            >
              {menuOpen ? (
                <X className="h-4 w-4" strokeWidth={2} />
              ) : (
                <Menu className="h-4 w-4" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile drawer — slides under the bar. Render-once with
            opacity/transform transitions so it animates rather than
            popping in. Hidden via aria + visual collapse when closed. */}
        <div
          id="mobile-nav"
          className={
            "overflow-hidden border-t border-border/60 bg-background/95 backdrop-blur-md transition-[max-height,opacity] duration-300 ease-out md:hidden " +
            (menuOpen
              ? "max-h-[80vh] opacity-100"
              : "max-h-0 opacity-0 pointer-events-none")
          }
        >
          <nav
            aria-label="Mobile primary"
            className="mx-auto w-full max-w-7xl px-6 py-4 lg:px-8"
          >
            <ul className="space-y-1">
              {NAV_LINKS.map((l) => {
                const active = isActiveRoute(pathname, l.href);
                return (
                  <li key={l.key}>
                    <Link
                      href={l.href}
                      aria-current={active ? "page" : undefined}
                      className={
                        "flex items-center justify-between rounded-xl px-4 py-3 text-sm transition-colors " +
                        (active
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/85 hover:bg-card/60")
                      }
                    >
                      <span>{t(l.key)}</span>
                      {active ? (
                        <span
                          aria-hidden
                          className="block h-1.5 w-1.5 rounded-full bg-primary"
                        />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Mobile contact CTA + toggles row — toggles only render
                here when the right zone hides them on small screens. */}
            <Link
              href="/contact"
              aria-current={contactActive ? "page" : undefined}
              className="mt-4 flex h-11 items-center justify-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              {t("contact")}
            </Link>

            <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/60 pt-4 sm:hidden">
              <LocaleSwitcher />
              <div className="flex items-center gap-2">
                <PaintStyleToggle />
                <ModeToggle />
              </div>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
