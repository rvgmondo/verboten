import type { CollectionConfig } from "payload";

import { anyone, isAdminOrEditor } from "../access/access";
import { revalidateHooks } from "../lib/revalidate";

/** Markets, festivals and tastings where Verboten pours. */
export const Events: CollectionConfig = {
  slug: "events",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "startDate", "location"],
    group: "Content",
  },
  hooks: { ...revalidateHooks("events") },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "startDate",
      type: "date",
      required: true,
      admin: { date: { pickerAppearance: "dayAndTime" } },
    },
    {
      name: "endDate",
      type: "date",
      admin: { date: { pickerAppearance: "dayAndTime" } },
    },
    {
      name: "location",
      type: "text",
      required: true,
      admin: { description: "Venue name as people say it, e.g. Lavender Kontrei Mark." },
    },
    {
      name: "address",
      type: "group",
      // Google requires a postal address on an Event with a physical location.
      // With only a venue name the Event fails validation outright and the
      // listing is ineligible for the events rich result, which for a house
      // that lives on markets and tastings forfeits the whole surface.
      admin: { description: "Needed for the event to appear in Google's event results." },
      fields: [
        { name: "streetAddress", type: "text" },
        { name: "addressLocality", type: "text", admin: { description: "Town or city." } },
        {
          name: "addressRegion",
          type: "text",
          admin: { description: "Province, e.g. Gauteng." },
        },
        { name: "postalCode", type: "text" },
        { name: "addressCountry", type: "text", defaultValue: "ZA" },
      ],
    },
    { name: "description", type: "textarea" },
    { name: "url", type: "text", admin: { description: "Tickets or event page link." } },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
    },
  ],
};
