import type { CollectionConfig } from "payload";

import { isAdminOrEditor, publishedOrEditor } from "../access/access";
import { revalidateHooks } from "../lib/revalidate";
import { formatSlug } from "../lib/slug";

/**
 * Everything Verboten sells: bottles, ready-to-drink cans, and bundles.
 *
 * Bundles (the 2-bottle set) are first-class products whose availability is
 * computed from their components, so bundle stock can never drift from the
 * bottles it contains. Batch-mode products draw stock from their Batch doc.
 * Prices are integer cents (R450 = 45000); see src/lib/money.ts.
 */
export const Products: CollectionConfig = {
  slug: "products",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "productType", "priceCents", "_status"],
    group: "Shop",
  },
  versions: {
    drafts: true,
  },
  hooks: { ...revalidateHooks("products") },
  access: {
    read: publishedOrEditor,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
        description: "URL path under /shop/. Leave blank to derive from the name.",
      },
      hooks: { beforeValidate: [formatSlug("name")] },
    },
    {
      name: "productType",
      type: "select",
      required: true,
      defaultValue: "bottle",
      options: [
        { label: "Bottle", value: "bottle" },
        { label: "Can (RTD)", value: "can" },
        { label: "Bundle", value: "bundle" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "sku",
      type: "text",
      unique: true,
      admin: { position: "sidebar", description: "Internal stock code." },
    },
    {
      name: "priceCents",
      type: "number",
      required: true,
      min: 0,
      admin: { description: "Price in cents: R450 = 45000, R45 = 4500." },
    },
    {
      name: "shortDescription",
      type: "textarea",
      maxLength: 280,
      admin: { description: "One or two sentences for cards and meta descriptions." },
    },
    {
      name: "description",
      type: "richText",
    },
    {
      name: "gallery",
      type: "array",
      labels: { singular: "Image", plural: "Gallery" },
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
        },
      ],
    },
    {
      name: "specs",
      type: "group",
      admin: { description: "Shown as the spec table on the product page." },
      fields: [
        { name: "abv", type: "number", min: 0, max: 100, admin: { description: "% alcohol by volume." } },
        { name: "volumeMl", type: "number", min: 0, admin: { description: "Bottle or can volume in ml." } },
        { name: "ageYears", type: "number", min: 0 },
        { name: "caskFinish", type: "text" },
        { name: "origin", type: "text", defaultValue: "South Africa" },
      ],
    },
    {
      name: "tastingNotes",
      type: "group",
      fields: [
        { name: "nose", type: "text" },
        { name: "palate", type: "text" },
        { name: "finish", type: "text" },
      ],
    },
    {
      name: "servingSuggestion",
      type: "textarea",
    },
    {
      name: "batch",
      type: "relationship",
      relationTo: "batches",
      admin: {
        position: "sidebar",
        description: "The internal stock batch this product draws from, if any. Never shown to shoppers.",
      },
    },
    {
      name: "inventory",
      type: "group",
      admin: {
        condition: (data) => data?.productType !== "bundle",
        description:
          "Bundles have no stock of their own; their availability comes from their components.",
      },
      fields: [
        {
          name: "mode",
          type: "select",
          required: true,
          defaultValue: "own",
          options: [
            { label: "Own stock count", value: "own" },
            { label: "Draw from batch", value: "batch" },
          ],
          admin: {
            description:
              '"Draw from batch" uses the linked Batch\'s bottles remaining as this product\'s stock.',
          },
        },
        {
          name: "stockQty",
          type: "number",
          min: 0,
          defaultValue: 0,
          admin: { condition: (_data, siblingData) => siblingData?.mode === "own" },
        },
        {
          name: "lowStockThreshold",
          type: "number",
          min: 0,
          defaultValue: 6,
          admin: { description: "At or below this, the front end shows a low-stock note." },
        },
      ],
    },
    {
      name: "bundleItems",
      type: "array",
      admin: {
        condition: (data) => data?.productType === "bundle",
        description: "What one unit of this bundle contains.",
      },
      fields: [
        {
          name: "product",
          type: "relationship",
          relationTo: "products",
          required: true,
        },
        {
          name: "quantity",
          type: "number",
          required: true,
          min: 1,
          defaultValue: 1,
        },
      ],
    },
    {
      name: "relatedProducts",
      type: "relationship",
      relationTo: "products",
      hasMany: true,
      admin: { position: "sidebar" },
    },
  ],
};
