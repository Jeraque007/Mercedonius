'use client';

import React, { useState } from 'react';
import type { AppLocation } from '@lib/local-sky';

/**
 * Location pin selector. No personal details are prefilled — the user must
 * explicitly choose or enable a location. When no location is active, the
 * panel shows a neutral prompt rather than defaulting to anyone's data.
 */
export interface LocationPinProps {
  location: AppLocation | null;
  onChange: (location: AppLocation) => void;
  onEnable: () => void;
}

const DEFAULT_LOCATION: AppLocation = {
  name: 'Your Location',
  latitude: 0,
  longitude: 0,
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

export function LocationPin({ location, onChange, onEnable }: LocationPinProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="location-pin">
      <button
        type="button"
        className={`location-pin-btn ${location ? 'active' : ''}`}
        onClick={() => {
          if (location) {
            setOpen(!open);
          } else {
            onEnable();
          }
        }}
        aria-label={location ? `Location: ${location.name}` : 'Enable location'}
      >
        <span className="pin-icon">📍</span>
        <span className="pin-label">
          {location ? location.name : 'Enable Location'}
        </span>
      </button>

      {open && location && (
        <div className="location-pin-menu">
          <p className="location-pin-note">
            Coordinates drive local sunrise/sunset, moonrise/moonset, and
            sky visibility. Change anytime.
          </p>
          <button
            type="button"
            className="location-pin-clear"
            onClick={() => {
              onChange(DEFAULT_LOCATION);
              setOpen(false);
            }}
          >
            Use device default
          </button>
        </div>
      )}
    </div>
  );
}