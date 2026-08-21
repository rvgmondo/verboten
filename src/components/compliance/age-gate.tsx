"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";

const COOKIE = "vb_age_ok";
const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * The 18+ gate, first compliance layer (checkout DOB is the second).
 *
 * Deliberately client-only and cookie-checked after hydration: the server
 * HTML never contains the gate, so pages stay statically rendered (Core Web
 * Vitals) and crawlers index content unobstructed. Radix supplies the focus
 * trap and dialog semantics; dismissal is only possible by answering.
 * The consent cookie means repeat visitors are never nagged.
 */
export const AgeGate = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    // The refusal page itself stays reachable, or under-18 visitors loop.
    if (pathname === "/access-restricted") {
      setOpen(false);
      return;
    }
    const confirmed = document.cookie
      .split(";")
      .some((c) => c.trim().startsWith(`${COOKIE}=`));
    if (!confirmed) setOpen(true);
  }, [pathname]);

  const confirm = () => {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${COOKIE}=1; Max-Age=${ONE_YEAR}; Path=/; SameSite=Lax${secure}`;
    setOpen(false);
  };

  const refuse = () => {
    setOpen(false);
    router.push("/access-restricted");
  };

  if (!open) return null;

  return (
    <DialogPrimitive.Root open={open}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-ink/95 backdrop-blur-md data-[state=open]:animate-fade-in" />
        <DialogPrimitive.Content
          className="inverse fixed left-1/2 top-1/2 z-[70] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 border border-gold-dim/50 bg-coal p-10 text-center shadow-panel data-[state=open]:animate-fade-up"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <Image
            src="/brand/crest.png"
            alt=""
            width={56}
            height={56}
            aria-hidden="true"
            className="mx-auto h-14 w-14 object-contain"
          />
          <DialogPrimitive.Title className="mt-6 font-display text-3xl tracking-tight text-bone">
            Are you 18 or older?
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-3 text-sm leading-relaxed text-parch">
            Verboten makes and sells alcohol. South African law and our own
            standards require you to be 18 or older to enter.
          </DialogPrimitive.Description>
          <div className="mt-8 space-y-3">
            <Button onClick={confirm} className="w-full" autoFocus>
              I am 18 or older
            </Button>
            <Button onClick={refuse} variant="outline" className="w-full">
              I am under 18
            </Button>
          </div>
          <p className="mt-6 text-[0.6875rem] leading-relaxed text-parch/80">
            Drink responsibly. Not for sale to persons under 18.
          </p>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
