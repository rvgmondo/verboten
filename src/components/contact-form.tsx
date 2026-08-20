"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";

import { submitContact, type ContactResult } from "@/app/actions/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const Submit = () => {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Sending" : "Send it"}
    </Button>
  );
};

const FieldError = ({ id, message }: { id: string; message?: string }) =>
  message ? (
    <p id={id} className="text-xs text-danger">
      {message}
    </p>
  ) : null;

export const ContactForm = () => {
  const [state, action] = React.useActionState<ContactResult | null, FormData>(
    submitContact,
    null,
  );
  const errors = state?.ok ? undefined : state?.fieldErrors;

  if (state?.ok) {
    return (
      <div className="border border-gold-dim/40 bg-coal p-8" role="status">
        <p className="font-display text-xl text-bone">Received.</p>
        <p className="mt-2 text-sm text-parch">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-6" noValidate>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name">Name</Label>
          <Input
            id="contact-name"
            name="name"
            required
            autoComplete="name"
            aria-invalid={errors?.name ? true : undefined}
            aria-describedby={errors?.name ? "contact-name-error" : undefined}
          />
          <FieldError id="contact-name-error" message={errors?.name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            aria-invalid={errors?.email ? true : undefined}
            aria-describedby={errors?.email ? "contact-email-error" : undefined}
          />
          <FieldError id="contact-email-error" message={errors?.email} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-phone">Phone (optional)</Label>
        <Input id="contact-phone" name="phone" type="tel" autoComplete="tel" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          name="message"
          required
          aria-invalid={errors?.message ? true : undefined}
          aria-describedby={errors?.message ? "contact-message-error" : undefined}
        />
        <FieldError id="contact-message-error" message={errors?.message} />
      </div>
      {/* Honeypot: hidden from humans and screen readers alike. */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      {state && !state.ok && (
        <p role="alert" className="text-sm text-danger">
          {state.message}
        </p>
      )}
      <Submit />
    </form>
  );
};
