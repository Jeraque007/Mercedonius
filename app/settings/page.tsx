'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LocationPicker } from '../components/location-picker';
import { useSettings } from '../components/settings-context';
import type { ViewMode, ZodiacSystem } from '../components/settings-context';

export default function SettingsPage(): JSX.Element {
  const router = useRouter();
  const { location, setLocation, viewMode, setViewMode, zodiacSystem, setZodiacSystem } =
    useSettings();

  const goBack = () => router.push('/calendar');

  const VIEW_MODES: Array<{ value: ViewMode; label: string }> = [
    { value: 'dual', label: 'Dual (13-Month + Gregorian)' },
    { value: 'gregorian', label: 'Gregorian Only' },
    { value: 'mercedonius', label: '13-Month Only' },
  ];

  const ZODIAC_SYSTEMS: Array<{ value: ZodiacSystem; label: string }> = [
    { value: 'iau', label: 'IAU Astronomical Constellations' },
    { value: 'tropical', label: 'Tropical Zodiac (Western Astrology)' },
    { value: 'vedic', label: 'Sidereal / Vedic (Lahiri Ayanamsa)' },
  ];

  return (
    <div className="settings-page page-container" style={{ padding: '1.5rem', maxWidth: 900, margin: '0 auto', minHeight: '100vh' }}>
      <nav className="page-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #334155' }}>
        <button
          type="button"
          onClick={goBack}
          className="nav-btn"
          style={{ padding: '0.5rem 1rem', background: '#1e293b', color: '#e2e8f0', border: '1px solid #475569', borderRadius: '6px', cursor: 'pointer' }}
        >
          ← Back
        </button>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fbbf24' }}>Settings</div>
      </nav>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#fbbf24', marginBottom: '1rem' }}>Location</h2>
        <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
          Choose your observation location. The time zone drives civil-date boundaries and local clock
          display; the coordinates drive rise/set and sky visibility.
        </p>
        <LocationPicker location={location} onChange={setLocation} />
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#fbbf24', marginBottom: '1rem' }}>Calendar View Mode</h2>
        <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
          Choose which calendar grid the calendar page displays.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {VIEW_MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setViewMode(m.value)}
              style={{
                padding: '0.5rem 1rem',
                background: viewMode === m.value ? '#fbbf24' : '#1e293b',
                color: viewMode === m.value ? '#0f172a' : '#e2e8f0',
                border: '1px solid #475569',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: viewMode === m.value ? 700 : 400,
                fontSize: '0.85rem',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#fbbf24', marginBottom: '1rem' }}>Zodiac System</h2>
        <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
          Choose which zodiac system is shown alongside the Sun's position. This affects the
          Comparison Panel, Zodiac Ring, My Sky, and Rising Info displays.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {ZODIAC_SYSTEMS.map((z) => (
            <button
              key={z.value}
              type="button"
              onClick={() => setZodiacSystem(z.value)}
              style={{
                padding: '0.5rem 1rem',
                background: zodiacSystem === z.value ? '#fbbf24' : '#1e293b',
                color: zodiacSystem === z.value ? '#0f172a' : '#e2e8f0',
                border: '1px solid #475569',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: zodiacSystem === z.value ? 700 : 400,
                fontSize: '0.85rem',
              }}
            >
              {z.label}
            </button>
          ))}
        </div>
        <p style={{ marginTop: '1rem', color: '#94a3b8', fontSize: '0.875rem' }}>
          Note: All three systems (IAU, Tropical, Sidereal/Vedic) read the same ecliptic
          longitude — they differ only in how they segment it into constellations/signs.
        </p>
      </section>

      <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #334155', color: '#94a3b8', fontSize: '0.875rem' }}>
        <p>Preferences apply across all pages in this session and reset on reload.</p>
      </div>
    </div>
  );
}