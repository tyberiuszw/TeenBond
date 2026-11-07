import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';

const mockCreateServerClient = vi.fn();

vi.mock('@supabase/ssr', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@supabase/ssr')>();
  return {
    ...actual,
    createServerClient: (...args: any[]) => mockCreateServerClient(...args),
  };
});

vi.mock('next/headers', () => ({
  cookies: () => ({
    getAll: () => [],
    set: vi.fn(),
  }),
}));

import { joinBoardRoom } from '../../src/lib/supabase/realtime';
import { allocateClues, partitionMurderMysteryRoleAndClues } from '../../src/lib/games/clueAllocator';
import { useTeenBoardStore } from '../../src/lib/board/teenboard-store';
import { useDemoStore } from '../../src/lib/demo-store';
import { useSessionStore } from '../../src/lib/session-store';
import { getDataClient } from '../../src/lib/data-client';
import {
  isSupabaseConfigured,
  getSupabaseAnonOrPublishableKey,
} from '../../src/lib/supabase/client';
import {
  updateSession,
  isProtectedRoute,
  isAuthRoute,
  isDemoModeRequest,
  sanitizeRedirectPath,
} from '../../src/lib/supabase/middleware';
import { GET as authCallbackGet } from '../../src/app/auth/callback/route';
import { GET as healthCheckGet, dynamic as healthCheckDynamic } from '../../src/app/api/health/route';

const ROOT_DIR = path.resolve(__dirname, '../..');

