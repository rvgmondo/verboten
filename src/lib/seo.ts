import { centsToDecimal } from "@/lib/money";
import { getAvailability } from "@/lib/inventory";
import { mediaSrc } from "@/lib/media";
import type { Event, JournalPost, Media, Product } from "@/payload-types";

/** JSON-LD builders. Rendered via the JsonLd component (script tag). */

// If the env var is ever missing on a production build, canonicals, the
// sitemap and JSON-LD must not silently point at localhost.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://verboten.co.za"
    : "http://localhost:3001");
const abs = (path: string) => `${SITE_URL}${path}`;

export const organizationLd = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": abs("/#organization"),
  name: "Verboten Spirits",
  legalName: "Verboten Pty Ltd",
  url: SITE_URL,
  brand: {
    "@type": "Brand",
    name: "Verboten",
    slogan: "Vir dié wat weet",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Silverton, Pretoria",
    addressRegion: "Gauteng",
    postalCode: "0184",
    addressCountry: "ZA",
  },
  sameAs: [
    "https://www.facebook.com/verbotenspirits/",
    "https://www.instagram.com/verbotenspirits/",
  ],
});

export const productLd = (product: Product) => {
  const availability = getAvailability(product);
  const image = product.gallery?.[0]?.image;
  const imageUrl =
    image && typeof image === "object" ? mediaSrc((image as Media).url) : null;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription ?? undefined,
    sku: product.sku ?? undefined,
    image: imageUrl ? [abs(imageUrl)] : undefined,
    brand: { "@type": "Brand", name: "Verboten" },
    offers: {
      "@type": "Offer",
      url: abs(`/shop/${product.slug}`),
      priceCurrency: "ZAR",
      price: centsToDecimal(product.priceCents),
      availability: availability.soldOut
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
      seller: { "@id": abs("/#organization") },
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

export const articleLd = (post: JournalPost) => {
  const hero = post.hero && typeof post.hero === "object" ? (post.hero as Media) : null;
  const heroUrl = mediaSrc(hero?.url);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: heroUrl ? [abs(heroUrl)] : undefined,
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.updatedAt,
    author: { "@id": abs("/#organization") },
    publisher: { "@id": abs("/#organization") },
    mainEntityOfPage: abs(`/journal/${post.slug}`),
  };
};

export const eventLd = (event: Event) => {
  const a = event.address;
  // Google treats address as required on a physical Event. Emit it only when
  // there is something real to say, since a half-empty PostalAddress is worse
  // than none: it validates and then sends people to the wrong place.
  const address =
    a && (a.streetAddress || a.addressLocality)
      ? {
          "@type": "PostalAddress",
          streetAddress: a.streetAddress ?? undefined,
          addressLocality: a.addressLocality ?? undefined,
          addressRegion: a.addressRegion ?? undefined,
          postalCode: a.postalCode ?? undefined,
          addressCountry: a.addressCountry ?? "ZA",
        }
      : undefined;

  const image =
    typeof event.image === "object" && event.image?.url ? abs(event.image.url) : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: event.startDate,
    endDate: event.endDate ?? undefined,
    location: { "@type": "Place", name: event.location, address },
    description: event.description ?? undefined,
    url: event.url ?? undefined,
    image,
    organizer: { "@id": abs("/#organization") },
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  };
};
