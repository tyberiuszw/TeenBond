import { DraculaFactItem, DraculaTeam } from '@/types/game';

export const DRACULA_FACTS: DraculaFactItem[] = [
  {
    id: 'f-01',
    factNumber: 1,
    text: 'Hrabia Drakula jest wampirem.',
    isShared: true,
    category: 'vampire_lore',
  },
  {
    id: 'f-02',
    factNumber: 2,
    text: 'Hrabia Drakula śpi w swoim grobowcu.',
    isShared: true,
    category: 'vampire_lore',
  },
  {
    id: 'f-03',
    factNumber: 3,
    text: 'Grobowiec Drakuli znajduje się w krypcie Zamku Drakula.',
    isShared: false,
    teamExclusivity: 'red_bats',
    category: 'geography',
    criticalNote: 'Kluczowe: Zamek wymaga klucza do krypty!',
  },
  {
    id: 'f-04',
    factNumber: 4,
    text: 'Nie ma bezpośredniego lotu z Londynu do Transylwanii (konieczna przesiadka w Budapeszcie).',
    isShared: true,
    category: 'logistics',
  },
  {
    id: 'f-05',
    factNumber: 5,
    text: 'Dziś jest poniedziałek.',
    isShared: true,
    category: 'time_constraint',
  },
  {
    id: 'f-06',
    factNumber: 6,
    text: 'Następny lot z Londynu do Budapesztu odlatuje dziś (w poniedziałek) o 18:00.',
    isShared: false,
    teamExclusivity: 'black_cats',
    category: 'logistics',
    criticalNote: 'Kluczowe: Godzina pierwszego wylotu z Londynu.',
  },
  {
    id: 'f-07',
    factNumber: 7,
    text: 'Lot z Londynu do Budapesztu trwa 5 godzin.',
    isShared: false,
    teamExclusivity: 'red_bats',
    category: 'logistics',
    criticalNote: 'Przylot do Budapesztu: Poniedziałek 23:00 (18:00 + 5h).',
  },
  {
    id: 'f-08',
    factNumber: 8,
    text: 'Wampira można zabić wyłącznie wbijając osinowy kołek w serce.',
    isShared: true,
    category: 'vampire_lore',
  },
  {
    id: 'f-09',
    factNumber: 9,
    text: 'Dęby i osiki nie rosną w Transylwanii.',
    isShared: false,
    teamExclusivity: 'red_bats',
    category: 'geography',
    criticalNote: 'Kołek trzeba kupić przed przybyciem do Transylwanii!',
  },
  {
    id: 'f-10',
    factNumber: 10,
    text: 'Osinowe kołki można kupić wyłącznie w sklepie z pamiątkami na lotnisku w Budapeszcie.',
    isShared: true,
    category: 'logistics',
  },
  {
    id: 'f-11',
    factNumber: 11,
    text: 'Sklep na lotnisku w Budapeszcie jest zamknięty w ten poniedziałek i wtorek z powodu lokalnego święta.',
    isShared: false,
    teamExclusivity: 'black_cats',
    category: 'time_constraint',
    criticalNote: 'Wąskie gardło: kołek można kupić najwcześniej w środę rano!',
  },
  {
    id: 'f-12',
    factNumber: 12,
    text: 'Samolot z Budapesztu do Transylwanii odlatuje o 14:00 we wtorki i czwartki (lot trwa 1 godzinę).',
    isShared: true,
    category: 'logistics',
  },
  {
    id: 'f-13',
    factNumber: 13,
    text: 'Najbliższa stacja kolejowa przy Zamku Drakula to Novahuny Junction.',
    isShared: true,
    category: 'geography',
  },
  {
    id: 'f-14',
    factNumber: 14,
    text: 'Pociąg z lotniska w Transylwanii do Novahuny Junction jedzie 6 godzin i odjeżdża w południe (12:00) w poniedziałki, środy i piątki.',
    isShared: true,
    category: 'logistics',
  },
  {
    id: 'f-15',
    factNumber: 15,
    text: 'Klucz do krypty Zamku Drakula wisi na gwoździu w zakrystii kościoła parafialnego w Novahuny, tuż obok stacji kolejowej.',
    isShared: true,
    category: 'geography',
  },
  {
    id: 'f-16',
    factNumber: 16,
    text: 'Wampiry można zabić wyłącznie za dnia (podczas światła słonecznego), gdy śpią bezsilne w grobowcu.',
    isShared: false,
    teamExclusivity: 'black_cats',
    category: 'vampire_lore',
    criticalNote: 'W nocy Drakula jest nieśmiertelny i poluje!',
  },
  {
    id: 'f-17',
    factNumber: 17,
    text: 'Kościół parafialny w Novahuny jest otwarty wyłącznie od wschodu do zachodu słońca.',
    isShared: true,
    category: 'time_constraint',
  },
  {
    id: 'f-18',
    factNumber: 18,
    text: 'O tej porze roku słońce w Transylwanii wschodzi o 9:00, a zachodzi o 17:30.',
    isShared: true,
    category: 'time_constraint',
  },
  {
    id: 'f-19',
    factNumber: 19,
    text: 'Kościół parafialny w Novahuny jest oddalony o 64 mile od Zamku Drakula.',
    isShared: false,
    teamExclusivity: 'black_cats',
    category: 'geography',
    criticalNote: 'Dystans: s = 64 mile',
  },
  {
    id: 'f-20',
    factNumber: 20,
    text: 'Najszybsza prędkość marszu pieszego z kościoła do zamku to 7 mil na godzinę (skalista trasa przełajowa i ciężki kołek).',
    isShared: false,
    teamExclusivity: 'red_bats',
    category: 'logistics',
    criticalNote: 'Prędkość: v = 7 mph -> Czas marszu: 64 / 7 = 9.14 h (~9h 9min)',
  },
];

