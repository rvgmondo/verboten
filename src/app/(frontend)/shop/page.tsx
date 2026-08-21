import type { Metadata } from "next";

import { SectionHeading } from "@/components/brand/section-heading";
import { ProductCard } from "@/components/shop/product-card";
import { getProducts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Verboten Premium Brandy Batch No. 01, the two bottle set, and Brandy & Cola ready to drink. Shipped across South Africa. Not for sale under 18.",
  alternates: { canonical: "/shop" },
};

/**
 * A deliberately small shop. With a handful of products the grid leads with
 * the flagship at full width so the page reads as a range, not a sparse grid.
 */
export default async function ShopPage() {
  const products = await getProducts();
  const flagship = products.find(
    (p) => p.slug === "verboten-premium-brandy-batch-no-01-3-year",
  );
  const rest = products.filter((p) => p.id !== flagship?.id);

  return (
    <main className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
      <SectionHeading
        eyebrow="The shop"
        title="Few products. No filler."
        lead="Everything the house currently makes, shipped anywhere in South Africa. Gin is in development and will announce itself."
        as="h1"
      />

      <div className="mt-14 space-y-8">
        {flagship && <ProductCard product={flagship} featured />}
        <div className="grid gap-8 sm:grid-cols-2">
          {rest.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      <p className="mt-14 border-t border-line pt-6 text-xs leading-relaxed text-parch/80">
        Drink responsibly. Not for sale to persons under 18. Age is verified at
        checkout and on delivery.
      </p>
    </main>
  );
}
