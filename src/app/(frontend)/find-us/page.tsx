import type { Metadata } from "next";
import { pageMeta } from "@/lib/metadata";
import Link from "next/link";

import { PageMasthead } from "@/components/brand/page-masthead";
import { JsonLd } from "@/components/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSiteSettings, getStockists, getUpcomingEvents } from "@/lib/data";
import { eventLd } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Stockists and Events",
  description:
    "Where to find Verboten brandy: stockists and events, listed here as they are confirmed. Or buy brandy online and we deliver anywhere in South Africa.",
  path: "/find-us",
});

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

/** Prefilled Google Calendar link; the .ics route covers everything else. */
const googleCalendarUrl = (event: {
  title: string;
  startDate: string;
  endDate?: string | null;
  location: string;
  description?: string | null;
}) => {
  const fmt = (iso: string) =>
    new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const end =
    event.endDate ||
    new Date(new Date(event.startDate).getTime() + 3 * 3600_000).toISOString();
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Verboten at ${event.title}`,
    dates: `${fmt(event.startDate)}/${fmt(end)}`,
    location: event.location,
    ...(event.description ? { details: event.description } : {}),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

export default async function FindUsPage() {
  const [stockists, events, settings] = await Promise.all([
    getStockists(),
    getUpcomingEvents(),
    getSiteSettings(),
  ]);

  return (
    <main>
      {events.map((event) => {
        const ld = eventLd(event);
        return ld ? <JsonLd key={event.id} data={ld} /> : null;
      })}
      <PageMasthead
        eyebrow="Out in the world"
        title="Where to"
        titleAccent="find us."
        lead="Come and find us. We will be the ones pouring. Stockists and events go up here as they are confirmed, and the bottles ship anywhere in South Africa."
      />

      <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
      {/* Events */}
      <section aria-labelledby="events-heading">
        <h2 id="events-heading" className="eyebrow mb-6">
          Upcoming events and markets
        </h2>
        {events.length > 0 ? (
          <ul className="divide-y divide-line border-y border-line">
            {events.map((event) => (
              <li key={event.id} className="grid gap-2 py-6 sm:grid-cols-[220px_1fr] sm:gap-6">
                <p className="text-sm text-gold">{formatEventDate(event.startDate)}</p>
                <div>
                  <h3 className="font-display text-lg text-bone">{event.title}</h3>
                  <p className="mt-1 text-sm text-parch">{event.location}</p>
                  {event.description && (
                    <p className="mt-2 text-sm leading-relaxed text-parch">{event.description}</p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-3">
                    {event.url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={event.url} target="_blank" rel="noopener noreferrer">
                          Details
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={googleCalendarUrl(event)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Google Calendar
                      </a>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/find-us/ics/${event.id}`}>Add to calendar (.ics)</a>
                    </Button>
                    {settings.contact?.whatsapp && (
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={`https://wa.me/${settings.contact.whatsapp}?text=${encodeURIComponent(
                            `I am coming to ${event.title} on ${formatEventDate(event.startDate)}.`,
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Tell us you are coming
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="border border-line bg-coal p-8">
            <p className="max-w-xl text-sm leading-relaxed text-parch">
              Nothing on the calendar just yet. When the bar is out
              somewhere, it goes up on{" "}
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
              and in the newsletter first, then here with the date and the
              place.
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
              No stockists to list just yet. Until your local carries us, order
              direct and we deliver anywhere in South Africa. And if the local
              is yours, we would like to talk.
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
      </div>
    </main>
  );
}
