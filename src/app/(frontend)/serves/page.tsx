import type { Metadata } from "next";

import { SectionHeading } from "@/components/brand/section-heading";
import { CmsImage } from "@/components/media/cms-image";
import { PlaceholderFrame } from "@/components/media/placeholder-frame";
import { getServes } from "@/lib/data";
import type { Media } from "@/payload-types";

export const metadata: Metadata = {
  title: "Serves",
  description:
    "Signature serves and simple builds for Verboten brandy and Brandy & Cola. Nothing that needs a cocktail kit; everything worth doing properly.",
};

export default async function ServesPage() {
  const serves = await getServes();

  return (
    <main className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
      <SectionHeading
        as="h1"
        eyebrow="Serves"
        title="How the house pours it"
        lead="Simple builds that respect the bottle. Nothing here needs a cocktail kit."
      />

      <div className="mt-14 space-y-16">
        {serves.map((serve, index) => {
          const image =
            serve.image && typeof serve.image === "object" ? (serve.image as Media) : null;
          return (
            <article
              key={serve.id}
              className="grid gap-8 border-t border-line pt-12 lg:grid-cols-[0.8fr_1.2fr]"
            >
              <div className={index % 2 === 1 ? "lg:order-2" : undefined}>
                {image ? (
                  <CmsImage
                    media={image}
                    aspect="aspect-[4/3]"
                    sizes="(min-width: 1024px) 460px, 100vw"
                  />
                ) : (
                  <PlaceholderFrame
                    label={`Serve photography: ${serve.name}`}
                    aspect="aspect-[4/3]"
                  />
                )}
              </div>
              <div className="space-y-6">
                <h2 className="font-display text-3xl tracking-tight text-bone">{serve.name}</h2>
                {serve.description && (
                  <p className="max-w-xl text-sm leading-relaxed text-parch">{serve.description}</p>
                )}
                {(serve.ingredients?.length ?? 0) > 0 && (
                  <div>
                    <h3 className="eyebrow mb-3">Build</h3>
                    <ul className="space-y-2 text-sm">
                      {serve.ingredients?.map((ing) => (
                        <li key={ing.id} className="flex gap-4">
                          {ing.amount && <span className="w-20 shrink-0 text-parch">{ing.amount}</span>}
                          <span className="text-bone">{ing.item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {serve.method && (
                  <div>
                    <h3 className="eyebrow mb-3">Method</h3>
                    <p className="max-w-xl text-sm leading-relaxed text-parch">{serve.method}</p>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <p className="mt-16 border-t border-line pt-6 text-xs leading-relaxed text-parch/70">
        Drink responsibly. Not for sale to persons under 18.
      </p>
    </main>
  );
}
