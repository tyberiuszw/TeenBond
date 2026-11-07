import { BoardElement } from '@/types/board';

export interface LockableElement extends BoardElement {
  lockedAt?: number | null;
}

export const OBJECT_LOCK_TIMEOUT_MS = 4000; // 4 seconds auto-release

/**
 * Optimistic Object Locking Engine
 * Determines if an element is currently locked by a peer user.
 * R5-BVA-BOARD-01 compliance:
 * - Elements locked by peer remain locked for 4000ms.
 * - Lock owner is never locked out.
 * - Locks automatically expire after 4000ms of inactivity to prevent deadlocks.
 */
export function isElementLockedByOther(
  element: LockableElement,
  currentUserId: string,
  now: number = Date.now()
): boolean {
  if (!element.lockedBy) return false;
  if (element.lockedBy === currentUserId) return false;
  const lockAge = now - (element.lockedAt || 0);
  return lockAge < OBJECT_LOCK_TIMEOUT_MS;
}
