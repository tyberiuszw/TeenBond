import { UserSession } from '@/types/auth';
import {
  MurderScenarioId,
  SuspectCharacter,
  EvidenceCard,
} from '@/types/game';
import { ZIN_CLUES } from '@/lib/zin/cluesData';
import { distributeZinCluesToMembers } from '@/lib/zin/partitioner';
import {
  MOVIE_CHARACTERS,
  MOVIE_EVIDENCES,
  TECHSTREAM_CHARACTERS,
  TECHSTREAM_EVIDENCES,
} from './murderMysteryData';
import { DRACULA_FACTS, partitionDraculaSubgroups } from './draculaData';

export interface ClueCard {
  id: string | number;
  title?: string;
  content: string;
  category?: string;
}

/**
 * Interface Contract (M1-M4):
 * Allocates scenario clues equitably across team members for Zin Obelisk,
 * Murder Mystery, or Dracula communication game.
 */
export function allocateClues(
  gameType: 'zin' | 'murder' | 'dracula',
  members: UserSession[]
): Map<string, ClueCard[]> {
  const result = new Map<string, ClueCard[]>();
  if (!members || members.length === 0) return result;

  const memberIds = members.map((m) => m.id);

  if (gameType === 'zin') {
    const dist = distributeZinCluesToMembers(memberIds, ZIN_CLUES);
    for (const member of members) {
      const cardIds = dist[member.id] || [];
      const cards: ClueCard[] = ZIN_CLUES.filter((c) => cardIds.includes(c.id)).map((c) => ({
        id: c.id,
        title: `Poszlaka #${c.id}`,
        content: c.textPl,
        category: c.category,
      }));
      result.set(member.id, cards);
    }
    return result;
  }

  if (gameType === 'murder') {
    members.forEach((m) => result.set(m.id, []));
    MOVIE_EVIDENCES.forEach((ev, idx) => {
      const targetMember = members[idx % members.length];
      const existing = result.get(targetMember.id) || [];
      existing.push({
        id: ev.id,
        title: ev.title,
        content: ev.description,
        category: ev.category,
      });
      result.set(targetMember.id, existing);
    });
    return result;
  }

  if (gameType === 'dracula') {
    const { redBats } = partitionDraculaSubgroups(memberIds);
    for (const member of members) {
      const subgroup = redBats.includes(member.id) ? 'red_bats' : 'black_cats';
      const facts = DRACULA_FACTS.filter(
        (f) => f.isShared || f.teamExclusivity === subgroup
      ).map((f) => ({
        id: f.id,
        title: `Fakt #${f.factNumber}`,
        content: f.text,
        category: f.teamExclusivity || 'shared',
      }));
      result.set(member.id, facts);
    }
    return result;
  }

  return result;
}

/**
 * Deterministically assigns a character role and a subset of evidence cards
 * to each team member for the selected Murder Mystery scenario.
 */
export function partitionMurderMysteryRoleAndClues(
  memberIds: string[],
  activeUserId: string,
  scenarioId: MurderScenarioId
): {
  assignedCharacter: SuspectCharacter;
  assignedEvidences: EvidenceCard[];
} {
  const characters = scenarioId === 'movie' ? MOVIE_CHARACTERS : TECHSTREAM_CHARACTERS;
  const evidences = scenarioId === 'movie' ? MOVIE_EVIDENCES : TECHSTREAM_EVIDENCES;

  const validMembers = memberIds.length > 0 ? memberIds : [activeUserId || 'default-user'];
  const userIndex = Math.max(0, validMembers.indexOf(activeUserId));

  const assignedCharacter = characters[userIndex % characters.length] || characters[0];
  const assignedEvidences = evidences.filter(
    (_, idx) => idx % validMembers.length === userIndex % validMembers.length
  );

  return {
    assignedCharacter,
    assignedEvidences: assignedEvidences.length > 0 ? assignedEvidences : evidences.slice(0, 4),
  };
}
