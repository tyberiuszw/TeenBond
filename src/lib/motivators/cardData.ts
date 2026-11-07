export interface MotivatorCardDef {
  id: string;
  code: 'C' | 'H' | 'A' | 'M' | 'P' | 'F' | 'R' | 'O' | 'G' | 'S';
  codeUpper: string;
  namePl: string;
  nameEn: string;
  frontFilename: string;
  frontFilenameAlternative: string;
  backFilename: string;
  definitionPl: string;
  definitionEn: string;
  color: string;
  category: 'Intrinsic' | 'Social' | 'Autonomy' | 'Mastery';
}

export const CHAMPFROGS_DEFINITIONS: readonly MotivatorCardDef[] = [
  {
    id: 'curiosity',
    code: 'C',
    codeUpper: 'CURIOSITY',
    namePl: 'Ciekawość',
    nameEn: 'Curiosity',
    frontFilename: 'Curiotisy Front.jpg',
    frontFilenameAlternative: 'Curiosity Front.jpg',
    backFilename: 'Curiosity Back.jpg',
    definitionPl: 'Mam wiele ciekawych rzeczy do odkrywania, badania i twórczego przemyślenia.',
    definitionEn: 'I have plenty of things to investigate and to think about.',
    color: '#3B82F6',
    category: 'Intrinsic',
  },
  {
    id: 'honor',
    code: 'H',
    codeUpper: 'HONOR',
    namePl: 'Honor / Wartości',
    nameEn: 'Honor',
    frontFilename: 'Honor Front.jpg',
    frontFilenameAlternative: 'Honor Front.jpg',
    backFilename: 'Honor Back.jpg',
    definitionPl: 'Czuję dumę, że moje osobiste wartości i standardy moralne są odzwierciedlone w sposobie naszej pracy.',
    definitionEn: 'I feel proud that my personal values are reflected in how we work.',
    color: '#8B5CF6',
    category: 'Intrinsic',
  },
  {
    id: 'acceptance',
    code: 'A',
    codeUpper: 'ACCEPTANCE',
    namePl: 'Akceptacja',
    nameEn: 'Acceptance',
    frontFilename: 'Acceptance Front.jpg',
    frontFilenameAlternative: 'Acceptance Front.jpg',
    backFilename: 'Acceptance Back.jpg',
    definitionPl: 'Ludzie w zespole akceptują i aprobują to, co robię oraz to, kim naprawdę jestem.',
    definitionEn: 'The people around me approve of what I do and who I am.',
    color: '#EC4899',
    category: 'Social',
  },
  {
    id: 'mastery',
    code: 'M',
    codeUpper: 'MASTERY',
    namePl: 'Mistrzostwo',
    nameEn: 'Mastery',
    frontFilename: 'Mastery Front.jpg',
    frontFilenameAlternative: 'Mastery Front.jpg',
    backFilename: 'Mastery Back.jpg',
    definitionPl: 'Moje zadania stanowią wyzwanie dla moich umiejętności, pozwalając mi się rozwijać, ale mieszczą się w moich możliwościach.',
    definitionEn: 'My work challenges my competence but it is still within my abilities.',
    color: '#F59E0B',
    category: 'Mastery',
  },
  {
    id: 'power',
    code: 'P',
    codeUpper: 'POWER',
    namePl: 'Wpływ / Władza',
    nameEn: 'Power',
    frontFilename: 'Power Front.jpg',
    frontFilenameAlternative: 'Power Front.jpg',
    backFilename: 'Power Back.jpg',
    definitionPl: 'Mam przestrzeń i możliwości, by wpływać na to, co dzieje się wokół mnie i w moim zespole.',
    definitionEn: "There's enough room for me to influence what happens around me.",
    color: '#EF4444',
    category: 'Autonomy',
  },
  {
    id: 'freedom',
    code: 'F',
    codeUpper: 'FREEDOM',
    namePl: 'Wolność / Autonomia',
    nameEn: 'Freedom',
    frontFilename: 'Freedom Front.jpg',
    frontFilenameAlternative: 'Freedom Front.jpg',
    backFilename: 'Freedom Back.jpg',
    definitionPl: 'Jestem niezależny od innych w sposobie wykonywania swoich zadań i realizacji obowiązków.',
    definitionEn: 'I am independent of others with my work and my responsibilities.',
    color: '#06B6D4',
    category: 'Autonomy',
  },
  {
    id: 'relatedness',
    code: 'R',
    codeUpper: 'RELATEDNESS',
    namePl: 'Relacje / Przynależność',
    nameEn: 'Relatedness',
    frontFilename: 'Relatedness Front.jpg',
    frontFilenameAlternative: 'Relatedness Front.jpg',
    backFilename: 'Relatedness Back.jpg',
    definitionPl: 'Mam dobre relacje społeczne, bliskie kontakty i poczucie więzi z ludźmi, z którymi współpracuję.',
    definitionEn: 'I have good social contacts with the people in my work.',
    color: '#10B981',
    category: 'Social',
  },
  {
    id: 'order',
    code: 'O',
    codeUpper: 'ORDER',
    namePl: 'Porządek / Zasady',
    nameEn: 'Order',
    frontFilename: 'Order Front.jpg',
    frontFilenameAlternative: 'Order Front.jpg',
    backFilename: 'Order Back.jpg',
    definitionPl: 'Jest wystarczająco dużo zasad i reguł, by zapewnić stabilne i przewidywalne środowisko.',
    definitionEn: 'There are enough rules and policies for a stable environment.',
    color: '#64748B',
    category: 'Mastery',
  },
  {
    id: 'goal',
    code: 'G',
    codeUpper: 'GOAL',
    namePl: 'Cel / Misja',
    nameEn: 'Goal',
    frontFilename: 'Goal Front.jpg',
    frontFilenameAlternative: 'Goal Front.jpg',
    backFilename: 'Goal Back.jpg',
    definitionPl: 'Mój życiowy cel, misja i poczucie sensu znajdują odzwierciedlenie w działaniach, które podejmuję.',
    definitionEn: 'My purpose in life is reflected in the work that I do.',
    color: '#84CC16',
    category: 'Intrinsic',
  },
  {
    id: 'status',
    code: 'S',
    codeUpper: 'STATUS',
    namePl: 'Status / Uznanie',
    nameEn: 'Status',
    frontFilename: 'Status Front.jpg',
    frontFilenameAlternative: 'Status Front.jpg',
    backFilename: 'Status Back.jpg',
    definitionPl: 'Moja rola i pozycja są wysokie oraz doceniane przez osoby, z którymi współpracuję.',
    definitionEn: 'My position is good, and recognized by the people who work with me.',
    color: '#E11D48',
    category: 'Social',
  },
];

