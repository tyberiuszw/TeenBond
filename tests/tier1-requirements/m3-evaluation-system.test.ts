import { describe, it, expect } from 'vitest';
import {
  calculatePairwiseWeight,
  determineEdgeStyle,
  validatePeerEvaluation,
} from '../../src/lib/relations/relationshipWeights';
import {
  calculateConstellationLayout,
  calculateMidpoint,
} from '../../src/lib/relations/graphLayout';
import {
  aggregateDiagnostics,
  generateMemberTooltipText,
  generateTeamDiagnosticSummary,
} from '../../src/lib/relations/diagnosticEngine';
import { buildRelationshipGraph } from '../../src/lib/relations/buildGraph';
import {
  DEMO_ALFA_PEER_EVALUATIONS_STAGE2,
  DEMO_ALFA_LEADER_RATINGS,
  DEMO_ALFA_MEMBER_RATINGS_BY_LEADER,
} from '../../src/lib/relations/mockEvaluations';
import { useDemoStore } from '../../src/lib/demo-store';
import { getDataClient } from '../../src/lib/data-client';

describe('Milestone 3: Evaluation System & Relationship Tree (F08, F09, F10, F11)', () => {
  const membersAlfa = [
    { id: 'usr-anna', name: 'Anna', role: 'leader' as const, chameleonColor: '#10B981' },
    { id: 'usr-bartek', name: 'Bartek', role: 'member' as const, chameleonColor: '#3B82F6' },
    { id: 'usr-celina', name: 'Celina', role: 'member' as const, chameleonColor: '#8B5CF6' },
    { id: 'usr-dawid', name: 'Dawid', role: 'member' as const, chameleonColor: '#F59E0B' },
    { id: 'usr-ewa', name: 'Ewa', role: 'member' as const, chameleonColor: '#EC4899' },
  ];

  it('F08: Anti-self-selection validation blocks self-nomination in any question', () => {
    // Self-vote on Q1
    const invalidQ1 = {
      evaluatorId: 'usr-bartek',
      bestCollabUserId: 'usr-bartek',
      activeListenerUserId: 'usr-ewa',
      goalOrganizerUserId: 'usr-celina',
      chaosUserId: 'usr-anna',
    };
    expect(validatePeerEvaluation(invalidQ1).valid).toBe(false);
    expect(validatePeerEvaluation(invalidQ1).error).toContain('współpracę');

    // Self-vote on Q2
    const invalidQ2 = {
      evaluatorId: 'usr-bartek',
      bestCollabUserId: 'usr-anna',
      activeListenerUserId: 'usr-bartek',
      goalOrganizerUserId: 'usr-celina',
      chaosUserId: 'usr-anna',
    };
    expect(validatePeerEvaluation(invalidQ2).valid).toBe(false);
    expect(validatePeerEvaluation(invalidQ2).error).toContain('aktywne słuchanie');

    // Self-vote on Q3
    const invalidQ3 = {
      evaluatorId: 'usr-bartek',
      bestCollabUserId: 'usr-anna',
      activeListenerUserId: 'usr-ewa',
      goalOrganizerUserId: 'usr-bartek',
      chaosUserId: 'usr-anna',
    };
    expect(validatePeerEvaluation(invalidQ3).valid).toBe(false);
    expect(validatePeerEvaluation(invalidQ3).error).toContain('organizację celu');

    // Self-vote on Q4
    const invalidQ4 = {
      evaluatorId: 'usr-bartek',
      bestCollabUserId: 'usr-anna',
      activeListenerUserId: 'usr-ewa',
      goalOrganizerUserId: 'usr-celina',
      chaosUserId: 'usr-bartek',
    };
    expect(validatePeerEvaluation(invalidQ4).valid).toBe(false);
    expect(validatePeerEvaluation(invalidQ4).error).toContain('chaos');

    // Valid evaluation
    const valid = {
      evaluatorId: 'usr-bartek',
      bestCollabUserId: 'usr-anna',
      activeListenerUserId: 'usr-ewa',
      goalOrganizerUserId: 'usr-celina',
      chaosUserId: 'usr-dawid',
    };
    expect(validatePeerEvaluation(valid).valid).toBe(true);
  });

  it('F09: Weight formula W(A,B) adds mutual points and maps correctly to 4 visual styles', () => {
    // Anna <-> Ewa
    // Anna -> Ewa: bestCollab (+3) + activeListener (+2) = 5
    // Ewa -> Anna: bestCollab (+3) = 3
    // Total = 8 -> Class 4 with neon glow
    const evals = [
      {
        evaluatorId: 'usr-anna',
        bestCollabUserId: 'usr-ewa',
        activeListenerUserId: 'usr-ewa',
        goalOrganizerUserId: 'usr-celina',
        chaosUserId: 'usr-bartek',
      },
      {
        evaluatorId: 'usr-ewa',
        bestCollabUserId: 'usr-anna',
        activeListenerUserId: 'usr-bartek',
        goalOrganizerUserId: 'usr-celina',
        chaosUserId: 'usr-bartek',
      },
    ];

    const weightAnnaEwa = calculatePairwiseWeight(evals, 'usr-anna', 'usr-ewa');
    expect(weightAnnaEwa.weight).toBe(8);
    expect(weightAnnaEwa.chaosBetween).toBe(false);

    const styleAnnaEwa = determineEdgeStyle(weightAnnaEwa.weight, weightAnnaEwa.chaosBetween);
    expect(styleAnnaEwa.style).toBe('thick');
    expect(styleAnnaEwa.strokeWidth).toBe(6);
    expect(styleAnnaEwa.hasGlow).toBe(true);
    expect(styleAnnaEwa.color).toBe('#10B981');

    // Bartek <-> Celina: Mutual chaos nominations (-1 and -1) = -2 -> Class 1 dashed
    const chaosEvals = [
      {
        evaluatorId: 'usr-bartek',
        bestCollabUserId: 'usr-anna',
        activeListenerUserId: 'usr-ewa',
        goalOrganizerUserId: 'usr-anna',
        chaosUserId: 'usr-celina',
      },
      {
        evaluatorId: 'usr-celina',
        bestCollabUserId: 'usr-anna',
        activeListenerUserId: 'usr-ewa',
        goalOrganizerUserId: 'usr-anna',
        chaosUserId: 'usr-bartek',
      },
    ];

    const weightBartekCelina = calculatePairwiseWeight(chaosEvals, 'usr-bartek', 'usr-celina');
    expect(weightBartekCelina.weight).toBe(-2);
    expect(weightBartekCelina.chaosBetween).toBe(true);

    const styleBartekCelina = determineEdgeStyle(weightBartekCelina.weight, weightBartekCelina.chaosBetween);
    expect(styleBartekCelina.style).toBe('dashed');
    expect(styleBartekCelina.strokeWidth).toBe(1);
    expect(styleBartekCelina.visible).toBe(true);
    expect(styleBartekCelina.color).toBe('#EF4444');
  });

  it('F09: Constellation layout correctly positions Leader on top and members on symmetrical arc', () => {
    const layout = calculateConstellationLayout(membersAlfa, 700, 500);
    expect(layout.length).toBe(5);

    // Leader on top center (x=350, y=110)
    const leaderPos = layout.find((p) => p.role === 'leader');
    expect(leaderPos).toBeDefined();
    expect(leaderPos?.x).toBe(350);
    expect(leaderPos?.y).toBe(110);

    // Midpoint between Leader and Ewa
    const ewaPos = layout.find((p) => p.id === 'usr-ewa')!;
    const mid = calculateMidpoint(leaderPos!, ewaPos);
    expect(mid.x).toBe(Math.round((leaderPos!.x + ewaPos.x) / 2));
    expect(mid.y).toBe(Math.round((leaderPos!.y + ewaPos.y) / 2));
  });

  it('F10: Diagnostic rule engine identifies Team Glue, Goal Coordinator, Silent Expert, and Mediation needs', () => {
    const graphData = buildRelationshipGraph({
      members: membersAlfa,
      evaluations: DEMO_ALFA_PEER_EVALUATIONS_STAGE2.map((e) => ({
        ...e,
        evaluatorId: e.evaluatorId.replace('demo-user-', 'usr-'),
        bestCollabUserId: e.bestCollabUserId.replace('demo-user-', 'usr-'),
        activeListenerUserId: e.activeListenerUserId.replace('demo-user-', 'usr-'),
        goalOrganizerUserId: e.goalOrganizerUserId.replace('demo-user-', 'usr-'),
        chaosUserId: e.chaosUserId.replace('demo-user-', 'usr-'),
      })),
      stage2Data: {
        teamScore: 32,
        synergyDelta: 6.8,
        silentExpertUserId: 'usr-dawid',
        individualScores: {
          'usr-anna': 42,
          'usr-bartek': 48,
          'usr-celina': 44,
          'usr-dawid': 22,
          'usr-ewa': 38,
        },
      },
      leaderRatings: [
        { evaluatorId: 'usr-bartek', speechSpace: 4, atmosphere: 4 },
        { evaluatorId: 'usr-celina', speechSpace: 5, atmosphere: 5 },
      ],
      leaderMemberEvaluations: {
        'usr-celina': { engagement: 5, openness: 5 },
      },
    });

    expect(graphData.nodes.length).toBe(5);

    // Node: Ewa should be identified as Team Glue (rolę spoiwa)
    const ewaNode = graphData.nodes.find((n) => n.id === 'usr-ewa')!;
    expect(ewaNode.tooltipText).toContain('rolę spoiwa');
    expect(ewaNode.votes.listening).toBeGreaterThanOrEqual(2);

    // Node: Celina should be identified as Goal Coordinator (koordynatorem zespołu)
    const celinaNode = graphData.nodes.find((n) => n.id === 'usr-celina')!;
    expect(celinaNode.tooltipText).toContain('koordynatorem zespołu');

    // Node: Dawid should be identified as Silent Expert (intuicję analityczną) and Peripheral
    const dawidNode = graphData.nodes.find((n) => n.id === 'usr-dawid')!;
    expect(dawidNode.tooltipText).toContain('intuicję analityczną');

    // Node: Bartek should have tension indicator (tarcia komunikacyjne)
    const bartekNode = graphData.nodes.find((n) => n.id === 'usr-bartek')!;
    expect(bartekNode.tooltipText).toContain('tarcia komunikacyjne');

    // Leader Cards:
    expect(graphData.diagnosticSummary.synergyText).toContain('pozytywny Efekt Synergii');
    expect(graphData.diagnosticSummary.expertText).toContain('Cichego Eksperta');
    expect(graphData.diagnosticSummary.frictionText).toContain('punkt tarcia');
  });

  it('F11: Security hermetization enforces that non-leader access throws 403 Forbidden in DataClient', async () => {
    const store = useDemoStore.getState();

    // Switch to member Bartek
    store.switchActiveUser('demo-user-bartek');
    const client = getDataClient();

    await expect(client.getRelationshipGraph()).rejects.toThrow('403 Forbidden');

    // Switch to Leader Anna
    store.switchActiveUser('demo-user-anna');
    const leaderGraph = await client.getRelationshipGraph();
    expect(leaderGraph).toBeDefined();
    expect(leaderGraph.nodes.length).toBe(5);
  });
});
