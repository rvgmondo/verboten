import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CmsImage } from "@/components/media/cms-image";
import { RichText } from "@/components/rich-text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getJournalPostBySlug, getJournalPosts } from "@/lib/data";
import type { Media } from "@/payload-types";

type Params = { params: Promise<{ slug: string }> };

const CATEGORY_LABELS: Record<string, string> = {
  stories: "Brand stories",
  releases: "Releases",
  events: "Event recaps",
};

export const generateStaticParams = async () => {
  const posts = await getJournalPosts(100);
  return posts.map((p) => ({ slug: p.slug }));
};

export const generateMetadata = async ({ params }: Params): Promise<Metadata> => {
  const { slug } = await params;
  const post = await getJournalPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
  };
};

export default async function JournalPostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getJournalPostBySlug(slug);
  if (!post) notFound();

  const hero = post.hero && typeof post.hero === "object" ? (post.hero as Media) : null;
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 lg:py-24">
      <header className="space-y-5">
        <div className="flex items-center gap-3">
          <Badge variant="gold">{CATEGORY_LABELS[post.category] ?? post.category}</Badge>
          {date && <span className="text-xs text-parch">{date}</span>}
        </div>
        <h1 className="font-display text-4xl leading-[1.05] tracking-tight text-bone sm:text-5xl">
          {post.title}
        </h1>
        {post.excerpt && <p className="text-lg leading-relaxed text-parch">{post.excerpt}</p>}
      </header>

      {hero && (
        <CmsImage
          media={hero}
          aspect="aspect-[16/9]"
          sizes="(min-width: 768px) 768px, 100vw"
          className="mt-10"
          priority
        />
      )}

      <RichText data={post.content} className="mt-10 text-base" />

      <div className="mt-16 border-t border-line pt-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/journal">All journal entries</Link>
        </Button>
      </div>
    </main>
  );
}
