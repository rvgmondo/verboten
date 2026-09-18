import type { Metadata } from "next";

import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getSiteSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default async function CheckoutPage() {
  const settings = await getSiteSettings();

  return (
    <main className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
      <h1 className="font-display text-4xl tracking-tight text-bone">Checkout</h1>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-parch">
        A few details, then PayFast takes care of payment.{" "}
        {settings.dispatchTimeText || "Ships within 1 to 2 weeks"}.
      </p>
      <div className="mt-10">
        <CheckoutForm
          flatRateCents={settings.shipping?.flatRateCents ?? 0}
          freeThresholdCents={settings.shipping?.freeThresholdCents ?? 0}
          gaId={settings.measurement?.gaMeasurementId ?? null}
        />
      </div>
    </main>
  );
}
