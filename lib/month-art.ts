/**
 * Mercedonius Month Artwork (Point 3 — instrument backdrops)
 * =========================================================
 * Verified 14 images served from `public/months/` under their ORIGINAL
 * filenames. Keyed by Mercedonius month number (0 = year-boundary day,
 * 1–13 = named months, 13 = Intercalaris in leap years). Artwork is
 * decorative only — never a source of data.
 */

export const MONTH_ART: Record<number, string> = {
  0: '/months/00-Mercedonius.jpg',
  1: '/months/01-Martius.jpg',
  2: '/months/02-Aprilis.jpg',
  3: '/months/03-Maius.jpg',
  4: '/months/04-Iunius.jpg',
  5: '/months/05-Quintilis.jpg',
  6: '/months/06-Sextilis.jpg',
  7: '/months/07-September.jpg',
  8: '/months/08-October.jpg',
  9: '/months/09-November.jpg',
  10: '/months/10-December.jpg',
  11: '/months/11-Ianuarius.jpg',
  12: '/months/12-Februarius.jpg',
  13: '/months/13-Intercalaris.jpg',
};

/** Artwork for a Mercedonius month, or null when none exists (never invented). */
export function monthArtFor(month: number): string | null {
  return MONTH_ART[month] ?? null;
}
