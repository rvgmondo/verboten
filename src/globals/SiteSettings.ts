import type { GlobalConfig } from "payload";

import { anyone, isAdmin } from "../access/access";
import { revalidateGlobalHooks } from "../lib/revalidate";

/**
 * Site-wide switches staff should never need code for. Admin-only by design:
 * editors manage content and orders, not settings.
 */
export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  admin: {
    group: "Admin",
  },
  hooks: { ...revalidateGlobalHooks("settings") },
  access: {
    read: anyone,
    update: isAdmin,
  },
  fields: [
    {
      name: "announcement",
      type: "group",
      admin: { description: "The thin bar above the header." },
      fields: [
        { name: "enabled", type: "checkbox", required: true, defaultValue: true },
        {
          name: "text",
          type: "text",
          defaultValue: "Premium South African brandy | Ships nationwide in 1 to 2 weeks",
        },
      ],
    },
    {
      name: "dispatchTimeText",
      type: "text",
      required: true,
      defaultValue: "Ships within 1 to 2 weeks",
      admin: {
        description: "Shown on product pages and at checkout. Keep it honest.",
      },
    },
    {
      name: "shipping",
      type: "group",
      fields: [
        {
          name: "flatRateCents",
          type: "number",
          required: true,
          defaultValue: 15000,
          min: 0,
          admin: { description: "Flat delivery fee in cents (R150 = 15000)." },
        },
        {
          name: "freeThresholdCents",
          type: "number",
          required: true,
          defaultValue: 250000,
          min: 0,
          admin: {
            description: "Orders at or above this ship free (R2500 = 250000). 0 disables.",
          },
        },
        {
          name: "countries",
          type: "select",
          hasMany: true,
          required: true,
          defaultValue: ["ZA"],
          options: [
            { label: "South Africa", value: "ZA" },
            { label: "Netherlands", value: "NL" },
            { label: "Germany", value: "DE" },
          ],
          admin: {
            description:
              "Where the shop ships. South Africa only for now; NL and DE are staged for expansion.",
          },
        },
      ],
    },
    {
      name: "contact",
      type: "group",
      fields: [
        { name: "phone", type: "text", defaultValue: "+27 75 387 3456" },
        { name: "whatsapp", type: "text", defaultValue: "27753873456" },
        { name: "email", type: "email", defaultValue: "info@verboten.co.za" },
        { name: "ordersEmail", type: "email", defaultValue: "orders@verboten.co.za" },
        {
          name: "notificationsEmail",
          type: "email",
          admin: {
            description:
              "Where new order alerts and contact enquiries are sent. Change it here, no deploy needed. Falls back to the orders address if left blank.",
          },
        },
        {
          name: "address",
          type: "text",
          defaultValue: "Silverton, Pretoria, Gauteng, 0184",
        },
        { name: "supportHours", type: "text", defaultValue: "Monday to Friday, 9am to 5pm SAST" },
      ],
    },
    {
      name: "socials",
      type: "group",
      fields: [
        { name: "facebook", type: "text", defaultValue: "https://www.facebook.com/verbotenspirits/" },
        { name: "instagram", type: "text", defaultValue: "https://www.instagram.com/verbotenspirits/" },
        { name: "tiktok", type: "text" },
      ],
    },
  ],
};
