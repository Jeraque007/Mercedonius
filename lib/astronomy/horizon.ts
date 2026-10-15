/**
 * Horizon & Astronomical Horizon calculations
 *
 * Provides calculations for the astronomical horizon, including:
 * - Zenith and nadir directions
 * - Azimuth and altitude for a given RA/Dec
 * - The ecliptic and horizon coordinate transformations
 */

import { deg2rad, rad2deg, normalizeDegrees, normalizeDegreesSigned } from './coordinates';

/**
 * Calculate the horizon data for a given latitude and longitude.
 */
export function getHorizonData(latitudeDeg: number, longitudeDeg: number) {
  return {
    latitudeDeg,
    longitudeDeg,
    latitudeRad: deg2rad(latitudeDeg),
    longitudeRad: deg2rad(longitudeDeg),
    isNorthernHemisphere: latitudeDeg > 0,
    isSouthernHemisphere: latitudeDeg < 0,
    isEasternHemisphere: longitudeDeg >= 0,
    isWesternHemisphere: longitudeDeg < 0,
  };
}

/**
 * Convert from equatorial coordinates (RA, Dec) to horizontal coordinates
 * (Altitude, Azimuth) for a given observer location.
 */
export function equatorialToHorizontal(
  raDeg: number,
  decDeg: number,
  lstDeg: number,
  latitudeDeg: number
) {
  const ra = deg2rad(raDeg);
  const dec = deg2rad(decDeg);
  const lst = deg2rad(lstDeg);
  const lat = deg2rad(latitudeDeg);

  // Hour angle
  const ha = lst - ra;

  // Altitude
  const sinAlt = Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(ha);
  const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt)));

  // Azimuth (0 = North, 90 = East, 180 = South, 270 = West)
  const cosAz = (Math.sin(dec) - Math.sin(alt) * Math.sin(lat)) / (Math.cos(alt) * Math.cos(lat));
  let az = Math.acos(Math.max(-1, Math.min(1, cosAz)));
  if (Math.sin(ha) < 0) {
    az = 2 * Math.PI - az;
  }
  const azDeg = rad2deg(az);

  return {
    altitudeDeg: rad2deg(alt),
    azimuthDeg: azDeg,
    hourAngleDeg: rad2deg(ha),
  };
}

/**
 * Calculate the ecliptic elevation at a given azimuth/altitude for a point near the horizon.
 */
export function getEclipticElevation(raDeg: number, decDeg: number, latitudeDeg: number) {
  const { altitudeDeg, azimuthDeg } = equatorialToHorizontal(raDeg, decDeg, 0, latitudeDeg);

  // The ecliptic elevation at the horizon is the altitude of the point
  // relative to the horizon plane
  return {
    altitudeDeg,
    azimuthDeg,
  };
}
