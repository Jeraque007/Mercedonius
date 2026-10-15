'use client';

import React, { useState } from 'react';
import { formatDateForDisplay } from '@lib/date-utils';
import {
  get13MonthName,
  getMoonIconForDate,
  getMoonNameForDate,
  getMoonIlluminationForDate,
  getSunConstellation,
  getCalendarDayWithAstronomy,
} from '@lib/calendar-service';
import { CONSTELLATION_NAMES, CONSTELLATION_ICONS, getTraditionalZodiacSign } from '@lib/astronomy';
import { ComparisonPanel } from './components/comparison-panel';
import { MySkySection } from './components/birth-sky';
import { RisingInfo } from './components/rising-info';
import { MonthGrid } from './components/month-grid';
import { WeekdayReferenceSection } from './components/weekday-reference';
import { getWeekdayReference, PLANET_GLYPHS } from '@data/astrology';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [viewMode, setViewMode] = useState<'dual' | 'monthly' | 'gregorian'>('dual');
  const [showDayDetail, setShowDayDetail] = useState(false);

  const dayAstronomy = getCalendarDayWithAstronomy(currentDate);
  const monthName = get13MonthName(dayAstronomy.monthDay.month);

  const sunConst = getSunConstellation(currentDate);
  const weekdayRef = getWeekdayReference(dayAstronomy.dayOfWeek);

  const eclipseEvents = dayAstronomy.astronomicalEvents.filter((e: any) =>
    e.type === 'solar_eclipse' || e.type === 'lunar_eclipse'
  );

  const formatRa = (raDeg: number): string => {
    const hours = Math.floor(raDeg / 15);
    const minutes = Math.floor((raDeg / 15 - hours) * 60);
    const seconds = Math.round(((raDeg / 15 - hours) * 60 - minutes) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  /** First non-eclipse astronomical event of the selected day, if any. */
  const nextEvent = dayAstronomy.astronomicalEvents.find(
    (e: any) => e.type !== 'solar_eclipse' && e.type !== 'lunar_eclipse'
  );

  /** Sun / Moon / date summaries for the My Sky section. */
  const todayView = (d: Date) => {
    const sc = getSunConstellation(d);
    return {
      sun: `${sc.constellation.icon} ${sc.constellation.name}`,
      moon: `${getMoonIconForDate(d)} ${getMoonNameForDate(d)}`,
      date: formatDateForDisplay(d),
    };
  };

  return (
    <div className="calendar-app">
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">☀️</span>
          <span>Mercedonius · 13-Month Calendar</span>
        </div>

        <div className="calendar-controls">
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear() - 1, 0, 1))} className="nav-btn">← Prev Year</button>
          <button onClick={() => setCurrentDate(new Date())} className="nav-btn primary">Today</button>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear() + 1, 0, 1))} className="nav-btn">Next Year →</button>
        </div>
      </header>

      <main className="calendar-main">
        <section className="calendar-display">
          <div className="primary-date-display">
            <h1 className="date-title">
              <span className="date-main">{formatDateForDisplay(currentDate)}</span>
              <span className="date-subtitle">Mercedonius — {monthName} {dayAstronomy.monthDay.day}</span>
            </h1>

            <div className="date-details">
              <div className="detail-item">
                <label>Mercedonius:</label>
                <span>{monthName} {dayAstronomy.monthDay.day}</span>
              </div>
              <div className="detail-item">
                <label>Day:</label>
                <span>{dayAstronomy.dayOfWeek}</span>
              </div>
              {weekdayRef && (
                <div className="detail-item">
                  <label>Planetary day:</label>
                  <span>{PLANET_GLYPHS[weekdayRef.planet]} {weekdayRef.planet} · {weekdayRef.dies}</span>
                </div>
              )}
              <div className="detail-item">
                <label>Sun Constellation:</label>
                <span>☀️ {sunConst.constellation.name}</span>
              </div>
              <div className="detail-item">
                <label>Moon:</label>
                <span>{getMoonIconForDate(currentDate)} {getMoonNameForDate(currentDate)}</span>
              </div>
              <div className="detail-item">
                <label>Illumination:</label>
                <span>{getMoonIlluminationForDate(currentDate)}%</span>
              </div>
              <div className="detail-item">
                <label>Eclipse:</label>
                <span>{eclipseEvents.length > 0 ? eclipseEvents[0].label : 'None'}</span>
              </div>
              <div className="detail-item">
                <label>Astronomical event:</label>
                <span>{nextEvent ? `${nextEvent.icon} ${nextEvent.label}` : 'None'}</span>
              </div>
            </div>

            <ComparisonPanel selectedDate={currentDate} />

            <div className="zodiac-info">
              <div className="zodiac-title">Astronomical Zodiac (13 Constellations)</div>
              <div className="zodiac-description">
                <p>
                  The astronomical zodiac is based on actual IAU constellation boundaries.
                  The Sun's apparent annual path crosses <strong>13 constellations</strong>, including Ophiuchus.
                  The traditional Western zodiac divides the ecliptic into twelve equal 30-degree signs.
                </p>
                <p>
                  Astronomical constellations have irregular boundaries; the Sun's actual
                  apparent path crosses thirteen IAU-defined constellations, including Ophiuchus.
                </p>
              </div>
              <div className="zodiac-list">
                {CONSTELLATION_NAMES.map((name, i) => (
                  <div key={i} className="constellation-item">
                    <span className="constellation-icon">{CONSTELLATION_ICONS[i]}</span>
                    <span className="constellation-name">{name}</span>
                    <span className="constellation-index">{i + 1}</span>
                  </div>
                ))}
              </div>
              <div className="sun-transition">
                <label>Sun on this date:</label>
                <span>{sunConst.constellation.icon} {sunConst.constellation.name}</span>
              </div>
            </div>

            <button
              className="nav-btn detail-toggle"
              onClick={() => setShowDayDetail((v) => !v)}
            >
              {showDayDetail ? 'Hide Day Detail ▲' : 'Show Day Detail ▼'}
            </button>
          </div>

          <MySkySection todayView={todayView} />
        </section>

        <section className="calendar-switcher">
          <h3>Calendar Mode</h3>
          <div className="switch-buttons">
            <button onClick={() => setViewMode('dual')} className={viewMode === 'dual' ? 'active' : ''}>Dual View</button>
            <button onClick={() => setViewMode('monthly')} className={viewMode === 'monthly' ? 'active' : ''}>13-Month</button>
            <button onClick={() => setViewMode('gregorian')} className={viewMode === 'gregorian' ? 'active' : ''}>Gregorian</button>
          </div>
        </section>

        <section className={`calendar-mode-views ${viewMode === 'dual' ? 'dual' : 'single'}`}>
          {(viewMode === 'dual' || viewMode === 'monthly') && (
            <MonthGrid
              calendar="mercedonius"
              date={currentDate}
              selected={currentDate}
              onSelect={setCurrentDate}
            />
          )}
          {(viewMode === 'dual' || viewMode === 'gregorian') && (
            <MonthGrid
              calendar="gregorian"
              date={currentDate}
              selected={currentDate}
              onSelect={setCurrentDate}
            />
          )}
        </section>

        <WeekdayReferenceSection currentDate={currentDate} />

        {showDayDetail && (
          <section className="day-detail-panel">
            <h3>Day Detail</h3>
            <div className="day-detail">
              <div className="detail-section">
                <h4>Calendar Date</h4>
                <div className="detail-row">
                  <label>Mercedonius date:</label>
                  <span>{get13MonthName(dayAstronomy.monthDay.month)} {dayAstronomy.monthDay.day}</span>
                </div>
                <div className="detail-row">
                  <label>Gregorian:</label>
                  <span>{formatDateForDisplay(dayAstronomy.gregorian)}</span>
                </div>
                <div className="detail-row">
                  <label>Day of week:</label>
                  <span>{dayAstronomy.dayOfWeek}</span>
                </div>
              </div>

              {weekdayRef && (
                <div className="detail-section">
                  <h4>Weekday — Planet, Origin &amp; Chakra</h4>
                  <div className="detail-row">
                    <label>Latin name:</label>
                    <span>{weekdayRef.dies}</span>
                  </div>
                  <div className="detail-row">
                    <label>Planet:</label>
                    <span>{PLANET_GLYPHS[weekdayRef.planet]} {weekdayRef.planet}</span>
                  </div>
                  <div className="detail-row">
                    <label>Origin:</label>
                    <span>{weekdayRef.origin}</span>
                  </div>
                  <div className="detail-row">
                    <label>Chakra:</label>
                    <span>{weekdayRef.chakraSanskrit} ({weekdayRef.chakraEnglish})</span>
                  </div>
                  <div className="detail-row">
                    <label>Frequency:</label>
                    <span>{weekdayRef.frequencyHz} Hz</span>
                  </div>
                </div>
              )}

              <div className="detail-section">
                <h4>Sun Position (Astronomical)</h4>
                <div className="detail-row">
                  <label>Sun Constellation:</label>
                  <span>{dayAstronomy.sunConstellation.name}</span>
                  {dayAstronomy.sunConstellation.isNearBoundary && (
                    <span className="near-badge">Near boundary</span>
                  )}
                </div>
                <div className="detail-row">
                  <label>Ecliptic longitude:</label>
                  <span>{dayAstronomy.sun.eclipticLongitudeDeg.toFixed(4)}°</span>
                </div>
                <div className="detail-row">
                  <label>Right ascension:</label>
                  <span>{formatRa(dayAstronomy.sun.raDeg)}</span>
                </div>
                <div className="detail-row">
                  <label>Declination:</label>
                  <span>{dayAstronomy.sun.decDeg.toFixed(4)}°</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Moon</h4>
                <div className="detail-row">
                  <label>Phase:</label>
                  <span>{dayAstronomy.moonPhase.name}</span>
                </div>
                <div className="detail-row">
                  <label>Illumination:</label>
                  <span>{dayAstronomy.moonIllumination}%</span>
                </div>
                <div className="detail-row">
                  <label>Lunar age:</label>
                  <span>{dayAstronomy.moonPhase.ageDays} days</span>
                </div>
                <div className="detail-row">
                  <label>Distance:</label>
                  <span>{dayAstronomy.moonDistanceKm.toLocaleString()} km</span>
                </div>
                <div className="detail-row">
                  <label>Moon Constellation:</label>
                  <span>{dayAstronomy.moonConstellation.name}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Astronomical Events</h4>
                {dayAstronomy.astronomicalEvents.length > 0 ? (
                  <ul className="events-list">
                    {dayAstronomy.astronomicalEvents.map((event: any, idx: number) => (
                      <li key={idx}><span className="event-icon">{event.icon}</span><span className="event-label">{event.label}</span></li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-events">No major astronomical events today.</p>
                )}
              </div>

              <div className="detail-section">
                <h4>Astronomical Rising Constellation</h4>
                <RisingInfo selectedDate={currentDate} />
              </div>

              <div className="detail-section">
                <h4>Sun Constellation vs Traditional Astrological Sign</h4>
                <div className="birth-sky">
                  <div className="sky-object">
                    <span className="object-label">Astronomical constellation</span>
                    <span className="object-value">{dayAstronomy.sunConstellation.name}</span>
                    {dayAstronomy.sunConstellation.isNearBoundary && (
                      <span className="near-badge">Near boundary</span>
                    )}
                  </div>
                  <div className="sky-object">
                    <span className="object-label">Traditional astrological sign</span>
                    <span className="object-value">{getTraditionalZodiacSign(currentDate).sign}</span>
                  </div>
                  <p className="distinction-note">
                    <span className="note-label">Note:</span> The astronomical constellation and astrological sign are different systems with different boundaries.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="app-footer">
        <p>Mercedonius v0.1.0 • Astronomical Calendar</p>
      </footer>
    </div>
  );
}
