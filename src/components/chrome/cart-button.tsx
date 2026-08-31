"use client";

import { ShoppingBag } from "lucide-react";

import { useCart } from "@/lib/cart";

export const CartButton = () => {
  const { count, open } = useCart();
  return (
    <button
      type="button"
      onClick={open}
      className="relative flex h-11 w-11 items-center justify-center text-parch transition-colors hover:text-bone"
      aria-label={`Open cart, ${count} ${count === 1 ? "item" : "items"}`}
    >
      <ShoppingBag className="h-5 w-5" aria-hidden="true" />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-goldfill px-1 text-[0.625rem] font-semibold text-onaccent"
        >
          {count}
        </span>
      )}
    </button>
  );
};
