import { describe, it, expect } from 'vitest';
import {
  calculatePairwiseWeight,
  determineEdgeStyle,
} from '../../src/lib/relations/relationshipWeights';
import { calculateConstellationLayout } from '../../src/lib/relations/graphLayout';
import {
  aggregateDiagnostics,
  generateMemberTooltipText,
} from '../../src/lib/relations/diagnosticEngine';
import { PeerEvaluationAnswer } from '../../src/types/evaluation';

describe('Milestone 3: Adversarial Boundary Values & Hardening (M3-BVA)', () => {
  it('M3-BVA-01: Absolute mathematical minimum W = -6 and maximum W = +42 across 3 rounds', () => {
    // Minimum: user A and user B only give -1 to each other across 3 stages
    const minEvals: PeerEvaluationAnswer[] = [];
    for (let stage = 1; stage <= 3; stage++) {
      minEvals.push({
        evaluatorId: 'uA',
        bestCollabUserId: 'uOther1',
        activeListenerUserId: 'uOther2',
        goalOrganizerUserId: 'uOther3',
        chaosUserId: 'uB', // -1
      });
      minEvals.push({
        evaluatorId: 'uB',
        bestCollabUserId: 'uOther1',
        activeListenerUserId: 'uOther2',
        goalOrganizerUserId: 'uOther3',
        chaosUserId: 'uA', // -1
      });
    }

    const minResult = calculatePairwiseWeight(minEvals, 'uA', 'uB');
    expect(minResult.weight).toBe(-6);
    expect(minResult.chaosBetween).toBe(true);

    const minStyle = determineEdgeStyle(minResult.weight, minResult.chaosBetween);
    expect(minStyle.style).toBe('dashed');
    expect(minStyle.strokeWidth).toBe(1);
    expect(minStyle.visible).toBe(true);
    expect(minStyle.hasGlow).toBe(false);

    // Maximum: user A and user B give +3, +2, +2 to each other across 3 stages (7 * 2 = 14 per stage * 3 = 42)
    const maxEvals: PeerEvaluationAnswer[] = [];
    for (let stage = 1; stage <= 3; stage++) {
      maxEvals.push({
        evaluatorId: 'uA',
        bestCollabUserId: 'uB', // +3
        activeListenerUserId: 'uB', // +2
        goalOrganizerUserId: 'uB', // +2
        chaosUserId: 'uOther',
      });
      maxEvals.push({
        evaluatorId: 'uB',
        bestCollabUserId: 'uA', // +3
        activeListenerUserId: 'uA', // +2
        goalOrganizerUserId: 'uA', // +2
        chaosUserId: 'uOther',
      });
    }

    const maxResult = calculatePairwiseWeight(maxEvals, 'uA', 'uB');
    expect(maxResult.weight).toBe(42);
    expect(maxResult.chaosBetween).toBe(false);

    const maxStyle = determineEdgeStyle(maxResult.weight, maxResult.chaosBetween);
    expect(maxStyle.style).toBe('thick');
    expect(maxStyle.strokeWidth).toBe(6);
    expect(maxStyle.hasGlow).toBe(true);
    expect(maxStyle.visible).toBe(true);
  });

  it('M3-BVA-02: Strict style transition thresholds at W = 0, 1, 3, 4, 7, 8', () => {
    // W = 0 without chaos: invisible
    const w0NoChaos = determineEdgeStyle(0, false);
    expect(w0NoChaos.visible).toBe(false);

    // W = 0 with chaos: dashed 1px visible
    const w0Chaos = determineEdgeStyle(0, true);
    expect(w0Chaos.visible).toBe(true);
    expect(w0Chaos.style).toBe('dashed');
    expect(w0Chaos.strokeWidth).toBe(1);

    // W = 1: lower bound of thin (1px, solid)
    const w1 = determineEdgeStyle(1);
    expect(w1.style).toBe('thin');
    expect(w1.strokeWidth).toBe(1);
    expect(w1.hasGlow).toBe(false);

    // W = 3: upper bound of thin (1px, solid)
    const w3 = determineEdgeStyle(3);
    expect(w3.style).toBe('thin');
    expect(w3.strokeWidth).toBe(1);
    expect(w3.hasGlow).toBe(false);

    // W = 4: lower bound of medium (3px, solid)
    const w4 = determineEdgeStyle(4);
    expect(w4.style).toBe('medium');
    expect(w4.strokeWidth).toBe(3);
    expect(w4.hasGlow).toBe(false);

    // W = 7: upper bound of medium (3px, solid)
    const w7 = determineEdgeStyle(7);
    expect(w7.style).toBe('medium');
    expect(w7.strokeWidth).toBe(3);
    expect(w7.hasGlow).toBe(false);

    // W = 8: lower bound of thick/glow (6px, neon glow)
    const w8 = determineEdgeStyle(8);
    expect(w8.style).toBe('thick');
    expect(w8.strokeWidth).toBe(6);
    expect(w8.hasGlow).toBe(true);
  });

  it('M3-BVA-03: Constellation layout gracefully adapts to boundary team sizes (N = 2 to 12)', () => {
    // Boundary 1: Minimum team size (2 members: 1 leader, 1 member)
    const twoMembers = [
      { id: 'm1', name: 'Leader L', role: 'leader' as const },
      { id: 'm2', name: 'Member M', role: 'member' as const },
    ];
    const layout2 = calculateConstellationLayout(twoMembers, 700, 500);
    expect(layout2.length).toBe(2);
    expect(layout2[0].y).toBe(110); // Leader top
    expect(layout2[1].y).toBeGreaterThan(110); // Member below

    // Boundary 2: Large team (12 members: 1 leader, 11 members)
    const twelveMembers = [
      { id: 'lead', name: 'Leader', role: 'leader' as const },
      ...Array.from({ length: 11 }, (_, i) => ({
        id: `mem-${i}`,
        name: `Member ${i}`,
        role: 'member' as const,
      })),
    ];
    const layout12 = calculateConstellationLayout(twelveMembers, 700, 500);
    expect(layout12.length).toBe(12);

    // All positions within bounds [0..700, 0..500]
    layout12.forEach((pos) => {
      expect(pos.x).toBeGreaterThanOrEqual(0);
      expect(pos.x).toBeLessThanOrEqual(700);
      expect(pos.y).toBeGreaterThanOrEqual(50);
      expect(pos.y).toBeLessThanOrEqual(500);
    });

    // Empty list boundary
    expect(calculateConstellationLayout([])).toEqual([]);
  });

  it('M3-BVA-04: Diagnostic Engine handles edge cases: zero evaluations and extreme leader scores', () => {
    const testMembers = [
      { id: 'l1', name: 'Lidia', role: 'leader' as const },
      { id: 'm1', name: 'Marek', role: 'member' as const },
    ];

    // Zero incoming evaluations
    const { memberMetrics, context } = aggregateDiagnostics({
      members: testMembers,
      peerEvaluations: [],
      hasCompletedStage2: false,
      leaderRatings: [
        { evaluatorId: 'm1', speechSpace: 1, atmosphere: 1 }, // Lowest scores
      ],
    });

    // Leader tooltip with low space & atmosphere (< 3.0)
    const leaderTooltip = generateMemberTooltipText(memberMetrics['l1'], context);
    expect(leaderTooltip).toContain('potrzebę większej przestrzeni');
    expect(leaderTooltip).toContain('stresu i napięć');

    // Member with 0 votes is identified as peripheral
    const memberTooltip = generateMemberTooltipText(memberMetrics['m1'], context);
    expect(memberTooltip).toContain('na uboczu dynamiki');
  });
});
