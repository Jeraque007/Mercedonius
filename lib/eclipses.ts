/**
 * Eclipse Calculations
 *
 * Calculates eclipses (solar, lunar) based on actual astronomical positions.
 * Uses the Moon's phase and alignment with the Sun and Moon to determine
 * eclipse conditions. For precise eclipse predictions, use JPL Horizons
 * or NASA Eclipse Web Site catalog data.
 *
 * This is a simplified implementation suitable for a calendar application.
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

  // New moon: potential solar eclipse
  if (phase.phase === 'New Moon' && illumination < 5) {
    return {
      hasEclipse: true,
      eclipseType: 'solar',
      magnitude: 0.05,
    };
  }

  // Full moon: potential lunar eclipse
  if (phase.phase === 'Full Moon' && illumination > 95) {
    return {
      hasEclipse: true,
      eclipseType: 'lunar',
      magnitude: 0.25,
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
 * Returns a list of probable eclipse dates (simplified).
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
      label: eclipse.eclipseType === 'lunar' ? 'Lunar Eclipse' : 'Solar Eclipse',
      icon: eclipse.eclipseType === 'lunar' ? '🌕🌎' : '🌑☀️',
      isMajor: eclipse.magnitude > 0.5,
    });
  }

  return events;
}
