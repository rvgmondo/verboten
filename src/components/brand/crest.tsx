/* eslint-disable @next/next/no-img-element */
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * The real brand marks, served from public/brand/ (cached immutable).
 *
 * Crest: the flat gold skull-and-wings, for small moments (nav, dividers)
 * where the badge's ring text would be unreadable.
 * BrandBadge: the full circular seal ("Pure Spirit. Pure Mischief."), for
 * moments with room: order pages, watermarks, stamps.
 *
 * Plain <img> on purpose: these render in server and client components alike,
 * sizes come from className, and the image pipeline is unoptimized anyway.
 */
export const Crest = ({
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <img
    src="/brand/crest.png"
    alt=""
    aria-hidden="true"
    className={cn("object-contain", className)}
    {...props}
  />
);

export const BrandBadge = ({
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <img
    src="/brand/badge.png"
    alt=""
    aria-hidden="true"
    className={cn("object-contain", className)}
    {...props}
  />
);
