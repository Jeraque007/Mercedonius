/**
 * Mercedonius Calendar Engine — Authoritative Calendar Arithmetic
 * ================================================================
 *
 * This module is THE single source of truth for all Mercedonius date
 * calculations (Standard 1.0 Rev 3). All other modules route conversions
 * through here; no other module may implement month/day mapping.
 *
 * Design constraints:
 *  - PURE civil-date arithmetic on integer Julian Day Numbers (JDN).
 *    No JavaScript `Date` objects, no local-time behaviour, no month/day
 *    clamping — invalid input is rejected, never silently adjusted.
 *  - REVERSIBLE: gregorianToMercedonius ∘ mercedoniusToGregorian = id.
 *  - The Mercedonius date is NEVER derived by renaming Gregorian months.
 *    It is computed by day-count offset from the year anchor (the March
 *    equinox boundary), so month/day numbers are genuinely different
 *    arithmetic, not labels.
 *  - Year boundary = UTC calendar date containing the March equinox
 *    (Sun at 0° ecliptic longitude), per Standard §2. Not user time-zone.
 *
 * Rules source: lib/mercedonius-rules.ts. Astronomical equinox instants
 * are computed in lib/astronomy/seasons.ts and consumed here via
 * marchEquinoxDate().
 *
 * Concern separation:
 *  - Instant ↔ civil-date / timezone policy → lib/time-policy.ts
 *  - Astronomical computations             → lib/astronomy/*
 *  - Display formatting                    → lib/date-utils.ts / UI components
 */

import { MONTH_COUNT, DAYS_PER_MONTH, AUC_EPOCH_OFFSET } from '../mercedonius-rules';
import { getSeasonalInstants } from '../astronomy/seasons';

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
 *  - year: AUC year number (Gregorian year of the March equinox + 753).
 *  - month 1–13: named months (Martius … Intercalaris), day 1–28.
 *  - month 0: special days outside all months:
 *    day 1 = Year Day (always present), day 2 = Leap Day (leap years only).
 */
export interface MercedoniusDate {
  readonly year: number; // AUC
  readonly month: number; // 0–13
  readonly day: number;
}

/** Days in the 13 regular months total. */
const MONTHS_DAYS = MONTH_COUNT * DAYS_PER_MONTH; // 364

/** Supported Gregorian year range for equinox computation (Meeus model). */
export const SUPPORTED_GREGORIAN_MIN = 1800;
export const SUPPORTED_GREGORIAN_MAX = 2200;

/**
 * Equinox computation window — one Gregorian year beyond the conversion
 * contract on each end.
 *
 * mercedoniusYearLength(y) = startJDN(y + 1) − startJDN(y), so the length of
 * AUC year y needs the equinox anchors of Gregorian years (y − 753) and
 * (y − 752). To serve every Gregorian conversion year in
 * [SUPPORTED_GREGORIAN_MIN, SUPPORTED_GREGORIAN_MAX] = [1800, 2200] —
 * including 1800 before the equinox (AUC 2552 needs equinox 1799) and
 * 2200 on/after the equinox (AUC 2953 needs equinox 2201) — we must be able
 * to compute equinoxes for 1799 and 2201 as well. We compute (never fabricate)
 * those extra anchors purely to close the boundary intervals; the public
 * conversion contract remains [1800, 2200].
 */
export const EQUINOX_COMPUTE_MIN = SUPPORTED_GREGORIAN_MIN - 1; // 1799
export const EQUINOX_COMPUTE_MAX = SUPPORTED_GREGORIAN_MAX + 1; // 2201

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
// Equinox-based year boundary (Standard §2–§3)
// ─────────────────────────────────────────────────────────────

/** Cache of March-equinox boundary dates by Gregorian year (avoids recomputing the Meeus solar model). */
const EQUINOX_CACHE = new Map<number, GregorianDate>();

