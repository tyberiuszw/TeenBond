'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MotivatorRanking } from '@/components/motivators/MotivatorRanking';
import { TeamMotivatorsMatrix } from '@/components/motivators/TeamMotivatorsMatrix';
import { MotivatorCard } from '@/components/motivators/MotivatorCard';
import { CHAMPFROGS_DEFINITIONS } from '@/lib/motivators/cardData';
import { useDemoStore } from '@/lib/demo-store';
import {
  ArrowLeft,
  Sparkles,
  Layers,
  Flame,
  LayoutGrid,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function Stage1Page() {
  const router = useRouter();
  const { getActiveUser } = useDemoStore();
  const activeUser = getActiveUser();
  const isLeader = activeUser?.role === 'leader';

  const [activeTab, setActiveTab] = useState<'ranking' | 'matrix' | 'gallery'>('ranking');

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Top Navigation Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/path"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors p-2 rounded-xl bg-slate-900 border border-slate-800"
        >
          <ArrowLeft size={16} />
          <span>Powrót do Ścieżki Rozwoju</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/path/stage2"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 text-xs font-bold transition-all"
          >
            <span>Przejdź do Etapu 2 (Gry Decyzyjne)</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('ranking')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'ranking'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Layers size={15} />
          <span>Mój Ranking i Postęp Zespołu</span>
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'matrix'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Flame size={15} />
          <span>Macierz Motywatorów (10 × 5)</span>
        </button>

        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'gallery'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <LayoutGrid size={15} />
          <span>Galeria 10 Kart 3D</span>
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'ranking' && (
        <MotivatorRanking
          onProceedToStage2={() => router.push('/path/stage2')}
        />
      )}

      {activeTab === 'matrix' && (
        <TeamMotivatorsMatrix />
      )}

      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles size={20} className="text-emerald-400" />
              <span>Kompletny Katalog 10 Kart CHAMPFROGS (3D Flip)</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Najedź kursorem lub kliknij dowolną kartę, aby płynnie obrócić ją w 3D i poznać pełną definicję.
              Kliknij lupę w prawym górnym rogu karty, aby powiększyć grafikę w Lightboxie!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 justify-items-center">
            {CHAMPFROGS_DEFINITIONS.map((card) => (
              <MotivatorCard
                key={card.id}
                card={card}
                showRankBadge={false}
                className="w-full max-w-[240px]"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
