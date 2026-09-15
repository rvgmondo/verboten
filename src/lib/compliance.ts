/**
 * The alcohol industry's rules for how a brand site speaks, in one place.
 *
 * Source: the Drinks Federation of South Africa's Alcohol Industry
 * Communications Code of Conduct, 2026 edition (July 2026), which the
 * Advertising Regulatory Board enforces against members and non-members
 * alike. Clause numbers below are from that edition.
 *
 * Wording here is not house copy and must not be restyled. The code lists the
 * messages that count, word for word, and a paraphrase ("Drink responsibly.
 * Not for sale to persons under 18.", which this site used to carry) is not
 * one of them.
 */

/** 7.8.3: the authorised responsibility messages. At least one must show. */
export const RESPONSIBILITY_MESSAGES = {
  underAge: "Not for Persons Under the Age of 18",
  driving: "Don't Drink and Drive.",
  pregnancy: "Pregnant Women Should Not Drink Alcohol.",
} as const;

/** The line the site shows permanently (7.8.1) and every email carries. */
export const RESPONSIBILITY_LINE = `${RESPONSIBILITY_MESSAGES.underAge}. ${RESPONSIBILITY_MESSAGES.driving}`;

/**
 * 7.8.4.5: a visitor the age gate turns away goes to a local responsible
 * drinking organisation, not to a page of the brand's own.
 */
export const UNDER_AGE_DESTINATION = "https://www.aware.org.za/";

/** Legal drinking age by country, for the age gate (7.8.4.1). */
export const DRINKING_AGE: Record<string, { name: string; age: number }> = {
  ZA: { name: "South Africa", age: 18 },
  BW: { name: "Botswana", age: 18 },
  LS: { name: "Lesotho", age: 18 },
  MZ: { name: "Mozambique", age: 18 },
  NA: { name: "Namibia", age: 18 },
  SZ: { name: "Eswatini", age: 18 },
  ZW: { name: "Zimbabwe", age: 18 },
  GB: { name: "United Kingdom", age: 18 },
  IE: { name: "Ireland", age: 18 },
  DE: { name: "Germany", age: 18 },
  NL: { name: "Netherlands", age: 18 },
  AU: { name: "Australia", age: 18 },
  NZ: { name: "New Zealand", age: 18 },
  CA: { name: "Canada", age: 19 },
  US: { name: "United States", age: 21 },
  // Anywhere else, the house holds South Africa's age, which is the law the
  // site trades under. It never sells outside South Africa in any case.
  OTHER: { name: "Another country", age: 18 },
};

/**
 * Whole years between a date of birth and today, or null if the date does not
 * exist (31 February, a year in the future, a typo like 1890).
 */
export const ageFrom = (day: number, month: number, year: number, now = new Date()) => {
  if (![day, month, year].every(Number.isInteger)) return null;
  if (year < 1900 || year > now.getFullYear()) return null;
  const dob = new Date(Date.UTC(year, month - 1, day));
  if (
    dob.getUTCFullYear() !== year ||
    dob.getUTCMonth() !== month - 1 ||
    dob.getUTCDate() !== day
  ) {
    return null;
  }
  let age = now.getFullYear() - year;
  const hadBirthday =
    now.getMonth() + 1 > month || (now.getMonth() + 1 === month && now.getDate() >= day);
  if (!hadBirthday) age -= 1;
  return age < 0 ? null : age;
};
