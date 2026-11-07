'use client';

import React, { useState, useRef } from 'react';
import { ToolType } from '@/types/board';
import {
  MousePointer,
  Pen,
  Highlighter,
  Minus,
  Square,
  Circle,
  Type,
  StickyNote,
  Eraser,
  Flame,
  Calculator as CalcIcon,
  Undo2,
  Redo2,
  Trash2,
} from 'lucide-react';

interface BoardToolbarProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  strokeColor: string;
  onSelectColor: (color: string) => void;
  strokeWidth: number;
  onSelectWidth: (width: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClearLines: () => void;
  onToggleCalculator: () => void;
  isCalculatorOpen?: boolean;
  isReadOnly?: boolean;
  mode?: 'default' | 'drawing_only' | 'corkboard';
}

const COLOR_PALETTE = [
  { hex: '#FEF08A', name: 'Żółty pastelowy' },
  { hex: '#BBF7D0', name: 'Zielony pastelowy' },
  { hex: '#BAE6FD', name: 'Niebieski pastelowy' },
  { hex: '#FBCFE8', name: 'Różowy pastelowy' },
  { hex: '#FED7AA', name: 'Pomarańczowy pastelowy' },
  { hex: '#E9D5FF', name: 'Fioletowy pastelowy' },
  { hex: '#3B82F6', name: 'Niebieski intensywny' },
  { hex: '#EF4444', name: 'Czerwony' },
  { hex: '#0F172A', name: 'Ciemny grafit' },
];

const STROKE_WIDTHS = [2, 4, 8, 14];

