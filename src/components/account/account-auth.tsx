"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { AUTH_CHANGED } from "@/components/chrome/account-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Sign in / create account against Payload's customers auth endpoints.
 * Same-origin REST sets the http-only session cookie; the server component
 * re-reads it on refresh.
 */
export const AccountAuth = () => {
  const router = useRouter();
  const [mode, setMode] = React.useState<"login" | "register" | "forgot">("login");
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "").trim();

    try {
      if (mode === "forgot") {
        await fetch("/api/customers/forgot-password", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email }),
        });
        setNotice("If that address has an account, a reset email is on its way.");
        setBusy(false);
        return;
      }

      if (mode === "register") {
        const createRes = await fetch("/api/customers", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });
        if (!createRes.ok) {
          const data = await createRes.json().catch(() => null);
          setError(
            data?.errors?.[0]?.message ??
              "That account could not be created. The email may already be in use.",
          );
          setBusy(false);
          return;
        }
        // No automatic sign-in: the address has to be proven first, because
        // the account shows orders matched on it. Payload has already sent
        // the confirmation link.
        setNotice(
          "Check your email. There is a link waiting that opens your account, and your orders appear the moment you use it.",
        );
        setBusy(false);
        return;
      }

      const loginRes = await fetch("/api/customers/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!loginRes.ok) {
        const data = await loginRes.json().catch(() => null);
        const message = String(data?.errors?.[0]?.message ?? "");
        setError(
          /verif/i.test(message)
            ? "This account is not confirmed yet. Use the link in the email we sent you, then sign in."
            : "Email or password did not match.",
        );
        setBusy(false);
        return;
      }
      window.dispatchEvent(new Event(AUTH_CHANGED));
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-8">
      <div className="flex gap-6 border-b border-line pb-4" role="tablist" aria-label="Account">
        {(
          [
            ["login", "Sign in"],
            ["register", "Create account"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={mode === key}
            onClick={() => {
              setMode(key);
              setError(null);
              setNotice(null);
            }}
            className={`text-xs uppercase tracking-[0.18em] transition-colors ${
              mode === key ? "text-gold" : "text-parch hover:text-bone"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-6">
        {mode === "register" && (
          <div className="space-y-2">
            <Label htmlFor="acc-name">Name</Label>
            <Input id="acc-name" name="name" autoComplete="name" required />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="acc-email">Email</Label>
          <Input id="acc-email" name="email" type="email" autoComplete="email" required />
        </div>
        {mode !== "forgot" && (
          <div className="space-y-2">
            <Label htmlFor="acc-password">Password</Label>
            <Input
              id="acc-password"
              name="password"
              type="password"
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              required
              minLength={8}
            />
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="text-sm text-gold">
            {notice}
          </p>
        )}

        <Button type="submit" disabled={busy} className="w-full">
          {busy
            ? "One moment"
            : mode === "login"
              ? "Sign in"
              : mode === "register"
                ? "Create account"
                : "Send reset email"}
        </Button>

        {mode === "login" && (
          <button
            type="button"
            onClick={() => setMode("forgot")}
            className="text-xs text-parch underline underline-offset-4 hover:text-bone"
          >
            Forgot your password?
          </button>
        )}
      </form>
    </div>
  );
};

export const LogoutButton = () => {
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={async () => {
        await fetch("/api/customers/logout", { method: "POST" });
        window.dispatchEvent(new Event(AUTH_CHANGED));
        router.refresh();
      }}
    >
      Sign out
    </Button>
  );
};
