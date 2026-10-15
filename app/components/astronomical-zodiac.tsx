'use client';

import { CONSTELLATION_NAMES, CONSTELLATION_ICONS, ASTRONOMICAL_CONSTELLATION_COUNT } from '@lib/astronomy';

interface AstronomicalZodiacProps {
  selectedDate: Date;
  sunConstellation: { name: string; icon: string; isNearBoundary: boolean; boundaryDistanceDeg?: number };
}

export function AstronomicalZodiac({ selectedDate, sunConstellation }: AstronomicalZodiacProps) {
  return (
    <div className="zodiac-info">
      <div className="zodiac-title">Astronomical Zodiac (13 Constellations)</div>
      <div className="zodiac-description">
        <p>
          The astronomical zodiac is based on the actual IAU constellation boundaries.
          The Sun's apparent annual path crosses <strong>{ASTRONOMICAL_CONSTELLATION_COUNT} constellations</strong>, including Ophiuchus.
        </p>
        <p>
          The traditional Western zodiac divides the ecliptic into twelve equal 30-degree signs.
          Astronomical constellations have irregular boundaries, and the Sun's actual
          apparent path crosses thirteen IAU-defined constellations, including Ophiuchus.
        </p>
      </div>
      <div className="zodiac-list">
        {CONSTELLATION_NAMES.map((name, i) => (
          <div key={i} className="constellation-item">
            <span className="constellation-icon">{CONSTELLATION_ICONS[i]}</span>
            <span className="constellation-name">{name}</span>
            <span className="constellation-index">{i + 1}</span>
          </div>
        ))}
      </div>
      <div className="sun-transition">
        <label>Today's Sun:</label>
        <span>{sunConstellation.icon} {sunConstellation.name}</span>
        {sunConstellation.isNearBoundary && (
          <span className="near-badge">Near boundary</span>
        )}
      </div>
    </div>
  );
}
