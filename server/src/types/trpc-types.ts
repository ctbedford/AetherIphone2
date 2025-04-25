/*
  Aether – Shared tRPC Types
  ------------------------------------------------------------------
  Every Zod schema that powers a router lives here so both the server
  (routers) and the client (React Query hooks) reference a **single**
  source‑of‑truth.  Import these types everywhere else – **never** hand‑roll
  shapes again.
*/

import { z } from 'zod';
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '../router';

/* ------------------------------------------------------------------
 *  Domain Models (DB row shapes) – keep in sync with Supabase tables
 * ----------------------------------------------------------------*/
export const UserProfile = z.object({
  id: z.string().uuid(),
  username: z.string().nullish(),
  avatar_url: z.string().url().nullish(),
  full_name: z.string().nullish(),
  bio: z.string().nullish(),
  time_zone: z.string().nullish(),
  onboarding_completed: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type UserProfile = z.infer<typeof UserProfile>;

export const NotificationPrefs = z.object({
  email: z.boolean().default(true),
  push: z.boolean().default(true),
  task_reminders: z.boolean().default(true),
  goal_updates: z.boolean().default(true),
  habit_reminders: z.boolean().default(true),
});

export const UiPrefs = z.object({
  theme: z.enum(['system', 'light', 'dark']).default('system'),
  compact_view: z.boolean().default(false),
  show_completed_tasks: z.boolean().default(true),
});

export const UserSettings = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  notification_preferences: NotificationPrefs,
  ui_preferences: UiPrefs,
});
export type UserSettings = z.infer<typeof UserSettings>;

export const Value = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullish(),
  color: z.string().nullish(),
  icon: z.string().nullish(),
  created_at: z.string().datetime(),
});
export type Value = z.infer<typeof Value>;

export const Goal = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullish(),
  status: z.enum(['active', 'completed', 'archived']),
  target_date: z.string().datetime().nullish(),
  value_id: z.string().uuid().nullish(),
  created_at: z.string().datetime(),
});
export type Goal = z.infer<typeof Goal>;

export const Task = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullish(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high']).nullish(),
  due_date: z.string().datetime().nullish(),
  goal_id: z.string().uuid().nullish(),
  created_at: z.string().datetime(),
});
export type Task = z.infer<typeof Task>;

export const Habit = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullish(),
  goal_frequency: z.number().positive(),
  frequency_period: z.enum(['day', 'week', 'month']),
  color: z.string().nullish(),
  streak: z.number().nonnegative(),
  best_streak: z.number().nonnegative(),
  created_at: z.string().datetime(),
});
export type Habit = z.infer<typeof Habit>;

export const TrackedState = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string(),
  category: z.string(),
  current_value: z.union([z.number(), z.string()]),
  timestamp: z.string().datetime(),
});
export type TrackedState = z.infer<typeof TrackedState>;

/* ----------------------------- Rewards ---------------------------*/
export const Badge = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string(),
  emoji: z.string().length(2).nullish(),
  description: z.string(),
  earned_at: z.string().datetime(),
});
export const Streak = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  habit_id: z.string().uuid(),
  length: z.number().positive(),
  best: z.number().positive(),
});
export const Loot = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string(),
  icon: z.string().nullish(),
  claimed: z.boolean().default(false),
});
export type Badge = z.infer<typeof Badge>;
export type Streak = z.infer<typeof Streak>;
export type Loot = z.infer<typeof Loot>;

/* ------------------------------------------------------------------
 *  Router‑level Schemas – inputs & outputs for every procedure
 * ----------------------------------------------------------------*/
export const greetingInput = z.object({ name: z.string().optional() });
export const greetingOutput = z.object({ greeting: z.string() });

// User
export const updateProfileInput = UserProfile.partial().omit({ id: true, created_at: true, updated_at: true });
export const updateSettingsInput = z.object({
  notification_preferences: NotificationPrefs.partial().optional(),
  ui_preferences: UiPrefs.partial().optional(),
});

// Values
export const createValueInput = Value.omit({ id: true, user_id: true, created_at: true });
export const updateValueInput = createValueInput.partial().extend({ id: z.string().uuid() });

// Goals
export const createGoalInput = Goal.omit({ id: true, user_id: true, created_at: true });
export const updateGoalInput = createGoalInput.partial().extend({ id: z.string().uuid() });

// Tasks
export const createTaskInput = Task.omit({ id: true, user_id: true, created_at: true });
export const updateTaskInput = createTaskInput.partial().extend({ id: z.string().uuid() });
export const updateTaskStatusInput = z.object({ id: z.string().uuid(), status: Task.shape.status });

// Habits
export const createHabitInput = Habit.omit({ id: true, user_id: true, created_at: true, streak: true, best_streak: true });
export const updateHabitInput = createHabitInput.partial().extend({ id: z.string().uuid() });

// Tracked States
export const createTrackedStateInput = TrackedState.omit({ id: true, user_id: true, timestamp: true });

// Rewards
export const claimLootInput = z.object({ lootId: z.string().uuid() });
export const awardBadgeInput = z.object({ badgeId: z.string().uuid() });

/* ------------------------------------------------------------------
 *  Aggregate Router Types – automatically inferred
 * ----------------------------------------------------------------*/
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

/*
  Usage (client‑side):

  const utils = trpc.useUtils();
  type TasksOutput = RouterOutputs['task']['getTasks'];
  type CreateTaskInput = RouterInputs['task']['createTask'];
*/ 