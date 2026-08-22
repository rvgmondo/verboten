import { Badge } from "@/components/ui/badge";
import type { Availability } from "@/lib/inventory";

/**
 * Sold-out state only. Stock counts and batch mechanics are never shown to
 * the shopper (no numbered-bottle or "X left" scarcity language); an in-stock
 * product simply shows nothing.
 */
export const StockBadge = ({ availability }: { availability: Availability }) => {
  if (availability.soldOut) {
    return <Badge variant="soldOut">Sold out</Badge>;
  }
  return null;
};
