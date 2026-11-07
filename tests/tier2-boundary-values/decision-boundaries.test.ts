import { describe, it, expect } from 'vitest';
import {
  calculateAbsoluteDifferenceSum,
  calculateSynergy,
  detectSilentExpert
} from '../helpers/expertKeys';

describe('Tier 2: Boundary Values & Mathematical Extremes in Decision Scoring', () => {
  const expertKey = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

  it('R3-BVA-01: Boundary 0 - Minimum error when user matches expert key perfectly', () => {
    const perfectRanking = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    const score = calculateAbsoluteDifferenceSum(perfectRanking, expertKey);
    expect(score).toBe(0);
  });

  it('R3-BVA-02: Boundary 112 - Absolute maximum mathematical error when ranking is reversed', () => {
    // Completely reversed ranking: R(i) = 16 - E(i)
    // Differences: |1-15| + |2-14| + ... + |15-1|
    // 14 + 12 + 10 + 8 + 6 + 4 + 2 + 0 + 2 + 4 + 6 + 8 + 10 + 12 + 14 = 112
    const reversedRanking = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
    const score = calculateAbsoluteDifferenceSum(reversedRanking, expertKey);
    expect(score).toBe(112);
  });

  it('R3-BVA-03: Length mismatch triggers defensive validation error', () => {
    expect(() => calculateAbsoluteDifferenceSum([1, 2, 3], expertKey)).toThrow('Length mismatch');
    expect(() => calculateAbsoluteDifferenceSum([], expertKey)).toThrow('Length mismatch');
  });

  it('R3-BVA-04: Synergy delta at exact boundary zero (Neutral Synergy)', () => {
    // All members and team scored identically (e.g. 40)
    const individualScores = [40, 40, 40, 40];
    const teamScore = 40;
    const synergy = calculateSynergy(individualScores, teamScore);

    expect(synergy.synergyDelta).toBe(0);
    expect(synergy.isSynergyPositive).toBe(false); // 0 is not positive
  });

  it('R3-BVA-05: Silent Expert difference threshold boundary: exactly 4 vs exactly 5 points', () => {
    // Case A: TeamScore - Best = 4 -> NOT silent expert
    const listA = [
      { userId: 'u1', score: 30 },
      { userId: 'u2', score: 26 } // best = 26
    ];
    const teamScoreA = 30; // diff = 4
    const resA = detectSilentExpert(listA, teamScoreA);
    expect(resA.difference).toBe(4);
    expect(resA.isSilentExpert).toBe(false);

    // Case B: TeamScore - Best = 5 -> IS silent expert
    const listB = [
      { userId: 'u1', score: 31 },
      { userId: 'u2', score: 26 } // best = 26
    ];
    const teamScoreB = 31; // diff = 5
    const resB = detectSilentExpert(listB, teamScoreB);
    expect(resB.difference).toBe(5);
    expect(resB.isSilentExpert).toBe(true);
    expect(resB.silentExpertUserId).toBe('u2');
  });

  it('R3-BVA-06: Empty individual submissions safely handled without NaN or crash', () => {
    const emptyRes = calculateSynergy([], 30);
    expect(emptyRes.synergyDelta).toBe(0);
    expect(emptyRes.isSynergyPositive).toBe(false);

    const emptySilent = detectSilentExpert([], 30);
    expect(emptySilent.isSilentExpert).toBe(false);
  });
});
