"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { AUTH_CHANGED } from "@/components/chrome/account-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Spends a password reset token against the customers collection.
 *
 * Payload signs the caller in on a successful reset, so the header is told to
 * catch up and we send them straight to their orders rather than asking them
 * to log in again with the password they just set.
 */
export const ResetPasswordForm = ({ token }: { token: string }) => {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  if (!token) {
    return (
      <div className="w-full space-y-6 text-center">
        <p className="text-sm leading-relaxed text-parch">
          That link is missing its token. Reset links are single use and expire,
          so ask for a fresh one from the sign in page.
        </p>
        <Button variant="outline" onClick={() => router.push("/account")}>
          Back to sign in
        </Button>
      </div>
    );
  }

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const password = String(new FormData(e.currentTarget).get("password") ?? "");

    try {
      const res = await fetch("/api/customers/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        setError(
          "That link has expired or has already been used. Ask for a fresh one from the sign in page.",
        );
        setBusy(false);
        return;
      }
      window.dispatchEvent(new Event(AUTH_CHANGED));
      router.push("/account");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="w-full space-y-6">
      <div className="space-y-2">
        <Label htmlFor="reset-password">New password</Label>
        <Input
          id="reset-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "reset-error" : undefined}
        />
        <p className="text-xs text-parch">At least 8 characters.</p>
      </div>

      {error && (
        <p id="reset-error" role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <Button type="submit" disabled={busy} className="w-full">
        {busy ? "One moment" : "Set the password and sign in"}
      </Button>
    </form>
  );
};
