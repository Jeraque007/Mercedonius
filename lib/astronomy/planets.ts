/**
 * Planets Position Module
 *
 * Calculates the position of planets (simplified) for display in the
 * astronomical birth sky and calendar views.
 *
 * This is a simplified implementation suitable for a calendar application.
 * For high-precision planetary positions, use JPL Horizons or similar.
 */

import { deg2rad, rad2deg, normalizeDegrees, eclipticToEquatorial } from './coordinates';
import { getConstellationByEclipticLongitude } from './constellations';

/** Orbital elements for the visible planets (approximate, J2000 epoch) */
const PLANET_ORBITAL_ELEMENTS = {
  mercury: { a: 0.387, e: 0.2056, i: 7.005, o: 48.331, w: 77.456, L0: 252.250 },
  venus: { a: 0.723, e: 0.0068, i: 3.394, o: 76.680, w: 131.534, L0: 181.979 },
  mars: { a: 1.524, e: 0.0934, i: 1.850, o: 49.558, w: 336.060, L0: 355.454 },
  jupiter: { a: 5.203, e: 0.0484, i: 1.303, o: 100.464, w: 14.331, L0: 34.351 },
  saturn: { a: 9.537, e: 0.0542, i: 2.489, o: 113.665, w: 92.434, L0: 49.941 },
  uranus: { a: 19.191, e: 0.0472, i: 0.773, o: 74.006, w: 173.005, L0: 316.968 },
  neptune: { a: 30.069, e: 0.0086, i: 1.770, o: 131.785, w: 44.971, L0: 304.348 },
} as const;

/**
 * Calculate a planet's position in equatorial coordinates for a given date.
 * Uses simplified orbital mechanics with low precision (~1° accuracy).
 */
export function getPlanetPosition(
  planet: 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune',
  date: Date
) {
  const jd = (date.getTime() / 86400000) + 2440587.5;
  const daysSinceJ2000 = jd - 2451545.0;

  const el = PLANET_ORBITAL_ELEMENTS[planet];

  // Mean anomaly
  const M = mod360(el.L0 + 0.0059499 * daysSinceJ2000);

  // True anomaly
  const nu = M + 2 * el.e * Math.sin(deg2rad(M)) + 1.25 * el.e * el.e * Math.sin(deg2rad(2 * M));

  // Argument of latitude
  const u = el.w + nu;

  // Heliocentric ecliptic longitude
  const lon = normalizeDegrees(el.o + u);

  // Convert to RA/Dec (ecliptic → equatorial)
  const { raDeg, decDeg } = eclipticToEquatorial(lon, 0, jd);
  const ra = raDeg;
  const dec = decDeg;

  // IAU constellation containing this ecliptic longitude
  const cons = getConstellationByEclipticLongitude(lon);

  // Distance (simplified, in AU)
  const r = el.a * (1 - el.e * el.e) / (1 + el.e * Math.cos(deg2rad(nu)));

  return {
    name: planet,
    raDeg: ra,
    decDeg: dec,
    eclipticLongitudeDeg: lon,
    eclipticLatitudeDeg: 0,
    distanceAu: r,
    constellation: cons.constellation.name,
  };
}

/** Helper: mod 360 */
function mod360(angle: number): number {
  return ((angle % 360) + 360) % 360;
}
