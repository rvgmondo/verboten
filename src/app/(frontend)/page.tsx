import type { Metadata } from "next";
import Link from "next/link";

import { Motto } from "@/components/brand/motto";
import { Price } from "@/components/brand/price";
import { SectionHeading } from "@/components/brand/section-heading";
import { StockBadge } from "@/components/brand/stock-badge";
import { NewsletterForm } from "@/components/chrome/newsletter-form";
import { CmsImage } from "@/components/media/cms-image";
import { PlaceholderFrame } from "@/components/media/placeholder-frame";
import { Reveal } from "@/components/motion/reveal";
import { productImage } from "@/components/shop/product-helpers";
import { Button } from "@/components/ui/button";
import { CrestDivider } from "@/components/ui/separator";
import { getJournalPosts, getProducts, getStockists, getUpcomingEvents } from "@/lib/data";
import { getAvailability } from "@/lib/inventory";

export const metadata: Metadata = {
  title: "Verboten Spirits | Premium South African Brandy",
  description:
    "Independent beverage house in Pretoria. Batch No. 01: a three year brandy finished in French oak, limited to 500 numbered bottles. Brandy & cola, ready to drink.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [products, posts, stockists, events] = await Promise.all([
    getProducts(),
    getJournalPosts(3),
    getStockists(),
    getUpcomingEvents(),
  ]);

  const flagship = products.find((p) => p.slug === "verboten-premium-brandy-batch-no-01-3-year");
  const rtd = products.find((p) => p.slug === "verboten-brandy-cola");
  const flagshipImage = flagship ? productImage(flagship) : null;
  const rtdImage = rtd ? productImage(rtd) : null;

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
          <div className="max-w-xl space-y-7">
            <p className="eyebrow animate-fade-up">Pretoria, South Africa</p>
            <h1
              className="animate-fade-up font-display text-5xl leading-[1.02] tracking-tight text-bone sm:text-6xl lg:text-7xl"
              style={{ animationDelay: "80ms" }}
            >
              The name is the only warning.
            </h1>
            <p
              className="animate-fade-up text-base leading-relaxed text-parch"
              style={{ animationDelay: "160ms" }}
            >
              Verboten is an independent South African beverage house. Premium
              brandy in numbered batches, made in Pretoria and built to stand on
              any good back bar in the world.
            </p>
            <div
              className="animate-fade-up flex flex-wrap gap-4"
              style={{ animationDelay: "240ms" }}
            >
              <Button size="lg" asChild>
                <Link href="/shop/verboten-premium-brandy-batch-no-01-3-year">
                  Order Batch No. 01
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/story">Read our story</Link>
              </Button>
            </div>
            <Motto className="animate-fade-up pt-4" />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
            {flagshipImage ? (
              <CmsImage
                media={flagshipImage}
                aspect="aspect-[3/4]"
                sizes="(min-width: 1024px) 480px, 100vw"
                priority
              />
            ) : (
              <PlaceholderFrame
                label="Hero: Batch No. 01 bottle on black, crest visible"
                aspect="aspect-[3/4]"
              />
            )}
          </div>
        </div>
      </section>

      {/* Flagship */}
      {flagship && (
        <section className="border-b border-line">
          <Reveal className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center">
            <div className="order-2 lg:order-1">
              {flagshipImage ? (
                <CmsImage
                  media={flagshipImage}
                  aspect="aspect-square"
                  sizes="(min-width: 1024px) 560px, 100vw"
                />
              ) : (
                <PlaceholderFrame
                  label="Batch No. 01: bottle and glass, side light"
                  aspect="aspect-square"
                />
              )}
            </div>
            <div className="order-1 space-y-6 lg:order-2">
              <SectionHeading
                eyebrow="The flagship"
                title="Batch No. 01"
                lead="Three years in oak, finished in French casks, bottled at 43%. Five hundred numbered bottles. When they are gone, the batch is closed."
              />
              <dl className="grid grid-cols-2 gap-x-8 gap-y-3 border-y border-line py-5 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-[0.625rem] uppercase tracking-[0.2em] text-parch">Age</dt>
                  <dd className="mt-1 text-bone">3 years</dd>
                </div>
                <div>
                  <dt className="text-[0.625rem] uppercase tracking-[0.2em] text-parch">Finish</dt>
                  <dd className="mt-1 text-bone">French oak</dd>
                </div>
                <div>
                  <dt className="text-[0.625rem] uppercase tracking-[0.2em] text-parch">ABV</dt>
                  <dd className="mt-1 text-bone">43%</dd>
                </div>
                <div>
                  <dt className="text-[0.625rem] uppercase tracking-[0.2em] text-parch">Bottles</dt>
                  <dd className="mt-1 text-bone">500</dd>
                </div>
              </dl>
              <div className="flex flex-wrap items-center gap-5">
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

      {/* Brandy & Cola */}
      {rtd && (
        <section className="border-b border-line bg-coal">
          <Reveal className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <SectionHeading
                eyebrow="Ready to drink"
                title="Brandy & Cola"
                lead="The flagship, cut with cola and canned. Cold, direct, and made properly. Find it at the markets we pour at, or stock the fridge."
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
                <PlaceholderFrame
                  label="Brandy & Cola cans on ice, condensation"
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
              title="Built in Pretoria. Aimed at the world."
              lead="Verboten started in 2020 with one conviction: South Africa can put a brandy on any shelf in Amsterdam or Berlin and not apologise for it. Batch No. 01 is the first proof."
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
      <section>
        <div className="mx-auto max-w-6xl px-6 py-20">
          <CrestDivider className="mb-14" />
          <Reveal className="mx-auto max-w-md text-center">
            <SectionHeading
              align="center"
              eyebrow="First pour"
              title="Hear about the next batch before it exists"
              lead="Batch No. 01 is five hundred bottles and will not be repeated. Release news goes to this list first."
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
