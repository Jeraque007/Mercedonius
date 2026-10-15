/**
 * Rising (Ascendant / Eastern Horizon) Calculations
 *
 * Calculates the astronomical rising constellation at the user's exact
 * birth time, latitude, and longitude.
 *
 * IMPORTANT:
 * - "Astronomical Rising Constellation" = actual IAU constellation
 * - "Astrological Ascendant" = traditional 30-degree zodiac sign
 */

import { deg2rad, rad2deg, normalizeDegrees, normalizeDegreesSigned, eclipticToEquatorial } from './coordinates';
import { CONSTELLATION_BOUNDARIES, getConstellationByEclipticLongitude, isNearBoundary } from './constellations';
import type { RisingResult, ConstellationResult } from './types';

/**
 * Calculate the ascendant (rising point) on the eastern horizon at a given location and time.
 *
 * Uses the standard formula for the rising point on the ecliptic:
 * - Solves for the ecliptic longitude where the ecliptic intersects the eastern horizon
 *
 * The rising point has the following geometric relationship with the observer's latitude:
 * - The ecliptic pole is at declination = obliquity above the pole
 * - For the point on the ecliptic at the horizon (altitude=0):
 *   tan(H) = -tan(latitude) * tan(obliquity)
 *   where H is the hour angle of the rising point
 */
export function getAscendantPosition(
  date: Date,
  latitude: number,
  longitude: number,
  timezone: string
): {
  eclipticLongitudeDeg: number;
  raDeg: number;
  decDeg: number;
  hourAngleDeg: number;
} {
  const jd = (date.getTime() / 86400000) + 2440587.5;

  // Greenwich Mean Sidereal Time (degrees)
  const d = jd - 2451545.0;
  const T = d / 36525.0;

  let gmstDeg = 280.46061837 + 360.98564736629 * d + 0.000387933 * T * T;
  gmstDeg = normalizeDegrees(gmstDeg);

  // Local Sidereal Time (RAMC); longitude is east-positive
  const lstDeg = normalizeDegrees(gmstDeg + longitude);

  const lstRad = deg2rad(lstDeg);
  const latRad = deg2rad(latitude);
  const oblRad = deg2rad(23.439291);

  // Ascendant = ecliptic longitude of the point rising on the eastern horizon:
  //   ASC = atan2( cos(LST), -( sin(LST)·cos(ε) + tan(φ)·sin(ε) ) )
  const ascRad = Math.atan2(
    Math.cos(lstRad),
    -(Math.sin(lstRad) * Math.cos(oblRad) + Math.tan(latRad) * Math.sin(oblRad))
  );
  const eclipticLongitudeDeg = normalizeDegrees(rad2deg(ascRad));

  // RA/Dec of the ascendant point on the ecliptic
  const { raDeg, decDeg } = eclipticToEquatorial(eclipticLongitudeDeg, 0, jd);

  // Hour angle of the ascendant point
  const hourAngleDeg = normalizeDegrees(lstDeg - raDeg);

  return {
    eclipticLongitudeDeg,
    raDeg,
    decDeg,
    hourAngleDeg,
  };
}

/**
 * Find the astronomical constellation containing the rising point.
 */
export function getAscendantConstellation(
  eclipticLongitudeDeg: number,
  latitude: number,
  longitude: number,
  timezone: string
) {
  // Find the constellation by ecliptic longitude
  const { constellation, isExact: _isExact } = getConstellationByEclipticLongitude(eclipticLongitudeDeg);

  // Calculate boundary distance
  const allConstellations = CONSTELLATION_BOUNDARIES;
  let boundaryDistance = 0;
  let isNearBoundary = false;

  for (let i = 0; i < allConstellations.length; i++) {
    const c = allConstellations[i];
    const next = allConstellations[(i + 1) % allConstellations.length];

    const distToLower = Math.abs(eclipticLongitudeDeg - c.eclipticLongitudeFromDeg);
    const distToUpper = Math.abs(eclipticLongitudeDeg - c.eclipticLongitudeToDeg);

    if (Math.min(distToLower, distToUpper) < 0.5) {
      isNearBoundary = true;
      boundaryDistance = Math.min(distToLower, distToUpper);
      break;
    }
  }

  const constellationResult: ConstellationResult = {
    name: constellation.name,
    icon: constellation.icon,
    abbreviation: constellation.abbreviation,
    eclipticLongitudeDeg,
    rightAscensionDeg: 0,
    declinationDeg: 0,
    declinationAbsDeg: 0,
    boundaryDistanceDeg: isNearBoundary ? boundaryDistance : undefined,
    isNearBoundary,
    method: 'ecliptic_longitude',
  };

  return {
    constellation,
    constellationResult,
    isNearBoundary,
    boundaryDistance: isNearBoundary ? boundaryDistance : 0,
  };
}
