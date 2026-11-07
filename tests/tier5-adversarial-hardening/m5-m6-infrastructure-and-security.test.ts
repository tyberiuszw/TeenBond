import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { joinBoardRoom } from '../../src/lib/supabase/realtime';
import { allocateClues, partitionMurderMysteryRoleAndClues } from '../../src/lib/games/clueAllocator';
import { useTeenBoardStore } from '../../src/lib/board/teenboard-store';
import { useDemoStore } from '../../src/lib/demo-store';
import { getDataClient } from '../../src/lib/data-client';
import { GET as healthCheckGet } from '../../src/app/api/health/route';

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
      expect(sql).toContain('REVOKE EXECUTE ON FUNCTION public.is_org_member(UUID) FROM PUBLIC;');

      // Must prevent self-evaluation at DB constraint level
      expect(sql).toContain('CONSTRAINT evaluations_no_self_peer');
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
      expect(dockerfile).toContain('.next/standalone');
      expect(dockerfile).toContain('CMD ["node", "server.js"]');

      const railwayConfig = JSON.parse(fs.readFileSync(railwayJsonPath, 'utf-8'));
      expect(railwayConfig.build.builder).toBe('DOCKERFILE');
      expect(railwayConfig.deploy.startCommand).toBe('node server.js');
      expect(railwayConfig.deploy.healthcheckPath).toBe('/api/health');
    });

    it('returns 200 OK from /api/health endpoint', async () => {
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
  });
});
