import { Badge } from "@/components/ui/badge";
import type { Availability } from "@/lib/inventory";

/**
 * Sold-out state and the limited-edition marker. Stock counts are never shown
 * to the shopper (no numbered-bottle or "X left" scarcity language); products
 * tied to a limited edition simply carry the Limited edition badge.
 */
export const StockBadge = ({ availability }: { availability: Availability }) => {
  if (availability.soldOut) {
    return <Badge variant="soldOut">Sold out</Badge>;
  }
  if (availability.batch) {
    return <Badge variant="gold">Limited edition</Badge>;
  }
  return null;
};
