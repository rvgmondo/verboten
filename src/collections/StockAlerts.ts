import type { CollectionConfig } from "payload";

import { isAdmin, isAdminOrEditor, serverOnly } from "../access/access";

/**
 * People who asked to be told when a sold-out product is back.
 *
 * One request, one product, one email. Kept separate from the newsletter on
 * purpose: someone who wants to know when the gin returns has asked for
 * exactly that, and enrolling them in all the house's marketing on the strength
 * of it is not the consent they gave. The sold-out page used to do precisely
 * that, promising "this list hears first the moment it is back" while nothing
 * ever sent a restock notice at all.
 *
 * Doubles as the best demand signal the business has: a count of people
 * waiting on a specific bottle is a reason to bottle more of it.
 */
export const StockAlerts: CollectionConfig = {
  slug: "stock-alerts",
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "product", "status", "createdAt"],
    group: "Marketing",
    description:
      "People waiting for a sold-out product. They get one email when it is back, then the request is closed.",
  },
  access: {
    read: isAdminOrEditor,
    // Only the product page's server action creates these.
    create: serverOnly,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      name: "email",
      type: "email",
      required: true,
      index: true,
    },
    {
      name: "product",
      type: "relationship",
      relationTo: "products",
      required: true,
      index: true,
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "waiting",
      index: true,
      options: [
        { label: "Waiting", value: "waiting" },
        { label: "Told it is back", value: "sent" },
        { label: "Cancelled", value: "cancelled" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "requestedAt",
      type: "date",
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "POPIA: when they asked. The request is the consent, for this one email.",
      },
    },
    {
      name: "sentAt",
      type: "date",
      admin: { position: "sidebar", readOnly: true },
    },
  ],
};
