'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDemoStore } from '@/lib/demo-store';
import { Logo } from '@/components/brand/Logo';
import { ColorPicker } from '@/components/brand/ColorPicker';
import { ChameleonAvatar } from '@/components/brand/ChameleonAvatar';
import { Sparkles, ArrowRight, Lock, Mail, User, AlertCircle } from 'lucide-react';
import { isSupabaseConfigured, createClient } from '@/lib/supabase/client';
import { useSessionStore } from '@/lib/session-store';

export default function RegisterPage() {
  const router = useRouter();
  const { enableDemoMode } = useDemoStore();
  const { setSession } = useSessionStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [chameleonColor, setChameleonColor] = useState('#10B981');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStartDemo = () => {
    enableDemoMode('demo-user-anna');
    router.push('/path');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    if (!isSupabaseConfigured()) {
      // In local/demo mode without Supabase, configure local session and proceed to onboarding
      enableDemoMode('demo-user-anna');
      router.push('/onboarding');
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            chameleon_color: chameleonColor,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        setSession({
          id: data.user.id,
          email: data.user.email || '',
          name: fullName || 'Użytkownik',
          chameleonColor,
          role: 'member',
          orgId: '',
          isDemo: false,
        });
        router.push('/onboarding');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Wystąpił błąd rejestracji');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-950">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-block">
            <Logo variant="compact" size="lg" withLink={false} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Dołącz do TeenBond
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Zarejestruj swój profil, wybierz kolor kameleona i zacznij budować relacje
          </p>
        </div>

        {/* Big One-Click Demo Mode Card */}
        <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.2)] text-center space-y-2.5">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Sparkles size={14} className="animate-pulse" />
            <span>Chcesz tylko zobaczyć platformę?</span>
          </div>
          <button
            type="button"
            onClick={handleStartDemo}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all transform hover:scale-[1.01] active:scale-[0.99]"
          >
            <span>Uruchom Standalone Tryb Demo</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">lub załóż nowe konto</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-xl">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Imię lub Pseudonim</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="np. Kuba lub Zosia"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Adres e-mail</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="twoj.email@szkola.pl"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Hasło (min. 6 znaków)</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Chameleon Color Picker & Live Avatar Preview */}
          <div className="pt-2 border-t border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Twój Awatar Kameleona</h3>
                <p className="text-xs text-slate-400">Wybierz kolor reprezentujący Twoją energię</p>
              </div>
              <ChameleonAvatar
                color={chameleonColor}
                name={fullName || 'Gracz'}
                size="lg"
                showOnlineStatus
              />
            </div>

            <ColorPicker
              selectedColor={chameleonColor}
              onSelectColor={(hex) => setChameleonColor(hex)}
              label=""
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50"
          >
            {loading ? 'Rejestrowanie...' : 'Utwórz konto i przejdź do Zespołu'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Masz już konto?{' '}
          <Link href="/login" className="font-bold text-emerald-400 hover:text-emerald-300">
            Zaloguj się tutaj
          </Link>
        </p>
      </div>
    </div>
  );
}
