import path from "path";

import type { CollectionConfig } from "payload";

import { anyone, isAdminOrEditor } from "../access/access";
import { revalidateHooks } from "../lib/revalidate";

// Resolve the uploads directory from the app root (process.cwd()), NOT from
// this module's location. In a bundled production build the module lives under
// .next/, so a path relative to it points nowhere and Payload cannot serve
// /api/media files. server.cjs chdirs to the app root, so cwd is correct in
// production; in dev/seed the cwd is the project root. Override with MEDIA_DIR.
const mediaDir = process.env.MEDIA_DIR || path.resolve(process.cwd(), "media");

const WEBP = { format: "webp" as const, options: { quality: 82 } };

/**
 * Uploaded media (bottle and lifestyle photography, journal imagery, crest assets).
 *
 * Files are written to the project-root `media/` directory in local dev. Alt
 * text is required for accessibility (WCAG 2.2 AA) and doubles as an SEO signal.
 * Named image sizes back the responsive cards, galleries and OG images so the
 * frontend never ships an oversized original.
 */
export const Media: CollectionConfig = {
  slug: "media",
  // Media appears inside products, journal and pages; bust them all on change.
  hooks: { ...revalidateHooks("products", "journal", "pages", "serves", "events") },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  upload: {
    staticDir: mediaDir,
    mimeTypes: ["image/*"],
    focalPoint: true,
    // Display variants are WebP regardless of what was uploaded. A photograph
    // saved as PNG is enormous (a 768px PNG can of ours is 1.1MB, larger than
    // most JPEG originals), and WebP is universally supported now. The og size
    // stays JPEG because some share-card scrapers still prefer it.
    imageSizes: [
      { name: "thumbnail", width: 400, position: "centre", formatOptions: WEBP },
      { name: "card", width: 768, position: "centre", formatOptions: WEBP },
      { name: "feature", width: 1280, position: "centre", formatOptions: WEBP },
      { name: "hero", width: 1920, position: "centre", formatOptions: WEBP },
      { name: "og", width: 1200, height: 630, position: "centre" },
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      label: "Alt text",
      admin: {
        description: "Describe the image for screen readers and search engines.",
      },
    },
  ],
};
