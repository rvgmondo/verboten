import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ageFrom } from "@/lib/compliance";

/**
 * The age gate's arithmetic. A gate that lets a seventeen year old in on the
 * day before their birthday, or turns an adult away over a leap year, is the
 * kind of mistake nobody notices until a complaint arrives.
 */

// 15 September 2026, local time, the way the browser sees it.
const TODAY = new Date(2026, 8, 15);

describe("ageFrom", () => {
  it("counts a birthday today as a year gained", () => {
    assert.equal(ageFrom(15, 9, 2008, TODAY), 18);
  });

  it("does not count a birthday tomorrow", () => {
    assert.equal(ageFrom(16, 9, 2008, TODAY), 17);
  });

  it("handles a birthday earlier in the year", () => {
    assert.equal(ageFrom(1, 1, 2000, TODAY), 26);
  });

  it("refuses dates that do not exist", () => {
    assert.equal(ageFrom(31, 2, 2000, TODAY), null);
    assert.equal(ageFrom(29, 2, 2001, TODAY), null);
    assert.equal(ageFrom(0, 5, 2000, TODAY), null);
    assert.equal(ageFrom(12, 13, 2000, TODAY), null);
  });

  it("accepts a real leap day", () => {
    assert.equal(ageFrom(29, 2, 2004, TODAY), 22);
  });

  it("refuses a future year and an implausible one", () => {
    assert.equal(ageFrom(1, 1, 2027, TODAY), null);
    assert.equal(ageFrom(1, 1, 1890, TODAY), null);
  });

  it("refuses a date later this year", () => {
    assert.equal(ageFrom(1, 12, 2026, TODAY), null);
  });
});
