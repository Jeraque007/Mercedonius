'use client';

import React, { useState } from 'react';
import {
  calculateBirthSky,
  getSunConstellation,
  getMoonPhase,
  getSunTropicalSign,
  getMoonTropicalSign,
  getSiderealSign,
} from '@lib/astronomy';
import type { BirthSkyResult } from '@lib/astronomy';
import { useSettings } from './settings-context';
import {
  convertGregorianTo13Month,
  formatMercedoniusDate as formatMercedoniusCivilDate,
  formatDateForDisplay,
} from '@lib/date-utils';

/** Validate an IANA time zone; returns error text or null. */
function validateTimeZone(tz: string): string | null {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz.trim() });
    return null;
  } catch {
    return `"${tz.trim()}" is not a valid IANA time zone (e.g. Africa/Johannesburg)`;
  }
}

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
  // Privacy: the form starts BLANK — no personal birth date/time, location or
  // coordinates are prefilled, and results only appear after an explicit
  // submit of data the user chose to type.
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [timezone, setTimezone] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!date || !time) {
      setError('Date and time of birth are required.');
      return;
    }
    if (!location.trim()) {
      setError('Location is required.');
      return;
    }
    const tzError = validateTimeZone(timezone);
    if (tzError) {
      setError(tzError);
      return;
    }
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      setError('Latitude must be a number between −90 and 90.');
      return;
    }
    if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
      setError('Longitude must be a number between −180 and 180.');
      return;
    }

    onSubmit({
      date: new Date(date),
      time: new Date(`${date}T${time}:00`),
      timezone: timezone.trim(),
      latitude: lat,
      longitude: lon,
      location: location.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="birth-sky-form">
      <div className="input-row">
        <div className="input-item">
          <label>Date of birth</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="input-item">
          <label>Birth time</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="input-row">
        <div className="input-item">
          <label>Location</label>
          <input
            type="text"
            placeholder="e.g., Primrose, South Africa"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        <div className="input-item">
          <label>Timezone (IANA)</label>
          <input
            type="text"
            placeholder="e.g., Africa/Johannesburg"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="input-row">
        <div className="input-item">
          <label>Latitude (°)</label>
          <input
            type="number"
            step="0.0001"
            min={-90}
            max={90}
            value={latitude}
            placeholder="required"
            onChange={(e) => setLatitude(e.target.value)}
            required
          />
        </div>
        <div className="input-item">
          <label>Longitude (°)</label>
          <input
            type="number"
            step="0.0001"
            min={-180}
            max={180}
            value={longitude}
            placeholder="required"
            onChange={(e) => setLongitude(e.target.value)}
            required
          />
        </div>
      </div>
      {error && <p className="location-error">{error}</p>}
      <button type="submit" className="search-btn" disabled={!date || !time}>
        Calculate Birth Sky
      </button>
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

  // Tropical signs for Sun and Moon on this date
  const sunTropical = getSunTropicalSign(sky.profile.birthTime);
  const moonTropical = getMoonTropicalSign(sky.profile.birthTime);

  // Sidereal (Vedic) signs — sidereal longitude = tropical − ayanamsa
  const sunSidereal = getSiderealSign(
    sky.sun.eclipticLongitudeDeg,
    sky.profile.birthTime
  );
  const moonSidereal = getSiderealSign(
    sky.moon.eclipticLongitudeDeg,
    sky.profile.birthTime
  );

  const ayanamsaDeg = sunSidereal.ayanamsaDeg;

  return (
    <div className="birth-sky-results">
      <div className="sky-object">
        <span className="object-label">Sun</span>
        <span className="object-icon">☀️</span>
        <span className="object-value">
          {sunTropical.icon} {sunTropical.name} (tropical) ·
          {sunSidereal.icon} {sunSidereal.name} (sidereal/Vedic) ·
          λ {sky.sun.eclipticLongitudeDeg.toFixed(2)}°
        </span>
      </div>
      <div className="sky-object">
        <span className="object-label">Moon</span>
        <span className="object-icon">☾</span>
        <span className="object-value">
          {moonTropical.icon} {moonTropical.name} (tropical) ·
          {moonSidereal.icon} {moonSidereal.name} (sidereal/Vedic) ·
          λ {sky.moon.eclipticLongitudeDeg.toFixed(2)}°
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
        <p>
          <strong>Ayanamsa (Lahiri):</strong> {ayanamsaDeg.toFixed(4)}° — sidereal
          = tropical − ayanamsa
        </p>
        <p className="status-note">
          Tropical and sidereal signs shown side by side. Birth time is
          interpreted as Universal Time for the astronomical calculation.
          Astronomical positions only — no astrological claims.
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
  // App-wide preferences (Settings page): observation location + zodiac system.
  const { location, zodiacSystem } = useSettings();
  const [birthProfile, setBirthProfile] = useState<BirthProfile | null>(null);

  // "Tonight's Sky" Sun line honours the selected zodiac system: IAU
  // constellation, tropical sign, or sidereal (Lahiri) sign — all reading the
  // same ecliptic longitude, only the segmentation differs.
  const sunLine =
    zodiacSystem === 'tropical'
      ? (() => {
          const s = getSunTropicalSign(now);
          return `${s.icon} ${s.name} (Tropical)`;
        })()
      : zodiacSystem === 'vedic'
        ? (() => {
            const lon = getSunConstellation(now).constellationResult.eclipticLongitudeDeg;
            const s = getSiderealSign(lon, now);
            return `${s.icon} ${s.name} (${s.sanskrit})`;
          })()
        : todayView(now).sun;

  return (
    <div className="my-sky">
      <h3>My Sky</h3>
      <div className="sky-section">
        <h4>My Birth Sky</h4>
        <BirthSkyForm onSubmit={(profile) => setBirthProfile(profile)} />
        {birthProfile && <BirthSkyResults profile={birthProfile} />}
      </div>
      <div className="sky-section">
        <h4>
          Tonight's Sky{' '}
          <span className="pane-origin">
            — live, current moment · {location.name}
          </span>
        </h4>
        <div className="tonight-sky">
          <div className="sky-object">
            <span className="object-label">Sun</span>
            <span className="object-icon">☀️</span>
            <span className="object-value">{sunLine}</span>
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
