'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface ScrambleOptions {
  delay?: number;
  speed?: number;
  key?: string;
}

export function useScrambleText(text: string, options: ScrambleOptions = {}) {
  const { delay = 0, speed = 40, key } = options;
  
  const [display, setDisplay] = useState('');
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  const scramble = useCallback((target: string) => {
    if (!target) {
      setDisplay('');
      return;
    }

    const characters = target.split('');
    let currentIndex = 0;

    const animate = (timestamp: number) => {
      if (!mountedRef.current) return;

      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;

      if (elapsed < delay) {
        frameRef.current = requestAnimationFrame(animate);
        return;
      }

      // Reveal characters progressively
      const progress = Math.floor((elapsed - delay) / speed);
      currentIndex = Math.min(progress, characters.length);

      let scrambled = characters.slice(0, currentIndex).join('');

      // Add random characters at the end while animating
      if (currentIndex < characters.length) {
        const remaining = characters.length - currentIndex;
        scrambled += Array.from({ length: Math.min(3, remaining) }, () => 
          String.fromCharCode(33 + Math.floor(Math.random() * 94))
        ).join('');
      }

      setDisplay(scrambled);

      if (currentIndex < characters.length) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(target); // Final exact text
      }
    };

    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    startTimeRef.current = null;
    frameRef.current = requestAnimationFrame(animate);
  }, [delay, speed]);

  useEffect(() => {
    mountedRef.current = true;
    scramble(text);

    return () => {
      mountedRef.current = false;
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [text, scramble]); // Stable deps

  return display;
}