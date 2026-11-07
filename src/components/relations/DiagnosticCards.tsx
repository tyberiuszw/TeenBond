import React from 'react';
import { Sparkles, Lightbulb, HeartHandshake, AlertTriangle } from 'lucide-react';
import { TeamDiagnosticSummary } from '@/types/relationship';

interface DiagnosticCardsProps {
  summary: TeamDiagnosticSummary;
  synergyDelta?: number;
}

export function DiagnosticCards({ summary, synergyDelta }: DiagnosticCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Card 1: Synergy */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-emerald-500/30 shadow-lg space-y-2 hover:border-emerald-500/50 transition-colors">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
          <Sparkles size={16} />
          <span>
            Efekt Synergii {synergyDelta !== undefined ? `(${synergyDelta > 0 ? '+' : ''}${synergyDelta.toFixed(1)})` : ''}
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {summary.synergyText}
        </p>
      </div>

      {/* Card 2: Silent Expert */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-amber-500/30 shadow-lg space-y-2 hover:border-amber-500/50 transition-colors">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <Lightbulb size={16} />
          <span>Cichy Ekspert</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {summary.expertText}
        </p>
      </div>

      {/* Card 3: Trust Pillars */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-pink-500/30 shadow-lg space-y-2 hover:border-pink-500/50 transition-colors">
        <div className="flex items-center gap-2 text-pink-400 font-bold text-sm">
          <HeartHandshake size={16} />
          <span>Filary Relacji i Empatii</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {summary.cohesionText}
        </p>
      </div>

      {/* Card 4: Support & Mediation */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-rose-500/30 shadow-lg space-y-2 hover:border-rose-500/50 transition-colors">
        <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
          <AlertTriangle size={16} />
          <span>Obszar do Wsparcia (Mediacja)</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {summary.frictionText}
        </p>
      </div>
    </div>
  );
}
