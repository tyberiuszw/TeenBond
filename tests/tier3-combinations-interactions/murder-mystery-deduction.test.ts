import { describe, it, expect } from 'vitest';

describe('Tier 3: Murder Mystery Deductive Matrix & Clue Elimination', () => {
  it('R5-MM-INT-01: Movie Murder Mystery clue-by-clue elimination uniquely isolates The Co-Star', () => {
    interface Character {
      name: string;
      hasCat: boolean;
      hasSpider: boolean;
      hasSnake: boolean;
      likesCameraFront: boolean;
      isClumsy: boolean;
      isOnlyChild: boolean;
    }

    const cast: Character[] = [
      { name: 'The Co-Star', hasCat: false, hasSpider: false, hasSnake: false, likesCameraFront: true, isClumsy: true, isOnlyChild: true },
      { name: 'The Writer', hasCat: true, hasSpider: false, hasSnake: false, likesCameraFront: false, isClumsy: true, isOnlyChild: false },
      { name: 'Gaffer', hasCat: false, hasSpider: true, hasSnake: false, likesCameraFront: false, isClumsy: false, isOnlyChild: false },
      { name: 'Camera Operator', hasCat: false, hasSpider: false, hasSnake: true, likesCameraFront: false, isClumsy: false, isOnlyChild: false },
      { name: 'The Main Character', hasCat: false, hasSpider: false, hasSnake: false, likesCameraFront: true, isClumsy: false, isOnlyChild: false },
      { name: 'The Antagonist', hasCat: false, hasSpider: false, hasSnake: false, likesCameraFront: true, isClumsy: false, isOnlyChild: false },
      { name: 'Reporter', hasCat: false, hasSpider: false, hasSnake: false, likesCameraFront: false, isClumsy: true, isOnlyChild: true }
    ];

    // Filter using verified clues
    const remaining = cast.filter(c => {
      if (c.hasCat) return false;          // Clue 1: Murderer has no cat
      if (c.hasSpider) return false;       // Clue 2: Murderer has no spider
      if (c.hasSnake) return false;        // Clue 3: Murderer has no snake
      if (!c.likesCameraFront) return false; // Clue 6: Murderer likes to be in front of the camera
      if (!c.isClumsy) return false;       // Clue 8: Murderer is clumsy
      if (!c.isOnlyChild) return false;    // Clue 15: Murderer is an only child
      return true;
    });

    expect(remaining.length).toBe(1);
    expect(remaining[0].name).toBe('The Co-Star');
  });

  it('R5-MM-INT-02: TechStream mystery deduction validates Bob Hartley and sword through secret door', () => {
    interface TechStreamSuspect {
      name: string;
      woreBlue: boolean;
      hadSecretDoorAccess: boolean;
      motive: 'charity_profits_clash' | 'jealousy' | 'none';
    }

    const suspects: TechStreamSuspect[] = [
      { name: 'Bob Hartley', woreBlue: true, hadSecretDoorAccess: true, motive: 'charity_profits_clash' },
      { name: 'Karen Mulligan', woreBlue: true, hadSecretDoorAccess: false, motive: 'jealousy' },
      { name: 'David Johnson', woreBlue: true, hadSecretDoorAccess: false, motive: 'none' },
      { name: 'Susan Johnson', woreBlue: false, hadSecretDoorAccess: false, motive: 'none' },
      { name: 'Lawyer', woreBlue: false, hadSecretDoorAccess: false, motive: 'none' }
    ];

    // Clues identify:
    // - Blue fabric scrap found in locked study (woreBlue === true)
    // - James was killed with locked doors; secret door leads from bedroom to study (hadSecretDoorAccess === true)
    // - Phone call revealed Bob opposed charity conversion to preserve profits
    const killer = suspects.find(s => s.woreBlue && s.hadSecretDoorAccess && s.motive === 'charity_profits_clash');
    expect(killer).toBeDefined();
    expect(killer?.name).toBe('Bob Hartley');
  });
});
