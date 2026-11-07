import { Role } from '@/types/auth';
import { PeerEvaluationAnswer } from '@/types/evaluation';
import {
  MemberDiagnosticMetric,
  TeamDiagnosticSummary,
  RelationshipEdge,
} from '@/types/relationship';

export interface DiagnosticInputContext {
  hasCompletedStage2: boolean;
  stage2TeamScore?: number;
  stage2SynergyDelta?: number;
  stage2IndividualScores?: Record<string, number>;
  silentExpertDetection?: {
    isSilentExpert: boolean;
    silentExpertUserId?: string;
    difference: number;
  };
  peerEvaluations: PeerEvaluationAnswer[];
  leaderRatings?: {
    evaluatorId: string;
    speechSpace: number; // 1-5
    atmosphere: number;  // 1-5
  }[];
  leaderMemberEvaluations?: Record<string, { engagement: number; openness: number }>;
  members: {
    id: string;
    name: string;
    role: Role;
    color?: string;
    chameleonColor?: string;
  }[];
}

export interface DiagnosticEngineContext {
  hasCompletedStage2: boolean;
  stage2TeamScore?: number;
  stage2SynergyDelta?: number;
  silentExpertUserId?: string;
  maxVotesQ1: number;
  maxVotesQ2: number;
  maxVotesQ3: number;
  maxVotesQ4: number;
  leaderRatings: {
    avgSpace: number;
    avgAtmosphere: number;
  };
}

/**
 * Aggregates evaluations and computes group metrics and context.
 */
export function aggregateDiagnostics(
  input: DiagnosticInputContext
): {
  memberMetrics: Record<string, MemberDiagnosticMetric>;
  context: DiagnosticEngineContext;
} {
  const {
    members,
    peerEvaluations,
    silentExpertDetection,
    stage2TeamScore,
    stage2SynergyDelta,
    stage2IndividualScores,
    leaderMemberEvaluations,
    leaderRatings,
  } = input;

  const memberMetrics: Record<string, MemberDiagnosticMetric> = {};

  members.forEach((m) => {
    memberMetrics[m.id] = {
      userId: m.id,
      name: m.name,
      role: m.role,
      color: m.color || m.chameleonColor || '#3B82F6',
      votesQ1: 0,
      votesQ2: 0,
      votesQ3: 0,
      votesQ4: 0,
      totalIncoming: 0,
      isSilentExpert: silentExpertDetection?.silentExpertUserId === m.id,
      stage2IndividualScore: stage2IndividualScores?.[m.id],
      leaderRating: leaderMemberEvaluations?.[m.id],
    };
  });

  // Tally incoming nominations
  peerEvaluations.forEach((ev) => {
    if (memberMetrics[ev.bestCollabUserId]) {
      memberMetrics[ev.bestCollabUserId].votesQ1++;
      memberMetrics[ev.bestCollabUserId].totalIncoming++;
    }
    if (memberMetrics[ev.activeListenerUserId]) {
      memberMetrics[ev.activeListenerUserId].votesQ2++;
      memberMetrics[ev.activeListenerUserId].totalIncoming++;
    }
    if (memberMetrics[ev.goalOrganizerUserId]) {
      memberMetrics[ev.goalOrganizerUserId].votesQ3++;
      memberMetrics[ev.goalOrganizerUserId].totalIncoming++;
    }
    if (memberMetrics[ev.chaosUserId]) {
      memberMetrics[ev.chaosUserId].votesQ4++;
      memberMetrics[ev.chaosUserId].totalIncoming++;
    }
  });

  // Find max votes in each category
  let maxVotesQ1 = 0;
  let maxVotesQ2 = 0;
  let maxVotesQ3 = 0;
  let maxVotesQ4 = 0;

  Object.values(memberMetrics).forEach((m) => {
    if (m.votesQ1 > maxVotesQ1) maxVotesQ1 = m.votesQ1;
    if (m.votesQ2 > maxVotesQ2) maxVotesQ2 = m.votesQ2;
    if (m.votesQ3 > maxVotesQ3) maxVotesQ3 = m.votesQ3;
    if (m.votesQ4 > maxVotesQ4) maxVotesQ4 = m.votesQ4;
  });

  // Leader ratings averages
  let avgSpace = 4.2;
  let avgAtmosphere = 4.4;
  if (leaderRatings && leaderRatings.length > 0) {
    avgSpace =
      leaderRatings.reduce((sum, r) => sum + r.speechSpace, 0) / leaderRatings.length;
    avgAtmosphere =
      leaderRatings.reduce((sum, r) => sum + r.atmosphere, 0) / leaderRatings.length;
  }

  const context: DiagnosticEngineContext = {
    hasCompletedStage2: input.hasCompletedStage2,
    stage2TeamScore,
    stage2SynergyDelta,
    silentExpertUserId: silentExpertDetection?.silentExpertUserId,
    maxVotesQ1,
    maxVotesQ2,
    maxVotesQ3,
    maxVotesQ4,
    leaderRatings: { avgSpace, avgAtmosphere },
  };

  return { memberMetrics, context };
}

