/**
 * Gregorian calendar month names (revised Roman calendar).
 *
 * The original Roman calendar had 10 months (Martius through December).
 * The revised calendar (January 1, 153 BC) added Januarius and Februarius,
 * making 12 months. Quintilis was renamed Iulius (July) by Caesar,
 * and Sextilis was renamed Augustus (August) by Emperor Augustus.
 *
 * Intercalaris (intercalary month) was a leap month inserted every 2-3 years
 * to keep the calendar aligned with the solar year.
 *
 * @see https://en.wikipedia.org/wiki/Ancient_Roman_calendar
 */
export interface Month {
  /** Month number (1-13) */
  number: number;
  /** Original Roman name */
  roman: string;
  /** English name */
  english: string;
}

/**
 * All 13 months of the Gregorian/Roman calendar system.
 *
 * The 13th entry (Intercalaris) is included for completeness but was not
 * part of the regular 12-month calendar; it was a leap month inserted
 * periodically to synchronize with the solar year.
 */
export const MONTHS: Month[] = [
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

/** Month names by their Gregorian/modern numbering (1-12) */
export const MONTH_NAMES: Record<number, string> = {
  1: 'March',
  2: 'April',
  3: 'May',
  4: 'June',
  5: 'July',
  6: 'August',
  7: 'September',
  8: 'October',
  9: 'November',
  10: 'December',
  11: 'January',
  12: 'February',
};

/** Roman names of the months by their original numbering (1-12) */
export const ROMAN_MONTH_NAMES: Record<number, string> = {
  1: 'Martius',
  2: 'Aprilis',
  3: 'Maius',
  4: 'Iunius',
  5: 'Quintilis',
  6: 'Sextilis',
  7: 'September',
  8: 'October',
  9: 'November',
  10: 'December',
  11: 'Ianuarius',
  12: 'Februarius',
};
