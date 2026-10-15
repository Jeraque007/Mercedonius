/**
 * Root Layout for Mercedonius Calendar
 *
 * Provides the HTML structure for the entire application.
 */

import './globals.css';

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
