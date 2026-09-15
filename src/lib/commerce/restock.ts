import type { Payload } from "payload";

import { sendBackInStock } from "@/lib/emails";
import { getAvailability } from "@/lib/inventory";
import type { Product } from "@/payload-types";

/**
 * Tell everyone waiting on a product that it is back, once each.
 *
 * Runs after any product or batch is saved. It does not try to work out which
 * change made what available: a bundle becomes buyable when a component is
 * restocked, a batch-mode product when its batch is, and reasoning about each
 * path is how one gets missed. Instead it looks at every product someone is
 * actually waiting for and asks the same availability rule the shop uses.
 * Waiting requests are few, so that is cheap, and it cannot disagree with the
 * storefront about what "back" means.
 *
 * Each request is claimed with a conditional update before its email goes, so
 * two saves in quick succession cannot send the same person two emails. If the
 * send fails, the claim is handed back and the next save tries again.
 */
export const notifyRestocked = async (payload: Payload): Promise<void> => {
  try {
    const waiting = await payload.find({
      collection: "stock-alerts",
      where: { status: { equals: "waiting" } },
      limit: 500,
      depth: 0,
      overrideAccess: true,
    });
    if (waiting.totalDocs === 0) return;

    const byProduct = new Map<number, typeof waiting.docs>();
    for (const alert of waiting.docs) {
      const id = typeof alert.product === "object" ? alert.product.id : alert.product;
      byProduct.set(id, [...(byProduct.get(id) ?? []), alert]);
    }

    for (const [productId, alerts] of byProduct) {
      let product: Product;
      try {
        // Deep enough for a bundle's components to see their own batches.
        product = await payload.findByID({
          collection: "products",
          id: productId,
          depth: 3,
          overrideAccess: true,
        });
      } catch {
        continue; // Deleted since the request. Nothing to tell anyone.
      }
      if (product._status !== "published") continue;
      if (getAvailability(product).soldOut) continue;

      for (const alert of alerts) {
        const claimed = await payload.update({
          collection: "stock-alerts",
          where: { and: [{ id: { equals: alert.id } }, { status: { equals: "waiting" } }] },
          data: { status: "sent", sentAt: new Date().toISOString() },
          overrideAccess: true,
        });
        if (claimed.docs.length === 0) continue; // Another save got there first.

        const ok = await sendBackInStock(payload, { to: alert.email, product });
        if (!ok) {
          await payload.update({
            collection: "stock-alerts",
            id: alert.id,
            data: { status: "waiting", sentAt: null },
            overrideAccess: true,
          });
        }
      }
    }
  } catch (err) {
    // A restock notice must never be the reason an admin save fails.
    payload.logger.error({ err }, "Back-in-stock notification run failed");
  }
};
