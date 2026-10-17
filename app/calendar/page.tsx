'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MonthGrid } from '../components/month-grid';
import { WeekdayReferenceSection } from '../components/weekday-reference';
import { SundialDisplay } from '../components/sundial-display';
import {
  convertGregorianTo13Month,
  getMercedoniusMonthLabel,
  formatDateForDisplay,
} from '@lib/date-utils';

export type ViewMode = 'dual' | 'mercedonius' | 'gregorian';

export default function CalendarPage(): JSX.Element {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('dual');
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [expandedImage, setExpandedImage] = useState<{ src: string; alt: string } | null>(null);

  const mercedonius = useMemo(() => convertGregorianTo13Month(selectedDate), [selectedDate]);
  const mercedoniusLabel = `${getMercedoniusMonthLabel(mercedonius.month === 0 ? 13 : mercedonius.month)} ${mercedonius.day}, ${mercedonius.year}`;
  const gregorianLabel = formatDateForDisplay(selectedDate);

  const goBack = () => router.push('/my-sky');
  const goNext = () => router.push('/zodiac-ring');
  const closeImage = () => setExpandedImage(null);

  const showMercedonius = viewMode === 'dual' || viewMode === 'mercedonius';
  const showGregorian = viewMode === 'dual' || viewMode === 'gregorian';

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
            WebkitTextStroke: 'calc(1.75rem * 0.13) rgba(7, 11, 26, 0.92)',
            letterSpacing: '0.20em',
            textAlign: 'center',
            fontFamily: "'Cinzel', Georgia, 'Times New Roman', serif",
            fontWeight: 900,
          }}
        >
          Mercedonius Calendar
        </h1>
        <p style={{ margin: '0.25rem 0 0', color: '#94a3b8' }}>
          {gregorianLabel} · {mercedoniusLabel}
        </p>
      </header>

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

      {/* Transparent-background sundial dial with golden neon buttons */}
      <section className="sundial-dial-page" style={{ position: 'relative', width: '100%', maxWidth: 1200, margin: '0 auto', padding: '1rem', overflow: 'hidden' }}>
        <SundialDisplay selectedDate={selectedDate} />
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