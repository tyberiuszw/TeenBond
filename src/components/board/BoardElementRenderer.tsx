'use client';

import React from 'react';
import { BoardElement } from '@/types/board';
import { BoardPathRenderer } from './BoardPathRenderer';
import { BoardStickyNote } from './BoardStickyNote';
import { BoardShapeRenderer } from './BoardShapeRenderer';
import { BoardTextRenderer } from './BoardTextRenderer';

interface BoardElementRendererProps {
  element: BoardElement;
  isSelected?: boolean;
  isLockedByOther?: boolean;
  lockedByName?: string;
  lockedByColor?: string;
  onUpdateContent?: (newContent: string) => void;
  onPointerDown?: (e: React.PointerEvent) => void;
  isReadOnly?: boolean;
}

export const BoardElementRenderer: React.FC<BoardElementRendererProps> = (props) => {
  const { element } = props;
  if (element.deleted) return null;

  switch (element.type) {
    case 'stroke':
    case 'path':
      return (
        <BoardPathRenderer
          element={element}
          isSelected={props.isSelected}
          onPointerDown={props.onPointerDown}
        />
      );

    case 'sticky':
      return <BoardStickyNote {...props} />;

    case 'shape':
    case 'rect':
    case 'circle':
    case 'line':
      return <BoardShapeRenderer {...props} />;

    case 'text':
      return <BoardTextRenderer {...props} />;

    default:
      return null;
  }
};
