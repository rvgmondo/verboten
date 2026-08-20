import type { Media, Product } from "@/payload-types";

/** First gallery image, if the relation is populated. */
export const productImage = (product: Product): Media | null => {
  const first = product.gallery?.[0]?.image;
  return first && typeof first === "object" ? (first as Media) : null;
};
