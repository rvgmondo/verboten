import type { Payload } from "payload";

import { releaseDiscount } from "@/lib/commerce/discounts";
import { decrementStockForOrder } from "@/lib/commerce/stock";
import type { Order } from "@/payload-types";

/**
 * What has to happen when an order changes hands, wherever the change came
 * from.
 *
 * This used to live only inside the PayFast webhook, which meant the admin's
 * status dropdown was a notification switch and nothing more. A one person
 * house takes EFT and cash at markets constantly: the owner opens the order,
 * picks Paid, the buyer gets a real "Payment received" email, and the stock is
 * never taken off the shelf. Every hand marked sale inflated inventory a
 * little further, which is exactly the drift that produces the overselling the
 * webhook works so hard to detect. Hand cancelling had the mirror problem: the
 * discount use was never handed back, so a single use code stayed spent on a
 * sale that never happened.
 *
 * Both are guarded by a flag on the order rather than by which code path is
 * running, so the work happens exactly once whether the webhook or a person
 * got there first.
 */

/**
 * Take the stock for a paid order, once.
 *
 * Returns the shortfall, if the order took units that were not there. Nothing
 * here refuses: the money has already changed hands by the time this runs, so
 * the only useful thing to do with an oversell is make it impossible to miss.
 */
export const applyPaidSideEffects = async (
  payload: Payload,
  order: Order,
): Promise<{ oversold: boolean; detail: string }> => {
  if (order.stockMoved) return { oversold: false, detail: "" };

  const oversold = await decrementStockForOrder(payload, order);
  const detail = oversold
    .map((o) => `${o.units} more than ${o.kind} ${o.id} had`)
    .join("; ");

  await payload.update({
    collection: "orders",
    id: order.id,
    overrideAccess: true,
    // Skip the hooks: this write is bookkeeping about the transition that is
    // already in flight, and re-entering the status hook here would loop.
    context: { skipLifecycle: true },
    data: {
      stockMoved: true,
      ...(oversold.length > 0
        ? {
            needsAttention: "oversold" as const,
            internalNotes: [
              order.internalNotes,
              `OVERSOLD: this paid order took ${detail}. Stock was not reserved between checkout and payment. Confirm you can fulfil it before promising a date.`,
            ]
              .filter(Boolean)
              .join("\n\n"),
          }
        : {}),
    },
  });

  if (oversold.length > 0) {
    payload.logger.error(
      { order: order.orderNumber, oversold },
      "Oversold on paid order",
    );
  }

  return { oversold: oversold.length > 0, detail };
};

/** Hand a discount use back when a sale comes off, once. */
export const applyCancelledSideEffects = async (
  payload: Payload,
  order: Order,
): Promise<void> => {
  if (!order.discountCode || order.discountReleased) return;

  await releaseDiscount(payload, order.discountCode);
  await payload.update({
    collection: "orders",
    id: order.id,
    overrideAccess: true,
    context: { skipLifecycle: true },
    data: { discountReleased: true },
  });
  payload.logger.info(
    { order: order.orderNumber, code: order.discountCode },
    "Discount use released",
  );
};
