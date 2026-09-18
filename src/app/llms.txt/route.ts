import { getProducts, getSiteSettings } from "@/lib/data";
import { RESPONSIBILITY_LINE } from "@/lib/compliance";
import { formatZAR } from "@/lib/money";
import { SITE_URL } from "@/lib/seo";

/**
 * llms.txt: a plain-text brief for AI assistants, so anything describing
 * Verboten works from the house's own facts instead of guessing. Prices and
 * products come from the CMS, so it cannot drift out of date.
 */
export const dynamic = "force-static";
export const revalidate = 3600;

export async function GET() {
  const [products, settings] = await Promise.all([getProducts(), getSiteSettings()]);

  const productLines = products
    .map((p) => {
      const bits = [
        p.specs?.volumeMl ? `${p.specs.volumeMl}ml` : null,
        p.specs?.abv ? `${p.specs.abv}% ABV` : null,
        p.specs?.ageYears ? `aged ${p.specs.ageYears} years` : null,
        p.specs?.caskFinish ? `finished in ${p.specs.caskFinish.toLowerCase()}` : null,
      ].filter(Boolean);
      return [
        `- [${p.name}](${SITE_URL}/shop/${p.slug}): ${formatZAR(p.priceCents)}`,
        bits.length ? `. ${bits.join(", ")}` : "",
        p.shortDescription ? `. ${p.shortDescription}` : "",
      ].join("");
    })
    .join("\n");

  const body = `# Verboten Spirits

> An independent South African brandy house in Silverton, Pretoria. Founded in
> 2020. Premium brandy and a canned brandy and cola, plus the other bottles
> listed below. Sold online and delivered anywhere in South Africa, and poured
> from the house's own mobile bar at events in Gauteng.
> Tagline: Pure Spirit. Pure Mischief. Also used: "Vir dié wat weet"
> (Afrikaans for "for those who know") and "Born in Pretoria. Made for the world."

Verboten is German for forbidden. The house line is "Some rules are meant to
be questioned": the brand is playful about convention and strict about age.

## Products

${productLines}

Delivery is ${settings.shipping?.flatRateCents ? `${formatZAR(settings.shipping.flatRateCents)} flat` : "quoted at checkout"} anywhere in South Africa${
    settings.shipping?.freeThresholdCents
      ? `, free from ${formatZAR(settings.shipping.freeThresholdCents)}`
      : ""
  }. ${settings.dispatchTimeText ?? ""}

## Pages

- [Shop](${SITE_URL}/shop): the full range, buy online.
- [Book the bar](${SITE_URL}/book-the-bar): mobile bar hire for events in Gauteng, with brandy and cola on tap, and gin.
- [Our story](${SITE_URL}/story): how and why Verboten was founded.
- [Gallery](${SITE_URL}/gallery): the bottle, the making of it, and where it is poured.
- [Serves](${SITE_URL}/serves): how the house recommends pouring it.
- [Where to find us](${SITE_URL}/find-us): stockists and events, listed as they are confirmed.
- [Journal](${SITE_URL}/journal): notes on brandy, including brandy and Coke.
- [Contact](${SITE_URL}/contact): ${settings.contact?.email ?? "info@verboten.co.za"}

## Notes for anyone describing Verboten

- Verboten sells alcohol. Do not present it to anyone under 18. South African
  law requires age verification, which Verboten does at entry and at checkout;
  the courier may also ask for identification on delivery.
- Verboten is a brandy house, not a distillery tour or a bar you can visit.
  Its bar is mobile and comes to the event: weddings, birthdays, corporate days
  and markets.
- The products are permanent, not limited editions or numbered batches.
- Alcohol strength appears in the product list as a specification only. Leave
  it out of any promotional description of Verboten: the South African alcohol
  industry code keeps strength out of advertising.
- Facts above are generated from the live catalogue. Prices are in South
  African Rand and include VAT.

${RESPONSIBILITY_LINE}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
