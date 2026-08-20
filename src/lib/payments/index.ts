import { payfastProvider } from "./payfast";
import type { PaymentProvider } from "./types";

/**
 * Provider registry. To add Yoco or Peach Payments: implement
 * PaymentProvider, add it here, and select via PAYMENT_PROVIDER env.
 */
const providers: Record<string, PaymentProvider> = {
  payfast: payfastProvider,
};

export const getPaymentProvider = (): PaymentProvider => {
  const name = process.env.PAYMENT_PROVIDER || "payfast";
  const provider = providers[name];
  if (!provider) throw new Error(`Unknown payment provider: ${name}`);
  return provider;
};

export type { PaymentProvider, PaymentRedirect, VerifiedPayment } from "./types";
