/**
 * IAU Astronomical Constellation Boundaries (13 Constellations along the Ecliptic)
 *
 * The Sun's apparent annual path intersects exactly 13 constellations:
 *
 *   1. Aries
 *   2. Taurus
 *   3. Gemini
 *   4. Cancer
 *   5. Leo
 *   6. Virgo
 *   7. Libra
 *   8. Scorpius
 *   9. Ophiuchus
 *   10. Sagittarius
 *   11. Capricornus
 *   12. Aquarius
 *   13. Pisces
 *
 * This is NOT the conventional 12-sign astrological zodiac. The IAU constellations
 * have irregular boundaries; the zodiac signs divide the ecliptic into 12 equal
 * 30-degree segments.
 */

import type { AstronomicalConstellation } from './types';

/**
 * IAU constellation boundaries along the ecliptic (longitude crossings of
 * the official IAU boundary lines, accurate to ~0.1°). The bands tile the
 * full 360°: Pisces wraps through 0°.
 */
export const CONSTELLATION_BOUNDARIES: readonly AstronomicalConstellation[] = [
  {
    id: 'a',
    name: 'Aries',
    abbreviation: 'Ari',
    icon: '♈',
    eclipticLongitudeFromDeg: 28.5,
    eclipticLongitudeToDeg: 53.3,
    raCenterDeg: 36.0,
    decCenterDeg: 14.0,
    latitudeCenterDeg: 0.0,
  },
  {
    id: 'ta',
    name: 'Taurus',
    abbreviation: 'Tau',
    icon: '♉',
    eclipticLongitudeFromDeg: 53.3,
    eclipticLongitudeToDeg: 90.4,
    raCenterDeg: 62.0,
    decCenterDeg: 19.0,
    latitudeCenterDeg: 0.0,
  },
  {
    id: 'ge',
    name: 'Gemini',
    abbreviation: 'Gem',
    icon: '♊',
    eclipticLongitudeFromDeg: 90.4,
    eclipticLongitudeToDeg: 118.1,
    raCenterDeg: 91.0,
    decCenterDeg: 21.0,
    latitudeCenterDeg: 0.0,
  },
  {
    id: 'ca',
    name: 'Cancer',
    abbreviation: 'Cnc',
    icon: '♋',
    eclipticLongitudeFromDeg: 118.1,
    eclipticLongitudeToDeg: 138.2,
    raCenterDeg: 112.0,
    decCenterDeg: 21.0,
    latitudeCenterDeg: 0.0,
  },
  {
    id: 'le',
    name: 'Leo',
    abbreviation: 'Leo',
    icon: '♌',
    eclipticLongitudeFromDeg: 138.2,
    eclipticLongitudeToDeg: 174.0,
    raCenterDeg: 144.0,
    decCenterDeg: 15.0,
    latitudeCenterDeg: 0.0,
  },
  {
    id: 'vi',
    name: 'Virgo',
    abbreviation: 'Vir',
    icon: '♍',
    eclipticLongitudeFromDeg: 174.0,
    eclipticLongitudeToDeg: 217.9,
    raCenterDeg: 167.0,
    decCenterDeg: -3.0,
    latitudeCenterDeg: 0.0,
  },
  {
    id: 'li',
    name: 'Libra',
    abbreviation: 'Lbr',
    icon: '♎',
    eclipticLongitudeFromDeg: 217.9,
    eclipticLongitudeToDeg: 241.1,
    raCenterDeg: 210.0,
    decCenterDeg: -11.0,
    latitudeCenterDeg: 0.0,
  },
  {
    id: 'sc',
    name: 'Scorpius',
    abbreviation: 'Sco',
    icon: '♏',
    eclipticLongitudeFromDeg: 241.1,
    eclipticLongitudeToDeg: 247.3,
    raCenterDeg: 238.0,
    decCenterDeg: -25.0,
    latitudeCenterDeg: 0.0,
  },
  {
    id: 'oph',
    name: 'Ophiuchus',
    abbreviation: 'Oph',
    icon: '⛎',
    eclipticLongitudeFromDeg: 247.3,
    eclipticLongitudeToDeg: 266.6,
    raCenterDeg: 253.0,
    decCenterDeg: -0.5,
    latitudeCenterDeg: 0.0,
  },
  {
    id: 'sg',
    name: 'Sagittarius',
    abbreviation: 'Sgr',
    icon: '♐',
    eclipticLongitudeFromDeg: 266.6,
    eclipticLongitudeToDeg: 299.8,
    raCenterDeg: 270.0,
    decCenterDeg: -29.0,
    latitudeCenterDeg: 0.0,
  },
  {
    id: 'cp',
    name: 'Capricornus',
    abbreviation: 'Cap',
    icon: '♑',
    eclipticLongitudeFromDeg: 299.8,
    eclipticLongitudeToDeg: 327.7,
    raCenterDeg: 296.0,
    decCenterDeg: -22.0,
    latitudeCenterDeg: 0.0,
  },
  {
    id: 'aq',
    name: 'Aquarius',
    abbreviation: 'Aqr',
    icon: '♒',
    eclipticLongitudeFromDeg: 327.7,
    eclipticLongitudeToDeg: 351.5,
    raCenterDeg: 324.0,
    decCenterDeg: -13.0,
    latitudeCenterDeg: 0.0,
  },
  {
    id: 'pi',
    name: 'Pisces',
    abbreviation: 'Psc',
    icon: '♓',
    eclipticLongitudeFromDeg: 351.5,
    eclipticLongitudeToDeg: 28.5,
    raCenterDeg: 352.0,
    decCenterDeg: 6.0,
    latitudeCenterDeg: 0.0,
  },
];

