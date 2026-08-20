import { Badge } from "@/components/ui/badge";
import type { Availability } from "@/lib/inventory";

/**
 * Sold-out and low-stock states, rendered elegantly instead of hiding the
 * product. Batch products show the release they draw from.
 */
export const StockBadge = ({ availability }: { availability: Availability }) => {
  if (availability.soldOut) {
    return <Badge variant="soldOut">Sold out</Badge>;
  }
  if (availability.lowStock && availability.available !== null) {
    return <Badge variant="low">{availability.available} left</Badge>;
  }
  if (availability.batch) {
    return <Badge variant="gold">{availability.batch.name}</Badge>;
  }
  return null;
};
