import { getScenario } from './scenarios';

/**
 * Deterministic rank vectors (1..15) for Alfa team members.
 * Calibrated to match canonical benchmark scores:
 * - Anna: score 42
 * - Bartek: score 48
 * - Celina: score 44
 * - Dawid: score 22 (Silent Expert: 32 - 22 = 10 >= 5)
 * - Ewa: score 38
 * - Team: score 32 (Synergy: 38.8 - 32 = +6.8 > 0)
 */
export const DEMO_MEMBER_RANK_VECTORS: Record<string, number[]> = {
  'demo-user-anna': [11, 2, 3, 4, 10, 6, 5, 8, 15, 1, 9, 12, 13, 14, 7],
  'demo-user-bartek': [4, 11, 9, 3, 8, 5, 1, 6, 10, 7, 13, 2, 12, 14, 15],
  'demo-user-celina': [15, 2, 4, 6, 5, 1, 7, 12, 9, 8, 11, 13, 3, 14, 10],
  'demo-user-dawid': [3, 2, 1, 4, 6, 5, 10, 9, 8, 13, 12, 11, 7, 14, 15],
  'demo-user-ewa': [1, 12, 3, 4, 14, 6, 7, 8, 9, 10, 11, 2, 13, 5, 15],
};

export const DEMO_TEAM_RANK_VECTOR: number[] = [
  6, 1, 3, 5, 2, 7, 9, 14, 4, 8, 12, 10, 13, 11, 15,
];

/**
 * Builds an array of item IDs from a 15-number rank vector (1..15)
 * where vector[i] represents the rank of the i-th official item.
 */
export function buildIdListFromRankVector(
  rankVector: readonly number[],
  itemIds: readonly string[]
): string[] {
  const result: string[] = new Array(itemIds.length);
  for (let i = 0; i < itemIds.length; i++) {
    const rank = rankVector[i]; // 1 to 15
    result[rank - 1] = itemIds[i];
  }
  return result;
}

/**
 * Returns the realistic mock solo ranking for a given member in a scenario.
 */
export function getMockMemberRanking(
  scenarioId: 'lost_at_sea' | 'moon',
  userId: string
): string[] {
  const scenario = getScenario(scenarioId);
  const itemIds = scenario.items.map((i) => i.id);
  const vector = DEMO_MEMBER_RANK_VECTORS[userId];

  if (!vector) {
    return [...itemIds];
  }

  return buildIdListFromRankVector(vector, itemIds);
}

/**
 * Returns the default team consensus ranking for a scenario (score = 32).
 */
export function getDefaultTeamRanking(scenarioId: 'lost_at_sea' | 'moon'): string[] {
  const scenario = getScenario(scenarioId);
  const itemIds = scenario.items.map((i) => i.id);
  return buildIdListFromRankVector(DEMO_TEAM_RANK_VECTOR, itemIds);
}

/**
 * Returns complete solo submissions for all 5 team members.
 * If activeUserId and activeUserRanking are provided, activeUser's ranking overrides their mock entry.
 */
export function getMockSoloSubmissions(
  scenarioId: 'lost_at_sea' | 'moon',
  activeUserId?: string,
  activeUserRanking?: string[]
): Record<string, string[]> {
  const scenario = getScenario(scenarioId);
  const itemIds = scenario.items.map((i) => i.id);
  const result: Record<string, string[]> = {};

  for (const [userId, vector] of Object.entries(DEMO_MEMBER_RANK_VECTORS)) {
    result[userId] = buildIdListFromRankVector(vector, itemIds);
  }

  if (activeUserId && activeUserRanking && activeUserRanking.length === itemIds.length) {
    result[activeUserId] = [...activeUserRanking];
  }

  return result;
}
