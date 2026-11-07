'use client';

import React, { useState, useEffect } from 'react';
import { getScenario, DecisionItemDef } from '@/lib/decisions/scenarios';
import { calculateItemControversy, calculateItemVariances, ItemControversyStat } from '@/lib/decisions/synergy';
import { getDefaultTeamRanking } from '@/lib/decisions/mockSubmissions';
import { useDemoStore } from '@/lib/demo-store';
import { ChameleonAvatar } from '@/components/brand/ChameleonAvatar';
import { RoleBadge } from '@/components/ui/RoleBadge';
import confetti from 'canvas-confetti';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Flame,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Sparkles,
  ArrowRight,
  Info,
  Clock,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { getDecisionIcon } from './decisionIcons';

interface DecisionGameTeamProps {
  scenarioId: 'lost_at_sea' | 'moon';
  userSoloRanking: string[];
  allSoloSubmissions?: Record<string, string[]>;
  initialTeamRanking?: string[];
  onProceedToSummary: (teamRanking: string[]) => void;
}

export function DecisionGameTeam({
  scenarioId,
  userSoloRanking,
  allSoloSubmissions = {},
  initialTeamRanking,
  onProceedToSummary,
}: DecisionGameTeamProps) {
  const scenario = getScenario(scenarioId);
  const { activeUserId, members, getActiveUser, switchActiveUser } = useDemoStore();
  const activeUser = getActiveUser();

  // Initialize team ranking: from initialTeamRanking or default team consensus (score 32)
  const [teamRanking, setTeamRanking] = useState<string[]>(() => {
    if (initialTeamRanking && initialTeamRanking.length === 15) {
      return [...initialTeamRanking];
    }
    return getDefaultTeamRanking(scenarioId);
  });

  // Track 100% consensus approvals: userId -> boolean
  const [approvals, setApprovals] = useState<Record<string, boolean>>({});
  const [resetToast, setResetToast] = useState<string | null>(null);

  // Drag state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Controversy drawer inspection: itemId of item whose voter breakdown is open
  const [inspectedHotspotId, setInspectedHotspotId] = useState<string | null>(null);

  // Compute team controversy index (variances across all solo submissions)
  const controversyStats = calculateItemVariances(allSoloSubmissions, teamRanking);
  const controversyMap = new Map<string, ItemControversyStat>(
    controversyStats.map((s) => [s.itemId, s])
  );

  // Invalidation on Mutation:
  // When team list changes, reset all approvals to {}
  const handleReorder = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= teamRanking.length) return;

    const next = [...teamRanking];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setTeamRanking(next);

    // Hard consensus invalidation
    if (Object.keys(approvals).length > 0) {
      setApprovals({});
      setResetToast('Układ listy uległ zmianie! Zgody zespołu zostały zresetowane do ponownego zatwierdzenia.');
      setTimeout(() => setResetToast(null), 4000);
    }
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      handleReorder(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
  };

  // Toggle approval for active user
  const handleToggleMyApproval = () => {
    const isApproved = Boolean(approvals[activeUserId]);
    setApprovals((prev) => ({
      ...prev,
      [activeUserId]: !isApproved,
    }));
  };

  // Simulate 100% approval in Demo Mode
  const handleSimulateFullConsensus = () => {
    const full: Record<string, boolean> = {};
    members.forEach((m) => {
      full[m.id] = true;
    });
    setApprovals(full);
    try {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch {}
  };

  const approvedCount = members.filter((m) => Boolean(approvals[m.id])).length;
  const is100PercentApproved = approvedCount === members.length && members.length > 0;
  const approvalPercent = Math.round((approvedCount / Math.max(1, members.length)) * 100);

  return (
    <div className="space-y-8 w-full max-w-5xl mx-auto">
      {/* ================= HEADER ================= */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Users size={14} className="text-emerald-400" />
            <span>Faza 2: Kooperacyjna Lista Zespołowa</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Wspólny Konsensus: {scenario.titlePl}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Dyskutujcie i zmieniajcie kolejność, aby wypracować jedną wspólną listę 15 przedmiotów.
            Zwróćcie uwagę na wskaźniki rozbieżności oraz strefy gorącej dyskusji!
            Przejście do wyników wymaga <strong>100% jednomyślności</strong>.
          </p>
        </div>

        {/* 100% Consensus Progress Box */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-inner flex flex-col items-center sm:items-end gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-emerald-400">
              {approvedCount} / {members.length}
            </span>
            <span className="text-xs font-semibold text-slate-300">akceptacji</span>
          </div>

          <div className="w-48 bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${approvalPercent}%` }}
            />
          </div>

          {!is100PercentApproved && (
            <button
              onClick={handleSimulateFullConsensus}
              className="text-[11px] font-bold text-slate-400 hover:text-emerald-300 underline mt-1"
            >
              Symuluj 100% zgodę zespołu
            </button>
          )}
        </div>
      </div>

      {/* ================= MUTATION RESET TOAST NOTIFICATION ================= */}
      {resetToast && (
        <div className="p-4 rounded-2xl bg-amber-500/20 border-2 border-amber-500/50 text-amber-200 text-xs font-bold flex items-center gap-3 animate-in fade-in duration-200 shadow-lg">
          <AlertTriangle size={18} className="text-amber-400 shrink-0" />
          <span>{resetToast}</span>
        </div>
      )}

      {/* ================= 100% CONSENSUS READY BANNER ================= */}
      {is100PercentApproved && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-2 border-emerald-500/50 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                Osiągnięto 100% konsensusu zespołu!
              </h3>
              <p className="text-xs text-slate-300">
                Wszyscy członkowie zaakceptowali ostateczny kształt listy. Kliknij poniżej, aby poznać
                oficjalny werdykt ekspertów, wyliczyć Efekt Synergii i odkryć Cichego Eksperta.
              </p>
            </div>
          </div>

          <button
            onClick={() => onProceedToSummary(teamRanking)}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl flex items-center gap-2 transition-all transform hover:scale-105 shrink-0"
          >
            <span>Rozlicz wyniki i podsumowanie</span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* ================= CONSENSUS STATUS BAR & SWITCHER ================= */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ChameleonAvatar color={activeUser.chameleonColor} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white">{activeUser.name}</span>
              <RoleBadge role={activeUser.role} size="sm" />
            </div>
            <p className="text-xs text-slate-400">
              {approvals[activeUserId]
                ? 'Zaakceptowałeś(aś) aktualną listę zespołu.'
                : 'Zapoznaj się z pozycjami i kliknij zielony przycisk akceptacji.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleMyApproval}
            className={`px-6 py-2.5 rounded-xl font-black text-xs shadow-lg flex items-center gap-2 transition-all ${
              approvals[activeUserId]
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 hover:bg-slate-700'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
            }`}
          >
            <CheckCircle2 size={16} />
            <span>
              {approvals[activeUserId]
                ? 'Wycofaj moją zgodę'
                : 'Akceptuję ostateczną listę zespołu'}
            </span>
          </button>
        </div>
      </div>

      {/* ================= STREFY GORĄCEJ DYSKUSJI (HOTSPOTS SUMMARY BOX) ================= */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Flame className="text-rose-400" size={20} />
            <h3 className="text-base font-black text-white">
              Strefy gorącej dyskusji
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            Najwyższa wariancja opinii w zespole (<span className="font-mono">σ²</span>)
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Poniższe przedmioty wywołały największą polaryzację ocen w fazie indywidualnej. Zwróćcie na nie szczególną uwagę podczas uzgadniania konsensusu i zderzcie swoje argumenty:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {controversyStats
            .filter((s) => s.isHotspot)
            .slice(0, 3)
            .map((hotspot, idx) => {
              const item = scenario.items.find((i) => i.id === hotspot.itemId);
              if (!item) return null;
              const currentTeamRank = teamRanking.indexOf(item.id) + 1;
              const isSelected = inspectedHotspotId === item.id;

              return (
                <button
                  type="button"
                  key={hotspot.itemId}
                  onClick={() =>
                    setInspectedHotspotId(isSelected ? null : item.id)
                  }
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-rose-500/20 border-rose-500/60 ring-2 ring-rose-500/30'
                      : 'bg-slate-950 border-rose-500/30 hover:border-rose-500/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center justify-center shrink-0 font-black text-xs">
                      #{idx + 1}
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-bold text-xs text-white truncate">{item.namePl}</div>
                      <div className="text-[10px] text-slate-400">
                        Lista zespołu: #{currentTeamRank} • Śr. solo: #{hotspot.averageRank}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-black text-rose-300 block">
                      σ² = {hotspot.variance}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      ±{hotspot.stdDev} poz.
                    </span>
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      {/* ================= 15 TEAM ITEMS LIST ================= */}
      <div className="space-y-3">
        {teamRanking.map((itemId, index) => {
          const item = scenario.items.find((i) => i.id === itemId);
          if (!item) return null;

          const IconComponent = getDecisionIcon(item.iconName);
          const teamRank = index + 1;
          const isTop3 = teamRank <= 3;

          // Personal Pick delta
          const mySoloIndex = userSoloRanking.indexOf(itemId);
          const mySoloRank = mySoloIndex >= 0 ? mySoloIndex + 1 : teamRank;
          const delta = teamRank - mySoloRank; // > 0 means team put it lower; < 0 means team put it higher
          const isLargeDiscrepancy = Math.abs(teamRank - mySoloRank) > 5;

          // Controversy
          const stat = controversyMap.get(itemId);
          const isHotspot = Boolean(stat?.isHotspot);

          const isDraggingThis = draggedIndex === index;
          const isOverThis = dragOverIndex === index;

          return (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col gap-3 ${
                isDraggingThis
                  ? 'opacity-40 scale-95 border-dashed border-cyan-400'
                  : isOverThis
                  ? 'bg-cyan-500/10 border-cyan-400 scale-[1.01]'
                  : isLargeDiscrepancy
                  ? 'bg-slate-900 border-amber-500/60 ring-2 ring-amber-500/40 animate-pulse-slow'
                  : isTop3
                  ? 'bg-slate-900 border-emerald-500/40 shadow-sm'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                {/* Left: Rank, Handle, Icon, Name */}
                <div className="flex items-center gap-3 overflow-hidden">
                  <button
                    type="button"
                    className="text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing p-1 shrink-0"
                    title="Przeciągnij"
                  >
                    <GripVertical size={18} />
                  </button>

                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-md ${
                      isTop3
                        ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    #{teamRank}
                  </div>

                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-800 text-emerald-400 shrink-0 border border-slate-700">
                    <IconComponent size={18} />
                  </div>

                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-white text-xs sm:text-sm truncate">
                        {item.namePl}
                      </h4>
                      <span className="text-[10px] font-semibold text-slate-400 italic hidden md:inline">
                        ({item.nameEn})
                      </span>

                      {/* Hotspot Badge & Variance */}
                      {isHotspot ? (
                        <button
                          type="button"
                          onClick={() =>
                            setInspectedHotspotId(
                              inspectedHotspotId === item.id ? null : item.id
                            )
                          }
                          className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-colors"
                        >
                          <Flame size={12} className="text-rose-400" />
                          <span>🔥 Gorąca Dyskusja (Wariancja: {stat?.variance})</span>
                          {inspectedHotspotId === item.id ? (
                            <ChevronUp size={12} />
                          ) : (
                            <ChevronDown size={12} />
                          )}
                        </button>
                      ) : stat && stat.variance > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          σ² = {stat.variance}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Right: Personal Delta & Order Controls */}
                <div className="flex items-center gap-3 shrink-0">
                  {/* Personal Delta Badge */}
                  <div
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold flex items-center gap-1 border ${
                      isLargeDiscrepancy
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : delta === 0
                        ? 'bg-slate-800 text-slate-300 border-slate-700'
                        : delta > 0
                        ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                        : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    }`}
                    title={`Twój wybór solo: #${mySoloRank}. Zespół: #${teamRank}.`}
                  >
                    <span>Mój typ: #{mySoloRank}</span>
                    <span>
                      {delta === 0 ? '(=)' : delta > 0 ? `(▼${delta})` : `(▲${Math.abs(delta)})`}
                    </span>
                  </div>

                  {/* Reorder Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleReorder(index, index - 1)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 transition-colors"
                      title="Przesuń wyżej"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={index === teamRanking.length - 1}
                      onClick={() => handleReorder(index, index + 1)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 transition-colors"
                      title="Przesuń niżej"
                    >
                      <ArrowDown size={14} />
                    </button>

                    <select
                      value={teamRank}
                      onChange={(e) => {
                        const target = parseInt(e.target.value, 10) - 1;
                        handleReorder(index, target);
                      }}
                      className="bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-lg px-2 py-1 ml-1 cursor-pointer focus:ring-1 focus:ring-emerald-400"
                    >
                      {Array.from({ length: 15 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          #{i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Personal Divergence Callout if |Team - Solo| > 5 */}
              {isLargeDiscrepancy && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-200">
                  <AlertTriangle size={15} className="text-amber-400 shrink-0" />
                  <span>
                    <strong>Uwaga na rozbieżność:</strong> Zespół umieścił ten przedmiot na #{teamRank},
                    podczas gdy w Twojej fazie solo był on na #{mySoloRank} (różnica {Math.abs(delta)} pozycji).
                    Podziel się z grupą swoimi argumentami!
                  </span>
                </div>
              )}

              {/* Expandable Hotspot Breakdown Drawer */}
              {inspectedHotspotId === item.id && stat && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-rose-500/30 space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-rose-300 flex items-center gap-1.5">
                      <Flame size={14} />
                      Rozkład głosów solo w zespole (Średnia: #{stat.averageRank}):
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Odchylenie: ±{stat.stdDev} poz.
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {members.map((m) => {
                      const vote = stat.ranksByMember[m.id] ?? '?';
                      return (
                        <div
                          key={m.id}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                        >
                          <ChameleonAvatar color={m.chameleonColor} size="sm" />
                          <span className="text-slate-300 font-semibold">{m.name.split(' ')[0]}:</span>
                          <span className="font-bold text-white">#{vote}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
