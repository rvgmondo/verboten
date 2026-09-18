import type { Metadata } from "next";
import { RESPONSIBILITY_LINE } from "@/lib/compliance";
import { pageMeta } from "@/lib/metadata";
import Link from "next/link";

import { Motto } from "@/components/brand/motto";
import { ProductStage } from "@/components/shop/product-stage";
import { Button } from "@/components/ui/button";
import { getProducts, getSiteSettings } from "@/lib/data";
import { formatZAR } from "@/lib/money";

// Names all five products. The old description named three while the page
// sold five, so the snippet undersold the shop.
export const metadata: Metadata = pageMeta({
  title: "Buy South African Brandy Online",
  description:
    "Buy South African brandy online from Pretoria: Premium Brandy, the two bottle set, Brandy & Cola, NYX and blood orange gin. Delivered nationwide.",
  path: "/shop",
  shareTitle: "Buy Verboten Brandy Online",
});

/** What each product is, in the house's own words. Falls back sensibly. */
const LABELS: Record<string, string> = {
  "verboten-premium-brandy": "The flagship",
  "verboten-premium-set-2-bottle": "The set",
  "verboten-nyx": "The liquorice",
  "verboten-blood-orange-gin": "The gin",
  "verboten-brandy-cola": "Ready to drink",
};

const labelFor = (slug: string, type: string) =>
  LABELS[slug] ?? (type === "bundle" ? "The set" : type === "can" ? "Ready to drink" : "The house");

/**
 * The shop as a dark gallery rather than a card grid.
 *
 * With three products a grid reads sparse and templated, and the studio
 * photography is shot on black, so cards on the cream canvas render as black
 * rectangles. Full-width stages on a dark ground let each product own a
 * chapter and let the photographs dissolve into the page.
 */
export default async function ShopPage() {
  const [products, settings] = await Promise.all([getProducts(), getSiteSettings()]);

  const order = [
    "verboten-premium-brandy",
    "verboten-premium-set-2-bottle",
    "verboten-nyx",
    "verboten-blood-orange-gin",
    "verboten-brandy-cola",
  ];
  const sorted = [...products].sort((a, b) => {
    const ai = order.indexOf(a.slug);
    const bi = order.indexOf(b.slug);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  // The set's real saving against two singles, stated instead of implied.
  const single = products.find((p) => p.slug === "verboten-premium-brandy");
  const set = products.find((p) => p.slug === "verboten-premium-set-2-bottle");
  const saving = single && set ? single.priceCents * 2 - set.priceCents : 0;
  const savingNote =
    saving > 0 ? `${formatZAR(saving)} under buying two singles.` : undefined;

  const flatRate = settings.shipping?.flatRateCents ?? 0;
  const freeFrom = settings.shipping?.freeThresholdCents ?? 0;

  return (
    <main className="inverse bg-ink">
      {/* Masthead */}
      <section className="relative overflow-hidden border-b border-line">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <span className="text-ghost absolute -bottom-[8%] left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-display text-[22vw] font-bold leading-none tracking-[0.05em]">
            VERBOTEN
          </span>
          <div className="grain absolute inset-0 opacity-[0.05]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 pb-14 pt-16 lg:pb-20 lg:pt-24">
          <p className="eyebrow animate-fade-up flex items-center gap-4">
            <span aria-hidden="true" className="h-px w-10 bg-gold-dim/70" />
            The shop
          </p>
          <h1
            className="animate-fade-up mt-6 max-w-3xl font-display font-semibold leading-[0.98] tracking-tight text-bone text-[clamp(2.6rem,6.5vw,4.5rem)]"
            style={{ animationDelay: "80ms" }}
          >
            Few products. <span className="text-gold">No filler.</span>
          </h1>
          <p
            className="animate-fade-up mt-6 max-w-md text-base leading-relaxed text-parch"
            style={{ animationDelay: "160ms" }}
          >
            Everything the house makes right now, delivered to your door
            anywhere in South Africa. Canned NYX and cola, and a canned gin
            and tonic, are on the way. A beer is in development and will
            announce itself.
          </p>
          <dl
            className="animate-fade-up mt-10 flex flex-wrap gap-x-12 gap-y-5"
            style={{ animationDelay: "240ms" }}
          >
            <div>
              <dt className="text-[0.625rem] uppercase tracking-[0.2em] text-parch">Delivery</dt>
              <dd className="mt-1 font-display text-lg text-bone">
                {flatRate > 0 ? `${formatZAR(flatRate)} flat` : "Calculated at checkout"}
              </dd>
            </div>
            {freeFrom > 0 && (
              <div>
                <dt className="text-[0.625rem] uppercase tracking-[0.2em] text-parch">Free from</dt>
                <dd className="mt-1 font-display text-lg text-bone">{formatZAR(freeFrom)}</dd>
              </div>
            )}
            <div>
              <dt className="text-[0.625rem] uppercase tracking-[0.2em] text-parch">Dispatch</dt>
              <dd className="mt-1 font-display text-lg text-bone">{settings.dispatchTimeText}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* One stage per product, alternating sides */}
      {sorted.map((product, i) => (
        <ProductStage
          key={product.id}
          product={product}
          label={labelFor(product.slug, product.productType)}
          note={product.slug === "verboten-premium-set-2-bottle" ? savingNote : undefined}
          reverse={i % 2 === 1}
          priority={i === 0}
        />
      ))}

      {/* Close */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl space-y-6 px-6 py-16 text-center">
          <Motto className="mx-auto" />
          <p className="mx-auto max-w-md text-sm leading-relaxed text-parch">
            Not sure where to start? The brandy neat, one cube. The can,
            cold. Both come from the same house, and both are worth pouring
            properly.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/serves">How to pour it</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/find-us">Where to find us</Link>
            </Button>
          </div>
          <p className="mx-auto max-w-lg pt-6 text-xs leading-relaxed text-parch">
            {RESPONSIBILITY_LINE} Age is verified at checkout and on delivery.
          </p>
        </div>
      </section>
    </main>
  );
}
