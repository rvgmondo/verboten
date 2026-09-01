import type { Metadata } from "next";
import Link from "next/link";

import { BookingForm } from "@/components/booking-form";
import { Motto } from "@/components/brand/motto";
import { JsonLd } from "@/components/json-ld";
import { ArtPlaceholder } from "@/components/media/art-placeholder";
import { Button } from "@/components/ui/button";
import { getSiteSettings } from "@/lib/data";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Book the Bar, Mobile Brandy Bar Hire in Gauteng",
  description:
    "Verboten brings its own bar to your event: brandy and cola on tap, gin, and the trailer that carries it. Weddings, birthdays, corporate days and markets across Gauteng. Ask for a quote.",
  alternates: { canonical: "/book-the-bar" },
  openGraph: {
    title: "Book the Verboten bar",
    description: "Brandy and cola on tap, at your event. Gauteng and beyond.",
  },
};

/** What the bar actually turns up with. Facts only, no invented inclusions. */
const WHAT_YOU_GET = [
  {
    title: "The tap",
    body: "Brandy and cola poured cold and fast, the way it moves at a market. Gin on tap alongside it.",
  },
  {
    title: "The whole setup",
    body: "Our own trailer, gazebo and cold storage. We arrive with the bar, not just the bottles.",
  },
  {
    title: "People who pour",
    body: "Our own team behind it, serving all day, packing up after.",
  },
  {
    title: "Bottles to take home",
    body: "The 750ml brandy and the cans, on the counter for anyone who wants to leave with one.",
  },
];

export default async function BookTheBarPage() {
  const settings = await getSiteSettings();
  const whatsapp = settings.contact?.whatsapp;
  const phone = settings.contact?.phone;

  return (
    <main className="inverse bg-ink">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Verboten mobile bar hire",
          serviceType: "Mobile bar hire",
          description:
            "A mobile brandy bar for events: brandy and cola on tap, gin, trailer, gazebo and staff.",
          provider: { "@id": `${SITE_URL}/#organization` },
          areaServed: { "@type": "AdministrativeArea", name: "Gauteng, South Africa" },
          url: `${SITE_URL}/book-the-bar`,
        }}
      />

      {/* Masthead */}
      <section className="relative overflow-hidden border-b border-line">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-12%] top-1/2 h-[90vmin] w-[90vmin] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(205,184,141,0.14),rgba(205,184,141,0.04)_48%,transparent_74%)]" />
          <span className="text-ghost absolute -bottom-[8%] left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-display text-[22vw] font-bold leading-none tracking-[0.05em]">
            VERBOTEN
          </span>
          <div className="grain absolute inset-0 opacity-[0.05]" />
        </div>
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pb-16 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:pb-20 lg:pt-24">
          <div>
            <p className="eyebrow animate-fade-up flex items-center gap-4">
              <span aria-hidden="true" className="h-px w-10 bg-gold-dim/70" />
              Book the bar
            </p>
            <h1
              className="animate-fade-up mt-6 font-display font-semibold leading-[0.98] tracking-tight text-bone text-[clamp(2.6rem,6.5vw,4.5rem)]"
              style={{ animationDelay: "80ms" }}
            >
              We bring the bar. <span className="text-gold">You bring the people.</span>
            </h1>
            <p
              className="animate-fade-up mt-6 max-w-md text-base leading-relaxed text-parch"
              style={{ animationDelay: "160ms" }}
            >
              Brandy and cola on tap, gin alongside it, and the trailer that
              carries the lot. Weddings, birthdays, corporate days, markets.
              Wherever it is worth showing up.
            </p>
            <div
              className="animate-fade-up mt-8 flex flex-wrap gap-4"
              style={{ animationDelay: "240ms" }}
            >
              <Button size="lg" asChild>
                <Link href="#enquire">Ask for a quote</Link>
              </Button>
              {whatsapp && (
                <Button size="lg" variant="outline" asChild>
                  <a
                    href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                      "Hi Verboten, I would like to book the bar for an event.",
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp us
                  </a>
                </Button>
              )}
            </div>
            <Motto className="animate-fade-up pt-8" />
          </div>
          <div className="animate-rise" style={{ animationDelay: "150ms" }}>
            <ArtPlaceholder
              shot="The Verboten trailer and gazebo set up at a country market"
              aspect="aspect-[4/3]"
            />
          </div>
        </div>
      </section>

      {/* What turns up */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
          <h2 className="font-display font-semibold leading-tight tracking-tight text-bone text-[clamp(1.8rem,3.6vw,2.6rem)]">
            What turns up
          </h2>
          <dl className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {WHAT_YOU_GET.map((item) => (
              <div key={item.title}>
                <dt className="font-display text-lg text-bone">{item.title}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-parch">{item.body}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-10 max-w-xl text-sm leading-relaxed text-parch">
            Every event is different, so every quote is. Tell us the date, the
            place and roughly how many people, and we come back with a number.
          </p>
        </div>
      </section>

      {/* Enquiry */}
      <section id="enquire" className="scroll-mt-24 border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1fr_0.8fr] lg:py-20">
          <div>
            <h2 className="font-display font-semibold leading-tight tracking-tight text-bone text-[clamp(1.8rem,3.6vw,2.6rem)]">
              Tell us about it
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-parch">
              We come back with a quote within one business day.
            </p>
            <div className="mt-8">
              <BookingForm />
            </div>
          </div>
          <aside className="h-fit space-y-6 border border-line bg-coal p-6 lg:sticky lg:top-24">
            <h3 className="eyebrow">Rather talk</h3>
            {phone && (
              <p className="text-sm text-parch">
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="text-gold underline underline-offset-4 hover:text-gold-bright"
                >
                  {phone}
                </a>
              </p>
            )}
            {settings.contact?.email && (
              <p className="text-sm text-parch">
                <a
                  href={`mailto:${settings.contact.email}`}
                  className="text-gold underline underline-offset-4 hover:text-gold-bright"
                >
                  {settings.contact.email}
                </a>
              </p>
            )}
            <p className="text-sm leading-relaxed text-parch">
              Based in Silverton, Pretoria. We travel for the ones worth
              travelling for.
            </p>
            <div className="border-t border-line pt-5">
              <p className="text-xs leading-relaxed text-parch">
                We serve alcohol, so every event we pour at is 18+ and our team
                checks identification. Drink responsibly. Not for sale to
                persons under 18.
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* Close */}
      <section>
        <div className="mx-auto max-w-6xl space-y-6 px-6 py-16 text-center">
          <p className="mx-auto max-w-md text-sm leading-relaxed text-parch">
            Not an event, just a shelf? The bottles ship anywhere in South
            Africa.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/shop">The shop</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/find-us">Where we are pouring next</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
