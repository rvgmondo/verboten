import { Archivo, Fraunces } from "next/font/google";

/**
 * Self-hosted at build time by next/font: zero layout shift, no runtime
 * requests to Google. Fraunces carries the label voice (high-contrast serif
 * with an optical size axis, so display sizes sharpen automatically);
 * Archivo is the quiet grotesque for body and UI.
 */
export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});

export const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});
