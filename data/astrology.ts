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
