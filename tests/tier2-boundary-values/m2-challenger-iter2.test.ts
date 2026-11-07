import { describe, it, expect } from 'vitest';
import { getScenario } from '../../src/lib/decisions/scenarios';
import { calculateAbsoluteDifferenceSum } from '../../src/lib/decisions/scoring';
import {
  calculateSynergy,
  detectSilentExpert,
  calculateItemControversy,
  calculateItemVariances,
} from '../../src/lib/decisions/synergy';
import {
  DEMO_MEMBER_RANK_VECTORS,
  DEMO_TEAM_RANK_VECTOR,
  getMockSoloSubmissions,
  getMockMemberRanking,
  getDefaultTeamRanking,
} from '../../src/lib/decisions/mockSubmissions';
import { DEMO_MEMBERS_ALFA } from '../../src/lib/demo-mock-data';

describe('M2 Iteration 2 Challenger Verification & Stress Harness', () => {
  const scenarios: ('lost_at_sea' | 'moon')[] = ['lost_at_sea', 'moon'];

  // =========================================================================
  // TASK 1: State Propagation & allSoloSubmissions Completeness
  // =========================================================================
  describe('Task 1: allSoloSubmissions 5-Player Propagation', () => {
    scenarios.forEach((scenarioId) => {
      it(`verifies getMockSoloSubmissions returns all 5 distinct players for scenario ${scenarioId}`, () => {
        const subs = getMockSoloSubmissions(scenarioId);
        const keys = Object.keys(subs);
        expect(keys.length).toBe(5);
        expect(keys).toContain('demo-user-anna');
        expect(keys).toContain('demo-user-bartek');
        expect(keys).toContain('demo-user-celina');
        expect(keys).toContain('demo-user-dawid');
        expect(keys).toContain('demo-user-ewa');

        // Every submission must be a valid permutation of exactly 15 items
        const scenario = getScenario(scenarioId);
        const expectedIds = new Set(scenario.items.map((i) => i.id));
        keys.forEach((key) => {
          expect(subs[key].length).toBe(15);
          expect(new Set(subs[key]).size).toBe(15);
          subs[key].forEach((id) => expect(expectedIds.has(id)).toBe(true));
        });
      });

      it(`simulates handleCompleteSolo logic under empty, partial, and full submissions (${scenarioId})`, () => {
        const scenario = getScenario(scenarioId);
        const activeUserId = 'demo-user-anna';
        const userRanking = scenario.items.map((i) => i.id);

        // Simulation 1: User manually submits with empty previous state and no passed submissions
        let state1: Record<string, string[]> = {};
        const mockSubs1 = getMockSoloSubmissions(scenarioId, activeUserId, userRanking);
        DEMO_MEMBERS_ALFA.forEach((m) => {
          if (!state1[m.id] || state1[m.id].length !== 15) {
            state1[m.id] = mockSubs1[m.id] || [...userRanking];
          }
        });
        expect(Object.keys(state1).length).toBe(5);
        expect(state1['demo-user-dawid'].length).toBe(15);

        // Simulation 2: User completes via simulateAll (passes mockSubs)
        let state2: Record<string, string[]> = {};
        const passedSubs = getMockSoloSubmissions(scenarioId, activeUserId, userRanking);
        const merged2: Record<string, string[]> = { ...state2, ...passedSubs, [activeUserId]: userRanking };
        DEMO_MEMBERS_ALFA.forEach((m) => {
          if (!merged2[m.id] || merged2[m.id].length !== 15) {
            merged2[m.id] = mockSubs1[m.id] || [...userRanking];
          }
        });
        expect(Object.keys(merged2).length).toBe(5);
        expect(merged2['demo-user-dawid'].length).toBe(15);

        // Simulation 3: Corrupted entry in state (length !== 15) is auto-repaired
        const corruptedState: Record<string, string[]> = {
          'demo-user-celina': ['broken-item'],
        };
        const repaired: Record<string, string[]> = { ...corruptedState, ...passedSubs, [activeUserId]: userRanking };
        DEMO_MEMBERS_ALFA.forEach((m) => {
          if (!repaired[m.id] || repaired[m.id].length !== 15) {
            repaired[m.id] = mockSubs1[m.id] || [...userRanking];
          }
        });
        expect(repaired['demo-user-celina'].length).toBe(15);
      });
    });
  });

  // =========================================================================
  // TASK 2: Non-Zero Variance (sigma^2_i) Generation & Controversy Hotspots
  // =========================================================================
  describe('Task 2: Non-Zero Item Variance Engine (sigma^2_i)', () => {
    scenarios.forEach((scenarioId) => {
      it(`calculates strictly positive variance for all 15 diverging items in ${scenarioId}`, () => {
        const scenario = getScenario(scenarioId);
        const subs = getMockSoloSubmissions(scenarioId);
        const teamRanking = getDefaultTeamRanking(scenarioId);

        const stats = calculateItemVariances(subs, teamRanking);
        expect(stats.length).toBe(15);

        // All 15 items should have non-zero variance because members rank them differently
        stats.forEach((s) => {
          expect(s.variance).toBeGreaterThan(0);
          expect(s.stdDev).toBeGreaterThan(0);
          expect(Math.abs(s.stdDev - Math.round(Math.sqrt(s.variance) * 100) / 100)).toBeLessThanOrEqual(0.01);
        });

        // Exactly 3 hotspots flagged
        const hotspots = stats.filter((s) => s.isHotspot);
        expect(hotspots.length).toBe(3);

        // Hotspots have highest variances
        const nonHotspots = stats.filter((s) => !s.isHotspot);
        const minHotspotVar = Math.min(...hotspots.map((h) => h.variance));
        const maxNonHotspotVar = Math.max(...nonHotspots.map((h) => h.variance));
        expect(minHotspotVar).toBeGreaterThanOrEqual(maxNonHotspotVar);
      });
    });

    it('stress tests mathematical variance properties: agreement vs maximum controversy', () => {
      const itemIds = ['i1', 'i2', 'i3', 'i4', 'i5'];

      // Case A: 100% agreement among all 5 members -> variance MUST be exactly 0
      const identicalSubs: Record<string, string[]> = {
        m1: ['i1', 'i2', 'i3', 'i4', 'i5'],
        m2: ['i1', 'i2', 'i3', 'i4', 'i5'],
        m3: ['i1', 'i2', 'i3', 'i4', 'i5'],
        m4: ['i1', 'i2', 'i3', 'i4', 'i5'],
        m5: ['i1', 'i2', 'i3', 'i4', 'i5'],
      };
      const zeroStats = calculateItemControversy(identicalSubs, itemIds);
      zeroStats.forEach((s) => {
        expect(s.variance).toBe(0);
        expect(s.stdDev).toBe(0);
        expect(s.averageRank).toBe(itemIds.indexOf(s.itemId) + 1);
      });

      // Case B: Maximum polarization (item ranked #1 by 2 members, #5 by 2 members, #3 by 1)
      const polarizedSubs: Record<string, string[]> = {
        m1: ['i1', 'i2', 'i3', 'i4', 'i5'],
        m2: ['i1', 'i2', 'i3', 'i4', 'i5'],
        m3: ['i2', 'i3', 'i1', 'i4', 'i5'],
        m4: ['i5', 'i4', 'i3', 'i2', 'i1'],
        m5: ['i5', 'i4', 'i3', 'i2', 'i1'],
      };
      const polStats = calculateItemControversy(polarizedSubs, itemIds);
      const i1Stat = polStats.find((s) => s.itemId === 'i1')!;
      // i1 ranks: m1=1, m2=1, m3=3, m4=5, m5=5. Mean = 15/5 = 3.
      // Diffs: (1-3)^2 + (1-3)^2 + (3-3)^2 + (5-3)^2 + (5-3)^2 = 4 + 4 + 0 + 4 + 4 = 16.
      // Variance = 16 / 5 = 3.2.
      expect(i1Stat.averageRank).toBe(3);
      expect(i1Stat.variance).toBe(3.2);
    });
  });

  // =========================================================================
  // TASK 3: Dawid as Silent Expert (Score 22, Difference 10, isSilentExpert: true)
  // =========================================================================
  describe('Task 3: Dawid as Silent Expert & Summary Screen Logic', () => {
    scenarios.forEach((scenarioId) => {
      const scenario = getScenario(scenarioId);
      const officialRanks = scenario.items.map((i) => i.officialRank);

      const getRankVector = (idList: string[]): number[] => {
        return scenario.items.map((officialItem) => {
          const idx = idList.indexOf(officialItem.id);
          return idx >= 0 ? idx + 1 : 15;
        });
      };

      it(`verifies exact scores in ${scenarioId}: Dawid=22, Team=32, Diff=10, isSilentExpert=true`, () => {
        const subs = getMockSoloSubmissions(scenarioId);
        const teamRanking = getDefaultTeamRanking(scenarioId);

        const memberScores = DEMO_MEMBERS_ALFA.map((m) => {
          const rawIds = subs[m.id];
          const rankVec = getRankVector(rawIds);
          return {
            userId: m.id,
            userName: m.name,
            score: calculateAbsoluteDifferenceSum(rankVec, officialRanks),
          };
        });

        // Check each individual member score
        const dawid = memberScores.find((m) => m.userId === 'demo-user-dawid')!;
        const anna = memberScores.find((m) => m.userId === 'demo-user-anna')!;
        const bartek = memberScores.find((m) => m.userId === 'demo-user-bartek')!;
        const celina = memberScores.find((m) => m.userId === 'demo-user-celina')!;
        const ewa = memberScores.find((m) => m.userId === 'demo-user-ewa')!;

        expect(dawid.score).toBe(22);
        expect(anna.score).toBe(42);
        expect(bartek.score).toBe(48);
        expect(celina.score).toBe(44);
        expect(ewa.score).toBe(38);

        // Check team score
        const teamScore = calculateAbsoluteDifferenceSum(getRankVector(teamRanking), officialRanks);
        expect(teamScore).toBe(32);

        // Detect silent expert
        const silentExpert = detectSilentExpert(memberScores, teamScore);
        expect(silentExpert.isSilentExpert).toBe(true);
        expect(silentExpert.silentExpertUserId).toBe('demo-user-dawid');
        expect(silentExpert.silentExpertName).toBe('Dawid');
        expect(silentExpert.expertSoloScore).toBe(22);
        expect(silentExpert.difference).toBe(10); // 32 - 22 = 10 >= 5
      });

      it(`verifies fallback mechanism in DecisionSummaryScreen when allSoloSubmissions is empty (${scenarioId})`, () => {
        // Even if allSoloSubmissions is {} (e.g. direct link or fresh state),
        // DecisionSummaryScreen falls back to getMockMemberRanking for every member
        const emptySubs: Record<string, string[]> = {};

        const memberScores = DEMO_MEMBERS_ALFA.map((member) => {
          let rawIds = emptySubs[member.id];
          if (!rawIds || rawIds.length !== 15) {
            rawIds = getMockMemberRanking(scenarioId, member.id);
          }
          const rankVec = getRankVector(rawIds);
          const score = calculateAbsoluteDifferenceSum(rankVec, officialRanks);
          return {
            userId: member.id,
            userName: member.name,
            score,
          };
        });

        const dawid = memberScores.find((m) => m.userId === 'demo-user-dawid')!;
        expect(dawid.score).toBe(22);

        const defaultTeam = getDefaultTeamRanking(scenarioId);
        const teamScore = calculateAbsoluteDifferenceSum(getRankVector(defaultTeam), officialRanks);
        expect(teamScore).toBe(32);

        const se = detectSilentExpert(memberScores, teamScore);
        expect(se.isSilentExpert).toBe(true);
        expect(se.silentExpertUserId).toBe('demo-user-dawid');
        expect(se.expertSoloScore).toBe(22);
        expect(se.difference).toBe(10);
      });
    });

    describe('Silent Expert Boundary Threshold Testing (difference >= 5)', () => {
      it('asserts silent expert flags at difference = 5 and rejects at difference = 4', () => {
        // Case 1: diff = 4 (Team 32, Best 28) -> isSilentExpert must be false
        const subDiff4 = [
          { userId: 'u1', userName: 'Player 1', score: 28 },
          { userId: 'u2', userName: 'Player 2', score: 35 },
        ];
        const resDiff4 = detectSilentExpert(subDiff4, 32);
        expect(resDiff4.difference).toBe(4);
        expect(resDiff4.isSilentExpert).toBe(false);
        expect(resDiff4.silentExpertUserId).toBeUndefined();

        // Case 2: diff = 5 (Team 32, Best 27) -> isSilentExpert must be true
        const subDiff5 = [
          { userId: 'u1', userName: 'Player 1', score: 27 },
          { userId: 'u2', userName: 'Player 2', score: 35 },
        ];
        const resDiff5 = detectSilentExpert(subDiff5, 32);
        expect(resDiff5.difference).toBe(5);
        expect(resDiff5.isSilentExpert).toBe(true);
        expect(resDiff5.silentExpertUserId).toBe('u1');
        expect(resDiff5.expertSoloScore).toBe(27);

        // Case 3: diff = 10 (Canonical TeenBond Dawid: Team 32, Dawid 22)
        const subDawid = [
          { userId: 'demo-user-dawid', userName: 'Dawid', score: 22 },
          { userId: 'demo-user-anna', userName: 'Anna', score: 42 },
        ];
        const resDawid = detectSilentExpert(subDawid, 32);
        expect(resDawid.difference).toBe(10);
        expect(resDawid.isSilentExpert).toBe(true);
        expect(resDawid.silentExpertUserId).toBe('demo-user-dawid');
        expect(resDawid.silentExpertName).toBe('Dawid');
        expect(resDawid.expertSoloScore).toBe(22);
      });
    });
  });
});
