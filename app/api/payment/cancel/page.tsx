import Link from 'next/link';

export default function PaymentCancelPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(1200px 800px at 50% 20%, rgba(4,7,18,0.4), transparent 60%)',
        color: '#f0f0f5',
        fontFamily: "'Cinzel', Georgia, 'Times New Roman', serif",
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <div
        style={{
          fontSize: '3rem',
          marginBottom: '1rem',
          color: '#f87171',
          letterSpacing: '0.1em',
        }}
      >
        ⚠
      </div>
      <h1
        style={{
          margin: 0,
          marginBottom: '1rem',
          fontSize: '2rem',
          color: 'rgba(212,175,55,0.6)',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}
      >
        Payment Cancelled
      </h1>
      <p
        style={{
          margin: 0,
          marginBottom: '2rem',
          fontSize: '1.1rem',
          color: 'rgba(240,240,245,0.8)',
        }}
      >
        Your payment was not completed. No charges were made.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link
          href="/"
          style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.1))',
            border: '1.5px solid #f0d060',
            color: '#fff',
            padding: '0.85rem 2rem',
            fontSize: '1rem',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            borderRadius: '6px',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
          }}
        >
          Try Again
        </Link>
        <Link
          href="/calendar"
          style={{
            background: 'rgba(212,175,55,0.1)',
            border: '1px solid rgba(212,175,55,0.3)',
            color: 'rgba(240,240,245,0.8)',
            padding: '0.85rem 2rem',
            fontSize: '1rem',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            borderRadius: '6px',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
          }}
        >
          Browse Calendar
        </Link>
      </div>
    </div>
  );
}