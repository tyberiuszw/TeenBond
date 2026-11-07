'use client';

import React from 'react';
import { useDemoStore } from '@/lib/demo-store';
import { PerspectiveSwitcher } from './PerspectiveSwitcher';
import { Sparkles, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const DemoBanner: React.FC = () => {
  const { isDemoMode, disableDemoMode, organization } = useDemoStore();
  const router = useRouter();

  if (!isDemoMode) {
    return null;
  }

  const handleExitDemo = () => {
    disableDemoMode();
    router.push('/login');
  };

  return (
    <div className="w-full bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border-b border-emerald-500/30 text-white px-3 sm:px-6 py-2 shadow-lg relative z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
        {/* Left side: Tag and Org name */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 uppercase tracking-widest text-[11px] shadow-[0_0_10px_rgba(16,185,129,0.3)]">
            <Sparkles size={13} className="text-emerald-400 animate-pulse" />
            Tryb Demo
          </span>
          <span className="text-slate-300 hidden lg:inline">•</span>
          <span className="font-semibold text-slate-200">
            {organization.name}
          </span>
          <span className="text-slate-400 text-[11px] hidden sm:inline">
            (Pamięć lokalna, zero sieci)
          </span>
        </div>

        {/* Center: Perspective Switcher */}
        <div className="flex items-center">
          <PerspectiveSwitcher />
        </div>

        {/* Right side: Exit Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExitDemo}
            className="flex items-center gap-1.5 text-xs text-rose-300 hover:text-rose-100 bg-rose-950/40 hover:bg-rose-900/60 px-3 py-1.5 rounded-lg border border-rose-800/50 transition-colors"
          >
            <LogOut size={13} />
            <span>Zakończ Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
