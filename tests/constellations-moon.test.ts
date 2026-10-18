/**
 * Constellation band lookup + moon phase naming/illumination.
 *
 * Regression targets (from production screenshots, 2026-10-18):
 *  - the sundial's Zodiac panel showed "Sun constellation: Libra" at λ≈205°;
 *    the IAU constellation there is Virgo (Libra starts at λ 217.9°).
 *  - the Lunar panel showed "Waxing Crescent 69.9%"; illumination must be
 *    ~50% near first quarter, not ~71% (sine-of-age bug).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { getSunConstellation } from '../lib/astronomy/sun';
import { getMoonPhase } from '../lib/astronomy/moon';

const utc = (iso: string) => new Date(iso);

test('Sun constellation follows real IAU ecliptic bands (13 constellations)', () => {
  // Each date sits mid-band (≥2° from any boundary) to be robust to the
  // engine's apparent-vs-mean longitude nuances.
  const cases: Array<[string, string]> = [
    ['2026-10-18T12:00Z', 'Virgo'], // λ≈205° — the sundial-panel regression
    ['2026-11-05T12:00Z', 'Libra'],
    ['2026-11-26T12:00Z', 'Scorpius'], // narrow ~6° band (Sun spends ~6 days here)
    ['2026-12-05T12:00Z', 'Ophiuchus'],
    ['2026-12-25T12:00Z', 'Sagittarius'],
    ['2026-02-05T12:00Z', 'Capricornus'],
    ['2026-02-25T12:00Z', 'Aquarius'],
    ['2026-03-15T12:00Z', 'Pisces'],
    ['2026-04-30T12:00Z', 'Aries'],
    ['2026-05-20T12:00Z', 'Taurus'],
    ['2026-06-25T12:00Z', 'Gemini'],
    ['2026-07-30T12:00Z', 'Cancer'],
    ['2026-09-01T12:00Z', 'Leo'],
  ];
  for (const [iso, expected] of cases) {
    const { constellationResult } = getSunConstellation(utc(iso));
    assert.equal(
      constellationResult.name,
      expected,
      `${iso}: expected ${expected}, got ${constellationResult.name} (λ=${constellationResult.eclipticLongitudeDeg.toFixed(1)}°)`,
    );
  }
});

test('moon illumination is phase-angle based (0/50/100% at new/quarter/full)', () => {
  // Reference new moon epoch used by the mean model: JD 2451550.1.
  const t0 = (2451550.1 - 2440587.5) * 86400000;
  const cycle = 29.530588853;
  const at = (days: number) => new Date(t0 + days * 86400000);

  const n = getMoonPhase(at(0));
  assert.equal(n.name, 'New Moon');
  assert.ok(Math.abs(n.illumination - 0) <= 0.5, `new: ${n.illumination}%`);

  // The bucket edge sits exactly at cycle/4 — sample just either side of it
  // (exact-edge floats can land a hair under/over).
  const pre = getMoonPhase(at(cycle / 4 - 0.05));
  assert.equal(pre.name, 'Waxing Crescent');
  assert.ok(Math.abs(pre.illumination - 50) <= 1.5, `pre-quarter: ${pre.illumination}%`);

  const q = getMoonPhase(at(cycle / 4 + 0.05));
  assert.equal(q.name, 'First Quarter');
  assert.ok(Math.abs(q.illumination - 50) <= 1.5, `first quarter: ${q.illumination}%`);

  const preF = getMoonPhase(at(cycle / 2 - 0.05));
  assert.equal(preF.name, 'Waxing Gibbous');
  assert.ok(Math.abs(preF.illumination - 100) <= 1, `pre-full: ${preF.illumination}%`);

  const f = getMoonPhase(at(cycle / 2 + 0.05));
  assert.equal(f.name, 'Full Moon');
  assert.ok(Math.abs(f.illumination - 100) <= 1, `full: ${f.illumination}%`);

  const l = getMoonPhase(at((3 * cycle) / 4 + 0.05));
  assert.equal(l.name, 'Last Quarter');
  assert.ok(Math.abs(l.illumination - 50) <= 1.5, `last quarter: ${l.illumination}%`);
});

test('2026-10-18: moon no longer reports ~70% "crescent"', () => {
  const p = getMoonPhase(utc('2026-10-18T12:00Z'));
  assert.ok(p.ageDays > 6.5 && p.ageDays < 7.5, `age: ${p.ageDays} d`);
  // Old sine formula reported 69.9% here; phase-angle formula → ~49%.
  assert.ok(Math.abs(p.illumination - 50) < 5, `illumination: ${p.illumination}%`);
  assert.equal(p.name, 'Waxing Crescent');
});
