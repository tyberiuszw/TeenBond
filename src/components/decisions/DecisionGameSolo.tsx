'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getScenario, DecisionItemDef } from '@/lib/decisions/scenarios';
import { getMockSoloSubmissions } from '@/lib/decisions/mockSubmissions';
import { useDemoStore } from '@/lib/demo-store';
import { ChameleonAvatar } from '@/components/brand/ChameleonAvatar';
import { RoleBadge } from '@/components/ui/RoleBadge';
import {
  Clock,
  CheckCircle2,
  Lock,
  ArrowUp,
  ArrowDown,
  GripVertical,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { getDecisionIcon } from './decisionIcons';

interface DecisionGameSoloProps {
  scenarioId: 'lost_at_sea' | 'moon';
  onCompleteSolo: (userRanking: string[], allSubmissions?: Record<string, string[]>) => void;
  onProceedToPhase2: () => void;
}

export function DecisionGameSolo({
  scenarioId,
  onCompleteSolo,
  onProceedToPhase2,
}: DecisionGameSoloProps) {
  const scenario = getScenario(scenarioId);
  const { activeUserId, members, getActiveUser, switchActiveUser } = useDemoStore();
  const activeUser = getActiveUser();

  // Initial anti-bias random shuffle (Fisher-Yates)
  const [itemIds, setItemIds] = useState<string[]>(() => {
    const list = scenario.items.map((i) => i.id);
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  });

  const [isLocked, setIsLocked] = useState(false);

  // Synchronized countdown timer (default 600s = 10 min)
  const [secondsRemaining, setSecondsRemaining] = useState(600);
  const [timerActive, setTimerActive] = useState(true);

  // Track team submissions in local state for the demo
  const [soloSubmissions, setSoloSubmissions] = useState<Record<string, string[]>>({});

  // Drag state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Timer interval
  useEffect(() => {
    if (!timerActive || isLocked || secondsRemaining <= 0) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, isLocked, secondsRemaining]);

  const handleAutoSubmit = () => {
    setIsLocked(true);
    const mockSubs = getMockSoloSubmissions(scenarioId, activeUserId, itemIds);
    const subs: Record<string, string[]> = {
      ...mockSubs,
      ...soloSubmissions,
      [activeUserId]: itemIds,
    };
    setSoloSubmissions(subs);
    onCompleteSolo(itemIds, subs);
  };

  const handleManualSubmit = () => {
    setIsLocked(true);
    const mockSubs = getMockSoloSubmissions(scenarioId, activeUserId, itemIds);
    const subs: Record<string, string[]> = {
      ...mockSubs,
      ...soloSubmissions,
      [activeUserId]: itemIds,
    };
    setSoloSubmissions(subs);
    onCompleteSolo(itemIds, subs);
  };

  const handleUnlock = () => {
    setIsLocked(false);
  };

  // Reordering
  const moveItem = (fromIndex: number, toIndex: number) => {
    if (isLocked) return;
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= itemIds.length) return;

    const next = [...itemIds];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setItemIds(next);
  };

  // Drag handlers
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
      moveItem(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
  };

  // Simulation in demo mode
  const handleSimulateAll = () => {
    const mockSubs = getMockSoloSubmissions(scenarioId, activeUserId, itemIds);
    const subs: Record<string, string[]> = {
      ...mockSubs,
      ...soloSubmissions,
      [activeUserId]: itemIds,
    };
    members.forEach((m) => {
      if (!subs[m.id]) {
        subs[m.id] = mockSubs[m.id] || [...itemIds];
      }
    });
    setSoloSubmissions(subs);
    setIsLocked(true);
    onCompleteSolo(itemIds, subs);
  };

  const submittedCount = Object.keys(soloSubmissions).length;
  const allReady = submittedCount >= members.length && isLocked;

  // Format timer MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder.toString().padStart(2, '0')}`;
  };

  const timerColor =
    secondsRemaining > 120
      ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
      : secondsRemaining > 60
      ? 'text-amber-400 border-amber-500/40 bg-amber-500/10'
      : 'text-rose-400 border-rose-500/50 bg-rose-500/15 animate-pulse';

  return (
    <div className="space-y-8 w-full max-w-5xl mx-auto">
      {/* ================= HEADER & TIMER BAR ================= */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
            <span>Faza 1: Ranking Indywidualny</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {scenario.titlePl}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Uszereguj 15 przedmiotów samodzielnie, bez konsultacji z zespołem. W Fazie 2 porównacie
            swoje typy i wypracujecie wspólną listę!
          </p>
        </div>

        {/* Timer Box */}
        <div className="flex flex-col items-center sm:items-end gap-2 w-full md:w-auto">
          <div className={`px-5 py-2.5 rounded-2xl border flex items-center gap-3 ${timerColor}`}>
            <Clock size={20} />
            <div className="text-right">
              <span className="text-2xl font-mono font-black tracking-wider">
                {formatTime(secondsRemaining)}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 block -mt-1">
                Pozostały czas
              </span>
            </div>
          </div>

          {/* Quick timer helper in demo */}
          <div className="flex gap-1.5 text-[10px] text-slate-400">
            <button
              onClick={() => setSecondsRemaining(60)}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              1m
            </button>
            <button
              onClick={() => setSecondsRemaining(300)}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              5m
            </button>
            <button
              onClick={() => setSecondsRemaining(600)}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              10m
            </button>
          </div>
        </div>
      </div>

      {/* ================= LOBBY WAITING ROSTER ================= */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Clock size={15} className="text-emerald-400" />
          <span>Postęp Fazy 1 zespołu ({submittedCount} / {members.length} gotowych):</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {members.map((member) => {
            const hasSubmitted = Boolean(soloSubmissions[member.id]);
            const isMe = member.id === activeUserId;

            return (
              <div
                key={member.id}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
                  isMe
                    ? 'bg-slate-800 border-2 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
                style={{ borderColor: isMe ? member.chameleonColor : undefined }}
              >
                <ChameleonAvatar color={member.chameleonColor} size="sm" />
                <span className="font-bold text-slate-200">{member.name.split(' ')[0]}</span>
                {hasSubmitted ? (
                  <CheckCircle2 size={14} className="text-emerald-400" />
                ) : (
                  <Clock size={14} className="text-amber-400 animate-pulse" />
                )}
              </div>
            );
          })}
        </div>

        {!allReady && (
          <button
            type="button"
            onClick={handleSimulateAll}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
          >
            Symuluj resztę zespołu
          </button>
        )}
      </div>

      {/* ================= ALL READY TRANSITION BANNER ================= */}
      {allReady && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-2 border-emerald-500/50 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                Wszyscy gracze zatwierdzili rankingi solo!
              </h3>
              <p className="text-xs text-slate-300">
                Czas na dyskusję zespołową, zderzenie argumentów i wypracowanie wspólnego konsensusu.
              </p>
            </div>
          </div>

          <button
            onClick={onProceedToPhase2}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl flex items-center gap-2 transition-all transform hover:scale-105 shrink-0"
          >
            <span>Przejdź do Fazy 2 (Zespołowej)</span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* ================= SUBMISSION ACTION BAR ================= */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
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
                <span className="text-xs font-semibold text-slate-400">
                  Przeciągnij lub wpisz numer, aby zmienić kolejność
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isLocked ? (
            <button
              onClick={handleUnlock}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw size={14} />
              <span>Odblokuj ranking</span>
            </button>
          ) : (
            <button
              onClick={handleManualSubmit}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg flex items-center gap-2 transition-all"
            >
              <CheckCircle2 size={16} />
              <span>Zatwierdź mój ranking (15 przedmiotów)</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= 15 ITEMS LIST ================= */}
      <div className="space-y-3">
        {itemIds.map((itemId, index) => {
          const item = scenario.items.find((i) => i.id === itemId);
          if (!item) return null;

          const IconComponent = getDecisionIcon(item.iconName);
          const rank = index + 1;
          const isTop3 = rank <= 3;
          const isDraggingThis = draggedIndex === index;
          const isOverThis = dragOverIndex === index;

          return (
            <div
              key={item.id}
              draggable={!isLocked}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-4 ${
                isDraggingThis
                  ? 'opacity-40 scale-95 border-dashed border-cyan-400'
                  : isOverThis
                  ? 'bg-cyan-500/10 border-cyan-400 scale-[1.01]'
                  : isTop3
                  ? 'bg-slate-900 border-emerald-500/40 shadow-sm'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              {/* Left Rank & Handle & Icon */}
              <div className="flex items-center gap-3 overflow-hidden">
                {!isLocked && (
                  <button
                    type="button"
                    className="text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing p-1 shrink-0"
                    title="Przeciągnij"
                  >
                    <GripVertical size={18} />
                  </button>
                )}

                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-md ${
                    isTop3
                      ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  #{rank}
                </div>

                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-800 text-emerald-400 shrink-0 border border-slate-700"
                >
                  <IconComponent size={18} />
                </div>

                <div className="overflow-hidden">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-white text-xs sm:text-sm truncate">
                      {item.namePl}
                    </h4>
                    <span className="text-[10px] text-slate-400 italic hidden md:inline">
                      ({item.nameEn})
                    </span>
                    <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                      {item.categoryLabelPl}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {item.shortDescriptionPl}
                  </p>
                </div>
              </div>

              {/* Right: Quick Buttons & Numeric Dropdown */}
              {!isLocked && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveItem(index, index - 1)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 transition-colors"
                    title="Przesuń w górę"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    disabled={index === itemIds.length - 1}
                    onClick={() => moveItem(index, index + 1)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 transition-colors"
                    title="Przesuń w dół"
                  >
                    <ArrowDown size={14} />
                  </button>

                  <select
                    value={rank}
                    onChange={(e) => {
                      const target = parseInt(e.target.value, 10) - 1;
                      moveItem(index, target);
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
