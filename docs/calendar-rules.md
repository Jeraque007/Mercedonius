# Mercedonius Calendar — Formal Rule Specification

> **Identity statement.** Mercedonius, as implemented by this platform, is a
> **modern reconstructed calendar system**. It is not a historically attested
> calendar. Nothing in this document should be read as a claim about ancient
> Roman, or any other, historical practice. Any user-facing surface that
> presents Mercedonius dates must carry this caveat.

Machine-readable source of truth: `lib/mercedonius-rules.ts`.
This document and that module must be kept in sync; the module wins on conflict.

---

## 1. Structural rules (BASELINE — decided, build against these)

| # | Rule | Value | Status |
|---|------|-------|--------|
| 1 | Month count | 13 named months | baseline |
| 2 | Month length | 28 days each (fixed) | baseline |
| 3 | Regular year | 13 × 28 = 364 days **plus 1 year-boundary day outside the months** = 365 | baseline |
| 4 | First month | Martius (month 1); Intercalaris is month 13 | baseline |
| 5 | Weekday cycle | Continuous 7-day cycle, never reset at month or year boundaries | baseline |
| 6 | Year-boundary day(s) | 1 day always; a 2nd **adjustment day** in qualifying years → 366-day years | baseline (see §5 for the proposed qualification rule) |

Month order (names reused from the platform's existing `month-config.ts`,
compile-time guarded to remain 13 entries):

1. Martius · 2. Aprilis · 3. Maius · 4. Iunius · 5. Quintilis · 6. Sextilis ·
7. September · 8. October · 9. November · 10. December · 11. Ianuarius ·
12. Februarius · 13. Intercalaris

**Year shape:**

```
[Martius … Intercalaris  (13 × 28 = 364 days)]
[Year-boundary day]              ← always present, outside all months
[Adjustment day]                 ← only in qualifying (leap) years
```

Derived property (asserted by tests later): because 28 = 4 × 7, **every month
begins on the same weekday**, every year.

## 2. Weekday mapping (BASELINE)

- Seven-day continuous cycle; **no reset** at month or year boundaries.
- Alignment: a Mercedonius day's weekday = weekday of the Gregorian day of the
  same instant, computed as **Julian Day Number mod 7** (structural continuity;
  never re-derived from month arithmetic).
- Names: platform's existing Sunday-first convention (`DAYS_OF_WEEK` in
  `month-config.ts`). The Chaldean-order planet association is content data in
  `data/astrology.ts`, not a calendar rule.

## 3. Epoch (PROPOSED — PENDING EXPLICIT APPROVAL)

**Proposal, not yet approved.** Anchor the Mercedonius day-count to Gregorian
**March 1** of a reference year. Proposed concrete anchor:

- Gregorian `2000-03-01` → Julian Day Number (noon) **2451605.0**
  (= J2000.0, 2451545.0, + 60 days).

This is a *convention*, chosen for arithmetic convenience, not a historical
claim. The reference-year choice (2000) is itself part of the proposal.

**Implementation status (Point 2):** the authoritative engine
(`lib/mercedonius/engine.ts`) implements this anchor as the *working*
convention, because reversible conversion + automated tests were directed
in Point 2. The anchor is consumed in exactly one place (`EPOCH_ANCHOR_JDN`,
cross-checked against `EPOCH_PROPOSAL` by the test suite); amending or
rejecting the proposal later is a single-constant change with no
re-architecting. Displayed dates remain **provisional** until §3–§5
approval is granted.

## 4. Year numbering (PROPOSED — PENDING EXPLICIT APPROVAL)

- A Mercedonius year **begins at the start of Gregorian March 1**.
- Year N of Mercedonius is numbered by the Gregorian year containing its start.
- **Consequence:** Gregorian January–February dates belong to the **tail of the
  previous Mercedonius year** (they fall after the previous Intercalaris and
  before the next Martius — in the tail region that includes the year-boundary
  day(s); see §6 open question on intercalation position).

