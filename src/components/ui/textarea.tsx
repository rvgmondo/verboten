import * as React from "react";

import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-28 w-full rounded-xs border border-line bg-coal px-4 py-3 text-base text-bone sm:text-sm",
      "placeholder:text-parch/60",
      "transition-colors duration-200 hover:border-gold-dim/60",
      "focus:border-gold",
      "aria-[invalid=true]:border-danger",
      "disabled:cursor-not-allowed disabled:opacity-40",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
