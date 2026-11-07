import { BoardElement, UndoAction } from '@/types/board';

/**
 * Personal Undo/Redo Engine
 * Maintains per-user isolated action histories.
 * When User A calls undo/redo, only User A's mutations are reverted/reapplied,
 * leaving User B's edits and objects 100% untouched.
 */
export class PersonalUndoManager {
  private undoStacks: Map<string, UndoAction[]> = new Map();
  private redoStacks: Map<string, UndoAction[]> = new Map();
  public elements: Map<string, BoardElement> = new Map();

  constructor(initialElements?: BoardElement[]) {
    if (initialElements) {
      initialElements.forEach((el) => {
        this.elements.set(el.id, { ...el });
      });
    }
  }

  public addElement(userId: string, element: BoardElement): void {
    const elWithAuthor = { ...element, createdBy: userId, deleted: false };
    this.elements.set(element.id, elWithAuthor);
    this.pushUndo(userId, {
      userId,
      actionType: 'create',
      elementAfter: { ...elWithAuthor },
      timestamp: Date.now(),
    });
  }

  public updateElement(
    userId: string,
    elementId: string,
    updates: Partial<BoardElement>
  ): void {
    const prev = this.elements.get(elementId);
    if (!prev) return;
    const next: BoardElement = { ...prev, ...updates };
    this.elements.set(elementId, next);
    this.pushUndo(userId, {
      userId,
      actionType: 'update',
      elementBefore: { ...prev },
      elementAfter: { ...next },
      timestamp: Date.now(),
    });
  }

  public deleteElement(userId: string, elementId: string): void {
    const prev = this.elements.get(elementId);
    if (!prev) return;
    const next: BoardElement = { ...prev, deleted: true };
    this.elements.set(elementId, next);
    this.pushUndo(userId, {
      userId,
      actionType: 'delete',
      elementBefore: { ...prev },
      elementAfter: next,
      timestamp: Date.now(),
    });
  }

  private pushUndo(userId: string, action: UndoAction): void {
    if (!this.undoStacks.has(userId)) {
      this.undoStacks.set(userId, []);
    }
    this.undoStacks.get(userId)!.push(action);
    // Clearing redo stack for this user upon new mutation
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
      // Revert creation -> mark element deleted
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
      // Revert delete -> restore elementBefore with deleted=false
      if (action.elementBefore) {
        this.elements.set(action.elementBefore.id, {
          ...action.elementBefore,
          deleted: false,
        });
      }
    }
    return true;
  }

  public redo(userId: string): boolean {
    const stack = this.redoStacks.get(userId);
    if (!stack || stack.length === 0) return false;
    const action = stack.pop()!;

    if (!this.undoStacks.has(userId)) {
      this.undoStacks.set(userId, []);
    }
    this.undoStacks.get(userId)!.push(action);

    if (action.actionType === 'create') {
      if (action.elementAfter) {
        this.elements.set(action.elementAfter.id, {
          ...action.elementAfter,
          deleted: false,
        });
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

  public canUndo(userId: string): boolean {
    const stack = this.undoStacks.get(userId);
    return Boolean(stack && stack.length > 0);
  }

  public canRedo(userId: string): boolean {
    const stack = this.redoStacks.get(userId);
    return Boolean(stack && stack.length > 0);
  }

  public getActiveElements(): BoardElement[] {
    return Array.from(this.elements.values()).filter((el) => !el.deleted);
  }

  public clear(): void {
    this.undoStacks.clear();
    this.redoStacks.clear();
    this.elements.clear();
  }
}
