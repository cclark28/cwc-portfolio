import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FAFAFB',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          font: "700 6rem var(--font-mono)",
          color: '#18181B',
          margin: 0,
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}
      >
        404
      </h1>
      <p
        style={{
          font: "400 1.125rem var(--font-grotesk)",
          color: '#86858C',
          margin: '12px 0 32px',
        }}
      >
        Page not found
      </p>
      <Link
        href="/"
        style={{
          font: "500 0.9375rem var(--font-grotesk)",
          color: '#4D80E6',
          textDecoration: 'none',
        }}
      >
        Back to canvas &rarr;
      </Link>
    </div>
  );
}
