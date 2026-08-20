import type { CollectionConfig } from "payload";

import { anyone, isAdminOrEditor } from "../access/access";
import { revalidateHooks } from "../lib/revalidate";

/** Signature serves and simple cocktails built on Verboten products. */
export const Serves: CollectionConfig = {
  slug: "serves",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "product"],
    group: "Content",
  },
  hooks: { ...revalidateHooks("serves") },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "product",
      type: "relationship",
      relationTo: "products",
      admin: { description: "The Verboten product this serve is built on." },
    },
    { name: "description", type: "textarea" },
    {
      name: "ingredients",
      type: "array",
      fields: [
        { name: "amount", type: "text", admin: { description: 'e.g. "50ml", "1 wedge".' } },
        { name: "item", type: "text", required: true },
      ],
    },
    { name: "method", type: "textarea" },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "sortOrder",
      type: "number",
      defaultValue: 0,
      admin: { position: "sidebar" },
    },
  ],
};
