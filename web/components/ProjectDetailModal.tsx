'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import type { SizedCanvasItem } from '@/lib/canvasLayout';

// Researched stats/facts for project context — null entries are omitted
const PROJECT_STATS: Record<string, string> = {
  'pokemon-black-white-2': 'Pokémon Black 2 & White 2 sold over 8.5 million copies worldwide.',
  'pokemon-rumble-blast': 'Pokémon Rumble Blast sold over 340,000 copies in Japan alone.',
  'asian-art-museum-san-francisco': 'The exhibit featured 10 life-size warriors — the most ever permitted outside China at once.',
  'wargaming': 'World of Tanks hit 75 million registered players worldwide by 2013.',
  'fieldcraft-survival': 'Founded by Mike Glover, an 18-year Army Special Forces veteran and former CIA contractor.',
  'skycurser': 'SKYCURSER ships as a dedicated arcade cabinet and is now in arcades worldwide.',
  'ronin-tactics': 'Founded by Tu Lam, a retired Army Special Operations Master Sergeant.',
  'gungeon': 'The arcade cabinet features a 43-inch UHD display and dual Sinden lightguns.',
};

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

        {/* Body — Swiss style */}
        <div style={{ padding: 'clamp(32px, 5vw, 56px) clamp(24px, 4vw, 48px)' }}>

          {/* Section 01 — Project overview (25/75 split, stacks on narrow) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(12px, 3vw, 40px)', marginBottom: 'clamp(40px, 5vw, 64px)' }}>
            {/* Left column — section label (25%, full-width on narrow) */}
            <div style={{ flex: '0 0 25%', minWidth: 100 }}>
              <span style={{ font: "500 0.6875rem var(--font-mono)", color: '#9B9AA0', display: 'block', marginBottom: 6 }}>
                (01)
              </span>
              <span style={{ font: "500 0.6875rem var(--font-mono)", color: '#9B9AA0', lineHeight: 1.4, display: 'block' }}>
                Project<br />overview
              </span>
            </div>

            {/* Right column — title is the hero, then description */}
            <div style={{ flex: 1 }}>
              <h2 style={{ font: "700 clamp(2rem, 4vw, 3rem) var(--font-grotesk)", color: '#18181B', margin: '0 0 20px', lineHeight: 1.1, letterSpacing: '-0.01em' }}>
                {item.title}
              </h2>

              {item.desc && typeof item.desc === 'string' && (
                <p style={{ font: "400 0.9375rem var(--font-grotesk)", color: '#58565D', lineHeight: 1.65, margin: 0, maxWidth: 540 }}>
                  {item.desc}
                </p>
              )}

              {/* Subtitle — project stats/facts from lookup */}
              {PROJECT_STATS[item.slug] && (
                <p style={{ font: "400 0.8125rem var(--font-grotesk)", color: '#9B9AA0', lineHeight: 1.55, margin: '16px 0 0', maxWidth: 540 }}>
                  {PROJECT_STATS[item.slug]}
                </p>
              )}
            </div>
          </div>

          {/* Section 02 — Details (25/75 split, stacks on narrow) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(12px, 3vw, 40px)', marginBottom: 'clamp(40px, 5vw, 64px)' }}>
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

{/* Gallery — Bento style: clean contained images */}
{allImages.length > 0 && (
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '40px',
    padding: '20px 0',
  }}>
    {allImages.map((url, index) => (
      <div 
        key={index}
        style={{
          padding: '20px',
          border: '1px solid #E5E4E6',
          background: '#FAFAFB',
          borderRadius: '4px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '320px',
        }}
      >
        <Image
          src={url}
          alt=""
          width={1200}
          height={800}
          sizes="(max-width: 1200px) 100vw, 560px"
          loading="lazy"
          placeholder="empty"
          style={{ 
            width: '100%', 
            height: 'auto', 
            maxHeight: '520px',
            objectFit: 'contain',
            display: 'block' 
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