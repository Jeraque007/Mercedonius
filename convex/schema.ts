/**
 * Convex Schema
 *
 * Defines the data schema for the 13-Month Calendar application.
 *
 * Uses Convex's native validators (`v`) so that indexed fields are verified
 * against the table shapes at compile time. The astronomy/calculation engine
 * stays independent of Convex — this schema is strictly the app layer
 * (users, preferences, saved dates/events).
 */

import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

// ──────────────────────────────────────────────
// Shared validators
// ──────────────────────────────────────────────

export const calendarModeValidator = v.union(
  v.literal('dual'),
  v.literal('monthly'),
  v.literal('gregorian')
);
export const weekStartValidator = v.union(v.literal('sunday'), v.literal('monday'));
export const timeFormatValidator = v.union(v.literal('12h'), v.literal('24h'));
export const themeModeValidator = v.union(v.literal('dark'), v.literal('light'));

export const astronomicalEventTypeValidator = v.union(
  v.literal('new_moon'),
  v.literal('first_quarter'),
  v.literal('full_moon'),
  v.literal('last_quarter'),
  v.literal('solar_eclipse'),
  v.literal('lunar_eclipse'),
  v.literal('equinox'),
  v.literal('solstice'),
  v.literal('perihelion'),
  v.literal('aphelion'),
  v.literal('meteor_shower'),
  v.literal('other')
);

export const eclipseTypeValidator = v.union(v.literal('solar'), v.literal('lunar'));

// ──────────────────────────────────────────────
// Define Schema with Convex
// ──────────────────────────────────────────────

export const schema = defineSchema({
  // User preferences (app-layer only; astronomy runs locally)
  userPreferences: defineTable({
    userId: v.string(),
    calendarMode: calendarModeValidator,
    weekStart: weekStartValidator,
    timeFormat: timeFormatValidator,
    themeMode: themeModeValidator,
    location: v.optional(v.string()),
    timezone: v.optional(v.string()),
    showMoon: v.optional(v.boolean()),
    showIllumination: v.optional(v.boolean()),
    showEvents: v.optional(v.boolean()),
    eclipseNotifications: v.optional(v.boolean()),
  }).index('byUserId', ['userId']),

  // Calendar dates and references
  dates: defineTable({
    year: v.number(),
    month: v.number(), // 1-13 for the 13-month calendar
    day: v.number(),
    gregorianDate: v.string(), // ISO date string
  })
    .index('byYear', ['year'])
    .index('byMonth', ['year', 'month'])
    .index('byGregorianDate', ['gregorianDate']),

  // Astronomical events
  events: defineTable({
    type: astronomicalEventTypeValidator,
    year: v.number(),
    date: v.string(), // ISO date string
    utcTime: v.number(),
    label: v.string(),
    icon: v.string(),
    isMajor: v.boolean(),
    details: v.optional(v.string()),
  })
    .index('byType', ['type'])
    .index('byDate', ['date'])
    .index('byMajor', ['isMajor'])
    .index('byYear', ['year']),

  // Eclipse events (curated dataset + engine output)
  eclipses: defineTable({
    type: eclipseTypeValidator,
    year: v.number(),
    date: v.string(),
    magnitude: v.number(),
    maxMagnitude: v.number(),
    maxTime: v.number(),
    durationSeconds: v.optional(v.number()),
    visibility: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    isMajor: v.boolean(),
    details: v.optional(v.string()),
  })
    .index('byType', ['type'])
    .index('byDate', ['date'])
    .index('byYear', ['year']),

  // Day details (metadata cache)
  dayDetails: defineTable({
    gregorianDate: v.string(),
    year: v.number(),
    monthDay: v.object({
      year: v.number(),
      month: v.number(),
      day: v.number(),
    }),
    dayOfWeek: v.string(),
    moon: v.object({
      phase: v.string(),
      illumination: v.number(),
      age: v.number(),
      icon: v.string(),
      name: v.string(),
    }),
    lunarPosition: v.object({
      distance: v.number(),
      angularDiameter: v.number(),
      elongation: v.number(),
    }),
    events: v.array(
      v.object({
        type: astronomicalEventTypeValidator,
        utcTime: v.number(),
        label: v.string(),
        icon: v.string(),
        isMajor: v.optional(v.boolean()),
      })
    ),
    eclipses: v.optional(
      v.array(
        v.object({
          type: eclipseTypeValidator,
          magnitude: v.number(),
          visibility: v.string(),
          isMajor: v.boolean(),
        })
      )
    ),
  })
    .index('byDate', ['gregorianDate'])
    .index('byYear', ['year']),
});

// ──────────────────────────────────────────────
// Type exports for use in other files
// ──────────────────────────────────────────────

export type CalendarMode = 'dual' | 'monthly' | 'gregorian';
export type WeekStart = 'sunday' | 'monday';
export type TimeFormat = '12h' | '24h';
export type ThemeMode = 'dark' | 'light';
export type AstronomicalEventType =
  | 'new_moon'
  | 'first_quarter'
  | 'full_moon'
  | 'last_quarter'
  | 'solar_eclipse'
  | 'lunar_eclipse'
  | 'equinox'
  | 'solstice'
  | 'perihelion'
  | 'aphelion'
  | 'meteor_shower'
  | 'other';
export type EclipseType = 'solar' | 'lunar';

export interface DateRange {
  year: number;
  month: number; // 1-13
  day: number;
  gregorianDate: string;
}

export interface MoonPhaseInfo {
  phase: string;
  illumination: number;
  age: number;
  icon: string;
  name: string;
}

export interface LunarPositionInfo {
  distance: number;
  angularDiameter: number;
  elongation: number;
}

export interface EclipseRecord {
  type: EclipseType;
  year: number;
  date: string;
  magnitude: number;
  maxMagnitude: number;
  maxTime: number;
  durationSeconds?: number;
  visibility: string;
  startDate: string;
  endDate: string;
  isMajor: boolean;
  details?: string;
}
