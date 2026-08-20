import Link from "next/link";

import { Crest } from "@/components/brand/crest";
import { Motto } from "@/components/brand/motto";
import { NewsletterForm } from "@/components/chrome/newsletter-form";
import { getSiteSettings } from "@/lib/data";

const SHOP_LINKS = [
  { href: "/shop", label: "The shop" },
  { href: "/serves", label: "Serves" },
  { href: "/find-us", label: "Where to find us" },
  { href: "/account", label: "Your orders" },
];

const HOUSE_LINKS = [
  { href: "/story", label: "Our story" },
  { href: "/journal", label: "Journal" },
  { href: "/contact", label: "Contact" },
];

const LEGAL_LINKS = [
  { href: "/shipping-returns", label: "Shipping & returns" },
  { href: "/terms-conditions", label: "Terms" },
  { href: "/privacy-policy", label: "Privacy" },
  { href: "/responsible-enjoyment", label: "Responsible enjoyment" },
];

export const Footer = async () => {
  const settings = await getSiteSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-coal">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Crest className="h-10 w-10 text-gold" />
              <span className="font-display text-lg tracking-[0.08em] text-bone">VERBOTEN</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-parch">
              An independent South African beverage house. Made in Pretoria,
              poured wherever people know what they are drinking.
            </p>
            <Motto />
          </div>

          <nav aria-label="Shop">
            <p className="eyebrow mb-4">Shop</p>
            <ul className="space-y-3">
              {SHOP_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-parch transition-colors hover:text-bone">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="The house">
            <p className="eyebrow mb-4">The house</p>
            <ul className="space-y-3">
              {HOUSE_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-parch transition-colors hover:text-bone">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="eyebrow mb-4 mt-8">Find us</p>
            <ul className="space-y-3">
              {settings.socials?.instagram && (
                <li>
                  <a
                    href={settings.socials.instagram}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="text-sm text-parch transition-colors hover:text-bone"
                  >
                    Instagram
                  </a>
                </li>
              )}
              {settings.socials?.facebook && (
                <li>
                  <a
                    href={settings.socials.facebook}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="text-sm text-parch transition-colors hover:text-bone"
                  >
                    Facebook
                  </a>
                </li>
              )}
            </ul>
          </nav>

          <div>
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-14 space-y-4 border-t border-line pt-8">
          <nav aria-label="Legal">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-xs text-parch/80 transition-colors hover:text-bone"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="text-xs leading-relaxed text-parch/70">
            Drink responsibly. Not for sale to persons under 18.
          </p>
          <p className="text-xs text-parch/50">
            © {year} Verboten Pty Ltd. {settings.contact?.address ?? "Silverton, Pretoria"}.
          </p>
        </div>
      </div>
    </footer>
  );
};
