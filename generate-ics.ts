import { convertGregorianTo13Month, formatMercedoniusDate } from './lib/date-utils';
import { utcJDN } from './lib/time-policy';

const today = new Date();
let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Mercedonius Calendar//EN//\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\n';
for (let i = 0; i < 365; i++) {
  const date = new Date(today.getTime() + i * 86400000);
  const md = convertGregorianTo13Month(date);
  const gregorian = date.toISOString().split('T')[0];
  const mercedonius = formatMercedoniusDate(md);
  const start = utcJDN(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())));
  ics += 'BEGIN:VEVENT\n';
  ics += 'UID:MERCEDONIUS-' + utcJDN(date) + '-' + i + '\n';
  ics += 'DTSTART:' + start + '\n';
  ics += 'DTEND:' + (start + 1) + '\n';
  ics += 'SUMMARY:MERCEDONIUS ' + mercedonius + '\n';
  ics += 'DESCRIPTION:Gregorian: ' + gregorian + '\n';
  ics += 'END:VEVENT\n';
}
ics += 'END:VCALENDAR';
console.log(ics);
console.log('\nTotal events: ' + (ics.match(/BEGIN:VEVENT/g) || []).length);