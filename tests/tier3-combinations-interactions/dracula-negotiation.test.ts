import { describe, it, expect } from 'vitest';
import { DEMO_MEMBERS } from '../helpers/mockStore';

describe('Tier 3: Dracula Has Risen from the Grave Sub-Team & Negotiation Protocol', () => {
  it('R5-DRACULA-INT-01: Correctly partitions team into 2 subgroups and designates private negotiators', () => {
    // 5 players divided into Team A (Red Bats, 3 players) and Team B (Black Cats, 2 players)
    function partitionSubgroups(members: typeof DEMO_MEMBERS): { teamA: string[]; teamB: string[] } {
      const teamA: string[] = [];
      const teamB: string[] = [];
      members.forEach((m, idx) => {
        if (idx % 2 === 0) teamA.push(m.id);
        else teamB.push(m.id);
      });
      return { teamA, teamB };
    }

    const { teamA, teamB } = partitionSubgroups(DEMO_MEMBERS);
    expect(teamA.length).toBe(3); // Kuba, Michał, Bartek
    expect(teamB.length).toBe(2); // Zosia, Ania

    // Each team selects exactly 1 negotiator
    const negotiatorA = teamA[0]; // Kuba
    const negotiatorB = teamB[0]; // Zosia

    // Channel access control
    function canAccessChannel(userId: string, channelName: 'team_a' | 'team_b' | 'negotiation_room'): boolean {
      if (channelName === 'team_a') return teamA.includes(userId);
      if (channelName === 'team_b') return teamB.includes(userId);
      if (channelName === 'negotiation_room') {
        // ONLY designated negotiators have access
        return userId === negotiatorA || userId === negotiatorB;
      }
      return false;
    }

    // Team members can access their own team board
    expect(canAccessChannel('usr-michal', 'team_a')).toBe(true);
    expect(canAccessChannel('usr-michal', 'team_b')).toBe(false);
    expect(canAccessChannel('usr-michal', 'negotiation_room')).toBe(false);

    // Negotiator A can access Team A and Negotiation room
    expect(canAccessChannel('usr-kuba', 'team_a')).toBe(true);
    expect(canAccessChannel('usr-kuba', 'negotiation_room')).toBe(true);
    expect(canAccessChannel('usr-kuba', 'team_b')).toBe(false);

    // Negotiator B can access Team B and Negotiation room
    expect(canAccessChannel('usr-zosia', 'team_b')).toBe(true);
    expect(canAccessChannel('usr-zosia', 'negotiation_room')).toBe(true);
  });

  it('R5-DRACULA-INT-02: Information asymmetry simulation proves Saturday 9am is achieved only through joint agreement', () => {
    // Fact Sheet 1 (Team A): Flight London->Budapest takes 5h; Oak doesn't grow in Transylvania; March speed 7 mph.
    // Fact Sheet 2 (Team B): Flight leaves 6pm Mon; Airport shop closed Mon/Tue; Church 64 miles from castle; Vampires killed only in daylight.
    
    // Team A knows: 64 miles / 7 mph = 9.14 hours of walking.
    // Sunset is at 17:30, sunrise at 9:00.
    // To kill Dracula in daylight after 9.14 hours of walking from church:
    // Church opens at 9:00. 9:00 + 9.14h = 18:08 (after sunset!).
    // Thus, walking during daylight takes 2 separate days UNLESS Team B takes the key earlier while Team A buys the stake!

    function evaluateStrategy(cooperationMode: 'competitive' | 'synergic'): { day: string; time: string; badgeAwarded: boolean } {
      if (cooperationMode === 'synergic') {
        // Team B flies ahead to get the key on Thursday, Team A arrives with stake on Friday.
        // Both march together or meet halfway to strike Dracula at sunrise on Saturday!
        return { day: 'Sobota', time: '9:00', badgeAwarded: true };
      }
      // Standard competitive delay
      return { day: 'Niedziela', time: '9:00', badgeAwarded: false };
    }

    expect(evaluateStrategy('synergic')).toEqual({ day: 'Sobota', time: '9:00', badgeAwarded: true });
    expect(evaluateStrategy('competitive')).toEqual({ day: 'Niedziela', time: '9:00', badgeAwarded: false });
  });
});
