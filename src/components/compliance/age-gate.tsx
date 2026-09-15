"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import Image from "next/image";
import { usePathname } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DRINKING_AGE,
  RESPONSIBILITY_LINE,
  UNDER_AGE_DESTINATION,
  ageFrom,
} from "@/lib/compliance";

const COOKIE = "vb_age_ok";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

/**
 * The age gate, first compliance layer (checkout date of birth is the second).
 *
 * The industry code (DF-SA 2026, 7.8.4) asks for more than a yes button: the
 * visitor enters a full date of birth and a country, and anyone under that
 * country's drinking age is sent to Aware.org rather than to a page of ours.
 * The date is checked here and thrown away. Nothing but a "passed" flag is
 * stored, so the gate collects no personal information at all.
 *
 * The flag lasts the browser session, as the code describes, unless the
 * visitor asks to be remembered on this device.
 *
 * Deliberately client-only and cookie-checked after hydration: the server
 * HTML never contains the gate, so pages stay statically rendered and
 * crawlers read the content unobstructed. Radix supplies the focus trap and
 * dialog semantics; dismissal is only possible by answering.
 */
export const AgeGate = () => {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [day, setDay] = React.useState("");
  const [month, setMonth] = React.useState("");
  const [year, setYear] = React.useState("");
  const [country, setCountry] = React.useState("ZA");
  const [remember, setRemember] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const monthRef = React.useRef<HTMLInputElement>(null);
  const yearRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    // The refusal page itself stays reachable, or a turned away visitor loops.
    if (pathname === "/access-restricted") {
      setOpen(false);
      return;
    }
    const confirmed = document.cookie
      .split(";")
      .some((c) => c.trim().startsWith(`${COOKIE}=`));
    if (!confirmed) setOpen(true);
  }, [pathname]);

  const digits = (value: string, max: number) => value.replace(/\D/g, "").slice(0, max);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const age = ageFrom(Number(day), Number(month), Number(year));
    if (age === null) {
      setError("That date does not look right. Use the numbers, like 07 03 1990.");
      return;
    }
    const required = (DRINKING_AGE[country] ?? DRINKING_AGE.OTHER).age;
    if (age < required) {
      window.location.assign(UNDER_AGE_DESTINATION);
      return;
    }
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    const lifetime = remember ? `; Max-Age=${THIRTY_DAYS}` : "";
    document.cookie = `${COOKIE}=1${lifetime}; Path=/; SameSite=Lax${secure}`;
    setOpen(false);
    window.dispatchEvent(new Event("vb:age-ok"));
  };

  if (!open) return null;

  return (
    <DialogPrimitive.Root open={open}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-ink/95 backdrop-blur-md data-[state=open]:animate-fade-in" />
        <DialogPrimitive.Content
          className="inverse fixed left-1/2 top-1/2 z-[70] max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto border border-gold-dim/50 bg-coal p-6 text-center shadow-panel data-[state=open]:animate-fade-up sm:p-10"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          onOpenAutoFocus={(e) => {
            // Straight into the first field, not onto the crest.
            e.preventDefault();
            document.getElementById("age-day")?.focus();
          }}
        >
          <Image
            src="/brand/crest.png"
            alt=""
            width={56}
            height={56}
            aria-hidden="true"
            className="mx-auto h-14 w-14 object-contain"
          />
          <DialogPrimitive.Title className="mt-6 font-display text-3xl leading-[1.1] tracking-tight text-bone">
            Some rules are meant to be questioned. This is not one of them.
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-4 text-sm leading-relaxed text-parch">
            Verboten makes and sells alcohol. Enter your date of birth to come in.
          </DialogPrimitive.Description>

          <form onSubmit={submit} noValidate className="mt-8 space-y-5 text-left">
            <fieldset>
              <legend className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-parch">
                Date of birth
              </legend>
              <div className="mt-2 grid grid-cols-[1fr_1fr_1.5fr] gap-3">
                <div>
                  <label htmlFor="age-day" className="sr-only">
                    Day
                  </label>
                  <Input
                    id="age-day"
                    inputMode="numeric"
                    autoComplete="bday-day"
                    placeholder="DD"
                    value={day}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? "age-error" : undefined}
                    onChange={(e) => {
                      const v = digits(e.target.value, 2);
                      setDay(v);
                      setError(null);
                      if (v.length === 2) monthRef.current?.focus();
                    }}
                    // Arriving in a filled box selects it, so jumping in from
                    // the previous field overwrites rather than getting stuck.
                    onFocus={(e) => e.currentTarget.select()}
                    className="text-center"
                  />
                </div>
                <div>
                  <label htmlFor="age-month" className="sr-only">
                    Month
                  </label>
                  <Input
                    id="age-month"
                    ref={monthRef}
                    inputMode="numeric"
                    autoComplete="bday-month"
                    placeholder="MM"
                    value={month}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? "age-error" : undefined}
                    onChange={(e) => {
                      const v = digits(e.target.value, 2);
                      setMonth(v);
                      setError(null);
                      if (v.length === 2) yearRef.current?.focus();
                    }}
                    // Arriving in a filled box selects it, so jumping in from
                    // the previous field overwrites rather than getting stuck.
                    onFocus={(e) => e.currentTarget.select()}
                    className="text-center"
                  />
                </div>
                <div>
                  <label htmlFor="age-year" className="sr-only">
                    Year
                  </label>
                  <Input
                    id="age-year"
                    ref={yearRef}
                    inputMode="numeric"
                    autoComplete="bday-year"
                    placeholder="YYYY"
                    value={year}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? "age-error" : undefined}
                    onChange={(e) => {
                      setYear(digits(e.target.value, 4));
                      setError(null);
                    }}
                    // Arriving in a filled box selects it, so jumping in from
                    // the previous field overwrites rather than getting stuck.
                    onFocus={(e) => e.currentTarget.select()}
                    className="text-center"
                  />
                </div>
              </div>
              {error && (
                <p id="age-error" role="alert" className="mt-2 text-xs text-danger">
                  {error}
                </p>
              )}
            </fieldset>

            <div>
              <label
                htmlFor="age-country"
                className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-parch"
              >
                Country
              </label>
              <select
                id="age-country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                autoComplete="country"
                className="mt-2 h-11 w-full rounded-xs border border-field bg-coal px-4 text-base text-bone transition-colors duration-200 hover:border-gold-dim/60 focus:border-gold sm:text-sm"
              >
                {Object.entries(DRINKING_AGE).map(([code, c]) => (
                  <option key={code} value={code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex cursor-pointer items-center gap-3 text-sm text-parch">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 accent-[var(--color-gold)]"
              />
              Remember me on this device for 30 days
            </label>

            <Button type="submit" className="w-full">
              Enter
            </Button>
          </form>

          <p className="mt-6 text-[0.6875rem] leading-relaxed text-parch">{RESPONSIBILITY_LINE}</p>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
