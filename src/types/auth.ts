/**
 * Auth and User Types for TeenBond
 */

export type Role = 'leader' | 'member';

export type ChameleonColor =
  | '#10B981' // Emerald (Liderzy Jutra primary)
  | '#3B82F6' // Blue
  | '#8B5CF6' // Purple
  | '#EC4899' // Pink
  | '#F59E0B' // Amber
  | '#EF4444' // Red
  | '#06B6D4' // Cyan
  | '#84CC16' // Lime
  | '#22C55E' // Legacy Emerald alias
  | '#F97316' // Legacy Orange alias
  | '#EAB308'; // Legacy Amber alias

export interface UserSession {
  id: string;
  email: string;
  name: string;
  chameleonColor: string;
  role: Role;
  orgId: string;
  isDemo?: boolean;
  avatarUrl?: string | null;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  chameleonColor: string;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt?: string;
}
