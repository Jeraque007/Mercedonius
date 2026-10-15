/**
 * Mercedonius Calendar Engine — Authoritative Calendar Arithmetic
 * ================================================================
 *
 * This module is THE single source of truth for all Mercedonius date
 * calculations (redesign Point 2). All other modules route conversions
 * through here; no other module may implement month/day mapping.
 *
 * Design constraints:
 *  - PURE civil-date arithmetic on integer Julian Day Numbers (JDN).
 *    No JavaScript `Date` objects, no local-time behaviour, no month/day
 *    clamping — invalid input is rejected, never silently adjusted.
 *  - REVERSIBLE: gregorianToMercedonius ∘ mercedoniusToGregorian = id
 *    (brute-force tested over 1900–2100 in tests/mercedonius-engine.test.ts).
 *  - The Mercedonius date is NEVER derived by renaming Gregorian months.
 *    It is computed by day-count offset from the year anchor (Martius 1),
 *    so month/day numbers are genuinely different arithmetic, not labels.
 *
 * Rules source: lib/mercedonius-rules.ts. The epoch / year-numbering /
 * leap policies there are still 'proposed-pending-approval'; this engine
 * implements them as the working conventions. If they are amended, the
 * constants there change and every caller follows automatically.
 *
 * Concern separation (Point 2):
 *  - Instant ↔ civil-date / timezone policy → lib/time-policy.ts
 *  - Astronomical computations             → lib/astronomy/*
 *  - Display formatting                    → lib/date-utils.ts / UI components
 *
 * Worked examples (Mercedonius = modern reconstructed calendar):
 *   Gregorian 2000-03-01 → Mercedonius 2000 Martius 1        (year anchor)
 *   Gregorian 2026-10-15 → Mercedonius 2026 November 5       (NOT a rename!)
 *   Gregorian 2027-01-01 → Mercedonius 2026 Ianuarius 27     (tail of prior year)
 *   Gregorian 2028-02-29 → Mercedonius 2027 year-boundary 2  (month 0, leap tail)
 */

import { MONTH_COUNT, DAYS_PER_MONTH } from '../mercedonius-rules';

// ─────────────────────────────────────────────────────────────
// Civil-date types (no instants, no zones — pure calendar dates)
// ─────────────────────────────────────────────────────────────

/** A proleptic-Gregorian civil date. Month is 1–12. */
export interface GregorianDate {
  readonly year: number;
  readonly month: number; // 1–12
  readonly day: number;
}

/**
 * A Mercedonius civil date.
 *  - month 1–13: named months (Martius … Intercalaris), day 1–28.
 *  - month 0: the year-boundary day(s) that lie OUTSIDE all months,
 *    day 1 (always) or day 2 (leap years only). Display name pending.
 */
export interface MercedoniusDate {
  readonly year: number;
  readonly month: number; // 0–13
  readonly day: number;
}

/** Days in the 13 regular months total. */
const MONTHS_DAYS = MONTH_COUNT * DAYS_PER_MONTH; // 364

// ─────────────────────────────────────────────────────────────
// Gregorian ⇄ integer Julian Day Number (Meeus, integer form)
// ─────────────────────────────────────────────────────────────

