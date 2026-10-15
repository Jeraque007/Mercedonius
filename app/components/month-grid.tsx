'use client';

import React from 'react';
import { convertGregorianTo13Month, getMercedoniusMonthLabel } from '@lib/date-utils';
import { mercedoniusToGregorian, weekdayOfGregorian } from '@lib/mercedonius/engine';
import { GREG_MONTHS } from '@lib/month-config';
import { PLANET_GLYPHS } from '@data/astrology';

interface MonthGridProps {
  /** Any date inside the month to display */
  date: Date;
  /** Which calendar system to render */
  calendar: 'mercedonius' | 'gregorian';
  /** Currently selected day */
  selected: Date;
  /** Called when a day cell (or nav button) is clicked */
  onSelect: (d: Date) => void;
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
export function MonthGrid({ date, calendar, selected, onSelect }: MonthGridProps) {
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
    : `${getMercedoniusMonthLabel(merMonth)} ${mer.year}`;
  const subtitle = isGreg
    ? 'Gregorian calendar'
    : mer.month === 0
      ? `Mercedonius month 13 of 13 · year-boundary day ${mer.day}`
      : `Mercedonius month ${merMonth} of 13`;

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
      <div className="month-grid-header">
        <div>
          <div className="month-grid-title">{title}</div>
          <div className="month-grid-sub">{subtitle}</div>
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
}