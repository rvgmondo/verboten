import type { MetadataRoute } from "next";

import {
  getGalleryItems,
  getJournalPosts,
  getProducts,
  getPublishedPages,
  getUpcomingEvents,
} from "@/lib/data";
import { mediaSrcAt } from "@/lib/media";
import { SITE_URL } from "@/lib/seo";
import type { Media } from "@/payload-types";

/**
 * Every page worth ranking, with an honest last-modified date.
 *
 * Google ignores priority and change frequency but does use lastmod, as long
 * as it is truthful. So a listing page is dated by the newest thing on it, and
 * nothing is stamped with "now" on every request, which is the quickest way to
 * teach Google to ignore the date altogether.
 */

// Designed routes the CMS also has a page document for. The designed route
// wins, so the page document must not be listed a second time.
const DESIGNED = new Set(["story"]);

const newest = (...dates: Array<string | null | undefined>) => {
  const times = dates.filter(Boolean).map((d) => new Date(d as string).getTime());
  return times.length ? new Date(Math.max(...times)) : undefined;
};

const abs = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path}`);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts, pages, gallery, events] = await Promise.all([
    getProducts(),
    getJournalPosts(500),
    getPublishedPages(),
    getGalleryItems(),
    getUpcomingEvents(),
  ]);

  const productsDate = newest(...products.map((p) => p.updatedAt));
  const postsDate = newest(...posts.map((p) => p.updatedAt));
  const pageDate = (slug: string) => newest(pages.find((p) => p.slug === slug)?.updatedAt);

  const statics: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: newest(productsDate?.toISOString(), postsDate?.toISOString()) },
    { url: `${SITE_URL}/shop`, lastModified: productsDate },
    { url: `${SITE_URL}/book-the-bar` },
    // /story renders from a CMS page and shows not found without one.
    ...(pages.some((p) => p.slug === "story")
      ? [{ url: `${SITE_URL}/story`, lastModified: pageDate("story") }]
      : []),
    { url: `${SITE_URL}/serves` },
    { url: `${SITE_URL}/find-us`, lastModified: newest(...events.map((e) => e.updatedAt)) },
    { url: `${SITE_URL}/journal`, lastModified: postsDate },
    { url: `${SITE_URL}/contact` },
    // A gallery of empty frames is noindexed, so it stays out of here too.
    ...(gallery.length
      ? [{ url: `${SITE_URL}/gallery`, lastModified: newest(...gallery.map((g) => g.updatedAt)) }]
      : []),
  ];

  const cmsPages: MetadataRoute.Sitemap = pages
    .filter((p) => p.slug && !DESIGNED.has(p.slug))
    .map((p) => ({ url: `${SITE_URL}/${p.slug}`, lastModified: new Date(p.updatedAt) }));

  return [
    ...statics,
    ...products.map((p) => {
      const photos = (p.gallery ?? [])
        .map((g) => (typeof g.image === "object" ? (g.image as Media) : null))
        .filter((m): m is Media => Boolean(m))
        .map((m) => mediaSrcAt(m, 1200))
        .filter((u): u is string => Boolean(u));
      return {
        url: `${SITE_URL}/shop/${p.slug}`,
        lastModified: new Date(p.updatedAt),
        // Image entries are how bottle shots get into Google Images, which is
        // where a lot of "what does it look like" shopping starts.
        ...(photos.length ? { images: photos.slice(0, 6).map(abs) } : {}),
      };
    }),
    ...posts.map((post) => {
      const hero = post.hero && typeof post.hero === "object" ? (post.hero as Media) : null;
      const heroUrl = hero ? mediaSrcAt(hero, 1200) : null;
      return {
        url: `${SITE_URL}/journal/${post.slug}`,
        lastModified: new Date(post.updatedAt),
        ...(heroUrl ? { images: [abs(heroUrl)] } : {}),
      };
    }),
    ...cmsPages,
  ];
}
