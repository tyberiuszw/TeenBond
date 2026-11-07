'use client';

import React from 'react';
import { BoardElement } from '@/types/board';
import { pointsToSvgPath } from '@/lib/board/pathSmoothing';

interface BoardPathRendererProps {
  element: BoardElement;
  isSelected?: boolean;
  onPointerDown?: (e: React.PointerEvent) => void;
}

export const BoardPathRenderer: React.FC<BoardPathRendererProps> = ({
  element,
  isSelected,
  onPointerDown,
}) => {
  if (!element.points || element.points.length < 2) return null;

  const pathData = pointsToSvgPath(element.points);
  const isHighlighter = element.type === 'path' && element.color.startsWith('rgba');
  const strokeWidth = element.strokeWidth || 4;

  return (
    <g
      id={element.id}
      className="cursor-pointer select-none"
      onPointerDown={onPointerDown}
    >
      {/* Invisible wider stroke for easier pointer selection */}
      <path
        d={pathData}
        fill="none"
        stroke="transparent"
        strokeWidth={Math.max(16, strokeWidth + 10)}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Main visible path */}
      <path
        d={pathData}
        fill="none"
        stroke={element.color}
        strokeWidth={strokeWidth}
        strokeLinecap={isHighlighter ? 'square' : 'round'}
        strokeLinejoin={isHighlighter ? 'bevel' : 'round'}
        opacity={isHighlighter ? 0.4 : 1.0}
        className={isSelected ? 'filter drop-shadow-[0_0_4px_rgba(59,130,246,0.6)]' : ''}
      />

      {isSelected && (
        <path
          d={pathData}
          fill="none"
          stroke="#3B82F6"
          strokeWidth={1}
          strokeDasharray="4 4"
          pointerEvents="none"
        />
      )}
    </g>
  );
};
