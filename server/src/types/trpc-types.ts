// server/src/types/trpc-types.ts
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
 * Enums (keep in sync with DB enums)
 * ----------------------------------------------------------------*/
export const TaskStatusEnum = z.enum(['todo', 'doing', 'done', 'blocked', 'pending']);
export const TaskPriorityEnum = z.enum(['low', 'medium', 'high']);
export const RewardTypeEnum = z.enum(['badge', 'achievement', 'item', 'discount']);
export const HabitTypeEnum = z.enum(['boolean', 'quantity']);
export const HabitFrequencyPeriodEnum = z.enum(['day', 'week', 'month']);

/* ------------------------------------------------------------------
 * Domain Models (DB row shapes) – keep in sync with Supabase tables
 * ----------------------------------------------------------------*/
export const UserProfile = z.object({
  id: z.string().uuid(),
  username: z.string().nullish(),
  avatar_url: z.string().url().nullish(),
  full_name: z.string().nullish(),
  bio: z.string().nullish(),
  points: z.number().int().nonnegative().default(0),
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
  first_day_of_week: z.number().int().min(0).max(6).default(0),
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
  title: z.string(), 
  description: z.string().nullish(),
  color: z.string().nullish(),
  icon: z.string().nullish(),
  sort_order: z.number().int().nullish(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().nullish(),
});
export type Value = z.infer<typeof Value>;

export const Principle = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string(), // <<< Changed from 'name' to 'title'
  body: z.string(), // <<< Renamed from description for clarity, matching migration
  sort_order: z.number().int().nullish(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().nullish(),
});
export type Principle = z.infer<typeof Principle>;

export const Goal = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullish(),
  progress: z.number().nullish(),
  target_date: z.string().nullish(),
  archived_at: z.string().datetime().nullish(),
  sort_order: z.number().int().nullish(),
  created_at: z.string().datetime().nullish(),
  updated_at: z.string().datetime().nullish(),
});
export type Goal = z.infer<typeof Goal>;

export const Task = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string(),
  notes: z.string().nullish(),
  status: TaskStatusEnum.default('todo'),
  priority_enum: TaskPriorityEnum.nullish(), // <<< Renamed from priority
  due_date: z.string().datetime().nullish(),
  goal_id: z.string().uuid().nullish(),
  parent_task_id: z.string().uuid().nullish(),
  recurrence_rule: z.string().nullish(),
  recurrence_end_date: z.string().datetime().nullish(),
  archived_at: z.string().datetime().nullish(),
  sort_order: z.number().int().nullish(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type Task = z.infer<typeof Task>;

export const Habit = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string(),
  cue: z.string().nullish(),
  routine: z.string().nullish(),
  reward: z.string().nullish(),
  streak: z.number().nonnegative().default(0),
  best_streak: z.number().nonnegative().default(0),
  habit_type: HabitTypeEnum.default('boolean'),
  goal_quantity: z.number().int().nullish(),
  goal_unit: z.string().nullish(),
  frequency_period: HabitFrequencyPeriodEnum.default('day'),
  goal_frequency: z.number().int().positive().default(1),
  recurrence_rule: z.string().nullish(),
  recurrence_end_date: z.string().datetime().nullish(),
  archived_at: z.string().datetime().nullish(),
  sort_order: z.number().int().nullish(), // <<< Added sort_order
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type Habit = z.infer<typeof Habit>;

export const HabitEntry = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  habit_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  completed: z.boolean().default(false),
  quantity_value: z.number().int().nullish(),
  notes: z.string().nullish(),
  created_at: z.string().datetime(),
});
export type HabitEntry = z.infer<typeof HabitEntry>;

export const TrackedStateDef = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string(),
  // category: z.string(), // Category seems removed/replaced in DB schema by scale/custom_labels
  scale: z.enum(['1-5', 'low-high', 'custom']), // <<< Added scale
  custom_labels: z.array(z.string()).nullish(), // <<< Added custom_labels
  unit: z.string().nullish(), // Keep unit if still used alongside scale
  icon: z.string().nullish(), // Keep icon if still used
  target_min_value: z.number().nullish(), // <<< Added
  target_max_value: z.number().nullish(), // <<< Added
  active: z.boolean().default(true), // <<< Added active
  priority: z.number().int().default(1), // <<< Added priority
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().nullish(),
});
export type TrackedStateDef = z.infer<typeof TrackedStateDef>;

export const StateEntry = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  definition_id: z.string().uuid(), // <<< Renamed from tracked_state_def_id for consistency? check DB
  value_numeric: z.number().optional().nullable(),
  value_text: z.string().optional().nullable(),
  entry_timestamp: z.string().datetime({ message: "Invalid datetime string. Must be UTC ISO 8601" }).optional(),
  notes: z.string().optional().nullable(), // <<< Added notes
});
export type StateEntry = z.infer<typeof StateEntry>;

export const Reward = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullish(),
  type: RewardTypeEnum,
  required_points: z.number().int().nonnegative().default(0),
  can_earn_multiple: z.boolean().default(false),
  image_url: z.string().url().nullish(),
  metadata: z.record(z.any()).nullish(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type Reward = z.infer<typeof Reward>;

export const UserReward = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  reward_id: z.string().uuid(),
  reward_type: z.string().nullish(), // From DB schema
  earned_at: z.string().datetime(),
  points_spent: z.number().int().nonnegative().default(0),
  metadata: z.record(z.any()).nullish(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type UserReward = z.infer<typeof UserReward>;

export const PointTransaction = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  points: z.number().int(),
  reason: z.string(),
  source_type: z.string(),
  source_id: z.string().uuid().nullish(),
  created_at: z.string().datetime(),
});
export type PointTransaction = z.infer<typeof PointTransaction>;

