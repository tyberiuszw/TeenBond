// Zin Obelisk Data Types
export type ZinClueCategory =
  | 'dimensions'
  | 'time_units'
  | 'workforce'
  | 'calendar'
  | 'questions'
  | 'currency'
  | 'distractor';

export interface ZinClueCard {
  id: number;
  textPl: string;
  textEn: string;
  category: ZinClueCategory;
  isVital: boolean;
  isDistractor: boolean;
  note?: string;
}

export type ZinGameStatus =
  | 'briefing'
  | 'solving'
  | 'verifying'
  | 'solved'
  | 'failed'
  | 'timeout';

export interface ZinGameState {
  roomId: string;
  status: ZinGameStatus;
  startedAt: string | null;
  durationSeconds: number; // 1500 (25 min)
  timeLeftSeconds: number;
  assignedClues: Record<string, number[]>; // userId -> card IDs
  readiedUserIds: string[]; // users who clicked "Gotowy"
  submittedAnswer: string | null;
  isCorrect: boolean | null;
  attemptsCount: number;
  isBoardReadOnly: boolean;
  solutionRevealed: boolean;
}

export interface ZinCalculationProof {
  volumeCuFt: number;
  totalBlocks: number;
  workSchlibsPerDay: number;
  restPonksPerDay: number;
  restSchlibsPerDay: number;
  netSchlibsPerDay: number;
  gangSize: number;
  religiousMembers: number;
  activeWorkers: number;
  blockRatePerSchlib: number;
  dailyBlocksPerWorker: number;
  dailyTeamBlocks: number;
  workdaysRequiredExact: number;
  workdaysNeeded: number;
  completionCalendarDay: string;
  calendarWeekDays: string[];
}

// Kalambury Data Types
export type KalamburyTier = 'easy' | 'medium' | 'hard';
export type KalamburyPhase =
  | 'waiting'
  | 'selecting_word'
  | 'drawing'
  | 'round_end'
  | 'match_end';

export interface KalamburyWord {
  id: string;
  word: string;
  tier: KalamburyTier;
  category: 'symbols' | 'activities' | 'concepts';
  points: number;
  hint: string;
}

export interface KalamburyGuessRecord {
  userId: string;
  userName: string;
  userColor: string;
  guessedAtSecondsLeft: number;
  pointsAwarded: number;
}

export interface KalamburyRoundState {
  roundNumber: number;
  totalRounds: number;
  drawerId: string;
  drawerName?: string;
  secretWord: KalamburyWord;
  wordChoices?: KalamburyWord[];
  maskedWord: string;
  timeLeftSeconds: number;
  phase: KalamburyPhase;
  solvers: KalamburyGuessRecord[];
  drawerPointsAwarded: number;
}

export interface KalamburyChatMessage {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  text: string;
  isSystem: boolean;
  isCorrectGuess: boolean;
  isAlmostNotification?: boolean;
  timestamp: string;
}

export interface KalamburyMatchState {
  matchId: string;
  roomId: string;
  currentDrawerIndex: number;
  playerIds: string[];
  playerScores: Record<string, number>;
  currentRound: KalamburyRoundState | null;
  messages: KalamburyChatMessage[];
  usedWordIds: string[];
}

export interface FuzzyMatchResult {
  isExact: boolean;
  isFuzzyMatch: boolean;
  isAlmost: boolean;
  similarityRatio: number;
  levenshteinDistance: number;
}

// Murder Mystery Data Types
export type MurderScenarioId = 'movie' | 'techstream';

export interface SuspectCharacter {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  bio: string;
  motives: string;
  secretAction?: string;
  favoriteScene?: string;
  traits: string[];
  isMurderer: boolean;
  alibi?: string;
  woreColor?: string;
  hasSecretAccess?: boolean;
}

export type EvidenceCategory = 'physical' | 'testimony' | 'document' | 'spatial';

export interface EvidenceCard {
  id: string;
  title: string;
  category: EvidenceCategory;
  description: string;
  source: string;
  assignedToPlayerIndex?: number; // 0..3 for 4 player partitions
  revealed: boolean;
  pinCoordinates?: { x: number; y: number };
}

export interface CorkboardThread {
  id: string;
  fromPinId: string;
  toPinId: string;
  label?: string;
  color?: string; // default '#DC2626'
}

export interface MurderVerdictSubmission {
  userId: string;
  suspectId: string;
  weapon: string;
  motiveRationale?: string;
  timestamp: string;
}

export interface MurderMysteryGameState {
  scenarioId: MurderScenarioId;
  characters: SuspectCharacter[];
  evidences: EvidenceCard[];
  threads: CorkboardThread[];
  playerRoleAssignments: Record<string, string>; // userId -> characterId
  playerEvidenceAssignments: Record<string, string[]>; // userId -> evidenceId[]
  verdictVotes: Record<string, MurderVerdictSubmission>; // userId -> vote
  isResolved: boolean;
  consensusReached: boolean;
  officialSolution: {
    murdererId: string;
    weapon: string;
    storyExplanation: string;
  };
}

// Dracula Communication Game Data Types
export type DraculaTeam = 'red_bats' | 'black_cats';
export type DraculaRole = 'negotiator' | 'strategist';

export interface DraculaFactItem {
  id: string;
  factNumber: number;
  text: string;
  isShared: boolean;
  teamExclusivity?: DraculaTeam; // undefined = shared; 'red_bats' = fact sheet 1; 'black_cats' = fact sheet 2
  category: 'logistics' | 'vampire_lore' | 'geography' | 'time_constraint';
  criticalNote?: string;
}

export interface DraculaNegotiationMessage {
  id: string;
  senderId: string;
  senderTeam: DraculaTeam;
  senderName: string;
  content: string;
  sharedFactId?: string;
  timestamp: string;
}

export interface DraculaFinalSubmission {
  team: DraculaTeam;
  submittedBy: string; // negotiator userId
  day: 'Saturday' | 'Sunday' | string;
  time: string; // e.g. "09:00"
  rationale: string;
  isSynergyProposal: boolean;
  acceptedByPeerTeam?: boolean;
}

export interface DraculaGameState {
  teams: {
    red_bats: {
      memberUserIds: string[];
      negotiatorUserId: string | null;
      facts: DraculaFactItem[];
      boardRoomId: string;
    };
    black_cats: {
      memberUserIds: string[];
      negotiatorUserId: string | null;
      facts: DraculaFactItem[];
      boardRoomId: string;
    };
  };
  negotiationSession: {
    isOpen: boolean;
    activeNegotiators: string[];
    messages: DraculaNegotiationMessage[];
    factTrades: Array<{
      offeredByTeam: DraculaTeam;
      offeredFactId: string;
      requestedFactId: string;
      status: 'pending' | 'accepted' | 'rejected';
    }>;
  };
  finalOutcome?: {
    winningMode: 'synergy_win_win' | 'competitive_zero_sum' | 'incorrect';
    awardedPoints: number; // 200 vs 100 vs 0
    badgeUnlocked?: 'Mistrzowie Synergii';
    submission: DraculaFinalSubmission;
    evaluationTriggered: boolean;
  };
}
