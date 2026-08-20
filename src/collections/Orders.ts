import type { CollectionConfig } from "payload";

import { isAdmin, isAdminOrEditor, serverOnly, staffOrOwnCustomer } from "../access/access";
import { sendOrderStatusEmail } from "../lib/emails";

export const ORDER_STATUSES = [
  { label: "Pending payment", value: "pending_payment" },
  { label: "Paid", value: "paid" },
  { label: "Packed", value: "packed" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Refunded", value: "refunded" },
] as const;

export const SA_PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape",
] as const;

/**
 * The daily-use surface for staff. Orders are created exclusively server-side
 * by the checkout flow (local API with overrideAccess); the public REST API can
 * never create or mutate one. Item names and prices are snapshotted at order
 * time so later product edits never rewrite order history. Totals are computed
 * server-side at checkout; the client never sets prices.
 */
export const Orders: CollectionConfig = {
  slug: "orders",
  admin: {
    useAsTitle: "orderNumber",
    defaultColumns: ["orderNumber", "status", "email", "totalCents", "createdAt"],
    group: "Orders",
    listSearchableFields: ["orderNumber", "email", "customerName", "payment.reference"],
  },
  access: {
    read: staffOrOwnCustomer,
    create: serverOnly,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      name: "orderNumber",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { position: "sidebar", readOnly: true },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending_payment",
      options: [...ORDER_STATUSES],
      admin: {
        position: "sidebar",
        description: "Changing this emails the customer the matching update.",
      },
    },
    {
      name: "customer",
      type: "relationship",
      relationTo: "customers",
      admin: {
        position: "sidebar",
        description: "Empty for guest checkouts.",
      },
    },
    {
      name: "email",
      type: "email",
      required: true,
      index: true,
    },
    {
      name: "customerName",
      type: "text",
      required: true,
    },
    {
      name: "phone",
      type: "text",
    },
    {
      name: "items",
      type: "array",
      required: true,
      minRows: 1,
      fields: [
        {
          name: "product",
          type: "relationship",
          relationTo: "products",
          required: true,
        },
        {
          name: "nameSnapshot",
          type: "text",
          required: true,
          admin: { description: "Product name at the time of purchase." },
        },
        {
          name: "unitPriceCents",
          type: "number",
          required: true,
          min: 0,
        },
        {
          name: "quantity",
          type: "number",
          required: true,
          min: 1,
        },
      ],
    },
    {
      name: "subtotalCents",
      type: "number",
      required: true,
      min: 0,
    },
    {
      name: "shippingCents",
      type: "number",
      required: true,
      min: 0,
    },
    {
      name: "discountCents",
      type: "number",
      required: true,
      defaultValue: 0,
      min: 0,
    },
    {
      name: "discountCode",
      type: "text",
      admin: { description: "The code applied at checkout, if any." },
    },
    {
      name: "totalCents",
      type: "number",
      required: true,
      min: 0,
    },
    {
      name: "currency",
      type: "text",
      required: true,
      defaultValue: "ZAR",
    },
    {
      name: "shippingAddress",
      type: "group",
      fields: [
        { name: "line1", type: "text", required: true },
        { name: "line2", type: "text" },
        { name: "suburb", type: "text" },
        { name: "city", type: "text", required: true },
        {
          name: "province",
          type: "select",
          required: true,
          options: SA_PROVINCES.map((p) => ({ label: p, value: p })),
        },
        { name: "postalCode", type: "text", required: true },
        { name: "country", type: "text", required: true, defaultValue: "ZA" },
      ],
    },
    {
      name: "ageVerification",
      type: "group",
      admin: {
        description: "Second compliance layer captured at checkout (first is the age gate).",
      },
      fields: [
        { name: "dateOfBirth", type: "date", admin: { date: { pickerAppearance: "dayOnly" } } },
        { name: "confirmedAt", type: "date" },
      ],
    },
    {
      name: "payment",
      type: "group",
      fields: [
        {
          name: "provider",
          type: "select",
          options: [{ label: "PayFast", value: "payfast" }],
          defaultValue: "payfast",
        },
        {
          name: "reference",
          type: "text",
          index: true,
          admin: { description: "Gateway payment id (PayFast pf_payment_id)." },
        },
        {
          name: "raw",
          type: "json",
          admin: { description: "Verified webhook payload, stored for reconciliation." },
        },
      ],
    },
    {
      name: "trackingNumber",
      type: "text",
    },
    {
      name: "customerNote",
      type: "textarea",
    },
    {
      name: "internalNotes",
      type: "textarea",
      admin: { description: "Staff only; never shown to the customer." },
    },
    {
      name: "statusLog",
      type: "array",
      admin: { readOnly: true, description: "Automatic audit trail of status changes." },
      fields: [
        { name: "status", type: "text", required: true },
        { name: "at", type: "date", required: true },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, originalDoc, operation }) => {
        // Append to the audit trail whenever status changes.
        const prev = originalDoc?.status;
        if (data.status && (operation === "create" || data.status !== prev)) {
          data.statusLog = [
            ...(originalDoc?.statusLog ?? []),
            { status: data.status, at: new Date().toISOString() },
          ];
        }
        return data;
      },
    ],
    afterChange: [
      // Every status transition emails the customer the matching update,
      // whether the change came from the payment webhook or a staff member
      // in the admin. Creation (pending_payment) sends nothing.
      async ({ doc, previousDoc, operation, req }) => {
        if (operation === "update" && previousDoc && doc.status !== previousDoc.status) {
          await sendOrderStatusEmail(req.payload, doc);
        }
        return doc;
      },
    ],
  },
};
