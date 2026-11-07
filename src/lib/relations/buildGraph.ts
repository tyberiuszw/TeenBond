import { Role } from '@/types/auth';
import { PeerEvaluationAnswer } from '@/types/evaluation';
import {
  RelationshipGraphData,
  RelationshipNode,
  RelationshipEdge,
} from '@/types/relationship';
import {
  calculatePairwiseWeight,
  determineEdgeStyle,
} from './relationshipWeights';
import { calculateConstellationLayout } from './graphLayout';
import {
  aggregateDiagnostics,
  generateMemberTooltipText,
  generateTeamDiagnosticSummary,
} from './diagnosticEngine';

export interface BuildGraphOptions {
  members: {
    id: string;
    name: string;
    role: Role;
    color?: string;
    chameleonColor?: string;
  }[];
  evaluations: PeerEvaluationAnswer[];
  stage2Data?: {
    teamScore: number;
    synergyDelta: number;
    silentExpertUserId?: string;
    individualScores: Record<string, number>;
  };
  leaderRatings?: { evaluatorId: string; speechSpace: number; atmosphere: number }[];
  leaderMemberEvaluations?: Record<string, { engagement: number; openness: number }>;
  canvasWidth?: number;
  canvasHeight?: number;
}

/**
 * Builds the complete RelationshipGraphData structure:
 * - Computes constellation coordinates for nodes
 * - Computes pairwise edge weights W(A,B) and 4 style classes
 * - Executes deterministic diagnostic rule engine without AI
 * - Generates 2-3 sentence tooltips and 4 leader diagnostic cards
 */
export function buildRelationshipGraph(options: BuildGraphOptions): RelationshipGraphData {
  const {
    members,
    evaluations,
    stage2Data,
    leaderRatings,
    leaderMemberEvaluations,
    canvasWidth = 700,
    canvasHeight = 500,
  } = options;

  // 1. Constellation layout
  const positions = calculateConstellationLayout(members, canvasWidth, canvasHeight);
  const positionMap = new Map(positions.map((p) => [p.id, p]));

  // 2. Aggregate diagnostics and incoming votes
  const { memberMetrics, context } = aggregateDiagnostics({
    members,
    peerEvaluations: evaluations,
    hasCompletedStage2: !!stage2Data,
    stage2TeamScore: stage2Data?.teamScore,
    stage2SynergyDelta: stage2Data?.synergyDelta,
    stage2IndividualScores: stage2Data?.individualScores,
    silentExpertDetection: stage2Data
      ? {
          isSilentExpert: !!stage2Data.silentExpertUserId,
          silentExpertUserId: stage2Data.silentExpertUserId,
          difference: stage2Data.silentExpertUserId
            ? stage2Data.teamScore - (stage2Data.individualScores[stage2Data.silentExpertUserId] || 0)
            : 0,
        }
      : undefined,
    leaderRatings,
    leaderMemberEvaluations,
  });

  // 3. Compute pairwise edges for every unique pair of members
  const edges: RelationshipEdge[] = [];

  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const userA = members[i];
      const userB = members[j];

      const pairResult = calculatePairwiseWeight(evaluations, userA.id, userB.id);
      const styleProps = determineEdgeStyle(pairResult.weight, pairResult.chaosBetween);

      // Edge is only included if visible (hidden if weight <= 0 without chaos)
      if (styleProps.visible) {
        let description = '';
        if (styleProps.style === 'thick') {
          description = `Klasa 4 (W = +${pairResult.weight} pkt): Wyjątkowa synergia relacyjna, wzajemne zaufanie i wsparcie.`;
        } else if (styleProps.style === 'medium') {
          description = `Klasa 3 (W = +${pairResult.weight} pkt): Solidna, harmonijna współpraca strategiczna i organizacyjna.`;
        } else if (styleProps.style === 'thin') {
          description = `Klasa 2 (W = +${pairResult.weight} pkt): Rozwijające się porozumienie i kontakt zadaniowy.`;
        } else {
          description = `Klasa 1 (W = ${pairResult.weight} pkt): Wzajemne napięcia i tarcia komunikacyjne pod presją czasu.`;
        }

        edges.push({
          id: `edge-${userA.id}-${userB.id}`,
          source: userA.id,
          target: userB.id,
          weight: pairResult.weight,
          style: styleProps.style,
          hasGlow: styleProps.hasGlow,
          strokeWidth: styleProps.strokeWidth,
          color: styleProps.color,
          description,
          visible: true,
        });
      }
    }
  }

  // 4. Assemble nodes with computed tooltips and votes
  const nodes: RelationshipNode[] = members.map((m) => {
    const pos = positionMap.get(m.id) || { x: 350, y: 250 };
    const metric = memberMetrics[m.id];
    const tooltipText = generateMemberTooltipText(metric, context);

    return {
      id: m.id,
      name: m.name,
      role: m.role,
      color: m.color || m.chameleonColor || '#3B82F6',
      x: pos.x,
      y: pos.y,
      votes: {
        cooperation: metric.votesQ1,
        listening: metric.votesQ2,
        goal: metric.votesQ3,
        chaos: metric.votesQ4,
      },
      tooltipText,
      leaderRating: metric.leaderRating
        ? {
            engagement: metric.leaderRating.engagement,
            openness: metric.leaderRating.openness,
            space: context.leaderRatings.avgSpace,
            atmosphere: context.leaderRatings.avgAtmosphere,
          }
        : undefined,
    };
  });

  // 5. Generate 4 diagnostic summary cards
  const diagnosticSummary = generateTeamDiagnosticSummary(memberMetrics, edges, context);

  return {
    nodes,
    edges,
    diagnosticSummary,
  };
}
