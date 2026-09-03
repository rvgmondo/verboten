"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";

import { submitContact, type ContactResult } from "@/app/actions/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**
 * The mobile bar enquiry. Same action and queue as the contact form, tagged
 * topic="booking" so bookings are their own list in the admin and their own
 * email subject. The event fields are deliberately loose: a date typed as
 * "sometime in March" is more useful than an empty required field.
 */

const Submit = () => {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Sending" : "Ask for a quote"}
    </Button>
  );
};

const FieldError = ({ id, message }: { id: string; message?: string }) =>
  message ? (
    <p id={id} className="text-xs text-danger">
      {message}
    </p>
  ) : null;

export const BookingForm = () => {
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
      <input type="hidden" name="topic" value="booking" />

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="bk-name">Name</Label>
          <Input
            id="bk-name"
            name="name"
            required
            autoComplete="name"
            aria-invalid={errors?.name ? true : undefined}
            aria-describedby={errors?.name ? "bk-name-error" : undefined}
          />
          <FieldError id="bk-name-error" message={errors?.name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bk-email">Email</Label>
          <Input
            id="bk-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            aria-invalid={errors?.email ? true : undefined}
            aria-describedby={errors?.email ? "bk-email-error" : undefined}
          />
          <FieldError id="bk-email-error" message={errors?.email} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bk-phone">Phone</Label>
          <Input id="bk-phone" name="phone" type="tel" autoComplete="tel" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bk-date">When is it</Label>
          <Input
            id="bk-date"
            name="eventDate"
            placeholder="12 December, or a rough month"
            aria-invalid={errors?.eventDate ? true : undefined}
            aria-describedby={errors?.eventDate ? "bk-date-error" : undefined}
          />
          <FieldError id="bk-date-error" message={errors?.eventDate} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bk-location">Where is it</Label>
          <Input
            id="bk-location"
            name="eventLocation"
            placeholder="Town or suburb"
            aria-invalid={errors?.eventLocation ? true : undefined}
            aria-describedby={errors?.eventLocation ? "bk-location-error" : undefined}
          />
          <FieldError id="bk-location-error" message={errors?.eventLocation} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bk-guests">Roughly how many people</Label>
          {/* No numeric pattern. The question invites "80-100" and "about 80",
              and the form is noValidate, so the browser never enforced it
              anyway: it just sailed through to a server rejection the form
              had nowhere to display. */}
          <Input
            id="bk-guests"
            name="eventGuests"
            placeholder="80, or 80 to 100"
            aria-invalid={errors?.eventGuests ? true : undefined}
            aria-describedby={errors?.eventGuests ? "bk-guests-error" : undefined}
          />
          <FieldError id="bk-guests-error" message={errors?.eventGuests} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bk-message">What are we walking into</Label>
        <Textarea
          id="bk-message"
          name="message"
          required
          placeholder="Wedding, birthday, corporate day, market. Indoors or outdoors, and anything we should know."
          aria-invalid={errors?.message ? true : undefined}
          aria-describedby={errors?.message ? "bk-message-error" : undefined}
        />
        <FieldError id="bk-message-error" message={errors?.message} />
      </div>

      {/* Honeypot: hidden from humans and screen readers alike. */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden">
        <label htmlFor="bk-website">Website</label>
        <input id="bk-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
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
