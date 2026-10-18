'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LocalSkyPanel } from '../components/local-sky-panel';
import { getLocalSky } from '@lib/calendar-service';
import type { AppLocation } from '@lib/local-sky';

interface LocalSkyPageProps {}

const DEFAULT_LOCATION: AppLocation = {
  name: 'Germiston, South Africa (default)',
  latitude: -26.1556,
  longitude: 28.2228,
  timeZone: 'Africa/Johannesburg',
};

export default function LocalSkyPage(): JSX.Element {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [hour12, setHour12] = useState(true);

  const civilDate = useMemo(
    () => ({
      year: selectedDate.getFullYear(),
      month: selectedDate.getMonth() + 1,
      day: selectedDate.getDate(),
    }),
    [selectedDate]
  );

  const sky = useMemo(() => getLocalSky(civilDate, DEFAULT_LOCATION), [civilDate]);

  const goBack = () => router.push('/zodiac-ring');
  const goNext = () => router.push('/my-sky');

  return (
    <div className="local-sky-page page-container" style={{ padding: '1.5rem', maxWidth: 900, margin: '0 auto', minHeight: '100vh' }}>
      <nav className="page-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #334155' }}>
        <button
          type="button"
          onClick={goBack}
          className="nav-btn"
          style={{ padding: '0.5rem 1rem', background: '#1e293b', color: '#e2e8f0', border: '1px solid #475569', borderRadius: '6px', cursor: 'pointer' }}
        >
          ← Back
        </button>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fbbf24' }}>Local Sky</div>
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
          Local Sky
        </h1>
        <p style={{ margin: '0.25rem 0 0', color: '#94a3b8' }}>
          {DEFAULT_LOCATION.name} · {DEFAULT_LOCATION.timeZone}
        </p>
      </header>

      <LocalSkyPanel sky={sky} hour12={hour12} />

      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <label style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Time format:</label>
        <button
          type="button"
          onClick={() => setHour12(true)}
          style={{
            padding: '0.25rem 0.75rem',
            background: hour12 ? '#fbbf24' : '#1e293b',
            color: hour12 ? '#0f172a' : '#e2e8f0',
            border: '1px solid #475569',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          12h
        </button>
        <button
          type="button"
          onClick={() => setHour12(false)}
          style={{
            padding: '0.25rem 0.75rem',
            background: !hour12 ? '#fbbf24' : '#1e293b',
            color: !hour12 ? '#0f172a' : '#e2e8f0',
            border: '1px solid #475569',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          24h
        </button>
      </div>
    </div>
  );
}