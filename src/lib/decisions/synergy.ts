export interface SynergyResult {
  synergyDelta: number;
  isSynergyPositive: boolean;
  averageIndividualScore: number;
  synergyPercentage: number;
}

export interface SilentExpertResult {
  isSilentExpert: boolean;
  silentExpertUserId?: string;
  silentExpertName?: string;
  difference: number;
  expertSoloScore?: number;
}

export interface ItemControversyStat {
  itemId: string;
  averageRank: number;
  variance: number;
  stdDev: number;
  ranksByMember: Record<string, number>;
  isHotspot: boolean;
}

/**
 * Calculates synergy delta: Delta = Mean(IndividualScores) - TeamScore
 * If Delta > 0, teamwork improved results (positive synergy).
 * If Delta == 0, neutral synergy (isSynergyPositive = false).
 * If Delta < 0, compromise trap.
 */
export function calculateSynergy(
  individualScores: readonly number[],
  teamScore: number
): SynergyResult {
  if (!individualScores || individualScores.length === 0) {
    return {
      synergyDelta: 0,
      isSynergyPositive: false,
      averageIndividualScore: 0,
      synergyPercentage: 0,
    };
  }

  const sum = individualScores.reduce((acc, s) => acc + s, 0);
  const avg = sum / individualScores.length;
  const synergyDelta = Math.round((avg - teamScore) * 100) / 100;
  const synergyPercentage = avg > 0 ? Math.round((synergyDelta / avg) * 1000) / 10 : 0;

  return {
    synergyDelta,
    isSynergyPositive: synergyDelta > 0,
    averageIndividualScore: Math.round(avg * 100) / 100,
    synergyPercentage,
  };
}

/**
 * Deterministically detects a Silent Expert:
 * A member is a Silent Expert if they achieved the lowest error in the team AND
 * TeamScore - BestIndividualScore >= 5
 */
export function detectSilentExpert(
  submissions: readonly { userId: string; userName?: string; score: number }[],
  teamScore: number
): SilentExpertResult {
  if (!submissions || submissions.length === 0) {
    return {
      isSilentExpert: false,
      difference: 0,
    };
  }

  const best = submissions.reduce((min, cur) => (cur.score < min.score ? cur : min));
  const difference = teamScore - best.score;
  const isSilentExpert = difference >= 5;

  return {
    isSilentExpert,
    silentExpertUserId: isSilentExpert ? best.userId : undefined,
    silentExpertName: isSilentExpert ? best.userName : undefined,
    difference,
    expertSoloScore: best.score,
  };
}

/**
 * Computes the variance of each item's ranking across team members:
 * sigma^2_i = (1 / N) * sum (R_u(i) - Mean_i)^2
 * Returns items sorted by variance descending and flags top 3 as hotspots.
 */
export function calculateItemControversy(
  submissions: Record<string, string[]>,
  itemIds: readonly string[]
): ItemControversyStat[] {
  const memberIds = Object.keys(submissions);
  const N = memberIds.length;
  if (N === 0) {
    return itemIds.map((id) => ({
      itemId: id,
      averageRank: 8,
      variance: 0,
      stdDev: 0,
      ranksByMember: {},
      isHotspot: false,
    }));
  }

  const stats: ItemControversyStat[] = itemIds.map((itemId) => {
    const ranksByMember: Record<string, number> = {};
    let rankSum = 0;

    memberIds.forEach((mId) => {
      const ranking = submissions[mId] || [];
      const idx = ranking.indexOf(itemId);
      const r = idx >= 0 ? idx + 1 : 8; // fallback to middle
      ranksByMember[mId] = r;
      rankSum += r;
    });

    const averageRank = rankSum / N;
    let varSum = 0;
    memberIds.forEach((mId) => {
      const diff = ranksByMember[mId] - averageRank;
      varSum += diff * diff;
    });

    const variance = Math.round((varSum / N) * 100) / 100;
    const stdDev = Math.round(Math.sqrt(variance) * 100) / 100;

    return {
      itemId,
      averageRank: Math.round(averageRank * 10) / 10,
      variance,
      stdDev,
      ranksByMember,
      isHotspot: false,
    };
  });

  // Sort by variance descending to find TOP 3 hotspots
  const sorted = [...stats].sort((a, b) => b.variance - a.variance);
  const hotspotIds = new Set(sorted.slice(0, 3).map((s) => s.itemId));

  return stats.map((s) => ({
    ...s,
    isHotspot: hotspotIds.has(s.itemId),
  }));
}

export const calculateItemVariances = calculateItemControversy;

