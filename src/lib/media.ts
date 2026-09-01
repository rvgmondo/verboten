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
  // The original upload is a fallback, never a display candidate, as long as
  // any generated variant exists.
  //
  // It used to be offered as the widest entry in the srcset. That is fine when
  // the upload is already a display format and wrong when it is not: a
  // photograph uploaded as PNG was 1,485,953 bytes, and a 360px phone at DPR3
  // asks for 1080, so it picked exactly that file over a 23KB WebP one step
  // down. Generating variants is what stops the original shipping; offering it
  // anyway undid the whole point.
  //
  // When a source is too small for the larger named sizes, the rebuild script
  // fills the biggest applicable slot at the source's own width, so nothing is
  // lost by leaving the original out.
  if (out.length === 0) {
    const originalUrl = mediaSrc(media.url);
    if (originalUrl && media.width) out.push({ url: originalUrl, width: media.width });
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
