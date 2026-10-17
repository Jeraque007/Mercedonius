'use client';

/**
 * Application State Hook (redesign Point 4)
 * =========================================
 *
 * Keeps the five distinct concepts SEPARATE, as required:
 *
 *  1. current moment   — `now`, a real ticking clock (Today is real time).
 *  2. selected date    — `selection`: either following the live moment or
 *                        fixed at a user-picked day (anchored at local
 *                        noon in the location zone, per time policy).
 *  3. calendar system  — `viewMode`: pure presentation of the SAME
 *                        instant; changing it never alters the date.
 *  4. location         — `location`: observation place; drives civil-date
 *                        resolution (zone) and all local sky values.
 *  5. user preferences — `preferences`: display choices (12/24h clock).
 *
 * Everything displayed derives from these inputs; nothing invents its own
 * "current date".
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { localCivilDate, zonedCivilToInstant } from '@lib/time-policy';
import { gregorianToJDN, jdnToGregorian, type GregorianDate } from '@lib/mercedonius/engine';
import type { AppLocation } from '@lib/local-sky';

/** Default observation location — explicit and labelled, not hidden. */
export const DEFAULT_LOCATION: AppLocation = {
  name: 'Germiston, South Africa (default)',
  latitude: -26.1556,
  longitude: 28.2228,
  timeZone: 'Africa/Johannesburg',
};

/** Selection: follow the live moment, or a fixed (user-picked) instant. */
export type Selection = { kind: 'live' } | { kind: 'fixed'; instant: Date };

export type ViewMode = 'dual' | 'monthly' | 'gregorian';

export interface Preferences {
  /** 12-hour vs 24-hour wall-clock display. */
  hour12: boolean;
}

/** Gregorian days in a month via engine JDN arithmetic (no JS Date clamping). */
function gregorianDaysInMonth(year: number, month: number): number {
  return (
    gregorianToJDN(month === 12 ? { year: year + 1, month: 1, day: 1 } : { year, month: month + 1, day: 1 }) -
    gregorianToJDN({ year, month, day: 1 })
  );
}

export function useCalendarApp() {
  // ── the five distinct concepts ──
  const [now, setNow] = useState<Date>(() => new Date());
  const [selection, setSelection] = useState<Selection>({ kind: 'live' });
  const [viewMode, setViewMode] = useState<ViewMode>('dual');
  const [location, setLocation] = useState<AppLocation>(DEFAULT_LOCATION);
  const [preferences, setPreferences] = useState<Preferences>({ hour12: true });
  const [showDayDetail, setShowDayDetail] = useState(false);

  // The current moment ticks once per second (drives Today, clocks,
  // countdowns, "live" panes).
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const isLive = selection.kind === 'live';
  const selectedInstant = isLive ? now : selection.instant;

  // Selected civil date resolved in the LOCATION zone (time policy §2).
  const selectedCivilDate: GregorianDate = useMemo(
    () => localCivilDate(selectedInstant, location.timeZone),
    [selectedInstant, location.timeZone]
  );

  // Anchor instant for the selected DAY: local noon in the location zone.
  // Date-dependent astronomy derives from this stable anchor, so a live
  // ticking clock never invalidates day-level computations mid-day.
  const dayAnchor: Date = useMemo(
    () => zonedCivilToInstant(selectedCivilDate, 12, 0, location.timeZone),
    [selectedCivilDate.year, selectedCivilDate.month, selectedCivilDate.day, location.timeZone]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  );

  /** Pick a day (from any grid/cell Date): becomes a FIXED selection. */
  const selectDate = useCallback(
    (d: Date) => {
      const civil = localCivilDate(d, location.timeZone);
      setSelection({ kind: 'fixed', instant: zonedCivilToInstant(civil, 12, 0, location.timeZone) });
    },
    [location.timeZone]
  );

  /** Pick a civil date directly (engine struct). */
  const selectCivilDate = useCallback(
    (civil: GregorianDate) => {
      setSelection({ kind: 'fixed', instant: zonedCivilToInstant(civil, 12, 0, location.timeZone) });
    },
    [location.timeZone]
  );

  /** Today: restore the actual current date AND time (live again). */
  const goToday = useCallback(() => setSelection({ kind: 'live' }), []);

  /** Move the selected civil date by whole years, clamping the day. */
  const shiftSelectedYear = useCallback(
    (deltaYears: number) => {
      const civil = localCivilDate(selectedInstant, location.timeZone);
      const y = civil.year + deltaYears;
      const day = Math.min(civil.day, gregorianDaysInMonth(y, civil.month));
      selectCivilDate({ year: y, month: civil.month, day });
    },
    [selectedInstant, location.timeZone, selectCivilDate]
  );

  const toggleHour12 = useCallback(
    () => setPreferences((p) => ({ ...p, hour12: !p.hour12 })),
    []
  );

  return {
    now,
    selection,
    selectedInstant,
    selectedCivilDate,
    dayAnchor,
    isLive,
    viewMode,
    setViewMode,
    location,
    setLocation,
    preferences,
    toggleHour12,
    showDayDetail,
    setShowDayDetail,
    selectDate,
    selectCivilDate,
    goToday,
    shiftSelectedYear,
  };
}