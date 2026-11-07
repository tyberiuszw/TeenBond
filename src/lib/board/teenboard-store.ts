import { create } from 'zustand';
import {
  BoardElement,
  BoardPage,
  CanvasTransform,
  CursorState,
  ToolType,
  BoardBackgroundType,
} from '@/types/board';
import { PersonalUndoManager } from './personalUndoManager';
import { PrivateCalculatorManager } from './calculatorManager';
import { LaserPointerTrail } from './laserTrailManager';
import { normalizeCanvasTransform } from './coordinateUtils';
import { sanitizeBoardElement } from './typographyUtils';
import { isElementLockedByOther } from './objectLockManager';
import { joinBoardRoom, BoardRoomConnection } from '@/lib/supabase/realtime';
import { UserSession } from '@/types/auth';

export { joinBoardRoom };

export interface TeenBoardState {
  roomId: string;
  pages: BoardPage[];
  activePageId: string;
  isReadOnly: boolean;
  roomConnection: BoardRoomConnection | null;

  // Board elements keyed by ID
  elements: Record<string, BoardElement>;
  selectedIds: string[];

  // Current user's selected drawing styles & active tool
  activeTool: ToolType;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;

  // Viewport camera
  camera: CanvasTransform;

  // Core managers
  undoManager: PersonalUndoManager;
  calculatorManager: PrivateCalculatorManager;
  laserTrail: LaserPointerTrail;

  // Collaborative peers
  cursors: Record<string, CursorState>;

  // Actions
  setRoomId: (roomId: string) => void;
  setReadOnly: (isReadOnly: boolean) => void;
  setTool: (tool: ToolType) => void;
  setStrokeColor: (color: string) => void;
  setFillColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setCamera: (camera: Partial<CanvasTransform>) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  panBy: (dx: number, dy: number) => void;

  // Elements
  addElement: (userId: string, partial: Partial<BoardElement>) => BoardElement;
  updateElement: (userId: string, id: string, updates: Partial<BoardElement>) => void;
  deleteElement: (userId: string, id: string) => void;
  duplicateElement: (userId: string, id: string) => BoardElement | null;
  clearLines: (userId: string) => void;
  selectElement: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  loadElements: (elements: BoardElement[]) => void;

  // Locking
  acquireLock: (userId: string, elementId: string) => boolean;
  releaseLock: (userId: string, elementId: string) => void;

  // Undo / Redo
  undo: (userId: string) => boolean;
  redo: (userId: string) => boolean;

  // Multi-page
  addPage: (name?: string, bg?: BoardBackgroundType) => string;
  duplicatePage: (pageId: string) => string;
  switchPage: (pageId: string) => void;
  setPageBackground: (pageId: string, bg: BoardBackgroundType) => void;

  // Calculator
  toggleCalculator: (userId: string) => void;
  calculateExpression: (userId: string, expr: string) => number;
  insertCalculationAsSticky: (userId: string) => void;

  // Realtime peer sync
  connectRoom: (roomId: string, user: UserSession) => BoardRoomConnection;
  disconnectRoom: () => void;
  broadcastCursorMove: (x: number, y: number, laserPoints?: Array<{ x: number; y: number; timestamp: number }>) => void;
  updatePeerCursor: (cursor: CursorState) => void;
  removePeerCursor: (userId: string) => void;
}

const DEFAULT_PAGE: BoardPage = {
  id: 'page-1',
  name: 'Strona 1',
  order: 1,
  background: 'dots',
  elements: [],
};

