export interface PeerEvaluationAnswer {
  evaluatorId: string;
  bestCollabUserId: string;   // Q1: +3 pkt
  activeListenerUserId: string; // Q2: +2 pkt
  goalOrganizerUserId: string;  // Q3: +2 pkt
  chaosUserId: string;          // Q4: -1 pkt
}

export interface PeerEvaluationSubmission extends PeerEvaluationAnswer {
  stageNumber: number;
  createdAt?: string;
}

export interface LeaderRatingSubmission {
  evaluatorId: string;
  stageNumber: number;
  leaderId: string;
  speechSpace: number; // 1-5
  atmosphere: number;  // 1-5
  createdAt?: string;
}

export interface MemberLeaderRatingSubmission {
  leaderId: string;
  stageNumber: number;
  memberId: string;
  engagement: number; // 1-5
  openness: number;   // 1-5
  createdAt?: string;
}

export interface FullEvaluationSubmission {
  stageNumber: number;
  evaluatorId: string;
  peerEvaluation: PeerEvaluationAnswer;
  leaderRating?: {
    speechSpace: number; // 1-5
    atmosphere: number;  // 1-5
  };
  memberRatings?: Record<string, { engagement: number; openness: number }>;
}

export interface SurveyProgressState {
  stageNumber: number;
  totalMembers: number;
  completedMembers: string[];
  isFullyCompleted: boolean;
}

export const EVALUATION_WEIGHTS = {
  Q1_COLLAB: 3,
  Q2_LISTENING: 2,
  Q3_GOAL: 2,
  Q4_CHAOS: -1,
} as const;

export const SURVEY_QUESTIONS = [
  {
    id: 'q1',
    key: 'bestCollabUserId' as const,
    points: 3,
    badgeText: '+3 pkt',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    title: 'Współpraca i Zaufanie',
    question: 'Z kim współpracowało Ci się w tej grze najlepiej i najskuteczniej?',
    description: 'Wskaż osobę, z którą czułeś/aś największą synergię i bezpośrednie partnerstwo.',
  },
  {
    id: 'q2',
    key: 'activeListenerUserId' as const,
    points: 2,
    badgeText: '+2 pkt',
    badgeColor: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
    title: 'Aktywne Słuchanie i Empatia',
    question: 'Kto najuważniej słuchał innych, zadawał trafne pytania i pomagał dojść do głosu?',
    description: 'Wskaż osobę, która dbała o włączanie wszystkich do dyskusji i tworzyła dobrą atmosferę.',
  },
  {
    id: 'q3',
    key: 'goalOrganizerUserId' as const,
    points: 2,
    badgeText: '+2 pkt',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    title: 'Organizacja Celu i Struktura',
    question: 'Kto najlepiej porządkował nasze pomysły, dbał o strukturę i pilnował celu?',
    description: 'Wskaż osobę, która trzymała dyscyplinę zadania i pilnowała harmonogramu.',
  },
  {
    id: 'q4',
    key: 'chaosUserId' as const,
    points: -1,
    badgeText: '-1 pkt',
    badgeColor: 'text-red-400 bg-red-500/10 border-red-500/30',
    title: 'Chaos i Zakłócenia',
    question: 'Czyje zachowanie wprowadzało najwięcej chaosu, dekoncentracji lub przerywania wypowiedzi?',
    description: 'Wskaż osobę, której styl komunikacji utrudniał skupienie pod presją czasu.',
  },
] as const;
