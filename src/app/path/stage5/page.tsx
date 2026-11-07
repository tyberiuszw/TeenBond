'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MurderMysteryContainer } from '@/components/games/murder/MurderMysteryContainer';
import { DraculaGameContainer } from '@/components/games/dracula/DraculaGameContainer';
import { ArrowLeft, ShieldAlert, Skull, Eye } from 'lucide-react';

export default function Stage5Page() {
  const [selectedGame, setSelectedGame] = useState<'murder' | 'dracula'>('murder');

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-slate-950">
      {/* Top Breadcrumb Navigation */}
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
            <span className="font-black text-rose-400 font-mono">ETAP 05</span>
            <span className="text-slate-400">•</span>
            <span className="font-bold text-white">Gry Śledcze & Negocjacje</span>
          </div>
        </div>

        {/* Game Mode Selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            onClick={() => setSelectedGame('murder')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
              selectedGame === 'murder'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert size={13} />
            <span>Murder Mystery</span>
          </button>
          <button
            onClick={() => setSelectedGame('dracula')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
              selectedGame === 'dracula'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Skull size={13} />
            <span>Dracula Game</span>
          </button>
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

      {/* Main Game Container */}
      <div className="flex-1 w-full h-full relative overflow-hidden">
        {selectedGame === 'murder' ? (
          <MurderMysteryContainer />
        ) : (
          <DraculaGameContainer />
        )}
      </div>
    </div>
  );
}
