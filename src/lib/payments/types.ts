import type { Order } from "@/payload-types";

/**
 * Gateway-agnostic payment contract. PayFast implements it today; Yoco or
 * Peach Payments can be added without touching checkout code: implement this
 * interface and register it in src/lib/payments/index.ts.
 */

export type PaymentRedirect = {
  /** Where the buyer's browser must POST to start payment. */
  action: string;
  /** Hidden form fields for that POST, already signed. */
  fields: Record<string, string>;
};

export type VerifiedPayment = {
  /** Our order number (m_payment_id). */
  orderNumber: string;
  /** Gateway's payment id. */
  reference: string;
  /** Gross amount in cents, as confirmed by the gateway. */
  amountCents: number;
  status: "complete" | "failed" | "pending";
  /** Full verified payload, stored on the order for reconciliation. */
  raw: Record<string, string>;
};

export interface PaymentProvider {
  readonly name: string;
  /** Build the signed redirect for an order awaiting payment. */
  createRedirect(order: Order, urls: { return: string; cancel: string; notify: string }): PaymentRedirect;
  /**
   * Verify a webhook notification end to end (signature, server-to-server
   * validation, amount). Returns null when verification fails; callers must
   * treat null as an attack, not an error.
   */
  verifyWebhook(rawBody: string): Promise<VerifiedPayment | null>;
}
