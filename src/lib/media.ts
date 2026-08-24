import type { Media } from "@/payload-types";

/**
 * Payload returns media URLs absolute (serverURL + /api/media/file/...).
 * Same-origin media is normalised to its relative path, which works in every
 * environment without coupling image config to the deploy URL.
 */
export const mediaSrc = (url?: string | null): string | null => {
  if (!url) return null;
  if (!/^https?:\/\//.test(url)) return url;
  try {
    const u = new URL(url);
    return `${u.pathname}${u.search}`;
  } catch {
    return url;
  }
};

/** The generated variants, smallest first. `og` is for share cards, not layout. */
const LAYOUT_SIZES = ["thumbnail", "card", "feature", "hero"] as const;

export type MediaSizeName = (typeof LAYOUT_SIZES)[number];

type Variant = { url: string; width: number };

/** Every generated variant that actually exists, plus the original, ascending. */
const variantsOf = (media: Media): Variant[] => {
  const out: Variant[] = [];
  for (const name of LAYOUT_SIZES) {
    const s = media.sizes?.[name];
    const url = mediaSrc(s?.url);
    if (url && s?.width) out.push({ url, width: s.width });
  }
  const originalUrl = mediaSrc(media.url);
  // The original is the widest candidate, but only when it is genuinely larger
  // than the biggest variant; otherwise it just duplicates an entry.
  if (originalUrl && media.width) {
    const widest = out.length ? out[out.length - 1].width : 0;
    if (media.width > widest) out.push({ url: originalUrl, width: media.width });
  }
  return out.sort((a, b) => a.width - b.width);
};

/**
 * A real srcset built from Payload's generated variants.
 *
 * next/image cannot do this for us: images.unoptimized is required on this host
 * (the optimizer cannot write its cache behind the CDN), and with it every
 * srcset next/image would emit is inert. Building the set from the variants
 * Payload already wrote to disk is both correct and free.
 */
export const mediaSrcSet = (media: Media): string | undefined => {
  const variants = variantsOf(media);
  if (variants.length < 2) return undefined;
  return variants.map((v) => `${v.url} ${v.width}w`).join(", ");
};

/**
 * The single URL to use as `src`: the smallest variant at least as wide as the
 * slot, so browsers without srcset support (and the cart's 64px thumbnails)
 * never download a multi-megabyte original.
 */
export const mediaSrcAt = (media: Media, minWidth: number): string | null => {
  const variants = variantsOf(media);
  if (!variants.length) return mediaSrc(media.url);
  const fit = variants.find((v) => v.width >= minWidth);
  return (fit ?? variants[variants.length - 1]).url;
};
