import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "h-11 w-full rounded-xs border border-line bg-coal px-4 text-sm text-bone",
        "placeholder:text-parch/60",
        "transition-colors duration-200 hover:border-gold-dim/60",
        "focus:border-gold focus:outline-none",
        "aria-[invalid=true]:border-danger",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
