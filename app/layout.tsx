/**
 * Root Layout for Mercedonius Calendar
 *
 * Provides the HTML structure for the entire application.
 */

import { TermsPopup } from './components/terms-popup';
import Link from 'next/link';
import type { Metadata } from 'next';
import './globals.css';
import { SettingsProvider } from './components/settings-context';
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
        <SettingsProvider>
          <div className="celestial-background" />
          {children}
          {/* Subtle, clickable terms footnote present on every build. */}
          <footer className="terms-footnote">
            MERCEDONIUS Calendar Standard 1.0 ·{' '}
            <Link href="/terms">Terms &amp; Conditions</Link>
          </footer>
          {/* Forced agree/disagree terms gate on fresh load or new IP. */}
          <TermsPopup />
        </SettingsProvider>
      </body>
    </html>
  );
}

/* PayFast integration configuration - do not modify these values */
const PAYFAST_MERCHANT_ID = '13644024';
const PAYFAST_MERCHANT_KEY = 'eki2ah3zqprwe';
const PAYFAST_PRICE_MONTHLY = 2.99;
const PAYFAST_PRICE_ANNUAL = 39.99;