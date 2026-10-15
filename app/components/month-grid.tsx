'use client';

import React from 'react';
import { convertGregorianTo13Month, get13MonthName } from '@lib/date-utils';
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

/**
 * Month grid for either calendar system.
 *
 * Both systems share the same underlying date engine (the Mercedonius
 * month maps 1:1 onto its Gregorian counterpart), but the Mercedonius
 * view uses the Roman month names, Latin weekday headers, and shows the
 * ruling planet glyph for each day of the week.
 */
export function MonthGrid({ date, calendar, selected, onSelect }: MonthGridProps) {
  const year = date.getFullYear();
  const monthIndex = date.getMonth(); // 0-11
  const firstDay = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const leadingBlanks = firstDay.getDay(); // week starts Sunday

  const monthNo = convertGregorianTo13Month(date).month;
  const title =
    calendar === 'mercedonius'
      ? `${get13MonthName(monthNo)} ${year}`
      : `${GREG_MONTHS[monthIndex]} ${year}`;
  const subtitle =
    calendar === 'mercedonius'
      ? `Mercedonius month ${monthNo} of 13`
      : 'Gregorian calendar';

  const weekHeaders = calendar === 'mercedonius' ? LATIN_WEEKDAY_SHORT : ENGLISH_WEEKDAY_SHORT;

  const today = new Date();

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < leadingBlanks; i++) {
    cells.push(<div key={`blank-${i}`} className="day-cell empty" aria-hidden="true" />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const cellDate = new Date(year, monthIndex, d);
    const isSelected =
      selected.getFullYear() === year &&
      selected.getMonth() === monthIndex &&
      selected.getDate() === d;
    const isToday =
      today.getFullYear() === year && today.getMonth() === monthIndex && today.getDate() === d;
    const glyph = PLANET_GLYPHS[
      ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'][cellDate.getDay()]
    ];
    cells.push(
      <button
        key={d}
        type="button"
        className={`day-cell${isSelected ? ' selected' : ''}${isToday ? ' today' : ''}`}
        onClick={() => onSelect(cellDate)}
        aria-label={`${title} day ${d}`}
      >
        <span className="day-number">{d}</span>
        {calendar === 'mercedonius' && <span className="day-planet">{glyph}</span>}
      </button>
    );
  }

  /** Move by one month, keeping the selected day-of-month where possible. */
  const stepMonth = (delta: number) => {
    const target = new Date(year, monthIndex + delta, 1);
    const targetDays = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
    onSelect(new Date(target.getFullYear(), target.getMonth(), Math.min(selected.getDate(), targetDays)));
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