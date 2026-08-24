import Link from "next/link";

import { Price } from "@/components/brand/price";
import { StockBadge } from "@/components/brand/stock-badge";
import { CmsImage } from "@/components/media/cms-image";
import { PlaceholderFrame } from "@/components/media/placeholder-frame";
import { productImage } from "@/components/shop/product-helpers";
import { getAvailability } from "@/lib/inventory";
import type { Product } from "@/payload-types";
import { cn } from "@/lib/utils";

export const ProductCard = ({
  product,
  featured = false,
}: {
  product: Product;
  featured?: boolean;
}) => {
  const availability = getAvailability(product);
  const image = productImage(product);

  return (
    <Link
      href={`/shop/${product.slug}`}
      className={cn(
        "group block border border-line bg-coal transition-colors duration-300 hover:border-gold-dim/70",
        availability.soldOut && "opacity-80",
      )}
    >
      <div className="relative">
        {image ? (
          <CmsImage
            media={image}
            aspect={featured ? "aspect-[4/3]" : "aspect-[3/4]"}
            sizes={featured ? "(min-width: 1024px) 640px, 100vw" : "(min-width: 640px) 320px, 100vw"}
            slotWidth={featured ? 640 : 320}
            className="transition-transform duration-500 group-hover:scale-[1.015]"
          />
        ) : (
          <PlaceholderFrame
            label={`${product.name}, product photography`}
            aspect={featured ? "aspect-[4/3]" : "aspect-[3/4]"}
          />
        )}
        <div className="absolute left-4 top-4">
          <StockBadge availability={availability} />
        </div>
      </div>
      <div className="space-y-2 p-5">
        <h3 className="font-display text-lg leading-snug text-bone group-hover:text-gold-bright">
          {product.name}
        </h3>
        {product.shortDescription && (
          <p className="line-clamp-2 text-xs leading-relaxed text-parch">
            {product.shortDescription}
          </p>
        )}
        <Price cents={product.priceCents} className="text-base" />
      </div>
    </Link>
  );
};
