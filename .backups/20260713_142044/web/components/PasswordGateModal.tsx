'use client';

import { useEffect, useState } from 'react';
import type { SizedCanvasItem } from '@/lib/canvasLayout';

const UNLOCK_KEY = 'cwc_unlocked';

interface PasswordGateModalProps {
  item: SizedCanvasItem;
  sitePassword?: string;
  onUnlocked: () => void;
  onClose: () => void;
}

export function isUnlocked(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(UNLOCK_KEY) === 'true';
}

export function setUnlocked() {
  localStorage.setItem(UNLOCK_KEY, 'true');
}

export default function PasswordGateModal({ item, sitePassword, onUnlocked, onClose }: PasswordGateModalProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === sitePassword) {
      setUnlocked();
      onUnlocked();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  };

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
          width: 'min(360px, 90vw)',
          background: '#FFFFFF',
          borderRadius: 6,
          padding: '36px 28px',
          textAlign: 'center',
        }}
      >
        {/* Lock icon */}
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#58565D"
          strokeWidth={1.4}
          style={{ marginBottom: 16 }}
        >
          <rect x="5" y="11" width="14" height="9" rx="1" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>

        <h3 style={{ font: "600 1.125rem var(--font-grotesk)", color: '#18181B', margin: '0 0 6px' }}>
          &ldquo;{item.title}&rdquo; is private
        </h3>
        <p style={{ font: "400 0.8125rem var(--font-grotesk)", color: '#86858C', margin: '0 0 24px' }}>
          One password unlocks every private item.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
            placeholder="Enter password"
            style={{
              padding: '10px 14px',
              border: `1px solid ${error ? '#C4453F' : '#E5E4E6'}`,
              borderRadius: 4,
              font: "400 0.875rem var(--font-grotesk)",
              color: '#18181B',
              outline: 'none',
              transition: 'border-color 0.15s',
            }}
          />
          {error && (
            <span style={{ font: "400 0.75rem var(--font-grotesk)", color: '#C4453F' }}>
              Incorrect password
            </span>
          )}
          <button
            type="submit"
            style={{
              padding: '10px 0',
              background: '#FF5A1F',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 4,
              font: "600 0.875rem var(--font-grotesk)",
              cursor: 'pointer',
            }}
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
}
