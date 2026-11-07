import { create } from 'zustand';
import {
  DEMO_ORGANIZATION_ALFA,
  DEMO_MEMBERS_ALFA,
  DEMO_MOTIVATORS_RANKINGS,
  DEMO_LOST_AT_SEA_DATA,
  DEMO_RELATIONSHIP_GRAPH_DATA,
  DEMO_TEENBOARD_ELEMENTS,
} from './demo-mock-data';
import { DemoPerson, DecisionDemoData, RelationshipGraphDemoData, TeenBoardElementDemo } from '@/types/demo';
import { OrganizationContext } from '@/types/organization';
import { Role } from '@/types/auth';
import { FullEvaluationSubmission, PeerEvaluationAnswer } from '@/types/evaluation';
import { buildRelationshipGraph } from './relations/buildGraph';
import {
  DEMO_ALFA_PEER_EVALUATIONS_STAGE2,
  DEMO_ALFA_LEADER_RATINGS,
  DEMO_ALFA_MEMBER_RATINGS_BY_LEADER,
} from './relations/mockEvaluations';

interface DemoStoreState {
  isDemoMode: boolean;
  activeUserId: string;
  organization: OrganizationContext;
  members: DemoPerson[];
  motivators: Record<string, string[]>;
  decisionData: DecisionDemoData;
  relationshipGraph: RelationshipGraphDemoData;
  teenboardElements: TeenBoardElementDemo[];

  // Milestone 3: Survey submissions and progress tracking
  surveySubmissions: Record<number, Record<string, FullEvaluationSubmission>>;
  surveyProgress: Record<number, string[]>; // stageNumber -> user IDs who completed

  // Milestone 4: Game states and resolutions
  zinSolved: boolean;
  murderSolved: Record<string, boolean>;
  draculaSolved: boolean;
  draculaPoints: number;

  // Actions
  enableDemoMode: (userId?: string) => void;
  disableDemoMode: () => void;
  switchActiveUser: (userId: string) => void;
  switchRole: (role: Role) => void;
  resetToInitial: () => void;
  updateMotivatorRanking: (userId: string, ranking: string[]) => void;
  addTeenBoardElement: (element: TeenBoardElementDemo) => void;
  setTeenBoardElements: (elements: TeenBoardElementDemo[]) => void;
  getActiveUser: () => DemoPerson;

  // Evaluation Actions
  submitEvaluationAnswer: (submission: FullEvaluationSubmission) => void;
  autoCompleteDemoSurveys: (stageNumber?: number) => void;
  recalculateRelationshipGraph: (stageNumber?: number) => void;

  // Game actions
  setZinSolved: (solved: boolean) => void;
  setMurderSolved: (scenarioId: string, solved: boolean) => void;
  setDraculaResolution: (solved: boolean, points: number) => void;
}

function getSavedUserId(): string {
  if (typeof window !== 'undefined') {
    try {
      const saved = sessionStorage.getItem('tb_demo_active_user');
      if (saved) return saved;
    } catch {}
  }
  return 'demo-user-anna';
}

function getSavedMotivators(): Record<string, string[]> {
  if (typeof window !== 'undefined') {
    try {
      const saved = sessionStorage.getItem('tb_demo_motivators');
      if (saved) return JSON.parse(saved);
    } catch {}
  }
  return DEMO_MOTIVATORS_RANKINGS;
}

function getSavedDemoMode(): boolean {
  if (typeof window !== 'undefined') {
    try {
      const saved = sessionStorage.getItem('tb_demo_mode');
      if (saved !== null) return saved === 'true';
    } catch {}
  }
  return false;
}

