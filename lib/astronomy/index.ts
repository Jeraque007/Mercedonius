/**
 * Astronomy Module - Public API Index
 *
 * Re-exports all astronomical calculation functions.
 */

// Core constants
export { INTERCALARIS_YEAR_DAYS, J2000_JD, OBLIQUITY_J2000_DEG } from './constants';

// Constellations (13 IAU constellations along the ecliptic)
export {
  CONSTELLATION_BOUNDARIES,
  CONSTELLATION_NAMES,
  CONSTELLATION_ABBREVIATIONS,
  CONSTELLATION_ICONS,
  ASTRONOMICAL_CONSTELLATION_COUNT,
  NEAR_BOUNDARY_THRESHOLD_DEG,
  getConstellationById,
  getConstellationByName,
  getConstellationByAbbreviation,
  getConstellationIndex,
  getConstellationByEclipticLongitude,
  isNearBoundary,
  deg2hours,
  deg2HoursIso,
} from './constellations';
export { SUN_AVERAGE_SPEED_DEG_PER_DAY, PRECESSION_RATE_ARCSEC_YEAR, LEAP_SECONDS_UTC_2000 } from './types';

// Types
export type {
  AstronomicalConstellation,
  ConstellationResult,
  SunPositionEcliptic,
  SunPositionEquatorial,
  MoonPositionEcliptic,
  MoonPositionEquatorial,
  MoonPhaseInfo,
  BirthProfile,
  BirthSkyResult,
  AscendantResult,
  CalendarDayWithAstronomy,
  AstronomicalEvent,
  RisingResult,
} from './types';

// Coordinate transformations
export {
  rad2deg,
  deg2rad,
  normalizeDegrees,
  normalizeDegreesSigned,
  eclipticToEquatorial,
  equatorialToEcliptic,
  calculateSiderealTime,
  calcLocalSiderealTime,
  computeHourAngle,
  calcHorizonData,
  calcSunPositionEquatorial,
} from './coordinates';

// Horizon utilities
export { getHorizonData, equatorialToHorizontal } from './horizon';

// Sun position
export {
  calcSunEcliptic,
  getSunEclipticPosition,
  getSunEquatorialPosition,
  getSunConstellation,
  getSunFullPosition,
  getSunTropicalSign,
} from './sun';

// Moon position
export {
  getMoonPhase,
  calcMoonEcliptic,
  getMoonEquatorialPosition,
  getMoonConstellation,
  getMoonFullInfo,
  getMoonInfo,
  getMoonTropicalSign,
} from './moon';

// Rising / ascendant
export { getAscendantPosition, getAscendantConstellation } from './rising';

// Planets
export { getPlanetPosition } from './planets';

// Sidereal / Vedic
export {
  getLahiriAyanamsa,
  tropicalToSidereal,
  getSiderealSign,
  SIDEREAL_SIGN_BOUNDARIES,
} from './sidereal';

// Calendar day with astronomy
export {
  getCalendarDayWithAstronomy,
  getTraditionalZodiacSign,
  getSeasonalEventsForWindow,
} from './calendar-day-astronomy';

// Birth sky profiles
export { calculateBirthSky, getTimezoneOffsetHours } from './birth-profile';
export type { BirthSkyInput } from './birth-profile';
