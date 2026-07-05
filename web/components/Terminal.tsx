'use client';

import { useState, useRef, useEffect } from 'react';
import type { Category } from '@/lib/canvasLayout';

interface TerminalProps {
  activeFilter: Category | null;
  onCommand: (cmd: string) => void;
}

const COMMANDS = [
  { label: 'work', col: 0 },
  { label: 'photo', col: 0 },
  { label: 'info', col: 1 },
  { label: 'playground', col: 1, disabled: true },
  { label: 'esc', col: 2 },
  { label: 'help', col: 2 },
] as const;

export default function Terminal({ activeFilter, onCommand }: TerminalProps) {
  const [input, setInput] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    if (cmd) {
      onCommand(cmd);
      setInput('');
    }
  };

  const handleChipClick = (label: string) => {
    onCommand(label);
  };

  // Blinking cursor animation
  const [cursorVisible, setCursorVisible] = useState(true);
  useEffect(() => {
    if (focused) return;
    const id = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(id);
  }, [focused]);

  const col0 = COMMANDS.filter((c) => c.col === 0);
  const col1 = COMMANDS.filter((c) => c.col === 1);
  const col2 = COMMANDS.filter((c) => c.col === 2);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 28,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(640px, 92vw)',
        background: '#FAFAFB',
        border: '1px solid #E5E4E6',
        borderRadius: 6,
        boxShadow: '0 20px 48px rgba(24,24,27,0.10)',
        zIndex: 100,
        padding: '14px 18px 16px',
        fontFamily: 'var(--font-mono)',
      }}
    >
      {/* Input row */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ color: '#86858C', fontSize: '0.75rem', flexShrink: 0 }}>&#9654;</span>
        {!focused && !input && (
          <div
            style={{
              width: 1.5,
              height: 16,
              background: cursorVisible ? '#18181B' : 'transparent',
              flexShrink: 0,
              transition: 'background 0.05s',
            }}
          />
        )}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={focused ? '' : ''}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            font: "400 0.8125rem var(--font-mono)",
            color: '#18181B',
            caretColor: '#18181B',
          }}
        />
      </form>

      {/* Labels row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ font: "500 0.625rem var(--font-mono)", textTransform: 'uppercase', color: '#9B9AA0', letterSpacing: '0.06em' }}>
          Available commands
        </span>
        <span style={{ font: "400 0.625rem var(--font-mono)", color: '#9B9AA0' }}>
          scroll to zoom
        </span>
      </div>

      {/* Command grid — 3 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {col0.map((c) => (
            <Chip key={c.label} label={c.label} active={activeFilter === c.label} onClick={() => handleChipClick(c.label)} />
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {col1.map((c) => (
            <Chip key={c.label} label={c.label} disabled={'disabled' in c && c.disabled} onClick={() => handleChipClick(c.label)} />
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {col2.map((c) => (
            <Chip key={c.label} label={c.label} onClick={() => handleChipClick(c.label)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Chip({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={disabled ? 'Coming soon' : undefined}
      style={{
        padding: '6px 12px',
        borderRadius: 4,
        border: 'none',
        font: "500 0.6875rem var(--font-mono)",
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: active ? '#18181B' : disabled ? '#F0EFF1' : hovered ? '#E1E0E4' : '#ECEBEE',
        color: active ? '#FFFFFF' : disabled ? '#9B9AA0' : '#18181B',
        transition: 'background 0.12s ease, color 0.12s ease',
        textAlign: 'left',
      }}
    >
      {label}
    </button>
  );
}
