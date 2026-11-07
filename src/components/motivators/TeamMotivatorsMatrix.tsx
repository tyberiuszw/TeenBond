'use client';

import React, { useState } from 'react';
import { useDemoStore } from '@/lib/demo-store';
import { CHAMPFROGS_DEFINITIONS, findCardDef, MotivatorCardDef } from '@/lib/motivators/cardData';
import { ChameleonAvatar } from '@/components/brand/ChameleonAvatar';
import { RoleBadge } from '@/components/ui/RoleBadge';
import {
  Flame,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Users,
  Compass,
  Lightbulb,
  HeartHandshake,
  TrendingUp,
  Eye,
  Info,
} from 'lucide-react';

export function TeamMotivatorsMatrix() {
  const { members, motivators, getActiveUser, switchActiveUser, activeUserId } = useDemoStore();
  const activeUser = getActiveUser();
  const isLeader = activeUser?.role === 'leader';

  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[1]?.id || members[0]?.id);

  // 1. Calculate Borda points and Top 3 counts for each card
  const cardAggregates = CHAMPFROGS_DEFINITIONS.map((card) => {
    let bordaPoints = 0;
    let inTop3Count = 0;
    const ranksPerMember: Record<string, number> = {};

    members.forEach((member) => {
      const userRanking = motivators[member.id] || [];
      const index = userRanking.findIndex(
        (code) => code.toLowerCase() === card.id.toLowerCase() || code.toLowerCase() === card.codeUpper.toLowerCase()
      );
      const rank = index >= 0 ? index + 1 : 10;
      ranksPerMember[member.id] = rank;
      bordaPoints += 11 - rank;
      if (rank <= 3) inTop3Count++;
    });

    return {
      card,
      bordaPoints,
      inTop3Count,
      ranksPerMember,
    };
  });

  // Sort cards by Borda points descending (Team Rank 1..10)
  const sortedCards = [...cardAggregates].sort((a, b) => b.bordaPoints - a.bordaPoints);
  const teamTop3 = sortedCards.slice(0, 3);

  // Leader's personal ranking
  const leaderMember = members.find((m) => m.role === 'leader') || members[0];
  const leaderRanking = motivators[leaderMember.id] || [];

  // 2. Deterministic Friction / Blind spots detection between Leader & Members
  const leaderTop2Cards = leaderRanking.slice(0, 2).map((c) => findCardDef(c)).filter(Boolean) as MotivatorCardDef[];

  const blindSpots = members
    .filter((m) => m.id !== leaderMember.id)
    .map((member) => {
      const userRanks = motivators[member.id] || [];
      const issues: { card: MotivatorCardDef; leaderRank: number; memberRank: number; advice: string }[] = [];

      leaderTop2Cards.forEach((lCard) => {
        const memIdx = userRanks.findIndex(
          (c) => c.toLowerCase() === lCard.id.toLowerCase() || c.toLowerCase() === lCard.codeUpper.toLowerCase()
        );
        const memRank = memIdx >= 0 ? memIdx + 1 : 10;
        if (memRank >= 8) {
          let advice = `Dla ${member.name} czynnik „${lCard.namePl}” ma niskie znaczenie motywacyjne (${memRank}. miejsce).`;
          if (lCard.id === 'freedom') {
            advice += ` Zapewnij precyzyjne ramy i częstszy feedback, bo zbyt szeroka autonomia może wywoływać stres.`;
          } else if (lCard.id === 'mastery') {
            advice += ` Nie narzucaj wyśrubowanych standardów bez wcześniejszego wsparcia i wdrożenia.`;
          } else if (lCard.id === 'power') {
            advice += ` Skup się na partnerskim dialogu i unikaj arbitralnego decydowania za tę osobę.`;
          } else {
            advice += ` Dostosuj styl delegowania i uwzględnij odmienne priorytety.`;
          }
          issues.push({ card: lCard, leaderRank: 1, memberRank: memRank, advice });
        }
      });

      return {
        member,
        issues,
      };
    })
    .filter((item) => item.issues.length > 0);

  // Cell color helper for heatmap
  const getCellColorStyle = (rank: number) => {
    if (rank === 1) return 'bg-emerald-500 text-slate-950 font-black shadow-md';
    if (rank <= 3) return 'bg-emerald-600/80 text-white font-bold';
    if (rank <= 6) return 'bg-blue-600/70 text-white font-medium';
    if (rank <= 8) return 'bg-slate-700 text-slate-300';
    return 'bg-slate-800 text-slate-500';
  };

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto">
      {/* ================= HEADER ================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Flame size={14} className="text-emerald-400" />
            <span>Diagnostyka Zespołu: Macierz CHAMPFROGS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Macierz Motywatorów Zespołu (10 × 5)
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Zestawienie indywidualnych profili motywacyjnych wszystkich 5 członków zespołu,
            wspólnych wartości grupy oraz potencjalnych obszarów rozbieżności z perspektywy Lidera.
          </p>
        </div>

        {/* Role indicator / Switcher */}
        {!isLeader ? (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-right space-y-2">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
              Widok Uczestnika (Członek)
            </span>
            <p className="text-xs text-slate-400 max-w-xs">
              Pełna macierz diagnostyczna i karty facylitacji 1-na-1 są dostępne wyłącznie dla Lidera Zespołu.
            </p>
            <button
              onClick={() => switchActiveUser(leaderMember.id)}
              className="px-3.5 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-black text-xs transition-colors"
            >
              Przełącz na Lidera ({leaderMember.name})
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
            <ShieldCheck size={18} className="text-emerald-400" />
            <span>Panel Zarządczy Lidera (Pełny dostęp)</span>
          </div>
        )}
      </div>

      {/* ================= TEAM TOP 3 SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {teamTop3.map((item, idx) => (
          <div
            key={item.card.id}
            className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm text-slate-950 shadow-md"
                  style={{ backgroundColor: item.card.color }}
                >
                  #{idx + 1}
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  {Math.round((item.inTop3Count / members.length) * 100)}% zespołu w TOP 3
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-white">{item.card.namePl}</h3>
                <p className="text-xs text-slate-400 italic">{item.card.nameEn}</p>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                „{item.card.definitionPl}”
              </p>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Punkty Borda: <strong>{item.bordaPoints} pkt</strong></span>
              <span className="text-cyan-400 font-semibold">{item.card.category}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ================= 10x5 HEATMAP GRID ================= */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-400" />
            <h3 className="text-lg font-bold text-white">
              Macierz Ciepła Preferencji Motywacyjnych
            </h3>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Poz. 1 (Kluczowy)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-600/80 inline-block" /> Poz. 2-3 (Wysoki)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-600/70 inline-block" /> Poz. 4-6 (Średni)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-800 inline-block" /> Poz. 9-10 (Niski)
            </span>
          </div>
        </div>

        {/* Heatmap Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-3">Karta CHAMPFROGS</th>
                <th className="py-3 px-3 text-center">Grupa</th>
                {members.map((m) => (
                  <th key={m.id} className="py-3 px-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <ChameleonAvatar color={m.chameleonColor} size="sm" />
                      <span className="font-bold text-slate-200 truncate max-w-[80px]">
                        {m.name.split(' ')[0]}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {sortedCards.map((row, idx) => (
                <tr key={row.card.id} className="hover:bg-slate-850/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-500 text-xs">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                        style={{ backgroundColor: row.card.color }}
                      />
                      <span className="font-bold text-white text-xs sm:text-sm">
                        {row.card.namePl}
                      </span>
                      <span className="text-[11px] text-slate-500">[{row.card.code}]</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-emerald-400 font-mono font-black text-xs border border-slate-700">
                      {row.bordaPoints}p
                    </span>
                  </td>
                  {members.map((m) => {
                    const rank = row.ranksPerMember[m.id];
                    return (
                      <td key={m.id} className="py-2 px-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-mono transition-transform hover:scale-110 ${getCellColorStyle(
                            rank
                          )}`}
                          title={`${m.name}: ${row.card.namePl} na pozycji #${rank}`}
                        >
                          {rank}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= LEADER ONLY: BLIND SPOTS & 1-ON-1 FACILITATION CARDS ================= */}
      {isLeader && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Blind Spots & Friction Warnings */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <AlertTriangle size={20} />
              <h3 className="text-lg text-white">Pola Rozbieżności (Blind Spots)</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Automatyczna analiza rozbieżności pomiędzy Twoim profilem (Lidera) a preferencjami członków zespołu.
              Zapobiega narzucaniu własnego stylu motywacji osobom o innych potrzebach.
            </p>

            <div className="space-y-3 pt-1">
              {blindSpots.length === 0 ? (
                <p className="text-xs text-slate-400 italic p-3 rounded-xl bg-slate-950 border border-slate-800">
                  Brak krytycznych rozbieżności. Profile motywacyjne są zbieżne!
                </p>
              ) : (
                blindSpots.map(({ member, issues }) => (
                  <div
                    key={member.id}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <ChameleonAvatar color={member.chameleonColor} size="sm" />
                      <span className="font-bold text-sm text-white">{member.name}</span>
                      <RoleBadge role={member.role} size="sm" />
                    </div>
                    {issues.map((iss, i) => (
                      <p key={i} className="text-xs text-slate-300 leading-relaxed pl-2 border-l-2 border-amber-500/60">
                        {iss.advice}
                      </p>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Card 2: 1-on-1 Facilitation Drawer */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Lightbulb size={20} />
                <h3 className="text-lg text-white">Karty Facylitacji 1-na-1</h3>
              </div>
              <span className="text-[11px] text-slate-400">Wybierz gracza</span>
            </div>

            {/* Member selector pills */}
            <div className="flex flex-wrap gap-2">
              {members.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMemberId(m.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    selectedMemberId === m.id
                      ? 'bg-slate-800 text-white border-cyan-400 shadow-md'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <ChameleonAvatar color={m.chameleonColor} size="sm" />
                  <span>{m.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            {/* Selected member details */}
            {(() => {
              const mem = members.find((m) => m.id === selectedMemberId) || members[0];
              const memRanking = (motivators[mem.id] || []).map((c) => findCardDef(c)).filter(Boolean) as MotivatorCardDef[];
              const top1 = memRanking[0];
              const top2 = memRanking[1];
              const top3 = memRanking[2];
              const least10 = memRanking[memRanking.length - 1];

              return (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div>
                      <h4 className="font-bold text-white text-sm">{mem.name}</h4>
                      <p className="text-[11px] text-emerald-400">{mem.personaTitle}</p>
                    </div>
                    <ChameleonAvatar color={mem.chameleonColor} size="md" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                        Kluczowe motywatory:
                      </span>
                      <ol className="list-decimal list-inside text-slate-200 font-medium space-y-0.5">
                        <li>{top1?.namePl || 'Relacje'}</li>
                        <li>{top2?.namePl || 'Mistrzostwo'}</li>
                        <li>{top3?.namePl || 'Cel'}</li>
                      </ol>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-rose-400 block mb-1">
                        Najmniejszy wpływ (10):
                      </span>
                      <p className="text-slate-200 font-bold">
                        {least10?.namePl || 'Wpływ / Władza'}
                      </p>
                      <p className="text-[10px] text-slate-400 italic mt-0.5">
                        Nie motywuj presją ani statusem
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 space-y-1">
                    <span className="font-bold text-cyan-300 block">Wskazówki dla Lidera:</span>
                    <p>• Angażuj {mem.name} poprzez zadania rozwijające kompetencje i budujące więzi w zespole.</p>
                    <p>• Daj poczucie stabilności i doceniaj wkład prywatnie lub w małym gronie.</p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
