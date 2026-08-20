import { formatZAR } from "@/lib/money";
import { cn } from "@/lib/utils";

export const Price = ({
  cents,
  className,
}: {
  cents: number;
  className?: string;
}) => (
  <span className={cn("font-display text-xl text-gold", className)}>
    {formatZAR(cents)}
  </span>
);
