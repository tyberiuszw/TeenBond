import React from 'react';

export function GraphLegend() {
  return (
    <div className="pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
      <div className="flex items-center gap-2">
        <span className="w-5 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10B981]" />
        <div>
          <span className="text-slate-200 font-bold block">Klasa 4 (W ≥ 8)</span>
          <span className="text-slate-400 text-[10px]">Gruba 6px + Poświata</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="w-5 h-1.5 rounded-full bg-blue-500" />
        <div>
          <span className="text-slate-200 font-bold block">Klasa 3 (4–7)</span>
          <span className="text-slate-400 text-[10px]">Średnia 3px ciągła</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="w-5 h-0.5 rounded-full bg-slate-400" />
        <div>
          <span className="text-slate-200 font-bold block">Klasa 2 (1–3)</span>
          <span className="text-slate-400 text-[10px]">Cienka 1px ciągła</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="w-5 h-0.5 border-t-2 border-dashed border-red-500" />
        <div>
          <span className="text-slate-200 font-bold block">Klasa 1 (W ≤ 0)</span>
          <span className="text-slate-400 text-[10px]">Przerywana (tarcia)</span>
        </div>
      </div>
    </div>
  );
}
