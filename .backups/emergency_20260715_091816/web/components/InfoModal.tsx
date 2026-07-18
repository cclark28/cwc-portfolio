'use client';

import React, { useEffect, useRef } from 'react';
import { useScrambleText } from '../lib/useScrambleText';

interface InfoModalProps {
  onClose: () => void;
  aboutData: any;
}

export default function InfoModal({ onClose, aboutData }: InfoModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const name = aboutData?.name || aboutData?.heroName || 'Charles W Clark';
  const bio = aboutData?.bio || aboutData?.heroBio || 'Senior visual designer';

  const nameScramble = useScrambleText(name, { delay: 100 });
  const bioScramble = useScrambleText(bio, { delay: 200 });

  useEffect(() => {
    modalRef.current?.focus();
  }, []);

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div ref={modalRef} className="modal-content" onClick={e => e.stopPropagation()} tabIndex={-1}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2 className="modal-headline">{nameScramble}</h2>
        <p className="modal-bio">{bioScramble}</p>
        <a href={`mailto:${aboutData?.email || aboutData?.contactEmail}`} className="meta-link">
          {aboutData?.email || aboutData?.contactEmail}
        </a>
      </div>
    </div>
  );
}