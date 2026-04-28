import type { ReactNode } from "react";

type EyebrowChipProps = {
  children: ReactNode;
  /** Tone: `default` is the standard chip; `primary` foregrounds petrol. */
  tone?: "default" | "primary";
  className?: string;
};

/**
 * Section eyebrow — the small UPPERCASE pill that signals "this section
 * has structure" (per 02_VISUAL_DIRECTION.md §6 — pill chips with hairline
 * borders and semi-transparent backgrounds). Standardised so every
 * section's preamble reads in the same register across both modes.
 */
export function EyebrowChip({
  children,
  tone = "default",
  className = "",
}: EyebrowChipProps) {
  const toneClass =
    tone === "primary"
      ? "border-primary/40 bg-primary/10 text-primary"
      : "border-border/70 bg-card/40 text-muted-foreground";
  return (
    <span
      className={
        "inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] backdrop-blur-sm " +
        toneClass +
        " " +
        className
      }
    >
      {children}
    </span>
  );
}
