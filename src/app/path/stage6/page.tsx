'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { KalamburyContainer } from '@/components/kalambury/KalamburyContainer';
import { TeenBoard } from '@/components/board/TeenBoard';
import { useDemoStore } from '@/lib/demo-store';
import {
  ArrowLeft,
  PartyPopper,
  Layout,
  Eye,
  Gamepad2,
  Compass,
  Rocket,
  Film,
  Building,
  Skull,
  Play,
  Sparkles,
} from 'lucide-react';

export default function Stage6Page() {
  const { activeUserId } = useDemoStore();
  const [activeTab, setActiveTab] = useState<'kalambury' | 'scenarios' | 'free_board'>('kalambury');

  const replayScenarios = [
    {
      id: 'nasa_moon',
      title: 'NASA Moon Survival',
      stageBadge: 'Scenariusz Etapu 2 (Dodatkowy)',
      description:
        'Awaryjne lądowanie na oświetlonej stronie Księżyca 300 km od bazy matki. Uszeregujcie 15 ocalałych przedmiotów według klucza ekspertów NASA.',
      href: '/path/stage2',
      icon: Rocket,
      accent: 'from-cyan-500 to-blue-600',
    },
    {
      id: 'lost_at_sea',
      title: 'Lost at Sea (Zagubieni na Morzu)',
      stageBadge: 'Scenariusz Etapu 2 (Powtórka)',
      description:
        'Dryfujecie na tratwie ratunkowej na południowym Pacyfiku po pożarze jachtu. Sprawdźcie synergię decyzyjną według klucza US Coast Guard.',
      href: '/path/stage2',
      icon: Compass,
      accent: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'techstream_murder',
      title: 'Zabójstwo w Rezydencji TechStream',
      stageBadge: 'Scenariusz Etapu 5 (Dodatkowy)',
      description:
        'Prezes James Mulligan zostaje zamordowany podczas pokazu fajerwerków o 20:05. Przeanalizujcie mapę rezydencji, sekretne przejście i 21 poszlak.',
      href: '/path/stage5',
      icon: Building,
      accent: 'from-rose-500 to-amber-600',
    },
    {
      id: 'movie_murder',
      title: 'Tajemnica na Planie Filmowym',
      stageBadge: 'Scenariusz Etapu 5 (Powtórka)',
      description:
        'Reżyser ginie na planie filmowym. 10 podejrzanych, 18 poszlak eliminacyjnych i tablica śledcza z czerwoną włóczką.',
      href: '/path/stage5',
      icon: Film,
      accent: 'from-amber-500 to-orange-600',
    },
    {
      id: 'dracula_synergy',
      title: 'Przebudzenie Drakuli (2 Podgrupy)',
      stageBadge: 'Scenariusz Etapu 5 (Międzyzespołowy)',
      description:
        'Podział na Czerwone Nietoperze i Czarne Koty, 2 osobne tablice TeenBoard oraz Strefa Negocjacji 1-na-1. Odkryjcie rozwiązanie Sobota 9:00!',
      href: '/path/stage5',
      icon: Skull,
      accent: 'from-purple-500 to-indigo-600',
    },
    {
      id: 'zin_obelisk_replay',
      title: 'The Zin Obelisk (Atlantyda)',
      stageBadge: 'Scenariusz Etapu 4 (Powtórka)',
      description:
        '33 karty informacyjne rozdzielone między graczy, 25 minut i wspólne obliczenia na tablicy TeenBoard.',
      href: '/path/stage4',
      icon: Sparkles,
      accent: 'from-teal-500 to-emerald-600',
    },
  ];

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-slate-950">
      {/* Top Breadcrumb Navigation */}
      <div className="h-12 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-xs text-slate-300 z-30 select-none">
        <div className="flex items-center gap-3">
          <Link
            href="/path"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Powrót do Ścieżki</span>
          </Link>
          <div className="w-px h-4 bg-slate-700 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="font-black text-cyan-400 font-mono">ETAP 06</span>
            <span className="text-slate-400">•</span>
            <span className="font-bold text-white">Tryb Swobodny & Kalambury</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            onClick={() => setActiveTab('kalambury')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
              activeTab === 'kalambury'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PartyPopper size={13} />
            <span>Kalambury Integracyjne</span>
          </button>
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
              activeTab === 'scenarios'
                ? 'bg-purple-500 text-white shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gamepad2 size={13} />
            <span>Powtórki Scenariuszy</span>
          </button>
          <button
            onClick={() => setActiveTab('free_board')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
              activeTab === 'free_board'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layout size={13} />
            <span>Swobodna Tablica TeenBoard</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/relations"
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 font-bold transition-colors"
          >
            <Eye size={13} />
            <span className="hidden sm:inline">Drzewko Relacji</span>
          </Link>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 w-full h-full relative overflow-hidden">
        {activeTab === 'kalambury' ? (
          <KalamburyContainer />
        ) : activeTab === 'scenarios' ? (
          <div className="w-full h-full overflow-y-auto p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
            <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/50 via-slate-900 to-cyan-950/40 border border-purple-500/30 shadow-xl space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold uppercase tracking-wider">
                <Gamepad2 size={14} />
                <span>Biblioteka Aktywności Dodatkowych (Etap 6)</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Niewykorzystane Scenariusze z Etapu 2, 4 i 5
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                W Trybie Swobodnym Lider i zespół mogą dowolnie uruchamiać alternatywne scenariusze decyzyjne oraz śledcze, które nie zostały wybrane podczas pierwszego przejścia ścieżki.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {replayScenarios.map((scen) => {
                const Icon = scen.icon;
                return (
                  <div
                    key={scen.id}
                    className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 shadow-lg flex flex-col justify-between space-y-4 transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-800 text-emerald-300 border border-slate-700">
                          {scen.stageBadge}
                        </span>
                        <div className={`p-2 rounded-xl bg-gradient-to-br ${scen.accent} text-white shadow-md`}>
                          <Icon size={18} />
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-white">{scen.title}</h3>
                      <p className="text-xs text-slate-300 leading-relaxed">{scen.description}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex justify-end">
                      <Link
                        href={scen.href}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r ${scen.accent} text-white font-bold text-xs shadow-md hover:opacity-95 transition-all`}
                      >
                        <Play size={13} />
                        <span>Uruchom Scenariusz</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <TeenBoard
            currentUserId={activeUserId}
            roomId="free-play-board"
            background="dots"
          />
        )}
      </div>
    </div>
  );
}
