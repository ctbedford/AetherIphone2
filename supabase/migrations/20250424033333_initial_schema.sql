-- Enable UUID generation
create extension if not exists "uuid-ossp" with schema extensions;

-- === Profiles Table (From SUPABASE_INTEGRATION.md) ===
create table public.profiles (
  id uuid not null references auth.users on delete cascade primary key, -- Link directly to auth.users
  username text unique,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.profiles is 'Profile data for each user.';

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile." on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Function & Trigger to create profile on new user signup (From SUPABASE_INTEGRATION.md)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data ->> 'username');
  return new;
end;
$$ language plpgsql security definer set search_path = public; -- Added search_path

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- === Values Table ===
create table public.values (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  color text, -- Stores color token like 'indigo-500'
  domain_id text, -- Optional grouping identifier
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.values is 'User-defined core values.';
alter table public.values enable row level security;

create policy "Users can view their own values" on public.values for select using (auth.uid() = user_id);
create policy "Users can insert their own values" on public.values for insert with check (auth.uid() = user_id);
create policy "Users can update their own values" on public.values for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own values" on public.values for delete using (auth.uid() = user_id);


-- === Goals Table ===
create table public.goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  progress numeric default 0 check (progress >= 0 and progress <= 1),
  target_date date, -- Changed from timestamp to date to match UI potentially
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.goals is 'User goals and objectives.';
alter table public.goals enable row level security;

create policy "Users can view their own goals" on public.goals for select using (auth.uid() = user_id);
create policy "Users can insert their own goals" on public.goals for insert with check (auth.uid() = user_id);
create policy "Users can update their own goals" on public.goals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own goals" on public.goals for delete using (auth.uid() = user_id);


-- === Key Results Table ===
create table public.key_results (
  id uuid primary key default uuid_generate_v4(),
  goal_id uuid not null references public.goals(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade, -- Denormalized for RLS
  title text not null,
  progress numeric default 0 check (progress >= 0 and progress <= 1),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.key_results is 'Measurable results for achieving goals.';
alter table public.key_results enable row level security;

create policy "Users can view their own key results" on public.key_results for select using (auth.uid() = user_id);
create policy "Users can insert their own key results" on public.key_results for insert with check (auth.uid() = user_id);
create policy "Users can update their own key results" on public.key_results for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own key results" on public.key_results for delete using (auth.uid() = user_id);


-- === Tasks Table ===
-- Define enum for status first
create type public.task_status as enum ('todo', 'doing', 'done', 'blocked');

create table public.tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  notes text,
  status public.task_status default 'todo' not null,
  due date,
  priority int check (priority in (1, 2, 3)), -- Allow NULL or 1, 2, 3
  goal_id uuid references public.goals(id) on delete set null, -- Keep task if goal deleted
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.tasks is 'Individual tasks or to-do items.';
alter table public.tasks enable row level security;

create policy "Users can view their own tasks" on public.tasks for select using (auth.uid() = user_id);
create policy "Users can insert their own tasks" on public.tasks for insert with check (auth.uid() = user_id);
create policy "Users can update their own tasks" on public.tasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own tasks" on public.tasks for delete using (auth.uid() = user_id);


-- === Habits Table ===
create table public.habits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  cue text,
  routine text,
  reward text,
  -- value_ids text[], -- Will use join table instead
  streak int default 0 not null,
  best_streak int default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.habits is 'User habits to track.';
alter table public.habits enable row level security;

create policy "Users can view their own habits" on public.habits for select using (auth.uid() = user_id);
create policy "Users can insert their own habits" on public.habits for insert with check (auth.uid() = user_id);
create policy "Users can update their own habits" on public.habits for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own habits" on public.habits for delete using (auth.uid() = user_id);


-- === Habit Entries Table ===
create table public.habit_entries (
  id uuid primary key default uuid_generate_v4(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade, -- Denormalized for RLS
  date date not null,
  completed boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(habit_id, date) -- Ensure only one entry per habit per day
);

comment on table public.habit_entries is 'Daily check-in records for habits.';
alter table public.habit_entries enable row level security;

create policy "Users can view their own habit entries" on public.habit_entries for select using (auth.uid() = user_id);
create policy "Users can insert their own habit entries" on public.habit_entries for insert with check (auth.uid() = user_id);
create policy "Users can update their own habit entries" on public.habit_entries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own habit entries" on public.habit_entries for delete using (auth.uid() = user_id);


-- === Principles Table ===
create table public.principles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.principles is 'User-defined guiding principles.';
alter table public.principles enable row level security;

create policy "Users can view their own principles" on public.principles for select using (auth.uid() = user_id);
create policy "Users can insert their own principles" on public.principles for insert with check (auth.uid() = user_id);
create policy "Users can update their own principles" on public.principles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own principles" on public.principles for delete using (auth.uid() = user_id);


-- === Tracked State Definitions Table ===
create type public.tracked_state_scale as enum ('1-5', 'low-high', 'custom');

create table public.tracked_state_defs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  scale public.tracked_state_scale not null,
  custom_labels text[], -- Only relevant if scale = 'custom'
  active boolean default true not null,
  priority int default 1 not null, -- For ordering
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.tracked_state_defs is 'Definitions of states users want to track (e.g., energy, focus).';
alter table public.tracked_state_defs enable row level security;

create policy "Users can view their own state definitions" on public.tracked_state_defs for select using (auth.uid() = user_id);
create policy "Users can insert their own state definitions" on public.tracked_state_defs for insert with check (auth.uid() = user_id);
create policy "Users can update their own state definitions" on public.tracked_state_defs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own state definitions" on public.tracked_state_defs for delete using (auth.uid() = user_id);


-- === State Entries Table ===
create table public.state_entries (
  id uuid primary key default uuid_generate_v4(),
  definition_id uuid not null references public.tracked_state_defs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade, -- Denormalized for RLS
  value_numeric smallint, -- Use for '1-5' scale
  value_text text, -- Use for 'low-high' or 'custom' scales
  entry_timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.state_entries is 'Recorded entries for tracked states.';
alter table public.state_entries enable row level security;

create policy "Users can view their own state entries" on public.state_entries for select using (auth.uid() = user_id);
create policy "Users can insert their own state entries" on public.state_entries for insert with check (auth.uid() = user_id);
create policy "Users can update their own state entries" on public.state_entries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own state entries" on public.state_entries for delete using (auth.uid() = user_id);


-- === Badge Definitions Table ===
create table public.badge_definitions (
  id text primary key, -- e.g., '10_day_streak', 'first_goal'
  title text not null,
  description text,
  icon text not null -- e.g., emoji or icon library name
);

comment on table public.badge_definitions is 'Definitions of all achievable badges.';
-- Enable RLS but allow all authenticated users read access. Inserts/Updates/Deletes likely managed via admin/seed script.
alter table public.badge_definitions enable row level security;

create policy "Badge definitions are viewable by authenticated users"
  on public.badge_definitions for select
  using (auth.role() = 'authenticated');


-- === User Badges Table ===
create table public.user_badges (
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_id text not null references public.badge_definitions(id) on delete cascade,
  earned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  progress numeric check (progress >= 0 and progress <= 1), -- For badges with progress
  primary key (user_id, badge_id)
);

comment on table public.user_badges is 'Tracks badges earned by users.';
alter table public.user_badges enable row level security;

create policy "Users can view their own earned badges" on public.user_badges for select using (auth.uid() = user_id);
-- Typically, inserting/updating badge progress/earned status is handled by backend logic (e.g., triggers, functions)
-- For simplicity here, allowing user modification, but review this for production security.
create policy "Users can insert their own earned badges" on public.user_badges for insert with check (auth.uid() = user_id);
create policy "Users can update their own badge progress" on public.user_badges for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own earned badges" on public.user_badges for delete using (auth.uid() = user_id);


-- === Join Tables for Values ===

-- goal_values
create table public.goal_values (
  goal_id uuid not null references public.goals(id) on delete cascade,
  value_id uuid not null references public.values(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade, -- For RLS
  primary key (goal_id, value_id)
);
comment on table public.goal_values is 'Links goals to values.';
alter table public.goal_values enable row level security;
create policy "Users can manage goal_values for their own goals/values" on public.goal_values for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- task_values
create table public.task_values (
  task_id uuid not null references public.tasks(id) on delete cascade,
  value_id uuid not null references public.values(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade, -- For RLS
  primary key (task_id, value_id)
);
comment on table public.task_values is 'Links tasks to values.';
alter table public.task_values enable row level security;
create policy "Users can manage task_values for their own tasks/values" on public.task_values for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- habit_values
create table public.habit_values (
  habit_id uuid not null references public.habits(id) on delete cascade,
  value_id uuid not null references public.values(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade, -- For RLS
  primary key (habit_id, value_id)
);
comment on table public.habit_values is 'Links habits to values.';
alter table public.habit_values enable row level security;
create policy "Users can manage habit_values for their own habits/values" on public.habit_values for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- principle_values
create table public.principle_values (
  principle_id uuid not null references public.principles(id) on delete cascade,
  value_id uuid not null references public.values(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade, -- For RLS
  primary key (principle_id, value_id)
);
comment on table public.principle_values is 'Links principles to values.';
alter table public.principle_values enable row level security;
create policy "Users can manage principle_values for their own principles/values" on public.principle_values for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- tracked_state_values
create table public.tracked_state_values (
  state_id uuid not null references public.tracked_state_defs(id) on delete cascade,
  value_id uuid not null references public.values(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade, -- For RLS
  primary key (state_id, value_id)
);
comment on table public.tracked_state_values is 'Links tracked state definitions to values.';
alter table public.tracked_state_values enable row level security;
create policy "Users can manage tracked_state_values for their own states/values" on public.tracked_state_values for all using (auth.uid() = user_id) with check (auth.uid() = user_id);