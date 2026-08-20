import type { CollectionConfig } from "payload";

import { anyone, isAdminOrEditor } from "../access/access";

/** Markets, festivals and tastings where Verboten pours. */
export const Events: CollectionConfig = {
  slug: "events",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "startDate", "location"],
    group: "Content",
  },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "startDate",
      type: "date",
      required: true,
      admin: { date: { pickerAppearance: "dayAndTime" } },
    },
    {
      name: "endDate",
      type: "date",
      admin: { date: { pickerAppearance: "dayAndTime" } },
    },
    { name: "location", type: "text", required: true },
    { name: "description", type: "textarea" },
    { name: "url", type: "text", admin: { description: "Tickets or event page link." } },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
    },
  ],
};
