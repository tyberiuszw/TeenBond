import { UserSession } from '@/types/auth';
import { OrganizationContext } from '@/types/organization';
import { DecisionDemoData, RelationshipGraphDemoData } from '@/types/demo';
import { StageInfo } from '@/types/stages';
import { STAGES_CONFIG } from './constants';
import { useDemoStore } from './demo-store';
import { isSupabaseConfigured, createClient } from './supabase/client';

export interface DataClient {
  isDemo: boolean;
  getCurrentUser: () => Promise<UserSession>;
  getOrganization: () => Promise<OrganizationContext>;
  getTeamMembers: () => Promise<UserSession[]>;
  getMotivators: () => Promise<Record<string, string[]>>;
  submitMotivatorRanking: (userId: string, ranking: string[]) => Promise<{ allCompleted: boolean }>;
  getDecisionData: () => Promise<DecisionDemoData>;
  getRelationshipGraph: () => Promise<RelationshipGraphDemoData>;
  getStages: () => Promise<StageInfo[]>;
  submitPeerEvaluation: (
    evaluatorId: string,
    targetId: string,
    criteria: { cooperation: boolean; activeListening: boolean; goalOriented: boolean; chaos: boolean }
  ) => Promise<void>;
  submitLeaderEvaluation: (
    leaderId: string,
    targetId: string,
    criteria: { engagement: number; openness: number }
  ) => Promise<void>;
  submitLeaderRating: (
    memberId: string,
    criteria: { speechSpace: number; atmosphere: number }
  ) => Promise<void>;
}

