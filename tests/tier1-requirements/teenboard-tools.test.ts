import { describe, it, expect } from 'vitest';
import {
  PersonalUndoManager,
  PrivateCalculatorManager,
  LaserPointerTrail
} from '../helpers/mockStore';
import { BoardElement } from '../helpers/contracts';

describe('Tier 1: TeenBoard Collaborative Tools & State Isolation', () => {
  it('R5-BOARD-01: Personal Undo/Redo isolates action history per user', () => {
    const undoManager = new PersonalUndoManager();

    // User A adds a sticky note
    const stickyA: BoardElement = {
      id: 'sticky-1',
      type: 'sticky',
      x: 100,
      y: 100,
      content: 'Notatka Kuby',
      color: '#fef08a',
      createdBy: 'usr-kuba'
    };
    undoManager.addElement('usr-kuba', stickyA);

    // User B adds a shape
    const shapeB: BoardElement = {
      id: 'shape-1',
      type: 'shape',
      x: 300,
      y: 200,
      width: 150,
      height: 100,
      color: '#3b82f6',
      createdBy: 'usr-zosia'
    };
    undoManager.addElement('usr-zosia', shapeB);

    // User A modifies their sticky note position
    undoManager.updateElement('usr-kuba', 'sticky-1', { x: 150, y: 150 });
    expect(undoManager.elements.get('sticky-1')?.x).toBe(150);

    // User A clicks UNDO
    const undoSuccess = undoManager.undo('usr-kuba');
    expect(undoSuccess).toBe(true);

    // Sticky A should be restored to x=100
    expect(undoManager.elements.get('sticky-1')?.x).toBe(100);

    // Shape B created by User B must remain completely intact!
    const activeShapeB = undoManager.elements.get('shape-1');
    expect(activeShapeB).toBeDefined();
    expect(activeShapeB?.deleted).toBeFalsy();
    expect(activeShapeB?.x).toBe(300);

    // User A clicks REDO
    const redoSuccess = undoManager.redo('usr-kuba');
    expect(redoSuccess).toBe(true);
    expect(undoManager.elements.get('sticky-1')?.x).toBe(150);
  });

  it('R5-BOARD-02: Private floating calculator is strictly private to its owner', () => {
    const calcManager = new PrivateCalculatorManager();

    // Kuba opens calculator and calculates Zin workdays
    calcManager.open('usr-kuba');
    const result = calcManager.calculate('usr-kuba', '50000 / 8400');
    expect(result).toBeCloseTo(5.952, 3);

    // Visibility check
    expect(calcManager.isVisibleTo('usr-kuba', 'usr-kuba')).toBe(true);
    expect(calcManager.isVisibleTo('usr-zosia', 'usr-kuba')).toBe(false);
    expect(calcManager.isVisibleTo('usr-michal', 'usr-kuba')).toBe(false);
  });

  it('R5-BOARD-03: Laser pointer trail expires completely after 1.5 seconds (1500 ms)', () => {
    const laser = new LaserPointerTrail();
    const t0 = 100000;

    // Add 3 laser points at t0
    laser.addPoint(100, 100, t0);
    laser.addPoint(110, 105, t0 + 200);
    laser.addPoint(120, 110, t0 + 500);

    // At t0 + 800 ms: all 3 points still active with fading opacities
    const activeAt800 = laser.getActivePoints(t0 + 800);
    expect(activeAt800.length).toBe(3);
    expect(activeAt800[0].opacity).toBeLessThan(1.0);
    expect(activeAt800[0].opacity).toBeGreaterThan(0.0);

    // At t0 + 1600 ms: first point (> 1500 ms old) is expired
    const activeAt1600 = laser.getActivePoints(t0 + 1600);
    expect(activeAt1600.length).toBe(2);

    // At t0 + 2100 ms: all points expired (> 1500 ms old)
    const activeAt2100 = laser.getActivePoints(t0 + 2100);
    expect(activeAt2100.length).toBe(0);
  });

  it('R5-BOARD-04: Sticky note font auto-scaling adjusts text to fit note bounds', () => {
    function computeStickyFontSize(text: string, width: number = 200, height: number = 200): number {
      if (!text || text.length === 0) return 24;
      const charCount = text.length;
      const targetSize = Math.floor(Math.sqrt((width * height) / (charCount * 1.8)));
      // Clamped between 12px (min readable) and 32px (max headline)
      return Math.max(12, Math.min(32, targetSize));
    }

    // Short text: high font size
    const shortSize = computeStickyFontSize('Ważny cel!');
    expect(shortSize).toBe(32);

    // Medium text: moderate font size
    const medText = 'Pamiętajmy o przeliczeniu ponków na szliby przed podaniem odpowiedzi.';
    const medSize = computeStickyFontSize(medText);
    expect(medSize).toBeGreaterThanOrEqual(16);
    expect(medSize).toBeLessThanOrEqual(24);

    // Very long text: clamped to minimum 12px
    const longText = 'A'.repeat(500);
    const longSize = computeStickyFontSize(longText);
    expect(longSize).toBe(12);
  });
});
