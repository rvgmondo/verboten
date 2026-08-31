"use client";

import Link from "next/link";
import * as React from "react";

import { BrandBadge } from "@/components/brand/crest";
import { Motto } from "@/components/brand/motto";
import { ArtPlaceholder } from "@/components/media/art-placeholder";
import { Button } from "@/components/ui/button";

/**
 * The hero as a slow triptych: three chapters of the same dark stage, each a
 * different door into the house. Auto-advances at a cinematic pace, pauses
 * while hovered or focused, and never auto-plays for reduced-motion visitors.
 * The commerce line and spec strip live OUTSIDE the rotation in the parent,
 * so the sell never fades out from under the shopper.
 */

const HOLD_MS = 7000;

type Chapter = {
  key: string;
  label: string;
  kicker: string;
  titleA: string;
  titleB: string;
  body: string;
  cta: { href: string; label: string };
  ctaSecondary?: { href: string; label: string };
};

const CHAPTERS: Chapter[] = [
  {
    key: "bottle",
    label: "Chapter one, the bottle",
    kicker: "Pure Spirit. Pure Mischief.",
    titleA: "Born in Pretoria.",
    titleB: "Made for the world.",
    body: "An independent South African brandy house with one rule: nothing leaves until it earns the label.",
    cta: { href: "/shop/verboten-premium-brandy", label: "Order the brandy" },
    ctaSecondary: { href: "/story", label: "The story" },
  },
  {
    key: "cans",
    label: "Chapter two, Brandy and Cola",
    kicker: "Ready to drink",
    titleA: "The national serve,",
    titleB: "done properly.",
    body: "The same spirit with its collar loosened. Pre-mixed, canned, and colder than strictly necessary.",
    cta: { href: "/shop/verboten-brandy-cola", label: "See the can" },
  },
  {
    key: "motto",
    label: "Chapter three, for those who know",
    kicker: "The house",
    titleA: "Vir dié",
    titleB: "wat weet.",
    body: "For those who know. Verboten is German for forbidden, and some traditions are meant to be whispered, not shouted.",
    cta: { href: "/story", label: "Step inside" },
  },
];

