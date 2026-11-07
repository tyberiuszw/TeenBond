'use client';

import React from 'react';
import { LOST_AT_SEA_SCENARIO, NASA_MOON_SCENARIO, ScenarioDef } from '@/lib/decisions/scenarios';
import { Compass, Moon, Clock, Users, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface ScenarioSelectorProps {
  selectedScenario: 'lost_at_sea' | 'moon';
  onSelectScenario: (scenarioId: 'lost_at_sea' | 'moon') => void;
  onConfirm: () => void;
}

export function ScenarioSelector({
  selectedScenario,
  onSelectScenario,
  onConfirm,
}: ScenarioSelectorProps) {
  const scenarios: ScenarioDef[] = [LOST_AT_SEA_SCENARIO, NASA_MOON_SCENARIO];

  return (
    <div className="space-y-8 w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
          <Compass size={14} className="text-emerald-400" />
          <span>Etap 2: Kooperacyjna Gra Decyzyjna</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          Wybierz Scenariusz Decyzyjny dla Zespołu
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Wybierzcie jedno z dwóch klasycznych wyzwań przetrwania. Drugi, niewykorzystany scenariusz
          zostanie automatycznie oddelegowany do <strong>Etapu 6 (Tryb Swobodny / Sandbox)</strong>,
          gdzie będziecie mogli zagrać w niego ponownie!
        </p>
      </div>

      {/* Scenario Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {scenarios.map((sc) => {
          const isSelected = selectedScenario === sc.id;
          const isSea = sc.id === 'lost_at_sea';

          return (
            <div
              key={sc.id}
              onClick={() => onSelectScenario(sc.id)}
              className={`p-6 sm:p-8 rounded-3xl border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-900 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.25)] scale-[1.02]'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              {/* Selected Pin */}
              {isSelected && (
                <div className="absolute top-0 right-0 px-4 py-1 rounded-bl-2xl bg-emerald-500 text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                  <ShieldCheck size={14} />
                  <span>Wybrany Scenariusz</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-lg ${
                      isSea
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white'
                        : 'bg-gradient-to-br from-purple-500 to-indigo-500 text-white'
                    }`}
                  >
                    {isSea ? <Compass size={24} /> : <Moon size={24} />}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                      {sc.expertAuthority}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white">{sc.titlePl}</h3>
                    <p className="text-xs text-slate-400 italic">{sc.titleEn}</p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                  {sc.contextPl}
                </p>

                {/* Features & Items Pill */}
                <div className="flex flex-wrap gap-2 pt-1 text-xs">
                  <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-200 font-semibold border border-slate-700 flex items-center gap-1.5">
                    <Clock size={13} className="text-emerald-400" />
                    <span>~{sc.estimatedTimeMin} min (2 fazy)</span>
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-200 font-semibold border border-slate-700 flex items-center gap-1.5">
                    <Users size={13} className="text-cyan-400" />
                    <span>15 przedmiotów</span>
                  </span>
                </div>
              </div>

              {/* Selection button */}
              <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {isSelected ? 'Kliknij poniżej, aby rozpocząć' : 'Kliknij, aby wybrać'}
                </span>
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 shadow-md scale-110'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  <ArrowRight size={16} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delegation Notice & Confirmation CTA */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-emerald-400 shrink-0" />
          <p className="text-xs text-slate-300">
            Wybrany scenariusz: <strong className="text-white">
              {selectedScenario === 'lost_at_sea' ? 'Zagubieni na Morzu' : 'Przetrwanie na Księżycu'}
            </strong>. Niewykorzystany scenariusz zostanie przeniesiony do <strong>Etapu 6 (Sandbox)</strong>.
          </p>
        </div>

        <button
          onClick={onConfirm}
          className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all transform hover:scale-105"
        >
          <span>Rozpocznij Fazę 1 (Indywidualną)</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
