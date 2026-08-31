import type { Metadata } from "next";

import { BrandBadge } from "@/components/brand/crest";
import { ResetPasswordForm } from "@/components/account/reset-password-form";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false },
};

/**
 * Where a customer's password reset link lands.
 *
 * Payload's default reset link points at /admin/reset, which is the staff
 * panel: customers have no access to it, so every reset dead ended there.
 * The token comes through the URL and is spent by the form.
 */
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-8 px-6 py-24">
      <BrandBadge className="h-20 w-20" />
      <div className="space-y-3 text-center">
        <p className="eyebrow">Your account</p>
        <h1 className="font-display text-3xl tracking-tight text-bone">
          Choose a new password
        </h1>
      </div>
      <ResetPasswordForm token={token ?? ""} />
    </main>
  );
}
