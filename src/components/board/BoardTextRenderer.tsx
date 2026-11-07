'use client';

import React, { useState, useRef, useEffect } from 'react';
import { BoardElement } from '@/types/board';

interface BoardTextRendererProps {
  element: BoardElement;
  isSelected?: boolean;
  isLockedByOther?: boolean;
  lockedByName?: string;
  lockedByColor?: string;
  onUpdateContent?: (newContent: string) => void;
  onPointerDown?: (e: React.PointerEvent) => void;
  isReadOnly?: boolean;
}

export const BoardTextRenderer: React.FC<BoardTextRendererProps> = ({
  element,
  isSelected,
  isLockedByOther,
  lockedByName,
  onUpdateContent,
  onPointerDown,
  isReadOnly,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(element.content || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const width = Math.max(160, element.width || 200);
  const height = Math.max(40, element.height || 60);

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
      {/* Selection outline */}
      {isSelected && (
        <rect
          x={-4}
          y={-4}
          width={width + 8}
          height={height + 8}
          fill="none"
          stroke="#3B82F6"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
      )}

      {isLockedByOther && (
        <text x={0} y={-8} fill="#EF4444" fontSize={10} fontWeight="bold">
          🔒 {lockedByName || 'Ktoś'} edytuje...
        </text>
      )}

      <foreignObject x={0} y={0} width={width} height={height}>
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full h-full bg-slate-900/10 border border-blue-400 rounded p-1 text-slate-900 font-sans text-base resize-none outline-none"
            placeholder="Wpisz tekst..."
          />
        ) : (
          <div
            style={{ color: element.color || '#0F172A' }}
            className="w-full h-full font-sans font-semibold text-base leading-snug whitespace-pre-wrap break-words pointer-events-none"
          >
            {text || <span className="italic opacity-50">Podwójne kliknięcie, aby edytować tekst</span>}
          </div>
        )}
      </foreignObject>
    </g>
  );
};
