import type { CollectionConfig } from "payload";

import { isAdmin } from "../access/access";

/**
 * Internal atomic counters (e.g. the order-number sequence). A Payload-managed
 * collection so the schema push knows about its table; the actual increment is
 * done with a single atomic `UPDATE ... SET value = value + 1 RETURNING value`
 * (see src/lib/commerce/atomic.ts), which the document API cannot express.
 * Hidden from the admin nav; not something staff edit by hand.
 */
export const Counters: CollectionConfig = {
  slug: "counters",
  admin: { hidden: true, useAsTitle: "name" },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: "name", type: "text", required: true, unique: true, index: true },
    { name: "value", type: "number", required: true, defaultValue: 0 },
  ],
};
