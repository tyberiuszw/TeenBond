'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDemoStore } from '@/lib/demo-store';
import { STAGES_CONFIG, CHAMELEON_COLORS } from '@/lib/constants';
import { ChameleonAvatar } from '@/components/brand/ChameleonAvatar';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  Users,
  Network,
  Zap,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { enableDemoMode } = useDemoStore();

  const handleStartDemo = () => {
    enableDemoMode('demo-user-anna');
    router.push('/path');
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-900 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[250px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-semibold shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Sparkles size={16} className="text-emerald-400 animate-pulse" />
            <span>Program Rozwojowy „Liderzy Jutra”</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight">
            Buduj zaufanie i relacje w{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              zespole młodzieżowym
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed">
            Interaktywne gry decyzyjne, 10 kart motywatorów CHAMPFROGS, collaborative tablica TeenBoard
            oraz algorytmiczne Drzewko Relacji diagnozujące synergię grupy bez użycia AI.
          </p>

          {/* Main Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            {/* One-Click Standalone Demo CTA */}
            <button
              onClick={handleStartDemo}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-base shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles size={18} className="text-slate-950" />
              <span>Wypróbuj Tryb Demo</span>
              <ArrowRight size={18} />
            </button>

            {/* Login / Register */}
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-base border border-slate-700 hover:border-slate-500 transition-all text-center"
            >
              Zaloguj się
            </Link>
          </div>

          <p className="text-xs text-slate-400 flex items-center justify-center gap-2 pt-1">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Tryb Demo działa w 100% offline w pamięci – bez podawania emaila i hasła!</span>
          </p>
        </div>
      </section>

      {/* 8 Chameleons Showcase */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-900 bg-slate-950/60">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Paleta 8 Barw Kameleona – Twoja tożsamość w zespole
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Każdy gracz wybiera unikalny kolor kameleona identyfikujący go na tablicy TeenBoard, kursorach live i w Drzewku Relacji.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-2">
            {CHAMELEON_COLORS.map((c) => (
              <div
                key={c.id}
                className="flex flex-col items-center p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all hover:scale-105"
              >
                <ChameleonAvatar color={c.hex} name={c.namePl} size="lg" />
                <span className="mt-2 text-xs font-bold text-slate-200">{c.namePl}</span>
                <span className="text-[10px] text-slate-400">{c.nameEn}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6 Stages Overview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-950 flex-1">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              6 Etapów Ścieżki Budowania Relacji
            </h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
              Zaprojektowane na podstawie badań psychologii zespołowej i oficjalnych scenariuszy kooperacyjnych.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {STAGES_CONFIG.map((stage) => (
              <div
                key={stage.id}
                className="group relative p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-400 px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30">
                      Etap 0{stage.number}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      ~{stage.estimatedTimeMin} min
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {stage.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    {stage.subtitle}
                  </p>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {stage.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">
                    {stage.isLeaderOnly ? 'Panel poufny Lidera' : 'Pełny udział zespołu'}
                  </span>
                  <button
                    onClick={handleStartDemo}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <span>Zobacz w Demo</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
