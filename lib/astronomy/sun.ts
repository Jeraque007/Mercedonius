/**
 * Sun Position Module
 *
 * Calculates the Sun's apparent position using standard astronomical
 * algorithms. The Sun's position is the basis for determining the
 * astronomical constellation on any given day.
 *
 * The calculation is based on the low-precision algorithms from
 * Meeus, "Astronomical Algorithms", Chapter 25.
 *
 * Accuracy: ~0.01° for ecliptic longitude (sufficient for constellation
 * detection in most cases).
 */

import { deg2rad, rad2deg, normalizeDegrees, normalizeDegreesSigned, eclipticToEquatorial } from './coordinates';
import { getMoonEquatorialPosition } from './moon-internal';
import { CONSTELLATION_BOUNDARIES, getConstellationByEclipticLongitude, isNearBoundary, CONSTELLATION_NAMES, CONSTELLATION_ICONS } from './constellations';
import type { SunPositionEquatorial, SunPositionEcliptic, ConstellationResult } from './types';

/** Days in the Mercedonius year (13 months) */
export const INTERCALARIS_YEAR_DAYS = 365;

/** Days in a Gregorian year */
export const GREGORIAN_YEAR_DAYS = 365;

/**
 * Calculate the Sun's ecliptic longitude and latitude for a given Julian Day (approximate).
 * Uses the standard Meeus algorithm with medium precision.
 */
export function calcSunEcliptic(jd: number): SunPositionEcliptic {
  const d = jd - 2451545.0;
  const T = d / 36525.0;

  // Sun's geometric mean longitude (L0)
  const L0 = normalizeDegrees(280.46646 + 36000.76983 * T + 0.0003032 * T * T);

  // Sun's mean anomaly (M)
  const M = normalizeDegrees(357.52911 + 35999.05029 * T - 0.0001537 * T * T);

  // Equation of center (C) in degrees
  const C =
    Math.sin(deg2rad(M)) * (1.914602 - T * (0.004817 + 0.000014 * T)) +
    Math.sin(deg2rad(2 * M)) * (0.019993 - 0.000101 * T) +
    Math.sin(deg2rad(3 * M)) * 0.000289;

  // True ecliptic longitude (lambda)
  const lambda = normalizeDegrees(L0 + C);

  // Ecliptic latitude (approx 0 for the Sun's apparent path)
  const beta = 0.0;

  return {
    longitudeDeg: lambda,
    latitudeDeg: beta,
    jdCentury: T,
    jd,
  };
}

/**
 * Get the Sun's position using the ecliptic longitude directly.
 */
export function getSunEclipticPosition(date: Date): SunPositionEcliptic {
  const jd = (date.getTime() / 86400000) + 2440587.5;
  return calcSunEcliptic(jd);
}

/**
 * Calculate the Sun's RA and Dec in equatorial coordinates.
 */
