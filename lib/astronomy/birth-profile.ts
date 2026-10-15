/**
 * Birth Sky Profile Calculations
 *
 * Computes the astronomical sky at the moment of birth: Sun constellation,
 * Moon constellation and phase, and the rising (ascendant) constellation.
 *
 * NOTE: the entered wall-clock birth time is treated as Universal Time (UT)
 * for the astronomical calculations; the IANA timezone is stored as metadata
 * and reported in `timezoneInfo`. This keeps results deterministic across
 * machines regardless of the host timezone.
 */

import { getSunEquatorialPosition, getSunConstellation } from './sun';
import { getMoonEquatorialPosition, getMoonConstellation, getMoonPhase } from './moon';
import { getAscendantPosition, getAscendantConstellation } from './rising';
import type { BirthProfile, BirthSkyResult } from './types';

export interface BirthSkyInput {
  /** Birth date (time-of-day part is ignored) */
  date: Date;
  /** Birth wall-clock time (hours/minutes are read as UT — see module note) */
  time: Date;
  /** IANA timezone identifier, e.g. "Africa/Johannesburg" */
  timezone: string;
  latitude: number;
  longitude: number;
  /** Human-readable location label */
  location: string;
}

/** Offset (hours) of an IANA timezone at a given instant, via Intl. */
export function getTimezoneOffsetHours(timezone: string, utcDate: Date): number {
  try {
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const parts = dtf.formatToParts(utcDate);
    const get = (type: string) =>
      parseInt(parts.find((p) => p.type === type)?.value ?? '0', 10);
    const asUtc = Date.UTC(
      get('year'),
      get('month') - 1,
      get('day'),
      get('hour') % 24,
      get('minute'),
      get('second')
    );
    return Math.round(((asUtc - utcDate.getTime()) / 3600000) * 100) / 100;
  } catch {
    return 0;
  }
}

/** Calculate the full birth sky from a birth profile. */
export function calculateBirthSky(input: BirthSkyInput): BirthSkyResult {
  // Wall-clock time treated as UT (see module note).
  const utcDate = new Date(
    Date.UTC(
      input.date.getUTCFullYear(),
      input.date.getUTCMonth(),
      input.date.getUTCDate(),
      input.time.getHours(),
      input.time.getMinutes()
    )
  );

  const profile: BirthProfile = {
    dateOfBirth: input.date,
    birthTime: input.time,
    timezone: input.timezone,
    latitude: input.latitude,
    longitude: input.longitude,
    utcTimestamp: utcDate.getTime(),
    utcDate,
    location: input.location,
  };

  const sun = getSunEquatorialPosition(utcDate);
  const sunConst = getSunConstellation(utcDate);

  const moon = getMoonEquatorialPosition(utcDate);
  const moonConst = getMoonConstellation(utcDate);
  const moonPhase = getMoonPhase(utcDate);

  const ascendant = getAscendantPosition(
    utcDate,
    input.latitude,
    input.longitude,
    input.timezone
  );
  const ascendantConst = getAscendantConstellation(
    ascendant.eclipticLongitudeDeg,
    input.latitude,
    input.longitude,
    input.timezone
  );

  // Timezone metadata
  const offsetHours = getTimezoneOffsetHours(input.timezone, utcDate);
  const janOffset = getTimezoneOffsetHours(
    input.timezone,
    new Date(Date.UTC(input.date.getUTCFullYear(), 0, 1))
  );
  const julOffset = getTimezoneOffsetHours(
    input.timezone,
    new Date(Date.UTC(input.date.getUTCFullYear(), 6, 1))
  );
  const standardOffset = Math.min(janOffset, julOffset);

  return {
    profile,
    sun,
    sunConstellation: sunConst.constellationResult,
    moon,
    moonConstellation: moonConst.constellationResult,
    moonPhase,
    ascendant,
    ascendantConstellation: ascendantConst.constellationResult,
    timezoneInfo: {
      timezone: input.timezone,
      offsetHours,
      utcOffset: offsetHours,
      isDST: offsetHours > standardOffset,
    },
  };
}