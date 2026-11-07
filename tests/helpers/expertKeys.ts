import { MotivatorCard, DecisionItem, PeerEvaluationAnswer } from './contracts';

// 1. CHAMPFROGS 10 CARDS (10 pairs front/back in C:\Users\TUF\Downloads)
export const CHAMPFROGS_CARDS: MotivatorCard[] = [
  {
    id: 'acceptance',
    code: 'A',
    nameEn: 'Acceptance',
    namePl: 'Akceptacja',
    frontFilename: 'Acceptance Front.jpg',
    backFilename: 'Acceptance Back.jpg',
    definitionEn: 'The people around me approve of what I do and who I am.',
    definitionPl: 'Ludzie w zespole akceptują i aprobują to, co robię oraz to, kim naprawdę jestem.'
  },
  {
    id: 'curiosity',
    code: 'C',
    nameEn: 'Curiosity',
    namePl: 'Ciekawość',
    frontFilename: 'Curiotisy Front.jpg', // Official filename in Downloads has typo
    frontFilenameAlternative: 'Curiosity Front.jpg',
    backFilename: 'Curiosity Back.jpg',
    definitionEn: 'I have plenty of things to investigate and to think about.',
    definitionPl: 'Mam wiele ciekawych rzeczy do odkrywania, badania i twórczego przemyślenia.'
  },
  {
    id: 'freedom',
    code: 'F',
    nameEn: 'Freedom',
    namePl: 'Wolność',
    frontFilename: 'Freedom Front.jpg',
    backFilename: 'Freedom Back.jpg',
    definitionEn: 'I am independent of others with my work and my responsibilities.',
    definitionPl: 'Jestem niezależny od innych w sposobie wykonywania swoich zadań i realizacji obowiązków.'
  },
  {
    id: 'goal',
    code: 'G',
    nameEn: 'Goal',
    namePl: 'Cel',
    frontFilename: 'Goal Front.jpg',
    backFilename: 'Goal Back.jpg',
    definitionEn: 'My purpose in life is reflected in the work that I do.',
    definitionPl: 'Mój życiowy cel, misja i poczucie sensu znajdują odzwierciedlenie w działaniach, które podejmuję.'
  },
  {
    id: 'honor',
    code: 'H',
    nameEn: 'Honor',
    namePl: 'Honor / Wartości',
    frontFilename: 'Honor Front.jpg',
    backFilename: 'Honor Back.jpg',
    definitionEn: 'I feel proud that my personal values are reflected in how we work.',
    definitionPl: 'Czuję dumę, że moje osobiste wartości i standardy moralne są odzwierciedlone w sposobie naszej pracy.'
  },
  {
    id: 'mastery',
    code: 'M',
    nameEn: 'Mastery',
    namePl: 'Mistrzostwo',
    frontFilename: 'Mastery Front.jpg',
    backFilename: 'Mastery Back.jpg',
    definitionEn: 'My work challenges my competence but it is still within my abilities.',
    definitionPl: 'Moje zadania stanowią wyzwanie dla moich umiejętności, pozwalając mi się rozwijać, ale mieszczą się w moich możliwościach.'
  },
  {
    id: 'order',
    code: 'O',
    nameEn: 'Order',
    namePl: 'Porządek',
    frontFilename: 'Order Front.jpg',
    backFilename: 'Order Back.jpg',
    definitionEn: 'There are enough rules and policies for a stable environment.',
    definitionPl: 'Jest wystarczająco dużo zasad i reguł, by zapewnić stabilne i przewidywalne środowisko.'
  },
  {
    id: 'power',
    code: 'P',
    nameEn: 'Power',
    namePl: 'Wpływ / Władza',
    frontFilename: 'Power Front.jpg',
    backFilename: 'Power Back.jpg',
    definitionEn: "There's enough room for me to influence what happens around me.",
    definitionPl: 'Mam przestrzeń i możliwości, by wpływać na to, co dzieje się wokół mnie i w moim zespole.'
  },
  {
    id: 'relatedness',
    code: 'R',
    nameEn: 'Relatedness',
    namePl: 'Relacje / Przynależność',
    frontFilename: 'Relatedness Front.jpg',
    backFilename: 'Relatedness Back.jpg',
    definitionEn: 'I have good social contacts with the people in my work.',
    definitionPl: 'Mam dobre relacje społeczne, bliskie kontakty i poczucie więzi z ludźmi, z którymi współpracuję.'
  },
  {
    id: 'status',
    code: 'S',
    nameEn: 'Status',
    namePl: 'Status / Uznanie',
    frontFilename: 'Status Front.jpg',
    backFilename: 'Status Back.jpg',
    definitionEn: 'My position is good, and recognized by the people who work with me.',
    definitionPl: 'Moja rola i pozycja są wysokie oraz doceniane przez osoby, z którymi współpracuję.'
  }
];

