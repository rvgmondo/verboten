import { centsToDecimal } from "@/lib/money";
import { getAvailability } from "@/lib/inventory";
import { mediaSrcAt } from "@/lib/media";
import type { Event, JournalPost, Media, Product, SiteSetting } from "@/payload-types";

/** JSON-LD builders. Rendered via the JsonLd component (script tag). */

// If the env var is ever missing on a production build, canonicals, the
// sitemap and JSON-LD must not silently point at localhost.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://verboten.co.za"
    : "http://localhost:3001");
const abs = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path}`);

const ORG_ID = () => abs("/#organization");
// The round badge, not the crest: Google wants a logo at least 112px square
// that reads on white, and the badge carries the name as well as the mark.
const LOGO = () => ({
  "@type": "ImageObject",
  url: abs("/brand/badge.png"),
  width: 640,
  height: 640,
});

/**
 * The house itself. Rendered once, in the layout, so every page can point at
 * it by @id instead of repeating it.
 *
 * Contact details come from Site Settings, the same place the footer and the
 * contact page read them, so a changed number is changed everywhere at once.
 */
export const organizationLd = (settings?: SiteSetting) => {
  const c = settings?.contact;
  const socials = settings?.socials;
  const sameAs = [socials?.facebook, socials?.instagram, socials?.tiktok].filter(
    (u): u is string => Boolean(u),
  );
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID(),
    name: "Verboten Spirits",
    alternateName: "Verboten",
    legalName: "Verboten Pty Ltd",
    url: SITE_URL,
    logo: LOGO(),
    image: abs("/brand/og-default.png"),
    description:
      "An independent South African brandy house in Silverton, Pretoria, making premium brandy and delivering it anywhere in South Africa.",
    foundingDate: "2020",
    foundingLocation: { "@type": "Place", name: "Pretoria, South Africa" },
    slogan: "Vir dié wat weet",
    brand: { "@type": "Brand", name: "Verboten", logo: abs("/brand/badge.png") },
    ...(c?.email ? { email: c.email } : {}),
    ...(c?.phone ? { telephone: c.phone } : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Silverton, Pretoria",
      addressRegion: "Gauteng",
      postalCode: "0184",
      addressCountry: "ZA",
    },
    areaServed: { "@type": "Country", name: "South Africa" },
    ...(c?.email || c?.phone
      ? {
          contactPoint: [
            {
              "@type": "ContactPoint",
              contactType: "customer service",
              ...(c?.ordersEmail || c?.email ? { email: c.ordersEmail || c.email } : {}),
              ...(c?.phone ? { telephone: c.phone } : {}),
              areaServed: "ZA",
              availableLanguage: "English",
            },
          ],
        }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
};

/**
 * The site as a whole. This is what lets Google show "Verboten Spirits" as the
 * site name above a result instead of the bare domain. No SearchAction: the
 * site has no search, and pointing Google at one that does not exist is how
 * a sitelinks search box ends up sending people to a 404.
 */
export const websiteLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": abs("/#website"),
  name: "Verboten Spirits",
  alternateName: ["Verboten", "verboten.co.za"],
  url: SITE_URL,
  inLanguage: "en-ZA",
  publisher: { "@id": ORG_ID() },
});

/**
 * A product and its offer.
 *
 * Google will not show price or stock in results for a Product without an
 * image, and two of the five bottles have no photography yet. Those fall back
 * to the generated share card for that product, which is a real, crawlable
 * 1200 by 630 image with the product's name on it, until photographs exist.
 */
export const productLd = (product: Product, settings?: SiteSetting) => {
  const availability = getAvailability(product);
  const photos = (product.gallery ?? [])
    .map((g) => (typeof g.image === "object" ? (g.image as Media) : null))
    .filter((m): m is Media => Boolean(m))
    .map((m) => mediaSrcAt(m, 1200))
    .filter((u): u is string => Boolean(u))
    .slice(0, 4)
    .map(abs);
  const images = photos.length ? photos : [abs(`/shop/${product.slug}/card.png`)];
  const s = product.specs;

  const flatRate = settings?.shipping?.flatRateCents;
  const freeOver = settings?.shipping?.freeThresholdCents;
  // A single unit's shipping, which is what a search result describes: the
  // flat rate, or nothing when one unit on its own clears the free line.
  const shippingCents =
    typeof flatRate === "number"
      ? freeOver && product.priceCents >= freeOver
        ? 0
        : flatRate
      : null;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": abs(`/shop/${product.slug}#product`),
    name: product.name,
    description: product.shortDescription ?? undefined,
    sku: product.sku ?? undefined,
    mpn: product.sku ?? undefined,
    image: images,
    url: abs(`/shop/${product.slug}`),
    brand: { "@type": "Brand", name: "Verboten" },
    manufacturer: { "@id": ORG_ID() },
    category: "Food, Beverages & Tobacco > Beverages > Alcoholic Beverages > Liquor & Spirits",
    ...(s?.origin ? { countryOfOrigin: { "@type": "Country", name: s.origin } } : {}),
    additionalProperty: [
      s?.abv ? { "@type": "PropertyValue", name: "Alcohol by volume", value: `${s.abv}%` } : null,
      s?.ageYears
        ? { "@type": "PropertyValue", name: "Age", value: `${s.ageYears} years` }
        : null,
      s?.caskFinish ? { "@type": "PropertyValue", name: "Finish", value: s.caskFinish } : null,
    ].filter(Boolean),
    ...(s?.volumeMl
      ? { size: `${s.volumeMl}ml` }
      : {}),
    offers: {
      "@type": "Offer",
      url: abs(`/shop/${product.slug}`),
      priceCurrency: "ZAR",
      price: centsToDecimal(product.priceCents),
      itemCondition: "https://schema.org/NewCondition",
      availability: availability.soldOut
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
      seller: { "@id": ORG_ID() },
      ...(shippingCents !== null
        ? {
            shippingDetails: {
              "@type": "OfferShippingDetails",
              shippingRate: {
                "@type": "MonetaryAmount",
                value: centsToDecimal(shippingCents),
                currency: "ZAR",
              },
              shippingDestination: { "@type": "DefinedRegion", addressCountry: "ZA" },
            },
          }
        : {}),
    },
  };
};

