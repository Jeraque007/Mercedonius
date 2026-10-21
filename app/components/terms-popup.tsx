'use client';

import React, { useCallback, useEffect, useState } from 'react';

/** Current terms version the acceptance gate is keyed to. */
const TERMS_VERSION = '1.0';
const STORAGE_KEY = 'mercedonius:terms';
const API_BASE = '/api/terms/accept';

interface TermsRecord {
  version: string;
  ip: string;
  at: string;
}

/**
 * Terms acceptance gate.
 *
 * Shown on a fresh load (nothing in localStorage) or when the user's IP
 * address differs from the IP last accepted under (the webservice at
 * /api/terms/accept is consulted for the current IP). Agree records
 * acceptance locally and via the webservice; Disagree shows a
 * "please close the app" notice.
 */
export function TermsPopup() {
  const [show, setShow] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverIp, setServerIp] = useState<string>('');

  const checkAcceptance = useCallback(async () => {
    let stored: TermsRecord | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      stored = raw ? JSON.parse(raw) : null;
    } catch {
      stored = null;
    }

    let ipFromServer = 'unknown';
    let acceptedByIp = false;
    try {
      const res = await fetch(API_BASE, { cache: 'no-store', credentials: 'same-origin' });
      const data = (await res.json()) as { ip?: string; accepted?: boolean; version?: string };
      ipFromServer = String(data.ip ?? 'unknown');
      acceptedByIp =
        Boolean(data.accepted) && String(data.version) === TERMS_VERSION && ipFromServer !== 'unknown';
      setServerIp(ipFromServer);
    } catch {
      // Webservice unreachable (offline / dev): fall back to localStorage only.
      setServerIp('unknown');
    }

    const acceptedByStorage =
      Boolean(
        stored &&
          stored.version === TERMS_VERSION &&
          stored.ip &&
          stored.ip === ipFromServer &&
          ipFromServer !== 'unknown',
      ) || (stored && stored.version === TERMS_VERSION && ipFromServer === 'unknown');

    if (!acceptedByStorage && !acceptedByIp) {
      setShow(true);
    }
  }, []);

  useEffect(() => {
    checkAcceptance();
  }, [checkAcceptance]);

  const handleAgree = async () => {
    setLoading(true);
    try {
      await fetch(API_BASE, {
        method: 'POST',
        cache: 'no-store',
        credentials: 'same-origin',
      });
    } catch {
      // Best effort — localStorage is the durable record; the server
      // re-derives the real IP from the request on POST.
    }
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: TERMS_VERSION,
        ip: serverIp || 'unknown',
        at: new Date().toISOString(),
      }),
    );
    setShow(false);
    setDeclined(false);
    setLoading(false);
  };

  const handleDisagree = () => {
    setShow(false);
    setDeclined(true);
  };

  const reviewAgain = () => {
    setDeclined(false);
    void checkAcceptance();
  };

  if (declined) {
    return (
      <div className="terms-popup" aria-hidden="false" role="dialog" aria-modal="true" aria-label="Terms not accepted">
        <div className="terms-declined">
          <p>
            You have not accepted the MERCEDONIUS Terms &amp; Conditions (v{TERMS_VERSION}).
          </p>
          <p>
            To use this app you must accept the terms. <strong>If you do not accept them, please close the app.</strong>
          </p>
          <button type="button" className="terms-btn terms-btn--agree" onClick={reviewAgain} disabled={loading}>
            Review &amp; accept
          </button>
        </div>
      </div>
    );
  }

  if (!show) return null;

  return (
    <div className="terms-popup" aria-hidden="false" role="dialog" aria-modal="true" aria-label="Terms & Conditions">
      <div className="terms-card">
        <h3>MERCEDONIUS Terms &amp; Conditions</h3>
        <p>
          By using this app you accept the Terms &amp; Conditions (v{TERMS_VERSION}):
          a 13-month astronomical calendar with AUC year numbering and
          equinox-anchored year boundaries, computed from live astronomical
          data. It does not replace any civil or legal calendar.
        </p>
        <p>
          Read the full terms:{' '}
          <a href="/terms" target="_blank" rel="noopener noreferrer">
            Terms &amp; Conditions
          </a>
          .
        </p>
        <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.5rem' }}>
          Acceptance is recorded for this device and IP address via our terms
          service; a new device or new IP will ask again.
        </p>
        <div className="terms-actions">
          <button
            type="button"
            className="terms-btn terms-btn--disagree"
            onClick={handleDisagree}
            disabled={loading}
          >
            Disagree
          </button>
          <button
            type="button"
            className="terms-btn terms-btn--agree"
            onClick={handleAgree}
            disabled={loading}
          >
            I Agree
          </button>
        </div>
      </div>
    </div>
  );
}
