'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import type { Category, SizedCanvasItem, LayoutPosition } from '@/lib/canvasLayout';
import {
  centerOn,
  computeLayout,
  computeFilteredLayout,
  computePileLayout,
  compactLayout,
  getLayoutDebugInfo,
} from '@/lib/canvasLayout';

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

  const [fullLayout, setFullLayout] = useState<Record<string, LayoutPosition> | null>(null);
  const [activeLayout, setActiveLayout] = useState<Record<string, LayoutPosition> | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [wheeling, setWheeling] = useState(false);
  const [filter, setFilter] = useState<Category | null>(null);
  const [organized, setOrganized] = useState(false);
  const [fallen, setFallen] = useState(false);
  const [pileLayout, setPileLayout] = useState<Record<string, LayoutPosition> | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pressedId, setPressedId] = useState<string | null>(null);
  const [debug, setDebug] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const panStart = useRef({ x: 0, y: 0 });
  const dragMoved = useRef(false);
  const wheelTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const touchDragging = useRef(false);
  const pinchStartDist = useRef<number | null>(null);
  const pinchStartScale = useRef(1);

  const panRef = useRef(pan);
  const scaleRef = useRef(scale);
  useEffect(() => { panRef.current = pan; }, [pan]);
  useEffect(() => { scaleRef.current = scale; }, [scale]);

  // ?debug=layout support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setDebug(params.get('debug') === 'layout');
    }
  }, []);

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

      const centroid = computeCentroid(newFullLayout);
      const pile = computePileLayout(all, centroid.x, centroid.y);
      setPileLayout(pile);

      if (goToPile || (!effectiveFilter && !organized)) {
        setActiveLayout(pile);
        const view = centerOn(all, pile, nextScale ?? scale, vw, vh);
        setPan(view.pan);
      } else if (effectiveFilter) {
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

      if (debug) {
        console.log('[Canvas Debug]', getLayoutDebugInfo(newFullLayout, all));
      }
    },
    [work, photo, playground, all, cardGap, filter, scale, organized, computeCentroid, debug]
  );

  // v1.3.0: Watch Sanity data changes
  useEffect(() => {
    if (work.length > 0 || photo.length > 0 || playground.length > 0) {
      recompute();
    }
  }, [work, photo, playground, recompute]);

  // Initial mount
  useEffect(() => {
    recompute(1, null, true);
    const onResize = () => recompute();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Wheel zoom
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
      setFallen(false);
      if (filter === cat) {
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

  // Mouse pan
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
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragMoved.current = true;
    setPan({ x: panStart.current.x + dx, y: panStart.current.y + dy });
  };

  const endPan = () => {
    setDragging(false);
    dragStart.current = null;
  };

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchDragging.current = true;
      dragMoved.current = false;
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panStart.current = pan;
      setDragging(true);
    } else if (e.touches.length === 2) {
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
      const dx = e.touches[0].clientX - dragStart.current.x;
      const dy = e.touches[0].clientY - dragStart.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragMoved.current = true;
        setPan({ x: panStart.current.x + dx, y: panStart.current.y + dy });
      }
    } else if (e.touches.length === 2 && pinchStartDist.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDist = Math.sqrt(dx * dx + dy * dy);
      const factor = currentDist / pinchStartDist.current;
      const newScale = Math.min(2.2, Math.max(0.4, pinchStartScale.current * factor));
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
      }
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      touchDragging.current = false;
      pinchStartDist.current = null;
      setDragging(false);
    } else if (e.touches.length === 1) {
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

  // Render cards
  const renderCards = () => {
    if (!activeLayout) return null;
    const itemsToRender = filter ? all.filter(i => i.category === filter) : all;

    return itemsToRender.map((item) => {
      const pos = activeLayout[item.id];
      if (!pos) return null;

      return (
        <div
          key={item.id}
          onClick={() => handleCardClick(item)}
          style={{
            position: 'absolute',
            left: pos.x,
            top: pos.y,
            width: item.w,
            height: item.h,
            transform: `rotate(${pos.rotation}deg)`,
            opacity: item.opacity,
            filter: item.gray ? `grayscale(${item.gray}%)` : 'none',
            boxShadow: item.shadow,
            zIndex: item.z,
            cursor: 'pointer',
            border: '1px solid var(--color-border)',
            background: '#fff',
            overflow: 'hidden',
            borderRadius: 4,
          }}
        >
          {item.coverImageUrl && (
            <img src={item.coverImageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '4px 8px', background: 'rgba(255,255,255,0.92)',
            fontSize: '10px', fontFamily: 'var(--font-mono)', color: item.labelColor,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
          }}>
            {item.title}
          </div>
        </div>
      );
    });
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
      {debug && fullLayout && (
        <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.8)', color: '#0f0', font: '11px monospace', padding: '4px 8px', zIndex: 999 }}>
          DEBUG • {Object.keys(fullLayout).length} cards • compact active
        </div>
      )}

      {fallen && fallenMessage && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <p style={{ color: '#9B9AA0', font: '500 1.3rem var(--font-mono)' }}>{fallenMessage}</p>
        </div>
      )}

      <div style={{ position: 'absolute', left: 0, top: 0, transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, transformOrigin: '0 0' }}>
        {renderCards()}
      </div>
    </div>
  );
});

export default Canvas;