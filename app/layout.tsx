/**
 * Root Layout for Mercedonius Calendar
 *
 * Provides the HTML structure for the entire application.
 */

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mercedonius — 13-Month Astronomical Calendar',
  description:
    'Mercedonius: a 13-month astronomical calendar with zodiac constellations, eclipses, moon phases, planetary weekdays and chakra frequencies.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
