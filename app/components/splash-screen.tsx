'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext.jsx';
import { processPayment, submitPayFastForm } from '../services/PaymentEngine.js';

const FONT_700_URL = '/scratch/cinzel-700.woff2';
const FONT_900_URL = '/scratch/cinzel-900.woff2';
const FONT_FAMILY = 'Cinzel';
const FALLBACK = "Georgia, 'Times New Roman', serif";

export function SplashScreen() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        const f700 = new FontFace(FONT_FAMILY, `url(${FONT_700_URL})`, { weight: '700', style: 'normal' });
        const f900 = new FontFace(FONT_FAMILY, `url(${FONT_900_URL})`, { weight: '900', style: 'normal' });
        await Promise.all([f700.load(), f900.load()]);
        document.fonts.add(f700);
        document.fonts.add(f900);
      } catch { /* Fonts unavailable � CSS fallback handles it */ } finally {
        setFontsReady(true);
      }
    };
    loadFonts();
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !fontsReady) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let rafId: number;

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      const S = Math.min(W, H);
      ctx.clearRect(0, 0, W, H);

      // Gradient block at top
      const tg = ctx.createLinearGradient(0, 0, 0, 0.24 * H);
      tg.addColorStop(0, 'rgba(4, 7, 18, 0.65)');
      tg.addColorStop(1, 'rgba(4, 7, 18, 0)');
      ctx.fillStyle = tg;
      ctx.fillRect(0, 0, W, 0.24 * H);

      // Bottom gradient
      const b1 = ctx.createLinearGradient(0, 0.68 * H, 0, H);
      b1.addColorStop(0, 'transparent');
      b1.addColorStop(1, 'rgba(4, 7, 18, 0.60)');
      ctx.fillStyle = b1;
      ctx.fillRect(0, 0.68 * H, W, H * 0.32);

      // Second bottom gradient
      const b2 = ctx.createLinearGradient(0, 0.70 * H, 0, H);
      b2.addColorStop(0, 'transparent');
      b2.addColorStop(1, 'rgba(4, 7, 18, 0.30)');
      ctx.fillStyle = b2;
      ctx.fillRect(0, 0.70 * H, W, H * 0.30);

      // Cinematic shimmer
      const t = Date.now() / 5000;
      const glow = 0.08 + 0.03 * Math.sin(t * 1.3);
      const shimmer = ctx.createLinearGradient(0, 0, W, H);
      shimmer.addColorStop(0, 'rgba(255,255,255,0)');
      shimmer.addColorStop(0.4, 'rgba(255,255,255,0)');
      shimmer.addColorStop(1, 'rgba(255,255,255,' + glow + ')');
      ctx.fillStyle = shimmer;
      ctx.fillRect(0, 0, W, H);

      // Ambient light sweep
      const sweep = ctx.createLinearGradient(W, 0, 0, H);
      sweep.addColorStop(0, 'rgba(255,255,255,' + (glow * 0.5) + ')');
      sweep.addColorStop(0.5, 'rgba(255,255,255,0)');
      sweep.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = sweep;
      ctx.fillRect(0, 0, W, H);

      rafId = requestAnimationFrame(draw);
    };

    const resize = () => {
      const parent = canvasRef.current?.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      draw();
    };

    resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [fontsReady]);

  const goWelcome = () => router.push('/calendar');

  const { goTo, setIsPaid, isPaid, user } = useApp();
  // ── Payment state ──
  const [payingPlan, setPayingPlan] = useState<'monthly' | 'annual' | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const [paySubmitting, setPaySubmitting] = useState(false);

  const initiatePayment = async (planId: 'monthly' | 'annual') => {
    setPayError(null);
    setPayingPlan(planId);
    setPaySubmitting(true);
    const plan = {
      id: planId,
      name: planId === 'annual' ? 'Annual Subscription' : 'Monthly Subscription',
    };
    try {
      const result = await processPayment(plan, user, {
        onSuccess: (res: any) => {
          // Offline simulation: mark paid immediately, no external host.
          if (res && res.mode === 'test') {
            setIsPaid(true);
            setPaySubmitting(false);
            goTo('calendar');
            return;
          }

        },
        onError: (msg: any) => {
          setPayError(msg);
          setPaySubmitting(false);
          setPayingPlan(null);
        },
      });

      // sandbox / real: PayFast returned form fields + gateway action.
      // Auto-submit the form to the PayFast gateway.
      if (result && result.fields && result.action) {
        submitPayFastForm(result.fields, result.action);
        setPaySubmitting(false);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Payment setup failed';
      setPayError(msg);
      setPaySubmitting(false);
      setPayingPlan(null);
    }
  };




  return (
    <>
      <div
      className="splash-screen"
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        background: 'radial-gradient(1200px 800px at 50% 20%, rgba(4,7,18,0.4), transparent 60%), radial-gradient(1000px 600px at 80% 80%, rgba(120,80,30,0.25), transparent 60%)',
      }}
    >
      {/* Visible astrolabe background image */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          backgroundImage: "url('/background.png')",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center 45%',
          backgroundSize: 'cover',
          opacity: 0.6,
          filter: 'blur(5px) saturate(1.05)',
        }}
      />
      {/* Vignette scrim — keeps text readable over the astrolabe */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at 50% 45%, rgba(4,7,18,0.68) 0%, rgba(4,7,18,0.55) 40%, rgba(4,7,18,0.85) 75%, rgba(10,10,18,0.97) 100%)',
        }}
      />
      {/* Subtle atmospheric gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 2,
          background:
            'radial-gradient(circle at 12% 18%, rgba(255,240,200,0.03), transparent 35%), radial-gradient(circle at 88% 82%, rgba(180,140,80,0.08), transparent 50%)',
        }}
      />
      {/* Base canvas */}
      <canvas
        ref={canvasRef}
        className="splash-canvas"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 3,
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
      {/* Content — flows naturally, browser scroll handles it */}
      <div
        className="splash-content"
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '2rem 1rem 6rem 1rem',
          paddingTop: '3rem',
          boxSizing: 'border-box',
          width: '100%',
          maxWidth: '700px',
          margin: '0 auto',
        }}
      >
        <h1
          className="heading-gold text-cinzel-900"
          data-text="MERCEDONIUS"
          style={{
            margin: 0,
            marginBottom: '1.75rem',
            fontSize: '2.5rem',
            letterSpacing: '0.2em',
          }}
        >
          MERCEDONIUS
        </h1>
        <h2
          className="splash-title"
          style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}
        >
          This is by far no ordinary <span className="splash-emphasis">&quot;Calendar&quot;</span>
        </h2>
        <p className="splash-body">
          You have been waiting for this evolution for more than 2000 years. This
          technology spans lifetimes and dates back to pre-antlantean.
        </p>
        <p className="splash-body">
          There are several versions available, but none as complete and
          intentionally designed that you could actually merge with your daily
          life to offer the structure, guidance, and support to bring your
          integral essence into alignment with what and who you are eternally,
          spiritually, and cosmically.
        </p>
        <p className="splash-invite">
          You are invited to journey further into this biosphere —{' '}
          <span className="splash-welcome">&quot;welcome&quot;</span>.
        </p>
        <button
          type="button"
          className="splash-welcome-btn"
          onClick={goWelcome}
          aria-label="Enter the Mercedonius calendar"
          style={{ textTransform: 'none', marginTop: '0.5rem' }}
        >
          Welcome
        </button>

        {/* Two gold price buttons — Monthly / Annual */}
        <div
          className="splash-price-section"
          style={{
            marginTop: '2.5rem',
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            className="splash-price-btn splash-price-monthly"
            disabled={paySubmitting}
            onClick={() => initiatePayment('monthly')}
            aria-label="Monthly subscription — $2.99/month"
            style={{
              background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))',
              border: '1.5px solid #D4AF37',
              color: '#f0d060',
              padding: '0.85rem 2rem',
              fontSize: '1rem',
              fontFamily: "'Cinzel', Georgia, 'Times New Roman', serif",
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              const t = e.target as HTMLButtonElement;
              t.style.background = 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.1))';
              t.style.color = '#fff';
              t.style.boxShadow = '0 0 25px rgba(212,175,55,0.4)';
            }}
            onMouseLeave={(e) => {
              const t = e.target as HTMLButtonElement;
              t.style.background = 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))';
              t.style.color = '#f0d060';
              t.style.boxShadow = 'none';
            }}
          >
            Monthly — $2.99
          </button>
          <button
            type="button"
            className="splash-price-btn splash-price-annual"
            disabled={paySubmitting}
            onClick={() => initiatePayment('annual')}
            aria-label="Annual subscription — $39.99/year"
            style={{
              background: 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.1))',
              border: '1.5px solid #f0d060',
              color: '#fff',
              padding: '0.85rem 2rem',
              fontSize: '1rem',
              fontFamily: "'Cinzel', Georgia, 'Times New Roman', serif",
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textDecoration: 'none',
              boxShadow: '0 0 25px rgba(212,175,55,0.4)',
            }}
            onMouseEnter={(e) => {
              const t = e.target as HTMLButtonElement;
              t.style.background = 'linear-gradient(135deg, rgba(212,175,55,0.35), rgba(212,175,55,0.15))';
              t.style.boxShadow = '0 0 35px rgba(212,175,55,0.6)';
            }}
            onMouseLeave={(e) => {
              const t = e.target as HTMLButtonElement;
              t.style.background = 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.1))';
              t.style.boxShadow = '0 0 25px rgba(212,175,55,0.4)';
            }}
          >
            Annual — $39.99
          </button>
        </div>

        {/* ── Dedicated secure payment trust badge (clickable, styled like PaymentScreen) ── */}
        <button
          type="button"
          className="splash-secure-pay-btn"
          disabled={paySubmitting}
          onClick={() => {
            const plan = payingPlan || 'monthly';
            initiatePayment(plan as 'monthly' | 'annual');
          }}
          aria-label="Proceed to secure payment"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '1.5rem 1rem',
            border: '1px solid rgba(212,175,55,0.25)',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(212,175,55,0.03))',
            color: '#fff',
            cursor: paySubmitting ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            width: '100%',
            maxWidth: '320px',
            opacity: paySubmitting ? 0.6 : 1,
            textAlign: 'center',
          }}
          onMouseEnter={(e) => {
            if (paySubmitting) return;
            const t = e.target as HTMLButtonElement;
            t.style.borderColor = 'rgba(212,175,55,0.5)';
            t.style.background = 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.08))';
            t.style.boxShadow = '0 0 30px rgba(212,175,55,0.4)';
          }}
          onMouseLeave={(e) => {
            if (paySubmitting) return;
            const t = e.target as HTMLButtonElement;
            t.style.borderColor = 'rgba(212,175,55,0.25)';
            t.style.background = 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(212,175,55,0.03))';
            t.style.boxShadow = 'none';
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span
              className="font-cinzel"
              style={{
                fontSize: '11px',
                letterSpacing: '0.15em',
                color: '#D4AF37',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Secure Payment
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          </div>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '0.85rem',
              color: 'rgba(255,255,255,0.7)',
              fontStyle: 'italic',
              margin: 0,
            }}
          >
            Protected by PayFast
          </p>
          <p
            style={{
              fontFamily: "'Cinzel', Georgia, 'Times New Roman', serif",
              fontSize: '9px',
              letterSpacing: '0.2em',
              color: 'rgba(255,255,255,0.4)',
              marginTop: '0.25rem',
              textTransform: 'uppercase',
              fontWeight: 400,
            }}
          >
            PCI-DSS Compliant • 256-bit SSL Encryption
          </p>
          {paySubmitting && (
            <span style={{ fontSize: '0.8rem', color: '#D4AF37', marginTop: '0.5rem' }}>
              Processing…
            </span>
          )}
        </button>
        {payError && (
          <p style={{
            color: '#f87171',
            marginTop: '1rem',
            fontSize: '0.85rem',
            fontWeight: 500,
            textAlign: 'center',
          }}>
            {payError}
          </p>
        )}
      </div>
    </div>
    </>
  );
}
