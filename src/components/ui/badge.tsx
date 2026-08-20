import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-xs border px-2.5 py-1 text-[0.625rem] font-medium uppercase tracking-[0.18em]",
  {
    variants: {
      variant: {
        gold: "border-gold-dim/70 text-gold",
        quiet: "border-line text-parch",
        soldOut: "border-line bg-smoke text-parch",
        low: "border-gold-dim/70 bg-gold/10 text-gold-bright",
      },
    },
    defaultVariants: { variant: "quiet" },
  },
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

export const Badge = ({ className, variant, ...props }: BadgeProps) => (
  <span className={cn(badgeVariants({ variant }), className)} {...props} />
);
