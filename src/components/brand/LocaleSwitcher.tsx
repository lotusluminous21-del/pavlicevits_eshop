"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { setLocale } from "@/app/actions/set-locale";
import { locales, type Locale } from "@/i18n/config";

const labels: Record<Locale, string> = { en: "EN", el: "ΕΛ" };

export function LocaleSwitcher() {
  const current = useLocale() as Locale;
  const t = useTranslations("nav");
  const [pending, startTransition] = useTransition();

  return (
    <div
      role="group"
      aria-label={t("switchLocale")}
      className="inline-flex h-9 items-center rounded-full border border-border/60 bg-card/40 p-0.5 text-xs font-medium tracking-[0.06em]"
    >
      {locales.map((loc) => {
        const active = loc === current;
        return (
          <button
            key={loc}
            type="button"
            disabled={pending || active}
            onClick={() => startTransition(() => setLocale(loc))}
            className={
              "inline-flex h-8 min-w-[2.25rem] items-center justify-center rounded-full px-2 transition-colors " +
              (active
                ? "bg-primary text-primary-foreground"
                : "text-foreground/70 hover:text-foreground")
            }
          >
            {labels[loc]}
          </button>
        );
      })}
    </div>
  );
}
