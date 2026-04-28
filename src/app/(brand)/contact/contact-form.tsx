"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

const INPUT_CLASS =
  "w-full rounded-xl border border-border/60 bg-background/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring/40";

const PROJECT_TYPES = [
  { value: "architectural", labelKey: "projectArchitectural" },
  { value: "automotive", labelKey: "projectAutomotive" },
  { value: "marine", labelKey: "projectMarine" },
  { value: "specialty", labelKey: "projectSpecialty" },
] as const;

/**
 * The contact form (per 05_EXPERIENCE_ARCHITECTURE.md §6.2 + 08_WEBSITE_COPY
 * §8.2). Five fields, one project-type radio, message field as the
 * differentiator placeholder. On submit we simulate a wait and switch to
 * the confirmation panel — wiring to a backend lives outside the brand
 * site rebuild scope.
 */
export function ContactForm() {
  const t = useTranslations("contact.form");
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle");

  if (status === "sent") {
    return (
      <div className="brand-glass rounded-2xl p-8 md:p-10">
        <p className="font-heading text-lg font-light italic leading-relaxed text-foreground md:text-xl">
          {t("confirmation")}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setStatus("submitting");
        // Backend wiring is intentionally out of scope for the brand
        // rebuild — we fake an async ack so the UI flow can be reviewed
        // end-to-end. Replace with a server action or API route later.
        setTimeout(() => setStatus("sent"), 600);
      }}
      className="brand-glass space-y-6 rounded-2xl p-7 md:p-9"
      noValidate
    >
      <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground md:text-2xl">
        {t("title")}
      </h2>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label={t("fields.name")}>
          <input
            type="text"
            name="name"
            required
            placeholder={t("fields.namePlaceholder")}
            className={INPUT_CLASS}
          />
        </Field>
        <Field label={t("fields.email")}>
          <input
            type="email"
            name="email"
            required
            placeholder={t("fields.emailPlaceholder")}
            className={INPUT_CLASS}
          />
        </Field>
      </div>

      <Field label={t("fields.phone")}>
        <input
          type="tel"
          name="phone"
          placeholder={t("fields.phonePlaceholder")}
          className={INPUT_CLASS}
        />
      </Field>

      <fieldset className="space-y-3">
        <legend className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {t("fields.projectType")}
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {PROJECT_TYPES.map((p) => (
            <label
              key={p.value}
              className="group flex cursor-pointer items-center gap-3 rounded-xl border border-border/60 bg-card/40 px-4 py-3 text-sm transition-colors hover:border-primary/40 has-[:checked]:border-primary/60 has-[:checked]:bg-primary/10 has-[:checked]:text-primary"
            >
              <input
                type="radio"
                name="projectType"
                value={p.value}
                className="accent-primary"
              />
              {t(`fields.${p.labelKey}` as `fields.${typeof p.labelKey}`)}
            </label>
          ))}
        </div>
      </fieldset>

      <Field label={t("fields.message")}>
        <textarea
          name="message"
          required
          rows={6}
          placeholder={t("fields.messagePlaceholder")}
          className={INPUT_CLASS + " min-h-32 resize-y"}
        />
      </Field>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="group inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground shadow-[0_0_0_1px_hsl(var(--primary)/0.4)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_8px_24px_-12px_hsl(var(--primary)/0.6)] disabled:opacity-60"
      >
        {t("submit")}
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="block text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
