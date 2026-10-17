'use client';

/**
 * Event Countdown (redesign Point 4)
 * =================================
 * Counts down (or back) to a target event instant, driven by the app's
 * live clock: it updates every second and RECALCULATES when the target
 * event changes (a new target is passed in whenever selection/time
 * advances past the old one). Past events are reported honestly as
 * "occurred … ago" — never as a negative countdown.
 */

import React from 'react';
import { formatInZone } from '@lib/time-policy';
import type { AstronomicalEvent } from '@lib/astronomy/types';
import { ProvenanceBadge } from './provenance-badge';

/** Human duration like "3d 12h 04m 09s" from a millisecond span (absolute). */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (d > 0 || h > 0) parts.push(`${h}h`);
  if (d > 0 || h > 0 || m > 0) parts.push(`${String(m).padStart(2, '0')}m`);
  parts.push(`${String(s).padStart(2, '0')}s`);
  return parts.join(' ');
}

interface EventCountdownProps {
  /** Target event (already chosen by the caller), or null when none exists. */
  event: AstronomicalEvent | null;
  /** The live current moment. */
  now: Date;
  /** Zone for the local wall-clock line. */
  timeZone: string;
  hour12: boolean;
}

export function EventCountdown({ event, now, timeZone, hour12 }: EventCountdownProps) {
  if (!event) {
    return (
      <div className="event-countdown">
        <p className="countdown-empty">
          No upcoming computed event could be found — nothing is shown rather than a made-up
          target.
        </p>
      </div>
    );
  }

  const delta = event.utcTime - now.getTime();
  const isPast = delta < 0;
  const target = new Date(event.utcTime);

  return (
    <div className="event-countdown">
      <div className="countdown-head">
        <span className="countdown-icon" aria-hidden="true">
          {event.icon}
        </span>
        <span className="countdown-label">{event.label}</span>
        {event.provenance && <ProvenanceBadge kind={event.provenance} />}
      </div>
      <div className={`countdown-value${isPast ? ' past' : ''}`} role="timer">
        {isPast ? `occurred ${formatDuration(-delta)} ago` : `in ${formatDuration(delta)}`}
      </div>
      <div className="countdown-target">
        {formatInZone(target, timeZone, { hour12 })} at {timeZone} ·{' '}
        {formatInZone(target, 'UTC', { hour12: false })} UTC
      </div>
      {event.detail && <p className="countdown-detail">{event.detail}</p>}
    </div>
  );
}