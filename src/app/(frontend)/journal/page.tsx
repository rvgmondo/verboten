import type { Metadata } from "next";
import Link from "next/link";

import { PageMasthead } from "@/components/brand/page-masthead";
import { CmsImage } from "@/components/media/cms-image";
import { Badge } from "@/components/ui/badge";
import { getJournalPosts } from "@/lib/data";
import type { Media } from "@/payload-types";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Release announcements, event recaps and stories from the Verboten house in Pretoria.",
  alternates: { canonical: "/journal" },
};

const CATEGORY_LABELS: Record<string, string> = {
  stories: "Brand stories",
  releases: "Releases",
  events: "Event recaps",
};

const formatDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

export default async function JournalPage() {
  const posts = await getJournalPosts(48);

  return (
    <main>
      <PageMasthead
        eyebrow="The journal"
        title="Notes from"
        titleAccent="the house."
        lead="Releases, recaps and the occasional opinion. Written when there is something worth saying."
      />

      <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
      {posts.length > 0 ? (
        <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const hero =
              post.hero && typeof post.hero === "object" ? (post.hero as Media) : null;
            const date = formatDate(post.publishedAt);
            return (
              <li key={post.id}>
                <Link href={`/journal/${post.slug}`} className="group block space-y-4">
                  {hero && (
                    <CmsImage
                      media={hero}
                      aspect="aspect-[4/3]"
                      sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                      className="transition-transform duration-500 group-hover:scale-[1.01]"
                    />
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="quiet">{CATEGORY_LABELS[post.category] ?? post.category}</Badge>
                      {date && <span className="text-xs text-parch/80">{date}</span>}
                    </div>
                    <h2 className="font-display text-xl leading-snug text-bone transition-colors group-hover:text-gold-bright">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="line-clamp-3 text-sm leading-relaxed text-parch">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="border border-line bg-coal p-8">
          <p className="text-sm text-parch">Nothing published yet. It will be worth the wait.</p>
        </div>
      )}
      </div>
    </main>
  );
}
