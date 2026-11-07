'use client';

import React, { useState } from 'react';
import {
  SuspectCharacter,
  MurderVerdictSubmission,
  MurderScenarioId,
} from '@/types/game';
import {
  evaluateMovieMurder,
  evaluateTechStreamMurder,
} from '@/lib/games/murderMysteryData';
import { Gavel, CheckCircle2, AlertTriangle, X, ShieldAlert } from 'lucide-react';

interface VerdictVotingModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenarioId: MurderScenarioId;
  characters: SuspectCharacter[];
  currentUserId: string;
  teammates: Array<{ id: string; name: string; color: string }>;
  votes: Record<string, MurderVerdictSubmission>;
  onVote: (vote: MurderVerdictSubmission) => void;
  onVerdictConfirmed: (score: number) => void;
}

export const VerdictVotingModal: React.FC<VerdictVotingModalProps> = ({
  isOpen,
  onClose,
  scenarioId,
  characters,
  currentUserId,
  teammates,
  votes,
  onVote,
  onVerdictConfirmed,
}) => {
  const [selectedSuspect, setSelectedSuspect] = useState('');
  const [selectedWeapon, setSelectedWeapon] = useState('');
  const [rationale, setRationale] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const currentVote = votes[currentUserId];
  const allVoted = teammates.every((t) => Boolean(votes[t.id]));

  // Check consensus across all votes
  const uniqueSuspects = new Set(Object.values(votes).map((v) => v.suspectId));
  const uniqueWeapons = new Set(Object.values(votes).map((v) => v.weapon));
  const isConsensus =
    allVoted && uniqueSuspects.size === 1 && uniqueWeapons.size === 1;

  const handleCastVote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSuspect || !selectedWeapon) return;

    onVote({
      userId: currentUserId,
      suspectId: selectedSuspect,
      weapon: selectedWeapon,
      motiveRationale: rationale,
      timestamp: new Date().toISOString(),
    });
  };

  const handleConfirmVerdict = () => {
    if (!isConsensus) return;
    const sampleVote = Object.values(votes)[0];
    const evaluation =
      scenarioId === 'movie'
        ? evaluateMovieMurder(sampleVote.suspectId, sampleVote.weapon)
        : evaluateTechStreamMurder(sampleVote.suspectId, sampleVote.weapon);

    if (evaluation.isSolved) {
      onVerdictConfirmed(evaluation.score);
    } else {
      setErrorMessage(
        'Zespół osiągnął jednomyślność, lecz wskazana osoba lub narzędzie zbrodni są błędne! Zrewidujcie alibi i ślady na tablicy korkowej.'
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-rose-950/60 via-slate-900 to-amber-950/40 border-b border-slate-800 flex items-start justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider">
              <Gavel size={14} className="text-rose-400" />
              <span>Akt Oskarżenia: Wymagany 100% Konsensus Zespołu</span>
            </div>
            <h3 className="text-xl font-black text-white">
              Kto dokonał zbrodni i jakim narzędziem?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Zgodnie z protokołem śledczym wszyscy członkowie zespołu muszą jednogłośnie wskazać tego samego mordercę i to samo narzędzie zbrodni.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Teammates Voting Status Grid */}
        <div className="p-5 bg-slate-950/60 border-b border-slate-800 space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Status głosów zespołu:
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {teammates.map((m) => {
              const vote = votes[m.id];
              const suspectName = characters.find((c) => c.id === vote?.suspectId)?.name;
              return (
                <div
                  key={m.id}
                  className={`p-2.5 rounded-xl border flex flex-col justify-between text-xs transition-all ${
                    vote
                      ? 'bg-slate-900 border-emerald-500/40'
                      : 'bg-slate-900/40 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: m.color }}
                    />
                    <span className="font-bold text-slate-200 truncate">{m.name}</span>
                  </div>
                  <div className="mt-1 text-[11px] truncate">
                    {vote ? (
                      <span className="text-emerald-400 font-medium">
                        {suspectName || vote.suspectId} ({vote.weapon})
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">Oczekuje na głos...</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current User Voting Form */}
        <form onSubmit={handleCastVote} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Wskaż sprawcę:</label>
              <select
                value={selectedSuspect || currentVote?.suspectId || ''}
                onChange={(e) => setSelectedSuspect(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-emerald-500 font-sans"
              >
                <option value="">-- Wybierz podejrzanego --</option>
                {characters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Narzędzie zbrodni:</label>
              <select
                value={selectedWeapon || currentVote?.weapon || ''}
                onChange={(e) => setSelectedWeapon(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-emerald-500 font-sans"
              >
                <option value="">-- Wybierz narzędzie --</option>
                {scenarioId === 'movie' ? (
                  <>
                    <option value="Poison">Trucizna (Poison w napoju)</option>
                    <option value="Gun">Broń palna (Pistolet rekwizytowy)</option>
                    <option value="Blunt">Tępe narzędzie (Ciężki reflektor)</option>
                    <option value="Strangulation">Uduszenie (Kabel mikrofonowy)</option>
                  </>
                ) : (
                  <>
                    <option value="Sword">Miecz antyczny (The Sword)</option>
                    <option value="Poison">Zatrute wino</option>
                    <option value="Pistol">Zabytkowy pistolet</option>
                    <option value="Strangulation">Sznur od kotary</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              Kluczowy motyw / dedukcja (opcjonalnie):
            </label>
            <input
              type="text"
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Np. Sprawca miał motyw zazdrości i brak alibi na balkonie..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              disabled={!selectedSuspect || !selectedWeapon}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 disabled:opacity-40 transition-colors"
            >
              {currentVote ? 'Zaktualizuj Mój Głos' : 'Zapisz Mój Głos'}
            </button>

            {isConsensus ? (
              <button
                type="button"
                onClick={handleConfirmVerdict}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-xl animate-bounce"
              >
                <Gavel size={15} />
                <span>Zatwierdź Werdykt Zespołu (100% Zgody!)</span>
              </button>
            ) : (
              <span className="text-[11px] text-amber-400 flex items-center gap-1 font-semibold">
                <AlertTriangle size={13} />
                <span>Wymagana 100% jednomyślność wszystkich graczy</span>
              </span>
            )}
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-600 text-rose-200 text-xs flex items-center gap-2">
              <ShieldAlert size={16} className="text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
