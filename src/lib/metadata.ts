import type { Metadata } from "next";

import { SITE_URL } from "@/lib/seo";

/**
 * Complete page metadata from four facts, so no page can ship half of it.
 *
 * Next.js merges metadata shallowly. A page that sets `openGraph` at all
 * replaces the layout's whole `openGraph` object rather than adding to it, so
 * the shop, the gallery and the bar booking page, which each set only a share
 * title and description, silently lost their share image, site name and locale.
 * Pages that set nothing inherited the layout's generic share title instead of
 * their own. Either way a link pasted into WhatsApp, which is where this shop's
 * links travel, arrived looking like somebody else's page.
 *
 * Every indexable page builds its metadata here instead, so the title, the
 * canonical, the share card and the Twitter card are all present and all agree.
 *
 * The default share image is a static file rather than the generated route,
 * because that route's URL carries a build hash and would break on each deploy.
 */

export const SITE_NAME = "Verboten Spirits";
const DEFAULT_IMAGE = {
  url: "/brand/og-share.png",
  width: 1200,
  height: 630,
  alt: "Verboten Spirits, an independent South African brandy house in Pretoria",
};

type PageMetaInput = {
  /** Goes through the layout's "%s | Verboten Spirits" template. */
  title: string;
  description: string;
  /** Path from the site root, e.g. "/shop". Becomes the canonical and og:url. */
  path: string;
  /** Share card title when it should differ from the page title. */
  shareTitle?: string;
  shareDescription?: string;
  /**
   * A specific share image. Leave unset on routes that have their own
   * opengraph-image file: Next prefers the file, and naming an image here as
   * well would compete with it.
   */
  image?: { url: string; width?: number; height?: number; alt: string } | null;
  type?: "website" | "article";
  /** For utility pages that should exist but never rank. */
  noindex?: boolean;
};

export const pageMeta = ({
  title,
  description,
  path,
  shareTitle,
  shareDescription,
  image,
  type = "website",
  noindex = false,
}: PageMetaInput): Metadata => {
  // SEO titles generated in the admin before this used to end in the brand,
  // and the template adds it again. Strip it here so saved values still read
  // once, whatever was stored.
  title = title.replace(/\s*[|,-]\s*Verboten Spirits\s*$/i, "").trim() || title;
  const fullTitle = `${title} | ${SITE_NAME}`;
  // `null` means "this route has its own image file, do not name one".
  const images = image === null ? undefined : [image ?? DEFAULT_IMAGE];
  const canonical = path === "/" ? SITE_URL : `${SITE_URL}${path}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: shareTitle ?? fullTitle,
      description: shareDescription ?? description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "en_ZA",
      type,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle ?? fullTitle,
      description: shareDescription ?? description,
      ...(images ? { images: images.map((i) => i.url) } : {}),
    },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
};
