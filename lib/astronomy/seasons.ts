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
 * lies inside the window.
 *
 * λ advances ≈0.986°/day, so the crossing is first ESTIMATED from the
 * forward angular offset to the target, then bisected over a ±15-day
 * neighbourhood of that estimate (≈±15° — far inside the ±180° wrap-free
 * range). NOTE: a naive full-window end check cannot work for windows ≥
 * 1 year — λ wraps back to its starting sign by the window's end, which
 * silently returned null for every seasonal instant.
 */
export function findSolarLongitudeCrossing(
  targetDeg: number,
  from: Date,
  windowDays: number
): Date | null {
  const DAY_MS = 86400000;
  const fromMs = from.getTime();

  // Forward angular offset to the target (0 ≤ offset < 360).
  const offsetDeg = normalizeDegrees(targetDeg - getSunEclipticPosition(from).longitudeDeg);

  // Rough arrival estimate at the mean solar rate (0.9856°/day); the real
  // rate deviates by at most a few days over half an orbit.
  const estimateMs = fromMs + (offsetDeg / 0.9856) * DAY_MS;

  // ±15-day search window around the estimate, clamped to [from, from+window].
  const lo = Math.max(fromMs, estimateMs - 15 * DAY_MS);
  const hi = Math.min(estimateMs + 15 * DAY_MS, fromMs + windowDays * DAY_MS);
  if (hi <= lo) return null; // estimate lies outside the allowed window

  // Require a sign change inside the window; otherwise the crossing has
  // already passed (d0 ≥ 0) or is not reached within windowDays (d1 < 0).
  let low = lo;
  let high = hi;
  const d0 = lambdaDelta(new Date(low), targetDeg);
  const d1 = lambdaDelta(new Date(high), targetDeg);
  if (d0 >= 0 || d1 < 0) return null;

  // Bisect: λ increases monotonically ⇒ delta crosses zero once.
  for (let i = 0; i < 40 && high - low > 250; i++) {
    const mid = (low + high) / 2;
    if (lambdaDelta(new Date(mid), targetDeg) < 0) low = mid;
    else high = mid;
  }
  return new Date((low + high) / 2);
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