/**
 * Divides team into Red Bats (Drużyna A) and Black Cats (Drużyna B)
 */
export function partitionDraculaSubgroups(memberIds: string[]): {
  redBats: string[];
  blackCats: string[];
} {
  const redBats: string[] = [];
  const blackCats: string[] = [];

  memberIds.forEach((mId, idx) => {
    if (idx % 2 === 0) {
      redBats.push(mId);
    } else {
      blackCats.push(mId);
    }
  });

  return { redBats, blackCats };
}

export interface DraculaResolution {
  day: string;
  time: string;
  points: number;
  synergyBadge: boolean;
  explanation: string;
}

/**
 * Evaluates the proposed day and time for killing Dracula.
 * - Saturday 9:00 AM -> Collaborative Synergy Win-Win (200 pts + Badge)
 * - Sunday 9:00 AM -> Competitive Linear Journey (100 pts)
 * - Other -> 0 pts
 */
export function resolveDraculaStrategy(day: string, time: string): DraculaResolution {
  const normDay = day.trim().toLowerCase();
  const normTime = time.trim().toLowerCase();

  // Saturday 9:00 AM (Synergia)
  if (
    (normDay === 'sobota' || normDay === 'saturday') &&
    (normTime === '9:00' || normTime === '09:00' || normTime === '9:00 am' || normTime === '9.00')
  ) {
    return {
      day: 'Sobota',
      time: '9:00',
      points: 200,
      synergyBadge: true,
      explanation:
        'Genialny plan kooperacyjny! Zespół B poleciał do Transylwanii we wtorek i odebrał klucz z kościoła w piątek rano. Zespół A przywiózł kołek z Budapesztu pociągiem w piątek o 18:00. Połączone siły wyruszyły w nocny marsz i o świcie w sobotę o 9:00 zabiły Drakulę w krypcie! Oszczędziliście 24 godziny!',
    };
  }

  // Sunday 9:00 AM (Rywalizacja)
  if (
    (normDay === 'niedziela' || normDay === 'sunday') &&
    (normTime === '9:00' || normTime === '09:00' || normTime === '9:00 am' || normTime === '9.00')
  ) {
    return {
      day: 'Niedziela',
      time: '9:00',
      points: 100,
      synergyBadge: false,
      explanation:
        'Standardowa ścieżka rywalizacyjna. Drużyna czekała do środy na otwarcie sklepu, poleciała w czwartek, pociąg w piątek, odebranie klucza w sobotę rano, dotarcie pod zamek o 18:00 (po zachodzie słońca 17:30) i zabicie Drakuli o świcie w niedzielę o 9:00.',
    };
  }

  return {
    day,
    time,
    points: 0,
    synergyBadge: false,
    explanation:
      'Niestety podany termin jest niemożliwy logistycznie lub narusza reguły walki z wampirem (słońce zachodzi o 17:30, pociągi kursują tylko w Pn/Śr/Pt o 12:00, a sklep na lotnisku jest zamknięty w Pn i Wt).',
  };
}
