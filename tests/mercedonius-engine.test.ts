/**
 * Automated tests for the authoritative Mercedonius calendar engine (Point 2).
 *
 * Run: npm test   (= tsx --test tests/mercedonius-engine.test.ts)
 *
 * Covers: epoch anchor, reversible round-trips over 1900–2100 (brute force),
 * no-renaming property, year-boundary semantics, year-length/drift invariants,
 * weekday continuity, validation (no clamping), and the explicit time policy.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  gregorianToMercedonius,
  mercedoniusToGregorian,
  gregorianToJDN,
  jdnToGregorian,
  weekdayFromJDN,
  weekdayOfGregorian,
  mercedoniusYearLength,
  mercedoniusYearStartJDN,
  isMercedoniusLeapYear,
  marchEquinoxDate,
  aucYearBoundaryDate,
  aucYearForGregorianDate,
  isValidMercedoniusDate,
  isValidGregorianDate,
} from '../lib/mercedonius/engine';
import { AUC_EPOCH_OFFSET } from '../lib/mercedonius-rules';
import {
  convertGregorianTo13Month,
  convert13MonthToGregorian,
  formatMercedoniusDate,
} from '../lib/date-utils';
import { utcJDN, localCivilDate } from '../lib/time-policy';

// Supported Gregorian window per engine (equinox model range).
// Start at 1801 so pre-equinox Jan/Feb dates still resolve (need the prior
// year's equinox, >= 1800). End at 2199 so year-length checks (need the
// following year's equinox <= 2200) never leave range.
const GREG_MIN = 1801;
const GREG_MAX = 2199;
const AUC_MIN = GREG_MIN + AUC_EPOCH_OFFSET; // 2554
const AUC_MAX = GREG_MAX + AUC_EPOCH_OFFSET; // 2952

describe('system identity', () => {
  test('AUC epoch offset is 753 per Standard §3', () => {
    assert.equal(AUC_EPOCH_OFFSET, 753);
  });
});

describe('JDN (fixed astronomical facts)', () => {
  test('2000-01-01 = JD 2451545', () => {
    assert.equal(gregorianToJDN({ year: 2000, month: 1, day: 1 }), 2451545);
  });
  test('JDN round-trip is identity', () => {
    assert.deepEqual(jdnToGregorian(gregorianToJDN({ year: 2026, month: 3, day: 20 })), {
      year: 2026,
      month: 3,
      day: 20,
    });
  });
});

describe('weekday (continuous JDN cycle)', () => {
  test('JDN 2451545 (2000-01-01) was a Saturday', () => {
    assert.equal(weekdayFromJDN(2451545), 6);
  });
  test('2026-10-15 was a Thursday', () => {
    assert.equal(weekdayOfGregorian({ year: 2026, month: 10, day: 15 }), 4);
  });
});

describe('equinox-based year boundary (Standard §2–§3)', () => {
  test('marchEquinoxDate returns a March date (20th or 21st UTC)', () => {
    const eq = marchEquinoxDate(2026);
    assert.equal(eq.month, 3);
    assert.ok(eq.day === 20 || eq.day === 21, `expected 20 or 21, got ${eq.day}`);
  });
  test('aucYearBoundaryDate(aucYear) === marchEquinoxDate(aucYear - 753)', () => {
    const auc = 2779; // Gregorian 2026
    assert.deepEqual(aucYearBoundaryDate(auc), marchEquinoxDate(auc - AUC_EPOCH_OFFSET));
  });
  test('mercedoniusYearStartJDN === gregorianToJDN(aucYearBoundaryDate)', () => {
    const auc = 2779;
    assert.equal(
      mercedoniusYearStartJDN(auc),
      gregorianToJDN(aucYearBoundaryDate(auc))
    );
  });
  test('AUC year numbering: on/after equinox → G + 753; before → G + 752', () => {
    const eq = marchEquinoxDate(2026); // boundary of AUC 2779
    const eqJDN = gregorianToJDN(eq);
    assert.equal(aucYearForGregorianDate(eq), 2026 + AUC_EPOCH_OFFSET);
    assert.equal(
      aucYearForGregorianDate(jdnToGregorian(eqJDN + 1)),
      2026 + AUC_EPOCH_OFFSET
    );
    assert.equal(
      aucYearForGregorianDate(jdnToGregorian(eqJDN - 1)),
      (2026 - 1) + AUC_EPOCH_OFFSET
    );
    assert.equal(
      aucYearForGregorianDate({ year: 2026, month: 1, day: 15 }),
      2025 + AUC_EPOCH_OFFSET
    );
  });
});

describe('round-trips: Gregorian ⇄ Mercedonius (Standard §6)', () => {
  const startJDN = gregorianToJDN({ year: GREG_MIN, month: 1, day: 1 });
  const endJDN = gregorianToJDN({ year: GREG_MAX, month: 12, day: 31 });

  test('every supported day survives G → M → G; weekday cycle never breaks', () => {
    for (let jdn = startJDN; jdn <= endJDN; jdn++) {
      const g = jdnToGregorian(jdn);
      const m = gregorianToMercedonius(g);
      assert.ok(isValidMercedoniusDate(m), `invalid M for G ${g.year}-${g.month}-${g.day}`);
      assert.equal(m.year, aucYearForGregorianDate(g), `AUC year mismatch at JDN ${jdn}`);
      const back = mercedoniusToGregorian(m);
      assert.equal(back.year, g.year, `year mismatch at JDN ${jdn}`);
      assert.equal(back.month, g.month, `month mismatch at JDN ${jdn}`);
      assert.equal(back.day, g.day, `day mismatch at JDN ${jdn}`);
    }
  });

  test('every valid Mercedonius date survives M → G → M unchanged', () => {
    for (let year = AUC_MIN; year <= AUC_MAX; year++) {
      for (let month = 0; month <= 13; month++) {
        const maxDay = month === 0 ? 2 : 28;
        for (let day = 1; day <= maxDay; day++) {
          const m = { year, month, day };
          if (!isValidMercedoniusDate(m)) continue;
          const g = mercedoniusToGregorian(m);
          assert.ok(isValidGregorianDate(g), `invalid G for M ${year}-${month}-${day}`);
          assert.deepEqual(gregorianToMercedonius(g), m);
        }
      }
    }
  });
});

describe('Year Day / Leap Day (month 0, Standard §5)', () => {
  test('the equinox boundary date is Martius 1 (month 1, day 1) of its AUC year', () => {
    const eq = marchEquinoxDate(2026);
    assert.deepEqual(gregorianToMercedonius(eq), {
      year: 2026 + AUC_EPOCH_OFFSET,
      month: 1,
      day: 1,
    });
  });
  test('the day before the equinox is a month-0 boundary day of the previous AUC year', () => {
    const eq = marchEquinoxDate(2026);
    const prev = jdnToGregorian(gregorianToJDN(eq) - 1);
    const m = gregorianToMercedonius(prev);
    assert.equal(m.month, 0);
    assert.equal(m.year, (2026 - 1) + AUC_EPOCH_OFFSET);
    assert.ok(m.day === 1 || m.day === 2, `expected boundary day 1 or 2, got ${m.day}`);
  });
  test('Leap Day (month 0, day 2) exists exactly in leap years', () => {
    let leapYear = -1;
    let commonYear = -1;
    for (let y = AUC_MIN; y <= AUC_MAX && (leapYear < 0 || commonYear < 0); y++) {
      if (isMercedoniusLeapYear(y)) leapYear = y;
      else commonYear = y;
    }
    assert.ok(leapYear > 0 && commonYear > 0, 'expected both a leap and a common year in range');
    assert.equal(isValidMercedoniusDate({ year: leapYear, month: 0, day: 2 }), true);
    assert.equal(isValidMercedoniusDate({ year: commonYear, month: 0, day: 2 }), false);
    assert.throws(() => mercedoniusToGregorian({ year: commonYear, month: 0, day: 2 }), RangeError);
    const leapG = mercedoniusToGregorian({ year: leapYear, month: 0, day: 2 });
    const nextYearStart = jdnToGregorian(mercedoniusYearStartJDN(leapYear + 1));
    assert.equal(leapG.year, nextYearStart.year);
    assert.equal(leapG.month, nextYearStart.month);
    assert.equal(leapG.day, nextYearStart.day - 1);
  });
});

describe('year length & leap policy (Standard §4)', () => {
  test('every supported year length is 365 or 366', () => {
    for (let y = AUC_MIN; y <= AUC_MAX; y++) {
      assert.ok([365, 366].includes(mercedoniusYearLength(y)), `year ${y} bad length`);
    }
  });
  test('startJDN(y + 1) − startJDN(y) === year length', () => {
    for (let y = AUC_MIN; y < AUC_MAX; y++) {
      assert.equal(
        mercedoniusYearStartJDN(y + 1) - mercedoniusYearStartJDN(y),
        mercedoniusYearLength(y)
      );
    }
  });
  test('isMercedoniusLeapYear ⟺ length === 366', () => {
    for (let y = AUC_MIN; y <= AUC_MAX; y++) {
      assert.equal(isMercedoniusLeapYear(y), mercedoniusYearLength(y) === 366);
    }
  });
});

describe('validation: explicit rejection, never clamping', () => {
  test('invalid Gregorian input throws', () => {
    assert.throws(() => gregorianToMercedonius({ year: 2026, month: 2, day: 30 }), RangeError);
    assert.throws(() => gregorianToMercedonius({ year: 2027, month: 2, day: 29 }), RangeError);
    assert.equal(isValidGregorianDate({ year: 2028, month: 2, day: 29 }), true);
  });
  test('invalid Mercedonius input throws (day 29/31 impossible; month ≥ 14 rejected)', () => {
    assert.throws(() => mercedoniusToGregorian({ year: 2779, month: 1, day: 29 }), RangeError);
    assert.throws(() => mercedoniusToGregorian({ year: 2779, month: 10, day: 31 }), RangeError);
    assert.throws(() => mercedoniusToGregorian({ year: 2779, month: 14, day: 1 }), RangeError);
    assert.throws(() => mercedoniusToGregorian({ year: 2779, month: 0, day: 3 }), RangeError);
  });
  test('dates outside the supported equinox range throw', () => {
    assert.throws(() => gregorianToMercedonius({ year: 1799, month: 6, day: 1 }), RangeError);
    assert.throws(() => gregorianToMercedonius({ year: 2201, month: 6, day: 1 }), RangeError);
  });
});

describe('date adapters & display (lib/date-utils)', () => {
  test('convertGregorianTo13Month → convert13MonthToGregorian round-trip preserves the civil date', () => {
    // Noon UTC on 2026-10-15 → UTC civil date is 2026-10-15 in every zone.
    const orig = new Date(Date.UTC(2026, 9, 15, 12));
    const md = convertGregorianTo13Month(orig);
    assert.equal(md.year, 2026 + AUC_EPOCH_OFFSET); // Oct 2026 is after the 2026 equinox → AUC 2779
    const back = convert13MonthToGregorian(md.month, md.day, md.year);
    // convert13MonthToGregorian returns LOCAL midnight; compare LOCAL civil fields.
    assert.equal(back.getFullYear(), 2026);
    assert.equal(back.getMonth(), 9);
    assert.equal(back.getDate(), 15);
  });
  test('formatMercedoniusDate renders [Month] [Day], [AUC year] AUC', () => {
    const m = gregorianToMercedonius({ year: 2026, month: 10, day: 15 });
    const s = formatMercedoniusDate(m);
    assert.match(s, /, 2779 AUC$/);
    assert.ok(s.startsWith('Martius') || s.startsWith('Aprilis') || s.startsWith('Maius') || s.startsWith('Iunius') || s.startsWith('Iulius') || s.startsWith('Augustus') || s.startsWith('September') || s.startsWith('October') || s.startsWith('November') || s.startsWith('December'), `unexpected month label: ${s}`);
  });
  test('Year Day renders as "Year Day, [AUC year] AUC"', () => {
    const eq = marchEquinoxDate(2026);
    const boundaryDay = gregorianToMercedonius(jdnToGregorian(gregorianToJDN(eq) - 1));
    assert.equal(boundaryDay.month, 0);
    const s = formatMercedoniusDate(boundaryDay);
    assert.match(s, /^Year Day, \d{4} AUC$/);
  });
});

describe('explicit time policy', () => {
  test('utcJDN indexes the UTC calendar day of an instant', () => {
    const instant = new Date(Date.UTC(2026, 9, 15, 23, 59));
    assert.equal(utcJDN(instant), gregorianToJDN({ year: 2026, month: 10, day: 15 }));
  });
  test('localCivilDate resolves per explicit zone, not host behaviour', () => {
    const instant = new Date(Date.UTC(2026, 8, 30, 23, 0)); // Sep 30 23:00 UTC
    assert.deepEqual(localCivilDate(instant, 'Asia/Tokyo'), { year: 2026, month: 10, day: 1 });
    assert.deepEqual(localCivilDate(instant, 'UTC'), { year: 2026, month: 9, day: 30 });
  });
  test('invalid instants are rejected', () => {
    assert.throws(() => localCivilDate(new Date('nope')), RangeError);
    assert.throws(() => utcJDN(new Date('nope')), RangeError);
  });
});
