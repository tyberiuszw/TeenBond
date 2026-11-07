'use client';

import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle, Flame, Pause, Play } from 'lucide-react';

interface ZinTimerBarProps {
  initialSeconds?: number;
  onTimeout: () => void;
  isPaused?: boolean;
}

export const ZinTimerBar: React.FC<ZinTimerBarProps> = ({
  initialSeconds = 1500, // 25 minutes
  onTimeout,
  isPaused = false,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [paused, setPaused] = useState(isPaused);

  useEffect(() => {
    if (paused || secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paused, secondsLeft, onTimeout]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Progressive warning tiers:
  // <= 60s: Critical Crimson
  // <= 300s (5m): Urgency Orange
  // <= 600s (10m): Warning Amber
  // > 600s: Calm Emerald
  const isCritical = secondsLeft <= 60 && secondsLeft > 0;
  const isUrgent = secondsLeft <= 300 && secondsLeft > 60;
  const isWarning = secondsLeft <= 600 && secondsLeft > 300;
  const isExpired = secondsLeft === 0;

  return (
    <div
      className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl border transition-all select-none shadow-lg ${
        isExpired
          ? 'bg-rose-950/80 border-rose-600 text-rose-300 animate-pulse'
          : isCritical
          ? 'bg-rose-950/80 border-rose-500 text-rose-400 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]'
          : isUrgent
          ? 'bg-orange-950/60 border-orange-500 text-orange-400'
          : isWarning
          ? 'bg-amber-950/60 border-amber-500 text-amber-300'
          : 'bg-slate-900/90 border-slate-700/80 text-emerald-400'
      }`}
    >
      {isCritical ? (
        <Flame size={16} className="text-rose-400 animate-bounce" />
      ) : isUrgent ? (
        <AlertTriangle size={16} className="text-orange-400 animate-pulse" />
      ) : (
        <Clock size={16} />
      )}

      <div className="flex flex-col">
        <span className="text-sm font-mono font-black tracking-widest leading-none">
          {timeFormatted}
        </span>
        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider leading-tight">
          {isExpired
            ? 'Czas minął!'
            : isCritical
            ? 'Ostatnia minuta!'
            : isUrgent
            ? '5 min do końca'
            : isWarning
            ? '10 min do końca'
            : 'Czas na obelisk'}
        </span>
      </div>

      {/* Demo pause / resume button */}
      <button
        onClick={() => setPaused((p) => !p)}
        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
        title={paused ? 'Wznów odliczanie' : 'Wstrzymaj odliczanie'}
      >
        {paused ? <Play size={12} /> : <Pause size={12} />}
      </button>
    </div>
  );
};
