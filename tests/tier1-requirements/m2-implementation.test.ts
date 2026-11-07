import { describe, it, expect } from 'vitest';
import {
  CHAMPFROGS_DEFINITIONS,
  resolveCardAssetUrl,
  findCardDef,
  validateMotivatorRanking,
} from '../../src/lib/motivators/cardData';
import {
  LOST_AT_SEA_SCENARIO,
  NASA_MOON_SCENARIO,
  getScenario,
} from '../../src/lib/decisions/scenarios';
import {
  getExpertRationale,
  LOST_AT_SEA_EXPERT_RATIONALES,
  NASA_MOON_EXPERT_RATIONALES,
} from '../../src/lib/decisions/expertKeys';
import {
  calculateAbsoluteDifferenceSum,
  categorizeScore,
  getSurvivalTier,
  SURVIVAL_TIERS,
} from '../../src/lib/decisions/scoring';
import {
  calculateSynergy,
  detectSilentExpert,
  calculateItemControversy,
} from '../../src/lib/decisions/synergy';
import { useDemoStore } from '../../src/lib/demo-store';

describe('Milestone 2 Implementation Tests: Motivators & Decision Games Engine', () => {
  describe('CHAMPFROGS Card Data & Loader', () => {
    it('contains all 10 official CHAMPFROGS cards with complete PL/EN metadata', () => {
      expect(CHAMPFROGS_DEFINITIONS.length).toBe(10);
      const codes = CHAMPFROGS_DEFINITIONS.map((c) => c.code).sort();
      expect(codes).toEqual(['A', 'C', 'F', 'G', 'H', 'M', 'O', 'P', 'R', 'S'].sort());

      CHAMPFROGS_DEFINITIONS.forEach((card) => {
        expect(card.id).toBeTruthy();
        expect(card.namePl).toBeTruthy();
        expect(card.nameEn).toBeTruthy();
        expect(card.frontFilename).toBeTruthy();
        expect(card.backFilename).toBeTruthy();
        expect(card.definitionPl).toBeTruthy();
        expect(card.definitionEn).toBeTruthy();
        expect(card.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    it('resolveCardAssetUrl handles spaces and Curiosity typo gracefully', () => {
      expect(resolveCardAssetUrl('Acceptance Front.jpg')).toBe(
        '/images/cards/Acceptance%20Front.jpg'
      );
      expect(resolveCardAssetUrl('Curiotisy Front.jpg')).toBe(
        '/images/cards/Curiotisy%20Front.jpg'
      );
      expect(resolveCardAssetUrl('Curiosity Front.jpg')).toBe(
        '/images/cards/Curiosity%20Front.jpg'
      );
    });

    it('findCardDef searches by id, single letter code, and uppercase code', () => {
      expect(findCardDef('curiosity')?.code).toBe('C');
      expect(findCardDef('C')?.id).toBe('curiosity');
      expect(findCardDef('CURIOSITY')?.id).toBe('curiosity');
      expect(findCardDef('unknown')).toBeUndefined();
    });

    it('validateMotivatorRanking enforces 10-item unique permutation of CHAMPFROGS', () => {
      const valid = CHAMPFROGS_DEFINITIONS.map((c) => c.id);
      expect(validateMotivatorRanking(valid).isValid).toBe(true);

      // Too few
      expect(validateMotivatorRanking(valid.slice(0, 9)).isValid).toBe(false);
      // Duplicates
      expect(validateMotivatorRanking([...valid.slice(0, 9), valid[0]]).isValid).toBe(false);
      // Unknown IDs
      expect(validateMotivatorRanking([...valid.slice(0, 9), 'fake_card']).isValid).toBe(false);
    });
  });

  describe('Decision Scenarios & Expert Keys', () => {
    it('both Lost at Sea and NASA Moon Survival have exactly 15 items with ranks 1..15', () => {
      [LOST_AT_SEA_SCENARIO, NASA_MOON_SCENARIO].forEach((sc) => {
        expect(sc.items.length).toBe(15);
        const ranks = sc.items.map((i) => i.officialRank).sort((a, b) => a - b);
        expect(ranks).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
      });
    });

    it('getScenario retrieves corresponding scenario definition', () => {
      expect(getScenario('lost_at_sea').id).toBe('lost_at_sea');
      expect(getScenario('moon').id).toBe('moon');
    });

    it('getExpertRationale returns official rationale for all 15 items in both scenarios', () => {
      LOST_AT_SEA_SCENARIO.items.forEach((item) => {
        const rat = getExpertRationale('lost_at_sea', item.id);
        expect(rat).toBeDefined();
        expect(rat?.rationalePl.length).toBeGreaterThanOrEqual(5);
        expect(rat?.rationaleEn.length).toBeGreaterThanOrEqual(5);
      });

      NASA_MOON_SCENARIO.items.forEach((item) => {
        const rat = getExpertRationale('moon', item.id);
        expect(rat).toBeDefined();
        expect(rat?.rationalePl.length).toBeGreaterThanOrEqual(5);
        expect(rat?.rationaleEn.length).toBeGreaterThanOrEqual(5);
      });
    });
  });

  describe('Scoring & Survival Tiers', () => {
    const expertKey = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

    it('calculates sum of absolute differences and enforces parity invariant', () => {
      const perfect = [...expertKey];
      expect(calculateAbsoluteDifferenceSum(perfect, expertKey)).toBe(0);

      const reversed = [...expertKey].reverse();
      expect(calculateAbsoluteDifferenceSum(reversed, expertKey)).toBe(112);

      // Random permutation test: sum of absolute differences is ALWAYS even
      const perm = [2, 3, 1, 5, 4, 7, 6, 9, 8, 11, 10, 13, 12, 15, 14];
      const score = calculateAbsoluteDifferenceSum(perm, expertKey);
      expect(score % 2).toBe(0);
    });

    it('throws Length mismatch on mismatched ranking lengths', () => {
      expect(() => calculateAbsoluteDifferenceSum([1, 2, 3], expertKey)).toThrow('Length mismatch');
    });

    it('categorizes scores correctly across all 6 survival tier boundaries', () => {
      expect(categorizeScore(0)).toBe('Excellent');
      expect(categorizeScore(25)).toBe('Excellent');
      expect(categorizeScore(26)).toBe('Good');
      expect(categorizeScore(32)).toBe('Good');
      expect(categorizeScore(33)).toBe('Average');
      expect(categorizeScore(45)).toBe('Average');
      expect(categorizeScore(46)).toBe('Fair');
      expect(categorizeScore(55)).toBe('Fair');
      expect(categorizeScore(56)).toBe('Poor');
      expect(categorizeScore(70)).toBe('Poor');
      expect(categorizeScore(71)).toBe('Very Poor');
      expect(categorizeScore(112)).toBe('Very Poor');

      expect(getSurvivalTier(20).tier).toBe('excellent');
      expect(getSurvivalTier(30).tier).toBe('good');
      expect(getSurvivalTier(40).tier).toBe('average');
      expect(getSurvivalTier(50).tier).toBe('fair');
      expect(getSurvivalTier(60).tier).toBe('poor');
      expect(getSurvivalTier(80).tier).toBe('very_poor');
    });
  });

  describe('Synergy & Silent Expert Detection', () => {
    it('calculates positive, neutral, and negative synergy deltas', () => {
      // Positive synergy
      const pos = calculateSynergy([40, 42, 38, 44], 30);
      expect(pos.synergyDelta).toBe(11);
      expect(pos.isSynergyPositive).toBe(true);

      // Neutral synergy
      const neutral = calculateSynergy([35, 35, 35], 35);
      expect(neutral.synergyDelta).toBe(0);
      expect(neutral.isSynergyPositive).toBe(false);

      // Negative synergy (Compromise trap)
      const neg = calculateSynergy([30, 32, 28], 38);
      expect(neg.synergyDelta).toBe(-8);
      expect(neg.isSynergyPositive).toBe(false);

      // Empty input
      const empty = calculateSynergy([], 30);
      expect(empty.synergyDelta).toBe(0);
      expect(empty.isSynergyPositive).toBe(false);
    });

    it('identifies Silent Expert at threshold >= 5 points and ignores differences < 5', () => {
      const submissions = [
        { userId: 'u1', userName: 'Anna', score: 40 },
        { userId: 'u2', userName: 'Dawid', score: 22 }, // best = 22
        { userId: 'u3', userName: 'Bartek', score: 38 },
      ];

      // Difference = 32 - 22 = 10 >= 5 -> Silent Expert
      const hit = detectSilentExpert(submissions, 32);
      expect(hit.isSilentExpert).toBe(true);
      expect(hit.silentExpertUserId).toBe('u2');
      expect(hit.difference).toBe(10);

      // Difference = 26 - 22 = 4 < 5 -> NOT Silent Expert
      const miss = detectSilentExpert(submissions, 26);
      expect(miss.isSilentExpert).toBe(false);
      expect(miss.silentExpertUserId).toBeUndefined();
      expect(miss.difference).toBe(4);

      // Empty submissions
      const empty = detectSilentExpert([], 30);
      expect(empty.isSilentExpert).toBe(false);
    });

    it('calculateItemControversy computes variance and flags TOP 3 hotspots', () => {
      const itemIds = ['item1', 'item2', 'item3', 'item4', 'item5'];
      const submissions = {
        userA: ['item1', 'item2', 'item3', 'item4', 'item5'],
        userB: ['item5', 'item4', 'item3', 'item2', 'item1'], // high disagreement on item1 and item5
        userC: ['item1', 'item3', 'item2', 'item5', 'item4'],
      };

      const stats = calculateItemControversy(submissions, itemIds);
      expect(stats.length).toBe(5);

      const hotspots = stats.filter((s) => s.isHotspot);
      expect(hotspots.length).toBe(3);

      stats.forEach((s) => {
        expect(s.variance).toBeGreaterThanOrEqual(0);
        expect(s.stdDev).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Demo Store & Session Storage Persistence', () => {
    it('persists and updates motivator rankings for users', () => {
      const store = useDemoStore.getState();
      const testRanking = ['curiosity', 'honor', 'acceptance', 'mastery', 'power', 'freedom', 'relatedness', 'order', 'goal', 'status'];

      store.updateMotivatorRanking('demo-user-anna', testRanking);
      expect(useDemoStore.getState().motivators['demo-user-anna']).toEqual(testRanking);
    });
  });
});
