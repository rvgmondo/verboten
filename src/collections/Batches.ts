import type { CollectionConfig } from "payload";

import { anyone, isAdminOrEditor } from "../access/access";

/**
 * Numbered releases. Verboten sells in batches (Batch No. 01 is 500 bottles),
 * so a batch carries its own story, bottle count and remaining stock. Products
 * whose inventory mode is "batch" draw availability from here, and a sold-out
 * batch displays elegantly on the front end instead of disappearing.
 */
export const Batches: CollectionConfig = {
  slug: "batches",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "batchNumber", "bottlesRemaining", "status"],
    group: "Shop",
  },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      admin: { description: 'Display name, e.g. "Batch No. 01".' },
    },
    {
      name: "batchNumber",
      type: "number",
      required: true,
      unique: true,
      min: 1,
    },
    {
      name: "story",
      type: "richText",
      admin: {
        description: "The batch narrative shown on product pages.",
      },
    },
    {
      name: "totalBottles",
      type: "number",
      required: true,
      min: 1,
      admin: { description: "Size of the release, e.g. 500." },
    },
    {
      name: "bottlesRemaining",
      type: "number",
      required: true,
      min: 0,
      admin: {
        description:
          "Live stock for every product drawing from this batch. Decremented on paid orders.",
      },
    },
    {
      name: "releaseDate",
      type: "date",
      admin: { date: { pickerAppearance: "dayOnly" } },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "available",
      options: [
        { label: "Available", value: "available" },
        { label: "Sold out", value: "sold_out" },
        { label: "Archived", value: "archived" },
      ],
      admin: {
        position: "sidebar",
        description:
          "Sold out batches stay visible with their story; archived ones leave the site.",
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Stock can never go negative, and an empty batch flags itself sold out.
        if (typeof data.bottlesRemaining === "number" && data.bottlesRemaining <= 0) {
          data.bottlesRemaining = Math.max(0, data.bottlesRemaining);
          if (data.status === "available") data.status = "sold_out";
        }
        return data;
      },
    ],
  },
};
