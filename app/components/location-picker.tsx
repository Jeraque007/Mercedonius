'use client';

/**
 * Location Picker (redesign Point 4)
 * ==================================
 * Changing the location updates the civil-date zone, local sunrise/sunset,
 * moonrise/moonset, local event times, and visibility notes. Presets are
 * labelled data; custom coordinates are validated before they are applied.
 */

import React, { useState } from 'react';
import type { AppLocation } from '@lib/local-sky';

export const LOCATION_PRESETS: AppLocation[] = [
  { name: 'Germiston, South Africa (default)', latitude: -26.1556, longitude: 28.2228, timeZone: 'Africa/Johannesburg' },
  { name: 'Cape Town, South Africa', latitude: -33.9249, longitude: 18.4241, timeZone: 'Africa/Johannesburg' },
  { name: 'London, United Kingdom', latitude: 51.5074, longitude: -0.1278, timeZone: 'Europe/London' },
  { name: 'New York, United States', latitude: 40.7128, longitude: -74.006, timeZone: 'America/New_York' },
  { name: 'Tokyo, Japan', latitude: 35.6762, longitude: 139.6503, timeZone: 'Asia/Tokyo' },
  { name: 'Sydney, Australia', latitude: -33.8688, longitude: 151.2093, timeZone: 'Australia/Sydney' },
];

interface LocationPickerProps {
  location: AppLocation;
  onChange: (location: AppLocation) => void;
}

/** Validate an IANA zone by asking Intl; returns error text or null. */
function validateTimeZone(tz: string): string | null {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return null;
  } catch {
    return `"${tz}" is not a valid IANA time zone`;
  }
}

export function LocationPicker({ location, onChange }: LocationPickerProps) {
  const [open, setOpen] = useState(false);
  const [lat, setLat] = useState(location.latitude.toString());
  const [lng, setLng] = useState(location.longitude.toString());
  const [tz, setTz] = useState(location.timeZone);
  const [customName, setCustomName] = useState('Custom location');
  const [error, setError] = useState<string | null>(null);

  const applyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      setError('Latitude must be a number between −90 and 90.');
      return;
    }
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      setError('Longitude must be a number between −180 and 180.');
      return;
    }
    const tzError = validateTimeZone(tz.trim());
    if (tzError) {
      setError(tzError);
      return;
    }
    setError(null);
    onChange({ name: customName.trim() || 'Custom location', latitude, longitude, timeZone: tz.trim() });
    setOpen(false);
  };

  return (
    <div className="location-picker">
      <div className="location-current">
        <span className="location-label">Location</span>
        <span className="location-name" title={`Time zone: ${location.timeZone}`}>
          📍 {location.name} · {location.timeZone}
        </span>
        <button type="button" className="nav-btn" onClick={() => setOpen((v) => !v)}>
          {open ? 'Close' : 'Change'}
        </button>
      </div>

      {open && (
        <div className="location-options">
          <div className="location-presets">
            {LOCATION_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                className={`preset-btn${p.name === location.name ? ' active' : ''}`}
                onClick={() => {
                  setError(null);
                  onChange(p);
                  setOpen(false);
                }}
              >
                {p.name}
              </button>
            ))}
          </div>

          <form className="location-custom" onSubmit={applyCustom}>
            <div className="input-row">
              <div className="input-item">
                <label>Name</label>
                <input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)} />
              </div>
              <div className="input-item">
                <label>Time zone (IANA)</label>
                <input type="text" value={tz} onChange={(e) => setTz(e.target.value)} />
              </div>
            </div>
            <div className="input-row">
              <div className="input-item">
                <label>Latitude (°)</label>
                <input type="number" step="0.0001" min={-90} max={90} value={lat} onChange={(e) => setLat(e.target.value)} />
              </div>
              <div className="input-item">
                <label>Longitude (°)</label>
                <input type="number" step="0.0001" min={-180} max={180} value={lng} onChange={(e) => setLng(e.target.value)} />
              </div>
            </div>
            {error && <p className="location-error">{error}</p>}
            <button type="submit" className="search-btn">
              Apply location
            </button>
          </form>

          <p className="location-note">
            The zone drives civil-date boundaries and local clock display; the coordinates drive
            rise/set and visibility computations.
          </p>
        </div>
      )}
    </div>
  );
}