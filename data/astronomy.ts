/** Astronomical constants */
export const ASTRONOMICAL_CONSTANTS = {
  /** Mean lunar cycle (synodic month) in days */
  LUNAR_CYCLE_DAYS: 29.53059,
  /** Tropical year in days */
  TROPICAL_YEAR_DAYS: 365.2422,
  /** Julian day for Gregorian date 2000-01-01 12:00 UTC */
  J2000_JD: 2451545.0,
} as const;

/** Moon phase identifiers */
export type MoonPhase =
  | 'new_moon'
  | 'waxing_crescent'
  | 'first_quarter'
  | 'waxing_gibbous'
  | 'full_moon'
  | 'waning_gibbous'
  | 'last_quarter'
  | 'waning_crescent';

/** Astronomical event types */
export type AstronomicalEventType =
  | 'new_moon'
  | 'first_quarter'
  | 'full_moon'
  | 'last_quarter'
  | 'solar_eclipse'
  | 'lunar_eclipse'
  | 'equinox'
  | 'solstice'
  | 'perihelion'
  | 'aphelion'
  | 'meteor_shower'
  | 'other';

/** Eclipse type */
export type EclipseType = 'solar' | 'lunar';

/** Moon illumination - quadrant identifier */
export type MoonPhaseIcon =
  | '🌑'
  | '🌒'
  | '🌓'
  | '🌔'
  | '🌕'
  | '🌖'
  | '🌗'
  | '🌘';

/** Base event interface */
export interface AstronomicalEvent {
  type: AstronomicalEventType;
  date: Date;
  /** Time in UTC */
  utcTime: number;
  /** Human readable label */
  label: string;
  /** Unicode icon */
  icon: string;
  /** Additional details */
  detail?: string;
  /** Whether this is a "major" event */
  isMajor?: boolean;
}

/** Moon phase info */
export interface MoonPhaseInfo {
  phase: MoonPhase;
  illumination: number; // 0-100
  age: number; // days since new moon
  icon: MoonPhaseIcon;
  name: string;
}

/** Position info (for day detail view) */
export interface LunarPosition {
  distance: number; // km
  angularDiameter: number; // arcseconds
  elongation: number; // degrees from sun
}

/** Eclipse event */
export interface EclipseEvent extends AstronomicalEvent {
  type: 'solar_eclipse' | 'lunar_eclipse';
  magnitude: number;
  maxMagnitude: number;
  maxTime: number;
  durationSeconds?: number;
  visibility: string;
  startDate: Date;
  endDate: Date;
  maxDate: Date;
}

/** Equinox/Solstice event */
export interface SeasonalEvent extends AstronomicalEvent {
  type: 'equinox' | 'solstice';
  season: string;
  /** Exact time (UTC) */
  exactTime: number;
  timezone: string;
}

/** Color scheme for astronomical events */
export const EVENT_COLORS: Record<AstronomicalEventType, string> = {
  new_moon: '#4a4a4a',
  first_quarter: '#6a8a5a',
  full_moon: '#ffaa33',
  last_quarter: '#4a6a8a',
  solar_eclipse: '#cc2222',
  lunar_eclipse: '#663366',
  equinox: '#3388ff',
  solstice: '#ff4422',
  perihelion: '#cccc22',
  aphelion: '#44cccc',
  meteor_shower: '#ff88aa',
  other: '#888888',
};

/** Major events list */
export const MAJOR_EVENTS: AstronomicalEventType[] = [
  'solar_eclipse',
  'lunar_eclipse',
  'equinox',
  'solstice',
  'perihelion',
  'aphelion',
];

/** Helper: get moon phase icon from phase name */
export function getMoonPhaseIcon(phase: MoonPhase): MoonPhaseIcon {
  const icons: Record<MoonPhase, MoonPhaseIcon> = {
    new_moon: '🌑',
    waxing_crescent: '🌒',
    first_quarter: '🌓',
    waxing_gibbous: '🌔',
    full_moon: '🌕',
    waning_gibbous: '🌖',
    last_quarter: '🌗',
    waning_crescent: '🌘',
  };
  return icons[phase];
}
