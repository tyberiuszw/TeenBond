import { describe, it, expect } from 'vitest';
import { useDemoStore } from '../../src/lib/demo-store';
import { calculatePairwiseWeight, determineEdgeStyle, validatePeerEvaluation } from '../../src/lib/relations/relationshipWeights';
import { calculateConstellationLayout, calculateMidpoint } from '../../src/lib/relations/graphLayout';
import { buildRelationshipGraph } from '../../src/lib/relations/buildGraph';
import { FullEvaluationSubmission, PeerEvaluationAnswer } from '../../src/types/evaluation';
import { getDataClient } from '../../src/lib/data-client';

describe('Milestone 3 Empirical Challenger Verification', () => {
  // =========================================================================
  // 1. Survey Submission Behavior & Dynamic Demo Store Updates
  // =========================================================================
  describe('1. Survey Submission Behavior & Dynamic demo-store Updates', () => {
    it('updates surveySubmissions and surveyProgress when a user submits', () => {
      const store = useDemoStore.getState();
      store.resetToInitial();

      // Submit an evaluation for Bartek
      const bartekSubmission: FullEvaluationSubmission = {
        stageNumber: 2,
        evaluatorId: 'demo-user-bartek',
        peerEvaluation: {
          evaluatorId: 'demo-user-bartek',
          bestCollabUserId: 'demo-user-celina',
          activeListenerUserId: 'demo-user-ewa',
          goalOrganizerUserId: 'demo-user-anna',
          chaosUserId: 'demo-user-dawid',
        },
        leaderRating: {
          speechSpace: 4,
          atmosphere: 5,
        },
      };

      store.submitEvaluationAnswer(bartekSubmission);

      const updatedState = useDemoStore.getState();
      expect(updatedState.surveySubmissions[2]['demo-user-bartek']).toBeDefined();
      expect(updatedState.surveySubmissions[2]['demo-user-bartek'].peerEvaluation.bestCollabUserId).toBe('demo-user-celina');
      expect(updatedState.surveyProgress[2]).toContain('demo-user-bartek');
    });

    it('dynamically recalculates edge weights and visual styles when survey answers change', () => {
      const store = useDemoStore.getState();
      store.resetToInitial();

      // Initially, get the baseline weight between Bartek and Celina
      const initialGraph = store.relationshipGraph;
      const initialEdge = initialGraph.edges.find(
        (e) => (e.source === 'demo-user-bartek' && e.target === 'demo-user-celina') ||
               (e.source === 'demo-user-celina' && e.target === 'demo-user-bartek')
      );

      // Now create strong synergy between Bartek and Celina (+7 from each = 14 total)
      const allSubmissions: FullEvaluationSubmission[] = [
        {
          stageNumber: 2,
          evaluatorId: 'demo-user-bartek',
          peerEvaluation: {
            evaluatorId: 'demo-user-bartek',
            bestCollabUserId: 'demo-user-celina', // +3
            activeListenerUserId: 'demo-user-celina', // +2
            goalOrganizerUserId: 'demo-user-celina', // +2
            chaosUserId: 'demo-user-dawid',
          },
        },
        {
          stageNumber: 2,
          evaluatorId: 'demo-user-celina',
          peerEvaluation: {
            evaluatorId: 'demo-user-celina',
            bestCollabUserId: 'demo-user-bartek', // +3
            activeListenerUserId: 'demo-user-bartek', // +2
            goalOrganizerUserId: 'demo-user-bartek', // +2
            chaosUserId: 'demo-user-dawid',
          },
        },
        {
          stageNumber: 2,
          evaluatorId: 'demo-user-anna',
          peerEvaluation: {
            evaluatorId: 'demo-user-anna',
            bestCollabUserId: 'demo-user-ewa',
            activeListenerUserId: 'demo-user-ewa',
            goalOrganizerUserId: 'demo-user-celina',
            chaosUserId: 'demo-user-dawid',
          },
        },
        {
          stageNumber: 2,
          evaluatorId: 'demo-user-dawid',
          peerEvaluation: {
            evaluatorId: 'demo-user-dawid',
            bestCollabUserId: 'demo-user-anna',
            activeListenerUserId: 'demo-user-anna',
            goalOrganizerUserId: 'demo-user-celina',
            chaosUserId: 'demo-user-bartek',
          },
        },
        {
          stageNumber: 2,
          evaluatorId: 'demo-user-ewa',
          peerEvaluation: {
            evaluatorId: 'demo-user-ewa',
            bestCollabUserId: 'demo-user-anna',
            activeListenerUserId: 'demo-user-celina',
            goalOrganizerUserId: 'demo-user-anna',
            chaosUserId: 'demo-user-dawid',
          },
        },
      ];

      allSubmissions.forEach((sub) => store.submitEvaluationAnswer(sub));

      // Re-read updated graph from store
      const updatedGraph = useDemoStore.getState().relationshipGraph;
      const bartekCelinaEdge = updatedGraph.edges.find(
        (e) => (e.source === 'demo-user-bartek' && e.target === 'demo-user-celina') ||
               (e.source === 'demo-user-celina' && e.target === 'demo-user-bartek')
      );

      expect(bartekCelinaEdge).toBeDefined();
      expect(bartekCelinaEdge!.weight).toBe(14);
      expect(bartekCelinaEdge!.style).toBe('thick');
      expect(bartekCelinaEdge!.strokeWidth).toBe(6);
      expect(bartekCelinaEdge!.hasGlow).toBe(true);
      expect(bartekCelinaEdge!.color).toBe('#10B981');
    });

    it('autoCompleteDemoSurveys fills in all 5 members and triggers recalculation', () => {
      const store = useDemoStore.getState();
      store.resetToInitial();

      // Clear submissions to prove autoComplete populates and recalculates
      useDemoStore.setState({ surveySubmissions: { 2: {} }, surveyProgress: { 2: [] } });

      store.autoCompleteDemoSurveys(2);

      const state = useDemoStore.getState();
      expect(Object.keys(state.surveySubmissions[2]).length).toBe(5);
      expect(state.surveyProgress[2].length).toBe(5);
      expect(state.relationshipGraph.nodes.length).toBe(5);
      expect(state.relationshipGraph.edges.length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // 2. Recalculation of Edge Weights, Visual Classes & Diagnostic Cards
  // =========================================================================
  describe('2. Recalculation: Edge Weights, Visual Classes & Diagnostic Cards', () => {
    it('verifies all 4 edge visual classes under strict thresholds', () => {
      // Class 1 (dashed): W <= 0 with tension/chaos
      const c1 = determineEdgeStyle(-2, true);
      expect(c1.style).toBe('dashed');
      expect(c1.strokeWidth).toBe(1);
      expect(c1.hasGlow).toBe(false);
      expect(c1.visible).toBe(true);
      expect(c1.color).toBe('#EF4444');

      // Class 1 (hidden): W <= 0 without tension/chaos
      const c1Hidden = determineEdgeStyle(0, false);
      expect(c1Hidden.visible).toBe(false);

      // Class 2 (thin): W in [1, 3]
      const c2 = determineEdgeStyle(2, false);
      expect(c2.style).toBe('thin');
      expect(c2.strokeWidth).toBe(1);
      expect(c2.hasGlow).toBe(false);
      expect(c2.visible).toBe(true);

      // Class 3 (medium): W in [4, 7]
      const c3 = determineEdgeStyle(5, false);
      expect(c3.style).toBe('medium');
      expect(c3.strokeWidth).toBe(3);
      expect(c3.hasGlow).toBe(false);
      expect(c3.visible).toBe(true);

      // Class 4 (thick glow): W >= 8
      const c4 = determineEdgeStyle(8, false);
      expect(c4.style).toBe('thick');
      expect(c4.strokeWidth).toBe(6);
      expect(c4.hasGlow).toBe(true);
      expect(c4.visible).toBe(true);
      expect(c4.color).toBe('#10B981');
    });

    it('verifies all 4 Leader Diagnostic Summary cards adapt to game metrics and peer votes', () => {
      const members = [
        { id: 'usr-anna', name: 'Anna', role: 'leader' as const },
        { id: 'usr-bartek', name: 'Bartek', role: 'member' as const },
        { id: 'usr-celina', name: 'Celina', role: 'member' as const },
        { id: 'usr-dawid', name: 'Dawid', role: 'member' as const },
        { id: 'usr-ewa', name: 'Ewa', role: 'member' as const },
      ];

      // Positive synergy case + Silent Expert Dawid + Ewa with 2 listening votes
      const graphPositive = buildRelationshipGraph({
        members,
        evaluations: [
          { evaluatorId: 'usr-anna', bestCollabUserId: 'usr-ewa', activeListenerUserId: 'usr-ewa', goalOrganizerUserId: 'usr-celina', chaosUserId: 'usr-bartek' },
          { evaluatorId: 'usr-bartek', bestCollabUserId: 'usr-anna', activeListenerUserId: 'usr-ewa', goalOrganizerUserId: 'usr-celina', chaosUserId: 'usr-dawid' },
          { evaluatorId: 'usr-ewa', bestCollabUserId: 'usr-anna', activeListenerUserId: 'usr-bartek', goalOrganizerUserId: 'usr-celina', chaosUserId: 'usr-bartek' },
        ],
        stage2Data: {
          teamScore: 32,
          synergyDelta: 6.8,
          silentExpertUserId: 'usr-dawid',
          individualScores: { 'usr-dawid': 22, 'usr-anna': 42 },
        },
      });

      // Card 1: Synergy (positive)
      expect(graphPositive.diagnosticSummary.synergyText).toContain('pozytywny Efekt Synergii (+6.8 pkt)');
      expect(graphPositive.diagnosticSummary.synergyText).toContain('32 pkt');

      // Card 2: Silent Expert
      expect(graphPositive.diagnosticSummary.expertText).toContain('Dawid');
      expect(graphPositive.diagnosticSummary.expertText).toContain('22 pkt');

      // Card 3: Trust Pillars (Ewa has 2 listening votes)
      expect(graphPositive.diagnosticSummary.cohesionText).toContain('Ewa');

      // Card 4: Mediation Advice (Tension between Bartek and Ewa/Anna due to chaos votes)
      expect(graphPositive.diagnosticSummary.frictionText).toContain('punkt tarcia');

      // Boundary test: With < 2 votes, Card 3 falls back to initial development text
      const graphLowVotes = buildRelationshipGraph({
        members,
        evaluations: [
          { evaluatorId: 'usr-anna', bestCollabUserId: 'usr-ewa', activeListenerUserId: 'usr-ewa', goalOrganizerUserId: 'usr-celina', chaosUserId: 'usr-bartek' },
        ],
      });
      expect(graphLowVotes.diagnosticSummary.cohesionText).toBe('Relacje w zespole są na wstępnym etapie budowania.');

      // Negative synergy case without silent expert
      const graphNegative = buildRelationshipGraph({
        members,
        evaluations: [
          { evaluatorId: 'usr-anna', bestCollabUserId: 'usr-celina', activeListenerUserId: 'usr-celina', goalOrganizerUserId: 'usr-celina', chaosUserId: 'usr-ewa' },
        ],
        stage2Data: {
          teamScore: 65,
          synergyDelta: -8.4,
          individualScores: { 'usr-anna': 50 },
        },
      });

      expect(graphNegative.diagnosticSummary.synergyText).toContain('ujemny efekt synergii (-8.4 pkt)');
      expect(graphNegative.diagnosticSummary.expertText).toContain('Nie wykryto wyraźnego Cichego Eksperta');
    });
  });

  // =========================================================================
  // 3. SVG Node Positioning on 700x500 Canvas
  // =========================================================================
  describe('3. SVG Node Positioning on 700x500 Canvas', () => {
    it('positions Leader strictly at top center (350, 110) on 700x500 canvas', () => {
      const members = [
        { id: 'usr-anna', name: 'Anna', role: 'leader' as const },
        { id: 'usr-bartek', name: 'Bartek', role: 'member' as const },
        { id: 'usr-celina', name: 'Celina', role: 'member' as const },
        { id: 'usr-dawid', name: 'Dawid', role: 'member' as const },
        { id: 'usr-ewa', name: 'Ewa', role: 'member' as const },
      ];

      const layout = calculateConstellationLayout(members, 700, 500);
      const leader = layout.find((p) => p.role === 'leader');

      expect(leader).toBeDefined();
      expect(leader!.x).toBe(350);
      expect(leader!.y).toBe(110);
    });

    it('positions the 4 regular Alfa members in a symmetrical arc below the leader', () => {
      const members = [
        { id: 'usr-anna', name: 'Anna', role: 'leader' as const },
        { id: 'usr-bartek', name: 'Bartek', role: 'member' as const },
        { id: 'usr-celina', name: 'Celina', role: 'member' as const },
        { id: 'usr-dawid', name: 'Dawid', role: 'member' as const },
        { id: 'usr-ewa', name: 'Ewa', role: 'member' as const },
      ];

      const layout = calculateConstellationLayout(members, 700, 500);
      const memberPositions = layout.filter((p) => p.role === 'member');

      expect(memberPositions.length).toBe(4);

      // Verify all member y coordinates are below leader (y > 110)
      memberPositions.forEach((pos) => {
        expect(pos.y).toBeGreaterThan(110);
        expect(pos.x).toBeGreaterThanOrEqual(100);
        expect(pos.x).toBeLessThanOrEqual(600);
        expect(pos.y).toBeLessThanOrEqual(450);
      });

      // Verify symmetry around x = 350
      const bartek = memberPositions.find((p) => p.id === 'usr-bartek')!;
      const celina = memberPositions.find((p) => p.id === 'usr-celina')!;
      const dawid = memberPositions.find((p) => p.id === 'usr-dawid')!;
      const ewa = memberPositions.find((p) => p.id === 'usr-ewa')!;

      // Bartek (180, 240) vs Celina (520, 240) -> 350 - 180 = 170, 520 - 350 = 170
      expect(350 - bartek.x).toBe(celina.x - 350);
      expect(bartek.y).toBe(celina.y);

      // Dawid (230, 400) vs Ewa (470, 400) -> 350 - 230 = 120, 470 - 350 = 120
      expect(350 - dawid.x).toBe(ewa.x - 350);
      expect(dawid.y).toBe(ewa.y);
    });

    it('verifies calculateMidpoint accurately bisects edge vectors for badge placement', () => {
      const p1 = { x: 350, y: 110 };
      const p2 = { x: 180, y: 240 };
      const mid = calculateMidpoint(p1, p2);

      expect(mid.x).toBe(265); // (350 + 180) / 2 = 265
      expect(mid.y).toBe(175); // (110 + 240) / 2 = 175
    });

    it('stress tests dynamic constellation layout for various team sizes N = 2 to 12', () => {
      for (let n = 2; n <= 12; n++) {
        const team = [
          { id: 'leader', name: 'Leader', role: 'leader' as const },
          ...Array.from({ length: n - 1 }, (_, i) => ({
            id: `mem-${i}`,
            name: `Member ${i}`,
            role: 'member' as const,
          })),
        ];

        const layout = calculateConstellationLayout(team, 700, 500);
        expect(layout.length).toBe(n);

        // Leader is always at top center
        expect(layout[0].x).toBe(350);
        expect(layout[0].y).toBe(110);

        // Check bounds and minimum separation
        for (let i = 0; i < layout.length; i++) {
          expect(layout[i].x).toBeGreaterThanOrEqual(0);
          expect(layout[i].x).toBeLessThanOrEqual(700);
          expect(layout[i].y).toBeGreaterThanOrEqual(50);
          expect(layout[i].y).toBeLessThanOrEqual(500);

          // Check distance to other nodes (no collisions)
          for (let j = i + 1; j < layout.length; j++) {
            const dx = layout[i].x - layout[j].x;
            const dy = layout[i].y - layout[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            expect(dist).toBeGreaterThan(25); // At least 25px separation
          }
        }
      }
    });
  });

  // =========================================================================
  // 4. NodeInspector: Outgoing vs Incoming Peer Ratings
  // =========================================================================
  describe('4. NodeInspector & Rating Directionality Analysis', () => {
    it('empirically checks node votes structure: incoming vs outgoing', () => {
      const members = [
        { id: 'usr-anna', name: 'Anna', role: 'leader' as const },
        { id: 'usr-bartek', name: 'Bartek', role: 'member' as const },
        { id: 'usr-celina', name: 'Celina', role: 'member' as const },
      ];

      // Bartek gives votes to Celina (Q1, Q2) and Anna (Q3, Q4)
      const evals: PeerEvaluationAnswer[] = [
        {
          evaluatorId: 'usr-bartek',
          bestCollabUserId: 'usr-celina',
          activeListenerUserId: 'usr-celina',
          goalOrganizerUserId: 'usr-anna',
          chaosUserId: 'usr-anna',
        },
      ];

      const graph = buildRelationshipGraph({ members, evaluations: evals });
      const bartekNode = graph.nodes.find((n) => n.id === 'usr-bartek')!;
      const celinaNode = graph.nodes.find((n) => n.id === 'usr-celina')!;
      const annaNode = graph.nodes.find((n) => n.id === 'usr-anna')!;

      // Incoming votes for Celina:
      expect(celinaNode.votes.cooperation).toBe(1);
      expect(celinaNode.votes.listening).toBe(1);
      expect(celinaNode.votes.goal).toBe(0);
      expect(celinaNode.votes.chaos).toBe(0);

      // Incoming votes for Anna:
      expect(annaNode.votes.cooperation).toBe(0);
      expect(annaNode.votes.goal).toBe(1);
      expect(annaNode.votes.chaos).toBe(1);

      // Incoming votes for Bartek:
      // Bartek received NO votes from anyone!
      expect(bartekNode.votes.cooperation).toBe(0);
      expect(bartekNode.votes.listening).toBe(0);
      expect(bartekNode.votes.goal).toBe(0);
      expect(bartekNode.votes.chaos).toBe(0);

      // Verify: RelationshipNode interface tracks incoming votes (votes received).
      // Outgoing votes (who this user nominated) are aggregated into edges W(A,B)
      // rather than stored directly on RelationshipNode.votes.
      expect(bartekNode.votes).toHaveProperty('cooperation');
      expect(bartekNode.votes).toHaveProperty('listening');
      expect(bartekNode.votes).toHaveProperty('goal');
      expect(bartekNode.votes).toHaveProperty('chaos');
    });
  });

  // =========================================================================
  // 5. Security & Access Control Hermetization
  // =========================================================================
  describe('5. Security & Access Control Hermetization', () => {
    it('strictly prevents non-leaders from retrieving relationship graph data via data-client', async () => {
      const store = useDemoStore.getState();
      const client = getDataClient();

      // Test with all regular members
      const regularMemberIds = ['demo-user-bartek', 'demo-user-celina', 'demo-user-dawid', 'demo-user-ewa'];
      for (const memberId of regularMemberIds) {
        store.switchActiveUser(memberId);
        await expect(client.getRelationshipGraph()).rejects.toThrow('403 Forbidden');
      }

      // Leader can access successfully
      store.switchActiveUser('demo-user-anna');
      const leaderResult = await client.getRelationshipGraph();
      expect(leaderResult).toBeDefined();
      expect(leaderResult.nodes.length).toBe(5);
    });
  });
});
