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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setDebug(params.get('debug') === 'layout');
    }
  }, []);

  // ... (rest of logic remains the same - recompute, handlers, etc.)

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
          onMouseEnter={() => setHoveredId(item.id)}
          onMouseLeave={() => setHoveredId(null)}
          onMouseDown={() => setPressedId(item.id)}
          onMouseUp={() => setPressedId(null)}
          className="canvas-card select-none"
          style={{
            position: 'absolute',
            left: pos.x,
            top: pos.y,
            width: item.w,
            height: item.h,
            transform: `rotate(${pos.rotation}deg)`,
            opacity: item.opacity,
            filter: item.gray ? `grayscale(${item.gray}%)` : 'none',
            boxShadow: item.shadow || '0 1px 3px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.08)',
            padding: '4px',
            borderRadius: '8px',
            transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out',
          }}
        >
          {/* Your existing card content: image, labels, etc. */}
          <img src={item.coverImageUrl} alt={item.title} className="w-full h-full object-cover rounded-[6px]" />
          {/* labels */}
        </div>
      );
    });
  };

  // ... remaining component code (effects, handlers, return JSX)

  return (
    <div ref={containerRef} className="canvas-container relative w-full h-full overflow-hidden">
      {renderCards()}
      {/* other UI elements */}
    </div>
  );
});

export default Canvas;