'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MySkySection } from '../components/birth-sky';
import { formatDateForDisplay } from '@lib/date-utils';
import {
  getSunConstellation,
  getMoonPhase,
  getMoonName,
  getMoonIcon,
} from '@lib/calendar-service';

interface MyskyPageProps {}

export default function MyskyPage(): JSX.Element {
  const router = useRouter();
  const [now, setNow] = useState<Date>(() => new Date());

  const todayView = useCallback(
    (date: Date) => {
      const sunConst = getSunConstellation(date);
      const moonPhase = getMoonPhase(date);
      const moonName = getMoonName(date);
      const moonIcon = getMoonIcon(date);
      return {
        sun: `${sunConst.constellation.icon} ${sunConst.constellation.name}`,
        moon: `${moonIcon} ${moonName}`,
        date: formatDateForDisplay(date),
      };
    },
    []
  );

  useMemo(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const goBack = () => router.push('/local-sky');
  const goNext = () => router.push('/calendar');

  return (
    <div className="mysky-page page-container" style={{ padding: '1.5rem', maxWidth: 900, margin: '0 auto', minHeight: '100vh' }}>
      <nav className="page-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #334155' }}>
        <button
          type="button"
          onClick={goBack}
          className="nav-btn"
          style={{ padding: '0.5rem 1rem', background: '#1e293b', color: '#e2e8f0', border: '1px solid #475569', borderRadius: '6px', cursor: 'pointer' }}
        >
          ← Back
        </button>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fbbf24' }}>My Sky</div>
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
          My Sky
        </h1>
        <p style={{ margin: '0.25rem 0 0', color: '#94a3b8' }}>{formatDateForDisplay(now)}</p>
      </header>

      <MySkySection now={now} todayView={todayView} />
    </div>
  );
}