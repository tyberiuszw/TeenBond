'use client';

import React, { useState, useRef, useEffect } from 'react';
import { BoardElement } from '@/types/board';
import { computeStickyFontSize } from '@/lib/board/typographyUtils';

interface BoardStickyNoteProps {
  element: BoardElement;
  isSelected?: boolean;
  isLockedByOther?: boolean;
  lockedByName?: string;
  lockedByColor?: string;
  onUpdateContent?: (newContent: string) => void;
  onPointerDown?: (e: React.PointerEvent) => void;
  isReadOnly?: boolean;
}

export const BoardStickyNote: React.FC<BoardStickyNoteProps> = ({
  element,
  isSelected,
  isLockedByOther,
  lockedByName,
  lockedByColor,
  onUpdateContent,
  onPointerDown,
  isReadOnly,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(element.content || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const width = element.width || 200;
  const height = element.height || 200;
  const fontSize = computeStickyFontSize(text, width, height);

  useEffect(() => {
    setText(element.content || '');
  }, [element.content]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (onUpdateContent && text !== element.content) {
      onUpdateContent(text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setText(element.content || '');
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isReadOnly && !isLockedByOther) {
      setIsEditing(true);
    }
  };

  return (
    <g
      id={element.id}
      transform={`translate(${element.x}, ${element.y})`}
      onPointerDown={isEditing ? undefined : onPointerDown}
      onDoubleClick={handleDoubleClick}
      className={`select-none ${isReadOnly ? 'cursor-default' : 'cursor-move'}`}
    >
      {/* Drop shadow filter & pastel card */}
      <rect
        width={width}
        height={height}
        rx={8}
        ry={8}
        fill={element.color || '#FEF08A'}
        stroke={
          isLockedByOther
            ? lockedByColor || '#EF4444'
            : isSelected
            ? '#3B82F6'
            : 'rgba(0,0,0,0.08)'
        }
        strokeWidth={isLockedByOther ? 2.5 : isSelected ? 2 : 1}
        strokeDasharray={isLockedByOther ? '6 3' : undefined}
        className="filter drop-shadow-md transition-shadow"
      />

      {/* Lock banner if locked by peer */}
      {isLockedByOther && (
        <g transform={`translate(0, -26)`}>
          <rect
            width={Math.min(180, width)}
            height={22}
            rx={4}
            fill="#0F172A"
            opacity={0.85}
          />
          <text
            x={8}
            y={15}
            fill="#FFFFFF"
            fontSize={11}
            fontWeight="bold"
            className="pointer-events-none"
          >
            🔒 {lockedByName || 'Ktoś'} edytuje...
          </text>
        </g>
      )}

      {/* ForeignObject container for rich HTML text & auto-wrapping */}
      <foreignObject
        x={12}
        y={12}
        width={Math.max(10, width - 24)}
        height={Math.max(10, height - 36)}
      >
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            style={{ fontSize: `${fontSize}px` }}
            className="w-full h-full bg-transparent resize-none border-none outline-none font-sans font-medium text-slate-900 leading-snug p-0"
            placeholder="Wpisz treść notatki..."
          />
        ) : (
          <div
            style={{ fontSize: `${fontSize}px` }}
            className="w-full h-full font-sans font-medium text-slate-900 leading-snug break-words whitespace-pre-wrap overflow-hidden select-none pointer-events-none"
          >
            {text || (
              <span className="text-slate-500 italic text-sm">
                Kliknij dwukrotnie, aby edytować...
              </span>
            )}
          </div>
        )}
      </foreignObject>

      {/* Subtle Author badge at bottom-right */}
      {element.createdBy && (
        <text
          x={width - 10}
          y={height - 8}
          textAnchor="end"
          fontSize={10}
          fill="rgba(15, 23, 42, 0.45)"
          fontWeight="600"
          className="pointer-events-none font-sans"
        >
          {element.createdBy.replace('demo-user-', '').replace('usr-', '')}
        </text>
      )}

      {/* Selection handles */}
      {isSelected && !isReadOnly && (
        <g className="pointer-events-none">
          <circle cx={0} cy={0} r={4} fill="#3B82F6" stroke="#FFFFFF" strokeWidth={1.5} />
          <circle cx={width} cy={0} r={4} fill="#3B82F6" stroke="#FFFFFF" strokeWidth={1.5} />
          <circle cx={0} cy={height} r={4} fill="#3B82F6" stroke="#FFFFFF" strokeWidth={1.5} />
          <circle cx={width} cy={height} r={4} fill="#3B82F6" stroke="#FFFFFF" strokeWidth={1.5} />
        </g>
      )}
    </g>
  );
};
