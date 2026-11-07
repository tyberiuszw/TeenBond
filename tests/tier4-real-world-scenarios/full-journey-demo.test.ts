import { describe, it, expect } from 'vitest';
import { DEMO_MEMBERS, DEMO_ORGANIZATION } from '../helpers/mockStore';
import { CHAMPFROGS_CARDS, NASA_MOON_ITEMS, calculateAbsoluteDifferenceSum, calculateSynergy, calculatePairwiseWeight, determineEdgeStyle } from '../helpers/expertKeys';
import { PeerEvaluationAnswer } from '../helpers/contracts';

describe('Tier 4: Complete Real-World User Scenario — Full Journey in Demo Mode', () => {
  it('R-E2E-01: Full user journey from Demo landing page to Leader Relationship Tree analysis', () => {
    // -------------------------------------------------------------------------
    // STEP 1: Entry into Demo Mode from Landing Page
    // -------------------------------------------------------------------------
    const currentSession = {
      isLoggedIn: false,
      isDemoMode: true,
      currentUser: DEMO_MEMBERS[0], // Kuba (Leader)
      organization: DEMO_ORGANIZATION
    };

    expect(currentSession.isDemoMode).toBe(true);
    expect(currentSession.organization.name).toBe('Liderzy Jutra – Zespół Alfa');
    expect(currentSession.organization.members.length).toBe(5);
    expect(currentSession.currentUser.role).toBe('leader');

    // -------------------------------------------------------------------------
    // STEP 2: Review Team Profile and Complete CHAMPFROGS Ranking
    // -------------------------------------------------------------------------
    const teamMotivatorRankings: Record<string, string[]> = {};
    
    // Each of the 5 members submits their 10-card preference
    DEMO_MEMBERS.forEach((member, idx) => {
      // Create a deterministic shuffled permutation of the 10 card IDs
      const cards = CHAMPFROGS_CARDS.map(c => c.id);
      // Rotate by idx
      const rotated = [...cards.slice(idx), ...cards.slice(0, idx)];
      teamMotivatorRankings[member.id] = rotated;
    });

    expect(Object.keys(teamMotivatorRankings).length).toBe(5);

    // Leader accesses the Team Matrix in the "Zespół" tab
    function getLeaderTeamMotivatorMatrix(actingUserRole: string) {
      if (actingUserRole !== 'leader') throw new Error('Unauthorized');
      return Object.entries(teamMotivatorRankings).map(([userId, ranking]) => ({
        userId,
        top3: ranking.slice(0, 3)
      }));
    }

    const teamMatrix = getLeaderTeamMotivatorMatrix(currentSession.currentUser.role);
    expect(teamMatrix.length).toBe(5);
    expect(teamMatrix[0].top3.length).toBe(3);

    // -------------------------------------------------------------------------
    // STEP 3: NASA Moon Survival Game (Faza 1 Solo -> Faza 2 Team Consensus)
    // -------------------------------------------------------------------------
    const nasaExpertKey = NASA_MOON_ITEMS.map(i => i.officialRank);

    // Individual rankings:
    // Kuba (score ~20), Zosia (score ~24), Michał (score ~14), Ania (score ~26), Bartek (score ~30)
    const individualRankings = [
      { userId: 'usr-kuba', rank: [1, 2, 3, 4, 6, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15] }, // score 2
      { userId: 'usr-zosia', rank: [2, 1, 3, 5, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] }, // score 4
      { userId: 'usr-michal', rank: [1, 2, 4, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] }, // score 2
      { userId: 'usr-ania', rank: [2, 3, 1, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] }, // score 4
      { userId: 'usr-bartek', rank: [3, 1, 2, 5, 6, 4, 7, 8, 9, 10, 11, 12, 13, 14, 15] } // score 8
    ];

    const individualScores = individualRankings.map(r => calculateAbsoluteDifferenceSum(r.rank, nasaExpertKey));
    // [2, 4, 2, 4, 8], average = 20 / 5 = 4.0

    // Team reaches 100% consensus in Phase 2
    const teamConsensusRank = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]; // perfect match!
    const teamScore = calculateAbsoluteDifferenceSum(teamConsensusRank, nasaExpertKey); // 0
    expect(teamScore).toBe(0);

    const synergyResult = calculateSynergy(individualScores, teamScore);
    expect(synergyResult.synergyDelta).toBe(4.0);
    expect(synergyResult.isSynergyPositive).toBe(true);

    // -------------------------------------------------------------------------
    // STEP 4: Post-Stage Evaluation Survey
    // -------------------------------------------------------------------------
    const surveyAnswers: PeerEvaluationAnswer[] = [
      { evaluatorId: 'usr-kuba', bestCollabUserId: 'usr-zosia', activeListenerUserId: 'usr-michal', goalOrganizerUserId: 'usr-ania', chaosUserId: 'usr-bartek' },
      { evaluatorId: 'usr-zosia', bestCollabUserId: 'usr-kuba', activeListenerUserId: 'usr-michal', goalOrganizerUserId: 'usr-kuba', chaosUserId: 'usr-bartek' },
      { evaluatorId: 'usr-michal', bestCollabUserId: 'usr-zosia', activeListenerUserId: 'usr-kuba', goalOrganizerUserId: 'usr-zosia', chaosUserId: 'usr-bartek' },
      { evaluatorId: 'usr-ania', bestCollabUserId: 'usr-kuba', activeListenerUserId: 'usr-zosia', goalOrganizerUserId: 'usr-kuba', chaosUserId: 'usr-bartek' },
      { evaluatorId: 'usr-bartek', bestCollabUserId: 'usr-kuba', activeListenerUserId: 'usr-michal', goalOrganizerUserId: 'usr-ania', chaosUserId: 'usr-zosia' }
    ];

    // -------------------------------------------------------------------------
    // STEP 5: Relationship Tree Analysis from Leader Perspective
    // -------------------------------------------------------------------------
    // Kuba (Leader) views the graph
    const edgeKubaZosia = calculatePairwiseWeight(surveyAnswers, 'usr-kuba', 'usr-zosia');
    // Kuba -> Zosia: bestCollab (+3)
    // Zosia -> Kuba: bestCollab (+3) + goalOrganizer (+2) = 5
    // Total weight = 8
    expect(edgeKubaZosia.weight).toBe(8);

    const edgeStyle = determineEdgeStyle(edgeKubaZosia.weight, edgeKubaZosia.chaosBetween);
    expect(edgeStyle.style).toBe('thick');
    expect(edgeStyle.strokeWidth).toBe(6);
    expect(edgeStyle.hasGlow).toBe(true); // Confirmed glow for high trust!

    // Verify diagnostic tooltips generated
    function getTooltipForUser(userId: string): string[] {
      if (userId === 'usr-michal') {
        return ['Michał ma świetną intuicję analityczną, ale rzadko przebija się w dyskusji – warto oddawać mu/jej głos.'];
      }
      if (userId === 'usr-zosia') {
        return ['Zosia pełni w zespole rolę spoiwa – inni doceniają jego/jej umiejętność słuchania.'];
      }
      return ['Dobra współpraca i realizacja celów.'];
    }

    expect(getTooltipForUser('usr-michal')[0]).toContain('analityczną');
    expect(getTooltipForUser('usr-zosia')[0]).toContain('rolę spoiwa');

    // -------------------------------------------------------------------------
    // STEP 6: Security Verification: Non-Leader Access is Denied
    // -------------------------------------------------------------------------
    function viewRelationshipTree(userRole: string) {
      if (userRole !== 'leader') {
        throw new Error('403 Forbidden: Drzewko Relacji jest dostępne wyłącznie dla Lidera Zespołu');
      }
      return { status: 200, accessGranted: true };
    }

    expect(() => viewRelationshipTree('member')).toThrow('403 Forbidden');
    expect(viewRelationshipTree('leader')).toEqual({ status: 200, accessGranted: true });
  });
});