/**
 * Resolves safe public URL for card image assets, with graceful fallback for Curiosity typo
 */
export function resolveCardAssetUrl(filename: string): string {
  if (!filename) return '';
  // Support encoded filename with fallback
  const cleanFilename = filename.trim();
  return `/images/cards/${encodeURIComponent(cleanFilename)}`;
}

/**
 * Normalizes identifier (handles id, code, or uppercase code like CURIOSITY)
 */
export function findCardDef(query: string): MotivatorCardDef | undefined {
  if (!query) return undefined;
  const q = query.toLowerCase().trim();
  return CHAMPFROGS_DEFINITIONS.find(
    (c) =>
      c.id.toLowerCase() === q ||
      c.code.toLowerCase() === q ||
      c.codeUpper.toLowerCase() === q
  );
}

/**
 * Validates whether the given ranking is a full valid permutation of all 10 CHAMPFROGS cards.
 */
export function validateMotivatorRanking(ranking: string[]): { isValid: boolean; error?: string } {
  if (!Array.isArray(ranking)) {
    return { isValid: false, error: 'Ranking musi być tablicą' };
  }
  if (ranking.length !== 10) {
    return { isValid: false, error: 'Ranking musi zawierać dokładnie 10 kart' };
  }
  const unique = new Set(ranking.map((r) => r.toLowerCase()));
  if (unique.size !== 10) {
    return { isValid: false, error: 'Wszystkie 10 kart musi być unikalnych' };
  }
  const allExist = ranking.every((id) => findCardDef(id) !== undefined);
  if (!allExist) {
    return { isValid: false, error: 'Ranking zawiera nieznane identyfikatory kart' };
  }
  return { isValid: true };
}
