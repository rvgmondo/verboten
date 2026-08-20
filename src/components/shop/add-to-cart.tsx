"use client";

import { Minus, Plus } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";

/**
 * Quantity picker + add button. Availability arrives from the server render;
 * the checkout re-validates everything, so this only shapes the UI.
 */
export const AddToCart = ({
  productId,
  slug,
  name,
  priceCents,
  maxAvailable,
  soldOut,
  imageUrl,
  imageAlt,
}: {
  productId: number;
  slug: string;
  name: string;
  priceCents: number;
  maxAvailable: number | null;
  soldOut: boolean;
  imageUrl?: string;
  imageAlt?: string;
}) => {
  const { add } = useCart();
  const [qty, setQty] = React.useState(1);
  const max = maxAvailable === null ? 12 : Math.min(12, maxAvailable);

  if (soldOut) {
    return (
      <div className="space-y-2">
        <Button disabled className="w-full sm:w-auto sm:min-w-56">
          Sold out
        </Button>
        <p className="text-xs text-parch">
          This release is gone. Join the list below and hear about the next one first.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div
        className="flex h-11 items-center border border-line"
        role="group"
        aria-label="Quantity"
      >
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          disabled={qty <= 1}
          className="px-3 py-2 text-parch transition-colors hover:text-bone disabled:opacity-30"
          aria-label="Decrease quantity"
        >
          <Minus className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <span className="w-10 text-center text-sm text-bone" aria-live="polite">
          {qty}
        </span>
        <button
          type="button"
          onClick={() => setQty((q) => Math.min(max, q + 1))}
          disabled={qty >= max}
          className="px-3 py-2 text-parch transition-colors hover:text-bone disabled:opacity-30"
          aria-label="Increase quantity"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
      <Button
        onClick={() =>
          add({ productId, slug, name, priceCents, maxAvailable, imageUrl, imageAlt }, qty)
        }
        className="min-w-56 flex-1 sm:flex-none"
      >
        Add to cart
      </Button>
    </div>
  );
};
