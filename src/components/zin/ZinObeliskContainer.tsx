'use client';

import React, { useState, useEffect } from 'react';
import { TeenBoard } from '@/components/board/TeenBoard';
import { ZinTimerBar } from './ZinTimerBar';
import { ZinClueDrawer } from './ZinClueDrawer';
import { ZinConsensusBar } from './ZinConsensusBar';
import { ZinSolutionModal } from './ZinSolutionModal';
import { EvaluationSurveyModal } from '@/components/relations/EvaluationSurveyModal';
import { ZIN_CLUES } from '@/lib/zin/cluesData';
import { distributeZinCluesToMembers } from '@/lib/zin/partitioner';
import { useDemoStore } from '@/lib/demo-store';
import { BoardElement } from '@/types/board';
import { DEMO_TEENBOARD_ELEMENTS } from '@/lib/demo-mock-data';
import { Sparkles, Trophy } from 'lucide-react';

export const ZinObeliskContainer: React.FC = () => {
  const { members, activeUserId, getActiveUser, setZinSolved, zinSolved } = useDemoStore();
  const activeUser = getActiveUser();

  const [isReadOnly, setIsReadOnly] = useState(false);
  const [readiedUsers, setReadiedUsers] = useState<string[]>(['demo-user-bartek', 'demo-user-celina', 'demo-user-dawid', 'demo-user-ewa']);
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [showSurveyModal, setShowSurveyModal] = useState(false);

  // Partition clues among members
  const memberIds = members.map((m) => m.id);
  const clueDist = distributeZinCluesToMembers(memberIds, ZIN_CLUES);
  const myCardIds = clueDist[activeUserId] || [];
  const myCards = ZIN_CLUES.filter((c) => myCardIds.includes(c.id));

  const handleTimeout = () => {
    setIsReadOnly(true);
  };

  const handleToggleReady = () => {
    if (readiedUsers.includes(activeUserId)) {
      setReadiedUsers((prev) => prev.filter((id) => id !== activeUserId));
    } else {
      setReadiedUsers((prev) => [...prev, activeUserId]);
    }
  };

  const handleAnswerSuccess = () => {
    setIsReadOnly(true);
    setZinSolved(true);
    setShowSolutionModal(true);
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-slate-950">
      {/* Top Banner Bar for Stage 4 */}
      <div className="absolute top-4 left-4 z-40 flex items-center gap-2">
        <ZinTimerBar initialSeconds={1500} onTimeout={handleTimeout} />

        {zinSolved && (
          <button
            onClick={() => setShowSolutionModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs shadow-lg hover:bg-emerald-400 transition-all select-none"
          >
            <Trophy size={14} />
            <span>Rozwiązanie (Neptiminus)</span>
          </button>
        )}
      </div>

      {/* Main Board Viewport */}
      <div className="flex-1 w-full h-full relative">
        <TeenBoard
          currentUserId={activeUserId}
          roomId="zin-obelisk-room"
          isReadOnly={isReadOnly}
          initialElements={DEMO_TEENBOARD_ELEMENTS as BoardElement[]}
        />
      </div>

      {/* Floating Bottom Consensus & Answer Bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-[90vw]">
        <ZinConsensusBar
          currentUserId={activeUserId}
          totalMembersCount={members.length}
          readiedUserIds={readiedUsers}
          onToggleReady={handleToggleReady}
          onAnswerCorrect={handleAnswerSuccess}
          isBoardReadOnly={isReadOnly}
        />
      </div>

      {/* Private Collapsible Clue Drawer */}
      <ZinClueDrawer
        assignedCards={myCards}
        userColor={activeUser?.chameleonColor || '#10B981'}
        userName={activeUser?.name || 'Twoje'}
      />

      {/* 5-Step Solution & Calendar Proof Debriefing Modal */}
      <ZinSolutionModal
        isOpen={showSolutionModal}
        onClose={() => setShowSolutionModal(false)}
        onOpenSurvey={() => setShowSurveyModal(true)}
      />

      {/* Post-Stage 4 Evaluation Survey Modal (updates Relationship Tree) */}
      <EvaluationSurveyModal
        isOpen={showSurveyModal}
        onClose={() => setShowSurveyModal(false)}
        stageNumber={4}
      />
    </div>
  );
};
