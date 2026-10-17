/**
 * Calendar Service
 *
 * Core calendar engine that ties together date conversion, lunar calculations,
 * and astronomical event detection.
 *
 * Uses actual astronomical calculations via the astronomy module.
 * The astronomy engine is independent of the calendar engine.
 */

// ── Re-exported primitives (single import point for consumers) ──
export {
  toJulianDay,
  fromJulianDay,
  getDayOfWeek,
  convert13MonthToGregorian,
  convertGregorianTo13Month,
  formatDateForDisplay,
  format13MonthDate,
  formatMercedoniusDate,
  get13MonthName,
  getMercedoniusMonthLabel,
  getShort13MonthName,
} from './date-utils';
export type { MonthDay } from './date-utils';
// Authoritative calendar engine (Point 2: ALL conversions route through here)
export {
  gregorianToMercedonius,
  mercedoniusToGregorian,
  gregorianToJDN,
  jdnToGregorian,
  weekdayFromJDN,
  weekdayOfGregorian,
  mercedoniusYearLength,
  isMercedoniusLeapYear,
  isValidMercedoniusDate,
} from './mercedonius/engine';
export type { GregorianDate, MercedoniusDate } from './mercedonius/engine';
// Explicit time policy: instants UTC, civil dates per explicit zone
export { localCivilDate, utcJDN } from './time-policy';
export {
  zoneOffsetMs,
  zonedCivilToInstant,
  startOfDayInstant,
  endOfDayInstant,
  formatInZone,
} from './time-policy';
// Point 4 — living displays: provenance, events, local sky
export type { DataProvenance, ProvenanceInfo } from './provenance';
export { PROVENANCE_INFO, PROVENANCE_LEGEND } from './provenance';
export { getNextEvent, getComputedEventsInWindow, lunarPhaseToEvent } from './events';
export type { AppLocation, LocalSky, LocalSkyEvent } from './local-sky';
export { getLocalSky, getEventVisibility } from './local-sky';
export { getSunRiseSet, getMoonRiseSet, bodyAltitudeDeg } from './astronomy/rise-set';
export type { RiseSetTimes, HorizonStatus, BodyKind } from './astronomy/rise-set';
export {
  getSeasonalInstants,
  nextSeasonalInstant,
  findSolarLongitudeCrossing,
  formatUtcInstant,
} from './astronomy/seasons';
export type { SeasonalInstant } from './astronomy/seasons';
export { findPhaseInstant, findPhasesInWindow } from './astronomy/lunar-phases';
export type { LunarPhaseKind } from './astronomy/lunar-phases';
export {
  getMoonPhase,
  getMoonIcon,
  getMoonName,
  getMoonIllumination,
  getMoonAge,
} from './moon-service';
export { getLunarPosition, getMoonDistanceKm, getMoonDiameterArcs, getMoonPhaseInfo } from './lunar-position';

// ── Calendar day with astronomy ──
export type { CalendarDayWithAstronomy } from './astronomy';
export { getCalendarDayWithAstronomy, getSunConstellation, getTraditionalZodiacSign } from './astronomy';

import { getDayName, convertGregorianTo13Month } from './date-utils';
import type { MonthDay } from './date-utils';
import {
  getMoonPhase,
  getMoonIcon,
  getMoonName,
  getMoonIllumination,
  getMoonAge,
} from './moon-service';
import { getLunarPosition } from './lunar-position';
import { getSeasonalEventsForWindow, getCalendarDayWithAstronomy } from './astronomy';
import type { AstronomicalEvent } from './astronomy';
import { getEclipses, getAstronomicalEventsForDate } from './eclipses';
export { getNextNewMoon, getNextFullMoon } from './moon-service';

export function getMoonIconForDate(date: Date): string {
  return getMoonIcon(date);
}

export function getMoonNameForDate(date: Date): string {
  return getMoonName(date);
}

export function getMoonIlluminationForDate(date: Date): number {
  return getMoonIllumination(date);
}

export function getMoonAgeForDate(date: Date): number {
  return getMoonAge(date);
}

export function getLunarPositionForDate(date: Date) {
  return getLunarPosition(date);
}

// ── Seasonal events & eclipses ──
export function getSeasonalEventsForYear(year: number): AstronomicalEvent[] {
  const dayStart = Date.UTC(year, 0, 1);
  const dayEnd = dayStart + 365 * 86400000;
  return getSeasonalEventsForWindow(new Date(dayStart), dayStart, dayEnd);
}

export function getEclipsesForYear(year: number) {
  return getEclipses(year);
}

export function getEclipseEventsForDate(date: Date, year: number): AstronomicalEvent[] {
  return getAstronomicalEventsForDate(date, year);
}

// ── Full day detail ──
export interface DayDetail {
  gregorian: Date;
  monthDay: MonthDay;
  dayOfWeek: string;
  moon: ReturnType<typeof getMoonPhase>;
  lunarPosition: ReturnType<typeof getLunarPosition>;
  events: AstronomicalEvent[];
  sunConstellation: any;
  calendarWithAstronomy: ReturnType<typeof getCalendarDayWithAstronomy>;
}

export function getDayDetail(date: Date): DayDetail {
  const monthDay = convertGregorianTo13Month(date);
  const year = date.getFullYear();

  // Recalculate the day with astronomy
  const dayAstronomy = getCalendarDayWithAstronomy(date);

  return {
    gregorian: date,
    monthDay,
    dayOfWeek: getDayName(date),
    moon: {
      phase: dayAstronomy.moonPhase.phase,
      illumination: dayAstronomy.moonPhase.illumination,
      age: dayAstronomy.moonPhase.ageDays,
      icon: dayAstronomy.moonPhase.icon,
      name: dayAstronomy.moonPhase.name,
    },
    lunarPosition: getLunarPosition(date),
    events: dayAstronomy.astronomicalEvents,
    sunConstellation: dayAstronomy.sunConstellation,
    calendarWithAstronomy: dayAstronomy,
  };
}

// ── Day of week utilities ──
export function getDayOfWeekForDate(date: Date): number {
  return date.getUTCDay();
}

export function getDayNameForDate(date: Date): string {
  return getDayName(date);
}
