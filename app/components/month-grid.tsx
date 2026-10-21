'use client';

import React, { memo } from 'react';
import { convertGregorianTo13Month, getMercedoniusMonthLabel, getSpecialDayName } from '@lib/date-utils';
import { mercedoniusToGregorian, weekdayOfGregorian } from '@lib/mercedonius/engine';
import { MONTH_ART } from '@lib/month-art';
import { GREG_MONTHS } from '@lib/month-config';
import { PLANET_GLYPHS } from '@data/astrology';
import { ProvenanceBadge } from './provenance-badge';

interface MonthGridProps {
  /** Any date inside the month to display */
  date: Date;
  /** Which calendar system to render */
  calendar: 'mercedonius' | 'gregorian';
  /** Currently selected day */
  selected: Date;
  /** Called when a day cell (or nav button) is clicked */
  onSelect: (d: Date) => void;
  /** Called when the month backdrop artwork is clicked (full-image view) */
  onImageClick?: (src: string, alt: string) => void;
}

/** Latin weekday abbreviations (Sunday-first), used in Mercedonius view */
const LATIN_WEEKDAY_SHORT = ['Sol', 'Lun', 'Mar', 'Mer', 'Iov', 'Ven', 'Sat'];
/** English weekday abbreviations (Sunday-first), used in Gregorian view */
const ENGLISH_WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
/** Ruling planet by weekday index (0=Sunday), Sunday-first like the grids. */
const PLANET_BY_WEEKDAY = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

/**
 * Month grid for either calendar system.
 *
 * Gregorian mode uses Gregorian month arithmetic (that IS the Gregorian
 * calendar). Mercedonius mode renders the authoritative engine's month
 * (lib/mercedonius/engine.ts): always exactly 28 days, weekday offset
 * derived from the month's start JDN, clickable days resolved through the
 * inverse conversion — never Gregorian month renaming (Point 2).
 */
