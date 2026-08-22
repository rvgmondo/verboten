import type { Metadata } from "next";
import Link from "next/link";

import { Marquee } from "@/components/brand/marquee";
import { Price } from "@/components/brand/price";
import { SectionHeading } from "@/components/brand/section-heading";
import { StockBadge } from "@/components/brand/stock-badge";
import { NewsletterForm } from "@/components/chrome/newsletter-form";
import { HeroCinema } from "@/components/home/hero-cinema";
import { ArtPlaceholder } from "@/components/media/art-placeholder";
import { CmsImage } from "@/components/media/cms-image";
import { Reveal } from "@/components/motion/reveal";
import { productImage } from "@/components/shop/product-helpers";
import { Button } from "@/components/ui/button";
import { CrestDivider } from "@/components/ui/separator";
import {
  getJournalPosts,
  getProducts,
  getServes,
  getSiteSettings,
  getStockists,
  getUpcomingEvents,
} from "@/lib/data";
import { getAvailability } from "@/lib/inventory";
import { mediaSrc } from "@/lib/media";
import { formatZAR } from "@/lib/money";

export const metadata: Metadata = {
  title: "Verboten Spirits | Premium South African Brandy",
  description:
    "An independent South African brandy house in Pretoria. A three year premium brandy finished in French oak, 43% ABV. Born in South Africa, made for the world.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [products, posts, stockists, events, settings, serves] = await Promise.all([
    getProducts(),
    getJournalPosts(3),
    getStockists(),
    getUpcomingEvents(),
    getSiteSettings(),
    getServes(),
  ]);

  const flagship = products.find((p) => p.slug === "verboten-premium-brandy");
  const rtd = products.find((p) => p.slug === "verboten-brandy-cola");
  const flagshipImage = flagship ? productImage(flagship) : null;
  const rtdImage = rtd ? productImage(rtd) : null;
  const heroSrc = flagshipImage ? mediaSrc(flagshipImage.url) : null;
  const soldOut = flagship ? getAvailability(flagship).soldOut : false;
  const flatRateCents = settings.shipping?.flatRateCents ?? 15000;
  const commerceLine = flagship
    ? soldOut
      ? "Sold out for now. The release list hears the moment it is back."
      : `${formatZAR(flagship.priceCents)} a bottle. Delivery ${formatZAR(flatRateCents)} flat, anywhere in South Africa.`
    : "Premium South African brandy, shipped nationwide.";
  const heroServes = serves.slice(0, 3);
  const SERVE_SHOTS = [
    "Heavy tumbler, one clear cube, side light",
    "Tall glass, cola pour mid-stream, plenty of ice",
    "Old fashioned, orange peel, marble counter",
  ];

  return (
    <main>
      {/* Hero: three chapters of the same dark stage. */}
      <HeroCinema
        bottleSrc={heroSrc}
        bottleAlt={flagshipImage?.alt ?? "Verboten Premium Brandy bottle"}
        soldOut={soldOut}
        commerceLine={commerceLine}
      />

      {/* The brand lines on a slow loop: the house signature. */}
      <Marquee />

      {/* Flagship */}
      {flagship && (
        <section className="relative overflow-hidden border-b border-line">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-6 top-1/2 -translate-y-1/2 select-none font-display text-[30vmin] font-bold leading-none text-smoke"
          >
            VB
          </span>
          <Reveal className="relative mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center">
            <div className="order-2 lg:order-1">
              {flagshipImage ? (
                <CmsImage
                  media={flagshipImage}
                  aspect="aspect-square"
                  sizes="(min-width: 1024px) 560px, 100vw"
                />
              ) : (
                <ArtPlaceholder
                  shot="The bottle and a poured glass, side light"
                  aspect="aspect-square"
                />
              )}
            </div>
            <div className="order-1 space-y-6 lg:order-2">
              <SectionHeading
                eyebrow="The flagship"
                title="Verboten Premium Brandy"
                lead="Warm oak, dried apricot and vanilla on the nose. Caramel, toasted nuts and a quiet spice on the palate. The finish is long and does not need help."
              />
              <div className="flex flex-wrap items-center gap-5 border-t border-line pt-5">
                <Price cents={flagship.priceCents} className="text-2xl" />
                <StockBadge availability={getAvailability(flagship)} />
              </div>
              <Button asChild>
                <Link href={`/shop/${flagship.slug}`}>View the bottle</Link>
              </Button>
            </div>
          </Reveal>
        </section>
      )}

      {/* The ritual: how the house pours. Real serves from the CMS. */}
      {heroServes.length > 0 && (
        <section className="border-b border-line">
          <Reveal className="mx-auto max-w-6xl px-6 py-20">
            <SectionHeading
              eyebrow="The ritual"
              title="How this house pours"
              lead="Three ways in. Each one earns its glass."
            />
            <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {heroServes.map((serve, i) => (
                <article key={serve.id} className="group space-y-4">
                  <ArtPlaceholder
                    shot={SERVE_SHOTS[i] ?? "The pour, up close"}
                    aspect="aspect-[4/5]"
                  />
                  <h3 className="font-display text-xl text-bone">{serve.name}</h3>
                  {serve.description && (
                    <p className="text-sm leading-relaxed text-parch">{serve.description}</p>
                  )}
                </article>
              ))}
            </div>
            <div className="mt-10">
              <Button variant="outline" size="sm" asChild>
                <Link href="/serves">Every serve, properly specced</Link>
              </Button>
            </div>
          </Reveal>
        </section>
      )}

      {/* Brandy & Cola */}
      {rtd && (
        <section className="border-b border-line bg-coal">
          <Reveal className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <SectionHeading
                eyebrow="Ready to drink"
                title="Brandy & Cola"
                lead="The same brandy, cut with cola and canned. Cold, easy, and unmistakably South African. The national serve, ready when you are."
              />
              <div className="flex flex-wrap items-center gap-5">
                <Price cents={rtd.priceCents} className="text-2xl" />
                <StockBadge availability={getAvailability(rtd)} />
              </div>
              <Button variant="outline" asChild>
                <Link href={`/shop/${rtd.slug}`}>View the can</Link>
              </Button>
            </div>
            <div>
              {rtdImage ? (
                <CmsImage
                  media={rtdImage}
                  aspect="aspect-[4/3]"
                  sizes="(min-width: 1024px) 560px, 100vw"
                />
              ) : (
                <ArtPlaceholder
                  shot="Brandy and Cola cans on ice, condensation"
                  aspect="aspect-[4/3]"
                />
              )}
            </div>
          </Reveal>
        </section>
      )}

      {/* Story teaser */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <Reveal className="mx-auto max-w-2xl space-y-6 text-center">
            <SectionHeading
              align="center"
              eyebrow="The house"
              title="A house with its name on the door"
              lead="Started in a Silverton workshop in 2020, with a conviction: South Africa can put a brandy on any shelf in Amsterdam or Berlin and not apologise for it. The bottle is the proof."
            />
            <Button variant="outline" asChild>
              <Link href="/story">The whole story</Link>
            </Button>
          </Reveal>
        </div>
      </section>

      {/* Find us / Journal strip */}
      <section className="border-b border-line">
        <Reveal className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-2">
          <div className="space-y-5">
            <SectionHeading eyebrow="Out in the world" title="Where to find us" />
            <p className="text-sm leading-relaxed text-parch">
              {stockists.length > 0
                ? "Bars, bottle stores and venues that pour Verboten, plus the markets and events where we set up."
                : "The stockist list is short and getting longer. Until your local carries us, order direct and we ship to your door, or catch us at the next market."}
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/find-us">
                {events.length > 0 ? "Stockists and events" : "See where we pour"}
              </Link>
            </Button>
          </div>
          <div className="space-y-5">
            <SectionHeading eyebrow="The journal" title="What the house is up to" />
            {posts.length > 0 ? (
              <ul className="space-y-4">
                {posts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/journal/${post.slug}`}
                      className="group block border-b border-line pb-4"
                    >
                      <p className="text-sm text-bone transition-colors group-hover:text-gold-bright">
                        {post.title}
                      </p>
                      {post.excerpt && (
                        <p className="mt-1 line-clamp-2 text-xs text-parch">{post.excerpt}</p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm leading-relaxed text-parch">
                Release notes, event recaps and the occasional opinion. First
                entries are being written.
              </p>
            )}
            <Button variant="ghost" size="sm" asChild>
              <Link href="/journal">Read the journal</Link>
            </Button>
          </div>
        </Reveal>
      </section>

      {/* Newsletter */}
      <section id="newsletter" className="scroll-mt-24">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <CrestDivider className="mb-14" />
          <Reveal className="mx-auto max-w-md text-center">
            <SectionHeading
              align="center"
              eyebrow="First pour"
              title="Hear about the next release before it lands"
              lead="New releases and where to find us. Release news reaches this list first."
            />
            <div className="mt-8 text-left">
              <NewsletterForm source="home" />
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
