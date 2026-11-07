import { describe, it, expect } from 'vitest';
import {
  LOST_AT_SEA_ITEMS,
  NASA_MOON_ITEMS,
  calculateAbsoluteDifferenceSum,
  calculateSynergy,
  detectSilentExpert
} from '../helpers/expertKeys';

describe('Tier 1: Decision Games Scoring Engine (Etap 2)', () => {
  const coastGuardRanks = LOST_AT_SEA_ITEMS.map(i => i.officialRank);
  const nasaRanks = NASA_MOON_ITEMS.map(i => i.officialRank);

  it('R3-DEC-01: Perfect score equals 0 when matching official expert keys exactly', () => {
    const seaScore = calculateAbsoluteDifferenceSum(coastGuardRanks, coastGuardRanks);
    expect(seaScore).toBe(0);

    const moonScore = calculateAbsoluteDifferenceSum(nasaRanks, nasaRanks);
    expect(moonScore).toBe(0);
  });

  it('R3-DEC-02: Lost at Sea scoring accurately computes difference sum for typical rankings', () => {
    // Slight deviations: swap 1st and 2nd, swap 3rd and 4th
    const userRanking = [2, 1, 4, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    const score = calculateAbsoluteDifferenceSum(userRanking, coastGuardRanks);
    // |2-1| + |1-2| + |4-3| + |3-4| = 1 + 1 + 1 + 1 = 4
    expect(score).toBe(4);
  });

  it('R3-DEC-03: NASA Moon Survival categorizes score into official evaluation bands', () => {
    function categorizeNasaScore(score: number): string {
      if (score <= 25) return 'Excellent';
      if (score <= 32) return 'Good';
      if (score <= 45) return 'Average';
      if (score <= 55) return 'Fair';
      if (score <= 70) return 'Poor';
      return 'Very Poor';
    }

    expect(categorizeNasaScore(18)).toBe('Excellent');
    expect(categorizeNasaScore(25)).toBe('Excellent');
    expect(categorizeNasaScore(26)).toBe('Good');
    expect(categorizeNasaScore(32)).toBe('Good');
    expect(categorizeNasaScore(35)).toBe('Average');
    expect(categorizeNasaScore(50)).toBe('Fair');
    expect(categorizeNasaScore(65)).toBe('Poor');
    expect(categorizeNasaScore(85)).toBe('Very Poor');
  });

  it('R3-DEC-04: Synergy formula calculates delta and rewards teamwork when TeamScore < Mean(Indiv)', () => {
    const individualScores = [40, 45, 50, 35, 40]; // mean = 42
    const teamScore = 28; // team performed much better than individual average

    const synergy = calculateSynergy(individualScores, teamScore);
    expect(synergy.synergyDelta).toBe(14); // 42 - 28 = 14
    expect(synergy.isSynergyPositive).toBe(true);
  });

  it('R3-DEC-05: Synergy identifies compromise trap when team consensus is worse than average', () => {
    const individualScores = [30, 32, 34, 28, 36]; // mean = 32
    const teamScore = 40; // team decision degraded

    const synergy = calculateSynergy(individualScores, teamScore);
    expect(synergy.synergyDelta).toBe(-8); // 32 - 40 = -8
    expect(synergy.isSynergyPositive).toBe(false);
  });

  it('R3-DEC-06: Silent Expert algorithm triggers when an individual beats the team by >= 5 points', () => {
    const individualSubmissions = [
      { userId: 'usr-kuba', score: 38 },
      { userId: 'usr-zosia', score: 42 },
      { userId: 'usr-michal', score: 18 }, // outstanding individual intuition
      { userId: 'usr-ania', score: 40 },
      { userId: 'usr-bartek', score: 45 }
    ];
    const teamScore = 27; // team compromised, difference with Michal = 27 - 18 = 9 >= 5

    const result = detectSilentExpert(individualSubmissions, teamScore);
    expect(result.isSilentExpert).toBe(true);
    expect(result.silentExpertUserId).toBe('usr-michal');
    expect(result.difference).toBe(9);
  });

  it('R3-DEC-07: Silent Expert is NOT triggered when difference is under 5 points', () => {
    const individualSubmissions = [
      { userId: 'usr-kuba', score: 30 },
      { userId: 'usr-zosia', score: 26 }, // best individual = 26
      { userId: 'usr-michal', score: 32 }
    ];
    const teamScore = 29; // difference = 29 - 26 = 3 (< 5)

    const result = detectSilentExpert(individualSubmissions, teamScore);
    expect(result.isSilentExpert).toBe(false);
    expect(result.silentExpertUserId).toBeUndefined();
    expect(result.difference).toBe(3);
  });
});
