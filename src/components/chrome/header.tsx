import Link from "next/link";

import { BrandCrest } from "@/components/brand/brand-crest";
import { CartButton } from "@/components/chrome/cart-button";
import { MobileNav } from "@/components/chrome/mobile-nav";

export const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/story", label: "Our Story" },
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
        <span className="font-display text-lg tracking-[0.08em]">VERBOTEN</span>
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

      <div className="flex items-center gap-2">
        <CartButton />
        <MobileNav />
      </div>
    </div>
  </header>
);
