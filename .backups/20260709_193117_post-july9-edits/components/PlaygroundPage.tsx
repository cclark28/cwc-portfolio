'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { PlaygroundItem } from '@/app/playground/page';

interface PlaygroundPageProps {
  items: PlaygroundItem[];
}

export default function PlaygroundPage({ items }: PlaygroundPageProps) {
  const [lightboxItem, setLightboxItem] = useState<PlaygroundItem | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Sort by year desc, then title asc
  const sorted = [...items]
    .filter((i) => !i.private)
    .sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));

  // Lightbox gallery images
  const lightboxImages = lightboxItem
    ? [
        ...(lightboxItem.coverImageUrl ? [{ url: lightboxItem.coverImageUrl, _type: 'galleryImage' }] : []),
        ...(lightboxItem.gallery?.filter((g) => g._type === 'galleryImage' && g.url) || []),
      ]
    : [];

  function openLightbox(item: PlaygroundItem) {
    setLightboxItem(item);
    setLightboxIndex(0);
  }

  function closeLightbox() {
    setLightboxItem(null);
    setLightboxIndex(0);
  }

  return (
    <>
      <div className="playground-page" style={styles.page}>
        {/* Header */}
        <header style={styles.header}>
          <Link href="/" style={styles.backLink}>
            <span style={styles.arrow}>&larr;</span> Back
          </Link>
          <h1 className="playground-title" style={styles.title}>Playground</h1>
          <p style={styles.subtitle}>
            Experiments, side projects, and things made for fun.
          </p>
        </header>

        {/* Masonry grid */}
        {sorted.length === 0 ? (
          <div style={styles.empty}>
            <p style={styles.emptyText}>Nothing here yet. Check back soon.</p>
          </div>
        ) : (
          <div className="playground-masonry" style={styles.masonry}>
            {sorted.map((item) => (
              <div key={item.id} className="playground-card" style={styles.card}>
                {item.coverImageUrl && (
                  <button
                    onClick={() => openLightbox(item)}
                    style={styles.imageButton}
                    aria-label={`View ${item.title}`}
                  >
                    <Image
                      src={item.coverImageUrl}
                      alt={item.title}
                      width={600}
                      height={400}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      style={styles.image}
                      unoptimized
                    />
                  </button>
                )}

                <div style={styles.cardMeta}>
                  <div style={styles.titleRow}>
                    <h2 style={styles.cardTitle}>{item.title}</h2>
                    {item.externalUrl && (
                      <a
                        href={item.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.externalLink}
                        aria-label={`Visit ${item.title}`}
                      >
                        <ExternalLinkIcon />
                      </a>
                    )}
                  </div>

                  <div style={styles.metaRow}>
                    <span style={styles.year}>{item.year}</span>
                    {item.tags && (
                      <span style={styles.tags}>{item.tags}</span>
                    )}
                  </div>

                  {item.desc && (
                    <p style={styles.desc}>{item.desc}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxItem && lightboxImages.length > 0 && (
        <div style={styles.lightboxOverlay} onClick={closeLightbox}>
          <div style={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button onClick={closeLightbox} style={styles.lightboxClose} aria-label="Close">
              &times;
            </button>

            {lightboxImages[lightboxIndex]?.url && (
              <Image
                src={lightboxImages[lightboxIndex].url!}
                alt={lightboxItem.title}
                width={1200}
                height={800}
                style={styles.lightboxImage}
                unoptimized
              />
            )}

            {lightboxImages.length > 1 && (
              <div style={styles.lightboxNav}>
                <button
                  onClick={() => setLightboxIndex((i) => Math.max(0, i - 1))}
                  disabled={lightboxIndex === 0}
                  style={styles.lightboxArrow}
                >
                  &larr;
                </button>
                <span style={styles.lightboxCount}>
                  {lightboxIndex + 1} / {lightboxImages.length}
                </span>
                <button
                  onClick={() => setLightboxIndex((i) => Math.min(lightboxImages.length - 1, i + 1))}
                  disabled={lightboxIndex === lightboxImages.length - 1}
                  style={styles.lightboxArrow}
                >
                  &rarr;
                </button>
              </div>
            )}

            <div style={styles.lightboxMeta}>
              <h3 style={styles.lightboxTitle}>{lightboxItem.title}</h3>
              <span style={styles.lightboxYear}>{lightboxItem.year}</span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .playground-masonry {
          column-count: 3;
          column-gap: 22px;
        }
        .playground-card {
          break-inside: avoid;
          margin-bottom: 22px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .playground-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        }
        .playground-image-btn:hover img {
          opacity: 0.92;
        }
        @media (max-width: 1024px) {
          .playground-masonry { column-count: 2; }
        }
        @media (max-width: 640px) {
          .playground-masonry { column-count: 1; }
          .playground-page { padding: 40px 20px 60px; }
          .playground-title { font-size: 32px !important; }
        }
      `}</style>
    </>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

// Inline styles — masonry and card classes use the <style> tag above for CSS columns + hover
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#FAFAFB',
    padding: '60px 40px 80px',
    fontFamily: 'var(--font-grotesk), system-ui, sans-serif',
  },
  header: {
    maxWidth: 1200,
    margin: '0 auto 48px',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    color: '#666',
    textDecoration: 'none',
    fontSize: 13,
    fontFamily: 'var(--font-mono), monospace',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    marginBottom: 24,
  },
  arrow: {
    fontSize: 16,
  },
  title: {
    fontSize: 42,
    fontWeight: 600,
    color: '#111',
    margin: '0 0 8px',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    margin: 0,
    fontWeight: 400,
  },
  masonry: {
    maxWidth: 1200,
    margin: '0 auto',
  },
  card: {
    background: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    border: '1px solid #eee',
  },
  imageButton: {
    display: 'block',
    width: '100%',
    padding: 0,
    margin: 0,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
  },
  image: {
    width: '100%',
    height: 'auto',
    display: 'block',
    transition: 'opacity 0.2s ease',
  },
  cardMeta: {
    padding: '14px 16px 16px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#111',
    margin: 0,
    lineHeight: 1.3,
  },
  externalLink: {
    color: '#999',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  year: {
    fontSize: 12,
    fontFamily: 'var(--font-mono), monospace',
    color: '#999',
  },
  tags: {
    fontSize: 11,
    fontFamily: 'var(--font-mono), monospace',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    color: '#aaa',
  },
  desc: {
    fontSize: 14,
    color: '#666',
    margin: '10px 0 0',
    lineHeight: 1.5,
  },
  empty: {
    maxWidth: 1200,
    margin: '80px auto',
    textAlign: 'center' as const,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  // Lightbox
  lightboxOverlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  lightboxContent: {
    position: 'relative' as const,
    maxWidth: 1000,
    width: '100%',
  },
  lightboxClose: {
    position: 'absolute' as const,
    top: -40,
    right: 0,
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: 32,
    cursor: 'pointer',
    lineHeight: 1,
  },
  lightboxImage: {
    width: '100%',
    height: 'auto',
    display: 'block',
    borderRadius: 4,
  },
  lightboxNav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
  },
  lightboxArrow: {
    background: 'none',
    border: '1px solid rgba(255,255,255,0.3)',
    color: '#fff',
    fontSize: 18,
    padding: '6px 14px',
    borderRadius: 4,
    cursor: 'pointer',
  },
  lightboxCount: {
    color: '#ccc',
    fontSize: 13,
    fontFamily: 'var(--font-mono), monospace',
  },
  lightboxMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  lightboxTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 500,
    margin: 0,
  },
  lightboxYear: {
    color: '#888',
    fontSize: 13,
    fontFamily: 'var(--font-mono), monospace',
  },
};
