import { PeerEvaluationAnswer } from '@/types/evaluation';
import { EdgeVisualProps, PairwiseWeightResult } from '@/types/relationship';

/**
 * Calculates bidirectional edge weight W(A, B) between two users across all evaluation rounds.
 * Additive formula: W(A, B) = sum(p_{A -> B} + p_{B -> A})
 * Points:
 * - Q1 (Best Collaboration): +3 pkt
 * - Q2 (Active Listening): +2 pkt
 * - Q3 (Goal Organization): +2 pkt
 * - Q4 (Chaos / Interruption): -1 pkt (sets chaosBetween = true)
 *
 * Mathematical bounds across 3 stages: W in [-6, +42]
 */
export function calculatePairwiseWeight(
  evaluations: PeerEvaluationAnswer[],
  userA: string,
  userB: string
): PairwiseWeightResult {
  let weight = 0;
  let mentionsAtoB = 0;
  let mentionsBtoA = 0;
  let chaosBetween = false;

  const detailsAtoB = { collab: false, listening: false, goal: false, chaos: false };
  const detailsBtoA = { collab: false, listening: false, goal: false, chaos: false };

  for (const ev of evaluations) {
    // Directed nomination from userA to userB
    if (ev.evaluatorId === userA) {
      if (ev.bestCollabUserId === userB) {
        weight += 3;
        mentionsAtoB++;
        detailsAtoB.collab = true;
      }
      if (ev.activeListenerUserId === userB) {
        weight += 2;
        mentionsAtoB++;
        detailsAtoB.listening = true;
      }
      if (ev.goalOrganizerUserId === userB) {
        weight += 2;
        mentionsAtoB++;
        detailsAtoB.goal = true;
      }
      if (ev.chaosUserId === userB) {
        weight -= 1;
        mentionsAtoB++;
        detailsAtoB.chaos = true;
        chaosBetween = true;
      }
    }

    // Directed nomination from userB to userA
    if (ev.evaluatorId === userB) {
      if (ev.bestCollabUserId === userA) {
        weight += 3;
        mentionsBtoA++;
        detailsBtoA.collab = true;
      }
      if (ev.activeListenerUserId === userA) {
        weight += 2;
        mentionsBtoA++;
        detailsBtoA.listening = true;
      }
      if (ev.goalOrganizerUserId === userA) {
        weight += 2;
        mentionsBtoA++;
        detailsBtoA.goal = true;
      }
      if (ev.chaosUserId === userA) {
        weight -= 1;
        mentionsBtoA++;
        detailsBtoA.chaos = true;
        chaosBetween = true;
      }
    }
  }

  return {
    weight,
    mentionsAtoB,
    mentionsBtoA,
    chaosBetween,
    detailsAtoB,
    detailsBtoA,
  };
}

/**
 * Maps relationship weight W(A, B) to one of the 4 visual edge classes:
 * - Class 1: W <= 0 -> dashed 1px (visible only if there is tension/chaos mention)
 * - Class 2: 1 <= W <= 3 -> solid thin 1px (developing/preliminary bond)
 * - Class 3: 4 <= W <= 7 -> solid medium 3px (good, harmonious collaboration)
 * - Class 4: W >= 8 -> solid thick 6px with emerald neon glow (high trust & synergy)
 */
export function determineEdgeStyle(weight: number, hasChaosMention: boolean = false): EdgeVisualProps {
  if (weight <= 0) {
    return {
      style: 'dashed',
      strokeWidth: 1,
      hasGlow: false,
      visible: hasChaosMention, // only visible when there's genuine friction, hidden on zero interaction
      color: hasChaosMention ? '#EF4444' : '#94A3B8',
      cssClass: 'stroke-dashed-tension',
    };
  }

  if (weight >= 1 && weight <= 3) {
    return {
      style: 'thin',
      strokeWidth: 1,
      hasGlow: false,
      visible: true,
      color: '#94A3B8',
      cssClass: 'stroke-solid-thin',
    };
  }

  if (weight >= 4 && weight <= 7) {
    return {
      style: 'medium',
      strokeWidth: 3,
      hasGlow: false,
      visible: true,
      color: '#3B82F6',
      cssClass: 'stroke-solid-medium',
    };
  }

  // weight >= 8
  return {
    style: 'thick',
    strokeWidth: 6,
    hasGlow: true,
    visible: true,
    color: '#10B981',
    cssClass: 'stroke-solid-thick-glow',
  };
}

/**
 * Enforces anti-self-selection rule:
 * Participants cannot vote for themselves in any of the 4 questions.
 */
export function validatePeerEvaluation(answer: PeerEvaluationAnswer): { valid: boolean; error?: string } {
  if (answer.evaluatorId === answer.bestCollabUserId) {
    return { valid: false, error: 'Nie możesz wskazać samego siebie w pytaniu o współpracę.' };
  }
  if (answer.evaluatorId === answer.activeListenerUserId) {
    return { valid: false, error: 'Nie możesz wskazać samego siebie w pytaniu o aktywne słuchanie.' };
  }
  if (answer.evaluatorId === answer.goalOrganizerUserId) {
    return { valid: false, error: 'Nie możesz wskazać samego siebie w pytaniu o organizację celu.' };
  }
  if (answer.evaluatorId === answer.chaosUserId) {
    return { valid: false, error: 'Nie możesz wskazać samego siebie w pytaniu o chaos.' };
  }
  return { valid: true };
}
