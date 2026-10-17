'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

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
      const p = canvas.parentElement!;
      canvas.width = p.clientWidth;
      canvas.height = p.clientHeight;
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

  return (
    <div
      className="splash-screen"
      style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh',
        width: '100%',
        background: 'radial-gradient(1200px 800px at 50% 20%, rgba(4,7,18,0.4), transparent 60%), radial-gradient(1000px 600px at 80% 80%, rgba(120,80,30,0.25), transparent 60%)',
      }}
    >
      {/* Subtle atmospheric gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
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
          zIndex: 0,
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
      {/* Content � quote at top, button stacked at bottom */}
      <div
        className="splash-content"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          textAlign: 'center',
          padding: '2rem',
          paddingTop: '4rem',
          paddingBottom: '4rem',
          boxSizing: 'border-box',
        }}
      >
        <p
          className="splash-body"
          style={{
            margin: 0,
            marginBottom: '2.25rem',
            fontSize: '1.1rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.8',
          }}
        >
          You have been waiting for this evolution for more than 2000 years.
        </p>
        <button
          type="button"
          className="splash-welcome-btn"
          onClick={goWelcome}
          aria-label="Enter the Mercedonius calendar"
          style={{ marginTop: 'auto', marginBottom: '3rem' }}
        >
          welcome
        </button>
      </div>
    </div>
  );
}
