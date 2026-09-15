import { Crest } from "@/components/brand/crest";
import { cn } from "@/lib/utils";

/**
 * CONTENT PLACEHOLDER. Reserves the exact slot for a real photograph that is
 * not shot yet, at the correct aspect ratio, so layouts are final before the
 * assets arrive.
 *
 * The label is an authoring note and is never rendered. It used to be painted
 * into the frame and read to screen readers as "Placeholder for photography",
 * which put internal shot-list copy on /serves and on every product card still
 * waiting for a photograph. ArtPlaceholder had the same fault and was fixed
 * first; this is the second copy of it. The frame is decoration, and every use
 * already sits beside a real heading.
 */
export const PlaceholderFrame = ({
  label: _label,
  aspect = "aspect-[3/4]",
  className,
}: {
  /** Authoring note naming the shot this frame awaits. Never rendered. */
  label?: string;
  aspect?: string;
  className?: string;
}) => (
  <div
    aria-hidden="true"
    className={cn(
      "hairline relative flex items-center justify-center overflow-hidden border bg-smoke",
      aspect,
      className,
    )}
  >
    <div className="absolute inset-3 border border-gold-dim/25" aria-hidden="true" />
    <div className="relative flex flex-col items-center gap-4 px-6 text-center">
      <Crest className="h-12 w-12 text-gold-dim/60" />
    </div>
  </div>
);
