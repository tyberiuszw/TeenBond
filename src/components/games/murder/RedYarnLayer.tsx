'use client';

import React from 'react';
import { CorkboardThread } from '@/types/game';
import { getRedYarnBezierPath } from '@/lib/board/pathSmoothing';

interface PinCoord {
  id: string;
  x: number;
  y: number;
}

interface RedYarnLayerProps {
  threads: CorkboardThread[];
  pinCoords: Record<string, { x: number; y: number }>;
  activeDrawingFrom?: { x: number; y: number } | null;
  currentPointer?: { x: number; y: number } | null;
  onRemoveThread?: (threadId: string) => void;
}

export const RedYarnLayer: React.FC<RedYarnLayerProps> = ({
  threads,
  pinCoords,
  activeDrawingFrom,
  currentPointer,
  onRemoveThread,
}) => {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
      {/* Existing Red Threads */}
      {threads.map((thread) => {
        const from = pinCoords[thread.fromPinId];
        const to = pinCoords[thread.toPinId];
        if (!from || !to) return null;

        const pathData = getRedYarnBezierPath(from.x, from.y, to.x, to.y);

        return (
          <g key={thread.id} className="pointer-events-auto group cursor-pointer">
            {/* Wider invisible stroke for clicking */}
            <path
              d={pathData}
              fill="none"
              stroke="transparent"
              strokeWidth={16}
              onClick={() => onRemoveThread?.(thread.id)}
            />
            {/* Drop shadow for physical depth */}
            <path
              d={pathData}
              fill="none"
              stroke="rgba(0,0,0,0.25)"
              strokeWidth={3}
              transform="translate(1, 3)"
            />
            {/* Yarn cord */}
            <path
              d={pathData}
              fill="none"
              stroke={thread.color || '#DC2626'}
              strokeWidth={3}
              strokeLinecap="round"
              className="transition-all group-hover:stroke-rose-400 group-hover:stroke-[4]"
            />
          </g>
        );
      })}

      {/* Active dragging thread preview */}
      {activeDrawingFrom && currentPointer && (
        <path
          d={getRedYarnBezierPath(
            activeDrawingFrom.x,
            activeDrawingFrom.y,
            currentPointer.x,
            currentPointer.y
          )}
          fill="none"
          stroke="#EF4444"
          strokeWidth={2.5}
          strokeDasharray="4 4"
        />
      )}
    </svg>
  );
};
