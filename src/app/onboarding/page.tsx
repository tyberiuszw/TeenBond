'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDemoStore } from '@/lib/demo-store';
import { useSessionStore } from '@/lib/session-store';
import { ColorPicker } from '@/components/brand/ColorPicker';
import { ChameleonAvatar } from '@/components/brand/ChameleonAvatar';
import { RoleBadge } from '@/components/ui/RoleBadge';
import {
  Sparkles,
  ArrowRight,
  Shield,
  KeyRound,
  Users,
  CheckCircle2,
  Building,
  Search,
} from 'lucide-react';
import { isSupabaseConfigured, createClient } from '@/lib/supabase/client';

const PUBLIC_ORGS_DIRECTORY = [
  {
    id: 'org-demo-alfa',
    name: 'Zespół Alfa — Liderzy Jutra',
    membersCount: 5,
    description: 'Zespół flagowy programu rozwojowego Liderzy Jutra.',
  },
  {
    id: 'org-pub-innowacje',
    name: 'Koło Młodych Innowatorów',
    membersCount: 4,
    description: 'Grupa projektowa pracująca nad inicjatywami społecznymi.',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { enableDemoMode, requestJoinPublicOrg } = useDemoStore();
  const { session, setSession, setActiveOrg } = useSessionStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [nickname, setNickname] = useState(session?.name || 'Młody Lider');
  const [selectedColor, setSelectedColor] = useState(session?.chameleonColor || '#10B981');

  // Org choice state
  const [orgMode, setOrgMode] = useState<'create' | 'join_private' | 'join_public'>('create');
  const [newOrgName, setNewOrgName] = useState('Młodzi Innowatorzy');
  const [newOrgType, setNewOrgType] = useState<'private' | 'public'>('private');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [publicSearchQuery, setPublicSearchQuery] = useState('');
  const [requestedOrgId, setRequestedOrgId] = useState<string | null>(null);

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleCompleteCreateOrg = async () => {
    const generatedCode = `TB-${Math.floor(1000 + Math.random() * 9000)}`;
    let orgId = `org-${Date.now()}`;
    const userId = session?.id || `user-${Date.now()}`;
    const userEmail = session?.email || 'lider@teenbond.pl';

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: authData } = await supabase.auth.getUser();
        const realUserId = authData.user?.id || userId;
        await (supabase.from('profiles') as any).upsert({
          id: realUserId,
          email: authData.user?.email || userEmail,
          full_name: nickname,
          chameleon_color: selectedColor,
        });
        const { data: createdOrg } = await (supabase.from('organizations') as any)
          .insert({
            name: newOrgName,
            slug: `${newOrgName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
            type: newOrgType,
            is_public: newOrgType === 'public',
            invite_code: generatedCode,
            created_by: realUserId,
          })
          .select('*')
          .single();
        if (createdOrg?.id) {
          orgId = createdOrg.id;
          await (supabase.from('team_members') as any).insert({
            organization_id: orgId,
            user_id: realUserId,
            role: 'leader',
            status: 'active',
          });
        }
      } catch {}
    }

    const orgData = {
      orgId,
      name: newOrgName,
      isDemo: false,
      isPublic: newOrgType === 'public',
      inviteCode: generatedCode,
      members: [],
    };

    setActiveOrg(orgData);
    setSession({
      id: userId,
      email: userEmail,
      name: nickname,
      chameleonColor: selectedColor,
      role: 'leader',
      orgId: orgData.orgId,
    });

    router.push('/path');
  };

  const handleCompleteJoinCode = async () => {
    const clean = inviteCodeInput.trim().toUpperCase();
    if (isSupabaseConfigured() && clean.length >= 4) {
      try {
        const supabase = createClient();
        const { data: authData } = await supabase.auth.getUser();
        const { data: foundOrg } = await (supabase.from('organizations') as any)
          .select('*')
          .eq('invite_code', clean)
          .single();
        if (foundOrg?.id && authData.user) {
          await (supabase.from('team_members') as any).upsert(
            {
              organization_id: foundOrg.id,
              user_id: authData.user.id,
              role: 'member',
              status: 'active',
            },
            { onConflict: 'organization_id,user_id' }
          );
          router.push('/path');
          return;
        }
      } catch {}
    }

    if (clean === 'TB-ALFA' || clean === 'ALFA-2026' || clean.startsWith('TB-')) {
      enableDemoMode('demo-user-bartek');
      router.push('/path');
    } else {
      setCodeError('Niepoprawny kod zespołu. Użyj np. ALFA-2026 lub TB-ALFA.');
    }
  };

  const handleRequestPublicOrg = async (orgId: string) => {
    requestJoinPublicOrg({
      name: nickname,
      email: session?.email || `${nickname.toLowerCase().replace(/\s+/g, '.')}@szkola.pl`,
      chameleonColor: selectedColor,
    });
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: authData } = await supabase.auth.getUser();
        if (authData.user) {
          await (supabase.from('team_members') as any).upsert(
            {
              organization_id: orgId,
              user_id: authData.user.id,
              role: 'member',
              status: 'pending',
            },
            { onConflict: 'organization_id,user_id' }
          );
        }
      } catch {}
    }
    setRequestedOrgId(orgId);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-950">
      <div className="w-full max-w-2xl space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 1 ? 'bg-emerald-500 text-slate-950' : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              1
            </span>
            <span className="text-xs font-semibold text-slate-300">Personalizacja Gracza</span>
          </div>
          <div className="w-10 h-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 2 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}
            >
              2
            </span>
            <span className="text-xs font-semibold text-slate-300">Wybór Zespołu</span>
          </div>
        </div>

        {/* STEP 1: Personalization */}
        {step === 1 && (
          <form
            onSubmit={handleNextStep1}
            className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h1 className="text-2xl font-black text-white">Witaj w TeenBond!</h1>
                <p className="text-xs sm:text-sm text-slate-400">
                  Dostosuj swój awatar kameleona i pseudonim widoczny dla grupy
                </p>
              </div>
              <ChameleonAvatar
                color={selectedColor}
                name={nickname}
                size="xl"
                showOnlineStatus
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Twój pseudonim w zespole</label>
              <input
                type="text"
                required
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <ColorPicker
              selectedColor={selectedColor}
              onSelectColor={(hex) => setSelectedColor(hex)}
            />

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
            >
              <span>Przejdź do wyboru zespołu</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* STEP 2: Team Choice */}
        {step === 2 && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-black text-white">Jak chcesz zacząć?</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Możesz założyć własny zespół jako Lider lub dołączyć do istniejącej grupy
              </p>
            </div>

            {/* Mode selection cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setOrgMode('create')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  orgMode === 'create'
                    ? 'border-emerald-500 bg-emerald-500/10 text-white ring-1 ring-emerald-500'
                    : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Building className="w-5 h-5 text-emerald-400 mb-2" />
                <h3 className="font-bold text-sm text-white">Załóż Zespół</h3>
                <p className="text-[11px] text-slate-400 mt-1">Otrzymujesz rolę Lidera i dostęp do Drzewka</p>
              </button>

              <button
                type="button"
                onClick={() => setOrgMode('join_private')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  orgMode === 'join_private'
                    ? 'border-blue-500 bg-blue-500/10 text-white ring-1 ring-blue-500'
                    : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                <KeyRound className="w-5 h-5 text-blue-400 mb-2" />
                <h3 className="font-bold text-sm text-white">Kod Prywatny</h3>
                <p className="text-[11px] text-slate-400 mt-1">Dołącz kodem zaproszenia (np. TB-ALFA)</p>
              </button>

              <button
                type="button"
                onClick={() => setOrgMode('join_public')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  orgMode === 'join_public'
                    ? 'border-cyan-500 bg-cyan-500/10 text-white ring-1 ring-cyan-500'
                    : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Users className="w-5 h-5 text-cyan-400 mb-2" />
                <h3 className="font-bold text-sm text-white">Zespoły Publiczne</h3>
                <p className="text-[11px] text-slate-400 mt-1">Wyszukaj grupę i wyślij prośbę do Lidera</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  enableDemoMode('demo-user-anna');
                  router.push('/path');
                }}
                className="p-4 rounded-2xl border border-purple-500/40 bg-purple-500/10 text-left transition-all hover:bg-purple-500/20"
              >
                <Sparkles className="w-5 h-5 text-purple-400 mb-2 animate-pulse" />
                <h3 className="font-bold text-sm text-white">Zespół Alfa (Demo)</h3>
                <p className="text-[11px] text-purple-300 mt-1">Przetestuj od razu gotową symulację 5 graczy</p>
              </button>
            </div>

            {/* Subform for Create Org */}
            {orgMode === 'create' && (
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Nazwa nowego zespołu</label>
                  <input
                    type="text"
                    required
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    placeholder="np. Zespół Liderów Klasy 3B"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Typ organizacji</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        checked={newOrgType === 'private'}
                        onChange={() => setNewOrgType('private')}
                        className="text-emerald-500"
                      />
                      <span>Prywatna (dostęp na kod TB-XXXX)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        checked={newOrgType === 'public'}
                        onChange={() => setNewOrgType('public')}
                        className="text-emerald-500"
                      />
                      <span>Publiczna (akceptacja lidera)</span>
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCompleteCreateOrg}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-md transition-all"
                >
                  Utwórz zespół jako Lider i przejdź do Ścieżki
                </button>
              </div>
            )}

            {/* Subform for Join with Code */}
            {orgMode === 'join_private' && (
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Wpisz kod zaproszenia (np. ALFA-2026 lub TB-ALFA)</label>
                  <input
                    type="text"
                    required
                    value={inviteCodeInput}
                    onChange={(e) => {
                      setInviteCodeInput(e.target.value);
                      setCodeError(null);
                    }}
                    placeholder="ALFA-2026"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white font-mono uppercase text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {codeError && <p className="text-xs text-rose-400">{codeError}</p>}
                </div>

                <button
                  type="button"
                  onClick={handleCompleteJoinCode}
                  className="w-full py-3 px-4 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-black text-sm shadow-md transition-all"
                >
                  Dołącz do zespołu
                </button>
              </div>
            )}

            {/* Subform for Public Organizations Directory & Join Request */}
            {orgMode === 'join_public' && (
              <div className="space-y-4 pt-2">
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={publicSearchQuery}
                    onChange={(e) => setPublicSearchQuery(e.target.value)}
                    placeholder="Wyszukaj publiczną organizację po nazwie..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="space-y-2.5">
                  {PUBLIC_ORGS_DIRECTORY.filter((o) =>
                    o.name.toLowerCase().includes(publicSearchQuery.toLowerCase())
                  ).map((org) => {
                    const isRequested = requestedOrgId === org.id;
                    return (
                      <div
                        key={org.id}
                        className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <h4 className="text-sm font-bold text-white">{org.name}</h4>
                          <p className="text-xs text-slate-400">{org.description}</p>
                        </div>
                        {isRequested ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                              <CheckCircle2 size={14} />
                              <span>Wysłano prośbę do Lidera</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                enableDemoMode('demo-user-anna');
                                router.push('/team');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black transition-all"
                            >
                              Otwórz Panel Lidera
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRequestPublicOrg(org.id)}
                            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black shadow-md transition-all shrink-0"
                          >
                            Wyślij prośbę o dołączenie
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              ← Wróć do personalizacji awatara
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
