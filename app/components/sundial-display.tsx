'use client';

/**
 * Sundial Display — the ornate gold dial (sundial-labels.png) with its eight
 * rim buttons as LIVE hotspots. Clicking a button shows live, engine-derived
 * data for the selected date over the central triangle (all-seeing eye).
 *
 * The CALENDAR panel adapts to the calendar page's current view mode
 * (Dual View / 13-Month / Gregorian) — it reports what the user is viewing.
 */

import React, { useMemo, useState } from 'react';
import {
  convertGregorianTo13Month,
  getMercedoniusMonthLabel,
  formatDateForDisplay,
} from '@lib/date-utils';
import {
  getCalendarDayWithAstronomy,
  getTraditionalZodiacSign,
  getMoonIconForDate,
  getMoonNameForDate,
  getMoonIlluminationForDate,
  getMoonAgeForDate,
  getEclipsesForYear,
} from '@lib/calendar-service';
import { getWeekdayReferenceForDate, PLANET_GLYPHS } from '@data/astrology';
import {
  getSeasonalInstants,
  formatUtcInstant,
  seasonForHemisphere,
  seasonalDisplayForHemisphere,
  isLikelySouthernTimeZone,
  type SeasonalInstant,
} from '@lib/astronomy/seasons';

/** Calendar page view mode (which grid the user is viewing). */
export type SundialViewMode = 'dual' | 'mercedonius' | 'gregorian';

interface DialButton {
  id: string;
  /** Emoji marker for the centre panel title */
  icon: string;
  label: string;
  /** Angle clockwise from top (12 o'clock), matching the baked rim labels */
  angleDeg: number;
  /** Radial position of the label, as a percentage of the dial (centre = 50%) */
  radiusPct: number;
  /** Upright rotation of the hotspot pill to follow the rim text */
  rotDeg: number;
}

/**
 * Rim buttons calibrated to sundial-labels.png (550×550). The label band is
 * hand-drawn — NOT a perfect circle at exact 45° steps — so each button uses
 * the PIXEL-MEASURED centroid (angle + radius) of its baked label word: the
 * bright gold-text centroid within r 180–232 px around each nominal angle.
 * Measured: Frequency 0.1°/38.27%, Calendar 43.5°/37.45%, Planetary 88.8°/38.27%,
 * Lunar 136.7°/38.36%, Zodiac 180.7°/38.36%, Seasonal 223.0°/37.91%,
 * Eclipse 269.4°/36.91%, Chakra 314.1°/37.36%.
 * rotDeg keeps each pill within ±90° of tangent: a≤90→a, 90<a≤270→a−180, a>270→a−360.
 */
const DIAL_BUTTONS: DialButton[] = [
  { id: 'frequency', icon: '🎵', label: 'Frequency', angleDeg: 0.1, radiusPct: 38.27, rotDeg: 0.1 },
  { id: 'calendar', icon: '📅', label: 'Calendar', angleDeg: 43.5, radiusPct: 37.45, rotDeg: 43.5 },
  { id: 'planetary', icon: '🪐', label: 'Planetary', angleDeg: 88.8, radiusPct: 38.27, rotDeg: 88.8 },
  { id: 'lunar', icon: '🌙', label: 'Lunar', angleDeg: 136.7, radiusPct: 38.36, rotDeg: -43.3 },
  { id: 'zodiac', icon: '♈', label: 'Zodiac', angleDeg: 180.7, radiusPct: 38.36, rotDeg: 0.7 },
  { id: 'seasonal', icon: '🌿', label: 'Seasonal', angleDeg: 223.0, radiusPct: 37.91, rotDeg: 43.0 },
  { id: 'eclipse', icon: '🌑', label: 'Eclipse', angleDeg: 269.4, radiusPct: 36.91, rotDeg: -90.6 },
  { id: 'chakra', icon: '🔯', label: 'Chakra', angleDeg: 314.1, radiusPct: 37.36, rotDeg: -45.9 },
];

function rimPosition(btn: Pick<DialButton, 'angleDeg' | 'radiusPct'>): { left: string; top: string } {
  const rad = (btn.angleDeg * Math.PI) / 180;
  return {
    left: `${(50 + btn.radiusPct * Math.sin(rad)).toFixed(2)}%`,
    top: `${(50 - btn.radiusPct * Math.cos(rad)).toFixed(2)}%`,
  };
}

interface DialPanelData {
  icon: string;
  title: string;
  subtitle: string;
  rows: Array<[string, string]>;
  note?: string;
}

interface SundialDisplayProps {
  selectedDate: Date;
  /** Current calendar-page view mode — drives the CALENDAR panel. */
  viewMode: SundialViewMode;
  /**
   * Observer latitude (degrees, south negative). When known it decides the
   * season hemisphere; otherwise timeZone (IANA) is used as a heuristic.
   */
  latitude?: number | null;
  /** IANA time zone of the observer (browser zone once resolved post-mount). */
  timeZone?: string | null;
}

