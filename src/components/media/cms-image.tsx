/* eslint-disable @next/next/no-img-element */
import { mediaSrc, mediaSrcAt, mediaSrcSet } from "@/lib/media";
import type { Media } from "@/payload-types";
import { cn } from "@/lib/utils";

/**
 * Renders a Payload media doc in a frame that reserves its space (no layout
 * shift), serving the right file for the slot.
 *
 * A plain <img> on purpose. images.unoptimized is required on this host, which
 * makes next/image a wrapper that always ships the original upload and emits no
 * usable srcset. Payload already writes thumbnail, card, feature and hero
 * variants on upload, so the responsive set is built from those instead: a 64px
 * cart thumbnail downloads a 400px file, not a multi-megabyte photograph.
 */
export const CmsImage = ({
  media,
  sizes,
  priority = false,
  className,
  aspect,
  /** Roughly how wide this renders at its largest, in CSS pixels. */
  slotWidth = 768,
}: {
  media: Media;
  sizes: string;
  priority?: boolean;
  className?: string;
  /** Tailwind aspect class for the frame, e.g. "aspect-[3/4]". */
  aspect?: string;
  slotWidth?: number;
}) => {
  // Ask for roughly 2x the slot so the default src is sharp on retina.
  const src = mediaSrcAt(media, slotWidth * 2) ?? mediaSrc(media.url);
  if (!src) return null;
  const srcSet = mediaSrcSet(media);

  return (
    <div className={cn("relative overflow-hidden bg-coal", aspect, className)}>
      <img
        src={src}
        srcSet={srcSet}
        sizes={srcSet ? sizes : undefined}
        alt={media.alt}
        width={media.width ?? undefined}
        height={media.height ?? undefined}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding={priority ? "sync" : "async"}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
};
