export type ValueId = string;
export type GoalId = string;
export type TaskId = string;
export type HabitId = string;
export type BadgeId = string;

export interface Value {
  id: ValueId;
  name: string;
  description?: string;
  color: string; // tailwind color token (e.g. 'indigo-500')
  domainId?: string; // optional grouping
}

export interface Goal {
  id: GoalId;
  title: string;
  description?: string;
  valueIds: ValueId[];
  progress: number; // 0‒1
  keyResults: KeyResult[];
  targetDate?: string; // ISO
}

export interface KeyResult {
  id: string;
  title: string;
  progress: number; // 0‒1
}

export interface Task {
  id: TaskId;
  title: string;
  notes?: string;
  status: 'todo' | 'doing' | 'done' | 'blocked';
  due?: string; // ISO date
  priority?: 1 | 2 | 3;
  goalId?: GoalId;
  valueIds?: ValueId[];
}

export interface Habit {
  id: HabitId;
  title: string;
  cue?: string;
  routine?: string;
  reward?: string;
  valueIds: ValueId[];
  streak: number; // current consecutive days
  bestStreak: number;
  history: Record<string, boolean>; // ISO day → done?
}

export interface Principle {
  id: string;
  title: string;
  body: string;
  valueIds: ValueId[];
}

export interface TrackedStateDef {
  id: string;
  name: string;
  scale: '1-5' | 'low-high' | 'custom';
  customLabels?: string[];
  valueIds: ValueId[];
}

export interface Badge {
  id: BadgeId;
  title: string;
  icon: string; // Hero‑icons name or emoji
  earnedAt?: string; // ISO
  progress?: number; // 0‒1 for not‑yet
} 