export const breadcrumbLd = (crumbs: Array<{ name: string; path: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: crumbs.map((crumb, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: crumb.name,
    item: abs(crumb.path),
  })),
});

/**
 * Written by the house, so the author is the house. An @id reference alone
 * leaves Google without an author name on the page, which it flags, so the
 * name and URL travel with it.
 */
export const articleLd = (post: JournalPost) => {
  const hero = post.hero && typeof post.hero === "object" ? (post.hero as Media) : null;
  const heroUrl = hero ? mediaSrcAt(hero, 1200) : null;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: [heroUrl ? abs(heroUrl) : abs(`/journal/${post.slug}/card.png`)],
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.updatedAt,
    inLanguage: "en-ZA",
    author: { "@type": "Organization", "@id": ORG_ID(), name: "Verboten Spirits", url: SITE_URL },
    publisher: {
      "@type": "Organization",
      "@id": ORG_ID(),
      name: "Verboten Spirits",
      url: SITE_URL,
      logo: LOGO(),
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": abs(`/journal/${post.slug}`) },
    isPartOf: { "@id": abs("/#website") },
  };
};

/**
 * An event, or nothing.
 *
 * Google treats a physical Event without a street or town as invalid, and a
 * half-empty PostalAddress is worse than none: it validates and then sends
 * people to the wrong place. So an event the admin has not given an address
 * yet is simply not marked up. It still shows on the page.
 */
export const eventLd = (event: Event) => {
  const a = event.address;
  if (!a || !(a.streetAddress || a.addressLocality)) return null;

  const image =
    typeof event.image === "object" && event.image
      ? mediaSrcAt(event.image as Media, 1200)
      : null;

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: event.startDate,
    endDate: event.endDate ?? undefined,
    location: {
      "@type": "Place",
      name: event.location,
      address: {
        "@type": "PostalAddress",
        streetAddress: a.streetAddress ?? undefined,
        addressLocality: a.addressLocality ?? undefined,
        addressRegion: a.addressRegion ?? undefined,
        postalCode: a.postalCode ?? undefined,
        addressCountry: a.addressCountry ?? "ZA",
      },
    },
    description: event.description ?? undefined,
    url: event.url ?? abs("/find-us"),
    image: image ? [abs(image)] : [abs("/brand/og-default.png")],
    organizer: { "@type": "Organization", "@id": ORG_ID(), name: "Verboten Spirits", url: SITE_URL },
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  };
};