/**
 * UTC calendar date containing the March equinox (Sun at λ=0°) of a
 * Gregorian year. The equinox instant is computed live from the Meeus
 * solar model; only its UTC calendar date is used as the boundary.
 * Never the instant, never user time-zone.
 */
export function marchEquinoxDate(gregorianYear: number): GregorianDate {
  if (
    !Number.isInteger(gregorianYear) ||
    gregorianYear < EQUINOX_COMPUTE_MIN ||
    gregorianYear > EQUINOX_COMPUTE_MAX
  ) {
    throw new RangeError(
      `marchEquinoxDate: year ${gregorianYear} outside equinox-compute range [${EQUINOX_COMPUTE_MIN}, ${EQUINOX_COMPUTE_MAX}]`
    );
  }
  const cached = EQUINOX_CACHE.get(gregorianYear);
  if (cached) return cached;
  const instants = getSeasonalInstants(gregorianYear);
  const vernal = instants.find(
    (s) => s.type === 'equinox' && s.longitudeDeg === 0
  );
  if (!vernal) {
    throw new RangeError(
      `marchEquinoxDate: no March equinox found for Gregorian year ${gregorianYear}`
    );
  }
  const d = vernal.instant;
  const result = {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
  };
  EQUINOX_CACHE.set(gregorianYear, result);
  return result;
}

/**
 * B(y): the UTC calendar date that starts AUC year y.
 * AUC year y corresponds to Gregorian year G = y − 753; its boundary is
 * the March equinox date in year G.
 */
export function aucYearBoundaryDate(aucYear: number): GregorianDate {
  if (!Number.isInteger(aucYear)) {
    throw new RangeError(`aucYearBoundaryDate: AUC year must be an integer`);
  }
  return marchEquinoxDate(aucYear - AUC_EPOCH_OFFSET);
}

/**
 * JDN of the start of AUC year y — the March equinox boundary date.
 * This replaces the former fixed Gregorian March 1 anchor.
 */
export function mercedoniusYearStartJDN(aucYear: number): number {
  const boundary = aucYearBoundaryDate(aucYear);
  return gregorianToJDN(boundary);
}

/**
 * Determine the AUC year for a Gregorian civil date.
 * If the date is on or after the March equinox of its Gregorian year G:
 *   AUC year = G + 753
 * Otherwise (before the equinox): belongs to the previous AUC year:
 *   AUC year = (G − 1) + 753 = G + 752
 */
export function aucYearForGregorianDate(g: GregorianDate): number {
  const equinoxDate = marchEquinoxDate(g.year);
  const equinoxJDN = gregorianToJDN(equinoxDate);
  const dateJDN = gregorianToJDN(g);
  if (dateJDN >= equinoxJDN) {
    return g.year + AUC_EPOCH_OFFSET;
  }
  return (g.year - 1) + AUC_EPOCH_OFFSET;
}

/** True iff AUC year y has 366 days (leap year). */
export function isMercedoniusLeapYear(aucYear: number): boolean {
  return mercedoniusYearLength(aucYear) === 366;
}

/**
 * Total days in AUC year y = days between consecutive equinox boundaries.
 * Per Standard §4: must be 365 or 366. Out-of-range intervals (364/367)
 * are flagged as an error, never fabricated.
 */
