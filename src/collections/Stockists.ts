import type { CollectionConfig } from "payload";

import { anyone, isAdminOrEditor } from "../access/access";
import { revalidateHooks } from "../lib/revalidate";

/** Bars, restaurants, bottle stores and venues that carry Verboten. */
export const Stockists: CollectionConfig = {
  slug: "stockists",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "area", "type", "active"],
    group: "Content",
  },
  hooks: { ...revalidateHooks("stockists") },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "area",
      type: "text",
      required: true,
      admin: { description: 'Suburb or city, e.g. "Menlyn, Pretoria".' },
    },
    {
      name: "type",
      type: "select",
      required: true,
      options: [
        { label: "Bar", value: "bar" },
        { label: "Restaurant", value: "restaurant" },
        { label: "Bottle store", value: "bottle_store" },
        { label: "Venue", value: "venue" },
        { label: "Market", value: "market" },
      ],
    },
    { name: "url", type: "text", admin: { description: "Optional website or maps link." } },
    {
      name: "active",
      type: "checkbox",
      required: true,
      defaultValue: true,
      admin: { position: "sidebar" },
    },
    {
      name: "sortOrder",
      type: "number",
      defaultValue: 0,
      admin: { position: "sidebar", description: "Lower numbers list first." },
    },
  ],
};
