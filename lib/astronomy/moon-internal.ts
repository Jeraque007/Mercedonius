/**
 * Internal Moon Position Calculations
 *
 * Contains the low-level algorithms for lunar phase, ecliptic position,
 * and distance calculations.
 */

import { deg2rad, rad2deg, normalizeDegrees, eclipticToEquatorial } from './coordinates';

/** Mean lunar cycle (synodic month) in days */
export const LUNAR_CYCLE_DAYS = 29.530588853;

/** Reference new moon JD: 2000-01-06 18:14 UTC */
export const REFERENCE_NEW_MOON_JD = 2451550.1;

/** J2000 JD constant */
export const J2000_JD_CMD = 2451545.0;

/** Mean distance from Earth to Moon in km */
const MEAN_MOON_DISTANCE_KM = 384400;

/** Perigee-apogee variation in km */
const MOON_DISTANCE_RANGE_KM = 21000;

/** Anomalistic month in days (perigee cycle) */
const PERIGEE_APOGEE_CYCLE = 27.55455;

/**
 * Calculate the Moon's phase and illumination for a given date.
 * Returns phase name, illumination percentage, and lunar age (days since new moon).
 */
export function getMoonPhase(date: Date): { phase: string; illumination: number; ageDays: number; icon: string; name: string } {
  const jd = (date.getTime() / 86400000) + 2440587.5;

  let daysSinceNewMoon = (jd - REFERENCE_NEW_MOON_JD) % LUNAR_CYCLE_DAYS;
  if (daysSinceNewMoon < 0) {
    daysSinceNewMoon += LUNAR_CYCLE_DAYS;
  }

  const phaseIndex = Math.floor((daysSinceNewMoon / LUNAR_CYCLE_DAYS) * 8) % 8;

  // Illumination follows the phase angle: 0% at new, 50% at first/last
  // quarter, 100% at full. (A sine-of-age curve wrongly gives ~71% at
  // quarter — that's what previously labelled a 69.9%-lit Moon a "crescent".)
  const illumination = 50 * (1 - Math.cos((daysSinceNewMoon / LUNAR_CYCLE_DAYS) * 2 * Math.PI));

  const PHASES = [
    { name: 'New Moon', icon: '🌑' },
    { name: 'Waxing Crescent', icon: '🌒' },
    { name: 'First Quarter', icon: '🌓' },
    { name: 'Waxing Gibbous', icon: '🌔' },
    { name: 'Full Moon', icon: '🌕' },
    { name: 'Waning Gibbous', icon: '🌖' },
    { name: 'Last Quarter', icon: '🌗' },
    { name: 'Waning Crescent', icon: '🌘' },
  ];

  return {
    phase: PHASES[phaseIndex].name,
    illumination: Math.round(illumination * 10) / 10,
    ageDays: Math.round(daysSinceNewMoon * 10) / 10,
    icon: PHASES[phaseIndex].icon,
    name: PHASES[phaseIndex].name,
  };
}

/**
 * Calculate the Moon's ecliptic longitude and latitude for a given date.
 */
export function calcMoonEcliptic(date: Date) {
  const jd = (date.getTime() / 86400000) + 2440587.5;

  const L0 = 218.3165 + 13.176396 * (jd - J2000_JD_CMD);
  const L0Norm = normalizeDegrees(L0);

  const M_moon = normalizeDegrees(134.9634 + 13.064993 * (jd - J2000_JD_CMD));

  let evection = Math.sin(deg2rad(2 * (L0Norm - M_moon))) * 1.27401;
  evection += Math.sin(deg2rad(4 * L0Norm - 2 * M_moon)) * 0.6583;
  evection += Math.sin(deg2rad(2 * L0Norm)) * 0.1856;
  evection += Math.sin(deg2rad(2 * (L0Norm - 2 * M_moon))) * 0.0594;
  evection += Math.sin(deg2rad(2 * (L0Norm - 2 * M_moon))) * 0.0504;
  evection += Math.sin(deg2rad(2 * (L0Norm - 4 * M_moon))) * 0.0173;
  evection += Math.sin(deg2rad(6 * (L0Norm - M_moon))) * 0.0074;
  evection += Math.sin(deg2rad(2 * (L0Norm + M_moon))) * 0.0068;

  const C_moon = Math.sin(deg2rad(M_moon)) * (6.28877 + M_moon * 0.002486) +
    Math.sin(deg2rad(2 * M_moon)) * 0.18599 +
    Math.sin(deg2rad(3 * M_moon)) * 0.0161;

  const longitude = normalizeDegrees(L0Norm + evection + C_moon);

  const B0 = 5.1454 - 0.0083 * (jd - J2000_JD_CMD);

  return {
    longitudeDeg: longitude,
    latitudeDeg: B0,
    distanceKm: 384400 + 21000 * Math.sin(deg2rad((jd - J2000_JD_CMD) / PERIGEE_APOGEE_CYCLE * 360)),
  };
}

/**
 * Convert Moon's ecliptic coordinates to equatorial coordinates (returns RA/Dec).
 */
export function moonEclipticToEquatorial(longitudeDeg: number, latitudeDeg: number, jd: number) {
  // Reuse the ecliptic to equatorial conversion from coordinates module
  const { raDeg, decDeg } = eclipticToEquatorial(longitudeDeg, latitudeDeg, jd);
  return { raDeg, decDeg };
}

/**
 * Decorator: getMoonEquatorialPosition re-exports from coordinates module
 */
export function getMoonEquatorialPosition(date: Date) {
  const jd = (date.getTime() / 86400000) + 2440587.5;
  const ecliptic = calcMoonEcliptic(date);
  const { raDeg, decDeg } = eclipticToEquatorial(ecliptic.longitudeDeg, ecliptic.latitudeDeg, jd);

  return {
    raDeg,
    decDeg,
    eclipticLongitudeDeg: ecliptic.longitudeDeg,
    eclipticLatitudeDeg: ecliptic.latitudeDeg,
    distanceKm: Math.round(ecliptic.distanceKm),
  };
}
