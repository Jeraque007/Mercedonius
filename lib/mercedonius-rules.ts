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

/**
 * AUC epoch offset per Standard 1.0 Rev 3 §3:
 * AUC year = Gregorian year of the March equinox + 753.
 * Gregorian January–February dates before the equinox use G + 752.
 */
export const AUC_EPOCH_OFFSET = 753;

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
export type RuleStatus = 'baseline' | 'proposed-pending-approval' | 'superseded';

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
// Approved conventions (Standard 1.0 Rev 3)
// ─────────────────────────────────────────────────────────────

/**
 * Year boundary per Standard §2: UTC calendar date containing the March
 * equinox (Sun at 0° ecliptic longitude). Replaces the former proposed
 * Gregorian March 1 anchor.
 */
export const YEAR_BOUNDARY = {
  rule: 'march-equinox-utc-date' as const,
  description: 'UTC calendar date containing the March equinox instant',
  status: 'baseline' as RuleStatus,
} as const;

/**
 * Year numbering per Standard §3:
 * AUC = Gregorian year of the equinox + 753.
 * Dates before the equinox of year G use G + 752.
 * Continuous from Rome; no reset to Year 1.
 */
export const YEAR_NUMBERING = {
  rule: 'auc-gregorian-equinox-year-plus-753' as const,
  description: 'AUC year = Gregorian year of March equinox + 753; pre-equinox dates use G + 752',
  status: 'baseline' as RuleStatus,
} as const;

/**
 * Leap-year policy per Standard §4:
 * Year length = actual days between consecutive equinox boundaries (365 or 366).
 * Out-of-range intervals (364/367) flag an error, never fabricated.
 */
export const LEAP_POLICY = {
  rule: 'equinox-boundary-interval' as const,
  description: 'Year length = days between consecutive March equinox boundaries; must be 365 or 366',
  allowedLengths: [365, 366] as const,
  status: 'baseline' as RuleStatus,
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
    status: 'superseded',
    summary: 'Superseded by Standard §2: UTC calendar date of the March equinox.',
  },
  {
    rule: 'Year numbering (Gregorian year of the March 1 start)',
    status: 'superseded',
    summary: 'Superseded by Standard §3: AUC = Gregorian equinox year + 753.',
  },
  {
    rule: 'Leap-year / adjustment-day policy',
    status: 'superseded',
    summary: 'Superseded by Standard §4: year length = days between consecutive equinox boundaries (365/366).',
  },
  {
    rule: 'Year-boundary day (Year Day / Leap Day)',
    status: 'baseline',
    summary: 'Standard §5: month 0 special days; day 1 = Year Day always, day 2 = Leap Day leap years only.',
  },
];

/** Items deliberately NOT encoded in this module (later phases). */
export const NOT_YET_ENCODED: readonly string[] = [
  'Timezone policy (local vs UTC) for calendar-day boundaries',
  'Validation test suite against known correspondences',
];