/**
 * Deterministically generates a 2-3 sentence diagnostic tooltip for a team member node.
 * Strictly rule-based without AI.
 */
export function generateMemberTooltipText(
  member: MemberDiagnosticMetric,
  context: DiagnosticEngineContext
): string {
  const insights: string[] = [];

  // When node is Leader
  if (member.role === 'leader') {
    insights.push('Rola: Założyciel i Lider Zespołu.');
    const { avgSpace, avgAtmosphere } = context.leaderRatings;

    if (avgSpace >= 4.0 && avgAtmosphere >= 4.0) {
      insights.push(
        `Zespół czuje się w pełni wysłuchany i docenia bezpieczną, motywującą atmosferę (Przestrzeń: ${avgSpace.toFixed(1)}/5, Atmosfera: ${avgAtmosphere.toFixed(1)}/5).`
      );
    } else {
      if (avgSpace < 3.0) {
        insights.push(
          `Uczestnicy sygnalizują potrzebę większej przestrzeni na własne pomysły i dyskusję (Przestrzeń: ${avgSpace.toFixed(1)}/5).`
        );
      }
      if (avgAtmosphere < 3.0) {
        insights.push(
          `Warto zwrócić uwagę na obniżenie poziomu stresu i napięć podczas zadań z presją czasu (Atmosfera: ${avgAtmosphere.toFixed(1)}/5).`
        );
      }
    }

    // Leader direct collaboration trust in Q1
    if (member.votesQ1 === context.maxVotesQ1 && member.votesQ1 >= 2) {
      insights.push('Filar bezpośredniej współpracy – cieszy się najwyższym zaufaniem grupy.');
    }

    return insights.slice(0, 3).join(' ');
  }

  // Rule 1: Team Glue (Q2 Listening)
  if (member.votesQ2 === context.maxVotesQ2 && member.votesQ2 >= 2) {
    insights.push(
      `${member.name} pełni w zespole rolę spoiwa – inni doceniają jego/jej umiejętność słuchania.`
    );
  }

  // Rule 2: Goal Coordinator (Q3 Goal)
  if (member.votesQ3 === context.maxVotesQ3 && member.votesQ3 >= 2) {
    insights.push(
      `${member.name} jest naturalnym koordynatorem zespołu – dba o strukturę i trzyma grupę przy realizacji celu.`
    );
  }

  // Rule 3: Collaboration Pillar (Q1 Collaboration)
  if (
    member.votesQ1 === context.maxVotesQ1 &&
    member.votesQ1 >= 2 &&
    !insights.some((i) => i.includes('rolę spoiwa'))
  ) {
    insights.push(
      `${member.name} cieszy się najwyższym zaufaniem grupy jako partner do bezpośredniej współpracy.`
    );
  }

  // Rule 4: Chaos / Tension Indicator (Q4 Chaos)
  if (member.votesQ4 >= 2) {
    insights.push('Wskazania sugerują tarcia komunikacyjne podczas pracy pod presją czasu.');
  }

  // Rule 5: Silent Expert (High solo score in Stage 2 + low Q1 & Q3 nominations)
  if (member.isSilentExpert && member.votesQ1 + member.votesQ3 <= 1) {
    insights.push(
      `${member.name} ma świetną intuicję analityczną, ale rzadko przebija się w dyskusji – warto oddawać mu/jej głos.`
    );
  }

  // Rule 6: Peripheral Member (0 votes received)
  if (member.totalIncoming === 0) {
    insights.push(
      `${member.name} pozostaje na uboczu dynamiki zespołowej – warto zaangażować go/ją w mniejszych podgrupach.`
    );
  }

  // Rule 7: Leader assessment footnote
  if (member.leaderRating) {
    insights.push(
      `Twoja ocena Lidera: Zaangażowanie ${member.leaderRating.engagement}/5 | Otwartość ${member.leaderRating.openness}/5.`
    );
  }

  // Fallback if no specific rule matched
  if (insights.length === 0) {
    insights.push(`${member.name} aktywnie uczestniczy w działaniach zespołu i wspiera realizację celów.`);
  }

  return insights.slice(0, 3).join(' ');
}

