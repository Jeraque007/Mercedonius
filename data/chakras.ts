export interface Chakra {
  /** Sanskrit name of the chakra */
  sanskrit: string;
  /** Common English translation */
  english: string;
  /** Numerical meaning / association */
  numericalMeaning: string;
  /** Commonly cited frequency in Hz (not scientifically validated) */
  frequencyHz: number;
}

/**
 * The 7 major chakras with their Sanskrit names, English translations,
 * numerical meanings, and commonly cited frequencies.
 *
 * Note: Chakra frequencies are commonly cited in spiritual literature but
 * are not scientifically validated.
 */
export const CHAKRAS: Chakra[] = [
  {
    sanskrit: 'Muladhara',
    english: 'Root',
    numericalMeaning: '1: Survival',
    frequencyHz: 396,
  },
  {
    sanskrit: 'Svadhisthana',
    english: 'Sacral',
    numericalMeaning: '2: Creation/sexuality',
    frequencyHz: 417,
  },
  {
    sanskrit: 'Manipura',
    english: 'Solar Plexus',
    numericalMeaning: '3: Power/will',
    frequencyHz: 528,
  },
  {
    sanskrit: 'Anahata',
    english: 'Heart',
    numericalMeaning: '4: Love/balance',
    frequencyHz: 639,
  },
  {
    sanskrit: 'Vishuddha',
    english: 'Throat',
    numericalMeaning: '5: Communication',
    frequencyHz: 741,
  },
  {
    sanskrit: 'Ajna',
    english: 'Third Eye',
    numericalMeaning: '6: Perception/intuition',
    frequencyHz: 852,
  },
  {
    sanskrit: 'Sahasrara',
    english: 'Crown',
    numericalMeaning: '7: Consciousness/spiritual unity',
    frequencyHz: 963,
  },
];

/** Numerical meanings for the seven chakras */
export const CHAKRA_NUMERICAL_MEANINGS: Record<number, string> = {
  1: 'Survival',
  2: 'Creation/sexuality',
  3: 'Power/will',
  4: 'Love/balance',
  5: 'Communication',
  6: 'Perception/intuition',
  7: 'Consciousness/spiritual unity',
};

/** Commonly cited chakra frequencies (not scientifically validated) */
export const CHAKRA_FREQUENCIES: Record<string, number> = {
  Root: 396,
  Sacral: 417,
  SolarPlexus: 528,
  Heart: 639,
  Throat: 741,
  ThirdEye: 852,
  Crown: 963,
};