export function getSunEquatorialPosition(date: Date): SunPositionEquatorial {
  const jd = (date.getTime() / 86400000) + 2440587.5;

  const ecliptic = calcSunEcliptic(jd);

  // Use the ecliptic to equatorial conversion
  const { raDeg, decDeg } = eclipticToEquatorial(ecliptic.longitudeDeg, 0, jd);

  // Approximate Earth-Sun distance (AU) from the mean anomaly
  const T = ecliptic.jdCentury;
  const M = normalizeDegrees(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const distanceAu = 1.00014 - 0.01671 * Math.cos(deg2rad(M)) - 0.00014 * Math.cos(deg2rad(2 * M));

  return {
    raDeg,
    decDeg,
    eclipticLongitudeDeg: ecliptic.longitudeDeg,
    eclipticLatitudeDeg: 0,
    distanceAu,
  };
}

/**
 * Determine the astronomical constellation for a given date.
 */
export function getSunConstellation(date: Date): {
  constellation: typeof CONSTELLATION_BOUNDARIES[number];
  constellationResult: ConstellationResult;
  isNearBoundary: boolean;
  boundaryDistance: number;
} {
  const jd = (date.getTime() / 86400000) + 2440587.5;
  const lon = calcSunEcliptic(jd).longitudeDeg;

  // Check boundary distance
  const boundaryCheck = isNearBoundary(lon, 0);
  const nearBoundary = boundaryCheck.isNear;

  // Get constellation by ecliptic longitude
  const { constellation } = getConstellationByEclipticLongitude(lon);

  // Equatorial coordinates of the Sun at this moment
  const equatorial = eclipticToEquatorial(lon, 0, jd);

  // Build the constellation result
  const constellationResult: ConstellationResult = {
    name: constellation.name,
    icon: constellation.icon,
    abbreviation: constellation.abbreviation,
    eclipticLongitudeDeg: lon,
    rightAscensionDeg: equatorial.raDeg,
    declinationDeg: equatorial.decDeg,
    declinationAbsDeg: Math.abs(equatorial.decDeg),
    boundaryDistanceDeg: nearBoundary ? boundaryCheck.angularDistanceDeg : undefined,
    isNearBoundary: nearBoundary,
    method: 'ecliptic_longitude',
  };

  return {
    constellation,
    constellationResult,
    isNearBoundary: nearBoundary,
    boundaryDistance: nearBoundary ? boundaryCheck.angularDistanceDeg : 0,
  };
}

/** Tropical zodiac sign boundaries (ecliptic longitude start degrees). */
export const TROPICAL_SIGN_BOUNDARIES: readonly { name: string; icon: string; latin: string; fromDeg: number }[] = [
  { name: 'Aries', icon: '♈', latin: 'Aries', fromDeg: 0 },
  { name: 'Taurus', icon: '♉', latin: 'Taurus', fromDeg: 30 },
  { name: 'Gemini', icon: '♊', latin: 'Gemini', fromDeg: 60 },
  { name: 'Cancer', icon: '♋', latin: 'Cancer', fromDeg: 90 },
  { name: 'Leo', icon: '♌', latin: 'Leo', fromDeg: 120 },
  { name: 'Virgo', icon: '♍', latin: 'Virgo', fromDeg: 150 },
  { name: 'Libra', icon: '♎', latin: 'Libra', fromDeg: 180 },
  { name: 'Scorpio', icon: '♏', latin: 'Scorpio', fromDeg: 210 },
  { name: 'Sagittarius', icon: '♐', latin: 'Sagittarius', fromDeg: 240 },
  { name: 'Capricorn', icon: '♑', latin: 'Capricorn', fromDeg: 270 },
  { name: 'Aquarius', icon: '♒', latin: 'Aquarius', fromDeg: 300 },
  { name: 'Pisces', icon: '♓', latin: 'Pisces', fromDeg: 330 },
] as const;

/**
 * Tropical (astrological) zodiac sign for the Sun on a given date.
 * Divides the ecliptic into 12 equal 30° segments starting at 0° Aries.
 */
export function getSunTropicalSign(date: Date): {
  name: string;
  icon: string;
  latin: string;
  eclipticLongitudeDeg: number;
} {
  const jd = (date.getTime() / 86400000) + 2440587.5;
  const lon = calcSunEcliptic(jd).longitudeDeg;
  const normalized = ((lon % 360) + 360) % 360;

  let sign = TROPICAL_SIGN_BOUNDARIES[0];
  for (const s of TROPICAL_SIGN_BOUNDARIES) {
    if (normalized >= s.fromDeg) sign = s;
  }

  return {
    name: sign.name,
    icon: sign.icon,
    latin: sign.latin,
    eclipticLongitudeDeg: normalized,
  };
}

/**
 * Tropical (astrological) zodiac sign for the Moon on a given date.
 */
export function getMoonTropicalSign(date: Date): {
  name: string;
  icon: string;
  latin: string;
  eclipticLongitudeDeg: number;
} {
  const { eclipticLongitudeDeg } = getMoonEquatorialPosition(date);
  const normalized = ((eclipticLongitudeDeg % 360) + 360) % 360;

  let sign = TROPICAL_SIGN_BOUNDARIES[0];
  for (const s of TROPICAL_SIGN_BOUNDARIES) {
    if (normalized >= s.fromDeg) sign = s;
  }

  return {
    name: sign.name,
    icon: sign.icon,
    latin: sign.latin,
    eclipticLongitudeDeg: normalized,
  };
}

/**
 * Full sun position including ecliptic coordinates and constellation mapping.
 */
export function getSunFullPosition(date: Date) {
  const jd = (date.getTime() / 86400000) + 2440587.5;
  const ecliptic = calcSunEcliptic(jd);

  // Convert to equatorial
  const equatorial = eclipticToEquatorial(ecliptic.longitudeDeg, ecliptic.latitudeDeg, jd);

  // Determine constellation
  const constellation = getConstellationByEclipticLongitude(ecliptic.longitudeDeg).constellation;
  const boundaryCheck = isNearBoundary(ecliptic.longitudeDeg, 0);
  const nearBoundary = boundaryCheck.isNear;

  const constellationResult: ConstellationResult = {
    name: constellation.name,
    icon: constellation.icon,
    abbreviation: constellation.abbreviation,
    eclipticLongitudeDeg: ecliptic.longitudeDeg,
    rightAscensionDeg: equatorial.raDeg,
    declinationDeg: equatorial.decDeg,
    declinationAbsDeg: Math.abs(equatorial.decDeg),
    boundaryDistanceDeg: nearBoundary ? boundaryCheck.angularDistanceDeg : undefined,
    isNearBoundary: nearBoundary,
    method: 'ecliptic_longitude',
  };

  return {
    ecliptic,
    equatorial,
    constellation: constellation,
    constellationResult,
    isNearBoundary: nearBoundary,
    boundaryDistanceDeg: nearBoundary ? boundaryCheck.angularDistanceDeg : undefined,
  };
}
