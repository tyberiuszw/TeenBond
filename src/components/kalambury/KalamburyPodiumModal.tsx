'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy, Medal, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';

interface KalamburyPodiumModalProps {
  isOpen: boolean;
  onRestart: () => void;
  scores: Record<string, number>;
  teammates: Array<{ id: string; name: string; color: string }>;
}

export const KalamburyPodiumModal: React.FC<KalamburyPodiumModalProps> = ({
  isOpen,
  onRestart,
  scores,
  teammates,
}) => {
  if (!isOpen) return null;

  const ranked = [...teammates]
    .map((t) => ({ ...t, score: scores[t.id] || 0 }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
          <Trophy size={28} />
        </div>

        <div className="space-y-1">
          <h3 className="text-2xl font-black text-white">Podium Kalamburów!</h3>
          <p className="text-xs text-slate-300">
            Świetna integracja i błyskotliwa komunikacja wizualna całego zespołu.
          </p>
        </div>

        {/* Podium Top 3 */}
        <div className="space-y-2 text-left">
          {ranked.map((player, idx) => (
            <div
              key={player.id}
              className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                idx === 0
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                  : idx === 1
                  ? 'bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-black text-xs w-5 text-center">
                  #{idx + 1}
                </span>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: player.color }}
                />
                <span className="font-bold text-xs">{player.name}</span>
              </div>

              <span className="font-mono font-black text-xs text-emerald-400">
                {player.score} pkt
              </span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onRestart}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            <RotateCcw size={14} />
            <span>Zagraj Ponownie</span>
          </button>

          <Link
            href="/relations"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg transition-all"
          >
            <span>Zobacz Drzewko Relacji</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};
