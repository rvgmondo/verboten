import type { CollectionConfig } from "payload";

import { isAdmin, isAdminOrEditor, serverOnly } from "../access/access";

/**
 * Newsletter list, double-opt-in ready. Rows are created only by the signup
 * server action (never via the public API), start as "pending", and flip to
 * "confirmed" when the emailed token is clicked. CSV export ships with the
 * admin tooling phase.
 */
export const Subscribers: CollectionConfig = {
  slug: "subscribers",
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "status", "source", "createdAt"],
    group: "Marketing",
  },
  access: {
    read: isAdminOrEditor,
    create: serverOnly,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      name: "email",
      type: "email",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { label: "Pending confirmation", value: "pending" },
        { label: "Confirmed", value: "confirmed" },
        { label: "Unsubscribed", value: "unsubscribed" },
      ],
    },
    {
      name: "source",
      type: "text",
      admin: { description: 'Where they signed up, e.g. "footer", "journal".' },
    },
    {
      name: "consentAt",
      type: "date",
      admin: { description: "POPIA: when consent was given." },
    },
    {
      name: "confirmToken",
      type: "text",
      admin: { hidden: true },
    },
  ],
};
