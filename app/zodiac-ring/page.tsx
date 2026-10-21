'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ZodiacRing } from '../components/zodiac-ring';
import {
  convertGregorianTo13Month,
  formatDateForDisplay,
  formatMercedoniusDate,
} from '@lib/date-utils';
import { getSunConstellation, getCalendarDayWithAstronomy, getSunTropicalSign } from '@lib/calendar-service';
import { getSiderealSign } from '@lib/astronomy';
import { useSettings } from '../components/settings-context';

interface ZodiacRingPageProps {}

export default function ZodiacRingPage(): JSX.Element {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  // Ring navigation state: which constellation section the user has focused
  // (null → centre follows the Sun's constellation on the selected date).
  const [focusedName, setFocusedName] = useState<string | null>(null);
  // Zodiac system comes from the app-wide settings (Settings page).
  const { zodiacSystem } = useSettings();

  const dayAstronomy = useMemo(() => getCalendarDayWithAstronomy(selectedDate), [selectedDate]);
  const mercedonius = convertGregorianTo13Month(selectedDate);
  // Mercedonius is the PRIMARY field in Standard AUC format.
  const mercedoniusLabel = formatMercedoniusDate(mercedonius);
  const gregorianLabel = formatDateForDisplay(selectedDate);

  // Sun's sign in the selected system — shown alongside the (IAU) ring.
  const sunSignLine = useMemo(() => {
    const lon = dayAstronomy.sun.eclipticLongitudeDeg;
    if (zodiacSystem === 'tropical') {
      const s = getSunTropicalSign(selectedDate);
      return `${s.icon} ${s.name} (Tropical) · λ ${lon.toFixed(1)}°`;
    }
    if (zodiacSystem === 'vedic') {
      const s = getSiderealSign(lon, selectedDate);
      return `${s.icon} ${s.name} (${s.sanskrit}) · λ ${s.siderealLongitudeDeg.toFixed(1)}°`;
    }
    const c = dayAstronomy.sunConstellation;
    return `${c.icon} ${c.name} (IAU) · λ ${lon.toFixed(1)}°`;
  }, [zodiacSystem, selectedDate, dayAstronomy]);

  const goBack = () => router.push('/calendar');
  const goNext = () => router.push('/local-sky');

  return (
    <div className="zodiac-ring-page page-container" style={{ padding: '1.5rem', maxWidth: 900, margin: '0 auto', minHeight: '100vh' }}>
      <nav className="page-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #334155' }}>
        <button
          type="button"
          onClick={goBack}
          className="nav-btn"
          style={{ padding: '0.5rem 1rem', background: '#1e293b', color: '#e2e8f0', border: '1px solid #475569', borderRadius: '6px', cursor: 'pointer' }}
        >
          ← Back
        </button>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fbbf24' }}>Zodiac Ring</div>
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
          Astronomical Zodiac
        </h1>
        <p style={{ margin: '0.25rem 0 0', color: '#94a3b8' }}>
          <span className="date-kind">Gregorian</span>{' '}
          {gregorianLabel}
          {' · '}
          <span className="date-kind">Mercedonius</span>{' '}
          {mercedoniusLabel}
        </p>
        <p style={{ margin: '0.25rem 0 0', color: '#fbbf24' }}>Sun: {sunSignLine}</p>
      </header>

      <section style={{ marginBottom: '1.5rem' }}>
        <p style={{ color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
          The astronomical zodiac is based on actual IAU constellation boundaries. The Sun's apparent
          annual path crosses 13 constellations, including Ophiuchus; the traditional Western zodiac
          divides the ecliptic into twelve equal 30-degree signs. Click any ring section to focus the
          centre.
        </p>
      </section>

      <ZodiacRing
        selectedDateLabel={gregorianLabel}
        mercedoniusLabel={mercedoniusLabel}
        sunConstellation={dayAstronomy.sunConstellation}
        sunLongitudeDeg={dayAstronomy.sun.eclipticLongitudeDeg}
        focusedName={focusedName}
        onFocusChange={setFocusedName}
      />
    </div>
  );
}