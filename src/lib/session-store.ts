import { create } from 'zustand';
import { UserSession } from '@/types/auth';
import { OrganizationContext } from '@/types/organization';
import { useDemoStore } from './demo-store';

interface SessionStoreState {
  session: UserSession | null;
  activeOrg: OrganizationContext | null;
  isLoading: boolean;

  setSession: (session: UserSession | null) => void;
  setActiveOrg: (org: OrganizationContext | null) => void;
  updateChameleonColor: (color: string) => void;
  logout: () => void;
}

export const useSessionStore = create<SessionStoreState>((set, get) => ({
  session: null,
  activeOrg: null,
  isLoading: false,

  setSession: (session) => set({ session }),
  setActiveOrg: (activeOrg) => set({ activeOrg }),

  updateChameleonColor: (color: string) => {
    const current = get().session;
    if (current) {
      set({ session: { ...current, chameleonColor: color } });
    }
  },

  logout: () => {
    useDemoStore.getState().disableDemoMode();
    set({ session: null, activeOrg: null });
  },
}));
