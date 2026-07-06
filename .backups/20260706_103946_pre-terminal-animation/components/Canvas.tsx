'use client';

import Image from 'next/image';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { Category, SizedCanvasItem, LayoutPosition } from '@/lib/canvasLayout';
import { centerOn, computeLayout } from '@/lib/canvasLayout';

interface CanvasProps {
  work: SizedCanvasItem[];
  photo: SizedCanvasItem[];
  playground?: SizedCanvasItem[];
  onOpenProject: (item: SizedCanvasItem) => void;
  cardGap?: number;
}

export interface CanvasHandle {
  focusCategory: (cat: Category) => void;
  resetAll: () => void;
}

const Canvas = forwardRef<CanvasHandle, CanvasProps>(function Canvas(
  { work, photo, playground = [], onOpenProject, cardGap = 48 },
  ref
) {
  const all = [...work, ...photo, ...playground];
  const [layout, setLayout] = useState<Record<string, LayoutPosition> | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [wheeling, setWheeling] = useState(false);
  const [filter, setFilter] = useState<Category | null>(null);
  const [revealed, setRevealed] = useState(false);
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

  const recompute = useCallback(
    (nextScale?: number, nextFilter?: Category | null) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const effectiveFilter = nextFilter === undefined ? filter : nextFilter;
      const newLayout = computeLayout(work, photo, vw, cardGap, playground);
      const items = effectiveFilter ? all.filter((p) => p.category === effectiveFilter) : all;
      const view = centerOn(items, newLayout, nextScale ?? scale, vw, vh);
      setLayout(newLayout);
      setPan(view.pan);
      if (nextScale !== undefined) setScale(nextScale);
    },
    [work, photo, playground, cardGap, filter, scale] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const recomputeRef = useRef(recompute);
  useEffect(() => { recomputeRef.current = recompute; }, [recompute]);

  useEffect(() => {
    recomputeRef.current(1, null);
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
      if (!layout) return;
      if (filter === cat) {
        setFilter(null);
        recompute(1, null);
        return;
      }
      setFilter(cat);
      recompute(1.15, cat);
    },
    resetAll() {
      setFilter(null);
      recompute(1, null);
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
      {layout && (
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
          const pos = layout[item.id];
          const dimmed = !!filter && item.category !== filter;
          const delayMs = Math.min(i * 16, 420);
          const hovered = hoveredId === item.id;
          const pressed = pressedId === item.id;
          const innerW = item.w - 24;
          const imgHeight = Math.round((innerW * 9) / 16);
          const rot = pos.rotation || 0;
          // Each card gets a unique float duration and delay for organic feel
          const floatDuration = 3.5 + (i % 7) * 0.4; // 3.5s to 6.1s
          const floatDelay = (i * 0.37) % 3; // staggered start

          return (
            <div
              key={item.id}
              tabIndex={dimmed ? -1 : 0}
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
                left: pos.x,
                top: pos.y,
                width: item.w,
                opacity: !revealed ? 0 : dimmed ? 0.05 : item.opacity,
                transform: !revealed
                  ? `scale(0.85) translateY(10px) rotate(${rot}deg)`
                  : `scale(1) translateY(0) rotate(${rot}deg)`,
                transitionProperty: 'opacity, transform, filter',
                transitionDuration: '0.45s, 0.45s, 0.3s',
                transitionTimingFunction: 'ease, ease, ease',
                transitionDelay: !revealed ? '0ms' : `${delayMs}ms`,
                filter: `grayscale(${item.gray}%)`,
                zIndex: item.z,
                pointerEvents: dimmed ? 'none' : 'auto',
                cursor: 'pointer',
                userSelect: 'none',
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
                  animation: revealed && !dimmed && !hovered
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
                      loading="lazy"
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
                  {item.title} <span style={{ color: '#9B9AA0' }}>— {item.year}</span>
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