## 5. Leap-year / adjustment-day policy (PROPOSED — PENDING EXPLICIT APPROVAL)

- A qualifying ("leap") year receives the **second (adjustment) year-boundary
  day**, making it 366 days.
- Qualification (precise): Mercedonius year Y spans Gregorian March 1 Y →
  (just before) March 1 Y+1 and therefore contains Gregorian year Y+1's
  February. **Year Y qualifies iff Gregorian year Y+1 is leap** under the
  Gregorian rule: **divisible by 4, except century years not divisible by 400.**
  (Implemented as `isMercedoniusLeapYear` in the engine.)
- Derived, engine-verified placement: Februarius 28 of year Y falls on
  Gregorian February 27 of Y+1; the **year-boundary day(s) are exactly
  Gregorian February 28 of Y+1 (always) and February 29 of Y+1 (leap years)**.
- Resulting mean year: **365.2425 days** — identical to the Gregorian mean, so
  the two calendars are **drift-free against each other indefinitely** under
  this policy (tested: 400-year spans sum to exactly 146097 days).

## 6. Open decisions

1. **Epoch approval** (§3) — approve, modify the anchor year, or choose
   differently. ⚠️ Still open; validation (round-trips, year-length
   invariants, weekday-continuity) is now **implemented and passing** in
   `tests/mercedonius-engine.test.ts`.
2. **Year-boundary day name** — "Year-Boundary Day" is a working label only.
3. **Intercalaris semantics** — under the baseline, Intercalaris is a regular
   28-day month (month 13), NOT an intercalary insertion; the intercalary
   function is served by the year-boundary/adjustment day(s). The name
   "Intercalaris" is retained for continuity with the platform's existing
   month set; its appropriateness can be revisited.
4. **Timezone policy** — ✅ **RESOLVED by the Point 2 directive**: astronomical
   instants are stored/compared in **UTC**; a calendar day is a civil date in
   ONE explicit IANA zone (the user's selected location zone, defaulting to
   the device zone until location selection is wired); instants convert to
   local civil time for display only; all calendar arithmetic runs on
   civil-date structs (never JS Date clamping or implicit local behaviour).
   Codified in `lib/time-policy.ts`. Remaining wiring: pass the user's
   selected zone when location selection lands.

## 7. Implementation status (Point 1 freeze → superseded by Point 2)

- ✅ **Conversion exists**: `lib/mercedonius/engine.ts` is the single
  authoritative implementation — pure integer-JDN civil-date arithmetic,
  reversible by construction, validated by brute-force round-trips over
  1900–2100 (`tests/mercedonius-engine.test.ts`, run via `npm test`).
- ✅ **Legacy relabeling removed**: the duplicate month-renaming functions in
  `lib/date-utils.ts` and `lib/astronomy/calendar-day-astronomy.ts` were
  deleted; all call sites (page, birth-sky, month grid, calendar service,
  astronomy day view) now route through the engine. Relabeling must not be
  reintroduced or cited as an implementation of this spec.
- ✅ **Explicit time policy**: `lib/time-policy.ts` (see §6.4).
- ⏳ **Provisional values**: because §3–§5 remain `proposed-pending-approval`,
  every displayed Mercedonius date is provisional until approval; amendments
  to the epoch/leap constants propagate automatically (single source of
  truth, `lib/mercedonius-rules.ts`).
- ⛔ **Still on hold (later audit points)**: visual dial redesign,
  eclipse/season hard-coded data replacement, backdrop-asset migration to
  `public/`.

## 8. Astronomy classification reminder (context, not rules)

Real computed values (Meeus-style): solar/lunar positions, rising/ascendant.
Sourced static tables: IAU constellation boundaries, planetary orbital
elements, weekday/Chaldean content. Hard-coded illustrative data (flagged, to
be replaced later): eclipse catalog, fixed equinox/solstice instants.
