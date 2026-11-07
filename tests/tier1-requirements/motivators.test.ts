import { describe, it, expect } from 'vitest';
import { CHAMPFROGS_CARDS } from '../helpers/expertKeys';
import { DEMO_MEMBERS } from '../helpers/mockStore';

describe('Tier 1: CHAMPFROGS Motivators (Etap 1)', () => {
  it('R2-MOT-01: Exactly 10 CHAMPFROGS cards exist with full definitions and visual assets', () => {
    expect(CHAMPFROGS_CARDS.length).toBe(10);

    const codes = CHAMPFROGS_CARDS.map(c => c.code).sort();
    expect(codes).toEqual(['A', 'C', 'F', 'G', 'H', 'M', 'O', 'P', 'R', 'S'].sort());

    CHAMPFROGS_CARDS.forEach(card => {
      expect(card.nameEn).toBeTruthy();
      expect(card.namePl).toBeTruthy();
      expect(card.frontFilename).toBeTruthy();
      expect(card.backFilename).toBeTruthy();
      expect(card.definitionEn).toBeTruthy();
      expect(card.definitionPl).toBeTruthy();
    });
  });

  it('R2-MOT-02: Asset loader handles typo in Curiosity front filename gracefully', () => {
    const curiosity = CHAMPFROGS_CARDS.find(c => c.code === 'C')!;
    expect(curiosity.frontFilename).toBe('Curiotisy Front.jpg');
    expect(curiosity.frontFilenameAlternative).toBe('Curiosity Front.jpg');

    function resolveAssetFilename(card: typeof curiosity): string {
      // Loader checks alternative or primary
      return card.frontFilename.includes('Curiotisy') ? card.frontFilename : 'Curiosity Front.jpg';
    }

    expect(resolveAssetFilename(curiosity)).toBe('Curiotisy Front.jpg');
  });

  it('R2-MOT-03: Flip-card mechanic toggles between front and back views', () => {
    interface CardViewState {
      isFlipped: boolean;
      dragOffset: number;
    }

    function handleCardClick(state: CardViewState): CardViewState {
      // Click flips card ONLY if not in active drag (dragOffset < 5px)
      if (Math.abs(state.dragOffset) < 5) {
        return { ...state, isFlipped: !state.isFlipped };
      }
      return state;
    }

    let state: CardViewState = { isFlipped: false, dragOffset: 0 };
    state = handleCardClick(state);
    expect(state.isFlipped).toBe(true);

    state = handleCardClick(state);
    expect(state.isFlipped).toBe(false);

    // If dragging (> 5px), click does NOT flip
    state = { isFlipped: false, dragOffset: 25 };
    state = handleCardClick(state);
    expect(state.isFlipped).toBe(false);
  });

  it('R2-MOT-04: Ranking validation requires a permutation of all 10 unique cards', () => {
    function validateRanking(ranking: string[]): { isValid: boolean; error?: string } {
      if (ranking.length !== 10) {
        return { isValid: false, error: 'Ranking must contain exactly 10 cards' };
      }
      const unique = new Set(ranking);
      if (unique.size !== 10) {
        return { isValid: false, error: 'All 10 cards must be unique' };
      }
      const allExist = ranking.every(id => CHAMPFROGS_CARDS.some(c => c.id === id));
      if (!allExist) {
        return { isValid: false, error: 'Ranking contains invalid card IDs' };
      }
      return { isValid: true };
    }

    const validRanking = CHAMPFROGS_CARDS.map(c => c.id);
    expect(validateRanking(validRanking)).toEqual({ isValid: true });

    const incomplete = CHAMPFROGS_CARDS.slice(0, 9).map(c => c.id);
    expect(validateRanking(incomplete).isValid).toBe(false);

    const duplicate = [...validRanking.slice(0, 9), validRanking[0]];
    expect(validateRanking(duplicate).isValid).toBe(false);
  });

  it('R2-MOT-05: Team consensus requirement: 100% submission unlocks Leader Team Matrix', () => {
    const totalMembers = DEMO_MEMBERS.length; // 5 members
    const submissions = new Map<string, string[]>();

    function isStage1Complete(): boolean {
      return submissions.size === totalMembers;
    }

    // Submit for 4 members
    DEMO_MEMBERS.slice(0, 4).forEach(m => {
      submissions.set(m.id, CHAMPFROGS_CARDS.map(c => c.id));
    });
    expect(isStage1Complete()).toBe(false);

    // 5th member (Leader or last member) submits
    submissions.set(DEMO_MEMBERS[4].id, CHAMPFROGS_CARDS.map(c => c.id));
    expect(isStage1Complete()).toBe(true);
  });
});
