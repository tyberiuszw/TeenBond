import { Role, UserSession } from './auth';
import {
  RelationshipNode,
  RelationshipEdge,
  TeamDiagnosticSummary,
  RelationshipGraphData,
} from './relationship';

export interface DemoPerson extends UserSession {
  xp: number;
  personaTitle: string;
  description: string;
  isSilentExpert?: boolean;
  isActiveListener?: boolean;
}

export interface DecisionDemoData {
  gameType: 'lost_at_sea' | 'moon';
  gameTitle: string;
  items: { id: string; namePl: string; officialRank: number }[];
  teamScore: number;
  averageIndividualScore: number;
  synergyDelta: number;
  isSynergyPositive: boolean;
  silentExpertId: string;
  individualScores: Record<string, number>;
}

export type { RelationshipNode, RelationshipEdge, TeamDiagnosticSummary, RelationshipGraphData };
export type RelationshipEdgeData = RelationshipEdge;
export type RelationshipGraphDemoData = RelationshipGraphData;

export interface TeenBoardElementDemo {
  id: string;
  type: 'stroke' | 'sticky' | 'shape' | 'text' | 'line';
  shapeType?: 'rect' | 'circle';
  x: number;
  y: number;
  width?: number;
  height?: number;
  content?: string;
  color: string;
  fillColor?: string;
  strokeWidth?: number;
  points?: number[];
  createdBy: string;
}
