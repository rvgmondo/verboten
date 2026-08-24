"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { Crest } from "@/components/brand/crest";
import { Motto } from "@/components/brand/motto";

const LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/story", label: "Our Story" },
  { href: "/gallery", label: "Gallery" },
  { href: "/find-us", label: "Find Us" },
  { href: "/journal", label: "Journal" },
  { href: "/contact", label: "Contact" },
];

export const MobileNav = () => {
  const [open, setOpen] = React.useState(false);
  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          className="p-2 text-parch transition-colors hover:text-bone lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Content
          className="inverse fixed inset-0 z-50 flex flex-col bg-ink data-[state=open]:animate-fade-in"
          aria-describedby={undefined}
        >
          <DialogPrimitive.Title className="sr-only">Menu</DialogPrimitive.Title>
          <div className="flex h-16 items-center justify-between border-b border-line px-6">
            <Crest className="h-8 w-8 text-gold" />
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                className="p-2 text-parch transition-colors hover:text-bone"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </DialogPrimitive.Close>
          </div>
          <nav aria-label="Main" className="flex flex-1 flex-col justify-center px-8">
            <ul className="space-y-6">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="font-display text-3xl text-bone transition-colors hover:text-gold-bright"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="border-t border-line p-8">
            <Motto />
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
