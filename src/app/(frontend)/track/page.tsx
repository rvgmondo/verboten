import type { Metadata } from "next";
import Link from "next/link";

import { PageMasthead } from "@/components/brand/page-masthead";
import { TrackOrderForm } from "@/components/track-order-form";

export const metadata: Metadata = {
  title: "Track your order",
  description: "Check where a Verboten order is with its order number and the email it was placed with.",
  // A utility page with nothing to rank for, and every result behind it is private.
  robots: { index: false, follow: true },
};

/**
 * Where "where is my order?" gets answered without an account.
 *
 * The order number can arrive in the URL, which is how the confirmation email
 * links here, but the email address never does: personal data does not belong
 * in a query string, where it lands in server logs, browser history and any
 * analytics tool that records page URLs.
 */
export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  const initial = typeof order === "string" && /^VB-\d{4}-\d{4,}$/i.test(order) ? order.toUpperCase() : "";

  return (
    <main>
      <PageMasthead
        eyebrow="Your order"
        title="Where is"
        titleAccent="my order."
        lead="Your order number is in the confirmation email. Use the same email address you checked out with."
      />
      <div className="mx-auto max-w-4xl px-6 py-16 lg:py-20">
        <TrackOrderForm initialOrderNumber={initial} />
        <p className="mt-12 text-sm leading-relaxed text-parch">
          Ordered with an account?{" "}
          <Link href="/account" className="text-gold underline underline-offset-4 hover:text-gold-bright">
            Every order is on your account page
          </Link>
          . Something wrong with a delivery?{" "}
          <Link href="/contact" className="text-gold underline underline-offset-4 hover:text-gold-bright">
            Tell us and we will sort it out
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
