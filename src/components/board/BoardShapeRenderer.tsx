'use client';

import React from 'react';
import { BoardElement } from '@/types/board';

interface BoardShapeRendererProps {
  element: BoardElement;
  isSelected?: boolean;
  isLockedByOther?: boolean;
  lockedByName?: string;
  lockedByColor?: string;
  onPointerDown?: (e: React.PointerEvent) => void;
  isReadOnly?: boolean;
}

export const BoardShapeRenderer: React.FC<BoardShapeRendererProps> = ({
  element,
  isSelected,
  isLockedByOther,
  lockedByName,
  lockedByColor,
  onPointerDown,
  isReadOnly,
}) => {
  const width = element.width || 120;
  const height = element.height || 120;
  const strokeWidth = element.strokeWidth ?? 2;
  const strokeColor = isLockedByOther
    ? lockedByColor || '#EF4444'
    : isSelected
    ? '#3B82F6'
    : element.color || '#3B82F6';
  const fillColor = element.fillColor || 'transparent';

  const isCircle = element.shapeType === 'circle' || element.type === 'circle';
  const isLine = element.type === 'line' && element.points && element.points.length >= 4;

  if (isLine && element.points) {
    const [x1, y1, x2, y2] = element.points;
    return (
      <g
        id={element.id}
        className={`select-none ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
        onPointerDown={onPointerDown}
      >
        {/* Invisible wider hit area */}
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="transparent"
          strokeWidth={Math.max(16, strokeWidth + 10)}
        />
        {/* Visible line */}
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={isLockedByOther ? '6 3' : undefined}
          className={isSelected ? 'filter drop-shadow-[0_0_4px_rgba(59,130,246,0.6)]' : ''}
        />
        {isSelected && !isReadOnly && (
          <g className="pointer-events-none">
            <circle cx={x1} cy={y1} r={4} fill="#3B82F6" stroke="#FFFFFF" strokeWidth={1.5} />
            <circle cx={x2} cy={y2} r={4} fill="#3B82F6" stroke="#FFFFFF" strokeWidth={1.5} />
          </g>
        )}
      </g>
    );
  }

  return (
    <g
      id={element.id}
      transform={`translate(${element.x}, ${element.y})`}
      className={`select-none ${isReadOnly ? 'cursor-default' : 'cursor-move'}`}
      onPointerDown={onPointerDown}
    >
      {/* Lock banner if locked by peer */}
      {isLockedByOther && (
        <g transform={`translate(0, -24)`}>
          <rect width={Math.min(160, width)} height={20} rx={4} fill="#0F172A" opacity={0.85} />
          <text x={6} y={14} fill="#FFFFFF" fontSize={10} fontWeight="bold">
            🔒 {lockedByName || 'Ktoś'} edytuje...
          </text>
        </g>
      )}

      {isCircle ? (
        <ellipse
          cx={width / 2}
          cy={height / 2}
          rx={Math.max(5, width / 2)}
          ry={Math.max(5, height / 2)}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={isLockedByOther ? '6 3' : undefined}
        />
      ) : (
        <rect
          width={width}
          height={height}
          rx={6}
          ry={6}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={isLockedByOther ? '6 3' : undefined}
        />
      )}

      {/* Selection outline and corner handles */}
      {isSelected && !isReadOnly && (
        <g className="pointer-events-none">
          <rect
            x={-3}
            y={-3}
            width={width + 6}
            height={height + 6}
            fill="none"
            stroke="#3B82F6"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <circle cx={0} cy={0} r={4} fill="#3B82F6" stroke="#FFFFFF" strokeWidth={1.5} />
          <circle cx={width} cy={0} r={4} fill="#3B82F6" stroke="#FFFFFF" strokeWidth={1.5} />
          <circle cx={0} cy={height} r={4} fill="#3B82F6" stroke="#FFFFFF" strokeWidth={1.5} />
          <circle cx={width} cy={height} r={4} fill="#3B82F6" stroke="#FFFFFF" strokeWidth={1.5} />
        </g>
      )}
    </g>
  );
};
