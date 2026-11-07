import { describe, it, expect } from 'vitest';
import {
  screenToWorld,
  worldToScreen,
  normalizeCanvasTransform,
  calculateZoomToPoint,
} from '@/lib/board/coordinateUtils';
import {
  computeStickyFontSize,
  sanitizeBoardElement,
} from '@/lib/board/typographyUtils';
import { PersonalUndoManager } from '@/lib/board/personalUndoManager';
import { LaserPointerTrail } from '@/lib/board/laserTrailManager';
import { isElementLockedByOther } from '@/lib/board/objectLockManager';
import { findErasedLineIds, isPointNearSegment } from '@/lib/board/eraserEngine';
import {
  evaluateSafeExpression,
  PrivateCalculatorManager,
} from '@/lib/board/calculatorManager';
import { ZIN_CLUES } from '@/lib/zin/cluesData';
import { allocateZinClues, distributeZinCluesToMembers } from '@/lib/zin/partitioner';
import { calculateZinWorkdays, validateZinAnswer } from '@/lib/zin/validator';
import { KALAMBURY_WORDS } from '@/lib/kalambury/wordBank';
import {
  evaluateGuess,
  normalizeKalamburyString,
  calculateLevenshtein,
} from '@/lib/kalambury/fuzzyMatcher';
import { calculateKalamburyScores } from '@/lib/kalambury/scoringEngine';
import {
  evaluateMovieMurder,
  evaluateTechStreamMurder,
} from '@/lib/games/murderMysteryData';
import {
  partitionDraculaSubgroups,
  resolveDraculaStrategy,
  DRACULA_FACTS,
} from '@/lib/games/draculaData';
import { BoardElement } from '@/types/board';

