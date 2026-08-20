import type { CollectionConfig } from "payload";

import { isAdminOrEditor } from "../access/access";

/**
 * Percentage and fixed-amount discount codes with expiry and usage caps.
 * Validation and redemption happen server-side in the checkout flow; codes are
 * never readable through the public API.
 */
export const DiscountCodes: CollectionConfig = {
  slug: "discount-codes",
  admin: {
    useAsTitle: "code",
    defaultColumns: ["code", "type", "value", "usedCount", "active", "expiresAt"],
    group: "Shop",
  },
  access: {
    read: isAdminOrEditor,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: "code",
      type: "text",
      required: true,
      unique: true,
      index: true,
      hooks: {
        beforeValidate: [
          ({ value }) => (typeof value === "string" ? value.trim().toUpperCase() : value),
        ],
      },
      admin: { description: "Customers enter this at checkout. Stored uppercase." },
    },
    {
      name: "type",
      type: "select",
      required: true,
      defaultValue: "percentage",
      options: [
        { label: "Percentage off", value: "percentage" },
        { label: "Fixed amount off", value: "fixed" },
      ],
    },
    {
      name: "value",
      type: "number",
      required: true,
      min: 0,
      validate: (value: number | null | undefined, { siblingData }: { siblingData: { type?: string } }) => {
        if (typeof value !== "number") return "Required.";
        if (siblingData?.type === "percentage" && (value <= 0 || value > 100)) {
          return "Percentage must be between 1 and 100.";
        }
        return true;
      },
      admin: { description: "Percentage (e.g. 10) or amount in cents (R50 = 5000)." },
    },
    {
      name: "minSubtotalCents",
      type: "number",
      min: 0,
      admin: { description: "Only valid on carts at or above this subtotal (cents)." },
    },
    {
      name: "maxUses",
      type: "number",
      min: 1,
      admin: { description: "Leave empty for unlimited. 1 makes it single-use." },
    },
    {
      name: "usedCount",
      type: "number",
      required: true,
      defaultValue: 0,
      min: 0,
      admin: { readOnly: true },
    },
    {
      name: "startsAt",
      type: "date",
    },
    {
      name: "expiresAt",
      type: "date",
    },
    {
      name: "active",
      type: "checkbox",
      required: true,
      defaultValue: true,
      admin: { position: "sidebar" },
    },
  ],
};
