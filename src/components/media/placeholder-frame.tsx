import { Crest } from "@/components/brand/crest";
import { cn } from "@/lib/utils";

/**
 * CONTENT PLACEHOLDER. Reserves the exact slot for a real photograph that is
 * not shot yet, at the correct aspect ratio, so layouts are final before the
 * assets arrive. Every use is listed on the content shot list in the README.
 */
export const PlaceholderFrame = ({
  label,
  aspect = "aspect-[3/4]",
  className,
}: {
  /** What the real shot is, e.g. "Bottle on black, front label". */
  label: string;
  aspect?: string;
  className?: string;
}) => (
  <div
    role="img"
    aria-label={`Placeholder for photography: ${label}`}
    className={cn(
      "hairline relative flex items-center justify-center overflow-hidden border bg-smoke",
      aspect,
      className,
    )}
  >
    <div className="absolute inset-3 border border-gold-dim/25" aria-hidden="true" />
    <div className="relative flex flex-col items-center gap-4 px-6 text-center">
      <Crest className="h-12 w-12 text-gold-dim/60" />
      <p className="text-[0.625rem] uppercase tracking-[0.25em] text-parch">{label}</p>
    </div>
  </div>
);
