"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import * as React from "react";

import { cn } from "@/lib/utils";

export type GalleryImage = { url: string; alt: string };

/**
 * Product gallery with a quiet crossfade between shots. Thumbnails are real
 * buttons: keyboard operable, labelled, with a gold ring on the active one.
 */
export const ProductGallery = ({ images }: { images: GalleryImage[] }) => {
  const [index, setIndex] = React.useState(0);
  const reduce = useReducedMotion();
  const active = images[Math.max(0, Math.min(index, images.length - 1))];
  if (!active) return null;

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/5] overflow-hidden bg-coal">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={active.url}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Image
              src={active.url}
              alt={active.alt}
              fill
              sizes="(min-width: 1024px) 600px, 100vw"
              priority
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-4" role="group" aria-label="Product images">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show image ${i + 1}: ${img.alt}`}
              aria-current={i === index}
              className={cn(
                "relative aspect-square overflow-hidden border bg-smoke transition-colors",
                i === index ? "border-gold" : "border-line hover:border-gold-dim",
              )}
            >
              <Image src={img.url} alt="" fill sizes="150px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
