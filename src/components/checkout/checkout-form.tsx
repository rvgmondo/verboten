"use client";

import Link from "next/link";
import * as React from "react";
import { useFormStatus } from "react-dom";

import { createCheckout, previewDiscount, type CheckoutResult } from "@/app/actions/checkout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/lib/cart";
import { formatZAR } from "@/lib/money";

const PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape",
];

const Submit = ({ totalCents }: { totalCents: number }) => {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? "Preparing payment" : `Pay ${formatZAR(totalCents)} with PayFast`}
    </Button>
  );
};

const Field = ({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <Label htmlFor={`co-${name}`}>{label}</Label>
    {children}
    {error && (
      <p id={`co-${name}-error`} className="text-xs text-danger">
        {error}
      </p>
    )}
  </div>
);

/** Auto-submits the signed PayFast redirect the moment checkout succeeds. */
const PayfastRedirect = ({
  redirect,
}: {
  redirect: { action: string; fields: Record<string, string> };
}) => {
  const formRef = React.useRef<HTMLFormElement>(null);
  React.useEffect(() => {
    formRef.current?.submit();
  }, []);
  return (
    <form ref={formRef} action={redirect.action} method="post" className="hidden">
      {Object.entries(redirect.fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
    </form>
  );
};

export const CheckoutForm = ({
  flatRateCents,
  freeThresholdCents,
}: {
  flatRateCents: number;
  freeThresholdCents: number;
}) => {
  const { items, subtotalCents } = useCart();
  const [state, action] = React.useActionState<CheckoutResult | null, FormData>(
    createCheckout,
    null,
  );

  const [discountInput, setDiscountInput] = React.useState("");
  const [discount, setDiscount] = React.useState<{ cents: number; message: string } | null>(null);
  const [applying, setApplying] = React.useState(false);

  const discountCents = discount?.cents ?? 0;
  const shippingCents =
    freeThresholdCents > 0 && subtotalCents - discountCents >= freeThresholdCents
      ? 0
      : flatRateCents;
  const totalCents = subtotalCents - discountCents + shippingCents;

  const errors = state && !state.ok ? state.fieldErrors : undefined;

  const applyDiscount = async () => {
    if (!discountInput.trim()) return;
    setApplying(true);
    const res = await previewDiscount(discountInput, subtotalCents);
    setDiscount(res.ok ? { cents: res.discountCents, message: res.message } : null);
    if (!res.ok) setDiscount({ cents: 0, message: res.message });
    setApplying(false);
  };

  if (items.length === 0 && !(state && state.ok)) {
    return (
      <div className="border border-line bg-coal p-10 text-center">
        <p className="text-sm text-parch">Your cart is empty.</p>
        <Button variant="outline" className="mt-6" asChild>
          <Link href="/shop">Browse the shop</Link>
        </Button>
      </div>
    );
  }

  if (state && state.ok) {
    return (
      <div className="border border-gold-dim/40 bg-coal p-10 text-center" role="status">
        <p className="font-display text-2xl text-bone">Taking you to PayFast</p>
        <p className="mt-2 text-sm text-parch">
          Order {state.orderNumber} is reserved. If nothing happens in a few
          seconds, use the button below.
        </p>
        <PayfastRedirect redirect={state.redirect} />
        <form action={state.redirect.action} method="post" className="mt-6">
          {Object.entries(state.redirect.fields).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
          <Button type="submit">Continue to payment</Button>
        </form>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
      <input type="hidden" name="items" value={JSON.stringify(items.map((i) => ({ productId: i.productId, quantity: i.quantity })))} />

      <div className="space-y-10">
        <fieldset className="space-y-6">
          <legend className="eyebrow mb-2">Your details</legend>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Full name" name="name" error={errors?.name}>
              <Input
                id="co-name"
                name="name"
                required
                autoComplete="name"
                aria-invalid={errors?.name ? true : undefined}
              />
            </Field>
            <Field label="Email" name="email" error={errors?.email}>
              <Input
                id="co-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                aria-invalid={errors?.email ? true : undefined}
              />
            </Field>
            <Field label="Phone (for the courier)" name="phone" error={errors?.phone}>
              <Input id="co-phone" name="phone" type="tel" autoComplete="tel" />
            </Field>
            <Field label="Date of birth" name="dateOfBirth" error={errors?.dateOfBirth}>
              <Input
                id="co-dateOfBirth"
                name="dateOfBirth"
                type="date"
                required
                aria-invalid={errors?.dateOfBirth ? true : undefined}
                aria-describedby="co-dob-why"
              />
              <p id="co-dob-why" className="text-[0.6875rem] text-parch/70">
                Alcohol law: we confirm you are 18 or older.
              </p>
            </Field>
          </div>
        </fieldset>

        <fieldset className="space-y-6">
          <legend className="eyebrow mb-2">Delivery address</legend>
          <Field label="Street address" name="line1" error={errors?.line1}>
            <Input
              id="co-line1"
              name="line1"
              required
              autoComplete="address-line1"
              aria-invalid={errors?.line1 ? true : undefined}
            />
          </Field>
          <Field label="Unit, complex or building (optional)" name="line2">
            <Input id="co-line2" name="line2" autoComplete="address-line2" />
          </Field>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Suburb" name="suburb">
              <Input id="co-suburb" name="suburb" autoComplete="address-level3" />
            </Field>
            <Field label="City" name="city" error={errors?.city}>
              <Input
                id="co-city"
                name="city"
                required
                autoComplete="address-level2"
                aria-invalid={errors?.city ? true : undefined}
              />
            </Field>
            <Field label="Province" name="province" error={errors?.province}>
              <select
                id="co-province"
                name="province"
                required
                defaultValue="Gauteng"
                className="h-11 w-full rounded-xs border border-line bg-coal px-3 text-sm text-bone transition-colors hover:border-gold-dim/60 focus:border-gold focus:outline-none"
              >
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Postal code" name="postalCode" error={errors?.postalCode}>
              <Input
                id="co-postalCode"
                name="postalCode"
                required
                autoComplete="postal-code"
                aria-invalid={errors?.postalCode ? true : undefined}
              />
            </Field>
          </div>
          <Field label="Delivery note (optional)" name="customerNote">
            <Textarea id="co-customerNote" name="customerNote" className="min-h-20" />
          </Field>
        </fieldset>

        {/* Honeypot: hidden from humans and screen readers alike. */}
        <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden">
          <label htmlFor="co-fax">Fax</label>
          <input id="co-fax" name="fax" type="text" tabIndex={-1} autoComplete="off" />
        </div>
      </div>

      <aside className="h-fit space-y-6 border border-line bg-coal p-6 lg:sticky lg:top-24">
        <h2 className="eyebrow">Your order</h2>
        <ul className="space-y-3 border-b border-line pb-5">
          {items.map((item) => (
            <li key={item.productId} className="flex justify-between gap-4 text-sm">
              <span className="text-parch">
                {item.quantity} x {item.name}
              </span>
              <span className="text-bone">{formatZAR(item.priceCents * item.quantity)}</span>
            </li>
          ))}
        </ul>

        <div className="space-y-2">
          <Label htmlFor="co-discountCode">Discount code</Label>
          <div className="flex gap-2">
            <Input
              id="co-discountCode"
              name="discountCode"
              value={discountInput}
              onChange={(e) => setDiscountInput(e.target.value)}
              aria-invalid={errors?.discountCode ? true : undefined}
              className="uppercase"
            />
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={applyDiscount}
              disabled={applying}
            >
              {applying ? "Checking" : "Apply"}
            </Button>
          </div>
          {discount && (
            <p
              role="status"
              className={`text-xs ${discount.cents > 0 ? "text-gold" : "text-danger"}`}
            >
              {discount.message}
            </p>
          )}
          {errors?.discountCode && <p className="text-xs text-danger">{errors.discountCode}</p>}
        </div>

        <dl className="space-y-2 border-t border-line pt-5 text-sm">
          <div className="flex justify-between">
            <dt className="text-parch">Subtotal</dt>
            <dd className="text-bone">{formatZAR(subtotalCents)}</dd>
          </div>
          {discountCents > 0 && (
            <div className="flex justify-between">
              <dt className="text-parch">Discount</dt>
              <dd className="text-gold">-{formatZAR(discountCents)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-parch">Delivery</dt>
            <dd className="text-bone">{shippingCents === 0 ? "Free" : formatZAR(shippingCents)}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-3">
            <dt className="text-bone">Total</dt>
            <dd className="font-display text-xl text-gold">{formatZAR(totalCents)}</dd>
          </div>
        </dl>

        {state && !state.ok && (
          <p role="alert" className="text-sm text-danger">
            {state.message}
          </p>
        )}

        <Submit totalCents={totalCents} />
        <p className="text-[0.6875rem] leading-relaxed text-parch/70">
          Drink responsibly. Not for sale to persons under 18. Someone 18 or
          older must receive the delivery.
        </p>
      </aside>
    </form>
  );
};
