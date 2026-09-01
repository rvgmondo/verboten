import type { Metadata } from "next";
import Link from "next/link";

import { Motto } from "@/components/brand/motto";
import { PageMasthead } from "@/components/brand/page-masthead";
import { RichText } from "@/components/rich-text";
import { NOT_FOUND_METADATA, NotFoundPanel } from "@/components/brand/not-found-panel";
import { Button } from "@/components/ui/button";
import { CrestDivider } from "@/components/ui/separator";
import { getPageBySlug } from "@/lib/data";

/**
 * Static metadata would keep claiming a canonical /story and an indexable page
 * even when the CMS has no story to render, so search engines would be invited
 * to index a not-found panel.
 */
export const generateMetadata = async (): Promise<Metadata> => {
  const page = await getPageBySlug("story");
  return page ? STORY_METADATA : { title: "Our Story", ...NOT_FOUND_METADATA };
};

const STORY_METADATA: Metadata = {
  title: "Our Story",
  description:
    "Pretoria, 2020. A conviction that the best traditions often start with someone breaking the rules, and a spirit made to prove it. The Verboten story.",
  alternates: { canonical: "/story" },
};

export default async function StoryPage() {
  const page = await getPageBySlug("story");
  if (!page) return <NotFoundPanel />;

  return (
    <main>
      <PageMasthead
        eyebrow="Our story"
        title={page.title}
        lead={page.intro ?? undefined}
      />

      <div className="mx-auto max-w-3xl px-6 py-16 lg:py-20">
        <RichText data={page.content} className="text-base" />

        <div className="mt-16 space-y-8 border-t border-line pt-10 text-center">
          <CrestDivider className="mb-10" />
          <Motto className="mx-auto" />
          <Button asChild>
            <Link href="/shop">See what we make</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
