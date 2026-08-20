import { Lato, League_Spartan } from "next/font/google";

/**
 * Self-hosted at build time by next/font: zero layout shift, no runtime
 * requests to Google. League Spartan carries the headline voice (geometric,
 * confident, built for tracked-out caps); Lato is the quiet humanist sans
 * for body and UI.
 */
export const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  variable: "--font-league-spartan",
  display: "swap",
});

export const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-lato",
  display: "swap",
});
