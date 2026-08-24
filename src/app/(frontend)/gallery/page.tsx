import type { Metadata } from "next";
import Link from "next/link";

import { Motto } from "@/components/brand/motto";
import { ArtPlaceholder } from "@/components/media/art-placeholder";
import { CmsImage } from "@/components/media/cms-image";
import { Button } from "@/components/ui/button";
import { getGalleryItems, getSiteSettings } from "@/lib/data";
import type { Media } from "@/payload-types";

export const metadata: Metadata = {
  title: "The Gallery",
  description:
    "Verboten seen up close: the bottle, the making of it, the events we pour at, and the bars that carry us. Photographs from an independent South African brandy house in Pretoria.",
  alternates: { canonical: "/gallery" },
  openGraph: {
    title: "The Verboten Gallery",
    description: "The bottle, the making of it, and the rooms it ends up in.",
  },
};

/** Category order and the words the house uses for each. */
const SECTIONS = [
  {
    key: "bottle",
    title: "The bottle",
    lead: "What leaves the house, and what it looks like in the glass.",
    shot: "The bottle on black, crest catching the light",
  },
  {
    key: "production",
    title: "In the making",
    lead: "Oak, casks and the parts nobody photographs for the label.",
    shot: "Cask ends in low light, chalk markings",
  },
  {
    key: "events",
    title: "Out in the world",
    lead: "Markets, tastings and the events worth showing up to.",
    shot: "The stand at a market, dusk, people mid-pour",
  },
  {
    key: "venues",
    title: "Where we pour",
    lead: "The back bars and tables that carry us.",
    shot: "Back bar shelf, bottle among the regulars",
  },
] as const;

/**
 * The gallery: curated, owned, and fast.
 *
 * Deliberately not an embedded social feed. Feeds pull third-party scripts
 * that slow the page and sit outside the site's content policy, they render
 * in someone else's design, and they carry visitors away. The Instagram link
 * at the foot of this page does that job without costing the page anything.
 */
export default async function GalleryPage() {
  const [items, settings] = await Promise.all([getGalleryItems(), getSiteSettings()]);

  const byCategory = (key: string) =>
    items.filter((i) => i.category === key);

  const hasAny = items.length > 0;

  return (
    <main className="inverse bg-ink">
      {/* Masthead */}
      <section className="relative overflow-hidden border-b border-line">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <span className="text-ghost absolute -bottom-[8%] left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-display text-[22vw] font-bold leading-none tracking-[0.05em]">
            VERBOTEN
          </span>
          <div className="grain absolute inset-0 opacity-[0.05]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 pb-14 pt-16 lg:pb-20 lg:pt-24">
          <p className="eyebrow animate-fade-up flex items-center gap-4">
            <span aria-hidden="true" className="h-px w-10 bg-gold-dim/70" />
            The gallery
          </p>
          <h1
            className="animate-fade-up mt-6 max-w-3xl font-display font-semibold leading-[0.98] tracking-tight text-bone text-[clamp(2.6rem,6.5vw,4.5rem)]"
            style={{ animationDelay: "80ms" }}
          >
            Seen up close.
          </h1>
          <p
            className="animate-fade-up mt-6 max-w-md text-base leading-relaxed text-parch"
            style={{ animationDelay: "160ms" }}
          >
            The bottle, the making of it, and the rooms it ends up in. Some
            traditions are meant to be whispered, not shouted.
          </p>
        </div>
      </section>

      {SECTIONS.map((section) => {
        const sectionItems = byCategory(section.key);
        // A category with nothing in it shows one framed slot naming the shot
        // it is waiting for, rather than an empty hole.
        return (
          <section
            key={section.key}
            aria-labelledby={`gallery-${section.key}`}
            className="border-b border-line last:border-b-0"
          >
            <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
              <h2
                id={`gallery-${section.key}`}
                className="font-display font-semibold leading-tight tracking-tight text-bone text-[clamp(1.8rem,3.6vw,2.6rem)]"
              >
                {section.title}
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-parch">{section.lead}</p>

              {sectionItems.length > 0 ? (
                <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {sectionItems.map((item) => {
                    const media =
                      item.image && typeof item.image === "object" ? (item.image as Media) : null;
                    if (!media) return null;
                    return (
                      <figure
                        key={item.id}
                        className={item.featured ? "sm:col-span-2" : undefined}
                      >
                        <CmsImage
                          media={media}
                          aspect={item.featured ? "aspect-[16/10]" : "aspect-[4/5]"}
                          sizes={
                            item.featured
                              ? "(min-width: 1024px) 760px, 100vw"
                              : "(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                          }
                          className="bg-transparent"
                        />
                        <figcaption className="mt-3 text-xs leading-relaxed text-parch">
                          {item.caption}
                        </figcaption>
                      </figure>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-10 max-w-sm">
                  <ArtPlaceholder shot={section.shot} aspect="aspect-[4/5]" />
                </div>
              )}
            </div>
          </section>
        );
      })}

      {/* Close */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl space-y-6 px-6 py-16 text-center">
          <Motto className="mx-auto" />
          <p className="mx-auto max-w-md text-sm leading-relaxed text-parch">
            {hasAny
              ? "More of it goes up on Instagram first, usually the same night."
              : "The photographs are being taken. Instagram gets them first, usually the same night."}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {settings.socials?.instagram && (
              <Button asChild>
                <a
                  href={settings.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Follow on Instagram
                </a>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/find-us">Where to find us</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
