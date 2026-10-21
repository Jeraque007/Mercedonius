'use client';

/**
 * App Settings Context
 * ====================
 * Session-wide user preferences: observation location, calendar view mode
 * and zodiac system. Held in React state at the root layout, so a change on
 * the Settings page propagates to every page immediately. Deliberately
 * in-memory only — preferences reset on reload (no persistence layer).
 */

import React, { createContext, useContext, useMemo, useState } from 'react';
import type { AppLocation } from '@lib/local-sky';

export type ViewMode = 'dual' | 'gregorian' | 'mercedonius';
export type ZodiacSystem = 'iau' | 'tropical' | 'vedic';

/** Default observation location — explicit and labelled, not hidden. */
export const DEFAULT_LOCATION: AppLocation = {
  name: 'Germiston, South Africa (default)',
  latitude: -26.1556,
  longitude: 28.2228,
  timeZone: 'Africa/Johannesburg',
};

interface SettingsContextValue {
  /** Observation location — drives rise/set and local civil-date boundaries. */
  location: AppLocation;
  setLocation: (location: AppLocation) => void;
  /** Calendar grid view mode shown on the calendar page. */
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  /** Zodiac system shown alongside the Sun's position. */
  zodiacSystem: ZodiacSystem;
  setZodiacSystem: (system: ZodiacSystem) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<AppLocation>(DEFAULT_LOCATION);
  const [viewMode, setViewMode] = useState<ViewMode>('dual');
  const [zodiacSystem, setZodiacSystem] = useState<ZodiacSystem>('iau');

  const value = useMemo<SettingsContextValue>(
    () => ({
      location,
      setLocation,
      viewMode,
      setViewMode,
      zodiacSystem,
      setZodiacSystem,
    }),
    [location, viewMode, zodiacSystem]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

/** Read (and update) the app-wide settings. Must be used within SettingsProvider. */
export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within a <SettingsProvider>');
  }
  return ctx;
}
