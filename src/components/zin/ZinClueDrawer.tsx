'use client';

import React, { useState } from 'react';
import { ZinClueCard } from '@/types/game';
import { ZinClueCardItem } from './ZinClueCardItem';
import { Scroll, ChevronLeft, ChevronRight, Search, ShieldCheck } from 'lucide-react';

interface ZinClueDrawerProps {
  assignedCards: ZinClueCard[];
  userColor?: string;
  userName?: string;
}

export const ZinClueDrawer: React.FC<ZinClueDrawerProps> = ({
  assignedCards,
  userColor = '#10B981',
  userName = 'Twoje',
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = assignedCards.filter(
    (c) =>
      c.textPl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.textEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(c.id).includes(searchQuery)
  );

  return (
    <>
      {/* Persistent Toggle Tab on Right Screen Edge */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`fixed top-24 right-0 z-40 flex items-center gap-2 px-3 py-2.5 rounded-l-2xl font-bold text-xs shadow-2xl transition-all ${
          isOpen
            ? 'translate-x-0 bg-slate-900 border-l border-t border-b border-slate-700 text-emerald-400'
            : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
        }`}
        style={{
          boxShadow: '-4px 0 20px rgba(0,0,0,0.4)',
        }}
        title="Otwórz / Zwiń prywatny panel poszlak"
      >
        <Scroll size={16} />
        <span>Moje Poszlaki ({assignedCards.length})</span>
        {isOpen ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
      </button>

      {/* Drawer Container */}
      <div
        className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-slate-950/95 backdrop-blur-xl border-l border-slate-800 z-40 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 pt-16 border-b border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scroll size={18} className="text-emerald-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                {userName}: Prywatne Poszlaki
              </h3>
            </div>
            <span
              className="px-2 py-0.5 rounded-full text-[11px] font-black text-slate-950 font-mono"
              style={{ backgroundColor: userColor }}
            >
              {assignedCards.length} kart
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-tight flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-400 flex-shrink-0" />
            <span>Karty są widoczne tylko dla Ciebie. Opowiedz o nich zespołowi!</span>
          </p>

          {/* Quick Search */}
          <div className="relative mt-2">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Szukaj w poszlakach..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Clue Cards Scroll Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Brak poszlak spełniających kryteria
            </div>
          ) : (
            filtered.map((card) => (
              <ZinClueCardItem key={card.id} card={card} userColor={userColor} />
            ))
          )}
        </div>
      </div>
    </>
  );
};
