'use client';

import { getSunConstellation, getTraditionalZodiacSign, getSunTropicalSign } from '@lib/calendar-service';
import type { ConstellationResult } from '@lib/astronomy';
import { getSiderealSign } from '@lib/astronomy';
import { useSettings } from './settings-context';

interface ComparisonPanelProps {
  selectedDate: Date;
}

/** Accent shown on the comparison item matching the user's selected system. */
function SelectedBadge() {
  return (
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
  );
}

export function ComparisonPanel({ selectedDate }: ComparisonPanelProps) {
  const { zodiacSystem } = useSettings();
  const sunConst = getSunConstellation(selectedDate);
  const sunConstellationResult = sunConst.constellationResult;
  const traditionalSign = getTraditionalZodiacSign(selectedDate);
  const astrologicalSignName = traditionalSign.sign;
  const sunTropical = getSunTropicalSign(selectedDate);
  const sunSidereal = getSiderealSign(
    sunConstellationResult.eclipticLongitudeDeg,
    selectedDate
  );

  // The user's selected system gets a gold left accent on its card.
  const accent = (system: 'iau' | 'tropical' | 'vedic') => ({
    borderLeft:
      zodiacSystem === system ? '3px solid #fbbf24' : '3px solid transparent',
  });

  return (
    <div className="comparison-panel">
      <div className="comparison-header">
        <h3>Compare Systems</h3>
      </div>
      <div className="comparison-items">
        <div className="comparison-item" style={accent('iau')}>
          <div className="item-header">
            <span className="item-label">
              Astronomical (IAU)
              {zodiacSystem === 'iau' && <SelectedBadge />}
            </span>
            <span className="item-value">{sunConstellationResult.name}</span>
          </div>
          <div className="item-detail">
            <span className="distinction-note">Actual IAU constellation (astronomical)</span>
            {sunConstellationResult.isNearBoundary && (
              <span className="near-badge">Near boundary</span>
            )}
          </div>
        </div>
        <div className="comparison-item" style={accent('tropical')}>
          <div className="item-header">
            <span className="item-label">
              Tropical (Western Astrology)
              {zodiacSystem === 'tropical' && <SelectedBadge />}
            </span>
            <span className="item-value">{sunTropical.icon} {sunTropical.name}</span>
          </div>
          <div className="item-detail">
            <span className="distinction-note">12 equal 30° signs from 0° Aries</span>
          </div>
        </div>
        <div className="comparison-item" style={accent('vedic')}>
          <div className="item-header">
            <span className="item-label">
              Sidereal / Vedic (Lahiri)
              {zodiacSystem === 'vedic' && <SelectedBadge />}
            </span>
            <span className="item-value">{sunSidereal.icon} {sunSidereal.name}</span>
          </div>
          <div className="item-detail">
            <span className="distinction-note">Sidereal = tropical − ayanamsa ({sunSidereal.ayanamsaDeg.toFixed(2)}°)</span>
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
            <span className="item-label">Sun Longitude</span>
            <span className="item-value">λ {sunConstellationResult.eclipticLongitudeDeg.toFixed(2)}°</span>
          </div>
          <div className="item-detail">
            <span className="note">All three zodiac systems read the same ecliptic longitude — they differ only in how they segment it.</span>
          </div>
        </div>
        <div className="comparison-item">
          <div className="item-header">
            <span className="item-label">Comparison</span>
          </div>
          <div className="item-detail">
            <span className="note">The <strong>astronomical constellation</strong> uses IAU boundaries (13 unequal bands, including Ophiuchus). <strong>Tropical</strong> and <strong>traditional astrology</strong> divide the ecliptic into 12 equal 30° signs. <strong>Sidereal/Vedic</strong> shifts by the Lahiri ayanamsa so signs stay aligned with the fixed stars. These are different systems — the same longitude can fall in different signs.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
