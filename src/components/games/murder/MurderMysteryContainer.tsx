'use client';

import React, { useState } from 'react';
import {
  MurderScenarioId,
  SuspectCharacter,
  EvidenceCard,
  CorkboardThread,
  MurderVerdictSubmission,
} from '@/types/game';
import {
  MOVIE_CHARACTERS,
  MOVIE_EVIDENCES,
  TECHSTREAM_CHARACTERS,
  TECHSTREAM_EVIDENCES,
} from '@/lib/games/murderMysteryData';
import { partitionMurderMysteryRoleAndClues } from '@/lib/games/clueAllocator';
import { SuspectPolaroid } from './SuspectPolaroid';
import { RedYarnLayer } from './RedYarnLayer';
import { VerdictVotingModal } from './VerdictVotingModal';
import { DetectiveDrawer } from './DetectiveDrawer';
import { MurderDebriefModal } from './MurderDebriefModal';
import { EvaluationSurveyModal } from '@/components/relations/EvaluationSurveyModal';
import { useDemoStore } from '@/lib/demo-store';
import {
  Gavel,
  Film,
  Building,
  Sparkles,
  Trophy,
  Pin,
  RefreshCw,
} from 'lucide-react';

export const MurderMysteryContainer: React.FC = () => {
  const { members, activeUserId, getActiveUser, murderSolved, setMurderSolved } = useDemoStore();
  const activeUser = getActiveUser();

  const [scenarioId, setScenarioId] = useState<MurderScenarioId>('movie');
  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);

  // Red yarn connections
  const [threads, setThreads] = useState<CorkboardThread[]>([
    { id: 't-1', fromPinId: 'char-co-star', toPinId: 'char-main', color: '#DC2626' },
  ]);
  const [activePinFrom, setActivePinFrom] = useState<string | null>(null);

  // Voting state
  const [showVotingModal, setShowVotingModal] = useState(false);
  const [showDebriefModal, setShowDebriefModal] = useState(false);
  const [showSurveyModal, setShowSurveyModal] = useState(false);

  const buildDefaultTeammateVotes = (scen: MurderScenarioId): Record<string, MurderVerdictSubmission> => {
    const culprit = scen === 'movie' ? 'char-co-star' : 'char-bob';
    const weapon = scen === 'movie' ? 'Poison' : 'Sword';
    const ts = new Date().toISOString();
    return {
      'demo-user-bartek': { userId: 'demo-user-bartek', suspectId: culprit, weapon, timestamp: ts },
      'demo-user-celina': { userId: 'demo-user-celina', suspectId: culprit, weapon, timestamp: ts },
      'demo-user-dawid': { userId: 'demo-user-dawid', suspectId: culprit, weapon, timestamp: ts },
      'demo-user-ewa': { userId: 'demo-user-ewa', suspectId: culprit, weapon, timestamp: ts },
    };
  };

  const [votes, setVotes] = useState<Record<string, MurderVerdictSubmission>>(() =>
    buildDefaultTeammateVotes('movie')
  );

  const characters = scenarioId === 'movie' ? MOVIE_CHARACTERS : TECHSTREAM_CHARACTERS;
  const isCaseSolved = Boolean(murderSolved[scenarioId]);

  const { assignedCharacter, assignedEvidences } = partitionMurderMysteryRoleAndClues(
    members.map((m) => m.id),
    activeUserId,
    scenarioId
  );

  // Positions for suspect Polaroids on the corkboard
  const suspectPositions: Record<string, { x: number; y: number }> = {};
  characters.forEach((char, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    suspectPositions[char.id] = {
      x: 60 + col * 260,
      y: 90 + row * 240,
    };
  });

  // Calculate pin coordinates (top center of each Polaroid)
  const pinCoords: Record<string, { x: number; y: number }> = {};
  characters.forEach((char) => {
    const pos = suspectPositions[char.id];
    if (pos) {
      pinCoords[char.id] = { x: pos.x + 112, y: pos.y - 12 };
    }
  });

  const handlePinClick = (pinId: string) => {
    if (!activePinFrom) {
      setActivePinFrom(pinId);
    } else if (activePinFrom !== pinId) {
      // Create new yarn thread
      setThreads((prev) => [
        ...prev,
        {
          id: `yarn-${Date.now()}`,
          fromPinId: activePinFrom,
          toPinId: pinId,
          color: '#DC2626',
        },
      ]);
      setActivePinFrom(null);
    } else {
      setActivePinFrom(null);
    }
  };

  const handleVote = (vote: MurderVerdictSubmission) => {
    setVotes((prev) => ({ ...prev, [vote.userId]: vote }));
  };

  const handleVerdictConfirmed = (score: number) => {
    setMurderSolved(scenarioId, true);
    setShowVotingModal(false);
    setShowDebriefModal(true);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#C29B38]/20 overflow-hidden select-none">
      {/* Top Banner Toolbar */}
      <div className="absolute top-4 left-4 z-40 flex items-center gap-2">
        {/* Scenario Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-xl text-white">
          <button
            onClick={() => {
              setScenarioId('movie');
              setThreads([]);
              setVotes(buildDefaultTeammateVotes('movie'));
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              scenarioId === 'movie'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Film size={14} />
            <span>Na Planie Filmowym</span>
          </button>

          <button
            onClick={() => {
              setScenarioId('techstream');
              setThreads([]);
              setVotes(buildDefaultTeammateVotes('techstream'));
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              scenarioId === 'techstream'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Building size={14} />
            <span>Rezydencja TechStream</span>
          </button>
        </div>

        {/* Voting trigger button */}
        <button
          onClick={() => setShowVotingModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs shadow-xl transition-all"
        >
          <Gavel size={14} />
          <span>Złóż Akt Oskarżenia (Głosowanie)</span>
        </button>

        {isCaseSolved && (
          <button
            onClick={() => setShowDebriefModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs shadow-xl hover:bg-emerald-400 transition-all"
          >
            <Trophy size={14} />
            <span>Rekonstrukcja Zbrodni</span>
          </button>
        )}
      </div>

      {/* Main Corkboard Surface with SVG Yarn */}
      <div className="relative flex-1 w-full h-full overflow-auto p-8 bg-[#A57C32]/15">
        {/* Red Yarn SVG Layer */}
        <RedYarnLayer
          threads={threads}
          pinCoords={pinCoords}
          onRemoveThread={(id) => setThreads((prev) => prev.filter((t) => t.id !== id))}
        />

        {/* Suspect Polaroids */}
        {characters.map((char) => {
          const pos = suspectPositions[char.id] || { x: 100, y: 100 };
          return (
            <SuspectPolaroid
              key={char.id}
              suspect={char}
              x={pos.x}
              y={pos.y}
              isSelected={selectedSuspectId === char.id}
              onSelect={() => setSelectedSuspectId(char.id)}
              onPinClick={handlePinClick}
            />
          );
        })}

        {/* Active Pin Hint */}
        {activePinFrom && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full bg-slate-900 border border-rose-500 text-rose-300 text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
            <Pin size={14} />
            <span>Kliknij drugą pinezkę, aby połączyć czerwoną nicią powiązanie!</span>
          </div>
        )}
      </div>

      {/* Detective Notebook Drawer */}
      <DetectiveDrawer
        assignedCharacter={assignedCharacter}
        assignedEvidences={assignedEvidences}
        userColor={activeUser?.chameleonColor}
        userName={activeUser?.name}
      />

      {/* Verdict Consensus Voting Modal */}
      <VerdictVotingModal
        isOpen={showVotingModal}
        onClose={() => setShowVotingModal(false)}
        scenarioId={scenarioId}
        characters={characters}
        currentUserId={activeUserId}
        teammates={members.map((m) => ({ id: m.id, name: m.name, color: m.chameleonColor }))}
        votes={votes}
        onVote={handleVote}
        onVerdictConfirmed={handleVerdictConfirmed}
      />

      {/* Solution Debrief Modal */}
      <MurderDebriefModal
        isOpen={showDebriefModal}
        onClose={() => setShowDebriefModal(false)}
        scenarioId={scenarioId}
        score={150}
        onOpenSurvey={() => setShowSurveyModal(true)}
      />

      {/* Post-Stage 5 Evaluation Survey Modal (updates Relationship Tree) */}
      <EvaluationSurveyModal
        isOpen={showSurveyModal}
        onClose={() => setShowSurveyModal(false)}
        stageNumber={5}
      />
    </div>
  );
};
