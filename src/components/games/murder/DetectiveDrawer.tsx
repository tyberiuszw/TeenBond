'use client';

import React, { useState } from 'react';
import { EvidenceCard, SuspectCharacter } from '@/types/game';
import { BookOpen, ChevronLeft, ChevronRight, Key, Eye, User } from 'lucide-react';

interface DetectiveDrawerProps {
  assignedCharacter?: SuspectCharacter;
  assignedEvidences: EvidenceCard[];
  userColor?: string;
  userName?: string;
}

export const DetectiveDrawer: React.FC<DetectiveDrawerProps> = ({
  assignedCharacter,
  assignedEvidences,
  userColor = '#10B981',
  userName = 'Twoje Notatki',
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`fixed top-24 right-0 z-40 flex items-center gap-2 px-3 py-2.5 rounded-l-2xl font-bold text-xs shadow-2xl transition-all ${
          isOpen
            ? 'bg-slate-900 border-l border-t border-b border-slate-700 text-amber-400'
            : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
        }`}
        style={{ boxShadow: '-4px 0 20px rgba(0,0,0,0.4)' }}
        title="Otwórz / Zwiń Notatnik Śledczy"
      >
        <BookOpen size={16} />
        <span>Kajet Śledczy ({assignedEvidences.length})</span>
        {isOpen ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
      </button>

      <div
        className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-slate-950/95 backdrop-blur-xl border-l border-slate-800 z-40 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 pt-16 border-b border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-amber-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                {userName}: Notatnik Śledczy
              </h3>
            </div>
            <span
              className="px-2 py-0.5 rounded-full text-[11px] font-black text-slate-950 font-mono"
              style={{ backgroundColor: userColor }}
            >
              Rola Tajna
            </span>
          </div>

          {/* User's Assigned Role Card */}
          {assignedCharacter && (
            <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-black text-amber-300">
                <User size={14} />
                <span>Twoja Postać: {assignedCharacter.name}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-tight">
                {assignedCharacter.bio}
              </p>
              {assignedCharacter.secretAction && (
                <div className="pt-1 text-[11px] text-amber-200/90 font-medium">
                  🤫 <strong>Tajne zadanie:</strong> {assignedCharacter.secretAction}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Clues List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Twoje Odkryte Poszlaki ({assignedEvidences.length}):
          </div>

          {assignedEvidences.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Brak przypisanych poszlak. Zbadaj tablicę korkową!
            </div>
          ) : (
            assignedEvidences.map((ev) => (
              <div
                key={ev.id}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-1 select-none"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                    {ev.source || 'Dowód'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{ev.category}</span>
                </div>
                <h5 className="text-xs font-bold text-white">{ev.title}</h5>
                <p className="text-xs font-serif text-slate-300 leading-relaxed">
                  „{ev.description}”
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};
