// Analyze structure of VizieR VI/49/bound_20 (J2000 constellation boundaries)
import { readFileSync } from 'fs';

const raw = readFileSync(new URL('./bound_20.tsv', import.meta.url), 'utf8');
const rows = [];
for (const line of raw.split(/\r?\n/)) {
  if (line.startsWith('#') || line.trim() === '') continue;
  const parts = line.split('\t');
  if (parts.length < 4) continue;
  const ra = parseFloat(parts[0]);
  const dec = parseFloat(parts[1]);
  const cst = parts[2].trim();
  const type = parts[3].trim();
  if (Number.isNaN(ra) || Number.isNaN(dec) || !/^[A-Z]{3}$/.test(cst)) continue;
  rows.push({ ra, dec, cst, type });
}
console.log('total data rows:', rows.length);

// group contiguous runs per constellation
const groups = [];
let cur = null;
for (const r of rows) {
  if (!cur || cur.cst !== r.cst) {
    cur = { cst: r.cst, pts: [] };
    groups.push(cur);
  }
  cur.pts.push(r);
}
console.log('contiguous groups:', groups.length);
const byCst = new Map();
for (const g of groups) {
  if (!byCst.has(g.cst)) byCst.set(g.cst, []);
  byCst.get(g.cst).push(g);
}
console.log('unique constellations:', byCst.size);
const multi = [...byCst.entries()].filter(([, v]) => v.length > 1);
console.log('constellations with multiple groups:', multi.map(([k, v]) => `${k}(${v.length})`).join(', ') || 'none');

// check contiguity: are all points of each constellation contiguous?
let nonContig = 0;
const seen = new Set();
let prev = null;
for (const r of rows) {
  if (r.cst !== prev) {
    if (seen.has(r.cst)) nonContig++;
    seen.add(r.cst);
    prev = r.cst;
  }
}
console.log('non-contiguous constellation blocks:', nonContig);

// rectilinearity check within each group: consecutive points share RA or Dec?
let diagonals = 0;
let closed = 0;
let notClosed = 0;
const sampleDiags = [];
for (const g of groups) {
  const p = g.pts;
  if (p.length < 2) continue;
  // closure: first == last?
  const first = p[0], last = p[p.length - 1];
  const isClosed = Math.abs(first.ra - last.ra) < 1e-9 && Math.abs(first.dec - last.dec) < 1e-9;
  if (isClosed) closed++; else notClosed++;
  for (let i = 1; i < p.length; i++) {
    const a = p[i - 1], b = p[i];
    const sameRA = Math.abs(a.ra - b.ra) < 1e-7;
    const sameDec = Math.abs(a.dec - b.dec) < 1e-7;
    if (!sameRA && !sameDec) {
      diagonals++;
      if (sampleDiags.length < 5) sampleDiags.push(`${g.cst}: (${a.ra},${a.dec})->(${b.ra},${b.dec})`);
    }
  }
}
console.log('groups closed (first==last):', closed, ' not closed:', notClosed);
console.log('diagonal segments:', diagonals, sampleDiags.length ? JSON.stringify(sampleDiags) : '');

// point counts per group for a few constellations
for (const name of ['UMI', 'SCO', 'OPH', 'ARI', 'LEO', 'PSC']) {
  const gs = byCst.get(name);
  if (gs) console.log(`${name}: groups=${gs.length} pts=${gs.map((g) => g.pts.length).join('+')} types=${[...new Set(gs.flatMap((g) => g.pts.map((p) => p.type)))].join('')}`);
}

// first/last few rows of UMI to eyeball ordering
const umi = byCst.get('UMI');
if (umi) {
  const p = umi[0].pts;
  console.log('UMI first 3:', p.slice(0, 3).map((q) => `${q.ra},${q.dec},${q.type}`).join(' | '));
  console.log('UMI last 3:', p.slice(-3).map((q) => `${q.ra},${q.dec},${q.type}`).join(' | '));
}
