-- ============================================================================
-- TeenBond ("Liderzy Jutra") - Complete Production Schema & RLS Migration
-- Migration: 20261107000000_init_schema.sql
-- Adheres to Supabase Postgres Best Practices & Security Checklist
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. TABLES (11 Core Tables)
-- ============================================================================

-- 1.1 PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL DEFAULT 'Użytkownik',
    chameleon_color TEXT NOT NULL DEFAULT '#10B981',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.2 ORGANIZATIONS
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL DEFAULT 'private' CHECK (type IN ('public', 'private')),
    is_public BOOLEAN NOT NULL DEFAULT false,
    invite_code TEXT UNIQUE,
    logo_url TEXT,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.3 TEAM_MEMBERS
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('leader', 'member')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'rejected')),
    points INTEGER NOT NULL DEFAULT 0,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(organization_id, user_id)
);

-- 1.4 STAGES
CREATE TABLE IF NOT EXISTS public.stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    stage_number INTEGER NOT NULL CHECK (stage_number BETWEEN 1 AND 6),
    title TEXT NOT NULL,
    description TEXT,
    is_unlocked BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(organization_id, stage_number)
);

-- 1.5 GAME_SESSIONS
CREATE TABLE IF NOT EXISTS public.game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    stage_number INTEGER NOT NULL CHECK (stage_number BETWEEN 1 AND 6),
    stage_code TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'voting', 'completed')),
    current_phase TEXT NOT NULL DEFAULT 'individual',
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    timer_ends_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- 1.6 MOTIVATOR_RANKINGS (Stage 1: CHAMPFROGS)
CREATE TABLE IF NOT EXISTS public.motivator_rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    ranking JSONB NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(organization_id, user_id)
);

-- 1.7 DECISION_SUBMISSIONS (Stage 2: Lost at Sea / NASA Moon Survival)
CREATE TABLE IF NOT EXISTS public.decision_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    submission_type TEXT NOT NULL CHECK (submission_type IN ('individual', 'team')),
    items_ranking JSONB NOT NULL,
    score INTEGER,
    accepted_by_user_ids UUID[] DEFAULT '{}',
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.8 EVALUATIONS (Stage 3: Post-Stage Peer & Leader Surveys)
CREATE TABLE IF NOT EXISTS public.evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE,
    stage_number INTEGER NOT NULL DEFAULT 2 CHECK (stage_number BETWEEN 1 AND 6),
    evaluator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    evaluation_type TEXT NOT NULL CHECK (evaluation_type IN ('peer_selection', 'leader_rating', 'member_rating')),
    question_key TEXT NOT NULL,
    rating_value INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT evaluations_no_self_peer CHECK (
        evaluation_type <> 'peer_selection' OR evaluator_id <> target_user_id
    )
);

-- 1.9 RELATIONSHIP_EDGES (Stage 3: Algorithmic Relationship Tree - Strictly Leader Only)
CREATE TABLE IF NOT EXISTS public.relationship_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    source_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    weight INTEGER NOT NULL DEFAULT 0,
    edge_style TEXT NOT NULL DEFAULT 'none' CHECK (edge_style IN ('none', 'thin', 'medium', 'thick', 'dashed')),
    points_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(organization_id, source_user_id, target_user_id)
);

-- 1.10 TEENBOARD_ROOMS (Stages 4, 5, 6: Interactive Whiteboard Rooms)
CREATE TABLE IF NOT EXISTS public.teenboard_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.game_sessions(id) ON DELETE SET NULL,
    room_type TEXT NOT NULL DEFAULT 'main' CHECK (room_type IN ('main', 'team_a', 'team_b', 'custom')),
    title TEXT NOT NULL,
    current_frame_index INTEGER NOT NULL DEFAULT 0,
    total_frames INTEGER NOT NULL DEFAULT 1,
    is_locked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.11 TEENBOARD_ELEMENTS (Whiteboard Elements & Strokes)
CREATE TABLE IF NOT EXISTS public.teenboard_elements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.teenboard_rooms(id) ON DELETE CASCADE,
    frame_index INTEGER NOT NULL DEFAULT 0,
    element_type TEXT NOT NULL CHECK (element_type IN ('stroke', 'path', 'line', 'rect', 'circle', 'shape', 'sticky', 'text', 'image', 'background', 'yarn')),
    x NUMERIC NOT NULL DEFAULT 0,
    y NUMERIC NOT NULL DEFAULT 0,
    width NUMERIC,
    height NUMERIC,
    rotation NUMERIC NOT NULL DEFAULT 0,
    z_index INTEGER NOT NULL DEFAULT 0,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    locked_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    locked_at TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    last_modified_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    deleted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 2. FOREIGN KEY & QUERY PERFORMANCE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON public.organizations(created_by);
CREATE INDEX IF NOT EXISTS idx_team_members_org ON public.team_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_org_user_role ON public.team_members(organization_id, user_id, role);

