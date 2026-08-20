import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Buttons hold the quiet register: sharp corners, tracked-out caps, no
 * gradients or glow. Primary is the only solid gold moment on a page.
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 select-none",
    "rounded-xs font-sans font-medium uppercase tracking-[0.14em]",
    "transition-colors duration-200",
    "disabled:pointer-events-none disabled:opacity-40",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: "bg-gold text-ink hover:bg-gold-bright active:bg-gold",
        outline:
          "border border-gold-dim/70 text-bone hover:border-gold hover:text-gold-bright",
        ghost: "text-parch hover:text-bone",
        danger: "border border-danger/60 text-danger hover:border-danger",
      },
      size: {
        sm: "h-9 px-4 text-[0.6875rem]",
        md: "h-11 px-6 text-xs",
        lg: "h-13 px-8 text-[0.8125rem]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
