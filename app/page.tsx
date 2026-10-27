'use client';

import React, { useState } from 'react';
import { SplashScreen } from './components/splash-screen';

export default function Calendar() {
  const [termsAccepted, setTermsAccepted] = useState(false);

  if (!termsAccepted) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(4, 7, 18, 0.85)',
          backdropFilter: 'blur(4px)',
          padding: '1rem',
        }}
      >
        <div
          style={{
            background: '#0a0c1a',
            border: '1.5px solid #D4AF37',
            borderRadius: '12px',
            padding: '1.75rem 1.5rem 1.5rem',
            maxWidth: '340px',
            width: '100%',
            color: 'rgba(255,255,255,0.9)',
            fontFamily: "'Cinzel', Georgia, 'Times New Roman', serif",
            boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
            textAlign: 'left',
          }}
        >
          <h3
            style={{
              color: '#D4AF37',
              fontSize: '1rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              margin: '0 0 0.75rem',
            }}
          >
            MERCEDONIUS TERMS &amp; CONDITIONS
          </h3>
          <p
            style={{
              fontSize: '0.8rem',
              lineHeight: 1.6,
              margin: '0 0 1rem',
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            By using this app you accept the Terms &amp; Conditions (v1.0): a
            13-month astronomical calendar with AUC year numbering and
            equinox-anchored year boundaries, computed from live astronomical
            data. It does not replace any civil or legal calendar.
          </p>
          <p
            style={{
              margin: '0 0 1.25rem',
              fontSize: '0.7rem',
              color: 'rgba(255,255,255,0.45)',
            }}
          >
            Read the full terms:{' '}
            <a
              href="/terms"
              style={{ color: '#D4AF37', textDecoration: 'underline' }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms &amp; Conditions
            </a>
            .
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setTermsAccepted(true)}
              style={{
                flex: 1,
                background: '#D4AF37',
                color: '#05070e',
                border: 'none',
                borderRadius: '6px',
                padding: '0.7rem 1rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontFamily: "'Cinzel', Georgia, 'Times New Roman', serif",
                cursor: 'pointer',
              }}
            >
              AGREE
            </button>
            <button
              onClick={() => {
                setTermsAccepted(true);
              }}
              style={{
                flex: 1,
                background: 'transparent',
                color: 'rgba(255,255,255,0.6)',
                border: '1.5px solid rgba(212,175,55,0.35)',
                borderRadius: '6px',
                padding: '0.7rem 1rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontFamily: "'Cinzel', Georgia, 'Times New Roman', serif",
                cursor: 'pointer',
              }}
            >
              DISAGREE
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <SplashScreen />;
}
