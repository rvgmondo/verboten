import Image from "next/image";

import { mediaSrc } from "@/lib/media";
import type { Media } from "@/payload-types";
import { cn } from "@/lib/utils";

/**
 * Renders a Payload media doc through next/image with reserved space (no
 * layout shift). Callers pass `sizes` matched to the layout slot.
 */
export const CmsImage = ({
  media,
  sizes,
  priority = false,
  className,
  aspect,
}: {
  media: Media;
  sizes: string;
  priority?: boolean;
  className?: string;
  /** Tailwind aspect class for the frame, e.g. "aspect-[3/4]". */
  aspect?: string;
}) => {
  const src = mediaSrc(media.url);
  if (!src) return null;
  return (
    <div className={cn("relative overflow-hidden bg-coal", aspect, className)}>
      <Image
        src={src}
        alt={media.alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
};
