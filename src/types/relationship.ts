import { Role } from './auth';

export type EdgeStyleClass = 'dashed' | 'thin' | 'medium' | 'thick';

export interface EdgeVisualProps {
  style: EdgeStyleClass;
  strokeWidth: number;
  hasGlow: boolean;
  visible: boolean;
  color: string;
  cssClass: string;
}

export interface PairwiseWeightResult {
  weight: number;
  mentionsAtoB: number;
  mentionsBtoA: number;
  chaosBetween: boolean;
  detailsAtoB?: {
    collab: boolean;
    listening: boolean;
    goal: boolean;
    chaos: boolean;
  };
  detailsBtoA?: {
    collab: boolean;
    listening: boolean;
    goal: boolean;
    chaos: boolean;
  };
}

export interface RelationshipNode {
  id: string;
  name: string;
  color: string;
  role: Role;
  x: number;
  y: number;
  votes: {
    cooperation: number; // Q1 (+3)
    listening: number;   // Q2 (+2)
    goal: number;        // Q3 (+2)
    chaos: number;       // Q4 (-1)
  };
  tooltipText: string;
  leaderRating?: {
    engagement: number;
    openness: number;
    space?: number;
    atmosphere?: number;
  };
}

export interface RelationshipEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
  style: EdgeStyleClass;
  hasGlow: boolean;
  strokeWidth: number;
  color: string;
  description: string;
  visible?: boolean;
}

export interface TeamDiagnosticSummary {
  leaderTitle: string;
  synergyText: string;
  expertText: string;
  cohesionText: string;
  frictionText: string;
}

export interface RelationshipGraphData {
  nodes: RelationshipNode[];
  edges: RelationshipEdge[];
  diagnosticSummary: TeamDiagnosticSummary;
}

export interface GraphNodePosition {
  id: string;
  name: string;
  role: Role;
  color: string;
  x: number;
  y: number;
}

export interface MemberDiagnosticMetric {
  userId: string;
  name: string;
  role: Role;
  color: string;
  votesQ1: number;       // Współpraca (+3)
  votesQ2: number;       // Aktywne słuchanie (+2)
  votesQ3: number;       // Organizacja celu (+2)
  votesQ4: number;       // Chaos (-1)
  totalIncoming: number;
  isSilentExpert: boolean;
  stage2IndividualScore?: number;
  leaderRating?: {
    engagement: number;
    openness: number;
  };
}
