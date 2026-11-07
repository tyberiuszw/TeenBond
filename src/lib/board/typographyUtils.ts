import { BoardElement } from '@/types/board';

/**
 * Computes dynamic font size for sticky notes based on bounding box and character count.
 * Matches PRD R5-BOARD-04 specification:
 * targetSize = floor(sqrt((width * height) / (charCount * 1.8)))
 * Clamped strictly between 12px and 32px.
 */
export function computeStickyFontSize(
  text: string,
  width: number = 200,
  height: number = 200
): number {
  if (!text || text.length === 0) return 24;
  const charCount = text.length;
  const targetSize = Math.floor(Math.sqrt((width * height) / (charCount * 1.8)));
  return Math.max(12, Math.min(32, targetSize));
}

/**
 * Sanitizes board elements, repairing negative or degenerate width/height,
 * missing IDs, non-finite coordinates, and default colors.
 */
export function sanitizeBoardElement(element: Partial<BoardElement>): BoardElement {
  return {
    id: element.id || `elem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: element.type || 'text',
    shapeType: element.shapeType,
    x: Number.isFinite(element.x) ? element.x! : 0,
    y: Number.isFinite(element.y) ? element.y! : 0,
    width: typeof element.width === 'number' ? Math.max(10, element.width) : 200,
    height: typeof element.height === 'number' ? Math.max(10, element.height) : 200,
    content: element.content || '',
    color: element.color || '#FEF08A',
    fillColor: element.fillColor,
    strokeWidth: element.strokeWidth ?? 2,
    points: element.points,
    lockedBy: element.lockedBy || null,
    lockedAt: element.lockedAt ?? null,
    createdBy: element.createdBy || 'anon',
    deleted: element.deleted || false,
    pageId: element.pageId,
    metadata: element.metadata,
  };
}
