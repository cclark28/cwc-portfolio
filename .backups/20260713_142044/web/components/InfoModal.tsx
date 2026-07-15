'use client';

import { useEffect } from 'react';
import type { AboutData } from '@/components/HomeClient';

interface InfoModalProps {
  onClose: () => void;
  aboutData?: AboutData | null;
}

export default function InfoModal({ onClose, aboutData }: InfoModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Use Sanity data if available, otherwise fall back to defaults
  const headline = aboutData?.headline || "Aloha, I'm Charlie.";
  const bio = aboutData?.bio || "I'm a multidisciplinary designer exploring the intersection of technology, storytelling, and design. I collaborate on useful, experimental, and immersive experiences across digital, environmental, and physical touchpoints.";
  const currentRole = aboutData?.currentRole || 'Senior Designer — DemandScience / Terminus';
  const location = aboutData?.location || 'Based in the United States';
  const email = aboutData?.contactEmail || 'charlieclark@gmail.com';

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(24,24,27,0.35)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'modal-backdrop-in 0.25s ease forwards',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(1000px, 94vw)',
          maxHeight: '88vh',
          overflowY: 'auto',
          background: '#FFFFFF',
          borderRadius: 6,
          position: 'relative',
          animation: 'modal-content-in 0.3s ease forwards',
        }}
      >
        {/* Sticky header */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            background: '#FFFFFF',
            borderBottom: '1px solid #E5E4E6',
            padding: '16px 28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 1,
            borderRadius: '6px 6px 0 0',
          }}
        >
          <span style={{ font: "500 0.6875rem var(--font-mono)", textTransform: 'uppercase', letterSpacing: '0.06em', color: '#86858C' }}>
            Info
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              height: 28,
              background: '#ECEBEE',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              padding: '0 10px 0 8px',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              color: '#58565D',
              transition: 'background 0.12s ease, color 0.12s ease',
            }}
            onMouseEnter={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = '#D4D3D8'; b.style.color = '#18181B'; }}
            onMouseLeave={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = '#ECEBEE'; b.style.color = '#58565D'; }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
            <span style={{ font: "500 0.5625rem var(--font-mono)", textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Close
            </span>
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '40px 28px 48px' }}>
          {/* Headline */}
          <h1
            style={{
              font: "700 clamp(2.5rem, 7vw, 5rem) var(--font-grotesk)",
              color: '#18181B',
              margin: '0 0 36px',
              lineHeight: 1.05,
            }}
          >
            {headline}
          </h1>

          {/* Two-column body */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 40,
            }}
          >
            {/* Left: bio */}
            <div>
              <p
                style={{
                  font: "400 1rem var(--font-grotesk)",
                  color: '#18181B',
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {bio}
              </p>
            </div>

            {/* Right: current */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <span
                  style={{
                    font: "500 0.625rem var(--font-mono)",
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#9B9AA0',
                    display: 'block',
                    marginBottom: 6,
                  }}
                >
                  Current
                </span>
                <p style={{ font: "500 0.9375rem var(--font-grotesk)", color: '#18181B', margin: 0, lineHeight: 1.5 }}>
                  {currentRole}
                </p>
                <p style={{ font: "400 0.875rem var(--font-grotesk)", color: '#58565D', margin: '4px 0 0', lineHeight: 1.5 }}>
                  {location}
                </p>
              </div>

              <a
                href={`mailto:${email}`}
                style={{
                  font: "500 0.875rem var(--font-grotesk)",
                  color: '#4D80E6',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                Say hello &rarr;
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
