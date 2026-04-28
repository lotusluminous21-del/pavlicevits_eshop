"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type StaggerAs = "div" | "ul" | "ol" | "dl";
type ItemAs = "div" | "li";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

type RevealStaggerProps = {
  children: ReactNode;
  className?: string;
  as?: StaggerAs;
  stagger?: number;
};

/**
 * Single IntersectionObserver on the parent; children opt into the
 * staggered reveal by being wrapped in `<RevealStaggerItem>`. Avoids the
 * N-observers cost of using <Reveal> per row.
 */
export function RevealStagger({
  children,
  className,
  as = "div",
  stagger = 0.08,
}: RevealStaggerProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </Comp>
  );
}

type RevealStaggerItemProps = {
  children: ReactNode;
  className?: string;
  as?: ItemAs;
};

export function RevealStaggerItem({
  children,
  className,
  as = "div",
}: RevealStaggerItemProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  const Comp = motion[as];
  return (
    <Comp
      className={className}
      variants={itemVariants}
      transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
    >
      {children}
    </Comp>
  );
}
