import { NOT_FOUND_METADATA, NotFoundPanel } from "@/components/brand/not-found-panel";
import type { Metadata } from "next";

import { RichText } from "@/components/rich-text";
import { getPageBySlug } from "@/lib/data";

/**
 * Generic CMS page template: the legal set (terms, privacy, shipping and
 * returns, responsible enjoyment) and any future flat page staff create.
 * Designed routes (/story, /shop, ...) take precedence over this catch-all.
 */

type Params = { params: Promise<{ slug: string }> };

export const generateMetadata = async ({ params }: Params): Promise<Metadata> => {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) return NOT_FOUND_METADATA;
  return {
    title: page.title,
    description: page.intro ?? undefined,
    alternates: { canonical: `/${page.slug}` },
  };
};

export default async function CmsPage({ params }: Params) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) return <NotFoundPanel />;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 lg:py-24">
      <header className="space-y-5 border-b border-line pb-10">
        <h1 className="font-display text-4xl leading-tight tracking-tight text-bone sm:text-5xl">
          {page.title}
        </h1>
        {page.intro && <p className="text-base leading-relaxed text-parch">{page.intro}</p>}
        {page.updatedNote && (
          <p className="text-xs uppercase tracking-[0.18em] text-parch/80">{page.updatedNote}</p>
        )}
      </header>
      <RichText data={page.content} className="mt-10" />
    </main>
  );
}
