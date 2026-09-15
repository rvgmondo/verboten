import { orderTotals } from "@/lib/commerce/totals";
import { getProducts, getSiteSettings } from "@/lib/data";
import { getAvailability } from "@/lib/inventory";
import { SITE_URL } from "@/lib/seo";
import type { Media, Product } from "@/payload-types";

/**
 * The catalogue as a product feed, for Google Merchant Center and Meta.
 *
 * One RSS 2.0 file with Google's g: namespace, which both platforms read:
 * Merchant Center fetches it on a schedule for free listings and Shopping
 * ads, and Meta's catalogue takes the same URL for catalogue ads. Meta does
 * not allow alcohol to be sold through its shops, only advertised, so this
 * feeds ads that link back here and nothing more.
 *
 * Built from the same catalogue the shop renders, so a price or stock change
 * in the admin reaches the feed on the next fetch without anyone exporting
 * anything.
 *
 * Rules it keeps:
 *   Ids are product slugs, the same ids the site's analytics events send, so
 *   Meta can match ad clicks and sales to catalogue items.
 *   No alcohol strength in titles or descriptions: the industry code keeps it
 *   out of anything that is not the label (DF-SA 2026, 2.6.2).
 *   Images are the original uploads, JPEG or PNG, because Meta rejects WebP.
 *   No GTINs yet. Brand plus the house SKU as MPN identifies each product
 *   until real barcodes are entered.
 */

export const dynamic = "force-static";
export const revalidate = 900;

const xml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    // Characters XML 1.0 forbids outright would fail the whole file.
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");

const abs = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path}`);

const plain = (text: string | null | undefined) =>
  (text ?? "").replace(/\s+/g, " ").trim();

const images = (product: Product) =>
  (product.gallery ?? [])
    .map((g) => (typeof g.image === "object" ? (g.image as Media) : null))
    .filter((m): m is Media => Boolean(m?.url) && /image\/(jpeg|png)/.test(m?.mimeType ?? ""))
    .map((m) => abs(m.url as string));

const money = (cents: number) => `${(cents / 100).toFixed(2)} ZAR`;

export async function GET() {
  const [products, settings] = await Promise.all([getProducts(), getSiteSettings()]);
  const flat = settings.shipping?.flatRateCents;

  // Only products with a real photograph. Both platforms disapprove images
  // carrying text or prices, which is all the generated share card is, and a
  // disapproved item drags down the account's standing with it. A bottle joins
  // the feed on its own the day its photograph is uploaded.
  const listable = products.filter((p) => images(p).length > 0);

  const items = listable.map((p) => {
    const availability = getAvailability(p);
    const [main, ...more] = images(p);
    const shippingCents =
      typeof flat === "number"
        ? orderTotals({
            subtotalCents: p.priceCents,
            flatRateCents: flat,
            freeThresholdCents: settings.shipping?.freeThresholdCents ?? 0,
          }).shippingCents
        : null;
    const description = plain(p.shortDescription) || p.name;

    return [
      "<item>",
      `<g:id>${xml(p.slug)}</g:id>`,
      `<g:title>${xml(p.name)}</g:title>`,
      `<g:description>${xml(description)}</g:description>`,
      `<g:link>${xml(abs(`/shop/${p.slug}`))}</g:link>`,
      `<g:image_link>${xml(main)}</g:image_link>`,
      ...more.slice(0, 10).map((u) => `<g:additional_image_link>${xml(u)}</g:additional_image_link>`),
      `<g:availability>${availability.soldOut ? "out_of_stock" : "in_stock"}</g:availability>`,
      `<g:price>${money(p.priceCents)}</g:price>`,
      "<g:brand>Verboten</g:brand>",
      "<g:condition>new</g:condition>",
      // The house is the manufacturer, so its SKU is a real MPN, and brand plus
      // MPN is a valid identifier. "No identifier" is only true without one.
      p.sku ? `<g:mpn>${xml(p.sku)}</g:mpn>` : "<g:identifier_exists>no</g:identifier_exists>",
      "<g:google_product_category>Food, Beverages &amp; Tobacco &gt; Beverages &gt; Alcoholic Beverages &gt; Liquor &amp; Spirits</g:google_product_category>",
      `<g:product_type>${xml(p.productType === "can" ? "Ready to drink" : p.productType === "bundle" ? "Sets" : "Bottles")}</g:product_type>`,
      // Alcohol is for adults only, and Google uses this to keep it that way.
      "<g:age_group>adult</g:age_group>",
      p.productType === "bundle" ? "<g:is_bundle>yes</g:is_bundle>" : "",
      shippingCents !== null
        ? `<g:shipping><g:country>ZA</g:country><g:service>Courier</g:service><g:price>${money(shippingCents)}</g:price></g:shipping>`
        : "",
      "</item>",
    ]
      .filter(Boolean)
      .join("");
  });

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
    "<channel>",
    "<title>Verboten Spirits</title>",
    `<link>${xml(SITE_URL)}</link>`,
    "<description>The Verboten Spirits catalogue.</description>",
    ...items,
    "</channel>",
    "</rss>",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // A feed is for the platforms that fetch it, not for search results.
      "X-Robots-Tag": "noindex",
      "Cache-Control": "public, max-age=900, s-maxage=900",
    },
  });
}
