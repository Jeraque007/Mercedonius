'use client';

import React, { useState } from 'react';
import { convertGregorianTo13Month, formatMercedoniusDate } from '@lib/date-utils';
import { MonthCircle } from './month-circle';

/** 8 ring sections around the dial — no emoticons, text only */
const DIAL_SECTIONS = [
  { id: 'calendar', label: 'CALENDAR', left: '50%', top: '7%', transform: 'translate(-50%, -50%)' },
  { id: 'planetary', label: 'PLANETARY', left: '89%', top: '22%' },
  { id: 'lunar', label: 'LUNAR', left: '95%', top: '50%', transform: 'translate(-50%, -50%)' },
  { id: 'eclipse', label: 'ECLIPSE', left: '89%', top: '78%' },
  { id: 'seasonal', label: 'SEASONAL', left: '50%', top: '93%', transform: 'translate(-50%, -50%)' },
  { id: 'zodiac', label: 'ZODIAC', left: '11%', top: '78%' },
  { id: 'chakra', label: 'CHAKRA', left: '5%', top: '50%', transform: 'translate(-50%, -50%)' },
  { id: 'frequency', label: 'FREQUENCY', left: '11%', top: '22%' },
];

/** Content shown in the centre (over the triangle) when a button is clicked */
const DIAL_CONTENT: Record<string, { title: string; body: string }> = {
  calendar: { title: 'Calendar', body: 'Mercedonius 13-month and Gregorian civil dates' },
  planetary: { title: 'Planetary', body: 'The weekday ruling planet and its glyph' },
  lunar: { title: 'Lunar', body: 'Moon phase, illumination, upcoming lunations' },
  eclipse: { title: 'Eclipse', body: 'Eclipse candidates for this date' },
  seasonal: { title: 'Seasonal', body: 'Equinox and solstice instants' },
  zodiac: { title: 'Zodiac', body: 'IAU constellation bands on the ecliptic' },
  chakra: { title: 'Chakra', body: 'Weekday chakra correspondence' },
  frequency: { title: 'Frequency', body: 'Weekday frequency reference' },
};

interface SundialDisplayProps {
  selectedDate: Date;
}

export function SundialDisplay({ selectedDate }: SundialDisplayProps) {
  const [activeSection, setActiveSection] = useState<string>('calendar');
  const mercedonius = convertGregorianTo13Month(selectedDate);
  const mercedoniusLabel = formatMercedoniusDate(mercedonius);
  const content = DIAL_CONTENT[activeSection];

  return (
    <section className="sundial-dial-page">
      {/* Transparent-background dial image — actual dial display */}
      <img
        src="/calendar/dial.png"
        alt="Mercedonius golden dial"
        className="dial-image"
      />

      {/* Interactive golden neon buttons around the outer edge */}
      {DIAL_SECTIONS.map((btn) => (
        <button
          key={btn.id}
          type="button"
          className="dial-button"
          onClick={() => setActiveSection(btn.id)}
          style={{
            left: btn.left,
            top: btn.top,
            transform: btn.transform,
          }}
          aria-label={btn.label}
          data-active={activeSection === btn.id ? 'true' : 'false'}
        >
          {btn.label}
        </button>
      ))}
      {/* Centre content over the triangle */}
      <div className="dial-center-content">
        <div className="dial-center-title">{content?.title}</div>
        <div className="dial-center-body">{content?.body}</div>
      </div>

      {/* Mercedonius month circle at bottom centre */}
      <div className="dial-month-circle">
        <MonthCircle
          month={mercedonius.month === 0 ? 13 : mercedonius.month}
          year={mercedonius.year}
          size={200}
        />
      </div>

      <div className="dial-date-footer" style={{
        position: 'absolute',
        left: '50%',
        top: '2%',
        transform: 'translate(-50%, 0)',
        zIndex: 25,
        textAlign: 'center',
        color: '#fbbf24',
        fontFamily: "'Cinzel', Georgia, 'Times New Roman', serif",
        fontWeight: 900,
        letterSpacing: '0.15em',
        fontSize: 'clamp(0.8rem, 3vw, 1.25rem)',
        textShadow: '0 0 8px rgba(0,0,0,0.8)'
      }}>
        {mercedoniusLabel}
      </div>
    </section>
  );
}