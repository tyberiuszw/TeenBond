import { PeerEvaluationAnswer } from '@/types/evaluation';

/**
 * Calibrated Stage 2 post-decision peer evaluations for Team Alfa
 * (Anna, Bartek, Celina, Dawid, Ewa).
 *
 * Incoming totals:
 * - Anna: Q1 = 3 (Bartek, Celina, Ewa), Q3 = 2 (Celina, Dawid)
 * - Bartek: Q1 = 1 (Anna), Q2 = 1 (Dawid), Q4 = 4 (Anna, Celina, Dawid, Ewa)
 * - Celina: Q1 = 1 (Dawid), Q3 = 3 (Anna, Bartek, Ewa), Q4 = 1 (Bartek)
 * - Dawid: 0 incoming votes (silent expert & peripheral member)
 * - Ewa: Q2 = 4 (Anna, Bartek, Celina, Ewa->wait anti-self: Anna, Bartek, Celina, Dawid)
 */
export const DEMO_ALFA_PEER_EVALUATIONS_STAGE2: PeerEvaluationAnswer[] = [
  // Anna (Leader) votes:
  // Q1 -> Bartek, Q2 -> Ewa, Q3 -> Celina, Q4 -> Bartek (Wait: Anna Q1 to Ewa or Bartek)
  // Let's ensure edge weights:
  // Anna <-> Ewa = +9 (Anna: Q1=Ewa +3, Q2=Ewa +2 -> +5; Ewa: Q1=Anna +3, Q2=Anna ? or Q3=Anna +2 -> +5? Let's check)
  // Anna <-> Celina = +7
  // Anna <-> Bartek = +5
  // Celina <-> Ewa = +4
  // Dawid <-> Celina = +3
  // Bartek <-> Celina = -2 (Bartek Q4->Celina -1, Celina Q4->Bartek -1 => -2)
  // Dawid <-> Bartek = -1 (Dawid Q4->Bartek -1 => -1)
  {
    evaluatorId: 'demo-user-anna',
    bestCollabUserId: 'demo-user-ewa',    // Q1 (+3) -> Ewa
    activeListenerUserId: 'demo-user-ewa',// Q2 (+2) -> Ewa
    goalOrganizerUserId: 'demo-user-celina', // Q3 (+2) -> Celina
    chaosUserId: 'demo-user-bartek',      // Q4 (-1) -> Bartek
  },
  {
    evaluatorId: 'demo-user-bartek',
    bestCollabUserId: 'demo-user-anna',   // Q1 (+3) -> Anna
    activeListenerUserId: 'demo-user-ewa',// Q2 (+2) -> Ewa
    goalOrganizerUserId: 'demo-user-celina', // Q3 (+2) -> Celina
    chaosUserId: 'demo-user-celina',      // Q4 (-1) -> Celina
  },
  {
    evaluatorId: 'demo-user-celina',
    bestCollabUserId: 'demo-user-anna',   // Q1 (+3) -> Anna
    activeListenerUserId: 'demo-user-ewa',// Q2 (+2) -> Ewa
    goalOrganizerUserId: 'demo-user-anna', // Q3 (+2) -> Anna
    chaosUserId: 'demo-user-bartek',      // Q4 (-1) -> Bartek
  },
  {
    evaluatorId: 'demo-user-dawid',
    bestCollabUserId: 'demo-user-celina', // Q1 (+3) -> Celina
    activeListenerUserId: 'demo-user-ewa',// Q2 (+2) -> Ewa
    goalOrganizerUserId: 'demo-user-anna', // Q3 (+2) -> Anna
    chaosUserId: 'demo-user-bartek',      // Q4 (-1) -> Bartek
  },
  {
    evaluatorId: 'demo-user-ewa',
    bestCollabUserId: 'demo-user-anna',   // Q1 (+3) -> Anna
    activeListenerUserId: 'demo-user-bartek', // Q2 (+2) -> Bartek
    goalOrganizerUserId: 'demo-user-celina', // Q3 (+2) -> Celina
    chaosUserId: 'demo-user-bartek',      // Q4 (-1) -> Bartek
  },
];

export const DEMO_ALFA_LEADER_RATINGS: {
  evaluatorId: string;
  speechSpace: number;
  atmosphere: number;
}[] = [
  { evaluatorId: 'demo-user-bartek', speechSpace: 3.5, atmosphere: 3.8 },
  { evaluatorId: 'demo-user-celina', speechSpace: 4.5, atmosphere: 4.5 },
  { evaluatorId: 'demo-user-dawid', speechSpace: 3.0, atmosphere: 4.0 },
  { evaluatorId: 'demo-user-ewa', speechSpace: 4.8, atmosphere: 4.9 },
];

export const DEMO_ALFA_MEMBER_RATINGS_BY_LEADER: Record<
  string,
  { engagement: number; openness: number }
> = {
  'demo-user-bartek': { engagement: 4, openness: 3 },
  'demo-user-celina': { engagement: 5, openness: 5 },
  'demo-user-dawid': { engagement: 3, openness: 4 },
  'demo-user-ewa': { engagement: 5, openness: 5 },
};
