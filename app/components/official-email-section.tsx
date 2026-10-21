'use client';

/**
 * Official Email Address (under My Sky)
 * ======================================
 * A real, authentic email address used for birthday celebration and
 * reminders (Terms §9). Generic or fictitious addresses are rejected.
 * Stored in localStorage only — never sent anywhere by this build.
 */

import React, { useEffect, useState } from 'react';

const GENERIC_OR_FICTITIOUS_DOMAINS = new Set([
  'example.com',
  'example.org',
  'example.net',
  'example.edu',
  'example.co',
  'test.com',
  'test.org',
  'mailinator.com',
  'guerrillamail.com',
  '10minutemail.com',
  'yopmail.com',
  'tempmail.com',
  'temp-mail.org',
  'fakeinbox.com',
  'dispostable.com',
  'maildrop.cc',
  'trashmail.com',
  'getnada.com',
]);

const EMAIL_FORMAT = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function looksGenericOrFictitious(email: string): boolean {
  const match = EMAIL_FORMAT.exec(email.trim());
  if (!match) return true;
  const domain = match[1].toLowerCase();
  if (GENERIC_OR_FICTITIOUS_DOMAINS.has(domain)) return true;
  if (domain.endsWith('.test') || domain.endsWith('.invalid') || domain.endsWith('.localhost'))
    return true;
  return domain.includes('example');
}

export function OfficialEmailSection() {
  const [email, setEmail] = useState('');
  const [confirm, setConfirm] = useState('');
  const [emailOnFile, setEmailOnFile] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('mercedonius:officialEmail');
      setEmailOnFile(stored || null);
    } catch {
      setEmailOnFile(null);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('An email address is required.');
      return;
    }
    if (!EMAIL_FORMAT.exec(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (looksGenericOrFictitious(email.trim())) {
      setError(
        'Please enter a real, authentic email address — generic or fictitious addresses are not accepted.',
      );
      return;
    }
    if (confirm.trim() !== email.trim()) {
      setError('The confirmation does not match the email address.');
      return;
    }

    setStatus('saving');
    try {
      localStorage.setItem('mercedonius:officialEmail', email.trim());
      setEmailOnFile(email.trim());
      setStatus('saved');
      setConfirm('');
    } catch {
      setStatus('error');
      setError('Could not save the email address.');
    }
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <h2
        style={{
          color: '#fbbf24',
          margin: '0 0 0.75rem',
          fontSize: '1.1rem',
        }}
      >
        Official Email Address
      </h2>
      <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
        Add a real, authentic email address for birthday celebration and
        reminders (Terms §9). Generic or fictitious addresses are not accepted.
      </p>
      {emailOnFile && (
        <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
          On file:{' '}
          <strong style={{ color: '#f0d060' }}>{emailOnFile}</strong>
        </p>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxWidth: 360 }}>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            background: '#0f172a',
            border: '1px solid #475569',
            borderRadius: '6px',
            color: '#e2e8f0',
            fontSize: '0.9rem',
          }}
        />
        <input
          type="email"
          placeholder="Confirm email address"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            background: '#0f172a',
            border: '1px solid #475569',
            borderRadius: '6px',
            color: '#e2e8f0',
            fontSize: '0.9rem',
          }}
        />
        {error && (
          <p style={{ color: '#f87171', fontSize: '0.8rem', margin: 0 }}>{error}</p>
        )}
        <button
          type="submit"
          disabled={status === 'saving'}
          style={{
            padding: '0.6rem 1rem',
            background: status === 'saved' ? '#334155' : '#fbbf24',
            color: status === 'saved' ? '#e2e8f0' : '#0f172a',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 700,
            cursor: status === 'saving' ? 'default' : 'pointer',
            fontSize: '0.9rem',
          }}
        >
          {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved' : 'Save email address'}
        </button>
        {status === 'saved' && (
          <p style={{ color: '#4ade80', fontSize: '0.85rem', margin: 0 }}>
            Stored for birthday celebration and reminders.
          </p>
        )}
      </form>
    </div>
  );
}
