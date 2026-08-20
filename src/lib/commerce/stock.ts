import type { Payload } from "payload";

import { getAvailability } from "@/lib/inventory";
import type { Order, Product } from "@/payload-types";

/**
 * Stock movement for paid orders. Bundles decrement their components (a
 * 2-bottle set takes two bottles out of the batch), batch-mode products
 * decrement the batch, own-mode products decrement their own count.
 */

type Decrement = { kind: "batch"; id: number; units: number } | { kind: "product"; id: number; units: number };

const collectDecrements = (product: Product, units: number, acc: Decrement[]): void => {
  if (product.productType === "bundle") {
    for (const item of product.bundleItems ?? []) {
      const component = typeof item.product === "object" ? (item.product as Product) : null;
      if (component) collectDecrements(component, units * (item.quantity ?? 1), acc);
    }
    return;
  }
  const batch =
    product.batch && typeof product.batch === "object" ? product.batch : null;
  if (product.inventory?.mode === "batch" && batch) {
    acc.push({ kind: "batch", id: batch.id, units });
  } else {
    acc.push({ kind: "product", id: product.id, units });
  }
};

export const decrementStockForOrder = async (payload: Payload, order: Order): Promise<void> => {
  const decrements: Decrement[] = [];

  for (const item of order.items) {
    const productId = typeof item.product === "object" ? item.product.id : item.product;
    const product = await payload.findByID({
      collection: "products",
      id: productId,
      depth: 2,
    });
    collectDecrements(product, item.quantity, decrements);
  }

  // Merge duplicate targets before writing.
  const merged = new Map<string, Decrement>();
  for (const d of decrements) {
    const key = `${d.kind}:${d.id}`;
    const existing = merged.get(key);
    if (existing) existing.units += d.units;
    else merged.set(key, { ...d });
  }

  for (const d of merged.values()) {
    if (d.kind === "batch") {
      const batch = await payload.findByID({ collection: "batches", id: d.id });
      await payload.update({
        collection: "batches",
        id: d.id,
        data: { bottlesRemaining: Math.max(0, batch.bottlesRemaining - d.units) },
      });
    } else {
      const product = await payload.findByID({ collection: "products", id: d.id });
      await payload.update({
        collection: "products",
        id: d.id,
        data: {
          inventory: {
            ...product.inventory,
            stockQty: Math.max(0, (product.inventory?.stockQty ?? 0) - d.units),
          },
        },
      });
    }
  }
};

/** Authoritative stock check at checkout: requested vs live availability. */
export const findStockProblems = (
  requested: Array<{ product: Product; quantity: number }>,
): string[] => {
  const problems: string[] = [];
  for (const { product, quantity } of requested) {
    const availability = getAvailability(product);
    if (availability.soldOut) {
      problems.push(`${product.name} is sold out.`);
    } else if (availability.available !== null && quantity > availability.available) {
      problems.push(
        `Only ${availability.available} of ${product.name} ${availability.available === 1 ? "is" : "are"} left.`,
      );
    }
  }
  return problems;
};
