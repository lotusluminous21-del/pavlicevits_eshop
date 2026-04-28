"use client";

import {
  animate,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  motion,
} from "framer-motion";
import { useEffect, useRef } from "react";

type Formatter = "integer" | "thousands";

type CountUpProps = {
  /** Final integer value (e.g. 35, 240, 1200). */
  target: number;
  /** Trailing string appended after the formatted number ("+", ""). */
  suffix?: string;
  /**
   * Serializable formatter key. Functions can't cross the
   * server/client boundary, so we pass an enum and resolve here.
   * - "integer": rounds to int (default)
   * - "thousands": divides by 1000 and appends "k" (1200 → "1.2k")
   */
  format?: Formatter;
  /** Tween duration in seconds. */
  duration?: number;
  /** Class names forwarded to the motion.span. */
  className?: string;
};

const FORMATTERS: Record<Formatter, (value: number) => string> = {
  integer: (value) => Math.round(value).toString(),
  thousands: (value) => `${(value / 1000).toFixed(1)}k`,
};

export function CountUp({
  target,
  suffix = "",
  format = "integer",
  duration = 1.4,
  className,
}: CountUpProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const value = useMotionValue(0);
  const formatter = FORMATTERS[format];
  const display = useTransform(
    value,
    (latest) => `${formatter(latest)}${suffix}`,
  );

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      value.set(target);
      return;
    }
    const controls = animate(value, target, {
      duration,
      ease: [0, 0, 0.2, 1],
    });
    return () => controls.stop();
  }, [inView, reduced, target, duration, value]);

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
}
