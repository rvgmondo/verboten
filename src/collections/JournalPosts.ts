import type { CollectionConfig } from "payload";

import { isAdminOrEditor, publishedOrEditor } from "../access/access";
import { formatSlug } from "../lib/slug";

/**
 * The Journal: brand stories, release announcements, event recaps. Built for
 * a volume-and-consistency content strategy, so drafts and scheduled
 * publishedAt dates are first-class.
 */
export const JournalPosts: CollectionConfig = {
  slug: "journal-posts",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "publishedAt", "_status"],
    group: "Content",
  },
  versions: {
    drafts: true,
  },
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
      name: "category",
      type: "select",
      required: true,
      defaultValue: "stories",
      options: [
        { label: "Brand stories", value: "stories" },
        { label: "Releases", value: "releases" },
        { label: "Event recaps", value: "events" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "excerpt",
      type: "textarea",
      maxLength: 300,
      admin: { description: "Shown on cards and used as the meta description." },
    },
    {
      name: "hero",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "content",
      type: "richText",
      required: true,
    },
    {
      name: "publishedAt",
      type: "date",
      admin: { position: "sidebar", date: { pickerAppearance: "dayAndTime" } },
    },
  ],
};
