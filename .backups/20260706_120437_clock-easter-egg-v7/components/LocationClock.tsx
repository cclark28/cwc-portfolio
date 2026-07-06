'use client';

import { useState, useEffect } from 'react';

interface LocationClockProps {
  city?: string;
  timezone?: string;
}

export default function LocationClock({
  city = 'Indianapolis',
  timezone = 'America/Indiana/Indianapolis',
}: LocationClockProps) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const format = () => {
      try {
        const now = new Date();
        return now.toLocaleTimeString('en-US', {
          timeZone: timezone,
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
      } catch {
        // Invalid timezone — fall back to local
        return new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
      }
    };

    setTime(format());
    const id = setInterval(() => setTime(format()), 1000);
    return () => clearInterval(id);
  }, [timezone]);

  // Don't render until client-side hydration (avoids SSR mismatch)
  if (!time) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 96,
        right: 20,
        zIndex: 90,
        pointerEvents: 'none',
        userSelect: 'none',
        textAlign: 'right',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 2,
      }}
    >
      <span
        style={{
          font: "500 0.875rem var(--font-mono)",
          color: '#9B9AA0',
          letterSpacing: '0.02em',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {time}
      </span>
      <span
        style={{
          font: "400 0.5625rem var(--font-mono)",
          color: '#C4C3C8',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        {city}
      </span>
    </div>
  );
}
