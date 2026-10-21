/**
 * Moon Position Module - Public API
 *
 * Re-exports from moon-internal.ts with the constellation detection logic.
 */

import { getConstellationByEclipticLongitude, isNearBoundary } from './constellations';
import { eclipticToEquatorial } from './coordinates';
import { getMoonPhase, calcMoonEcliptic, getMoonEquatorialPosition } from './moon-internal';
import type { ConstellationResult, MoonPositionEquatorial } from './types';

// Public re-exports (the barrel index re-exports these from here)
export { getMoonPhase, calcMoonEcliptic, getMoonEquatorialPosition } from './moon-internal';
export { getMoonTropicalSign } from './sun';

/**
 * Determine the Moon's astronomical constellation for a given date.
 */
export function getMoonConstellation(date: Date) {
  const jd = (date.getTime() / 86400000) + 2440587.5;
  const ecliptic = calcMoonEcliptic(date);
  const lon = ecliptic.longitudeDeg;

  const boundaryCheck = isNearBoundary(lon, ecliptic.latitudeDeg);
  const nearBoundary = boundaryCheck.isNear;

  const { constellation } = getConstellationByEclipticLongitude(lon);

  // Equatorial coordinates of the Moon at this moment
  const { raDeg, decDeg } = eclipticToEquatorial(lon, ecliptic.latitudeDeg, jd);

  const constellationResult: ConstellationResult = {
    name: constellation.name,
    icon: constellation.icon,
    abbreviation: constellation.abbreviation,
    eclipticLongitudeDeg: lon,
    rightAscensionDeg: raDeg,
    declinationDeg: decDeg,
    declinationAbsDeg: Math.abs(decDeg),
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

/**
 * Get the Moon's phase, illumination, and constellation for a given date.
 */
export function getMoonFullInfo(date: Date) {
  const phase = getMoonPhase(date);
  const constellation = getMoonConstellation(date);

  return {
    phase,
    constellation: constellation.constellation,
    constellationResult: constellation.constellationResult,
    isNearBoundary: constellation.isNearBoundary,
    boundaryDistance: constellation.boundaryDistance,
    equatorial: getMoonEquatorialPosition(date),
  };
}

/**
 * Get the Moon's phase and constellation separately
 */
export function getMoonInfo(date: Date) {
  return {
    phase: getMoonPhase(date),
    constellation: getMoonConstellation(date),
  };
}
