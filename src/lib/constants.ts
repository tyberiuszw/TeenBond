import { CHAMELEON_PALETTE, ChameleonColorDef } from '@/types/chameleon';
import { StageInfo } from '@/types/stages';

export const CHAMELEON_COLORS = CHAMELEON_PALETTE;
export const DEFAULT_CHAMELEON_HEX = '#10B981';

export function getChameleonDef(colorInput?: string): ChameleonColorDef {
  if (!colorInput) return CHAMELEON_PALETTE[0];
  const normalized = colorInput.toLowerCase().trim();

  // Exact ID or HEX match
  const match = CHAMELEON_PALETTE.find(
    (c) => c.id.toLowerCase() === normalized || c.hex.toLowerCase() === normalized
  );
  if (match) return match;

  // Legacy / fallback mappings from tests or older drafts
  if (normalized === '#22c55e') return CHAMELEON_PALETTE[0]; // Emerald
  if (normalized === '#f97316') return CHAMELEON_PALETTE[4]; // Amber/Orange
  if (normalized === '#eab308') return CHAMELEON_PALETTE[4]; // Amber

  return CHAMELEON_PALETTE[0];
}

export interface MotivatorCardDef {
  id: string;
  code: string;
  letter: string;
  namePl: string;
  nameEn: string;
  definitionPl: string;
  definitionEn: string;
  color: string;
}

export const MOTIVATOR_CARDS: readonly MotivatorCardDef[] = [
  {
    id: 'curiosity',
    code: 'CURIOSITY',
    letter: 'C',
    namePl: 'Ciekawość',
    nameEn: 'Curiosity',
    definitionPl: 'Potrzeba poznawania nowych rzeczy, zadawania pytań i ciągłego odkrywania otoczenia.',
    definitionEn: 'A desire to learn new things, explore ideas and investigate solutions.',
    color: '#3B82F6',
  },
  {
    id: 'honor',
    code: 'HONOR',
    letter: 'H',
    namePl: 'Wartości / Honor',
    nameEn: 'Honor',
    definitionPl: 'Duma z postępowania zgodnie z własnymi wartościami moralnymi i zasadami etycznymi.',
    definitionEn: 'Pride in standing up for what is right and following ethical principles.',
    color: '#8B5CF6',
  },
  {
    id: 'acceptance',
    code: 'ACCEPTANCE',
    letter: 'A',
    namePl: 'Akceptacja',
    nameEn: 'Acceptance',
    definitionPl: 'Poczucie bycia zaakceptowanym przez zespół takim, jakim się jest, bez konieczności udawania.',
    definitionEn: 'Feeling welcomed and respected by the group for who you truly are.',
    color: '#EC4899',
  },
  {
    id: 'mastery',
    code: 'MASTERY',
    letter: 'M',
    namePl: 'Mistrzostwo',
    nameEn: 'Mastery',
    definitionPl: 'Dążenie do doskonalenia swoich umiejętności i stawania się ekspertem w swojej dziedzinie.',
    definitionEn: 'Striving to continuously improve skills and achieve excellence.',
    color: '#F59E0B',
  },
  {
    id: 'power',
    code: 'POWER',
    letter: 'P',
    namePl: 'Wpływ / Władza',
    nameEn: 'Power',
    definitionPl: 'Możliwość wpływania na decyzje, kierunek działań zespołu oraz otaczający świat.',
    definitionEn: 'The ability to influence decisions, direct actions and make an impact.',
    color: '#EF4444',
  },
  {
    id: 'freedom',
    code: 'FREEDOM',
    letter: 'F',
    namePl: 'Wolność / Autonomia',
    nameEn: 'Freedom',
    definitionPl: 'Niezależność w wyborze metod pracy, własnego tempa i podejmowaniu decyzji.',
    definitionEn: 'Autonomy and independence in work methods, schedule and decision making.',
    color: '#06B6D4',
  },
  {
    id: 'relatedness',
    code: 'RELATEDNESS',
    letter: 'R',
    namePl: 'Relacje',
    nameEn: 'Relatedness',
    definitionPl: 'Głębokie więzi z innymi, przyjacielskie kontakty i poczucie przynależności.',
    definitionEn: 'Meaningful connections, friendships and a sense of team belonging.',
    color: '#10B981',
  },
  {
    id: 'order',
    code: 'ORDER',
    letter: 'O',
    namePl: 'Porządek / Zasady',
    nameEn: 'Order',
    definitionPl: 'Jasne reguły, struktura, stabilność i przewidywalność w codziennych zadaniach.',
    definitionEn: 'Clear rules, structure, stability and predictable processes.',
    color: '#64748B',
  },
  {
    id: 'goal',
    code: 'GOAL',
    letter: 'G',
    namePl: 'Cel',
    nameEn: 'Goal',
    definitionPl: 'Świadomość sensu tego, co robimy, oraz dążenie do wspólnego, inspirującego celu.',
    definitionEn: 'Understanding the higher purpose and working towards an inspiring objective.',
    color: '#84CC16',
  },
  {
    id: 'status',
    code: 'STATUS',
    letter: 'S',
    namePl: 'Status / Uznanie',
    nameEn: 'Status',
    definitionPl: 'Docenienie pozycji, wkładu w sukces i publiczne uznanie ze strony innych.',
    definitionEn: 'Recognition of achievements, social standing and value by peers.',
    color: '#E11D48',
  },
];

