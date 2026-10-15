/**
 * Month Configuration
 *
 * Month name mappings for the 13-Month Calendar and Gregorian Calendar.
 */

// 13-Month Calendar month names
export const MONTH_NAMES = [
  'Martius', 'Aprilis', 'Maius', 'Iunius', 'Quintilis', 'Sextilis',
  'September', 'October', 'November', 'December', 'Ianuarius', 'Februarius', 'Intercalaris'
] as const;

export const MONTH_NAMES_SHORT = [
  'Mart.', 'Apr.', 'Mai.', 'Iun.', 'Quint.', 'Sext.',
  'Sept.', 'Oct.', 'Nov.', 'Dec.', 'Ianu.', 'Febru.', 'Inter.'
] as const;

// Gregorian month names (0-indexed)
export const GREG_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const;

// Days of week
export const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
] as const;

/**
 * Get month name in 13-month calendar
 */
export function get13MonthName(month: number): string {
  if (month >= 1 && month <= 13) {
    return MONTH_NAMES[month - 1];
  }
  return 'Unknown';
}

/**
 * Get short month name for 13-month calendar
 */
export function getShort13MonthName(month: number): string {
  if (month >= 1 && month <= 13) {
    return MONTH_NAMES_SHORT[month - 1];
  }
  return '??';
}

/**
 * Get Gregorian month name for display
 */
export function getGregorianMonthName(month: number): string {
  if (month >= 1 && month <= 12) {
    return GREG_MONTHS[month - 1];
  }
  return 'Unknown';
}

/**
 * Get day of week name
 */
export function getDayName(dayIndex: number): string {
  if (dayIndex >= 0 && dayIndex < 7) {
    return DAYS_OF_WEEK[dayIndex];
  }
  return 'Unknown';
}
