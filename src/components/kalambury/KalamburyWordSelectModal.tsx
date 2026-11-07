'use client';

import React from 'react';
import { KalamburyWord } from '@/types/game';
import { Sparkles, Trophy, Palette } from 'lucide-react';

interface KalamburyWordSelectModalProps {
  isOpen: boolean;
  choices: KalamburyWord[];
  onSelectWord: (word: KalamburyWord) => void;
}

export const KalamburyWordSelectModal: React.FC<KalamburyWordSelectModalProps> = ({
  isOpen,
  choices,
  onSelectWord,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
          <Palette size={24} />
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-black text-white">Twoja kolej na rysowanie!</h3>
          <p className="text-xs text-slate-300">
            Wybierz jedno z 3 haseł. Rysuj tak, aby zespół jak najszybciej odgadł motyw.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {choices.map((choice) => (
            <button
              key={choice.id}
              onClick={() => onSelectWord(choice)}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500 hover:bg-slate-900/90 text-left flex flex-col justify-between transition-all group shadow-md"
            >
              <div className="space-y-1">
                <span
                  className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    choice.tier === 'easy'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : choice.tier === 'medium'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-purple-500/20 text-purple-400'
                  }`}
                >
                  {choice.tier === 'easy'
                    ? 'Łatwe (100 pkt)'
                    : choice.tier === 'medium'
                    ? 'Średnie (150 pkt)'
                    : 'Trudne (200 pkt)'}
                </span>

                <h4 className="text-sm font-black text-white group-hover:text-emerald-400 transition-colors pt-2">
                  {choice.word}
                </h4>
              </div>

              <p className="text-[10px] text-slate-400 leading-tight mt-3">
                {choice.hint}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
