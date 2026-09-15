/**
 * What a visitor has agreed to be measured for, and nothing else.
 *
 * POPIA has no cookie rule of its own, but the Information Regulator's
 * guidance note on direct marketing (December 2024) lists the use of cookies
 * among the forms of electronic direct marketing that section 69 covers, and
 * an online identifier is personal information. So nothing that follows a
 * person for advertising loads until they say yes, and analytics waits for a
 * yes as well: a legitimate interest argument exists for analytics, but it
 * needs a written assessment the house does not have, and asking is simpler.
 *
 * Two choices, kept deliberately few:
 *   analytics  Google Analytics, to see which pages work and which do not.
 *   marketing  The Meta Pixel and Google's ad signals, so ads can reach people
 *              who have already visited, and so a sale can be credited to the
 *              ad that brought it.
 *
 * The choice lives in a first-party cookie that holds two flags and nothing
 * that identifies anyone. Remembering a "no" is as necessary as remembering a
 * "yes", or the banner would ask on every page.
 */

export type Consent = { analytics: boolean; marketing: boolean };

export const CONSENT_COOKIE = "vb_consent";
/** Fired on window whenever the choice is made or changed. */
export const CONSENT_EVENT = "vb:consent";
/** Fired on window to reopen the choices, from the footer link. */
export const CONSENT_OPEN_EVENT = "vb:consent-open";

const SIX_MONTHS = 60 * 60 * 24 * 182;

/** "a1m0" style: short, readable in devtools, and nothing to parse wrongly. */
export const encodeConsent = (c: Consent) => `a${c.analytics ? 1 : 0}m${c.marketing ? 1 : 0}`;

export const decodeConsent = (raw: string | undefined | null): Consent | null => {
  const match = /^a([01])m([01])$/.exec(raw ?? "");
  if (!match) return null;
  return { analytics: match[1] === "1", marketing: match[2] === "1" };
};

/** The stored choice, or null if the visitor has not made one yet. Browser only. */
export const readConsent = (): Consent | null => {
  if (typeof document === "undefined") return null;
  const pair = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${CONSENT_COOKIE}=`));
  return decodeConsent(pair?.slice(CONSENT_COOKIE.length + 1));
};

export const writeConsent = (c: Consent) => {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${encodeConsent(c)}; Max-Age=${SIX_MONTHS}; Path=/; SameSite=Lax${secure}`;
  window.dispatchEvent(new CustomEvent<Consent>(CONSENT_EVENT, { detail: c }));
};
