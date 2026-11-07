'use client';

import React from 'react';
import { Plus, Minus, RotateCcw } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}) => {
  const zoomPercent = Math.round(zoom * 100);

  return (
    <div className="absolute bottom-4 right-4 z-40 flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-xl select-none text-white">
      <button
        onClick={onZoomOut}
        className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        title="Pomniejsz (Ctrl+-)"
      >
        <Minus size={15} />
      </button>

      <button
        onClick={onResetZoom}
        className="px-2 py-1 rounded-xl text-xs font-mono font-bold text-slate-200 hover:bg-slate-800 transition-colors min-w-[54px] text-center"
        title="Zresetuj do 100%"
      >
        {zoomPercent}%
      </button>

      <button
        onClick={onZoomIn}
        className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        title="Powiększ (Ctrl++)"
      >
        <Plus size={15} />
      </button>

      <div className="w-px h-4 bg-slate-700 mx-0.5" />

      <button
        onClick={onResetZoom}
        className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        title="Dopasuj do ekranu"
      >
        <RotateCcw size={13} />
      </button>
    </div>
  );
};
