import type { Metadata } from "next";

import { BrandCrest } from "@/components/brand/brand-crest";

export const metadata: Metadata = {
  title: "See You Later",
  robots: { index: false, follow: false },
};

/** Where under-18 visitors land. Polite, short, no lecture. */
export default function AccessRestrictedPage() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <BrandCrest className="h-16 w-16 text-gold-dim" />
      <div className="space-y-4">
        <p className="eyebrow">Sorry</p>
        <h1 className="font-display text-4xl tracking-tight text-bone">
          This site is for adults
        </h1>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-parch">
          Verboten sells alcohol, so this site is only for people aged 18 and
          older. That is one rule we never bend. Thank you for understanding.
        </p>
      </div>
    </main>
  );
}
