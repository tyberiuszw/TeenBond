'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getScenario, DecisionItemDef } from '@/lib/decisions/scenarios';
import { getExpertRationale } from '@/lib/decisions/expertKeys';
import { getMockMemberRanking, getDefaultTeamRanking } from '@/lib/decisions/mockSubmissions';
import {
  calculateAbsoluteDifferenceSum,
  getSurvivalTier,
  SurvivalTierInfo,
} from '@/lib/decisions/scoring';
import {
  calculateSynergy,
  detectSilentExpert,
  SynergyResult,
  SilentExpertResult,
} from '@/lib/decisions/synergy';
import { useDemoStore } from '@/lib/demo-store';
import { ChameleonAvatar } from '@/components/brand/ChameleonAvatar';
import { RoleBadge } from '@/components/ui/RoleBadge';
import confetti from 'canvas-confetti';
import {
  Award,
  TrendingUp,
  Lightbulb,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  BookOpen,
  Sparkles,
  Users,
  Compass,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { getDecisionIcon } from './decisionIcons';
import { EvaluationSurveyModal } from '@/components/relations/EvaluationSurveyModal';

interface DecisionSummaryScreenProps {
  scenarioId: 'lost_at_sea' | 'moon';
  teamRanking: string[];
  userSoloRanking: string[];
  allSoloSubmissions?: Record<string, string[]>;
  onPlayAgain?: () => void;
}

export function DecisionSummaryScreen({
  scenarioId,
  teamRanking,
  userSoloRanking,
  allSoloSubmissions = {},
  onPlayAgain,
}: DecisionSummaryScreenProps) {
  const scenario = getScenario(scenarioId);
  const { members, activeUserId, getActiveUser } = useDemoStore();
  const activeUser = getActiveUser();

  // Expanded rationales state: itemId -> boolean
  const [expandedRationales, setExpandedRationales] = useState<Record<string, boolean>>({});
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);

  const toggleRationale = (itemId: string) => {
    setExpandedRationales((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Convert rankings to numbers based on scenario official items
  // An item with ID `id` has an officialRank from 1 to 15
  // For any 15-item array of IDs, its ranking numbers in order of official items:
  // Let official items order be: item_1, item_2, ..., item_15.
  // Each item receives rank R(i) where R(i) is its position in the list (1..15).
  const officialRanks = scenario.items.map((i) => i.officialRank);

  const getRankVector = (idList: string[]): number[] => {
    return scenario.items.map((officialItem) => {
      const idx = idList.indexOf(officialItem.id);
      return idx >= 0 ? idx + 1 : 15;
    });
  };

  const effectiveTeamRanking =
    teamRanking && teamRanking.length === 15
      ? teamRanking
      : getDefaultTeamRanking(scenarioId);

  const teamRankVector = getRankVector(effectiveTeamRanking);
  const userSoloRankVector = getRankVector(userSoloRanking);

  // Calculate scores
  const teamScore = calculateAbsoluteDifferenceSum(teamRankVector, officialRanks);
  const teamTier: SurvivalTierInfo = getSurvivalTier(teamScore);

  // Calculate scores for all members
  const memberScoresList = members.map((member) => {
    let rawIds = allSoloSubmissions[member.id];
    if (!rawIds || rawIds.length !== 15) {
      if (member.id === activeUserId && userSoloRanking && userSoloRanking.length === 15) {
        rawIds = userSoloRanking;
      } else {
        rawIds = getMockMemberRanking(scenarioId, member.id);
      }
    }
    const rankVec = getRankVector(rawIds);
    const score = calculateAbsoluteDifferenceSum(rankVec, officialRanks);
    return {
      userId: member.id,
      userName: member.name,
      chameleonColor: member.chameleonColor,
      score,
      rankingIds: rawIds,
    };
  });

  const individualScoresOnly = memberScoresList.map((m) => m.score);
  const synergy: SynergyResult = calculateSynergy(individualScoresOnly, teamScore);
  const silentExpert: SilentExpertResult = detectSilentExpert(memberScoresList, teamScore);

  // Confetti trigger on positive synergy
  useEffect(() => {
    if (synergy.isSynergyPositive) {
      try {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      } catch {}
    }
  }, [synergy.isSynergyPositive]);

  // Sort members by score ascending (lowest error is best)
  const sortedMembers = [...memberScoresList].sort((a, b) => a.score - b.score);

  return (
    <div className="space-y-8 w-full max-w-6xl mx-auto">
      {/* ================= TOP TITLE ================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>Etap 2 Ukończony: Raport Decyzyjny i Synergia</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Oficjalny Werdykt: {scenario.titlePl}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Wyniki zostały porównane z oficjalnym kluczem ekspertów <strong>{scenario.expertAuthority}</strong>.
            Poniżej znajduje się analiza błędu, wyliczenie Efektu Synergii oraz detekcja Cichego Eksperta.
          </p>
        </div>

        {onPlayAgain && (
          <button
            onClick={onPlayAgain}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-2 transition-colors shrink-0"
          >
            <RotateCcw size={14} />
            <span>Zagraj ponownie</span>
          </button>
        )}
      </div>

      {/* ================= 4 KPI CARDS BAR ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Wynik Zespołu */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3 relative overflow-hidden">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Wynik Zespołu (Błąd)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-white font-mono">
              {teamScore}
            </span>
            <span className="text-xs font-semibold text-slate-400">pkt błędu</span>
          </div>

          <div className="pt-1">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${teamTier.badgeColorClass}`}
            >
              <span>Ocena: {teamTier.labelPl}</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug pt-1">
            {teamTier.descriptionPl}
          </p>
        </div>

        {/* KPI 2: Średnia Solo */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Średnia Indywidualna
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-cyan-400 font-mono">
              {synergy.averageIndividualScore}
            </span>
            <span className="text-xs font-semibold text-slate-400">pkt ({members.length} graczy)</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug pt-3">
            Średni poziom błędu uzyskany przez członków zespołu w Fazie 1 (bez dyskusji).
          </p>
        </div>

        {/* KPI 3: Efekt Synergii */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Efekt Synergii (Δ)
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl sm:text-4xl font-black font-mono ${
                synergy.isSynergyPositive ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {synergy.synergyDelta > 0 ? `+${synergy.synergyDelta}` : synergy.synergyDelta}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {synergy.isSynergyPositive ? `(+${synergy.synergyPercentage}%)` : 'pkt'}
            </span>
          </div>

          <div className="pt-1">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${
                synergy.isSynergyPositive
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}
            >
              <TrendingUp size={13} />
              <span>{synergy.isSynergyPositive ? '🟢 Pozytywna Synergia' : '🟠 Pułapka Kompromisu'}</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            {synergy.isSynergyPositive
              ? 'Wspólna dyskusja zmniejszyła błąd i poprawiła jakość decyzji!'
              : 'Decyzja zespołowa nie pobiła średniej solo – ulegliście kompromisom.'}
          </p>
        </div>

        {/* KPI 4: Cichy Ekspert */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Cichy Ekspert (Silent Expert)
          </span>
          {silentExpert.isSilentExpert ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black text-amber-300 truncate">
                  {silentExpert.silentExpertName || 'Gracz'}
                </span>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                  {silentExpert.expertSoloScore} pkt
                </span>
              </div>
              <div className="pt-1">
                <span className="inline-flex items-center gap-1 text-xs font-black text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/40">
                  ⭐ Przewaga: +{silentExpert.difference} pkt nad grupą
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Ten uczestnik miał intuicję o $\ge 5$ pkt lepszą niż kompromis zespołu!
              </p>
            </>
          ) : (
            <>
              <div className="text-base font-bold text-slate-300">
                Brak dominującego eksperta
              </div>
              <p className="text-[11px] text-slate-400 leading-snug pt-2">
                Różnica między najlepszym wynikiem solo a zespołem wyniosła poniżej 5 pkt ({silentExpert.difference} pkt).
                Grupa pracowała równomiernie.
              </p>
            </>
          )}
        </div>
      </div>

      {/* ================= FULL 15-ITEMS COMPARISON TABLE ================= */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-emerald-400" />
            <h3 className="text-lg font-bold text-white">
              Porównanie z Oficjalnym Kluczem Ekspertów ({scenario.expertAuthority})
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Kliknij wiersz, aby rozwinąć oficjalne uzasadnienie eksperta
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">Ekspert</th>
                <th className="py-3 px-3">Przedmiot</th>
                <th className="py-3 px-3 text-center">Zespół (Błąd)</th>
                <th className="py-3 px-3 text-center">Mój Solo (Błąd)</th>
                <th className="py-3 px-3 text-center">Uzasadnienie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {scenario.items.map((item) => {
                const IconComponent = getDecisionIcon(item.iconName);
                const expertRank = item.officialRank;

                // Team position
                const teamPos = effectiveTeamRanking.indexOf(item.id) + 1;
                const teamDiff = Math.abs(teamPos - expertRank);

                // User solo position
                const userSoloPos = userSoloRanking.indexOf(item.id) + 1;
                const userDiff = Math.abs(userSoloPos - expertRank);

                const isExpanded = Boolean(expandedRationales[item.id]);
                const rationale = getExpertRationale(scenarioId, item.id);

                return (
                  <React.Fragment key={item.id}>
                    <tr
                      onClick={() => toggleRationale(item.id)}
                      className="hover:bg-slate-850/50 cursor-pointer transition-colors"
                    >
                      {/* Expert Rank */}
                      <td className="py-3 px-3">
                        <span className="w-8 h-8 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center font-mono font-black text-xs border border-slate-700 shadow-sm">
                          #{expertRank}
                        </span>
                      </td>

                      {/* Item Info */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 text-cyan-400 flex items-center justify-center shrink-0">
                            <IconComponent size={16} />
                          </div>
                          <div>
                            <span className="font-bold text-white text-xs sm:text-sm block">
                              {item.namePl}
                            </span>
                            <span className="text-[11px] text-slate-400 italic">
                              {item.nameEn}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Team Rank & Diff */}
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono font-bold text-slate-200">
                          #{teamPos}
                        </span>{' '}
                        <span
                          className={`text-xs font-mono font-semibold ${
                            teamDiff === 0
                              ? 'text-emerald-400'
                              : teamDiff <= 3
                              ? 'text-cyan-400'
                              : 'text-amber-400'
                          }`}
                        >
                          ({teamDiff === 0 ? '✓ Idealnie' : `błąd: ${teamDiff}`})
                        </span>
                      </td>

                      {/* User Solo Rank & Diff */}
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono font-bold text-slate-300">
                          #{userSoloPos}
                        </span>{' '}
                        <span
                          className={`text-xs font-mono font-semibold ${
                            userDiff === 0
                              ? 'text-emerald-400'
                              : userDiff <= 3
                              ? 'text-cyan-400'
                              : 'text-slate-400'
                          }`}
                        >
                          ({userDiff === 0 ? '✓' : `błąd: ${userDiff}`})
                        </span>
                      </td>

                      {/* Rationale Toggle */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Official Rationale row */}
                    {isExpanded && (
                      <tr className="bg-slate-950/70 animate-in fade-in duration-150">
                        <td colSpan={5} className="py-3.5 px-6">
                          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400">
                              <BookOpen size={14} />
                              <span>Oficjalne Uzasadnienie Ekspertów ({scenario.expertAuthority}):</span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                              {rationale?.rationalePl || item.shortDescriptionPl}
                            </p>
                            {rationale?.rationaleEn && (
                              <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800">
                                "{rationale.rationaleEn}"
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= TEAM LEADERBOARD & RETRO PROMPTS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaderboard */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Ranking Indywidualny Zespołu</h3>
          </div>
          <p className="text-xs text-slate-300">
            Wyniki członków zespołu uszeregowane od najmniejszego błędu.
          </p>

          <div className="space-y-2.5 pt-1">
            {sortedMembers.map((m, idx) => {
              const isSilent = silentExpert.isSilentExpert && silentExpert.silentExpertUserId === m.userId;
              return (
                <div
                  key={m.userId}
                  className={`p-3 rounded-2xl border flex items-center justify-between ${
                    isSilent
                      ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-300">
                      {idx + 1}
                    </span>
                    <ChameleonAvatar color={m.chameleonColor} size="sm" />
                    <div>
                      <span className="font-bold text-sm text-white">{m.userName}</span>
                      {isSilent && (
                        <span className="ml-2 text-[10px] font-black uppercase text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40">
                          ⭐ Cichy Ekspert
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="font-mono font-black text-sm text-slate-200">
                    {m.score} pkt błędu
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Retrospective Debrief Prompts */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-purple-400" />
            <h3 className="text-lg font-bold text-white">
              Wnioski Retrospektywne dla Zespołu (Debrief)
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Skorzystajcie z poniższych pytań facylitacyjnych, aby przedyskutować proces podejmowania decyzji przed ankietą:
          </p>

          <div className="space-y-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs font-bold text-cyan-300 block">1. Wymiana wiedzy i słuchanie:</span>
              <p className="text-xs text-slate-300">
                Co sprawiło, że zespół zyskał (lub stracił) w stosunku do średniej solo? Czyj głos przeważył w spornych pozycjach?
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs font-bold text-emerald-300 block">2. Spostrzeżenia Cichego Eksperta:</span>
              <p className="text-xs text-slate-300">
                Jeśli w zespole ujawnił się Cichy Ekspert – dlaczego jego argumenty nie zostały w pełni uwzględnione na liście zespołowej?
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs font-bold text-purple-300 block">3. Gotowość do Etapu 3:</span>
              <p className="text-xs text-slate-300">
                Wasze interakcje w tej grze będą kluczowym punktem odniesienia w ankiecie ewaluacyjnej oraz algorytmie Drzewka Relacji!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= AUTO-UNLOCK STAGE 3 TRANSITION CTA ================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border-2 border-purple-500/50 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} className="text-purple-400" />
            <span>Etap 3 Odblokowany: Ankiety Ewaluacyjne i Drzewko Relacji</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Przejdź do Ankiety Ewaluacyjnej i Drzewka Relacji
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Każdy gracz wypełnia krótką, poufną ankietę rówieśniczą. Wyniki natychmiast zaktualizują
            matematyczny graf relacji (Drzewko Relacji) dostępny w panelu Lidera.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <button
            onClick={() => setIsSurveyOpen(true)}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-slate-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all transform hover:scale-105"
          >
            <Sparkles size={18} />
            <span>Wypełnij Ankietę Poetapową</span>
          </button>

          <Link
            href="/relations"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-purple-500/40 text-purple-300 font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            <span>Drzewko Relacji</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      <EvaluationSurveyModal
        isOpen={isSurveyOpen}
        onClose={() => setIsSurveyOpen(false)}
        stageNumber={2}
      />
    </div>
  );
}
