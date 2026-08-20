import type { CollectionConfig } from "payload";

import { anyone, isAdmin, staffOrSelfCustomer } from "../access/access";
import { SA_PROVINCES } from "./Orders";

/**
 * Shopper accounts for the lightweight account area (order history, saved
 * address). Entirely optional: guest checkout never creates one. A separate
 * auth collection from staff Users; customers can never reach the admin panel
 * (access.admin is false and they carry no roles).
 */
export const Customers: CollectionConfig = {
  slug: "customers",
  auth: true,
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "name", "createdAt"],
    group: "Orders",
  },
  access: {
    admin: () => false,
    read: staffOrSelfCustomer,
    create: anyone,
    update: staffOrSelfCustomer,
    delete: isAdmin,
  },
  fields: [
    {
      name: "name",
      type: "text",
    },
    {
      name: "phone",
      type: "text",
    },
    {
      name: "defaultAddress",
      type: "group",
      fields: [
        { name: "line1", type: "text" },
        { name: "line2", type: "text" },
        { name: "suburb", type: "text" },
        { name: "city", type: "text" },
        {
          name: "province",
          type: "select",
          options: SA_PROVINCES.map((p) => ({ label: p, value: p })),
        },
        { name: "postalCode", type: "text" },
        { name: "country", type: "text", defaultValue: "ZA" },
      ],
    },
    {
      name: "marketingOptIn",
      type: "checkbox",
      defaultValue: false,
      admin: { description: "POPIA: explicit opt-in only, never pre-ticked." },
    },
  ],
};
