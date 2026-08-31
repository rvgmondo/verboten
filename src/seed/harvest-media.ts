import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { getPayload } from "payload";

import config from "../payload.config";

/**
 * Pulls the client's existing product photography from the live site
 * (verboten.co.za, their own assets) into the Media library and attaches it
 * to the seeded products, so the rebuild ships with real bottle imagery.
 * Idempotent: products that already have a gallery are skipped.
 *
 * Run: npm run seed:media
 */

const dirname = path.dirname(fileURLToPath(import.meta.url));
const cacheDir = path.resolve(dirname, "../../.imgcache");

const PRODUCT_SOURCES: Array<{ slug: string; oldUrl: string; alt: string }> = [
  {
    slug: "verboten-premium-brandy",
    oldUrl: "https://verboten.co.za/product/verboten-premium-brandy-batch-no-01-3-year/",
    alt: "Verboten Premium Brandy bottle",
  },
  {
    slug: "verboten-premium-set-2-bottle",
    oldUrl: "https://verboten.co.za/product/batch-no-01-premium-set-2-bottle/",
    alt: "Two bottles of Verboten Premium Brandy",
  },
  {
    slug: "verboten-brandy-cola",
    oldUrl: "https://verboten.co.za/product/verboten-brandy-cola/",
    alt: "Verboten Brandy and Cola can",
  },
];

const UA = "Mozilla/5.0 (compatible; VerbotenRebuild/1.0; site migration)";

/** og:image plus any full-size gallery images in the page HTML. */
const extractImageUrls = (html: string): string[] => {
  const urls = new Set<string>();
  const og = html.match(/property="og:image"\s+content="([^"]+)"/)?.[1];
  if (og) urls.add(og);
  const galleryRe = /data-large_image="([^"]+)"|href="(https:\/\/verboten\.co\.za\/wp-content\/uploads\/[^"]+\.(?:jpg|jpeg|png|webp))"/g;
  for (const m of html.matchAll(galleryRe)) {
    const u = m[1] ?? m[2];
    if (u) urls.add(u);
  }
  return [...urls]
    .filter((u) => u.includes("/wp-content/uploads/"))
    // Drop WordPress resized variants (e.g. -300x300.jpg); keep originals.
    .filter((u) => !/-\d+x\d+\.(?:jpg|jpeg|png|webp)$/i.test(u));
};

const run = async () => {
  const payload = await getPayload({ config });
  const log = (msg: string) => payload.logger.info(msg);
  await mkdir(cacheDir, { recursive: true });

  for (const source of PRODUCT_SOURCES) {
    const product = (
      await payload.find({
        collection: "products",
        where: { slug: { equals: source.slug } },
        limit: 1,
      })
    ).docs[0];
    if (!product) {
      log(`Product ${source.slug} not found; skipping`);
      continue;
    }
    if ((product.gallery?.length ?? 0) > 0) {
      log(`Product ${source.slug} already has a gallery; skipping`);
      continue;
    }

    let html: string;
    try {
      const res = await fetch(source.oldUrl, { headers: { "user-agent": UA } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      html = await res.text();
    } catch (err) {
      log(`Could not fetch ${source.oldUrl}: ${String(err)}`);
      continue;
    }

    const imageUrls = extractImageUrls(html).slice(0, 4);
    if (imageUrls.length === 0) {
      log(`No original-size images found on ${source.oldUrl}`);
      continue;
    }

    const mediaIds: number[] = [];
    for (const [index, url] of imageUrls.entries()) {
      try {
        const res = await fetch(url, { headers: { "user-agent": UA } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buffer = Buffer.from(await res.arrayBuffer());
        const filename = `${source.slug}-${index + 1}${path.extname(new URL(url).pathname) || ".jpg"}`;
        const filePath = path.join(cacheDir, filename);
        await writeFile(filePath, buffer);

        const media = await payload.create({
          collection: "media",
          data: { alt: index === 0 ? source.alt : `${source.alt}, alternate view` },
          filePath,
        });
        mediaIds.push(media.id);
        log(`Imported ${filename} (${Math.round(buffer.length / 1024)}kB)`);
      } catch (err) {
        log(`Skipped image ${url}: ${String(err)}`);
      }
    }

    if (mediaIds.length > 0) {
      await payload.update({
        collection: "products",
        id: product.id,
        data: { gallery: mediaIds.map((id) => ({ image: id })) },
      });
      log(`Attached ${mediaIds.length} images to ${source.slug}`);
    }
  }

  log("Media harvest complete.");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
