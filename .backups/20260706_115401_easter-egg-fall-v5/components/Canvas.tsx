'use client';

import Image from 'next/image';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import type { Category, SizedCanvasItem, LayoutPosition } from '@/lib/canvasLayout';
import { centerOn, computeLayout, computeFilteredLayout, computePileLayout, seedFromId as layoutSeedFromId, seededRandom as layoutSeededRandom } from '@/lib/canvasLayout';

interface CanvasProps {
  work: SizedCanvasItem[];
  photo: SizedCanvasItem[];
  playground?: SizedCanvasItem[];
  onOpenProject: (item: SizedCanvasItem) => void;
  cardGap?: number;
  fallenMessage?: string | null;
}

export interface CanvasHandle {
  focusCategory: (cat: Category) => void;
  resetAll: () => void;
  fallCards: () => void;
}

const Canvas = forwardRef<CanvasHandle, CanvasProps>(function Canvas(
  { work, photo, playground = [], onOpenProject, cardGap = 48, fallenMessage },
  ref
) {
  const all = useMemo(() => [...work, ...photo, ...playground], [work, photo, playground]);

  // Full layout = all items in their default scattered positions
  const [fullLayout, setFullLayout] = useState<Record<string, LayoutPosition> | null>(null);
  // Active layout = what cards currently render at (fullLayout or a filtered subset layout)
  const [activeLayout, setActiveLayout] = useState<Record<string, LayoutPosition> | null>(null);

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [wheeling, setWheeling] = useState(false);
  const [filter, setFilter] = useState<Category | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [organized, setOrganized] = useState(false);
  const [fallen, setFallen] = useState(false);
  const [pileLayout, setPileLayout] = useState<Record<string, LayoutPosition> | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pressedId, setPressedId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const panStart = useRef({ x: 0, y: 0 });
  const dragMoved = useRef(false);
  const wheelTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Touch gesture refs
  const touchDragging = useRef(false);
  const pinchStartDist = useRef<number | null>(null);
  const pinchStartScale = useRef(1);

  const panRef = useRef(pan);
  const scaleRef = useRef(scale);
  useEffect(() => { panRef.current = pan; }, [pan]);
  useEffect(() => { scaleRef.current = scale; }, [scale]);

  // Compute centroid of a layout (for pile position)
  const computeCentroid = useCallback((layout: Record<string, LayoutPosition>) => {
    const ids = Object.keys(layout);
    if (ids.length === 0) return { x: 0, y: 0 };
    let sumX = 0, sumY = 0;
    for (const id of ids) {
      sumX += layout[id].x;
      sumY += layout[id].y;
    }
    return { x: sumX / ids.length, y: sumY / ids.length };
  }, []);

  const recompute = useCallback(
    (nextScale?: number, nextFilter?: Category | null, goToPile?: boolean) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const effectiveFilter = nextFilter === undefined ? filter : nextFilter;
      const newFullLayout = computeLayout(work, photo, vw, cardGap, playground);

      setFullLayout(newFullLayout);

      // Compute pile layout centered in the full layout's centroid
      const centroid = computeCentroid(newFullLayout);
      const pile = computePileLayout(all, centroid.x, centroid.y);
      setPileLayout(pile);

      if (goToPile || (!effectiveFilter && !organized)) {
        // Back to pile or initial state
        setActiveLayout(pile);
        const view = centerOn(all, pile, nextScale ?? scale, vw, vh);
        setPan(view.pan);
      } else if (effectiveFilter) {
        // Compute a filtered layout for matching items only
        const matchingItems = all.filter((p) => p.category === effectiveFilter);
        const filtLayout = computeFilteredLayout(matchingItems);
        setActiveLayout(filtLayout);
        const view = centerOn(matchingItems, filtLayout, nextScale ?? scale, vw, vh);
        setPan(view.pan);
      } else {
        setActiveLayout(newFullLayout);
        const view = centerOn(all, newFullLayout, nextScale ?? scale, vw, vh);
        setPan(view.pan);
      }

      if (nextScale !== undefined) setScale(nextScale);
    },
    [work, photo, playground, all, cardGap, filter, scale, organized, computeCentroid] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const recomputeRef = useRef(recompute);
  useEffect(() => { recomputeRef.current = recompute; }, [recompute]);

  useEffect(() => {
    recomputeRef.current(1, null);
    // Brief delay then reveal cards in pile
    const revealTimer = setTimeout(() => setRevealed(true), 80);
    const onResize = () => recomputeRef.current();
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(revealTimer);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const oldScale = scaleRef.current;
      const oldPan = panRef.current;
      const factor = Math.exp(-e.deltaY * 0.0018);
      const newScale = Math.min(2.2, Math.max(0.4, oldScale * factor));
      const wx = (mx - oldPan.x) / oldScale;
      const wy = (my - oldPan.y) / oldScale;
      if (wheelTimeout.current) clearTimeout(wheelTimeout.current);
      wheelTimeout.current = setTimeout(() => setWheeling(false), 150);
      setScale(newScale);
      setPan({ x: mx - wx * newScale, y: my - wy * newScale });
      setWheeling(true);
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  useImperativeHandle(ref, () => ({
    focusCategory(cat: Category) {
      if (!fullLayout) return;
      if (filter === cat) {
        // Toggle off — back to pile
        setFilter(null);
        setOrganized(false);
        recompute(1, null, true);
        return;
      }
      setFilter(cat);
      setOrganized(true);
      recompute(1.15, cat);
    },
    resetAll() {
      setFilter(null);
      setOrganized(false);
      setFallen(false);
      recompute(1, null, true);
    },
    fallCards() {
      setFallen(true);
    },
  }));

  const startPan = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setDragging(true);
    dragMoved.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = pan;
  };

  const onPan = (e: React.MouseEvent) => {
    if (!dragging || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      dragMoved.current = true;
      setPan({ x: panStart.current.x + dx, y: panStart.current.y + dy });
    }
  };

  const endPan = () => setDragging(false);

  // --- Touch handlers ---
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // Single finger: start pan (same as mouse drag)
      touchDragging.current = true;
      dragMoved.current = false;
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panStart.current = pan;
      setDragging(true);
    } else if (e.touches.length === 2) {
      // Two fingers: start pinch-to-zoom
      touchDragging.current = false;
      setDragging(false);
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchStartDist.current = Math.sqrt(dx * dx + dy * dy);
      pinchStartScale.current = scaleRef.current;
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1 && touchDragging.current && dragStart.current) {
      // Single finger pan
      const dx = e.touches[0].clientX - dragStart.current.x;
      const dy = e.touches[0].clientY - dragStart.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragMoved.current = true;
        setPan({ x: panStart.current.x + dx, y: panStart.current.y + dy });
      }
    } else if (e.touches.length === 2 && pinchStartDist.current !== null) {
      // Pinch-to-zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDist = Math.sqrt(dx * dx + dy * dy);
      const factor = currentDist / pinchStartDist.current;
      const newScale = Math.min(2.2, Math.max(0.4, pinchStartScale.current * factor));

      // Zoom origin = midpoint between the two fingers
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const mx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
        const my = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
        const oldScale = scaleRef.current;
        const oldPan = panRef.current;
        const wx = (mx - oldPan.x) / oldScale;
        const wy = (my - oldPan.y) / oldScale;
        setScale(newScale);
        setPan({ x: mx - wx * newScale, y: my - wy * newScale });
        setWheeling(true);
        if (wheelTimeout.current) clearTimeout(wheelTimeout.current);
        wheelTimeout.current = setTimeout(() => setWheeling(false), 150);
      }
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      // All fingers lifted
      touchDragging.current = false;
      pinchStartDist.current = null;
      setDragging(false);
    } else if (e.touches.length === 1) {
      // Went from 2 fingers to 1: reset to single-finger pan
      pinchStartDist.current = null;
      touchDragging.current = true;
      dragMoved.current = false;
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panStart.current = panRef.current;
      setDragging(true);
    }
  };

  const handleCardClick = (item: SizedCanvasItem) => {
    if (dragMoved.current) {
      dragMoved.current = false;
      return;
    }
    onOpenProject(item);
  };

  // Compute centroid of full layout for pile position (memoized)
  const centroid = useMemo(() => {
    if (!fullLayout) return { x: 0, y: 0 };
    return computeCentroid(fullLayout);
  }, [fullLayout, computeCentroid]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        cursor: dragging ? 'grabbing' : 'grab',
        background: '#FAFAFB',
        touchAction: 'none',
      }}
      onMouseDown={startPan}
      onMouseMove={onPan}
      onMouseUp={endPan}
      onMouseLeave={endPan}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >

      {/* Fallen message — shows on empty canvas after cards drop */}
      {fallen && fallenMessage && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            pointerEvents: 'none',
            animation: 'modal-content-in 0.6s ease forwards',
            animationDelay: '0.5s',
            opacity: 0,
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: 500, padding: '0 24px' }}>
            <p style={{
              font: "500 clamp(1.1rem, 2.5vw, 1.5rem) var(--font-mono)",
              color: '#9B9AA0',
              margin: '0 0 16px',
              lineHeight: 1.5,
              letterSpacing: '0.01em',
            }}>
              {fallenMessage}
            </p>
            <p style={{
              font: "400 0.75rem var(--font-mono)",
              color: '#C4C3C8',
              margin: 0,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}>
              type a command to bring them back
            </p>
          </div>
        </div>
      )}

      {fullLayout && activeLayout && (
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          transition: dragging || wheeling ? 'none' : 'transform 0.35s ease',
        }}
      >
        {all.map((item, i) => {
          const fullPos = fullLayout[item.id];
          const activePos = activeLayout[item.id];
          const dimmed = !!filter && item.category !== filter;
          const hovered = hoveredId === item.id;
          const pressed = pressedId === item.id;
          const innerW = item.w - 24;
          const imgHeight = Math.round((innerW * 9) / 16);
          const rot = fullPos.rotation || 0;
          // Each card gets a unique float duration and delay — slow drift feel
          const floatDuration = 6 + (i % 7) * 1.2; // 6s to 13.2s — slow, dreamy
          const floatDelay = (i * 0.53) % 5; // staggered start, wider spread

          // Determine card position based on organized state
          let cardLeft: number;
          let cardTop: number;
          let cardRot: number;
          let cardOpacity: number;
          let cardZ = item.z;

          if (!organized && pileLayout && pileLayout[item.id]) {
            // Pile mode: jumbled stack
            const pilePos = pileLayout[item.id];
            cardLeft = pilePos.x;
            cardTop = pilePos.y;
            cardRot = pilePos.rotation;
            cardOpacity = revealed ? 1 : 0;
            // Random z-index in pile for overlapping look
            const seed = layoutSeedFromId(item.id);
            cardZ = Math.round(layoutSeededRandom(seed, 20) * 100);
          } else if (dimmed) {
            // Filtered out: stay at full layout position, fade + drift
            cardLeft = fullPos.x;
            cardTop = fullPos.y;
            cardRot = rot;
            cardOpacity = 0.05;
          } else if (activePos) {
            // Has a position in active layout (either full or filtered)
            cardLeft = activePos.x;
            cardTop = activePos.y;
            cardRot = activePos.rotation || rot;
            cardOpacity = item.opacity;
          } else {
            // Fallback to full layout
            cardLeft = fullPos.x;
            cardTop = fullPos.y;
            cardRot = rot;
            cardOpacity = item.opacity;
          }

          // Build transform
          const cardTransform = dimmed && organized
            ? `scale(0.9) translateY(30px) rotate(${cardRot}deg)`
            : `scale(1) translateY(0) rotate(${cardRot}deg)`;

          // Fall animation: each card gets a unique delay + random rotation direction
          const fallSeed = layoutSeedFromId(item.id);
          const fallDelay = layoutSeededRandom(fallSeed, 10) * 0.4; // 0–0.4s stagger
          const fallRotate = (layoutSeededRandom(fallSeed, 20) - 0.5) * 60; // -30 to 30 deg
          const fallDuration = 0.6 + layoutSeededRandom(fallSeed, 30) * 0.5; // 0.6–1.1s

          return (
            <div
              key={item.id}
              tabIndex={dimmed || fallen ? -1 : 0}
              role="button"
              aria-label={item.title}
              onMouseDown={(e) => { e.stopPropagation(); setPressedId(item.id); }}
              onMouseUp={() => setPressedId(null)}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => { setHoveredId(null); setPressedId(null); }}
              onClick={() => handleCardClick(item)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(item); } }}
              style={{
                position: 'absolute',
                left: cardLeft,
                top: cardTop,
                width: item.w,
                opacity: fallen ? 0 : cardOpacity,
                transform: cardTransform,
                transitionProperty: 'left, top, opacity, transform, filter',
                transitionDuration: '0.55s, 0.55s, 0.45s, 0.45s, 0.3s',
                transitionTimingFunction: 'ease-out, ease-out, ease, ease, ease',
                filter: `grayscale(${item.gray}%)`,
                zIndex: cardZ,
                pointerEvents: dimmed || fallen ? 'none' : 'auto',
                cursor: 'pointer',
                userSelect: 'none',
                ...(fallen ? {
                  '--fall-rotate': `${fallRotate}deg`,
                  animation: `card-fall ${fallDuration}s ${fallDelay}s ease-in forwards`,
                  transition: 'none',
                } as React.CSSProperties : {}),
              }}
            >
              <div
                style={{
                  background: '#FFFFFF',
                  padding: 12,
                  borderRadius: 8,
                  boxShadow: hovered
                    ? '0 14px 30px rgba(24,24,27,0.16)'
                    : item.shadow !== 'none'
                    ? item.shadow
                    : '0 1px 2px rgba(24,24,27,0.05), 0 4px 10px rgba(24,24,27,0.05)',
                  transform: pressed ? 'scale(0.97)' : hovered ? 'scale(1.045)' : 'scale(1)',
                  transition: pressed ? 'transform 0.08s ease' : 'transform 0.18s ease, box-shadow 0.18s ease',
                  animation: !dimmed && !hovered
                    ? `card-float ${floatDuration}s ease-in-out ${floatDelay}s infinite`
                    : hovered
                    ? 'card-wiggle 0.5s ease forwards'
                    : 'none',
                }}
              >
                <div style={{ position: 'relative', width: '100%', height: imgHeight }}>
                  {item.coverImageUrl ? (
                    <Image
                      src={item.coverImageUrl}
                      alt=""
                      width={innerW}
                      height={imgHeight}
                      sizes={`${innerW}px`}
                      loading={i === 0 ? "eager" : "lazy"}
                      priority={i === 0}
                      placeholder="empty"
                      style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 4, pointerEvents: 'none' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', borderRadius: 4, background: '#ECEBEE' }} />
                  )}
                  {item.private && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backdropFilter: 'blur(6px)',
                        background: 'rgba(255,255,255,0.4)',
                        borderRadius: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#58565D" strokeWidth={1.6}>
                        <rect x="5" y="11" width="14" height="9" rx="1" />
                        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                      </svg>
                      <span style={{ font: "500 0.5625rem var(--font-mono)", letterSpacing: '0.05em', color: '#58565D' }}>
                        PRIVATE
                      </span>
                    </div>
                  )}
                </div>
                <div
                  style={{
                    marginTop: 10,
                    font: "500 0.6875rem var(--font-mono)",
                    textTransform: 'uppercase',
                    color: item.labelColor,
                    lineHeight: 1.45,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.title} <span style={{ color: '#9B9AA0' }}>{'—'} {item.year}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
});

export default Canvas;
