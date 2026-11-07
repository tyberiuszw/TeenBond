import { FuzzyMatchResult } from '@/types/game';

/**
 * Normalizes a Polish string for charades comparison:
 * - Trims and lowercases
 * - Strips Polish diacritics: ą->a, ć->c, ę->e, ł->l, ń->n, ó->o, ś->s, ź->z, ż->z
 * - Purges non-alphanumeric characters and collapses spaces
 */
export function normalizeKalamburyString(str: string): string {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[łŁ]/g, 'l')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Levenshtein Distance Matrix Calculation
 */
export function calculateLevenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Evaluates an incoming player guess against the secret word.
 */
export function evaluateGuess(guess: string, secretWord: string): FuzzyMatchResult {
  const normGuess = normalizeKalamburyString(guess);
  const normSecret = normalizeKalamburyString(secretWord);

  if (!normGuess || !normSecret) {
    return {
      isExact: false,
      isFuzzyMatch: false,
      isAlmost: false,
      similarityRatio: 0,
      levenshteinDistance: 999,
    };
  }

  if (normGuess === normSecret) {
    return {
      isExact: true,
      isFuzzyMatch: true,
      isAlmost: false,
      similarityRatio: 1.0,
      levenshteinDistance: 0,
    };
  }

  const distance = calculateLevenshtein(normGuess, normSecret);
  const maxLen = Math.max(normGuess.length, normSecret.length);
  const similarity = 1 - distance / maxLen;

  // Adaptive threshold based on length of secret word
  let allowedDistance = 0;
  if (normSecret.length >= 5 && normSecret.length <= 8) {
    allowedDistance = 1;
  } else if (normSecret.length > 8) {
    allowedDistance = 2;
  }

  const isFuzzyMatch = distance <= allowedDistance && similarity >= 0.8;
  const hasStemOverlap =
    normGuess.length >= 3 &&
    normSecret.length >= 3 &&
    (normGuess.includes(normSecret) || normSecret.includes(normGuess));

  const isAlmost =
    !isFuzzyMatch &&
    (distance <= allowedDistance + 2 || similarity >= 0.65 || hasStemOverlap);

  return {
    isExact: false,
    isFuzzyMatch,
    isAlmost,
    similarityRatio: Math.max(0, similarity),
    levenshteinDistance: distance,
  };
}

/**
 * Generates masked string (e.g. "_ _ _ _ _") with optional revealed letters
 */
export function generateMaskedWord(
  word: string,
  revealCount: number = 0
): string {
  const chars = word.split('');
  return chars
    .map((char, idx) => {
      if (char === ' ') return '  ';
      if (idx < revealCount) return char;
      return '_';
    })
    .join(' ');
}
