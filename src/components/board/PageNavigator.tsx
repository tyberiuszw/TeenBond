'use client';

import React from 'react';
import { BoardPage, BoardBackgroundType } from '@/types/board';
import { ChevronLeft, ChevronRight, Plus, Copy, Grid, Disc, AlignJustify, FileText } from 'lucide-react';

interface PageNavigatorProps {
  pages: BoardPage[];
  activePageId: string;
  onSwitchPage: (pageId: string) => void;
  onAddPage: () => void;
  onDuplicatePage?: (pageId: string) => void;
  onSetBackground?: (pageId: string, bg: BoardBackgroundType) => void;
  isReadOnly?: boolean;
}

export const PageNavigator: React.FC<PageNavigatorProps> = ({
  pages,
  activePageId,
  onSwitchPage,
  onAddPage,
  onDuplicatePage,
  onSetBackground,
  isReadOnly,
}) => {
  const currentIndex = pages.findIndex((p) => p.id === activePageId);
  const activePage = pages[currentIndex] || pages[0];

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSwitchPage(pages[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < pages.length - 1) {
      onSwitchPage(pages[currentIndex + 1].id);
    }
  };

  return (
    <div className="absolute bottom-4 left-4 z-40 flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-xl select-none text-white">
      <button
        onClick={handlePrev}
        disabled={currentIndex <= 0}
        className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="Poprzednia strona"
      >
        <ChevronLeft size={16} />
      </button>

      <span className="px-2 text-xs font-bold text-slate-200">
        {currentIndex + 1} / {pages.length}
      </span>

      <button
        onClick={handleNext}
        disabled={currentIndex >= pages.length - 1}
        className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="Następna strona"
      >
        <ChevronRight size={16} />
      </button>

      {!isReadOnly && (
        <>
          <div className="w-px h-4 bg-slate-700 mx-0.5" />
          <button
            onClick={onAddPage}
            className="flex items-center gap-1 p-1.5 px-2 rounded-xl text-emerald-400 hover:bg-slate-800 transition-colors text-xs font-bold"
            title="Dodaj nową stronę"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Strona</span>
          </button>
          {onDuplicatePage && activePage && (
            <button
              onClick={() => onDuplicatePage(activePage.id)}
              className="p-1.5 rounded-xl text-cyan-400 hover:bg-slate-800 transition-colors text-xs font-bold"
              title="Duplikuj bieżącą stronę"
            >
              <Copy size={14} />
            </button>
          )}
        </>
      )}

      {onSetBackground && activePage && !isReadOnly && (
        <>
          <div className="w-px h-4 bg-slate-700 mx-0.5" />
          <div className="flex items-center gap-1">
            <button
              onClick={() => onSetBackground(activePage.id, 'dots')}
              className={`p-1.5 rounded-lg text-xs ${
                activePage.background === 'dots'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
              title="Kropki"
            >
              <Disc size={13} />
            </button>
            <button
              onClick={() => onSetBackground(activePage.id, 'grid')}
              className={`p-1.5 rounded-lg text-xs ${
                activePage.background === 'grid'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
              title="Kratka"
            >
              <Grid size={13} />
            </button>
            <button
              onClick={() => onSetBackground(activePage.id, 'lines')}
              className={`p-1.5 rounded-lg text-xs ${
                activePage.background === 'lines'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
              title="Linie"
            >
              <AlignJustify size={13} />
            </button>
            <button
              onClick={() => onSetBackground(activePage.id, 'blank')}
              className={`p-1.5 rounded-lg text-xs ${
                activePage.background === 'blank'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
              title="Czyste tło"
            >
              <FileText size={13} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
