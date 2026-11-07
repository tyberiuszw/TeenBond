import { CalculatorState } from '@/types/board';

/**
 * Safely evaluates mathematical expression containing basic arithmetic.
 * Strips all alphanumeric/script tokens to guarantee code injection immunity.
 */
export function evaluateSafeExpression(expression: string): number {
  const sanitized = expression.replace(/[^0-9+\-*/().% ]/g, '');
  if (!sanitized.trim()) return 0;

  try {
    const result = Function(`'use strict'; return (${sanitized})`)();
    if (typeof result !== 'number' || !Number.isFinite(result)) {
      throw new Error('Wynik nie jest prawidłową liczbą');
    }
    return result;
  } catch {
    throw new Error('Nieprawidłowe wyrażenie matematyczne');
  }
}

/**
 * Private Calculator Manager
 * Maintains private calculator instances isolated per user.
 * R5-BOARD-02 compliance:
 * - Strictly invisible to other players (isVisibleTo returns true ONLY if viewer === owner).
 */
export class PrivateCalculatorManager {
  private userCalculators: Map<string, CalculatorState> = new Map();

  public open(userId: string): void {
    const existing = this.userCalculators.get(userId);
    if (!existing) {
      this.userCalculators.set(userId, {
        isOpen: true,
        isMinimized: false,
        position: { x: 80, y: 120 },
        expression: '',
        result: '',
        history: [],
      });
    } else {
      existing.isOpen = true;
    }
  }

  public close(userId: string): void {
    const state = this.userCalculators.get(userId);
    if (state) state.isOpen = false;
  }

  public toggle(userId: string): void {
    const state = this.userCalculators.get(userId);
    if (!state) {
      this.open(userId);
    } else {
      state.isOpen = !state.isOpen;
    }
  }

  public setPosition(userId: string, position: { x: number; y: number }): void {
    const state = this.userCalculators.get(userId);
    if (state) state.position = position;
  }

  public calculate(userId: string, expression: string): number {
    const result = evaluateSafeExpression(expression);
    let state = this.userCalculators.get(userId);
    if (!state) {
      this.open(userId);
      state = this.userCalculators.get(userId)!;
    }
    const resultStr = Number.isInteger(result) ? String(result) : result.toFixed(3);
    state.history.push({
      expression,
      result: resultStr,
      timestamp: Date.now(),
    });
    state.expression = resultStr;
    state.result = resultStr;
    return result;
  }

  public isVisibleTo(viewerUserId: string, ownerUserId: string): boolean {
    if (viewerUserId !== ownerUserId) return false;
    return Boolean(this.userCalculators.get(ownerUserId)?.isOpen);
  }

  public getState(userId: string): CalculatorState {
    const state = this.userCalculators.get(userId);
    if (state) return state;
    return {
      isOpen: false,
      isMinimized: false,
      position: { x: 80, y: 120 },
      expression: '',
      result: '',
      history: [],
    };
  }
}
