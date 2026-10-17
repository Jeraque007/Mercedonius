/**
 * Data Provenance (redesign Point 4)
 * ==================================
 *
 * Every displayed value must be honestly attributable to HOW it was
 * produced. These five kinds are the platform's full vocabulary; UI
 * surfaces label values with them and never present illustrative or
 * missing data as if it were computed fact.
 *
 *  - 'live'         Computed on this device, for the exact inputs in use.
 *  - 'catalogue'    Sourced reference data (IAU boundaries, orbital
 *                   elements) — validated but not recomputed.
 *  - 'cached'       A previously computed result reused for speed;
 *                   still reproducible from the same inputs.
 *  - 'illustrative' Approximate/sample content for presentation — must
 *                   be labelled, must never be relied upon.
 *  - 'unavailable'  No value exists for these inputs; say so instead of
 *                   inventing a replacement.
 */
export type DataProvenance =
  | 'live'
  | 'catalogue'
  | 'cached'
  | 'illustrative'
  | 'unavailable';

export interface ProvenanceInfo {
  /** Short badge label */
  label: string;
  /** Small badge symbol */
  symbol: string;
  /** Tooltip / legend explanation */
  description: string;
}

export const PROVENANCE_INFO: Record<DataProvenance, ProvenanceInfo> = {
  live: {
    label: 'Live calculation',
    symbol: '◉',
    description:
      'Computed on this device from astronomical algorithms for the exact date, time, and location currently in use.',
  },
  catalogue: {
    label: 'Validated catalogue',
    symbol: '◈',
    description:
      'Sourced reference data (e.g. IAU constellation boundaries, orbital elements) — fixed, not recomputed for your inputs.',
  },
  cached: {
    label: 'Cached result',
    symbol: '◌',
    description:
      'A previously computed result reused for speed; reproducible from the same inputs.',
  },
  illustrative: {
    label: 'Illustrative',
    symbol: '◐',
    description:
      'Approximate or sample content shown for presentation — NOT a precise prediction. Do not rely on it.',
  },
  unavailable: {
    label: 'Unavailable',
    symbol: '○',
    description:
      'No value is shown because it cannot be computed or determined for this input. Nothing has been substituted.',
  },
};

/** Legend order, most-trustworthy-first. */
export const PROVENANCE_LEGEND: readonly DataProvenance[] = [
  'live',
  'catalogue',
  'cached',
  'illustrative',
  'unavailable',
];