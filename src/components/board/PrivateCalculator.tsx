'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CalculatorState } from '@/types/board';
import {
  Calculator as CalcIcon,
  X,
  Minus,
  Maximize2,
  Delete,
  StickyNote,
  History,
} from 'lucide-react';

interface PrivateCalculatorProps {
  state: CalculatorState;
  onClose: () => void;
  onCalculate: (expression: string) => number;
  onInsertSticky: () => void;
}

export const PrivateCalculator: React.FC<PrivateCalculatorProps> = ({
  state,
  onClose,
  onCalculate,
  onInsertSticky,
}) => {
  const [expr, setExpr] = useState(state.expression || '');
  const [displayResult, setDisplayResult] = useState(state.result || '');
  const [isMinimized, setIsMinimized] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Dragging state
  const [position, setPosition] = useState(state.position || { x: 100, y: 140 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, startX: 0, startY: 0 });

  useEffect(() => {
    if (state.expression) setExpr(state.expression);
    if (state.result) setDisplayResult(state.result);
  }, [state.expression, state.result]);

  if (!state.isOpen) return null;

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startX: position.x,
      startY: position.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    const newX = Math.max(10, Math.min(window.innerWidth - 300, dragStartRef.current.startX + dx));
    const newY = Math.max(10, Math.min(window.innerHeight - 380, dragStartRef.current.startY + dy));
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handleAppend = (token: string) => {
    setExpr((prev) => prev + token);
  };

  const handleClear = () => {
    setExpr('');
    setDisplayResult('');
  };

  const handleBackspace = () => {
    setExpr((prev) => prev.slice(0, -1));
  };

  const handleEvaluate = () => {
    if (!expr.trim()) return;
    try {
      const res = onCalculate(expr);
      const resStr = Number.isInteger(res) ? String(res) : res.toFixed(3);
      setDisplayResult(resStr);
    } catch {
      setDisplayResult('Błąd');
    }
  };

  if (isMinimized) {
    return (
      <div
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        className="fixed z-50 flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-2xl shadow-xl cursor-pointer hover:bg-slate-800 transition-all select-none"
        onClick={() => setIsMinimized(false)}
      >
        <CalcIcon size={16} className="text-emerald-400" />
        <span className="text-xs font-bold">Kalkulator</span>
        <Maximize2 size={13} className="text-slate-400" />
      </div>
    );
  }

  return (
    <div
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      className="fixed z-50 w-72 bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden select-none animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Draggable Header */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between cursor-move text-white"
      >
        <div className="flex items-center gap-2 pointer-events-none">
          <CalcIcon size={15} className="text-emerald-400" />
          <span className="text-xs font-black tracking-wide">Prywatny Kalkulator</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowHistory((h) => !h)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Historia obliczeń"
          >
            <History size={14} />
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Minimalizuj"
          >
            <Minus size={14} />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Zamknij"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* History view overlay or Display */}
      {showHistory ? (
        <div className="p-3 bg-slate-950 h-36 overflow-y-auto space-y-1.5 text-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Historia obliczeń:
          </div>
          {state.history.length === 0 ? (
            <p className="text-slate-500 italic">Brak zapisanych wyników</p>
          ) : (
            state.history.map((h, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 cursor-pointer hover:bg-slate-800"
                onClick={() => {
                  setExpr(h.result);
                  setDisplayResult(h.result);
                  setShowHistory(false);
                }}
              >
                <span className="font-mono">{h.expression}</span>
                <span className="font-bold text-emerald-400">= {h.result}</span>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="p-3 bg-slate-950 flex flex-col justify-end text-right border-b border-slate-800/80 min-h-[72px]">
          <div className="text-xs text-slate-400 font-mono overflow-x-auto whitespace-nowrap scrollbar-none">
            {expr || '0'}
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight mt-0.5">
            {displayResult || (expr ? '' : '0')}
          </div>
        </div>
      )}

      {/* Insert Sticky Button */}
      <div className="px-3 pt-2">
        <button
          onClick={onInsertSticky}
          disabled={!displayResult && !expr}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <StickyNote size={13} />
          <span>Wstaw jako notatkę</span>
        </button>
      </div>

      {/* Keypad */}
      <div className="p-3 grid grid-cols-4 gap-1.5">
        <button
          onClick={handleClear}
          className="p-2.5 rounded-xl bg-slate-800 text-rose-400 hover:bg-slate-700 font-bold text-xs transition-colors"
        >
          C
        </button>
        <button
          onClick={() => handleAppend('(')}
          className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold text-xs transition-colors"
        >
          (
        </button>
        <button
          onClick={() => handleAppend(')')}
          className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold text-xs transition-colors"
        >
          )
        </button>
        <button
          onClick={() => handleAppend('/')}
          className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 font-bold text-sm transition-colors"
        >
          ÷
        </button>

        {['7', '8', '9'].map((n) => (
          <button
            key={n}
            onClick={() => handleAppend(n)}
            className="p-2.5 rounded-xl bg-slate-800/80 text-white hover:bg-slate-700 font-bold text-sm transition-colors"
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => handleAppend('*')}
          className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 font-bold text-sm transition-colors"
        >
          ×
        </button>

        {['4', '5', '6'].map((n) => (
          <button
            key={n}
            onClick={() => handleAppend(n)}
            className="p-2.5 rounded-xl bg-slate-800/80 text-white hover:bg-slate-700 font-bold text-sm transition-colors"
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => handleAppend('-')}
          className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 font-bold text-sm transition-colors"
        >
          −
        </button>

        {['1', '2', '3'].map((n) => (
          <button
            key={n}
            onClick={() => handleAppend(n)}
            className="p-2.5 rounded-xl bg-slate-800/80 text-white hover:bg-slate-700 font-bold text-sm transition-colors"
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => handleAppend('+')}
          className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 font-bold text-sm transition-colors"
        >
          +
        </button>

        <button
          onClick={() => handleAppend('0')}
          className="p-2.5 rounded-xl bg-slate-800/80 text-white hover:bg-slate-700 font-bold text-sm transition-colors"
        >
          0
        </button>
        <button
          onClick={() => handleAppend('.')}
          className="p-2.5 rounded-xl bg-slate-800/80 text-white hover:bg-slate-700 font-bold text-sm transition-colors"
        >
          .
        </button>
        <button
          onClick={handleBackspace}
          className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center transition-colors"
        >
          <Delete size={15} />
        </button>
        <button
          onClick={handleEvaluate}
          className="p-2.5 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-black text-sm shadow-md transition-colors"
        >
          =
        </button>
      </div>
    </div>
  );
};
