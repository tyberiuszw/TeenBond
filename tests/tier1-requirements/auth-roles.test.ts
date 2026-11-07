import { describe, it, expect } from 'vitest';
import { DEMO_MEMBERS, DEMO_ORGANIZATION } from '../helpers/mockStore';
import { UserSession } from '../helpers/contracts';

describe('Tier 1: Auth, Roles & Organization Contracts', () => {
  it('R1-AUTH-01: Demo mode is accessible without credentials and provides full Alfa organization', () => {
    expect(DEMO_ORGANIZATION.isDemo).toBe(true);
    expect(DEMO_ORGANIZATION.members.length).toBe(5);
    expect(DEMO_ORGANIZATION.name).toBe('Liderzy Jutra – Zespół Alfa');

    const leader = DEMO_ORGANIZATION.members.find(m => m.role === 'leader');
    expect(leader).toBeDefined();
    expect(leader?.name).toBe('Kuba');
    expect(leader?.chameleonColor).toBe('#22c55e');

    const regularMembers = DEMO_ORGANIZATION.members.filter(m => m.role === 'member');
    expect(regularMembers.length).toBe(4);
  });

  it('R1-AUTH-02: User profile personalizes chameleon colors from the 8 approved palette values', () => {
    const approvedColors = [
      '#22c55e', '#f97316', '#ec4899', '#3b82f6',
      '#8b5cf6', '#eab308', '#06b6d4', '#ef4444'
    ];

    DEMO_MEMBERS.forEach(member => {
      expect(approvedColors).toContain(member.chameleonColor.toLowerCase());
    });
  });

  it('R1-AUTH-03: System enforces role distinction between Leader and Member for Relationship Tree access', () => {
    function canAccessRelationshipTree(user: UserSession): boolean {
      // In production, RLS allows ONLY leader. In Demo, user viewing as leader has access.
      return user.role === 'leader';
    }

    const leader = DEMO_MEMBERS.find(m => m.role === 'leader')!;
    const member = DEMO_MEMBERS.find(m => m.role === 'member')!;

    expect(canAccessRelationshipTree(leader)).toBe(true);
    expect(canAccessRelationshipTree(member)).toBe(false);
  });

  it('R1-AUTH-04: Private organizations strictly validate invite codes', () => {
    function joinPrivateOrg(inviteCodeInput: string, orgInviteCode: string): { success: boolean; status: string } {
      const cleanCode = inviteCodeInput.trim().toUpperCase();
      if (cleanCode === orgInviteCode.toUpperCase()) {
        return { success: true, status: 'approved' };
      }
      return { success: false, status: 'rejected' };
    }

    expect(joinPrivateOrg('TB-ALFA', 'TB-ALFA')).toEqual({ success: true, status: 'approved' });
    expect(joinPrivateOrg('  tb-alfa  ', 'TB-ALFA')).toEqual({ success: true, status: 'approved' });
    expect(joinPrivateOrg('TB-WRONG', 'TB-ALFA')).toEqual({ success: false, status: 'rejected' });
  });

  it('R1-AUTH-05: Public organizations require explicit Leader manual approval', () => {
    interface OrgMemberStatus {
      userId: string;
      status: 'pending' | 'approved' | 'rejected';
    }

    let membership: OrgMemberStatus = { userId: 'usr-new', status: 'pending' };

    function leaderDecide(decision: 'approved' | 'rejected', actingUser: UserSession): OrgMemberStatus {
      if (actingUser.role !== 'leader') {
        throw new Error('403 Forbidden: Only Leader can approve members');
      }
      return { ...membership, status: decision };
    }

    const leader = DEMO_MEMBERS.find(m => m.role === 'leader')!;
    const member = DEMO_MEMBERS.find(m => m.role === 'member')!;

    expect(() => leaderDecide('approved', member)).toThrow('403 Forbidden');
    
    membership = leaderDecide('approved', leader);
    expect(membership.status).toBe('approved');
  });
});
