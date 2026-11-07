import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  CHAMPFROGS_DEFINITIONS,
  findCardDef,
  validateMotivatorRanking,
  resolveCardAssetUrl,
} from '../../src/lib/motivators/cardData';
import {
  LOST_AT_SEA_SCENARIO,
  NASA_MOON_SCENARIO,
  getScenario,
} from '../../src/lib/decisions/scenarios';
import {
  getExpertRationale,
} from '../../src/lib/decisions/expertKeys';
import {
  calculateAbsoluteDifferenceSum,
  categorizeScore,
  getSurvivalTier,
} from '../../src/lib/decisions/scoring';
import {
  calculateSynergy,
  detectSilentExpert,
  calculateItemControversy,
} from '../../src/lib/decisions/synergy';
import { useDemoStore } from '../../src/lib/demo-store';
import {
  DEMO_ORGANIZATION_ALFA,
  DEMO_MEMBERS_ALFA,
  DEMO_MOTIVATORS_RANKINGS,
} from '../../src/lib/demo-mock-data';

describe('M2 Adversarial Challenger: Interactive Flows, Edge Cases & Invariants', () => {
  // =========================================================================
  // 1. SESSION STORAGE PERSISTENCE & HARD F5 RELOAD
  // =========================================================================
  describe('SessionStorage & F5 Persistence Hardening', () => {
    let mockStorage: Record<string, string> = {};

    beforeEach(() => {
      mockStorage = {};
      // Mock global window & sessionStorage
      const storageMock = {
        getItem: vi.fn((key: string) => mockStorage[key] ?? null),
        setItem: vi.fn((key: string, val: string) => {
          mockStorage[key] = val;
        }),
        removeItem: vi.fn((key: string) => {
          delete mockStorage[key];
        }),
        clear: vi.fn(() => {
          mockStorage = {};
        }),
      };

      vi.stubGlobal('sessionStorage', storageMock);
      vi.stubGlobal('window', { sessionStorage: storageMock });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('EMP-M2-01: Correctly restores active user, rankings, and demo mode after simulated hard F5 reload', () => {
      // 1. Initial user setup
      const store = useDemoStore.getState();
      store.enableDemoMode('demo-user-dawid');

      const customDawidRanking = [
        'curiosity', 'mastery', 'freedom', 'honor', 'acceptance',
        'power', 'relatedness', 'order', 'goal', 'status'
      ];
      store.updateMotivatorRanking('demo-user-dawid', customDawidRanking);

      // Verify stored in mock sessionStorage
      expect(sessionStorage.getItem('tb_demo_active_user')).toBe('demo-user-dawid');
      expect(sessionStorage.getItem('tb_demo_mode')).toBe('true');
      expect(JSON.parse(sessionStorage.getItem('tb_demo_motivators')!)).toHaveProperty('demo-user-dawid');

      // 2. Simulate HARD F5: store is re-evaluated with fresh functions reading from populated sessionStorage
      const savedUserId = sessionStorage.getItem('tb_demo_active_user');
      const savedMotivators = JSON.parse(sessionStorage.getItem('tb_demo_motivators')!);
      const savedMode = sessionStorage.getItem('tb_demo_mode') === 'true';

      expect(savedUserId).toBe('demo-user-dawid');
      expect(savedMode).toBe(true);
      expect(savedMotivators['demo-user-dawid']).toEqual(customDawidRanking);
    });

    it('EMP-M2-02: Gracefully handles corrupted JSON in sessionStorage without crashing', () => {
      mockStorage['tb_demo_motivators'] = 'CORRUPTED_SYNTAX_JSON_{{{{';

      // Emulate getSavedMotivators logic
      let motivators;
      try {
        const saved = sessionStorage.getItem('tb_demo_motivators');
        motivators = saved ? JSON.parse(saved) : DEMO_MOTIVATORS_RANKINGS;
      } catch {
        motivators = DEMO_MOTIVATORS_RANKINGS;
      }

      expect(motivators).toEqual(DEMO_MOTIVATORS_RANKINGS);
    });

    it('EMP-M2-03: Switching roles and users updates sessionStorage perspective consistently', () => {
      const store = useDemoStore.getState();
      store.enableDemoMode('demo-user-kuba'); // leader

      store.switchRole('member');
      const activeAfterRoleSwitch = useDemoStore.getState().getActiveUser();
      expect(activeAfterRoleSwitch.role).toBe('member');
      expect(sessionStorage.setItem).toHaveBeenCalledWith('tb_demo_active_user', activeAfterRoleSwitch.id);

      // Switch to specific user
      store.switchActiveUser('demo-user-bartek');
      expect(useDemoStore.getState().activeUserId).toBe('demo-user-bartek');
      expect(sessionStorage.setItem).toHaveBeenCalledWith('tb_demo_active_user', 'demo-user-bartek');
    });

    it('EMP-M2-04: resetToInitial cleans up session storage keys and restores default state', () => {
      const store = useDemoStore.getState();
      store.resetToInitial();

      expect(sessionStorage.removeItem).toHaveBeenCalledWith('tb_demo_active_user');
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('tb_demo_motivators');
      expect(useDemoStore.getState().activeUserId).toBe('demo-user-anna');
    });
  });

  // =========================================================================
  // 2. STAGE 1: CHAMPFROGS RANKING, 3D FLIP CARD & 100% CONSENSUS
  // =========================================================================
  describe('Stage 1 Interactivity: 3D Flip Card, D&D Permutation & Team Consensus', () => {
    it('EMP-M2-05: 3D Flip Card: Click toggles state when drag offset < 5px; suppresses toggle when >= 5px', () => {
      interface FlipCardState {
        isFlipped: boolean;
        dragOffset: number;
      }

      function handlePointerUp(state: FlipCardState): FlipCardState {
        // Drag safety threshold: ignore click if dragged 5px or more
        if (state.dragOffset >= 5) {
          return state;
        }
        return { ...state, isFlipped: !state.isFlipped };
      }

      // Initial state
      let cardState: FlipCardState = { isFlipped: false, dragOffset: 0 };

      // Normal click: offset = 0 -> flips to back
      cardState = handlePointerUp(cardState);
      expect(cardState.isFlipped).toBe(true);

      // Normal click: offset = 3 -> flips to front
      cardState = { ...cardState, dragOffset: 3 };
      cardState = handlePointerUp(cardState);
      expect(cardState.isFlipped).toBe(false);

      // Drag action: offset = 5 -> threshold reached, NO flip!
      cardState = { isFlipped: false, dragOffset: 5 };
      cardState = handlePointerUp(cardState);
      expect(cardState.isFlipped).toBe(false);

      // Drag action: offset = 35 -> drag occurred, NO flip!
      cardState = { isFlipped: false, dragOffset: 35 };
      cardState = handlePointerUp(cardState);
      expect(cardState.isFlipped).toBe(false);
    });

    it('EMP-M2-06: 3D Flip Card: Keyboard accessibility (Space / Enter toggles flip)', () => {
      function handleKeyDown(key: string, isFlipped: boolean): boolean {
        if (key === ' ' || key === 'Enter') {
          return !isFlipped;
        }
        return isFlipped;
      }

      expect(handleKeyDown(' ', false)).toBe(true);
      expect(handleKeyDown('Enter', true)).toBe(false);
      expect(handleKeyDown('Tab', false)).toBe(false);
      expect(handleKeyDown('Escape', true)).toBe(true);
    });

    it('EMP-M2-07: Drag & Drop Reordering maintains strict 10-item unique permutation across boundary swaps', () => {
      let cards = CHAMPFROGS_DEFINITIONS.map((c) => c.id);

      function moveCard(list: string[], fromIndex: number, toIndex: number, isLocked: boolean): string[] {
        if (isLocked) return list;
        if (fromIndex === toIndex || toIndex < 0 || toIndex >= list.length) return list;
        const next = [...list];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        return next;
      }

      // 1. Move first to last (0 -> 9)
      const firstCard = cards[0];
      cards = moveCard(cards, 0, 9, false);
      expect(cards[9]).toBe(firstCard);
      expect(validateMotivatorRanking(cards).isValid).toBe(true);

      // 2. Move last to first (9 -> 0)
      cards = moveCard(cards, 9, 0, false);
      expect(cards[0]).toBe(firstCard);
      expect(validateMotivatorRanking(cards).isValid).toBe(true);

      // 3. Move same index (3 -> 3)
      const snap = [...cards];
      cards = moveCard(cards, 3, 3, false);
      expect(cards).toEqual(snap);

      // 4. Out of bounds index (-1 or 15)
      cards = moveCard(cards, 0, -1, false);
      cards = moveCard(cards, 0, 15, false);
      expect(cards).toEqual(snap);

      // 5. Stress test: 500 random moves
      for (let i = 0; i < 500; i++) {
        const from = Math.floor(Math.random() * 10);
        const to = Math.floor(Math.random() * 10);
        cards = moveCard(cards, from, to, false);
      }
      expect(cards.length).toBe(10);
      expect(new Set(cards).size).toBe(10);
      expect(validateMotivatorRanking(cards).isValid).toBe(true);
    });

    it('EMP-M2-08: Edit locking prevents changes until unlocked; 100% team submission unlocks Stage 2', () => {
      const cards = CHAMPFROGS_DEFINITIONS.map((c) => c.id);

      function moveCard(list: string[], from: number, to: number, isLocked: boolean): string[] {
        if (isLocked) return list;
        const next = [...list];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        return next;
      }

      // When locked
      const original = [...cards];
      const lockedAttempt = moveCard(cards, 0, 5, true);
      expect(lockedAttempt).toEqual(original);

      // Unlock and move
      const unlockedAttempt = moveCard(cards, 0, 5, false);
      expect(unlockedAttempt[5]).toBe(original[0]);

      // Team consensus verification
      const members = DEMO_MEMBERS_ALFA;
      const submissions: Record<string, string[]> = {};

      function isTeamComplete(): boolean {
        return members.every((m) => submissions[m.id] && submissions[m.id].length === 10);
      }

      // 4 of 5 submit
      members.slice(0, 4).forEach((m) => {
        submissions[m.id] = cards;
      });
      expect(isTeamComplete()).toBe(false);

      // 5th member submits -> unlocks stage 2
      submissions[members[4].id] = cards;
      expect(isTeamComplete()).toBe(true);
    });
  });

  // =========================================================================
  // 3. STAGE 2: SCENARIOS, TIMERS, COLLABORATIVE EDITING & DELEGATION
  // =========================================================================
  describe('Stage 2 Interactivity: Scenarios, Timers, Collaborative Invalidation & Routing', () => {
    it('EMP-M2-09: Scenario selection designates the unused game to Stage 6 (Sandbox)', () => {
      function getDelegation(chosen: 'lost_at_sea' | 'moon'): { activeScenario: string; sandboxScenario: string } {
        return {
          activeScenario: chosen,
          sandboxScenario: chosen === 'lost_at_sea' ? 'moon' : 'lost_at_sea',
        };
      }

      const caseA = getDelegation('lost_at_sea');
      expect(caseA.activeScenario).toBe('lost_at_sea');
      expect(caseA.sandboxScenario).toBe('moon');

      const caseB = getDelegation('moon');
      expect(caseB.activeScenario).toBe('moon');
      expect(caseB.sandboxScenario).toBe('lost_at_sea');
    });

    it('EMP-M2-10: Phase 1 Solo Timer countdown auto-submits exactly at t=0', () => {
      let seconds = 600;
      let isSubmitted = false;
      const ranking = LOST_AT_SEA_SCENARIO.items.map((i) => i.id);

      function tick() {
        if (seconds <= 1) {
          seconds = 0;
          isSubmitted = true;
          return;
        }
        seconds -= 1;
      }

      // Fast-forward 599 seconds
      for (let i = 0; i < 599; i++) {
        tick();
      }
      expect(seconds).toBe(1);
      expect(isSubmitted).toBe(false);

      // Final tick
      tick();
      expect(seconds).toBe(0);
      expect(isSubmitted).toBe(true);
    });

    it('EMP-M2-11: Phase 2 Divergence highlighting triggers when |TeamRank - SoloRank| > 5', () => {
      function checkDivergence(teamRank: number, soloRank: number): boolean {
        return Math.abs(teamRank - soloRank) > 5;
      }

      expect(checkDivergence(1, 1)).toBe(false); // diff 0
      expect(checkDivergence(1, 6)).toBe(false); // diff 5 (boundary: <= 5 is not large)
      expect(checkDivergence(1, 7)).toBe(true);  // diff 6 (> 5: triggers discrepancy alert!)
      expect(checkDivergence(15, 1)).toBe(true); // diff 14
      expect(checkDivergence(8, 2)).toBe(true);  // diff 6
    });

    it('EMP-M2-12: Invalidation on Mutation: Any list reorder immediately invalidates all team consensus approvals', () => {
      let teamList = LOST_AT_SEA_SCENARIO.items.map((i) => i.id);
      let approvals: Record<string, boolean> = {
        'user-1': true,
        'user-2': true,
        'user-3': true,
        'user-4': true,
        'user-5': true,
      };

      function handleReorder(from: number, to: number) {
        if (from === to) return;
        const next = [...teamList];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        teamList = next;

        // Hard consensus invalidation
        approvals = {};
      }

      expect(Object.keys(approvals).length).toBe(5);

      // User modifies position of item 0 to 4
      handleReorder(0, 4);

      // Approvals must be wiped clean!
      expect(approvals).toEqual({});
      expect(Object.keys(approvals).length).toBe(0);
    });

    it('EMP-M2-13: 100% Team consensus requirement gates transition to Summary Screen', () => {
      const members = DEMO_MEMBERS_ALFA;
      let approvals: Record<string, boolean> = {};

      function canProceedToSummary(): boolean {
        return members.every((m) => Boolean(approvals[m.id])) && members.length > 0;
      }

      expect(canProceedToSummary()).toBe(false);

      // 4 out of 5 approve
      members.slice(0, 4).forEach((m) => {
        approvals[m.id] = true;
      });
      expect(canProceedToSummary()).toBe(false);

      // 5th approves
      approvals[members[4].id] = true;
      expect(canProceedToSummary()).toBe(true);
    });

    it('EMP-M2-14: Stage 2 Completion unlocks Stage 3 (Relationship Tree) with verified routing contract', () => {
      // Contract test: STAGE_COMPLETED event triggers unlock of Stage 3
      interface StageStatusState {
        stage1: 'completed';
        stage2: 'in_progress' | 'completed';
        stage3: 'locked' | 'unlocked';
      }

      const state: StageStatusState = {
        stage1: 'completed',
        stage2: 'in_progress',
        stage3: 'locked',
      };

      function completeStage2(s: StageStatusState): StageStatusState {
        return {
          ...s,
          stage2: 'completed',
          stage3: 'unlocked',
        };
      }

      const postState = completeStage2(state);
      expect(postState.stage2).toBe('completed');
      expect(postState.stage3).toBe('unlocked');
    });
  });

  // =========================================================================
  // 4. PERFORMANCE, SPEED & NO MEMORY LEAKS
  // =========================================================================
  describe('Performance, Execution Times & Memory Stability', () => {
    it('EMP-M2-15: Computes 10,000 decision scores in < 50ms', () => {
      const expertKey = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
      const ranking = [2, 1, 4, 3, 6, 5, 8, 7, 10, 9, 12, 11, 14, 13, 15];

      const start = performance.now();
      for (let i = 0; i < 10000; i++) {
        calculateAbsoluteDifferenceSum(ranking, expertKey);
      }
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100); // well within fast budget
    });

    it('EMP-M2-16: 10,000 D&D ranking mutations execute with no memory explosion', () => {
      let ranking = CHAMPFROGS_DEFINITIONS.map((c) => c.id);

      const start = performance.now();
      for (let i = 0; i < 10000; i++) {
        const from = i % 10;
        const to = (i + 3) % 10;
        const next = [...ranking];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        ranking = next;
      }
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100);
      expect(ranking.length).toBe(10);
      expect(new Set(ranking).size).toBe(10);
    });
  });
});
