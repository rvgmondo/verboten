"use client";

import { Minus, Plus } from "lucide-react";
import * as React from "react";

import { NewsletterForm } from "@/components/chrome/newsletter-form";
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

  // Mobile sticky buy bar: appears once the inline button scrolls away, so
  // the money action is always one thumb-reach away on the money page.
  const inlineRef = React.useRef<HTMLDivElement>(null);
  const [showBar, setShowBar] = React.useState(false);
  React.useEffect(() => {
    const el = inlineRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setShowBar(!entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const priceLabel = new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 0,
  }).format(priceCents / 100);

  if (soldOut) {
    // Sold out is the warmest email moment a limited-edition brand has;
    // the signup renders right here instead of pointing somewhere else.
    return (
      <div className="space-y-4">
        <Button disabled className="w-full sm:w-auto sm:min-w-56">
          Sold out
        </Button>
        <p className="text-xs text-parch">
          This release is gone. The next edition earns its own name, and this
          list hears about it first.
        </p>
        <NewsletterForm source="sold-out-product" />
      </div>
    );
  }

  return (
    <div ref={inlineRef} className="flex flex-wrap items-center gap-4">
      {/* Mobile-only sticky buy bar */}
      {showBar && (
        <div className="inverse fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:hidden">
          <div className="flex items-center gap-4 px-4 py-3">
            <span className="font-display text-lg text-gold">{priceLabel}</span>
            <Button
              onClick={() =>
                add({ productId, slug, name, priceCents, maxAvailable, imageUrl, imageAlt }, qty)
              }
              className="flex-1"
            >
              Add to cart
            </Button>
          </div>
        </div>
      )}
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