export const STAGES_CONFIG: readonly StageInfo[] = [
  {
    id: 1,
    number: 1,
    title: 'Karty Motywatorów',
    subtitle: 'Moduł CHAMPFROGS',
    description: 'Odkryj, co naprawdę napędza Ciebie i Twój zespół. 10 kart motywatorów z obrotem 3D oraz indywidualnym i zespołowym rankingiem Drag & Drop.',
    iconName: 'Sparkles',
    status: 'completed',
    href: '/path?stage=1',
    estimatedTimeMin: 15,
  },
  {
    id: 2,
    number: 2,
    title: 'Zagubieni na Morzu',
    subtitle: 'Kooperacyjny Scenariusz Decyzyjny',
    description: 'Symulacja przetrwania US Coast Guard. Faza indywidualna z timerem, burza mózgów na żywo, wyliczenie Efektu Synergii i identyfikacja Cichego Eksperta.',
    iconName: 'Compass',
    status: 'completed',
    href: '/path?stage=2',
    estimatedTimeMin: 25,
  },
  {
    id: 3,
    number: 3,
    title: 'Drzewko Relacji',
    subtitle: 'Diagnostyka Wzajemnych Więzi',
    description: 'Deterministyczny graf relacji i zaufania wyliczany po rozgrywkach zespołowych. Wyłącznie dla Lidera – odkryj filary zaufania i ukryte napięcia.',
    iconName: 'GitFork',
    status: 'unlocked',
    href: '/relations',
    isLeaderOnly: true,
    estimatedTimeMin: 10,
  },
  {
    id: 4,
    number: 4,
    title: 'The Zin Obelisk',
    subtitle: 'Współpraca na TeenBoard',
    description: '33 unikalne karty poszlak rozdzielone między graczy. 25 minut na wspólnej tablicy, prywatny kalkulator i obliczenie dnia ukończenia obelisku (Neptiminus).',
    iconName: 'Layers',
    status: 'unlocked',
    href: '/path/stage4',
    estimatedTimeMin: 25,
  },
  {
    id: 5,
    number: 5,
    title: 'Gry Śledcze & Dracula',
    subtitle: 'Murder Mystery i Negocjacje',
    description: 'Dwa pokoje śledcze (The Movie & TechStream) oraz scenariusz Dracula z podziałem na podgrupy (Nietoperze vs Koty) i pokojem negocjacji 1-na-1.',
    iconName: 'ShieldAlert',
    status: 'unlocked',
    href: '/path/stage5',
    estimatedTimeMin: 35,
  },
  {
    id: 6,
    number: 6,
    title: 'Tryb Swobodny & Kalambury',
    subtitle: 'Swobodna Integracja Zespołowa',
    description: 'Kalambury integracyjne na żywo (Skribbl-style) z dynamicznym czatem i tolerancją literówek oraz swobodny powrót do wcześniejszych gier.',
    iconName: 'PartyPopper',
    status: 'unlocked',
    href: '/path/stage6',
    estimatedTimeMin: 20,
  },
];
