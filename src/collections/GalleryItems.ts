import type { CollectionConfig } from "payload";

import { anyone, isAdminOrEditor } from "../access/access";
import { revalidateHooks } from "../lib/revalidate";

/**
 * The gallery: the house seen from the outside.
 *
 * Curated and owned, rather than an embedded social feed. Feeds load
 * third-party scripts (slow, and they break the site's content policy),
 * render in someone else's design, and push visitors off the site. This
 * holds the same photographs in the house's own frame, and the Instagram
 * link at the end of the page does the job a feed would.
 */
export const GalleryItems: CollectionConfig = {
  slug: "gallery-items",
  labels: { singular: "Gallery image", plural: "Gallery" },
  admin: {
    useAsTitle: "caption",
    defaultColumns: ["caption", "category", "sortOrder"],
    group: "Content",
    description:
      "Photographs for the gallery page. Group them by category; the page hides any category that has no images.",
  },
  hooks: { ...revalidateHooks("gallery") },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
    },
    {
      name: "caption",
      type: "text",
      required: true,
      admin: { description: "A short line under the photograph. Say what it is, not how good it looks." },
    },
    {
      name: "category",
      type: "select",
      required: true,
      defaultValue: "bottle",
      options: [
        { label: "The bottle", value: "bottle" },
        { label: "In the making", value: "production" },
        { label: "Out in the world", value: "events" },
        { label: "Where we pour", value: "venues" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "sortOrder",
      type: "number",
      defaultValue: 0,
      admin: { position: "sidebar", description: "Lower numbers come first." },
    },
    {
      name: "featured",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar", description: "Featured images span two columns." },
    },
  ],
};
