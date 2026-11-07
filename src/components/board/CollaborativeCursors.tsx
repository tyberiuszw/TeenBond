'use client';

import React from 'react';
import { CursorState, CanvasTransform } from '@/types/board';
import { worldToScreen } from '@/lib/board/coordinateUtils';

interface CollaborativeCursorsProps {
  cursors: Record<string, CursorState>;
  currentUserId: string;
  camera: CanvasTransform;
}

export const CollaborativeCursors: React.FC<CollaborativeCursorsProps> = ({
  cursors,
  currentUserId,
  camera,
}) => {
  const peers = Object.values(cursors).filter((c) => c.userId !== currentUserId);

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {peers.map((peer, idx) => {
        const screenPos = worldToScreen(peer.x, peer.y, camera);

        // Check if collision with previous cursor, apply slight offset to label
        const isColliding = peers.some(
          (other, oIdx) =>
            oIdx < idx && Math.hypot(other.x - peer.x, other.y - peer.y) < 20
        );

        return (
          <div
            key={peer.userId}
            className="absolute transition-transform duration-75 ease-out will-change-transform"
            style={{
              transform: `translate3d(${screenPos.x}px, ${screenPos.y}px, 0)`,
            }}
          >
            {/* Chameleon-colored Cursor arrow SVG */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="drop-shadow-sm -rotate-45 origin-top-left"
            >
              <path
                d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
                fill={peer.color || '#3B82F6'}
                stroke="#FFFFFF"
                strokeWidth="1.5"
              />
            </svg>

            {/* Chameleon name badge */}
            <div
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold text-white shadow-md whitespace-nowrap select-none font-sans ${
                isColliding ? 'mt-4 ml-3' : 'mt-1 ml-3'
              }`}
              style={{ backgroundColor: peer.color || '#3B82F6' }}
            >
              <span>{peer.name || 'Uczestnik'}</span>
              {peer.activeTool && peer.activeTool !== 'select' && (
                <span className="opacity-80 text-[9px] uppercase tracking-wider">
                  ({peer.activeTool})
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