/** Proleptic-Gregorian civil date → integer Julian Day Number (noon-based). */
export function gregorianToJDN(g: GregorianDate): number {
  const a = Math.floor((14 - g.month) / 12);
  const y = g.year + 4800 - a;
  const m = g.month + 12 * a - 3;
  return (
    g.day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

/** Integer Julian Day Number → proleptic-Gregorian civil date. */
export function jdnToGregorian(jdn: number): GregorianDate {
  if (!Number.isInteger(jdn)) {
    throw new RangeError(`jdnToGregorian: JDN must be an integer, got ${jdn}`);
  }
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  return {
    day: e - Math.floor((153 * m + 2) / 5) + 1,
    month: m + 3 - 12 * Math.floor(m / 10),
    year: 100 * b + d - 4800 + Math.floor(m / 10),
  };
}

/** Leap rule of the proleptic Gregorian calendar (used for validation). */
export function isGregorianLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
// ─────────────────────────────────────────────────────────────
// Mercedonius year arithmetic (per lib/mercedonius-rules.ts)
// ─────────────────────────────────────────────────────────────

/** JDN of the proposed epoch anchor: Gregorian 2000-03-01 (Martius 1, year 2000). */
export const EPOCH_ANCHOR_JDN = gregorianToJDN({ year: 2000, month: 3, day: 1 }); // 2451605

/** JDN of Martius 1 of Mercedonius year Y (year anchor = Gregorian March 1 of Y). */
export function mercedoniusYearStartJDN(year: number): number {
  return gregorianToJDN({ year, month: 3, day: 1 });
}

/**
 * Mercedonius year Y spans Gregorian March 1 Y → (just before) March 1 Y+1,
 * i.e. it "contains" Gregorian year Y+1's February. It therefore receives
 * the second (adjustment) year-boundary day iff Gregorian Y+1 is leap.
 */
export function isMercedoniusLeapYear(year: number): boolean {
  return isGregorianLeapYear(year + 1);
}

/** Total days in Mercedonius year Y: 364 month-days + 1 (or 2 in leap years). */
export function mercedoniusYearLength(year: number): number {
  return MONTHS_DAYS + (isMercedoniusLeapYear(year) ? 2 : 1);
}

/** True iff the struct is a valid Mercedonius calendar date. */
export function isValidMercedoniusDate(m: MercedoniusDate): boolean {
  if (!Number.isInteger(m.year) || !Number.isInteger(m.month) || !Number.isInteger(m.day)) {
    return false;
  }
  if (m.month >= 1 && m.month <= MONTH_COUNT) {
    return m.day >= 1 && m.day <= DAYS_PER_MONTH;
  }
  if (m.month === 0) {
    // Year-boundary day(s): day 2 exists only in leap years.
    return m.day === 1 || (m.day === 2 && isMercedoniusLeapYear(m.year));
  }
  return false;
}

// ─────────────────────────────────────────────────────────────
// The two authoritative conversions
// ─────────────────────────────────────────────────────────────

/**
 * Gregorian civil date → Mercedonius civil date.
 * Real conversion by day-count offset from the year anchor — never a
 * month rename. Throws RangeError on invalid Gregorian input.
 */
export function gregorianToMercedonius(g: GregorianDate): MercedoniusDate {
  if (!isValidGregorianDate(g)) {
    throw new RangeError(
      `gregorianToMercedonius: invalid Gregorian date ${g.year}-${g.month}-${g.day}`
    );
  }
  // Dates before March 1 belong to the TAIL of the previous Mercedonius year.
  const year = g.month < 3 ? g.year - 1 : g.year;
  const doy = gregorianToJDN(g) - mercedoniusYearStartJDN(year); // 0-based day of year
  if (doy < MONTHS_DAYS) {
    return {
      year,
      month: Math.floor(doy / DAYS_PER_MONTH) + 1,
      day: (doy % DAYS_PER_MONTH) + 1,
    };
  }
  return { year, month: 0, day: doy - MONTHS_DAYS + 1 }; // year-boundary day 1|2
}

/**
 * Mercedonius civil date → Gregorian civil date.
 * Exact inverse of gregorianToMercedonius. Throws RangeError on invalid
 * Mercedonius input (no clamping, ever).
 */
export function mercedoniusToGregorian(m: MercedoniusDate): GregorianDate {
  if (!isValidMercedoniusDate(m)) {
    throw new RangeError(
      `mercedoniusToGregorian: invalid Mercedonius date ${m.year}-${m.month}-${m.day}`
    );
  }
  const doy =
    m.month === 0
      ? MONTHS_DAYS + m.day - 1
      : (m.month - 1) * DAYS_PER_MONTH + (m.day - 1);
  return jdnToGregorian(mercedoniusYearStartJDN(m.year) + doy);
}

// ─────────────────────────────────────────────────────────────
// Weekday (continuous cycle — structural, never reset)
// ─────────────────────────────────────────────────────────────

/**
 * Weekday of a JDN as a 0=Sunday … 6=Saturday index (platform convention).
 * The cycle is continuous by construction (JDN mod 7): it never resets at
 * Mercedonius month or year boundaries. Example: JDN 2451545 = Saturday.
 */
export function weekdayFromJDN(jdn: number): number {
  return (((jdn + 1) % 7) + 7) % 7;
}

/** Weekday index (0=Sunday) of a Gregorian civil date. */
export function weekdayOfGregorian(g: GregorianDate): number {
  return weekdayFromJDN(gregorianToJDN(g));
}


const GREG_MONTH_LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** True iff the struct is a real Gregorian calendar date (rejects e.g. Feb 30). */
export function isValidGregorianDate(g: GregorianDate): boolean {
  if (!Number.isInteger(g.year) || !Number.isInteger(g.month) || !Number.isInteger(g.day)) {
    return false;
  }
  if (g.month < 1 || g.month > 12 || g.day < 1) return false;
  const maxDay =
    g.month === 2 && isGregorianLeapYear(g.year) ? 29 : GREG_MONTH_LENGTHS[g.month - 1];
  return g.day <= maxDay;
}
