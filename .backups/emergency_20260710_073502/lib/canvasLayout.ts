// lib/canvasLayout.ts
// The "math brain" — decides where each card goes and how it looks based on year.

export const MIN_YEAR = 2011;
export const MAX_YEAR = 2025;
export const HEADER_H = 60;
export const COLW = 262;

export type Category = 'work' | 'photo' | 'playground';

export interface GalleryItem {
  _type: 'galleryImage' | 'galleryVideo';
  url: string;
  aspectRatio?: '16:9' | '9:16';
}

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
  gallery?: GalleryItem[];
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

// Seeded pseudo-random number generator (consistent per card ID)
export function seedFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function seededRandom(seed: number, index: number): number {
  // Simple LCG
  let s = (seed + index * 2654435761) | 0;
  s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
  s = Math.imul(s ^ (s >>> 13), 0x45d9f3b);
  s = (s ^ (s >>> 16)) >>> 0;
  return s / 4294967296;
}

export interface LayoutPosition {
  x: number;
  y: number;
  rotation: number;
}

// Scatter items across a 2D area like photos tossed on a table.
// Uses a loose grid with random jitter to prevent overlaps while looking organic.
function scatterItems(
  items: SizedCanvasItem[],
  offsetX: number,
  areaWidth: number,
): Record<string, LayoutPosition> {
  if (items.length === 0) return {};

  const positions: Record<string, LayoutPosition> = {};
  const placed: { x: number; y: number; w: number; h: number }[] = [];

  // Sort by year desc (newest = biggest = placed first) for better packing
  const sorted = [...items].sort((a, b) => b.year - a.year);

  // Calculate a rough grid — wider than tall, with generous spacing
  const count = sorted.length;
  const cols = Math.ceil(Math.sqrt(count * 1.8)); // wider than square
  const rows = Math.ceil(count / cols);

  // Cell size based on largest card + generous padding
  const maxCardW = Math.max(...sorted.map((i) => i.w));
  const maxCardH = Math.max(...sorted.map((i) => i.h + 96)); // +96 for label
  const cellW = maxCardW + 36;
  const cellH = maxCardH + 28;

  // Jitter range — how far from the grid center a card can drift
  const jitterX = cellW * 0.25;
  const jitterY = cellH * 0.25;

  sorted.forEach((item, i) => {
    const seed = seedFromId(item.id);
    const col = i % cols;
    const row = Math.floor(i / cols);

    // Base grid position
    const baseX = offsetX + col * cellW;
    const baseY = row * cellH;

    // Random offset from grid center
    const rx = (seededRandom(seed, 0) - 0.5) * 2 * jitterX;
    const ry = (seededRandom(seed, 1) - 0.5) * 2 * jitterY;

    // Slight random rotation (-4 to +4 degrees)
    const rotation = (seededRandom(seed, 2) - 0.5) * 8;

    let x = baseX + rx;
    let y = baseY + ry;

    // Nudge to avoid heavy overlap with already-placed cards
    for (const p of placed) {
      const overlapX = Math.max(0, Math.min(x + item.w, p.x + p.w) - Math.max(x, p.x));
      const overlapY = Math.max(0, Math.min(y + item.h + 96, p.y + p.h) - Math.max(y, p.y));
      if (overlapX > 30 && overlapY > 30) {
        // Nudge in the direction of least overlap
        if (overlapX < overlapY) {
          x += x < p.x ? -overlapX - 10 : overlapX + 10;
        } else {
          y += y < p.y ? -overlapY - 10 : overlapY + 10;
        }
      }
    }

    positions[item.id] = { x, y, rotation };
    placed.push({ x, y, w: item.w, h: item.h + 96 });
  });

  return positions;
}

export function computeLayout(
  work: SizedCanvasItem[],
  photo: SizedCanvasItem[],
  viewportWidth: number,
  _gap = 48,
  playground: SizedCanvasItem[] = []
): Record<string, LayoutPosition> {
  // Each category gets its own cluster, spread horizontally
  const workWidth = Math.max(work.length * 120, 800);
  const workPositions = scatterItems(work, 0, workWidth);

  // Find rightmost edge of work cluster
  let workRight = 0;
  for (const id of Object.keys(workPositions)) {
    const item = work.find((w) => w.id === id);
    if (item) workRight = Math.max(workRight, workPositions[id].x + item.w);
  }

  const photoOffset = workRight + 120;
  const photoWidth = Math.max(photo.length * 120, 600);
  const photoPositions = scatterItems(photo, photoOffset, photoWidth);

  let photoRight = photoOffset;
  for (const id of Object.keys(photoPositions)) {
    const item = photo.find((p) => p.id === id);
    if (item) photoRight = Math.max(photoRight, photoPositions[id].x + item.w);
  }

  const playgroundOffset = photoRight + 120;
  const playgroundPositions = playground.length > 0
    ? scatterItems(playground, playgroundOffset, Math.max(playground.length * 120, 400))
    : {};

  return { ...workPositions, ...photoPositions, ...playgroundPositions };
}

export function computeFilteredLayout(
  items: SizedCanvasItem[],
): Record<string, LayoutPosition> {
  if (items.length === 0) return {};
  const width = Math.max(items.length * 120, 600);
  // Center the cluster around x=0
  return scatterItems(items, -width / 2, width);
}

export function computePileLayout(
  items: SizedCanvasItem[],
  centerX: number,
  centerY: number,
): Record<string, LayoutPosition> {
  const positions: Record<string, LayoutPosition> = {};
  // Spread cards across a wider area to fill the viewport while still overlapping
  const count = items.length;
  const spreadX = Math.max(400, Math.min(900, count * 40));
  const spreadY = Math.max(300, Math.min(600, count * 28));
  items.forEach((item) => {
    const seed = seedFromId(item.id);
    positions[item.id] = {
      x: centerX + (seededRandom(seed, 10) - 0.5) * spreadX,
      y: centerY + (seededRandom(seed, 11) - 0.5) * spreadY,
      rotation: (seededRandom(seed, 12) - 0.5) * 12,
    };
  });
  return positions;
}

export function centerOn(
  items: SizedCanvasItem[],
  layout: Record<string, LayoutPosition>,
  scale: number,
  viewportWidth: number,
  viewportHeight: number
) {
  const usableH = viewportHeight - HEADER_H;
  const xs = items.map((p) => layout[p.id].x + p.w / 2);
  const ys = items.map((p) => layout[p.id].y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const minY = Math.min(...ys);
  return {
    pan: { x: viewportWidth / 2 - cx * scale, y: usableH * 0.05 - minY * scale },
    scale,
  };
}
