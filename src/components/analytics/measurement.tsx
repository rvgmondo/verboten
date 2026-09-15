"use client";

import { usePathname } from "next/navigation";
import * as React from "react";

import { captureAttribution } from "@/lib/analytics";
import { AGE_OK_EVENT, hasPassedAgeGate } from "@/lib/compliance";
import { CONSENT_EVENT, type Consent, readConsent } from "@/lib/consent";

/** Fired on window once a tag has been started, so checkout can read its ids. */
export const MEASUREMENT_READY_EVENT = "vb:measurement-ready";

/**
 * Loads Google Analytics and the Meta Pixel, and only on a yes.
 *
 * This is Google's "basic" consent mode: the tag is not on the page at all
 * until the visitor agrees, so nothing is sent before then, not even the
 * cookieless pings of advanced mode. Advanced mode exists to feed Google's
 * behavioural modelling, which needs a thousand events a day to switch on, so
 * at this shop's size it would send data and get nothing back for it.
 *
 * Consent can also be taken back from the footer. The tags cannot be unloaded
 * from a page that is already open, so a "no" switches them off in place and
 * clears their cookies, and the next page load does not bring them back.
 */

const loadScript = (src: string, id: string) => {
  if (document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id;
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
};

/** Removes a cookie on this host and on the parent domain, where tags set them. */
const dropCookies = (test: (name: string) => boolean) => {
  const host = window.location.hostname;
  const domains = ["", host, `.${host.split(".").slice(-3).join(".")}`, `.${host.split(".").slice(-2).join(".")}`];
  for (const pair of document.cookie.split(";")) {
    const name = pair.split("=")[0]?.trim();
    if (!name || !test(name)) continue;
    for (const d of domains) {
      document.cookie = `${name}=; Max-Age=0; Path=/${d ? `; Domain=${d}` : ""}`;
    }
  }
};

const startGoogle = (gaId: string, consent: Consent) => {
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function gtag() {
      // gtag.js reads the arguments object itself, so it must be pushed as is.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    // Defaults first, before anything else is queued, as Google requires.
    window.gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  }
  (window as unknown as Record<string, boolean>)[`ga-disable-${gaId}`] = false;
  window.gtag("consent", "update", {
    analytics_storage: "granted",
    ad_storage: consent.marketing ? "granted" : "denied",
    ad_user_data: consent.marketing ? "granted" : "denied",
    ad_personalization: consent.marketing ? "granted" : "denied",
  });
  if (!document.getElementById("ga4-lib")) {
    window.gtag("js", new Date());
    window.gtag("config", gaId, {
      // Google Signals and ad personalisation follow the marketing choice.
      allow_google_signals: consent.marketing,
      allow_ad_personalization_signals: consent.marketing,
    });
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${gaId}`, "ga4-lib");
  }
};

const stopGoogle = (gaId: string) => {
  (window as unknown as Record<string, boolean>)[`ga-disable-${gaId}`] = true;
  window.gtag?.("consent", "update", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  dropCookies((n) => n === "_ga" || n.startsWith("_ga_") || n === "_gid");
};

const startMeta = (pixelId: string) => {
  if (!window.fbq) {
    // Meta's base code, unminified and otherwise unchanged. fbevents.js
    // expects exactly this shape: calls queue as arguments objects until it
    // arrives and installs callMethod.
    type Queued = NonNullable<Window["fbq"]> & {
      callMethod?: (...a: unknown[]) => void;
      queue: unknown[];
      push: unknown;
      loaded: boolean;
      version: string;
    };
    const fbq = function (this: unknown) {
      // eslint-disable-next-line prefer-rest-params
      const args = arguments;
      if (fbq.callMethod) fbq.callMethod.apply(fbq, args as unknown as unknown[]);
      else fbq.queue.push(args);
    } as unknown as Queued;
    fbq.queue = [];
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    window.fbq = fbq;
    (window as unknown as { _fbq: unknown })._fbq = fbq;
    loadScript("https://connect.facebook.net/en_US/fbevents.js", "meta-pixel-lib");
    window.fbq("init", pixelId);
    window.fbq("consent", "grant");
    // The landing page view, once. Later changes to the choices call this
    // again, and each call counting a fresh page view inflated every report.
    window.fbq("track", "PageView");
    return;
  }
  window.fbq("consent", "grant");
};

const stopMeta = () => {
  window.fbq?.("consent", "revoke");
  dropCookies((n) => n === "_fbp" || n === "_fbc");
};

export const Measurement = ({
  gaId,
  pixelId,
}: {
  gaId?: string | null;
  pixelId?: string | null;
}) => {
  const pathname = usePathname();
  const [consent, setConsent] = React.useState<Consent | null>(null);
  const lastPath = React.useRef<string | null>(null);

  // A stored yes counts only once this visit has passed the age gate. Consent
  // is remembered for months; the gate pass, by default, for the session. On a
  // shared device the next person must answer the gate before anything about
  // their visit reaches Google or Meta.
  React.useEffect(() => {
    captureAttribution();
    const sync = () => setConsent(hasPassedAgeGate() ? readConsent() : null);
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    window.addEventListener(AGE_OK_EVENT, sync);
    return () => {
      window.removeEventListener(CONSENT_EVENT, sync);
      window.removeEventListener(AGE_OK_EVENT, sync);
    };
  }, []);

  React.useEffect(() => {
    if (!consent) return;
    if (gaId) {
      if (consent.analytics) startGoogle(gaId, consent);
      else stopGoogle(gaId);
    }
    if (pixelId) {
      if (consent.marketing) startMeta(pixelId);
      else stopMeta();
    }
    window.dispatchEvent(new Event(MEASUREMENT_READY_EVENT));
  }, [consent, gaId, pixelId]);

  // Client side navigation. Google's enhanced measurement already records
  // history changes as page views; the Pixel does not, so it is told here.
  // Keyed on the path alone: a change of consent is not a new page.
  React.useEffect(() => {
    const previous = lastPath.current;
    lastPath.current = pathname;
    if (previous === null || previous === pathname) return;
    if (pixelId && readConsent()?.marketing && hasPassedAgeGate()) window.fbq?.("track", "PageView");
  }, [pathname, pixelId]);

  return null;
};

/**
 * The identifiers a server side sale report needs, read at checkout.
 *
 * PayFast confirms payment from its own servers, which carry none of the
 * buyer's cookies, so the ids that tie the sale back to the visit have to be
 * saved on the order before the buyer leaves for PayFast. Only what consent
 * allows is read: nothing at all without it.
 */
export const readMeasurementIds = async (
  gaId: string | null | undefined,
): Promise<{
  analytics: boolean;
  marketing: boolean;
  gaClientId?: string;
  gaSessionId?: string;
  fbp?: string;
  fbc?: string;
}> => {
  const consent = readConsent();
  const analytics = Boolean(consent?.analytics);
  const marketing = Boolean(consent?.marketing);
  const out: Awaited<ReturnType<typeof readMeasurementIds>> = { analytics, marketing };

  if (analytics && gaId && window.gtag) {
    const get = (field: string) =>
      new Promise<string | undefined>((resolve) => {
        // gtag answers once its library has loaded, which on a slow phone
        // connection right after accepting can take a few seconds.
        const timer = setTimeout(() => resolve(undefined), 4000);
        window.gtag!("get", gaId, field, (v: unknown) => {
          clearTimeout(timer);
          resolve(v == null ? undefined : String(v));
        });
      });
    [out.gaClientId, out.gaSessionId] = await Promise.all([get("client_id"), get("session_id")]);
  }

  if (marketing) {
    const cookie = (name: string) =>
      document.cookie
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith(`${name}=`))
        ?.slice(name.length + 1);
    out.fbp = cookie("_fbp");
    out.fbc = cookie("_fbc");
  }
  return out;
};
