import { ZinCalculationProof } from '@/types/game';

/**
 * Computes exact mathematical proof for The Zin Obelisk scenario.
 */
export function calculateZinWorkdays(): ZinCalculationProof {
  const volumeCuFt = 50 * 10 * 100; // 50,000 cu. ft.
  const totalBlocks = volumeCuFt; // 1 block = 1 cu. ft.
  const workSchlibsPerDay = 9;
  const restPonksPerDay = 16;
  const restSchlibsPerDay = restPonksPerDay / 8; // 2 schlibs
  const netSchlibsPerDay = workSchlibsPerDay - restSchlibsPerDay; // 7 schlibs
  const gangSize = 9;
  const religiousMembers = 1;
  const activeWorkers = gangSize - religiousMembers; // 8 active workers
  const blockRatePerSchlib = 150;
  const dailyBlocksPerWorker = netSchlibsPerDay * blockRatePerSchlib; // 1,050 blocks
  const dailyTeamBlocks = activeWorkers * dailyBlocksPerWorker; // 8,400 blocks
  const workdaysRequiredExact = totalBlocks / dailyTeamBlocks; // 5.95238...
  const workdaysNeeded = Math.ceil(workdaysRequiredExact); // 6th workday

  return {
    volumeCuFt,
    totalBlocks,
    workSchlibsPerDay,
    restPonksPerDay,
    restSchlibsPerDay,
    netSchlibsPerDay,
    gangSize,
    religiousMembers,
    activeWorkers,
    blockRatePerSchlib,
    dailyBlocksPerWorker,
    dailyTeamBlocks,
    workdaysRequiredExact,
    workdaysNeeded,
    completionCalendarDay: 'Neptiminus',
    calendarWeekDays: ['Aguaday', 'Neptiminus', 'Sharkday', 'Mermaidday', 'Daydoldrum'],
  };
}

/**
 * Validates Zin Obelisk user answer.
 * Case-insensitive, diacritic-tolerant, SQL injection & XSS protected.
 */
export function validateZinAnswer(input: string): boolean {
  if (!input || !input.trim()) return false;

  const normalized = input
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  const acceptedMatches = [
    'neptiminus',
    'neptominus',
    'dzienneptuna',
    'neptomindzien',
    'day2neptiminus',
    'neptiminusday',
  ];

  return acceptedMatches.some((match) => normalized.includes(match) || match.includes(normalized));
}

export interface ZinDayProgress {
  week: number;
  dayOfWeek: string;
  isWorkday: boolean;
  workdayNumber: number | null;
  blocksLaidToday: number;
  cumulativeBlocks: number;
  remainingBlocks: number;
  isCompletionDay: boolean;
}

/**
 * Generates the full day-by-day accumulation schedule for the debriefing modal.
 */
export function getZinDailySchedule(): ZinDayProgress[] {
  return [
    {
      week: 1,
      dayOfWeek: 'Aguaday',
      isWorkday: true,
      workdayNumber: 1,
      blocksLaidToday: 8400,
      cumulativeBlocks: 8400,
      remainingBlocks: 41600,
      isCompletionDay: false,
    },
    {
      week: 1,
      dayOfWeek: 'Neptiminus',
      isWorkday: true,
      workdayNumber: 2,
      blocksLaidToday: 8400,
      cumulativeBlocks: 16800,
      remainingBlocks: 33200,
      isCompletionDay: false,
    },
    {
      week: 1,
      dayOfWeek: 'Sharkday',
      isWorkday: true,
      workdayNumber: 3,
      blocksLaidToday: 8400,
      cumulativeBlocks: 25200,
      remainingBlocks: 24800,
      isCompletionDay: false,
    },
    {
      week: 1,
      dayOfWeek: 'Mermaidday',
      isWorkday: true,
      workdayNumber: 4,
      blocksLaidToday: 8400,
      cumulativeBlocks: 33600,
      remainingBlocks: 16400,
      isCompletionDay: false,
    },
    {
      week: 1,
      dayOfWeek: 'Daydoldrum',
      isWorkday: false,
      workdayNumber: null,
      blocksLaidToday: 0,
      cumulativeBlocks: 33600,
      remainingBlocks: 16400,
      isCompletionDay: false,
    },
    {
      week: 2,
      dayOfWeek: 'Aguaday',
      isWorkday: true,
      workdayNumber: 5,
      blocksLaidToday: 8400,
      cumulativeBlocks: 42000,
      remainingBlocks: 8000,
      isCompletionDay: false,
    },
    {
      week: 2,
      dayOfWeek: 'Neptiminus',
      isWorkday: true,
      workdayNumber: 6,
      blocksLaidToday: 8000,
      cumulativeBlocks: 50000,
      remainingBlocks: 0,
      isCompletionDay: true,
    },
  ];
}
