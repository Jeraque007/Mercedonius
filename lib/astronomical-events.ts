/**
 * Astronomical Events Service
 *
 * Calculates equinoxes, solstices, and other seasonal events.
 */

import { toJulianDay, fromJulianDay, toAstronomicalDay } from './date-utils';
import { LUNAR_CYCLE } from './moon-service';

export interface AstronomicalEvent {
  type: 'new_moon' | 'first_quarter' | 'full_moon' | 'last_quarter' | 'solar_eclipse' | 'lunar_eclipse' | 'equinox' | 'solstice' | 'perihelion' | 'aphelion' | 'meteor_shower' | 'other';
  date: Date;
  utcTime: number;
  label: string;
  icon: string;
  /** Season name (equinoxes/solstices only) */
  season?: string;
  isMajor?: boolean;
}

export interface SolarEvent {
  type: 'equinox' | 'solstice';
  season: string;
  exactTime: number;
}

export interface EclipseEvent {
  type: 'solar' | 'lunar';
  date: Date;
  magnitude: number;
  maxMagnitude: number;
  maxTime: number;
  durationSeconds?: number;
  visibility: string;
  startDate: Date;
  endDate: Date;
  isMajor: boolean;
}

// ──────────────────────────────────────────────
// Seasonal events
// ──────────────────────────────────────────────

export function getSeasonalEvents(year: number): AstronomicalEvent[] {
  const events: AstronomicalEvent[] = [];

  const mar20Noon = new Date(Date.UTC(year, 2, 20, 12, 0, 0));
  events.push({
    type: 'equinox',
    date: mar20Noon,
    utcTime: mar20Noon.getTime(),
    label: 'Vernal Equinox',
    icon: '🌍',
    season: 'Spring',
    isMajor: true,
  });

  const jun21Noon = new Date(Date.UTC(year, 5, 21, 12, 0, 0));
  events.push({
    type: 'solstice',
    date: jun21Noon,
    utcTime: jun21Noon.getTime(),
    label: 'Summer Solstice',
    icon: '☀️',
    season: 'Summer',
    isMajor: true,
  });

  const sep22Noon = new Date(Date.UTC(year, 8, 22, 12, 0, 0));
  events.push({
    type: 'equinox',
    date: sep22Noon,
    utcTime: sep22Noon.getTime(),
    label: 'Autumnal Equinox',
    icon: '🌍',
    season: 'Autumn',
    isMajor: true,
  });

  const dec21Noon = new Date(Date.UTC(year, 11, 21, 12, 0, 0));
  events.push({
    type: 'solstice',
    date: dec21Noon,
    utcTime: dec21Noon.getTime(),
    label: 'Winter Solstice',
    icon: '☀️',
    season: 'Winter',
    isMajor: true,
  });

  return events;
}
