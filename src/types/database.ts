export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          chameleon_color: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          chameleon_color?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          chameleon_color?: string;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          type: 'public' | 'private';
          is_public: boolean;
          invite_code: string | null;
          logo_url: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          type?: 'public' | 'private';
          is_public?: boolean;
          invite_code?: string | null;
          logo_url?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          type?: 'public' | 'private';
          is_public?: boolean;
          invite_code?: string | null;
          logo_url?: string | null;
          updated_at?: string;
        };
      };
      team_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: 'leader' | 'member';
          status: 'active' | 'pending' | 'rejected';
          points: number;
          joined_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role?: 'leader' | 'member';
          status?: 'active' | 'pending' | 'rejected';
          points?: number;
          joined_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string;
          role?: 'leader' | 'member';
          status?: 'active' | 'pending' | 'rejected';
          points?: number;
          joined_at?: string;
        };
      };
      stages: {
        Row: {
          id: string;
          organization_id: string;
          stage_number: number;
          title: string;
          description: string | null;
          is_unlocked: boolean;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          stage_number: number;
          title: string;
          description?: string | null;
          is_unlocked?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          is_unlocked?: boolean;
          completed_at?: string | null;
        };
      };
      game_sessions: {
        Row: {
          id: string;
          organization_id: string;
          stage_number: number;
          stage_code: string;
          status: 'waiting' | 'in_progress' | 'voting' | 'completed';
          current_phase: string;
          started_at: string;
          timer_ends_at: string | null;
          completed_at: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          organization_id: string;
          stage_number: number;
          stage_code: string;
          status?: 'waiting' | 'in_progress' | 'voting' | 'completed';
          current_phase?: string;
          started_at?: string;
          timer_ends_at?: string | null;
          completed_at?: string | null;
          metadata?: Json;
        };
        Update: {
          status?: 'waiting' | 'in_progress' | 'voting' | 'completed';
          current_phase?: string;
          timer_ends_at?: string | null;
          completed_at?: string | null;
          metadata?: Json;
        };
      };
      motivator_rankings: {
        Row: {
          id: string;
          organization_id: string;
          session_id: string | null;
          user_id: string;
          ranking: Json;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          session_id?: string | null;
          user_id: string;
          ranking: Json;
          submitted_at?: string;
        };
        Update: {
          ranking?: Json;
          submitted_at?: string;
        };
      };
      decision_submissions: {
        Row: {
          id: string;
          organization_id: string;
          session_id: string;
          user_id: string | null;
          submission_type: 'individual' | 'team';
          items_ranking: Json;
          score: number | null;
          accepted_by_user_ids: string[] | null;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          session_id: string;
          user_id?: string | null;
          submission_type: 'individual' | 'team';
          items_ranking: Json;
          score?: number | null;
          accepted_by_user_ids?: string[] | null;
          submitted_at?: string;
        };
        Update: {
          items_ranking?: Json;
          score?: number | null;
          accepted_by_user_ids?: string[] | null;
          submitted_at?: string;
        };
      };
      evaluations: {
        Row: {
          id: string;
          organization_id: string;
          session_id: string | null;
          stage_number: number;
          evaluator_id: string;
          target_user_id: string | null;
          evaluation_type: 'peer_selection' | 'leader_rating' | 'member_rating';
          question_key: string;
          rating_value: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          session_id?: string | null;
          stage_number?: number;
          evaluator_id: string;
          target_user_id?: string | null;
          evaluation_type: 'peer_selection' | 'leader_rating' | 'member_rating';
          question_key: string;
          rating_value: number;
          created_at?: string;
        };
        Update: {
          rating_value?: number;
        };
      };
      relationship_edges: {
        Row: {
          id: string;
          organization_id: string;
          source_user_id: string;
          target_user_id: string;
          weight: number;
          edge_style: 'none' | 'thin' | 'medium' | 'thick' | 'dashed';
          points_breakdown: Json;
          last_calculated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          source_user_id: string;
          target_user_id: string;
          weight?: number;
          edge_style?: 'none' | 'thin' | 'medium' | 'thick' | 'dashed';
          points_breakdown?: Json;
          last_calculated_at?: string;
        };
        Update: {
          weight?: number;
          edge_style?: 'none' | 'thin' | 'medium' | 'thick' | 'dashed';
          points_breakdown?: Json;
          last_calculated_at?: string;
        };
      };
      teenboard_rooms: {
        Row: {
          id: string;
          organization_id: string;
          session_id: string | null;
          room_type: 'main' | 'team_a' | 'team_b' | 'custom';
          title: string;
          current_frame_index: number;
          total_frames: number;
          is_locked: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          session_id?: string | null;
          room_type?: 'main' | 'team_a' | 'team_b' | 'custom';
          title: string;
          current_frame_index?: number;
          total_frames?: number;
          is_locked?: boolean;
          created_at?: string;
        };
        Update: {
          title?: string;
          current_frame_index?: number;
          total_frames?: number;
          is_locked?: boolean;
        };
      };
      teenboard_elements: {
        Row: {
          id: string;
          room_id: string;
          frame_index: number;
          element_type:
            | 'stroke'
            | 'path'
            | 'line'
            | 'rect'
            | 'circle'
            | 'shape'
            | 'sticky'
            | 'text'
            | 'image'
            | 'background'
            | 'yarn';
          x: number;
          y: number;
          width: number | null;
          height: number | null;
          rotation: number;
          z_index: number;
          data: Json;
          locked_by_user_id: string | null;
          locked_at: string | null;
          created_by: string;
          last_modified_by: string;
          deleted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          frame_index?: number;
          element_type:
            | 'stroke'
            | 'path'
            | 'line'
            | 'rect'
            | 'circle'
            | 'shape'
            | 'sticky'
            | 'text'
            | 'image'
            | 'background'
            | 'yarn';
          x?: number;
          y?: number;
          width?: number | null;
          height?: number | null;
          rotation?: number;
          z_index?: number;
          data?: Json;
          locked_by_user_id?: string | null;
          locked_at?: string | null;
          created_by: string;
          last_modified_by: string;
          deleted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          frame_index?: number;
          x?: number;
          y?: number;
          width?: number | null;
          height?: number | null;
          rotation?: number;
          z_index?: number;
          data?: Json;
          locked_by_user_id?: string | null;
          locked_at?: string | null;
          last_modified_by?: string;
          deleted?: boolean;
          updated_at?: string;
        };
      };
    };
    Functions: {
      is_org_leader: {
        Args: { org_id: string };
        Returns: boolean;
      };
      is_org_member: {
        Args: { org_id: string };
        Returns: boolean;
      };
    };
  };
}
