import path from "path";
import { fileURLToPath } from "url";

import type { CollectionConfig } from "payload";

import { anyone, isAdminOrEditor } from "../access/access";
import { revalidateHooks } from "../lib/revalidate";

const dirname = path.dirname(fileURLToPath(import.meta.url));

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
    staticDir: path.resolve(dirname, "../../media"),
    mimeTypes: ["image/*"],
    focalPoint: true,
    imageSizes: [
      { name: "thumbnail", width: 400, position: "centre" },
      { name: "card", width: 768, position: "centre" },
      { name: "feature", width: 1280, position: "centre" },
      { name: "hero", width: 1920, position: "centre" },
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
