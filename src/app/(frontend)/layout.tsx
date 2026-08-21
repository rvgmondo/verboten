import type { Metadata } from "next";
import React from "react";

import { AnnouncementBar } from "@/components/chrome/announcement-bar";
import { CartDrawer } from "@/components/chrome/cart-drawer";
import { Footer } from "@/components/chrome/footer";
import { Header } from "@/components/chrome/header";
import { AgeGate } from "@/components/compliance/age-gate";
import { JsonLd } from "@/components/json-ld";
import { organizationLd } from "@/lib/seo";
import { CartProvider } from "@/lib/cart";
import { getSiteSettings } from "@/lib/data";
import { lato, leagueSpartan } from "@/lib/fonts";

import "../globals.css";

/* Root layout for the public site. The (payload) route group renders its own
 * <html> root, so there is intentionally no top-level src/app/layout.tsx. */

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SERVER_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://verboten.co.za"
        : "http://localhost:3001"),
  ),
  title: {
    default: "Verboten Spirits | Premium South African Brandy",
    template: "%s | Verboten Spirits",
  },
  description:
    "An independent South African brandy house in Pretoria. Premium brandy in limited editions, born in South Africa and made for the world. Not for sale under 18.",
  // Links get shared in WhatsApp DMs more than anywhere else in SA; give
  // every page a real card. Page metadata overrides these per surface.
  openGraph: {
    siteName: "Verboten Spirits",
    type: "website",
    locale: "en_ZA",
    title: "Verboten Spirits | Premium South African Brandy",
    description:
      "An independent South African brandy house in Pretoria. Premium brandy in limited editions, born in South Africa and made for the world.",
  },
  twitter: { card: "summary_large_image" },
};

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <html lang="en-ZA" className={`${leagueSpartan.variable} ${lato.variable}`}>
      <body className="flex min-h-screen flex-col">
        <CartProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-goldfill focus:px-4 focus:py-2 focus:text-onaccent"
          >
            Skip to content
          </a>
          {settings.announcement?.enabled && settings.announcement.text && (
            <AnnouncementBar text={settings.announcement.text} />
          )}
          <Header />
          <div id="main" className="flex-1">
            {children}
          </div>
          <Footer />
          <CartDrawer />
          <AgeGate />
          <JsonLd data={organizationLd()} />
        </CartProvider>
      </body>
    </html>
  );
}
