import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        // text-base on small screens: 16px stops iOS Safari zooming every field.
        "h-11 w-full rounded-xs border border-field bg-coal px-4 text-base text-bone sm:text-sm",
        "placeholder:text-parch",
        "transition-colors duration-200 hover:border-gold-dim/60",
        "focus:border-gold",
        "aria-[invalid=true]:border-danger",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
