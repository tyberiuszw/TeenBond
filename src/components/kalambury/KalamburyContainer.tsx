'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TeenBoard } from '@/components/board/TeenBoard';
import { KalamburyChatPanel } from './KalamburyChatPanel';
import { KalamburyWordSelectModal } from './KalamburyWordSelectModal';
import { KalamburyPodiumModal } from './KalamburyPodiumModal';
import { KALAMBURY_WORDS } from '@/lib/kalambury/wordBank';
import { generateMaskedWord } from '@/lib/kalambury/fuzzyMatcher';
import { calculateKalamburyScores } from '@/lib/kalambury/scoringEngine';
import { KalamburyWord, KalamburyChatMessage } from '@/types/game';
import { useDemoStore } from '@/lib/demo-store';
import { Clock, Trophy, Palette, Sparkles, User, RefreshCw } from 'lucide-react';

export const KalamburyContainer: React.FC = () => {
  const { members, activeUserId, getActiveUser } = useDemoStore();
  const activeUser = getActiveUser();

  const [currentDrawerIndex, setCurrentDrawerIndex] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const totalRounds = Math.min(5, members.length);

  const currentDrawer = members[currentDrawerIndex] || members[0];
  const isCurrentActiveUserDrawer = currentDrawer.id === activeUserId;

  const [selectedWord, setSelectedWord] = useState<KalamburyWord>(KALAMBURY_WORDS[0]);
  const [showWordSelectModal, setShowWordSelectModal] = useState(false);
  const [showPodiumModal, setShowPodiumModal] = useState(false);

  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [hasGuessedCorrectly, setHasGuessedCorrectly] = useState(false);
  const [correctGuesserCount, setCorrectGuesserCount] = useState(0);

  // Scores map
  const [playerScores, setPlayerScores] = useState<Record<string, number>>({
    'demo-user-anna': 120,
    'demo-user-bartek': 90,
    'demo-user-celina': 150,
    'demo-user-dawid': 80,
    'demo-user-ewa': 110,
  });

  const [messages, setMessages] = useState<KalamburyChatMessage[]>([
    {
      id: 'init-1',
      userId: 'system',
      userName: 'TeenBond Bot',
      userColor: '#10B981',
      text: 'Runda 1 rozpoczęta! Rysuje Anna. Hasło ma 8 liter.',
      isSystem: true,
      isCorrectGuess: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Revealed letters based on remaining time
  const revealCount = timeLeft <= 15 ? 2 : timeLeft <= 30 ? 1 : 0;
  const maskedWord = isCurrentActiveUserDrawer
    ? selectedWord.word
    : generateMaskedWord(selectedWord.word, revealCount);

  const handleRoundEnd = useCallback(() => {
    setIsTimerRunning(false);

    if (roundNumber >= totalRounds) {
      setShowPodiumModal(true);
    } else {
      setRoundNumber((r) => r + 1);
      setCurrentDrawerIndex((idx) => (idx + 1) % members.length);
      setShowWordSelectModal(true);
    }
  }, [roundNumber, totalRounds, members.length]);

  // Timer tick
  useEffect(() => {
    if (!isTimerRunning || timeLeft <= 0) return;

    const timer = setTimeout(() => {
      if (timeLeft <= 1) {
        setTimeLeft(0);
        handleRoundEnd();
      } else {
        setTimeLeft((prev) => prev - 1);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isTimerRunning, timeLeft, handleRoundEnd]);

  // Simulated bot guess at t=38s if user hasn't guessed
  useEffect(() => {
    if (timeLeft === 38 && !isCurrentActiveUserDrawer) {
      const simulatedMsg: KalamburyChatMessage = {
        id: `sim-${Date.now()}`,
        userId: 'demo-user-bartek',
        userName: 'Bartek',
        userColor: '#8B5CF6',
        text: 'kameleon?',
        isSystem: false,
        isCorrectGuess: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, simulatedMsg]);
    }
  }, [timeLeft, isCurrentActiveUserDrawer]);

  const handleStartRound = () => {
    setTimeLeft(60);
    setIsTimerRunning(true);
    setHasGuessedCorrectly(false);
    setCorrectGuesserCount(0);
  };

  const handleWordSelect = (word: KalamburyWord) => {
    setSelectedWord(word);
    setShowWordSelectModal(false);
    handleStartRound();
  };

  const handleCorrectGuess = (points: number) => {
    setHasGuessedCorrectly(true);
    setCorrectGuesserCount((c) => c + 1);

    // Award guesser points
    setPlayerScores((prev) => ({
      ...prev,
      [activeUserId]: (prev[activeUserId] || 0) + points,
    }));

    // Award drawer points dynamically
    const drawerPts = Math.round(25 * ((correctGuesserCount + 1) / (members.length - 1)));
    setPlayerScores((prev) => ({
      ...prev,
      [currentDrawer.id]: (prev[currentDrawer.id] || 0) + drawerPts,
    }));

    // Accelerate timer to 15s if higher
    setTimeLeft((t) => Math.min(t, 15));
  };

  const handleSendMessage = (msg: KalamburyChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  };

  return (
    <div className="relative w-full h-full flex flex-col sm:flex-row overflow-hidden bg-slate-950 select-none">
      {/* Left/Center Canvas Viewport */}
      <div className="flex-1 h-full relative flex flex-col">
        {/* Top Match Bar */}
        <div className="absolute top-4 left-4 z-40 flex items-center gap-2">
          {/* Round & Drawer Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-xl text-white">
            <span className="text-xs font-black text-emerald-400 font-mono">
              Runda {roundNumber} / {totalRounds}
            </span>
            <div className="w-px h-3.5 bg-slate-700" />
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <Palette size={14} className="text-amber-400" />
              <span>Rysuje: {currentDrawer.name}</span>
            </div>
          </div>

          {/* Masked Word Pill */}
          <div className="px-4 py-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-xl text-white flex items-center gap-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Hasło:
            </span>
            <span className="text-sm font-mono font-black text-emerald-300 tracking-wider">
              {maskedWord}
            </span>
          </div>

          {/* Timer Pill */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border font-mono font-black text-xs shadow-xl transition-all ${
              timeLeft <= 15
                ? 'bg-rose-950/80 border-rose-500 text-rose-400 animate-pulse'
                : 'bg-slate-900/90 border-slate-700 text-cyan-400'
            }`}
          >
            <Clock size={14} />
            <span>{timeLeft}s</span>
          </div>

          {/* Drawer Word Pick Trigger */}
          {isCurrentActiveUserDrawer && !isTimerRunning && (
            <button
              onClick={() => setShowWordSelectModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs shadow-xl hover:bg-emerald-400 transition-all animate-bounce"
            >
              <Sparkles size={14} />
              <span>Wybierz Hasło</span>
            </button>
          )}
        </div>

        {/* Restricted Drawing Canvas */}
        <div className="flex-1 w-full h-full relative">
          <TeenBoard
            currentUserId={activeUserId}
            roomId="kalambury-room"
            isReadOnly={!isCurrentActiveUserDrawer}
            mode="drawing_only"
            background="blank"
          />
        </div>
      </div>

      {/* Right Realtime Chat & Guessing Panel */}
      <div className="w-full sm:w-80 md:w-96 h-64 sm:h-full z-30">
        <KalamburyChatPanel
          currentUserId={activeUserId}
          currentUserName={activeUser?.name || 'Ty'}
          currentUserColor={activeUser?.chameleonColor || '#10B981'}
          isDrawer={isCurrentActiveUserDrawer}
          hasGuessedCorrectly={hasGuessedCorrectly}
          secretWord={selectedWord.word}
          messages={messages}
          onCorrectGuess={handleCorrectGuess}
          onSendMessage={handleSendMessage}
          timeLeft={timeLeft}
        />
      </div>

      {/* Word Selection Modal */}
      <KalamburyWordSelectModal
        isOpen={showWordSelectModal}
        choices={KALAMBURY_WORDS.slice(roundNumber * 3, roundNumber * 3 + 3)}
        onSelectWord={handleWordSelect}
      />

      {/* Match Podium Modal */}
      <KalamburyPodiumModal
        isOpen={showPodiumModal}
        onRestart={() => {
          setShowPodiumModal(false);
          setRoundNumber(1);
          setCurrentDrawerIndex(0);
          handleStartRound();
        }}
        scores={playerScores}
        teammates={members.map((m) => ({ id: m.id, name: m.name, color: m.chameleonColor }))}
      />
    </div>
  );
};
