export interface ChameleonColorDef {
  id: string;
  namePl: string;
  nameEn: string;
  hex: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  ringClass: string;
  glowClass: string;
  description: string;
}

export const CHAMELEON_PALETTE: readonly ChameleonColorDef[] = [
  {
    id: 'emerald',
    namePl: 'Szmaragdowy',
    nameEn: 'Emerald',
    hex: '#10B981',
    bgClass: 'bg-emerald-500',
    borderClass: 'border-emerald-500',
    textClass: 'text-emerald-500',
    ringClass: 'ring-emerald-500',
    glowClass: 'shadow-[0_0_15px_rgba(16,185,129,0.5)]',
    description: 'Harmonia, przywództwo i zaangażowanie (Liderzy Jutra)',
  },
  {
    id: 'blue',
    namePl: 'Błękitny',
    nameEn: 'Blue',
    hex: '#3B82F6',
    bgClass: 'bg-blue-500',
    borderClass: 'border-blue-500',
    textClass: 'text-blue-500',
    ringClass: 'ring-blue-500',
    glowClass: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]',
    description: 'Spokój, analityka i stabilność',
  },
  {
    id: 'purple',
    namePl: 'Fioletowy',
    nameEn: 'Purple',
    hex: '#8B5CF6',
    bgClass: 'bg-purple-500',
    borderClass: 'border-purple-500',
    textClass: 'text-purple-500',
    ringClass: 'ring-purple-500',
    glowClass: 'shadow-[0_0_15px_rgba(139,92,246,0.5)]',
    description: 'Kreatywność, intuicja i koordynacja celu',
  },
  {
    id: 'pink',
    namePl: 'Różowy',
    nameEn: 'Pink',
    hex: '#EC4899',
    bgClass: 'bg-pink-500',
    borderClass: 'border-pink-500',
    textClass: 'text-pink-500',
    ringClass: 'ring-pink-500',
    glowClass: 'shadow-[0_0_15px_rgba(236,72,153,0.5)]',
    description: 'Empatia, aktywne słuchanie i spoiwo relacyjne',
  },
  {
    id: 'amber',
    namePl: 'Bursztynowy',
    nameEn: 'Amber',
    hex: '#F59E0B',
    bgClass: 'bg-amber-500',
    borderClass: 'border-amber-500',
    textClass: 'text-amber-500',
    ringClass: 'ring-amber-500',
    glowClass: 'shadow-[0_0_15px_rgba(245,158,11,0.5)]',
    description: 'Energia, optymizm i analityczna przenikliwość',
  },
  {
    id: 'red',
    namePl: 'Czerwony',
    nameEn: 'Red',
    hex: '#EF4444',
    bgClass: 'bg-red-500',
    borderClass: 'border-red-500',
    textClass: 'text-red-500',
    ringClass: 'ring-red-500',
    glowClass: 'shadow-[0_0_15px_rgba(239,68,68,0.5)]',
    description: 'Odwaga, dynamika i determinacja',
  },
  {
    id: 'cyan',
    namePl: 'Turkusowy',
    nameEn: 'Cyan',
    hex: '#06B6D4',
    bgClass: 'bg-cyan-500',
    borderClass: 'border-cyan-500',
    textClass: 'text-cyan-500',
    ringClass: 'ring-cyan-500',
    glowClass: 'shadow-[0_0_15px_rgba(6,182,212,0.5)]',
    description: 'Świeżość, innowacja i otwarta komunikacja',
  },
  {
    id: 'lime',
    namePl: 'Limonkowy',
    nameEn: 'Lime',
    hex: '#84CC16',
    bgClass: 'bg-lime-500',
    borderClass: 'border-lime-500',
    textClass: 'text-lime-500',
    ringClass: 'ring-lime-500',
    glowClass: 'shadow-[0_0_15px_rgba(132,204,22,0.5)]',
    description: 'Zwinność, witalność i adaptacja',
  },
];

export const DEFAULT_CHAMELEON_COLOR = CHAMELEON_PALETTE[0]; // Emerald