export function SundialDisplay({ selectedDate, viewMode, latitude = null, timeZone = null }: SundialDisplayProps) {
  const [activeSection, setActiveSection] = useState<string>('calendar');

  // Seasons are hemisphere-dependent: the engine computes astronomical
  // (northern-convention) instants; south of the equator the NAMES flip
  // (March equinox opens autumn, December solstice is summer, …) while the
  // instants stay identical. A known latitude wins; otherwise the observer's
  // IANA time zone is used as a curated heuristic.
  const isSouthernHemisphere =
    latitude != null ? latitude < 0 : timeZone != null ? isLikelySouthernTimeZone(timeZone) : false;

  // ── Live, engine-derived data for the selected date ──────────────────────
  const dayAstronomy = useMemo(() => getCalendarDayWithAstronomy(selectedDate), [selectedDate]);
  const planetaryDay = useMemo(() => getWeekdayReferenceForDate(selectedDate), [selectedDate]);
  const traditionalSign = useMemo(() => getTraditionalZodiacSign(selectedDate), [selectedDate]);

  // Current season: the most recent seasonal instant at/before the date.
  const seasonInfo = useMemo((): { last: SeasonalInstant | null; next: SeasonalInstant | null } => {
    const y = selectedDate.getUTCFullYear();
    const instants = [
      ...getSeasonalInstants(y - 1),
      ...getSeasonalInstants(y),
      ...getSeasonalInstants(y + 1),
    ].sort((a, b) => a.instant.getTime() - b.instant.getTime());
    let last: SeasonalInstant | null = null;
    let next: SeasonalInstant | null = null;
    for (const s of instants) {
      if (s.instant.getTime() <= selectedDate.getTime()) last = s;
      else if (!next) next = s;
    }
    return { last, next };
  }, [selectedDate]);

  // Eclipse candidates for the selected year (illustrative list — labelled as such).
  const eclipseCandidates = useMemo(
    () => getEclipsesForYear(selectedDate.getUTCFullYear()).slice(0, 4),
    [selectedDate]
  );

  // ── Panel definitions ────────────────────────────────────────────────────
  const panels = useMemo<Record<string, DialPanelData>>(() => {
    const mer = convertGregorianTo13Month(selectedDate);
    const merLabel = `${getMercedoniusMonthLabel(mer.month === 0 ? 13 : mer.month)} ${mer.day}, ${mer.year}`;
    const gregLabel = formatDateForDisplay(selectedDate);
    const sunConst = dayAstronomy.sunConstellation;
    const sunConstText = `${sunConst.icon} ${sunConst.name}${sunConst.isNearBoundary ? ' (near boundary)' : ''}`;
    // Season names follow the OBSERVER'S hemisphere (engine computes the
    // astronomical instants once; a southern observer sees them flipped).
    const seasonText = seasonInfo.last
      ? seasonForHemisphere(seasonInfo.last.season, isSouthernHemisphere)
      : '—';
    const lastSeasonal = seasonInfo.last
      ? seasonalDisplayForHemisphere(seasonInfo.last, isSouthernHemisphere)
      : null;
    const nextSeasonal = seasonInfo.next
      ? seasonalDisplayForHemisphere(seasonInfo.next, isSouthernHemisphere)
      : null;
    const glyph = PLANET_GLYPHS[planetaryDay.planet] ?? '';

    // CALENDAR reflects WHAT THE USER IS VIEWING (Dual / 13-Month / Gregorian).
    const calendarRows: Array<[string, string]> = [];
    if (viewMode === 'dual' || viewMode === 'mercedonius') {
      calendarRows.push(['Mercedonius date', merLabel]);
    }
    if (viewMode === 'dual' || viewMode === 'gregorian') {
      calendarRows.push(['Gregorian date', gregLabel]);
    }
    calendarRows.push(['Day of week', dayAstronomy.dayOfWeek]);
    calendarRows.push(['Season', seasonText]);
    calendarRows.push(['Sun constellation', sunConstText]);
    if (viewMode !== 'mercedonius') {
      calendarRows.push(['Gregorian year', String(selectedDate.getUTCFullYear())]);
    }

    const eclipseStatusText: Record<string, string> = {
      none: 'None',
      solar: '☀️ Solar (candidate)',
      lunar: '🌙 Lunar (candidate)',
      both: '🌒🌙 Solar + Lunar (candidates)',
    };

    return {
      frequency: {
        icon: '🎵',
        title: 'Frequency',
        subtitle: 'Weekday frequency reference',
        rows: [
          ['Day', planetaryDay.day],
          ['Planet', `${glyph} ${planetaryDay.planet}`],
          ['Frequency', `${planetaryDay.frequencyHz.toFixed(1)} Hz`],
        ],
      },
      chakra: {
        icon: '🔯',
        title: 'Chakra',
        subtitle: 'Weekday chakra correspondence',
        rows: [
          ['Day', planetaryDay.day],
          ['Dies', planetaryDay.dies],
          ['Chakra Sanskrit', planetaryDay.chakraSanskrit],
          ['Chakra English', planetaryDay.chakraEnglish],
          ['Frequency', `${planetaryDay.frequencyHz.toFixed(1)} Hz`],
        ],
      },
      zodiac: {
        icon: '♈',
        title: 'Zodiac',
        subtitle: 'IAU constellation bands on the ecliptic',
        rows: [
          ['Sun constellation', sunConstText],
          ['Longitude', `λ ${dayAstronomy.sun.eclipticLongitudeDeg.toFixed(1)}°`],
          ['Traditional sign', traditionalSign.sign],
        ],
      },
      calendar: {
        icon: '📅',
        title: 'Calendar',
        subtitle: 'Mercedonius and Gregorian civil dates',
        rows: calendarRows,
        note: 'Civil dates per explicit zone · engine-derived.',
      },
      planetary: {
        icon: '🪐',
        title: 'Planetary',
        subtitle: 'Weekday ruling planet (Chaldean order)',
        rows: [
          ['Day', planetaryDay.day],
          ['Planet', `${glyph} ${planetaryDay.planet}`],
          ['Dies', planetaryDay.dies],
          ['Origin', planetaryDay.origin],
        ],
      },
      lunar: {
        icon: '🌙',
        title: 'Lunar',
        subtitle: 'Moon phase for the selected date',
        rows: [
          ['Phase', `${getMoonIconForDate(selectedDate)} ${getMoonNameForDate(selectedDate)}`],
          ['Illumination', `${getMoonIlluminationForDate(selectedDate).toFixed(1)}%`],
          ['Age', `${getMoonAgeForDate(selectedDate).toFixed(1)} d`],
          ['Distance', `${Math.round(dayAstronomy.moonDistanceKm).toLocaleString()} km`],
        ],
      },
      seasonal: {
        icon: '🌿',
        title: 'Seasonal',
        subtitle: 'Live-computed equinox & solstice instants',
        rows: [
          [
            'Last',
            seasonInfo.last && lastSeasonal
              ? `${seasonInfo.last.icon} ${lastSeasonal.label} · ${formatUtcInstant(seasonInfo.last.instant)}`
              : '—',
          ],
          [
            'Next',
            seasonInfo.next && nextSeasonal
              ? `${seasonInfo.next.icon} ${nextSeasonal.label} · ${formatUtcInstant(seasonInfo.next.instant)}`
              : '—',
          ],
        ],
        note: isSouthernHemisphere
          ? 'Southern Hemisphere — equinox/solstice names flipped for local seasons; instants identical.'
          : undefined,
      },
      eclipse: {
        icon: '🌑',
        title: 'Eclipse',
        subtitle: 'Eclipse candidates for this date & year',
        rows: [
          ['Status (this date)', eclipseStatusText[dayAstronomy.eclipseStatus] ?? 'None'],
          ...eclipseCandidates.map(
            (e): [string, string] => [
              e.type === 'solar' ? '☀️ Solar candidate' : '🌙 Lunar candidate',
              `${e.date.getUTCFullYear()}-${String(e.date.getUTCMonth() + 1).padStart(2, '0')}-${String(e.date.getUTCDate()).padStart(2, '0')}`,
            ]
          ),
        ],
        note: '⚠ Illustrative candidates — not real eclipse predictions.',
      },
    };
  }, [selectedDate, viewMode, latitude, timeZone, isSouthernHemisphere, dayAstronomy, planetaryDay, traditionalSign, seasonInfo, eclipseCandidates]);

  const panel = panels[activeSection];

  return (
    <section className="sundial-dial-page">
      {/* Ornate gold dial with baked rim labels — the buttons illustrated */}
      <img
        src="/calendar/sundial-labels.png"
        alt="Mercedonius sundial dial"
        className="dial-image"
      />

      {/* Invisible live hotspots exactly over the baked rim labels */}
      {DIAL_BUTTONS.map((btn) => {
        const pos = rimPosition(btn);
        return (
          <button
            key={btn.id}
            type="button"
            className="dial-hotspot"
            onClick={() => setActiveSection(btn.id)}
            style={{
              left: pos.left,
              top: pos.top,
              transform: `translate(-50%, -50%) rotate(${btn.rotDeg}deg)`,
            }}
            aria-label={btn.label}
            title={btn.label}
            data-active={activeSection === btn.id ? 'true' : 'false'}
          />
        );
      })}

      {/* Live data over the central triangle (all-seeing eye).
          key={activeSection} forces a full DOM teardown on every switch so
          no rows from a previous panel (e.g. Eclipse's long candidate list)
          can ever bleed into the next one via React reconciliation. */}
      {panel && (
        <div className="dial-center-panel" key={activeSection}>
          <div className="dial-panel-head">
            {panel.icon} {panel.title}
          </div>
          <div className="dial-panel-sub">{panel.subtitle}</div>
          <div className="dial-panel-rows">
            {panel.rows.map(([key, value], i) => (
              /* Index-suffixed keys: eclipse rows share label text
                 ("Solar candidate" ×N) — duplicate keys make React leave
                 stale nodes on screen when switching panels. */
              <div className="dial-panel-row" key={`${key}-${i}`}>
                <span className="dial-row-key">{key}</span>
                <span className="dial-row-value">{value}</span>
              </div>
            ))}
          </div>
          {panel.note && <div className="dial-panel-note">{panel.note}</div>}
        </div>
      )}
    </section>
  );
}