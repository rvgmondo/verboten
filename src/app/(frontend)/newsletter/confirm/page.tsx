import type { Metadata } from "next";
import Link from "next/link";
import { getPayload } from "payload";

import { BrandBadge } from "@/components/brand/crest";
import { Button } from "@/components/ui/button";
import { sendNewsletterWelcome } from "@/lib/emails";

import config from "../../../../payload.config";

export const metadata: Metadata = {
  title: "Confirm your place on the list",
  robots: { index: false },
};

/**
 * Closes the double opt-in loop. The token is single use: it is cleared once
 * confirmed, so a leaked link cannot be replayed. Wrong or missing tokens get
 * the same quiet answer as expired ones, which tells a stranger nothing about
 * whether an address is on the list.
 */
export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  let confirmed = false;

  if (token) {
    const payload = await getPayload({ config });
    const found = await payload.find({
      collection: "subscribers",
      where: { confirmToken: { equals: token } },
      limit: 1,
      overrideAccess: true,
    });
    const subscriber = found.docs[0];
    if (subscriber) {
      await payload.update({
        collection: "subscribers",
        id: subscriber.id,
        data: { status: "confirmed", confirmToken: null },
        overrideAccess: true,
      });
      confirmed = true;
      // The welcome is the first marketing email this address gets, so it is
      // the first that has to carry a working way out.
      await sendNewsletterWelcome(payload, subscriber.email, subscriber.unsubscribeToken);
    }
  }

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <BrandBadge className="h-20 w-20" />
      <div className="space-y-4">
        <p className="eyebrow">{confirmed ? "Confirmed" : "Nothing to confirm"}</p>
        <h1 className="font-display text-4xl tracking-tight text-bone">
          {confirmed ? "You are on the list." : "That link has already been used."}
        </h1>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-parch">
          {confirmed
            ? "New releases, and where the bar is pouring next. This list hears first."
            : "It may have been used already, or it expired. Sign up again from the foot of any page and we will send a fresh one."}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        <Button asChild>
          <Link href="/shop">The shop</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/find-us">Where we are pouring</Link>
        </Button>
      </div>
    </main>
  );
}