export const MonthGrid = memo(function MonthGrid({ date, calendar, selected, onSelect, onImageClick }: MonthGridProps) {
  const isGreg = calendar === 'gregorian';
  const today = new Date();

  // Mercedonius view context (engine-derived)
  const mer = convertGregorianTo13Month(date);
  // On year-boundary days (month 0) show the just-completed Intercalaris grid.
  const merMonth = mer.month === 0 ? 13 : mer.month;
  const merSelected = convertGregorianTo13Month(selected);
  const merToday = convertGregorianTo13Month(today);

  // Gregorian view context (Gregorian arithmetic, unchanged)
  const year = date.getFullYear();
  const monthIndex = date.getMonth(); // 0-11
  const gregDaysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const gregLeadingBlanks = new Date(year, monthIndex, 1).getDay(); // week starts Sunday

  // Mercedonius month geometry: 28 days; leading blanks = weekday of day 1
  const merFirstDayGreg = mercedoniusToGregorian({ year: mer.year, month: merMonth, day: 1 });
  const daysInMonth = isGreg ? gregDaysInMonth : 28;
  const leadingBlanks = isGreg ? gregLeadingBlanks : weekdayOfGregorian(merFirstDayGreg);

  const title = isGreg
    ? `${GREG_MONTHS[monthIndex]} ${year}`
    : `${getMercedoniusMonthLabel(
        mer.month === 0 ? 13 : mer.month
      )} ${mer.year} AUC`;
  const subtitle = isGreg
    ? 'Gregorian calendar'
    : mer.month === 0
      ? `Mercedonius month 13 of 13 · year-boundary day ${mer.day}`
      : `Mercedonius month ${merMonth} of 13`;

  // Date range of the displayed month (Point 4: month nav updates this live).
  const rangeText = isGreg
    ? `${GREG_MONTHS[monthIndex]} 1–${gregDaysInMonth}, ${year}`
    : (() => {
        const g1 = mercedoniusToGregorian({ year: mer.year, month: merMonth, day: 1 });
        const g28 = mercedoniusToGregorian({ year: mer.year, month: merMonth, day: 28 });
        return `${g1.day} ${GREG_MONTHS[g1.month - 1]} ${g1.year} → ${g28.day} ${GREG_MONTHS[g28.month - 1]} ${g28.year} (Gregorian)`;
      })();

  // Backdrop artwork follows the DISPLAYED month (Gregorian months have no
  // artwork — none is invented).
  const backdropSrc = isGreg ? null : (MONTH_ART[merMonth] ?? null);

  const weekHeaders = isGreg ? ENGLISH_WEEKDAY_SHORT : LATIN_WEEKDAY_SHORT;

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < leadingBlanks; i++) {
    cells.push(<div key={`blank-${i}`} className="day-cell empty" aria-hidden="true" />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    let cellDate: Date;
    let weekday: number;
    if (isGreg) {
      cellDate = new Date(year, monthIndex, d);
      weekday = cellDate.getDay();
    } else {
      const g = mercedoniusToGregorian({ year: mer.year, month: merMonth, day: d });
      cellDate = new Date(g.year, g.month - 1, g.day);
      weekday = weekdayOfGregorian(g);
    }
    const isSelected = isGreg
      ? selected.getFullYear() === year &&
        selected.getMonth() === monthIndex &&
        selected.getDate() === d
      : merSelected.year === mer.year &&
        merSelected.month === merMonth &&
        merSelected.day === d;
    const isToday = isGreg
      ? today.getFullYear() === year &&
        today.getMonth() === monthIndex &&
        today.getDate() === d
      : merToday.year === mer.year && merToday.month === merMonth && merToday.day === d;
    const glyph = PLANET_GLYPHS[PLANET_BY_WEEKDAY[weekday]];
    cells.push(
      <button
        key={d}
        type="button"
        className={`day-cell${isSelected ? ' selected' : ''}${isToday ? ' today' : ''}`}
        onClick={() => onSelect(cellDate)}
        aria-label={`${title} day ${d}`}
      >
        <span className="day-number">{d}</span>
        {!isGreg && <span className="day-planet">{glyph}</span>}
      </button>
    );
  }

  /** Move by one month, keeping the selected day-of-month where possible. */
  const stepMonth = (delta: number) => {
    if (isGreg) {
      const target = new Date(year, monthIndex + delta, 1);
      const targetDays = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
      onSelect(new Date(target.getFullYear(), target.getMonth(), Math.min(selected.getDate(), targetDays)));
      return;
    }
    // Mercedonius months wrap 1..13 within the Mercedonius year.
    let y = mer.year;
    let m = merMonth + delta;
    if (m < 1) {
      m = 13;
      y -= 1;
    } else if (m > 13) {
      m = 1;
      y += 1;
    }
    const day = Math.min(merSelected.day, 28);
    const g = mercedoniusToGregorian({ year: y, month: m, day });
    onSelect(new Date(g.year, g.month - 1, g.day));
  };

  return (
    <div className="month-grid-card">
      {backdropSrc && (
        <div
          className="month-backdrop"
          onClick={() => onImageClick?.(backdropSrc, `Backdrop artwork for ${title}`)}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          aria-label={`View full artwork for ${title}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onImageClick?.(backdropSrc, `Backdrop artwork for ${title}`);
            }
          }}
        >
          <img src={backdropSrc} alt={`Backdrop artwork for ${title}`} />
          <span className="backdrop-caption">
            <ProvenanceBadge kind="illustrative" compact /> Backdrop artwork — decorative
            illustration, not data.
          </span>
        </div>
      )}
      <div className="month-grid-header">
        <div>
          <div className="month-grid-title">{title}</div>
          <div className="month-grid-sub">{subtitle}</div>
          <div className="month-grid-range">{rangeText}</div>
        </div>
        <div className="month-grid-nav">
          <button type="button" onClick={() => stepMonth(-1)}>‹ Prev</button>
          <button type="button" onClick={() => stepMonth(1)}>Next ›</button>
        </div>
      </div>

      <div className="month-weekdays">
        {weekHeaders.map((w, i) => (
          <div key={w} className={i === 0 ? 'week-start' : undefined}>{w}</div>
        ))}
      </div>

      <div className="month-days">{cells}</div>
    </div>
  );
});