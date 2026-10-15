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

const today = new Date();

// ── Day detail assembly (exercises the old recursion paths) ──
const detail = getDayDetail(today);
check('getDayDetail returns 13-month month 1-13', detail.monthDay.month >= 1 && detail.monthDay.month <= 13, detail.monthDay);
check('day of week is non-empty', detail.dayOfWeek.length > 0, detail.dayOfWeek);
check('moon illumination between 0-100', detail.moon.illumination >= 0 && detail.moon.illumination <= 100, detail.moon.illumination);
check('moon age between 0-30 days', detail.moon.age >= 0 && detail.moon.age < 30, detail.moon.age);
check(
  'lunar distance plausible (350k-410k km)',
  detail.lunarPosition.distance > 350000 && detail.lunarPosition.distance < 410000,
  detail.lunarPosition.distance
);
check('events is an array', Array.isArray(detail.events));

// ── 13-Month → Gregorian conversion ──
const martius14 = convert13MonthToGregorian(1, 14, 2026);
check('Martius 14 2026 → March 14', martius14.getMonth() === 2 && martius14.getDate() === 14, martius14.toDateString());

const ianuarius1 = convert13MonthToGregorian(11, 1, 2026);
check('Ianuarius 1 2026 → January 1', ianuarius1.getMonth() === 0 && ianuarius1.getDate() === 1, ianuarius1.toDateString());

const december31 = convert13MonthToGregorian(10, 31, 2026);
check('December 31 2026 → Dec 31', december31.getMonth() === 11 && december31.getDate() === 31, december31.toDateString());

// ── Gregorian → 13-Month conversion (round trip) ──
const march14 = new Date(2026, 2, 14);
const md = convertGregorianTo13Month(march14);
check('March 14 → month 1 (Martius)', md.month === 1 && md.day === 14, md);

const jan1 = new Date(2026, 0, 1);
const mdJan = convertGregorianTo13Month(jan1);
check('January 1 → month 11 (Ianuarius)', mdJan.month === 11 && mdJan.day === 1, mdJan);

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
