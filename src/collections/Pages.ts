import type { CollectionConfig } from "payload";

import { isAdminOrEditor, publishedOrEditor } from "../access/access";
import { revalidateHooks } from "../lib/revalidate";
import { formatSlug } from "../lib/slug";

/**
 * Editable marketing and legal copy (Our Story, Terms, Privacy, Shipping &
 * Returns, Responsible Enjoyment). Purpose-built templates render these by
 * slug; staff edit copy here without touching code.
 */
export const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "_status"],
    group: "Content",
  },
  versions: {
    drafts: true,
  },
  hooks: { ...revalidateHooks("pages") },
  access: {
    read: publishedOrEditor,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { position: "sidebar" },
      hooks: { beforeValidate: [formatSlug("title")] },
    },
    {
      name: "intro",
      type: "textarea",
      admin: { description: "Optional lead paragraph under the page title." },
    },
    {
      name: "content",
      type: "richText",
      required: true,
    },
    {
      name: "updatedNote",
      type: "text",
      admin: { description: 'For legal pages: e.g. "Last updated August 2026".' },
    },
  ],
};
