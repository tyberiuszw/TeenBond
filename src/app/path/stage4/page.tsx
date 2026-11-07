'use client';

import React from 'react';
import Link from 'next/link';
import { ZinObeliskContainer } from '@/components/zin/ZinObeliskContainer';
import { ArrowLeft, Compass, Eye, ShieldCheck } from 'lucide-react';

export default function Stage4Page() {
  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-slate-950">
      {/* Top Breadcrumb & Status Navigation */}
      <div className="h-12 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-xs text-slate-300 z-30 select-none">
        <div className="flex items-center gap-3">
          <Link
            href="/path"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Powrót do Ścieżki</span>
          </Link>
          <div className="w-px h-4 bg-slate-700 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="font-black text-emerald-400 font-mono">ETAP 04</span>
            <span className="text-slate-400">•</span>
            <span className="font-bold text-white">The Zin Obelisk & TeenBoard</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/relations"
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 font-bold transition-colors"
          >
            <Eye size={13} />
            <span className="hidden sm:inline">Drzewko Relacji</span>
          </Link>
        </div>
      </div>

      {/* Main Game Surface */}
      <div className="flex-1 w-full h-full relative overflow-hidden">
        <ZinObeliskContainer />
      </div>
    </div>
  );
}
