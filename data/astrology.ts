/**
 * Days of the week according to the planets (astrology).
 *
 * This system originates from the Chaldean order of the planets by
 * distance from Earth, assigned to the hours of the day in a repeating
 * cycle. The planet ruling the first hour of each day gave its name
 * to that day.
 *
 * @see https://en.wikipedia.org/wiki/PlanetaryHour
 */
import { CHAKRAS } from './chakras';
export interface PlanetaryDay {
  /** Day number (1-7, starting with Sunday) */
  number: number;
  /** Planet associated with the day */
  planet: string;
  /** English name of the day */
  day: string;
}

/**
 * The seven days of the week, each associated with a classical planet.
 *
 * Order (traditional Chaldean/astrological sequence):
 * 1. Sun (Sunday)
 * 2. Moon (Monday)
 * 3. Mars (Tuesday)
 * 4. Mercury (Wednesday)
 * 5. Jupiter (Thursday)
 * 6. Venus (Friday)
 * 7. Saturn (Saturday)
 */
export const PLANETARY_DAYS: PlanetaryDay[] = [
  { number: 1, planet: 'Sun', day: 'Sunday' },
  { number: 2, planet: 'Moon', day: 'Monday' },
  { number: 3, planet: 'Mars', day: 'Tuesday' },
  { number: 4, planet: 'Mercury', day: 'Wednesday' },
  { number: 5, planet: 'Jupiter', day: 'Thursday' },
  { number: 6, planet: 'Venus', day: 'Friday' },
  { number: 7, planet: 'Saturn', day: 'Saturday' },
];

/** Days of the week by planet name */
export const DAY_BY_PLANET: Record<string, string> = {
  Sun: 'Sunday',
  Moon: 'Monday',
  Mars: 'Tuesday',
  Mercury: 'Wednesday',
  Jupiter: 'Thursday',
  Venus: 'Friday',
  Saturn: 'Saturday',
};

/** Planets in the traditional astrological order */
export const PLANETS: string[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

/** Astronomical glyphs for the seven classical planets */
export const PLANET_GLYPHS: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mars: '♂',
  Mercury: '☿',
  Jupiter: '♃',
  Venus: '♀',
  Saturn: '♄',
};

/**
 * Full reference for a weekday: ruling planet, traditional Latin name,
 * origin of the English name, and the associated chakra with its
 * commonly cited frequency (sourced from data/chakras.ts).
 *
 * The chakra correspondence follows the traditional Chaldean order of the
 * planets (Saturn → Jupiter → Mars → Mercury → Venus → Moon → Sun) mapped
 * onto the seven chakras from Root → Crown.
 */
export interface WeekdayReference {
  /** English name of the day */
  day: string;
  /** Ruling classical planet */
  planet: string;
  /** Traditional Latin name (dies …) */
  dies: string;
  /** Origin of the day's English name */
  origin: string;
  /** Chakra ruled by the day's planet (Sanskrit name) */
  chakraSanskrit: string;
  /** Chakra ruled by the day's planet (English name) */
  chakraEnglish: string;
  /** Commonly cited chakra frequency in Hz (see data/chakras.ts) */
  frequencyHz: number;
}

/** Frequency lookup against the canonical chakra table */
const chakraFrequency = (english: string): number =>
  CHAKRAS.find((c) => c.english === english)?.frequencyHz ?? 0;

/**
 * The seven days of the week with planet, Latin name, origin and chakra.
 * Ordered Monday → Sunday.
 */
export const WEEKDAY_REFERENCES: WeekdayReference[] = [
  {
    day: 'Monday',
    planet: 'Moon',
    dies: 'Dies Lunae',
    origin: "Moon's day (Luna, Latin)",
    chakraSanskrit: 'Ajna',
    chakraEnglish: 'Third Eye',
    frequencyHz: chakraFrequency('Third Eye'),
  },
  {
    day: 'Tuesday',
    planet: 'Mars',
    dies: 'Dies Martis',
    origin: 'Norse god Tiw/Tyr; Latin Martis dies (Mars)',
    chakraSanskrit: 'Manipura',
    chakraEnglish: 'Solar Plexus',
    frequencyHz: chakraFrequency('Solar Plexus'),
  },
  {
    day: 'Wednesday',
    planet: 'Mercury',
    dies: 'Dies Mercurii',
    origin: 'Norse god Woden/Odin; Latin Mercurii dies (Mercury)',
    chakraSanskrit: 'Anahata',
    chakraEnglish: 'Heart',
    frequencyHz: chakraFrequency('Heart'),
  },
  {
    day: 'Thursday',
    planet: 'Jupiter',
    dies: 'Dies Iovis',
    origin: 'Norse god Thor; Latin Jovis dies (Jupiter)',
    chakraSanskrit: 'Svadhisthana',
    chakraEnglish: 'Sacral',
    frequencyHz: chakraFrequency('Sacral'),
  },
  {
    day: 'Friday',
    planet: 'Venus',
    dies: 'Dies Veneris',
    origin: 'Norse goddess Frigg/Freya; Latin Veneris dies (Venus)',
    chakraSanskrit: 'Vishuddha',
    chakraEnglish: 'Throat',
    frequencyHz: chakraFrequency('Throat'),
  },
  {
    day: 'Saturday',
    planet: 'Saturn',
    dies: 'Dies Saturni',
    origin: 'Saturn (Saturni dies, Latin)',
    chakraSanskrit: 'Muladhara',
    chakraEnglish: 'Root',
    frequencyHz: chakraFrequency('Root'),
  },
  {
    day: 'Sunday',
    planet: 'Sun',
    dies: 'Dies Solis',
    origin: "Sun's day (Sol, Latin; Sun in English/Germanic)",
    chakraSanskrit: 'Sahasrara',
    chakraEnglish: 'Crown',
    frequencyHz: chakraFrequency('Crown'),
  },
];

/** Look up the weekday reference by English day name */
export function getWeekdayReference(dayName: string): WeekdayReference | undefined {
  return WEEKDAY_REFERENCES.find((d) => d.day === dayName);
}

/** Look up the weekday reference for a Date (UTC day, Sunday = 0) */
export function getWeekdayReferenceForDate(date: Date): WeekdayReference {
  return WEEKDAY_REFERENCES[(date.getUTCDay() + 6) % 7];
}
