'use client';

import { useState, useEffect } from 'react';

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';

/**
 * Typewriter-decode animation: starts with random characters,
 * then locks in the real text left-to-right with jittery timing.
 */
export function useScrambleText(text: string, delay: number = 0, triggerKey: number = 0): string {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    if (!text) { setDisplay(''); return; }
    setDisplay(
      text
        .split('')
        .map((ch) =>
          ch === ' ' ? ' ' : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
        )
        .join('')
    );

    const lockedCount = { current: 0 };
    let scrambleInterval: ReturnType<typeof setInterval> | null = null;
    const lockTimeouts: ReturnType<typeof setTimeout>[] = [];

    const startTimeout = setTimeout(() => {
      scrambleInterval = setInterval(() => {
        setDisplay((prev) => {
          const chars = prev.split('');
          for (let i = lockedCount.current; i < text.length; i++) {
            if (text[i] === ' ') continue;
            chars[i] = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          }
          return chars.join('');
        });
      }, 30);

      const lockOne = () => {
        if (lockedCount.current >= text.length) {
          if (scrambleInterval) clearInterval(scrambleInterval);
          setDisplay(text);
          return;
        }
        while (lockedCount.current < text.length && text[lockedCount.current] === ' ') {
          lockedCount.current++;
        }
        if (lockedCount.current < text.length) {
          const idx = lockedCount.current;
          setDisplay((prev) => {
            const chars = prev.split('');
            chars[idx] = text[idx];
            return chars.join('');
          });
          lockedCount.current++;
        }
      };

      const scheduleNext = () => {
        const jitter = 40 + Math.random() * 40;
        const t = setTimeout(() => {
          lockOne();
          if (lockedCount.current < text.length) {
            scheduleNext();
          }
        }, jitter);
        lockTimeouts.push(t);
      };
      scheduleNext();
    }, delay);

    return () => {
      clearTimeout(startTimeout);
      if (scrambleInterval) clearInterval(scrambleInterval);
      lockTimeouts.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, delay, triggerKey]);

  return display;
}
