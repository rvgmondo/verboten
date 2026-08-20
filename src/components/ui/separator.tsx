import * as React from "react";

import { cn } from "@/lib/utils";
import { Crest } from "@/components/brand/crest";

export const Separator = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHRElement>) => (
  <hr className={cn("hairline border-t", className)} {...props} />
);

/** A section divider with the crest resting on the rule. Use sparingly. */
export const CrestDivider = ({ className }: { className?: string }) => (
  <div aria-hidden="true" className={cn("flex items-center gap-6", className)}>
    <span className="hairline block h-px flex-1 border-t" />
    <Crest className="h-7 w-7 text-gold-dim" />
    <span className="hairline block h-px flex-1 border-t" />
  </div>
);
