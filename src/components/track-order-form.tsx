"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";

import { trackOrder, type TrackResult } from "@/app/actions/track";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatZAR } from "@/lib/money";
import { formatOrderDate } from "@/lib/order-status";

const Submit = () => {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Looking" : "Find my order"}
    </Button>
  );
};

/**
 * The lookup form and the result, on one page.
 *
 * Fields are controlled so a failed lookup keeps what was typed: React resets
 * an uncontrolled form after a server action, and retyping an order number
 * because of a typo in the email is exactly the friction this page exists to
 * remove.
 */
export const TrackOrderForm = ({ initialOrderNumber = "" }: { initialOrderNumber?: string }) => {
  const [state, action] = React.useActionState<TrackResult | null, FormData>(trackOrder, null);
  const [orderNumber, setOrderNumber] = React.useState(initialOrderNumber);
  const [email, setEmail] = React.useState("");
  const resultRef = React.useRef<HTMLDivElement>(null);

  const errors = state && !state.ok ? state.fieldErrors : undefined;

  // Move focus to the answer, so a screen reader user hears it and a phone
  // user does not have to scroll to find it.
  React.useEffect(() => {
    if (state) resultRef.current?.focus();
  }, [state]);

  return (
    <div className="space-y-12">
      <form action={action} noValidate className="grid gap-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="track-order">Order number</Label>
          <Input
            id="track-order"
            name="orderNumber"
            placeholder="VB-2026-0007"
            autoComplete="off"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            aria-invalid={errors?.orderNumber ? true : undefined}
            aria-describedby={errors?.orderNumber ? "track-order-error" : undefined}
          />
          {errors?.orderNumber && (
            <p id="track-order-error" className="text-xs text-danger">
              {errors.orderNumber}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="track-email">Email used for the order</Label>
          <Input
            id="track-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={errors?.email ? true : undefined}
            aria-describedby={errors?.email ? "track-email-error" : undefined}
          />
          {errors?.email && (
            <p id="track-email-error" className="text-xs text-danger">
              {errors.email}
            </p>
          )}
        </div>
        <Submit />
      </form>

      <div ref={resultRef} tabIndex={-1} aria-live="polite" className="outline-none">
        {state && !state.ok && !state.fieldErrors && (
          <p role="alert" className="border border-line bg-coal p-6 text-sm text-parch">
            {state.message}
          </p>
        )}

        {state && state.ok && (
          <article className="space-y-10 border border-line bg-coal p-6 sm:p-8">
            <header className="flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <p className="eyebrow">Order</p>
                <h2 className="mt-2 font-display text-3xl text-bone">{state.order.orderNumber}</h2>
                <p className="mt-1 text-sm text-parch">
                  Placed {formatOrderDate(state.order.placedAt)}
                  {state.order.deliveryTown ? `, going to ${state.order.deliveryTown}` : ""}
                </p>
              </div>
              <p className="font-display text-2xl text-gold">{state.order.statusLabel}</p>
            </header>

            {state.order.status === "pending_payment" && (
              <p className="text-sm leading-relaxed text-parch">
                This order has not been paid for, so nothing has been charged and it
                will not ship. If you meant to finish it, start again from the shop.
              </p>
            )}

            {state.order.cancelled ? (
              <p className="text-sm leading-relaxed text-parch">
                This order was {state.order.status === "refunded" ? "refunded" : "cancelled"}.
                If that is a surprise, reply to your confirmation email and we will look.
              </p>
            ) : (
              state.order.status !== "pending_payment" && (
                <ol className="grid gap-6 sm:grid-cols-4">
                  {state.order.journey.map((step) => (
                    <li key={step.status} className="space-y-2">
                      <span
                        aria-hidden="true"
                        className={`block h-1 ${
                          step.state === "upcoming" ? "bg-line" : "bg-gold"
                        }`}
                      />
                      <p
                        className={`text-xs uppercase tracking-[0.18em] ${
                          step.state === "upcoming" ? "text-parch" : "text-bone"
                        }`}
                      >
                        {step.label}
                        <span className="sr-only">
                          {step.state === "done"
                            ? ", done"
                            : step.state === "current"
                              ? ", where it is now"
                              : ", still to come"}
                        </span>
                      </p>
                      <p className="text-xs text-parch">
                        {step.at ? formatOrderDate(step.at) : step.state === "upcoming" ? "" : step.detail}
                      </p>
                    </li>
                  ))}
                </ol>
              )
            )}

            {state.order.trackingNumber && (
              <div className="border-t border-line pt-6">
                <p className="eyebrow">Courier tracking number</p>
                <p className="mt-2 font-display text-xl tracking-[0.08em] text-bone">
                  {state.order.trackingNumber}
                </p>
              </div>
            )}

            <div className="border-t border-line pt-6">
              <ul className="space-y-2 text-sm">
                {state.order.items.map((item) => (
                  <li key={item.name} className="flex justify-between gap-4">
                    <span className="text-parch">
                      {item.quantity} x {item.name}
                    </span>
                    <span className="text-bone">{formatZAR(item.lineCents)}</span>
                  </li>
                ))}
                <li className="flex justify-between gap-4 border-t border-line pt-3">
                  <span className="text-parch">
                    {state.order.status === "pending_payment" || state.order.cancelled ? "Total" : "Total paid"}
                  </span>
                  <span className="font-display text-lg text-gold">
                    {formatZAR(state.order.totalCents)}
                  </span>
                </li>
              </ul>
            </div>
          </article>
        )}
      </div>
    </div>
  );
};
