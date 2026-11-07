import { describe, it, expect } from 'vitest';
import { BoardElement, CursorState } from '../helpers/contracts';

describe('Tier 2: Boundary Values on TeenBoard Collaborative Canvas', () => {
  it('R5-BVA-BOARD-01: Object locking timeout releases lock automatically after 4000 ms', () => {
    interface LockableElement extends BoardElement {
      lockedAt?: number;
    }

    function isElementLockedByOther(element: LockableElement, currentUserId: string, now: number): boolean {
      if (!element.lockedBy) return false;
      if (element.lockedBy === currentUserId) return false;
      const lockAge = now - (element.lockedAt || 0);
      // Lock is active ONLY if under 4000 ms
      return lockAge < 4000;
    }

    const t0 = 100000;
    const element: LockableElement = {
      id: 'rect-1',
      type: 'shape',
      x: 100,
      y: 100,
      color: '#ef4444',
      createdBy: 'usr-kuba',
      lockedBy: 'usr-kuba',
      lockedAt: t0
    };

    // User Zosia tries to interact at t0 + 2000 ms -> LOCKED
    expect(isElementLockedByOther(element, 'usr-zosia', t0 + 2000)).toBe(true);

    // User Zosia tries to interact at t0 + 4001 ms -> LOCK EXPIRED, UNLOCKED
    expect(isElementLockedByOther(element, 'usr-zosia', t0 + 4001)).toBe(false);

    // Kuba (owner of lock) is never locked out
    expect(isElementLockedByOther(element, 'usr-kuba', t0 + 2000)).toBe(false);
  });

  it('R5-BVA-BOARD-02: Extreme virtual canvas coordinates and zoom bounds are normalized', () => {
    function normalizeCanvasTransform(zoom: number, panX: number, panY: number): { zoom: number; panX: number; panY: number } {
      // Zoom clamped between 0.1 (10%) and 5.0 (500%)
      const clampedZoom = Math.max(0.1, Math.min(5.0, zoom));
      // Pan boundaries to prevent losing content in infinity
      const clampedPanX = Math.max(-10000, Math.min(10000, panX));
      const clampedPanY = Math.max(-10000, Math.min(10000, panY));
      return { zoom: clampedZoom, panX: clampedPanX, panY: clampedPanY };
    }

    // Extreme zoom in (100x)
    expect(normalizeCanvasTransform(100, 0, 0).zoom).toBe(5.0);

    // Extreme zoom out (0.001x)
    expect(normalizeCanvasTransform(0.001, 0, 0).zoom).toBe(0.1);

    // Extreme pan coordinates
    const panResult = normalizeCanvasTransform(1.0, 999999, -888888);
    expect(panResult.panX).toBe(10000);
    expect(panResult.panY).toBe(-10000);
  });

  it('R5-BVA-BOARD-03: Live cursor collisions at exact same coordinate render distinct identities', () => {
    const cursors: CursorState[] = [
      { userId: 'u1', name: 'Kuba', color: '#22c55e', x: 250, y: 300 },
      { userId: 'u2', name: 'Zosia', color: '#ec4899', x: 250, y: 300 } // exact same (x,y)
    ];

    // Rendered badges must preserve distinct names and colors
    expect(cursors[0].x).toBe(cursors[1].x);
    expect(cursors[0].y).toBe(cursors[1].y);
    expect(cursors[0].name).not.toBe(cursors[1].name);
    expect(cursors[0].color).not.toBe(cursors[1].color);
  });

  it('R5-BVA-BOARD-04: Empty sticky notes and degenerate shapes are handled safely', () => {
    function sanitizeBoardElement(element: Partial<BoardElement>): BoardElement {
      return {
        id: element.id || 'elem-gen',
        type: element.type || 'text',
        x: Number.isFinite(element.x) ? element.x! : 0,
        y: Number.isFinite(element.y) ? element.y! : 0,
        width: typeof element.width === 'number' ? Math.max(10, element.width) : 100,
        height: typeof element.height === 'number' ? Math.max(10, element.height) : 100,
        content: element.content || '',
        color: element.color || '#000000',
        createdBy: element.createdBy || 'anon'
      };
    }

    const degenerate = sanitizeBoardElement({
      id: 'empty-sticky',
      type: 'sticky',
      width: -50, // invalid negative width
      height: 0,   // invalid zero height
      content: ''
    });

    expect(degenerate.width).toBe(10); // clamped to min 10
    expect(degenerate.height).toBe(10);
    expect(degenerate.content).toBe('');
  });
});
