'use client';

import React, { useState } from 'react';
import { KalamburyChatMessage } from '@/types/game';
import { evaluateGuess } from '@/lib/kalambury/fuzzyMatcher';
import { Send, MessageSquare, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface KalamburyChatPanelProps {
  currentUserId: string;
  currentUserName: string;
  currentUserColor: string;
  isDrawer: boolean;
  hasGuessedCorrectly: boolean;
  secretWord: string;
  messages: KalamburyChatMessage[];
  onCorrectGuess: (points: number) => void;
  onSendMessage: (msg: KalamburyChatMessage) => void;
  timeLeft: number;
}

export const KalamburyChatPanel: React.FC<KalamburyChatPanelProps> = ({
  currentUserId,
  currentUserName,
  currentUserColor,
  isDrawer,
  hasGuessedCorrectly,
  secretWord,
  messages,
  onCorrectGuess,
  onSendMessage,
  timeLeft,
}) => {
  const [inputText, setInputText] = useState('');
  const [almostHint, setAlmostHint] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = inputText.trim();
    if (!raw) return;

    setInputText('');
    setAlmostHint(null);

    // If active drawer, prevent typing in chat
    if (isDrawer) return;

    const evaluation = evaluateGuess(raw, secretWord);

    if (evaluation.isFuzzyMatch) {
      // 1. Correct Guess
      const basePoints = Math.round(50 + 50 * (Math.max(0, Math.min(60, timeLeft)) / 60));
      onCorrectGuess(basePoints);

      const winMessage: KalamburyChatMessage = {
        id: `msg-${Date.now()}`,
        userId: currentUserId,
        userName: currentUserName,
        userColor: currentUserColor,
        text: `odgadł hasło! (+${basePoints} pkt)`,
        isSystem: true,
        isCorrectGuess: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      onSendMessage(winMessage);
    } else if (evaluation.isAlmost) {
      // 2. Close Guess: Public post + private whisper
      const guessMsg: KalamburyChatMessage = {
        id: `msg-${Date.now()}`,
        userId: currentUserId,
        userName: currentUserName,
        userColor: currentUserColor,
        text: raw,
        isSystem: false,
        isCorrectGuess: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      onSendMessage(guessMsg);
      setAlmostHint('Jesteś bardzo blisko! Sprawdź końcówkę lub drobną literówkę.');
    } else {
      // 3. Normal guess message
      const normMsg: KalamburyChatMessage = {
        id: `msg-${Date.now()}`,
        userId: currentUserId,
        userName: currentUserName,
        userColor: currentUserColor,
        text: raw,
        isSystem: false,
        isCorrectGuess: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      onSendMessage(normMsg);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 shadow-2xl select-none">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-emerald-400" />
          <h4 className="text-xs font-black text-white uppercase tracking-wider">
            Zgadywanie na żywo
          </h4>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          {messages.length} wiadomości
        </span>
      </div>

      {/* Messages Scroll Feed */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2 scrollbar-thin">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-2 rounded-xl text-xs ${
              m.isCorrectGuess
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold'
                : m.isSystem
                ? 'bg-slate-800/60 text-slate-400 italic'
                : 'bg-slate-950/60 border border-slate-800/80 text-slate-200'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: m.userColor }}
              />
              <span className="font-bold text-slate-300 truncate text-[11px]">
                {m.userName}
              </span>
              <span className="text-[9px] text-slate-500 ml-auto font-mono">
                {m.timestamp}
              </span>
            </div>
            <p className="pl-3.5 leading-snug break-words">{m.text}</p>
          </div>
        ))}
      </div>

      {/* Private "Blisko!" Whisper Alert */}
      {almostHint && (
        <div className="mx-3 mb-2 p-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] flex items-center gap-2 animate-pulse">
          <AlertCircle size={14} className="flex-shrink-0" />
          <span>{almostHint}</span>
        </div>
      )}

      {/* Input or Status */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80">
        {isDrawer ? (
          <div className="p-2 text-center text-xs text-amber-400 font-bold bg-amber-500/10 rounded-xl border border-amber-500/20">
            🎨 Rysujesz na tablicy! Nie możesz pisać na czacie.
          </div>
        ) : hasGuessedCorrectly ? (
          <div className="p-2 text-center text-xs text-emerald-400 font-bold bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center justify-center gap-1.5">
            <CheckCircle2 size={15} />
            <span>Brawo! Odgadłeś hasło w tej rundzie.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Wpisz swoje przypuszczenie..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-emerald-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-40 transition-colors"
            >
              <Send size={15} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
