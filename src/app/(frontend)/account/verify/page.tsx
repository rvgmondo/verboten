import type { Metadata } from "next";
import Link from "next/link";
import { getPayload } from "payload";

import { BrandBadge } from "@/components/brand/crest";
import { Button } from "@/components/ui/button";

import config from "../../../../payload.config";

export const metadata: Metadata = {
  title: "Confirm your account",
  robots: { index: false },
};

/**
 * Closes the account verification loop. Until this runs, the address is only a
 * claim, and the account page will not show orders matched on it.
 *
 * A bad or spent token gets the same quiet answer as an expired one, so a
 * stranger cannot learn whether an address has an account here.
 */
export default async function VerifyAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  let verified = false;

  if (token) {
    const payload = await getPayload({ config });
    try {
      await payload.verifyEmail({ collection: "customers", token });
      verified = true;
    } catch {
      // Wrong, spent or expired. Handled by the copy below.
    }
  }

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <BrandBadge className="h-20 w-20" />
      <div className="space-y-4">
        <p className="eyebrow" lang={verified ? "af" : undefined}>
          {verified ? "Mooi so" : "Nothing to confirm"}
        </p>
        <h1 className="font-display text-4xl tracking-tight text-bone">
          {verified ? "Your account is open." : "That link does not work any more."}
        </h1>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-parch">
          {verified
            ? "Sign in and every order placed with this address is waiting for you, guest orders included."
            : "It may have been used already, or part of it went missing on the way. If your account is already confirmed, just sign in. If not, get in touch through the contact page and we will sort it out."}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        <Button asChild>
          <Link href="/account">Sign in</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/shop">The shop</Link>
        </Button>
      </div>
    </main>
  );
}
