/**
 * All prices are stored as integer cents (ZAR) to avoid floating-point drift.
 * R450 = 45000. Formatting follows South African convention: R450 or R450,50.
 */

export const ZAR = "ZAR";

export const formatZAR = (cents: number): string => {
  const rand = Math.floor(Math.abs(cents) / 100);
  const rem = Math.abs(cents) % 100;
  const sign = cents < 0 ? "-" : "";
  const grouped = rand.toLocaleString("en-ZA").replace(/,/g, " ");
  return rem === 0
    ? `${sign}R${grouped}`
    : `${sign}R${grouped},${String(rem).padStart(2, "0")}`;
};

/** Decimal string for schema.org / PayFast (e.g. "450.00"). */
export const centsToDecimal = (cents: number): string => (cents / 100).toFixed(2);
