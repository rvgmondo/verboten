"use client";

import * as React from "react";

/**
 * Client cart: localStorage-backed, drawer-rendered. Quantities are clamped
 * against the availability snapshot taken when the item was added; the
 * checkout server action re-validates stock and recomputes every price, so
 * nothing here is trusted for money.
 */

export type CartItem = {
  productId: number;
  slug: string;
  name: string;
  priceCents: number;
  quantity: number;
  /** Availability snapshot at add time; null = untracked. */
  maxAvailable: number | null;
  imageUrl?: string;
  imageAlt?: string;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
};

type CartContextValue = CartState & {
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  remove: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  subtotalCents: number;
  count: number;
};

const CartContext = React.createContext<CartContextValue | null>(null);

const STORAGE_KEY = "verboten-cart-v1";

const clampQty = (item: CartItem, qty: number) => {
  const max = item.maxAvailable === null ? 99 : Math.max(0, item.maxAvailable);
  return Math.max(1, Math.min(qty, Math.max(1, max)));
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      // Corrupt storage: start clean.
    }
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage full or blocked: cart still works for the session.
    }
  }, [items, hydrated]);

  const add = React.useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === item.productId);
        if (existing) {
          return prev.map((i) =>
            i.productId === item.productId
              ? { ...i, ...item, quantity: clampQty(i, i.quantity + quantity) }
              : i,
          );
        }
        const next: CartItem = { ...item, quantity: 1 };
        return [...prev, { ...next, quantity: clampQty(next, quantity) }];
      });
      setIsOpen(true);
    },
    [],
  );

  const remove = React.useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const setQuantity = React.useCallback((productId: number, quantity: number) => {
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity: clampQty(i, quantity) } : i)),
    );
  }, []);

  const clear = React.useCallback(() => setItems([]), []);
  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);

  const subtotalCents = items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, isOpen, add, remove, setQuantity, clear, open, close, subtotalCents, count }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextValue => {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
