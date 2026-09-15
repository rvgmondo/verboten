import type { Order } from "@/payload-types";

/**
 * How an order's status reads to the customer, in one place.
 *
 * The account page and the order tracker both show it, and two copies of a
 * label list drift the first time someone renames a status.
 */
export const STATUS_LABELS: Record<Order["status"], string> = {
  pending_payment: "Awaiting payment",
  paid: "Paid",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

/** The happy path, in order. Cancelled and refunded sit outside it. */
export const JOURNEY: Array<{ status: Order["status"]; label: string; detail: string }> = [
  { status: "paid", label: "Paid", detail: "Payment confirmed." },
  { status: "packed", label: "Packed", detail: "Boxed and waiting for the courier." },
  { status: "shipped", label: "Shipped", detail: "With the courier." },
  { status: "delivered", label: "Delivered", detail: "Handed over. Pour it properly." },
];

export type JourneyStep = {
  status: Order["status"];
  label: string;
  detail: string;
  state: "done" | "current" | "upcoming";
  /** When this step happened, from the order's own audit trail. */
  at: string | null;
};

/**
 * The journey with each step marked done, current or still to come, and dated
 * from the status log where a date exists.
 *
 * Built from the log rather than guessed from the current status alone, so an
 * order that was marked shipped without ever being marked packed still shows
 * packing as done rather than as a gap, and every date shown is a real one.
 */
export const journeyFor = (order: Pick<Order, "status" | "statusLog">): JourneyStep[] => {
  const reachedIndex = JOURNEY.findIndex((s) => s.status === order.status);
  const log = order.statusLog ?? [];
  return JOURNEY.map((step, i) => {
    const entry = [...log].reverse().find((e) => e.status === step.status);
    let state: JourneyStep["state"] = "upcoming";
    if (reachedIndex >= 0) {
      if (i < reachedIndex) state = "done";
      else if (i === reachedIndex) state = order.status === "delivered" ? "done" : "current";
    }
    return { ...step, state, at: entry?.at ?? null };
  });
};

export const formatOrderDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
