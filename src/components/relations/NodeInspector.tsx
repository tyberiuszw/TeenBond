'use client';

import React from 'react';
import { RelationshipNode, RelationshipEdge } from '@/types/relationship';
import { ChameleonAvatar } from '@/components/brand/ChameleonAvatar';
import { RoleBadge } from '@/components/ui/RoleBadge';
import { Info, Sparkles, MessageSquareQuote, CheckCircle2 } from 'lucide-react';

interface NodeInspectorProps {
  selectedNode?: RelationshipNode;
  selectedEdge?: RelationshipEdge;
  nodes: RelationshipNode[];
}

export function NodeInspector({ selectedNode, selectedEdge, nodes }: NodeInspectorProps) {
  if (!selectedNode && !selectedEdge) {
    return (
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 text-center text-slate-400 text-xs">
        Wybierz gracza lub krawędź na grafie, aby zobaczyć diagnozę.
      </div>
    );
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div className="space-y-4">
      {/* Node Details Card */}
      {selectedNode && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Info size={14} />
              <span>Diagnoza Dynamiki Gracza</span>
            </span>
            <RoleBadge role={selectedNode.role} size="sm" />
          </div>

          <div className="flex items-center gap-3">
            <ChameleonAvatar
              color={selectedNode.color}
              name={selectedNode.name}
              size="lg"
              showOnlineStatus
            />
            <div>
              <h3 className="text-lg font-bold text-white">{selectedNode.name}</h3>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-md inline-block mt-0.5"
                style={{
                  backgroundColor: `${selectedNode.color}20`,
                  color: selectedNode.color,
                }}
              >
                Kolor: {selectedNode.color}
              </span>
            </div>
          </div>

          {/* Rule-based Diagnostic Tooltip */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <MessageSquareQuote size={13} className="text-emerald-400" />
              <span>Deterministyczny Wniosek Diagnostyczny:</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
              "{selectedNode.tooltipText}"
            </p>
          </div>

          {/* Votes received breakdown */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Otrzymane wskazania w ankiecie:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Q1 Współpraca (+3):</span>
                <span className="font-bold text-emerald-400">
                  {selectedNode.votes.cooperation}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Q2 Słuchanie (+2):</span>
                <span className="font-bold text-pink-400">
                  {selectedNode.votes.listening}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Q3 Cel (+2):</span>
                <span className="font-bold text-purple-400">
                  {selectedNode.votes.goal}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Q4 Chaos (-1):</span>
                <span className="font-bold text-red-400">
                  {selectedNode.votes.chaos}
                </span>
              </div>
            </div>
          </div>

          {/* Leader rating if available */}
          {selectedNode.leaderRating && (
            <div className="pt-2 border-t border-slate-800 text-xs text-slate-300 flex justify-between">
              <span>
                Zaangażowanie: <strong className="text-white">{selectedNode.leaderRating.engagement}/5</strong>
              </span>
              <span>
                Otwartość: <strong className="text-white">{selectedNode.leaderRating.openness}/5</strong>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Edge Details Card (if selected) */}
      {selectedEdge && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Szczegóły Wybranej Relacji:</span>
            <span
              className="text-xs font-black px-2 py-0.5 rounded-md"
              style={{
                backgroundColor: `${selectedEdge.color}20`,
                color: selectedEdge.color,
              }}
            >
              Waga W = {selectedEdge.weight > 0 ? `+${selectedEdge.weight}` : selectedEdge.weight}
            </span>
          </div>
          <div className="text-xs text-slate-300 font-semibold">
            {nodeMap.get(selectedEdge.source)?.name || selectedEdge.source} ↔{' '}
            {nodeMap.get(selectedEdge.target)?.name || selectedEdge.target}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">{selectedEdge.description}</p>
        </div>
      )}
    </div>
  );
}
