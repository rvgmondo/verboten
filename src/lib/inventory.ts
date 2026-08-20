import type { Batch, Product } from "../payload-types";

export type Availability = {
  /** Units available, or null when the product does not track stock. */
  available: number | null;
  soldOut: boolean;
  lowStock: boolean;
  /** Present when the product draws from a numbered batch. */
  batch?: Batch;
};

const asBatch = (rel: Product["batch"]): Batch | undefined =>
  rel && typeof rel === "object" ? (rel as Batch) : undefined;

const asProduct = (rel: number | Product): Product | undefined =>
  typeof rel === "object" ? rel : undefined;

/**
 * Single source of truth for what "in stock" means, used by the shop pages
 * and re-checked server-side at checkout.
 *
 * - own mode: the product's stockQty
 * - batch mode: the linked batch's bottlesRemaining
 * - bundles: constrained by their components (a 2-bottle set with 5 bottles
 *   left can sell at most 2), so bundle stock can never drift from reality
 *
 * Relations must be populated (query with depth >= 2 for bundles).
 */
export const getAvailability = (product: Product): Availability => {
  if (product.productType === "bundle") {
    const items = product.bundleItems ?? [];
    if (items.length === 0) return { available: 0, soldOut: true, lowStock: false };

    let available: number | null = null;
    for (const item of items) {
      const component = asProduct(item.product);
      if (!component) continue;
      const comp = getAvailability(component);
      if (comp.available === null) continue;
      const supports = Math.floor(comp.available / (item.quantity ?? 1));
      available = available === null ? supports : Math.min(available, supports);
    }
    const soldOut = available !== null && available <= 0;
    return { available, soldOut, lowStock: available !== null && !soldOut && available <= 3 };
  }

  const batch = asBatch(product.batch);
  const mode = product.inventory?.mode ?? "own";

  if (mode === "batch" && batch) {
    const available = Math.max(0, batch.bottlesRemaining);
    const soldOut = available <= 0 || batch.status === "sold_out";
    const threshold = product.inventory?.lowStockThreshold ?? 6;
    return { available, soldOut, lowStock: !soldOut && available <= threshold, batch };
  }

  const available = Math.max(0, product.inventory?.stockQty ?? 0);
  const threshold = product.inventory?.lowStockThreshold ?? 6;
  return {
    available,
    soldOut: available <= 0,
    lowStock: available > 0 && available <= threshold,
    batch,
  };
};
