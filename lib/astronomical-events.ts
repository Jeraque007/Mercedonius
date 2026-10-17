/**
 * Astronomical Events Service
 * Calculates equinoxes, solstices, and other seasonal events.
 *
 * NOTE (Point 4): the former fixed "noon UTC on Mar 20 / Jun 21 / …"
 * placeholders were REMOVED. Seasonal instants are now live-computed by
 * lib/astronomy/seasons.ts (solar-longitude crossings); see that module.
 * This file remains as the shared event TYPE surface for legacy callers.
 */

import { toJulianDay, fromJulianDay, toAstronomicalDay } from './date-utils';
import { LUNAR_CYCLE } from './moon-service';
import type { DataProvenance } from './provenance';

export interface AstronomicalEvent {
  type: 'new_moon' | 'first_quarter' | 'full_moon' | 'last_quarter' | 'solar_eclipse' | 'lunar_eclipse' | 'equinox' | 'solstice' | 'perihelion' | 'aphelion' | 'meteor_shower' | 'other';
  date: Date;
  utcTime: number;
  label: string;
  icon: string;
  /** Season name (equinoxes/solstices only) */
  season?: string;
  isMajor?: boolean;
  /** Optional extended description of the event. */
  detail?: string;
  /** How this value was produced (Point 4 — honest labelling). */
  provenance?: DataProvenance;
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
// REMOVED in redesign Point 4: getSeasonalEvents(year) with hard-coded
// "noon UTC" instants. Seasonal events are live-computed — use
// lib/astronomy/seasons.ts (getSeasonalInstants / nextSeasonalInstant) or
// lib/events.ts (getComputedEventsInWindow / getNextEvent) instead.
