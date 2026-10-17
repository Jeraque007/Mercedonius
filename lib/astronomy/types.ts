/**
 * Astronomical Types for the Mercedonius Calendar
 *
 * These types define the data structures used by the astronomical
 * calculation engine, which is independent of the calendar engine.
 */

import type { DataProvenance } from '../provenance';

export interface AstronomicalConstellation {
  id: string;
  name: string;
  abbreviation: string;
  icon: string;
  eclipticLongitudeFromDeg: number;
  eclipticLongitudeToDeg: number;
  raCenterDeg: number;
  decCenterDeg: number;
  latitudeCenterDeg: number;
}

export interface ConstellationResult {
  name: string;
  icon: string;
  abbreviation: string;
  eclipticLongitudeDeg: number;
  rightAscensionDeg: number;
  declinationDeg: number;
  declinationAbsDeg: number;
  boundaryDistanceDeg?: number;
  isNearBoundary: boolean;
  method: 'ecliptic_longitude' | 'equatorial_position' | 'boundary_check';
}

export interface SunPositionEcliptic {
  longitudeDeg: number;
  latitudeDeg: number;
  jdCentury: number;
  jd: number;
}

export interface SunPositionEquatorial {
  raDeg: number;
  decDeg: number;
  eclipticLongitudeDeg: number;
  eclipticLatitudeDeg: number;
  distanceAu: number;
}

export interface SiderealTime {
  lstDeg: number;
  gstDeg: number;
  jdCenturies: number;
}

export interface MoonPositionEcliptic {
  longitudeDeg: number;
  latitudeDeg: number;
  distanceKm: number;
}

export interface MoonPositionEquatorial {
  raDeg: number;
  decDeg: number;
  eclipticLongitudeDeg: number;
  eclipticLatitudeDeg: number;
  distanceKm: number;
}

export interface MoonPhaseInfo {
  phase: string;
  illumination: number;
  ageDays: number;
  icon: string;
  name: string;
}

export interface BirthProfile {
  dateOfBirth: Date;
  birthTime: Date;
  timezone: string;
  latitude: number;
  longitude: number;
  utcTimestamp: number;
  utcDate: Date;
  location: string;
}

export interface BirthSkyResult {
  profile: BirthProfile;
  sun: SunPositionEquatorial;
  sunConstellation: ConstellationResult;
  moon: MoonPositionEquatorial;
  moonConstellation: ConstellationResult;
  moonPhase: MoonPhaseInfo;
  ascendant: AscendantResult;
  ascendantConstellation: ConstellationResult;
  timezoneInfo: {
    timezone: string;
    offsetHours: number;
    utcOffset: number;
    isDST: boolean;
  };
}

export interface AscendantResult {
  eclipticLongitudeDeg: number;
  raDeg: number;
  decDeg: number;
  hourAngleDeg: number;
}

export interface CoordinatesResult {
  raDeg: number;
  decDeg: number;
  eclipticLongitudeDeg: number;
  eclipticLatitudeDeg: number;
  jd: number;
}

export interface CalendarDayWithAstronomy {
  gregorian: Date;
  monthDay: { month: number; day: number; year: number };
  dayOfWeek: string;
  sun: SunPositionEquatorial;
  sunConstellation: ConstellationResult;
  moonPhase: MoonPhaseInfo;
  moonConstellation: ConstellationResult;
  moonDistanceKm: number;
  moonIllumination: number;
  eclipseStatus: 'none' | 'solar' | 'lunar' | 'both';
  astronomicalEvents: AstronomicalEvent[];
}

export interface AstronomicalEvent {
  type: 'new_moon' | 'first_quarter' | 'full_moon' | 'last_quarter' | 'solar_eclipse' | 'lunar_eclipse' | 'equinox' | 'solstice' | 'perihelion' | 'aphelion' | 'meteor_shower' | 'other';
  date: Date;
  utcTime: number;
  label: string;
  icon: string;
  isMajor?: boolean;
  detail?: string;
  /** How this value was produced (Point 4 — honest labelling). */
  provenance?: DataProvenance;
}

export interface RisingResult {
  eclipticLongitudeDeg: number;
  raDeg: number;
  decDeg: number;
  constellation: ConstellationResult;
  timeUncertainty: 'none' | 'possible_low' | 'high';
}

export interface AstrodayConstants {
  julianDayEpoch: number;
  tropicalYearDays: number;
  lunarCycleDays: number;
}

export const ASTRONOMICAL_CONSTANTS: AstrodayConstants = {
  julianDayEpoch: 2451545.0,
  tropicalYearDays: 365.24219,
  lunarCycleDays: 29.530588853,
};

export const SUN_AVERAGE_SPEED_DEG_PER_DAY = 0.985647;
export const PRECESSION_RATE_ARCSEC_YEAR = 5028.796;
export const LEAP_SECONDS_UTC_2000 = 34;
