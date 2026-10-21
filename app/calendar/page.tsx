'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MonthGrid } from '../components/month-grid';
import { WeekdayReferenceSection } from '../components/weekday-reference';
import { SundialDisplay } from '../components/sundial-display';
import { EventCountdown } from '../components/event-countdown';
import { ComparisonPanel } from '../components/comparison-panel';
import { ProvenanceLegend } from '../components/provenance-badge';
import { getNextEvent } from '@lib/events';
import {
  getSunConstellation,
  getMoonIconForDate,
  getMoonNameForDate,
  getMoonIlluminationForDate,
  getCalendarDayWithAstronomy,
  getSunTropicalSign,
  getMoonTropicalSign,
} from '@lib/calendar-service';
import { getWeekdayReferenceForDate, PLANET_GLYPHS } from '@data/astrology';
import {
  convertGregorianTo13Month,
  getDayOfWeek,
  formatDateForDisplay,
  formatMercedoniusDate,
} from '@lib/date-utils';
import { useSettings } from '../components/settings-context';

/** Latin weekday short names (Sunday-first), used in Mercedonius view */
const LATIN_WEEKDAY_SHORT = ['Sol', 'Lun', 'Mar', 'Mer', 'Iov', 'Ven', 'Sat'];
/** English weekday short names (Sunday-first), used in Gregorian view */
const ENGLISH_WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage(): JSX.Element {
  const router = useRouter();
  // Grid view mode is app-wide state (Settings page) — the buttons below
  // update the same shared value.
  const { viewMode, setViewMode } = useSettings();
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [expandedImage, setExpandedImage] = useState<{ src: string; alt: string } | null>(null);
  // Details-section filter: mirrors the date card between the 13-month and
  // Gregorian calendars. Independent from the month-grid `viewMode` below —
  // flipping it never changes the grid layout.
  const [detailsView, setDetailsView] = useState<'mercedonius' | 'gregorian'>('mercedonius');

  const mercedonius = useMemo(() => convertGregorianTo13Month(selectedDate), [selectedDate]);
  // Mercedonius is the PRIMARY field, rendered in the Standard AUC format
  // ([Month] [Day], [AUC year] AUC). Gregorian is the secondary labeled field.
  const mercedoniusLabel = formatMercedoniusDate(mercedonius);
  const gregorianLabel = formatDateForDisplay(selectedDate);
  // Weekday index (0=Sunday … 6=Saturday) for the selected instant — drives the
  // Day / Planetary Day mirror between Mercedonius and Gregorian detail views.
  const dowIndex = getDayOfWeek(selectedDate);

  const goBack = () => router.push('/my-sky');
  const goNext = () => router.push('/zodiac-ring');
  const closeImage = () => setExpandedImage(null);

  const showMercedonius = viewMode === 'dual' || viewMode === 'mercedonius';
  const showGregorian = viewMode === 'dual' || viewMode === 'gregorian';

  // ---- Day dashboard (restored top info section) ----
  // Live clock: ticking "now" drives the countdown; timezone resolved after
  // mount so server prerender and client hydration agree.
  const [now, setNow] = useState<Date | null>(null);
  const [timeZone, setTimeZone] = useState('UTC');
  useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const nextEvent = useMemo(() => (now ? getNextEvent(now) : null), [now]);

  // ── Calendar day (Mercedonius / Gregorian label + day of week) from the
  //    actual selected civil date. This is what the labels show.
  const calendarDay = useMemo(
    () => getCalendarDayWithAstronomy(selectedDate),
    [selectedDate]
  );

  // ── Astronomy date. When the user is viewing the 13-month calendar, the
  //    Mercedonius month name (e.g. "November") does NOT match the Gregorian
  //    month of the calendrical equivalent (Mercedonius Nov 8 = Gregorian
  //    Oct 18). Compute astronomy for the Gregorian date that matches the
  //    Mercedonius month NAME + day, so "Mercedonius November 8" shows
  //    Gregorian November 8 astronomy (Sun in Libra, Waning Crescent ~2%),
  //    not October 18 astronomy (Sun in Virgo, First Quarter ~50%).
  const MERCEDONIUS_TO_GREGORIAN_MONTH: ReadonlyMap<number, number> = new Map([
    [1, 3], // Martius → March
    [2, 4], // Aprilis → April
    [3, 5], // Maius → May
    [4, 6], // Iunius → June
    [5, 7], // Quintilis → July
    [6, 8], // Sextilis → August
    [7, 9], // September → September
    [8, 10], // October → October
    [9, 11], // November → November
    [10, 12], // December → December
    [11, 1], // Ianuarius → January
    [12, 2], // Februarius → February
  ]);

  const astroDate = useMemo(() => {
    if (detailsView !== 'mercedonius') return selectedDate;
    const gregMonth = MERCEDONIUS_TO_GREGORIAN_MONTH.get(mercedonius.month);
    if (gregMonth === undefined) return selectedDate; // Intercalaris (month 13) — fall back
    return new Date(
      selectedDate.getUTCFullYear(),
      gregMonth - 1,
      mercedonius.day
    );
  }, [selectedDate, mercedonius, detailsView]);

  // ── Astronomy computed on astroDate so the display matches the Mercedonius
  //    month name the user selected, not the calendrical Gregorian equivalent.
  const astroDay = useMemo(() => getCalendarDayWithAstronomy(astroDate), [
    astroDate,
  ]);
  const sunConst = astroDay.sunConstellation;
  const moonPhase = astroDay.moonPhase;
  const sunTropical = useMemo(() => getSunTropicalSign(astroDate), [astroDate]);
  const moonTropical = useMemo(() => getMoonTropicalSign(astroDate), [astroDate]);
  const planetaryDay = useMemo(
    () => getWeekdayReferenceForDate(selectedDate),
    [selectedDate]
  );

  const eclipseEvent = useMemo(
    () =>
      astroDay.astronomicalEvents.find(
        (e) => e.type === 'solar_eclipse' || e.type === 'lunar_eclipse'
      ) ?? null,
    [astroDay]
  );
  const dayEvent = useMemo(
    () =>
      astroDay.astronomicalEvents.find(
        (e) => e.type !== 'solar_eclipse' && e.type !== 'lunar_eclipse'
      ) ?? null,
    [astroDay]
  );

  return (
    <div className="calendar-page page-container" style={{ padding: '1.5rem', maxWidth: 1200, margin: '0 auto', minHeight: '100vh', color: '#e2e8f0' }}>
      <nav className="page-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #334155' }}>
        <button
          type="button"
          onClick={goBack}
          className="nav-btn"
          style={{ padding: '0.5rem 1rem', background: '#1e293b', color: '#e2e8f0', border: '1px solid #475569', borderRadius: '6px', cursor: 'pointer' }}
        >
          ← Back
        </button>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fbbf24' }}>Calendar Page</div>
        <button
          type="button"
          onClick={goNext}
          className="nav-btn"
          style={{ padding: '0.5rem 1rem', background: '#1e293b', color: '#e2e8f0', border: '1px solid #475569', borderRadius: '6px', cursor: 'pointer' }}
        >
          Next →
        </button>
      </nav>

      <header style={{ marginBottom: '1.5rem' }}>
        <h1
          style={{
            margin: 0,
            fontSize: '1.75rem',
            color: 'transparent',
            WebkitTextFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            background: 'linear-gradient(to bottom, #FFF8DC 0%, #F6DC9A 45%, #E3AC55 75%, #C68A2E 100%)',
            textShadow:
              '0 0 calc(1.75rem * 0.38) rgba(255, 196, 96, 0.65), 0 0 calc(1.75rem * 0.38) rgba(255, 196, 96, 0.35)',
            WebkitTextStroke: 'calc(1.75rem * 0.07) rgba(7, 11, 26, 0.92)',
            letterSpacing: '0.06em',
            textAlign: 'center',
            fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
            fontWeight: 900,
          }}
        >
          Mercedonius Calendar
        </h1>
        <p style={{ margin: '0.25rem 0 0', color: '#94a3b8' }}>
          <span className="date-kind">Gregorian</span>{' '}
          {gregorianLabel}
          {' · '}
          <span className="date-kind">Mercedonius</span>{' '}
          {mercedoniusLabel}
        </p>
      </header>

      {/* Restored day dashboard: info cards, live countdown, data sources, compare systems */}
      <section style={{ marginBottom: '2rem' }}>
        {/* Date-details filter: mirror the date card between calendars. */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem',
          }}
        >
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8' }}>
            Date details
          </span>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button
              type="button"
              onClick={() => setDetailsView('mercedonius')}
              className={`mode-btn ${detailsView === 'mercedonius' ? 'active' : ''}`}
              aria-pressed={detailsView === 'mercedonius'}
              style={{
                padding: '0.3rem 0.8rem',
                background: detailsView === 'mercedonius' ? '#fbbf24' : '#1e293b',
                color: detailsView === 'mercedonius' ? '#0f172a' : '#e2e8f0',
                border: '1px solid #475569',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: detailsView === 'mercedonius' ? 700 : 400,
                fontSize: '0.8rem',
              }}
            >
              13-Month
            </button>
            <button
              type="button"
              onClick={() => setDetailsView('gregorian')}
              className={`mode-btn ${detailsView === 'gregorian' ? 'active' : ''}`}
              aria-pressed={detailsView === 'gregorian'}
              style={{
                padding: '0.3rem 0.8rem',
                background: detailsView === 'gregorian' ? '#fbbf24' : '#1e293b',
                color: detailsView === 'gregorian' ? '#0f172a' : '#e2e8f0',
                border: '1px solid #475569',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: detailsView === 'gregorian' ? 700 : 400,
                fontSize: '0.8rem',
              }}
            >
              Gregorian
            </button>
          </div>
        </div>

        <div className="date-details">
          {/* Date — Mercedonius or Gregorian */}
          <div className="detail-item">
            <label>
              {detailsView === 'mercedonius' ? 'Mercedonius:' : 'Gregorian:'}
            </label>
            <span>
              {detailsView === 'mercedonius'
                ? formatMercedoniusDate(mercedonius)
                : gregorianLabel}
            </span>
          </div>

          {/* Day of week — Latin short (Mercedonius) vs English short (Gregorian) */}
          <div className="detail-item">
            <label>Day:</label>
            <span>
              {detailsView === 'mercedonius'
                ? LATIN_WEEKDAY_SHORT[dowIndex]
                : ENGLISH_WEEKDAY_SHORT[dowIndex]}
            </span>
          </div>

          {/* Planetary Day — Latin dies (Mercedonius) vs English day name (Gregorian) */}
          <div className="detail-item">
            <label>Planetary Day:</label>
            <span>
              {detailsView === 'mercedonius'
                ? `${PLANET_GLYPHS[planetaryDay.planet]} ${planetaryDay.planet} · ${planetaryDay.dies}`
                : `${PLANET_GLYPHS[planetaryDay.planet]} ${planetaryDay.planet} · ${planetaryDay.day}`}
            </span>
          </div>

          {/* Astronomy — computed on the Mercedonius-matched date so the
              display matches the month name the user selected. */ }
          <div className="detail-item">
            <label>Sun Constellation (IAU):</label>
            <span>
              {sunConst.icon} {sunConst.name}
            </span>
          </div>
          <div className="detail-item">
            <label>Sun Sign (Tropical):</label>
            <span>
              {sunTropical.icon} {sunTropical.name} · λ
              {sunTropical.eclipticLongitudeDeg.toFixed(1)}°
            </span>
          </div>
          <div className="detail-item">
            <label>Moon:</label>
            <span>
              {moonPhase.icon} {moonPhase.name}
            </span>
          </div>
          <div className="detail-item">
            <label>Moon Sign (Tropical):</label>
            <span>
              {moonTropical.icon} {moonTropical.name} · λ
              {moonTropical.eclipticLongitudeDeg.toFixed(1)}°
            </span>
          </div>
          <div className="detail-item">
            <label>Illumination:</label>
            <span>{moonPhase.illumination.toFixed(1)}%</span>
          </div>
          <div className="detail-item">
            <label>Eclipse:</label>
            <span>
              {eclipseEvent ? `${eclipseEvent.icon} ${eclipseEvent.label}` : 'None'}
            </span>
          </div>
          <div className="detail-item">
            <label>Astronomical Event:</label>
            <span>{dayEvent ? `${dayEvent.icon} ${dayEvent.label}` : 'None'}</span>
          </div>
        </div>

        {now && (
          <EventCountdown event={nextEvent} now={now} timeZone={timeZone} hour12={true} />
        )}

        <ProvenanceLegend />

        <ComparisonPanel selectedDate={selectedDate} />
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ margin: '0 0 0.75rem', color: '#e2e8f0', fontSize: '1.125rem' }}>Calendar Mode</h2>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button
            type="button"
            onClick={() => setViewMode('dual')}
            className={`mode-btn ${viewMode === 'dual' ? 'active' : ''}`}
            style={{
              padding: '0.5rem 1rem',
              background: viewMode === 'dual' ? '#fbbf24' : '#1e293b',
              color: viewMode === 'dual' ? '#0f172a' : '#e2e8f0',
              border: '1px solid #475569',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: viewMode === 'dual' ? 700 : 400,
            }}
          >
            Dual View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('mercedonius')}
            className={`mode-btn ${viewMode === 'mercedonius' ? 'active' : ''}`}
            style={{
              padding: '0.5rem 1rem',
              background: viewMode === 'mercedonius' ? '#fbbf24' : '#1e293b',
              color: viewMode === 'mercedonius' ? '#0f172a' : '#e2e8f0',
              border: '1px solid #475569',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: viewMode === 'mercedonius' ? 700 : 400,
            }}
          >
            13-Month
          </button>
          <button
            type="button"
            onClick={() => setViewMode('gregorian')}
            className={`mode-btn ${viewMode === 'gregorian' ? 'active' : ''}`}
            style={{
              padding: '0.5rem 1rem',
              background: viewMode === 'gregorian' ? '#fbbf24' : '#1e293b',
              color: viewMode === 'gregorian' ? '#0f172a' : '#e2e8f0',
              border: '1px solid #475569',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: viewMode === 'gregorian' ? 700 : 400,
            }}
          >
            Gregorian
          </button>
        </div>

        <div
          className={`calendar-mode-views ${viewMode === 'dual' ? 'dual' : 'single'}`}
          style={{
            display: 'grid',
            gap: '1.5rem',
            gridTemplateColumns: viewMode === 'dual' ? 'repeat(auto-fit, minmax(340px, 1fr))' : '1fr',
          }}
        >
          {showMercedonius && (
            <MonthGrid
              date={selectedDate}
              calendar="mercedonius"
              selected={selectedDate}
              onSelect={setSelectedDate}
              onImageClick={(src, alt) => setExpandedImage({ src, alt })}
            />
          )}
          {showGregorian && (
            <MonthGrid
              date={selectedDate}
              calendar="gregorian"
              selected={selectedDate}
              onSelect={setSelectedDate}
              onImageClick={(src, alt) => setExpandedImage({ src, alt })}
            />
          )}
        </div>
      </section>

      <section>
        <WeekdayReferenceSection currentDate={selectedDate} />
      </section>

      {/* Sundial hub — 8 rim buttons + live data over the central triangle */}
      <section style={{ position: 'relative', width: '100%', maxWidth: 700, margin: '0 auto', padding: '1rem' }}>
        <SundialDisplay selectedDate={selectedDate} viewMode={viewMode} timeZone={timeZone} />
      </section>

      {/* Full-image modal — actual artwork, not cropped, not illustrative */}
      {expandedImage && (
        <div
          className="image-modal"
          onClick={closeImage}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(4, 7, 18, 0.85)',
            backdropFilter: 'blur(2px)',
            cursor: 'zoom-out',
          }}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'Escape') closeImage();
          }}
        >
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              maxWidth: '95vw',
              maxHeight: '95vh',
              cursor: 'default',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeImage}
              style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#e2e8f0',
                border: '1px solid #475569',
                borderRadius: '4px',
                padding: '0.4rem 0.8rem',
                fontSize: '1.25rem',
                cursor: 'pointer',
                zIndex: 10,
              }}
            >
              ✕
            </button>
            <img
              src={expandedImage.src}
              alt={expandedImage.alt}
              style={{
                maxWidth: '95vw',
                maxHeight: '80vh',
                objectFit: 'contain',
                display: 'block',
                boxShadow: '0 0 40px rgba(0, 0, 0, 0.5)',
              }}
            />
            <p
              style={{
                marginTop: '0.75rem',
                color: '#94a3b8',
                fontSize: '0.875rem',
                textAlign: 'center',
                maxWidth: '60ch',
              }}
            >
              {expandedImage.alt}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}