export const useTeenBoardStore = create<TeenBoardState>((set, get) => {
  const undoManager = new PersonalUndoManager();
  const calculatorManager = new PrivateCalculatorManager();
  const laserTrail = new LaserPointerTrail();

  return {
    roomId: 'default-room',
    pages: [DEFAULT_PAGE],
    activePageId: 'page-1',
    isReadOnly: false,
    roomConnection: null,

    elements: {},
    selectedIds: [],

    activeTool: 'select',
    strokeColor: '#3B82F6', // Blue default
    fillColor: '#FEF08A', // Yellow pastel sticky
    strokeWidth: 4,

    camera: { zoom: 1.0, panX: 0, panY: 0 },

    undoManager,
    calculatorManager,
    laserTrail,
    cursors: {},

    setRoomId: (roomId: string) => set({ roomId }),
    setReadOnly: (isReadOnly: boolean) => set({ isReadOnly }),
    setTool: (tool: ToolType) => set({ activeTool: tool, selectedIds: tool === 'select' ? get().selectedIds : [] }),
    setStrokeColor: (strokeColor: string) => set({ strokeColor, fillColor: strokeColor }),
    setFillColor: (fillColor: string) => set({ fillColor }),
    setStrokeWidth: (strokeWidth: number) => set({ strokeWidth }),

    setCamera: (partial) => {
      const current = get().camera;
      const normalized = normalizeCanvasTransform(
        partial.zoom ?? current.zoom,
        partial.panX ?? current.panX,
        partial.panY ?? current.panY
      );
      set({ camera: normalized });
    },

    zoomIn: () => {
      const { camera } = get();
      const newZoom = Math.min(5.0, camera.zoom * 1.25);
      set({ camera: normalizeCanvasTransform(newZoom, camera.panX, camera.panY) });
    },

    zoomOut: () => {
      const { camera } = get();
      const newZoom = Math.max(0.1, camera.zoom / 1.25);
      set({ camera: normalizeCanvasTransform(newZoom, camera.panX, camera.panY) });
    },

    resetZoom: () => {
      set({ camera: { zoom: 1.0, panX: 0, panY: 0 } });
    },

    panBy: (dx, dy) => {
      const { camera } = get();
      set({
        camera: normalizeCanvasTransform(camera.zoom, camera.panX + dx, camera.panY + dy),
      });
    },

    addElement: (userId: string, partial: Partial<BoardElement>) => {
      const { activePageId, undoManager, isReadOnly, roomConnection } = get();
      if (isReadOnly) return sanitizeBoardElement(partial);

      const sanitized = sanitizeBoardElement({
        ...partial,
        pageId: partial.pageId || activePageId,
        createdBy: userId,
      });

      undoManager.addElement(userId, sanitized);

      set((state) => ({
        elements: {
          ...state.elements,
          [sanitized.id]: sanitized,
        },
      }));

      if (roomConnection) {
        roomConnection.broadcastElementUpdate(sanitized);
      }

      return sanitized;
    },

    updateElement: (userId: string, id: string, updates: Partial<BoardElement>) => {
      const { elements, undoManager, isReadOnly, roomConnection } = get();
      if (isReadOnly) return;
      const el = elements[id];
      if (!el) return;

      if (isElementLockedByOther(el, userId)) return;

      undoManager.updateElement(userId, id, updates);
      const updated = { ...el, ...updates };

      set((state) => ({
        elements: {
          ...state.elements,
          [id]: updated,
        },
      }));

      if (roomConnection) {
        roomConnection.broadcastElementUpdate(updated);
      }
    },

    deleteElement: (userId: string, id: string) => {
      const { elements, undoManager, isReadOnly, selectedIds, roomConnection } = get();
      if (isReadOnly) return;
      const el = elements[id];
      if (!el) return;
      if (isElementLockedByOther(el, userId)) return;

      undoManager.deleteElement(userId, id);
      const deletedEl = { ...el, deleted: true };

      set((state) => {
        const next = { ...state.elements };
        next[id] = deletedEl;
        return {
          elements: next,
          selectedIds: selectedIds.filter((selId) => selId !== id),
        };
      });

      if (roomConnection) {
        roomConnection.broadcastElementUpdate(deletedEl);
      }
    },

    duplicateElement: (userId: string, id: string) => {
      const { elements, isReadOnly, addElement } = get();
      if (isReadOnly) return null;
      const el = elements[id];
      if (!el || el.deleted) return null;

      return addElement(userId, {
        ...el,
        id: `${el.id}-dup-${Date.now()}`,
        x: el.x + 24,
        y: el.y + 24,
        lockedBy: null,
        lockedAt: null,
      });
    },

    clearLines: (userId: string) => {
      const { elements, activePageId, undoManager, isReadOnly } = get();
      if (isReadOnly) return;

      const lineIds = Object.values(elements)
        .filter(
          (el) =>
            !el.deleted &&
            (el.pageId === activePageId || !el.pageId) &&
            (el.type === 'stroke' || el.type === 'line' || el.type === 'path')
        )
        .map((el) => el.id);

      lineIds.forEach((id) => undoManager.deleteElement(userId, id));

      set((state) => {
        const next = { ...state.elements };
        lineIds.forEach((id) => {
          if (next[id]) next[id] = { ...next[id], deleted: true };
        });
        return { elements: next };
      });
    },

    selectElement: (id: string, multi = false) => {
      set((state) => {
        if (multi) {
          const exists = state.selectedIds.includes(id);
          return {
            selectedIds: exists
              ? state.selectedIds.filter((selId) => selId !== id)
              : [...state.selectedIds, id],
          };
        }
        return { selectedIds: [id] };
      });
    },

    clearSelection: () => set({ selectedIds: [] }),

    loadElements: (loadedElements: BoardElement[]) => {
      const { undoManager } = get();
      const elMap: Record<string, BoardElement> = {};
      loadedElements.forEach((el) => {
        const sanitized = sanitizeBoardElement(el);
        elMap[sanitized.id] = sanitized;
        undoManager.elements.set(sanitized.id, sanitized);
      });
      set({ elements: elMap });
    },

    acquireLock: (userId: string, elementId: string) => {
      const { elements, roomConnection } = get();
      const el = elements[elementId];
      if (!el) return false;
      if (isElementLockedByOther(el, userId)) return false;

      const updated: BoardElement = {
        ...el,
        lockedBy: userId,
        lockedAt: Date.now(),
      };
      set((state) => ({
        elements: {
          ...state.elements,
          [elementId]: updated,
        },
      }));
      if (roomConnection) {
        roomConnection.broadcastElementLock(elementId, true);
      }
      return true;
    },

    releaseLock: (userId: string, elementId: string) => {
      const { elements, roomConnection } = get();
      const el = elements[elementId];
      if (!el || el.lockedBy !== userId) return;

      const updated: BoardElement = {
        ...el,
        lockedBy: null,
        lockedAt: null,
      };
      set((state) => ({
        elements: {
          ...state.elements,
          [elementId]: updated,
        },
      }));
      if (roomConnection) {
        roomConnection.broadcastElementLock(elementId, false);
      }
    },

    undo: (userId: string) => {
      const { undoManager, isReadOnly } = get();
      if (isReadOnly) return false;
      const ok = undoManager.undo(userId);
      if (ok) {
        // Sync zustand elements from manager
        const next: Record<string, BoardElement> = {};
        undoManager.elements.forEach((val, key) => {
          next[key] = val;
        });
        set({ elements: next });
      }
      return ok;
    },

    redo: (userId: string) => {
      const { undoManager, isReadOnly } = get();
      if (isReadOnly) return false;
      const ok = undoManager.redo(userId);
      if (ok) {
        const next: Record<string, BoardElement> = {};
        undoManager.elements.forEach((val, key) => {
          next[key] = val;
        });
        set({ elements: next });
      }
      return ok;
    },

    addPage: (name, bg = 'dots') => {
      const { pages } = get();
      const newPageId = `page-${pages.length + 1}`;
      const newPage: BoardPage = {
        id: newPageId,
        name: name || `Strona ${pages.length + 1}`,
        order: pages.length + 1,
        background: bg,
        elements: [],
      };
      set({
        pages: [...pages, newPage],
        activePageId: newPageId,
      });
      return newPageId;
    },

    duplicatePage: (pageId: string) => {
      const { pages, elements, undoManager } = get();
      const sourcePage = pages.find((p) => p.id === pageId) || pages[0];
      const newPageId = `page-${pages.length + 1}`;
      const clonedElements: Record<string, BoardElement> = {};
      const clonedIds: string[] = [];

      Object.values(elements)
        .filter((el) => !el.deleted && (el.pageId === sourcePage.id || (!el.pageId && sourcePage.id === 'page-1')))
        .forEach((el, idx) => {
          const clonedId = `${el.id}-copy-${pages.length + 1}-${idx}`;
          const clonedEl: BoardElement = {
            ...el,
            id: clonedId,
            pageId: newPageId,
            lockedBy: null,
            lockedAt: null,
          };
          clonedElements[clonedId] = clonedEl;
          clonedIds.push(clonedId);
          undoManager.elements.set(clonedId, clonedEl);
        });

      const newPage: BoardPage = {
        id: newPageId,
        name: `${sourcePage.name} (Kopia)`,
        order: pages.length + 1,
        background: sourcePage.background,
        elements: clonedIds,
      };

      set((state) => ({
        pages: [...state.pages, newPage],
        activePageId: newPageId,
        elements: {
          ...state.elements,
          ...clonedElements,
        },
      }));
      return newPageId;
    },

    switchPage: (pageId: string) => {
      set({ activePageId: pageId, selectedIds: [] });
    },

    setPageBackground: (pageId: string, bg: BoardBackgroundType) => {
      set((state) => ({
        pages: state.pages.map((p) => (p.id === pageId ? { ...p, background: bg } : p)),
      }));
    },

    toggleCalculator: (userId: string) => {
      const { calculatorManager } = get();
      calculatorManager.toggle(userId);
      // Trigger shallow state update to re-render calculator subscriber
      set((state) => ({ ...state }));
    },

    calculateExpression: (userId: string, expr: string) => {
      const { calculatorManager } = get();
      const res = calculatorManager.calculate(userId, expr);
      set((state) => ({ ...state }));
      return res;
    },

    insertCalculationAsSticky: (userId: string) => {
      const { calculatorManager, camera, addElement } = get();
      const state = calculatorManager.getState(userId);
      if (!state.result) return;

      // Position note at camera center
      const worldCenterX = (400 - camera.panX) / camera.zoom;
      const worldCenterY = (300 - camera.panY) / camera.zoom;

      addElement(userId, {
        type: 'sticky',
        x: worldCenterX - 100,
        y: worldCenterY - 100,
        width: 220,
        height: 180,
        content: `Obliczenia:\n${state.expression || state.result}`,
        color: '#FEF08A',
      });
    },

    connectRoom: (roomId: string, user: UserSession) => {
      const existing = get().roomConnection;
      if (existing) {
        existing.leaveRoom();
      }
      const conn = joinBoardRoom(roomId, user, {
        onCursorUpdate: (cursor) => {
          if (cursor.userId !== user.id) {
            get().updatePeerCursor(cursor);
          }
        },
        onElementLock: ({ elementId, userId: lockUser, locked, timestamp }) => {
          if (lockUser === user.id) return;
          set((state) => {
            const el = state.elements[elementId];
            if (!el) return state;
            return {
              elements: {
                ...state.elements,
                [elementId]: {
                  ...el,
                  lockedBy: locked ? lockUser : null,
                  lockedAt: locked ? timestamp : null,
                },
              },
            };
          });
        },
        onElementUpdate: (remoteElement) => {
          const sanitized = sanitizeBoardElement(remoteElement);
          get().undoManager.elements.set(sanitized.id, sanitized);
          set((state) => ({
            elements: {
              ...state.elements,
              [sanitized.id]: sanitized,
            },
          }));
        },
      });
      set({ roomId: conn.roomId, roomConnection: conn });
      return conn;
    },

    disconnectRoom: () => {
      const existing = get().roomConnection;
      if (existing) {
        existing.leaveRoom();
      }
      set({ roomConnection: null });
    },

    broadcastCursorMove: (x, y, laserPoints) => {
      const { roomConnection } = get();
      if (roomConnection) {
        roomConnection.broadcastCursor(x, y, laserPoints);
      }
    },

    updatePeerCursor: (cursor: CursorState) => {
      set((state) => ({
        cursors: {
          ...state.cursors,
          [cursor.userId]: cursor,
        },
      }));
    },

    removePeerCursor: (userId: string) => {
      set((state) => {
        const next = { ...state.cursors };
        delete next[userId];
        return { cursors: next };
      });
    },
  };
});
