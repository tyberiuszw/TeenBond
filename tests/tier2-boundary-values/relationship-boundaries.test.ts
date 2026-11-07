import { describe, it, expect } from 'vitest';
import {
  calculatePairwiseWeight,
  determineEdgeStyle
} from '../helpers/expertKeys';
import { PeerEvaluationAnswer } from '../helpers/contracts';

describe('Tier 2: Boundary Values in Relationship Graph & Peer Evaluations', () => {
  it('R4-BVA-01: Absolute mathematical minimum weight W = -6 across 3 evaluation rounds', () => {
    // Both users nominate each other ONLY for chaos (Q4 = -1) in each of the 3 stages (2, 4, 5)
    const threeRoundsEvaluations: PeerEvaluationAnswer[] = [];

    for (let round = 1; round <= 3; round++) {
      // User A nominates User B for chaos
      threeRoundsEvaluations.push({
        evaluatorId: 'uA',
        bestCollabUserId: 'uOther1',
        activeListenerUserId: 'uOther2',
        goalOrganizerUserId: 'uOther3',
        chaosUserId: 'uB' // -1
      });
      // User B nominates User A for chaos
      threeRoundsEvaluations.push({
        evaluatorId: 'uB',
        bestCollabUserId: 'uOther1',
        activeListenerUserId: 'uOther2',
        goalOrganizerUserId: 'uOther3',
        chaosUserId: 'uA' // -1
      });
    }

    const result = calculatePairwiseWeight(threeRoundsEvaluations, 'uA', 'uB');
    expect(result.weight).toBe(-6);
    expect(result.chaosBetween).toBe(true);

    const style = determineEdgeStyle(result.weight, result.chaosBetween);
    expect(style.style).toBe('dashed');
    expect(style.strokeWidth).toBe(1);
    expect(style.visible).toBe(true);
  });

  it('R4-BVA-02: Absolute mathematical maximum weight W = +42 across 3 evaluation rounds', () => {
    // Both users nominate each other for Q1 (+3), Q2 (+2), and Q3 (+2) in all 3 stages
    // 3 + 2 + 2 = 7 per direction * 2 directions = 14 per stage * 3 stages = 42
    const threeRoundsEvaluations: PeerEvaluationAnswer[] = [];

    for (let round = 1; round <= 3; round++) {
      threeRoundsEvaluations.push({
        evaluatorId: 'uA',
        bestCollabUserId: 'uB',    // +3
        activeListenerUserId: 'uB',// +2
        goalOrganizerUserId: 'uB', // +2
        chaosUserId: 'uOther'
      });
      threeRoundsEvaluations.push({
        evaluatorId: 'uB',
        bestCollabUserId: 'uA',    // +3
        activeListenerUserId: 'uA',// +2
        goalOrganizerUserId: 'uA', // +2
        chaosUserId: 'uOther'
      });
    }

    const result = calculatePairwiseWeight(threeRoundsEvaluations, 'uA', 'uB');
    expect(result.weight).toBe(42);
    expect(result.chaosBetween).toBe(false);

    const style = determineEdgeStyle(result.weight, result.chaosBetween);
    expect(style.style).toBe('thick');
    expect(style.strokeWidth).toBe(6);
    expect(style.hasGlow).toBe(true);
    expect(style.visible).toBe(true);
  });

  it('R4-BVA-03: Zero weight handling: Chaos conflict vs No interaction', () => {
    // Case 1: Zero interactions at all (pair never selected each other)
    const zeroInteractions = calculatePairwiseWeight([], 'uA', 'uB');
    expect(zeroInteractions.weight).toBe(0);
    expect(zeroInteractions.chaosBetween).toBe(false);

    const styleNone = determineEdgeStyle(zeroInteractions.weight, zeroInteractions.chaosBetween);
    expect(styleNone.visible).toBe(false); // invisible line when no connection

    // Case 2: W = 0 with mutual tension (+2 and -2 from two events, or -1 and +1)
    const cancelEvaluations: PeerEvaluationAnswer[] = [
      {
        evaluatorId: 'uA',
        bestCollabUserId: 'uOther',
        activeListenerUserId: 'uB', // +2
        goalOrganizerUserId: 'uOther',
        chaosUserId: 'uOther'
      },
      {
        evaluatorId: 'uB',
        bestCollabUserId: 'uOther',
        activeListenerUserId: 'uOther',
        goalOrganizerUserId: 'uOther',
        chaosUserId: 'uA' // -1
      },
      {
        evaluatorId: 'uA',
        bestCollabUserId: 'uOther',
        activeListenerUserId: 'uOther',
        goalOrganizerUserId: 'uOther',
        chaosUserId: 'uB' // -1
      }
    ];
    // Weight = 2 - 1 - 1 = 0, but chaosBetween = true
    const tensionZero = calculatePairwiseWeight(cancelEvaluations, 'uA', 'uB');
    expect(tensionZero.weight).toBe(0);
    expect(tensionZero.chaosBetween).toBe(true);

    const styleTension = determineEdgeStyle(tensionZero.weight, tensionZero.chaosBetween);
    expect(styleTension.style).toBe('dashed');
    expect(styleTension.visible).toBe(true);
  });

  it('R4-BVA-04: Exact boundary values for edge transitions (W = 3, 4, 7, 8)', () => {
    // Upper boundary of thin: W = 3
    expect(determineEdgeStyle(3).style).toBe('thin');
    expect(determineEdgeStyle(3).strokeWidth).toBe(1);

    // Lower boundary of medium: W = 4
    expect(determineEdgeStyle(4).style).toBe('medium');
    expect(determineEdgeStyle(4).strokeWidth).toBe(3);

    // Upper boundary of medium: W = 7
    expect(determineEdgeStyle(7).style).toBe('medium');
    expect(determineEdgeStyle(7).strokeWidth).toBe(3);

    // Lower boundary of thick/glow: W = 8
    expect(determineEdgeStyle(8).style).toBe('thick');
    expect(determineEdgeStyle(8).strokeWidth).toBe(6);
    expect(determineEdgeStyle(8).hasGlow).toBe(true);
  });
});
