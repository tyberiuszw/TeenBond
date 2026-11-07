export type SurvivalTierName = 'excellent' | 'good' | 'average' | 'fair' | 'poor' | 'very_poor';

export interface SurvivalTierInfo {
  tier: SurvivalTierName;
  minScore: number;
  maxScore: number;
  labelPl: string;
  labelEn: string;
  descriptionPl: string;
  descriptionEn: string;
  badgeColorClass: string;
  bgGlowClass: string;
}

export const SURVIVAL_TIERS: readonly SurvivalTierInfo[] = [
  {
    tier: 'excellent',
    minScore: 0,
    maxScore: 25,
    labelPl: 'Doskonały',
    labelEn: 'Excellent',
    descriptionPl: 'Wybitne zrozumienie hierarchii przetrwania. Pełen sukces misji ratunkowej!',
    descriptionEn: 'You demonstrated great survival skills. Rescued in record time!',
    badgeColorClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    bgGlowClass: 'from-emerald-500/20 to-teal-500/20',
  },
  {
    tier: 'good',
    minScore: 26,
    maxScore: 32,
    labelPl: 'Dobry',
    labelEn: 'Good',
    descriptionPl: 'Wynik powyżej przeciętnej. Trafne priorytety i sprawna ewakuacja.',
    descriptionEn: 'Above average results. Good survival skills. Rescued!',
    badgeColorClass: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    bgGlowClass: 'from-teal-500/20 to-cyan-500/20',
  },
  {
    tier: 'average',
    minScore: 33,
    maxScore: 45,
    labelPl: 'Przeciętny',
    labelEn: 'Average',
    descriptionPl: 'Trudne warunki, zmęczenie i odwodnienie, ale załoga doczekała się ratunku.',
    descriptionEn: 'Seasick, hungry and tired. Rescued!',
    badgeColorClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    bgGlowClass: 'from-blue-500/20 to-indigo-500/20',
  },
  {
    tier: 'fair',
    minScore: 46,
    maxScore: 55,
    labelPl: 'Dostateczny',
    labelEn: 'Fair',
    descriptionPl: 'Stan krytyczny. Niewłaściwe decyzje niemal doprowadziły do tragedii.',
    descriptionEn: 'Dehydrated and barely alive. It was tough, but rescued!',
    badgeColorClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    bgGlowClass: 'from-amber-500/20 to-orange-500/20',
  },
  {
    tier: 'poor',
    minScore: 56,
    maxScore: 70,
    labelPl: 'Słaby',
    labelEn: 'Poor',
    descriptionPl: 'Załamanie marszu lub dryfu. Ratunek przyszedł w ostatniej chwili.',
    descriptionEn: 'Rescued, but only just in time! Suggests Earth-bound logic.',
    badgeColorClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    bgGlowClass: 'from-orange-500/20 to-rose-500/20',
  },
  {
    tier: 'very_poor',
    minScore: 71,
    maxScore: 112,
    labelPl: 'Katastrofalny',
    labelEn: 'Very Poor',
    descriptionPl: 'Tragiczny finał symulacji. Brak zrozumienia warunków środowiskowych.',
    descriptionEn: 'Disaster! Empty raft washed ashore weeks later.',
    badgeColorClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    bgGlowClass: 'from-rose-500/20 to-red-500/20',
  },
];

/**
 * Calculates sum of absolute differences between user/team rankings and official expert key.
 * Theoretical range: 0 <= score <= 112 (for 15 items).
 * Throws an error on length mismatch.
 */
export function calculateAbsoluteDifferenceSum(
  userRanking: readonly number[],
  expertRanking: readonly number[]
): number {
  if (userRanking.length !== expertRanking.length) {
    throw new Error(
      `Length mismatch: user=${userRanking.length}, expert=${expertRanking.length}`
    );
  }
  return userRanking.reduce((sum, rank, idx) => {
    return sum + Math.abs(rank - expertRanking[idx]);
  }, 0);
}

/**
 * Categorizes a numeric score into official evaluation tier name ('Excellent', 'Good', etc.)
 */
export function categorizeScore(score: number): string {
  if (score <= 25) return 'Excellent';
  if (score <= 32) return 'Good';
  if (score <= 45) return 'Average';
  if (score <= 55) return 'Fair';
  if (score <= 70) return 'Poor';
  return 'Very Poor';
}

/**
 * Returns full survival tier information for a given score.
 */
export function getSurvivalTier(score: number): SurvivalTierInfo {
  const clamped = Math.max(0, Math.min(112, score));
  return (
    SURVIVAL_TIERS.find((t) => clamped >= t.minScore && clamped <= t.maxScore) ||
    SURVIVAL_TIERS[SURVIVAL_TIERS.length - 1]
  );
}
