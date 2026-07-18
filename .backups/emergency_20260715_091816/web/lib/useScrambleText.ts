'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface ScrambleOptions {
  delay?: number;
}

export function useScrambleText(text: string, options: ScrambleOptions = {}) {
  const { delay = 0 } = options;
  const [display, setDisplay] = useState('');
  const animationRef = useRef<number | null>(null);
  const isMounted = useRef(true);

  const startScramble = useCallback((targetText: string) => {
    if (!targetText) {
      setDisplay('');
      return;
    }

    let i = 0;
    const scrambleStep = () => {
      if (!isMounted.current) return;

      if (i < targetText.length) {
        setDisplay(targetText.slice(0, i + 1) + 
          Array.from({ length: Math.max(0, targetText.length - i - 3) }, () => 
            String.fromCharCode(33 + Math.floor(Math.random() * 90))
          ).join(''));
        i++;
        animationRef.current = window.setTimeout(scrambleStep, 30);
      } else {
        setDisplay(targetText);
      }
    };

    if (animationRef.current) clearTimeout(animationRef.current);
    setTimeout(scrambleStep, delay);
  }, [delay]);

  useEffect(() => {
    isMounted.current = true;
    startScramble(text);

    return () => {
      isMounted.current = false;
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, [text, startScramble]);

  return display;
}