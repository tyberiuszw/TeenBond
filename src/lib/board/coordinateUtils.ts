import { CanvasTransform } from '@/types/board';

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 5.0;
export const MIN_PAN = -10000;
export const MAX_PAN = 10000;

/**
 * Normalizes canvas zoom and pan to safe boundary values.
 * Zoom clamped strictly between 0.1 (10%) and 5.0 (500%).
 * Pan clamped strictly between -10,000 and +10,000.
 */
export function normalizeCanvasTransform(
  zoom: number,
  panX: number,
  panY: number
): CanvasTransform {
  const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
  const clampedPanX = Math.max(MIN_PAN, Math.min(MAX_PAN, panX));
  const clampedPanY = Math.max(MIN_PAN, Math.min(MAX_PAN, panY));
  return { zoom: clampedZoom, panX: clampedPanX, panY: clampedPanY };
}

/**
 * Transforms screen coordinates (pixels relative to canvas element top-left)
 * to infinite world coordinates.
 */
export function screenToWorld(
  screenX: number,
  screenY: number,
  transform: CanvasTransform
): { x: number; y: number } {
  return {
    x: (screenX - transform.panX) / transform.zoom,
    y: (screenY - transform.panY) / transform.zoom,
  };
}

/**
 * Transforms world coordinates to screen coordinates.
 */
export function worldToScreen(
  worldX: number,
  worldY: number,
  transform: CanvasTransform
): { x: number; y: number } {
  return {
    x: worldX * transform.zoom + transform.panX,
    y: worldY * transform.zoom + transform.panY,
  };
}

/**
 * Calculates new transform when zooming focused on a specific screen point (e.g. mouse cursor).
 */
export function calculateZoomToPoint(
  current: CanvasTransform,
  zoomFactor: number,
  screenX: number,
  screenY: number
): CanvasTransform {
  const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, current.zoom * zoomFactor));
  // Keep world point under cursor stationary
  const worldPoint = screenToWorld(screenX, screenY, current);
  const newPanX = screenX - worldPoint.x * newZoom;
  const newPanY = screenY - worldPoint.y * newZoom;
  return normalizeCanvasTransform(newZoom, newPanX, newPanY);
}
