import type { CollectionConfig } from "payload";

import { isAdmin, isAdminOrEditor, isStaffField, serverOnly, staffOrOwnCustomer } from "../access/access";
import { applyCancelledSideEffects, applyPaidSideEffects } from "../lib/commerce/lifecycle";
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
    // needsAttention sits second on purpose. Abandoned checkouts pile up as
    // pending_payment, so a real payment that failed to reconcile looked
    // exactly like them in this list. Now it is visible without opening a row.
    defaultColumns: ["orderNumber", "needsAttention", "status", "email", "totalCents", "createdAt"],
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
        description:
          "Paid also takes the stock off the shelf and emails the customer. Cancelled and Refunded hand any discount code back. Each of those happens once, however the status got here.",
      },
    },
    {
      /**
       * The one field the owner should be able to scan a list for.
       *
       * Money that needs a human is otherwise indistinguishable from an
       * abandoned cart: same status, same columns, and the explanation buried
       * in a textarea near the foot of the record. The server log holds it too,
       * but nobody running a shop from cPanel reads server logs.
       */
      name: "needsAttention",
      type: "select",
      defaultValue: "none",
      options: [
        { label: "Nothing to do", value: "none" },
        { label: "Amount mismatch", value: "amount_mismatch" },
        { label: "Paid after cancellation", value: "paid_after_cancel" },
        { label: "Oversold", value: "oversold" },
      ],
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "Set automatically when a payment needs a person to look at it.",
      },
    },
    {
      // Guards, so a side effect runs exactly once no matter which path got
      // the order here: the webhook, or a staff member marking it by hand
      // after an EFT or a sale at a market.
      name: "stockMoved",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "Stock has been taken off for this order.",
      },
    },
    {
      name: "discountReleased",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "The discount code claimed by this order has been handed back.",
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
          // Field access, not just an admin label. A signed-in customer can GET
          // their own order over the REST API, and this holds the whole
          // verified ITN, signature included. That digest is taken over the
          // notification body plus the merchant passphrase, and the body is
          // right beside it, so handing it out is offline guessing material.
          access: { read: isStaffField },
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
      // "Staff only" has to be enforced, not merely written down. The webhook
      // writes reconciliation language here ("AMOUNT MISMATCH on ITN", "PAYMENT
      // RECEIVED on a cancelled order, reconcile manually") that the buyer must
      // never read on their own order.
      access: { read: isStaffField },
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
      async ({ doc, previousDoc, operation, req, context }) => {
        if (operation !== "update" || !previousDoc) return doc;
        // Bookkeeping writes from the lifecycle helpers themselves.
        if (context?.skipLifecycle) return doc;

        const statusChanged = doc.status !== previousDoc.status;

        // The dropdown is not a notification switch. Marking an order Paid by
        // hand, which is what happens after an EFT or a sale at a market, has
        // to move stock exactly as the webhook does, and cancelling has to
        // hand the discount code back. Both are guarded on the order itself,
        // so whichever path arrives first does the work and the other does
        // nothing.
        if (statusChanged) {
          if (doc.status === "paid") {
            await applyPaidSideEffects(req.payload, doc);
          } else if (doc.status === "cancelled" || doc.status === "refunded") {
            await applyCancelledSideEffects(req.payload, doc);
          }
        }

        // Marking an order shipped and pasting the tracking number in are two
        // separate saves in the admin, and staff naturally do them in that
        // order: the number only exists once the courier has collected. Only
        // watching the status meant the customer got "on its way" with no
        // number, and the number itself never reached them. A tracking number
        // arriving on an already-shipped order is worth an email of its own.
        const trackingArrived =
          doc.status === "shipped" &&
          !statusChanged &&
          Boolean(doc.trackingNumber) &&
          doc.trackingNumber !== previousDoc.trackingNumber;

        if (statusChanged || trackingArrived) {
          await sendOrderStatusEmail(req.payload, doc);
        }
        return doc;
      },
    ],
  },
};
