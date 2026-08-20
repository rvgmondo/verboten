import type { Payload } from "payload";

import type { DiscountCode } from "@/payload-types";

export type DiscountCheck =
  | { ok: true; code: DiscountCode; discountCents: number }
  | { ok: false; reason: string };

/**
 * Server-side discount validation. The client only ever sees the outcome;
 * codes are unreadable through the public API.
 */
export const checkDiscount = async (
  payload: Payload,
  rawCode: string,
  subtotalCents: number,
): Promise<DiscountCheck> => {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, reason: "Enter a code." };

  const doc = (
    await payload.find({
      collection: "discount-codes",
      where: { code: { equals: code } },
      limit: 1,
      overrideAccess: true,
    })
  ).docs[0];

  const invalid = { ok: false as const, reason: "That code is not valid." };
  if (!doc || !doc.active) return invalid;

  const now = Date.now();
  if (doc.startsAt && new Date(doc.startsAt).getTime() > now) return invalid;
  if (doc.expiresAt && new Date(doc.expiresAt).getTime() < now) {
    return { ok: false, reason: "That code has expired." };
  }
  if (typeof doc.maxUses === "number" && doc.usedCount >= doc.maxUses) {
    return { ok: false, reason: "That code has been fully used." };
  }
  if (typeof doc.minSubtotalCents === "number" && subtotalCents < doc.minSubtotalCents) {
    return { ok: false, reason: "Your order does not meet the minimum for that code." };
  }

  const discountCents =
    doc.type === "percentage"
      ? Math.floor((subtotalCents * doc.value) / 100)
      : Math.min(Math.round(doc.value), subtotalCents);

  return { ok: true, code: doc, discountCents };
};

/** Count a successful (paid) redemption. */
export const redeemDiscount = async (payload: Payload, code: string): Promise<void> => {
  const doc = (
    await payload.find({
      collection: "discount-codes",
      where: { code: { equals: code.trim().toUpperCase() } },
      limit: 1,
      overrideAccess: true,
    })
  ).docs[0];
  if (!doc) return;
  await payload.update({
    collection: "discount-codes",
    id: doc.id,
    data: { usedCount: doc.usedCount + 1 },
  });
};