export const useDemoStore = create<DemoStoreState>((set, get) => ({
  isDemoMode: getSavedDemoMode(),
  activeUserId: getSavedUserId(),
  organization: DEMO_ORGANIZATION_ALFA,
  members: DEMO_MEMBERS_ALFA,
  motivators: getSavedMotivators(),
  decisionData: DEMO_LOST_AT_SEA_DATA,
  relationshipGraph: DEMO_RELATIONSHIP_GRAPH_DATA,
  teenboardElements: DEMO_TEENBOARD_ELEMENTS,

  surveySubmissions: {
    2: {},
  },
  surveyProgress: {
    2: ['demo-user-anna', 'demo-user-bartek', 'demo-user-celina', 'demo-user-dawid', 'demo-user-ewa'],
  },

  zinSolved: false,
  murderSolved: {},
  draculaSolved: false,
  draculaPoints: 0,

  enableDemoMode: (userId = 'demo-user-anna') => {
    if (typeof document !== 'undefined') {
      document.cookie = 'tb_demo_mode=true; path=/; max-age=86400; SameSite=Lax';
    }
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('tb_demo_mode', 'true');
        sessionStorage.setItem('tb_demo_active_user', userId);
      } catch {}
    }
    set({
      isDemoMode: true,
      activeUserId: userId,
    });
  },

  disableDemoMode: () => {
    if (typeof document !== 'undefined') {
      document.cookie = 'tb_demo_mode=; path=/; max-age=0; SameSite=Lax';
    }
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('tb_demo_mode');
        sessionStorage.removeItem('tb_demo_active_user');
        sessionStorage.removeItem('tb_demo_motivators');
      } catch {}
    }
    set({
      isDemoMode: false,
    });
  },

  switchActiveUser: (userId: string) => {
    const member = get().members.find((m) => m.id === userId);
    if (member) {
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('tb_demo_active_user', userId);
        } catch {}
      }
      set({ activeUserId: userId });
    }
  },

  switchRole: (role: Role) => {
    const currentActive = get().getActiveUser();
    if (currentActive.role === role) return;

    const target = get().members.find((m) => m.role === role);
    if (target) {
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('tb_demo_active_user', target.id);
        } catch {}
      }
      set({ activeUserId: target.id });
    }
  },

  resetToInitial: () => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('tb_demo_active_user');
        sessionStorage.removeItem('tb_demo_motivators');
      } catch {}
    }
    set({
      organization: { ...DEMO_ORGANIZATION_ALFA },
      members: [...DEMO_MEMBERS_ALFA],
      motivators: { ...DEMO_MOTIVATORS_RANKINGS },
      decisionData: { ...DEMO_LOST_AT_SEA_DATA },
      relationshipGraph: { ...DEMO_RELATIONSHIP_GRAPH_DATA },
      teenboardElements: [...DEMO_TEENBOARD_ELEMENTS],
      activeUserId: 'demo-user-anna',
      surveySubmissions: { 2: {} },
      surveyProgress: { 2: ['demo-user-anna', 'demo-user-bartek', 'demo-user-celina', 'demo-user-dawid', 'demo-user-ewa'] },
    });
  },

  updateMotivatorRanking: (userId: string, ranking: string[]) => {
    const updated = {
      ...get().motivators,
      [userId]: ranking,
    };
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('tb_demo_motivators', JSON.stringify(updated));
      } catch {}
    }
    set({
      motivators: updated,
    });
  },

  addTeenBoardElement: (element: TeenBoardElementDemo) => {
    set((state) => ({
      teenboardElements: [...state.teenboardElements, element],
    }));
  },

  setTeenBoardElements: (elements: TeenBoardElementDemo[]) => {
    set({ teenboardElements: elements });
  },

  setZinSolved: (solved: boolean) => set({ zinSolved: solved }),
  setMurderSolved: (scenarioId: string, solved: boolean) =>
    set((state) => ({ murderSolved: { ...state.murderSolved, [scenarioId]: solved } })),
  setDraculaResolution: (solved: boolean, points: number) =>
    set({ draculaSolved: solved, draculaPoints: points }),

  getActiveUser: () => {
    const state = get();
    return (
      state.members.find((m) => m.id === state.activeUserId) || state.members[0]
    );
  },

  submitEvaluationAnswer: (submission: FullEvaluationSubmission) => {
    const { stageNumber, evaluatorId } = submission;
    const currentSubs = get().surveySubmissions[stageNumber] || {};
    const updatedSubs = {
      ...currentSubs,
      [evaluatorId]: submission,
    };

    const currentProgress = get().surveyProgress[stageNumber] || [];
    const updatedProgress = currentProgress.includes(evaluatorId)
      ? currentProgress
      : [...currentProgress, evaluatorId];

    set((state) => ({
      surveySubmissions: {
        ...state.surveySubmissions,
        [stageNumber]: updatedSubs,
      },
      surveyProgress: {
        ...state.surveyProgress,
        [stageNumber]: updatedProgress,
      },
    }));

    // If all members finished, recalculate graph automatically
    if (updatedProgress.length >= get().members.length) {
      get().recalculateRelationshipGraph(stageNumber);
    }
  },

  autoCompleteDemoSurveys: (stageNumber = 2) => {
    const members = get().members;
    const stageSubs = { ...(get().surveySubmissions[stageNumber] || {}) };

    // Fill in from calibrated mock data
    DEMO_ALFA_PEER_EVALUATIONS_STAGE2.forEach((ev) => {
      if (!stageSubs[ev.evaluatorId]) {
        stageSubs[ev.evaluatorId] = {
          stageNumber,
          evaluatorId: ev.evaluatorId,
          peerEvaluation: ev,
          leaderRating:
            ev.evaluatorId !== 'demo-user-anna'
              ? DEMO_ALFA_LEADER_RATINGS.find((r) => r.evaluatorId === ev.evaluatorId)
              : undefined,
          memberRatings:
            ev.evaluatorId === 'demo-user-anna'
              ? DEMO_ALFA_MEMBER_RATINGS_BY_LEADER
              : undefined,
        };
      }
    });

    const allMemberIds = members.map((m) => m.id);

    set((state) => ({
      surveySubmissions: {
        ...state.surveySubmissions,
        [stageNumber]: stageSubs,
      },
      surveyProgress: {
        ...state.surveyProgress,
        [stageNumber]: allMemberIds,
      },
    }));

    get().recalculateRelationshipGraph(stageNumber);
  },

  recalculateRelationshipGraph: (stageNumber = 2) => {
    const { members, surveySubmissions, decisionData } = get();

    // Collect peer evaluations for this stage
    const stageSubs = surveySubmissions[stageNumber] || {};
    const evaluations: PeerEvaluationAnswer[] = [];
    const leaderRatings: { evaluatorId: string; speechSpace: number; atmosphere: number }[] = [];
    let leaderMemberEvaluations: Record<string, { engagement: number; openness: number }> | undefined;

    Object.values(stageSubs).forEach((sub) => {
      if (sub.peerEvaluation) {
        evaluations.push(sub.peerEvaluation);
      }
      if (sub.leaderRating) {
        leaderRatings.push({
          evaluatorId: sub.evaluatorId,
          speechSpace: sub.leaderRating.speechSpace,
          atmosphere: sub.leaderRating.atmosphere,
        });
      }
      if (sub.memberRatings) {
        leaderMemberEvaluations = sub.memberRatings;
      }
    });

    // Fall back to canonical evaluations if none submitted
    const activeEvals =
      evaluations.length > 0 ? evaluations : DEMO_ALFA_PEER_EVALUATIONS_STAGE2;
    const activeLeaderRatings =
      leaderRatings.length > 0 ? leaderRatings : DEMO_ALFA_LEADER_RATINGS;
    const activeLeaderMemberEvaluations =
      leaderMemberEvaluations || DEMO_ALFA_MEMBER_RATINGS_BY_LEADER;

    const newGraph = buildRelationshipGraph({
      members,
      evaluations: activeEvals,
      stage2Data: decisionData
        ? {
            teamScore: decisionData.teamScore,
            synergyDelta: decisionData.synergyDelta,
            silentExpertUserId: decisionData.silentExpertId,
            individualScores: decisionData.individualScores,
          }
        : undefined,
      leaderRatings: activeLeaderRatings,
      leaderMemberEvaluations: activeLeaderMemberEvaluations,
    });

    set({
      relationshipGraph: newGraph,
    });
  },
}));
