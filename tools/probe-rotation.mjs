import * as Astronomy from 'astronomy-engine';

const t = Astronomy.MakeTime(Date.UTC(1875, 0, 1, 12, 0, 0));
const R = Astronomy.Rotation_EQJ_EQD(t);
console.log('Rotation_EQJ_EQD(1875) matrix:');
console.log(R.rot.map((row) => row.map((x) => x.toFixed(6)).join(' ')).join('\n'));

const pole = { x: 0, y: 0, z: 1 };
const r1 = Astronomy.RotateVector(R, pole);
console.log('RotateVector(J2000 pole) =', r1.x.toFixed(6), r1.y.toFixed(6), r1.z.toFixed(6));
console.log('  (expect z ~ 0.99997, i.e. pole moved only ~0.4 deg)');

// manual both conventions
const m = R.rot;
const mv = [
  m[0][0] * 0 + m[0][1] * 0 + m[0][2] * 1,
  m[1][0] * 0 + m[1][1] * 0 + m[1][2] * 1,
  m[2][0] * 0 + m[2][1] * 0 + m[2][2] * 1,
];
console.log('manual M*v pole =', mv.map((x) => x.toFixed(6)).join(' '));

// equatorial point test via library RotateVector
function vec(raH, decDeg) {
  const ra = raH * 15 * Math.PI / 180, dec = decDeg * Math.PI / 180;
  return { x: Math.cos(dec) * Math.cos(ra), y: Math.cos(dec) * Math.sin(ra), z: Math.sin(dec) };
}
function sph(v) {
  const ra = Math.atan2(v.y, v.x);
  const dec = Math.asin(v.z / Math.hypot(v.x, v.y, v.z));
  return { raH: ((((ra * 180 / Math.PI) % 360) + 360) % 360) / 15, dec: (dec * 180 / Math.PI) };
}
const p = vec(6, 0);
const out = Astronomy.RotateVector(R, p);
console.log('RotateVector((6h,0)) ->', JSON.stringify(sph(out)));

// what does EQD_EQJ do to (6h,0)?
const R2 = Astronomy.Rotation_EQD_EQJ(t);
const out2 = Astronomy.RotateVector(R2, p);
console.log('Rotation_EQD_EQJ applied to (6h,0) ->', JSON.stringify(sph(out2)));
