/**
 * Tests for seasonal instants + hemisphere-aware display helpers.
 *
 * Run: npx tsx --test tests/seasons.test.ts
 *
 * Covers: the 2026 equinox/solstice instants (regression: the crossing finder
 * once returned nothing for windows ≥ 1 year), northern→southern season and
 * label flipping (an October southern-hemisphere observer must see SPRING),
 * and the time-zone hemisphere heuristic.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  getSeasonalInstants,
  seasonForHemisphere,
  seasonalDisplayForHemisphere,
  isLikelySouthernTimeZone,
} from '../lib/astronomy/seasons';

/** Published mean equinox/solstice instants 2026 (UTC), ±20 min tolerance. */
const PUBLISHED_2026: Array<{ label: string; utc: string }> = [
  { label: 'Vernal Equinox (Spring)', utc: '2026-03-20T14:46' },
  { label: 'Summer Solstice (Summer)', utc: '2026-06-21T08:24' },
  { label: 'Autumnal Equinox (Autumn)', utc: '2026-09-23T00:05' },
  { label: 'Winter Solstice (Winter)', utc: '2026-12-21T20:50' },
];

describe('getSeasonalInstants', () => {
  test('2026 yields four instants within 20 minutes of published times', () => {
    const instants = getSeasonalInstants(2026);
    assert.equal(instants.length, 4);
    instants.forEach((s, i) => {
      assert.equal(s.label, PUBLISHED_2026[i].label);
      const published = Date.parse(`${PUBLISHED_2026[i].utc}:00Z`);
      const diffMin = Math.abs(s.instant.getTime() - published) / 60000;
      assert.ok(diffMin <= 20, `${s.label}: off by ${diffMin.toFixed(1)} min`);
    });
  });

  test('regression: aggregating multi-year windows still yields every instant', () => {
    // The old full-window sign check failed on windows ≥ 1 year (λ wraps),
    // which once made 3-year aggregation return nothing.
    const all = [
      ...getSeasonalInstants(2025),
      ...getSeasonalInstants(2026),
      ...getSeasonalInstants(2027),
    ];
    assert.equal(all.length, 12);
  });
});

describe('hemisphere-aware seasons', () => {
  test('flip mapping (northern → southern)', () => {
    assert.equal(seasonForHemisphere('Spring', false), 'Spring');
    assert.equal(seasonForHemisphere('Spring', true), 'Autumn');
    assert.equal(seasonForHemisphere('Autumn', true), 'Spring');
    assert.equal(seasonForHemisphere('Summer', true), 'Winter');
    assert.equal(seasonForHemisphere('Winter', true), 'Summer');
  });

  test('southern labels: March equinox = autumnal, December solstice = summer', () => {
    const instants = getSeasonalInstants(2026);
    const mar = instants[0];
    const dec = instants[3];
    assert.equal(seasonalDisplayForHemisphere(mar, true).label, 'Autumnal Equinox (Autumn)');
    assert.equal(seasonalDisplayForHemisphere(dec, true).label, 'Summer Solstice (Summer)');
    // Northern display is unchanged.
    assert.equal(seasonalDisplayForHemisphere(mar, false).label, mar.label);
  });

  test('Oct 18 2026: last instant is the September equinox → Spring in the south', () => {
    const instants = getSeasonalInstants(2026);
    const oct18 = Date.parse('2026-10-18T00:00:00Z');
    const last = instants.filter((s) => s.instant.getTime() <= oct18).pop();
    assert.ok(last, 'a seasonal instant must precede Oct 18');
    assert.equal(last.season, 'Autumn'); // northern convention
    assert.equal(seasonForHemisphere(last.season, true), 'Spring'); // southern observer
  });
});

describe('isLikelySouthernTimeZone (heuristic)', () => {
  const southern = [
    'Africa/Johannesburg', 'Australia/Sydney', 'Pacific/Auckland',
    'America/Sao_Paulo', 'America/Argentina/Buenos_Aires', 'America/Santiago',
    'Indian/Antananarivo', 'Antarctica/Troll',
  ];
  const northern = [
    'UTC', 'Europe/London', 'America/New_York', 'Asia/Tokyo',
    'Africa/Cairo', 'Africa/Lagos', 'America/Denver', 'Asia/Kolkata',
  ];
  southern.forEach((tz) =>
    test(`${tz} → southern`, () => assert.equal(isLikelySouthernTimeZone(tz), true))
  );
  northern.forEach((tz) =>
    test(`${tz} → not southern`, () => assert.equal(isLikelySouthernTimeZone(tz), false))
  );
});