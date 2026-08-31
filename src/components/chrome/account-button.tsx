"use client";

import { User } from "lucide-react";
import Link from "next/link";
import * as React from "react";

/** Fired by the sign in and sign out controls so the header can catch up. */
export const AUTH_CHANGED = "verboten:auth-changed";

type State = { status: "unknown" } | { status: "out" } | { status: "in"; name: string | null };

/**
 * Account control in the header: who you are if we know, a way in if we do not.
 *
 * Deliberately client side. The header sits in the root layout, and reading
 * the session there would call headers() and opt every page in the site out of
 * static rendering, trading a fast catalogue for one small icon.
 *
 * The trade that makes it safe is that both states go to the same place. The
 * link is always /account, which shows orders when you are signed in and the
 * sign in form when you are not, so the icon before the check resolves is
 * never a lie and clicking early never lands you somewhere wrong.
 */
export const AccountButton = () => {
  const [state, setState] = React.useState<State>({ status: "unknown" });

  const check = React.useCallback(async () => {
    try {
      const res = await fetch("/api/customers/me", {
        credentials: "same-origin",
        headers: { accept: "application/json" },
      });
      if (!res.ok) {
        setState({ status: "out" });
        return;
      }
      const data = (await res.json()) as { user?: { name?: string | null } | null };
      setState(data?.user ? { status: "in", name: data.user.name ?? null } : { status: "out" });
    } catch {
      // Offline or blocked: fall back to the signed out treatment, which
      // still links to the right place.
      setState({ status: "out" });
    }
  }, []);

  React.useEffect(() => {
    void check();
    window.addEventListener(AUTH_CHANGED, check);
    return () => window.removeEventListener(AUTH_CHANGED, check);
  }, [check]);

  const signedIn = state.status === "in";
  const firstName = signedIn ? (state.name ?? "").trim().split(" ")[0] : "";
  const initial = firstName ? firstName[0].toUpperCase() : "";

  return (
    <Link
      href="/account"
      aria-label={
        signedIn
          ? firstName
            ? `Your account, signed in as ${firstName}`
            : "Your account"
          : "Sign in to your account"
      }
      className="flex h-11 w-11 items-center justify-center text-parch transition-colors hover:text-bone"
    >
      {signedIn && initial ? (
        <span
          aria-hidden="true"
          className="flex h-6 w-6 items-center justify-center rounded-full border border-gold text-[0.625rem] font-medium tracking-[0.04em] text-gold"
        >
          {initial}
        </span>
      ) : signedIn ? (
        <span
          aria-hidden="true"
          className="flex h-6 w-6 items-center justify-center rounded-full border border-gold text-gold"
        >
          <User className="h-3.5 w-3.5" />
        </span>
      ) : (
        <User className="h-5 w-5" aria-hidden="true" />
      )}
    </Link>
  );
};
