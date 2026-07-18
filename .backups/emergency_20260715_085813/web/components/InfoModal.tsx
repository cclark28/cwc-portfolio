'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { useScrambleText } from '../lib/useScrambleText';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  aboutData: any; // from Sanity About singleton
}

export default function InfoModal({ isOpen, onClose, aboutData }: InfoModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Memoize to prevent re-renders triggering hook loop
  const nameText = useMemo(() => aboutData?.name || 'Charles W Clark', [aboutData?.name]);
  const bioText = useMemo(() => aboutData?.bio || '', [aboutData?.bio]);

  const nameScramble = useScrambleText(nameText, { delay: 100 });
  const bioScramble = useScrambleText(bioText, { delay: 150 });

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className="modal-content info-modal"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close modal">×</button>
        
        <div className="info-grid">
          {/* Column 1: Photo */}
          <div className="info-photo-column">
            {aboutData?.photo?.url && (
              <img 
                src={aboutData.photo.url} 
                alt="Charles W Clark" 
                className="modal-photo"
              />
            )}
          </div>

          {/* Column 2: Bio */}
          <div className="info-bio-column">
            <h2 id="modal-title" className="modal-headline">{nameScramble}</h2>
            <div className="modal-bio">
              {bioScramble}
            </div>
            <p className="modal-availability">{aboutData?.availability || ''}</p>
          </div>

          {/* Column 3: Links & Details */}
          <div className="info-links-column">
            <div className="meta-stack">
              <div className="meta-label">Current role</div>
              <div className="meta-value">{aboutData?.currentRole || ''}</div>
            </div>
            <div className="meta-stack">
              <div className="meta-label">Location</div>
              <div className="meta-value">{aboutData?.location || ''}</div>
            </div>
            <div className="meta-stack">
              <div className="meta-label">Email</div>
              <a href={`mailto:${aboutData?.email}`} className="meta-link">{aboutData?.email || ''}</a>
            </div>
            
            {/* Social / Additional links from Sanity if available */}
            {aboutData?.links && aboutData.links.length > 0 && (
              <div className="social-links">
                {aboutData.links.map((link: any, i: number) => (
                  <a 
                    key={i} 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="meta-link"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}