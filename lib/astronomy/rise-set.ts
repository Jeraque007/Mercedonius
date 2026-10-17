/**
 * Rise / Set / Culmination (redesign Point 4)
 * ===========================================
 *
 * Living horizon events computed from the same position models used
 * elsewhere on the platform (Meeus-style sun & moon). Nothing here is
 * tabulated: results derive from the selected DATE, the LOCATION
 * (latitude/longitude), and explicit altitude thresholds.
 *
 * Method: sample the body's altitude at fixed steps across the civil-day
 * window, detect sign changes of (altitude − threshold), refine crossings
 * by linear interpolation, and classify polar cases honestly:
 *
 *  - 'always-up'    body never drops below the threshold that day
 *                   (midnight sun / polar daylight).
 *  - 'always-down'  body never rises above it (polar night, or for the
 *                   Moon: below the horizon for the entire day).
 *  - 'ok'           at least one rise and/or set occurred in the window.
 *
 * Time accuracy: sampling step is 5 min, crossings interpolated — treat
 * times as ±5 min (display precision; provenance is still 'live' because
 * they ARE computed for the exact inputs).
 */

import { normalizeDegrees } from './coordinates';
import { equatorialToHorizontal } from './horizon';
import { getSunEquatorialPosition } from './sun';
import { getMoonEquatorialPosition } from './moon';

export type HorizonStatus = 'ok' | 'always-up' | 'always-down';

export interface RiseSetTimes {
  status: HorizonStatus;
  /** First rise inside the window (null when none occurred). */
  rise: Date | null;
  /** First set inside the window (null when none occurred). */
  set: Date | null;
  /** Moment of highest altitude in the window (culmination). */
  culmination: Date | null;
  /** Peak altitude reached, degrees. */
  peakAltitudeDeg: number;
}

interface EquatorialBody {
  (instant: Date): { raDeg: number; decDeg: number };
}

/** Greenwich mean sidereal time (deg) — same algorithm as rising.ts. */
function gmstDeg(instant: Date): number {
  const jd = instant.getTime() / 86400000 + 2440587.5;
  const d = jd - 2451545.0;
  const T = d / 36525.0;
  return normalizeDegrees(280.46061837 + 360.98564736629 * d + 0.000387933 * T * T);
}

function altitudeDeg(instant: Date, lat: number, lng: number, body: EquatorialBody): number {
  const { raDeg, decDeg } = body(instant);
  const lst = normalizeDegrees(gmstDeg(instant) + lng);
  return equatorialToHorizontal(raDeg, decDeg, lst, lat).altitudeDeg;
}

const SAMPLE_STEP_MS = 5 * 60 * 1000;

/**
 * Generic rise/set solver over an arbitrary instant window.
 * `thresholdDeg` is the effective altitude of the event (refraction +
 * semidiameter already folded in by the caller).
 */
