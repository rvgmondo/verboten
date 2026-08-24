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
import { useCart } from "@/lib/cart";
import { formatZAR } from "@/lib/money";

export const CartDrawer = () => {
  const { items, isOpen, close, remove, setQuantity, subtotalCents } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent>
        <div className="border-b border-line p-6">
          <SheetTitle className="font-display text-xl text-bone">Your cart</SheetTitle>
          <SheetDescription className="mt-1 text-xs text-parch">
            Shipping and any discount are settled at checkout.
          </SheetDescription>
        </div>

        {items.length === 0 ? (
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
                        className="p-1 text-parch transition-colors hover:text-danger"
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
                          className="p-1.5 text-parch transition-colors hover:text-bone disabled:opacity-30"
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
                          className="p-1.5 text-parch transition-colors hover:text-bone disabled:opacity-30"
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
            </ul>
            <div className="space-y-4 border-t border-line p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.18em] text-parch">Subtotal</p>
                <p className="font-display text-lg text-bone">{formatZAR(subtotalCents)}</p>
              </div>
              <Button className="w-full" asChild onClick={close}>
                <Link href="/checkout">Go to checkout</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
