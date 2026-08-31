import type { Payload } from "payload";

import { claimDiscountUse, releaseDiscountUse } from "@/lib/commerce/atomic";
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

const findCode = async (payload: Payload, code: string) =>
  (
    await payload.find({
      collection: "discount-codes",
      where: { code: { equals: code.trim().toUpperCase() } },
      limit: 1,
      overrideAccess: true,
    })
  ).docs[0];

/**
 * Take the use at checkout, not at payment.
 *
 * checkDiscount only reads the cap, and minutes can pass between that read and
 * the payment landing, so the cap has to be claimed the moment the order is
 * created. The trade-off is deliberate: an abandoned checkout holds its claim
 * until the payment explicitly fails, so a single-use code can sit spent for a
 * sale that never happened. Honouring a code once too few is a support email;
 * honouring it ten times too many is money.
 */
export const claimDiscount = async (payload: Payload, code: string): Promise<boolean> => {
  const doc = await findCode(payload, code);
  if (!doc) return false;
  return claimDiscountUse(payload, doc.id);
};

/** Give the claim back when the payment fails or the order is cancelled. */
export const releaseDiscount = async (payload: Payload, code: string): Promise<void> => {
  const doc = await findCode(payload, code);
  if (!doc) return;
  await releaseDiscountUse(payload, doc.id);
};
