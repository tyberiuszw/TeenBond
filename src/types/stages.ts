export type StageId = 1 | 2 | 3 | 4 | 5 | 6;
export type StageStatus = 'locked' | 'unlocked' | 'in_progress' | 'completed';

export interface StageInfo {
  id: StageId;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  status: StageStatus;
  href: string;
  isLeaderOnly?: boolean;
  gameType?: string;
  estimatedTimeMin: number;
}
