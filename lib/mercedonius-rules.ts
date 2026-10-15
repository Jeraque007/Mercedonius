/**
 * Mercedonius Calendar — Formal Rule Definition
 * =============================================
 *
 * MERCEDONIUS IS A MODERN RECONSTRUCTED CALENDAR SYSTEM.
 * It is NOT a historically attested calendar. The rules encoded here are a
 * documented baseline specification for this platform; they are not claims
 * about ancient Roman or any other historical practice. Any user-facing
 * presentation of the calendar must carry this caveat
 * (see CALENDAR_SYSTEM_LABEL below).
 *
 * Scope of this module (redesign Point 1 — "rules before pixels"):
 *   - Define and document the calendar rules in ONE place (this file).
 *   - Attach explicit provenance/status metadata to every rule.
 *
 * Explicit non-scope (deliberately NOT here, pending approval of the
 * proposed rules — see docs/calendar-rules.md "Open Decisions"):
 *   - No date-conversion functions (Gregorian ⇄ Mercedonius).
 *   - No connection to any live date value or UI dial.
 *   - No timezone policy resolution.
 *   - No display name decided for the year-boundary day.
 *
 * Consumers must not treat EPOCH_PROPOSAL / YEAR_NUMBERING / LEAP_POLICY
 * as active until their status changes from 'proposed-pending-approval'.
 */

import { MONTH_NAMES, DAYS_OF_WEEK } from './month-config';

// ─────────────────────────────────────────────────────────────
// System identity
// ─────────────────────────────────────────────────────────────

/** Canonical system label. Always carry the reconstruction caveat when shown. */
export const CALENDAR_SYSTEM_LABEL =
  'Mercedonius — a modern reconstructed 13-month calendar system (not historically attested)';

// ─────────────────────────────────────────────────────────────
// Rule provenance

/**
 * Provenance status of each rule:
 *  - 'baseline'                   Decided structural baseline; stable enough
 *                                 for parallel (visual-foundation) work.
 *  - 'proposed-pending-approval'  A documented convention that REQUIRES
 *                                 explicit approval before any conversion
 *                                 code or live date value may consume it.
 */
export type RuleStatus = 'baseline' | 'proposed-pending-approval';

// ─────────────────────────────────────────────────────────────
// Structural rules (baseline)
// ─────────────────────────────────────────────────────────────

/** Thirteen named months. */
export const MONTH_COUNT = 13;

/** Each month contains exactly 28 days. */
export const DAYS_PER_MONTH = 28;

/** Days in the regular calendar year: 13 × 28 (year-boundary day excluded). */
export const REGULAR_MONTHS_DAYS = MONTH_COUNT * DAYS_PER_MONTH; // 364

/**
 * Compile-time guard: month-config must keep defining exactly 13 month
 * names, or this module fails to type-check.
 */
type AssertThirteenMonths = typeof MONTH_NAMES['length'] extends 13 ? true : never;
export const MONTH_NAMES_COUNT_CHECK: AssertThirteenMonths = true;

/** Compile-time guard: exactly seven weekday names. */
type AssertSevenWeekdays = typeof DAYS_OF_WEEK['length'] extends 7 ? true : never;
export const WEEKDAY_NAMES_COUNT_CHECK: AssertSevenWeekdays = true;

/** One entry per month, ordered Martius (1) … Intercalaris (13). */
export interface MercedoniusMonth {
  readonly number: number;
  readonly name: string;
  readonly daysPerMonth: 28;
}

export const MERCEDONIUS_MONTHS: readonly MercedoniusMonth[] = MONTH_NAMES.map(
  (name, index) => ({
    number: index + 1,
    name,
    daysPerMonth: DAYS_PER_MONTH,
  })
);

/**
 * Year structure (baseline):
 *   [ Martius … Intercalaris (13 × 28 = 364 days) ]
 *   [ Year-boundary day (always 1) ]
 *   [ Adjustment day (only in qualifying/leap years) ]
 * The boundary/adjustment day(s) lie OUTSIDE the thirteen months.
 */
export const YEAR_STRUCTURE = {
  firstMonth: 'Martius' as const,
  firstMonthNumber: 1 as const,
  /** Year-boundary day(s) after month 13, before the next Martius 1. */
  yearBoundaryDayCount: { min: 1, max: 2 } as const,
  /** Display name for the year-boundary day is intentionally undecided. */
  yearBoundaryDayStatus: 'proposed-pending-approval' as RuleStatus,
  proposedYearBoundaryDayName: 'Year Boundary Day' as const,
  status: 'baseline' as RuleStatus,
} as const;

/** Total year length once the boundary-day rule is applied. */
export const YEAR_LENGTHS = {
  /** 364 + 1 boundary day. */
  regular: REGULAR_MONTHS_DAYS + 1, // 365
  /** 364 + 1 boundary day + 1 adjustment day (qualifying years). */
  leap: REGULAR_MONTHS_DAYS + 2, // 366
} as const;

// ─────────────────────────────────────────────────────────────
// Weekday rule (baseline)
// ─────────────────────────────────────────────────────────────

