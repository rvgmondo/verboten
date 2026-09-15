import { getJournalPostBySlug } from "@/lib/data";

import OgImage from "../opengraph-image";

/**
 * The post's share card at a fixed address, for the article's structured data.
 * See shop/[slug]/card.png for why the generated image's own URL will not do.
 */
export const revalidate = 3600;

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(await getJournalPostBySlug(slug))) return new Response("Not found", { status: 404 });
  const image = await OgImage({ params: Promise.resolve({ slug }) });
  image.headers.set("Cache-Control", "public, max-age=86400, s-maxage=86400");
  return image;
}
