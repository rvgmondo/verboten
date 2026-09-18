import type { Metadata } from "next";
import { pageMeta } from "@/lib/metadata";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageMasthead } from "@/components/brand/page-masthead";
import { JsonLd } from "@/components/json-ld";
import { CmsImage } from "@/components/media/cms-image";
import { RichText } from "@/components/rich-text";
import { NOT_FOUND_METADATA, NotFoundPanel } from "@/components/brand/not-found-panel";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/product-card";
import { getJournalPostBySlug, getJournalPosts, getProducts } from "@/lib/data";
import { articleLd, breadcrumbLd } from "@/lib/seo";
import type { Media, Product } from "@/payload-types";

type Params = { params: Promise<{ slug: string }> };

const CATEGORY_LABELS: Record<string, string> = {
  stories: "Brand stories",
  releases: "Releases",
  events: "Event recaps",
};

const BRANDY_FIRST = ["verboten-premium-brandy", "verboten-premium-set-2-bottle", "verboten-brandy-cola"];

/** Up to three bottles for the foot of a post, the brandy range first. */
const houseProducts = (products: Product[]) =>
  [...products]
    .sort((a, b) => {
      const rank = (p: Product) => (BRANDY_FIRST.indexOf(p.slug) + 1 || BRANDY_FIRST.length + 1);
      return rank(a) - rank(b);
    })
    .slice(0, 3);

export const generateStaticParams = async () => {
  const posts = await getJournalPosts(100);
  return posts.map((p) => ({ slug: p.slug }));
};

export const generateMetadata = async ({ params }: Params): Promise<Metadata> => {
  const { slug } = await params;
  const post = await getJournalPostBySlug(slug);
  if (!post) return NOT_FOUND_METADATA;
  return pageMeta({
    title: post.meta?.title || post.title,
    description: post.meta?.description || post.excerpt || post.title,
    path: `/journal/${post.slug}`,
    type: "article",
    image: null,
  });
};

export default async function JournalPostPage({ params }: Params) {
  const { slug } = await params;
  const [post, products] = await Promise.all([getJournalPostBySlug(slug), getProducts()]);
  if (!post) {
    // Same rule as the catch-all: a path that looks like a file is a real 404.
    if (/\.[a-z0-9]{2,5}$/i.test(slug)) notFound();
    return (
      <NotFoundPanel
        title="That entry is not here."
        lead="It may have been renamed since you saved the link, sorry about that. Every other entry is under Journal in the menu."
      />
    );
  }

  const hero = post.hero && typeof post.hero === "object" ? (post.hero as Media) : null;
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <main>
      <JsonLd data={articleLd(post)} />
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Journal", path: "/journal" },
          { name: post.title, path: `/journal/${post.slug}` },
        ])}
      />
      <PageMasthead
        eyebrow={`${CATEGORY_LABELS[post.category] ?? post.category}${date ? ` | ${date}` : ""}`}
        title={post.title}
        lead={post.excerpt ?? undefined}
      />

      <div className="mx-auto max-w-3xl px-6 py-16 lg:py-20">
      {hero && (
        <CmsImage
          media={hero}
          aspect="aspect-[16/9]"
          sizes="(min-width: 768px) 768px, 100vw"
          className="mb-10"
          priority
        />
      )}

      <RichText data={post.content} className="text-base" />

      <div className="mt-16 border-t border-line pt-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/journal">All journal entries</Link>
        </Button>
      </div>
      </div>

      {/* A reader who has just learned how brandy is made is the reader most
          ready to try one, and until now the page ended in a dead end. The
          brandy range leads; anything else fills in if those are missing. */}
      {houseProducts(products).length > 0 && (
        <section aria-labelledby="from-the-house" className="border-t border-line">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 id="from-the-house" className="eyebrow mb-8">
              From the house
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {houseProducts(products).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
