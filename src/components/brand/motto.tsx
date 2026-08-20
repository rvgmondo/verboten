import { cn } from "@/lib/utils";

/**
 * The Afrikaans brand lines as designed typographic moments, never body text.
 * Spelling is exact and non-negotiable: VIR DIÉ WAT WEET.
 */
export const Motto = ({
  line = "VIR DIÉ WAT WEET",
  className,
}: {
  line?: "VIR DIÉ WAT WEET" | "MEMORIES NOT REGRETS";
  className?: string;
}) => (
  <p
    lang={line === "VIR DIÉ WAT WEET" ? "af" : "en"}
    className={cn(
      "font-display text-sm uppercase tracking-motto text-gold-dim",
      className,
    )}
  >
    {line}
  </p>
);