export const BoardToolbar: React.FC<BoardToolbarProps> = ({
  activeTool,
  onSelectTool,
  strokeColor,
  onSelectColor,
  strokeWidth,
  onSelectWidth,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClearLines,
  onToggleCalculator,
  isCalculatorOpen,
  isReadOnly,
  mode = 'default',
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const eraserHoldTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleEraserPointerDown = () => {
    eraserHoldTimerRef.current = setTimeout(() => {
      setShowClearConfirm(true);
    }, 500); // 500ms long-press triggers clear modal
  };

  const handleEraserPointerUp = () => {
    if (eraserHoldTimerRef.current) {
      clearTimeout(eraserHoldTimerRef.current);
      eraserHoldTimerRef.current = null;
    }
  };

  const isDrawingOnly = mode === 'drawing_only';

  return (
    <>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-2xl select-none max-w-[95vw] overflow-x-auto scrollbar-none">
        {/* Undo / Redo */}
        <div className="flex items-center gap-1 pr-1.5 border-r border-slate-700/80">
          <button
            onClick={onUndo}
            disabled={!canUndo || isReadOnly}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Cofnij (Ctrl+Z)"
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo || isReadOnly}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Ponów (Ctrl+Y)"
          >
            <Redo2 size={16} />
          </button>
        </div>

        {/* Primary Tools */}
        <div className="flex items-center gap-1 px-1 border-r border-slate-700/80">
          {!isDrawingOnly && (
            <button
              onClick={() => onSelectTool('select')}
              className={`p-2 rounded-xl transition-all ${
                activeTool === 'select'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Wskaźnik / Zaznacz (V)"
            >
              <MousePointer size={16} />
            </button>
          )}

          <button
            onClick={() => onSelectTool('brush')}
            className={`p-2 rounded-xl transition-all ${
              activeTool === 'brush'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Pędzel / Ołówek (P)"
          >
            <Pen size={16} />
          </button>

          {!isDrawingOnly && (
            <button
              onClick={() => onSelectTool('highlighter')}
              className={`p-2 rounded-xl transition-all ${
                activeTool === 'highlighter'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Zakreślacz (H)"
            >
              <Highlighter size={16} />
            </button>
          )}

          <button
            onClick={() => onSelectTool('line')}
            className={`p-2 rounded-xl transition-all ${
              activeTool === 'line'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Linia prosta (Shift: snap 45°)"
          >
            <Minus size={16} className="-rotate-45" />
          </button>

          <button
            onClick={() => onSelectTool('rect')}
            className={`p-2 rounded-xl transition-all ${
              activeTool === 'rect'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Prostokąt / Karta"
          >
            <Square size={16} />
          </button>

          <button
            onClick={() => onSelectTool('circle')}
            className={`p-2 rounded-xl transition-all ${
              activeTool === 'circle'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Okrąg / Elipsa"
          >
            <Circle size={16} />
          </button>

          {!isDrawingOnly && (
            <>
              <button
                onClick={() => onSelectTool('text')}
                className={`p-2 rounded-xl transition-all ${
                  activeTool === 'text'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="Tekst (T)"
              >
                <Type size={16} />
              </button>

              <button
                onClick={() => onSelectTool('sticky')}
                className={`p-2 rounded-xl transition-all ${
                  activeTool === 'sticky'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="Karteczka samoprzylepna (S)"
              >
                <StickyNote size={16} />
              </button>
            </>
          )}

          {/* Line-only eraser */}
          <button
            onClick={() => onSelectTool('eraser')}
            onPointerDown={handleEraserPointerDown}
            onPointerUp={handleEraserPointerUp}
            onPointerLeave={handleEraserPointerUp}
            className={`p-2 rounded-xl transition-all ${
              activeTool === 'eraser'
                ? 'bg-rose-500 text-white shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Gumka do linii (przytrzymaj 0.5s aby wyczyścić)"
          >
            <Eraser size={16} />
          </button>

          {/* Laser Pointer */}
          {!isDrawingOnly && (
            <button
              onClick={() => onSelectTool('laser')}
              className={`p-2 rounded-xl transition-all ${
                activeTool === 'laser'
                  ? 'bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.6)] font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Wskaźnik laserowy (1.5s zanik)"
            >
              <Flame size={16} />
            </button>
          )}
        </div>

        {/* Colors Swatches */}
        <div className="flex items-center gap-1 px-1 border-r border-slate-700/80">
          {COLOR_PALETTE.map((c) => (
            <button
              key={c.hex}
              onClick={() => onSelectColor(c.hex)}
              className={`w-5 h-5 rounded-full border transition-transform ${
                strokeColor === c.hex
                  ? 'scale-125 border-white ring-2 ring-emerald-400'
                  : 'border-slate-700 hover:scale-110'
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
        </div>

        {/* Stroke Sizes */}
        <div className="flex items-center gap-1 px-1 border-r border-slate-700/80">
          {STROKE_WIDTHS.map((w) => (
            <button
              key={w}
              onClick={() => onSelectWidth(w)}
              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                strokeWidth === w
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
              title={`Grubość linii: ${w}px`}
            >
              <div
                className="rounded-full bg-current"
                style={{ width: `${Math.min(10, Math.max(3, w / 1.5))}px`, height: `${Math.min(10, Math.max(3, w / 1.5))}px` }}
              />
            </button>
          ))}
        </div>

        {/* Private Calculator Button */}
        {!isDrawingOnly && (
          <button
            onClick={onToggleCalculator}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              isCalculatorOpen
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'bg-slate-800 text-emerald-400 hover:bg-slate-700 border border-slate-700'
            }`}
            title="Prywatny pływający kalkulator"
          >
            <CalcIcon size={14} />
            <span className="hidden sm:inline">Kalkulator</span>
          </button>
        )}
      </div>

      {/* Confirmation modal for clearing board lines */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <h4 className="text-lg font-bold text-white">Wyczyścić linie na tablicy?</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ta operacja usunie wyłącznie odręczne rysunki i linie na bieżącej stronie. Twoje notatki, kształty i tekst pozostaną nienaruszone.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={() => {
                  onClearLines();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow-md transition-colors"
              >
                Wyczyść linie
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
