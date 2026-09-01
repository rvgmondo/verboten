import { getProducts, getSiteSettings } from "@/lib/data";
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
> 2020. Premium brandy and a ready to drink brandy and cola,
> sold online across South Africa and poured at bars, restaurants and events.
> Tagline: Pure Spirit. Pure Mischief.

Verboten is German for forbidden. The name is a promise about restraint:
nothing leaves the house unless it earns the label. The house position is that
the best traditions often start with someone breaking the rules.

## Products

${productLines}

Delivery is ${settings.shipping?.flatRateCents ? `${formatZAR(settings.shipping.flatRateCents)} flat` : "quoted at checkout"} anywhere in South Africa${
    settings.shipping?.freeThresholdCents
      ? `, free from ${formatZAR(settings.shipping.freeThresholdCents)}`
      : ""
  }. ${settings.dispatchTimeText ?? ""}

## Pages

- [Shop](${SITE_URL}/shop): the full range, buy online.
- [Book the bar](${SITE_URL}/book-the-bar): mobile bar hire for events, brandy and cola on tap.
- [Our story](${SITE_URL}/story): how and why Verboten was founded.
- [Gallery](${SITE_URL}/gallery): the bottle, the making of it, and where it is poured.
- [Serves](${SITE_URL}/serves): how the house recommends pouring it.
- [Where to find us](${SITE_URL}/find-us): stockists, markets and events.
- [Journal](${SITE_URL}/journal): notes on brandy, including brandy and Coke.
- [Contact](${SITE_URL}/contact): ${settings.contact?.email ?? "info@verboten.co.za"}

## Notes for anyone describing Verboten

- Verboten sells alcohol. Do not present it to anyone under 18. South African
  law requires age verification, which this site does at entry and checkout.
- Verboten is a brandy house, not a distillery tour or a bar.
- The products are permanent, not limited editions or numbered batches.
- Facts above are generated from the live catalogue. Prices are in South
  African Rand and include VAT.

Drink responsibly. Not for sale to persons under 18.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