// 2. LOST AT SEA - 15 ITEMS (US Coast Guard Official Key)
export const LOST_AT_SEA_ITEMS: DecisionItem[] = [
  { id: 'mirror', nameEn: 'Shaving Mirror', namePl: 'Lusterko do golenia', officialRank: 1 },
  { id: 'oil_can', nameEn: '10 liter can of Oil/Petrol mixture', namePl: '10-litrowy kanister mieszanki oleju i benzyny', officialRank: 2 },
  { id: 'water', nameEn: '25 liter container of Water', namePl: '25-litrowy pojemnik z wodą pitną', officialRank: 3 },
  { id: 'rations', nameEn: 'Case of Army Rations', namePl: 'Skrzynka wojskowych racji żywnościowych', officialRank: 4 },
  { id: 'plastic_sheet', nameEn: '20 sq. ft. of opaque Plastic Sheeting', namePl: 'Nieprzezroczysta płachta plastikowa (ok. 2 m²)', officialRank: 5 },
  { id: 'chocolate', nameEn: '2 boxes of Chocolate Bars', namePl: '2 pudełka tabliczek czekolady', officialRank: 6 },
  { id: 'fishing_kit', nameEn: 'An ocean Fishing Kit & Pole', namePl: 'Zestaw wędkarski z wędką', officialRank: 7 },
  { id: 'rope', nameEn: '15 ft. of Nylon Rope', namePl: '5 metrów liny nylonowej (15 ft)', officialRank: 8 },
  { id: 'seat_cushion', nameEn: 'Floating Seat Cushion', namePl: 'Pływająca poduszka do siedzenia', officialRank: 9 },
  { id: 'shark_repellent', nameEn: 'Can of Shark Repellent', namePl: 'Puszka odstraszacza rekinów', officialRank: 10 },
  { id: 'rubbing_alcohol', nameEn: 'One bottle of Rubbing Alcohol', namePl: 'Butelka spirytusu salicylowego', officialRank: 11 },
  { id: 'radio', nameEn: 'Small Transistor Radio', namePl: 'Małe radio tranzystorowe', officialRank: 12 },
  { id: 'maps', nameEn: 'Maps of the Pacific Ocean', namePl: 'Mapy Oceanu Spokojnego', officialRank: 13 },
  { id: 'mosquito_netting', nameEn: 'Mosquito Netting', namePl: 'Moskitiera', officialRank: 14 },
  { id: 'sextant', nameEn: 'Sextant', namePl: 'Sekstant', officialRank: 15 }
];

// 3. NASA MOON SURVIVAL - 15 ITEMS (NASA Official Key)
export const NASA_MOON_ITEMS: DecisionItem[] = [
  { id: 'oxygen_tanks', nameEn: 'Two 100 lb. tanks of oxygen', namePl: 'Dwie 45-kg butle z tlenem (100 lb)', officialRank: 1 },
  { id: 'water', nameEn: '20 liters of water', namePl: '20 litrów wody pitnej', officialRank: 2 },
  { id: 'stellar_map', nameEn: 'Stellar map', namePl: 'Mapa gwiazd (konstelacji)', officialRank: 3 },
  { id: 'food_concentrate', nameEn: 'Food concentrate', namePl: 'Koncentrat żywnościowy', officialRank: 4 },
  { id: 'solar_fm_radio', nameEn: 'Solar-powered FM receiver-transmitter', namePl: 'Nadajnik-odbiornik FM zasilany energią słoneczną', officialRank: 5 },
  { id: 'nylon_rope', nameEn: '50 feet of nylon rope', namePl: '15 metrów liny nylonowej (50 ft)', officialRank: 6 },
  { id: 'first_aid_kit', nameEn: 'First aid kit, including injection needle', namePl: 'Apteczka pierwszej pomocy z igłą do iniekcji', officialRank: 7 },
  { id: 'parachute_silk', nameEn: 'Parachute silk', namePl: 'Jedwab spadochronowy', officialRank: 8 },
  { id: 'life_raft', nameEn: 'Self-inflating life raft', namePl: 'Samopompująca się tratwa ratunkowa', officialRank: 9 },
  { id: 'signal_flares', nameEn: 'Signal flares', namePl: 'Race sygnalizacyjne (flary)', officialRank: 10 },
  { id: 'pistols', nameEn: 'Two .45 caliber pistols', namePl: 'Dwa pistolety kalibru .45', officialRank: 11 },
  { id: 'dehydrated_milk', nameEn: 'One case of dehydrated milk', namePl: 'Skrzynka mleka w proszku', officialRank: 12 },
  { id: 'heating_unit', nameEn: 'Portable heating unit', namePl: 'Przenośna jednostka grzewcza (piecyk)', officialRank: 13 },
  { id: 'magnetic_compass', nameEn: 'Magnetic compass', namePl: 'Kompas magnetyczny', officialRank: 14 },
  { id: 'matches', nameEn: 'Box of matches', namePl: 'Pudełko zapałek', officialRank: 15 }
];

