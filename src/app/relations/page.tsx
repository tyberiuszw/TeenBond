'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useDemoStore } from '@/lib/demo-store';
import { RoleBadge } from '@/components/ui/RoleBadge';
import {
  Network,
  Sparkles,
  ClipboardList,
  RotateCcw,
  Users,
  Skull,
  Play,
  Trophy,
} from 'lucide-react';
import {
  RelationshipGraph,
  DiagnosticCards,
  ConfidentialNotice,
  NodeInspector,
  GraphLegend,
  EvaluationSurveyModal,
} from '@/components/relations';

export default function RelationsPage() {
  const {
    getActiveUser,
    relationshipGraph,
    decisionData,
    draculaSolved,
    draculaPoints,
    recalculateRelationshipGraph,
  } = useDemoStore();

  const activeUser = getActiveUser();
  const isLeader = activeUser?.role === 'leader';

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('demo-user-dawid');
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);

  // -------------------------------------------------------------
  // RULE: Strict security encapsulation for Leader only (F11)
  // If active user is a member, render ConfidentialNotice and
  // DO NOT leak any graph data into the DOM or client memory.
  // -------------------------------------------------------------
  if (!isLeader) {
    return <ConfidentialNotice activeUserName={activeUser.name} />;
  }

  // Only evaluated when user has verified Leader role
  const { nodes, edges, diagnosticSummary } = relationshipGraph;
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];
  const selectedEdge = edges.find((e) => e.id === selectedEdgeId);

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-emerald-950/40 border border-purple-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold uppercase tracking-wider">
              <Network size={14} className="text-purple-400" />
              <span>Diagnostyka Zaufania i Synergii</span>
            </span>
            <RoleBadge role="leader" size="sm" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Algorytmiczne Drzewko Relacji
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Wagi połączeń W(A,B) wyliczone z wzajemnych ankiet rówieśniczych po Etapie 2.
            Deterministyczny silnik regułowy bez AI generuje diagnozę dynamiki grupy.
          </p>
        </div>

        {/* Right Action Chips & Survey Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="bg-slate-950 p-3 sm:p-4 rounded-2xl border border-slate-800 flex items-center justify-around gap-4">
            <div className="text-center">
              <span className="text-xl sm:text-2xl font-black text-emerald-400">
                {decisionData?.synergyDelta !== undefined
                  ? `${decisionData.synergyDelta > 0 ? '+' : ''}${decisionData.synergyDelta.toFixed(1)}`
                  : '+6.8'}
              </span>
              <p className="text-[10px] text-slate-400 font-medium">Efekt Synergii</p>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-center">
              <span className="text-xl sm:text-2xl font-black text-amber-400">
                Dawid ({decisionData?.individualScores?.['demo-user-dawid'] ?? 22})
              </span>
              <p className="text-[10px] text-slate-400 font-medium">Cichy Ekspert</p>
            </div>
          </div>

          <button
            onClick={() => setIsSurveyModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-slate-950 font-black text-xs shadow-lg transition-all transform hover:scale-105 shrink-0"
          >
            <ClipboardList size={16} />
            <span>Ankieta Poetapowa</span>
          </button>
        </div>
      </div>

      {/* Main Section: Interactive SVG Graph & Details Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SVG Graph Canvas (7 cols on lg) */}
        <div className="lg:col-span-7 bg-slate-900/90 rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Interaktywna Mapa Więzi Zespołowych
              </h2>
            </div>
            <span className="text-xs text-slate-400">Kliknij węzeł lub krawędź</span>
          </div>

          {/* SVG Canvas Viewport */}
          <RelationshipGraph
            nodes={nodes}
            edges={edges}
            selectedNodeId={selectedNodeId}
            selectedEdgeId={selectedEdgeId}
            onSelectNode={(id) => {
              setSelectedNodeId(id);
              setSelectedEdgeId(null);
            }}
            onSelectEdge={(id) => {
              setSelectedEdgeId(id);
              setSelectedNodeId(null);
            }}
          />

          {/* Graph Legend (4 edge classes) */}
          <GraphLegend />
        </div>

        {/* Diagnostic Inspector Panel (5 cols on lg) */}
        <div className="lg:col-span-5">
          <NodeInspector
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            nodes={nodes}
          />
        </div>
      </div>

      {/* 4 Actionable Diagnostic Cards for the Leader */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            Karty Diagnostyczne Zespołu (Widok Poufny Lidera)
          </h3>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Sparkles size={13} className="text-purple-400" />
            <span>Deterministyczny silnik reguł (No AI)</span>
          </span>
        </div>

        <DiagnosticCards
          summary={diagnosticSummary}
          synergyDelta={decisionData?.synergyDelta}
        />
      </div>

      {/* Inter-Team Relations Module (Relacje Międzyzespołowe - Dracula Subgroups) */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] font-bold uppercase tracking-wider">
              <Users size={12} />
              <span>Relacje Międzyzespołowe (Współpraca Podgrup)</span>
            </div>
            <h3 className="text-lg font-black text-white">
              Symulacja Negocjacyjna 2 Podgrup: Scenariusz Dracula
            </h3>
            <p className="text-xs text-slate-300">
              Moduł diagnostyki współpracy między dwiema podgrupami (Czerwone Nietoperze vs Czarne Koty) z pokojem negocjacji 1-na-1.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-base font-black text-purple-400">
                {draculaSolved ? `${draculaPoints} pkt (Synergia)` : 'Gotowy do startu'}
              </span>
              <p className="text-[10px] text-slate-400">Status Misji Dracula</p>
            </div>
            <Link
              href="/path/stage5?game=dracula"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white font-black text-xs shadow-lg transition-all"
            >
              <Play size={14} />
              <span>Uruchom Rozgrywkę Podgrup</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-1.5">
            <div className="font-bold text-rose-300 flex items-center justify-between">
              <span>🦇 Podgrupa A: Czerwone Nietoperze</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-200">Fact Sheet #1</span>
            </div>
            <p className="text-slate-300">
              Skład: Anna (Negocjator), Celina, Ewa • Dysponują informacjami o rozkładzie pociągów z Budapesztu i kołku osikowym.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-1.5">
            <div className="font-bold text-purple-300 flex items-center justify-between">
              <span>🐈 Podgrupa B: Czarne Koty</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-200">Fact Sheet #2</span>
            </div>
            <p className="text-slate-300">
              Skład: Bartek (Negocjator), Dawid • Dysponują wiedzą o czarterze samolotu do Wiednia oraz kluczu do krypty w kościele.
            </p>
          </div>
        </div>
      </div>

      {/* Evaluation Survey Modal */}
      <EvaluationSurveyModal
        isOpen={isSurveyModalOpen}
        onClose={() => setIsSurveyModalOpen(false)}
        stageNumber={2}
      />
    </div>
  );
}
