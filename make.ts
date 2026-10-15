/**
 * Build Script for Mercedonius Calendar
 *
 * Generates static data and builds the 13-Month Calendar.
 */

import fs from 'fs';
import path from 'path';

const ROOT_DIR = path.resolve(__dirname);
const BUILD_DIR = path.join(ROOT_DIR, 'build');

if (!fs.existsSync(BUILD_DIR)) {
  fs.mkdirSync(BUILD_DIR, { recursive: true });
}

function generateCalendarData() {
  const months = [
    { number: 1, roman: 'Martius', english: 'March' },
    { number: 2, roman: 'Aprilis', english: 'April' },
    { number: 3, roman: 'Maius', english: 'May' },
    { number: 4, roman: 'Iunius', english: 'June' },
    { number: 5, roman: 'Quintilis', english: 'July' },
    { number: 6, roman: 'Sextilis', english: 'August' },
    { number: 7, roman: 'September', english: 'September' },
    { number: 8, roman: 'October', english: 'October' },
    { number: 9, roman: 'November', english: 'November' },
    { number: 10, roman: 'December', english: 'December' },
    { number: 11, roman: 'Ianuarius', english: 'January' },
    { number: 12, roman: 'Februarius', english: 'February' },
    { number: 13, roman: 'Intercalaris', english: 'Intercalary' },
  ];

  const monthData = months.map(m =>
    `  { number: ${m.number}, roman: '${m.roman}', english: '${m.english}' }`
  ).join(',\n');

  const content = `export interface Month {
  number: number;
  roman: string;
  english: string;
}

export const MONTHS: Month[] = [
${monthData}
];

export const MONTH_LENGTHS = [31, 30, 31, 30, 31, 31, 30, 31, 30, 31, 31, 28];

export const MONTH_DAY_COUNTS = {
  1: 28, 2: 28, 3: 28, 4: 28, 5: 28, 6: 28, 7: 28, 8: 28, 9: 28, 10: 28, 11: 28, 12: 28, 13: 28
};
`;

  fs.writeFileSync(path.join(BUILD_DIR, 'calendar-data.ts'), content);
  console.log('Generated calendar-data.ts');
}

function main() {
  console.log('Building Mercedonius Calendar...');
  generateCalendarData();
  console.log('Build complete!');
}

main();
