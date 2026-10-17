/**
 * Lunar Phase Instants — COMPUTED, not tabulated (redesign Point 4)
 * =================================================================
 *
 * Phase instants (new / first quarter / full / last quarter) are found by
 * bisection on the Moon−Sun ecliptic elongation relative to the phase
 * target angle. Uses the platform's own moon & sun models, so results are
 * live computations for the exact inputs — accurate to well under an hour
 * (models: ~0.01° on the Sun, small lunar-perturbation error ⇒ minutes).
 *
 * Replaces the mean-synodic-month extrapolation for anything displayed as
 * a dated event (lib/moon-service.ts remains for legacy callers).
 */

import { getMoonEquatorialPosition } from './moon';
import { getSunEclipticPosition } from './sun';
import { normalizeDegrees } from './coordinates';

export type LunarPhaseKind = 'new_moon' | 'first_quarter' | 'full_moon' | 'last_quarter';

export const LUNAR_PHASE_TARGETS: Record<LunarPhaseKind, number> = {
  new_moon: 0,
  first_quarter: 90,
  full_moon: 180,
  last_quarter: 270,
};

export const LUNAR_PHASE_ICONS: Record<LunarPhaseKind, string> = {
  new_moon: '🌑',
  first_quarter: '🌓',
  full_moon: '🌕',
  last_quarter: '🌗',
};

export const LUNAR_PHASE_LABELS: Record<LunarPhaseKind, string> = {
  new_moon: 'New Moon',
  first_quarter: 'First Quarter',
  full_moon: 'Full Moon',
  last_quarter: 'Last Quarter',
};

/** Signed (−180..180] elongation difference from the phase target. */
function phaseDelta(instant: Date, kind: LunarPhaseKind): number {
  const moonLon = getMoonEquatorialPosition(instant).eclipticLongitudeDeg;
  const sunLon = getSunEclipticPosition(instant).longitudeDeg;
  return normalizeDegrees(moonLon - sunLon - LUNAR_PHASE_TARGETS[kind] + 180) - 180;
}

/**
 * First instant at or after `from` when the given phase occurs.
 * Elongation increases ≈12.2°/day, so a 1-day scan step can never skip a
 * zero crossing; bisection then converges to sub-second model time.
 */
export function findPhaseInstant(kind: LunarPhaseKind, from: Date, maxScanDays = 35): Date | null {
  const stepMs = 86400000;
  let lo = from.getTime();
  let dLo = phaseDelta(new Date(lo), kind);

  for (let day = 1; day <= maxScanDays; day++) {
    const hi = lo + stepMs;
    const dHi = phaseDelta(new Date(hi), kind);
    if (dLo < 0 && dHi >= 0) {
      let a = lo;
      let b = hi;
      for (let i = 0; i < 40 && b - a > 250; i++) {
        const mid = (a + b) / 2;
        if (phaseDelta(new Date(mid), kind) < 0) a = mid;
        else b = mid;
      }
      const found = new Date((a + b) / 2);
      return found.getTime() >= from.getTime() ? found : new Date(b);
    }
    lo = hi;
    dLo = dHi;
  }
  return null;
}

/**
 * All phase instants of the given kinds inside [start, end).
 * At most one occurrence per kind inside a ≤35-day window.
 */
export function findPhasesInWindow(
  start: Date,
  end: Date,
  kinds: readonly LunarPhaseKind[] = ['new_moon', 'first_quarter', 'full_moon', 'last_quarter']
): Array<{ kind: LunarPhaseKind; instant: Date }> {
  const out: Array<{ kind: LunarPhaseKind; instant: Date }> = [];
  for (const kind of kinds) {
    const found = findPhaseInstant(kind, start);
    if (found && found.getTime() < end.getTime()) {
      out.push({ kind, instant: found });
    }
  }
  out.sort((a, b) => a.instant.getTime() - b.instant.getTime());
  return out;
}