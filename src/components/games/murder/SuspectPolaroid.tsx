'use client';

import React, { useState } from 'react';
import { SuspectCharacter } from '@/types/game';
import { MapPin, User, ShieldAlert, CheckCircle, HelpCircle } from 'lucide-react';

interface SuspectPolaroidProps {
  suspect: SuspectCharacter;
  x: number;
  y: number;
  isSelected?: boolean;
  onSelect?: () => void;
  onPinClick?: (pinId: string) => void;
}

export type SuspectStatus = 'suspect' | 'prime' | 'cleared' | 'witness';

export const SuspectPolaroid: React.FC<SuspectPolaroidProps> = ({
  suspect,
  x,
  y,
  isSelected,
  onSelect,
  onPinClick,
}) => {
  const [status, setStatus] = useState<SuspectStatus>('suspect');

  const cycleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cycle: SuspectStatus[] = ['suspect', 'prime', 'cleared', 'witness'];
    const nextIdx = (cycle.indexOf(status) + 1) % cycle.length;
    setStatus(cycle[nextIdx]);
  };

  return (
    <div
      onClick={onSelect}
      style={{ left: `${x}px`, top: `${y}px` }}
      className={`absolute w-56 bg-amber-50 p-3 pt-4 rounded-xl shadow-xl border select-none transition-all cursor-pointer ${
        isSelected
          ? 'ring-2 ring-emerald-500 shadow-2xl scale-105 z-30'
          : 'hover:shadow-2xl z-20'
      } ${
        status === 'prime'
          ? 'border-rose-500 ring-2 ring-rose-500/40'
          : status === 'cleared'
          ? 'border-emerald-500 opacity-80'
          : 'border-slate-300'
      }`}
    >
      {/* Top Pushpin */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPinClick?.(suspect.id);
        }}
        className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-500 border-2 border-white shadow-md flex items-center justify-center transition-transform hover:scale-125 z-40"
        title="Kliknij pinezkę, aby połączyć czerwoną nicią"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-white shadow-inner" />
      </button>

      {/* Polaroid Image Area */}
      <div className="w-full h-28 bg-slate-800 rounded-lg flex flex-col items-center justify-center text-slate-400 overflow-hidden relative border border-slate-300/50">
        <User size={40} className="text-slate-500" />
        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">
          {suspect.name.split(' ')[0]}
        </span>

        {/* Status badge */}
        <button
          onClick={cycleStatus}
          className={`absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm transition-all ${
            status === 'prime'
              ? 'bg-rose-600 text-white animate-pulse'
              : status === 'cleared'
              ? 'bg-emerald-600 text-white'
              : status === 'witness'
              ? 'bg-sky-600 text-white'
              : 'bg-amber-500 text-slate-950'
          }`}
          title="Kliknij, aby zmienić status podejrzanego"
        >
          {status === 'prime'
            ? 'Główny podejrzany'
            : status === 'cleared'
            ? 'Oczyszczony'
            : status === 'witness'
            ? 'Świadek'
            : 'Podejrzany'}
        </button>
      </div>

      {/* Polaroid Title and Role */}
      <div className="mt-2.5 text-center">
        <h4 className="text-xs font-black text-slate-900 leading-tight">
          {suspect.name}
        </h4>
        <p className="text-[10px] text-slate-600 font-semibold mt-0.5">
          {suspect.role}
        </p>
      </div>

      {/* Key traits bullet tags */}
      <div className="mt-2 pt-2 border-t border-slate-200/80 flex flex-wrap gap-1">
        {suspect.traits.slice(0, 3).map((t, idx) => (
          <span
            key={idx}
            className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-amber-100/80 text-amber-950 border border-amber-200 truncate max-w-full"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
};
