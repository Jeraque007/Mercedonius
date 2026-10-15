'use client';

import React from 'react';
import {
  WEEKDAY_REFERENCES,
  PLANET_GLYPHS,
  getWeekdayReferenceForDate,
} from '@data/astrology';

interface WeekdayReferenceProps {
  /** The currently selected date — its weekday is highlighted */
  currentDate: Date;
}

/**
 * Reference panel for all seven days of the week: ruling planet,
 * Latin name (dies …), origin of the English name, and the associated
 * chakra with its commonly cited frequency.
 */
export function WeekdayReferenceSection({ currentDate }: WeekdayReferenceProps) {
  const current = getWeekdayReferenceForDate(currentDate);

  return (
    <section className="weekday-reference">
      <h3>Days of the Week — Planets, Origins &amp; Chakras</h3>
      <p className="weekday-note">
        Each day is ruled by a classical planet. Its English name comes from that planet
        (Germanic/Norse via Latin), and its chakra correspondence follows the traditional
        Chaldean order from Root (Saturn) to Crown (Sun). Chakra frequencies are commonly
        cited in spiritual literature but are not scientifically validated.
      </p>
      <div className="weekday-grid">
        {WEEKDAY_REFERENCES.map((ref) => (
          <div
            key={ref.day}
            className={`weekday-card${ref.day === current.day ? ' current' : ''}`}
          >
            <div className="weekday-head">
              <span className="weekday-planet-glyph" aria-hidden="true">
                {PLANET_GLYPHS[ref.planet]}
              </span>
              <div className="weekday-titles">
                <div className="weekday-name">{ref.day}</div>
                <div className="weekday-dies">{ref.dies}</div>
              </div>
              <span className="weekday-planet">{ref.planet}</span>
            </div>
            <p className="weekday-origin">
              <strong>Origin:</strong> {ref.origin}
            </p>
            <div className="weekday-chakra">
              <span className="chakra-name">
                {ref.chakraSanskrit} · {ref.chakraEnglish} Chakra
              </span>
              <span className="chakra-freq">{ref.frequencyHz} Hz</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}