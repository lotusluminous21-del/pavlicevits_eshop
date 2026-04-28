"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type RevealAs = "div" | "section" | "li" | "figure" | "span" | "h1";

type RevealProps = {
  children?: ReactNode;
  delay?: number;
  className?: string;
  as?: RevealAs;
  /**
   * If true, the animation fires on MOUNT instead of when the element
   * scrolls into view. Use this for above-the-fold hero content where
   * `whileInView` produces a brief flash of the pre-animated state
   * between first paint and the IntersectionObserver firing — visible
   * especially on mobile where the entire hero often fits inside the
   * initial viewport.
   *
   * Default `false` (existing whileInView behaviour) so consumers in
   * the rest of the page that DO rely on scroll-triggered reveals are
   * unaffected.
   */
  mount?: boolean;
};

const variants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
  mount = false,
}: RevealProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  const Comp = motion[as];

  if (mount) {
    return (
      <Comp
        className={className}
        initial="hidden"
        animate="visible"
        variants={variants}
        transition={{ duration: 0.7, ease: [0, 0, 0.2, 1], delay }}
      >
        {children}
      </Comp>
    );
  }

  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
      variants={variants}
      transition={{ duration: 0.6, ease: [0, 0, 0.2, 1], delay }}
    >
      {children}
    </Comp>
  );
}
