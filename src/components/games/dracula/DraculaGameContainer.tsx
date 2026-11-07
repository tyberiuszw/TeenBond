'use client';

import React, { useState } from 'react';
import { TeenBoard } from '@/components/board/TeenBoard';
import { DraculaNegotiationModal } from './DraculaNegotiationModal';
import { DraculaDebriefModal } from './DraculaDebriefModal';
import { EvaluationSurveyModal } from '@/components/relations/EvaluationSurveyModal';
import {
  DRACULA_FACTS,
  partitionDraculaSubgroups,
  resolveDraculaStrategy,
  DraculaResolution,
} from '@/lib/games/draculaData';
import { DraculaTeam, DraculaFactItem } from '@/types/game';
import { useDemoStore } from '@/lib/demo-store';
import { Users, Lock, ShieldCheck, Flame, Trophy, Scroll, ArrowRight } from 'lucide-react';

export const DraculaGameContainer: React.FC = () => {
  const { members, activeUserId, getActiveUser, draculaSolved, setDraculaResolution } = useDemoStore();
  const activeUser = getActiveUser();

  const memberIds = members.map((m) => m.id);
  const { redBats, blackCats } = partitionDraculaSubgroups(memberIds);

  const [activeSubgroup, setActiveSubgroup] = useState<DraculaTeam>(
    redBats.includes(activeUserId) ? 'red_bats' : 'black_cats'
  );

  const [designatedNegotiators, setDesignatedNegotiators] = useState<{
    red_bats: string;
    black_cats: string;
  }>({
    red_bats: redBats[0] || 'demo-user-anna',
    black_cats: blackCats[0] || 'demo-user-bartek',
  });

  const [showNegotiationModal, setShowNegotiationModal] = useState(false);
  const [showDebriefModal, setShowDebriefModal] = useState(false);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [resolution, setResolution] = useState<DraculaResolution | null>(null);

  const subgroupMemberIds = activeSubgroup === 'red_bats' ? redBats : blackCats;
  const subgroupMembers = members.filter((m) => subgroupMemberIds.includes(m.id));

  const isCurrentNegotiator =
    designatedNegotiators[activeSubgroup] === activeUserId;

  const myTeamFacts = DRACULA_FACTS.filter(
    (f) => f.isShared || f.teamExclusivity === activeSubgroup
  );

  const handleNegotiationSubmit = (day: string, time: string, isSynergy: boolean) => {
    const res = resolveDraculaStrategy(day, time);
    setResolution(res);
    setDraculaResolution(res.points > 0, res.points);
    setShowNegotiationModal(false);
    setShowDebriefModal(true);
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-slate-950 select-none">
      {/* Top Banner Toolbar */}
      <div className="absolute top-4 left-4 z-40 flex items-center gap-2">
        {/* Subgroup Switcher / Indicator */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-xl text-white">
          <button
            onClick={() => setActiveSubgroup('red_bats')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubgroup === 'red_bats'
                ? 'bg-rose-600 text-white shadow-md font-black'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>🦇 Czerwone Nietoperze ({redBats.length})</span>
          </button>

          <button
            onClick={() => setActiveSubgroup('black_cats')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubgroup === 'black_cats'
                ? 'bg-purple-600 text-white shadow-md font-black'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>🐈 Czarne Koty ({blackCats.length})</span>
          </button>
        </div>

        {/* Subgroup Negotiator Selector */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-xl text-xs text-slate-300">
          <Users size={13} className="text-purple-400" />
          <span className="font-semibold">Negocjator:</span>
          <select
            value={designatedNegotiators[activeSubgroup]}
            onChange={(e) =>
              setDesignatedNegotiators((prev) => ({
                ...prev,
                [activeSubgroup]: e.target.value,
              }))
            }
            className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-0.5 text-xs font-bold text-white outline-none focus:border-purple-500"
          >
            {subgroupMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Enter Negotiation Room Button */}
        <button
          onClick={() => setShowNegotiationModal(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-xs shadow-xl transition-all ${
            isCurrentNegotiator
              ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white animate-pulse'
              : 'bg-slate-800 text-purple-300 border border-purple-500/30 hover:bg-slate-700'
          }`}
          title="Wejdź do Strefy Negocjacji 1-na-1"
        >
          <Lock size={14} />
          <span>Strefa Negocjacji 1-na-1</span>
        </button>

        {draculaSolved && resolution && (
          <button
            onClick={() => setShowDebriefModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs shadow-xl hover:bg-emerald-400 transition-all"
          >
            <Trophy size={14} />
            <span>Wynik ({resolution.day} 9:00)</span>
          </button>
        )}
      </div>

      {/* Main Board Viewport for active subgroup */}
      <div className="flex-1 w-full h-full relative">
        <TeenBoard
          key={activeSubgroup}
          currentUserId={activeUserId}
          roomId={`dracula-room-${activeSubgroup}`}
          background="dots"
        />
      </div>

      {/* Persistent Left Fact Sheet Drawer for Active Subgroup */}
      <div className="absolute top-20 left-4 z-30 max-w-xs bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-3xl p-4 shadow-2xl max-h-[70vh] overflow-y-auto space-y-2.5 scrollbar-thin">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Scroll size={16} className="text-purple-400" />
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              {activeSubgroup === 'red_bats' ? 'Karta Faktów #1' : 'Karta Faktów #2'}
            </h4>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {myTeamFacts.length} faktów
          </span>
        </div>

        <div className="space-y-2">
          {myTeamFacts.map((fact) => (
            <div
              key={fact.id}
              className={`p-2.5 rounded-xl border text-xs leading-relaxed select-none ${
                fact.criticalNote
                  ? 'bg-purple-950/40 border-purple-500/60 text-purple-200'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400 mb-0.5">
                <span>Fakt #{fact.factNumber}</span>
                {fact.teamExclusivity && (
                  <span className="text-purple-400 font-bold">• TYLKO DLA WAS</span>
                )}
              </div>
              <p>{fact.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Emissary Negotiation Modal */}
      <DraculaNegotiationModal
        isOpen={showNegotiationModal}
        onClose={() => setShowNegotiationModal(false)}
        currentUserId={activeUserId}
        currentTeam={activeSubgroup}
        isNegotiator={isCurrentNegotiator}
        onAppointSelf={() =>
          setDesignatedNegotiators((prev) => ({
            ...prev,
            [activeSubgroup]: activeUserId,
          }))
        }
        myFacts={myTeamFacts}
        peerFacts={DRACULA_FACTS.filter((f) => f.teamExclusivity && f.teamExclusivity !== activeSubgroup)}
        onSubmitVerdict={handleNegotiationSubmit}
      />

      {/* Debrief Modal */}
      {resolution && (
        <DraculaDebriefModal
          isOpen={showDebriefModal}
          onClose={() => setShowDebriefModal(false)}
          resolution={resolution}
          onOpenSurvey={() => setShowSurveyModal(true)}
        />
      )}

      {/* Post-Stage 5 Evaluation Survey Modal */}
      <EvaluationSurveyModal
        isOpen={showSurveyModal}
        onClose={() => setShowSurveyModal(false)}
        stageNumber={5}
      />
    </div>
  );
};