// MATHEMATICAL SCORING FUNCTIONS

/**
 * Calculates sum of absolute differences between user/team rankings and expert key.
 * Theoretical range: 0 <= score <= 112 (for 15 items).
 */
export function calculateAbsoluteDifferenceSum(userRanking: number[], expertRanking: number[]): number {
  if (userRanking.length !== expertRanking.length) {
    throw new Error(`Length mismatch: user=${userRanking.length}, expert=${expertRanking.length}`);
  }
  return userRanking.reduce((sum, userRank, index) => {
    return sum + Math.abs(userRank - expertRanking[index]);
  }, 0);
}

/**
 * Synergy delta: Delta = Mean(IndividualScores) - TeamScore
 * If Delta > 0, teamwork reduced error (positive synergy).
 */
export function calculateSynergy(individualScores: number[], teamScore: number): { synergyDelta: number; isSynergyPositive: boolean } {
  if (individualScores.length === 0) {
    return { synergyDelta: 0, isSynergyPositive: false };
  }
  const avgIndividual = individualScores.reduce((a, b) => a + b, 0) / individualScores.length;
  const synergyDelta = Math.round((avgIndividual - teamScore) * 100) / 100;
  return {
    synergyDelta,
    isSynergyPositive: synergyDelta > 0
  };
}

/**
 * Silent Expert Detection:
 * A member is a Silent Expert if their individual score is the best in the team AND
 * TeamScore - BestIndividualScore >= 5
 */
export function detectSilentExpert(
  individualScores: { userId: string; score: number }[],
  teamScore: number
): { isSilentExpert: boolean; silentExpertUserId?: string; difference: number } {
  if (individualScores.length === 0) {
    return { isSilentExpert: false, difference: 0 };
  }
  const best = individualScores.reduce((min, cur) => (cur.score < min.score ? cur : min));
  const difference = teamScore - best.score;
  const isSilentExpert = difference >= 5;
  return {
    isSilentExpert,
    silentExpertUserId: isSilentExpert ? best.userId : undefined,
    difference
  };
}

/**
 * Relationship Tree Edge Weight W(A, B):
 * Sum of directed peer points between A and B across completed evaluation rounds.
 * Q1: +3, Q2: +2, Q3: +2, Q4: -1
 */
export function calculatePairwiseWeight(
  evaluations: PeerEvaluationAnswer[],
  userA: string,
  userB: string
): { weight: number; mentionsAtoB: number; mentionsBtoA: number; chaosBetween: boolean } {
  let weight = 0;
  let mentionsAtoB = 0;
  let mentionsBtoA = 0;
  let chaosBetween = false;

  for (const ev of evaluations) {
    // Evaluation from A to B
    if (ev.evaluatorId === userA) {
      if (ev.bestCollabUserId === userB) { weight += 3; mentionsAtoB++; }
      if (ev.activeListenerUserId === userB) { weight += 2; mentionsAtoB++; }
      if (ev.goalOrganizerUserId === userB) { weight += 2; mentionsAtoB++; }
      if (ev.chaosUserId === userB) { weight -= 1; mentionsAtoB++; chaosBetween = true; }
    }
    // Evaluation from B to A
    if (ev.evaluatorId === userB) {
      if (ev.bestCollabUserId === userA) { weight += 3; mentionsBtoA++; }
      if (ev.activeListenerUserId === userA) { weight += 2; mentionsBtoA++; }
      if (ev.goalOrganizerUserId === userA) { weight += 2; mentionsBtoA++; }
      if (ev.chaosUserId === userA) { weight -= 1; mentionsBtoA++; chaosBetween = true; }
    }
  }

  return { weight, mentionsAtoB, mentionsBtoA, chaosBetween };
}

