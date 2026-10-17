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
      } catch { /* Fonts unavailable — CSS fallback handles it */ } finally {
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
    const resize = () => {
      const p = canvas.parentElement!;
      canvas.width = p.clientWidth;
      canvas.height = p.clientHeight;
      draw();
    };
    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      const S = Math.min(W, H);
      ctx.clearRect(0, 0, W, H);
      const tg = ctx.createLinearGradient(0, 0, 0, 0.24 * H);
      tg.addColorStop(0, 'rgba(4, 7, 18, 0.60)');
      tg.addColorStop(1, 'rgba(4, 7, 18, 0)');
      ctx.fillStyle = tg;
      ctx.fillRect(0, 0, W, 0.24 * H);
      const b1 = ctx.createLinearGradient(0, 0.70 * H, 0, H);
      b1.addColorStop(0, 'transparent');
      b1.addColorStop(1, 'rgba(4, 7, 18, 0.66)');
      ctx.fillStyle = b1;
      ctx.fillRect(0, 0.70 * H, W, H * 0.30);
      const b2 = ctx.createLinearGradient(0, 0.76 * H, 0, H);
      b2.addColorStop(0, 'transparent');
      b2.addColorStop(1, 'rgba(4, 7, 18, 0.72)');
      ctx.fillStyle = b2;
      ctx.fillRect(0, 0.76 * H, W, H * 0.24);
      const text = 'MERCEDONIUS';
      const isLong = text.length >= 10;
      let fontSize = isLong ? 0.064 * S : 0.074 * S;
      const letterSpacing = fontSize * 0.20;
      ctx.font = `900 ${fontSize}px '${FONT_FAMILY}', ${FALLBACK}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      while (
        ctx.measureText(text).width + (text.length - 1) * letterSpacing >
          0.86 * W &&
        fontSize > 10
      ) {
        fontSize -= 1;
        ctx.font = `900 ${fontSize}px '${FONT_FAMILY}', ${FALLBACK}`;
      }
      const x = W / 2;
      const y = 0.895 * H;
      const textStartX =
        x -
        (ctx.measureText(text).width + (text.length - 1) * letterSpacing) / 2;
      const drawRun = (fillAlpha: number) => {
        ctx.save();
        ctx.strokeStyle = 'rgba(7, 11, 26, 0.92)';
        ctx.lineWidth = Math.max(fontSize * 0.13, 2);
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        let cx = textStartX;
        for (let i = 0; i < text.length; i++) {
          const ch = text[i];
          ctx.strokeText(ch, cx, y);
          cx += ctx.measureText(ch).width + letterSpacing;
        }
        ctx.restore();
        ctx.save();
        const grad = ctx.createLinearGradient(0, y - 0.55 * fontSize, 0, y + 0.55 * fontSize);
        grad.addColorStop(0.00, '#FFF8DC');
        grad.addColorStop(0.45, '#F6DC9A');
        grad.addColorStop(0.75, '#E3AC55');
        grad.addColorStop(1.00, '#C68A2E');
        ctx.fillStyle = grad;
        ctx.shadowColor = `rgba(255, 196, 96, ${fillAlpha})`;
        ctx.shadowBlur = fontSize * 0.38;
        cx = textStartX;
        for (let i = 0; i < text.length; i++) {
          const ch = text[i];
          ctx.fillText(ch, cx, y);
          cx += ctx.measureText(ch).width + letterSpacing;
        }
        ctx.restore();
      };
      drawRun(0.65);
      drawRun(0.35);
      const ocy = 0.838 * H;
      const ohl = 0.13 * S;
      const ocx = x;
      ctx.save();
      ctx.strokeStyle = 'rgba(242, 214, 150, 0.95)';
      ctx.fillStyle = 'rgba(242, 214, 150, 0.95)';
      ctx.shadowColor = 'rgba(255, 195, 100, 0.5)';
      ctx.shadowBlur = 8;
      ctx.lineWidth = Math.max(2, ohl * 0.018);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(ocx - ohl, ocy);
      ctx.lineTo(ocx + ohl, ocy);
      ctx.stroke();
      const dsz = Math.max(6, ohl * 0.075);
      ctx.beginPath();
      ctx.moveTo(ocx, ocy - dsz);
      ctx.lineTo(ocx + dsz, ocy);
      ctx.lineTo(ocx, ocy + dsz);
      ctx.lineTo(ocx - dsz, ocy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(ocx - ohl, ocy, 2.4, 0, Math.PI * 2);
      ctx.arc(ocx + ohl, ocy, 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      rafId = requestAnimationFrame(draw);
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
    <div className="splash-screen" style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', width: '100%' }}>
      <canvas ref={canvasRef} className="splash-canvas" style={{ position: 'absolute', inset: 0, zIndex: 0, width: '100%', height: '100%', display: 'block' }} />
      <div className="splash-content" style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '2rem', width: '100%', height: '100%', boxSizing: 'border-box' }}>
        <p className="splash-body" style={{ margin: 0, marginBottom: '1.25rem', fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
          You have been waiting for this evolution for more than 2000 years.
        </p>
        <button
          type="button"
          className="splash-welcome-btn"
          onClick={goWelcome}
          aria-label="Enter the Mercedonius calendar"
          style={{ marginTop: 'auto', marginBottom: '2rem' }}
        >
          welcome
        </button>
      </div>
    </div>
  );
}

