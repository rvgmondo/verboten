import type { Metadata } from "next";
import Link from "next/link";

import { SectionHeading } from "@/components/brand/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSiteSettings, getStockists, getUpcomingEvents } from "@/lib/data";

export const metadata: Metadata = {
  title: "Where to Find Us",
  description:
    "Stockists, bars and venues that pour Verboten, and the markets and events where the house sets up. Or order direct; we ship across South Africa.",
};

const TYPE_LABELS: Record<string, string> = {
  bar: "Bar",
  restaurant: "Restaurant",
  bottle_store: "Bottle store",
  venue: "Venue",
  market: "Market",
};

const formatEventDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default async function FindUsPage() {
  const [stockists, events, settings] = await Promise.all([
    getStockists(),
    getUpcomingEvents(),
    getSiteSettings(),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
      <SectionHeading
        as="h1"
        eyebrow="Out in the world"
        title="Where to find us"
        lead="On good back bars, at the markets we pour at, and straight from us to your door."
      />

      {/* Events */}
      <section aria-labelledby="events-heading" className="mt-16">
        <h2 id="events-heading" className="eyebrow mb-6">
          Upcoming events and markets
        </h2>
        {events.length > 0 ? (
          <ul className="divide-y divide-line border-y border-line">
            {events.map((event) => (
              <li key={event.id} className="grid gap-2 py-6 sm:grid-cols-[220px_1fr_auto] sm:gap-6">
                <p className="text-sm text-gold">{formatEventDate(event.startDate)}</p>
                <div>
                  <h3 className="font-display text-lg text-bone">{event.title}</h3>
                  <p className="mt-1 text-sm text-parch">{event.location}</p>
                  {event.description && (
                    <p className="mt-2 text-sm leading-relaxed text-parch">{event.description}</p>
                  )}
                </div>
                {event.url && (
                  <div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={event.url} target="_blank" rel="noopener noreferrer">
                        Details
                      </a>
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="border border-line bg-coal p-8">
            <p className="max-w-xl text-sm leading-relaxed text-parch">
              Nothing on the calendar right now. Markets and tastings are
              announced on{" "}
              {settings.socials?.instagram ? (
                <a
                  href={settings.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold underline underline-offset-4 hover:text-gold-bright"
                >
                  Instagram
                </a>
              ) : (
                "Instagram"
              )}{" "}
              and the newsletter first, usually a few weeks out.
            </p>
          </div>
        )}
      </section>

      {/* Stockists */}
      <section aria-labelledby="stockists-heading" className="mt-16">
        <h2 id="stockists-heading" className="eyebrow mb-6">
          Stockists
        </h2>
        {stockists.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stockists.map((s) => (
              <li key={s.id} className="border border-line bg-coal p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg text-bone">
                    {s.url ? (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-gold-bright"
                      >
                        {s.name}
                      </a>
                    ) : (
                      s.name
                    )}
                  </h3>
                  <Badge variant="quiet">{TYPE_LABELS[s.type] ?? s.type}</Badge>
                </div>
                <p className="mt-2 text-sm text-parch">{s.area}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="border border-line bg-coal p-8">
            <p className="max-w-xl text-sm leading-relaxed text-parch">
              The stockist list is short and getting longer. Until your local
              carries us, order direct and we ship anywhere in South Africa.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Button asChild>
                <Link href="/shop">Order direct</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/contact">Stock Verboten at your venue</Link>
              </Button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
