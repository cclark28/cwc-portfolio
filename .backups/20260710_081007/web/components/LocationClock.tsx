'use client';

import { useState, useEffect } from 'react';
import { useScrambleText } from '@/lib/useScrambleText';

// Rotating availability messages — witty, always open to collaborate
const AVAILABILITY_MESSAGES = [
  'Available for talks & work',
  'Open to collaborate',
  'Let\'s make something together',
  'Taking on new projects',
  'Always down to talk shop',
  'Ready for the next challenge',
  'Open for creative partnerships',
  'Drop a line, let\'s build',
  'Currently booking Q3 & Q4',
  'Let\'s grab a coffee (virtual or not)',
  'Here for the interesting problems',
  'Curious? So am I — let\'s talk',
];

interface LocationClockProps {
  city?: string;
  country?: string;
  timezone?: string;
  latitude?: string;
  longitude?: string;
  email?: string;
}

export default function LocationClock(props: LocationClockProps) {
  // Sanity returns null for empty fields, which bypasses JS defaults — coalesce here
  const city = props.city ?? 'Indianapolis';
  const country = props.country ?? 'USA';
  const timezone = props.timezone ?? 'America/Indiana/Indianapolis';
  const latitude = props.latitude ?? '39.7684° N';
  const longitude = props.longitude ?? '86.1581° W';
  const email = props.email ?? 'charlieclark@gmail.com';
  const [time, setTime] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [availIdx, setAvailIdx] = useState(0);
  const [scrambleKey, setScrambleKey] = useState(0);

  // Pick initial availability message from day-of-year
  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
    setAvailIdx(dayOfYear % AVAILABILITY_MESSAGES.length);
    setMounted(true);
  }, []);

  // Rotate availability message every 12 seconds
  useEffect(() => {
    if (!mounted) return;
    const id = setInterval(() => {
      setAvailIdx((prev) => (prev + 1) % AVAILABILITY_MESSAGES.length);
      setScrambleKey((k) => k + 1);
    }, 12000);
    return () => clearInterval(id);
  }, [mounted]);

  // Live clock
  useEffect(() => {
    const format = () => {
      try {
        return new Date().toLocaleTimeString('en-US', {
          timeZone: timezone,
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });
      } catch {
        return new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });
      }
    };
    setTime(format());
    const id = setInterval(() => setTime(format()), 1000);
    return () => clearInterval(id);
  }, [timezone]);

  // Scramble animations — staggered delays for cascading reveal
  const availText = useScrambleText(
    AVAILABILITY_MESSAGES[availIdx] || AVAILABILITY_MESSAGES[0],
    200,
    scrambleKey
  );
  const cityText = useScrambleText(`${city}, ${country}`, 400, 0);
  const latText = useScrambleText(latitude, 600, 0);
  const lngText = useScrambleText(longitude, 700, 0);

  if (!time || !mounted) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 96,
        right: 'clamp(12px, 2vw, 20px)',
        zIndex: 90,
        pointerEvents: 'none',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        width: 'min(220px, 40vw)',
      }}
    >
      {/* Panel container */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}
      >
        {/* Availability message — clickable mailto */}
        <a
          href={`mailto:${email}`}
          style={{
            font: "400 0.5625rem/1.4 var(--font-mono)",
            color: '#9B9AA0',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            textAlign: 'right',
            paddingBottom: 8,
            minHeight: 20,
            display: 'block',
            textDecoration: 'none',
            pointerEvents: 'auto',
            cursor: 'pointer',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#1A1A1A'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#9B9AA0'; }}
        >
          {availText}
        </a>

        {/* Divider */}
        <div style={{ borderBottom: '1px solid #E5E4E6', width: '100%' }} />

        {/* Clock */}
        <div
          style={{
            font: "500 1.5rem/1 var(--font-mono)",
            color: '#1A1A1A',
            letterSpacing: '-0.01em',
            fontVariantNumeric: 'tabular-nums',
            textAlign: 'right',
            padding: '10px 0',
          }}
        >
          {time}
        </div>

        {/* Divider */}
        <div style={{ borderBottom: '1px solid #E5E4E6', width: '100%' }} />

        {/* City, Country */}
        <div
          style={{
            font: "500 0.6875rem/1 var(--font-mono)",
            color: '#1A1A1A',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            textAlign: 'right',
            padding: '8px 0',
          }}
        >
          {cityText}
        </div>

        {/* Divider */}
        <div style={{ borderBottom: '1px solid #E5E4E6', width: '100%' }} />

        {/* GPS Coordinates */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
            padding: '8px 0 0',
          }}
        >
          <span
            style={{
              font: "400 0.5rem/1 var(--font-mono)",
              color: '#C4C3C8',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {latText}
          </span>
          <span
            style={{
              font: "400 0.5rem/1 var(--font-mono)",
              color: '#C4C3C8',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {lngText}
          </span>
        </div>
      </div>
    </div>
  );
}
