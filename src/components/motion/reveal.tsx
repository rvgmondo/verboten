import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Quiet scroll reveal: a small rise and fade as the block enters the viewport.
 *
 * Pure CSS, and deliberately so. The previous version used a motion component
 * whose initial state was inlined during server rendering, so six sections of
 * the home page, product price and shop buttons among them, were delivered as
 * opacity 0 and only became visible once the motion chunk had loaded and an
 * observer had fired. Decorative motion must never decide whether content is
 * readable.
 *
 * The animation is attached in globals.css behind
 * `@supports (animation-timeline: view())`. Browsers that can do scroll-driven
 * animation without JavaScript get the reveal; every other browser gets the
 * content immediately, which is the right way round.
 */
export const Reveal = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={cn("reveal", className)}>{children}</div>;
