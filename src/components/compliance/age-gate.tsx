"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import Image from "next/image";
import { usePathname } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AGE_COOKIE,
  AGE_OK_EVENT,
  DRINKING_AGE,
  RESPONSIBILITY_LINE,
  UNDER_AGE_DESTINATION,
  ageFrom,
  hasPassedAgeGate,
} from "@/lib/compliance";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

type Field = "day" | "month" | "year";

/**
 * Which part of the date is wrong, in words that say how to fix it. One
 * message for the whole date left people guessing which box to change, and
 * marked all three invalid when only one was.
 */
const checkDate = (day: string, month: string, year: string): { field: Field; message: string } | null => {
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  const thisYear = new Date().getFullYear();
  if (!day || d < 1 || d > 31) return { field: "day", message: "Enter the day, from 1 to 31." };
  if (!month || m < 1 || m > 12) return { field: "month", message: "Enter the month, from 1 to 12." };
  if (year.length !== 4 || y < 1900 || y > thisYear) {
    return { field: "year", message: "Enter the year in full, like 1990." };
  }
  if (ageFrom(d, m, y) === null) {
    return { field: "day", message: "That day does not exist in that month." };
  }
  return null;
};

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
  const [error, setError] = React.useState<{ field: Field; message: string } | null>(null);
  const refs = {
    day: React.useRef<HTMLInputElement>(null),
    month: React.useRef<HTMLInputElement>(null),
    year: React.useRef<HTMLInputElement>(null),
  };

  React.useEffect(() => {
    // The refusal page itself stays reachable, or a turned away visitor loops.
    if (pathname === "/access-restricted") {
      setOpen(false);
      return;
    }
    if (!hasPassedAgeGate()) setOpen(true);
  }, [pathname]);

  const digits = (value: string, max: number) => value.replace(/\D/g, "").slice(0, max);

  /**
   * A full day or month moves on to the next box, but only when that box is
   * still empty. Jumping into a box that already holds something, or after the
   * person has tabbed there themselves, sends their next keystrokes into the
   * wrong field.
   */
  const advance = (to: "month" | "year") => {
    const next = to === "month" ? month : year;
    if (next === "") refs[to].current?.focus();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const problem = checkDate(day, month, year);
    if (problem) {
      setError(problem);
      refs[problem.field].current?.focus();
      return;
    }
    const age = ageFrom(Number(day), Number(month), Number(year));
    const required = (DRINKING_AGE[country] ?? DRINKING_AGE.OTHER).age;
    if (age === null || age < required) {
      window.location.assign(UNDER_AGE_DESTINATION);
      return;
    }
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    const lifetime = remember ? `; Max-Age=${THIRTY_DAYS}` : "";
    document.cookie = `${AGE_COOKIE}=1${lifetime}; Path=/; SameSite=Lax${secure}`;
    setOpen(false);
    window.dispatchEvent(new Event(AGE_OK_EVENT));
  };

  if (!open) return null;

  const fieldProps = (field: Field) => ({
    ref: refs[field],
    inputMode: "numeric" as const,
    "aria-invalid": error?.field === field ? true : undefined,
    "aria-describedby": error?.field === field ? "age-error" : undefined,
    // Arriving in a filled box selects it, so typing replaces rather than
    // appends to a value that is already at its full length.
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.select(),
    className: "text-center",
  });

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
            refs.day.current?.focus();
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
                    autoComplete="bday-day"
                    placeholder="DD"
                    value={day}
                    {...fieldProps("day")}
                    onChange={(e) => {
                      const v = digits(e.target.value, 2);
                      setDay(v);
                      setError(null);
                      if (v.length === 2) advance("month");
                    }}
                  />
                </div>
                <div>
                  <label htmlFor="age-month" className="sr-only">
                    Month
                  </label>
                  <Input
                    id="age-month"
                    autoComplete="bday-month"
                    placeholder="MM"
                    value={month}
                    {...fieldProps("month")}
                    onChange={(e) => {
                      const v = digits(e.target.value, 2);
                      setMonth(v);
                      setError(null);
                      if (v.length === 2) advance("year");
                    }}
                  />
                </div>
                <div>
                  <label htmlFor="age-year" className="sr-only">
                    Year
                  </label>
                  <Input
                    id="age-year"
                    autoComplete="bday-year"
                    placeholder="YYYY"
                    value={year}
                    {...fieldProps("year")}
                    onChange={(e) => {
                      setYear(digits(e.target.value, 4));
                      setError(null);
                    }}
                  />
                </div>
              </div>
              {error && (
                <p id="age-error" role="alert" className="mt-2 text-xs text-danger">
                  {error.message}
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