/**
 * Generates the 4 main diagnostic summary cards for the Leader's dashboard.
 */
export function generateTeamDiagnosticSummary(
  memberMetrics: Record<string, MemberDiagnosticMetric>,
  edges: RelationshipEdge[],
  context: DiagnosticEngineContext
): TeamDiagnosticSummary {
  const members = Object.values(memberMetrics);

  // Card 1: Synergy
  let synergyText = 'Scenariusz decyzyjny w trakcie realizacji.';
  if (context.hasCompletedStage2 && context.stage2SynergyDelta !== undefined) {
    const delta = context.stage2SynergyDelta;
    if (delta > 0) {
      synergyText = `Twój zespół osiągnął pozytywny Efekt Synergii (+${delta.toFixed(1)} pkt) w scenariuszu decyzyjnym. Wspólny rezultat (${context.stage2TeamScore} pkt) przewyższył średnią wiedzę jednostkową.`;
    } else {
      synergyText = `Zespół uzyskał ujemny efekt synergii (${delta.toFixed(1)} pkt). Faza zespołowa nie wykorzystała wiedzy najlepiej zorientowanych jednostek.`;
    }
  }

  // Card 2: Silent Expert
  let expertText =
    'Nie wykryto wyraźnego Cichego Eksperta – wiedza w zespole była rozłożona równomiernie.';
  const silentMember = members.find((m) => m.isSilentExpert);
  if (silentMember) {
    const scoreText = silentMember.stage2IndividualScore !== undefined ? ` ${silentMember.stage2IndividualScore} pkt` : ' wysoki wynik';
    expertText = `Wykryto Cichego Eksperta: ${silentMember.name} zdobył imponujący wynik${scoreText} w fazie indywidualnej. Zadbaj o bezpośrednie angażowanie go podczas dyskusji.`;
  }

  // Card 3: Trust & Empathy Pillars
  const glueMember = members.find((m) => m.votesQ2 === context.maxVotesQ2 && m.votesQ2 >= 2);
  const collabMember = members.find((m) => m.votesQ1 === context.maxVotesQ1 && m.votesQ1 >= 2);

  let cohesionText = 'Relacje w zespole są na wstępnym etapie budowania.';
  if (glueMember && collabMember && glueMember.userId !== collabMember.userId) {
    cohesionText = `Filarami zaufania i komunikacji w zespole są ${collabMember.name} (filar współpracy) oraz ${glueMember.name} (spoiwo empatii i aktywnego słuchania z ${glueMember.votesQ2} wskazaniami).`;
  } else if (glueMember) {
    cohesionText = `${glueMember.name} pełni kluczową rolę spoiwa zespołu, wyróżniając się aktywnym słuchaniem (${glueMember.votesQ2} wskazań).`;
  } else if (collabMember) {
    cohesionText = `${collabMember.name} cieszy się najwyższym zaufaniem grupy jako filar bezpośredniej współpracy.`;
  }

  // Card 4: Mediation Advice (Tensions / Chaos)
  const tensionEdge = edges.find((e) => e.weight <= 0 && e.style === 'dashed');
  let frictionText =
    'W zespole panuje wysoka harmonia – nie odnotowano istotnych napięć ani wzajemnych wskazań chaosu.';

  if (tensionEdge) {
    const memberA = memberMetrics[tensionEdge.source]?.name || 'Uczestnik A';
    const memberB = memberMetrics[tensionEdge.target]?.name || 'Uczestnik B';
    frictionText = `Zidentyfikowano punkt tarcia między ${memberA} i ${memberB} (krawędź przerywana W = ${tensionEdge.weight}). Warto zaplanować dla nich wspólne minizadanie 1-na-1.`;
  }

  return {
    leaderTitle: 'Raport Diagnostyczny Zespołu (Widok Poufny Lidera)',
    synergyText,
    expertText,
    cohesionText,
    frictionText,
  };
}
