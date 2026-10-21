'use client';

import { getAscendantPosition, getAscendantConstellation, getSunTropicalSign, getSiderealSign } from '@lib/astronomy';
import { useSettings } from './settings-context';

interface RisingInfoProps {
  selectedDate: Date;
  /** App-selected location (Point 4): used when no birth profile is given. */
  location?: { latitude: number; longitude: number; name: string };
  birthProfile?: {
    latitude?: number;
    longitude?: number;
    time?: Date;
  };
}

/** Fallback location: Germiston, South Africa (only if no location is given). */
const DEFAULT_LAT = -26.1556;
const DEFAULT_LON = 28.2228;

export function RisingInfo({ selectedDate, location, birthProfile }: RisingInfoProps) {
  // App-wide observation location (Settings page) when no explicit one is passed.
  const { location: appLocation, zodiacSystem } = useSettings();
  const latitude = birthProfile?.latitude ?? location?.latitude ?? appLocation.latitude ?? DEFAULT_LAT;
  const longitude = birthProfile?.longitude ?? location?.longitude ?? appLocation.longitude ?? DEFAULT_LON;
  const locationName = location?.name ?? appLocation.name;

  // Deterministic instant: the provided birth time, or 18:15 UT on the selected date.
  const t = birthProfile?.time
    ? new Date(Date.UTC(
        birthProfile.time.getFullYear(),
        birthProfile.time.getMonth(),
        birthProfile.time.getDate(),
        birthProfile.time.getHours(),
        birthProfile.time.getMinutes()
      ))
    : new Date(Date.UTC(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        18,
        15
      ));

  const asc = getAscendantPosition(t, latitude, longitude, 'UTC');
  const ascConst = getAscendantConstellation(asc.eclipticLongitudeDeg, latitude, longitude, 'UTC');
  const ascTropical = getSunTropicalSign(t);
  const ascSidereal = getSiderealSign(asc.eclipticLongitudeDeg, t);

  // Gold "selected" badge for the row matching the app-wide zodiac system.
  const SelectedMark = ({ system }: { system: 'iau' | 'tropical' | 'vedic' }) =>
    zodiacSystem === system ? (
      <span
        style={{
          marginLeft: '0.5rem',
          padding: '0.05rem 0.45rem',
          fontSize: '0.65rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: '#0f172a',
          background: '#fbbf24',
          borderRadius: '999px',
        }}
      >
        selected
      </span>
    ) : null;

  return (
    <div className="rising-info">
      <div className="rising-display">
        <span className="rising-icon">↗</span>
        <span className="rising-name">
          {ascConst.constellation.icon} {ascConst.constellation.name} (IAU)
          <SelectedMark system="iau" />
        </span>
        {ascConst.isNearBoundary && (
          <span className="near-badge">Near boundary</span>
        )}
      </div>
      <div className="rising-display" style={{ marginTop: '0.5rem' }}>
        <span className="rising-icon">☉</span>
        <span className="rising-name">
          {ascTropical.icon} {ascTropical.name} (Tropical)
          <SelectedMark system="tropical" />
        </span>
      </div>
      <div className="rising-display" style={{ marginTop: '0.5rem' }}>
        <span className="rising-icon">☊</span>
        <span className="rising-name">
          {ascSidereal.icon} {ascSidereal.name} (Sidereal/Vedic)
          <SelectedMark system="vedic" />
        </span>
      </div>
      <div className="rising-detail">
        <p>Ecliptic longitude: {asc.eclipticLongitudeDeg.toFixed(4)}°</p>
        <p>Right ascension: {asc.raDeg.toFixed(4)}°</p>
        <p>Declination: {asc.decDeg.toFixed(4)}°</p>
        <p className="uncertainty">
          {birthProfile
            ? 'Calculated from the provided birth profile.'
            : `Calculated for 18:15 UT at ${locationName}. Change the app location (or add a birth profile in My Sky) for an exact rising constellation.`}
        </p>
        <p className="uncertainty" style={{ fontSize: '0.8rem', opacity: 0.7 }}>
          Ayanamsa (Lahiri): {ascSidereal.ayanamsaDeg.toFixed(4)}°
        </p>
      </div>
    </div>
  );
}
