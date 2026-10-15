'use client';

import { getSunConstellation, getTraditionalZodiacSign } from '@lib/calendar-service';
import type { ConstellationResult } from '@lib/astronomy';

interface ComparisonPanelProps {
  selectedDate: Date;
}

export function ComparisonPanel({ selectedDate }: ComparisonPanelProps) {
  const sunConst = getSunConstellation(selectedDate);
  const sunConstellationResult = sunConst.constellationResult;
  const traditionalSign = getTraditionalZodiacSign(selectedDate);
  const astrologicalSignName = traditionalSign.sign;

  return (
    <div className="comparison-panel">
      <div className="comparison-header">
        <h3>Compare Systems</h3>
      </div>
      <div className="comparison-items">
        <div className="comparison-item">
          <div className="item-header">
            <span className="item-label">Astronomical</span>
            <span className="item-value">{sunConstellationResult.name}</span>
          </div>
          <div className="item-detail">
            <span className="distinction-note">Actual IAU constellation (astronomical)</span>
            {sunConstellationResult.isNearBoundary && (
              <span className="near-badge">Near boundary</span>
            )}
          </div>
        </div>
        <div className="comparison-item">
          <div className="item-header">
            <span className="item-label">Traditional Astrology</span>
            <span className="item-value">{astrologicalSignName}</span>
          </div>
          <div className="item-detail">
            <span className="distinction-note">30° zodiac sign (conventional)</span>
          </div>
        </div>
        <div className="comparison-item">
          <div className="item-header">
            <span className="item-label">Comparison</span>
          </div>
          <div className="item-detail">
            <span className="note">The <strong>astronomical constellation</strong> uses IAU boundaries.
              The <strong>astrological sign</strong> divides the ecliptic into 12 equal 30° segments.
              These are different systems; the Sun's position may differ significantly between them.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
