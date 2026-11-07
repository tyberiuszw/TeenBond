/**
 * Contract interfaces and types for TeenBond
 * Based on PROJECT.md interface contracts and PRD requirements.
 */

export type Role = 'leader' | 'member';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  chameleonColor: string;
  role: Role;
  orgId: string;
  isDemo?: boolean;
}

export interface OrganizationContext {
  orgId: string;
  name: string;
  isDemo: boolean;
  isPublic: boolean;
  inviteCode?: string;
  members: UserSession[];
}

export interface MotivatorCard {
  id: string;
  code: 'C' | 'H' | 'A' | 'M' | 'P' | 'F' | 'R' | 'O' | 'G' | 'S';
  nameEn: string;
  namePl: string;
  frontFilename: string;
  frontFilenameAlternative?: string;
  backFilename: string;
  definitionEn: string;
  definitionPl: string;
}

export interface DecisionItem {
  id: string;
  nameEn: string;
  namePl: string;
  officialRank: number;
}

export interface DecisionResult {
  score: number;
  teamScore: number;
  synergyDelta: number;
  isSynergyPositive: boolean;
  isSilentExpert: boolean;
  silentExpertUserId?: string;
}

export interface PeerEvaluationAnswer {
  evaluatorId: string;
  bestCollabUserId: string;   // Q1: +3
  activeListenerUserId: string; // Q2: +2
  goalOrganizerUserId: string;  // Q3: +2
  chaosUserId: string;          // Q4: -1
}

export interface LeaderEvaluationAnswer {
  leaderId: string;
  memberId: string;
  engagement: number; // 1-5
  openness: number;   // 1-5
}

export interface LeaderRatingAnswer {
  memberId: string;
  leaderId: string;
  speechSpace: number; // 1-5
  atmosphere: number;  // 1-5
}

export interface RelationshipEdge {
  userA: string;
  userB: string;
  weight: number;
  style: 'dashed' | 'thin' | 'medium' | 'thick';
  hasGlow: boolean;
  strokeWidth: number;
}

export interface BoardElement {
  id: string;
  type: 'stroke' | 'sticky' | 'shape' | 'text' | 'image';
  x: number;
  y: number;
  width?: number;
  height?: number;
  content?: string;
  color: string;
  strokeWidth?: number;
  points?: number[];
  lockedBy?: string | null;
  createdBy: string;
  deleted?: boolean;
}

export interface CursorState {
  userId: string;
  name: string;
  color: string;
  x: number;
  y: number;
  laserTrail?: { x: number; y: number; timestamp: number }[];
}

export interface UndoAction {
  userId: string;
  actionType: 'create' | 'update' | 'delete';
  elementBefore?: BoardElement;
  elementAfter?: BoardElement;
}
