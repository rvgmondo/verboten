import type { Metadata } from "next";
import React from "react";

import "../globals.css";

/* Root layout for the public site. The (payload) route group renders its own
 * <html> root, so there is intentionally no top-level src/app/layout.tsx. */

export const metadata: Metadata = {
  title: "Verboten Spirits",
  description:
    "Independent South African beverage house. Premium brandy, made in Pretoria.",
};

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
