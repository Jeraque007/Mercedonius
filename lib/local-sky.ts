/**
 * Local Sky View-Model (redesign Point 4)
 * =======================================
 *
 * Everything the UI shows about the sky FROM A LOCATION on a civil date,
 * assembled for one purpose: changing the location must update local
 * sunrise/sunset, moonrise/moonset, local event times, and per-event
 * visibility — while staying honest about what cannot be computed.
 *
 * All instants are UTC (time policy §1); local wall-clock strings appear
 * only in the formatted display fields (§3).
 */

import type { GregorianDate } from './mercedonius/engine';
import { startOfDayInstant, endOfDayInstant, formatInZone } from './time-policy';
import { getSunRiseSet, getMoonRiseSet, bodyAltitudeDeg, SUN_RISE_SET_THRESHOLD_DEG, type RiseSetTimes } from './astronomy/rise-set';
import { getComputedEventsInWindow } from './events';
import { formatUtcInstant } from './astronomy/seasons';
import type { DataProvenance } from './provenance';

/** The user's observation location — a distinct concept from the selected date. */
export interface AppLocation {
  /** Human-readable label, e.g. "Germiston, South Africa". */
  name: string;
  latitude: number;
  longitude: number;
  /** IANA zone used for civil dates and local wall-clock display. */
  timeZone: string;
}

export interface LocalSkyEvent {
  type: string;
  label: string;
  icon: string;
  /** True instant of the event (UTC). */
  instant: Date;
  /** Wall-clock time at the location (display-only). */
  localTime: string;
  /** Canonical UTC text (time policy §1). */
  utcText: string;
  provenance: DataProvenance;
  /** Honest visibility note at this location, or null when not applicable. */
  visibility: string | null;
  detail?: string;
}

export interface LocalSky {
  civilDate: GregorianDate;
  location: AppLocation;
  /** Local civil-day window (instants). */
  dayStart: Date;
  dayEnd: Date;
  sun: RiseSetTimes;
  moon: RiseSetTimes;
  events: LocalSkyEvent[];
}

/**
 * Per-event visibility at a location: is the (Sun above the) horizon up,
 * and where is the event's body? Returns an honest sentence or null.
 */
export function getEventVisibility(
  instant: Date,
  location: AppLocation,
  body: BodyKindOfEvent
): string | null {
  const sunAlt = bodyAltitudeDeg(instant, location.latitude, location.longitude, 'sun');
  const sunUp = sunAlt > SUN_RISE_SET_THRESHOLD_DEG;
  const daylight = sunUp
    ? `daylight at ${location.name} (Sun ${sunAlt.toFixed(0)}° up)`
    : `night at ${location.name} (Sun ${Math.abs(sunAlt).toFixed(0)}° below horizon)`;

  if (body === 'sun') return `Occurs during ${daylight}.`;

  const moonAlt = bodyAltitudeDeg(instant, location.latitude, location.longitude, 'moon');
  const moonWhere =
    moonAlt > 0.125
      ? `Moon above the horizon (${moonAlt.toFixed(0)}°)`
      : `Moon below the horizon (${Math.abs(moonAlt).toFixed(0)}° down)`;
  return `${moonWhere} — ${daylight}.`;
}

type BodyKindOfEvent = 'sun' | 'moon' | 'none';

/** Classify which body an event type is about, for visibility purposes. */
function eventBody(type: string): BodyKindOfEvent {
  if (type === 'new_moon' || type === 'first_quarter' || type === 'full_moon' || type === 'last_quarter') return 'moon';
  if (type === 'equinox' || type === 'solstice') return 'sun';
  if (type === 'solar_eclipse' || type === 'lunar_eclipse') return 'sun'; // daylight/night context is what we can honestly say
  return 'none';
}

/**
 * Build the local sky for a civil date at a location.
 * Rise/set derive from live altitude sampling; events from live seasonal &
 * lunar-phase computations. Polar cases are labelled, never invented.
 */
export function getLocalSky(
  civilDate: GregorianDate,
  location: AppLocation,
  eventProvenance?: (type: string) => DataProvenance
): LocalSky {
  const dayStart = startOfDayInstant(civilDate, location.timeZone);
  const dayEnd = endOfDayInstant(civilDate, location.timeZone);

  const sun = getSunRiseSet(dayStart, dayEnd, location.latitude, location.longitude);
  const moon = getMoonRiseSet(dayStart, dayEnd, location.latitude, location.longitude);

  const rawEvents = getComputedEventsInWindow(dayStart, dayEnd);
  const events: LocalSkyEvent[] = rawEvents.map((e) => {
    const instant = new Date(e.utcTime);
    const body = eventBody(e.type);
    return {
      type: e.type,
      label: e.label,
      icon: e.icon,
      instant,
      localTime: formatInZone(instant, location.timeZone),
      utcText: formatUtcInstant(instant),
      provenance: eventProvenance?.(e.type) ?? e.provenance ?? 'live',
      visibility: body === 'none' ? null : getEventVisibility(instant, location, body),
      detail: e.detail,
    };
  });

  return { civilDate, location, dayStart, dayEnd, sun, moon, events };
}