export function getDataClient(): DataClient {
  const demoStore = useDemoStore.getState();
  const shouldUseDemo = demoStore.isDemoMode || !isSupabaseConfigured();

  if (shouldUseDemo) {
    return {
      isDemo: true,
      getCurrentUser: async () => {
        return demoStore.getActiveUser();
      },
      getOrganization: async () => {
        return demoStore.organization;
      },
      getTeamMembers: async () => {
        return demoStore.members;
      },
      getMotivators: async () => {
        return demoStore.motivators;
      },
      submitMotivatorRanking: async (userId: string, ranking: string[]) => {
        demoStore.updateMotivatorRanking(userId, ranking);
        const latestState = useDemoStore.getState();
        const allCompleted = latestState.members.every(
          (m) => Array.isArray(latestState.motivators[m.id]) && latestState.motivators[m.id].length === 10
        );
        return { allCompleted };
      },
      getDecisionData: async () => {
        return demoStore.decisionData;
      },
      getRelationshipGraph: async () => {
        const currentUser = demoStore.getActiveUser();
        if (currentUser.role !== 'leader') {
          throw new Error('403 Forbidden: Drzewko Relacji jest dostępne wyłącznie dla Lidera Zespołu');
        }
        return demoStore.relationshipGraph;
      },
      getStages: async () => {
        return [...STAGES_CONFIG];
      },
      submitPeerEvaluation: async (evaluatorId, targetId, criteria) => {
        if (evaluatorId === targetId) {
          throw new Error('Self-evaluation is forbidden');
        }
        demoStore.submitEvaluationAnswer({
          evaluatorId,
          stageNumber: 2,
          peerEvaluation: {
            evaluatorId,
            bestCollabUserId: criteria.cooperation ? targetId : '',
            activeListenerUserId: criteria.activeListening ? targetId : '',
            goalOrganizerUserId: criteria.goalOriented ? targetId : '',
            chaosUserId: criteria.chaos ? targetId : '',
          },
        });
      },
      submitLeaderEvaluation: async (leaderId, targetId, criteria) => {
        demoStore.submitEvaluationAnswer({
          evaluatorId: leaderId,
          stageNumber: 2,
          peerEvaluation: {
            evaluatorId: leaderId,
            bestCollabUserId: targetId,
            activeListenerUserId: targetId,
            goalOrganizerUserId: targetId,
            chaosUserId: '',
          },
          memberRatings: {
            [targetId]: {
              engagement: criteria.engagement,
              openness: criteria.openness,
            },
          },
        });
      },
      submitLeaderRating: async (memberId, criteria) => {
        const otherMember = demoStore.members.find((m) => m.id !== memberId) || demoStore.members[0];
        demoStore.submitEvaluationAnswer({
          evaluatorId: memberId,
          stageNumber: 2,
          peerEvaluation: {
            evaluatorId: memberId,
            bestCollabUserId: otherMember.id,
            activeListenerUserId: otherMember.id,
            goalOrganizerUserId: otherMember.id,
            chaosUserId: '',
          },
          leaderRating: {
            speechSpace: criteria.speechSpace,
            atmosphere: criteria.atmosphere,
          },
        });
      },
    };
  }

  // Real Supabase Cloud data client
  const supabase = createClient();

  return {
    isDemo: false,
    getCurrentUser: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Unauthenticated');

      const { data: profile } = (await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()) as { data: any };

      const { data: membership } = (await supabase
        .from('team_members')
        .select('role, organization_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()) as { data: any };

      return {
        id: user.id,
        email: user.email || '',
        name: profile?.full_name || user.email || 'Użytkownik',
        chameleonColor: profile?.chameleon_color || '#10B981',
        role: (membership?.role as any) || 'member',
        orgId: membership?.organization_id || '',
        isDemo: false,
      };
    },
    getOrganization: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Unauthenticated');

      const { data: membership } = (await supabase
        .from('team_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()) as { data: any };

      if (!membership?.organization_id) throw new Error('No active organization');

      const { data: org } = (await supabase
        .from('organizations')
        .select('*')
        .eq('id', membership.organization_id)
        .single()) as { data: any };

      if (!org) throw new Error('Organization not found');

      return {
        orgId: org.id,
        name: org.name,
        isDemo: false,
        isPublic: org.is_public || org.type === 'public',
        inviteCode: org.invite_code || undefined,
        members: [],
      };
    },
    getTeamMembers: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return demoStore.members;

      const { data: membership } = (await supabase
        .from('team_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()) as { data: any };

      if (!membership?.organization_id) return demoStore.members;

      const { data: rows } = (await supabase
        .from('team_members')
        .select('user_id, role, organization_id, profiles(id, email, full_name, chameleon_color)')
        .eq('organization_id', membership.organization_id)
        .eq('status', 'active')) as { data: any[] | null };

      if (!rows || rows.length === 0) return demoStore.members;

      return rows.map((r) => ({
        id: r.user_id,
        email: r.profiles?.email || '',
        name: r.profiles?.full_name || 'Gracz',
        chameleonColor: r.profiles?.chameleon_color || '#10B981',
        role: r.role,
        orgId: r.organization_id,
        isDemo: false,
      }));
    },
    getMotivators: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return demoStore.motivators;

      const { data: rows } = (await supabase
        .from('motivator_rankings')
        .select('user_id, ranking')) as { data: any[] | null };

      if (!rows || rows.length === 0) return demoStore.motivators;

      const map: Record<string, string[]> = {};
      rows.forEach((r) => {
        if (Array.isArray(r.ranking)) {
          map[r.user_id] = r.ranking as string[];
        }
      });
      return map;
    },
    submitMotivatorRanking: async (userId: string, ranking: string[]) => {
      const { data: membership } = (await supabase
        .from('team_members')
        .select('organization_id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()) as { data: any };

      if (membership?.organization_id) {
        await (supabase.from('motivator_rankings') as any).upsert(
          {
            organization_id: membership.organization_id,
            user_id: userId,
            ranking,
            submitted_at: new Date().toISOString(),
          },
          { onConflict: 'organization_id,user_id' }
        );
      }
      return { allCompleted: true };
    },
    getDecisionData: async () => {
      return demoStore.decisionData;
    },
    getRelationshipGraph: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Unauthenticated');

      const { data: membership } = (await supabase
        .from('team_members')
        .select('role, organization_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()) as { data: any };

      if (membership?.role !== 'leader') {
        throw new Error('403 Forbidden: Drzewko Relacji jest dostępne wyłącznie dla Lidera Zespołu');
      }

      return demoStore.relationshipGraph;
    },
    getStages: async () => {
      return [...STAGES_CONFIG];
    },
    submitPeerEvaluation: async (evaluatorId, targetId, criteria) => {
      if (evaluatorId === targetId) {
        throw new Error('Self-evaluation is forbidden');
      }
      const { data: membership } = (await supabase
        .from('team_members')
        .select('organization_id')
        .eq('user_id', evaluatorId)
        .eq('status', 'active')
        .single()) as { data: any };

      if (!membership?.organization_id) return;

      const rows: any[] = [];
      if (criteria.cooperation) {
        rows.push({
          organization_id: membership.organization_id,
          evaluator_id: evaluatorId,
          target_user_id: targetId,
          evaluation_type: 'peer_selection',
          question_key: 'best_collaboration',
          rating_value: 3,
        });
      }
      if (criteria.activeListening) {
        rows.push({
          organization_id: membership.organization_id,
          evaluator_id: evaluatorId,
          target_user_id: targetId,
          evaluation_type: 'peer_selection',
          question_key: 'active_listening',
          rating_value: 2,
        });
      }
      if (criteria.goalOriented) {
        rows.push({
          organization_id: membership.organization_id,
          evaluator_id: evaluatorId,
          target_user_id: targetId,
          evaluation_type: 'peer_selection',
          question_key: 'order_keeper',
          rating_value: 2,
        });
      }
      if (criteria.chaos) {
        rows.push({
          organization_id: membership.organization_id,
          evaluator_id: evaluatorId,
          target_user_id: targetId,
          evaluation_type: 'peer_selection',
          question_key: 'chaos_maker',
          rating_value: -1,
        });
      }

      if (rows.length > 0) {
        await (supabase.from('evaluations') as any).insert(rows);
      }
    },
    submitLeaderEvaluation: async (leaderId, targetId, criteria) => {
      const { data: membership } = (await supabase
        .from('team_members')
        .select('organization_id')
        .eq('user_id', leaderId)
        .eq('status', 'active')
        .single()) as { data: any };

      if (!membership?.organization_id) return;

      await (supabase.from('evaluations') as any).insert([
        {
          organization_id: membership.organization_id,
          evaluator_id: leaderId,
          target_user_id: targetId,
          evaluation_type: 'leader_rating',
          question_key: 'engagement',
          rating_value: criteria.engagement,
        },
        {
          organization_id: membership.organization_id,
          evaluator_id: leaderId,
          target_user_id: targetId,
          evaluation_type: 'leader_rating',
          question_key: 'openness',
          rating_value: criteria.openness,
        },
      ]);
    },
    submitLeaderRating: async (memberId, criteria) => {
      const { data: membership } = (await supabase
        .from('team_members')
        .select('organization_id')
        .eq('user_id', memberId)
        .eq('status', 'active')
        .single()) as { data: any };

      if (!membership?.organization_id) return;

      await (supabase.from('evaluations') as any).insert([
        {
          organization_id: membership.organization_id,
          evaluator_id: memberId,
          evaluation_type: 'member_rating',
          question_key: 'space_to_speak',
          rating_value: criteria.speechSpace,
        },
        {
          organization_id: membership.organization_id,
          evaluator_id: memberId,
          evaluation_type: 'member_rating',
          question_key: 'team_atmosphere',
          rating_value: criteria.atmosphere,
        },
      ]);
    },
  };
}
