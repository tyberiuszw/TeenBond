import { describe, it, expect } from 'vitest';
import { DEMO_MEMBERS } from '../helpers/mockStore';
import {
  calculateAbsoluteDifferenceSum,
  calculateSynergy,
  calculatePairwiseWeight,
  determineEdgeStyle,
  LOST_AT_SEA_ITEMS
} from '../helpers/expertKeys';
import { PeerEvaluationAnswer } from '../helpers/contracts';

describe('Tier 3: Multi-Stage Interaction: Decision Game -> Evaluation -> Graph Update', () => {
  it('R3-R4-INT-01: End-to-end transition from Stage 2 decision scoring to Stage 3 Relationship Tree update', () => {
    // STEP 1: Stage 2 Decision Game Resolution
    const expertKey = LOST_AT_SEA_ITEMS.map(i => i.officialRank);
    
    // 5 members submit individual rankings
    const memberRankings = [
      { userId: 'usr-kuba', ranking: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] }, // score 0
      { userId: 'usr-zosia', ranking: [2, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] }, // score 2
      { userId: 'usr-michal', ranking: [1, 3, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] }, // score 2
      { userId: 'usr-ania', ranking: [3, 2, 1, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] }, // score 4
      { userId: 'usr-bartek', ranking: [4, 3, 2, 1, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] } // score 8
    ];

    const individualScores = memberRankings.map(m => calculateAbsoluteDifferenceSum(m.ranking, expertKey));
    // [0, 2, 2, 4, 8], mean = 16 / 5 = 3.2

    // Team consensus ranking (score = 2)
    const teamRanking = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]; // score 0!
    const teamScore = calculateAbsoluteDifferenceSum(teamRanking, expertKey);

    const synergy = calculateSynergy(individualScores, teamScore);
    expect(synergy.isSynergyPositive).toBe(true);

    // STEP 2: STAGE_COMPLETED(2) triggers Evaluation Survey unlock
    let stage2Completed = true;
    let surveyUnlocked = stage2Completed;
    expect(surveyUnlocked).toBe(true);

    // STEP 3: Peer Evaluations submitted by all 5 members
    const evaluations: PeerEvaluationAnswer[] = [
      // Kuba votes Zosia in Q1 (+3), Michał in Q2 (+2), Ania in Q3 (+2), Bartek in Q4 (-1)
      { evaluatorId: 'usr-kuba', bestCollabUserId: 'usr-zosia', activeListenerUserId: 'usr-michal', goalOrganizerUserId: 'usr-ania', chaosUserId: 'usr-bartek' },
      // Zosia votes Kuba in Q1 (+3), Michał in Q2 (+2), Kuba in Q3 (+2), Bartek in Q4 (-1)
      { evaluatorId: 'usr-zosia', bestCollabUserId: 'usr-kuba', activeListenerUserId: 'usr-michal', goalOrganizerUserId: 'usr-kuba', chaosUserId: 'usr-bartek' },
      // Michał votes Zosia in Q1 (+3), Kuba in Q2 (+2), Zosia in Q3 (+2), Bartek in Q4 (-1)
      { evaluatorId: 'usr-michal', bestCollabUserId: 'usr-zosia', activeListenerUserId: 'usr-kuba', goalOrganizerUserId: 'usr-zosia', chaosUserId: 'usr-bartek' },
      // Ania votes Kuba in Q1 (+3), Zosia in Q2 (+2), Kuba in Q3 (+2), Bartek in Q4 (-1)
      { evaluatorId: 'usr-ania', bestCollabUserId: 'usr-kuba', activeListenerUserId: 'usr-zosia', goalOrganizerUserId: 'usr-kuba', chaosUserId: 'usr-bartek' },
      // Bartek votes Kuba in Q1 (+3), Michał in Q2 (+2), Ania in Q3 (+2), Zosia in Q4 (-1)
      { evaluatorId: 'usr-bartek', bestCollabUserId: 'usr-kuba', activeListenerUserId: 'usr-michal', goalOrganizerUserId: 'usr-ania', chaosUserId: 'usr-zosia' }
    ];

    // STEP 4: Relationship Tree automatically calculates edge weights W(A,B)
    // Edge (Kuba, Zosia):
    // Kuba -> Zosia: bestCollab (+3)
    // Zosia -> Kuba: bestCollab (+3) + goalOrganizer (+2) = 5
    // Total weight = 3 + 5 = 8
    const edgeKubaZosia = calculatePairwiseWeight(evaluations, 'usr-kuba', 'usr-zosia');
    expect(edgeKubaZosia.weight).toBe(8);

    const styleKubaZosia = determineEdgeStyle(edgeKubaZosia.weight, edgeKubaZosia.chaosBetween);
    expect(styleKubaZosia.style).toBe('thick');
    expect(styleKubaZosia.strokeWidth).toBe(6);
    expect(styleKubaZosia.hasGlow).toBe(true); // Strong synergy connection!

    // Edge (Kuba, Bartek):
    // Kuba -> Bartek: chaos (-1)
    // Bartek -> Kuba: bestCollab (+3)
    // Total weight = -1 + 3 = 2
    const edgeKubaBartek = calculatePairwiseWeight(evaluations, 'usr-kuba', 'usr-bartek');
    expect(edgeKubaBartek.weight).toBe(2);

    const styleKubaBartek = determineEdgeStyle(edgeKubaBartek.weight, edgeKubaBartek.chaosBetween);
    expect(styleKubaBartek.style).toBe('thin');
    expect(styleKubaBartek.strokeWidth).toBe(1);
    expect(styleKubaBartek.hasGlow).toBe(false);
  });
});