export const BadgeDefinition = z.object({
  id: z.string(), // From DB: text primary key
  title: z.string(),
  description: z.string().nullish(),
  icon: z.string(),
});
export type BadgeDefinition = z.infer<typeof BadgeDefinition>;

export const UserBadge = z.object({
  // Note: user_badges might be merged into user_rewards with type='badge'
  user_id: z.string().uuid(),
  badge_id: z.string(), // Matches badge_definitions.id (text)
  earned_at: z.string().datetime(),
  progress: z.number().nullish(), // From DB schema
});
export type UserBadge = z.infer<typeof UserBadge>;

export const Reminder = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  related_entity_type: z.string(),
  related_entity_id: z.string().uuid(),
  reminder_time: z.string().datetime(),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type Reminder = z.infer<typeof Reminder>;

export const GoalProgressNote = z.object({
  id: z.string().uuid(),
  goal_id: z.string().uuid(),
  user_id: z.string().uuid(),
  note: z.string(),
  created_at: z.string().datetime(),
});
export type GoalProgressNote = z.infer<typeof GoalProgressNote>;

/* ------------------------------------------------------------------
 * Router‑level Schemas – inputs & outputs for every procedure
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
export const createValueInput = Value.omit({ id: true, user_id: true, created_at: true, updated_at: true });
export const updateValueInput = createValueInput.partial().extend({ id: z.string().uuid() });

// Principles
// Uses 'title' and 'body' from the updated Principle schema
export const createPrincipleInput = Principle.omit({ id: true, user_id: true, created_at: true, updated_at: true });
export const updatePrincipleInput = createPrincipleInput.partial().extend({ id: z.string().uuid() });

// Goals
export const createGoalInput = Goal.omit({ id: true, user_id: true, created_at: true, updated_at: true });
export const updateGoalInput = createGoalInput.partial().extend({ id: z.string().uuid() });

// Tasks
export const createTaskInput = Task.omit({ id: true, user_id: true, created_at: true, updated_at: true });
export const updateTaskInput = createTaskInput.partial().extend({ id: z.string().uuid() });
export const updateTaskStatusInput = z.object({ id: z.string().uuid(), status: TaskStatusEnum });

// Habits
export const createHabitInput = Habit.omit({ id: true, user_id: true, created_at: true, updated_at: true });
export const updateHabitInput = createHabitInput.partial().extend({ id: z.string().uuid() });

// Habit Entries
export const createHabitEntryInput = HabitEntry.omit({ id: true, user_id: true, created_at: true });
export const updateHabitEntryInput = createHabitEntryInput.partial().extend({ id: z.string().uuid() });

// Tracked State Definitions
export const createTrackedStateDefInput = TrackedStateDef.omit({ id: true, user_id: true, created_at: true, updated_at: true });
export const updateTrackedStateDefInput = createTrackedStateDefInput.partial().extend({ id: z.string().uuid() });
export const GetTrackedStateDefByIdInput = z.object({ id: z.string().uuid() });
export const DeleteTrackedStateDefInput = z.object({ id: z.string().uuid() });

// State Entries
export const CreateStateEntryInput = StateEntry.omit({ id: true, user_id: true })
.extend({
  tracked_state_def_id: z.string().uuid(), // Ensure this is required
  // Values are optional in base schema
});
export const updateStateEntryInput = CreateStateEntryInput.partial().extend({ id: z.string().uuid() });
export const GetStateEntriesInput = z.object({
  tracked_state_def_id: z.string().uuid(), // Renamed from definition_id to match DB? Check usage.
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().int().positive().optional(),
});
export const DeleteStateEntryInput = z.object({ id: z.string().uuid() });

// Rewards (Assuming rewards definitions are managed elsewhere)
// No create/update for Reward definitions needed via API?
export const claimLootInput = z.object({
  rewardId: z.string().uuid(), // Use rewardId to match router
});

// Badges
export const awardBadgeInput = z.object({
  badgeId: z.string(), // Matches text ID in badge_definitions
  description: z.string().optional(), // Example custom field if needed
});

// Reminders
export const createReminderInput = Reminder.omit({ id: true, user_id: true, created_at: true, updated_at: true });
export const updateReminderInput = createReminderInput.partial().extend({ id: z.string().uuid() });
export const GetRemindersForEntityInput = z.object({
  related_entity_type: z.string(),
  related_entity_id: z.string().uuid(),
});
export const DeleteReminderInput = z.object({ id: z.string().uuid() });

// Goal Progress Notes
export const createGoalProgressNoteInput = GoalProgressNote.omit({ id: true, user_id: true, created_at: true });
export const updateGoalProgressNoteInput = createGoalProgressNoteInput.partial().extend({ id: z.string().uuid() });
export const GetGoalProgressNotesInput = z.object({ goal_id: z.string().uuid() });
export const DeleteGoalProgressNoteInput = z.object({ id: z.string().uuid() });

/* ------------------------------------------------------------------
 * Aggregate Router Types – automatically inferred
 * ----------------------------------------------------------------*/
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

/*
  Usage (client‑side):

  const utils = trpc.useUtils();
  type TasksOutput = RouterOutputs['task']['getTasks'];
  type CreateTaskInput = RouterInputs['task']['createTask'];
*/