'use client';

import React from 'react';
import { Lock, Crown, ShieldAlert, Sparkles, HeartHandshake } from 'lucide-react';
import { useDemoStore } from '@/lib/demo-store';

interface ConfidentialNoticeProps {
  activeUserName: string;
}

export function ConfidentialNotice({ activeUserName }: ConfidentialNoticeProps) {
  const { switchActiveUser, members } = useDemoStore();
  const leader = members.find((m) => m.role === 'leader') || members[0];

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-950 min-h-[70vh]">
      <div className="max-w-xl w-full p-6 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Shield & Lock Badge */}
        <div className="relative w-20 h-20 mx-auto">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <Lock size={36} />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <HeartHandshake size={14} />
          </div>
        </div>

        {/* Text Header */}
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert size={14} />
            <span>Strefa Poufna Lidera</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Drzewko Relacji Zablokowane
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            Drzewko Relacji i wskaźniki wzajemnego zaufania są widoczne wyłącznie dla Lidera Zespołu,
            aby zagwarantować <strong>pełne bezpieczeństwo psychologiczne</strong> uczestników
            oraz zapobiec zjawisku etykietowania lub głosowania odwetowego.
          </p>
        </div>

        {/* Psychological Safety Explainer Box */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-left space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Dlaczego te dane są poufne?
          </span>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
            <li>
              Uczestnicy mogą odpowiadać szczerze bez obawy przed reakcją rówieśników.
            </li>
            <li>
              Lider wykorzystuje te wnioski do wspierania dynamiki i facylitacji, nie do oceniania.
            </li>
            <li>
              Wszelkie tarcia i sygnały wycofania są rozwiązywane dyskretnie przez zadania 1-na-1.
            </li>
          </ul>
        </div>

        {/* Current Perspective */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
          Aktualnie przeglądasz aplikację z perspektywy: <strong className="text-slate-100 font-semibold">{activeUserName}</strong> (Członek Zespołu).
        </div>

        {/* Quick Demo Switcher */}
        <button
          onClick={() => switchActiveUser(leader.id)}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl transition-all transform hover:scale-[1.01]"
        >
          <Crown size={16} />
          <span>Przełącz na Lidera ({leader.name}) i zobacz Drzewko</span>
          <Sparkles size={14} className="ml-1 opacity-70" />
        </button>
      </div>
    </div>
  );
}
