'use client';

import React, { useState } from 'react';
import { calculateBirthSky } from '@lib/astronomy';
import type { BirthSkyResult } from '@lib/astronomy';
import {
  convertGregorianTo13Month,
  formatMercedoniusDate as formatMercedoniusCivilDate,
} from '@lib/date-utils';

/** Format an instant's Mercedonius date, e.g. "November 5, 2026" (engine-routed). */
function formatMercedoniusDate(date: Date): string {
  return formatMercedoniusCivilDate(convertGregorianTo13Month(date));
}

interface BirthProfile {
  date: Date;
  time: Date;
  timezone: string;
  latitude: number;
  longitude: number;
  location: string;
}

interface BirthSkyFormProps {
  onSubmit: (profile: BirthProfile) => void;
}

interface BirthSkyResultsProps {
  profile: Partial<BirthProfile>;
}

export function BirthSkyForm({ onSubmit }: BirthSkyFormProps) {
  const [date, setDate] = useState<Date>(new Date('1975-01-19'));
  const [time, setTime] = useState<Date>(new Date('1975-01-19T18:15:00'));
  const [timezone, setTimezone] = useState<string>('Africa/Johannesburg');
  const [latitude, setLatitude] = useState<number>(-26.1556);
  const [longitude, setLongitude] = useState<number>(28.2228);
  const [location, setLocation] = useState<string>('Germiston, South Africa');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ date, time, timezone, latitude, longitude, location });
  };

  return (
    <form onSubmit={handleSubmit} className="birth-sky-form">
      <div className="input-row">
        <div className="input-item">
          <label>Date of birth</label>
          <input type="date" value={date.toISOString().split('T')[0]} onChange={(e) => setDate(new Date(e.target.value))} />
        </div>
        <div className="input-item">
          <label>Birth time</label>
          <input type="time" value={time.toLocaleTimeString('en-US', { hour12: false })} onChange={(e) => setTime(new Date(new Date().toDateString() + ' ' + e.target.value + ':00'))} />
        </div>
      </div>
      <div className="input-row">
        <div className="input-item">
          <label>Location</label>
          <input type="text" placeholder="e.g., Germiston, South Africa" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div className="input-item">
          <label>Timezone (IANA)</label>
          <input type="text" placeholder="e.g., Africa/Johannesburg" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
        </div>
      </div>
      <div className="input-row">
        <div className="input-item">
          <label>Latitude (°)</label>
          <input type="number" step="0.0001" value={latitude?.toString() || ''} onChange={(e) => setLatitude(parseFloat(e.target.value))} />
        </div>
        <div className="input-item">
          <label>Longitude (°)</label>
          <input type="number" step="0.0001" value={longitude?.toString() || ''} onChange={(e) => setLongitude(parseFloat(e.target.value))} />
        </div>
      </div>
      <button type="submit" className="search-btn">Calculate Birth Sky</button>
    </form>
  );
}

export function BirthSkyResults({ profile }: BirthSkyResultsProps) {
  if (!profile?.date || !profile?.time) {
    return (
      <p className="status-note">
        Enter your birth details and calculate to see your birth sky.
      </p>
    );
  }

  const sky: BirthSkyResult = calculateBirthSky({
    date: profile.date,
    time: profile.time,
    timezone: profile.timezone ?? 'UTC',
    latitude: profile.latitude ?? 0,
    longitude: profile.longitude ?? 0,
    location: profile.location ?? '',
  });

  return (
    <div className="birth-sky-results">
      <div className="sky-object">
        <span className="object-label">Sun</span>
        <span className="object-icon">☀️</span>
        <span className="object-value">
          {sky.sunConstellation.icon} {sky.sunConstellation.name}
          {sky.sunConstellation.isNearBoundary ? ' (near boundary)' : ''}
        </span>
      </div>
      <div className="sky-object">
        <span className="object-label">Moon</span>
        <span className="object-icon">☾</span>
        <span className="object-value">
          {sky.moonConstellation.icon} {sky.moonConstellation.name} — {sky.moonPhase.name}
        </span>
      </div>
      <div className="sky-object">
        <span className="object-label">Rising</span>
        <span className="object-icon">↗</span>
        <span className="object-value">
          {sky.ascendantConstellation.icon} {sky.ascendantConstellation.name}
        </span>
      </div>
      <div className="full-results">
        <p>
          <strong>Sun:</strong> λ {sky.sun.eclipticLongitudeDeg.toFixed(2)}° • RA{' '}
          {sky.sun.raDeg.toFixed(2)}° • Dec {sky.sun.decDeg.toFixed(2)}°
        </p>
        <p>
          <strong>Moon:</strong> {sky.moonPhase.name} (
          {sky.moonPhase.illumination}% illuminated, age{' '}
          {Math.round(sky.moonPhase.ageDays * 10) / 10} d) • λ{' '}
          {sky.moon.eclipticLongitudeDeg.toFixed(2)}° •{' '}
          {Math.round(sky.moon.distanceKm).toLocaleString()} km
        </p>
        <p>
          <strong>Rising:</strong> ascendant λ {sky.ascendant.eclipticLongitudeDeg.toFixed(2)}°
          • RA {sky.ascendant.raDeg.toFixed(2)}° • Dec {sky.ascendant.decDeg.toFixed(2)}°
        </p>
        <p>
          <strong>Timezone:</strong> {sky.timezoneInfo.timezone} (UTC
          {sky.timezoneInfo.offsetHours >= 0 ? '+' : ''}
          {sky.timezoneInfo.offsetHours}
          {sky.timezoneInfo.isDST ? ', DST' : ''})
        </p>
        <p className="status-note">
          Note: birth time is interpreted as Universal Time for the astronomical
          calculation. Astronomical positions only — no astrological claims.
        </p>
      </div>
    </div>
  );
}

export function MySkySection({
  now,
  todayView,
}: {
  /** The live current moment — "Today" is real time (Point 4). */
  now: Date;
  todayView: (date: Date) => { sun: string; moon: string; date: string };
}) {
  const [birthProfile, setBirthProfile] = useState<BirthProfile | null>(null);

  return (
    <div className="my-sky">
      <h3>My Sky</h3>
      <div className="sky-section">
        <h4>My Birth Sky</h4>
        <BirthSkyForm onSubmit={(profile) => setBirthProfile(profile)} />
        {birthProfile && <BirthSkyResults profile={birthProfile} />}
      </div>
      <div className="sky-section">
        <h4>Tonight's Sky <span className="pane-origin">— live, current moment</span></h4>
        <div className="tonight-sky">
          <div className="sky-object">
            <span className="object-label">Sun</span>
            <span className="object-icon">☀️</span>
            <span className="object-value">{todayView(now).sun}</span>
          </div>
          <div className="sky-object">
            <span className="object-label">Moon</span>
            <span className="object-icon">☾</span>
            <span className="object-value">{todayView(now).moon}</span>
          </div>
        </div>
      </div>
      <div className="sky-section">
        <h4>Today's Date <span className="pane-origin">— live, current moment</span></h4>
        <div className="gregorian-date">
          <span className="date-kind">Gregorian</span>{' '}
          {todayView(now).date}
        </div>
        <div className="mercedonius-date">
          <span className="date-kind">Mercedonius</span>{' '}
          {formatMercedoniusDate(now)}
        </div>
      </div>
    </div>
  );
}
