"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";

/**
 * Continuous slow drift on hero monad imagery — within the 1500–2500ms
 * band the brand spec permits. Pauses when off-screen so the RAF loop
 * doesn't run while the user is reading another section.
 *
 * Wrap ONLY the MonadFrame element, not parents that contain absolutely
 * positioned text overlays — otherwise the headline anchored to the
 * monad's negative-space eye desyncs.
 */
export function MonadDrift({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.1 });

  if (reduced) {
    return <div ref={ref}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      animate={inView ? { y: [0, -4, 0] } : { y: 0 }}
      transition={{
        duration: 2.2,
        ease: "easeInOut",
        repeat: inView ? Infinity : 0,
      }}
    >
      {children}
    </motion.div>
  );
}
