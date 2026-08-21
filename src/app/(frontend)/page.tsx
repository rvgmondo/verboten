import type { Metadata } from "next";
import Image from "next/image";
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
import { getJournalPosts, getProducts, getSiteSettings, getStockists, getUpcomingEvents } from "@/lib/data";
import { getAvailability } from "@/lib/inventory";
import { mediaSrc } from "@/lib/media";
import { formatZAR } from "@/lib/money";

export const metadata: Metadata = {
  title: "Verboten Spirits | Premium South African Brandy",
  description:
    "An independent South African brandy house in Pretoria. Batch No. 01: a limited edition three year brandy finished in French oak, 43% ABV. Born in South Africa, made for the world.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [products, posts, stockists, events, settings] = await Promise.all([
    getProducts(),
    getJournalPosts(3),
    getStockists(),
    getUpcomingEvents(),
    getSiteSettings(),
  ]);

  const flagship = products.find((p) => p.slug === "verboten-premium-brandy-batch-no-01-3-year");
  const rtd = products.find((p) => p.slug === "verboten-brandy-cola");
  const flagshipImage = flagship ? productImage(flagship) : null;
  const rtdImage = rtd ? productImage(rtd) : null;
  const heroSrc = flagshipImage ? mediaSrc(flagshipImage.url) : null;
  const soldOut = flagship ? getAvailability(flagship).soldOut : false;
  const flatRateCents = settings.shipping?.flatRateCents ?? 15000;

  return (
    <main>
      {/* Hero: the cellar door. A full-bleed dark stage; candle glow, a ghost
          wordmark and film grain behind the bottle, type carrying the front. */}
      <section className="inverse relative overflow-hidden border-b border-line bg-ink">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {/* Candlelight behind the bottle */}
          <div className="animate-glow absolute right-[-18%] top-1/2 h-[110vmin] w-[110vmin] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(205,184,141,0.16),rgba(205,184,141,0.05)_45%,transparent_72%)]" />
          {/* Ghost wordmark rising from the floor of the stage */}
          <span className="text-ghost absolute bottom-[6%] left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-display text-[23vw] font-bold leading-none tracking-[0.05em]">
            VERBOTEN
          </span>
          {/* Film grain over everything */}
          <div className="grain absolute inset-0 opacity-[0.05]" />
        </div>

        <div className="relative mx-auto grid min-h-[86svh] max-w-6xl items-center gap-12 px-6 pb-20 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:pb-24 lg:pt-20">
          <div className="relative z-20 max-w-xl space-y-7">
            <p className="eyebrow animate-fade-up flex items-center gap-4">
              <span aria-hidden="true" className="h-px w-10 bg-gold-dim/70" />
              Pure Spirit. Pure Mischief.
            </p>
            <h1 className="font-display font-semibold leading-[0.98] tracking-tight text-[clamp(3rem,7.5vw,5.25rem)]">
              <span
                className="block animate-fade-up text-bone"
                style={{ animationDelay: "80ms" }}
              >
                Born in Pretoria.
              </span>
              <span
                className="block animate-fade-up text-gold"
                style={{ animationDelay: "190ms" }}
              >
                Made for the world.
              </span>
            </h1>
            <p
              className="animate-fade-up text-base leading-relaxed text-parch"
              style={{ animationDelay: "300ms" }}
            >
              An independent South African brandy house with one rule: nothing
              leaves until it earns the label.
            </p>
            <div
              className="animate-fade-up flex flex-wrap gap-4"
              style={{ animationDelay: "380ms" }}
            >
              {soldOut ? (
                <Button size="lg" asChild>
                  <Link href="#newsletter">Join the release list</Link>
                </Button>
              ) : (
                <Button size="lg" asChild>
                  <Link href="/shop/verboten-premium-brandy-batch-no-01-3-year">
                    Order Batch No. 01
                  </Link>
                </Button>
              )}
              <Button size="lg" variant="outline" asChild>
                <Link href="/story">The story</Link>
              </Button>
            </div>
            {flagship && (
              <p
                className="animate-fade-up max-w-md text-sm leading-relaxed text-parch"
                style={{ animationDelay: "450ms" }}
              >
                {soldOut
                  ? "Batch No. 01 is gone. The next edition earns its own name; the release list hears first."
                  : `${formatZAR(flagship.priceCents)} a bottle. Delivery ${formatZAR(flatRateCents)} flat, anywhere in South Africa. A limited edition: when it sells out, it is not coming back.`}
              </p>
            )}
            <Motto className="animate-fade-up pt-2" />
          </div>

          <div className="animate-rise relative z-10" style={{ animationDelay: "150ms" }}>
            {heroSrc && flagshipImage ? (
              <div className="relative mx-auto aspect-[3/4] w-full max-w-[420px] [mask-image:radial-gradient(ellipse_72%_68%_at_center,black_52%,transparent_98%)] lg:max-w-[480px]">
                <Image
                  src={heroSrc}
                  alt={flagshipImage.alt}
                  fill
                  sizes="(min-width: 1024px) 480px, 90vw"
                  priority
                  className="object-cover"
                />
              </div>
            ) : (
              <PlaceholderFrame
                label="Hero: Batch No. 01 bottle on black, crest visible"
                aspect="aspect-[3/4]"
              />
            )}
          </div>
        </div>

        {/* Brass plate: the facts, once, at the foot of the stage */}
        <div className="relative z-20 border-t hairline bg-ink/70 backdrop-blur-sm">
          <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-y-5 px-6 py-6 sm:grid-cols-4">
            {(
              [
                ["Age", "3 years in oak"],
                ["Finish", "French casks"],
                ["Strength", "43%"],
                ["Bottle", "750ml"],
              ] as const
            ).map(([label, value]) => (
              <div key={label}>
                <dt className="text-[0.625rem] uppercase tracking-[0.2em] text-parch">{label}</dt>
                <dd className="mt-1 font-display text-lg text-bone">{value}</dd>
              </div>
            ))}
          </dl>
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
      <section id="newsletter" className="scroll-mt-24">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <CrestDivider className="mb-14" />
          <Reveal className="mx-auto max-w-md text-center">
            <SectionHeading
              align="center"
              eyebrow="First pour"
              title="Hear about the next release before it lands"
              lead="New editions and where to find us. Release news reaches this list first."
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
