"use client";

import { motion, useReducedMotion } from "motion/react";
import * as React from "react";

/**
 * Quiet scroll reveal: a small rise and fade, once, on entering the
 * viewport. Collapses to a plain div under prefers-reduced-motion and never
 * withholds content from non-JS readers (initial opacity is applied by JS).
 */
export const Reveal = ({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
