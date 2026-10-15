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
claim. No conversion code may consume `EPOCH_PROPOSAL` until approval is
granted. The reference-year choice (2000) is itself part of the proposal.

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
- Qualification mirrors the Gregorian leap rule of the anchor year:
  **divisible by 4, except century years not divisible by 400.**
- Resulting mean year: **365.2425 days** — identical to the Gregorian mean, so
  the two calendars are **drift-free against each other indefinitely** under
  this policy.

## 6. Open decisions (BLOCKING conversion & live wiring)

1. **Epoch approval** (§3) — approve, modify the anchor year, or choose
   differently. Validation plan after approval: round-trip conversion tests,
   year-length invariants (365/366), weekday-continuity assertions across
   every boundary.
2. **Year-boundary day name** — "Year Boundary Day" is a working label only.
3. **Intercalaris semantics** — under the baseline, Intercalaris is a regular
   28-day month (month 13), NOT an intercalary insertion; the intercalary
   function is served by the year-boundary/adjustment day(s). The name
   "Intercalaris" is retained for continuity with the platform's existing
   month set; its appropriateness can be revisited.
4. **Timezone policy** — local vs UTC for calendar-day boundaries (separate
   decision; affects conversion implementation, not the rules above).

## 7. Explicitly frozen until approval (Point 1 discipline)

- No Gregorian ⇄ Mercedonius conversion functions exist or may be added.
- No live date value is connected to the visual dial or any display.
- The legacy relabeling behavior in `lib/date-utils.ts` /
  `lib/astronomy/calendar-day-astronomy.ts` is **known-incorrect** (renaming,
  not conversion) and is quarantined for replacement in a later point; it must
  not be cited as an implementation of this spec.
- Visual redesign beyond the frozen parallel foundation is on hold until these
  rules are approved.

## 8. Astronomy classification reminder (context, not rules)

Real computed values (Meeus-style): solar/lunar positions, rising/ascendant.
Sourced static tables: IAU constellation boundaries, planetary orbital
elements, weekday/Chaldean content. Hard-coded illustrative data (flagged, to
be replaced later): eclipse catalog, fixed equinox/solstice instants.
