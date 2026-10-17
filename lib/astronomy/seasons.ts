/**
 * Seasonal Instants — COMPUTED, not tabulated (redesign Point 4)
 * ==============================================================
 *
 * An equinox/solstice is defined by the instant the Sun's apparent
 * ecliptic longitude λ crosses 0° / 90° / 180° / 270°. This module finds
 * those instants by scanning + bisection on λ(t) (Meeus ch. 25 model,
 * ~0.01° accuracy ⇒ instants accurate to roughly 15 minutes; the bisection
 * converges the model itself to ~1 second).
 *
 * Replaces the former fixed "noon UTC on Mar 20/Jun 21/…" placeholders —
 * every event carries provenance 'live' and the exact computed time.
 */

import { getSunEclipticPosition } from './sun';
import { normalizeDegrees } from './coordinates';
import type { AstronomicalEvent } from './types';
import type { DataProvenance } from '../provenance';

export interface SeasonalInstant {
  type: 'equinox' | 'solstice';
  /** Target ecliptic longitude (deg) defining the event. */
  longitudeDeg: number;
  season: string;
  label: string;
  icon: string;
  instant: Date;
}

export const SEASONAL_TARGETS: ReadonlyArray<{
  type: 'equinox' | 'solstice';
  longitudeDeg: number;
  season: string;
  label: string;
  icon: string;
}> = [
  { type: 'equinox', longitudeDeg: 0, season: 'Spring', label: 'Vernal Equinox (Spring)', icon: '🌍' },
  { type: 'solstice', longitudeDeg: 90, season: 'Summer', label: 'Summer Solstice (Summer)', icon: '☀️' },
  { type: 'equinox', longitudeDeg: 180, season: 'Autumn', label: 'Autumnal Equinox (Autumn)', icon: '🌍' },
  { type: 'solstice', longitudeDeg: 270, season: 'Winter', label: 'Winter Solstice (Winter)', icon: '☀️' },
];

/** Signed difference (−180..180] of the Sun's λ from the target. */
function lambdaDelta(instant: Date, targetDeg: number): number {
  return normalizeDegrees(getSunEclipticPosition(instant).longitudeDeg - targetDeg + 180) - 180;
}

/**
 * First instant strictly after `from` at which λ crosses `targetDeg`
 * (ascending), searched within `windowDays`. Returns null when no crossing
 * lies inside the window (λ moves ≈1°/day, so windows ≤ 180 days are safe
 * from wrap ambiguity).
 */
export function findSolarLongitudeCrossing(
  targetDeg: number,
  from: Date,
  windowDays: number
): Date | null {
  const windowMs = windowDays * 86400000;
  const t0 = from.getTime();
  const t1 = t0 + windowMs;
  const d0 = lambdaDelta(new Date(t0), targetDeg);
  const d1 = lambdaDelta(new Date(t1), targetDeg);
  if (d0 >= 0 || d1 < 0) return null; // crossing already passed / not yet reached

  // Bisect: λ increases monotonically over the window ⇒ delta crosses zero once.
  let lo = t0;
  let hi = t1;
  for (let i = 0; i < 40 && hi - lo > 250; i++) {
    const mid = (lo + hi) / 2;
    if (lambdaDelta(new Date(mid), targetDeg) < 0) lo = mid;
    else hi = mid;
  }
  return new Date((lo + hi) / 2);
}

const SEASONAL_CACHE = new Map<number, SeasonalInstant[]>();

/** All four seasonal instants of a Gregorian year — live-computed, cached per year. */
export function getSeasonalInstants(year: number): SeasonalInstant[] {
  const cached = SEASONAL_CACHE.get(year);
  if (cached) return cached;

  const results: SeasonalInstant[] = [];
  const yearStart = Date.UTC(year, 0, 1);
  for (const target of SEASONAL_TARGETS) {
    const instant =
      findSolarLongitudeCrossing(target.longitudeDeg, new Date(yearStart), 366) ??
      // Defensive fallback (should not occur): nearest-day placeholder is
      // NEVER emitted — skip and let the caller label it unavailable.
      null;
    if (instant) {
      results.push({ ...target, instant });
    }
  }
  results.sort((a, b) => a.instant.getTime() - b.instant.getTime());
  SEASONAL_CACHE.set(year, results);
  return results;
}

/** Earliest seasonal instant at or after `after` (searches ±2 years). */
export function nextSeasonalInstant(after: Date): SeasonalInstant | null {
  let best: SeasonalInstant | null = null;
  for (let dy = -1; dy <= 2; dy++) {
    for (const s of getSeasonalInstants(after.getUTCFullYear() + dy)) {
      if (s.instant.getTime() >= after.getTime() && (!best || s.instant < best.instant)) {
        best = s;
      }
    }
  }
  return best;
}

/** Format helper: "2026-03-20 14:46 UTC" for event details. */
export function formatUtcInstant(instant: Date): string {
  const p = (n: number, w = 2) => String(n).padStart(w, '0');
  return `${instant.getUTCFullYear()}-${p(instant.getUTCMonth() + 1)}-${p(instant.getUTCDate())} ` +
    `${p(instant.getUTCHours())}:${p(instant.getUTCMinutes())} UTC`;
}

/** Tag the shared AstronomicalEvent shape from computed seasonal instants. */
export function seasonalInstantToEvent(s: SeasonalInstant): AstronomicalEvent {
  const provenance: DataProvenance = 'live';
  return {
    type: s.type,
    date: s.instant,
    utcTime: s.instant.getTime(),
    label: s.label,
    icon: s.icon,
    isMajor: true,
    provenance,
    detail: `Computed λ = ${s.longitudeDeg}° crossing · ${formatUtcInstant(s.instant)} · ${s.season}`,
  };
}