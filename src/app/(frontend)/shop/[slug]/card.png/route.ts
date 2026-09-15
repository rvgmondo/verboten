import { getProductBySlug } from "@/lib/data";

import OgImage from "../opengraph-image";

/**
 * The product's share card at an address that never changes.
 *
 * Next serves opengraph-image files under a hashed name that moves whenever
 * the file does, which is fine inside a page's own meta tags and useless
 * anywhere that stores the URL: structured data, the sitemap, a product feed.
 * This renders the same card under a fixed name for those. It stands in for a
 * product photograph only until one is uploaded.
 */
export const revalidate = 3600;

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(await getProductBySlug(slug))) return new Response("Not found", { status: 404 });
  const image = await OgImage({ params: Promise.resolve({ slug }) });
  // An hour, not a year: the card carries the live price.
  image.headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
  return image;
}
