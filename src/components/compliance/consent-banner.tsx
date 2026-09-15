"use client";

import Link from "next/link";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { AGE_OK_EVENT, hasPassedAgeGate } from "@/lib/compliance";
import {
  CONSENT_OPEN_EVENT,
  type Consent,
  readConsent,
  writeConsent,
} from "@/lib/consent";

/**
 * The cookie question, asked once and asked plainly.
 *
 * It waits until the age gate has been answered, so nobody meets two dialogs
 * stacked on each other, and it never blocks the page: the shop works fully
 * whichever button is pressed. "Only essentials" sits beside "Accept all" at
 * the same size, because a refusal made hard to find is not consent.
 *
 * It only asks on its own when there is something to ask about, which is when
 * an analytics or Pixel ID is set in Site Settings. The footer's "Cookie
 * choices" button opens it at any time either way, because the privacy policy
 * promises that button on every page.
 */
export const ConsentBanner = ({
  hasMarketing,
  autoOpen,
}: {
  hasMarketing: boolean;
  autoOpen: boolean;
}) => {
  const [open, setOpen] = React.useState(false);
  const [choosing, setChoosing] = React.useState(false);
  const [draft, setDraft] = React.useState<Consent>({ analytics: false, marketing: false });
  const sectionRef = React.useRef<HTMLElement>(null);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const firstChoiceRef = React.useRef<HTMLInputElement>(null);
  /** Where focus was when someone asked for the choices, to hand it back. */
  const returnFocus = React.useRef<HTMLElement | null>(null);
  const focusTarget = React.useRef<"heading" | "choice" | null>(null);

  React.useEffect(() => {
    const maybeOpen = () => {
      if (autoOpen && hasPassedAgeGate() && !readConsent()) {
        // Arriving straight from the age gate, a keyboard user would otherwise
        // be left at the top of the page with the banner last in the tab order.
        focusTarget.current = "heading";
        setOpen(true);
      }
    };
    maybeOpen();
    const reopen = () => {
      returnFocus.current = document.activeElement as HTMLElement | null;
      setDraft(readConsent() ?? { analytics: false, marketing: false });
      setChoosing(true);
      focusTarget.current = "heading";
      setOpen(true);
    };
    window.addEventListener(AGE_OK_EVENT, maybeOpen);
    window.addEventListener(CONSENT_OPEN_EVENT, reopen);
    return () => {
      window.removeEventListener(AGE_OK_EVENT, maybeOpen);
      window.removeEventListener(CONSENT_OPEN_EVENT, reopen);
    };
  }, [autoOpen]);

  // Focus moves after render, because until then the element is not there.
  React.useEffect(() => {
    if (!open || !focusTarget.current) return;
    const target = focusTarget.current;
    focusTarget.current = null;
    if (target === "choice") firstChoiceRef.current?.focus();
    else headingRef.current?.focus();
  }, [open, choosing]);

  // While the banner covers the bottom of the screen, anything the keyboard
  // focuses is scrolled clear of it rather than hidden underneath (WCAG 2.4.11).
  React.useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const update = () => {
      root.style.scrollPaddingBottom = `${sectionRef.current?.offsetHeight ?? 0}px`;
    };
    update();
    const observer = new ResizeObserver(update);
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      observer.disconnect();
      root.style.scrollPaddingBottom = "";
    };
  }, [open]);

  const decide = (c: Consent) => {
    writeConsent(c);
    setOpen(false);
    setChoosing(false);
    const back = returnFocus.current;
    returnFocus.current = null;
    if (back && document.contains(back)) back.focus();
  };

  if (!open) return null;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="consent-title"
      className="inverse fixed inset-x-0 bottom-0 z-50 max-h-[calc(100dvh-1rem)] overflow-y-auto border-t border-gold-dim/40 bg-coal/95 backdrop-blur-md"
    >
      <div className="mx-auto max-w-6xl px-6 py-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <h2
              id="consent-title"
              ref={headingRef}
              tabIndex={-1}
              className="font-display text-lg text-bone outline-none"
            >
              Cookies, briefly
            </h2>
            <p className="text-sm leading-relaxed text-parch">
              The essentials keep your cart and your age check working, and they are always on.
              With your say-so, we also count visits to see what is working
              {hasMarketing
                ? ", and let Meta and Google show our ads to people who have already been here"
                : ""}
              . Change your mind any time from the footer.{" "}
              <Link href="/privacy-policy" className="text-bone underline underline-offset-4">
                How we use it
              </Link>
            </p>
          </div>

          {!choosing && (
            <div className="flex flex-wrap gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => decide({ analytics: false, marketing: false })}
              >
                Only essentials
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  focusTarget.current = "choice";
                  setChoosing(true);
                }}
              >
                Choose
              </Button>
              <Button size="sm" onClick={() => decide({ analytics: true, marketing: hasMarketing })}>
                Accept all
              </Button>
            </div>
          )}
        </div>

        {choosing && (
          <div className="mt-5 grid gap-4 border-t border-line pt-5 sm:grid-cols-[1fr_1fr_auto] sm:items-start">
            <label className="flex cursor-pointer gap-3 text-sm">
              <input
                ref={firstChoiceRef}
                type="checkbox"
                checked={draft.analytics}
                onChange={(e) => setDraft((d) => ({ ...d, analytics: e.target.checked }))}
                className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-gold)]"
              />
              <span>
                <span className="block text-bone">Analytics</span>
                <span className="block text-parch">
                  Google Analytics counts visits and what people look at. No ads.
                </span>
              </span>
            </label>
            {hasMarketing ? (
              <label className="flex cursor-pointer gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={draft.marketing}
                  onChange={(e) => setDraft((d) => ({ ...d, marketing: e.target.checked }))}
                  className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-gold)]"
                />
                <span>
                  <span className="block text-bone">Advertising</span>
                  <span className="block text-parch">
                    Meta and Google learn that you visited, so our ads can find you again and a
                    sale can be credited to the ad that led to it.
                  </span>
                </span>
              </label>
            ) : (
              <span />
            )}
            <Button size="sm" onClick={() => decide(draft)}>
              Save choices
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

/** The footer's way back in. A button, because it opens something rather than going somewhere. */
export const ConsentLink = ({ className }: { className?: string }) => (
  <button
    type="button"
    onClick={() => window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))}
    className={className}
  >
    Cookie choices
  </button>
);
