import { UserSession, OrganizationContext, BoardElement, UndoAction, PeerEvaluationAnswer } from './contracts';

export const DEMO_MEMBERS: UserSession[] = [
  { id: 'usr-kuba', name: 'Kuba', email: 'kuba@demo.teenbond.pl', role: 'leader', chameleonColor: '#22c55e', orgId: 'org-alfa', isDemo: true },
  { id: 'usr-zosia', name: 'Zosia', email: 'zosia@demo.teenbond.pl', role: 'member', chameleonColor: '#ec4899', orgId: 'org-alfa', isDemo: true },
  { id: 'usr-michal', name: 'Michał', email: 'michal@demo.teenbond.pl', role: 'member', chameleonColor: '#3b82f6', orgId: 'org-alfa', isDemo: true },
  { id: 'usr-ania', name: 'Ania', email: 'ania@demo.teenbond.pl', role: 'member', chameleonColor: '#f97316', orgId: 'org-alfa', isDemo: true },
  { id: 'usr-bartek', name: 'Bartek', email: 'bartek@demo.teenbond.pl', role: 'member', chameleonColor: '#8b5cf6', orgId: 'org-alfa', isDemo: true }
];

export const DEMO_ORGANIZATION: OrganizationContext = {
  orgId: 'org-alfa',
  name: 'Liderzy Jutra – Zespół Alfa',
  isDemo: true,
  isPublic: false,
  inviteCode: 'TB-ALFA',
  members: DEMO_MEMBERS
};

/**
 * Personal Undo/Redo Engine
 * Maintains per-user action stacks so that User A undoes ONLY their own actions,
 * preserving User B's edits completely.
 */
export class PersonalUndoManager {
  private undoStacks: Map<string, UndoAction[]> = new Map();
  private redoStacks: Map<string, UndoAction[]> = new Map();
  public elements: Map<string, BoardElement> = new Map();

  constructor() {
    this.undoStacks = new Map();
    this.redoStacks = new Map();
    this.elements = new Map();
  }

  public addElement(userId: string, element: BoardElement) {
    this.elements.set(element.id, { ...element, createdBy: userId });
    this.pushUndo(userId, {
      userId,
      actionType: 'create',
      elementAfter: { ...element }
    });
  }

  public updateElement(userId: string, elementId: string, updates: Partial<BoardElement>) {
    const prev = this.elements.get(elementId);
    if (!prev) return;
    const next: BoardElement = { ...prev, ...updates };
    this.elements.set(elementId, next);
    this.pushUndo(userId, {
      userId,
      actionType: 'update',
      elementBefore: { ...prev },
      elementAfter: { ...next }
    });
  }

  public deleteElement(userId: string, elementId: string) {
    const prev = this.elements.get(elementId);
    if (!prev) return;
    const next: BoardElement = { ...prev, deleted: true };
    this.elements.set(elementId, next);
    this.pushUndo(userId, {
      userId,
      actionType: 'delete',
      elementBefore: { ...prev },
      elementAfter: next
    });
  }

  private pushUndo(userId: string, action: UndoAction) {
    if (!this.undoStacks.has(userId)) {
      this.undoStacks.set(userId, []);
    }
    this.undoStacks.get(userId)!.push(action);
    // Clearing redo stack for this user upon new action
    this.redoStacks.set(userId, []);
  }

  public undo(userId: string): boolean {
    const stack = this.undoStacks.get(userId);
    if (!stack || stack.length === 0) return false;
    const action = stack.pop()!;

    if (!this.redoStacks.has(userId)) {
      this.redoStacks.set(userId, []);
    }
    this.redoStacks.get(userId)!.push(action);

    if (action.actionType === 'create') {
      // Revert create -> soft delete
      if (action.elementAfter) {
        const el = this.elements.get(action.elementAfter.id);
        if (el) el.deleted = true;
      }
    } else if (action.actionType === 'update') {
      // Revert update -> restore elementBefore
      if (action.elementBefore) {
        this.elements.set(action.elementBefore.id, { ...action.elementBefore });
      }
    } else if (action.actionType === 'delete') {
      // Revert delete -> restore elementBefore
      if (action.elementBefore) {
        this.elements.set(action.elementBefore.id, { ...action.elementBefore, deleted: false });
      }
    }
    return true;
  }

  public redo(userId: string): boolean {
    const stack = this.redoStacks.get(userId);
    if (!stack || stack.length === 0) return false;
    const action = stack.pop()!;
    this.undoStacks.get(userId)!.push(action);

    if (action.actionType === 'create') {
      if (action.elementAfter) {
        this.elements.set(action.elementAfter.id, { ...action.elementAfter, deleted: false });
      }
    } else if (action.actionType === 'update') {
      if (action.elementAfter) {
        this.elements.set(action.elementAfter.id, { ...action.elementAfter });
      }
    } else if (action.actionType === 'delete') {
      if (action.elementAfter) {
        const el = this.elements.get(action.elementAfter.id);
        if (el) el.deleted = true;
      }
    }
    return true;
  }

  public getActiveElements(): BoardElement[] {
    return Array.from(this.elements.values()).filter(el => !el.deleted);
  }
}

/**
 * Floating Private Calculator Simulator
 * Strictly private to each user (never broadcasted across rooms).
 */
export class PrivateCalculatorManager {
  private userCalculators: Map<string, { currentExpression: string; history: string[]; isOpen: boolean }> = new Map();

  public open(userId: string) {
    if (!this.userCalculators.has(userId)) {
      this.userCalculators.set(userId, { currentExpression: '', history: [], isOpen: true });
    } else {
      this.userCalculators.get(userId)!.isOpen = true;
    }
  }

  public close(userId: string) {
    const state = this.userCalculators.get(userId);
    if (state) state.isOpen = false;
  }

  public calculate(userId: string, expression: string): number {
    const clean = expression.replace(/[^0-9+\-*/().]/g, '');
    // Safe mathematical evaluation
    const result = Function(`'use strict'; return (${clean})`)();
    const state = this.userCalculators.get(userId);
    if (state) {
      state.history.push(`${expression} = ${result}`);
      state.currentExpression = String(result);
    }
    return result;
  }

  public isVisibleTo(viewerUserId: string, ownerUserId: string): boolean {
    // Only visible if viewer IS owner
    return viewerUserId === ownerUserId && (this.userCalculators.get(ownerUserId)?.isOpen ?? false);
  }
}

/**
 * Laser Pointer 1.5s Decay Manager
 */
export class LaserPointerTrail {
  private points: { x: number; y: number; timestamp: number }[] = [];
  public readonly lifetimeMs: number = 1500; // 1.5 seconds

  public addPoint(x: number, y: number, now: number = Date.now()) {
    this.points.push({ x, y, timestamp: now });
  }

  public getActivePoints(now: number = Date.now()): { x: number; y: number; opacity: number }[] {
    this.points = this.points.filter(p => now - p.timestamp <= this.lifetimeMs);
    return this.points.map(p => {
      const age = now - p.timestamp;
      const opacity = Math.max(0, 1 - (age / this.lifetimeMs));
      return { x: p.x, y: p.y, opacity };
    });
  }
}
