'use client';

import React, { useState, useEffect } from 'react';
import { MotivatorCardDef, CHAMPFROGS_DEFINITIONS, findCardDef, validateMotivatorRanking } from '@/lib/motivators/cardData';
import { MotivatorCard } from './MotivatorCard';
import { useDemoStore } from '@/lib/demo-store';
import { ChameleonAvatar } from '@/components/brand/ChameleonAvatar';
import { RoleBadge } from '@/components/ui/RoleBadge';
import confetti from 'canvas-confetti';
import {
  GripVertical,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Clock,
  Sparkles,
  Lock,
  Unlock,
  RotateCcw,
  ShieldAlert,
  ArrowRight,
  Flame,
  Award,
} from 'lucide-react';

interface MotivatorRankingProps {
  onAllCompleted?: () => void;
  onProceedToStage2?: () => void;
}

export function MotivatorRanking({ onAllCompleted, onProceedToStage2 }: MotivatorRankingProps) {
  const {
    activeUserId,
    members,
    motivators,
    updateMotivatorRanking,
    switchActiveUser,
    getActiveUser,
  } = useDemoStore();

  const activeUser = getActiveUser();
  const isLeader = activeUser?.role === 'leader';

  // Local card order for the active user: initialize from demoStore or default
  const [rankingIds, setRankingIds] = useState<string[]>(() => {
    const existing = motivators[activeUserId];
    if (existing && existing.length === 10) {
      return existing.map((code) => {
        const found = findCardDef(code);
        return found ? found.id : code.toLowerCase();
      });
    }
    return CHAMPFROGS_DEFINITIONS.map((c) => c.id);
  });

  // Track whether the active user has locked/submitted their ranking
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return Boolean(motivators[activeUserId] && motivators[activeUserId].length === 10);
  });

  // Drag state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Sync ranking when active user switches in demoStore
  useEffect(() => {
    const existing = motivators[activeUserId];
    if (existing && existing.length === 10) {
      const mapped = existing.map((code) => {
        const found = findCardDef(code);
        return found ? found.id : code.toLowerCase();
      });
      setRankingIds(mapped);
      setIsLocked(true);
    } else {
      setRankingIds(CHAMPFROGS_DEFINITIONS.map((c) => c.id));
      setIsLocked(false);
    }
  }, [activeUserId, motivators]);

  // Validation
  const validation = validateMotivatorRanking(rankingIds);

  // Team submissions status: how many members have 10 cards submitted
  const submittedMembers = members.filter((m) => {
    const r = motivators[m.id];
    return r && r.length === 10;
  });
  const allTeamCompleted = submittedMembers.length === members.length && members.length > 0;
  const progressPercent = Math.round((submittedMembers.length / Math.max(1, members.length)) * 100);

  // Trigger confetti once when 100% consensus is achieved
  const [hasFiredConfetti, setHasFiredConfetti] = useState(false);
  useEffect(() => {
    if (allTeamCompleted && !hasFiredConfetti) {
      setHasFiredConfetti(true);
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // Fallback for SSR / mock environments
      }
      onAllCompleted?.();
    }
  }, [allTeamCompleted, hasFiredConfetti, onAllCompleted]);

  // Handle reorder
  const moveCard = (fromIndex: number, toIndex: number) => {
    if (isLocked) return;
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= rankingIds.length) return;

    const next = [...rankingIds];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setRankingIds(next);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (isLocked) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (isLocked) return;
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
    if (isLocked) return;
    e.preventDefault();
    setDragOverIndex(null);
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      moveCard(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
  };

  // Submit active user ranking
  const handleSubmitRanking = () => {
    if (!validation.isValid) return;
    updateMotivatorRanking(activeUserId, rankingIds);
    setIsLocked(true);
  };

  // Unlock to edit again
  const handleUnlock = () => {
    setIsLocked(false);
  };

  // Quick helper to simulate completion by remaining team members in Demo Mode
  const handleSimulateAllMembers = () => {
    // Fill rankings for members who have not submitted yet
    const fallbackPermutation = CHAMPFROGS_DEFINITIONS.map((c) => c.id);
    members.forEach((m) => {
      if (!motivators[m.id] || motivators[m.id].length !== 10) {
        // Deterministic variation for different members
        const reversed = [...fallbackPermutation].reverse();
        updateMotivatorRanking(m.id, m.id === activeUserId ? rankingIds : reversed);
      }
    });
    setIsLocked(true);
  };

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto">
      {/* ================= TOP BANNER & PROGRESS ================= */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} className="text-blue-400" />
            <span>Etap 1: Karty Motywatorów (CHAMPFROGS)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Ułóż swój profil motywacyjny (1–10)
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Przeciągaj karty (Drag & Drop) lub użyj przycisków strzałek, aby uszeregować 10 motywatorów
            od najbardziej wpływowego (1) do najmniej motywującego (10). Kliknij kartę, aby poznać jej definicję 3D!
          </p>
        </div>

        {/* Team Readiness Badge */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-inner flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-emerald-400">
                {submittedMembers.length} / {members.length}
              </span>
              <span className="text-xs font-semibold text-slate-300">graczy zatwierdziło</span>
            </div>
            <div className="w-48 bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {allTeamCompleted ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                <CheckCircle2 size={16} />
                <span>100% Zgody</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleSimulateAllMembers}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
                title="Wypełnij automatycznie pozostałych graczy w Demo"
              >
                Symuluj resztę zespołu
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= 100% CONSENSUS BANNER ================= */}
      {allTeamCompleted && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border-2 border-emerald-500/50 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
              <Award size={26} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>Brawo! Wszyscy uczestnicy zatwierdzili swoje profile</span>
                <Sparkles size={16} className="text-emerald-400" />
              </h3>
              <p className="text-xs text-slate-300">
                Lider ma teraz pełny wgląd w <strong>Macierz Motywatorów Zespołu</strong>, a Etap 2 (Gry Decyzyjne) został odblokowany!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onProceedToStage2 && (
              <button
                onClick={onProceedToStage2}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-lg flex items-center gap-2 transition-all transform hover:scale-105"
              >
                <span>Przejdź do Etapu 2 (Gry Decyzyjne)</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ================= TEAM ROSTER STATUS BAR ================= */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Clock size={15} className="text-emerald-400" />
          <span>Status zatwierdzeń zespołu:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {members.map((member) => {
            const hasSubmitted = Boolean(motivators[member.id] && motivators[member.id].length === 10);
            const isMe = member.id === activeUserId;

            return (
              <button
                key={member.id}
                type="button"
                onClick={() => switchActiveUser(member.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all ${
                  isMe
                    ? 'bg-slate-800 border-2 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
                style={{ borderColor: isMe ? member.chameleonColor : undefined }}
                title={`Przełącz na perspektywę: ${member.name}`}
              >
                <ChameleonAvatar color={member.chameleonColor} size="sm" />
                <span className="font-bold text-slate-200">{member.name}</span>
                {hasSubmitted ? (
                  <CheckCircle2 size={14} className="text-emerald-400" />
                ) : (
                  <Clock size={14} className="text-amber-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= ACTIVE USER ACTION BAR ================= */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <ChameleonAvatar color={activeUser.chameleonColor} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white">{activeUser.name}</span>
              <RoleBadge role={activeUser.role} size="sm" />
              {isLocked ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  <Lock size={11} /> Zatwierdzone
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                  <Unlock size={11} /> W trakcie układania
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {isLocked
                ? 'Twój ranking jest zablokowany. Możesz go odblokować, aby wprowadzić poprawki.'
                : 'Ułóż 10 kart w kolejności preferencji, a następnie kliknij „Zatwierdź swój ranking”.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isLocked ? (
            <button
              onClick={handleUnlock}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw size={14} />
              <span>Zmień kolejność (Odblokuj)</span>
            </button>
          ) : (
            <button
              onClick={handleSubmitRanking}
              disabled={!validation.isValid}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-black text-xs shadow-lg flex items-center gap-2 transition-all"
            >
              <CheckCircle2 size={16} />
              <span>Zatwierdź mój ranking (10 kart)</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= 10 CARDS RANKING LIST ================= */}
      <div className="space-y-4">
        {rankingIds.map((cardId, index) => {
          const card = findCardDef(cardId);
          if (!card) return null;

          const rankNumber = index + 1;
          const isTop3 = rankNumber <= 3;
          const isMid = rankNumber >= 4 && rankNumber <= 7;
          const isBottom = rankNumber >= 8;
          const isDraggingThis = draggedIndex === index;
          const isOverThis = dragOverIndex === index;

          return (
            <div
              key={card.id}
              draggable={!isLocked}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row items-center justify-between gap-4 ${
                isDraggingThis
                  ? 'opacity-40 scale-95 border-dashed border-cyan-400'
                  : isOverThis
                  ? 'bg-cyan-500/10 border-cyan-400 scale-[1.01]'
                  : isTop3
                  ? 'bg-slate-900/90 border-emerald-500/40 shadow-md'
                  : isMid
                  ? 'bg-slate-900/70 border-slate-800'
                  : 'bg-slate-950/80 border-slate-900 text-slate-400'
              }`}
            >
              {/* Left Rank & Handle */}
              <div className="flex items-center gap-4 w-full md:w-auto">
                {!isLocked && (
                  <button
                    type="button"
                    className="text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing p-1"
                    title="Przeciągnij, aby zmienić pozycję"
                  >
                    <GripVertical size={20} />
                  </button>
                )}

                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-md ${
                    isTop3
                      ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950'
                      : isMid
                      ? 'bg-slate-800 text-slate-200 border border-slate-700'
                      : 'bg-slate-900 text-slate-500 border border-slate-800'
                  }`}
                >
                  #{rankNumber}
                </div>

                <div className="overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                      style={{ backgroundColor: card.color }}
                    />
                    <h3 className="text-base font-bold text-white truncate">
                      {card.namePl}
                    </h3>
                    <span className="text-xs text-slate-400 italic hidden sm:inline">
                      ({card.nameEn})
                    </span>
                    {isTop3 && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                        <Flame size={11} /> TOP 3
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                    {card.definitionPl}
                  </p>
                </div>
              </div>

              {/* Right Controls: Position selector + Up/Down buttons + Mini Card Preview */}
              <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                {!isLocked && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveCard(index, index - 1)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 transition-colors"
                      title="Przesuń wyżej"
                    >
                      <ArrowUp size={15} />
                    </button>
                    <button
                      type="button"
                      disabled={index === rankingIds.length - 1}
                      onClick={() => moveCard(index, index + 1)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 transition-colors"
                      title="Przesuń niżej"
                    >
                      <ArrowDown size={15} />
                    </button>

                    {/* Numeric Dropdown 1-10 */}
                    <select
                      value={rankNumber}
                      onChange={(e) => {
                        const target = parseInt(e.target.value, 10) - 1;
                        moveCard(index, target);
                      }}
                      className="bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-lg px-2 py-1 ml-1 cursor-pointer focus:ring-1 focus:ring-emerald-400"
                    >
                      {Array.from({ length: 10 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          Poz. {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 3D Flip Card trigger */}
                <MotivatorCard card={card} isCompact interactive showRankBadge={false} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
