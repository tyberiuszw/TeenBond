import { create } from 'zustand';
import { UserSession } from '@/types/auth';
import { OrganizationContext } from '@/types/organization';
import { useDemoStore } from './demo-store';
import { isSupabaseConfigured, createClient } from './supabase/client';

interface SessionStoreState {
  session: UserSession | null;
  activeOrg: OrganizationContext | null;
  isLoading: boolean;

  setSession: (session: UserSession | null) => void;
  setActiveOrg: (org: OrganizationContext | null) => void;
  updateChameleonColor: (color: string) => void;
  hydrateSession: () => Promise<UserSession | null>;
  logout: () => void;
}

export const useSessionStore = create<SessionStoreState>((set, get) => ({
  session: null,
  activeOrg: null,
  isLoading: false,

  setSession: (session) => {
    if (session && !session.isDemo) {
      useDemoStore.getState().disableDemoMode();
    }
    set({ session });
  },
  setActiveOrg: (activeOrg) => set({ activeOrg }),

  updateChameleonColor: (color: string) => {
    const current = get().session;
    if (current) {
      set({ session: { ...current, chameleonColor: color } });
    }
  },

  hydrateSession: async () => {
    if (useDemoStore.getState().isDemoMode || !isSupabaseConfigured()) {
      return null;
    }
    set({ isLoading: true });
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        set({ session: null, isLoading: false });
        return null;
      }
      const existing = get().session;
      const user = data.user;
      const hydrated: UserSession = {
        id: user.id,
        email: user.email || existing?.email || '',
        name:
          user.user_metadata?.full_name ||
          (existing?.id === user.id ? existing.name : '') ||
          user.email?.split('@')[0] ||
          'Użytkownik',
        chameleonColor:
          user.user_metadata?.chameleon_color ||
          (existing?.id === user.id ? existing.chameleonColor : '') ||
          '#10B981',
        role: existing?.id === user.id ? existing.role : 'member',
        orgId: existing?.id === user.id ? existing.orgId : '',
        isDemo: false,
      };
      set({ session: hydrated, isLoading: false });
      return hydrated;
    } catch {
      set({ isLoading: false });
      return null;
    }
  },

  logout: () => {
    useDemoStore.getState().disableDemoMode();
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        void supabase.auth.signOut();
      } catch {}
    }
    set({ session: null, activeOrg: null });
  },
}));
