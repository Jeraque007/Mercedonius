/**
 * Explicit Time Policy (redesign Point 2)
 * =======================================
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

import { gregorianToJDN, jdnToGregorian, type GregorianDate } from './mercedonius/engine';

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
 * Resolve an instant to its civil date in UTC — used for calendar
 * conversions where the Standard's boundaries are defined on UTC calendar
 * dates (March equinox). No local-zone interpretation.
 */
export function utcCivilDate(instant: Date): GregorianDate {
  if (!(instant instanceof Date) || Number.isNaN(instant.getTime())) {
    throw new RangeError('utcCivilDate: expected a valid Date instant');
  }
  return {
    year: instant.getUTCFullYear(),
    month: instant.getUTCMonth() + 1,
    day: instant.getUTCDate(),
  };
}

/**
 * Integer JDN of the UTC calendar day containing the instant — for
 * UTC-domain day indexing (astronomical event day windows, JD math).
 */
export function utcJDN(instant: Date): number {
  if (!(instant instanceof Date) || Number.isNaN(instant.getTime())) {
    throw new RangeError('utcJDN: expected a valid Date instant');
  }
  return gregorianToJDN(utcCivilDate(instant));
}

// ─────────────────────────────────────────────────────────────
// Zone-aware civil ↔ instant bridging (redesign Point 4)
// ─────────────────────────────────────────────────────────────

const OFFSET_FORMATTERS = new Map<string, Intl.DateTimeFormat>();

function getOffsetFormatter(timeZone?: string): Intl.DateTimeFormat {
  const key = timeZone ?? '<device>';
  let fmt = OFFSET_FORMATTERS.get(key);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    OFFSET_FORMATTERS.set(key, fmt);
  }
  return fmt;
}

/**
 * UTC offset (ms) of the zone at the given instant, e.g. +7200000 for
 * UTC+2. Positive east of Greenwich. Correct across DST transitions
 * because it interrogates the zone at the instant itself.
 */
export function zoneOffsetMs(instant: Date, timeZone?: string): number {
  if (!(instant instanceof Date) || Number.isNaN(instant.getTime())) {
    throw new RangeError('zoneOffsetMs: expected a valid Date instant');
  }
  const parts = getOffsetFormatter(timeZone).formatToParts(instant);
  let year = 1970;
  let month = 1;
  let day = 1;
  let hour = 0;
  let minute = 0;
  let second = 0;
  for (const p of parts) {
    if (p.type === 'year') year = Number(p.value);
    else if (p.type === 'month') month = Number(p.value);
    else if (p.type === 'day') day = Number(p.value);
    else if (p.type === 'hour') hour = Number(p.value) % 24;
    else if (p.type === 'minute') minute = Number(p.value);
    else if (p.type === 'second') second = Number(p.value);
  }
  const asUTC = Date.UTC(year, month - 1, day, hour, minute, second);
  // Compare second-aligned epochs so millisecond residue can't skew the diff.
  const aligned = Math.floor(instant.getTime() / 1000) * 1000;
  return asUTC - aligned;
}

/**
 * Resolve a civil date + wall-clock time in an explicit zone to a UTC
 * instant. Two-pass offset correction handles DST edges (e.g. a wall time
 * inside a spring-forward gap resolves to the offset in force after the
 * transition — documented behaviour, never silently clamped by Date).
 */
export function zonedCivilToInstant(
  civilDate: { year: number; month: number; day: number },
  hour: number,
  minute: number,
  timeZone?: string
): Date {
  const naive = Date.UTC(civilDate.year, civilDate.month - 1, civilDate.day, hour, minute, 0);
  const off1 = zoneOffsetMs(new Date(naive), timeZone);
  const off2 = zoneOffsetMs(new Date(naive - off1), timeZone);
  return new Date(naive - off2);
}

/** First instant of the civil day (00:00) in the zone. */
export function startOfDayInstant(
  civilDate: { year: number; month: number; day: number },
  timeZone?: string
): Date {
  return zonedCivilToInstant(civilDate, 0, 0, timeZone);
}

/** First instant of the FOLLOWING civil day — the exclusive day bound. */
export function endOfDayInstant(
  civilDate: { year: number; month: number; day: number },
  timeZone?: string
): Date {
  const next = jdnToGregorian(gregorianToJDN(civilDate) + 1);
  return zonedCivilToInstant(next, 0, 0, timeZone);
}

const CLOCK_FORMATTERS = new Map<string, Intl.DateTimeFormat>();

function getClockFormatter(timeZone: string | undefined, hour12: boolean, withSeconds: boolean): Intl.DateTimeFormat {
  const key = `${timeZone ?? '<device>'}|${hour12 ? '12' : '24'}|${withSeconds ? 's' : 'm'}`;
  let fmt = CLOCK_FORMATTERS.get(key);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: hour12 ? 'h12' : 'h23',
      hour: '2-digit',
      minute: '2-digit',
      ...(withSeconds ? { second: '2-digit' as const } : {}),
    });
    CLOCK_FORMATTERS.set(key, fmt);
  }
  return fmt;
}

/**
 * Display-layer ONLY: render an instant as wall-clock time in the given
 * (or device) zone. Per policy §3, this is where instants become local —
 * never inside arithmetic.
 */
export function formatInZone(
  instant: Date,
  timeZone?: string,
  opts: { hour12?: boolean; withSeconds?: boolean } = {}
): string {
  if (!(instant instanceof Date) || Number.isNaN(instant.getTime())) {
    throw new RangeError('formatInZone: expected a valid Date instant');
  }
  return getClockFormatter(timeZone, opts.hour12 ?? true, opts.withSeconds ?? false).format(instant);
}
