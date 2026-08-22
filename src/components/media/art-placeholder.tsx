import { Crest } from "@/components/brand/crest";
import { cn } from "@/lib/utils";

/**
 * An art-directed stand-in for photography that has not been shot yet.
 * Atmospheric on purpose (candle glow, grain, a faint crest) so the page
 * reads as designed rather than broken, with a quiet slot label naming the
 * shot it is holding space for. Swap for a CmsImage when the photo lands.
 */
export const ArtPlaceholder = ({
  shot,
  aspect = "aspect-[4/3]",
  className,
}: {
  /** The photograph this frame is waiting for, e.g. "Cans on ice at dusk". */
  shot: string;
  aspect?: string;
  className?: string;
}) => (
  <div
    role="img"
    aria-label={`Placeholder for photography: ${shot}`}
    className={cn(
      "inverse relative flex items-end overflow-hidden border border-line bg-ink",
      aspect,
      className,
    )}
  >
    {/* Candlelight */}
    <div
      aria-hidden="true"
      className="absolute left-1/2 top-1/2 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(205,184,141,0.14),rgba(205,184,141,0.04)_50%,transparent_75%)]"
    />
    {/* The crest, half-seen in the dark */}
    <Crest
      aria-hidden="true"
      className="absolute left-1/2 top-1/2 h-2/5 w-2/5 -translate-x-1/2 -translate-y-1/2 text-gold opacity-[0.16]"
    />
    {/* Grain and vignette */}
    <div aria-hidden="true" className="grain absolute inset-0 opacity-[0.06]" />
    <div
      aria-hidden="true"
      className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.55),transparent_45%)]"
    />
    <p className="relative z-10 p-4 text-[0.625rem] uppercase tracking-[0.2em] text-parch">
      {shot}
    </p>
  </div>
);