/** All constellation names in sequence order (1-13) */
export const CONSTELLATION_NAMES = CONSTELLATION_BOUNDARIES.map((c) => c.name) as readonly string[];

/** All constellation abbreviations in sequence order (1-13) */
export const CONSTELLATION_ABBREVIATIONS = CONSTELLATION_BOUNDARIES.map((c) => c.abbreviation) as readonly string[];

/** All constellation icons in sequence order (1-13) */
export const CONSTELLATION_ICONS = CONSTELLATION_BOUNDARIES.map((c) => c.icon) as readonly string[];

/** Number of constellations along the ecliptic (13, including Ophiuchus) */
export const ASTRONOMICAL_CONSTELLATION_COUNT = CONSTELLATION_BOUNDARIES.length;

/** Lookup by id */
export function getConstellationById(id: AstronomicalConstellation['id']): AstronomicalConstellation {
  return CONSTELLATION_BOUNDARIES.find((c) => c.id === id)!;
}

/** Lookup by name (case-insensitive) */
export function getConstellationByName(name: string): AstronomicalConstellation | undefined {
  return CONSTELLATION_BOUNDARIES.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

/** Lookup by abbreviation (case-insensitive) */
export function getConstellationByAbbreviation(abbr: string): AstronomicalConstellation | undefined {
  return CONSTELLATION_BOUNDARIES.find((c) => c.abbreviation.toLowerCase() === abbr.toLowerCase());
}

/** Get the constellation index (1-based) for a name */
export function getConstellationIndex(name: string): number | undefined {
  const found = CONSTELLATION_BOUNDARIES.find((c) => c.name.toLowerCase() === name.toLowerCase());
  return found ? CONSTELLATION_BOUNDARIES.indexOf(found) + 1 : undefined;
}

/** Normalize an angle to [0, 360) degrees */
function normalizeAngle(angleDeg: number): number {
  return ((angleDeg % 360) + 360) % 360;
}

/** Smallest absolute angular difference between two longitudes (circular). */
function circularDelta(aDeg: number, bDeg: number): number {
  const d = Math.abs(normalizeAngle(aDeg) - normalizeAngle(bDeg));
  return Math.min(d, 360 - d);
}

/** How close (in degrees) the Sun/Moon needs to be to a boundary to count as "near". */
export const NEAR_BOUNDARY_THRESHOLD_DEG = 1.0;

/**
 * Check whether an ecliptic position lies within the near-boundary threshold
 * of any IAU constellation boundary along the ecliptic.
 *
 * The `latitudeDeg` argument is accepted for API compatibility (ecliptic
 * latitude does not affect the ecliptic-longitude based boundary check).
 */
export function isNearBoundary(
  longitudeDeg: number,
  _latitudeDeg: number
): { isNear: boolean; angularDistanceDeg: number } {
  let min = Infinity;
  for (const c of CONSTELLATION_BOUNDARIES) {
    min = Math.min(
      min,
      circularDelta(longitudeDeg, c.eclipticLongitudeFromDeg),
      circularDelta(longitudeDeg, c.eclipticLongitudeToDeg)
    );
  }
  return {
    isNear: min <= NEAR_BOUNDARY_THRESHOLD_DEG,
    angularDistanceDeg: Math.round(min * 1e4) / 1e4,
  };
}

/**
 * Find the IAU constellation containing an ecliptic longitude (0-360°).
 *
 * The stored ranges are the standard ecliptic-longitude crossings of the
 * official IAU boundary lines (accurate to ~0.1°). They tile the full
 * circle; the nearest-endpoint fallback below is kept only as a safety net.
 */
export function getConstellationByEclipticLongitude(longitudeDeg: number): {
  constellation: AstronomicalConstellation;
  isExact: boolean;
} {
  const lon = normalizeAngle(longitudeDeg);

  for (const c of CONSTELLATION_BOUNDARIES) {
    const from = c.eclipticLongitudeFromDeg;
    const to = c.eclipticLongitudeToDeg;
    const inRange =
      from < to ? lon >= from && lon < to : lon >= from || lon < to;
    if (inRange) {
      return { constellation: c, isExact: false };
    }
  }

  // Gap fallback: nearest boundary endpoint determines ownership.
  let best: AstronomicalConstellation | undefined;
  let bestDist = Infinity;
  for (const c of CONSTELLATION_BOUNDARIES) {
    const d = Math.min(
      circularDelta(lon, c.eclipticLongitudeFromDeg),
      circularDelta(lon, c.eclipticLongitudeToDeg)
    );
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return { constellation: best ?? CONSTELLATION_BOUNDARIES[0], isExact: false };
}

/** Convert degrees to hours of right ascension (0-24). */
export function deg2hours(deg: number): number {
  return normalizeAngle(deg) / 15;
}

/** Format a degree value as an HH:MM:SS right-ascension string. */
export function deg2HoursIso(deg: number): string {
  const totalSeconds = Math.round((normalizeAngle(deg) / 15) * 3600);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((n) => String(n).padStart(2, '0')).join(':');
}
