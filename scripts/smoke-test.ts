/**
 * Smoke Test for the Mercedonius Calendar Engine
 *
 * Validates date conversion, lunar calculations, and day detail assembly
 * at runtime — including the previously broken recursive wrapper functions.
 *
 * Run with: npx tsx scripts/smoke-test.ts
 */

import {
  getDayDetail,
  convert13MonthToGregorian,
  convertGregorianTo13Month,
  gregorianToMercedonius,
  mercedoniusToGregorian,
  isValidMercedoniusDate,
  formatDateForDisplay,
  getNextNewMoon,
  getNextFullMoon,
  get13MonthName,
  getMoonIconForDate,
  getDayNameForDate,
} from '../lib/calendar-service';

let failures = 0;

function check(name: string, cond: boolean, info?: unknown): void {
  if (cond) {
    console.log(`PASS  ${name}`);
  } else {
    failures++;
    console.error(`FAIL  ${name}`, info ?? '');
  }
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  const ka = Object.keys(a as Record<string, unknown>);
  const kb = Object.keys(b as Record<string, unknown>);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
}

const today = new Date();

// ── Day detail assembly (exercises the old recursion paths) ──
const detail = getDayDetail(today);
check('getDayDetail returns valid Mercedonius month (0=boundary, 1-13=months)', detail.monthDay.month >= 0 && detail.monthDay.month <= 13, detail.monthDay);
check('day of week is non-empty', detail.dayOfWeek.length > 0, detail.dayOfWeek);
check('moon illumination between 0-100', detail.moon.illumination >= 0 && detail.moon.illumination <= 100, detail.moon.illumination);
check('moon age between 0-30 days', detail.moon.age >= 0 && detail.moon.age < 30, detail.moon.age);
check(
  'lunar distance plausible (350k-410k km)',
  detail.lunarPosition.distance > 350000 && detail.lunarPosition.distance < 410000,
  detail.lunarPosition.distance
);
check('events is an array', Array.isArray(detail.events));

// ── Mercedonius → Gregorian conversion (engine-routed, Point 2) ──
// AUC year = Gregorian equinox-year + 753; AUC 2779 ⇔ Gregorian 2026 (post-equinox).
const martius14 = convert13MonthToGregorian(1, 14, 2779);
const martius14Back = gregorianToMercedonius({
  year: martius14.getFullYear(),
  month: martius14.getMonth() + 1,
  day: martius14.getDate(),
});
check('Martius 14 AUC 2779 round-trips to itself', deepEqual(martius14Back, { year: 2779, month: 1, day: 14 }), martius14Back);

const ianuarius1 = convert13MonthToGregorian(11, 1, 2779);
const ianuarius1Back = gregorianToMercedonius({
  year: ianuarius1.getFullYear(),
  month: ianuarius1.getMonth() + 1,
  day: ianuarius1.getDate(),
});
check('Ianuarius 1 AUC 2779 round-trips to itself', deepEqual(ianuarius1Back, { year: 2779, month: 11, day: 1 }), ianuarius1Back);

let rejectedInvalid = false;
try {
  mercedoniusToGregorian({ year: 2779, month: 10, day: 31 }); // invalid: months have ≤28 days
} catch {
  rejectedInvalid = true;
}
check('invalid Mercedonius date rejected (no clamping)', rejectedInvalid);

// ── Gregorian → Mercedonius conversion (round trip; AUC year = G + 753) ──
const oct15 = new Date(Date.UTC(2026, 9, 15, 12)); // 2026-10-15 UTC → after the 2026 equinox → AUC 2779
const mdOct = convertGregorianTo13Month(oct15);
check('Oct 15 2026 → AUC 2779 (post-equinox: G + 753)', mdOct.year === 2026 + 753, mdOct);
check('Oct 15 2026 round-trips', deepEqual(mercedoniusToGregorian(mdOct), { year: 2026, month: 10, day: 15 }));

const jan1 = new Date(Date.UTC(2026, 0, 1, 12)); // 2026-01-01 → before the 2026 equinox → AUC 2778
const mdJan = convertGregorianTo13Month(jan1);
check('Jan 1 2026 → AUC 2778 (pre-equinox: (G-1) + 753)', mdJan.year === 2025 + 753, mdJan);
check('Jan 1 2026 round-trips', deepEqual(mercedoniusToGregorian(mdJan), { year: 2026, month: 1, day: 1 }));

// Gregorian out of supported equinox range is rejected, never clamped.
let rejectedOutOfRange = false;
try {
  gregorianToMercedonius({ year: 1799, month: 6, day: 1 });
} catch {
  rejectedOutOfRange = true;
}
check('pre-1800 Gregorian rejected', rejectedOutOfRange);

// ── Formatting helpers ──
check('formatDateForDisplay non-empty', formatDateForDisplay(today).length > 0, formatDateForDisplay(today));
check('get13MonthName(1) = Martius', get13MonthName(1) === 'Martius', get13MonthName(1));
check('get13MonthName(13) = Intercalaris', get13MonthName(13) === 'Intercalaris', get13MonthName(13));
check('getMoonIconForDate returns emoji', getMoonIconForDate(today).length > 0, getMoonIconForDate(today));
check('getDayNameForDate returns day name', getDayNameForDate(today).length > 0, getDayNameForDate(today));

// ── Lunar event lookahead ──
const nextNewMoon = getNextNewMoon(today);
check('next new moon is in the future', nextNewMoon.getTime() > today.getTime(), nextNewMoon.toISOString());
check(
  'next new moon within ~30 days',
  nextNewMoon.getTime() - today.getTime() <= 31 * 86400000,
  nextNewMoon.toISOString()
);

const nextFullMoon = getNextFullMoon(today);
check('next full moon is in the future', nextFullMoon.getTime() > today.getTime(), nextFullMoon.toISOString());
const separationDays = Math.abs(nextFullMoon.getTime() - nextNewMoon.getTime()) / 86400000;
check(
  'full moon ~14.77 days from new moon',
  Math.abs(separationDays - 14.765295) < 0.01,
  separationDays
);

// ── Summary ──
if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log('\nAll smoke tests passed.');
