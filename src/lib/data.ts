import { unstable_cache } from "next/cache";
import { getPayload } from "payload";

import config from "../payload.config";

/**
 * The public site's read layer. Every query is cached under a tag that the
 * matching collection busts on change (src/lib/revalidate.ts), so commerce
 * data is fast to read yet never stale after an admin edit.
 */

const payloadClient = async () => getPayload({ config });

export const getSiteSettings = unstable_cache(
  async () => {
    const payload = await payloadClient();
    return payload.findGlobal({ slug: "site-settings" });
  },
  ["site-settings"],
  { tags: ["settings"] },
);

export const getProducts = unstable_cache(
  async () => {
    const payload = await payloadClient();
    const res = await payload.find({
      collection: "products",
      where: { _status: { equals: "published" } },
      depth: 2,
      limit: 50,
      sort: "createdAt",
    });
    return res.docs;
  },
  ["products-list"],
  { tags: ["products", "batches"] },
);

export const getProductBySlug = async (slug: string) => {
  const products = await getProducts();
  return products.find((p) => p.slug === slug) ?? null;
};

export const getStockists = unstable_cache(
  async () => {
    const payload = await payloadClient();
    const res = await payload.find({
      collection: "stockists",
      where: { active: { equals: true } },
      sort: "sortOrder",
      limit: 200,
    });
    return res.docs;
  },
  ["stockists-list"],
  { tags: ["stockists"] },
);

export const getUpcomingEvents = unstable_cache(
  async () => {
    const payload = await payloadClient();
    const res = await payload.find({
      collection: "events",
      where: { startDate: { greater_than_equal: new Date().toISOString() } },
      sort: "startDate",
      depth: 1,
      limit: 50,
    });
    return res.docs;
  },
  ["events-upcoming"],
  { tags: ["events"], revalidate: 3600 },
);

export const getJournalPosts = unstable_cache(
  async (limit = 24) => {
    const payload = await payloadClient();
    const res = await payload.find({
      collection: "journal-posts",
      where: { _status: { equals: "published" } },
      sort: "-publishedAt",
      depth: 1,
      limit,
    });
    return res.docs;
  },
  ["journal-list"],
  { tags: ["journal"] },
);

export const getJournalPostBySlug = unstable_cache(
  async (slug: string) => {
    const payload = await payloadClient();
    const res = await payload.find({
      collection: "journal-posts",
      where: { and: [{ slug: { equals: slug } }, { _status: { equals: "published" } }] },
      depth: 1,
      limit: 1,
    });
    return res.docs[0] ?? null;
  },
  ["journal-post"],
  { tags: ["journal"] },
);

export const getServes = unstable_cache(
  async () => {
    const payload = await payloadClient();
    const res = await payload.find({
      collection: "serves",
      sort: "sortOrder",
      depth: 2,
      limit: 50,
    });
    return res.docs;
  },
  ["serves-list"],
  { tags: ["serves", "products"] },
);

export const getPageBySlug = unstable_cache(
  async (slug: string) => {
    const payload = await payloadClient();
    const res = await payload.find({
      collection: "pages",
      where: { and: [{ slug: { equals: slug } }, { _status: { equals: "published" } }] },
      depth: 1,
      limit: 1,
    });
    return res.docs[0] ?? null;
  },
  ["page-by-slug"],
  { tags: ["pages"] },
);
