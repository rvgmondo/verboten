"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

/** Right-hand drawer on the dialog primitive; the cart lives here. */
export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export const SheetTitle = DialogPrimitive.Title;
export const SheetDescription = DialogPrimitive.Description;

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-ink/85 backdrop-blur-sm",
        "data-[state=open]:animate-fade-in",
      )}
    />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "inverse fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col",
        "border-l border-gold-dim/40 bg-coal shadow-panel",
        "transition-transform duration-300 ease-out-quiet",
        "data-[state=closed]:translate-x-full data-[state=open]:translate-x-0",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        // p-1 around a 16px icon is a 24px target. On a phone the drawer is
        // full bleed, so this is the only way out of it, and 24px is well
        // under the 44px WCAG 2.5.8 asks for.
        className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center text-parch transition-colors hover:text-bone"
        aria-label="Close"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
SheetContent.displayName = "SheetContent";
