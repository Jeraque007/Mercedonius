/**
 * Lunar Position Service
 *
 * Calculates lunar distance, angular diameter, and elongation using the
 * astronomy module for proper lunar position calculations.
 */

import { getMoonEquatorialPosition, getSunEclipticPosition, getMoonPhase, normalizeDegrees } from './astronomy';

/** Moon data for a given date. */
export interface LunarPosition {
  /** Earth-Moon distance in km */
  distance: number;
  /** Approximate angular diameter in arcseconds */
  angularDiameter: number;
  /** Sun-Moon elongation in degrees (0 = new moon, 180 = full moon) */
  elongation: number;
}

/** Mean distance from Earth to Moon in km */
const MEAN_MOON_DISTANCE_KM = 384400;

/**
 * Calculate lunar position for a given date.
 */
export function getLunarPosition(date: Date): LunarPosition {
  const moonEq = getMoonEquatorialPosition(date);
  const sun = getSunEclipticPosition(date);

  // Distance
  const distance = Math.round(moonEq.distanceKm);

  // Sun-Moon elongation (difference of ecliptic longitudes)
  const elongation = normalizeDegrees(moonEq.eclipticLongitudeDeg - sun.longitudeDeg);

  // Angular diameter (varies inversely with distance; ~1870" at mean distance)
  const angularDiameter = Math.round(1870 * (MEAN_MOON_DISTANCE_KM / distance));

  return {
    distance,
    angularDiameter,
    elongation: Math.round(elongation * 100) / 100,
  };
}

/**
 * Get the Moon's distance from Earth in km.
 */
export function getMoonDistanceKm(date: Date): number {
  return getLunarPosition(date).distance;
}

/**
 * Get the Moon's angular diameter in arcseconds.
 */
export function getMoonDiameterArcs(date: Date): number {
  return getLunarPosition(date).angularDiameter;
}

/**
 * Get Moon phase info for a date.
 */
export function getMoonPhaseInfo(date: Date) {
  const p = getMoonPhase(date);
  return {
    phase: p.phase,
    illumination: p.illumination,
    age: p.ageDays,
    icon: p.icon,
    name: p.name,
  };
}
