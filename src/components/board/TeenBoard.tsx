'use client';

import React, { useEffect, useState } from 'react';
import { BoardCanvas } from './BoardCanvas';
import { BoardToolbar } from './BoardToolbar';
import { ZoomControls } from './ZoomControls';
import { PageNavigator } from './PageNavigator';
import { PrivateCalculator } from './PrivateCalculator';
import { useTeenBoardStore } from '@/lib/board/teenboard-store';
import { BoardElement, BoardBackgroundType } from '@/types/board';
import { DEMO_TEENBOARD_ELEMENTS } from '@/lib/demo-mock-data';

interface TeenBoardProps {
  currentUserId?: string;
  roomId?: string;
  isReadOnly?: boolean;
  initialElements?: BoardElement[];
  background?: BoardBackgroundType;
  mode?: 'default' | 'drawing_only' | 'corkboard';
  className?: string;
  onElementsChange?: (elements: BoardElement[]) => void;
}

export const TeenBoard: React.FC<TeenBoardProps> = ({
  currentUserId = 'demo-user-anna',
  roomId = 'default-room',
  isReadOnly = false,
  initialElements,
  background: propBackground,
  mode = 'default',
  className = '',
  onElementsChange,
}) => {
  const {
    activeTool,
    setTool,
    strokeColor,
    setStrokeColor,
    strokeWidth,
    setStrokeWidth,
    camera,
    zoomIn,
    zoomOut,
    resetZoom,
    undoManager,
    undo,
    redo,
    clearLines,
    pages,
    activePageId,
    switchPage,
    addPage,
    duplicatePage,
    setPageBackground,
    calculatorManager,
    toggleCalculator,
    calculateExpression,
    insertCalculationAsSticky,
    elements,
    loadElements,
    setReadOnly,
    setRoomId,
  } = useTeenBoardStore();

  const [calcState, setCalcState] = useState(() => calculatorManager.getState(currentUserId));

  // Sync room & read-only state
  useEffect(() => {
    setRoomId(roomId);
    setReadOnly(isReadOnly);
  }, [roomId, isReadOnly, setRoomId, setReadOnly]);

  // Load initial elements or default demo elements
  useEffect(() => {
    if (initialElements && initialElements.length > 0) {
      loadElements(initialElements);
    } else if (Object.keys(elements).length === 0) {
      loadElements(DEMO_TEENBOARD_ELEMENTS as BoardElement[]);
    }
  }, [initialElements]);

  // Notify parent of element changes if callback provided
  useEffect(() => {
    if (onElementsChange) {
      onElementsChange(Object.values(elements));
    }
  }, [elements, onElementsChange]);

  // Keep calculator state synced
  const handleToggleCalc = () => {
    toggleCalculator(currentUserId);
    setCalcState({ ...calculatorManager.getState(currentUserId) });
  };

  const handleCalculate = (expr: string) => {
    const res = calculateExpression(currentUserId, expr);
    setCalcState({ ...calculatorManager.getState(currentUserId) });
    return res;
  };

  const handleInsertSticky = () => {
    insertCalculationAsSticky(currentUserId);
    handleToggleCalc(); // optionally close or minimize after insert
  };

  const activePage = pages.find((p) => p.id === activePageId) || pages[0];
  const effectiveBackground = propBackground || activePage?.background || 'dots';

  return (
    <div className={`relative w-full h-full overflow-hidden bg-slate-950 select-none ${className}`}>
      {/* Floating Top Toolbar */}
      <BoardToolbar
        activeTool={activeTool}
        onSelectTool={setTool}
        strokeColor={strokeColor}
        onSelectColor={setStrokeColor}
        strokeWidth={strokeWidth}
        onSelectWidth={setStrokeWidth}
        canUndo={undoManager.canUndo(currentUserId)}
        canRedo={undoManager.canRedo(currentUserId)}
        onUndo={() => undo(currentUserId)}
        onRedo={() => redo(currentUserId)}
        onClearLines={() => clearLines(currentUserId)}
        onToggleCalculator={handleToggleCalc}
        isCalculatorOpen={calcState.isOpen}
        isReadOnly={isReadOnly}
        mode={mode}
      />

      {/* Main Interactive SVG + Canvas Viewport */}
      <BoardCanvas
        currentUserId={currentUserId}
        isReadOnly={isReadOnly}
        background={effectiveBackground}
        mode={mode}
      />

      {/* Floating Bottom-Left Page Navigator */}
      {mode !== 'drawing_only' && (
        <PageNavigator
          pages={pages}
          activePageId={activePageId}
          onSwitchPage={switchPage}
          onAddPage={() => addPage()}
          onDuplicatePage={duplicatePage}
          onSetBackground={setPageBackground}
          isReadOnly={isReadOnly}
        />
      )}

      {/* Floating Bottom-Right Zoom Controls */}
      <ZoomControls
        zoom={camera.zoom}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
      />

      {/* Floating Private Calculator (strictly local to current user) */}
      <PrivateCalculator
        state={calcState}
        onClose={handleToggleCalc}
        onCalculate={handleCalculate}
        onInsertSticky={handleInsertSticky}
      />
    </div>
  );
};
