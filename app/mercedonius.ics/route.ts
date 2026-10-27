import { NextResponse } from "next/server";

/**
 * GET /mercedonius.ics
 *
 * iCalendar feed for the Mercedonius 13-month astronomical calendar.
 * Subscribable by Google Calendar, Apple Calendar, Outlook, etc.
 *
 * Returns Content-Type: text/calendar (required for calendar validation).
 *
 * URLs:
 *   https://mercedonius.sae963.com/mercedonius.ics   (https, Google/New Outlook)
 *   webcal://mercedonius.sae963.com/mercedonius.ics   (Apple/Classic Outlook)
 */
export async function GET() {
  const now = new Date();
  const year = now.getFullYear();
  const uid = "mercedonius-calendar@sae963.com";

  const ics = [
    "BEGIN:VCALENDAR",
    "PRODID:-//Mercedonius//Mercedonius 13-Month Calendar//EN",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Mercedonius Calendar",
    "X-WR-CALDESC:A 13-month astronomical calendar with zodiac constellations, eclipses, moon phases and planetary weekdays.",
    "X-WR-TIMEZONE:UTC",
    "BEGIN:VTIMEZONE",
    "TZID:UTC",
    "BEGIN:STANDARD",
    "TZNAME:UTC",
    "DTSTART:19700101T000000",
    "TZOFFSETFROM:+0000",
    "TZOFFSETTO:+0000",
    "END:STANDARD",
    "END:VTIMEZONE",
    // Monthly reading reminder (recurring on the 1st of each month)
    "BEGIN:VEVENT",
    `UID:monthly-reading-${uid}`,
    `DTSTAMP:${toIcsTimestamp(now)}`,
    `DTSTART;VALUE=DATE:${year}0101`,
    "RRULE:FREQ=MONTHLY;BYMONTHDAY=1",
    "SUMMARY:Mercedonius Monthly Reading",
    "DESCRIPTION:Your monthly Mercedonius calendar reading is available.",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n") + "\r\n";

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

function toIcsTimestamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}
