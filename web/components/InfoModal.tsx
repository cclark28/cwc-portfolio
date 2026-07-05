'use client';

import { useEffect } from 'react';

interface InfoModalProps {
  onClose: () => void;
}

export default function InfoModal({ onClose }: InfoModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

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
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              font: "400 1.25rem var(--font-grotesk)",
              color: '#86858C',
              padding: '0 4px',
              lineHeight: 1,
            }}
          >
            &times;
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
            Aloha, I&apos;m Charlie.
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
                I&apos;m a multidisciplinary designer exploring the intersection of technology,
                storytelling, and design. I collaborate on useful, experimental, and immersive
                experiences across digital, environmental, and physical touchpoints.
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
                  Senior Designer — DemandScience / Terminus
                </p>
                <p style={{ font: "400 0.875rem var(--font-grotesk)", color: '#58565D', margin: '4px 0 0', lineHeight: 1.5 }}>
                  Based in the United States
                </p>
              </div>

              <a
                href="mailto:charlieclark@gmail.com"
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
