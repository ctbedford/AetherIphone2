-- supabase/migrations/20250428130834_enhance_functional_schema.sql
-- Migration: Enhance DB Schema for Aether App Functionality
-- Description: Addresses functional gaps identified in user experience review.

-- === Enums and Types ===

-- Task Status Enum (Reintroduce for better type safety)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
        CREATE TYPE public.task_status AS ENUM ('todo', 'doing', 'done', 'blocked', 'pending'); -- Add 'pending' if used
    END IF;
END$$;

-- Task Priority Enum (Change from INT for clarity)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
        CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high');
    END IF;
END$$;

-- Reward Type Enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reward_type') THEN
        CREATE TYPE public.reward_type AS ENUM ('badge', 'achievement', 'item', 'discount');
    END IF;
END$$;

-- Habit Type Enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'habit_type') THEN
        CREATE TYPE public.habit_type AS ENUM ('boolean', 'quantity');
    END IF;
END$$;

-- Habit Frequency Period Enum (Add if missing or confirm existence)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'habit_frequency_period') THEN
        CREATE TYPE public.habit_frequency_period AS ENUM ('day', 'week', 'month');
    END IF;
END$$;

-- === Table Enhancements ===

-- 1. Tasks Table Enhancements
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS recurrence_rule TEXT NULL, -- For iCalendar RRULE strings
  ADD COLUMN IF NOT EXISTS recurrence_end_date DATE NULL,
  ADD COLUMN IF NOT EXISTS parent_task_id UUID NULL REFERENCES public.tasks(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NULL;

-- Temporarily drop the trigger that depends on the tasks.status column
DROP TRIGGER IF EXISTS on_task_completed ON public.tasks;

-- Alter task status to use ENUM (Assuming 'pending' might be used based on router)
-- Drop default constraint if it exists
ALTER TABLE public.tasks ALTER COLUMN status DROP DEFAULT;
-- Alter column type
ALTER TABLE public.tasks
  ALTER COLUMN status TYPE public.task_status USING status::public.task_status;
-- Add default back if needed
ALTER TABLE public.tasks ALTER COLUMN status SET DEFAULT 'todo';

-- Recreate the trigger (Ensure the function award_points_for_task_completion still works correctly with the enum type)
-- The function likely still works as it compares with a string literal 'completed', which should match the enum
CREATE TRIGGER on_task_completed
  AFTER INSERT OR UPDATE ON public.tasks
  FOR EACH ROW
  WHEN (NEW.status::text = 'done') -- Explicitly cast NEW.status to text for comparison, or adjust if needed
  EXECUTE FUNCTION public.award_points_for_task_completion();

-- Alter task priority to use ENUM
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS priority_enum public.task_priority NULL;

-- (Manual step recommended after migration: migrate data from priority (int) to priority_enum, then drop old priority column and rename)
-- Example (Run this manually or in a separate script after checking data):
-- UPDATE public.tasks SET priority_enum = 
--   CASE
--     WHEN priority = 1 THEN 'high'::public.task_priority
--     WHEN priority = 2 THEN 'medium'::public.task_priority
--     WHEN priority = 3 THEN 'low'::public.task_priority -- Assuming 1=High, 3=Low
--     ELSE NULL
--   END;
-- ALTER TABLE public.tasks DROP COLUMN priority;
-- ALTER TABLE public.tasks RENAME COLUMN priority_enum TO priority;

-- Add Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_archived_at ON public.tasks(archived_at);
CREATE INDEX IF NOT EXISTS idx_tasks_sort_order ON public.tasks(sort_order);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON public.tasks(parent_task_id);

COMMENT ON COLUMN public.tasks.recurrence_rule IS 'iCalendar RRULE string for recurrence.';
COMMENT ON COLUMN public.tasks.parent_task_id IS 'Link to parent task for sub-tasks.';
COMMENT ON COLUMN public.tasks.archived_at IS 'Timestamp when the task was archived.';
COMMENT ON COLUMN public.tasks.sort_order IS 'Manual sort order within a list.';

-- Task Dependencies (Optional - Use if many-to-many needed)
-- CREATE TABLE public.task_dependencies (
--   task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
--   depends_on_task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
--   user_id uuid not null references public.profiles(id) on delete cascade, -- For RLS
--   PRIMARY KEY (task_id, depends_on_task_id)
-- );
-- COMMENT ON TABLE public.task_dependencies IS 'Tracks dependencies between tasks.';
-- alter table public.task_dependencies enable row level security;
-- create policy "Users can manage task_dependencies for their own tasks" on public.task_dependencies for all using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- 2. Habits Table Enhancements
ALTER TABLE public.habits
  ADD COLUMN IF NOT EXISTS recurrence_rule TEXT NULL, -- For iCalendar RRULE strings
  ADD COLUMN IF NOT EXISTS recurrence_end_date DATE NULL,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS habit_type public.habit_type NOT NULL DEFAULT 'boolean',
  ADD COLUMN IF NOT EXISTS goal_quantity INTEGER NULL,
  ADD COLUMN IF NOT EXISTS goal_unit TEXT NULL,
  ADD COLUMN IF NOT EXISTS frequency_period public.habit_frequency_period NOT NULL DEFAULT 'day', -- Add frequency tracking
  ADD COLUMN IF NOT EXISTS goal_frequency SMALLINT NOT NULL DEFAULT 1; -- Add frequency tracking

-- Add Indexes
CREATE INDEX IF NOT EXISTS idx_habits_archived_at ON public.habits(archived_at);

COMMENT ON COLUMN public.habits.recurrence_rule IS 'iCalendar RRULE string for recurrence.';
COMMENT ON COLUMN public.habits.archived_at IS 'Timestamp when the habit was archived.';
COMMENT ON COLUMN public.habits.habit_type IS 'Type of habit (e.g., boolean check-in or quantity tracking).';
COMMENT ON COLUMN public.habits.goal_quantity IS 'Target quantity for quantity-based habits.';
COMMENT ON COLUMN public.habits.goal_unit IS 'Unit for quantity-based habits (e.g., glasses, km).';
COMMENT ON COLUMN public.habits.frequency_period IS 'Period for habit frequency (day, week, month).';
COMMENT ON COLUMN public.habits.goal_frequency IS 'How many times per period the habit should be done.';


-- 3. Habit Entries Table Enhancements
ALTER TABLE public.habit_entries
  ADD COLUMN IF NOT EXISTS quantity_value INTEGER NULL,
  ADD COLUMN IF NOT EXISTS notes TEXT NULL;

COMMENT ON COLUMN public.habit_entries.quantity_value IS 'Value recorded for quantity-based habits.';
COMMENT ON COLUMN public.habit_entries.notes IS 'User notes for a specific habit entry.';


-- 4. Goals Table Enhancements
ALTER TABLE public.goals
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NULL;

-- Add Indexes
CREATE INDEX IF NOT EXISTS idx_goals_archived_at ON public.goals(archived_at);
CREATE INDEX IF NOT EXISTS idx_goals_sort_order ON public.goals(sort_order);

COMMENT ON COLUMN public.goals.archived_at IS 'Timestamp when the goal was archived.';
COMMENT ON COLUMN public.goals.sort_order IS 'Manual sort order for goals.';


-- 5. Values Table Enhancements
ALTER TABLE public.values
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NULL;

-- Add Indexes
CREATE INDEX IF NOT EXISTS idx_values_sort_order ON public.values(sort_order);

COMMENT ON COLUMN public.values.sort_order IS 'Manual sort order for values.';


-- 6. Principles Table Enhancements
ALTER TABLE public.principles
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NULL;

-- Add Indexes
CREATE INDEX IF NOT EXISTS idx_principles_sort_order ON public.principles(sort_order);

COMMENT ON COLUMN public.principles.sort_order IS 'Manual sort order for principles.';


-- 7. State Entries Table Enhancements
ALTER TABLE public.state_entries
  ADD COLUMN IF NOT EXISTS notes TEXT NULL;

COMMENT ON COLUMN public.state_entries.notes IS 'User notes for a specific state entry.';


-- 8. Tracked State Definitions Enhancements
ALTER TABLE public.tracked_state_defs
  ADD COLUMN IF NOT EXISTS target_min_value NUMERIC NULL,
  ADD COLUMN IF NOT EXISTS target_max_value NUMERIC NULL;

COMMENT ON COLUMN public.tracked_state_defs.target_min_value IS 'Optional minimum target value for the tracked state.';
COMMENT ON COLUMN public.tracked_state_defs.target_max_value IS 'Optional maximum target value for the tracked state.';


-- 9. Rewards Table Enhancements (Use Enum)

-- Drop the existing text-based CHECK constraint first
-- Note: The constraint name might vary. Find the actual name if this fails.
-- You can find it using SQL: SELECT conname FROM pg_constraint WHERE conrelid = 'public.rewards'::regclass AND contype = 'c' AND conname LIKE '%type%';
-- Assuming a default name pattern here:
ALTER TABLE public.rewards DROP CONSTRAINT IF EXISTS rewards_type_check;

-- Alter rewards type to use ENUM
ALTER TABLE public.rewards
  ALTER COLUMN type TYPE public.reward_type USING type::public.reward_type;


-- === New Tables ===

-- 1. Reminders Table
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  related_entity_type TEXT NOT NULL, -- e.g., 'task', 'goal', 'habit'
  related_entity_id UUID NOT NULL, -- FK cannot easily reference multiple tables, handled by app logic/RLS
  reminder_time TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.reminders IS 'Stores scheduled reminders for various entities.';
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_reminders_user_time ON public.reminders(user_id, reminder_time);
CREATE INDEX IF NOT EXISTS idx_reminders_related_entity ON public.reminders(related_entity_type, related_entity_id);

-- RLS Policies for Reminders
CREATE POLICY "Users can manage their own reminders" ON public.reminders
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- 2. Goal Progress Notes Table
CREATE TABLE IF NOT EXISTS public.goal_progress_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- Denormalized for RLS
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.goal_progress_notes IS 'Stores notes related to goal progress updates.';
ALTER TABLE public.goal_progress_notes ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_goal_progress_notes_goal_id ON public.goal_progress_notes(goal_id);

-- RLS Policies for Goal Progress Notes
CREATE POLICY "Users can manage notes for their own goals" ON public.goal_progress_notes
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- === Function/Trigger Updates (Example - Needs Review) ===

-- Update function/trigger for habit completion points if habit_type is added
-- (This is just illustrative, review existing functions like award_points_for_habit_completion)
-- Example: Maybe points depend on habit_type or goal_quantity?

-- Update function/trigger for task completion points if priority changes type
-- (Review existing functions like award_points_for_task_completion)

-- Note: Ensure existing RLS policies adequately cover new columns or create specific policies if needed.
-- Note: Consider adding foreign key constraints for related_entity_id in reminders if feasible,
--       otherwise enforce relationship integrity at the application level.
