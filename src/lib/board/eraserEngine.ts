import { BoardElement } from '@/types/board';

/**
 * Checks if a point is within threshold distance of a 2D line segment.
 */
export function isPointNearSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  threshold: number
): boolean {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    return Math.hypot(px - x1, py - y1) <= threshold;
  }

  // Projection scalar clamped to [0, 1]
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;

  return Math.hypot(px - projX, py - projY) <= threshold;
}

/**
 * Line-only Eraser Engine
 * PRD §4 requirement:
 * "Gumka (Eraser): Usuwa WYŁĄCZNIE odręczne linie (nie usuwa karteczek, kształtów ani zdjęć)."
 *
 * Checks which stroke/line elements intersect the eraser radius.
 */
export function findErasedLineIds(
  elements: BoardElement[],
  eraserWorldX: number,
  eraserWorldY: number,
  radius: number = 16
): string[] {
  const hitIds: string[] = [];

  for (const el of elements) {
    if (el.deleted) continue;

    // Strictly ignore non-stroke elements (sticky notes, shapes, rect, circle, text)
    const isErasable =
      el.type === 'stroke' || el.type === 'line' || el.type === 'path';
    if (!isErasable) continue;

    const points = el.points;
    if (!points || points.length < 2) continue;

    const threshold = radius + (el.strokeWidth ?? 2) / 2;

    // Check segments
    let hit = false;
    for (let i = 0; i < points.length - 2; i += 2) {
      if (
        isPointNearSegment(
          eraserWorldX,
          eraserWorldY,
          points[i],
          points[i + 1],
          points[i + 2],
          points[i + 3],
          threshold
        )
      ) {
        hit = true;
        break;
      }
    }

    if (hit) {
      hitIds.push(el.id);
    }
  }

  return hitIds;
}
