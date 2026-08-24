import Link from "next/link";

import { Price } from "@/components/brand/price";
import { StockBadge } from "@/components/brand/stock-badge";
import { ArtPlaceholder } from "@/components/media/art-placeholder";
import { CmsImage } from "@/components/media/cms-image";
import { productImage } from "@/components/shop/product-helpers";
import { Button } from "@/components/ui/button";
import { getAvailability } from "@/lib/inventory";
import { cn } from "@/lib/utils";
import type { Product } from "@/payload-types";

/**
 * One product as a full-width editorial stage, not a card in a grid.
 *
 * The product photography is shot on black, so a bordered card on the cream
 * canvas renders as a black rectangle pasted onto beige. Here the stage is
 * dark and the image is radially masked, so the photograph's own background
 * dissolves into the page and the bottle appears to float, lit. Stages
 * alternate sides down the page to build rhythm with only a few products.
 */

const facts = (product: Product): Array<[string, string]> => {
  const rows: Array<[string, string]> = [];
  const s = product.specs;
  if (s?.ageYears) rows.push(["Age", `${s.ageYears} years`]);
  if (s?.caskFinish) rows.push(["Finish", s.caskFinish]);
  if (s?.abv) rows.push(["Strength", `${s.abv}%`]);
  if (s?.volumeMl) rows.push(["Size", `${s.volumeMl}ml`]);
  if (product.productType === "bundle") rows.push(["Contents", "2 bottles"]);
  return rows.slice(0, 4);
};

export const ProductStage = ({
  product,
  label,
  note,
  reverse = false,
  priority = false,
}: {
  product: Product;
  /** What kind of thing this is: real information, not decoration. */
  label: string;
  /** Optional selling line under the price, e.g. the set's saving. */
  note?: string;
  reverse?: boolean;
  priority?: boolean;
}) => {
  const availability = getAvailability(product);
  const image = productImage(product);
  const rows = facts(product);

  return (
    <section
      aria-labelledby={`product-${product.id}`}
      // overflow-hidden: the glow is wider than the viewport by design and must
      // not create a horizontal scrollbar.
      className="relative overflow-hidden border-b border-line last:border-b-0"
    >
      {/* Light behind the bottle */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-1/2 h-[80vmin] w-[80vmin] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(205,184,141,0.13),rgba(205,184,141,0.04)_48%,transparent_72%)]",
          reverse ? "right-[-10%]" : "left-[-10%]",
        )}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <div className={cn(reverse && "lg:order-2")}>
          {image ? (
            <CmsImage
              media={image}
              aspect="aspect-square"
              sizes="(min-width: 1024px) 560px, 100vw"
              slotWidth={560}
              priority={priority}
              className="bg-transparent [mask-image:radial-gradient(ellipse_74%_70%_at_center,black_54%,transparent_97%)]"
            />
          ) : (
            <ArtPlaceholder
              shot={`${product.name}, studio photography`}
              aspect="aspect-square"
            />
          )}
        </div>

        <div className={cn("space-y-6", reverse && "lg:order-1")}>
          <p className="eyebrow flex items-center gap-4">
            <span aria-hidden="true" className="h-px w-10 bg-gold-dim/70" />
            {label}
          </p>

          <h2
            id={`product-${product.id}`}
            className="font-display font-semibold leading-[1.02] tracking-tight text-bone text-[clamp(2.1rem,4.6vw,3.4rem)]"
          >
            {product.name}
          </h2>

          {product.shortDescription && (
            <p className="max-w-md text-base leading-relaxed text-parch">
              {product.shortDescription}
            </p>
          )}

          {rows.length > 0 && (
            <dl className="grid grid-cols-2 gap-x-8 gap-y-4 border-y hairline py-5 sm:grid-cols-4">
              {rows.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[0.625rem] uppercase tracking-[0.2em] text-parch">{k}</dt>
                  <dd className="mt-1 font-display text-lg text-bone">{v}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="flex flex-wrap items-center gap-5">
            <Price cents={product.priceCents} className="text-3xl" />
            <StockBadge availability={availability} />
          </div>

          {note && <p className="text-sm text-gold">{note}</p>}

          <div className="pt-1">
            <Button size="lg" asChild>
              <Link href={`/shop/${product.slug}`}>
                {availability.soldOut ? "See the details" : `View ${product.name}`}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
