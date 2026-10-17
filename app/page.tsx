'use client';

/**
 * Mercedonius — Splash / Welcome screen (route /).
 *
 * The entry point before the calendar display. Mercedonius is the dominant
 * identity. A single "welcome" button moves the user onto the calendar
 * screen at /calendar. No personal data is shown here.
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { SplashScreen } from './components/splash-screen';

export default function Calendar() {
  return <SplashScreen />;
}
