/**
 * Coordinate Transformation Utilities
 *
 * Provides conversions between:
 * - Equatorial coordinates (RA, Dec) <-> Ecliptic coordinates (longitude, latitude)
 * - Horizontal coordinates (altitude, azimuth) <-> Equatorial coordinates
 * - Sidereal time and local hour angle
 */

import { OBLIQUITY_J2000_RAD } from './constants';
import type { SiderealTime, CoordinatesResult } from './types';

const OBLIQUITY_RAD = OBLIQUITY_J2000_RAD;
const OBLIQUITY_DEG = (OBLIQUITY_RAD * 180) / Math.PI;

/**
 * Convert radians to degrees
 */
export function rad2deg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/**
 * Convert degrees to radians
 */
export function deg2rad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Normalize an angle to the range [0, 360) degrees
 */
export function normalizeDegrees(angleDeg: number): number {
  return ((angleDeg % 360) + 360) % 360;
}

/**
 * Normalize an angle to the range [-180, 180) degrees
 */
export function normalizeDegreesSigned(angleDeg: number): number {
  let normalized = angleDeg % 360;
  if (normalized > 180) normalized -= 360;
  if (normalized < -180) normalized += 360;
  return normalized;
}

/**
 * Convert from Ecliptic coordinates (longitude, latitude) to Equatorial (RA, Dec).
 *
 * Uses rotation matrices around the X-axis by -obliquity.
 */
export function eclipticToEquatorial(
  longitudeDeg: number,
  latitudeDeg: number,
  jd: number
): { raDeg: number; decDeg: number } {
  const l = deg2rad(longitudeDeg);
  const b = deg2rad(latitudeDeg);

  const sinB = Math.sin(b);
  const cosB = Math.cos(b);
  const sinO = Math.sin(OBLIQUITY_RAD);
  const cosO = Math.cos(OBLIQUITY_RAD);

  const ra = Math.atan2(
    Math.sin(l) * cosO - Math.tan(b) * sinO,
    Math.cos(l)
  );
  const dec = Math.asin(sinB * cosO + cosB * sinO * Math.sin(l));

  let raDeg = rad2deg(ra);
  raDeg = normalizeDegrees(raDeg);

  return {
    raDeg,
    decDeg: rad2deg(dec),
  };
}

/**
 * Convert from Equatorial coordinates (RA, Dec) to Ecliptic (longitude, latitude).
 */
export function equatorialToEcliptic(
  raDeg: number,
  decDeg: number,
  jd: number
): { longitudeDeg: number; latitudeDeg: number } {
  const ra = deg2rad(raDeg);
  const dec = deg2rad(decDeg);

  const sinO = Math.sin(OBLIQUITY_RAD);
  const cosO = Math.cos(OBLIQUITY_RAD);

  const longitude = Math.atan2(
    Math.sin(ra) * cosO + Math.tan(dec) * sinO,
    Math.cos(ra)
  );
  const latitude = Math.asin(
    Math.sin(dec) * cosO - Math.cos(dec) * sinO * Math.sin(ra)
  );

  return {
    longitudeDeg: rad2deg(longitude),
    latitudeDeg: rad2deg(latitude),
  };
}

/**
 * Calculate Greenwich Apparent Sidereal Time (GAST) in degrees.
 */
export function calculateSiderealTime(jd: number): SiderealTime {
  const d = jd - 2451545.0;
  const T = d / 36525.0;
  const GMST_rad = 280.46061837 + 360.98564736629 * d + 0.000387933 * T * T;
  const GMST_deg = normalizeDegrees(GMST_rad);

  return {
    gstDeg: GMST_deg,
    lstDeg: 0, // local TBD
    jdCenturies: T,
  };
}

/**
 * Calculate Local Apparent Sidereal Time (LAST).
 */
export function calcLocalSiderealTime(gstDeg: number, longitudeDeg: number): number {
  let lst = gstDeg + longitudeDeg;
  return normalizeDegrees(lst);
}

/**
 * Compute the hour angle of a celestial object in degrees.
 */
export function computeHourAngle(
  lstDeg: number,
  raDeg: number
): number {
  return normalizeDegrees(lstDeg - raDeg);
}

/**
 * Calculate site-specific horizon data from latitude and longitude.
 */
export function calcHorizonData(latitudeDeg: number, longitudeDeg: number): {
  latitudeRad: number;
  longitudeRad: number;
  latitudeAbsDeg: number;
  isNorthernHemisphere: boolean;
  isSouthernHemisphere: boolean;
  isEasternHemisphere: boolean;
  isWesternHemisphere: boolean;
} {
  return {
    latitudeRad: deg2rad(latitudeDeg),
    longitudeRad: deg2rad(longitudeDeg),
    latitudeAbsDeg: Math.abs(latitudeDeg),
    isNorthernHemisphere: latitudeDeg > 0,
    isSouthernHemisphere: latitudeDeg < 0,
    isEasternHemisphere: longitudeDeg >= 0,
    isWesternHemisphere: longitudeDeg < 0,
  };
}

/**
 * Compute the Sun's position in equatorial coordinates given a JD.
 *
 * Uses the standard low-precision algorithm (Meeus, Astronomical Algorithms, ch. 25).
 * Accuracy: ~0.01° for ecliptic longitude with medium precision.
 */
export function calcSunPositionEquatorial(jd: number): CoordinatesResult {
  const d = jd - 2451545.0;
  const T = d / 36525.0;

  // Sun's geometric mean longitude
  const L0 = normalizeDegrees(280.46646 + 36000.76983 * T + 0.0003032 * T * T);

  // Sun's mean anomaly
  const M = normalizeDegrees(357.52911 + 35999.05029 * T - 0.0001537 * T * T);

  // Equation of center (in degrees)
  const C =
    Math.sin(deg2rad(M)) * (1.914602 - T * (0.004817 + 0.000014 * T)) +
    Math.sin(deg2rad(2 * M)) * (0.019993 - 0.000101 * T) +
    Math.sin(deg2rad(3 * M)) * 0.000289;

  // Sun's true longitude
  const lambda = normalizeDegrees(L0 + C);

  // Sun's obliquity
  const epsilon = 23.439291 - 0.0130042 * T;

  // Convert ecliptic to equatorial
  const ra = Math.atan2(
    Math.cos(deg2rad(lambda)) * Math.cos(deg2rad(epsilon)),
    Math.cos(deg2rad(lambda))
  );
  let raDeg = rad2deg(ra);
  raDeg = normalizeDegrees(raDeg);

  const dec = Math.asin(Math.sin(deg2rad(lambda)) * Math.sin(deg2rad(epsilon)));
  const decDeg = rad2deg(dec);

  // Approximate distance (mean Earth-Sun distance = 1 AU)
  const R = 1.00014 - 0.01671 * Math.cos(deg2rad(M)) - 0.00014 * Math.cos(deg2rad(2 * M));
  const distanceAu = R;

  return {
    raDeg,
    decDeg,
    eclipticLongitudeDeg: lambda,
    eclipticLatitudeDeg: 0,
    jd,
  };
}
