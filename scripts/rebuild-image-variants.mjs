/**
 * Rebuild the responsive image variants for media that predates the WebP
 * configuration, in place, on whichever machine holds the real files.
 *
 * Why this exists: Media.ts writes WebP display variants now, but anything
 * uploaded before that keeps whatever format it arrived in. One photograph
 * uploaded as PNG was costing more than every other asset on the site
 * combined: a 1,451 KB original whose 768px "card" variant was 1,063 KB, over
 * half the total weight of the home page, the shop and the product page on a
 * phone. The two JPEGs beside it were 28 KB and 51 KB.
 *
 * Re-uploading through the admin would fix it, but `media/` is excluded from
 * the deploy, so the files only exist on the server. This does it there.
 *
 * Safe to run repeatedly: it skips anything already WebP, writes new files
 * rather than overwriting the originals, and only then points the database at
 * them. The original upload is never touched, so nothing is lost if a variant
 * needs regenerating again.
 *
 *   cd ~/verboten && source ~/nodevenv/verboten/... /bin/activate
 *   node scripts/rebuild-image-variants.mjs           # report only
 *   node scripts/rebuild-image-variants.mjs --write   # actually rebuild
 */

import fs from "node:fs";
import path from "node:path";

import { createClient } from "@libsql/client";
import sharp from "sharp";

const WRITE = process.argv.includes("--write");
const url = process.env.DATABASE_URI || "file:./verboten.db";
if (url.startsWith("postgres")) {
  console.error("This script is for the SQLite database only.");
  process.exit(1);
}

const MEDIA_DIR = process.env.MEDIA_DIR || path.resolve(process.cwd(), "media");
const QUALITY = 82;

/** Mirrors the imageSizes in src/collections/Media.ts. `og` stays as it is. */
const SIZES = [
  { name: "thumbnail", width: 400 },
  { name: "card", width: 768 },
  { name: "feature", width: 1280 },
  { name: "hero", width: 1920 },
];

const client = createClient({ url });
const kb = (n) => `${(n / 1024).toFixed(0)} KB`;

const run = async () => {
  console.log(`Database: ${url}`);
  console.log(`Media:    ${MEDIA_DIR}`);
  console.log(WRITE ? "Mode:     rebuilding\n" : "Mode:     report only, pass --write to rebuild\n");

  if (!fs.existsSync(MEDIA_DIR)) {
    console.error(`No media directory at ${MEDIA_DIR}. Set MEDIA_DIR.`);
    process.exit(1);
  }

  const docs = await client.execute("SELECT id, filename, width, height, mime_type FROM media");
  let savedTotal = 0;

  for (const doc of docs.rows) {
    const original = path.join(MEDIA_DIR, String(doc.filename));
    if (!fs.existsSync(original)) {
      console.log(`SKIP ${doc.filename}: file not on disk`);
      continue;
    }

    const stem = String(doc.filename).replace(/\.[^.]+$/, "");
    const sourceWidth = Number(doc.width) || 0;

    for (const size of SIZES) {
      const col = `sizes_${size.name}`;
      const current = await client.execute({
        sql: `SELECT ${col}_filename AS filename, ${col}_filesize AS filesize, ${col}_mime_type AS mime FROM media WHERE id = ?`,
        args: [doc.id],
      });
      const row = current.rows[0] ?? {};

      // Already WebP: nothing to gain.
      if (row.mime === "image/webp") continue;

      // Never upscale. A 1024px original has no business producing a 1920px
      // "hero" variant, and Payload does not generate one either.
      if (sourceWidth && sourceWidth < size.width) continue;

      const outName = `${stem}-${size.width}x${size.width}.webp`;
      const outPath = path.join(MEDIA_DIR, outName);

      const before = Number(row.filesize) || 0;
      let after = 0;

      if (WRITE) {
        const buf = await sharp(original)
          .resize(size.width, size.width, { fit: "cover", position: "centre" })
          .webp({ quality: QUALITY })
          .toBuffer();
        fs.writeFileSync(outPath, buf);
        after = buf.length;

        await client.execute({
          sql: `UPDATE media SET
                  ${col}_url = ?, ${col}_width = ?, ${col}_height = ?,
                  ${col}_mime_type = ?, ${col}_filesize = ?, ${col}_filename = ?
                WHERE id = ?`,
          args: [
            `/api/media/file/${outName}`,
            size.width,
            size.width,
            "image/webp",
            after,
            outName,
            doc.id,
          ],
        });
      } else {
        const meta = await sharp(original)
          .resize(size.width, size.width, { fit: "cover", position: "centre" })
          .webp({ quality: QUALITY })
          .toBuffer();
        after = meta.length;
      }

      const saved = before ? before - after : 0;
      savedTotal += Math.max(0, saved);
      console.log(
        `${WRITE ? "wrote" : "would write"} ${outName.padEnd(52)} ` +
          `${before ? kb(before).padStart(9) : "      new"} -> ${kb(after).padStart(9)}`,
      );
    }
  }

  console.log(
    `\n${WRITE ? "Saved" : "Would save"} ${kb(savedTotal)} across the responsive variants.`,
  );
  if (WRITE) console.log("Restart the app and purge the Cloudflare cache.");
  else console.log("Run again with --write to apply.");
};

run().catch((err) => {
  console.error("\nFailed:", err.message);
  process.exit(1);
});
