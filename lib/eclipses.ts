/**
 * Eclipse Calculations
 *
 * ⚠ ILLUSTRATIVE DATA (redesign Point 4) ⚠
 * The eclipse CANDIDATE LIST below is hard-coded presentation sample data —
 * dates repeat identically every year and magnitudes/durations are made up.
 * Nothing here is a real eclipse prediction. Consumers MUST surface the
 * 'illustrative' provenance of anything built from this module; do not
 * display it as fact. For computed (honest) events use lib/events.ts.
 */

import type { AstronomicalEvent } from './astronomical-events';
import { getMoonPhase } from './astronomy/moon-internal';

// Simple eclipse multiplier based on Moon phase
// Solar eclipse: new moon near a lunar node
// Lunar eclipse: full moon near a lunar node

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

/**
 * Check if a date is near a major eclipse event.
 * Uses Moon phase as a proxy for eclipse likelihood.
 */
export function getEclipseStatus(date: Date): {
  hasEclipse: boolean;
  eclipseType: 'none' | 'solar' | 'lunar';
  magnitude: number;
} {
  const phase = getMoonPhase(date);
  const illumination = phase.illumination;

  // New moon: potential solar eclipse (possibility flag only — the
  // magnitude is NOT computed, so it is reported as 0 instead of invented).
  if (phase.phase === 'New Moon' && illumination < 5) {
    return {
      hasEclipse: true,
      eclipseType: 'solar',
      magnitude: 0,
    };
  }

  // Full moon: potential lunar eclipse (same honesty rule as above).
  if (phase.phase === 'Full Moon' && illumination > 95) {
    return {
      hasEclipse: true,
      eclipseType: 'lunar',
      magnitude: 0,
    };
  }

  return {
    hasEclipse: false,
    eclipseType: 'none',
    magnitude: 0,
  };
}

/**
 * Get eclipse events for a given year.
 *
 * ⚠ ILLUSTRATIVE: the candidate list (dates + magnitudes + durations +
 * visibility strings) below is hard-coded sample content that repeats
 * identically every year. Label accordingly; never present as prediction.
 */
export function getEclipses(year: number): EclipseEvent[] {
  const eclipses: EclipseEvent[] = [];

  // These are approximate eclipse dates for demonstration purposes
  const eclipseCandidates = [
    { month: 0, day: 15, type: 'lunar' as const, magnitude: 0.3 },
    { month: 0, day: 30, type: 'solar' as const, magnitude: 0.6 },
    { month: 5, day: 14, type: 'lunar' as const, magnitude: 0.15 },
    { month: 5, day: 29, type: 'solar' as const, magnitude: 0.85 },
    { month: 10, day: 28, type: 'lunar' as const, magnitude: 0.6 },
    { month: 11, day: 14, type: 'solar' as const, magnitude: 0.4 },
  ];

  for (const e of eclipseCandidates) {
    const eclipseType = e.type === 'lunar' ? 'lunar' : 'solar';
    const date = new Date(Date.UTC(year, e.month, e.day));

    const eclipse: EclipseEvent = {
      type: eclipseType,
      date,
      magnitude: e.magnitude,
      maxMagnitude: e.magnitude,
      maxTime: date.getTime(),
      durationSeconds: e.type === 'lunar' ? 2520 : 180,
      visibility: eclipseType === 'lunar' ? 'Global (night side of Earth)' : 'Localized (path of totality)',
      startDate: new Date(date.getTime() - 3600000),
      endDate: new Date(date.getTime() + 3600000),
      isMajor: e.magnitude > 0.5,
    };
    eclipses.push(eclipse);
  }

  return eclipses;
}

/**
 * Get astronomical events for a given date, including eclipses.
 */
export function getAstronomicalEventsForDate(date: Date, year: number): AstronomicalEvent[] {
  const events: AstronomicalEvent[] = [];
  const eclipse = getEclipseStatus(date);

  if (eclipse.hasEclipse) {
    const type = eclipse.eclipseType === 'lunar' ? 'lunar_eclipse' : 'solar_eclipse';
    events.push({
      type,
      date,
      utcTime: date.getTime(),
      label:
        eclipse.eclipseType === 'lunar'
          ? 'Lunar Eclipse (illustrative candidate)'
          : 'Solar Eclipse (illustrative candidate)',
      icon: eclipse.eclipseType === 'lunar' ? '🌕🌎' : '🌑☀️',
      isMajor: false,
      provenance: 'illustrative',
      detail:
        'Sample candidate from a fixed illustrative list — NOT verified eclipse data. ' +
        'Real predictions require a validated catalogue (e.g. NASA GSFC eclipse predictions).',
    });
  }

  return events;
}
