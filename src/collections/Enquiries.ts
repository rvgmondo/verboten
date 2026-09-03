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
    defaultColumns: ["name", "topic", "email", "status", "createdAt"],
    group: "Orders",
  },
  access: {
    read: isAdminOrEditor,
    create: serverOnly,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      name: "topic",
      type: "select",
      required: true,
      defaultValue: "general",
      options: [
        { label: "General", value: "general" },
        { label: "Bar booking", value: "booking" },
        { label: "Stockist", value: "stockist" },
      ],
      admin: { position: "sidebar", description: "Where the enquiry came from." },
    },
    { name: "name", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "phone", type: "text" },
    { name: "message", type: "textarea", required: true },
    {
      name: "event",
      type: "group",
      admin: {
        condition: (data) => data?.topic === "booking",
        description: "What the mobile bar needs in order to quote.",
      },
      fields: [
        { name: "date", type: "text", admin: { description: "As the enquirer typed it." } },
        { name: "location", type: "text" },
        {
          // Text, like the date beside it. People answer "roughly how many
          // people" with "80-100" or "about 80", and a number field turned
          // every one of those into a rejection the form could not even show.
          name: "guests",
          type: "text",
          admin: { description: "As the enquirer typed it." },
        },
      ],
    },
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