export function mercedoniusYearLength(aucYear: number): number {
  const start = mercedoniusYearStartJDN(aucYear);
  const end = mercedoniusYearStartJDN(aucYear + 1);
  const length = end - start;
  if (length !== 365 && length !== 366) {
    throw new RangeError(
      `mercedoniusYearLength: AUC year ${aucYear} spans ${length} days between equinox boundaries (expected 365 or 366)`
    );
  }
  return length;
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
// The two authoritative conversions (Standard §6)
// ─────────────────────────────────────────────────────────────

/**
 * Gregorian civil date → Mercedonius civil date (AUC).
 * Real conversion by day-count offset from the equinox year boundary —
 * never a month rename. Throws RangeError on invalid Gregorian input or
 * dates outside the supported equinox range.
 */
export function gregorianToMercedonius(g: GregorianDate): MercedoniusDate {
  if (!isValidGregorianDate(g)) {
    throw new RangeError(
      `gregorianToMercedonius: invalid Gregorian date ${g.year}-${g.month}-${g.day}`
    );
  }
  // Public conversion contract: Gregorian years [1800, 2200]. The equinox
  // compute window is wider ([1799, 2201]) only so boundary year-lengths
  // close; we do not expose conversion outside [1800, 2200].
  if (g.year < SUPPORTED_GREGORIAN_MIN || g.year > SUPPORTED_GREGORIAN_MAX) {
    throw new RangeError(
      `gregorianToMercedonius: year ${g.year} outside supported conversion range [${SUPPORTED_GREGORIAN_MIN}, ${SUPPORTED_GREGORIAN_MAX}]`
    );
  }
  const aucYear = aucYearForGregorianDate(g);
  const startJDN = mercedoniusYearStartJDN(aucYear);
  const dateJDN = gregorianToJDN(g);
  const doy = dateJDN - startJDN; // 0-based day of Mercedonius year

  // doy should always be in [0, yearLength) if we found the right boundary,
  // but guard defensively.
  const yearLength = mercedoniusYearLength(aucYear);
  if (doy < 0 || doy >= yearLength) {
    throw new RangeError(
      `gregorianToMercedonius: day-of-year ${doy} outside [0, ${yearLength}) for AUC ${aucYear}`
    );
  }

  if (doy < MONTHS_DAYS) {
    return {
      year: aucYear,
      month: Math.floor(doy / DAYS_PER_MONTH) + 1,
      day: (doy % DAYS_PER_MONTH) + 1,
    };
  }
  // Special days outside the months: doy 364 = Year Day, doy 365 = Leap Day.
  return { year: aucYear, month: 0, day: doy - MONTHS_DAYS + 1 };
}

/**
 * Mercedonius civil date → Gregorian civil date.
 * Exact inverse of gregorianToMercedonius. Throws RangeError on invalid
 * Mercedonius input (no clamping, ever). Rejects Leap Day in non-leap years
 * and any day ≥ 29 in named months.
 */
export function mercedoniusToGregorian(m: MercedoniusDate): GregorianDate {
  if (!isValidMercedoniusDate(m)) {
    throw new RangeError(
      `mercedoniusToGregorian: invalid Mercedonius date ${m.year}-${m.month}-${m.day}`
    );
  }
  const startJDN = mercedoniusYearStartJDN(m.year);
  const doy =
    m.month === 0
      ? MONTHS_DAYS + m.day - 1 // doy 364 (Year Day) or 365 (Leap Day)
      : (m.month - 1) * DAYS_PER_MONTH + (m.day - 1);
  const yearLength = mercedoniusYearLength(m.year);
  if (doy >= yearLength) {
    throw new RangeError(
      `mercedoniusToGregorian: day-of-year ${doy} >= year length ${yearLength} for AUC ${m.year}`
    );
  }
  const result = jdnToGregorian(startJDN + doy);
  // Public conversion contract: only Gregorian years [1800, 2200] are in
  // scope. Boundary AUC years (e.g. 2552 starts in 1799, 2953 ends in 2201)
  // partially fall outside; reject those specific dates rather than clamp.
  if (result.year < SUPPORTED_GREGORIAN_MIN || result.year > SUPPORTED_GREGORIAN_MAX) {
    throw new RangeError(
      `mercedoniusToGregorian: AUC ${m.year}-${m.month}-${m.day} maps to Gregorian ${result.year}, outside supported conversion range [${SUPPORTED_GREGORIAN_MIN}, ${SUPPORTED_GREGORIAN_MAX}]`
    );
  }
  return result;
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
