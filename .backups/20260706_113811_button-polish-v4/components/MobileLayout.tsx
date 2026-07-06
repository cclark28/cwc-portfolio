'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { SizedCanvasItem } from '@/lib/canvasLayout';
import ProjectDetailModal from '@/components/ProjectDetailModal';
import InfoModal from '@/components/InfoModal';
import PasswordGateModal, { isUnlocked, setUnlocked } from '@/components/PasswordGateModal';

interface MobileLayoutProps {
  work: SizedCanvasItem[];
  photo: SizedCanvasItem[];
  playground?: SizedCanvasItem[];
  sitePassword?: string;
  passwordEnabled?: boolean;
}

export default function MobileLayout({ work, photo, playground = [], sitePassword, passwordEnabled }: MobileLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SizedCanvasItem | null>(null);
  const [passwordItem, setPasswordItem] = useState<SizedCanvasItem | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const handleItemClick = (item: SizedCanvasItem) => {
    if (item.private && passwordEnabled && sitePassword && !isUnlocked()) {
      setPasswordItem(item);
    } else {
      setSelectedItem(item);
    }
  };

  // Group items by year
  const workByYear = groupByYear(work);
  const photoByYear = groupByYear(photo);
  const playgroundByYear = groupByYear(playground);

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFB' }}>
      {/* Sticky header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          height: 56,
          background: '#FAFAFB',
          borderBottom: '1px solid #E5E4E6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
        }}
      >
        <span style={{ font: "700 0.9375rem var(--font-grotesk)", letterSpacing: '0.02em' }}>CLARK</span>
        <button
          onClick={() => setMenuOpen(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#18181B" strokeWidth={1.8}>
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
      </div>

      {/* Desktop notice */}
      <div
        style={{
          margin: '16px 16px 0',
          padding: '14px 16px',
          background: '#ECEBEE',
          borderRadius: 6,
          font: "400 0.8125rem var(--font-grotesk)",
          color: '#58565D',
          lineHeight: 1.5,
        }}
      >
        This site is built for an experience-driven design — for the full, more enjoyable experience, visit on desktop.
      </div>

      {/* Content */}
      <div style={{ padding: '24px 16px 80px' }}>
        <div id="section-work">
          <SectionAccordions title="Work" groups={workByYear} onItemClick={handleItemClick} />
        </div>
        <div style={{ height: 32 }} />
        <div id="section-photo">
          <SectionAccordions title="Photography" groups={photoByYear} onItemClick={handleItemClick} />
        </div>
        {playgroundByYear.length > 0 && (
          <>
            <div style={{ height: 32 }} />
            <div id="section-playground">
              <SectionAccordions title="Playground" groups={playgroundByYear} onItemClick={handleItemClick} />
            </div>
          </>
        )}
      </div>

      {/* Slide-in drawer */}
      {menuOpen && (
        <>
          <div
            onClick={() => setMenuOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(24,24,27,0.3)', zIndex: 100 }}
          />
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 'min(300px, 80vw)',
              background: '#FFFFFF',
              zIndex: 101,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              boxShadow: '-10px 0 30px rgba(24,24,27,0.08)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button
                className="close-btn"
                onClick={() => setMenuOpen(false)}
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
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
                <span style={{ font: "500 0.5625rem var(--font-mono)", textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Close
                </span>
              </button>
            </div>
            {/* Category filters */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              <CategoryPill label="Work" onClick={() => { setMenuOpen(false); setTimeout(() => document.getElementById('section-work')?.scrollIntoView({ behavior: 'smooth' }), 150); }} />
              <CategoryPill label="Photography" onClick={() => { setMenuOpen(false); setTimeout(() => document.getElementById('section-photo')?.scrollIntoView({ behavior: 'smooth' }), 150); }} />
              {playground.length > 0 && (
                <CategoryPill label="Playground" onClick={() => { setMenuOpen(false); setTimeout(() => document.getElementById('section-playground')?.scrollIntoView({ behavior: 'smooth' }), 150); }} />
              )}
            </div>
            <DrawerLink label="Info" onClick={() => { setMenuOpen(false); setShowInfo(true); }} />
            <DrawerLink label="Contact" onClick={() => { setMenuOpen(false); setShowInfo(true); }} />
            <div style={{ marginTop: 'auto' }}>
              <a
                href="mailto:charlieclark@gmail.com"
                style={{ font: "500 0.875rem var(--font-grotesk)", color: '#4D80E6', textDecoration: 'none' }}
              >
                Say hello &rarr;
              </a>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
      {selectedItem && <ProjectDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
      {passwordItem && (
        <PasswordGateModal
          item={passwordItem}
          sitePassword={sitePassword}
          onClose={() => setPasswordItem(null)}
          onUnlocked={() => {
            setUnlocked();
            const item = passwordItem;
            setPasswordItem(null);
            setSelectedItem(item);
          }}
        />
      )}
    </div>
  );
}

/* ---------- helpers ---------- */

function groupByYear(items: SizedCanvasItem[]): { year: number; items: SizedCanvasItem[] }[] {
  const map = new Map<number, SizedCanvasItem[]>();
  items.forEach((item) => {
    const arr = map.get(item.year) || [];
    arr.push(item);
    map.set(item.year, arr);
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => b - a)
    .map(([year, items]) => ({ year, items }));
}

function SectionAccordions({
  title,
  groups,
  onItemClick,
}: {
  title: string;
  groups: { year: number; items: SizedCanvasItem[] }[];
  onItemClick: (item: SizedCanvasItem) => void;
}) {
  return (
    <div>
      <h2 style={{ font: "700 1.25rem var(--font-grotesk)", color: '#18181B', margin: '0 0 12px' }}>{title}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {groups.map((g) => (
          <YearAccordion key={g.year} year={g.year} items={g.items} onItemClick={onItemClick} />
        ))}
      </div>
    </div>
  );
}

function YearAccordion({
  year,
  items,
  onItemClick,
}: {
  year: number;
  items: SizedCanvasItem[];
  onItemClick: (item: SizedCanvasItem) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ border: '1px solid #E5E4E6', borderRadius: 6, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: open ? '#ECEBEE' : '#FFFFFF',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ font: "500 0.8125rem var(--font-mono)", color: '#18181B' }}>{year}</span>
        <span style={{ font: "400 0.75rem var(--font-grotesk)", color: '#9B9AA0' }}>
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </button>
      {open && (
        <div style={{ borderTop: '1px solid #E5E4E6' }}>
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onItemClick(item)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                padding: '12px 16px',
                background: '#FFFFFF',
                border: 'none',
                borderBottom: '1px solid #F0EFF1',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              {/* Thumbnail */}
              <div style={{ width: 48, height: 36, borderRadius: 3, overflow: 'hidden', flexShrink: 0, background: '#ECEBEE' }}>
                {item.coverImageUrl && (
                  <Image
                    src={item.coverImageUrl}
                    alt=""
                    width={48}
                    height={36}
                    loading="lazy"
                    placeholder="empty"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ font: "500 0.8125rem var(--font-grotesk)", color: '#18181B', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.title}
                </span>
              </div>
              {item.private && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9B9AA0" strokeWidth={1.6} style={{ flexShrink: 0 }}>
                  <rect x="5" y="11" width="14" height="9" rx="1" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryPill({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: '#ECEBEE',
        border: 'none',
        cursor: 'pointer',
        font: "500 0.6875rem var(--font-mono)",
        color: '#18181B',
        padding: '6px 14px',
        borderRadius: 9999,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}
    >
      {label}
    </button>
  );
}

function DrawerLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        font: "500 1rem var(--font-grotesk)",
        color: '#18181B',
        padding: '10px 0',
        textAlign: 'left',
        borderBottom: '1px solid #F0EFF1',
      }}
    >
      {label}
    </button>
  );
}