CREATE INDEX IF NOT EXISTS idx_stages_org ON public.stages(organization_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_org ON public.game_sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_stage ON public.game_sessions(organization_id, stage_number);

CREATE INDEX IF NOT EXISTS idx_motivator_rankings_org_user ON public.motivator_rankings(organization_id, user_id);
CREATE INDEX IF NOT EXISTS idx_motivator_rankings_session ON public.motivator_rankings(session_id);

CREATE INDEX IF NOT EXISTS idx_decision_submissions_org ON public.decision_submissions(organization_id);
CREATE INDEX IF NOT EXISTS idx_decision_submissions_session ON public.decision_submissions(session_id);
CREATE INDEX IF NOT EXISTS idx_decision_submissions_user ON public.decision_submissions(user_id);

CREATE INDEX IF NOT EXISTS idx_evaluations_org_session ON public.evaluations(organization_id, session_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_evaluator ON public.evaluations(evaluator_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_target ON public.evaluations(target_user_id);

CREATE INDEX IF NOT EXISTS idx_relationship_edges_org ON public.relationship_edges(organization_id);
CREATE INDEX IF NOT EXISTS idx_relationship_edges_source ON public.relationship_edges(source_user_id);
CREATE INDEX IF NOT EXISTS idx_relationship_edges_target ON public.relationship_edges(target_user_id);

CREATE INDEX IF NOT EXISTS idx_teenboard_rooms_org ON public.teenboard_rooms(organization_id);
CREATE INDEX IF NOT EXISTS idx_teenboard_rooms_session ON public.teenboard_rooms(session_id);

CREATE INDEX IF NOT EXISTS idx_teenboard_elements_room_frame ON public.teenboard_elements(room_id, frame_index) WHERE NOT deleted;
CREATE INDEX IF NOT EXISTS idx_teenboard_elements_created_by ON public.teenboard_elements(created_by);
CREATE INDEX IF NOT EXISTS idx_teenboard_elements_last_modified_by ON public.teenboard_elements(last_modified_by);
CREATE INDEX IF NOT EXISTS idx_teenboard_elements_locked_by ON public.teenboard_elements(locked_by_user_id);

-- ============================================================================
-- 3. HELPER FUNCTIONS FOR RLS (Secured per Supabase Security Checklist)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_org_leader(org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT CASE
    WHEN (SELECT auth.uid()) IS NULL THEN false
    ELSE EXISTS (
      SELECT 1 FROM public.team_members
      WHERE organization_id = org_id
        AND user_id = (SELECT auth.uid())
        AND role = 'leader'
        AND status = 'active'
    )
  END;
$$;

REVOKE EXECUTE ON FUNCTION public.is_org_leader(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_org_leader(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.is_org_member(org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT CASE
    WHEN (SELECT auth.uid()) IS NULL THEN false
    ELSE EXISTS (
      SELECT 1 FROM public.team_members
      WHERE organization_id = org_id
        AND user_id = (SELECT auth.uid())
        AND status = 'active'
    )
  END;
$$;

REVOKE EXECUTE ON FUNCTION public.is_org_member(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_org_member(UUID) TO authenticated;

-- Automatically provision public.profiles row when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, chameleon_color)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Użytkownik'),
    COALESCE(NEW.raw_user_meta_data->>'chameleon_color', '#10B981')
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        chameleon_color = EXCLUDED.chameleon_color,
        updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES FOR ALL 11 TABLES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motivator_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationship_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teenboard_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teenboard_elements ENABLE ROW LEVEL SECURITY;

-- 4.1 PROFILES POLICIES
CREATE POLICY profiles_select ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.team_members tm1
      JOIN public.team_members tm2 ON tm1.organization_id = tm2.organization_id
      WHERE tm1.user_id = (SELECT auth.uid())
        AND tm2.user_id = public.profiles.id
        AND tm1.status = 'active'
    )
  );

CREATE POLICY profiles_insert ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY profiles_update ON public.profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- 4.2 ORGANIZATIONS POLICIES
CREATE POLICY org_select ON public.organizations
  FOR SELECT TO authenticated
  USING (is_public = true OR type = 'public' OR invite_code IS NOT NULL OR (SELECT public.is_org_member(id)) OR created_by = (SELECT auth.uid()));

CREATE POLICY org_insert ON public.organizations
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = created_by);

CREATE POLICY org_update ON public.organizations
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_org_leader(id)))
  WITH CHECK ((SELECT public.is_org_leader(id)));

-- 4.3 TEAM_MEMBERS POLICIES
CREATE POLICY team_members_select ON public.team_members
  FOR SELECT TO authenticated
  USING ((SELECT public.is_org_member(organization_id)) OR user_id = (SELECT auth.uid()));

CREATE POLICY team_members_insert ON public.team_members
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.is_org_leader(organization_id)));

CREATE POLICY team_members_update ON public.team_members
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_org_leader(organization_id)))
  WITH CHECK ((SELECT public.is_org_leader(organization_id)));