export const HeroCinema = ({
  bottleSrc,
  bottleSrcSet,
  bottleAlt,
  soldOut,
  commerceLine,
}: {
  bottleSrc: string | null;
  /** Responsive candidates from Payload's generated variants. */
  bottleSrcSet?: string;
  bottleAlt: string;
  soldOut: boolean;
  commerceLine: string;
}) => {
  const [active, setActive] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [reduced, setReduced] = React.useState(false);
  /**
   * A deliberate stop, as opposed to the transient pause hovering gives you.
   * WCAG 2.2.2 asks for a real mechanism to stop moving content that runs
   * longer than five seconds, and hover does not count: it is unavailable on
   * touch and to anyone reading with a magnifier or the keyboard.
   */
  const [stopped, setStopped] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  React.useEffect(() => {
    if (paused || reduced || stopped) return;
    const t = setInterval(() => setActive((a) => (a + 1) % CHAPTERS.length), HOLD_MS);
    return () => clearInterval(t);
  }, [paused, reduced, stopped, active]);

  const chapters = React.useMemo(() => {
    if (!soldOut) return CHAPTERS;
    // Sold out flips chapter one from ordering into the release list.
    return CHAPTERS.map((c, i) =>
      i === 0
        ? {
            ...c,
            body: "Sold out for now. Join the list and hear the moment it lands back.",
            cta: { href: "#newsletter", label: "Join the list" },
          }
        : c,
    );
  }, [soldOut]);

  return (
    <section
      aria-label="Verboten, in three chapters"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className="inverse relative overflow-hidden border-b border-line bg-ink"
    >
      {/* The constant stage: candlelight, ghost wordmark, grain */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="animate-glow absolute right-[-18%] top-1/2 h-[110vmin] w-[110vmin] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(205,184,141,0.16),rgba(205,184,141,0.05)_45%,transparent_72%)]" />
        <span className="text-ghost absolute bottom-[6%] left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-display text-[23vw] font-bold leading-none tracking-[0.05em]">
          VERBOTEN
        </span>
        <div className="grain absolute inset-0 opacity-[0.05]" />
      </div>

      <div className="relative mx-auto grid min-h-[82svh] max-w-6xl items-center px-6 pb-16 pt-14 lg:pb-20 lg:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6">
          {/* Text: all chapters stacked in one grid cell; the active one shows. */}
          <div className="relative z-20 grid max-w-xl">
            {chapters.map((c, i) => {
              // Exactly one h1 on the page: chapter one owns it.
              const Heading = i === 0 ? "h1" : "h2";
              return (
              <div
                key={c.key}
                aria-hidden={i !== active}
                className={`col-start-1 row-start-1 space-y-7 transition-opacity duration-1000 ${
                  i === active ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <p className="eyebrow flex items-center gap-4">
                  <span aria-hidden="true" className="h-px w-10 bg-gold-dim/70" />
                  {c.kicker}
                </p>
                <Heading className="font-display font-semibold leading-[0.98] tracking-tight text-[clamp(3rem,7.5vw,5.25rem)]">
                  <span className="block text-bone">{c.titleA}</span>
                  <span className="block text-gold">{c.titleB}</span>
                </Heading>
                <p className="max-w-md text-base leading-relaxed text-parch">{c.body}</p>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" asChild tabIndex={i === active ? undefined : -1}>
                    <Link href={c.cta.href}>{c.cta.label}</Link>
                  </Button>
                  {c.ctaSecondary && (
                    <Button
                      size="lg"
                      variant="outline"
                      asChild
                      tabIndex={i === active ? undefined : -1}
                    >
                      <Link href={c.ctaSecondary.href}>{c.ctaSecondary.label}</Link>
                    </Button>
                  )}
                </div>
              </div>
              );
            })}
          </div>

          {/* Media: same stacking, Ken Burns on the active chapter. */}
          <div className="relative z-10 grid">
            {/* Chapter 1: the bottle, melting into the dark */}
            <div
              aria-hidden={active !== 0}
              className={`col-start-1 row-start-1 transition-opacity duration-1000 ${
                active === 0 ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              {bottleSrc ? (
                <div className="relative mx-auto aspect-[3/4] w-full max-w-[420px] overflow-hidden [mask-image:radial-gradient(ellipse_72%_68%_at_center,black_52%,transparent_98%)] lg:max-w-[480px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bottleSrc}
                    srcSet={bottleSrcSet}
                    sizes={bottleSrcSet ? "(min-width: 1024px) 480px, 90vw" : undefined}
                    alt={bottleAlt}
                    loading="eager"
                    fetchPriority="high"
                    decoding="sync"
                    className={`absolute inset-0 h-full w-full object-cover ${
                      active === 0 ? "animate-kenburns" : ""
                    }`}
                  />
                </div>
              ) : (
                <ArtPlaceholder
                  shot="The bottle on black, crest catching the light"
                  aspect="aspect-[3/4]"
                  className="mx-auto w-full max-w-[420px] lg:max-w-[480px]"
                />
              )}
            </div>
            {/* Chapter 2: cans, waiting for the shoot */}
            <div
              aria-hidden={active !== 1}
              className={`col-start-1 row-start-1 transition-opacity duration-1000 ${
                active === 1 ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <ArtPlaceholder
                shot="Brandy and Cola cans on ice, condensation, dusk light"
                aspect="aspect-[3/4]"
                className={`mx-auto w-full max-w-[420px] lg:max-w-[480px] ${
                  active === 1 ? "animate-kenburns" : ""
                }`}
              />
            </div>
            {/* Chapter 3: pure type, no image needed */}
            <div
              aria-hidden={active !== 2}
              className={`col-start-1 row-start-1 flex items-center justify-center transition-opacity duration-1000 ${
                active === 2 ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <div className="py-10 text-center">
                <BrandBadge
                  className={`mx-auto mb-10 h-48 w-48 sm:h-60 sm:w-60 ${
                    active === 2 ? "animate-kenburns" : ""
                  }`}
                />
                <Motto className="text-2xl sm:text-3xl" />
                <Motto line="MEMORIES NOT REGRETS" className="mt-6 text-2xl opacity-60 sm:text-3xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Chapter index: Roman numerals, quiet, clickable. */}
        <div className="relative z-20 mt-10 flex items-center gap-2" role="group" aria-label="Hero chapters">
          {chapters.map((c, i) => (
            <button
              key={c.key}
              type="button"
              onClick={() => {
                setActive(i);
                // Picking a chapter is a request to read it. Without this the
                // timer could move you on a fraction of a second later.
                setStopped(true);
              }}
              aria-label={c.label}
              aria-current={i === active ? "true" : undefined}
              className={`flex h-11 min-w-11 items-center justify-center px-2 font-display text-sm tracking-[0.2em] transition-colors ${
                i === active ? "text-gold" : "text-parch/60 hover:text-parch"
              }`}
            >
              {["I", "II", "III"][i]}
              <span
                aria-hidden="true"
                className={`ml-2 h-px transition-all duration-500 ${
                  i === active ? "w-8 bg-gold" : "w-4 bg-parch/40"
                }`}
              />
            </button>
          ))}
          <button
            type="button"
            onClick={() => setStopped((v) => !v)}
            aria-pressed={stopped}
            className="ml-2 flex h-11 items-center justify-center px-3 text-[0.625rem] uppercase tracking-[0.2em] text-parch/60 transition-colors hover:text-parch"
          >
            {stopped ? "Play" : "Pause"}
          </button>
        </div>
      </div>

      {/* Brass plate: the commerce facts, constant under every chapter. */}
      <div className="relative z-20 border-t hairline bg-ink/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <dl className="grid grid-cols-2 gap-x-10 gap-y-4 sm:grid-cols-4">
            {(
              [
                ["Age", "3 years in oak"],
                ["Finish", "French casks"],
                ["Strength", "43%"],
                ["Bottle", "750ml"],
              ] as const
            ).map(([label, value]) => (
              <div key={label}>
                <dt className="text-[0.625rem] uppercase tracking-[0.2em] text-parch">{label}</dt>
                <dd className="mt-1 font-display text-lg text-bone">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="max-w-xs text-xs leading-relaxed text-parch">{commerceLine}</p>
        </div>
      </div>
    </section>
  );
};
