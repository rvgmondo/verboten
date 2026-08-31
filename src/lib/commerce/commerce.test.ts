import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { discountAmount } from "@/lib/commerce/discounts";
import { orderTotals } from "@/lib/commerce/totals";
import { getAvailability } from "@/lib/inventory";
import type { Product } from "@/payload-types";

/**
 * The arithmetic and the stock rules that decide what a customer is charged
 * and whether we can actually send them anything.
 *
 * These are the only parts of the shop where a quiet mistake costs real money,
 * and every case below is one that has either happened here or is one step
 * away from happening. Run with `npm test`. No test framework is installed on
 * purpose: this is node:test, which ships with Node.
 */

/* Real catalogue numbers, so a failure reads in money you recognise. */
const BOTTLE = 45000; // R450
const SET = 85000; // R850
const DELIVERY = 15000; // R150
const FREE_OVER = 250000; // R2500

const totals = (over: Partial<Parameters<typeof orderTotals>[0]> = {}) =>
  orderTotals({
    subtotalCents: BOTTLE,
    flatRateCents: DELIVERY,
    freeThresholdCents: FREE_OVER,
    ...over,
  });

describe("orderTotals", () => {
  it("adds flat delivery below the threshold", () => {
    const t = totals();
    assert.equal(t.shippingCents, DELIVERY);
    assert.equal(t.totalCents, BOTTLE + DELIVERY);
    assert.equal(t.qualifiesFree, false);
  });

  it("gives free delivery at exactly the threshold, not just above it", () => {
    const t = totals({ subtotalCents: FREE_OVER });
    assert.equal(t.shippingCents, 0);
    assert.equal(t.totalCents, FREE_OVER);
    assert.equal(t.qualifiesFree, true);
  });

  it("measures the threshold after the discount, so a code cannot buy free delivery", () => {
    // R2500 of goods with R100 off is R2400 paid, which has not earned it.
    const t = totals({ subtotalCents: FREE_OVER, discountCents: 10000 });
    assert.equal(t.qualifiesFree, false);
    assert.equal(t.shippingCents, DELIVERY);
    assert.equal(t.totalCents, FREE_OVER - 10000 + DELIVERY);
  });

  it("never lets a discount exceed the goods and refund delivery", () => {
    const t = totals({ subtotalCents: BOTTLE, discountCents: 999999 });
    assert.equal(t.discountCents, BOTTLE);
    assert.equal(t.totalCents, DELIVERY);
    assert.ok(t.totalCents >= 0);
  });

  it("treats a zero threshold as free delivery switched off, not always on", () => {
    const t = totals({ subtotalCents: 10_000_000, freeThresholdCents: 0 });
    assert.equal(t.qualifiesFree, false);
    assert.equal(t.shippingCents, DELIVERY);
  });

  it("reports how far off free delivery is, and stops once earned", () => {
    assert.equal(totals().awayFromFreeCents, FREE_OVER - BOTTLE);
    assert.equal(totals({ subtotalCents: FREE_OVER }).awayFromFreeCents, 0);
    assert.equal(totals({ freeThresholdCents: 0 }).awayFromFreeCents, 0);
  });

  it("agrees with the two bottle set being the common real order", () => {
    const t = totals({ subtotalCents: SET });
    assert.equal(t.totalCents, SET + DELIVERY); // R1000
  });
});

describe("discountAmount", () => {
  it("rounds percentages down, so we never give away a cent we did not mean to", () => {
    // 10% of R450.01 is 4500.1 cents.
    assert.equal(discountAmount("percentage", 10, 45001), 4500);
  });

  it("caps a fixed amount at the subtotal", () => {
    assert.equal(discountAmount("fixed", 100000, BOTTLE), BOTTLE);
  });

  it("never returns a negative discount from a bad code", () => {
    assert.equal(discountAmount("percentage", -50, BOTTLE), 0);
    assert.equal(discountAmount("fixed", -50, BOTTLE), 0);
  });

  it("handles a full 100% code without going below zero", () => {
    assert.equal(discountAmount("percentage", 100, BOTTLE), BOTTLE);
  });
});

/* Minimal shapes: getAvailability only reads these fields. */
const own = (stockQty: number, lowStockThreshold = 6) =>
  ({
    productType: "single",
    inventory: { mode: "own", stockQty, lowStockThreshold },
  }) as unknown as Product;

const bundleOf = (...parts: Array<{ product: Product; quantity: number }>) =>
  ({
    productType: "bundle",
    bundleItems: parts.map((p) => ({ product: p.product, quantity: p.quantity })),
  }) as unknown as Product;

describe("getAvailability", () => {
  it("counts a product's own stock", () => {
    const a = getAvailability(own(10));
    assert.equal(a.available, 10);
    assert.equal(a.soldOut, false);
    assert.equal(a.lowStock, false);
  });

  it("calls zero sold out, and flags low stock at the threshold", () => {
    assert.equal(getAvailability(own(0)).soldOut, true);
    assert.equal(getAvailability(own(6)).lowStock, true);
    assert.equal(getAvailability(own(7)).lowStock, false);
  });

  it("never reports negative stock, however the number got there", () => {
    assert.equal(getAvailability(own(-5)).available, 0);
    assert.equal(getAvailability(own(-5)).soldOut, true);
  });

  it("limits a bundle to how many complete sets its contents support", () => {
    // Seven bottles make three two-bottle sets, not three and a half.
    const set = bundleOf({ product: own(7), quantity: 2 });
    assert.equal(getAvailability(set).available, 3);
    assert.equal(getAvailability(set).soldOut, false);
  });

  it("sells out a bundle as soon as one component runs out", () => {
    const hamper = bundleOf(
      { product: own(50), quantity: 1 },
      { product: own(0), quantity: 1 },
    );
    assert.equal(getAvailability(hamper).available, 0);
    assert.equal(getAvailability(hamper).soldOut, true);
  });

  it("treats a bundle with no contents as sold out rather than infinite", () => {
    const empty = { productType: "bundle", bundleItems: [] } as unknown as Product;
    assert.equal(getAvailability(empty).soldOut, true);
  });

  it("cannot make a set out of one bottle", () => {
    const set = bundleOf({ product: own(1), quantity: 2 });
    assert.equal(getAvailability(set).available, 0);
    assert.equal(getAvailability(set).soldOut, true);
  });
});
