-- Add missing tables, types, and RLS policies

-- === Values Table ===
create table public.values (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  color text,
  domain_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.values is 'User-defined core values.';
alter table public.values enable row level security;
create policy "Users can view their own values" on public.values for select using (auth.uid() = user_id);
create policy "Users can insert their own values" on public.values for insert with check (auth.uid() = user_id);
create policy "Users can update their own values" on public.values for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own values" on public.values for delete using (auth.uid() = user_id);

-- === Key Results Table ===
create table public.key_results (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  progress numeric default 0 check (progress >= 0 and progress <= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.key_results is 'Measurable results for achieving goals.';
alter table public.key_results enable row level security;
create policy "Users can view their own key results" on public.key_results for select using (auth.uid() = user_id);
create policy "Users can insert their own key results" on public.key_results for insert with check (auth.uid() = user_id);
create policy "Users can update their own key results" on public.key_results for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own key results" on public.key_results for delete using (auth.uid() = user_id);

-- === Habits Table ===
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  cue text,
  routine text,
  reward text,
  streak int not null default 0,
  best_streak int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.habits is 'User habits to track.';
alter table public.habits enable row level security;
create policy "Users can view their own habits" on public.habits for select using (auth.uid() = user_id);
create policy "Users can insert their own habits" on public.habits for insert with check (auth.uid() = user_id);
create policy "Users can update their own habits" on public.habits for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own habits" on public.habits for delete using (auth.uid() = user_id);

-- === Habit Entries Table ===
create table public.habit_entries (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (habit_id, date)
);
comment on table public.habit_entries is 'Daily check-in records for habits.';
alter table public.habit_entries enable row level security;
create policy "Users can view their own habit entries" on public.habit_entries for select using (auth.uid() = user_id);
create policy "Users can insert their own habit entries" on public.habit_entries for insert with check (auth.uid() = user_id);
create policy "Users can update their own habit entries" on public.habit_entries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own habit entries" on public.habit_entries for delete using (auth.uid() = user_id);

-- === Principles Table ===
create table public.principles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.principles is 'User-defined guiding principles.';
alter table public.principles enable row level security;
create policy "Users can view their own principles" on public.principles for select using (auth.uid() = user_id);
create policy "Users can insert their own principles" on public.principles for insert with check (auth.uid() = user_id);
create policy "Users can update their own principles" on public.principles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own principles" on public.principles for delete using (auth.uid() = user_id);

-- === Tracked State Scale Enum ===
create type public.tracked_state_scale as enum ('1-5', 'low-high', 'custom');

-- === Tracked State Definitions Table ===
create table public.tracked_state_defs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  scale public.tracked_state_scale not null,
  custom_labels text[],
  active boolean not null default true,
  priority int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.tracked_state_defs is 'Definitions of tracked states.';
alter table public.tracked_state_defs enable row level security;
create policy "Users can view their own state definitions" on public.tracked_state_defs for select using (auth.uid() = user_id);
create policy "Users can insert their own state definitions" on public.tracked_state_defs for insert with check (auth.uid() = user_id);
create policy "Users can update their own state definitions" on public.tracked_state_defs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own state definitions" on public.tracked_state_defs for delete using (auth.uid() = user_id);

-- === State Entries Table ===
create table public.state_entries (
  id uuid primary key default gen_random_uuid(),
  definition_id uuid not null references public.tracked_state_defs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  value_numeric smallint,
  value_text text,
  entry_timestamp timestamptz not null default now()
);
comment on table public.state_entries is 'Recorded entries for tracked states.';
alter table public.state_entries enable row level security;
create policy "Users can view their own state entries" on public.state_entries for select using (auth.uid() = user_id);
create policy "Users can insert their own state entries" on public.state_entries for insert with check (auth.uid() = user_id);
create policy "Users can update their own state entries" on public.state_entries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own state entries" on public.state_entries for delete using (auth.uid() = user_id);

-- === Badge Definitions Table ===
create table public.badge_definitions (
  id text primary key,
  title text not null,
  description text,
  icon text not null
);
comment on table public.badge_definitions is 'Definitions of all achievable badges.';
alter table public.badge_definitions enable row level security;
create policy "Badge definitions are viewable by authenticated users" on public.badge_definitions for select using (auth.role() = 'authenticated');

-- === User Badges Table ===
create table public.user_badges (
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_id text not null references public.badge_definitions(id) on delete cascade,
  earned_at timestamptz not null default now(),
  progress numeric check (progress >= 0 and progress <= 1),
  primary key (user_id, badge_id)
);
comment on table public.user_badges is 'Tracks badges earned by users.';
alter table public.user_badges enable row level security;
create policy "Users can view their own earned badges" on public.user_badges for select using (auth.uid() = user_id);
create policy "Users can insert their own earned badges" on public.user_badges for insert with check (auth.uid() = user_id);
create policy "Users can update their own badge progress" on public.user_badges for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own earned badges" on public.user_badges for delete using (auth.uid() = user_id);

-- === Join Tables for Values ===
-- goal_values
create table public.goal_values (
  goal_id uuid not null references public.goals(id) on delete cascade,
  value_id uuid not null references public.values(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (goal_id, value_id)
);
comment on table public.goal_values is 'Links goals to values.';
alter table public.goal_values enable row level security;
create policy "Users can manage goal_values" on public.goal_values for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- task_values
create table public.task_values (
  task_id uuid not null references public.tasks(id) on delete cascade,
  value_id uuid not null references public.values(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (task_id, value_id)
);
comment on table public.task_values is 'Links tasks to values.';
alter table public.task_values enable row level security;
create policy "Users can manage task_values" on public.task_values for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- habit_values
create table public.habit_values (
  habit_id uuid not null references public.habits(id) on delete cascade,
  value_id uuid not null references public.values(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (habit_id, value_id)
);
comment on table public.habit_values is 'Links habits to values.';
alter table public.habit_values enable row level security;
create policy "Users can manage habit_values" on public.habit_values for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- principle_values
create table public.principle_values (
  principle_id uuid not null references public.principles(id) on delete cascade,
  value_id uuid not null references public.values(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (principle_id, value_id)
);
comment on table public.principle_values is 'Links principles to values.';
alter table public.principle_values enable row level security;
create policy "Users can manage principle_values" on public.principle_values for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- tracked_state_values
create table public.tracked_state_values (
  state_id uuid not null references public.tracked_state_defs(id) on delete cascade,
  value_id uuid not null references public.values(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (state_id, value_id)
);
comment on table public.tracked_state_values is 'Links tracked states to values.';
alter table public.tracked_state_values enable row level security;
create policy "Users can manage tracked_state_values" on public.tracked_state_values for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
