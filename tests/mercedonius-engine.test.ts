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
  isValidMercedoniusDate,
  isValidGregorianDate,
  EPOCH_ANCHOR_JDN,
} from '../lib/mercedonius/engine';
import { EPOCH_PROPOSAL } from '../lib/mercedonius-rules';
import { convertGregorianTo13Month, convert13MonthToGregorian } from '../lib/date-utils';
import { utcJDN, localCivilDate } from '../lib/time-policy';

describe('epoch anchor (proposed convention)', () => {
  test('anchor is Gregorian 2000-03-01 = JD 2451605', () => {
    assert.equal(EPOCH_ANCHOR_JDN, 2451605);
    assert.equal(EPOCH_ANCHOR_JDN, EPOCH_PROPOSAL.anchorJulianDayNoon);
  });
  test('known JDN: 2000-01-01 = 2451545', () => {
    assert.equal(gregorianToJDN({ year: 2000, month: 1, day: 1 }), 2451545);
  });
  test('anchor maps to Martius 1 of year 2000', () => {
    assert.deepEqual(gregorianToMercedonius({ year: 2000, month: 3, day: 1 }), {
      year: 2000, month: 1, day: 1,
    });
  });
});

describe('weekday', () => {
  test('JDN 2451545 (2000-01-01) was a Saturday', () => {
    assert.equal(weekdayFromJDN(2451545), 6);
  });
  test('2026-10-15 was a Thursday', () => {
    assert.equal(weekdayOfGregorian({ year: 2026, month: 10, day: 15 }), 4);
  });
});

describe('round-trips: Gregorian ⇄ Mercedonius (brute force 1900–2100)', () => {
  const startJDN = gregorianToJDN({ year: 1900, month: 1, day: 1 });
  const endJDN = gregorianToJDN({ year: 2100, month: 12, day: 31 });

  test('every supported day survives G → M → G; weekday cycle never breaks', () => {
    for (let jdn = startJDN; jdn <= endJDN; jdn++) {
      const g = jdnToGregorian(jdn);
      const m = gregorianToMercedonius(g);
      assert.ok(isValidMercedoniusDate(m), `invalid M for G ${g.year}-${g.month}-${g.day}`);
      const back = mercedoniusToGregorian(m);
      assert.equal(back.year, g.year, `year mismatch at JDN ${jdn}`);
      assert.equal(back.month, g.month, `month mismatch at JDN ${jdn}`);
      assert.equal(back.day, g.day, `day mismatch at JDN ${jdn}`);
      if (jdn > startJDN) {
        assert.equal(
          weekdayFromJDN(jdn),
          (weekdayFromJDN(jdn - 1) + 1) % 7,
          `weekday continuity broken at JDN ${jdn}`
        );
      }
    }
  });

  test('every valid Mercedonius date survives M → G → M unchanged', () => {
    for (let year = 1900; year <= 2100; year++) {
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

describe('no-renaming property (conversion ≠ month relabeling)', () => {
  test('2026-10-15 → Mercedonius 2026 November 5 (not October 15)', () => {
    const m = gregorianToMercedonius({ year: 2026, month: 10, day: 15 });
    assert.deepEqual(m, { year: 2026, month: 9, day: 5 });
    assert.ok(!(m.month === 8 && m.day === 15));
  });
  test('2027-01-01 belongs to the tail of Mercedonius year 2026', () => {
    assert.deepEqual(
      gregorianToMercedonius({ year: 2027, month: 1, day: 1 }),
      { year: 2026, month: 11, day: 27 }
    );
  });
});

describe('year-boundary days (month 0)', () => {
  test('leap tail: Feb 28 & 29 2028 = boundary days 1 & 2 of year 2027', () => {
    assert.deepEqual(gregorianToMercedonius({ year: 2028, month: 2, day: 28 }), { year: 2027, month: 0, day: 1 });
    assert.deepEqual(gregorianToMercedonius({ year: 2028, month: 2, day: 29 }), { year: 2027, month: 0, day: 2 });
  });
  test('non-leap tail: Feb 28 2027 = boundary day 1 of year 2026', () => {
    assert.deepEqual(gregorianToMercedonius({ year: 2027, month: 2, day: 28 }), { year: 2026, month: 0, day: 1 });
  });
  test('boundary day 2 rejected in non-leap years', () => {
    assert.equal(isValidMercedoniusDate({ year: 2026, month: 0, day: 2 }), false);
    assert.equal(isValidMercedoniusDate({ year: 2027, month: 0, day: 2 }), true);
    assert.throws(() => mercedoniusToGregorian({ year: 2026, month: 0, day: 2 }), RangeError);
  });
});

describe('year length & drift invariants', () => {
  test('leap rule: Y leap ⟺ Gregorian Y+1 leap; lengths ∈ {365, 366}', () => {
    assert.equal(isMercedoniusLeapYear(2027), true);   // spans Gregorian Feb 2028
    assert.equal(isMercedoniusLeapYear(2026), false);  // spans Gregorian Feb 2027
    assert.equal(mercedoniusYearLength(2027), 366);
    assert.equal(mercedoniusYearLength(2026), 365);
    for (let y = 1900; y <= 2100; y++) {
      assert.ok([365, 366].includes(mercedoniusYearLength(y)));
    }
  });
  test('400-year span: year lengths sum = Gregorian day span = 146097 d', () => {
    let sum = 0;
    for (let y = 1900; y < 2300; y++) sum += mercedoniusYearLength(y);
    assert.equal(sum, mercedoniusYearStartJDN(2300) - mercedoniusYearStartJDN(1900));
    assert.equal(sum, 146097);
  });
  test('every month of a year starts on the same weekday (28 ≡ 0 mod 7)', () => {
    const first = weekdayOfGregorian(mercedoniusToGregorian({ year: 2026, month: 1, day: 1 }));
    for (let month = 2; month <= 13; month++) {
      assert.equal(weekdayOfGregorian(mercedoniusToGregorian({ year: 2026, month, day: 1 })), first);
    }
  });
});

describe('validation: explicit rejection, never clamping', () => {
  test('invalid Gregorian input throws', () => {
    assert.throws(() => gregorianToMercedonius({ year: 2026, month: 2, day: 30 }), RangeError);
    assert.throws(() => gregorianToMercedonius({ year: 2027, month: 2, day: 29 }), RangeError);
    assert.equal(isValidGregorianDate({ year: 2028, month: 2, day: 29 }), true);
  });
  test('invalid Mercedonius input throws (day 29/31 impossible)', () => {
    assert.throws(() => mercedoniusToGregorian({ year: 2026, month: 1, day: 29 }), RangeError);
    assert.throws(() => mercedoniusToGregorian({ year: 2026, month: 10, day: 31 }), RangeError);
    assert.throws(() => mercedoniusToGregorian({ year: 2026, month: 14, day: 1 }), RangeError);
  });
});

describe('app adapters route through the engine', () => {
  test('convertGregorianTo13Month → convert13MonthToGregorian round-trip', () => {
    const orig = new Date(2026, 9, 15); // local-midnight Date
    const md = convertGregorianTo13Month(orig);
    assert.deepEqual(md, { year: 2026, month: 9, day: 5 });
    const back = convert13MonthToGregorian(md.month, md.day, md.year);
    assert.equal(back.getTime(), orig.getTime());
  });
  test('legacy clamping replaced by rejection', () => {
    assert.throws(() => convert13MonthToGregorian(10, 31, 2026), RangeError);
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
  });
});
