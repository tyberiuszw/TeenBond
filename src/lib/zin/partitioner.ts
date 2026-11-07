import { ZinClueCard } from '@/types/game';
import { ZIN_CLUES } from './cluesData';

/**
 * Equitable round-robin clue partitioner
 * Ensures equal distribution with at most difference of 1 card between members.
 * Supports teams of 2 to 12 members.
 */
export function allocateZinClues(
  totalClues: number = 33,
  memberCount: number
): number[] {
  if (memberCount < 2 || memberCount > 12) {
    throw new Error(`Unsupported team size: ${memberCount}. Must be between 2 and 12.`);
  }
  const base = Math.floor(totalClues / memberCount);
  const remainder = totalClues % memberCount;
  return Array.from({ length: memberCount }, (_, i) => base + (i < remainder ? 1 : 0));
}

/**
 * Distributes clues across member IDs deterministically or with optional shuffle
 */
export function distributeZinCluesToMembers(
  memberIds: string[],
  clues: ZinClueCard[] = ZIN_CLUES
): Record<string, number[]> {
  if (memberIds.length < 2 || memberIds.length > 12) {
    throw new Error('Unsupported team size: must be between 2 and 12');
  }

  const distribution: Record<string, number[]> = {};
  memberIds.forEach((id) => {
    distribution[id] = [];
  });

  clues.forEach((clue, idx) => {
    const recipientId = memberIds[idx % memberIds.length];
    distribution[recipientId].push(clue.id);
  });

  return distribution;
}

export { allocateClues } from '@/lib/games/clueAllocator';
