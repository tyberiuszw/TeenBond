import { describe, it, expect } from 'vitest';
import { detectSilentExpert } from '../helpers/expertKeys';
import { PeerEvaluationAnswer } from '../helpers/contracts';

describe('Tier 3: Leader Diagnostic Intelligence & Tooltip Rules', () => {
  it('R4-INT-02: Synthesizes Stage 2 decision metrics with Stage 3 peer nominations into actionable Leader advice', () => {
    // Stage 2 Decision Results
    const decisionSubmissions = [
      { userId: 'usr-kuba', name: 'Kuba', score: 35 },
      { userId: 'usr-zosia', name: 'Zosia', score: 32 },
      { userId: 'usr-michal', name: 'Michał', score: 16 }, // Silent Expert candidate (diff >= 5)
      { userId: 'usr-ania', name: 'Ania', score: 38 },
      { userId: 'usr-bartek', name: 'Bartek', score: 42 }
    ];
    const teamScore = 28;

    const silentExpertCheck = detectSilentExpert(decisionSubmissions, teamScore);
    expect(silentExpertCheck.isSilentExpert).toBe(true);
    expect(silentExpertCheck.silentExpertUserId).toBe('usr-michal');
    expect(silentExpertCheck.difference).toBe(12);

    // Stage 3 Peer Evaluations
    const peerEvaluations: PeerEvaluationAnswer[] = [
      { evaluatorId: 'usr-kuba', bestCollabUserId: 'usr-zosia', activeListenerUserId: 'usr-zosia', goalOrganizerUserId: 'usr-ania', chaosUserId: 'usr-bartek' },
      { evaluatorId: 'usr-zosia', bestCollabUserId: 'usr-kuba', activeListenerUserId: 'usr-kuba', goalOrganizerUserId: 'usr-kuba', chaosUserId: 'usr-bartek' },
      { evaluatorId: 'usr-michal', bestCollabUserId: 'usr-zosia', activeListenerUserId: 'usr-zosia', goalOrganizerUserId: 'usr-kuba', chaosUserId: 'usr-bartek' },
      { evaluatorId: 'usr-ania', bestCollabUserId: 'usr-kuba', activeListenerUserId: 'usr-zosia', goalOrganizerUserId: 'usr-kuba', chaosUserId: 'usr-bartek' },
      { evaluatorId: 'usr-bartek', bestCollabUserId: 'usr-kuba', activeListenerUserId: 'usr-zosia', goalOrganizerUserId: 'usr-ania', chaosUserId: 'usr-zosia' }
    ];

    // Compute aggregate incoming votes for each member
    interface MemberDiagnosticAggregate {
      userId: string;
      name: string;
      q1Collab: number;
      q2Listening: number;
      q3Goal: number;
      q4Chaos: number;
      isSilentExpert: boolean;
      analyticalScore: number;
    }

    const aggregates: Record<string, MemberDiagnosticAggregate> = {};
    decisionSubmissions.forEach(sub => {
      aggregates[sub.userId] = {
        userId: sub.userId,
        name: sub.name,
        q1Collab: 0,
        q2Listening: 0,
        q3Goal: 0,
        q4Chaos: 0,
        isSilentExpert: silentExpertCheck.silentExpertUserId === sub.userId,
        analyticalScore: sub.score
      };
    });

    peerEvaluations.forEach(ev => {
      if (aggregates[ev.bestCollabUserId]) aggregates[ev.bestCollabUserId].q1Collab++;
      if (aggregates[ev.activeListenerUserId]) aggregates[ev.activeListenerUserId].q2Listening++;
      if (aggregates[ev.goalOrganizerUserId]) aggregates[ev.goalOrganizerUserId].q3Goal++;
      if (aggregates[ev.chaosUserId]) aggregates[ev.chaosUserId].q4Chaos++;
    });

    function generateLeaderTooltip(member: MemberDiagnosticAggregate): string[] {
      const insights: string[] = [];
      // Rule 1: Team Glue
      if (member.q2Listening >= 3) {
        insights.push(`${member.name} pełni w zespole rolę spoiwa – inni doceniają jego/jej umiejętność słuchania.`);
      }
      // Rule 2: Silent Expert
      if (member.isSilentExpert && (member.q1Collab + member.q3Goal) <= 1) {
        insights.push(`${member.name} ma świetną intuicję analityczną, ale rzadko przebija się w dyskusji – warto oddawać mu/jej głos.`);
      }
      // Rule 3: Chaos / Friction
      if (member.q4Chaos >= 2) {
        insights.push(`Wskazania sugerują tarcia komunikacyjne podczas pracy pod presją czasu.`);
      }
      // Rule 4: Goal Coordinator
      if (member.q3Goal >= 3) {
        insights.push(`${member.name} jest naturalnym koordynatorem zespołu – dba o strukturę i trzyma grupę przy realizacji celu.`);
      }
      return insights;
    }

    // Diagnostic validation for Michał (Silent Expert)
    const michalInsights = generateLeaderTooltip(aggregates['usr-michal']);
    expect(michalInsights).toContain('Michał ma świetną intuicję analityczną, ale rzadko przebija się w dyskusji – warto oddawać mu/jej głos.');

    // Diagnostic validation for Zosia (Team Glue)
    const zosiaInsights = generateLeaderTooltip(aggregates['usr-zosia']);
    expect(zosiaInsights).toContain('Zosia pełni w zespole rolę spoiwa – inni doceniają jego/jej umiejętność słuchania.');

    // Diagnostic validation for Bartek (Friction under time pressure)
    const bartekInsights = generateLeaderTooltip(aggregates['usr-bartek']);
    expect(bartekInsights).toContain('Wskazania sugerują tarcia komunikacyjne podczas pracy pod presją czasu.');
  });
});
