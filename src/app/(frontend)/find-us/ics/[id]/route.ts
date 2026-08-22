import { getPayload } from "payload";

import config from "../../../../../payload.config";

/**
 * Downloadable calendar entry (.ics) for a single event, so "add to calendar"
 * works in Apple/Outlook/anything. Google gets its own prefilled link on the
 * page. Events are public data; invalid ids just 404.
 */

const icsDate = (iso: string) =>
  new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return new Response("Not found", { status: 404 });
  }

  const payload = await getPayload({ config });
  let event;
  try {
    event = await payload.findByID({ collection: "events", id: numericId });
  } catch {
    return new Response("Not found", { status: 404 });
  }
  if (!event) return new Response("Not found", { status: 404 });

  const end = event.endDate || new Date(new Date(event.startDate).getTime() + 3 * 3600_000).toISOString();
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Verboten Spirits//Events//EN",
    "BEGIN:VEVENT",
    `UID:verboten-event-${event.id}@verboten.co.za`,
    `DTSTAMP:${icsDate(new Date().toISOString())}`,
    `DTSTART:${icsDate(event.startDate)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${esc(`Verboten at ${event.title}`)}`,
    `LOCATION:${esc(event.location)}`,
    ...(event.description ? [`DESCRIPTION:${esc(event.description)}`] : []),
    ...(event.url ? [`URL:${esc(event.url)}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="verboten-event-${event.id}.ics"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
