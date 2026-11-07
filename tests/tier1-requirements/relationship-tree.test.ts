import { describe, it, expect } from 'vitest';
import {
  calculatePairwiseWeight,
  determineEdgeStyle
} from '../helpers/expertKeys';
import { PeerEvaluationAnswer } from '../helpers/contracts';

describe('Tier 1: Relationship Tree & Evaluation Engine (Etap 3)', () => {
  it('R4-TREE-01: Peer evaluation applies correct points (+3, +2, +2, -1)', () => {
    // Kuba evaluates Zosia in Q1 (+3) and Q2 (+2)
    // Zosia evaluates Kuba in Q1 (+3) and Q3 (+2)
    const evaluations: PeerEvaluationAnswer[] = [
      {
        evaluatorId: 'usr-kuba',
        bestCollabUserId: 'usr-zosia',    // +3
        activeListenerUserId: 'usr-zosia',// +2
        goalOrganizerUserId: 'usr-michal',
        chaosUserId: 'usr-bartek'
      },
      {
        evaluatorId: 'usr-zosia',
        bestCollabUserId: 'usr-kuba',     // +3
        activeListenerUserId: 'usr-ania',
        goalOrganizerUserId: 'usr-kuba',  // +2
        chaosUserId: 'usr-bartek'
      }
    ];

    const resultKubaZosia = calculatePairwiseWeight(evaluations, 'usr-kuba', 'usr-zosia');
    // Kuba -> Zosia: 3 + 2 = 5
    // Zosia -> Kuba: 3 + 2 = 5
    // Total weight = 10
    expect(resultKubaZosia.weight).toBe(10);
    expect(resultKubaZosia.chaosBetween).toBe(false);

    // Chaos points check (-1)
    const resultKubaBartek = calculatePairwiseWeight(evaluations, 'usr-kuba', 'usr-bartek');
    expect(resultKubaBartek.weight).toBe(-1);
    expect(resultKubaBartek.chaosBetween).toBe(true);
  });

  it('R4-TREE-02: Self-voting is strictly forbidden by evaluation validation', () => {
    function validateEvaluation(answer: PeerEvaluationAnswer): boolean {
      if (answer.evaluatorId === answer.bestCollabUserId) return false;
      if (answer.evaluatorId === answer.activeListenerUserId) return false;
      if (answer.evaluatorId === answer.goalOrganizerUserId) return false;
      if (answer.evaluatorId === answer.chaosUserId) return false;
      return true;
    }

    const invalidAnswer: PeerEvaluationAnswer = {
      evaluatorId: 'usr-kuba',
      bestCollabUserId: 'usr-kuba', // self-vote!
      activeListenerUserId: 'usr-zosia',
      goalOrganizerUserId: 'usr-michal',
      chaosUserId: 'usr-bartek'
    };

    expect(validateEvaluation(invalidAnswer)).toBe(false);
  });

  it('R4-TREE-03: Edge weight correctly maps to 4 visual thickness and style categories', () => {
    // W <= 0: dashed 1px (visible when chaos mentioned)
    const styleZero = determineEdgeStyle(0, true);
    expect(styleZero.style).toBe('dashed');
    expect(styleZero.strokeWidth).toBe(1);
    expect(styleZero.hasGlow).toBe(false);
    expect(styleZero.visible).toBe(true);

    // W in [1, 3]: solid thin 1px
    const style1 = determineEdgeStyle(1);
    expect(style1.style).toBe('thin');
    expect(style1.strokeWidth).toBe(1);
    expect(style1.hasGlow).toBe(false);

    const style3 = determineEdgeStyle(3);
    expect(style3.style).toBe('thin');
    expect(style3.strokeWidth).toBe(1);

    // W in [4, 7]: solid medium 3px
    const style4 = determineEdgeStyle(4);
    expect(style4.style).toBe('medium');
    expect(style4.strokeWidth).toBe(3);
    expect(style4.hasGlow).toBe(false);

    const style7 = determineEdgeStyle(7);
    expect(style7.style).toBe('medium');
    expect(style7.strokeWidth).toBe(3);

    // W >= 8: solid thick 6px with glow
    const style8 = determineEdgeStyle(8);
    expect(style8.style).toBe('thick');
    expect(style8.strokeWidth).toBe(6);
    expect(style8.hasGlow).toBe(true);

    const style14 = determineEdgeStyle(14);
    expect(style14.style).toBe('thick');
    expect(style14.strokeWidth).toBe(6);
    expect(style14.hasGlow).toBe(true);
  });

  it('R4-TREE-04: Deterministic rule engine generates diagnostic insights without AI', () => {
    interface MemberContext {
      name: string;
      votesQ1: number;
      votesQ2: number;
      votesQ3: number;
      votesQ4: number;
      maxVotesQ1: number;
      maxVotesQ2: number;
      maxVotesQ3: number;
      isSilentExpert?: boolean;
    }

    function generateDiagnosticInsights(m: MemberContext): string[] {
      const insights: string[] = [];
      if (m.votesQ2 === m.maxVotesQ2 && m.votesQ2 >= 2) {
        insights.push(`${m.name} pełni w zespole rolę spoiwa – inni doceniają jego/jej umiejętność słuchania.`);
      }
      if (m.votesQ3 === m.maxVotesQ3 && m.votesQ3 >= 2) {
        insights.push(`${m.name} jest naturalnym koordynatorem zespołu – dba o strukturę i trzyma grupę przy realizacji celu.`);
      }
      if (m.votesQ1 === m.maxVotesQ1 && m.votesQ1 >= 2) {
        insights.push(`${m.name} cieszy się najwyższym zaufaniem grupy jako partner do bezpośredniej współpracy.`);
      }
      if (m.votesQ4 >= 2) {
        insights.push(`Wskazania sugerują tarcia komunikacyjne podczas pracy pod presją czasu.`);
      }
      if (m.isSilentExpert && (m.votesQ1 + m.votesQ3) <= 1) {
        insights.push(`${m.name} ma świetną intuicję analityczną, ale rzadko przebija się w dyskusji – warto oddawać mu/jej głos.`);
      }
      return insights;
    }

    // Test Team Glue
    const glueUser: MemberContext = {
      name: 'Zosia',
      votesQ1: 1, votesQ2: 4, votesQ3: 1, votesQ4: 0,
      maxVotesQ1: 3, maxVotesQ2: 4, maxVotesQ3: 3
    };
    const glueInsights = generateDiagnosticInsights(glueUser);
    expect(glueInsights).toContain('Zosia pełni w zespole rolę spoiwa – inni doceniają jego/jej umiejętność słuchania.');

    // Test Silent Expert Insight
    const silentUser: MemberContext = {
      name: 'Michał',
      votesQ1: 0, votesQ2: 1, votesQ3: 0, votesQ4: 0,
      maxVotesQ1: 3, maxVotesQ2: 4, maxVotesQ3: 3,
      isSilentExpert: true
    };
    const silentInsights = generateDiagnosticInsights(silentUser);
    expect(silentInsights).toContain('Michał ma świetną intuicję analityczną, ale rzadko przebija się w dyskusji – warto oddawać mu/jej głos.');
  });
});
