import type { CollectionConfig } from "payload";

import { isAdmin, isAdminOrEditor, serverOnly } from "../access/access";

/**
 * Contact-form submissions. Created only by the contact server action (never
 * via the public API); staff get an email alert per submission and work the
 * queue here.
 */
export const Enquiries: CollectionConfig = {
  slug: "enquiries",
  admin: {
    useAsTitle: "email",
    defaultColumns: ["name", "email", "status", "createdAt"],
    group: "Orders",
  },
  access: {
    read: isAdminOrEditor,
    create: serverOnly,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "phone", type: "text" },
    { name: "message", type: "textarea", required: true },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "new",
      options: [
        { label: "New", value: "new" },
        { label: "Handled", value: "handled" },
      ],
      admin: { position: "sidebar" },
    },
  ],
};
