'use client';

import Image from 'next/image';
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
  const allImages = gallery.length > 0 ? gallery : item.coverImageUrl ? [item.coverImageUrl] : [];

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
          width: 'min(1200px, 94vw)',
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
            padding: '16px clamp(24px, 4vw, 44px)',
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

        {/* Body — Swiss style */}
        <div style={{ padding: 'clamp(32px, 5vw, 56px) clamp(24px, 4vw, 48px)' }}>

          {/* Section 01 — Project overview (25/75 split) */}
          <div style={{ display: 'flex', gap: 'clamp(20px, 3vw, 40px)', marginBottom: 'clamp(40px, 5vw, 64px)' }}>
            {/* Left column — section label (25%) */}
            <div style={{ flex: '0 0 25%', minWidth: 100 }}>
              <span style={{ font: "500 0.6875rem var(--font-mono)", color: '#9B9AA0', display: 'block', marginBottom: 6 }}>
                (01)
              </span>
              <span style={{ font: "500 0.6875rem var(--font-mono)", color: '#9B9AA0', lineHeight: 1.4, display: 'block' }}>
                Project<br />overview
              </span>
            </div>

            {/* Right column — content (75%) */}
            <div style={{ flex: 1 }}>
              <h2 style={{ font: "700 clamp(1.5rem, 3vw, 2.25rem) var(--font-grotesk)", color: '#18181B', margin: '0 0 24px', lineHeight: 1.15 }}>
                {item.desc || item.title}
              </h2>

              {item.desc && item.desc !== item.title && (
                <p style={{ font: "400 0.9375rem var(--font-grotesk)", color: '#58565D', lineHeight: 1.65, margin: 0, maxWidth: 540 }}>
                  {item.desc}
                </p>
              )}
            </div>
          </div>

          {/* Section 02 — Details (25/75 split) */}
          <div style={{ display: 'flex', gap: 'clamp(20px, 3vw, 40px)', marginBottom: 'clamp(40px, 5vw, 64px)' }}>
            {/* Left column — section label */}
            <div style={{ flex: '0 0 25%', minWidth: 100 }}>
              <span style={{ font: "500 0.6875rem var(--font-mono)", color: '#9B9AA0', display: 'block', marginBottom: 6 }}>
                (02)
              </span>
              <span style={{ font: "500 0.6875rem var(--font-mono)", color: '#9B9AA0', display: 'block' }}>
                Details
              </span>
            </div>

            {/* Right column — metadata table */}
            <div style={{ flex: 1 }}>
              <div style={{ borderTop: '1px solid #E5E4E6' }}>
                {item.tags && <MetaRow label="Services" value={item.tags} />}
                {item.client && <MetaRow label="Client" value={item.client} />}
                {item.role && <MetaRow label="Role" value={item.role} />}
                <MetaRow label="Year" value={String(item.year)} />
              </div>
            </div>
          </div>

          {/* Gallery — images with container dividers, not image borders */}
          {allImages.length > 0 && (
            <div>
              {/* Pair images side by side when there are multiple, with divider lines between containers */}
              {(() => {
                const rows: string[][] = [];
                for (let i = 0; i < allImages.length; i += 2) {
                  if (i + 1 < allImages.length) {
                    rows.push([allImages[i], allImages[i + 1]]);
                  } else {
                    rows.push([allImages[i]]);
                  }
                }
                return rows.map((row, ri) => (
                  <div key={ri}>
                    {ri > 0 && <div style={{ borderTop: '1px solid #E5E4E6', margin: '20px 0' }} />}
                    <div style={{ display: 'flex', gap: 20 }}>
                      {row.map((url, ci) => (
                        <div key={ci} style={{ flex: 1, position: 'relative' }}>
                          {/* Vertical divider between side-by-side images */}
                          {ci > 0 && (
                            <div style={{ position: 'absolute', left: -10, top: 0, bottom: 0, width: 1, background: '#E5E4E6' }} />
                          )}
                          <Image
                            src={url}
                            alt=""
                            width={1200}
                            height={800}
                            sizes={row.length > 1 ? '(max-width: 1200px) 47vw, 560px' : '(max-width: 1200px) 94vw, 1120px'}
                            loading="lazy"
                            placeholder="empty"
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        padding: '14px 0',
        borderBottom: '1px solid #E5E4E6',
      }}
    >
      <span style={{ font: "500 0.875rem var(--font-grotesk)", color: '#18181B' }}>
        {label}
      </span>
      <span style={{ font: "400 0.875rem var(--font-grotesk)", color: '#18181B', textAlign: 'right' }}>
        {value}
      </span>
    </div>
  );
}
