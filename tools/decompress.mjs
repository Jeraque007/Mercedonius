import { readFileSync, writeFileSync } from 'fs';
import { gunzipSync } from 'zlib';

const gz = readFileSync(new URL('./bound_20.dat.gz', import.meta.url));
const raw = gunzipSync(gz);
writeFileSync(new URL('./bound_20.dat', import.meta.url), raw);
const text = raw.toString('utf8');
const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
console.log('RAW_SIZE=' + raw.length);
console.log('NONEMPTY_LINES=' + lines.length);
console.log('FIRST3:');
for (const l of lines.slice(0, 3)) console.log('  [' + l + ']');
console.log('LAST3:');
for (const l of lines.slice(-3)) console.log('  [' + l + ']');
