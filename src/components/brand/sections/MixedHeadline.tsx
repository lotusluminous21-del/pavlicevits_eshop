import type { ReactNode } from "react";

type Size = "page" | "section" | "card";

const SIZES: Record<Size, string> = {
  page: "text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem]",
  section: "text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem]",
  card: "text-xl md:text-2xl",
};

/**
 * The brand's signature typographic device — heavy sans line followed by
 * a light italic line. Always rendered on two lines (block + block).
 *
 * The italic phrase is *always* the modifier, never the opener (per
 * 08_WEBSITE_COPY.md §13). Color of the italic line lifts toward petrol
 * to carry the editorial rhythm.
 */
export function MixedHeadline({
  heavy,
  light,
  size = "section",
  as: As = "h2",
  className = "",
}: {
  heavy: ReactNode;
  light: ReactNode;
  size?: Size;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <As
      className={
        "font-heading leading-[1.05] tracking-tight text-foreground " +
        SIZES[size] +
        " " +
        className
      }
    >
      <span className="block font-black">{heavy}</span>
      <span className="block font-light italic text-foreground/80">
        {light}
      </span>
    </As>
  );
}
