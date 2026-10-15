/**
 * Date Conversion Utilities
 *
 * Converts between the 13-Month Calendar and the Gregorian Calendar.
 * The conversion engine is isolated here so that the rules can be
 * changed later without rebuilding the user interface.
 */

import { getGregorianMonthName } from './month-config';

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

const TROPICAL_YEAR = 365.2422;
const LUNAR_CYCLE = 29.53059;
const GREGORIAN_EPOCH = new Date('2000-01-01T12:00:00Z'); // JD 2451545.0
const J2000_JD = 2451545.0;

// 13-Month Calendar definitions
const MONTH_NAMES = [
  'Martius', 'Aprilis', 'Maius', 'Iunius', 'Quintilis', 'Sextilis',
  'September', 'October', 'November', 'December', 'Ianuarius', 'Februarius', 'Intercalaris'
] as const;

const MONTH_NAMES_SHORT = [
  'Mart.', 'Apr.', 'Mai.', 'Iun.', 'Quint.', 'Sext.',
  'Sept.', 'Oct.', 'Nov.', 'Dec.', 'Ianu.', 'Febru.', 'Inter.'
] as const;

// Gregorian month names (0-indexed)
const GREG_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

// ──────────────────────────────────────────────
// Julian Day Number utilities
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
// Date conversion: 13-Month → Gregorian
// ──────────────────────────────────────────────

export interface MonthDay {
  month: number;
  day: number;
  year: number;
}

/**
 * Convert a 13-Month Calendar date to Gregorian date.
 *
 * The 13-month calendar aligns months by their ordinal position in the year.
 * Month 11 = Ianuarius (January), Month 12 = Februarius (February)
 * These are the extra months that map to Gregorian Jan/Feb of the same year.
 *
 * Intercalaris (month 13) is the intercalary/adjustment month.
 */
export function convert13MonthToGregorian(
  month: number,
  day: number,
  year: number
): Date {
  // Months 11-12 map to January-February of the same year
  if (month >= 11 && month <= 12) {
    const gregorianMonth = month - 11;
    return new Date(year, gregorianMonth, day);
  }

  // Months 1-10 map to March-December of the same year
  if (month >= 1 && month <= 10) {
    const targetMonth = month + 1; // Month 1 = March (index 2)
    const date = new Date(year, targetMonth, day);

    // Validate and clamp
    if (date.getMonth() === targetMonth && date.getDate() === day) {
      return date;
    }
    return new Date(year, targetMonth, 1);
  }

  // Month 13 = Intercalaris (leap/intercalary month)
  // Map to February of the following year
  return new Date(year + 1, 1, day);
}

/**
 * Find which 13-month date corresponds to a given Gregorian date.
 */
export function convertGregorianTo13Month(
  gregorianDate: Date
): MonthDay {
  const month = gregorianDate.getMonth(); // 0-11
  const day = gregorianDate.getDate();
  const year = gregorianDate.getFullYear();

  // Map Gregorian months to 13-month months
  // March (index 2) → month 1 (Martius) … December (index 11) → month 10
  if (month >= 2 && month <= 11) {
    return { month: month - 1, day, year };
  }

  // January and February map to months 11 and 12
  if (month === 0) {
    return { month: 11, day, year };
  }
  if (month === 1) {
    return { month: 12, day, year };
  }

  // Should not reach here for valid dates
  return { month: 1, day, year };
}

// ──────────────────────────────────────────────
// Day of week utilities
// ──────────────────────────────────────────────

/**
 * Get day of week for a date (0=Sunday ... 6=Saturday)
 */
export function getDayOfWeek(date: Date): number {
  return date.getUTCDay();
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
 * Format a 13-month date for display (e.g., "Martius 14")
 */
export function format13MonthDate(month: number, day: number): string {
  if (month < 1 || month > 13) {
    return 'Invalid';
  }
  return `${MONTH_NAMES[month - 1]} ${day}`;
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
