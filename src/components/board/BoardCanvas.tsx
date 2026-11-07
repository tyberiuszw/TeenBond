'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  BoardElement,
  CanvasTransform,
  ToolType,
  BoardBackgroundType,
} from '@/types/board';
import {
  screenToWorld,
  calculateZoomToPoint,
  normalizeCanvasTransform,
} from '@/lib/board/coordinateUtils';
import { findErasedLineIds } from '@/lib/board/eraserEngine';
import { snapLineAngle } from '@/lib/board/pathSmoothing';
import { isElementLockedByOther } from '@/lib/board/objectLockManager';
import { BoardElementRenderer } from './BoardElementRenderer';
import { LaserPointerOverlay } from './LaserPointerOverlay';
import { CollaborativeCursors } from './CollaborativeCursors';
import { useTeenBoardStore } from '@/lib/board/teenboard-store';

interface BoardCanvasProps {
  currentUserId: string;
  isReadOnly?: boolean;
  background?: BoardBackgroundType;
  mode?: 'default' | 'drawing_only' | 'corkboard';
}

export const BoardCanvas: React.FC<BoardCanvasProps> = ({
  currentUserId,
  isReadOnly = false,
  background = 'dots',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  // Store bindings
  const {
    activeTool,
    strokeColor,
    fillColor,
    strokeWidth,
    camera,
    setCamera,
    elements,
    selectedIds,
    selectElement,
    clearSelection,
    addElement,
    updateElement,
    deleteElement,
    acquireLock,
    releaseLock,
    laserTrail,
    cursors,
    activePageId,
  } = useTeenBoardStore();

  // Active interaction state
  const isInteractingRef = useRef(false);
  const isPanningRef = useRef(false);
  const spacePressedRef = useRef(false);
  const dragStartScreenRef = useRef({ x: 0, y: 0 });
  const dragStartWorldRef = useRef({ x: 0, y: 0 });
  const draggedElementIdRef = useRef<string | null>(null);
  const elementStartPosRef = useRef({ x: 0, y: 0 });

  // Current drawing preview
  const [drawingPoints, setDrawingPoints] = useState<number[]>([]);
  const [shapePreview, setShapePreview] = useState<{
    startX: number;
    startY: number;
    curX: number;
    curY: number;
  } | null>(null);

  // Resize observer for container dimensions
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth || 1200,
          height: containerRef.current.clientHeight || 800,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Keyboard space listener for panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !spacePressedRef.current) {
        spacePressedRef.current = true;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spacePressedRef.current = false;
        isPanningRef.current = false;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Zoom-to-pointer via wheel
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      // Wheel delta zoom
      const zoomFactor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      const newTransform = calculateZoomToPoint(camera, zoomFactor, screenX, screenY);
      setCamera(newTransform);
    },
    [camera, setCamera]
  );

  // Pointer Down on Board
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldPos = screenToWorld(screenX, screenY, camera);

    // Pan with middle mouse button, space bar, or when background clicked in select mode
    const isMiddleButton = e.button === 1;
    if (isMiddleButton || spacePressedRef.current) {
      isPanningRef.current = true;
      dragStartScreenRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (isReadOnly) return;

    isInteractingRef.current = true;
    dragStartScreenRef.current = { x: screenX, y: screenY };
    dragStartWorldRef.current = worldPos;

    // Laser pointer
    if (activeTool === 'laser') {
      laserTrail.addPoint(worldPos.x, worldPos.y);
      return;
    }

    // Line-only eraser
    if (activeTool === 'eraser') {
      const activeElements = Object.values(elements);
      const hitIds = findErasedLineIds(activeElements, worldPos.x, worldPos.y, 20);
      hitIds.forEach((id) => deleteElement(currentUserId, id));
      return;
    }

    // Brush or Highlighter freehand stroke
    if (activeTool === 'brush' || activeTool === 'highlighter') {
      setDrawingPoints([worldPos.x, worldPos.y]);
      return;
    }

    // Straight Line or Shape
    if (activeTool === 'line' || activeTool === 'rect' || activeTool === 'circle') {
      setShapePreview({
        startX: worldPos.x,
        startY: worldPos.y,
        curX: worldPos.x,
        curY: worldPos.y,
      });
      return;
    }

    // Click to insert Sticky Note
    if (activeTool === 'sticky') {
      addElement(currentUserId, {
        type: 'sticky',
        x: worldPos.x - 100,
        y: worldPos.y - 100,
        width: 200,
        height: 200,
        content: '',
        color: fillColor || '#FEF08A',
        pageId: activePageId,
      });
      isInteractingRef.current = false;
      return;
    }

    // Click to insert Text
    if (activeTool === 'text') {
      addElement(currentUserId, {
        type: 'text',
        x: worldPos.x,
        y: worldPos.y,
        width: 220,
        height: 50,
        content: '',
        color: strokeColor || '#0F172A',
        pageId: activePageId,
      });
      isInteractingRef.current = false;
      return;
    }

    // Select mode: click on empty area clears selection or initiates pan
    if (activeTool === 'select') {
      clearSelection();
      isPanningRef.current = true;
      dragStartScreenRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  // Pointer Move
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldPos = screenToWorld(screenX, screenY, camera);

    // Pan camera
    if (isPanningRef.current) {
      const dx = e.clientX - dragStartScreenRef.current.x;
      const dy = e.clientY - dragStartScreenRef.current.y;
      dragStartScreenRef.current = { x: e.clientX, y: e.clientY };
      setCamera(normalizeCanvasTransform(camera.zoom, camera.panX + dx, camera.panY + dy));
      return;
    }

    // Laser pointer movement
    if (activeTool === 'laser' && isInteractingRef.current) {
      laserTrail.addPoint(worldPos.x, worldPos.y);
      return;
    }

    // Line-only eraser drag
    if (activeTool === 'eraser' && isInteractingRef.current) {
      const activeElements = Object.values(elements);
      const hitIds = findErasedLineIds(activeElements, worldPos.x, worldPos.y, 20);
      hitIds.forEach((id) => deleteElement(currentUserId, id));
      return;
    }

    // Dragging an existing element in select mode
    if (draggedElementIdRef.current && isInteractingRef.current) {
      const dx = worldPos.x - dragStartWorldRef.current.x;
      const dy = worldPos.y - dragStartWorldRef.current.y;
      updateElement(currentUserId, draggedElementIdRef.current, {
        x: elementStartPosRef.current.x + dx,
        y: elementStartPosRef.current.y + dy,
      });
      return;
    }

    // Brush drawing
    if ((activeTool === 'brush' || activeTool === 'highlighter') && isInteractingRef.current) {
      setDrawingPoints((prev) => [...prev, worldPos.x, worldPos.y]);
      return;
    }

    // Shape / Line preview
    if (shapePreview && isInteractingRef.current) {
      let curX = worldPos.x;
      let curY = worldPos.y;

      if (e.shiftKey) {
        if (activeTool === 'line') {
          const snapped = snapLineAngle(shapePreview.startX, shapePreview.startY, curX, curY);
          curX = snapped.x;
          curY = snapped.y;
        } else {
          // 1:1 Aspect ratio constraint for rect/circle
          const side = Math.max(
            Math.abs(curX - shapePreview.startX),
            Math.abs(curY - shapePreview.startY)
          );
          curX = shapePreview.startX + (curX >= shapePreview.startX ? side : -side);
          curY = shapePreview.startY + (curY >= shapePreview.startY ? side : -side);
        }
      }

      setShapePreview((prev) => (prev ? { ...prev, curX, curY } : null));
    }
  };

  // Pointer Up
  const handlePointerUp = () => {
    isPanningRef.current = false;

    // Release lock on dragged element
    if (draggedElementIdRef.current) {
      releaseLock(currentUserId, draggedElementIdRef.current);
      draggedElementIdRef.current = null;
    }

    if (!isInteractingRef.current) return;
    isInteractingRef.current = false;

    // Commit Brush / Highlighter stroke
    if (drawingPoints.length >= 4) {
      const isHigh = activeTool === 'highlighter';
      addElement(currentUserId, {
        type: isHigh ? 'path' : 'stroke',
        color: isHigh ? `${strokeColor}88` : strokeColor,
        strokeWidth: isHigh ? Math.max(16, strokeWidth * 3) : strokeWidth,
        points: drawingPoints,
        x: 0,
        y: 0,
        pageId: activePageId,
      });
    }
    setDrawingPoints([]);

    // Commit Line or Shape
    if (shapePreview) {
      const { startX, startY, curX, curY } = shapePreview;
      const minDistance = Math.hypot(curX - startX, curY - startY);

      if (minDistance > 5) {
        if (activeTool === 'line') {
          addElement(currentUserId, {
            type: 'line',
            color: strokeColor,
            strokeWidth,
            points: [startX, startY, curX, curY],
            x: 0,
            y: 0,
            pageId: activePageId,
          });
        } else {
          const x = Math.min(startX, curX);
          const y = Math.min(startY, curY);
          const w = Math.max(10, Math.abs(curX - startX));
          const h = Math.max(10, Math.abs(curY - startY));

          addElement(currentUserId, {
            type: 'shape',
            shapeType: activeTool === 'circle' ? 'circle' : 'rect',
            x,
            y,
            width: w,
            height: h,
            color: strokeColor,
            fillColor: fillColor || 'transparent',
            strokeWidth,
            pageId: activePageId,
          });
        }
      }
      setShapePreview(null);
    }
  };

  // Pointer Down on a specific element
  const handleElementPointerDown = (element: BoardElement, e: React.PointerEvent) => {
    e.stopPropagation();
    if (isReadOnly) return;

    if (activeTool === 'eraser') {
      if (element.type === 'stroke' || element.type === 'line' || element.type === 'path') {
        deleteElement(currentUserId, element.id);
      }
      return;
    }

    if (activeTool === 'select') {
      selectElement(element.id, e.shiftKey);

      // Acquire optimistic lock
      const lockAcquired = acquireLock(currentUserId, element.id);
      if (lockAcquired) {
        draggedElementIdRef.current = element.id;
        elementStartPosRef.current = { x: element.x, y: element.y };

        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const worldPos = screenToWorld(e.clientX - rect.left, e.clientY - rect.top, camera);
          dragStartWorldRef.current = worldPos;
        }
        isInteractingRef.current = true;
      }
    }
  };

  // Filter elements belonging to active page
  const pageElements = Object.values(elements).filter(
    (el) => !el.deleted && (el.pageId === activePageId || !el.pageId)
  );

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`relative w-full h-full overflow-hidden select-none touch-none ${
        spacePressedRef.current || isPanningRef.current
          ? 'cursor-grab active:cursor-grabbing'
          : activeTool === 'select'
          ? 'cursor-default'
          : activeTool === 'laser'
          ? 'cursor-crosshair'
          : activeTool === 'eraser'
          ? 'cursor-pointer'
          : 'cursor-crosshair'
      }`}
    >
      {/* SVG Board Layer */}
      <svg
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0 block w-full h-full"
      >
        <defs>
          {/* Pattern: Dots */}
          <pattern
            id="tb-pattern-dots"
            x={camera.panX % (24 * camera.zoom)}
            y={camera.panY % (24 * camera.zoom)}
            width={24 * camera.zoom}
            height={24 * camera.zoom}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={12 * camera.zoom}
              cy={12 * camera.zoom}
              r={1.5 * Math.min(1.5, Math.max(0.6, camera.zoom))}
              fill="#94A3B8"
              opacity={0.35}
            />
          </pattern>

          {/* Pattern: Grid */}
          <pattern
            id="tb-pattern-grid"
            x={camera.panX % (24 * camera.zoom)}
            y={camera.panY % (24 * camera.zoom)}
            width={24 * camera.zoom}
            height={24 * camera.zoom}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${24 * camera.zoom} 0 L 0 0 0 ${24 * camera.zoom}`}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth={1}
            />
          </pattern>

          {/* Pattern: Lines */}
          <pattern
            id="tb-pattern-lines"
            x={0}
            y={camera.panY % (28 * camera.zoom)}
            width="100%"
            height={28 * camera.zoom}
            patternUnits="userSpaceOnUse"
          >
            <line
              x1={0}
              y1={28 * camera.zoom}
              x2="100%"
              y2={28 * camera.zoom}
              stroke="#E2E8F0"
              strokeWidth={1}
            />
          </pattern>

          {/* Pattern: Corkboard */}
          <pattern
            id="tb-pattern-cork"
            x={camera.panX % (100 * camera.zoom)}
            y={camera.panY % (100 * camera.zoom)}
            width={100 * camera.zoom}
            height={100 * camera.zoom}
            patternUnits="userSpaceOnUse"
          >
            <rect width="100%" height="100%" fill="#C29B38" opacity={0.15} />
            <circle cx={20 * camera.zoom} cy={30 * camera.zoom} r={2} fill="#A57C32" opacity={0.3} />
            <circle cx={70 * camera.zoom} cy={60 * camera.zoom} r={2.5} fill="#A57C32" opacity={0.3} />
          </pattern>
        </defs>

        {/* Background Canvas Fill */}
        <rect
          width="100%"
          height="100%"
          fill={
            background === 'dots'
              ? 'url(#tb-pattern-dots)'
              : background === 'grid'
              ? 'url(#tb-pattern-grid)'
              : background === 'lines'
              ? 'url(#tb-pattern-lines)'
              : background === 'corkboard'
              ? 'url(#tb-pattern-cork)'
              : '#F8FAFC'
          }
          className="transition-colors"
        />

        {/* World Space Container with Camera Transform */}
        <g transform={`translate(${camera.panX}, ${camera.panY}) scale(${camera.zoom})`}>
          {/* Render all page elements */}
          {pageElements.map((el) => {
            const isSelected = selectedIds.includes(el.id);
            const isLocked = isElementLockedByOther(el, currentUserId);
            return (
              <BoardElementRenderer
                key={el.id}
                element={el}
                isSelected={isSelected}
                isLockedByOther={isLocked}
                lockedByName={el.lockedBy || undefined}
                onUpdateContent={(content) => updateElement(currentUserId, el.id, { content })}
                onPointerDown={(e) => handleElementPointerDown(el, e)}
                isReadOnly={isReadOnly}
              />
            );
          })}

          {/* Active drawing brush stroke preview */}
          {drawingPoints.length >= 2 && (
            <BoardElementRenderer
              element={{
                id: 'preview-stroke',
                type: activeTool === 'highlighter' ? 'path' : 'stroke',
                color: activeTool === 'highlighter' ? `${strokeColor}88` : strokeColor,
                strokeWidth: activeTool === 'highlighter' ? Math.max(16, strokeWidth * 3) : strokeWidth,
                points: drawingPoints,
                x: 0,
                y: 0,
                createdBy: currentUserId,
              }}
              isReadOnly
            />
          )}

          {/* Active shape / line preview */}
          {shapePreview && (
            <>
              {activeTool === 'line' ? (
                <line
                  x1={shapePreview.startX}
                  y1={shapePreview.startY}
                  x2={shapePreview.curX}
                  y2={shapePreview.curY}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray="4 4"
                />
              ) : activeTool === 'circle' ? (
                <ellipse
                  cx={(shapePreview.startX + shapePreview.curX) / 2}
                  cy={(shapePreview.startY + shapePreview.curY) / 2}
                  rx={Math.abs(shapePreview.curX - shapePreview.startX) / 2}
                  ry={Math.abs(shapePreview.curY - shapePreview.startY) / 2}
                  fill={fillColor || 'transparent'}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray="4 4"
                />
              ) : (
                <rect
                  x={Math.min(shapePreview.startX, shapePreview.curX)}
                  y={Math.min(shapePreview.startY, shapePreview.curY)}
                  width={Math.abs(shapePreview.curX - shapePreview.startX)}
                  height={Math.abs(shapePreview.curY - shapePreview.startY)}
                  fill={fillColor || 'transparent'}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray="4 4"
                  rx={6}
                />
              )}
            </>
          )}
        </g>
      </svg>

      {/* 60 FPS HTML5 Canvas Overlay for Laser Pointer Trails */}
      <LaserPointerOverlay
        localLaserTrail={laserTrail}
        remoteTrails={Object.values(cursors)
          .filter((c) => c.laserTrail && c.laserTrail.length > 0)
          .map((c) => ({
            userId: c.userId,
            color: c.color,
            trail: c.laserTrail!,
          }))}
        camera={camera}
        width={dimensions.width}
        height={dimensions.height}
      />

      {/* Peer Cursors */}
      <CollaborativeCursors
        cursors={cursors}
        currentUserId={currentUserId}
        camera={camera}
      />
    </div>
  );
};
