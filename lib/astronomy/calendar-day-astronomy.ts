/**
 * Calendar Day with Astronomical Data
 *
 * Integrates astronomical calculations with the Mercedonius calendar day view.
 */

import { getSunEquatorialPosition, getSunConstellation } from './sun';
import { getMoonEquatorialPosition, getMoonConstellation, getMoonPhase } from './moon';
import { getConstellationByName } from './constellations';
import { getAstronomicalEventsForDate } from '../eclipses';
import type {
  CalendarDayWithAstronomy,
  ConstellationResult,
  AstronomicalEvent,
} from './types';
import { DAYS_OF_WEEK } from '../month-config';
import { gregorianToMercedonius, weekdayOfGregorian } from '../mercedonius/engine';
import { localCivilDate } from '../time-policy';

export function getCalendarDayWithAstronomy(date: Date): CalendarDayWithAstronomy {
  // Explicit time policy (Point 2):
  //  - the CALENDAR day = the instant's civil date in the selected zone
  //    (default device zone); converted by the authoritative engine only.
  //  - the day WINDOW for UTC-domain events = UTC midnight → UTC midnight.
  const civilDate = localCivilDate(date);
  const dayStart = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const dayEnd = dayStart + 86400000;

  const sunPos = getSunEquatorialPosition(date);
  const sunConst = getSunConstellation(date);

  const moonPhase = getMoonPhase(date);
  const moonEq = getMoonEquatorialPosition(date);

  // Moon's IAU constellation, computed from the Moon's current ecliptic longitude
  const moonConstResult: ConstellationResult = getMoonConstellation(date).constellationResult;

  // Eclipse events (solar/lunar) for this day, if any
  const eclipseEvents = getAstronomicalEventsForDate(date, date.getUTCFullYear());
  const hasSolar = eclipseEvents.some((e) => e.type === 'solar_eclipse');
  const hasLunar = eclipseEvents.some((e) => e.type === 'lunar_eclipse');
  const eclipseStatus: CalendarDayWithAstronomy['eclipseStatus'] =
    hasSolar && hasLunar ? 'both' : hasSolar ? 'solar' : hasLunar ? 'lunar' : 'none';

  // Seasonal events (equinoxes/solstices falling inside this day's window)
  const seasonalEvents: AstronomicalEvent[] = getSeasonalEventsForWindow(date, dayStart, dayEnd);

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
    astronomicalEvents: [...eclipseEvents, ...seasonalEvents],
  };
}

// Calendar conversion & weekday naming are owned by the authoritative
// engine (lib/mercedonius/engine.ts). The former duplicate relabeling
// implementation that lived here was REMOVED in redesign Point 2.

export function getSeasonalEventsForWindow(date: Date, windowStart: number, windowEnd: number): AstronomicalEvent[] {
  const events: AstronomicalEvent[] = [];
  const year = date.getUTCFullYear();

  const seasonalEvents: Array<Omit<AstronomicalEvent, 'utcTime'>> = [
    { type: 'equinox', label: 'Vernal Equinox (Spring)', icon: '🌍', date: new Date(Date.UTC(year, 2, 20, 12, 0, 0)), isMajor: true },
    { type: 'solstice', label: 'Summer Solstice (Summer)', icon: '☀️', date: new Date(Date.UTC(year, 5, 21, 12, 0, 0)), isMajor: true },
    { type: 'equinox', label: 'Autumnal Equinox (Autumn)', icon: '🌍', date: new Date(Date.UTC(year, 8, 22, 12, 0, 0)), isMajor: true },
    { type: 'solstice', label: 'Winter Solstice (Winter)', icon: '☀️', date: new Date(Date.UTC(year, 11, 21, 12, 0, 0)), isMajor: true },
  ];

  for (const e of seasonalEvents) {
    if (e.date.getTime() >= windowStart && e.date.getTime() < windowEnd) {
      events.push({ ...e, utcTime: e.date.getTime() });
    }
  }

  return events;
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
