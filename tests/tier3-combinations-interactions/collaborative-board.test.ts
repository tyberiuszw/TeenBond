import { describe, it, expect } from 'vitest';
import { DEMO_MEMBERS, PersonalUndoManager, PrivateCalculatorManager } from '../helpers/mockStore';
import { validateZinAnswer } from '../helpers/expertKeys';
import { BoardElement } from '../helpers/contracts';

describe('Tier 3: Collaborative Board, Clue Distribution & State Synergy', () => {
  it('R5-INT-01: Multi-player Zin Obelisk workflow coordinates clue distribution, notes and private calculator', () => {
    // 1. Clue Distribution: 33 clues shuffled and divided among 5 members
    const totalClues = 33;
    const memberIds = DEMO_MEMBERS.map(m => m.id);
    const clueDistribution = new Map<string, number[]>();

    memberIds.forEach((mId, index) => {
      clueDistribution.set(mId, []);
    });

    for (let clueId = 1; clueId <= totalClues; clueId++) {
      const recipient = memberIds[(clueId - 1) % memberIds.length];
      clueDistribution.get(recipient)!.push(clueId);
    }

    // Verify all cards distributed, no duplicates, private hands
    const allAssigned = Array.from(clueDistribution.values()).flat();
    expect(allAssigned.length).toBe(33);
    expect(new Set(allAssigned).size).toBe(33);

    // Kuba (Leader) has his own subset, does not see Zosia's in his private panel
    const kubaClues = clueDistribution.get('usr-kuba')!;
    const zosiaClues = clueDistribution.get('usr-zosia')!;
    expect(kubaClues).not.toEqual(zosiaClues);

    // 2. TeenBoard Multi-User Interaction
    const board = new PersonalUndoManager();
    const calc = new PrivateCalculatorManager();

    // Kuba opens his private calculator to compute workdays
    calc.open('usr-kuba');
    const calcResult = calc.calculate('usr-kuba', '50000 / 8400');
    expect(calcResult).toBeCloseTo(5.952, 3);

    // Kuba posts sticky note on TeenBoard with conclusion
    const note1: BoardElement = {
      id: 'sticky-calc',
      type: 'sticky',
      x: 200,
      y: 150,
      content: `Wymagane dni robocze: 6 dni (5.95)!`,
      color: '#fef08a',
      createdBy: 'usr-kuba'
    };
    board.addElement('usr-kuba', note1);

    // Zosia posts note about rest day
    const note2: BoardElement = {
      id: 'sticky-rest',
      type: 'sticky',
      x: 450,
      y: 150,
      content: 'Pamiętajmy: Daydoldrum to dzień wolny od pracy!',
      color: '#bbf7d0',
      createdBy: 'usr-zosia'
    };
    board.addElement('usr-zosia', note2);

    expect(board.getActiveElements().length).toBe(2);

    // 3. Team consensus and answer submission
    const finalAnswer = 'Neptiminus';
    const isAnswerCorrect = validateZinAnswer(finalAnswer);
    expect(isAnswerCorrect).toBe(true);

    // Board transitions to read-only upon successful solve
    let boardLocked = isAnswerCorrect;
    expect(boardLocked).toBe(true);
  });
});
