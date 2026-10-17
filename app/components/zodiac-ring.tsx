'use client';

/**
 * Zodiac Outer Ring (redesign Point 4)
 * ====================================
 * The 13 IAU constellation bands, sized by their ecliptic spans. The ring
 * is a NAVIGATION surface for the centre panel only: clicking a section
 * updates what the centre FOCUSES on — the selected date is never touched.
 * The centre always shows the selected date alongside the focused
 * constellation (default focus: the Sun's constellation on that date).
 *
 * Provenance: boundary spans are IAU catalogue data (◈); the Sun marker is
 * a live computation for the selected date (◉).
 */

import React, { memo } from 'react';
import { CONSTELLATION_BOUNDARIES } from '@lib/astronomy/constellations';
import type { ConstellationResult } from '@lib/astronomy/types';
import { ProvenanceBadge } from './provenance-badge';

interface ZodiacRingProps {
  /** Gregorian label of the selected date (display only). */
  selectedDateLabel: string;
  /** Mercedonius label of the selected date (display only). */
  mercedoniusLabel: string;
  /** Sun's constellation on the selected date — the default centre focus. */
  sunConstellation: ConstellationResult;
  /** Sun's ecliptic longitude on the selected date (marker position). */
  sunLongitudeDeg: number;
  /** Focused ring section (null → centre follows the Sun's constellation). */
  focusedName: string | null;
  onFocusChange: (name: string | null) => void;
}

const SIZE = 340;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 128;

/** λ (deg) → screen angle: increasing longitude runs counter-clockwise. */
function polar(radius: number, lonDeg: number): [number, number] {
  const rad = ((-lonDeg + 90) * Math.PI) / 180;
  return [CX + radius * Math.cos(rad), CY + radius * Math.sin(rad)];
}

function arcPath(fromDeg: number, toDeg: number, radius: number): string {
  const [x1, y1] = polar(radius, fromDeg);
  const [x2, y2] = polar(radius, toDeg);
  const span = (toDeg - fromDeg + 360) % 360;
  const largeArc = span > 180 ? 1 : 0;
  // λ increases → screen angle decreases (counter-clockwise) → sweep 0.
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} 0 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

export const ZodiacRing = memo(function ZodiacRing({
  selectedDateLabel,
  mercedoniusLabel,
  sunConstellation,
  sunLongitudeDeg,
  focusedName,
  onFocusChange,
}: ZodiacRingProps) {
  const bands = [...CONSTELLATION_BOUNDARIES].sort(
    (a, b) => a.eclipticLongitudeFromDeg - b.eclipticLongitudeFromDeg
  );

  const effectiveFocus = focusedName ?? sunConstellation.name;
  const focusedBand = bands.find((b) => b.name === effectiveFocus) ?? null;
  const [markerX, markerY] = polar(R, sunLongitudeDeg);

  return (
    <div className="zodiac-ring-wrap">
      <svg
        className="zodiac-ring-svg"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="group"
        aria-label="Zodiac ring: select a constellation section to focus the centre"
      >
        {bands.map((b) => {
          const isActive = b.name === effectiveFocus;
          return (
            <path
              key={b.id ?? b.name}
              d={arcPath(b.eclipticLongitudeFromDeg, b.eclipticLongitudeToDeg, R)}
              className={`ring-segment${isActive ? ' active' : ''}`}
              onClick={() => {
                // Clicking the active section clears focus back to the Sun.
                if (isActive && focusedName !== null) onFocusChange(null);
                else if (!isActive) onFocusChange(b.name);
              }}
              role="button"
              tabIndex={0}
              aria-label={`${b.name}: λ ${b.eclipticLongitudeFromDeg.toFixed(1)}°–${b.eclipticLongitudeToDeg.toFixed(1)}°`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (isActive && focusedName !== null) onFocusChange(null);
                  else if (!isActive) onFocusChange(b.name);
                }
              }}
            >
              <title>
                {b.icon} {b.name}
              </title>
            </path>
          );
        })}

        {/* Sun marker for the SELECTED date (live computation) */}
        <circle cx={markerX} cy={markerY} r={7} className="ring-sun-marker" aria-hidden="true">
          <title>Sun on selected date: {sunConstellation.name}</title>
        </circle>
      </svg>

      <div className="zodiac-ring-centre">
        <div className="ring-centre-kind">Selected date</div>
        <div className="ring-centre-date">{selectedDateLabel}</div>
        <div className="ring-centre-mer">{mercedoniusLabel}</div>
        <div className="ring-centre-focus">
          {focusedBand ? (
            <>
              <span className="focus-title">
                {focusedBand.icon} {focusedBand.name}
              </span>
              <span className="focus-span">
                λ {focusedBand.eclipticLongitudeFromDeg.toFixed(1)}°–
                {focusedBand.eclipticLongitudeToDeg.toFixed(1)}°
              </span>
              <span className="focus-note">Focused from the ring — your selected date is unchanged.</span>
            </>
          ) : (
            <>
              <span className="focus-title">
                Sun in {sunConstellation.icon} {sunConstellation.name}
              </span>
              {sunConstellation.isNearBoundary && <span className="near-badge">Near boundary</span>}
              <span className="focus-note">Click a ring section to focus the centre on it.</span>
            </>
          )}
        </div>
      </div>

      <div className="zodiac-ring-legend">
        <ProvenanceBadge kind="live" /> Sun marker (this date)
        <ProvenanceBadge kind="catalogue" /> Ring spans (IAU boundaries)
      </div>
    </div>
  );
});