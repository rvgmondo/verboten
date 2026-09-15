"use server";

import { headers } from "next/headers";
import { getPayload } from "payload";
import { z } from "zod";

import { journeyFor, STATUS_LABELS, type JourneyStep } from "@/lib/order-status";
import { clientKey, rateLimit } from "@/lib/rate-limit";

import config from "../../payload.config";

/**
 * Look an order up with its number and the email it was placed with.
 *
 * Most orders here are guest checkouts, and until now the only way to see one
 * was to create an account, which is a support email waiting to happen every
 * time someone wants to know where their brandy is.
 *
 * Order numbers are sequential, so on their own they are guessable. The email
 * is the second half of the key, the pair is compared exactly, the attempt is
 * rate limited per visitor, and a wrong number and a wrong email get the same
 * answer, so the form cannot be used to find out which order numbers exist or
 * who placed them.
 *
 * What comes back is deliberately thin: status, contents, total, the courier's
 * tracking number and the delivery town. Never the street address, the phone
 * number or the date of birth, because anyone holding a forwarded confirmation
 * email holds both halves of the key.
 */

export type TrackedOrder = {
  orderNumber: string;
  placedAt: string;
  status: string;
  statusLabel: string;
  cancelled: boolean;
  items: Array<{ name: string; quantity: number; lineCents: number }>;
  totalCents: number;
  trackingNumber: string | null;
  deliveryTown: string | null;
  journey: JourneyStep[];
};

export type TrackResult =
  | { ok: true; order: TrackedOrder }
  | { ok: false; message: string; fieldErrors?: { orderNumber?: string; email?: string } };

const schema = z.object({
  // Forgiving about how people type it: "vb-2026-0007", "VB 2026 0007".
  orderNumber: z
    .string()
    .trim()
    .transform((v) => v.toUpperCase().replace(/\s+/g, "-"))
    .pipe(z.string().regex(/^VB-\d{4}-\d{4,}$/, "Order numbers look like VB-2026-0007.")),
  email: z.string().trim().toLowerCase().email("Enter the email the order was placed with."),
});

export async function trackOrder(_prev: TrackResult | null, formData: FormData): Promise<TrackResult> {
  const hdrs = await headers();
  if (!rateLimit(clientKey(hdrs, "track"), { limit: 12, windowMs: 15 * 60 * 1000 })) {
    return { ok: false, message: "Too many lookups in a short time. Wait a few minutes and try again." };
  }

  const parsed = schema.safeParse({
    orderNumber: formData.get("orderNumber") ?? "",
    email: formData.get("email") ?? "",
  });
  if (!parsed.success) {
    const fieldErrors: { orderNumber?: string; email?: string } = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if ((key === "orderNumber" || key === "email") && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, message: "Check the highlighted fields.", fieldErrors };
  }

  const { orderNumber, email } = parsed.data;
  const payload = await getPayload({ config });

  const found = await payload.find({
    collection: "orders",
    where: { orderNumber: { equals: orderNumber } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  const order = found.docs[0];

  // The same answer for an unknown number and a wrong email, on purpose.
  if (!order || order.email.trim().toLowerCase() !== email) {
    return {
      ok: false,
      message:
        "We could not find an order with that number and email. Check both against your confirmation email.",
    };
  }

  return {
    ok: true,
    order: {
      orderNumber: order.orderNumber,
      placedAt: order.createdAt,
      status: order.status,
      statusLabel: STATUS_LABELS[order.status] ?? order.status,
      cancelled: order.status === "cancelled" || order.status === "refunded",
      items: order.items.map((i) => ({
        name: i.nameSnapshot,
        quantity: i.quantity,
        lineCents: i.unitPriceCents * i.quantity,
      })),
      totalCents: order.totalCents,
      trackingNumber: order.trackingNumber ?? null,
      deliveryTown: order.shippingAddress?.city ?? null,
      journey: journeyFor(order),
    },
  };
}
