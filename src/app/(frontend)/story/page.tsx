import type { Metadata } from "next";
import Link from "next/link";

import { Motto } from "@/components/brand/motto";
import { PageMasthead } from "@/components/brand/page-masthead";
import { RichText } from "@/components/rich-text";
import { NotFoundPanel } from "@/components/brand/not-found-panel";
import { Button } from "@/components/ui/button";
import { CrestDivider } from "@/components/ui/separator";
import { getPageBySlug } from "@/lib/data";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Pretoria, 2020. Two founders quietly breaking convention, and the conviction that the best traditions often start with someone breaking the rules. The Verboten story.",
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
