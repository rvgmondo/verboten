import { NOT_FOUND_METADATA, NotFoundPanel } from "@/components/brand/not-found-panel";
import type { Metadata } from "next";
import Link from "next/link";

import { Price } from "@/components/brand/price";
import { StockBadge } from "@/components/brand/stock-badge";
import { JsonLd } from "@/components/json-ld";
import { ArtPlaceholder } from "@/components/media/art-placeholder";
import { RichText } from "@/components/rich-text";
import { AddToCart } from "@/components/shop/add-to-cart";
import { ProductGallery } from "@/components/shop/gallery";
import { ProductCard } from "@/components/shop/product-card";
import { productImage } from "@/components/shop/product-helpers";
import { Badge } from "@/components/ui/badge";
import { getProductBySlug, getProducts, getSiteSettings } from "@/lib/data";
import { getAvailability } from "@/lib/inventory";
import { mediaSrcAt } from "@/lib/media";
import { breadcrumbLd, productLd } from "@/lib/seo";
import type { Media, Product } from "@/payload-types";

type Params = { params: Promise<{ slug: string }> };

export const generateStaticParams = async () => {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
};

export const generateMetadata = async ({ params }: Params): Promise<Metadata> => {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return NOT_FOUND_METADATA;
  // Fold the age into titles without doubling the word "brandy".
  const title = product.specs?.ageYears
    ? `${product.name}, Aged ${product.specs.ageYears} Years`
    : product.name;
  return {
    title,
    description: product.shortDescription ?? undefined,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: {
      title,
      description: product.shortDescription ?? undefined,
    },
  };
};

const specRows = (product: Product): Array<[string, string]> => {
  const rows: Array<[string, string]> = [];
  const s = product.specs;
  if (s?.ageYears) rows.push(["Age", `${s.ageYears} years`]);
  if (s?.caskFinish) rows.push(["Finish", s.caskFinish]);
  if (s?.abv) rows.push(["ABV", `${s.abv}%`]);
  if (s?.volumeMl) rows.push(["Size", `${s.volumeMl}ml`]);
  if (s?.origin) rows.push(["Origin", s.origin]);
  return rows;
};

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const [product, settings, allProducts] = await Promise.all([
    getProductBySlug(slug),
    getSiteSettings(),
    getProducts(),
  ]);
  if (!product) {
    return (
      <NotFoundPanel
        title="That bottle is not here."
        lead="It may have been renamed, or it may never have existed. Everything the house currently makes is one tap away."
      />
    );
  }

  const availability = getAvailability(product);
  const image = productImage(product);
  const gallery = (product.gallery ?? [])
    .map((g) => (typeof g.image === "object" ? (g.image as Media) : null))
    .filter(Boolean) as Media[];
  const related = (product.relatedProducts ?? [])
    .map((r) => (typeof r === "object" ? (r as Product) : null))
    .filter((p): p is Product => Boolean(p))
    // Three fits the row without crowding the page. Two was leaving authored
    // cross-sells unseen, and on the flagship one of the two was the set,
    // which is the biggest lever on order value the shop has.
    .slice(0, 3);
  const specs = specRows(product);
  const notes = product.tastingNotes;
  const hasNotes = notes?.nose || notes?.palate || notes?.finish;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 lg:py-20">
      <JsonLd data={productLd(product)} />
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Shop", path: "/shop" },
          { name: product.name, path: `/shop/${product.slug}` },
        ])}
      />
      <nav aria-label="Breadcrumb" className="mb-10 text-xs text-parch">
        <ol className="flex gap-2">
          <li>
            <Link href="/" className="hover:text-bone">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/shop" className="hover:text-bone">
              Shop
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-bone">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr]">
        {/* Gallery. The photography is shot on black, so it sits on a dark
            panel with the bottle lit from behind, never on the cream canvas. */}
        <div className="inverse relative overflow-hidden bg-ink p-4 sm:p-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[85%] w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(205,184,141,0.14),rgba(205,184,141,0.04)_50%,transparent_74%)]"
          />
          <div className="relative">
            {/* The gallery takes the media documents, not one chosen width.
                Resolving a single URL here is what shipped a 1.49 MB original
                into a 280px slot on phones. */}
            {gallery.length > 0 ? (
              <ProductGallery images={gallery} />
            ) : (
              <ArtPlaceholder
                shot={`${product.name}, primary product photography`}
                aspect="aspect-[4/5]"
              />
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <StockBadge availability={availability} />
              {product.productType === "bundle" && <Badge variant="quiet">2 bottle set</Badge>}
            </div>
            <h1 className="font-display font-semibold leading-[1.0] tracking-tight text-bone text-[clamp(2.2rem,4.6vw,3.4rem)]">
              {product.name}
            </h1>
            {product.shortDescription && (
              <p className="text-base leading-relaxed text-parch">{product.shortDescription}</p>
            )}
            <Price cents={product.priceCents} className="block text-3xl" />
          </div>

          <AddToCart
            productId={product.id}
            slug={product.slug}
            name={product.name}
            priceCents={product.priceCents}
            maxAvailable={availability.available}
            soldOut={availability.soldOut}
            imageUrl={(image ? mediaSrcAt(image, 200) : null) ?? undefined}
            imageAlt={image?.alt}
          />

          <p className="text-xs text-parch">
            {settings.dispatchTimeText}. Age is verified at checkout and on delivery.
          </p>

          {specs.length > 0 && (
            <dl className="grid grid-cols-2 gap-x-8 gap-y-4 border-y border-line py-6 sm:grid-cols-3">
              {specs.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[0.625rem] uppercase tracking-[0.2em] text-parch">{label}</dt>
                  <dd className="mt-1 text-sm text-bone">{value}</dd>
                </div>
              ))}
            </dl>
          )}

          {hasNotes && (
            <section aria-labelledby="tasting-notes">
              <h2 id="tasting-notes" className="eyebrow mb-4">
                Tasting notes
              </h2>
              <dl className="space-y-3 text-sm">
                {notes?.nose && (
                  <div className="flex gap-4">
                    <dt className="w-16 shrink-0 text-parch">Nose</dt>
                    <dd className="text-bone">{notes.nose}</dd>
                  </div>
                )}
                {notes?.palate && (
                  <div className="flex gap-4">
                    <dt className="w-16 shrink-0 text-parch">Palate</dt>
                    <dd className="text-bone">{notes.palate}</dd>
                  </div>
                )}
                {notes?.finish && (
                  <div className="flex gap-4">
                    <dt className="w-16 shrink-0 text-parch">Finish</dt>
                    <dd className="text-bone">{notes.finish}</dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          {product.description && (
            <RichText data={product.description} />
          )}

          {product.servingSuggestion && (
            <section aria-labelledby="serving">
              <h2 id="serving" className="eyebrow mb-3">
                How to pour it
              </h2>
              <p className="text-sm leading-relaxed text-parch">{product.servingSuggestion}</p>
            </section>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section aria-labelledby="related" className="mt-20">
          <h2 id="related" className="eyebrow mb-8">
            Also from the house
          </h2>
          <div className="grid gap-8 sm:grid-cols-2">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