CREATE POLICY team_members_delete ON public.team_members
  FOR DELETE TO authenticated
  USING ((SELECT public.is_org_leader(organization_id)) OR user_id = (SELECT auth.uid()));

-- 4.4 STAGES POLICIES
CREATE POLICY stages_select ON public.stages
  FOR SELECT TO authenticated
  USING ((SELECT public.is_org_member(organization_id)));

CREATE POLICY stages_insert ON public.stages
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_org_leader(organization_id)));

CREATE POLICY stages_update ON public.stages
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_org_leader(organization_id)))
  WITH CHECK ((SELECT public.is_org_leader(organization_id)));

-- 4.5 GAME_SESSIONS POLICIES
CREATE POLICY game_sessions_select ON public.game_sessions
  FOR SELECT TO authenticated
  USING ((SELECT public.is_org_member(organization_id)));

CREATE POLICY game_sessions_insert ON public.game_sessions
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_org_member(organization_id)));

CREATE POLICY game_sessions_update ON public.game_sessions
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_org_member(organization_id)))
  WITH CHECK ((SELECT public.is_org_member(organization_id)));

-- 4.6 MOTIVATOR_RANKINGS POLICIES
CREATE POLICY motivator_rankings_select ON public.motivator_rankings
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_org_member(organization_id)));

CREATE POLICY motivator_rankings_insert ON public.motivator_rankings
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()) AND (SELECT public.is_org_member(organization_id)));

CREATE POLICY motivator_rankings_update ON public.motivator_rankings
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- 4.7 DECISION_SUBMISSIONS POLICIES
CREATE POLICY decision_submissions_select ON public.decision_submissions
  FOR SELECT TO authenticated
  USING ((SELECT public.is_org_member(organization_id)));

CREATE POLICY decision_submissions_insert ON public.decision_submissions
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT public.is_org_member(organization_id))
    AND (user_id IS NULL OR user_id = (SELECT auth.uid()))
  );

CREATE POLICY decision_submissions_update ON public.decision_submissions
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_org_member(organization_id)))
  WITH CHECK ((SELECT public.is_org_member(organization_id)));

-- 4.8 EVALUATIONS POLICIES
-- Members can insert their own evaluations; only the Leader (or the evaluator themselves) can select rows.
CREATE POLICY evaluations_select ON public.evaluations
  FOR SELECT TO authenticated
  USING (evaluator_id = (SELECT auth.uid()) OR (SELECT public.is_org_leader(organization_id)));

CREATE POLICY evaluations_insert ON public.evaluations
  FOR INSERT TO authenticated
  WITH CHECK (
    evaluator_id = (SELECT auth.uid())
    AND (SELECT public.is_org_member(organization_id))
  );

-- 4.9 RELATIONSHIP_EDGES POLICIES (STRICTLY LEADER ONLY - F11 & R4)
CREATE POLICY relationship_edges_leader_select ON public.relationship_edges
  FOR SELECT TO authenticated
  USING ((SELECT public.is_org_leader(organization_id)));

CREATE POLICY relationship_edges_leader_insert ON public.relationship_edges
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_org_leader(organization_id)));

CREATE POLICY relationship_edges_leader_update ON public.relationship_edges
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_org_leader(organization_id)))
  WITH CHECK ((SELECT public.is_org_leader(organization_id)));

-- 4.10 TEENBOARD_ROOMS POLICIES
CREATE POLICY teenboard_rooms_select ON public.teenboard_rooms
  FOR SELECT TO authenticated
  USING ((SELECT public.is_org_member(organization_id)));

CREATE POLICY teenboard_rooms_insert ON public.teenboard_rooms
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_org_member(organization_id)));

CREATE POLICY teenboard_rooms_update ON public.teenboard_rooms
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_org_member(organization_id)))
  WITH CHECK ((SELECT public.is_org_member(organization_id)));

-- 4.11 TEENBOARD_ELEMENTS POLICIES
CREATE POLICY teenboard_elements_select ON public.teenboard_elements
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teenboard_rooms r
      WHERE r.id = public.teenboard_elements.room_id
        AND (SELECT public.is_org_member(r.organization_id))
    )
  );

CREATE POLICY teenboard_elements_insert ON public.teenboard_elements
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.teenboard_rooms r
      WHERE r.id = public.teenboard_elements.room_id
        AND NOT r.is_locked
        AND (SELECT public.is_org_member(r.organization_id))
    )
  );

CREATE POLICY teenboard_elements_update ON public.teenboard_elements
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teenboard_rooms r
      WHERE r.id = public.teenboard_elements.room_id
        AND NOT r.is_locked
        AND (SELECT public.is_org_member(r.organization_id))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teenboard_rooms r
      WHERE r.id = public.teenboard_elements.room_id
        AND NOT r.is_locked
        AND (SELECT public.is_org_member(r.organization_id))
    )
  );

-- ============================================================================
-- 5. SUPABASE REALTIME PUBLICATION
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.teenboard_elements;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.teenboard_rooms;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.game_sessions;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.decision_submissions;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.stages;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