export const WEEKDAY_RULES = {
  /** Seven-day cycle. */
  cycleLength: 7 as const,
  /** The cycle is continuous and NEVER resets at month or year boundaries. */
  continuousAcrossBoundaries: true as const,
  /**
   * 28 = 4 × 7 ⇒ every Mercedonius month begins on the same weekday.
   * (Derived property, stated here so tests can assert it.)
   */
  monthStartsSameWeekday: true as const,
  /**
   * Alignment convention: the weekday of a Mercedonius day equals the
   * weekday of the Gregorian day sharing that instant (Julian-Day
   * continuity, JDN mod 7). The weekday cycle is never re-derived from
   * month arithmetic, so continuity is structural.
   */
  alignment: 'julian-day-continuity' as const,
  status: 'baseline' as RuleStatus,
} as const;

/** Weekday names, Sunday-first, matching the platform's existing convention. */
export const WEEKDAY_NAMES: readonly string[] = DAYS_OF_WEEK;

// ─────────────────────────────────────────────────────────────
// Proposed conventions — REQUIRE EXPLICIT APPROVAL
// ─────────────────────────────────────────────────────────────

/**
 * PROPOSED initial epoch convention (pending approval and validation).
 *
 * Proposal: anchor the Mercedonius day-count to Gregorian March 1 of a
 * reference year; Mercedonius year N begins on Gregorian March 1 of
 * Gregorian year N.
 *
 * WARNING: 'proposed-pending-approval'. Conversion code MUST NOT be
 * written against this constant until it is explicitly approved.
 */
export const EPOCH_PROPOSAL = {
  /** Proposed anchor: Gregorian 2000-03-01 (noon UTC reference). */
  anchorGregorianDate: '2000-03-01' as const,
  /** Julian Day Number (noon) of the proposed anchor: J2000.0 (2451545.0) + 60 days. */
  anchorJulianDayNoon: 2451605.0,
  status: 'proposed-pending-approval' as RuleStatus,
} as const;

/**
 * PROPOSED year-numbering policy (pending approval):
 * a Mercedonius year is numbered by the Gregorian year containing its
 * Martius 1 start. Consequence: Gregorian January–February dates belong
 * to the TAIL of the PREVIOUS Mercedonius year.
 */
export const YEAR_NUMBERING = {
  startsOnGregorian: 'March 1' as const,
  numberRule: 'gregorian-year-of-start' as const,
  januaryFebruaryBelongToPreviousYear: true as const,
  status: 'proposed-pending-approval' as RuleStatus,
} as const;

/**
 * PROPOSED leap-year policy (pending approval):
 * a qualifying ("leap") year receives the second (adjustment) year-boundary
 * day. Qualification mirrors the Gregorian leap rule of the anchor year
 * (divisible by 4, except centuries not divisible by 400). This yields year
 * lengths of 365/366 days and a mean year of 365.2425 d — drift-free
 * against the Gregorian calendar.
 */
export const LEAP_POLICY = {
  adjustmentDayInQualifyingYears: true as const,
  gregorianLeapRule: 'divisible-by-4-unless-by-100-unless-by-400' as const,
  meanYearDays: 365.2425,
  status: 'proposed-pending-approval' as RuleStatus,
} as const;

// ─────────────────────────────────────────────────────────────
// Provenance ledger
// ─────────────────────────────────────────────────────────────

export interface RuleEntry {
  readonly rule: string;
  readonly status: RuleStatus;
  readonly summary: string;
}

/** Single audit-friendly ledger of every encoded rule and its status. */
export const RULES_PROVENANCE: readonly RuleEntry[] = [
  {
    rule: 'Thirteen named months (Martius … Intercalaris)',
    status: 'baseline',
    summary: 'MONTH_COUNT = 13; names sourced from month-config (compile-time guarded).',
  },
  {
    rule: 'Each month = 28 days',
    status: 'baseline',
    summary: 'DAYS_PER_MONTH = 28; fixed for all thirteen months.',
  },
  {
    rule: '364-day regular year + year-boundary day outside the months',
    status: 'baseline',
    summary: 'Regular year = 364 + 1 boundary day = 365; leap years add one adjustment day (366).',
  },
  {
    rule: 'Martius is the first month',
    status: 'baseline',
    summary: 'Month 1 = Martius, month 13 = Intercalaris.',
  },
  {
    rule: 'Continuous 7-day weekday cycle across all boundaries',
    status: 'baseline',
    summary: 'Julian-Day continuity (JDN mod 7); 28-day months ⇒ same start weekday each month.',
  },
  {
    rule: 'March 1 Gregorian anchor (epoch convention)',
    status: 'proposed-pending-approval',
    summary: 'EPOCH_PROPOSAL: anchor Gregorian 2000-03-01 (JD 2451605.0 noon). Not yet approved; not consumed by any code.',
  },
  {
    rule: 'Year numbering (Gregorian year of the March 1 start)',
    status: 'proposed-pending-approval',
    summary: 'YEAR_NUMBERING: Jan–Feb belong to the tail of the previous Mercedonius year.',
  },
  {
    rule: 'Leap-year / adjustment-day policy',
    status: 'proposed-pending-approval',
    summary: 'LEAP_POLICY: Gregorian leap rule of the anchor year; mean year 365.2425 d.',
  },
  {
    rule: 'Year-boundary day display name',
    status: 'proposed-pending-approval',
    summary: 'Working label only: "Year Boundary Day". Intentionally undecided.',
  },
];

/** Items deliberately NOT encoded in this module (later phases). */
export const NOT_YET_ENCODED: readonly string[] = [
  'Gregorian ⇄ Mercedonius conversion functions (await rule approval)',
  'Timezone policy (local vs UTC) for calendar-day boundaries',
  'Connection of live date values to the UI dial (frozen until approval)',
  'Validation test suite against known correspondences',
];

