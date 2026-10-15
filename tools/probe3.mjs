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

const t = AstronomyEsm.MakeTime(Date.UTC(2026, 0, 1));
const vega = vec(18.6156, 38.7836); // EQJ

const esm = AstronomyEsm.RotateVector(AstronomyEsm.Rotation_EQJ_EQD(t), vega);
console.log('ESM Vega EQJ->EQD(2026):', JSON.stringify(sph(esm)));
const cjs = AstronomyCjs.RotateVector(AstronomyCjs.Rotation_EQJ_EQD(t), vega);
console.log('CJS Vega EQJ->EQD(2026):', JSON.stringify(sph(cjs)));
console.log('expect ~ {raH: 18.62, dec: 38.785} (barely moved)');

console.log('ESM matrix[0]:', AstronomyEsm.Rotation_EQJ_EQD(t).rot[0].map((x) => x.toFixed(6)).join(' '));
console.log('CJS matrix[0]:', AstronomyCjs.Rotation_EQJ_EQD(t).rot[0].map((x) => x.toFixed(6)).join(' '));
