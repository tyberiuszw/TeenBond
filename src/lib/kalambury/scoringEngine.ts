import { KalamburyTier } from '@/types/game';

/**
 * Kalambury Live Scoring Engine
 * Complies with R5-KALAM-01 test contract:
 * - Guesser: Math.round(50 + 50 * (timeLeft / 60)) -> 50 to 100 points
 * - Drawer: Math.round(25 * (guessersCount / (totalPlayers - 1)))
 */
export function calculateKalamburyScores(
  timeLeftSec: number,
  totalPlayers: number,
  guessersCount: number,
  tier: KalamburyTier = 'easy'
): {
  guesserPoints: number;
  drawerPoints: number;
} {
  const clampedTime = Math.max(0, Math.min(60, timeLeftSec));
  const baseGuesserPoints = Math.round(50 + 50 * (clampedTime / 60));

  const divisor = Math.max(1, totalPlayers - 1);
  const baseDrawerPoints = Math.round(25 * (guessersCount / divisor));

  const tierMultiplier =
    tier === 'hard' ? 1.5 : tier === 'medium' ? 1.2 : 1.0;

  // If tier is default 'easy' (1.0), returns pure base matching unit tests
  return {
    guesserPoints: Math.round(baseGuesserPoints * (tier === 'easy' ? 1.0 : tierMultiplier)),
    drawerPoints: Math.round(baseDrawerPoints * (tier === 'easy' ? 1.0 : tierMultiplier)),
  };
}
