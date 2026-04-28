import { CountUp } from "@/components/brand/motion/CountUp";
import {
  RevealStagger,
  RevealStaggerItem,
} from "@/components/brand/motion/RevealStagger";

export type Counter = {
  /** Stable key for keyed list output. */
  key: string;
  target: number;
  suffix?: string;
  format?: "integer" | "thousands";
  label: string;
  /** Optional caption rendered under the label, body/sm. */
  caption?: string;
};

/**
 * The counter strip — 3-4 large stats laid out in line, used as the
 * trust-signal closer for About, Services, and Home (per
 * 05_EXPERIENCE_ARCHITECTURE.md §5.x — counter strip).
 */
export function CounterStrip({ items }: { items: readonly Counter[] }) {
  return (
    <RevealStagger
      as="dl"
      stagger={0.1}
      className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 md:gap-x-10"
    >
      {items.map(({ key, target, suffix, format, label, caption }) => (
        <RevealStaggerItem
          key={key}
          className="flex flex-col items-start gap-3 border-l-2 border-primary/40 pl-5 md:pl-6"
        >
          <dt className="font-heading text-4xl font-black leading-none tracking-tight text-foreground md:text-5xl">
            <CountUp target={target} suffix={suffix} format={format} />
          </dt>
          <dd className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </dd>
          {caption ? (
            <dd className="text-sm leading-relaxed text-muted-foreground">
              {caption}
            </dd>
          ) : null}
        </RevealStaggerItem>
      ))}
    </RevealStagger>
  );
}
