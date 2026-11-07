'use client';

import React from 'react';
import Link from 'next/link';
import { DraculaResolution } from '@/lib/games/draculaData';
import { Trophy, ArrowRight, ShieldCheck, Sparkles, X } from 'lucide-react';

interface DraculaDebriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  resolution: DraculaResolution;
  onOpenSurvey?: () => void;
}

export const DraculaDebriefModal: React.FC<DraculaDebriefModalProps> = ({
  isOpen,
  onClose,
  resolution,
  onOpenSurvey,
}) => {
  if (!isOpen) return null;

  const isSynergy = resolution.synergyBadge;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div
          className={`p-6 border-b border-slate-800 flex items-start justify-between ${
            isSynergy
              ? 'bg-gradient-to-r from-emerald-950/70 via-slate-900 to-purple-950/50'
              : 'bg-gradient-to-r from-slate-900 to-amber-950/40'
          }`}
        >
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Trophy size={14} className="text-emerald-400" />
              <span>
                {isSynergy
                  ? 'Przełom Synergiczny Win-Win (+200 XP)'
                  : 'Rozwiązanie Standardowe (+100 XP)'}
              </span>
            </div>
            <h3 className="text-2xl font-black text-white">
              Zabicie Drakuli: {resolution.day}, godz. {resolution.time}
            </h3>
            {isSynergy && (
              <p className="text-xs text-emerald-300 font-bold flex items-center gap-1">
                <Sparkles size={13} />
                <span>Odblokowano prestiżową odznakę: Mistrzowie Synergii!</span>
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Narrative & Logistics Breakdown */}
        <div className="p-6 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
          <p className="font-medium text-slate-100">{resolution.explanation}</p>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-white text-xs uppercase tracking-wider text-emerald-400 block">
              Logistyka czasoprzestrzenna Transylwanii:
            </span>
            <ul className="space-y-1 text-slate-400 text-xs">
              <li>
                • <strong>Budapeszt:</strong> Sklep zamknięty Pn-Wt. Otwarty w środę rano (zakup kołka).
              </li>
              <li>
                • <strong>Pociąg:</strong> Kursuje tylko w Pn, Śr i Pt o 12:00 (jedzie 6h do Novahuny).
              </li>
              <li>
                • <strong>Kościół:</strong> Otwarty 9:00 - 17:30 (wschód - zachód słońca).
              </li>
              <li>
                • <strong>Marsz pieszy:</strong> Dystans 64 mile ÷ prędkość 7 mph = ok. 9 godzin i 9 minut.
              </li>
              <li>
                • <strong>Światło dzienne:</strong> Wampira można zabić WYŁĄCZNIE ZA DNIA.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Zamknij
          </button>

          <div className="flex items-center gap-2">
            {onOpenSurvey && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSurvey();
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-lg transition-all"
              >
                <Sparkles size={14} />
                <span>Ankieta Ewaluacyjna (Etap 3)</span>
              </button>
            )}

            <Link
              href="/relations"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg transition-all"
            >
              <span>Przejdź do Drzewka Relacji (Etap 3)</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