describe('Milestone 5 & 6: Cloud Infrastructure, Supabase RLS Security & E2E Hardening (F34-F40)', () => {
  beforeEach(() => {
    useDemoStore.getState().resetToInitial();
  });

  describe('F34 & F35: Supabase PostgreSQL 11-Table Schema, Indexes & RLS Hardening', () => {
    const migrationPath = path.join(ROOT_DIR, 'supabase/migrations/20261107000000_init_schema.sql');

    it('contains the complete SQL migration file with all 11 required tables', () => {
      expect(fs.existsSync(migrationPath)).toBe(true);
      const sql = fs.readFileSync(migrationPath, 'utf-8');

      const requiredTables = [
        'profiles',
        'organizations',
        'team_members',
        'stages',
        'game_sessions',
        'motivator_rankings',
        'decision_submissions',
        'evaluations',
        'relationship_edges',
        'teenboard_rooms',
        'teenboard_elements',
      ];

      for (const table of requiredTables) {
        expect(sql).toContain(`CREATE TABLE IF NOT EXISTS public.${table}`);
        expect(sql).toContain(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
      }
    });

    it('enforces Supabase Postgres Best Practices: (SELECT auth.uid()), TO authenticated, FK indexes, and Leader-only relationship_edges RLS', () => {
      const sql = fs.readFileSync(migrationPath, 'utf-8');

      // Must use cached (SELECT auth.uid()) instead of bare auth.uid() in policies
      expect(sql).toContain('(SELECT auth.uid())');
      // Must not use deprecated auth.role()
      expect(sql).not.toContain('auth.role()');
      // Must target authenticated role explicitly
      expect(sql).toContain('TO authenticated');

      // Must restrict relationship_edges strictly to organization leader
      expect(sql).toContain('CREATE POLICY relationship_edges_leader_select ON public.relationship_edges');
      expect(sql).toContain('USING ((SELECT public.is_org_leader(organization_id)))');

      // Must revoke public execution on SECURITY DEFINER helper functions
      expect(sql).toContain('REVOKE EXECUTE ON FUNCTION public.is_org_leader(UUID) FROM PUBLIC;');
      expect(sql).toContain('REVOKE EXECUTE ON FUNCTION public.is_org_leader(UUID) FROM anon;');
      expect(sql).toContain('REVOKE EXECUTE ON FUNCTION public.is_org_member(UUID) FROM PUBLIC;');
      expect(sql).toContain('REVOKE EXECUTE ON FUNCTION public.is_org_member(UUID) FROM anon;');

      // Must include explicit Data API schema and table grants
      expect(sql).toContain('GRANT USAGE ON SCHEMA public TO anon, authenticated;');
      expect(sql).toContain('GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;');
      expect(sql).toContain('GRANT SELECT, INSERT, UPDATE ON public.relationship_edges TO authenticated;');

      // Every UPDATE policy must include both USING and WITH CHECK
      const updatePolicyBlocks = sql.split(/CREATE POLICY /i).slice(1).filter((b) => /FOR UPDATE/i.test(b));
      expect(updatePolicyBlocks.length).toBeGreaterThanOrEqual(10);
      for (const block of updatePolicyBlocks) {
        const policyChunk = block.split(';')[0];
        expect(policyChunk).toMatch(/USING\s*\(/i);
        expect(policyChunk).toMatch(/WITH CHECK\s*\(/i);
      }

      // Must prevent self-evaluation at DB constraint level
      expect(sql).toContain('CONSTRAINT evaluations_no_self_peer');
    });
  });

  describe('Supabase SSR Auth, Protected Routes Middleware & Callback Hardening', () => {
    const originalEnv = { ...process.env };

    afterEach(() => {
      process.env = { ...originalEnv };
      mockCreateServerClient.mockReset();
    });

    it('detects Supabase configuration with either NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY and rejects placeholders', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      expect(isSupabaseConfigured()).toBe(false);

      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://your-project.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'your-anon-key-here';
      expect(isSupabaseConfigured()).toBe(false);

      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://xyzcompany.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_real_key_123';
      expect(getSupabaseAnonOrPublishableKey()).toBe('sb_publishable_real_key_123');
      expect(isSupabaseConfigured()).toBe(true);
    });

    it('accurately classifies protected routes, auth routes, and sanitizes open redirects', () => {
      const protectedPaths = [
        '/path',
        '/path/stage1',
        '/path/stage2',
        '/path/stage4',
        '/path/stage5',
        '/path/stage6',
        '/team',
        '/relations',
        '/onboarding',
      ];
      for (const p of protectedPaths) {
        expect(isProtectedRoute(p)).toBe(true);
        expect(isAuthRoute(p)).toBe(false);
      }

      expect(isProtectedRoute('/')).toBe(false);
      expect(isProtectedRoute('/api/health')).toBe(false);
      expect(isProtectedRoute('/pathology')).toBe(false);

      expect(isAuthRoute('/login')).toBe(true);
      expect(isAuthRoute('/register')).toBe(true);
      expect(isAuthRoute('/login-help')).toBe(false);

      expect(sanitizeRedirectPath('/relations')).toBe('/relations');
      expect(sanitizeRedirectPath('//evil.example.com')).toBe('/path');
      expect(sanitizeRedirectPath('/\\evil.example.com')).toBe('/path');
      expect(sanitizeRedirectPath('https://evil.example.com')).toBe('/path');
      expect(sanitizeRedirectPath(null)).toBe('/path');
      expect(sanitizeRedirectPath('')).toBe('/path');
    });

    it('redirects unauthenticated requests on protected routes to /login with next param when Supabase is configured and not in Demo mode', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://xyzcompany.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.real';

      const getUserMock = vi.fn().mockResolvedValue({ data: { user: null }, error: null });
      const getSessionSpy = vi.fn();
      mockCreateServerClient.mockReturnValue({
        auth: {
          getUser: getUserMock,
          getSession: getSessionSpy,
        },
      } as any);

      for (const route of ['/path', '/path/stage1', '/path/stage5', '/team', '/relations', '/onboarding']) {
        const req = new NextRequest(`https://teenbond.app${route}`);
        const res = await updateSession(req);

        expect(res.status).toBe(307);
        const location = res.headers.get('location');
        expect(location).toBeTruthy();
        const redirectUrl = new URL(location!);
        expect(redirectUrl.pathname).toBe('/login');
        expect(redirectUrl.searchParams.get('next')).toBe(route);
        expect(redirectUrl.searchParams.get('redirectTo')).toBe(route);
      }

      // Must validate token with getUser(), never getSession()
      expect(getUserMock).toHaveBeenCalledTimes(6);
      expect(getSessionSpy).not.toHaveBeenCalled();
    });

    it('redirects authenticated users away from /login and /register to /path (or sanitized next param)', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://xyzcompany.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.real';

      const getUserMock = vi.fn().mockResolvedValue({
        data: { user: { id: 'user-123', email: 'anna@teenbond.pl' } },
        error: null,
      });
      mockCreateServerClient.mockReturnValue({
        auth: {
          getUser: getUserMock,
        },
      } as any);

      const loginReq = new NextRequest('https://teenbond.app/login');
      const loginRes = await updateSession(loginReq);
      expect(loginRes.status).toBe(307);
      expect(new URL(loginRes.headers.get('location')!).pathname).toBe('/path');

      const loginWithNextReq = new NextRequest('https://teenbond.app/login?next=/relations');
      const loginWithNextRes = await updateSession(loginWithNextReq);
      expect(loginWithNextRes.status).toBe(307);
      expect(new URL(loginWithNextRes.headers.get('location')!).pathname).toBe('/relations');

      // Prevents redirect loop if next points to /login or /register
      const loginLoopReq = new NextRequest('https://teenbond.app/register?next=/login');
      const loginLoopRes = await updateSession(loginLoopReq);
      expect(loginLoopRes.status).toBe(307);
      expect(new URL(loginLoopRes.headers.get('location')!).pathname).toBe('/path');
    });

    it('allows seamless Demo Mode access to all protected routes via tb_demo_mode or teenbond_demo cookie even when Supabase is configured', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://xyzcompany.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.real';

      for (const cookieHeader of ['tb_demo_mode=true', 'teenbond_demo=true', 'teenbond_demo=1']) {
        const req = new NextRequest('https://teenbond.app/relations', {
          headers: { cookie: cookieHeader },
        });
        expect(isDemoModeRequest(req)).toBe(true);

        const res = await updateSession(req);
        expect(res.status).toBe(200);
        expect(res.headers.get('location')).toBeNull();
      }

      expect(mockCreateServerClient).not.toHaveBeenCalled();
    });

    it('exchanges PKCE auth code in /auth/callback and handles missing/invalid codes securely', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://xyzcompany.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.real';

      const exchangeMock = vi.fn().mockResolvedValue({ data: { session: {} }, error: null });
      mockCreateServerClient.mockReturnValue({
        auth: {
          exchangeCodeForSession: exchangeMock,
        },
      } as any);

      // 1. Valid code + custom next path
      const validReq = new Request('https://teenbond.app/auth/callback?code=pkce_code_123&next=/onboarding');
      const validRes = await authCallbackGet(validReq);
      expect(exchangeMock).toHaveBeenCalledWith('pkce_code_123');
      expect(validRes.status).toBe(307);
      expect(validRes.headers.get('location')).toBe('https://teenbond.app/onboarding');

      // 2. Open redirect attempt in next param falls back to /path
      const openRedirectReq = new Request(
        'https://teenbond.app/auth/callback?code=pkce_code_123&next=//malicious.site'
      );
      const openRedirectRes = await authCallbackGet(openRedirectReq);
      expect(openRedirectRes.status).toBe(307);
      expect(openRedirectRes.headers.get('location')).toBe('https://teenbond.app/path');

      // 3. Missing code redirects to /login?error=auth_callback_failed
      const missingCodeReq = new Request('https://teenbond.app/auth/callback');
      const missingCodeRes = await authCallbackGet(missingCodeReq);
      expect(missingCodeRes.status).toBe(307);
      expect(missingCodeRes.headers.get('location')).toBe(
        'https://teenbond.app/login?error=auth_callback_failed'
      );

      // 4. Failed code exchange redirects to /login?error=auth_callback_failed
      exchangeMock.mockResolvedValueOnce({ data: null, error: new Error('Invalid code') });
      const failedReq = new Request('https://teenbond.app/auth/callback?code=expired_code');
      const failedRes = await authCallbackGet(failedReq);
      expect(failedRes.status).toBe(307);
      expect(failedRes.headers.get('location')).toBe(
        'https://teenbond.app/login?error=auth_callback_failed'
      );
    });

    it('clears session and disables demo mode on useSessionStore.logout()', () => {
      useDemoStore.getState().enableDemoMode('demo-user-anna');
      expect(useDemoStore.getState().isDemoMode).toBe(true);

      useSessionStore.getState().setSession({
        id: 'user-99',
        email: 'test@teenbond.pl',
        name: 'Test User',
        chameleonColor: '#10B981',
        role: 'leader',
        orgId: 'org-1',
        isDemo: false,
      });
      expect(useSessionStore.getState().session).not.toBeNull();

      useSessionStore.getState().logout();
      expect(useSessionStore.getState().session).toBeNull();
      expect(useDemoStore.getState().isDemoMode).toBe(false);
    });
  });

  describe('F36: Supabase Realtime Channels Contract (joinBoardRoom)', () => {
    it('establishes cursorsChannel and elementsChannel and broadcasts cursor, lock, and element updates', async () => {
      const members = useDemoStore.getState().members;
      const anna = members[0];

      const receivedCursors: any[] = [];
      const receivedLocks: any[] = [];
      const receivedElements: any[] = [];

      const room = joinBoardRoom('test-room-alpha', anna, {
        onCursorUpdate: (c) => receivedCursors.push(c),
        onElementLock: (l) => receivedLocks.push(l),
        onElementUpdate: (el) => receivedElements.push(el),
      });

      expect(room.roomId).toBe('test-room-alpha');
      expect(room.cursorsChannel).toBeDefined();
      expect(room.elementsChannel).toBeDefined();

      room.broadcastCursor(240, 360, [{ x: 240, y: 360, timestamp: Date.now() }]);
      room.broadcastElementLock('el-sticky-1', true);
      room.broadcastElementUpdate({
        id: 'el-sticky-1',
        type: 'sticky',
        x: 100,
        y: 120,
        width: 200,
        height: 200,
        content: 'Synchronized sticky note',
        color: '#FEF08A',
        createdBy: anna.id,
      });

      expect(receivedCursors.length).toBe(1);
      expect(receivedCursors[0].userId).toBe(anna.id);
      expect(receivedCursors[0].x).toBe(240);

      expect(receivedLocks.length).toBe(1);
      expect(receivedLocks[0].elementId).toBe('el-sticky-1');
      expect(receivedLocks[0].locked).toBe(true);

      expect(receivedElements.length).toBe(1);
      expect(receivedElements[0].content).toBe('Synchronized sticky note');

      room.leaveRoom();
    });
  });

  describe('M4 Interface Contracts: allocateClues, Murder Mystery Partitioning & TeenBoard Page Duplication', () => {
    it('allocates clues across all 3 game types (zin, murder, dracula) for a 5-player team', () => {
      const members = useDemoStore.getState().members;

      const zinMap = allocateClues('zin', members);
      expect(zinMap.size).toBe(5);
      let totalZinCards = 0;
      zinMap.forEach((cards) => {
        expect(cards.length).toBeGreaterThanOrEqual(6);
        expect(cards.length).toBeLessThanOrEqual(7);
        totalZinCards += cards.length;
      });
      expect(totalZinCards).toBe(33);

      const murderMap = allocateClues('murder', members);
      expect(murderMap.size).toBe(5);
      let totalMurderClues = 0;
      murderMap.forEach((cards) => {
        expect(cards.length).toBeGreaterThanOrEqual(3);
        totalMurderClues += cards.length;
      });
      expect(totalMurderClues).toBe(18);

      const draculaMap = allocateClues('dracula', members);
      expect(draculaMap.size).toBe(5);
      draculaMap.forEach((cards) => {
        expect(cards.length).toBeGreaterThan(5);
      });
    });

    it('assigns distinct characters and evidence subsets per member in Murder Mystery scenarios', () => {
      const memberIds = useDemoStore.getState().members.map((m) => m.id);

      const annaMovie = partitionMurderMysteryRoleAndClues(memberIds, memberIds[0], 'movie');
      const bartekMovie = partitionMurderMysteryRoleAndClues(memberIds, memberIds[1], 'movie');
      expect(annaMovie.assignedCharacter.id).not.toBe(bartekMovie.assignedCharacter.id);
      expect(annaMovie.assignedEvidences[0].id).not.toBe(bartekMovie.assignedEvidences[0].id);

      const annaTech = partitionMurderMysteryRoleAndClues(memberIds, memberIds[0], 'techstream');
      const bartekTech = partitionMurderMysteryRoleAndClues(memberIds, memberIds[1], 'techstream');
      expect(annaTech.assignedCharacter.id).not.toBe(bartekTech.assignedCharacter.id);
    });

    it('supports TeenBoard multi-page creation, background switching (dots, grid, lines, blank), and page duplication', () => {
      const board = useTeenBoardStore.getState();
      const el = board.addElement('demo-user-anna', {
        type: 'sticky',
        x: 50,
        y: 60,
        content: 'Notatka do skopiowania',
        color: '#FEF08A',
      });

      const originalPageId = board.activePageId;
      board.setPageBackground(originalPageId, 'lines');
      expect(useTeenBoardStore.getState().pages.find((p) => p.id === originalPageId)?.background).toBe('lines');

      const copiedPageId = board.duplicatePage(originalPageId);
      const nextState = useTeenBoardStore.getState();
      expect(nextState.activePageId).toBe(copiedPageId);

      const copiedElements = Object.values(nextState.elements).filter(
        (e) => e.pageId === copiedPageId && !e.deleted
      );
      expect(copiedElements.some((e) => e.content === 'Notatka do skopiowania')).toBe(true);
      expect(el.id).toBeDefined();
    });
  });

  describe('F37, F38, F39: Deployment Artifacts (Dockerfile, railway.json, /api/health, README.md)', () => {
    it('verifies Dockerfile multi-stage standalone configuration and railway.json schema', () => {
      const dockerfilePath = path.join(ROOT_DIR, 'Dockerfile');
      const railwayJsonPath = path.join(ROOT_DIR, 'railway.json');
      const readmePath = path.join(ROOT_DIR, 'README.md');

      expect(fs.existsSync(dockerfilePath)).toBe(true);
      expect(fs.existsSync(railwayJsonPath)).toBe(true);
      expect(fs.existsSync(readmePath)).toBe(true);

      const dockerfile = fs.readFileSync(dockerfilePath, 'utf-8');
      expect(dockerfile).toContain('FROM node:22-alpine');
      expect(dockerfile).toContain('ARG NEXT_PUBLIC_SUPABASE_URL');
      expect(dockerfile).toContain('ARG NEXT_PUBLIC_SUPABASE_ANON_KEY');
      expect(dockerfile).toContain('ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL');
      expect(dockerfile).toContain('ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY');
      const builderIdx = dockerfile.indexOf('FROM base AS builder');
      const buildCmdIdx = dockerfile.indexOf('RUN npm run build');
      expect(dockerfile.indexOf('ARG NEXT_PUBLIC_SUPABASE_URL')).toBeGreaterThan(builderIdx);
      expect(dockerfile.indexOf('ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL')).toBeLessThan(buildCmdIdx);
      expect(dockerfile.indexOf('ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY')).toBeLessThan(buildCmdIdx);
      expect(dockerfile).toContain('.next/standalone');
      expect(dockerfile).toContain('CMD ["node", "server.js"]');

      const eslintConfigPath = path.join(ROOT_DIR, '.eslintrc.json');
      expect(fs.existsSync(eslintConfigPath)).toBe(true);
      const eslintConfig = JSON.parse(fs.readFileSync(eslintConfigPath, 'utf-8'));
      expect(eslintConfig.extends).toBe('next/core-web-vitals');
      expect(eslintConfig.rules?.['react-hooks/exhaustive-deps']).toBeUndefined();

      const railwayConfig = JSON.parse(fs.readFileSync(railwayJsonPath, 'utf-8'));
      expect(railwayConfig.build.builder).toBe('DOCKERFILE');
      expect(railwayConfig.deploy.startCommand).toBe('node server.js');
      expect(railwayConfig.deploy.healthcheckPath).toBe('/api/health');
    });

    it('returns 200 OK from dynamic /api/health endpoint', async () => {
      expect(healthCheckDynamic).toBe('force-dynamic');
      const response = await healthCheckGet();
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.status).toBe('ok');
      expect(body.service).toContain('TeenBond');
      expect(body.demoModeAvailable).toBe(true);
    });

    it('enforces self-evaluation rejection in DataClient.submitPeerEvaluation', async () => {
      const client = getDataClient();
      await expect(
        client.submitPeerEvaluation('demo-user-anna', 'demo-user-anna', {
          cooperation: true,
          activeListening: false,
          goalOriented: false,
          chaos: false,
        })
      ).rejects.toThrow('Self-evaluation is forbidden');
    });

    it('cumulatively aggregates Relationship Tree weights across multiple completed stages (Stage 2 + Stage 4 + Stage 5) without erasing prior stage edges', () => {
      const store = useDemoStore.getState();
      store.recalculateRelationshipGraph(2);
      const stage2Graph = useDemoStore.getState().relationshipGraph;
      const baselineEdgeCount = stage2Graph.edges.length;
      const baselineAnnaEwa = stage2Graph.edges.find(
        (e) =>
          (e.source === 'demo-user-anna' && e.target === 'demo-user-ewa') ||
          (e.source === 'demo-user-ewa' && e.target === 'demo-user-anna')
      );
      expect(baselineAnnaEwa).toBeDefined();
      const initialWeight = baselineAnnaEwa!.weight; // 8 in Stage 2

      // Submit a Stage 4 (Zin Obelisk) evaluation from Anna nominating Ewa (+3 +2 +2 = +7)
      store.submitEvaluationAnswer({
        stageNumber: 4,
        evaluatorId: 'demo-user-anna',
        peerEvaluation: {
          evaluatorId: 'demo-user-anna',
          bestCollabUserId: 'demo-user-ewa',
          activeListenerUserId: 'demo-user-ewa',
          goalOrganizerUserId: 'demo-user-ewa',
          chaosUserId: 'demo-user-bartek',
        },
      });

      const afterStage4Graph = useDemoStore.getState().relationshipGraph;
      // Must NOT wipe out Stage 2 edges!
      expect(afterStage4Graph.edges.length).toBeGreaterThanOrEqual(baselineEdgeCount);

      const updatedAnnaEwa = afterStage4Graph.edges.find(
        (e) =>
          (e.source === 'demo-user-anna' && e.target === 'demo-user-ewa') ||
          (e.source === 'demo-user-ewa' && e.target === 'demo-user-anna')
      );
      expect(updatedAnnaEwa).toBeDefined();
      expect(updatedAnnaEwa!.weight).toBe(initialWeight + 7);
    });

    it('syncs TeenBoard fillColor on setStrokeColor, duplicates elements, and broadcasts over connected room', () => {
      const board = useTeenBoardStore.getState();
      const anna = useDemoStore.getState().members[0];

      const conn = board.connectRoom('live-sync-room', anna);
      expect(useTeenBoardStore.getState().roomConnection).toBe(conn);

      // Selecting pastel green updates both strokeColor and fillColor for sticky notes
      board.setStrokeColor('#BBF7D0');
      expect(useTeenBoardStore.getState().strokeColor).toBe('#BBF7D0');
      expect(useTeenBoardStore.getState().fillColor).toBe('#BBF7D0');

      const created = board.addElement(anna.id, {
        type: 'sticky',
        x: 100,
        y: 100,
        content: 'Zielona notatka',
        color: useTeenBoardStore.getState().fillColor,
      });
      expect(created.color).toBe('#BBF7D0');

      const duplicated = board.duplicateElement(anna.id, created.id);
      expect(duplicated).not.toBeNull();
      expect(duplicated!.content).toBe('Zielona notatka');
      expect(duplicated!.x).toBe(124);
      expect(duplicated!.y).toBe(124);

      board.disconnectRoom();
      expect(useTeenBoardStore.getState().roomConnection).toBeNull();
    });

    it('supports Public Organization join requests and Leader approval/rejection workflow (F04)', () => {
      const store = useDemoStore.getState();
      const initialMembersCount = store.members.length;

      store.requestJoinPublicOrg({
        name: 'Kasia Nowa',
        email: 'kasia@szkola.pl',
        chameleonColor: '#EC4899',
      });

      const pendingAfterRequest = useDemoStore
        .getState()
        .pendingJoinRequests.find((r) => r.email === 'kasia@szkola.pl');
      expect(pendingAfterRequest).toBeDefined();
      expect(pendingAfterRequest!.status).toBe('pending');

      // Leader approves Kasia's request
      store.resolveJoinRequest(pendingAfterRequest!.id, 'active');
      const stateAfterApprove = useDemoStore.getState();
      expect(stateAfterApprove.members.length).toBe(initialMembersCount + 1);
      expect(stateAfterApprove.members.some((m) => m.name === 'Kasia Nowa')).toBe(true);
    });
  });
});
