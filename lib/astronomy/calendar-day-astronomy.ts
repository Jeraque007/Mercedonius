/**
 * Calendar Day with Astronomical Data
 *
 * Integrates astronomical calculations with the Mercedonius calendar day view.
 */

import { getSunEquatorialPosition, getSunConstellation } from './sun';
import { getMoonEquatorialPosition, getMoonConstellation, getMoonPhase } from './moon';
import { getConstellationByName } from './constellations';
import { getAstronomicalEventsForDate } from '../eclipses';
import { getComputedEventsInWindow } from '../events';
import type { DataProvenance } from '../provenance';
import type {
  CalendarDayWithAstronomy,
  ConstellationResult,
  AstronomicalEvent,
} from './types';
import { DAYS_OF_WEEK } from '../month-config';
import { gregorianToMercedonius, weekdayOfGregorian } from '../mercedonius/engine';
import { localCivilDate } from '../time-policy';

export function getCalendarDayWithAstronomy(date: Date, timeZone?: string): CalendarDayWithAstronomy {
  // Explicit time policy (Point 2 / Point 4):
  //  - the CALENDAR day = the instant's civil date in the SELECTED
  //    location's zone (or the device zone when none is wired);
  //    converted by the authoritative engine only.
  //  - the day WINDOW for UTC-domain events = UTC midnight → UTC midnight.
  const civilDate = localCivilDate(date, timeZone);
  const dayStart = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const dayEnd = dayStart + 86400000;

  const sunPos = getSunEquatorialPosition(date);
  const sunConst = getSunConstellation(date);

  const moonPhase = getMoonPhase(date);
  const moonEq = getMoonEquatorialPosition(date);

  // Moon's IAU constellation, computed from the Moon's current ecliptic longitude
  const moonConstResult: ConstellationResult = getMoonConstellation(date).constellationResult;

  // Eclipse candidates — ILLUSTRATIVE by design (Point 4): the eclipse
  // list is a fixed sample, not verified eclipse data; provenance makes
  // that explicit everywhere it is displayed.
  const eclipseEvents: AstronomicalEvent[] = getAstronomicalEventsForDate(
    date,
    date.getUTCFullYear()
  ).map((e) => ({ ...e, provenance: 'illustrative' as DataProvenance }));
  const hasSolar = eclipseEvents.some((e) => e.type === 'solar_eclipse');
  const hasLunar = eclipseEvents.some((e) => e.type === 'lunar_eclipse');
  const eclipseStatus: CalendarDayWithAstronomy['eclipseStatus'] =
    hasSolar && hasLunar ? 'both' : hasSolar ? 'solar' : hasLunar ? 'lunar' : 'none';

  // Computed events (seasonal λ crossings + lunar phase instants) inside
  // this day's window — live, provenance 'live' (Point 4).
  const computedEvents: AstronomicalEvent[] = getComputedEventsInWindow(
    new Date(dayStart),
    new Date(dayEnd)
  );

  return {
    gregorian: date,
    monthDay: gregorianToMercedonius(civilDate),
    dayOfWeek: DAYS_OF_WEEK[weekdayOfGregorian(civilDate)],
    sun: sunPos,
    sunConstellation: sunConst.constellationResult,
    moonPhase,
    moonConstellation: moonConstResult,
    moonDistanceKm: moonEq.distanceKm,
    moonIllumination: moonPhase.illumination,
    eclipseStatus,
    astronomicalEvents: [...computedEvents, ...eclipseEvents],
  };
}

// Calendar conversion & weekday naming are owned by the authoritative
// engine (lib/mercedonius/engine.ts). The former duplicate relabeling
// implementation that lived here was REMOVED in redesign Point 2.

export function getSeasonalEventsForWindow(
  _date: Date,
  windowStart: number,
  windowEnd: number
): AstronomicalEvent[] {
  // Compat wrapper (Point 4): the fixed "noon UTC" table is GONE. This now
  // returns the live-computed events (seasonal crossings + lunar phase
  // instants) inside the window, each carrying provenance.
  return getComputedEventsInWindow(new Date(windowStart), new Date(windowEnd));
}

/**
 * Astrological sign → IAU constellation name.
 * Most sign names match their constellation, except Capricorn/Capricornus.
 */
const SIGN_TO_CONSTELLATION: Record<string, string> = {
  Capricorn: 'Capricornus',
};

export function getTraditionalZodiacSign(date: Date): { sign: string; constellation: string; isSame: boolean } {
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  const traditionalSigns = [
    { sign: 'Aries', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
    { sign: 'Taurus', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
    { sign: 'Gemini', startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
    { sign: 'Cancer', startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
    { sign: 'Leo', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
    { sign: 'Virgo', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
    { sign: 'Libra', startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
    { sign: 'Scorpius', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
    { sign: 'Sagittarius', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
    { sign: 'Capricorn', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
    { sign: 'Aquarius', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
    { sign: 'Pisces', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
  ];

  let sign = 'Capricorn';
  for (const s of traditionalSigns) {
    const afterStart = month > s.startMonth || (month === s.startMonth && day >= s.startDay);
    const beforeEnd = month < s.endMonth || (month === s.endMonth && day <= s.endDay);
    // Capricorn wraps the year end (Dec 22 → Jan 19); all others are contiguous.
    const inRange =
      s.startMonth <= s.endMonth ? afterStart && beforeEnd : afterStart || beforeEnd;
    if (inRange) {
      sign = s.sign;
      break;
    }
  }

  const astronomicalConstName = SIGN_TO_CONSTELLATION[sign] ?? sign;
  const astronomicalConst = getConstellationByName(astronomicalConstName);
  const constellation = astronomicalConst?.name || sign;

  return {
    sign,
    constellation,
    isSame: sign === constellation,
  };
}
