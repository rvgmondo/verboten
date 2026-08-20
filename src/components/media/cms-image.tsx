import Image from "next/image";

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
  if (!media.url) return null;
  return (
    <div className={cn("relative overflow-hidden bg-coal", aspect, className)}>
      <Image
        src={media.url}
        alt={media.alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
};
