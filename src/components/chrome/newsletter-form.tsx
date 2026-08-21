"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";

import { subscribeToNewsletter, type NewsletterResult } from "@/app/actions/newsletter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Submit = () => {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" size="md" disabled={pending}>
      {pending ? "Adding you" : "Keep me posted"}
    </Button>
  );
};

export const NewsletterForm = ({ source = "footer" }: { source?: string }) => {
  const [state, action] = React.useActionState<NewsletterResult | null, FormData>(
    subscribeToNewsletter,
    null,
  );
  const id = React.useId();

  return (
    <form action={action} className="space-y-3">
      <Label htmlFor={`${id}-email`}>New releases, first</Label>
      <div className="flex gap-2">
        <Input
          id={`${id}-email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          aria-describedby={state ? `${id}-status` : undefined}
          className="max-w-xs"
        />
        <Submit />
      </div>
      {/* Honeypot: hidden from humans and screen readers alike. */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden">
        <label htmlFor={`${id}-company`}>Company</label>
        <input id={`${id}-company`} name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="source" value={source} />
      <p
        id={`${id}-status`}
        role="status"
        aria-live="polite"
        className={state ? "text-xs " + (state.ok ? "text-gold" : "text-danger") : "sr-only"}
      >
        {state?.message ?? ""}
      </p>
      <p className="text-[0.6875rem] leading-relaxed text-parch/80">
        Release news only. No noise, unsubscribe any time.
      </p>
    </form>
  );
};