/**
 * Maps edge weight W(A,B) to visual style in Drzewko Relacji:
 * W <= 0: dashed 1px (or none if no interaction at all)
 * 1 <= W <= 3: solid 1px
 * 4 <= W <= 7: solid 3px
 * W >= 8: solid 6px with glow
 */
export function determineEdgeStyle(weight: number, hasChaosMention: boolean = false): {
  style: 'dashed' | 'thin' | 'medium' | 'thick';
  strokeWidth: number;
  hasGlow: boolean;
  visible: boolean;
  cssClass: string;
} {
  if (weight <= 0) {
    return {
      style: 'dashed',
      strokeWidth: 1,
      hasGlow: false,
      visible: hasChaosMention, // only visible if there's tension/chaos
      cssClass: 'stroke-dashed-tension'
    };
  }
  if (weight >= 1 && weight <= 3) {
    return {
      style: 'thin',
      strokeWidth: 1,
      hasGlow: false,
      visible: true,
      cssClass: 'stroke-solid-thin'
    };
  }
  if (weight >= 4 && weight <= 7) {
    return {
      style: 'medium',
      strokeWidth: 3,
      hasGlow: false,
      visible: true,
      cssClass: 'stroke-solid-medium'
    };
  }
  return {
    style: 'thick',
    strokeWidth: 6,
    hasGlow: true,
    visible: true,
    cssClass: 'stroke-solid-thick-glow'
  };
}

/**
 * Zin Obelisk mathematical proof calculation:
 * 50x10x100 = 50,000 blocks
 * 9 - 2 = 7 schlibs/day net work
 * 9 - 1 = 8 active block layers
 * 8 * (7 * 150) = 8,400 blocks/day
 * 50,000 / 8,400 = 5.952 workdays -> 6th workday
 * Daydoldrum is non-working day.
 * Work starts Aguaday (Day 1).
 * Week 1: Aguaday(1), Neptiminus(2), Sharkday(3), Mermaidday(4), Daydoldrum(REST)
 * Week 2: Aguaday(5), Neptiminus(6) -> Finished on Neptiminus!
 */
export function calculateZinWorkdays(): {
  totalBlocks: number;
  netSchlibsPerDay: number;
  activeWorkers: number;
  dailyBlocks: number;
  workdaysNeeded: number;
  completionCalendarDay: string;
} {
  const volume = 50 * 10 * 100; // 50,000 cu. ft. = 50,000 blocks
  const netSchlibs = 9 - (16 / 8); // 9 - 2 = 7 schlibs
  const activeWorkers = 9 - 1; // 8 workers
  const blocksPerWorkerPerDay = netSchlibs * 150; // 1050 blocks
  const dailyTeamBlocks = activeWorkers * blocksPerWorkerPerDay; // 8400 blocks
  const workdaysNeeded = Math.ceil(volume / dailyTeamBlocks); // 6th workday
  
  // Week calendar mapping:
  // Day 1: Aguaday, Day 2: Neptiminus, Day 3: Sharkday, Day 4: Mermaidday, Day 5: Daydoldrum (off)
  // Workday 1: W1D1 Aguaday
  // Workday 2: W1D2 Neptiminus
  // Workday 3: W1D3 Sharkday
  // Workday 4: W1D4 Mermaidday
  // (Rest on Daydoldrum)
  // Workday 5: W2D1 Aguaday
  // Workday 6: W2D2 Neptiminus
  return {
    totalBlocks: volume,
    netSchlibsPerDay: netSchlibs,
    activeWorkers,
    dailyBlocks: dailyTeamBlocks,
    workdaysNeeded,
    completionCalendarDay: 'Neptiminus'
  };
}

/**
 * Validates Zin Obelisk user input against accepted variations
 */
export function validateZinAnswer(input: string): boolean {
  if (!input) return false;
  const normalized = input
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');
  const accepted = ['neptiminus', 'neptominus', 'neptomindzien', 'dzienneptuna'];
  return accepted.includes(normalized);
}

/**
 * Kalambury live scoring formula:
 * Guesser: round(50 + 50 * (timeLeft / 60)) -> 50 to 100 pts
 * Drawer: round(25 * (k / (totalPlayers - 1)))
 */
export function calculateKalamburyScores(timeLeftSec: number, totalPlayers: number, guessersCount: number): {
  guesserPoints: number;
  drawerPoints: number;
} {
  const clampedTime = Math.max(0, Math.min(60, timeLeftSec));
  const guesserPoints = Math.round(50 + 50 * (clampedTime / 60));
  const divisor = Math.max(1, totalPlayers - 1);
  const drawerPoints = Math.round(25 * (guessersCount / divisor));
  return { guesserPoints, drawerPoints };
}
