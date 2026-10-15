/**
 * Date Display Utilities
 *
 * DISPLAY + INSTANT-ADAPTER concerns only (redesign Point 2).
 * All calendar ARITHMETIC lives in the authoritative engine
 * (lib/mercedonius/engine.ts); this module routes conversions through it
 * and never maps months itself. Instant ⇄ civil-date bridging follows the
 * explicit time policy in lib/time-policy.ts.
 */

import {
  getGregorianMonthName,
  MONTH_NAMES,
  MONTH_NAMES_SHORT,
  DAYS_OF_WEEK,
} from './month-config';
import { YEAR_STRUCTURE } from './mercedonius-rules';
import {
  gregorianToMercedonius,
  mercedoniusToGregorian,
  weekdayOfGregorian,
  type MercedoniusDate,
} from './mercedonius/engine';
import { localCivilDate } from './time-policy';

// ──────────────────────────────────────────────
// Julian Day utilities (instant domain — shared with astronomy)
// ──────────────────────────────────────────────

/**
 * Convert a JavaScript Date to Julian Day Number (JD).
 * Returns JD as floating point number (includes fractional day).
 */
export function toJulianDay(date: Date): number {
  const utc = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCMilliseconds()
  );
  return 2440587.5 + (utc / 86400000);
}

/**
 * Convert Julian Day Number to JavaScript Date (UTC).
 */
export function fromJulianDay(jd: number): Date {
  const utc = Math.round((jd - 2440587.5) * 86400000);
  return new Date(utc);
}

/**
 * Convert a Date to a "astronomical day number" (integer part of JD).
 */
export function toAstronomicalDay(date: Date): number {
  return Math.floor(toJulianDay(date));
}

// ──────────────────────────────────────────────
// Date conversion — engine-routed (authoritative: lib/mercedonius/engine.ts)
// ──────────────────────────────────────────────

/**
 * A Mercedonius civil date (engine type).
 *  - month 1–13: named months, day 1–28.
 *  - month 0: year-boundary day(s) outside all months (day 1; day 2 in
 *    leap years only — display name pending approval).
 */
export type MonthDay = MercedoniusDate;

/**
 * Instant → Mercedonius civil date.
 * The instant is resolved to its civil date per the explicit time policy
 * (user-selected zone, default device zone), then converted by the
 * authoritative engine — real day-count arithmetic, never a month rename.
 */
export function convertGregorianTo13Month(gregorianDate: Date): MonthDay {
  return gregorianToMercedonius(localCivilDate(gregorianDate));
}

/**
 * Mercedonius civil date → Date at LOCAL MIDNIGHT of the Gregorian day.
 * Presentation convenience for legacy callers; the arithmetic itself is
 * zone-free and lives in the engine. Throws RangeError on invalid input —
 * never clamps (Point 2: explicit rejection over silent adjustment).
 */
export function convert13MonthToGregorian(month: number, day: number, year: number): Date {
  const g = mercedoniusToGregorian({ year, month, day });
  return new Date(g.year, g.month - 1, g.day);
}

// ──────────────────────────────────────────────
// Day of week utilities
// ──────────────────────────────────────────────

/**
 * Weekday index (0=Sunday … 6=Saturday) of the instant's CIVIL date.
 * Time policy: selected zone, default device zone. Continuous JDN cycle —
 * never reset by any month or year boundary.
 */
export function getDayOfWeek(date: Date): number {
  return weekdayOfGregorian(localCivilDate(date));
}

/**
 * Get day name for a date
 */
export function getDayName(date: Date): string {
  return DAYS_OF_WEEK[getDayOfWeek(date)];
}

// ──────────────────────────────────────────────
// Display utilities
// ──────────────────────────────────────────────

/**
 * Format a date for display (e.g., "March 20, 2026")
 */
export function formatDateForDisplay(date: Date): string {
  const month = getGregorianMonthName(date.getMonth() + 1);
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

/**
 * Month label for display, boundary-aware: months 1–13 → Latin names,
 * month 0 → the working label for year-boundary days (name pending).
 */
export function getMercedoniusMonthLabel(month: number): string {
  if (month >= 1 && month <= 13) {
    return MONTH_NAMES[month - 1];
  }
  if (month === 0) {
    return YEAR_STRUCTURE.proposedYearBoundaryDayName;
  }
  return 'Unknown';
}

/**
 * Format a full Mercedonius date for display,
 * e.g. "Martius 14, 2026" or "Year-Boundary Day 2, 2028".
 */
export function formatMercedoniusDate(md: MonthDay): string {
  return `${getMercedoniusMonthLabel(md.month)} ${md.day}, ${md.year}`;
}

/**
 * Format a 13-month date for display (e.g., "Martius 14").
 * month 0 renders the year-boundary working label.
 */
export function format13MonthDate(month: number, day: number): string {
  if (month !== 0 && (month < 1 || month > 13)) {
    return 'Invalid';
  }
  return `${getMercedoniusMonthLabel(month)} ${day}`;
}

/**
 * Get month name in 13-month calendar
 */
export function get13MonthName(month: number): string {
  if (month >= 1 && month <= 13) {
    return MONTH_NAMES[month - 1];
  }
  return 'Unknown';
}

/**
 * Get short month name for 13-month calendar
 */
export function getShort13MonthName(month: number): string {
  if (month >= 1 && month <= 13) {
    return MONTH_NAMES_SHORT[month - 1];
  }
  return '??';
}
