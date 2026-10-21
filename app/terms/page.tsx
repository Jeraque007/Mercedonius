/**
 * MERCEDONIUS — Terms & Conditions (Brief)
 *
 * Static page linked from a subtle footnote on every build. Shown in full
 * when the acceptance popup is opened, and always readable at /terms.
 */

import Link from 'next/link';

export default function TermsPage() {
  return (
    <div
      className="page-container"
      style={{
        padding: '1.5rem',
        maxWidth: 760,
        margin: '0 auto',
        minHeight: '100vh',
        lineHeight: 1.7,
      }}
    >
      <nav
        className="page-nav"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #334155',
        }}
      >
        <Link
          href="/"
          style={{
            padding: '0.5rem 1rem',
            background: '#1e293b',
            color: '#e2e8f0',
            border: '1px solid #475569',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '0.85rem',
          }}
        >
          ← Back
        </Link>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fbbf24' }}>
          Terms & Conditions
        </div>
      </nav>

      <h1
        style={{
          color: '#fbbf24',
          margin: '0 0 1rem',
          fontSize: '1.5rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        MERCEDONIUS — Terms & Conditions (Brief)
      </h1>

      <p style={{ color: '#e2e8f0', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
        <strong>By using this app, you confirm you understand and accept the following:</strong>
      </p>

      <section style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ color: '#fbbf24', marginBottom: '0.5rem', fontSize: '1rem' }}>
          1. What this calendar is
        </h2>
        <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
          MERCEDONIUS is a{' '}
          <strong>13-month calendar of 28 days each</strong>, with a Year Day
          (and, in some years, a Leap Day) outside the months. Its year begins
          on the <strong>UTC date containing the March equinox</strong>. It is
          a <strong>modern calendar inspired by Roman tradition</strong>, not a
          reconstruction of the historical Roman calendar.
        </p>
      </section>

      <section style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ color: '#fbbf24', marginBottom: '0.5rem', fontSize: '1rem' }}>
          2. Year numbering — AUC
        </h2>
        <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
          Years are numbered <strong>Ab Urbe Condita (AUC)</strong>, continuous
          from the traditional founding of Rome (753 BC). The current year is{' '}
          <strong>2779 AUC</strong>. MERCEDONIUS years do{' '}
          <strong>not</strong> match Gregorian years. The <strong>AUC</strong>
          suffix will always be shown where confusion is possible.
        </p>
        <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
          Example: <strong>Sextilis 15, 2779 AUC</strong> = 16 October 2026
          Gregorian.
        </p>
      </section>

      <section style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ color: '#fbbf24', marginBottom: '0.5rem', fontSize: '1rem' }}>
          3. Living system — dates can be recalculated
        </h2>
        <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
          MERCEDONIUS is a <strong>living, computed calendar</strong>, not a
          fixed table. Year boundaries are calculated from real astronomical
          data using a versioned ephemeris.
        </p>
        <ul style={{ color: '#cbd5e1', fontSize: '0.9rem', paddingLeft: '1.25rem', margin: 0 }}>
          <li style={{ marginBottom: '0.35rem' }}>
            If the astronomical reference is updated, <strong>future year
            boundaries may be recalculated</strong>.
          </li>
          <li style={{ marginBottom: '0.35rem' }}>
            <strong>Past dates already displayed will not be silently changed</strong>
            without a version notice.
          </li>
          <li style={{ marginBottom: '0.35rem' }}>
            Leap years are determined by the <strong>actual equinox interval</strong>,
            not by a fixed four-year rule.
          </li>
          <li>
            A MERCEDONIUS leap year and a Gregorian leap year are{' '}
            <strong>not necessarily the same</strong>.
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ color: '#fbbf24', marginBottom: '0.5rem', fontSize: '1rem' }}>
          4. Astronomical data is provided as-is
        </h2>
        <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
          Equinoxes, solstices, moon phases, eclipses, planetary positions, and
          similar data are calculated or sourced from a stated ephemeris, with
          its version recorded. They are provided for <strong>general
          informational and calendrical use</strong>, not for navigation,
          legal, medical, religious, or safety-critical decisions.
        </p>
      </section>

      <section style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ color: '#fbbf24', marginBottom: '0.5rem', fontSize: '1rem' }}>
          5. Your local date may differ
        </h2>
        <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
          Calendar dates are anchored to <strong>UTC</strong>. An astronomical
          event shown at the same instant may display a <strong>different local
          date</strong> depending on your time zone. The app will not silently
          mix local and UTC calculations.
        </p>
      </section>

      <section style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ color: '#fbbf24', marginBottom: '0.5rem', fontSize: '1rem' }}>
          6. Not a replacement for civil or legal calendars
        </h2>
        <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
          MERCEDONIUS does <strong>not</strong> replace the Gregorian calendar
          or any official civil calendar. It is an <strong>alternative
          calendrical and astronomical interface</strong>. Official, legal,
          contractual, and government dates remain governed by the civil
          calendar of your jurisdiction.
        </p>
      </section>

      <section style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ color: '#fbbf24', marginBottom: '0.5rem', fontSize: '1rem' }}>
          7. Accuracy and limits
        </h2>
        <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
          We aim for the calendar to be <strong>as close as possible to actual
          astronomical data</strong>, and we publish the method and version
          used. However:
        </p>
        <ul style={{ color: '#cbd5e1', fontSize: '0.9rem', paddingLeft: '1.25rem', margin: 0 }}>
          <li style={{ marginBottom: '0.35rem' }}>
            No calendar or ephemeris is perfect.
          </li>
          <li style={{ marginBottom: '0.35rem' }}>
            Boundary dates depend on the chosen astronomical source.
          </li>
          <li style={{ marginBottom: '0.35rem' }}>
            Some edge cases (rare year lengths, pre-Roman dates, distant future
            dates) may be flagged or unsupported.
          </li>
          <li>
            The app may <strong>refuse to display a date</strong> rather than
            fabricate one.
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ color: '#fbbf24', marginBottom: '0.5rem', fontSize: '1rem' }}>
          8. Changes and versions
        </h2>
        <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
          This standard is <strong>versioned</strong>. Future versions may
          change display conventions, the supported date range, or the
          astronomical reference. Changes will be recorded, not hidden. Old
          dates are interpreted under the version in force when they were
          created.
        </p>
      </section>

      <section style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ color: '#fbbf24', marginBottom: '0.5rem', fontSize: '1rem' }}>
          9. Your acceptance
        </h2>
        <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
          By continuing, you confirm:
        </p>
        <ul style={{ color: '#cbd5e1', fontSize: '0.9rem', paddingLeft: '1.25rem', margin: 0 }}>
          <li style={{ marginBottom: '0.35rem' }}>
            You understand MERCEDONIUS is an <strong>alternative calendar</strong>,
            not the Gregorian calendar.
          </li>
          <li style={{ marginBottom: '0.35rem' }}>
            You understand years are in <strong>AUC</strong>, not Gregorian.
          </li>
          <li style={{ marginBottom: '0.35rem' }}>
            You understand this is a <strong>living system</strong> whose
            future boundaries may be recalculated.
          </li>
          <li style={{ marginBottom: '0.35rem' }}>
            You accept that astronomical data is provided <strong>as-is</strong>,
            for general use.
          </li>
          <li style={{ marginBottom: '0.35rem' }}>
            You accept that your data will be stored for birthday celebration
            and reminders.
          </li>
          <li>
            You accept that your email address will be collected and will be
            confirmed as authentic for the above mentioned reminder.
          </li>
        </ul>
      </section>

      <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '1.5rem' }}>
        <strong>If you do not accept these terms, please close the app.</strong>
      </p>

      <p style={{ color: '#606070', fontSize: '0.75rem', marginTop: '1rem' }}>
        MERCEDONIUS Calendar Standard 1.0
      </p>
    </div>
  );
}
