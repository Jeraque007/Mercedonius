'use client';

/**
 * Local Sky Panel (redesign Point 4)
 * ==================================
 * Displays the live-computed horizon events and event times FOR THE
 * SELECTED DATE AT THE SELECTED LOCATION. Polar / absent phenomena are
 * labelled honestly instead of replaced by invented values.
 */

import React, { memo } from 'react';
import type { LocalSky } from '@lib/local-sky';
import type { RiseSetTimes } from '@lib/astronomy/rise-set';
import { formatInZone } from '@lib/time-policy';
import { ProvenanceBadge } from './provenance-badge';

interface LocalSkyPanelProps {
  sky: LocalSky;
  hour12: boolean;
}

/** Honest one-line summary of a rise/set result. */
function describeRiseSet(rs: RiseSetTimes, kind: 'Sun' | 'Moon', sky: LocalSky, hour12: boolean): {
  riseText: string;
  setText: string;
  note: string | null;
} {
  const tz = sky.location.timeZone;
  if (rs.status === 'always-up') {
    return {
      riseText: '—',
      setText: '—',
      note:
        kind === 'Sun'
          ? `No sunset — the Sun stays above the horizon all day at this latitude (polar daylight).`
          : `The Moon stays above the horizon all day here (no moonset this date).`,
    };
  }
  if (rs.status === 'always-down') {
    return {
      riseText: '—',
      setText: '—',
      note:
        kind === 'Sun'
          ? `No sunrise — the Sun stays below the horizon all day at this latitude (polar night).`
          : `The Moon stays below the horizon all day here (no moonrise this date).`,
    };
  }
  return {
    riseText: rs.rise ? formatInZone(rs.rise, tz, { hour12 }) : '— none this day',
    setText: rs.set ? formatInZone(rs.set, tz, { hour12 }) : '— none this day',
    note: null,
  };
}

export const LocalSkyPanel = memo(function LocalSkyPanel({ sky, hour12 }: LocalSkyPanelProps) {
  const sun = describeRiseSet(sky.sun, 'Sun', sky, hour12);
  const moon = describeRiseSet(sky.moon, 'Moon', sky, hour12);
  const tz = sky.location.timeZone;

  return (
    <div className="local-sky-panel">
      <div className="local-sky-head">
        <h3>Local Sky — {sky.location.name}</h3>
        <span className="local-sky-zone">{tz}</span>
      </div>

      <div className="local-sky-grid">
        <div className="sky-event-card">
          <div className="sky-event-title">
            ☀️ Sun <ProvenanceBadge kind="live" compact />
          </div>
          <div className="sky-event-times">
            <div>
              <span className="sky-event-key">Sunrise</span>
              <span className="sky-event-value">{sun.riseText}</span>
            </div>
            <div>
              <span className="sky-event-key">Sunset</span>
              <span className="sky-event-value">{sun.setText}</span>
            </div>
            {sky.sun.status === 'ok' && sky.sun.culmination && (
              <div>
                <span className="sky-event-key">Solar noon</span>
                <span className="sky-event-value">{formatInZone(sky.sun.culmination, tz, { hour12 })}</span>
              </div>
            )}
          </div>
          {sun.note && <p className="sky-event-note">{sun.note}</p>}
        </div>

        <div className="sky-event-card">
          <div className="sky-event-title">
            ☾ Moon <ProvenanceBadge kind="live" compact />
          </div>
          <div className="sky-event-times">
            <div>
              <span className="sky-event-key">Moonrise</span>
              <span className="sky-event-value">{moon.riseText}</span>
            </div>
            <div>
              <span className="sky-event-key">Moonset</span>
              <span className="sky-event-value">{moon.setText}</span>
            </div>
          </div>
          {moon.note && <p className="sky-event-note">{moon.note}</p>}
        </div>
      </div>

      <div className="local-sky-events">
        <h4>Events during this local day</h4>
        {sky.events.length === 0 ? (
          <p className="no-events">
            No computed events fall inside this local day — nothing is shown rather than an
            invented event.
          </p>
        ) : (
          <ul className="events-list">
            {sky.events.map((ev) => (
              <li key={`${ev.type}-${ev.instant.getTime()}`} className="local-sky-event">
                <span className="event-icon" aria-hidden="true">
                  {ev.icon}
                </span>
                <span className="event-label">{ev.label}</span>
                <span className="event-time">
                  {ev.localTime} local · {ev.utcText}
                </span>
                <ProvenanceBadge kind={ev.provenance} />
                {ev.visibility && <span className="event-visibility">{ev.visibility}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
});