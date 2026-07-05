// lib/canvasLayout.ts
// The "math brain" — decides where each card goes and how it looks based on year.

export const MIN_YEAR = 2011;
export const MAX_YEAR = 2025;
export const HEADER_H = 60;
export const COLW = 262;

export type Category = 'work' | 'photo';

export interface RawCanvasItem {
  id: string;
  title: string;
  slug: string;
  year: number;
  client?: string;
  role?: string;
  tags?: string;
  desc?: string;
  private: boolean;
  coverImageUrl?: string;
  gallery?: string[];
  category: Category;
}

export interface SizedCanvasItem extends RawCanvasItem {
  w: number;
  h: number;
  opacity: number;
  gray: number;
  labelColor: string;
  shadow: string;
  z: number;
  t: number;
}

export function sizeAndDepth(year: number) {
  const t = Math.max(0, Math.min(1, (year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)));
  const w = Math.round(130 + t * 130);
  const h = Math.round((w * 9) / 16);
  const opacity = 0.68 + t * 0.32;
  const gray = Math.round((1 - t) * 35);
  const labelColor = t > 0.6 ? '#18181B' : t > 0.3 ? '#58565D' : '#9B9AA0';
  const shadow = t > 0.65 ? '0 12px 26px rgba(24,24,27,0.18)' : 'none';
  const z = Math.round(t * 100);
  return { w, h, opacity, gray, labelColor, shadow, z, t };
}

export function withSize(items: RawCanvasItem[]): SizedCanvasItem[] {
  return items.map((item) => ({ ...item, ...sizeAndDepth(item.year) }));
}

export function colCountsForWidth(vw: number) {
  if (vw > 1300) return { work: 4, photo: 3 };
  if (vw > 1000) return { work: 3, photo: 2 };
  return { work: 2, photo: 1 };
}

export function packColumns(
  items: SizedCanvasItem[],
  colWidth: number,
  gap: number,
  colCount: number,
  offsetX: number
): Record<string, { x: number; y: number }> {
  const heights = new Array(colCount).fill(0);
  const positions: Record<string, { x: number; y: number }> = {};
  items.forEach((item) => {
    let bestCol = 0;
    let bestMax = Infinity;
    for (let c = 0; c < colCount; c++) {
      if (heights[c] < bestMax) {
        bestMax = heights[c];
        bestCol = c;
      }
    }
    const x = offsetX + bestCol * (colWidth + gap);
    const y = bestMax;
    positions[item.id] = { x, y };
    heights[bestCol] = bestMax + item.h + 96 + gap;
  });
  return positions;
}

export function computeLayout(
  work: SizedCanvasItem[],
  photo: SizedCanvasItem[],
  viewportWidth: number,
  gap = 48
): Record<string, { x: number; y: number }> {
  const cc = colCountsForWidth(viewportWidth);
  const workPositions = packColumns(work, COLW, gap, cc.work, 0);
  const photoOffsetX = cc.work * (COLW + gap) + 110;
  const photoPositions = packColumns(photo, COLW, gap, cc.photo, photoOffsetX);
  return { ...workPositions, ...photoPositions };
}

export function centerOn(
  items: SizedCanvasItem[],
  layout: Record<string, { x: number; y: number }>,
  scale: number,
  viewportWidth: number,
  viewportHeight: number
) {
  const usableH = viewportHeight - HEADER_H;
  const xs = items.map((p) => layout[p.id].x + p.w / 2);
  const ys = items.map((p) => layout[p.id].y + p.h / 2);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  return {
    pan: { x: viewportWidth / 2 - cx * scale, y: usableH / 2 - cy * scale },
    scale,
  };
}