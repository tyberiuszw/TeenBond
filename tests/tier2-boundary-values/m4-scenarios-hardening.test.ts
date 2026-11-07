import { describe, it, expect } from 'vitest';
import { normalizeCanvasTransform } from '@/lib/board/coordinateUtils';
import { sanitizeBoardElement } from '@/lib/board/typographyUtils';
import { allocateZinClues } from '@/lib/zin/partitioner';
import { validateZinAnswer } from '@/lib/zin/validator';
import { calculateLevenshtein, normalizeKalamburyString } from '@/lib/kalambury/fuzzyMatcher';
import { calculateKalamburyScores } from '@/lib/kalambury/scoringEngine';
import { isElementLockedByOther } from '@/lib/board/objectLockManager';

describe('Tier 2: Milestone 4 Boundary Values & Adversarial Hardening', () => {
  it('M4-BVA-01: Zoom and Pan extremes are strictly normalized within safety boundaries', () => {
    // Zoom lower and upper bounds [0.1, 5.0]
    expect(normalizeCanvasTransform(0.01, 0, 0).zoom).toBe(0.1);
    expect(normalizeCanvasTransform(100.0, 0, 0).zoom).toBe(5.0);

    // Pan bounds [-10000, 10000]
    expect(normalizeCanvasTransform(1.0, -999999, 999999).panX).toBe(-10000);
    expect(normalizeCanvasTransform(1.0, -999999, 999999).panY).toBe(10000);
  });

  it('M4-BVA-02: Degenerate element geometries are safely repaired', () => {
    const fixed = sanitizeBoardElement({
      width: -999,
      height: -50,
      x: NaN,
      y: Infinity,
    });
    expect(fixed.width).toBe(10);
    expect(fixed.height).toBe(10);
    expect(fixed.x).toBe(0);
    expect(fixed.y).toBe(0);
  });

  it('M4-BVA-03: Zin Clue allocator boundary checks for 2 to 12 members', () => {
    // Minimum 2 members
    const dist2 = allocateZinClues(33, 2);
    expect(dist2).toEqual([17, 16]);

    // Maximum 12 members
    const dist12 = allocateZinClues(33, 12);
    expect(dist12.reduce((a, b) => a + b, 0)).toBe(33);
    expect(Math.max(...dist12) - Math.min(...dist12)).toBeLessThanOrEqual(1);

    // Out of bounds
    expect(() => allocateZinClues(33, 1)).toThrow();
    expect(() => allocateZinClues(33, 13)).toThrow();
  });

  it('M4-BVA-04: Zin Obelisk answer validator rejects SQL injections and malformed inputs', () => {
    expect(validateZinAnswer('')).toBe(false);
    expect(validateZinAnswer('    ')).toBe(false);
    expect(validateZinAnswer("' OR '1'='1")).toBe(false);
    expect(validateZinAnswer('<script>alert(1)</script>')).toBe(false);

    // Valid variations
    expect(validateZinAnswer('neptiminus')).toBe(true);
    expect(validateZinAnswer('NEPTIMINUS')).toBe(true);
    expect(validateZinAnswer('  Neptominus  ')).toBe(true);
    expect(validateZinAnswer('Dzień Neptuna')).toBe(true);
  });

  it('M4-BVA-05: Levenshtein distance boundary conditions', () => {
    expect(calculateLevenshtein('', '')).toBe(0);
    expect(calculateLevenshtein('abc', '')).toBe(3);
    expect(calculateLevenshtein('', 'xyz')).toBe(3);
    expect(calculateLevenshtein('kameleon', 'kameleon')).toBe(0);
  });

  it('M4-BVA-06: Kalambury scoring handles 0 players and boundary times gracefully', () => {
    // 0 seconds left
    const atZero = calculateKalamburyScores(0, 5, 2);
    expect(atZero.guesserPoints).toBe(50);

    // Negative seconds clamped to 0
    const negative = calculateKalamburyScores(-10, 5, 2);
    expect(negative.guesserPoints).toBe(50);

    // Extreme high seconds clamped to 60
    const high = calculateKalamburyScores(120, 5, 4);
    expect(high.guesserPoints).toBe(100);
  });

  it('M4-BVA-07: Lock timeout boundary at exactly 4000ms', () => {
    const el = {
      id: 'e1',
      type: 'shape' as const,
      x: 0,
      y: 0,
      color: '#000',
      createdBy: 'u1',
      lockedBy: 'u1',
      lockedAt: 10000,
    };

    // Exactly 3999 ms -> locked
    expect(isElementLockedByOther(el, 'u2', 10000 + 3999)).toBe(true);
    // Exactly 4000 ms -> expired / unlocked
    expect(isElementLockedByOther(el, 'u2', 10000 + 4000)).toBe(false);
  });
});
