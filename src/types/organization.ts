import { Role, UserProfile, UserSession } from './auth';

export type OrgType = 'public' | 'private';
export type MemberStatus = 'active' | 'pending' | 'rejected';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  type: OrgType;
  isPublic: boolean;
  inviteCode?: string | null;
  createdBy: string;
  createdAt: string;
  memberCount?: number;
}

export interface OrgMembership {
  id: string;
  organizationId: string;
  userId: string;
  role: Role;
  status: MemberStatus;
  joinedAt: string;
  profile?: UserProfile;
}

export interface OrganizationContext {
  orgId: string;
  name: string;
  isDemo: boolean;
  isPublic: boolean;
  inviteCode?: string;
  members: UserSession[];
}

export interface JoinRequest {
  id: string;
  organizationId: string;
  userId: string;
  userName: string;
  userColor: string;
  createdAt: string;
  status: MemberStatus;
}
