'use client';

import { useState, useRef, useEffect } from 'react';
import type { Category } from '@/lib/canvasLayout';
import type { CommandModuleConfig } from '@/components/HomeClient';

interface TerminalProps {
  activeFilter: Category | null;
  onCommand: (cmd: string) => void;
  config?: CommandModuleConfig | null;
}

export default function Terminal({ activeFilter, onCommand, config }: TerminalProps) {
  const [input, setInput] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build commands list from config (defaults to all visible)
  const showWork = config?.showWork !== false;
  const showPhoto = config?.showPhoto !== false;
  const showPlayground = config?.showPlayground !== false;
  const showInfo = config?.showInfo !== false;
  const showHelp = config?.showHelp !== false;
  const showEsc = config?.showEsc !== false;

  const workLabel = config?.workLabel || 'work';
  const photoLabel = config?.photoLabel || 'photo';
  const playgroundLabel = config?.playgroundLabel || 'playground';
  const placeholder = config?.placeholder || 'type a command — work, photo, info…';
  const hint = config?.hint || 'scroll to zoom';

  type Command = { label: string; command: string; col: number; suffix?: string };
  const commands: Command[] = [];

  if (showWork) commands.push({ label: workLabel, command: 'work', col: 0 });
  if (showPhoto) commands.push({ label: photoLabel, command: 'photo', col: 0 });
  if (showInfo) commands.push({ label: 'info', command: 'info', col: 1 });
  if (showPlayground) commands.push({ label: playgroundLabel, command: 'playground', col: 1 });
  if (showEsc) commands.push({ label: 'esc', command: 'esc', col: 2, suffix: '- back' });
  if (showHelp) commands.push({ label: 'help', command: 'help', col: 2 });

  const col0 = commands.filter((c) => c.col === 0);
  const col1 = commands.filter((c) => c.col === 1);
  const col2 = commands.filter((c) => c.col === 2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    if (cmd) {
      onCommand(cmd);
      setInput('');
    }
  };

  const handleChipClick = (command: string) => {
    onCommand(command);
  };

  // Blinking cursor animation
  const [cursorVisible, setCursorVisible] = useState(true);
  useEffect(() => {
    if (focused) return;
    const id = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(id);
  }, [focused]);

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
        padding: '16px 20px 18px',
        fontFamily: 'var(--font-mono)',
      }}
    >
      {/* Input row */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ color: '#86858C', fontSize: '0.875rem', flexShrink: 0 }}>&#9654;</span>
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
          placeholder={placeholder}
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

      {/* Dashed separator */}
      <div style={{ borderTop: '1px dashed #D4D3D8', marginBottom: 14 }} />

      {/* Labels row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ font: "500 0.625rem var(--font-mono)", textTransform: 'uppercase', color: '#9B9AA0', letterSpacing: '0.06em' }}>
          Available commands:
        </span>
        <span style={{ font: "400 0.625rem var(--font-mono)", color: '#9B9AA0' }}>
          {hint}
        </span>
      </div>

      {/* Command grid — 3 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {col0.map((c) => (
            <Chip key={c.command} label={c.label} active={activeFilter === c.command} onClick={() => handleChipClick(c.command)} />
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {col1.map((c) => (
            <Chip key={c.command} label={c.label} active={activeFilter === c.command} onClick={() => handleChipClick(c.command)} />
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {col2.map((c) => (
            <div key={c.command} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Chip label={c.label} onClick={() => handleChipClick(c.command)} />
              {c.suffix && (
                <span style={{ font: "400 0.6875rem var(--font-mono)", color: '#9B9AA0', whiteSpace: 'nowrap' }}>
                  {c.suffix}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '8px 16px',
        borderRadius: 4,
        border: 'none',
        font: "500 0.6875rem var(--font-mono)",
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        cursor: 'pointer',
        background: active ? '#18181B' : hovered ? '#E1E0E4' : '#ECEBEE',
        color: active ? '#FFFFFF' : '#18181B',
        transitionProperty: 'background, color',
        transitionDuration: '0.12s, 0.12s',
        transitionTimingFunction: 'ease, ease',
        textAlign: 'left',
      }}
    >
      {label}
    </button>
  );
}
