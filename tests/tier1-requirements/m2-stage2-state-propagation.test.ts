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
  getMockSoloSubmissions,
  getMockMemberRanking,
  getDefaultTeamRanking,
} from '../../src/lib/decisions/mockSubmissions';
import { DEMO_MEMBERS_ALFA } from '../../src/lib/demo-mock-data';

describe('Stage 2 Solo Submissions Propagation & Controversy Engine', () => {
  const scenarios: ('lost_at_sea' | 'moon')[] = ['lost_at_sea', 'moon'];

  scenarios.forEach((scenarioId) => {
    describe(`Scenario: ${scenarioId}`, () => {
      const scenario = getScenario(scenarioId);
      const officialRanks = scenario.items.map((i) => i.officialRank);

      const getRankVector = (idList: string[]): number[] => {
        return scenario.items.map((officialItem) => {
          const idx = idList.indexOf(officialItem.id);
          return idx >= 0 ? idx + 1 : 15;
        });
      };

      it('generates authentic 15-item permutations for all 5 team members', () => {
        const subs = getMockSoloSubmissions(scenarioId);
        const memberIds = DEMO_MEMBERS_ALFA.map((m) => m.id);

        expect(Object.keys(subs).sort()).toEqual(memberIds.sort());

        memberIds.forEach((mId) => {
          const ranking = subs[mId];
          expect(ranking).toBeDefined();
          expect(ranking.length).toBe(15);
          expect(new Set(ranking).size).toBe(15);
        });
      });

      it('produces canonical scores: Dawid = 22, Anna = 42, Bartek = 48, Celina = 44, Ewa = 38', () => {
        const subs = getMockSoloSubmissions(scenarioId);

        const scoreAnna = calculateAbsoluteDifferenceSum(getRankVector(subs['demo-user-anna']), officialRanks);
        const scoreBartek = calculateAbsoluteDifferenceSum(getRankVector(subs['demo-user-bartek']), officialRanks);
        const scoreCelina = calculateAbsoluteDifferenceSum(getRankVector(subs['demo-user-celina']), officialRanks);
        const scoreDawid = calculateAbsoluteDifferenceSum(getRankVector(subs['demo-user-dawid']), officialRanks);
        const scoreEwa = calculateAbsoluteDifferenceSum(getRankVector(subs['demo-user-ewa']), officialRanks);

        expect(scoreDawid).toBe(22);
        expect(scoreAnna).toBe(42);
        expect(scoreBartek).toBe(48);
        expect(scoreCelina).toBe(44);
        expect(scoreEwa).toBe(38);
      });

      it('default team ranking yields canonical team score of 32', () => {
        const teamRanking = getDefaultTeamRanking(scenarioId);
        expect(teamRanking.length).toBe(15);
        expect(new Set(teamRanking).size).toBe(15);

        const teamScore = calculateAbsoluteDifferenceSum(getRankVector(teamRanking), officialRanks);
        expect(teamScore).toBe(32);
      });

      it('triggers positive synergy and correctly detects Dawid as Silent Expert (diff = 10 >= 5)', () => {
        const subs = getMockSoloSubmissions(scenarioId);
        const teamScore = 32;

        const memberScoresList = DEMO_MEMBERS_ALFA.map((m) => ({
          userId: m.id,
          userName: m.name,
          score: calculateAbsoluteDifferenceSum(getRankVector(subs[m.id]), officialRanks),
        }));

        const individualScores = memberScoresList.map((m) => m.score);
        const synergy = calculateSynergy(individualScores, teamScore);

        expect(synergy.averageIndividualScore).toBe(38.8);
        expect(synergy.synergyDelta).toBe(6.8);
        expect(synergy.isSynergyPositive).toBe(true);

        const silentExpert = detectSilentExpert(memberScoresList, teamScore);
        expect(silentExpert.isSilentExpert).toBe(true);
        expect(silentExpert.silentExpertUserId).toBe('demo-user-dawid');
        expect(silentExpert.silentExpertName).toBe('Dawid');
        expect(silentExpert.expertSoloScore).toBe(22);
        expect(silentExpert.difference).toBe(10);
      });

      it('calculateItemVariances computes non-zero variance and identifies 3 hotspots with all 5 submissions', () => {
        const subs = getMockSoloSubmissions(scenarioId);
        const teamRanking = getDefaultTeamRanking(scenarioId);

        const stats = calculateItemVariances(subs, teamRanking);
        expect(stats.length).toBe(15);

        const hotspots = stats.filter((s) => s.isHotspot);
        expect(hotspots.length).toBe(3);

        // Verify genuine non-zero variance across items
        const positiveVarianceCount = stats.filter((s) => s.variance > 0).length;
        expect(positiveVarianceCount).toBe(15); // all 15 items have non-zero variance across members

        // Alias check
        expect(calculateItemVariances).toBe(calculateItemControversy);
      });

      it('honors active user ranking override in getMockSoloSubmissions', () => {
        const customRanking = [...scenario.items.map((i) => i.id)].reverse();
        const subs = getMockSoloSubmissions(scenarioId, 'demo-user-anna', customRanking);

        expect(subs['demo-user-anna']).toEqual(customRanking);
        // Dawid still has his canonical expert ranking
        const dawidScore = calculateAbsoluteDifferenceSum(getRankVector(subs['demo-user-dawid']), officialRanks);
        expect(dawidScore).toBe(22);
      });
    });
  });

  describe('Stage 2 State Propagation Contract', () => {
    it('simulates full UI propagation pipeline from solo to summary screen', () => {
      const scenario = getScenario('lost_at_sea');
      const officialRanks = scenario.items.map((i) => i.officialRank);

      // 1. Solo phase simulation produces user ranking and allSubmissions
      const activeUserId = 'demo-user-anna';
      const userSoloRanking = getMockMemberRanking('lost_at_sea', activeUserId);
      const allSubmissions = getMockSoloSubmissions('lost_at_sea', activeUserId, userSoloRanking);

      // 2. handleCompleteSolo merges submissions into state
      let allSoloSubmissions: Record<string, string[]> = {};
      const handleCompleteSolo = (ranking: string[], subs?: Record<string, string[]>) => {
        allSoloSubmissions = {
          ...allSoloSubmissions,
          ...subs,
          [activeUserId]: ranking,
        };
      };
      handleCompleteSolo(userSoloRanking, allSubmissions);

      // 3. Phase 2 (Team): calculates genuine item variances
      const teamRanking = getDefaultTeamRanking('lost_at_sea');
      const controversyStats = calculateItemVariances(allSoloSubmissions, teamRanking);
      expect(controversyStats.some((s) => s.variance > 20)).toBe(true);

      // 4. Phase 3 (Summary): calculates member scores from allSoloSubmissions
      const memberScores = DEMO_MEMBERS_ALFA.map((m) => {
        const rawIds = allSoloSubmissions[m.id];
        const rankVec = scenario.items.map((it) => rawIds.indexOf(it.id) + 1);
        return {
          userId: m.id,
          userName: m.name,
          score: calculateAbsoluteDifferenceSum(rankVec, officialRanks),
        };
      });

      const dawid = memberScores.find((m) => m.userId === 'demo-user-dawid');
      expect(dawid?.score).toBe(22);

      const teamRankVec = scenario.items.map((it) => teamRanking.indexOf(it.id) + 1);
      const teamScore = calculateAbsoluteDifferenceSum(teamRankVec, officialRanks);
      expect(teamScore).toBe(32);

      const silentExpert = detectSilentExpert(memberScores, teamScore);
      expect(silentExpert.isSilentExpert).toBe(true);
      expect(silentExpert.silentExpertUserId).toBe('demo-user-dawid');
      expect(silentExpert.difference).toBe(10);
    });
  });
});
