"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import * as React from "react";

import { mediaSrc, mediaSrcAt, mediaSrcSet } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { Media } from "@/payload-types";

/**
 * Product gallery with a quiet crossfade between shots. Thumbnails are real
 * buttons: keyboard operable, labelled, with a gold ring on the active one.
 *
 * Takes the media documents rather than pre-resolved URLs. The page used to
 * pick one width for the main shot and hand that over, which meant the biggest
 * image on the shop's most important page shipped as a single fixed file with
 * no srcset: 1.49 MB of PNG, preloaded at the highest priority, into a slot
 * about 280 pixels wide on a phone. Passing the document lets the browser
 * choose, which is the whole point of the variants Payload already writes.
 *
 * Plain img elements throughout, for the reason spelled out in cms-image.tsx:
 * images.unoptimized is required on this host, so next/image is a pass-through
 * that emits no usable srcset and ships the original every time.
 */
export const ProductGallery = ({ images }: { images: Media[] }) => {
  const [index, setIndex] = React.useState(0);
  const reduce = useReducedMotion();
  const active = images[Math.max(0, Math.min(index, images.length - 1))];
  if (!active) return null;

  const activeSrc = mediaSrcAt(active, 1200) ?? mediaSrc(active.url);
  if (!activeSrc) return null;
  const activeSrcSet = mediaSrcSet(active);

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/5] overflow-hidden bg-coal">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={activeSrc}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute inset-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeSrc}
              srcSet={activeSrcSet}
              sizes={activeSrcSet ? "(min-width: 1024px) 600px, 100vw" : undefined}
              alt={active.alt}
              width={active.width ?? undefined}
              height={active.height ?? undefined}
              loading="eager"
              fetchPriority="high"
              decoding="sync"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-4" role="group" aria-label="Product images">
          {images.map((img, i) => {
            const thumb = mediaSrcAt(img, 300) ?? mediaSrc(img.url);
            if (!thumb) return null;
            return (
              <button
                key={img.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show image ${i + 1}: ${img.alt}`}
                aria-current={i === index}
                className={cn(
                  "relative aspect-square overflow-hidden border bg-smoke transition-colors",
                  i === index ? "border-gold" : "border-line hover:border-gold-dim",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumb}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
