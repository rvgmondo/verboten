"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import type { BundleOffer } from "@/lib/data";
import { orderTotals } from "@/lib/commerce/totals";
import { useCart } from "@/lib/cart";
import { formatZAR } from "@/lib/money";

type Props = {
  flatRateCents: number;
  freeThresholdCents: number;
  offers: BundleOffer[];
};

export const CartDrawer = ({ flatRateCents, freeThresholdCents, offers }: Props) => {
  const { items, isOpen, close, add, remove, setQuantity, subtotalCents, hydrated } = useCart();

  // The cart carries no discount yet, so this is the same sum the checkout
  // will reach, from the same function.
  const { shippingCents, totalCents, qualifiesFree, awayFromFreeCents: awayFromFree } =
    orderTotals({ subtotalCents, flatRateCents, freeThresholdCents });
  /* Only nudge toward free delivery when it is actually within reach. Telling
     someone holding one bottle that they are R2,000 away is discouragement,
     not motivation. */
  const showFreeNudge = awayFromFree > 0 && subtotalCents * 2 >= freeThresholdCents;

  /* A bundle only offers itself once the cart already holds everything it
     contains, so this is never an upsell to something larger: it is the same
     drink for less. */
  const swap = offers.find((offer) =>
    offer.contains.every((part) => {
      const line = items.find((i) => i.productId === part.productId);
      return line !== undefined && line.quantity >= part.quantity;
    }),
  );

  const applySwap = (offer: BundleOffer) => {
    for (const part of offer.contains) {
      const line = items.find((i) => i.productId === part.productId);
      if (!line) continue;
      const left = line.quantity - part.quantity;
      if (left <= 0) remove(part.productId);
      else setQuantity(part.productId, left);
    }
    add({
      productId: offer.productId,
      slug: offer.slug,
      name: offer.name,
      priceCents: offer.priceCents,
      maxAvailable: offer.maxAvailable,
      imageUrl: offer.imageUrl,
      imageAlt: offer.imageAlt,
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent>
        <div className="border-b border-line p-6">
          <SheetTitle className="font-display text-xl text-bone">Your cart</SheetTitle>
          <SheetDescription className="mt-1 text-xs text-parch">
            {flatRateCents === 0
              ? "Delivery anywhere in South Africa is free."
              : `Delivery is ${formatZAR(flatRateCents)} anywhere in South Africa.`}
          </SheetDescription>
        </div>

        {!hydrated ? (
          <div className="flex flex-1 items-center justify-center p-6" aria-busy="true">
            <p className="text-sm text-parch">Fetching your cart.</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
            <p className="text-sm text-parch">Empty, for now.</p>
            <Button variant="outline" size="sm" asChild onClick={close}>
              <Link href="/shop">Browse the shop</Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-5 overflow-y-auto p-6">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-4">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden border border-line bg-smoke">
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        alt={item.imageAlt ?? item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/shop/${item.slug}`}
                        onClick={close}
                        className="text-sm text-bone hover:text-gold-bright"
                      >
                        {item.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(item.productId)}
                        className="-m-1.5 p-3 text-parch transition-colors hover:text-danger"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div
                        className="flex items-center border border-line"
                        role="group"
                        aria-label={`Quantity for ${item.name}`}
                      >
                        <button
                          type="button"
                          onClick={() => setQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="px-3 py-2.5 text-parch transition-colors hover:text-bone disabled:opacity-30"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" aria-hidden="true" />
                        </button>
                        <span className="w-8 text-center text-xs text-bone" aria-live="polite">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(item.productId, item.quantity + 1)}
                          disabled={
                            item.maxAvailable !== null && item.quantity >= item.maxAvailable
                          }
                          className="px-3 py-2.5 text-parch transition-colors hover:text-bone disabled:opacity-30"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </div>
                      <p className="text-sm text-gold">
                        {formatZAR(item.priceCents * item.quantity)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}

              {swap && (
                <li className="border border-gold-dim/50 bg-coal p-4">
                  <p className="eyebrow text-gold">Same drink, less money</p>
                  <p className="mt-2 text-sm leading-relaxed text-parch">
                    What you have here is the {swap.name}, bought separately. As
                    the set it is {formatZAR(swap.priceCents)}, so you keep{" "}
                    {formatZAR(swap.savingCents)}.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => applySwap(swap)}
                  >
                    Switch to the set
                  </Button>
                </li>
              )}
            </ul>

            <div className="space-y-4 border-t border-line p-6">
              {/* Delivery is stated here, not deferred to checkout. Nobody
                  likes meeting a courier fee three screens later. */}
              <dl className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <dt className="uppercase tracking-[0.18em] text-parch">Subtotal</dt>
                  <dd className="text-bone">{formatZAR(subtotalCents)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="uppercase tracking-[0.18em] text-parch">Delivery</dt>
                  <dd className={qualifiesFree ? "text-gold" : "text-bone"}>
                    {shippingCents === 0 ? "Free" : formatZAR(shippingCents)}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-line pt-3">
                  <dt className="uppercase tracking-[0.18em] text-parch">Total</dt>
                  <dd className="font-display text-lg text-bone">{formatZAR(totalCents)}</dd>
                </div>
              </dl>

              {showFreeNudge && (
                <p className="text-xs leading-relaxed text-parch">
                  {formatZAR(awayFromFree)} more and delivery is on us.
                </p>
              )}

              <Button className="w-full" asChild onClick={close}>
                <Link href="/checkout">Go to checkout</Link>
              </Button>
              <p className="text-center text-[0.7rem] text-parch">
                Discount codes apply at checkout.
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
