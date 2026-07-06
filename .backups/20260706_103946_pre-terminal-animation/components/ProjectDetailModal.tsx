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

        {/* Body */}
        <div style={{ padding: 'clamp(24px, 4vw, 48px) clamp(24px, 4vw, 44px) clamp(32px, 5vw, 56px)' }}>
          {/* Metadata + description row */}
          <div style={{ display: 'flex', gap: 'clamp(24px, 4vw, 40px)', marginBottom: 'clamp(24px, 3vw, 36px)', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px', minWidth: 280 }}>
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

            {/* Hero image next to text */}
            {allImages[0] && (
              <div style={{ flex: '1 1 400px', maxWidth: 600 }}>
                <Image
                  src={allImages[0]}
                  alt=""
                  width={1200}
                  height={800}
                  sizes="(max-width: 1200px) 94vw, 600px"
                  loading="lazy"
                  placeholder="empty"
                  style={{ width: '100%', height: 'auto', borderRadius: 4, display: 'block' }}
                />
              </div>
            )}
          </div>

          {/* Gallery — horizontal flow, wrapping */}
          {allImages.length > 1 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'clamp(12px, 2vw, 20px)',
              }}
            >
              {allImages.slice(1).map((url, i) => (
                <div
                  key={i}
                  style={{
                    flex: '1 1 auto',
                    maxWidth: allImages.length <= 3 ? '100%' : '49%',
                    minWidth: 200,
                  }}
                >
                  <Image
                    src={url}
                    alt=""
                    width={1200}
                    height={800}
                    sizes="(max-width: 1200px) 94vw, 600px"
                    loading="lazy"
                    placeholder="empty"
                    style={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: 4,
                      display: 'block',
                    }}
                  />
                </div>
              ))}
            </div>
          )}
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
