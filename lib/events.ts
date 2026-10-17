/**
 * Event Pipeline (redesign Point 4)
 * =================================
 *
 * Single source for date-aware astronomical EVENTS, assembled from live
 * computations (seasonal λ crossings, lunar phase instants). Every event
 * carries provenance; consumers must surface it.
 *
 *  - getComputedEventsInWindow: seasonal + lunar-phase instants in an
 *    instant window (UTC domain per time policy §2).
 *  - getNextEvent: the next MAJOR event (new/full moon, equinox, solstice)
 *    at or after an instant — drives live countdowns.
 */

import { getSeasonalInstants, seasonalInstantToEvent, formatUtcInstant } from './astronomy/seasons';
import {
  findPhaseInstant,
  findPhasesInWindow,
  LUNAR_PHASE_ICONS,
  LUNAR_PHASE_LABELS,
  type LunarPhaseKind,
} from './astronomy/lunar-phases';
import type { AstronomicalEvent } from './astronomy/types';
import type { DataProvenance } from './provenance';

/** Build the shared AstronomicalEvent shape from a computed phase instant. */
export function lunarPhaseToEvent(kind: LunarPhaseKind, instant: Date): AstronomicalEvent {
  const provenance: DataProvenance = 'live';
  return {
    type: kind,
    date: instant,
    utcTime: instant.getTime(),
    label: LUNAR_PHASE_LABELS[kind],
    icon: LUNAR_PHASE_ICONS[kind],
    isMajor: kind === 'new_moon' || kind === 'full_moon',
    provenance,
    detail: `Computed Moon−Sun elongation crossing · ${formatUtcInstant(instant)}`,
  };
}

/**
 * All computed events (seasons + lunar phases) whose instant falls inside
 * [start, end).
 */
export function getComputedEventsInWindow(start: Date, end: Date): AstronomicalEvent[] {
  const events: AstronomicalEvent[] = [];

  // Seasonal instants from every Gregorian year the window touches (±1 day slack).
  const yearSet = new Set<number>();
  for (let t = start.getTime() - 86400000; t <= end.getTime(); t += 86400000) {
    yearSet.add(new Date(t).getUTCFullYear());
  }
  for (const year of yearSet) {
    for (const s of getSeasonalInstants(year)) {
      if (s.instant.getTime() >= start.getTime() && s.instant.getTime() < end.getTime()) {
        events.push(seasonalInstantToEvent(s));
      }
    }
  }

  // Lunar phase instants in the window.
  for (const { kind, instant } of findPhasesInWindow(start, end)) {
    events.push(lunarPhaseToEvent(kind, instant));
  }

  events.sort((a, b) => a.utcTime - b.utcTime);
  return events;
}

/** Earliest MAJOR event (new/full moon, equinox, solstice) at/after `after`. */
export function getNextEvent(after: Date): AstronomicalEvent | null {
  const candidates: AstronomicalEvent[] = [];

  const seasonal = seasonalNext(after);
  if (seasonal) candidates.push(seasonal);

  for (const kind of ['new_moon', 'full_moon'] as const) {
    const phase = findPhaseInstant(kind, after);
    if (phase) candidates.push(lunarPhaseToEvent(kind, phase));
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.utcTime - b.utcTime);
  return candidates[0];
}

function seasonalNext(after: Date): AstronomicalEvent | null {
  // Search the years the "next event" horizon can plausibly reach (≤1 yr).
  let best: AstronomicalEvent | null = null;
  for (let dy = -1; dy <= 1; dy++) {
    for (const s of getSeasonalInstants(after.getUTCFullYear() + dy)) {
      if (s.instant.getTime() >= after.getTime()) {
        const ev = seasonalInstantToEvent(s);
        if (!best || ev.utcTime < best.utcTime) best = ev;
      }
    }
  }
  return best;
}