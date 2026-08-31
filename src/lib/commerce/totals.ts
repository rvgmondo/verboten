/**
 * The one place an order total is worked out.
 *
 * This used to live in three: the server action that creates the order, the
 * checkout form's summary, and the cart drawer. Three copies of the same
 * arithmetic is how a buyer ends up looking at one number while being charged
 * another, which is precisely the bug that turned up in the checkout. Anything
 * that shows a total or takes money calls this.
 *
 * Pure on purpose: no database, no settings lookup, no React. Everything it
 * needs is an argument, so it can be reasoned about and tested directly.
 */

export type TotalsInput = {
  /** Sum of line items, before anything is taken off or added on. */
  subtotalCents: number;
  /** Already validated. Zero when no code applies. */
  discountCents?: number;
  /** Flat delivery fee. */
  flatRateCents: number;
  /** Spend at or above this and delivery is free. Zero disables it. */
  freeThresholdCents: number;
};

export type Totals = {
  discountCents: number;
  shippingCents: number;
  totalCents: number;
  /** True when this order earned free delivery. */
  qualifiesFree: boolean;
  /** Cents still to spend to earn it. Zero once earned or when disabled. */
  awayFromFreeCents: number;
};

export const orderTotals = ({
  subtotalCents,
  discountCents = 0,
  flatRateCents,
  freeThresholdCents,
}: TotalsInput): Totals => {
  // A discount can never exceed the goods, or the order goes negative and the
  // customer is owed delivery money.
  const discount = Math.max(0, Math.min(Math.round(discountCents), subtotalCents));
  const goods = subtotalCents - discount;

  // The threshold is measured against what is actually paid for the goods, so
  // a discount can drop an order back under it. Anything else lets a code buy
  // free delivery it did not earn.
  const qualifiesFree = freeThresholdCents > 0 && goods >= freeThresholdCents;
  const shippingCents = qualifiesFree ? 0 : Math.max(0, flatRateCents);

  return {
    discountCents: discount,
    shippingCents,
    totalCents: goods + shippingCents,
    qualifiesFree,
    awayFromFreeCents:
      freeThresholdCents > 0 && !qualifiesFree ? freeThresholdCents - goods : 0,
  };
};
