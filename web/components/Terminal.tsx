'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { Category } from '@/lib/canvasLayout';
import type { CommandModuleConfig } from '@/components/HomeClient';
import { useScrambleText } from '@/lib/useScrambleText';

interface TerminalProps {
  activeFilter: Category | null;
  onCommand: (cmd: string) => void;
  config?: CommandModuleConfig | null;
}

export default function Terminal({ activeFilter, onCommand, config }: TerminalProps) {
  const [input, setInput] = useState('');
  const [focused, setFocused] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scramble key: increment to replay the scramble animation
  const [scrambleKey, setScrambleKey] = useState(0);

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

  const handleExpand = useCallback(() => {
    setCollapsed(false);
    setScrambleKey((k) => k + 1);
  }, []);

  // Blinking cursor animation
  const [cursorVisible, setCursorVisible] = useState(true);
  useEffect(() => {
    if (focused) return;
    const id = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(id);
  }, [focused]);

  // Scramble text for static labels (replays on scrambleKey change)
  const scrambledPlaceholder = useScrambleText(placeholder, 0, scrambleKey);
  const scrambledLabel = useScrambleText('Available commands:', 200, scrambleKey);
  const scrambledHint = useScrambleText(hint, 300, scrambleKey);

  // Collapsed pill — open command module
  if (collapsed) {
    return (
      <button
        onClick={handleExpand}
        style={{
          position: 'fixed',
          bottom: 28,
          left: '50%',
          transform: 'translateX(-50%)',
          height: 40,
          background: '#FFFFFF',
          border: '1px solid #E5E4E6',
          borderRadius: 6,
          boxShadow: '0 4px 16px rgba(24,24,27,0.08)',
          zIndex: 100,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          padding: 0,
          transition: 'box-shadow 0.15s ease',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(24,24,27,0.14)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(24,24,27,0.08)'; }}
      >
        {/* Icon container */}
        <span style={{
          width: 38,
          height: 38,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRight: '1px solid #E5E4E6',
          color: '#58565D',
          flexShrink: 0,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
          </svg>
        </span>
        {/* Label */}
        <span style={{
          font: "500 0.6875rem var(--font-mono)",
          color: '#18181B',
          padding: '0 16px',
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
        }}>
          Open commands
        </span>
      </button>
    );
  }

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
        transition: 'opacity 0.2s ease',
      }}
    >
      {/* Collapse toggle — boxed button, top-right */}
      <button
        onClick={() => setCollapsed(true)}
        aria-label="Collapse terminal"
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
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
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
        </svg>
        <span style={{ font: "500 0.5625rem var(--font-mono)", textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Close
        </span>
      </button>

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
          placeholder={scrambledPlaceholder}
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
          {scrambledLabel}
        </span>
        <span style={{ font: "400 0.625rem var(--font-mono)", color: '#9B9AA0' }}>
          {scrambledHint}
        </span>
      </div>

      {/* Command grid — 3 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {col0.map((c, i) => (
            <Chip key={c.command} label={c.label} active={activeFilter === c.command} onClick={() => handleChipClick(c.command)} scrambleDelay={400 + i * 80} scrambleKey={scrambleKey} />
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {col1.map((c, i) => (
            <Chip key={c.command} label={c.label} active={activeFilter === c.command} onClick={() => handleChipClick(c.command)} scrambleDelay={400 + (col0.length + i) * 80} scrambleKey={scrambleKey} />
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {col2.map((c, i) => (
            <div key={c.command} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Chip label={c.label} onClick={() => handleChipClick(c.command)} scrambleDelay={400 + (col0.length + col1.length + i) * 80} scrambleKey={scrambleKey} />
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
  scrambleDelay = 0,
  scrambleKey = 0,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  scrambleDelay?: number;
  scrambleKey?: number;
}) {
  const [hovered, setHovered] = useState(false);
  const scrambledLabel = useScrambleText(label, scrambleDelay, scrambleKey);

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
      {scrambledLabel}
    </button>
  );
}