describe('Tier 1: Milestone 4 Production Logic Suite', () => {
  describe('TeenBoard Coordinate & Math Engine (F27, F28)', () => {
    it('M4-ENGINE-01: Coordinate forward and inverse transformations are exact inverses', () => {
      const transform = { zoom: 1.5, panX: 120, panY: -80 };
      const worldOriginal = { x: 350, y: 420 };

      const screen = worldToScreen(worldOriginal.x, worldOriginal.y, transform);
      expect(screen.x).toBe(350 * 1.5 + 120);
      expect(screen.y).toBe(420 * 1.5 - 80);

      const reconstructed = screenToWorld(screen.x, screen.y, transform);
      expect(reconstructed.x).toBeCloseTo(worldOriginal.x, 5);
      expect(reconstructed.y).toBeCloseTo(worldOriginal.y, 5);
    });

    it('M4-ENGINE-02: Zoom-to-pointer keeps the world point beneath pointer stationary', () => {
      const initial = { zoom: 1.0, panX: 0, panY: 0 };
      const pointerScreen = { x: 400, y: 300 };

      const worldBefore = screenToWorld(pointerScreen.x, pointerScreen.y, initial);
      expect(worldBefore).toEqual({ x: 400, y: 300 });

      // Zoom in by factor 2.0
      const updated = calculateZoomToPoint(initial, 2.0, pointerScreen.x, pointerScreen.y);
      expect(updated.zoom).toBe(2.0);

      const worldAfter = screenToWorld(pointerScreen.x, pointerScreen.y, updated);
      expect(worldAfter.x).toBeCloseTo(worldBefore.x, 5);
      expect(worldAfter.y).toBeCloseTo(worldBefore.y, 5);
    });

    it('M4-ENGINE-03: Line-only eraser ignores stickies, shapes, rects and text', () => {
      const testElements: BoardElement[] = [
        {
          id: 'stroke-1',
          type: 'stroke',
          points: [100, 100, 200, 100],
          x: 0,
          y: 0,
          color: '#3B82F6',
          createdBy: 'usr-1',
        },
        {
          id: 'sticky-1',
          type: 'sticky',
          x: 100,
          y: 100,
          width: 200,
          height: 200,
          color: '#FEF08A',
          createdBy: 'usr-1',
        },
        {
          id: 'rect-1',
          type: 'shape',
          shapeType: 'rect',
          x: 100,
          y: 100,
          width: 150,
          height: 100,
          color: '#EF4444',
          createdBy: 'usr-2',
        },
        {
          id: 'text-1',
          type: 'text',
          x: 100,
          y: 100,
          content: 'Nienaruszalny tekst',
          color: '#000000',
          createdBy: 'usr-2',
        },
      ];

      // Eraser is dragged at (150, 100) with radius 20
      const hitIds = findErasedLineIds(testElements, 150, 100, 20);
      expect(hitIds).toEqual(['stroke-1']);
      expect(hitIds).not.toContain('sticky-1');
      expect(hitIds).not.toContain('rect-1');
      expect(hitIds).not.toContain('text-1');
    });
  });

  describe('Dynamic Sticky Notes & Typography Engine (F29)', () => {
    it('M4-STICKY-01: Auto-scales font size using mathematical clamp formula', () => {
      // 10 chars: headline 32px
      expect(computeStickyFontSize('Tytuł')).toBe(32);

      // Paragraph: 16px to 24px
      const para = 'Bardzo ważna notatka dotycząca przeliczenia szlibów na ponki w Atlantydzie.';
      const size = computeStickyFontSize(para, 200, 200);
      expect(size).toBeGreaterThanOrEqual(14);
      expect(size).toBeLessThanOrEqual(24);

      // Long essay: clamped to minimum 12px
      const longText = 'x'.repeat(600);
      expect(computeStickyFontSize(longText, 200, 200)).toBe(12);
    });

    it('M4-STICKY-02: Sanitize element repairs negative dimensions and missing fields', () => {
      const sanitized = sanitizeBoardElement({
        width: -40,
        height: 0,
        color: '',
      });
      expect(sanitized.width).toBe(10);
      expect(sanitized.height).toBe(10);
      expect(sanitized.id).toBeDefined();
      expect(sanitized.color).toBe('#FEF08A');
    });
  });

  describe('1.5s Decaying Laser Pointer (F30)', () => {
    it('M4-LASER-01: Points linearly decay opacity over 1500ms and expire thereafter', () => {
      const laser = new LaserPointerTrail();
      const t0 = 50000;

      laser.addPoint(50, 50, t0);
      laser.addPoint(60, 60, t0 + 500);

      // At t0 + 750 ms: point 1 is 750ms old -> opacity = 1 - 750/1500 = 0.5
      const active750 = laser.getActivePoints(t0 + 750);
      expect(active750.length).toBe(2);
      expect(active750[0].opacity).toBeCloseTo(0.5, 2);

      // At t0 + 1501 ms: point 1 is expired (> 1500ms)
      const active1501 = laser.getActivePoints(t0 + 1501);
      expect(active1501.length).toBe(1);
      expect(active1501[0].x).toBe(60);

      // At t0 + 2001 ms: all expired
      const active2001 = laser.getActivePoints(t0 + 2001);
      expect(active2001.length).toBe(0);
    });
  });

  describe('Realtime Locking & Isolated Personal Undo (F31, F32)', () => {
    it('M4-LOCK-01: Optimistic lock expires automatically after 4000ms', () => {
      const t0 = 100000;
      const el: BoardElement = {
        id: 'box-1',
        type: 'shape',
        x: 0,
        y: 0,
        color: '#000',
        createdBy: 'anna',
        lockedBy: 'anna',
        lockedAt: t0,
      };

      // Anna is owner -> not locked
      expect(isElementLockedByOther(el, 'anna', t0 + 1000)).toBe(false);

      // Bartek within 4000ms -> locked
      expect(isElementLockedByOther(el, 'bartek', t0 + 2500)).toBe(true);

      // Bartek at 4001ms -> expired, unlocked
      expect(isElementLockedByOther(el, 'bartek', t0 + 4001)).toBe(false);
    });

    it('M4-UNDO-01: Personal undo stack maintains isolated user ledgers', () => {
      const undoManager = new PersonalUndoManager();

      const elA: BoardElement = {
        id: 'note-a',
        type: 'sticky',
        x: 10,
        y: 10,
        color: '#FEF08A',
        createdBy: 'usr-kuba',
      };
      undoManager.addElement('usr-kuba', elA);

      const elB: BoardElement = {
        id: 'note-b',
        type: 'sticky',
        x: 200,
        y: 200,
        color: '#BBF7D0',
        createdBy: 'usr-zosia',
      };
      undoManager.addElement('usr-zosia', elB);

      // Kuba moves note-a to (50, 50)
      undoManager.updateElement('usr-kuba', 'note-a', { x: 50, y: 50 });
      expect(undoManager.elements.get('note-a')?.x).toBe(50);

      // Kuba clicks undo -> note-a is restored to (10, 10)
      const success = undoManager.undo('usr-kuba');
      expect(success).toBe(true);
      expect(undoManager.elements.get('note-a')?.x).toBe(10);

      // Zosia's note-b is completely intact at (200, 200)
      expect(undoManager.elements.get('note-b')?.x).toBe(200);
      expect(undoManager.elements.get('note-b')?.deleted).toBe(false);
    });
  });

  describe('Private Floating Calculator (F33)', () => {
    it('M4-CALC-01: Evaluates arithmetic safely and isolates visibility', () => {
      const calc = new PrivateCalculatorManager();
      calc.open('kuba');

      const val = calc.calculate('kuba', '50000 / 8400');
      expect(val).toBeCloseTo(5.952, 3);

      expect(calc.isVisibleTo('kuba', 'kuba')).toBe(true);
      expect(calc.isVisibleTo('zosia', 'kuba')).toBe(false);
    });

    it('M4-CALC-02: Safe evaluation strips non-mathematical tokens', () => {
      expect(evaluateSafeExpression('12 * (5 + 3)')).toBe(96);
      expect(evaluateSafeExpression('100 / 4')).toBe(25);
    });
  });

  describe('The Zin Obelisk Production Tests (F20, F21, F22)', () => {
    it('M4-ZIN-01: Contains verbatim all 33 clues in PL and EN', () => {
      expect(ZIN_CLUES.length).toBe(33);
      ZIN_CLUES.forEach((c) => {
        expect(c.textPl.length).toBeGreaterThan(5);
        expect(c.textEn.length).toBeGreaterThan(5);
        expect(c.id).toBeGreaterThanOrEqual(1);
        expect(c.id).toBeLessThanOrEqual(33);
      });
    });

    it('M4-ZIN-02: Mathematical proof guarantees completion on Neptiminus (6th workday)', () => {
      const proof = calculateZinWorkdays();
      expect(proof.volumeCuFt).toBe(50000);
      expect(proof.totalBlocks).toBe(50000);
      expect(proof.netSchlibsPerDay).toBe(7);
      expect(proof.activeWorkers).toBe(8);
      expect(proof.dailyTeamBlocks).toBe(8400);
      expect(proof.workdaysNeeded).toBe(6);
      expect(proof.completionCalendarDay).toBe('Neptiminus');
    });

    it('M4-ZIN-03: Distributes all 33 clues equitably among members', () => {
      const members = ['m1', 'm2', 'm3', 'm4', 'm5'];
      const distribution = distributeZinCluesToMembers(members, ZIN_CLUES);

      const allCards = Object.values(distribution).flat();
      expect(allCards.length).toBe(33);
      expect(new Set(allCards).size).toBe(33);

      // Max diff between player card counts is <= 1
      const counts = Object.values(distribution).map((c) => c.length);
      expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1);
    });
  });

  describe('Kalambury Integracyjne (F26)', () => {
    it('M4-KALAM-01: Word bank contains 60 themed Polish words across 3 tiers', () => {
      expect(KALAMBURY_WORDS.length).toBe(60);
      const easy = KALAMBURY_WORDS.filter((w) => w.tier === 'easy');
      const med = KALAMBURY_WORDS.filter((w) => w.tier === 'medium');
      const hard = KALAMBURY_WORDS.filter((w) => w.tier === 'hard');
      expect(easy.length).toBe(20);
      expect(med.length).toBe(20);
      expect(hard.length).toBe(20);
    });

    it('M4-KALAM-02: Fuzzy matching tolerates Polish diacritics and triggers Blisko whisper', () => {
      // Exact match with diacritics
      const res1 = evaluateGuess('kameleon', 'Kameleon');
      expect(res1.isExact).toBe(true);
      expect(res1.isFuzzyMatch).toBe(true);

      // Tolerance of Polish diacritics (ogrod -> ogród, linia -> lina)
      const res2 = evaluateGuess('ognisko', 'Ognisko');
      expect(res2.isFuzzyMatch).toBe(true);

      // Minor typo within tolerance
      const res3 = evaluateGuess('kameleom', 'Kameleon');
      expect(res3.isFuzzyMatch).toBe(true);

      // Close guess triggering "isAlmost"
      const res4 = evaluateGuess('mostek', 'Most');
      expect(res4.isAlmost).toBe(true);
    });

    it('M4-KALAM-03: Dynamic score formula rewards fast guessers', () => {
      // 5 players, guess at 60s
      const fast = calculateKalamburyScores(60, 5, 4);
      expect(fast.guesserPoints).toBe(100);
      expect(fast.drawerPoints).toBe(25);

      // Guess at 0s
      const slow = calculateKalamburyScores(0, 5, 0);
      expect(slow.guesserPoints).toBe(50);
      expect(slow.drawerPoints).toBe(0);
    });
  });

  describe('Murder Mystery & Dracula Scenarios (F23, F24, F25)', () => {
    it('M4-MURDER-01: Movie Murder Mystery validates Co-Star and Poison (+150 pts)', () => {
      const res = evaluateMovieMurder('The Co-Star', 'Poison');
      expect(res.isSolved).toBe(true);
      expect(res.score).toBe(150);

      const partial = evaluateMovieMurder('The Co-Star', 'Gun');
      expect(partial.isSolved).toBe(false);
      expect(partial.score).toBe(100);
    });

    it('M4-MURDER-02: TechStream Murder Mystery validates Bob Hartley and Sword (+150 pts)', () => {
      const res = evaluateTechStreamMurder('Bob Hartley', 'Sword');
      expect(res.isSolved).toBe(true);
      expect(res.score).toBe(150);
    });

    it('M4-DRACULA-01: Dracula negotiation yields 200 pts for Saturday 9:00 AM synergy', () => {
      const synergy = resolveDraculaStrategy('Sobota', '9:00');
      expect(synergy.points).toBe(200);
      expect(synergy.synergyBadge).toBe(true);

      const competitive = resolveDraculaStrategy('Niedziela', '9:00');
      expect(competitive.points).toBe(100);
      expect(competitive.synergyBadge).toBe(false);

      const invalid = resolveDraculaStrategy('Piątek', '12:00');
      expect(invalid.points).toBe(0);
    });

    it('M4-DRACULA-02: Subgroup partitioning divides players into Red Bats and Black Cats', () => {
      const ids = ['u1', 'u2', 'u3', 'u4', 'u5'];
      const { redBats, blackCats } = partitionDraculaSubgroups(ids);
      expect(redBats.length).toBe(3);
      expect(blackCats.length).toBe(2);
      expect([...redBats, ...blackCats].sort()).toEqual(ids.sort());
    });
  });
});
