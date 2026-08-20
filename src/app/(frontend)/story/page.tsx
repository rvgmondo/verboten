import type { Metadata } from "next";
import Link from "next/link";

import { Motto } from "@/components/brand/motto";
import { RichText } from "@/components/rich-text";
import { Button } from "@/components/ui/button";
import { CrestDivider } from "@/components/ui/separator";
import { getPageBySlug } from "@/lib/data";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Verboten is an independent beverage house in Pretoria. Founded in 2020, releasing brandy in numbered batches, and building toward shelves in Amsterdam and Berlin.",
};

export default async function StoryPage() {
  const page = await getPageBySlug("story");
  if (!page) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 lg:py-24">
      <header className="space-y-6">
        <p className="eyebrow">Our story</p>
        <h1 className="font-display text-5xl leading-[1.02] tracking-tight text-bone sm:text-6xl">
          {page.title}
        </h1>
        {page.intro && (
          <p className="text-lg leading-relaxed text-parch">{page.intro}</p>
        )}
      </header>

      <CrestDivider className="my-12" />

      <RichText data={page.content} className="text-base" />

      <div className="mt-16 space-y-8 border-t border-line pt-10 text-center">
        <Motto className="mx-auto" />
        <Button asChild>
          <Link href="/shop">See what we make</Link>
        </Button>
      </div>
    </main>
  );
}
