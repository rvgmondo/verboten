import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * The standard section opening: gold eyebrow, display-face title, optional
 * lead. Keeps heading rhythm identical across the site.
 */
export const SectionHeading = ({
  eyebrow,
  title,
  lead,
  align = "left",
  as: Heading = "h2",
  className,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
  className?: string;
}) => (
  <div
    className={cn(
      "max-w-2xl",
      align === "center" && "mx-auto text-center",
      className,
    )}
  >
    {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
    <Heading className="font-display text-4xl leading-[1.05] tracking-tight text-bone sm:text-5xl">
      {title}
    </Heading>
    {lead && <p className="mt-5 text-base leading-relaxed text-parch">{lead}</p>}
  </div>
);
