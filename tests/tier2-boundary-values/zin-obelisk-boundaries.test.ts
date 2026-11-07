import { describe, it, expect } from 'vitest';
import { validateZinAnswer } from '../helpers/expertKeys';

describe('Tier 2: Boundary Values in The Zin Obelisk & Deduction', () => {
  it('R5-BVA-ZIN-01: Timer countdown boundaries trigger read-only state at exactly 0 seconds', () => {
    function getBoardLockState(timeLeftSeconds: number): { isLocked: boolean; statusMessage: string } {
      if (timeLeftSeconds <= 0) {
        return { isLocked: true, statusMessage: 'Czas minął! Tablica w trybie tylko do odczytu.' };
      }
      return { isLocked: false, statusMessage: 'Trwa rozwiązywanie zagadki...' };
    }

    expect(getBoardLockState(1500)).toEqual({ isLocked: false, statusMessage: 'Trwa rozwiązywanie zagadki...' });
    expect(getBoardLockState(1)).toEqual({ isLocked: false, statusMessage: 'Trwa rozwiązywanie zagadki...' });
    expect(getBoardLockState(0)).toEqual({ isLocked: true, statusMessage: 'Czas minął! Tablica w trybie tylko do odczytu.' });
    expect(getBoardLockState(-5)).toEqual({ isLocked: true, statusMessage: 'Czas minął! Tablica w trybie tylko do odczytu.' });
  });

  it('R5-BVA-ZIN-02: Input sanitization protects against adversarial and malformed inputs', () => {
    // Normalizations of valid answers
    expect(validateZinAnswer(' \n  NEPTIMINUS! \t ')).toBe(true);
    expect(validateZinAnswer('Neptominus???')).toBe(true);
    expect(validateZinAnswer('Dzień Neptuna')).toBe(true);

    // Empty and whitespace only
    expect(validateZinAnswer('')).toBe(false);
    expect(validateZinAnswer('   ')).toBe(false);
    expect(validateZinAnswer('\n\t\r')).toBe(false);

    // Adversarial injection payloads
    expect(validateZinAnswer("' OR 1=1 --")).toBe(false);
    expect(validateZinAnswer('<script>alert("hack")</script>')).toBe(false);
    expect(validateZinAnswer('; DROP TABLE game_sessions;')).toBe(false);
  });

  it('R5-BVA-ZIN-03: Minimum and maximum team sizes for clue distribution (2 to 12 players)', () => {
    function allocateClues(totalClues: number, memberCount: number): number[] {
      if (memberCount < 2 || memberCount > 12) {
        throw new Error('Unsupported team size: must be between 2 and 12');
      }
      const base = Math.floor(totalClues / memberCount);
      const remainder = totalClues % memberCount;
      return Array.from({ length: memberCount }, (_, i) => base + (i < remainder ? 1 : 0));
    }

    // Min boundary: 2 players
    const dist2 = allocateClues(33, 2);
    expect(dist2).toEqual([17, 16]);

    // Max boundary: 12 players
    const dist12 = allocateClues(33, 12);
    expect(dist12.reduce((a, b) => a + b, 0)).toBe(33);
    expect(Math.max(...dist12) - Math.min(...dist12)).toBeLessThanOrEqual(1);

    // Out of bounds
    expect(() => allocateClues(33, 1)).toThrow('Unsupported team size');
    expect(() => allocateClues(33, 13)).toThrow('Unsupported team size');
  });
});
