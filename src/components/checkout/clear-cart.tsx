"use client";

import * as React from "react";

import { useCart } from "@/lib/cart";

/** Empties the cart once payment has been handed to the gateway. */
export const ClearCartOnMount = () => {
  const { clear } = useCart();
  React.useEffect(() => {
    clear();
  }, [clear]);
  return null;
};
