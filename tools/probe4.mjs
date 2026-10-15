import * as AstronomyEsm from 'astronomy-engine';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const AstronomyCjs = require('astronomy-engine');

function sph(v) {
  const ra = Math.atan2(v.y, v.x);
  const dec = Math.asin(v.z / Math.hypot(v.x, v.y, v.z));
  return { raH: ((((ra * 180 / Math.PI) % 360) + 360) % 360) / 15, dec: (dec * 180 / Math.PI) };
}
function vec(raH, decDeg) {
  const ra = raH * 15 * Math.PI / 180, dec = decDeg * Math.PI / 180;
  return { x: Math.cos(dec) * Math.cos(ra), y: Math.cos(dec) * Math.sin(ra), z: Math.sin(dec) };
}
const vega = vec(18.6156, 38.7836);

// --- CJS build test (its own AstroTime instance) ---
const tC = AstronomyCjs.MakeTime(Date.UTC(2026, 0, 1));
const vC = AstronomyCjs.RotateVector(AstronomyCjs.Rotation_EQJ_EQD(tC), vega);
console.log('CJS Vega EQJ->EQD(2026):', JSON.stringify(sph(vC)));

// CJS identity check at J2000
const tJ = AstronomyCjs.MakeTime(Date.UTC(2000, 0, 1, 12));
const poleC = AstronomyCjs.RotateVector(AstronomyCjs.Rotation_EQJ_EQD(tJ), { x: 0, y: 0, z: 1 });
console.log('CJS pole at J2000 ->', poleC.x.toFixed(6), poleC.y.toFixed(6), poleC.z.toFixed(6), '(expect ~0 0 1)');

// --- ESM static matrix (no time argument) ---
const ecl = AstronomyEsm.Rotation_EQJ_ECL();
console.log('ESM Rotation_EQJ_ECL matrix row0:', ecl.rot[0].map((x) => x.toFixed(6)).join(' '));

// --- ESM SunPosition sanity ---
const sun = AstronomyEsm.SunPosition(Date.UTC(2026, 0, 1, 12));
console.log('ESM SunPosition 2026-01-01: lon=', sun.elon.toFixed(4), 'lat=', sun.elat.toFixed(4), '(expect lon ~280.1, lat ~0)');

// --- ESM Equator/Moon sanity ---
const eq = AstronomyEsm.Equator(AstronomyEsm.Body.Sun, Date.UTC(2026, 0, 1, 12), new AstronomyEsm.Observer(0, 0, 0), false, true);
console.log('ESM Sun EQJ RA/dec:', eq.ra.toFixed(4), eq.dec.toFixed(4), '(expect RA ~18.9h, dec ~-23)');
