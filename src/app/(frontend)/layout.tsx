import type { Metadata } from "next";
import Script from "next/script";
import React from "react";

import { AnnouncementBar } from "@/components/chrome/announcement-bar";
import { CartDrawer } from "@/components/chrome/cart-drawer";
import { Footer } from "@/components/chrome/footer";
import { Header } from "@/components/chrome/header";
import { AgeGate } from "@/components/compliance/age-gate";
import { JsonLd } from "@/components/json-ld";
import { organizationLd } from "@/lib/seo";
import { CartProvider } from "@/lib/cart";
import { getBundleOffers, getSiteSettings } from "@/lib/data";
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
    "An independent South African brandy house in Pretoria. Premium brandy, born in South Africa and made for the world. Not for sale under 18.",
  // Links get shared in WhatsApp DMs more than anywhere else in SA; give
  // every page a real card. Page metadata overrides these per surface.
  openGraph: {
    siteName: "Verboten Spirits",
    type: "website",
    locale: "en_ZA",
    title: "Verboten Spirits | Premium South African Brandy",
    description:
      "An independent South African brandy house in Pretoria. Premium brandy, born in South Africa and made for the world.",
  },
  twitter: { card: "summary_large_image" },
};

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [settings, bundleOffers] = await Promise.all([getSiteSettings(), getBundleOffers()]);

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
          <CartDrawer
            flatRateCents={settings.shipping?.flatRateCents ?? 0}
            freeThresholdCents={settings.shipping?.freeThresholdCents ?? 0}
            offers={bundleOffers}
          />
          <AgeGate />
          <JsonLd data={organizationLd()} />
        </CartProvider>
        {/* GA4, armed only when NEXT_PUBLIC_GA_ID is set in the environment.
            Cloudflare Web Analytics needs no code: it is injected at the edge
            when toggled on in the Cloudflare dashboard (CSP already allows it). */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
