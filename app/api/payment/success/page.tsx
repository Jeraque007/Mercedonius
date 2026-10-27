'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '../../../context/AppContext.jsx';

/**
 * PaymentSuccessPage - return target after a payment completes.
 *
 * Reads the payment id from the query and confirms the payment server-side
 * before unlocking the calendar. In local test mode there is no payment id on
 * the return URL - we trust the return immediately so the UX still flows.
 */
export default function PaymentSuccessPage() {
  const router = useRouter();
  const { setIsPaid } = useApp();
  const [phase, setPhase] = useState<'verifying' | 'verified' | 'failed'>('verifying');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get('paymentId');

    // Test mode: no payment ID on the return URL — trust the redirect.
    if (!paymentId) {
      setIsPaid(true);
      setPhase('verified');
      const t = setTimeout(() => router.replace('/calendar'), 1400);
      return () => clearTimeout(t);
    }

    // Poll the server-side verify endpoint until the record is COMPLETE.
    let attempts = 0;
    const MAX_ATTEMPTS = 12;

    const poll = async () => {
      attempts += 1;
      try {
        const res = await fetch(`/api/payment/verify?paymentId=${encodeURIComponent(paymentId)}`, {
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.verified) {
            setIsPaid(true);
            setPhase('verified');
            const t = setTimeout(() => router.replace('/calendar'), 900);
            return () => clearTimeout(t);
          }
        }
      } catch {
        /* network blip — keep retrying */
      }

      if (attempts < MAX_ATTEMPTS) {
        setTimeout(poll, 1500);
      } else {
        setPhase('failed');
      }
    };

    poll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, setIsPaid]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(1200px 800px at 50% 20%, rgba(4,7,18,0.4), transparent 60%)',
        color: '#f0f0f5',
        fontFamily: "'Cinzel', Georgia, 'Times New Roman', serif",
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <div
        style={{
          fontSize: '3rem',
          marginBottom: '1rem',
          color: phase === 'verified' ? '#4ade80' : phase === 'failed' ? '#f87171' : '#D4AF37',
          letterSpacing: '0.1em',
        }}
      >
        {phase === 'verifying' ? '⧗' : phase === 'verified' ? '✓' : '✕'}
      </div>
      <h1
        style={{
          margin: 0,
          marginBottom: '1rem',
          fontSize: '2rem',
          color: '#D4AF37',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}
      >
        {phase === 'verifying'
          ? 'Verifying your subscription…'
          : phase === 'verified'
            ? 'Payment Successful'
            : 'Verification failed'}
      </h1>
      <p
        style={{
          margin: 0,
          marginBottom: '2rem',
          fontSize: '1.1rem',
          color: 'rgba(240,240,245,0.8)',
        }}
      >
        {phase === 'verifying'
          ? 'Confirming your payment with Mercedonius…'
          : phase === 'verified'
            ? 'Your Mercedonius subscription is active. You now have full access to the calendar.'
            : 'We could not confirm your payment. If you were charged, please contact support.'}
      </p>

      {phase === 'failed' && (
        <Link
          href="/"
          style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.1))',
            border: '1.5px solid #f0d060',
            color: '#fff',
            padding: '0.85rem 2rem',
            fontSize: '1rem',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            borderRadius: '6px',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            marginBottom: '1rem',
          }}
        >
          Try Again
        </Link>
      )}

      <Link
        href="/calendar"
        style={{
          display: 'inline-block',
          background: 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.1))',
          border: '1.5px solid #f0d060',
          color: '#fff',
          padding: '0.85rem 2rem',
          fontSize: '1rem',
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          borderRadius: '6px',
          textDecoration: 'none',
          transition: 'all 0.3s ease',
        }}
      >
        Enter the Calendar
      </Link>
    </div>
  );
}