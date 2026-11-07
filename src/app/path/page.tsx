'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useDemoStore } from '@/lib/demo-store';
import { STAGES_CONFIG } from '@/lib/constants';
import { StageInfo } from '@/types/stages';
import {
  Compass,
  CheckCircle2,
  Lock,
  Play,
  Clock,
  Sparkles,
  Users,
  Eye,
  Info,
} from 'lucide-react';

export default function PathPage() {
  const { isDemoMode, organization, getActiveUser } = useDemoStore();
  const activeUser = getActiveUser();
  const isLeader = activeUser?.role === 'leader';

  const [activeStageId, setActiveStageId] = useState<number | null>(null);

  // In demo mode, stages 1 & 2 are completed, stage 3 & 4 are unlocked, 5 & 6 locked
  const stages = STAGES_CONFIG;

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Top Banner / Stepper Info */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Compass size={14} className="text-emerald-400" />
            <span>Ścieżka Budowania Relacji i Zaufania</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            6 Kroków Integracji Zespołu Alfa
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Każdy etap to unikalne doświadczenie zespołowe rozwijające komunikację, otwartość oraz zaufanie.
            Wyniki każdego ukończonego etapu aktualizują matematyczny graf Drzewka Relacji.
          </p>
        </div>

        {/* Progress pill */}
        <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 shadow-inner">
          <div className="text-center">
            <span className="text-3xl font-black text-emerald-400">2 / 6</span>
            <p className="text-[11px] text-slate-400 font-medium">Ukończonych etapów</p>
          </div>
          <div className="w-px h-10 bg-slate-800" />
          <div className="text-center">
            <span className="text-3xl font-black text-cyan-400">+6.8</span>
            <p className="text-[11px] text-slate-400 font-medium">Efekt Synergii</p>
          </div>
        </div>
      </div>

      {/* Stepper progress dots */}
      <div className="hidden sm:flex items-center justify-between px-4">
        {stages.map((st, idx) => (
          <React.Fragment key={st.id}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  st.status === 'completed'
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                    : st.status === 'unlocked'
                    ? 'bg-cyan-500/20 text-cyan-300 border-2 border-cyan-400'
                    : 'bg-slate-900 text-slate-500 border border-slate-800'
                }`}
              >
                {st.status === 'completed' ? <CheckCircle2 size={18} /> : st.number}
              </div>
              <span className="text-[11px] font-semibold text-slate-300 truncate max-w-[100px] text-center">
                {st.title}
              </span>
            </div>
            {idx < stages.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 rounded-full ${
                  st.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Stages Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stages.map((stage) => {
          const isCompleted = stage.status === 'completed';
          const isUnlocked = stage.status === 'unlocked';
          const isLocked = stage.status === 'locked';

          return (
            <div
              key={stage.id}
              className={`p-6 rounded-3xl border flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
                isCompleted
                  ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg'
                  : isUnlocked
                  ? 'bg-slate-900/95 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/20'
                  : 'bg-slate-950/60 border-slate-900 opacity-70'
              }`}
            >
              {/* Header status */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-200">
                    Krok 0{stage.number}
                  </span>

                  {isCompleted && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                      <CheckCircle2 size={13} />
                      Ukończony
                    </span>
                  )}
                  {isUnlocked && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 animate-pulse">
                      <Sparkles size={13} />
                      Aktywny
                    </span>
                  )}
                  {isLocked && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800">
                      <Lock size={13} />
                      Zablokowany
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    {stage.title}
                  </h3>
                  <p className="text-xs font-semibold text-emerald-400 mt-0.5">
                    {stage.subtitle}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {stage.description}
                </p>
              </div>

              {/* Footer info & action button */}
              <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock size={14} />
                  <span>~{stage.estimatedTimeMin} min</span>
                </div>

                {stage.id === 1 ? (
                  <Link
                    href="/path/stage1"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all"
                  >
                    <Play size={14} />
                    <span>Otwórz Etap 1</span>
                  </Link>
                ) : stage.id === 2 ? (
                  <Link
                    href="/path/stage2"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all"
                  >
                    <Play size={14} />
                    <span>Otwórz Etap 2</span>
                  </Link>
                ) : stage.id === 3 ? (
                  <Link
                    href="/relations"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs shadow-md transition-all"
                  >
                    <Eye size={14} />
                    <span>Otwórz Drzewko Relacji</span>
                  </Link>
                ) : stage.id === 4 ? (
                  <Link
                    href="/path/stage4"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all"
                  >
                    <Play size={14} />
                    <span>Otwórz The Zin Obelisk</span>
                  </Link>
                ) : stage.id === 5 ? (
                  <Link
                    href="/path/stage5"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-bold text-xs shadow-md transition-all"
                  >
                    <Play size={14} />
                    <span>Otwórz Gry Śledcze</span>
                  </Link>
                ) : stage.id === 6 ? (
                  <Link
                    href="/path/stage6"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs shadow-md transition-all"
                  >
                    <Play size={14} />
                    <span>Otwórz Kalambury</span>
                  </Link>
                ) : isCompleted ? (
                  <Link
                    href="/team"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
                  >
                    <span>Zobacz Wyniki</span>
                  </Link>
                ) : isUnlocked ? (
                  <button
                    onClick={() => setActiveStageId(stage.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all"
                  >
                    <Play size={14} />
                    <span>Uruchom Pokój Gry</span>
                  </button>
                ) : (
                  <span className="text-xs text-slate-500 font-medium">
                    Wymaga ukończenia etapu {stage.number - 1}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stage Launch Modal info */}
      {activeStageId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Sparkles size={16} />
              <span>Pokój Rozgrywki (Tryb Demo)</span>
            </div>
            <h3 className="text-xl font-bold text-white">
              {stages.find((s) => s.id === activeStageId)?.title}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              W Milestone 1 przygotowany jest pełen szkielet platformy oraz autonomiczny store.
              Pełny silnik tablicy TeenBoard, podział 33 kart Zin Obelisk oraz pokoje śledcze Dracula/Murder Mystery
              zostaną oddane w kolejnych kamieniach milowych.
            </p>
            <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300">
              💡 Sprawdź już teraz <strong>Drzewko Relacji</strong> w menu głównym – zawiera w pełni wyliczony graf z danymi 5 graczy!
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveStageId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold"
              >
                Zamknij
              </button>
              <Link
                href="/relations"
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400"
              >
                Przejdź do Drzewka Relacji
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
