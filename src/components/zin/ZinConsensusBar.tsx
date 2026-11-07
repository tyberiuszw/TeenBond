'use client';

import React, { useState } from 'react';
import { validateZinAnswer } from '@/lib/zin/validator';
import { CheckCircle2, Send, Users, AlertCircle, HelpCircle } from 'lucide-react';

interface ZinConsensusBarProps {
  currentUserId: string;
  totalMembersCount: number;
  readiedUserIds: string[];
  onToggleReady: () => void;
  onAnswerCorrect: () => void;
  isBoardReadOnly?: boolean;
}

export const ZinConsensusBar: React.FC<ZinConsensusBarProps> = ({
  currentUserId,
  totalMembersCount,
  readiedUserIds,
  onToggleReady,
  onAnswerCorrect,
  isBoardReadOnly = false,
}) => {
  const [answerInput, setAnswerInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCurrentReady = readiedUserIds.includes(currentUserId);
  const readyCount = readiedUserIds.length;
  const isConsensusReached = readyCount >= totalMembersCount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerInput.trim()) return;

    setIsSubmitting(true);
    setErrorMessage('');

    const isValid = validateZinAnswer(answerInput);
    if (isValid) {
      onAnswerCorrect();
    } else {
      setErrorMessage(
        'Niepoprawny dzień tygodnia. Sprawdźcie kalendarz Atlantydy, liczbę schlibów czystej pracy oraz dzień wolny Daydoldrum!'
      );
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 p-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-2xl select-none max-w-full">
      {/* Ready Consensus Pill */}
      <button
        onClick={onToggleReady}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
          isCurrentReady
            ? 'bg-emerald-500 text-slate-950 shadow-md'
            : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700'
        }`}
      >
        <CheckCircle2 size={15} className={isCurrentReady ? 'fill-slate-950 text-emerald-500' : ''} />
        <span>{isCurrentReady ? 'Gotowy do odpowiedzi' : 'Zgłoś gotowość zespołu'}</span>
      </button>

      {/* Consensus Counter */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-mono">
        <Users size={13} className="text-cyan-400" />
        <span>
          {readyCount} / {totalMembersCount} gotowych
        </span>
      </div>

      {/* Answer Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-1 w-full sm:w-auto">
        <div className="relative flex-1">
          <input
            type="text"
            value={answerInput}
            onChange={(e) => {
              setAnswerInput(e.target.value);
              if (errorMessage) setErrorMessage('');
            }}
            placeholder="Wpisz dzień ukończenia budowy..."
            className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={!answerInput.trim() || isSubmitting}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Send size={13} />
          <span>Sprawdź</span>
        </button>
      </form>

      {/* Error feedback toast if any */}
      {errorMessage && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 rounded-xl bg-rose-950 border border-rose-600 text-rose-200 text-xs flex items-center gap-2 shadow-2xl z-50 animate-in fade-in">
          <AlertCircle size={16} className="text-rose-400 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
