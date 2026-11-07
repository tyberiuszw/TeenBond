import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RelationsPage from '../../src/app/relations/page';
import { ConfidentialNotice } from '../../src/components/relations/ConfidentialNotice';
import { EvaluationSurveyModal } from '../../src/components/relations/EvaluationSurveyModal';
import { useDemoStore } from '../../src/lib/demo-store';
import { getDataClient } from '../../src/lib/data-client';
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
import { PeerEvaluationAnswer } from '../../src/types/evaluation';
import { Role } from '../../src/types/auth';

// Mock next/navigation for Next.js app router components
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  usePathname: () => '/relations',
}));

describe('Milestone 3 Empirical Verification: Challenger 2 Harness', () => {
  beforeEach(() => {
    // Reset demo store before each test
    useDemoStore.getState().resetToInitial();
  });

  // =========================================================================
  // 1. ACCESS CONTROL LOCKOUT: REGULAR MEMBERS STRICTLY RENDER CONFIDENTIALNOTICE
  // =========================================================================
  describe('Requirement 1: Access Control Lockout on /relations', () => {
    const regularMembers = [
      { id: 'demo-user-bartek', name: 'Bartek' },
      { id: 'demo-user-dawid', name: 'Dawid' },
      { id: 'demo-user-celina', name: 'Celina' },
      { id: 'demo-user-ewa', name: 'Ewa' },
    ];

    regularMembers.forEach(({ id, name }) => {
      it(`renders ConfidentialNotice and locks out member ${name} (${id})`, () => {
        // Switch active user to the regular member
        useDemoStore.getState().switchActiveUser(id);
        const active = useDemoStore.getState().getActiveUser();
        expect(active.role).toBe('member');
        expect(active.id).toBe(id);

        // Render page to static HTML string
        const html = renderToString(<RelationsPage />);

        // 1. MUST strictly render Confidential Notice markers
        expect(html).toContain('Drzewko Relacji Zablokowane');
        expect(html).toContain('Strefa Poufna Lidera');
        expect(html).toContain('pełne bezpieczeństwo psychologiczne');
        expect(html).toContain('Dlaczego te dane są poufne?');
        expect(html).toContain(name);
        expect(html).toContain('Członek Zespołu');
        expect(html).toContain('Przełącz na Lidera');
        expect(html).toContain('Anna');

        // 2. MUST NEVER leak graph canvas, nodes, edges, or diagnostic data into DOM
        expect(html).not.toContain('viewBox="0 0 700 500"'); // Graph SVG canvas
        expect(html).not.toContain('id="neon-glow"');
        expect(html).not.toContain('id="node-shadow"');
        expect(html).not.toContain('stroke-solid-thick-glow');
        expect(html).not.toContain('stroke-dashed-tension');
        expect(html).not.toContain('Interaktywna Mapa Więzi Zespołowych');
        expect(html).not.toContain('Karty Diagnostyczne Zespołu');
        expect(html).not.toContain('Filary Relacji i Empatii');
        expect(html).not.toContain('Obszar do Wsparcia (Mediacja)');
        expect(html).not.toContain('Cichy Ekspert');
        expect(html).not.toContain('Efekt Synergii');
        expect(html).not.toContain('Diagnostyka Zaufania i Synergii');
      });
    });

    it('renders full Algorytmiczne Drzewko Relacji and SVG canvas when active user is Leader Anna', () => {
      useDemoStore.getState().switchActiveUser('demo-user-anna');
      const active = useDemoStore.getState().getActiveUser();
      expect(active.role).toBe('leader');

      const html = renderToString(<RelationsPage />);

      // Should render leader dashboard & SVG
      expect(html).toContain('Algorytmiczne Drzewko Relacji');
      expect(html).toContain('Diagnostyka Zaufania i Synergii');
      expect(html).toContain('Interaktywna Mapa Więzi Zespołowych');
      expect(html).toContain('Karty Diagnostyczne Zespołu (Widok Poufny Lidera)');
      expect(html).toContain('<svg');
      expect(html).toContain('neon-glow');
      expect(html).toContain('Anna');
      expect(html).toContain('Bartek');
      expect(html).toContain('Dawid');
      expect(html).toContain('Celina');
      expect(html).toContain('Ewa');

      // Should NOT render Confidential Notice lockout
      expect(html).not.toContain('Drzewko Relacji Zablokowane');
      expect(html).not.toContain('Strefa Poufna Lidera');
    });
  });

  // =========================================================================
  // 2. CLIENT ISOLATION: NON-LEADER dataClient.getRelationshipGraph() THROWS 403
  // =========================================================================
  describe('Requirement 2: Client Isolation (DataClient 403 Forbidden)', () => {
    const nonLeaders = [
      'demo-user-bartek',
      'demo-user-dawid',
      'demo-user-celina',
      'demo-user-ewa',
    ];

    nonLeaders.forEach((userId) => {
      it(`calling getRelationshipGraph() as ${userId} strictly rejects with 403 Forbidden`, async () => {
        useDemoStore.getState().switchActiveUser(userId);
        const client = getDataClient();

        await expect(client.getRelationshipGraph()).rejects.toThrow(
          /403 Forbidden.*Drzewko Relacji/
        );
      });
    });

    it('calling getRelationshipGraph() as Leader Anna resolves graph payload with nodes and edges', async () => {
      useDemoStore.getState().switchActiveUser('demo-user-anna');
      const client = getDataClient();

      const graph = await client.getRelationshipGraph();
      expect(graph).toBeDefined();
      expect(Array.isArray(graph.nodes)).toBe(true);
      expect(graph.nodes.length).toBe(5);
      expect(Array.isArray(graph.edges)).toBe(true);
      expect(graph.edges.length).toBeGreaterThan(0);
      expect(graph.diagnosticSummary).toBeDefined();
      expect(graph.diagnosticSummary.leaderTitle).toContain('Raport Diagnostyczny');
    });
  });

  // =========================================================================
  // 3. ANTI-SELF-SELECTION: PHYSICALLY & LOGICALLY PROHIBITED FROM SELF-VOTING
  // =========================================================================
  describe('Requirement 3: Anti-Self-Selection Lockout', () => {
    it('physically locks out self-tile in DOM as non-clickable disabled div with Lock icon', () => {
      useDemoStore.getState().switchActiveUser('demo-user-dawid');
      const html = renderToString(
        <EvaluationSurveyModal isOpen={true} onClose={() => {}} stageNumber={2} />
      );

      // Dawid is active user -> his tile MUST have lock indicator and disabled cursor
      expect(html).toContain('Dawid');
      expect(html).toContain('(To Ty — wybór zablokowany)');
      expect(html).toContain('cursor-not-allowed');

      // Other 4 members are rendered with clickable buttons
      expect(html).toContain('Anna');
      expect(html).toContain('Bartek');
      expect(html).toContain('Celina');
      expect(html).toContain('Ewa');
    });

    it('logically rejects self-nomination across each of the 4 survey questions individually', () => {
      const evaluator = 'usr-charlie';

      // Q1 self-nomination
      const q1Self: PeerEvaluationAnswer = {
        evaluatorId: evaluator,
        bestCollabUserId: evaluator,
        activeListenerUserId: 'usr-alice',
        goalOrganizerUserId: 'usr-bob',
        chaosUserId: 'usr-david',
      };
      const resQ1 = validatePeerEvaluation(q1Self);
      expect(resQ1.valid).toBe(false);
      expect(resQ1.error).toContain('współpracę');

      // Q2 self-nomination
      const q2Self: PeerEvaluationAnswer = {
        evaluatorId: evaluator,
        bestCollabUserId: 'usr-alice',
        activeListenerUserId: evaluator,
        goalOrganizerUserId: 'usr-bob',
        chaosUserId: 'usr-david',
      };
      const resQ2 = validatePeerEvaluation(q2Self);
      expect(resQ2.valid).toBe(false);
      expect(resQ2.error).toContain('aktywne słuchanie');

      // Q3 self-nomination
      const q3Self: PeerEvaluationAnswer = {
        evaluatorId: evaluator,
        bestCollabUserId: 'usr-alice',
        activeListenerUserId: 'usr-bob',
        goalOrganizerUserId: evaluator,
        chaosUserId: 'usr-david',
      };
      const resQ3 = validatePeerEvaluation(q3Self);
      expect(resQ3.valid).toBe(false);
      expect(resQ3.error).toContain('organizację celu');

      // Q4 self-nomination
      const q4Self: PeerEvaluationAnswer = {
        evaluatorId: evaluator,
        bestCollabUserId: 'usr-alice',
        activeListenerUserId: 'usr-bob',
        goalOrganizerUserId: 'usr-david',
        chaosUserId: evaluator,
      };
      const resQ4 = validatePeerEvaluation(q4Self);
      expect(resQ4.valid).toBe(false);
      expect(resQ4.error).toContain('chaos');

      // All 4 self-nominations
      const allSelf: PeerEvaluationAnswer = {
        evaluatorId: evaluator,
        bestCollabUserId: evaluator,
        activeListenerUserId: evaluator,
        goalOrganizerUserId: evaluator,
        chaosUserId: evaluator,
      };
      const resAll = validatePeerEvaluation(allSelf);
      expect(resAll.valid).toBe(false);

      // Distinct valid answer
      const validAnswer: PeerEvaluationAnswer = {
        evaluatorId: evaluator,
        bestCollabUserId: 'usr-alice',
        activeListenerUserId: 'usr-bob',
        goalOrganizerUserId: 'usr-david',
        chaosUserId: 'usr-eve',
      };
      const resValid = validatePeerEvaluation(validAnswer);
      expect(resValid.valid).toBe(true);
      expect(resValid.error).toBeUndefined();
    });
  });

  // =========================================================================
  // 4. MATHEMATICAL STRESS BOUNDARIES & ADVERSARIAL EXTREMES
  // =========================================================================
  describe('Requirement 4: Mathematical Stress Boundaries (No NaN, No Throw)', () => {
    it('handles All-Negative boundary extreme without NaN or throwing', () => {
      // 5 rounds of mutual friction/chaos between userA and userB
      const negativeEvals: PeerEvaluationAnswer[] = [];
      for (let r = 1; r <= 5; r++) {
        negativeEvals.push({
          evaluatorId: 'usrA',
          bestCollabUserId: 'usrOther',
          activeListenerUserId: 'usrOther',
          goalOrganizerUserId: 'usrOther',
          chaosUserId: 'usrB', // -1
        });
        negativeEvals.push({
          evaluatorId: 'usrB',
          bestCollabUserId: 'usrOther',
          activeListenerUserId: 'usrOther',
          goalOrganizerUserId: 'usrOther',
          chaosUserId: 'usrA', // -1
        });
      }

      const pairResult = calculatePairwiseWeight(negativeEvals, 'usrA', 'usrB');
      expect(pairResult.weight).toBe(-10);
      expect(pairResult.chaosBetween).toBe(true);
      expect(Number.isNaN(pairResult.weight)).toBe(false);

      const edgeStyle = determineEdgeStyle(pairResult.weight, pairResult.chaosBetween);
      expect(edgeStyle.style).toBe('dashed');
      expect(edgeStyle.strokeWidth).toBe(1);
      expect(edgeStyle.visible).toBe(true);
      expect(edgeStyle.color).toBe('#EF4444');
      expect(edgeStyle.hasGlow).toBe(false);
      expect(Number.isNaN(edgeStyle.strokeWidth)).toBe(false);
    });

    it('handles All-Positive boundary extreme without NaN or throwing', () => {
      // 10 rounds of mutual maximum points between userA and userB: (+3 +2 +2) * 2 = 14 per round * 10 = 140
      const positiveEvals: PeerEvaluationAnswer[] = [];
      for (let r = 1; r <= 10; r++) {
        positiveEvals.push({
          evaluatorId: 'usrA',
          bestCollabUserId: 'usrB',
          activeListenerUserId: 'usrB',
          goalOrganizerUserId: 'usrB',
          chaosUserId: 'usrOther',
        });
        positiveEvals.push({
          evaluatorId: 'usrB',
          bestCollabUserId: 'usrA',
          activeListenerUserId: 'usrA',
          goalOrganizerUserId: 'usrA',
          chaosUserId: 'usrOther',
        });
      }

      const pairResult = calculatePairwiseWeight(positiveEvals, 'usrA', 'usrB');
      expect(pairResult.weight).toBe(140);
      expect(pairResult.chaosBetween).toBe(false);
      expect(Number.isNaN(pairResult.weight)).toBe(false);

      const edgeStyle = determineEdgeStyle(pairResult.weight, pairResult.chaosBetween);
      expect(edgeStyle.style).toBe('thick');
      expect(edgeStyle.strokeWidth).toBe(6);
      expect(edgeStyle.visible).toBe(true);
      expect(edgeStyle.hasGlow).toBe(true);
      expect(edgeStyle.color).toBe('#10B981');
      expect(Number.isNaN(edgeStyle.strokeWidth)).toBe(false);
    });

    it('handles Zero Interaction (evaluations = []) gracefully without NaN or throwing', () => {
      const members = [
        { id: 'usr-l', name: 'Leader L', role: 'leader' as const },
        { id: 'usr-m1', name: 'Member 1', role: 'member' as const },
        { id: 'usr-m2', name: 'Member 2', role: 'member' as const },
      ];

      const graph = buildRelationshipGraph({
        members,
        evaluations: [], // Zero interactions
        stage2Data: {
          teamScore: 40,
          synergyDelta: 0.0,
          individualScores: { 'usr-l': 40, 'usr-m1': 40, 'usr-m2': 40 },
        },
      });

      expect(graph.nodes.length).toBe(3);
      // Zero interactions without chaos -> edges with W=0 are hidden
      expect(graph.edges.length).toBe(0);

      // Validate all node coordinates and text
      graph.nodes.forEach((n) => {
        expect(Number.isNaN(n.x)).toBe(false);
        expect(Number.isNaN(n.y)).toBe(false);
        expect(n.x).toBeGreaterThanOrEqual(0);
        expect(n.y).toBeGreaterThanOrEqual(0);
        expect(n.tooltipText).toBeDefined();
        expect(typeof n.tooltipText).toBe('string');
        expect(n.tooltipText.length).toBeGreaterThan(0);
      });

      // Diagnostic cards
      expect(graph.diagnosticSummary.cohesionText).toContain('wstępnym etapie budowania');
      expect(graph.diagnosticSummary.frictionText).toContain('wysoka harmonia');
    });

    it('scales team sizes N = 2 to 12 without NaN or out-of-bound coordinates', () => {
      const canvasWidth = 700;
      const canvasHeight = 500;

      for (let N = 2; N <= 12; N++) {
        const testMembers = [
          { id: 'leader-0', name: 'Leader', role: 'leader' as const },
          ...Array.from({ length: N - 1 }, (_, i) => ({
            id: `mem-${i + 1}`,
            name: `Gracz ${i + 1}`,
            role: 'member' as const,
          })),
        ];

        // Generate synthetic peer evaluations among team
        const syntheticEvals: PeerEvaluationAnswer[] = [];
        for (let i = 0; i < N; i++) {
          const evalId = testMembers[i].id;
          const otherIds = testMembers.filter((m) => m.id !== evalId).map((m) => m.id);

          syntheticEvals.push({
            evaluatorId: evalId,
            bestCollabUserId: otherIds[0 % otherIds.length],
            activeListenerUserId: otherIds[1 % otherIds.length],
            goalOrganizerUserId: otherIds[2 % otherIds.length] || otherIds[0],
            chaosUserId: otherIds[3 % otherIds.length] || otherIds[0],
          });
        }

        const graph = buildRelationshipGraph({
          members: testMembers,
          evaluations: syntheticEvals,
          stage2Data: {
            teamScore: 35,
            synergyDelta: 3.5,
            silentExpertUserId: testMembers[1].id,
            individualScores: Object.fromEntries(testMembers.map((m) => [m.id, 30])),
          },
          canvasWidth,
          canvasHeight,
        });

        // 1. Exactly N nodes
        expect(graph.nodes.length).toBe(N);

        // 2. Leader always at top center (350, 110)
        const leaderNode = graph.nodes.find((n) => n.role === 'leader');
        expect(leaderNode).toBeDefined();
        expect(leaderNode?.x).toBe(350);
        expect(leaderNode?.y).toBe(110);

        // 3. Every node within canvas boundaries and strictly non-NaN
        graph.nodes.forEach((node) => {
          expect(Number.isNaN(node.x)).toBe(false);
          expect(Number.isNaN(node.y)).toBe(false);
          expect(node.x).toBeGreaterThanOrEqual(0);
          expect(node.x).toBeLessThanOrEqual(canvasWidth);
          expect(node.y).toBeGreaterThanOrEqual(50);
          expect(node.y).toBeLessThanOrEqual(canvasHeight);
          expect(typeof node.tooltipText).toBe('string');
          expect(node.tooltipText.length).toBeGreaterThan(0);
        });

        // 4. Edges check
        graph.edges.forEach((edge) => {
          expect(Number.isNaN(edge.weight)).toBe(false);
          expect(Number.isNaN(edge.strokeWidth)).toBe(false);
          expect(edge.strokeWidth).toBeGreaterThan(0);
          expect(['thin', 'medium', 'thick', 'dashed']).toContain(edge.style);

          // Verify midpoint calculation
          const src = graph.nodes.find((n) => n.id === edge.source)!;
          const tgt = graph.nodes.find((n) => n.id === edge.target)!;
          const mid = calculateMidpoint(src, tgt);
          expect(Number.isNaN(mid.x)).toBe(false);
          expect(Number.isNaN(mid.y)).toBe(false);
        });

        // 5. Diagnostic Summary exists
        expect(graph.diagnosticSummary).toBeDefined();
        expect(graph.diagnosticSummary.synergyText).toContain('pozytywny Efekt Synergii (+3.5 pkt)');
        expect(graph.diagnosticSummary.expertText).toContain('Cichego Eksperta');
      }
    });

    it('robustly handles extreme edge cases: single member (N=1) and negative synergy', () => {
      // N=1 (Only Leader in team)
      const singleMember = [{ id: 'usr-solo', name: 'Solo Leader', role: 'leader' as const }];
      const layout1 = calculateConstellationLayout(singleMember, 700, 500);
      expect(layout1.length).toBe(1);
      expect(layout1[0].x).toBe(350);
      expect(layout1[0].y).toBe(110);

      const graphSolo = buildRelationshipGraph({
        members: singleMember,
        evaluations: [],
      });
      expect(graphSolo.nodes.length).toBe(1);
      expect(graphSolo.edges.length).toBe(0);

      // Negative synergy in Stage 2 (-12.8 pkt)
      const graphNegativeSynergy = buildRelationshipGraph({
        members: [
          { id: 'l1', name: 'Lidia', role: 'leader' as const },
          { id: 'm1', name: 'Marek', role: 'member' as const },
        ],
        evaluations: [],
        stage2Data: {
          teamScore: 55,
          synergyDelta: -12.8,
          individualScores: { l1: 42, m1: 42 },
        },
      });

      expect(graphNegativeSynergy.diagnosticSummary.synergyText).toContain('ujemny efekt synergii (-12.8 pkt)');
      expect(Number.isNaN(graphNegativeSynergy.nodes[0].x)).toBe(false);
    });

    it('empirically verifies N=2 team boundary with two-way ratings (Leader & Member)', () => {
      const duoMembers = [
        { id: 'usr-leader', name: 'Liderka', role: 'leader' as const },
        { id: 'usr-member', name: 'Członek', role: 'member' as const },
      ];

      const evaluations: PeerEvaluationAnswer[] = [
        {
          evaluatorId: 'usr-leader',
          bestCollabUserId: 'usr-member',
          activeListenerUserId: 'usr-member',
          goalOrganizerUserId: 'usr-member',
          chaosUserId: 'usr-member', // Net: +3 +2 +2 -1 = +6
        },
        {
          evaluatorId: 'usr-member',
          bestCollabUserId: 'usr-leader',
          activeListenerUserId: 'usr-leader',
          goalOrganizerUserId: 'usr-leader',
          chaosUserId: 'usr-leader', // Net: +3 +2 +2 -1 = +6
        },
      ];

      const graphDuo = buildRelationshipGraph({
        members: duoMembers,
        evaluations,
        leaderRatings: [{ evaluatorId: 'usr-member', speechSpace: 5, atmosphere: 5 }],
        leaderMemberEvaluations: { 'usr-member': { engagement: 5, openness: 5 } },
      });

      expect(graphDuo.nodes.length).toBe(2);
      expect(graphDuo.edges.length).toBe(1);
      expect(graphDuo.edges[0].weight).toBe(12); // +6 + +6 = 12
      expect(graphDuo.edges[0].style).toBe('thick');
      expect(graphDuo.edges[0].hasGlow).toBe(true);

      const leaderNode = graphDuo.nodes.find((n) => n.id === 'usr-leader')!;
      expect(leaderNode.tooltipText).toContain('Przestrzeń: 5.0/5, Atmosfera: 5.0/5');

      const memberNode = graphDuo.nodes.find((n) => n.id === 'usr-member')!;
      expect(memberNode.tooltipText).toContain('Zaangażowanie 5/5 | Otwartość 5/5');
    });

    it('empirically verifies team-wide mutual friction triggers tension edges and mediation advice', () => {
      const frictionMembers = [
        { id: 'u1', name: 'Gracz 1', role: 'leader' as const },
        { id: 'u2', name: 'Gracz 2', role: 'member' as const },
        { id: 'u3', name: 'Gracz 3', role: 'member' as const },
      ];

      // u2 and u3 mutual chaos nominations
      const frictionEvals: PeerEvaluationAnswer[] = [
        {
          evaluatorId: 'u2',
          bestCollabUserId: 'u1',
          activeListenerUserId: 'u1',
          goalOrganizerUserId: 'u1',
          chaosUserId: 'u3',
        },
        {
          evaluatorId: 'u3',
          bestCollabUserId: 'u1',
          activeListenerUserId: 'u1',
          goalOrganizerUserId: 'u1',
          chaosUserId: 'u2',
        },
      ];

      const graphFriction = buildRelationshipGraph({
        members: frictionMembers,
        evaluations: frictionEvals,
      });

      const tensionEdge = graphFriction.edges.find((e) => e.style === 'dashed');
      expect(tensionEdge).toBeDefined();
      expect(tensionEdge?.weight).toBe(-2);
      expect(tensionEdge?.color).toBe('#EF4444');
      expect(graphFriction.diagnosticSummary.frictionText).toContain('Zidentyfikowano punkt tarcia');
      expect(graphFriction.diagnosticSummary.frictionText).toContain('Gracz 2');
      expect(graphFriction.diagnosticSummary.frictionText).toContain('Gracz 3');
    });
  });
});
