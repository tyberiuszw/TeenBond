'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { MotivatorCardDef, resolveCardAssetUrl } from '@/lib/motivators/cardData';
import { RotateCw, Maximize2, X, Sparkles, BookOpen, Layers } from 'lucide-react';

interface MotivatorCardProps {
  card: MotivatorCardDef;
  rank?: number; // Position 1-10 if placed in ranking
  isCompact?: boolean;
  interactive?: boolean;
  showRankBadge?: boolean;
  onCardClick?: () => void;
  className?: string;
}

export function MotivatorCard({
  card,
  rank,
  isCompact = false,
  interactive = true,
  showRankBadge = true,
  onCardClick,
  className = '',
}: MotivatorCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Drag tracking to prevent accidental flips on drag
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!interactive) return;
    if (dragStartPos.current) {
      const deltaX = Math.abs(e.clientX - dragStartPos.current.x);
      const deltaY = Math.abs(e.clientY - dragStartPos.current.y);
      const totalOffset = Math.hypot(deltaX, deltaY);
      dragStartPos.current = null;

      // Drag safety threshold: ignore click if dragged 5px or more
      if (totalOffset >= 5) {
        return;
      }
    }

    setIsFlipped((prev) => !prev);
    onCardClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!interactive) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setIsFlipped((prev) => !prev);
    }
  };

  const frontImageUrl = resolveCardAssetUrl(card.frontFilename);
  const backImageUrl = resolveCardAssetUrl(card.backFilename);

  return (
    <>
      <div
        className={`group relative select-none ${isCompact ? 'w-44 h-64' : 'w-56 sm:w-64 h-84 sm:h-96'} ${className}`}
        style={{ perspective: '1200px' }}
      >
        {/* Optional rank badge placed above or top-left */}
        {showRankBadge && typeof rank === 'number' && (
          <div
            className={`absolute -top-3 -left-3 z-30 w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shadow-lg transition-transform ${
              rank <= 3
                ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 ring-2 ring-emerald-300'
                : rank <= 7
                ? 'bg-slate-800 text-slate-200 border border-slate-700'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            {rank}
          </div>
        )}

        {/* 3D Rotating Container */}
        <div
          role="button"
          tabIndex={interactive ? 0 : -1}
          aria-pressed={isFlipped}
          aria-label={`Karta motywatora ${card.namePl}. Aktualnie: strona ${isFlipped ? 'tylna z definicją' : 'przednia z grafiką'}. Naciśnij spację lub kliknij, aby obrócić.`}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onKeyDown={handleKeyDown}
          className={`w-full h-full relative cursor-pointer outline-none transition-transform duration-700 ease-out rounded-2xl ${
            interactive ? 'focus-visible:ring-2 focus-visible:ring-emerald-400' : ''
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* ================= AWERS (FRONT) ================= */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950 shadow-xl transition-shadow group-hover:shadow-2xl group-hover:border-slate-700"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)',
            }}
          >
            {/* Card Front Image */}
            <div className="relative w-full h-full">
              <img
                src={frontImageUrl}
                alt={`${card.namePl} - Awers`}
                className="w-full h-full object-cover"
                loading="lazy"
              />

              {/* Top Bar Overlay */}
              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md bg-slate-950/70 border border-white/10"
                  style={{ color: card.color }}
                >
                  [{card.code}] {card.category}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLightboxOpen(true);
                    }}
                    className="p-1 rounded-full backdrop-blur-md bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-900 border border-white/10 pointer-events-auto transition-colors"
                    title="Powiększ kartę (Lightbox)"
                  >
                    <Maximize2 size={12} />
                  </button>
                  <span className="p-1 rounded-full backdrop-blur-md bg-slate-950/70 text-slate-300 border border-white/10">
                    <RotateCw size={12} className="animate-spin-slow" />
                  </span>
                </div>
              </div>

              {/* Bottom Scrim & Name Pill */}
              <div className="absolute inset-x-0 bottom-0 pt-16 pb-3 px-3 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent flex flex-col items-center text-center">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                  CHAMPFROGS
                </span>
                <h4 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-1.5 mt-0.5">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: card.color }}
                  />
                  {card.namePl}
                </h4>
                <p className="text-[10px] text-slate-400 italic">{card.nameEn}</p>
                <span className="text-[10px] text-emerald-400 font-medium mt-1.5 flex items-center gap-1 opacity-90">
                  <RotateCw size={10} />
                  <span>Kliknij, by poznać definicję</span>
                </span>
              </div>
            </div>
          </div>

          {/* ================= REWERS (BACK) ================= */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            {/* Background texture or back image */}
            <div className="relative w-full h-full">
              <img
                src={backImageUrl}
                alt={`${card.namePl} - Rewers`}
                className="w-full h-full object-cover opacity-35"
                loading="lazy"
              />

              {/* Glassmorphic content container */}
              <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-between bg-slate-950/80 backdrop-blur-md text-white">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs text-slate-950"
                      style={{ backgroundColor: card.color }}
                    >
                      {card.code}
                    </span>
                    <div>
                      <h4 className="font-black text-xs sm:text-sm text-white">{card.namePl}</h4>
                      <p className="text-[10px] text-slate-400 italic">{card.nameEn}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLightboxOpen(true);
                    }}
                    className="p-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Powiększ definicję"
                  >
                    <Maximize2 size={13} />
                  </button>
                </div>

                {/* Body Definition */}
                <div className="my-auto space-y-3 py-2">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                      <BookOpen size={11} />
                      <span>Definicja (PL):</span>
                    </span>
                    <p className="text-xs sm:text-sm font-medium text-slate-100 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                      „{card.definitionPl}”
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 block">
                      Official wording (EN):
                    </span>
                    <p className="text-[11px] text-slate-300 italic leading-snug">
                      &quot;{card.definitionEn}&quot;
                    </p>
                  </div>
                </div>

                {/* Footer hint */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                    <Layers size={11} />
                    <span>Kategoria: {card.category}</span>
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <RotateCw size={10} />
                    <span>Obróć</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= LIGHTBOX MODAL ================= */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Zamknij podgląd"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3">
              <span
                className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg text-slate-950 shadow-md"
                style={{ backgroundColor: card.color }}
              >
                {card.code}
              </span>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white">{card.namePl}</h3>
                <p className="text-xs sm:text-sm text-slate-400 italic">
                  {card.nameEn} • Kategoria: {card.category}
                </p>
              </div>
            </div>

            {/* Image & Definitions split */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className="aspect-[2/3] max-h-80 w-auto mx-auto rounded-2xl overflow-hidden border border-slate-700 shadow-xl bg-slate-950">
                <img
                  src={isFlipped ? backImageUrl : frontImageUrl}
                  alt={card.namePl}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                    Definicja w języku polskim:
                  </span>
                  <p className="text-sm font-medium text-slate-100 leading-relaxed">
                    „{card.definitionPl}”
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-1.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Definicja oryginalna (EN):
                  </span>
                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    &quot;{card.definitionEn}&quot;
                  </p>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => setIsFlipped((prev) => !prev)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700"
                  >
                    <RotateCw size={14} />
                    <span>Obróć na {isFlipped ? 'Awers' : 'Rewers'}</span>
                  </button>
                  <button
                    onClick={() => setIsLightboxOpen(false)}
                    className="py-2.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
                  >
                    Zamknij
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
