import Link from "next/link";
import { RESPONSIBILITY_MESSAGES } from "@/lib/compliance";

import { AccountButton } from "@/components/chrome/account-button";
import { BrandCrest } from "@/components/brand/brand-crest";
import { CartButton } from "@/components/chrome/cart-button";
import { MobileNav } from "@/components/chrome/mobile-nav";

export const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/book-the-bar", label: "Book the Bar" },
  { href: "/story", label: "Our Story" },
  { href: "/gallery", label: "Gallery" },
  { href: "/find-us", label: "Find Us" },
  { href: "/journal", label: "Journal" },
  { href: "/contact", label: "Contact" },
] as const;

export const Header = () => (
  <header className="sticky top-0 z-40 border-b border-line bg-ink/90 backdrop-blur-md">
    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">
      <Link
        href="/"
        className="flex items-center gap-3 text-bone transition-colors hover:text-gold-bright"
        aria-label="Verboten Spirits, home"
      >
        <BrandCrest className="h-8 w-8 text-gold" />
        {/* League Spartan is a variable font, so the wordmark can carry real
            weight without loading anything extra. Tracking eases in as the
            weight goes up, or bold caps set this wide start to look gappy. */}
        <span className="font-display text-lg font-bold tracking-[0.06em]">VERBOTEN</span>
      </Link>

      <nav aria-label="Main" className="hidden lg:block">
        <ul className="flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-parch transition-colors hover:text-bone"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex items-center gap-1">
        <AccountButton />
        <CartButton />
        <MobileNav />
      </div>
    </div>
    {/* The industry code (DF-SA 2026, 7.8.1) wants a responsibility message
        that stays on screen while people browse, not one waiting at the foot
        of the page. The header is the one thing that is always there. */}
    <p className="border-t border-line/60 px-6 py-1 text-center text-[0.625rem] uppercase tracking-[0.16em] text-parch">
      {/* One authorised message is enough (7.8.3), and on a phone the second
          would wrap the sticky header onto another line for good. */}
      {RESPONSIBILITY_MESSAGES.underAge}.
      <span className="hidden sm:inline"> {RESPONSIBILITY_MESSAGES.driving}</span>
    </p>
  </header>
);
