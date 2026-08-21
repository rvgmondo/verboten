import type { RequiredDataFromCollectionSlug } from "payload";
import { getPayload } from "payload";

import config from "../payload.config";
import { JOURNAL_POSTS, PAGES, SERVES } from "./content";
import { paragraphs } from "./lexical";

/**
 * Seeds the shop with Verboten's real current products, prices and settings
 * (facts verified against the live site; see docs/old-site-recon.md).
 * Idempotent: existing docs (matched by slug/number) are left alone.
 *
 * Marketing copy on these seeds is intentionally spare; the full copy rewrite
 * lands with the public site build. Facts to confirm with the client are
 * listed in docs/old-site-recon.md section 6 (Gaps).
 *
 * Run: npm run seed
 */
const run = async () => {
  const payload = await getPayload({ config });
  const log = (msg: string) => payload.logger.info(msg);

  // --- Batch No. 01 ---
  let batch = (
    await payload.find({ collection: "batches", where: { batchNumber: { equals: 1 } }, limit: 1 })
  ).docs[0];

  if (!batch) {
    batch = await payload.create({
      collection: "batches",
      data: {
        name: "Batch No. 01",
        batchNumber: 1,
        totalBottles: 500,
        // Real remaining count unconfirmed (recon gap 9); staff adjust in admin.
        bottlesRemaining: 500,
        status: "available",
        story: paragraphs(
          "Batch No. 01 is the first Verboten release. A limited edition, matured for a minimum of three years in oak and finished in French oak casks.",
          "Made to a standard, not to a schedule. When an edition is gone, the next one earns its own name.",
        ),
      },
    });
    log("Created Batch No. 01");
  } else {
    log("Batch No. 01 exists; skipping");
  }

  const ensureProduct = async (
    slug: string,
    data: RequiredDataFromCollectionSlug<"products">,
  ) => {
    const existing = (
      await payload.find({ collection: "products", where: { slug: { equals: slug } }, limit: 1 })
    ).docs[0];
    if (existing) {
      log(`Product ${slug} exists; skipping`);
      return existing;
    }
    const doc = await payload.create({ collection: "products", data });
    log(`Created product ${slug}`);
    return doc;
  };

  // --- Flagship brandy ---
  const brandy = await ensureProduct("verboten-premium-brandy-batch-no-01-3-year", {
    name: "Verboten Premium Brandy, Batch No. 01",
    slug: "verboten-premium-brandy-batch-no-01-3-year",
    productType: "bottle",
    sku: "VB-B01-750",
    priceCents: 45000,
    shortDescription:
      "A three year South African brandy, finished in French oak and bottled at 43% ABV. A limited edition from Pretoria.",
    description: paragraphs(
      "Matured for a minimum of three years in oak, then finished in French oak casks. Bottled at 43% ABV in Pretoria.",
      "Batch No. 01 is a limited edition. When it is gone, the next edition takes its place.",
    ),
    specs: {
      abv: 43,
      volumeMl: 750,
      ageYears: 3,
      caskFinish: "French oak casks",
      origin: "South Africa",
    },
    tastingNotes: {
      nose: "Warm oak, dried apricot, vanilla",
      palate: "Caramel, toasted nuts, subtle spice",
      finish: "Long and smooth",
    },
    servingSuggestion:
      "Neat, or over a single clear cube. Pairs with dark chocolate or cured biltong.",
    batch: batch.id,
    inventory: { mode: "batch", lowStockThreshold: 25 },
    _status: "published",
  });

  // --- Brandy & Cola RTD ---
  const rtd = await ensureProduct("verboten-brandy-cola", {
    name: "Verboten Brandy & Cola",
    slug: "verboten-brandy-cola",
    productType: "can",
    sku: "VB-RTD-CAN",
    priceCents: 4500,
    shortDescription:
      "Verboten brandy and cola, pre-mixed and ready to drink. Served cold at markets, festivals and events.",
    description: paragraphs(
      "The flagship brandy, cut with cola and canned. Made to be drunk cold, straight from the can or over ice.",
    ),
    // ABV and can volume are unconfirmed (recon gap 7); left blank until the
    // client supplies them.
    specs: { origin: "South Africa" },
    inventory: { mode: "own", stockQty: 0, lowStockThreshold: 24 },
    _status: "published",
  });

  // --- 2-bottle premium set (a real bundle) ---
  await ensureProduct("batch-no-01-premium-set-2-bottle", {
    name: "Batch No. 01 Premium Set, 2 Bottles",
    slug: "batch-no-01-premium-set-2-bottle",
    productType: "bundle",
    sku: "VB-B01-SET2",
    priceCents: 85000,
    shortDescription:
      "Two bottles of Verboten Premium Brandy Batch No. 01. One to open, one for the shelf.",
    description: paragraphs(
      "Two bottles from the same limited edition. Open one now; keep the second for a night that deserves it.",
    ),
    bundleItems: [{ product: brandy.id, quantity: 2 }],
    relatedProducts: [brandy.id, rtd.id],
    _status: "published",
  });

  // --- Marketing and legal pages (the copy rewrite; see src/seed/content.ts) ---
  for (const page of PAGES) {
    const existing = (
      await payload.find({ collection: "pages", where: { slug: { equals: page.slug } }, limit: 1 })
    ).docs[0];
    if (existing) {
      log(`Page ${page.slug} exists; skipping`);
      continue;
    }
    await payload.create({
      collection: "pages",
      data: {
        title: page.title,
        slug: page.slug,
        intro: page.intro,
        updatedNote: "updatedNote" in page ? page.updatedNote : undefined,
        content: page.content,
        _status: "published",
      },
    });
    log(`Created page ${page.slug}`);
  }

  // --- Serves ---
  const existingServes = await payload.count({ collection: "serves" });
  if (existingServes.totalDocs === 0) {
    for (const serve of SERVES) {
      await payload.create({
        collection: "serves",
        data: {
          name: serve.name,
          description: serve.description,
          ingredients: serve.ingredients.map((i) => ({ amount: i.amount, item: i.item })),
          method: serve.method,
          product: brandy.id,
          sortOrder: serve.sortOrder,
        },
      });
    }
    log(`Created ${SERVES.length} serves`);
  } else {
    log("Serves exist; skipping");
  }

  // --- Journal ---
  for (const post of JOURNAL_POSTS) {
    const existing = (
      await payload.find({
        collection: "journal-posts",
        where: { slug: { equals: post.slug } },
        limit: 1,
      })
    ).docs[0];
    if (existing) {
      log(`Journal post ${post.slug} exists; skipping`);
      continue;
    }
    await payload.create({
      collection: "journal-posts",
      data: {
        title: post.title,
        slug: post.slug,
        category: post.category,
        excerpt: post.excerpt,
        content: post.content,
        publishedAt: post.publishedAt,
        _status: "published",
      },
    });
    log(`Created journal post ${post.slug}`);
  }

  // --- Order-number counter (atomic sequence source; see lib/commerce/atomic) ---
  const existingCounter = (
    await payload.find({ collection: "counters", where: { name: { equals: "order" } }, limit: 1 })
  ).docs[0];
  if (!existingCounter) {
    await payload.create({ collection: "counters", data: { name: "order", value: 0 } });
    log("Created order counter");
  } else {
    log("Order counter exists; skipping");
  }

  // --- Site settings (field defaults hold the real values; touching the
  //     global once materialises it) ---
  await payload.updateGlobal({ slug: "site-settings", data: {} });
  log("Site settings materialised with defaults");

  log("Seed complete.");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