export function computeRiseSet(
  windowStart: Date,
  windowEnd: Date,
  latitudeDeg: number,
  longitudeDeg: number,
  body: EquatorialBody,
  thresholdDeg: number
): RiseSetTimes {
  const start = windowStart.getTime();
  const end = windowEnd.getTime();
  if (!(end > start)) {
    return { status: 'always-down', rise: null, set: null, culmination: null, peakAltitudeDeg: -90 };
  }

  let rise: Date | null = null;
  let set: Date | null = null;
  let peakAlt = -Infinity;
  let peakTime = start;
  let prevAlt = altitudeDeg(new Date(start), latitudeDeg, longitudeDeg, body) - thresholdDeg;
  let minAlt = prevAlt;
  let maxAlt = prevAlt;
  let prevT = start;

  for (let t = start + SAMPLE_STEP_MS; t <= end; t += SAMPLE_STEP_MS) {
    const cur = altitudeDeg(new Date(t), latitudeDeg, longitudeDeg, body) - thresholdDeg;
    if (cur > maxAlt) {
      maxAlt = cur;
      peakTime = t;
    }
    if (cur < minAlt) minAlt = cur;

    if (prevAlt < 0 && cur >= 0 && !rise) {
      const frac = prevAlt / (prevAlt - cur); // 0..1 between prevT and t
      rise = new Date(prevT + frac * (t - prevT));
    } else if (prevAlt >= 0 && cur < 0 && !set) {
      const frac = prevAlt / (prevAlt - cur);
      set = new Date(prevT + frac * (t - prevT));
    }

    prevAlt = cur;
    prevT = t;
  }

  if (minAlt > 0) {
    return {
      status: 'always-up',
      rise: null,
      set: null,
      culmination: new Date(peakTime),
      peakAltitudeDeg: peakAlt + thresholdDeg,
    };
  }
  if (maxAlt < 0) {
    return {
      status: 'always-down',
      rise: null,
      set: null,
      culmination: null,
      peakAltitudeDeg: peakAlt + thresholdDeg,
    };
  }

  // Parabolic refinement of the sampled peak (3-point interpolation).
  let culmination = new Date(peakTime);
  const peakIdx = Math.round((peakTime - start) / SAMPLE_STEP_MS);
  const tPrev = start + (peakIdx - 1) * SAMPLE_STEP_MS;
  const tCur = start + peakIdx * SAMPLE_STEP_MS;
  const tNext = start + (peakIdx + 1) * SAMPLE_STEP_MS;
  if (tPrev >= start && tNext <= end) {
    const y0 = altitudeDeg(new Date(tPrev), latitudeDeg, longitudeDeg, body);
    const y1 = altitudeDeg(new Date(tCur), latitudeDeg, longitudeDeg, body);
    const y2 = altitudeDeg(new Date(tNext), latitudeDeg, longitudeDeg, body);
    const denom = y0 - 2 * y1 + y2;
    if (denom !== 0) {
      const offset = (0.5 * (y0 - y2)) / denom; // units of one sample step
      if (Math.abs(offset) <= 1) {
        culmination = new Date(tCur + offset * SAMPLE_STEP_MS);
      }
    }
  }

  // Recompute exact peak altitude on the refined path only for reporting.
  let truePeak = -Infinity;
  for (let t = start; t <= end; t += SAMPLE_STEP_MS) {
    const a = altitudeDeg(new Date(t), latitudeDeg, longitudeDeg, body);
    if (a > truePeak) truePeak = a;
  }

  return { status: 'ok', rise, set, culmination, peakAltitudeDeg: truePeak };
}

/** Effective sun altitude at rise/set: refraction + apparent semidiameter. */
export const SUN_RISE_SET_THRESHOLD_DEG = -0.833;
/** Effective Moon altitude at rise/set: refraction + mean semidiameter. */
export const MOON_RISE_SET_THRESHOLD_DEG = 0.125;

/** Sunrise/sunset for the window at the given location. Live computation. */
export function getSunRiseSet(
  windowStart: Date,
  windowEnd: Date,
  latitudeDeg: number,
  longitudeDeg: number
): RiseSetTimes {
  return computeRiseSet(
    windowStart,
    windowEnd,
    latitudeDeg,
    longitudeDeg,
    getSunEquatorialPosition,
    SUN_RISE_SET_THRESHOLD_DEG
  );
}

/** Moonrise/moonset for the window at the given location. Live computation. */
export function getMoonRiseSet(
  windowStart: Date,
  windowEnd: Date,
  latitudeDeg: number,
  longitudeDeg: number
): RiseSetTimes {
  return computeRiseSet(
    windowStart,
    windowEnd,
    latitudeDeg,
    longitudeDeg,
    getMoonEquatorialPosition,
    MOON_RISE_SET_THRESHOLD_DEG
  );
}

/** Which body a caller means when asking for an instant altitude. */
export type BodyKind = 'sun' | 'moon';

/**
 * Instant altitude (deg) of the Sun or Moon at a location — used for
 * honest per-event visibility notes ("daylight / night", "above /
 * below the horizon at <location>").
 */
export function bodyAltitudeDeg(instant: Date, latitudeDeg: number, longitudeDeg: number, body: BodyKind): number {
  const fn: EquatorialBody = body === 'sun' ? getSunEquatorialPosition : getMoonEquatorialPosition;
  return altitudeDeg(instant, latitudeDeg, longitudeDeg, fn);
}
