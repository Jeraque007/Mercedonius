/**
 * Vedic / Sidereal Zodiac
 * =======================
 *
 * Converts tropical (seasonal) ecliptic longitudes to sidereal (star-fixed)
 * longitudes using the Lahiri ayanamsa, the most widely used ayanamsa in
 * Vedic astrology.
 *
 * sidereal_longitude = tropical_longitude − ayanamsa(date)
 *
 * The ayanamsa grows by the general precession rate (~50.3 arcsec/year).
 * Reference: Lahiri ayanamsa ≈ 22°27′46″ (22.462778°) on 2000-01-01 12:00 UTC.
 */

import { normalizeDegrees } from './coordinates';

/** Lahiri ayanamsa (degrees) at the J2000 epoch (2000-01-01 12:00 UTC). */
const LAHIRI_AYANAMSA_J2000_DEG = 22.462778;

/** General precession in degrees per Julian century (36525 days). */
const PRECESSION_DEG_PER_CENTURY = 50.28796195;

/** Days per Julian century. */
const JULIAN_CENTURY_DAYS = 36525.0;

/**
 * Compute the Lahiri ayanamsa (degrees) for a given instant.
 * Returns the angular difference between tropical and sidereal zodiacs.
 */
export function getLahiriAyanamsa(date: Date): number {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const t = (jd - 2451545.0) / JULIAN_CENTURY_DAYS; // Julian centuries from J2000
  return LAHIRI_AYANAMSA_J2000_DEG + t * PRECESSION_DEG_PER_CENTURY;
}

/**
 * Convert a tropical ecliptic longitude to sidereal using the Lahiri ayanamsa.
 */
export function tropicalToSidereal(
  tropicalLongitudeDeg: number,
  date: Date
): number {
  return normalizeDegrees(tropicalLongitudeDeg - getLahiriAyanamsa(date));
}

/** Sidereal zodiac sign boundaries (12 × 30° from 0° Aries). */
export const SIDEREAL_SIGN_BOUNDARIES: readonly {
  name: string;
  icon: string;
  sanskrit: string;
  fromDeg: number;
}[] = [
  { name: 'Aries', icon: '♈', sanskrit: 'Mesha', fromDeg: 0 },
  { name: 'Taurus', icon: '♉', sanskrit: 'Vrishabha', fromDeg: 30 },
  { name: 'Gemini', icon: '♊', sanskrit: 'Mithuna', fromDeg: 60 },
  { name: 'Cancer', icon: '♋', sanskrit: 'Karka', fromDeg: 90 },
  { name: 'Leo', icon: '♌', sanskrit: 'Simha', fromDeg: 120 },
  { name: 'Virgo', icon: '♍', sanskrit: 'Kanya', fromDeg: 150 },
  { name: 'Libra', icon: '♎', sanskrit: 'Tula', fromDeg: 180 },
  { name: 'Scorpio', icon: '♏', sanskrit: 'Vrishchika', fromDeg: 210 },
  { name: 'Sagittarius', icon: '♐', sanskrit: 'Dhanu', fromDeg: 240 },
  { name: 'Capricorn', icon: '♑', sanskrit: 'Makara', fromDeg: 270 },
  { name: 'Aquarius', icon: '♒', sanskrit: 'Kumbha', fromDeg: 300 },
  { name: 'Pisces', icon: '♓', sanskrit: 'Meena', fromDeg: 330 },
] as const;

/**
 * Sidereal (Vedic) zodiac sign for a given tropical longitude and date.
 */
export function getSiderealSign(
  tropicalLongitudeDeg: number,
  date: Date
): {
  name: string;
  icon: string;
  sanskrit: string;
  siderealLongitudeDeg: number;
  ayanamsaDeg: number;
} {
  const ayanamsa = getLahiriAyanamsa(date);
  const siderealLon = tropicalToSidereal(tropicalLongitudeDeg, date);
  const normalized = ((siderealLon % 360) + 360) % 360;

  let sign = SIDEREAL_SIGN_BOUNDARIES[0];
  for (const s of SIDEREAL_SIGN_BOUNDARIES) {
    if (normalized >= s.fromDeg) sign = s;
  }

  return {
    name: sign.name,
    icon: sign.icon,
    sanskrit: sign.sanskrit,
    siderealLongitudeDeg: normalized,
    ayanamsaDeg: ayanamsa,
  };
}