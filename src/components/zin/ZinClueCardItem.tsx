'use client';

import React, { useState } from 'react';
import { ZinClueCard } from '@/types/game';
import { Star, HelpCircle, Ban, Languages } from 'lucide-react';

interface ZinClueCardItemProps {
  card: ZinClueCard;
  userColor?: string;
}

type TagType = 'none' | 'vital' | 'clarify' | 'distractor';

export const ZinClueCardItem: React.FC<ZinClueCardItemProps> = ({
  card,
  userColor = '#10B981',
}) => {
  const [lang, setLang] = useState<'pl' | 'en'>('pl');
  const [tag, setTag] = useState<TagType>('none');

  const handleCopy = (e: React.ClipboardEvent) => {
    // Pro-communication anti-copy protection
    e.preventDefault();
  };

  return (
    <div
      onCopy={handleCopy}
      className={`relative p-4 rounded-2xl border transition-all select-none ${
        tag === 'vital'
          ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
          : tag === 'clarify'
          ? 'bg-sky-950/40 border-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.2)]'
          : tag === 'distractor'
          ? 'bg-slate-900/40 border-slate-700 opacity-50 line-through'
          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-md'
      }`}
      style={{
        borderLeftWidth: '4px',
        borderLeftColor:
          tag === 'vital'
            ? '#F59E0B'
            : tag === 'clarify'
            ? '#0EA5E9'
            : tag === 'distractor'
            ? '#64748B'
            : userColor,
      }}
    >
      {/* Top Header: Badge # and Language Switcher */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">
            Poszlaka #{String(card.id).padStart(2, '0')}
          </span>
          {card.note && (
            <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
              • {card.note}
            </span>
          )}
        </div>

        <button
          onClick={() => setLang((l) => (l === 'pl' ? 'en' : 'pl'))}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition-colors"
          title="Przełącz język karty (PL/EN)"
        >
          <Languages size={12} className="text-emerald-400" />
          <span>{lang.toUpperCase()}</span>
        </button>
      </div>

      {/* Clue Text */}
      <p className="text-xs sm:text-sm font-serif leading-relaxed text-slate-100 select-none">
        „{lang === 'pl' ? card.textPl : card.textEn}”
      </p>

      {/* Quick Tagging Buttons */}
      <div className="flex items-center gap-1.5 pt-3 mt-3 border-t border-slate-800/60">
        <button
          onClick={() => setTag((t) => (t === 'vital' ? 'none' : 'vital'))}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
            tag === 'vital'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800'
          }`}
          title="Oznacz jako poszlakę kluczową"
        >
          <Star size={11} className={tag === 'vital' ? 'fill-amber-400 text-amber-400' : ''} />
          <span>Kluczowe</span>
        </button>

        <button
          onClick={() => setTag((t) => (t === 'clarify' ? 'none' : 'clarify'))}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
            tag === 'clarify'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
              : 'text-slate-400 hover:text-sky-300 hover:bg-slate-800'
          }`}
          title="Oznacz do wyjaśnienia z zespołem"
        >
          <HelpCircle size={11} />
          <span>Do wyjaśnienia</span>
        </button>

        <button
          onClick={() => setTag((t) => (t === 'distractor' ? 'none' : 'distractor'))}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
            tag === 'distractor'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
          }`}
          title="Oznacz jako prawdopodobną zmyłkę"
        >
          <Ban size={11} />
          <span>Zmyłka</span>
        </button>
      </div>
    </div>
  );
};
