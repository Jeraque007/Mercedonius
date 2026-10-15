/**
 * Moon Service
 *
 * Calculates lunar phases and illumination using the astronomy module.
 * Re-exports from the dedicated astronomy module for consistency.
 */

import { getMoonPhase as calcMoonPhase } from './astronomy';

export const LUNAR_CYCLE = 29.53059;

export interface MoonPhaseInfo {
  phase: string;
  illumination: number;
  age: number;
  icon: string;
  name: string;
}

export function getMoonPhase(date: Date): MoonPhaseInfo {
  const p = calcMoonPhase(date);
  return {
    phase: p.phase,
    illumination: p.illumination,
    age: p.ageDays,
    icon: p.icon,
    name: p.name,
  };
}

export function getMoonIcon(date: Date): string {
  return calcMoonPhase(date).icon;
}

export function getMoonName(date: Date): string {
  return calcMoonPhase(date).name;
}

export function getMoonIllumination(date: Date): number {
  return calcMoonPhase(date).illumination;
}

export function getMoonAge(date: Date): number {
  return calcMoonPhase(date).ageDays;
}

export function getNextNewMoon(afterDate: Date): Date {
  // Advance from the Moon's current age to the next new moon (mean synodic month).
  const age = getMoonAge(afterDate);
  let days = (((LUNAR_CYCLE - age) % LUNAR_CYCLE) + LUNAR_CYCLE) % LUNAR_CYCLE;
  if (days <= 0.01) days = LUNAR_CYCLE; // exactly at new moon → next cycle
  return new Date(afterDate.getTime() + days * 86400000);
}

export function getNextFullMoon(afterDate: Date): Date {
  // Advance from the Moon's current age to the next full moon (half a synodic month).
  const age = getMoonAge(afterDate);
  const halfCycle = LUNAR_CYCLE / 2;
  let days = (((halfCycle - age) % LUNAR_CYCLE) + LUNAR_CYCLE) % LUNAR_CYCLE;
  if (days <= 0.01) days = LUNAR_CYCLE; // exactly at full moon → next cycle
  return new Date(afterDate.getTime() + days * 86400000);
}
