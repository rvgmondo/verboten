import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Price } from "@/components/brand/price";
import { StockBadge } from "@/components/brand/stock-badge";
import { PlaceholderFrame } from "@/components/media/placeholder-frame";
import { RichText } from "@/components/rich-text";
import { AddToCart } from "@/components/shop/add-to-cart";
import { ProductGallery } from "@/components/shop/gallery";
import { ProductCard } from "@/components/shop/product-card";
import { productImage } from "@/components/shop/product-helpers";
import { Badge } from "@/components/ui/badge";
import { getProductBySlug, getProducts, getSiteSettings } from "@/lib/data";
import { getAvailability } from "@/lib/inventory";
import { mediaSrc } from "@/lib/media";
import type { Batch, Media, Product } from "@/payload-types";

type Params = { params: Promise<{ slug: string }> };

export const generateStaticParams = async () => {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
};

export const generateMetadata = async ({ params }: Params): Promise<Metadata> => {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.shortDescription ?? undefined,
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
  if (!product) notFound();

  const availability = getAvailability(product);
  const image = productImage(product);
  const gallery = (product.gallery ?? [])
    .map((g) => (typeof g.image === "object" ? (g.image as Media) : null))
    .filter(Boolean) as Media[];
  const batch =
    product.batch && typeof product.batch === "object" ? (product.batch as Batch) : null;
  const related = (product.relatedProducts ?? [])
    .map((r) => (typeof r === "object" ? (r as Product) : null))
    .filter((p): p is Product => Boolean(p))
    .slice(0, 2);
  const specs = specRows(product);
  const notes = product.tastingNotes;
  const hasNotes = notes?.nose || notes?.palate || notes?.finish;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 lg:py-20">
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
        {/* Gallery */}
        <div>
          {gallery.length > 0 ? (
            <ProductGallery
              images={gallery
                .map((m) => ({ url: mediaSrc(m.url), alt: m.alt }))
                .filter((m): m is { url: string; alt: string } => Boolean(m.url))}
            />
          ) : (
            <PlaceholderFrame
              label={`${product.name}: primary product photography`}
              aspect="aspect-[4/5]"
            />
          )}
        </div>

        {/* Details */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <StockBadge availability={availability} />
              {product.productType === "bundle" && <Badge variant="quiet">2 bottle set</Badge>}
            </div>
            <h1 className="font-display text-4xl leading-[1.05] tracking-tight text-bone sm:text-5xl">
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
            imageUrl={mediaSrc(image?.url) ?? undefined}
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

      {/* Batch story */}
      {batch && (
        <section
          aria-labelledby="batch-story"
          className="mt-20 border border-gold-dim/40 bg-coal p-8 sm:p-12"
        >
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-start">
            <div className="max-w-2xl space-y-5">
              <p className="eyebrow">The release</p>
              <h2 id="batch-story" className="font-display text-3xl tracking-tight text-bone">
                {batch.name}
              </h2>
              {batch.story && <RichText data={batch.story} />}
            </div>
            <dl className="flex gap-10 lg:flex-col lg:gap-6 lg:text-right">
              <div>
                <dt className="text-[0.625rem] uppercase tracking-[0.2em] text-parch">Release</dt>
                <dd className="mt-1 font-display text-3xl text-gold">{batch.totalBottles}</dd>
                <dd className="text-xs text-parch">bottles</dd>
              </div>
              {batch.status !== "sold_out" && (
                <div>
                  <dt className="text-[0.625rem] uppercase tracking-[0.2em] text-parch">
                    Remaining
                  </dt>
                  <dd className="mt-1 font-display text-3xl text-bone">
                    {batch.bottlesRemaining}
                  </dd>
                  <dd className="text-xs text-parch">and counting down</dd>
                </div>
              )}
            </dl>
          </div>
        </section>
      )}

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
