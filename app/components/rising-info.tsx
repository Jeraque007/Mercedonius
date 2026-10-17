'use client';

import { getAscendantPosition, getAscendantConstellation } from '@lib/astronomy';

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
  const latitude = birthProfile?.latitude ?? location?.latitude ?? DEFAULT_LAT;
  const longitude = birthProfile?.longitude ?? location?.longitude ?? DEFAULT_LON;
  const locationName = location?.name ?? 'Germiston (default)';

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

  return (
    <div className="rising-info">
      <div className="rising-display">
        <span className="rising-icon">↗</span>
        <span className="rising-name">
          {ascConst.constellation.icon} {ascConst.constellation.name}
        </span>
        {ascConst.isNearBoundary && (
          <span className="near-badge">Near boundary</span>
        )}
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
      </div>
    </div>
  );
}
