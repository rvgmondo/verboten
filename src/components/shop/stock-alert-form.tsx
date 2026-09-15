"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";

import { requestStockAlert, type StockAlertResult } from "@/app/actions/stock-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Submit = () => {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" disabled={pending} className="shrink-0">
      {pending ? "One moment" : "Tell me when it is back"}
    </Button>
  );
};

/**
 * Sold out, but not a dead end: leave an address, get one email when this
 * exact bottle returns.
 */
export const StockAlertForm = ({ productId, productName }: { productId: number; productName: string }) => {
  const [state, action] = React.useActionState<StockAlertResult | null, FormData>(requestStockAlert, null);
  // Controlled, so a rejected address is still there to correct.
  const [email, setEmail] = React.useState("");

  if (state?.ok) {
    return (
      <p role="status" className="border border-gold-dim/50 bg-coal p-4 text-sm leading-relaxed text-bone">
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} noValidate className="space-y-3">
      <input type="hidden" name="productId" value={productId} />
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`sa-company-${productId}`}>Company</label>
        <input id={`sa-company-${productId}`} name="company" tabIndex={-1} autoComplete="off" />
      </div>
      <Label htmlFor={`sa-email-${productId}`}>Email me when {productName} is back</Label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          id={`sa-email-${productId}`}
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={state && !state.ok ? true : undefined}
          aria-describedby={state && !state.ok ? `sa-error-${productId}` : `sa-note-${productId}`}
        />
        <Submit />
      </div>
      {state && !state.ok ? (
        <p id={`sa-error-${productId}`} role="alert" className="text-xs text-danger">
          {state.message}
        </p>
      ) : (
        <p id={`sa-note-${productId}`} className="text-xs text-parch">
          One email when it is back. It does not sign you up for anything else.
        </p>
      )}
    </form>
  );
};
