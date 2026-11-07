'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDemoStore } from '@/lib/demo-store';
import { Logo } from '@/components/brand/Logo';
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';
import { isSupabaseConfigured, createClient } from '@/lib/supabase/client';
import { isAuthRoute, sanitizeRedirectPath } from '@/lib/supabase/middleware';
import { useSessionStore } from '@/lib/session-store';

export default function LoginPage() {
  const router = useRouter();
  const { enableDemoMode, disableDemoMode } = useDemoStore();
  const { setSession } = useSessionStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('error') === 'auth_callback_failed') {
        setErrorMsg(
          'Weryfikacja linku autoryzacyjnego nie powiodła się lub link wygasł. Zaloguj się ponownie.'
        );
      }
    }
  }, []);

  const getRedirectDestination = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const rawNext = params.get('next') || params.get('redirectTo');
      const safe = sanitizeRedirectPath(rawNext, '/path');
      const pathnameOnly = safe.split('?')[0];
      return isAuthRoute(pathnameOnly) ? '/path' : safe;
    }
    return '/path';
  };

  const handleStartDemo = () => {
    enableDemoMode('demo-user-anna');
    router.push(getRedirectDestination());
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    const destination = getRedirectDestination();

    if (!isSupabaseConfigured()) {
      // In development / demo environment without Supabase, automatically enter Demo mode
      enableDemoMode('demo-user-anna');
      router.push(destination);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        disableDemoMode();
        setSession({
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.full_name || 'Użytkownik',
          chameleonColor: data.user.user_metadata?.chameleon_color || '#10B981',
          role: 'member',
          orgId: '',
          isDemo: false,
        });
        router.push(destination);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Wystąpił błąd logowania');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-950">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-block">
            <Logo variant="compact" size="lg" withLink={false} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Logowanie do TeenBond
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Witaj z powrotem w platformie programu „Liderzy Jutra”
          </p>
        </div>

        {/* Big One-Click Demo Mode Card */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.2)] text-center space-y-3">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Sparkles size={14} className="animate-pulse" />
            <span>Szybki dostęp bez rejestracji</span>
          </div>
          <p className="text-xs text-slate-300">
            Sprawdź gotowy Zespół Alfa z kompletem danych motywatorów, symulacją decyzyjną oraz Drzewkiem Relacji.
          </p>
          <button
            type="button"
            onClick={handleStartDemo}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-md transition-all transform hover:scale-[1.01] active:scale-[0.99]"
          >
            <span>Wejdź w Tryb Demo (1-Click)</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">lub konto stałe</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Regular Login Form */}
        <form onSubmit={handleLogin} className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

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
            <label className="text-xs font-semibold text-slate-300">Hasło</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Nie posiadasz jeszcze konta?{' '}
          <Link href="/register" className="font-bold text-emerald-400 hover:text-emerald-300">
            Zarejestruj się tutaj
          </Link>
        </p>
      </div>
    </div>
  );
}
