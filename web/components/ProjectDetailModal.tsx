'use client';

import { useEffect } from 'react';
import type { SizedCanvasItem } from '@/lib/canvasLayout';

interface ProjectDetailModalProps {
  item: SizedCanvasItem;
  onClose: () => void;
}

export default function ProjectDetailModal({ item, onClose }: ProjectDetailModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const gallery = item.gallery || [];
  // Pick up to 4 images for the bento grid
  const heroImg = gallery[0] || item.coverImageUrl;
  const img2 = gallery[1];
  const img3 = gallery[2];
  const img4 = gallery[3];

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
          width: 'min(1200px, 94vw)',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ font: "500 0.6875rem var(--font-mono)", textTransform: 'uppercase', letterSpacing: '0.06em', color: '#18181B' }}>
              {item.title}
            </span>
            <span style={{ font: "400 0.6875rem var(--font-mono)", color: '#9B9AA0' }}>
              {item.year}
            </span>
          </div>
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

        {/* Body: two-column */}
        <div
          style={{
            padding: '32px 28px 48px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 36,
          }}
        >
          {/* Left: metadata */}
          <div style={{ minWidth: 280 }}>
            <h2 style={{ font: "700 2rem var(--font-grotesk)", color: '#18181B', margin: '0 0 24px', lineHeight: 1.15 }}>
              {item.title}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
              <MetaRow label="Year" value={String(item.year)} />
              {item.tags && <MetaRow label="Type" value={item.tags} />}
              {item.client && <MetaRow label="Client" value={item.client} />}
              {item.role && <MetaRow label="Role" value={item.role} />}
            </div>

            {item.desc && (
              <p style={{ font: "400 0.9375rem var(--font-grotesk)", color: '#18181B', lineHeight: 1.65, margin: 0 }}>
                {item.desc}
              </p>
            )}
          </div>

          {/* Right: bento image grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Hero — spans full width, 16:9 */}
            {heroImg && (
              <div style={{ width: '100%', aspectRatio: '16 / 9', overflow: 'hidden', borderRadius: 4 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={heroImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            {/* Middle row — two 1:1 side by side */}
            {(img2 || img3) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                {img2 && (
                  <div style={{ aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: 4 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img2} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                {img3 && (
                  <div style={{ aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: 4 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img3} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
            )}

            {/* Bottom — spans full width, 16:9 */}
            {img4 && (
              <div style={{ width: '100%', aspectRatio: '16 / 9', overflow: 'hidden', borderRadius: 4 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img4} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <span style={{ font: "500 0.6875rem var(--font-mono)", textTransform: 'uppercase', letterSpacing: '0.04em', color: '#9B9AA0', width: 52, flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ font: "400 0.875rem var(--font-grotesk)", color: '#18181B' }}>
        {value}
      </span>
    </div>
  );
}
