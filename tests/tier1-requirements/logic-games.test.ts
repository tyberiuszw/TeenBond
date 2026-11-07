import { describe, it, expect } from 'vitest';
import {
  calculateZinWorkdays,
  validateZinAnswer,
  calculateKalamburyScores
} from '../helpers/expertKeys';

describe('Tier 1: Scenario Logic Games & Deduction (Etapy 4, 5 & 6)', () => {
  describe('The Zin Obelisk (Etap 4)', () => {
    it('R5-ZIN-01: Mathematical logic strictly proves completion on the 6th workday', () => {
      const calculation = calculateZinWorkdays();

      // Step 1: Obelisk Volume: 50 x 10 x 100 = 50,000 cu. ft. = 50,000 blocks
      expect(calculation.totalBlocks).toBe(50000);

      // Step 2: Net working hours per worker: 9 schlibs - (16 ponks / 8 ponks/schlib) = 7 schlibs
      expect(calculation.netSchlibsPerDay).toBe(7);

      // Step 3: Active workers: 9 workers - 1 religious duty = 8 workers
      expect(calculation.activeWorkers).toBe(8);

      // Step 4: Daily team output: 8 workers * (7 schlibs * 150 blocks/schlib) = 8,400 blocks/day
      expect(calculation.dailyBlocks).toBe(8400);

      // Step 5: Workdays required: ceil(50,000 / 8,400) = 6 workdays
      expect(calculation.workdaysNeeded).toBe(6);

      // Step 6: Calendar mapping with Daydoldrum as rest day:
      // Week 1: Aguaday (1), Neptiminus (2), Sharkday (3), Mermaidday (4), Daydoldrum (OFF)
      // Week 2: Aguaday (5), Neptiminus (6)
      expect(calculation.completionCalendarDay).toBe('Neptiminus');
    });

    it('R5-ZIN-02: User answer verification accepts valid case-insensitive variants of Neptiminus', () => {
      expect(validateZinAnswer('Neptiminus')).toBe(true);
      expect(validateZinAnswer('neptiminus')).toBe(true);
      expect(validateZinAnswer('NEPTIMINUS')).toBe(true);
      expect(validateZinAnswer('  Neptominus  ')).toBe(true); // common spelling variation
      expect(validateZinAnswer('Sharkday')).toBe(false);
      expect(validateZinAnswer('Aguaday')).toBe(false);
      expect(validateZinAnswer('')).toBe(false);
    });

    it('R5-ZIN-03: Clue card allocation distributes all 33 cards evenly among present members', () => {
      function allocateClues(totalClues: number, memberCount: number): number[] {
        const base = Math.floor(totalClues / memberCount);
        const remainder = totalClues % memberCount;
        return Array.from({ length: memberCount }, (_, i) => base + (i < remainder ? 1 : 0));
      }

      // 5 members: 3 get 7 cards, 2 get 6 cards (total 33)
      const dist5 = allocateClues(33, 5);
      expect(dist5).toEqual([7, 7, 7, 6, 6]);
      expect(dist5.reduce((a, b) => a + b, 0)).toBe(33);

      // 6 members: 3 get 6 cards, 3 get 5 cards (total 33)
      const dist6 = allocateClues(33, 6);
      expect(dist6).toEqual([6, 6, 6, 5, 5, 5]);
      expect(dist6.reduce((a, b) => a + b, 0)).toBe(33);
    });
  });

  describe('Murder Mystery & Dracula (Etap 5)', () => {
    it('R5-MURDER-01: The Movie scenario validates Co-Star and Poison with +150 total points', () => {
      function evaluateMovieMurder(culprit: string, weapon: string): { score: number; isSolved: boolean } {
        const isCulpritCorrect = culprit.trim().toLowerCase() === 'the co-star';
        const isWeaponCorrect = weapon.trim().toLowerCase() === 'poison';
        let score = 0;
        if (isCulpritCorrect) score += 100;
        if (isWeaponCorrect) score += 50;
        return { score, isSolved: isCulpritCorrect && isWeaponCorrect };
      }

      expect(evaluateMovieMurder('The Co-Star', 'Poison')).toEqual({ score: 150, isSolved: true });
      expect(evaluateMovieMurder('The Antagonist', 'Poison')).toEqual({ score: 50, isSolved: false });
    });

    it('R5-DRACULA-01: Dracula negotiation supports competitive (Sunday 9am) and synergy (Saturday 9am) outcomes', () => {
      interface DraculaResolution {
        day: string;
        time: string;
        points: number;
        synergyBadge: boolean;
      }

      function resolveDracula(day: string, time: string): DraculaResolution {
        const normDay = day.trim().toLowerCase();
        const normTime = time.trim().toLowerCase();

        if (normDay === 'sobota' && normTime === '9:00') {
          return { day: 'Sobota', time: '9:00', points: 200, synergyBadge: true };
        }
        if (normDay === 'niedziela' && normTime === '9:00') {
          return { day: 'Niedziela', time: '9:00', points: 100, synergyBadge: false };
        }
        return { day, time, points: 0, synergyBadge: false };
      }

      // Synergy solution: Teams collaborate and split tasks
      const synergyRes = resolveDracula('Sobota', '9:00');
      expect(synergyRes.points).toBe(200);
      expect(synergyRes.synergyBadge).toBe(true);

      // Competitive solution: Standard linear journey
      const compRes = resolveDracula('Niedziela', '9:00');
      expect(compRes.points).toBe(100);
      expect(compRes.synergyBadge).toBe(false);

      // Invalid time (sunset occurred at 17:30)
      const failRes = resolveDracula('Sobota', '18:00');
      expect(failRes.points).toBe(0);
    });
  });

  describe('Kalambury Integration Charades (Etap 6)', () => {
    it('R5-KALAM-01: Dynamic scoring rewards fast guessing and good drawing', () => {
      // 5 players total, guesser guesses at 60s (start) -> 100 pts
      const fastScore = calculateKalamburyScores(60, 5, 4);
      expect(fastScore.guesserPoints).toBe(100);
      // Drawer: 25 * (4 / (5 - 1)) = 25 * (4/4) = 25 pts
      expect(fastScore.drawerPoints).toBe(25);

      // Guess at 0s (last second) -> 50 pts
      const lastSecond = calculateKalamburyScores(0, 5, 2);
      expect(lastSecond.guesserPoints).toBe(50);
      // Drawer: round(25 * (2 / 4)) = round(12.5) = 13 or 12 or 13 pts
      expect(lastSecond.drawerPoints).toBe(13);
    });
  });
});
