/**
 * Explicit Time Policy (redesign Point 2)
 * =======================================
 *
 * The platform mixes INSTANTS (astronomical moments) with CIVIL DATES
 * (calendar days). This module defines the one policy governing both:
 *
 *  1. INSTANTS — astronomical computations and event catalogues store and
 *     compare moments as UTC instants (JS `Date`, epoch milliseconds).
 *     An event's instant is never interpreted in a local zone.
 *  2. CIVIL DATES — a calendar day is a civil date resolved in ONE
 *     explicit IANA time zone: the user's selected location zone, or —
 *     until location selection is wired — the device zone (undefined
 *     timeZone ⇒ runtime default). Day boundaries follow that zone.
 *  3. DISPLAY — instants are converted to the selected zone's local civil
 *     time only at the presentation layer.
 *  4. CALENDAR ARITHMETIC — never uses JS `Date` month/day behaviour
 *     (no clamping, no implicit local time). It runs on civil-date structs
 *     via lib/mercedonius/engine.ts.
 *
 * Future wiring note: when user-selected locations are connected, pass the
 * location's IANA zone (e.g. via @photostructure/tz-lookup, already a
 * dependency) as the `timeZone` argument below. Astronomy keeps working in
 * UTC instants; only civil-date derivation and display consult the zone.
 */

import { gregorianToJDN, type GregorianDate } from './mercedonius/engine';

const CIVIL_DATE_FORMATTERS = new Map<string, Intl.DateTimeFormat>();

function getCivilDateFormatter(timeZone?: string): Intl.DateTimeFormat {
  const key = timeZone ?? '<device>';
  let fmt = CIVIL_DATE_FORMATTERS.get(key);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat('en-US', {
      timeZone, // undefined ⇒ device zone
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    CIVIL_DATE_FORMATTERS.set(key, fmt);
  }
  return fmt;
}

/**
 * Resolve an instant to the civil date in the given (or device) zone.
 * This is the ONLY sanctioned instant → civil-date bridge on the platform.
 */
export function localCivilDate(instant: Date, timeZone?: string): GregorianDate {
  if (!(instant instanceof Date) || Number.isNaN(instant.getTime())) {
    throw new RangeError('localCivilDate: expected a valid Date instant');
  }
  const parts = getCivilDateFormatter(timeZone).formatToParts(instant);
  let year = 0;
  let month = 0;
  let day = 0;
  for (const p of parts) {
    if (p.type === 'year') year = Number(p.value);
    else if (p.type === 'month') month = Number(p.value);
    else if (p.type === 'day') day = Number(p.value);
  }
  return { year, month, day };
}

/**
 * Integer JDN of the UTC calendar day containing the instant — for
 * UTC-domain day indexing (astronomical event day windows, JD math).
 */
export function utcJDN(instant: Date): number {
  if (!(instant instanceof Date) || Number.isNaN(instant.getTime())) {
    throw new RangeError('utcJDN: expected a valid Date instant');
  }
  return gregorianToJDN({
    year: instant.getUTCFullYear(),
    month: instant.getUTCMonth() + 1,
    day: instant.getUTCDate(),
  });
}
