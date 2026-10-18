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
import { getSeasonalInstants, formatUtcInstant, type SeasonalInstant } from '@lib/astronomy/seasons';

/** Calendar page view mode (which grid the user is viewing). */
export type SundialViewMode = 'dual' | 'mercedonius' | 'gregorian';

interface DialButton {
  id: string;
  /** Emoji marker for the centre panel title */
  icon: string;
  label: string;
  /** Angle clockwise from top (12 o'clock), matching the baked rim labels */
  angleDeg: number;
  /** Upright rotation of the hotspot pill to follow the rim text */
  rotDeg: number;
}

/** Rim buttons exactly as illustrated on sundial-labels.png (8 × 45°). */
const DIAL_BUTTONS: DialButton[] = [
  { id: 'frequency', icon: '🎵', label: 'Frequency', angleDeg: 0, rotDeg: 0 },
  { id: 'calendar', icon: '📅', label: 'Calendar', angleDeg: 45, rotDeg: 45 },
  { id: 'planetary', icon: '🪐', label: 'Planetary', angleDeg: 90, rotDeg: 90 },
  { id: 'lunar', icon: '🌙', label: 'Lunar', angleDeg: 135, rotDeg: -45 },
  { id: 'zodiac', icon: '♈', label: 'Zodiac', angleDeg: 180, rotDeg: 0 },
  { id: 'seasonal', icon: '🌿', label: 'Seasonal', angleDeg: 225, rotDeg: 45 },
  { id: 'eclipse', icon: '🌑', label: 'Eclipse', angleDeg: 270, rotDeg: -90 },
  { id: 'chakra', icon: '🔯', label: 'Chakra', angleDeg: 315, rotDeg: -45 },
];

/** Radius of the label band, as a percentage of the dial (center = 50%). */
const RADIUS_PCT = 38.5;

function rimPosition(angleDeg: number): { left: string; top: string } {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    left: `${(50 + RADIUS_PCT * Math.sin(rad)).toFixed(2)}%`,
    top: `${(50 - RADIUS_PCT * Math.cos(rad)).toFixed(2)}%`,
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
}

export function SundialDisplay({ selectedDate, viewMode }: SundialDisplayProps) {
  const [activeSection, setActiveSection] = useState<string>('calendar');

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
    const seasonText = seasonInfo.last ? seasonInfo.last.season : '—';
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
            seasonInfo.last
              ? `${seasonInfo.last.icon} ${seasonInfo.last.label} · ${formatUtcInstant(seasonInfo.last.instant)}`
              : '—',
          ],
          [
            'Next',
            seasonInfo.next
              ? `${seasonInfo.next.icon} ${seasonInfo.next.label} · ${formatUtcInstant(seasonInfo.next.instant)}`
              : '—',
          ],
        ],
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
  }, [selectedDate, viewMode, dayAstronomy, planetaryDay, traditionalSign, seasonInfo, eclipseCandidates]);

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
        const pos = rimPosition(btn.angleDeg);
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