import { unstable_cache } from "next/cache";
import { getPayload } from "payload";

import config from "../payload.config";
import { getAvailability } from "@/lib/inventory";
import { mediaSrc, mediaSrcAt } from "@/lib/media";

/**
 * The public site's read layer. Every query is cached under a tag that the
 * matching collection busts on change (src/lib/revalidate.ts), so commerce
 * data is fast to read yet never stale after an admin edit.
 */

const payloadClient = async () => getPayload({ config });

/* Tags give instant invalidation for in-process edits (admin, webhook); the
 * revalidate windows are a safety net for out-of-process writes (seed and
 * harvest scripts), which cannot reach Next's cache store. */

export const getSiteSettings = unstable_cache(
  async () => {
    const payload = await payloadClient();
    return payload.findGlobal({ slug: "site-settings" });
  },
  ["site-settings"],
  { tags: ["settings"], revalidate: 3600 },
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
  { tags: ["products", "batches"], revalidate: 300 },
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
  { tags: ["stockists"], revalidate: 3600 },
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
  { tags: ["journal"], revalidate: 3600 },
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
  { tags: ["journal"], revalidate: 3600 },
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
  { tags: ["serves", "products"], revalidate: 3600 },
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
  { tags: ["pages"], revalidate: 3600 },
);

export const getGalleryItems = unstable_cache(
  async () => {
    const payload = await payloadClient();
    try {
      const res = await payload.find({
        collection: "gallery-items",
        sort: "sortOrder",
        depth: 1,
        limit: 200,
      });
      return res.docs;
    } catch (err) {
      // The table is created by scripts/ensure-schema.mjs on the server. Until
      // it exists the gallery renders its empty state rather than 500ing, so a
      // deploy can never take the site down waiting on a schema step.
      payload.logger.error({ err }, "Gallery unavailable; is the schema up to date?");
      return [];
    }
  },
  ["gallery-list"],
  { tags: ["gallery"], revalidate: 3600 },
);

export type BundleOffer = {
  productId: number;
  slug: string;
  name: string;
  priceCents: number;
  maxAvailable: number | null;
  imageUrl?: string;
  imageAlt?: string;
  /** The single products this bundle stands in for, and how many of each. */
  contains: { productId: number; quantity: number }[];
  /** Saving against buying the contents one by one. Always positive here. */
  savingCents: number;
};

/**
 * Bundles that are cheaper than their own contents, shaped for the cart.
 *
 * Read straight off each bundle's bundleItems, so adding a set in the admin
 * makes it offer itself. Nothing about the catalogue is hardcoded, and a
 * bundle priced at or above its parts is simply never suggested.
 */
export const getBundleOffers = async (): Promise<BundleOffer[]> => {
  const products = await getProducts();
  const offers: BundleOffer[] = [];

  for (const product of products) {
    if (product.productType !== "bundle") continue;
    const items = product.bundleItems ?? [];
    if (items.length === 0) continue;

    let partsCents = 0;
    const contains: { productId: number; quantity: number }[] = [];
    let resolvable = true;

    for (const item of items) {
      const component = typeof item.product === "object" ? item.product : null;
      if (!component) {
        resolvable = false;
        break;
      }
      const quantity = item.quantity ?? 1;
      partsCents += component.priceCents * quantity;
      contains.push({ productId: component.id, quantity });
    }
    if (!resolvable) continue;

    const savingCents = partsCents - product.priceCents;
    if (savingCents <= 0) continue;

    const availability = getAvailability(product);
    if (availability.soldOut) continue;

    const first = product.gallery?.[0]?.image;
    const image = typeof first === "object" && first !== null ? first : null;

    offers.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      priceCents: product.priceCents,
      maxAvailable: availability.available,
      // A 64px cart thumbnail, so the 400px variant rather than the full
      // studio original. getBundleOffers runs in the root layout, so the
      // wrong URL here would sit in every page's payload.
      imageUrl: (image ? mediaSrcAt(image, 200) : null) ?? undefined,
      imageAlt: image?.alt ?? product.name,
      contains,
      savingCents,
    });
  }

  return offers;
};
