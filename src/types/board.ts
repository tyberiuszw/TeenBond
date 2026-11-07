export type ToolType =
  | 'select'
  | 'brush'
  | 'highlighter'
  | 'line'
  | 'rect'
  | 'circle'
  | 'text'
  | 'sticky'
  | 'eraser'
  | 'laser';

export type BoardElementType =
  | 'stroke'
  | 'path'
  | 'line'
  | 'rect'
  | 'circle'
  | 'shape'
  | 'sticky'
  | 'text'
  | 'image'
  | 'yarn';

export interface BoardElement {
  id: string;
  type: BoardElementType;
  shapeType?: 'rect' | 'circle';
  x: number;
  y: number;
  width?: number;
  height?: number;
  content?: string;
  color: string;
  fillColor?: string;
  strokeWidth?: number;
  points?: number[]; // [x0, y0, x1, y1, ...] for freehand paths and lines
  lockedBy?: string | null;
  lockedAt?: number | null;
  createdBy: string;
  deleted?: boolean;
  pageId?: string;
  metadata?: Record<string, unknown>;
}

export interface CursorState {
  userId: string;
  name: string;
  color: string;
  x: number;
  y: number;
  laserTrail?: Array<{ x: number; y: number; timestamp: number }>;
  activeTool?: string;
  lastSeen?: number;
}

export interface CanvasTransform {
  zoom: number; // Clamped [0.1, 5.0]
  panX: number; // Clamped [-10000, 10000]
  panY: number; // Clamped [-10000, 10000]
}

export type BoardBackgroundType = 'blank' | 'dots' | 'grid' | 'lines' | 'corkboard';

export interface BoardPage {
  id: string;
  name: string;
  order: number;
  background: BoardBackgroundType;
  elements: string[]; // List of element IDs belonging to this page
}

export interface CalculatorState {
  isOpen: boolean;
  isMinimized: boolean;
  position: { x: number; y: number };
  expression: string;
  result: string;
  history: Array<{ expression: string; result: string; timestamp: number }>;
}

export interface UndoAction {
  userId: string;
  actionType: 'create' | 'update' | 'delete';
  elementBefore?: BoardElement;
  elementAfter?: BoardElement;
  timestamp?: number;
}
