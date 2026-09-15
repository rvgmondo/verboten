"use client";

import * as React from "react";

import { type ShopItem, trackShop } from "@/lib/analytics";

/**
 * Reports a product view once the page is on screen. Rendered by the product
 * page, which is otherwise a server component and static.
 */
export const TrackViewItem = ({ item }: { item: Omit<ShopItem, "quantity"> }) => {
  React.useEffect(() => {
    // Measurement may still be starting on a first page view, so give the
    // consent check a moment to install the tags before speaking to them.
    const t = setTimeout(() => trackShop("view_item", [{ ...item, quantity: 1 }]), 400);
    return () => clearTimeout(t);
  }, [item.slug]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
};
