/**
 * Astronomical Constants for the Intercalaris Calendar
 *
 * These constants are used by the astronomical calculation engine.
 * The engine is independent of the calendar engine and works for
 * Intercalaris, Gregorian, and any other calendar system.
 */

/** Julian Day Number for J2000.0 epoch (2000-01-01 12:00 UTC) */
export const J2000_JD = 2451545.0;

/** Days in the Intercalaris year (13 months × 28 days + adjustments = 365) */
export const INTERCALARIS_YEAR_DAYS = 365;

/** Julian Day Number for J1900.0 epoch (1900-01-01 12:00 UTC) */
export const J1900_JD = 2415020.0;

/** Julian Day Number for J1850.0 epoch (1850-01-01 12:00 UTC) */
export const J1850_JD = 2405417.5;

/** Julian Day Number for the Gregorian calendar epoch */
export const GREGORIAN_EPOCH_JD = 2451545.0;

/** Mean tropical year in days (at J2000) */
export const TROPICAL_YEAR_DAYS = 365.24219;

/** Mean anomalistic year in days */
export const ANOMALISTIC_YEAR_DAYS = 365.2596;

/** Mean sidereal year in days */
export const SIDEREAL_YEAR_DAYS = 365.25636;

/** Mean lunar cycle (synodic month) in days */
export const LUNAR_CYCLE_DAYS = 29.530588853;

/** Mean lunar draconic month (node-to-node) in days */
export const LUNAR_DRACONIC_MONTH_DAYS = 27.212220817;

/** Mean lunar anomalistic month in days */
export const LUNAR_ANOMALISTIC_MONTH_DAYS = 27.554549878;

/** Mean lunar sidereal month in days */
export const LUNAR_SIDEREAL_MONTH_DAYS = 27.321661;

/** Earth equatorial radius in km */
export const EARTH_EQUATORIAL_RADIUS_KM = 6378.137;

/** Earth polar radius in km */
export const EARTH_POLAR_RADIUS_KM = 6356.7523;

/** Mean Earth-Moon distance in km */
export const MEAN_MOON_DISTANCE_KM = 384400;

/** Earth-Sun mean distance (1 AU) in km */
export const ASTRONOMICAL_UNIT_KM = 149597870.7;

/** Solar radius in km */
export const SOLAR_RADIUS_KM = 696340;

/** Moon radius in km */
export const MOON_RADIUS_KM = 1737.4;

/** Obliquity of the ecliptic at J2000.0 (degrees) */
export const OBLIQUITY_J2000_DEG = 23.439291;

/** General obliquity at J2000 (radians) */
export const OBLIQUITY_J2000_RAD = Math.PI * OBLIQUITY_J2000_DEG / 180.0;

/** Coordinates of the ecliptic origin (ecliptic latitude = 0, longitude = 0) */
export const ECLIPTIC_ORIGIN_RA_DEG = 0.0;
export const ECLIPTIC_ORIGIN_DEC_DEG = 0.0;

/** Precession rate of the equinoxes in arcseconds per Julian year */
export const PRECESSION_RATE_ARCSEC_PER_YEAR = 5028.796;

/** Leap second adjustments for historical timezone handling */
export const LEAP_SECOND_EARLY_2000S = 34;

/**
 * List of months in the Intercalaris calendar (1-13).
 * Months 1-10 = Martius through Intercalaris.
 * Months 11-12 = January-February (mapped differently).
 * Month 13 = Intercalaris (intercalary month).
 */
export const INTERCALARIS_MONTHS: ReadonlyArray<{ number: number; name: string }> = [
  { number: 1, name: 'Martius' },
  { number: 2, name: 'Aprilis' },
  { number: 3, name: 'Maius' },
  { number: 4, name: 'Iunius' },
  { number: 5, name: 'Quintilis' },
  { number: 6, name: 'Sextilis' },
  { number: 7, name: 'September' },
  { number: 8, name: 'October' },
  { number: 9, name: 'November' },
  { number: 10, name: 'December' },
  { number: 11, name: 'Ianuarius' },
  { number: 12, name: 'Februarius' },
  { number: 13, name: 'Intercalaris' },
];

/** Months in the Gregorian calendar (0-indexed month) */
export const GREGORIAN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Get the moon phase icon for a given moon phase name.
 * This is a backward-compatible re-export from the moon service.
 */
export function getMoonPhaseIcon(phase: string): string {
  const iconMap: Record<string, string> = {
    'New Moon': '🌑',
    'Waxing Crescent': '🌒',
    'First Quarter': '🌓',
    'Waxing Gibbous': '🌔',
    'Full Moon': '🌕',
    'Waning Gibbous': '🌖',
    'Last Quarter': '🌗',
    'Waning Crescent': '🌘',
  };
  return iconMap[phase] || '🌕';
}
