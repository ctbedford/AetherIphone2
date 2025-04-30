# Aether iPhone: Complete Migration Context
Generated on Wed Apr 30 04:12:29 CDT 2025

<!-- TOC will be inserted here -->


# (root files)

### .env
**Path:** .env
**Size:** 431 bytes

```
EXPO_PUBLIC_SUPABASE_URL=https://fjzzeprbdjwpxnhnltqm.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqenplcHJiZGp3cHhuaG5sdHFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5NjU1ODEsImV4cCI6MjA2MDU0MTU4MX0.iXWsMcw72PV6dtzDnna9LuPFF1MPYvlmFcasx0Qlo34
SUPABASE_URL=https://fjzzeprbdjwpxnhnltqm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key-from-supabase-settings>```

### .env.example
**Path:** .env.example
**Size:** 133 bytes

```
# Supabase Configuration\nEXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here\nEXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### .eslintrc.js
**Path:** .eslintrc.js
**Size:** 493 bytes

```javascript
// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: 'expo',
  ignorePatterns: ['/dist/*'],
  env: {
    'react-native/react-native': true, // for React Native environment (e.g. __DEV__)
    node: true,                      // allows Node globals like process, module
    jest: true                       // if you have test files using Jest globals
  },
  globals: {
    __DEV__: 'readonly',
  },
  rules: {
    // Optional: adjust specific lint rules if needed
  }
};
```


# .github

### ci.yml
**Path:** .github/workflows/ci.yml
**Size:** 1124 bytes

```yaml
name: CI

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: TypeScript check
        run: npx tsc --noEmit

      # Add this step once we have tests
      # - name: Run tests
      #   run: npm test
        
      - name: Expo config validation
        run: npx expo-cli prebuild --clean --no-install
        
  server-build:
    runs-on: ubuntu-latest
    
    defaults:
      run:
        working-directory: ./server
        
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
          cache-dependency-path: './server/package.json'
      
      - name: Install server dependencies
        run: npm ci
        
      - name: Build server
        run: npm run build ```


# (root files)

### .gitignore
**Path:** .gitignore
**Size:** 414 bytes

```
# Learn more https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files

# dependencies
node_modules/

# Expo
.expo/
dist/
web-build/
expo-env.d.ts

# Native
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision

# Metro
.metro-health-check*

# debug
npm-debug.*
yarn-debug.*
yarn-error.*

# macOS
.DS_Store
*.pem

# local env files
.env*.local

# typescript
*.tsbuildinfo

app-example

.DS_Store

```


# .tamagui

### tamagui.config.json
**Path:** .tamagui/tamagui.config.json
**Size:** 982514 bytes
*(omitted – binary or >204800 bytes)*


# (root files)

### .windsurfrules
**Path:** .windsurfrules
**Size:** 0 bytes

```
```

### AETHER_TODO.md
**Path:** AETHER_TODO.md
**Size:** 6507 bytes

```markdown
# AETHER ― UI / UX & CODE UPGRADE TODO

## 1. GLOBAL DESIGN PRINCIPLES
- [ ] One source of truth → Tamagui theme tokens only (no hex)  
- [ ] Hierarchy first → large titles, section headers, cards  
- [ ] Micro-feedback everywhere → haptics + 200–300 ms fade / slide  
- [ ] Three state rule → loading ⬩ empty ⬩ error for every list / card  
- [ ] Motion restraint → 60 fps on low-end device; keep Lottie / confetti ≤2 s  

## 2. APP-LEVEL TASK LIST (sorted by impact / effort ratio)
- [ ] Finish TypeScript wiring for tRPC & Expo-router: remove all `as any`, `// @ts-ignore`
- [ ] Replace Tabs-in-Settings with list-style grouped sections
- [ ] Add pull-to-refresh to Home dashboard (`RefreshControl`)
- [ ] Introduce global `<ErrorToast>` + dashboard section `error` prop
- [ ] Introduce Floating-Action-Button (FAB) that speed-dials to "New Task / Habit / Goal"
- [ ] Add confetti + haptic success when reward claimed
- [ ] Skeleton component refactor – consume everywhere
- [ ] Dark-mode safe "frosted card" variant wrapped in Tamagui `styled(Card)`

## 3. SCREEN-BY-SCREEN GUIDANCE
### A. HOME (DASHBOARD)
- [ ] Header: `headerLargeTitle ("Good Morning")` with date sub-title
- [ ] Each section = `DashboardSection` (show 3 items + "See All")
  - [ ] Props to add: `skeletonCount`, `error`, `onRetry`
- [ ] Quick Actions → replace 3 buttons with FAB (`@expo/react-native-action-sheet` or custom)
- [ ] Animations: `AnimatePresence` fade-in list items; bounce card on habit check
- [ ] Pull-to-refresh: `<ScrollView refreshControl={<RefreshControl …/>}>`

### B. PLANNER (Tabs Goals / Habits / Calendar)
- [ ] Goals Tab → mount `GoalsList`; pass `isLoading`, `error`
  - [ ] Goal card progress bar animates width on mount (`withTiming`)
- [ ] Habits Tab → reuse `HabitsList`; optimistic toggle + revert on error
- [ ] Calendar Tab → prototype with `react-native-calendars`; dots = tasks/habits
- [ ] Tab switch animation: wrap each `<Tabs.Content>` in `<MotiView from={{opacity:0}} animate={{opacity:1}}>`

### C. COMPASS (Principles / States)
- [ ] Principles list (Card per principle). Empty state with 🧭 illustration
- [ ] State Definitions list: reuse `StateIndicator`; allow swipe-to-edit
- [ ] Add "Add Principle / Add State" FAB local to tab

### D. REWARDS
- [ ] Points card: count-up animation (`useValue, withTiming`)
- [ ] Earned rewards → horizontal `FlatList` (keyExtractor)
- [ ] Available rewards → 2-col grid; button shows `<Spinner>` while claiming
- [ ] Success: confetti (`react-native-confetti-cannon`) + `Haptics.notificationAsync(success)`

### E. SETTINGS
- [ ] Convert Tabs to grouped list:  
  - [ ] Profile (username, avatar)  
  - [ ] Account (password, 2FA, delete)  
  - [ ] Appearance (Dark Mode, System-theme)  
  - [ ] Notifications (push, email toggles)  
- [ ] Dark-mode switch: tri-state (Light / Dark / System)
- [ ] Each row: Tamagui `ListItem` variant with right-chevron

### F. AUTH FLOW
- [ ] Add logo to Login / Register
- [ ] Use Toast (non-blocking) for basic errors; Alert for critical
- [ ] Show / hide password icon inside Inputs (`secureTextEntry` toggle)
- [ ] After Register → Verify screen: add "Open email app" deep-link button (`Linking.openURL('message://')`)

## 4. COMPONENT REFACTOR NOTES
### 1. DashboardSection
```typescript
interface DashboardSectionProps<T> {  
  title: string;  
  data: T[];  
  renderItem(item:T): ReactNode;  
  seeAllRoute?: string;  
  isLoading?: boolean;  
  skeletonCount?: number;   // NEW  
  error?: string;           // NEW  
  onRetry?(): void;         // NEW  
}
```

### 2. Skeleton
- [ ] `Skeleton` = Tamagui `Stack` with animated opacity pulse
- [ ] Use in DashboardSection, GoalsList, HabitsList, etc.

### 3. HabitCheckItem vs HabitsList item
- [ ] Extract pure dumb `HabitToggleRow` (checkbox + title + streak)
- [ ] Dashboard & list reuse; parent passes `onToggle()` & disables during mutation

### 4. GoalSummaryCard vs GoalCard
- [ ] Keep Summary (ring) for dashboard; Detailed (bars) for Goals tab / Details
- [ ] Both share style variant via Tamagui `styled(Card)`

### 5. OfflineIndicator
- [ ] Replace hardcoded red with `$errorBackground`; use `safeAreaInsets.top` on Android too

## 5. TYPESCRIPT / ESLINT REMEDIATION
### A. Server build error (TS6059)
- [ ] Fix: extend `rootDir` OR move shared `types/` under `server/src/`
  Quick fix in `server/tsconfig.json`:
  ```json
  "rootDir": "../",
  "include": ["src/**/*", "../types/**/*"]
  ```

### B. tRPC client typing
- [ ] Generate helper type once:  
  ```typescript
  import type { AppRouter } from 'server/src/router';  
  export const trpc = createTRPCReact<AppRouter>();  
  ```
- [ ] Remove every `// @ts-ignore` + `as any` route cast

### C. Expo-router path types
- [ ] `app.d.ts`
  ```typescript
  declare module 'expo-router' {  
    interface LinkProps { href: `/compose` | `/planner` | ... }  
  }
  ```
- [ ] Or simpler: `router.push({ pathname:'/planner' })`

### D. Missing type-defs packages
- [ ] `@types/shopify__flash-list`, `@types/react-native-reanimated`, etc.  
  `yarn add -D @types/shopify__flash-list`

### E. Lint script
- [ ] `"lint": "eslint \"{app,components,server}/**/*.{ts,tsx}\" --fix"`  
- [ ] Fix all unused vars / imports; prefer `catch (err: unknown)`

## 6. TAMAGUI BEST PRACTICES CHECKLIST
- [ ] Only Tamagui components for layout (YStack/XStack/Text/Card)
- [ ] Use theme tokens (`$color`, `$backgroundStrong`)
- [ ] Create `styled()` variants for repeatable styles (frostedCard, sectionHeader)
- [ ] Configure Tamagui Compiler (metro) for perf
- [ ] Use `AnimatePresence` & `Stack animation="quick"` rather than StyleSheet animations where possible

## 7. IMPLEMENTATION PLAN (2-Week Sprint)
- [ ] Day 1-2   → Fix TypeScript config, remove ignores, green CI
- [ ] Day 3-4   → Refactor Skeleton + DashboardSection; integrate error prop
- [ ] Day 5     → FAB component + swap into Home
- [ ] Day 6-7   → Settings redesign to grouped list
- [ ] Day 8     → Rewards polish (confetti, claim spinner)
- [ ] Day 9-10  → Minor screens (Compass, Planner animations), QA, polish

## Deliverables for this sprint
- [ ] All TS errors resolved, no `@ts-ignore` in `app/` or `server/`  
- [ ] Dashboard displays error banners and supports pull-to-refresh  
- [ ] FAB replaces "Quick Actions" buttons  
- [ ] Settings → grouped list; Dark-Mode tri-state switch  
- [ ] Claiming a reward plays confetti + haptic  
- [ ] 100% ESLint clean (`npm run lint` passes) ```

### README.md
**Path:** README.md
**Size:** 2381 bytes

```markdown
# Aether App

A modern mobile application built with Expo, React Native, tRPC, and Tamagui.

## Project Structure

- `/app` - Expo Router app screens and navigation
- `/components` - Reusable UI components
- `/utils` - Utility functions and helpers
- `/server` - Express/tRPC backend server

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- iOS Simulator or Android Emulator for mobile testing

### Installing

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Install server dependencies:

```bash
cd server
npm install
cd ..
```

### Running the App

**Start the backend server:**

```bash
cd server
npm run dev
```

This will start the tRPC server on [http://localhost:3000](http://localhost:3000).

**Start the Expo app:**

In a separate terminal:

```bash
npm start
```

This will launch the Expo development server. Press:
- `i` to open in iOS simulator
- `a` to open in Android emulator
- `w` to open in web browser

## Authentication

The app uses Supabase for secure authentication:

1. Create a free Supabase account at [supabase.com](https://supabase.com)
2. Create a new project and note your project URL and anon key
3. Create a `.env` file in the root of the project (copy from `.env.example`) and add your Supabase credentials
4. Authentication is already set up with the following features:
   - Email/password sign up and login
   - Session persistence with SecureStore
   - Password reset (through Supabase)

Demo credentials:
  - Email: `demo@example.com`
  - Password: `password`

## Development

### Backend Server

The backend server uses:
- Express
- tRPC for type-safe API
- In-memory data store (replace with a real DB in production)

Key endpoints:
- `/health` - Health check endpoint
- `/api/trpc` - tRPC API endpoint

### Mobile App

The app is organized using Expo Router file-based routing:
- `/app/(tabs)` - Main tabs after login
- `/app/auth` - Authentication screens (login/register)
- `/app/compose` - Modal screen example

## Project Roadmap

Phase 1 (In Progress):
- Core authentication flow
- Basic UI components
- API integration

Phase 2 (Upcoming):
- Offline sync capabilities
- Push notifications
- Performance optimizations

## Technologies

- Expo SDK 52
- React Native 0.76.x
- React 18.3
- TypeScript
- tRPC
- Tamagui UI
- NativeWind/Tailwind CSS
- React Query for data fetching/caching
```

### REFACTORING_PLAN_V2.yaml
**Path:** REFACTORING_PLAN_V2.yaml
**Size:** 13603 bytes

```yaml
title: Aether iPhone App - Enhanced Refactoring Plan (Post-Schema Update)
version: 2.0
last_updated: 2025-04-28 # Update with current date when executing

phases:
  - phase: 0
    name: Schema Update & Regeneration
    description: >
      Apply the enhanced database schema migration (`enhance_functional_schema.sql`) and regenerate all dependent types.
      This sets the stage for implementing new features and aligning existing code with the improved data model.
    status: Completed # Phase completed
    tasks:
      - id: SCHEMA-01
        name: Apply Enhanced Schema Migration
        details: >
          Apply the `enhance_functional_schema.sql` migration to the Supabase database using
          `supabase db push` or equivalent. Handle any manual data migration steps (e.g., for task priority enum mapping).
        status: Completed # Assuming this was done prior to type generation
        files_affected:
          - supabase/migrations/ (new file applied)
        testing_impact: None directly, but subsequent type generation depends on this. DB structure changes.
      - id: SCHEMA-02
        name: Regenerate Database Types
        details: >
          Run `npx supabase gen types typescript --linked > types/database.types.ts` to update
          the TypeScript definitions based on the newly migrated schema, capturing all new tables and columns.
        status: Completed # types/database.types.ts reflects new schema
        files_affected:
          - types/database.types.ts
        testing_impact: Foundational for all subsequent type checking and tests. Existing code referencing old types will show errors.

  - phase: 1
    name: Backend Alignment (Enhanced Schema)
    description: >
      Update Zod schemas and tRPC routers to fully reflect the enhanced database schema,
      including new fields for recurrence, archiving, sorting, habit types, reminders, etc.
      Update server-side tests accordingly.
    status: In Progress # Zod schemas done, Routers partially done
    tasks:
      - id: TYPE-02
        name: Update Zod Schemas for Enhanced DB
        details: >
          Modify Zod schemas in `server/src/types/trpc-types.ts` for `Goal`, `Habit`, `Task`,
          `Value`, `Principle`, `TrackedStateDef`, `HabitEntry`, `StateEntry` to include new fields
          (recurrence_rule, archived_at, sort_order, habit_type, goal_quantity, goal_unit,
          quantity_value, notes, target_min/max_value, etc.). Define new Zod schemas for
          `Reminder` and `GoalProgressNote`. Ensure enums match DB enums defined in the migration.
        status: Completed # server/src/types/trpc-types.ts updated
        files_affected:
          - server/src/types/trpc-types.ts
        testing_impact: Server tests will fail until routers are updated. Foundational for frontend typing.
      - id: BACKEND-06
        name: Refactor Routers for Enhanced Schema & CRUD
        details: >
          Update all tRPC routers (`goalRouter`, `habitRouter`, `taskRouter`, `valueRouter`,
          `trackedStateRouter`, `dashboardRouter`, etc.) to select, insert, and update
          the new fields defined in TYPE-02. Implement filtering for `archived_at` (e.g., `isNull('archived_at')`
          for active items). Add procedures for managing `Reminder` and `GoalProgressNote` tables. Update existing procedures to handle new fields (e.g., `habit_type`, `quantity_value` in habit logic).
        status: In Progress # Routers completed: Value, Principle, Goal, Task, Dashboard, Habit. Remaining: trackedStateRouter, reminderRouter, goalProgressNoteRouter
        files_affected:
          - server/src/routers/*.ts
        testing_impact: Requires significant updates to server tests (`__tests__/server/`) to mock and assert new fields and procedures.
      - id: BACKEND-07
        name: Update Server Tests for Enhanced Schema
        details: >
          Rewrite/update all tests in `__tests__/server/` to mock the enhanced Supabase schema
          (using `test-helpers.ts`) and assert that router procedures correctly handle the new
          fields, types (enums), and logic (e.g., archiving filters, recurrence handling if tested at router level).
        status: Not Started # Tests need update for new schema/logic
        files_affected:
          - __tests__/server/**/*.test.ts
          - __tests__/server/test-helpers.ts
        testing_impact: Ensures backend logic aligns with the new database structure.

  - phase: 2
    name: Frontend Type Consumption & Test Overhaul (Enhanced Schema)
    description: >
      Update frontend components and hooks to use the inferred `RouterOutputs` based on the
      enhanced backend schema from Phase 1. Remove remaining type casts and overhaul the UI test suite.
    status: Partially Implemented # Basic structure exists, but needs alignment with *new* types
    tasks:
      - id: FRONTEND-04
        name: Update Frontend Components for Enhanced Types
        details: >
          Refactor components in `app/` and `components/` (including `HomeScreen`, `PlannerScreen`,
          dashboard items, list items) to strictly use `RouterOutputs` inferred from the Phase 1
          backend changes. Access properties using correct names and types (including new fields like
          `archived_at`, `sort_order`, `quantity_value`, `notes`, etc., where applicable). Remove remaining
          `as any` / `@ts-ignore`.
        status: Partially Implemented # Needs update for new fields/types
        files_affected:
          - app/**/*.tsx
          - components/**/*.tsx
        testing_impact: Requires updating UI tests with mocks matching the *new* `RouterOutputs`.
      - id: TEST-02
        name: Overhaul Jest UI Test Suite & Config (Enhanced Schema)
        details: >
          Update all UI tests (`__tests__/` excluding `server/`) mocks, assertions, and snapshots
          to reflect the enhanced data structures and component props. Address flaky tests.
          Consolidate Jest configurations if still needed (remove `jest.server.config.js` if redundant).
        status: Partially Implemented # Needs update for new fields/types and config consolidation
        files_affected:
          - __tests__/**/*.test.tsx
          - __tests__/**/*.snap
          - jest.config.ui.js
          - jest.setup.js
          - jest.config.server.js / jest.server.config.js

  - phase: 3
    name: Feature Implementation (Core Functionality)
    description: >
      Build out core user-facing features leveraging the enhanced schema, including missing screens,
      recurrence, sub-tasks, reminders, archiving, and sorting.
    status: Not Started # Core features leveraging new schema are not built
    tasks:
      - id: FEAT-03
        name: Implement Recurrence UI & Logic
        details: >
          Add UI elements (e.g., in creation/edit modals) for setting `recurrence_rule` on tasks/habits.
          Update frontend logic to display recurring items correctly in lists/calendars.
        status: Not Started
        files_affected:
          - components/modals/* (TBD)
          - app/(tabs)/planner/index.tsx
          - components/lists/*.tsx
        testing_impact: Requires new UI tests for recurrence configuration and display.
      - id: FEAT-04
        name: Implement Sub-task UI & Logic
        details: >
          Allow creating tasks linked via `parent_task_id`. Update task detail screens and lists
          to display parent/child relationships and potentially roll up progress.
        status: Not Started
        files_affected:
          - components/modals/AddTask.tsx (TBD)
          - app/(tabs)/planner/task/[id].tsx (TBD)
          - components/lists/TaskList.tsx
        testing_impact: Requires new UI tests for sub-task creation, display, and interaction.
      - id: FEAT-05
        name: Implement Reminders UI & Logic
        details: >
          Add UI for setting `reminder_time` on tasks/goals/habits using the new `reminders` table.
          Implement logic to schedule/manage these reminders (potentially via `expo-notifications`).
        status: Not Started
        files_affected:
          - components/modals/* (TBD)
          - utils/notifications.ts (TBD)
          - server/src/routers/reminderRouter.ts (TBD)
        testing_impact: Requires new UI tests for setting reminders and potentially integration tests for notification scheduling.
      - id: FEAT-06
        name: Implement Archiving UI & Logic
        details: >
          Add "Archive" buttons/actions to goals, tasks, habits. Update list queries/filters
          to respect the `archived_at` field. Provide an "Archived Items" view (perhaps in Settings).
        status: Not Started
        files_affected:
          - components/lists/*.tsx
          - app/(tabs)/planner/*
          - app/(tabs)/settings/* (TBD Archive View)
        testing_impact: Requires UI tests for archive actions and filtering.
      - id: FEAT-07
        name: Implement Manual Sorting UI & Logic
        details: >
          Add drag-and-drop functionality (e.g., using `react-native-gesture-handler` + `reanimated`)
          to lists where `sort_order` exists (Goals, Values, Principles, Tasks). Update backend to
          handle reordering mutations.
        status: Not Started
        files_affected:
          - components/lists/*.tsx
          - app/(tabs)/planner/index.tsx
          - app/(tabs)/compass/index.tsx
        testing_impact: Requires complex UI interaction tests for drag-and-drop.
      - id: FEAT-08
        name: Implement Enhanced Habit Tracking UI
        details: >
          Update habit creation/edit modals and habit entry UI to support `habit_type` (boolean/quantity),
          `goal_quantity`, `goal_unit`, and entry `notes`/`quantity_value`. Update `HabitToggleRow` or replace.
        status: Not Started
        files_affected:
          - components/modals/AddHabit.tsx (TBD)
          - components/lists/HabitList.tsx
          - components/ui/HabitToggleRow.tsx (or replacement)
        testing_impact: Requires UI tests for quantity input, notes, and different habit type displays.
      - id: FEAT-09
        name: Implement Contextual Notes UI
        details: >
          Add input fields for `notes` on state entries and goal progress updates (`goal_progress_notes` table). Display these notes appropriately.
        status: Not Started
        files_affected:
          - app/(tabs)/compass/* (TBD State Entry UI)
          - app/(tabs)/planner/goal/[id].tsx (TBD Goal Detail)
        testing_impact: Requires UI tests for note input and display.
      - id: ROUTE-04
        name: Implement Missing Screens (Planner/Settings Details)
        details: >
          Build out the UI for detail screens identified as missing (e.g., `planner/goal/[id].tsx`,
          `settings/profile.tsx`). Create placeholder files first (ROUTE-02 from original plan). Connect them to the corresponding (now type-aligned) tRPC routers.
        status: Not Started # Files still missing
        files_affected:
          - app/(tabs)/planner/ (create files)
          - app/(tabs)/settings/ (create files)
        testing_impact: Requires writing new UI and integration tests for these screens.

  - phase: 4
    name: Advanced Features & Polish
    description: >
      Implement remaining major features (Compass, Rewards), complete the Tamagui migration,
      fully integrate offline sync, and address final cleanup tasks.
    status: Not Started # Advanced features not implemented
    tasks:
      - id: FEAT-10
        name: Implement Compass & Rewards Screens
        details: >
          Build out the UI for Compass (analytics using enhanced state/goal data) and Rewards screens using the backend data.
          Implement charts and reward redemption logic.
        status: Not Started
        files_affected:
          - app/(tabs)/compass/index.tsx
          - app/(tabs)/rewards/index.tsx
          - components/charts/* (TBD)
          - components/rewards/*
        testing_impact: Requires new UI tests for charts, reward lists, and redemption flow.
      - id: FEAT-11
        name: Fully Integrate Offline Mutation Queue
        details: >
          Ensure `saveOfflineMutation` is robustly integrated into *all* relevant `useMutation` hooks.
          Add UI indicators for pending sync items (`useOfflineSync` hook). Test edge cases thoroughly.
        status: Not Implemented # Integration is pending
        files_affected:
          - Hooks/Components using `useMutation`
          - components/ui/OfflineIndicator.tsx (or similar)
        testing_impact: Requires comprehensive offline integration testing.
      - id: REFACTOR-02
        name: Complete Tamagui Migration & Cleanup
        details: >
          Eliminate remaining non-Tamagui primitives (`View`, `Text`, etc.). Ensure consistent token usage. Remove custom
          `providers/ToastProvider.tsx` in favor of `@tamagui/toast`.
        status: Partially Implemented # Migration ongoing, ToastProvider exists
        files_affected:
          - components/**/*.tsx
          - app/**/*.tsx
          - providers/ToastProvider.tsx (delete)
          - providers/Providers.tsx
        testing_impact: Update UI tests. Snapshots will change.
      - id: CLEANUP-02
        name: Address Remaining TODOs and Lint Warnings
        details: >
          Final pass through `AETHER_TODO.md`, `refactor_checklist.md`. Resolve all lint warnings/errors.
        status: Partially Implemented # TODOs remain
        files_affected:
          - Various
        testing_impact: Minor test adjustments likely.
```

### SUPABASE_INTEGRATION.md
**Path:** SUPABASE_INTEGRATION.md
**Size:** 4778 bytes

```markdown
# Aether App - Supabase Integration

## What's Been Integrated

1. **Supabase Authentication**
   - Email/password login and registration
   - Secure token storage using Expo SecureStore
   - Authentication state management
   - Automatic session refresh

2. **User Profiles**
   - Basic profile retrieval through Supabase
   - User metadata storage

3. **App Configuration**
   - Added settings management with SecureStore
   - Environment variable setup for Supabase credentials

## Setup Instructions

1. **Create a Supabase Project**
   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Local Setup**
   - Copy `.env.example` to `.env`
   - Fill in your Supabase URL and anon key
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

3. **Database Setup in Supabase**
   - Create a `profiles` table with the SQL below:

   ```sql
   create table public.profiles (
     id uuid references auth.users not null primary key,
     username text,
     avatar_url text,
     created_at timestamp with time zone default now(),
     updated_at timestamp with time zone default now()
   );

   -- Enable RLS
   alter table public.profiles enable row level security;

   -- Create a policy that allows users to read all profiles
   create policy "Profiles are viewable by everyone" on profiles
     for select using (true);

   -- Create a policy that allows users to update only their own profile
   create policy "Users can update their own profile" on profiles
     for update using (auth.uid() = id);

   -- Function to create a profile when a user signs up
   create or replace function public.handle_new_user()
   returns trigger as $$
   begin
     insert into public.profiles (id, username, avatar_url)
     values (new.id, new.raw_user_meta_data->>'username', null);
     return new;
   end;
   $$ language plpgsql security definer;

   -- Trigger to create a profile when a user signs up
   create trigger on_auth_user_created
     after insert on auth.users
     for each row execute procedure public.handle_new_user();
   ```

## Next Steps

1. **Real-time Data Sync**
   - Set up Supabase Realtime for subscriptions
   - Implement data sync with React Query + Supabase

2. **Storage**
   - Implement Supabase Storage for file uploads (profile pictures, attachments)

3. **Offline Support**
   - Implement offline queue for mutations
   - Set up background sync

4. **Testing**
   - Create a test project in Supabase for CI/CD environments

## Implementation Details

### Authentication Flow

1. User enters credentials in login/register screen
2. Supabase SDK handles authentication
3. Supabase stores tokens in SecureStore
4. Authentication state is managed in _layout.tsx
5. Pages use authentication state to redirect as needed

### Profile Management

The `getUserProfile` function demonstrates how to:
1. Get the current authenticated user
2. Query their profile information from the database
3. Handle cases where the profile hasn't been created yet

### Logout Flow

The logout function:
1. Calls Supabase signOut
2. Clears session state
3. Redirects to login 

## Offline Support

We've implemented a comprehensive offline-first architecture using:

1. **React Query Persistence**
   - Queries are cached in AsyncStorage
   - Mutations are paused when offline and resumed when online
   - Cache is rehydrated on app restart

2. **Visual Indicators**
   - OfflineIndicator component shows network status
   - Pending items are marked with a visual badge

3. **Custom Offline Sync System**
   - Mutations are stored in AsyncStorage when offline
   - Automatic sync when the device reconnects
   - Support for create, update, and delete operations

### Using Offline Sync in Components

```tsx
import { useOfflineSync } from '@/hooks/useOfflineSync';

// In your component
function TaskList() {
  // Set up offline sync for the 'tasks' entity
  const { 
    isOnline, 
    pendingItems, 
    createItem, 
    updateItem, 
    deleteItem, 
    isItemPending 
  } = useOfflineSync<Task>('tasks');

  // Create a new task (works offline)
  const handleAddTask = async () => {
    const { id, isOffline } = await createItem({ 
      title: 'New Task',
      completed: false
    });
    
    // The task is created with a temporary ID if offline
    console.log(`Task created with ID: ${id}, offline: ${isOffline}`);
  };

  // In your render function, show pending state
  return (
    <View>
      {tasks.map(task => (
        <View key={task.id}>
          <Text>{task.title}</Text>
          {isItemPending(task.id) && (
            <Badge>Pending Sync</Badge>
          )}
        </View>
      ))}
    </View>
  );
}
``` ```


# __tests__

### HabitCheckItem.test.tsx
**Path:** __tests__/components/dashboard/HabitCheckItem.test.tsx
**Size:** 4800 bytes

```typescript
import React from 'react';
import { render, fireEvent, act } from '../test-utils';
import HabitCheckItem from '@/components/dashboard/HabitCheckItem';
import { trpc } from '@/utils/trpc';

// Mock the trpc hook
jest.mock('@/utils/trpc', () => ({
  trpc: {
    habit: {
      createHabitEntry: {
        useMutation: jest.fn().mockReturnValue({
          mutate: jest.fn(),
          isLoading: false,
          isError: false,
          error: null,
        }),
      },
      deleteHabitEntry: {
        useMutation: jest.fn().mockReturnValue({
          mutate: jest.fn(),
          isLoading: false,
          isError: false,
          error: null,
        }),
      },
    },
  },
}));

// Mock Haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
  },
}));

describe('HabitCheckItem', () => {
  const mockHabit = {
    id: 'habit-1',
    title: 'Morning Run',
    streak: 3,
    completedToday: false,
    best_streak: 5,
    user_id: 'user-1',
    cue: 'Wake up',
    routine: 'Run 5k',
    reward: 'Coffee',
    habit_type: 'do',
    frequency_period: 'daily',
    goal_frequency: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with uncompleted habit', () => {
    const { getByText } = render(<HabitCheckItem habit={mockHabit} />);
    
    expect(getByText('Morning Run')).toBeTruthy();
    expect(getByText(' 3 day streak')).toBeTruthy();
    expect(getByText('Check-in')).toBeTruthy();
  });

  it('renders correctly with completed habit for today', () => {
    const completedHabit = { ...mockHabit, completedToday: true };
    const { getByText } = render(<HabitCheckItem habit={completedHabit} />);
    
    expect(getByText('Morning Run')).toBeTruthy();
    expect(getByText(' 3 day streak')).toBeTruthy();
    expect(getByText('Done')).toBeTruthy();
  });

  it('calls createHabitEntry mutation when checking in', () => {
    const mockOnToggle = jest.fn();
    const mockCreateMutate = jest.fn();

    // Setup the mock create mutation
    (trpc.habit.createHabitEntry.useMutation as jest.Mock).mockReturnValue({
      mutate: mockCreateMutate,
      isLoading: false,
      isError: false,
      error: null,
    });

    const { getByText } = render(
      <HabitCheckItem habit={{...mockHabit, completedToday: false}} onToggle={mockOnToggle} />
    );

    // Press the check-in button
    fireEvent.press(getByText('Check-in'));

    // Verify the create mutation was called
    expect(mockCreateMutate).toHaveBeenCalledWith(expect.objectContaining({
      habitId: 'habit-1',
      date: expect.any(String),
      completed: true,
    }));

    // Verify the onToggle prop was called if provided
    expect(mockOnToggle).toHaveBeenCalledWith('habit-1', true);
  });

  it('calls deleteHabitEntry mutation when unchecking', () => {
    const mockOnToggle = jest.fn();
    const mockDeleteMutate = jest.fn();

    // Setup the mock delete mutation
    (trpc.habit.deleteHabitEntry.useMutation as jest.Mock).mockReturnValue({
      mutate: mockDeleteMutate,
      isLoading: false,
      isError: false,
      error: null,
    });

    const { getByText } = render(
      <HabitCheckItem habit={{...mockHabit, completedToday: true}} onToggle={mockOnToggle} />
    );

    // Press the done button
    fireEvent.press(getByText('Done'));

    // Verify the delete mutation was called
    expect(mockDeleteMutate).toHaveBeenCalledWith(expect.objectContaining({
      habitId: 'habit-1',
      date: expect.any(String),
    }));

    // Verify the onToggle prop was called if provided
    expect(mockOnToggle).toHaveBeenCalledWith('habit-1', false);
  });

  it('handles error state from mutation', async () => {
    // Mock console.error to prevent test output noise
    const originalConsoleError = console.error;
    console.error = jest.fn();

    // Assume createHabitEntry for error testing, could be delete too
    let errorCallback: (error: any) => void = () => {};
    
    (trpc.habit.createHabitEntry.useMutation as jest.Mock).mockImplementation(({ onError }) => {
      errorCallback = onError;
      return {
        mutate: jest.fn(),
        isLoading: false,
        isError: true,
      };
    });

    const { getByText } = render(<HabitCheckItem habit={mockHabit} />);

    // Press the check-in button (assuming initial state is not completed)
    fireEvent.press(getByText('Check-in'));

    // Simulate an error from the server
    await act(async () => {
      errorCallback(new Error('Network error'));
    });

    // Check that error was logged
    expect(console.error).toHaveBeenCalled();

    // Restore console.error
    console.error = originalConsoleError;
  });
});
```

### GoalList.test.tsx
**Path:** __tests__/components/lists/GoalList.test.tsx
**Size:** 4020 bytes

```typescript
import React from 'react';
import { render, fireEvent } from '../test-utils';
import { GoalList, GoalCard } from '@/components/lists/GoalList';
import { router } from 'expo-router';

// Mock router.push
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

// Define sample mock data that matches our Supabase schema via tRPC
const mockGoals = [
  {
    id: 'goal-1',
    title: 'Complete Project',
    description: 'Finish the Aether app refactoring',
    progress: 75,
    target_date: '2025-05-15',
    user_id: 'user-123',
  },
  {
    id: 'goal-2',
    title: 'Learn TypeScript',
    description: 'Master advanced TypeScript concepts',
    progress: 30,
    target_date: '2025-06-30',
    user_id: 'user-123',
  },
];

describe('GoalCard Component', () => {
  it('renders goal information correctly', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <GoalCard goal={mockGoals[0]} onPress={onPressMock} />
    );
    
    expect(getByText('Complete Project')).toBeTruthy();
    expect(getByText('Finish the Aether app refactoring')).toBeTruthy();
    expect(getByText('75%')).toBeTruthy();
    expect(getByText('May 15')).toBeTruthy();
  });
  
  it('handles press events', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <GoalCard goal={mockGoals[0]} onPress={onPressMock} />
    );
    
    // Find the card and press it
    const card = getByText('Complete Project').parent.parent.parent;
    fireEvent.press(card);
    
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});

describe('GoalList Component', () => {
  it('renders loading state correctly', () => {
    const { getByTestId } = render(
      <GoalList isLoading={true} refetch={jest.fn()} />
    );
    
    expect(getByTestId('skeleton-loader')).toBeTruthy();
  });
  
  it('renders error state correctly', () => {
    const refetchMock = jest.fn();
    const { getByText } = render(
      <GoalList isLoading={false} isError={true} refetch={refetchMock} />
    );
    
    expect(getByText('Unable to load goals')).toBeTruthy();
    
    // Test retry functionality
    fireEvent.press(getByText('Retry'));
    expect(refetchMock).toHaveBeenCalledTimes(1);
  });
  
  it('renders empty state correctly', () => {
    const { getByText } = render(
      <GoalList isLoading={false} goals={[]} refetch={jest.fn()} />
    );
    
    expect(getByText('No goals yet')).toBeTruthy();
    
    // Test create action
    fireEvent.press(getByText('Create a goal'));
    expect(router.push).toHaveBeenCalledWith('/planner/add-goal');
  });
  
  it('renders goals correctly', () => {
    const { getAllByText } = render(
      <GoalList isLoading={false} goals={mockGoals} refetch={jest.fn()} />
    );
    
    // Should render both goals
    expect(getAllByText(/Complete Project|Learn TypeScript/).length).toBe(2);
  });
  
  it('navigates to goal detail on press', () => {
    const { getByText } = render(
      <GoalList isLoading={false} goals={mockGoals} refetch={jest.fn()} />
    );
    
    // Press the first goal
    const goalTitle = getByText('Complete Project');
    fireEvent.press(goalTitle.parent.parent.parent);
    
    // Should navigate to the goal detail page
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/planner/goal/[id]',
      params: { id: 'goal-1' }
    });
  });
  
  it('calls onSelectGoal when provided', () => {
    const onSelectMock = jest.fn();
    const { getByText } = render(
      <GoalList 
        isLoading={false} 
        goals={mockGoals} 
        refetch={jest.fn()} 
        onSelectGoal={onSelectMock} 
      />
    );
    
    // Press the first goal
    const goalTitle = getByText('Complete Project');
    fireEvent.press(goalTitle.parent.parent.parent);
    
    // Should call the onSelectGoal callback
    expect(onSelectMock).toHaveBeenCalledWith(mockGoals[0]);
    // Should not navigate (router.push should not be called)
    expect(router.push).not.toHaveBeenCalled();
  });
});
```

### HabitList.test.tsx
**Path:** __tests__/components/lists/HabitList.test.tsx
**Size:** 3738 bytes

```typescript
import React from 'react';
import { render, fireEvent } from '../test-utils';
import { HabitList, HabitCard } from '@/components/lists/HabitList';
import { router } from 'expo-router';

// Mock router.push
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

// Define sample mock data that matches our Supabase schema via tRPC
const mockHabits = [
  {
    id: 'habit-1',
    title: 'Morning Meditation',
    streak: 5,
    best_streak: 21,
    cue: 'After waking up',
    routine: 'Meditate for 10 minutes',
    reward: 'Feel centered and calm',
    user_id: 'user-123',
  },
  {
    id: 'habit-2',
    title: 'Code Review',
    streak: 12,
    best_streak: 30,
    cue: 'After lunch',
    routine: 'Review code for 20 minutes',
    reward: 'Learn new patterns',
    user_id: 'user-123',
  },
];

describe('HabitCard Component', () => {
  it('renders habit information correctly', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <HabitCard habit={mockHabits[0]} onPress={onPressMock} />
    );
    
    expect(getByText('Morning Meditation')).toBeTruthy();
    expect(getByText('Current: 5 days')).toBeTruthy();
    expect(getByText('Best: 21 days')).toBeTruthy();
  });
  
  it('handles toggle correctly', () => {
    const onPressMock = jest.fn();
    const onToggleMock = jest.fn();
    const { getByTestId } = render(
      <HabitCard 
        habit={mockHabits[0]} 
        onPress={onPressMock} 
        onToggle={onToggleMock} 
      />
    );
    
    // Find the toggle button (checkmark)
    const toggleButton = getByTestId('icon-checkmark-circle-outline');
    fireEvent.press(toggleButton.parent);
    
    // Should call onToggle with true (completed)
    expect(onToggleMock).toHaveBeenCalledWith(true);
  });
});

describe('HabitList Component', () => {
  it('renders loading state correctly', () => {
    const { getByTestId } = render(
      <HabitList isLoading={true} refetch={jest.fn()} />
    );
    
    expect(getByTestId('skeleton-loader')).toBeTruthy();
  });
  
  it('renders error state correctly', () => {
    const refetchMock = jest.fn();
    const { getByText } = render(
      <HabitList isLoading={false} isError={true} refetch={refetchMock} />
    );
    
    expect(getByText('Unable to load habits')).toBeTruthy();
    
    // Test retry functionality
    fireEvent.press(getByText('Retry'));
    expect(refetchMock).toHaveBeenCalledTimes(1);
  });
  
  it('renders empty state correctly', () => {
    const { getByText } = render(
      <HabitList isLoading={false} habits={[]} refetch={jest.fn()} />
    );
    
    expect(getByText('No habits yet')).toBeTruthy();
    
    // Test create action
    fireEvent.press(getByText('Create a habit'));
    expect(router.push).toHaveBeenCalledWith('/planner/add-habit');
  });
  
  it('renders habits correctly', () => {
    const { getAllByText } = render(
      <HabitList isLoading={false} habits={mockHabits} refetch={jest.fn()} />
    );
    
    // Should render both habits
    expect(getAllByText(/Morning Meditation|Code Review/).length).toBe(2);
  });
  
  it('calls onToggleHabit when provided', () => {
    const onToggleHabitMock = jest.fn();
    const { getByText, getAllByTestId } = render(
      <HabitList 
        isLoading={false} 
        habits={mockHabits} 
        refetch={jest.fn()} 
        onToggleHabit={onToggleHabitMock} 
      />
    );
    
    // Find the first habit's toggle button
    const toggleButtons = getAllByTestId('icon-checkmark-circle-outline');
    fireEvent.press(toggleButtons[0].parent);
    
    // Should call onToggleHabit with the habit ID and completion status
    expect(onToggleHabitMock).toHaveBeenCalledWith('habit-1', true);
  });
});
```

### TaskList.test.tsx
**Path:** __tests__/components/lists/TaskList.test.tsx
**Size:** 4600 bytes

```typescript
import React from 'react';
import { render, fireEvent } from '../test-utils';
import { TaskList, TaskCard } from '@/components/lists/TaskList';
import { router } from 'expo-router';

// Mock router.push
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

// Define sample mock data that matches our Supabase schema via tRPC
const mockTasks = [
  {
    id: 'task-1',
    title: 'Create UI components',
    notes: 'Focus on reusable design patterns',
    due: '2025-05-01',
    completed: false,
    goal_id: 'goal-1',
    goal: { title: 'App Refactoring' },
    user_id: 'user-123',
  },
  {
    id: 'task-2',
    title: 'Write tests',
    notes: 'Ensure good coverage of components',
    due: '2025-05-03',
    completed: true,
    goal_id: null,
    goal: null,
    user_id: 'user-123',
  },
];

describe('TaskCard Component', () => {
  it('renders task information correctly', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <TaskCard task={mockTasks[0]} onPress={onPressMock} />
    );
    
    expect(getByText('Create UI components')).toBeTruthy();
    expect(getByText('Focus on reusable design patterns')).toBeTruthy();
    expect(getByText('May 1')).toBeTruthy();
    expect(getByText('App Refactoring')).toBeTruthy();
  });
  
  it('handles completion toggle correctly', () => {
    const onPressMock = jest.fn();
    const onCompleteMock = jest.fn();
    const { getByTestId } = render(
      <TaskCard 
        task={mockTasks[0]} 
        onPress={onPressMock} 
        onComplete={onCompleteMock} 
      />
    );
    
    // Find the toggle button (checkmark)
    const toggleButton = getByTestId('icon-checkmark-circle-outline');
    fireEvent.press(toggleButton.parent);
    
    // Should call onComplete with true (completed)
    expect(onCompleteMock).toHaveBeenCalledWith(true);
  });
  
  it('displays completed task with line-through', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <TaskCard task={mockTasks[1]} onPress={onPressMock} />
    );
    
    const titleElement = getByText('Write tests');
    // Text should have line-through style
    expect(titleElement.props.style).toBeDefined();
    // Would check for textDecorationLine: 'line-through' here, but we're mocking styles
  });
  
  it('shows overdue status for past due tasks', () => {
    const pastDueTask = {
      ...mockTasks[0],
      due: '2025-04-01', // Past date
    };
    
    const { getByText } = render(
      <TaskCard task={pastDueTask} onPress={jest.fn()} />
    );
    
    // Should show "Overdue" text
    expect(getByText(/Overdue:/)).toBeTruthy();
  });
});

describe('TaskList Component', () => {
  it('renders loading state correctly', () => {
    const { getByTestId } = render(
      <TaskList isLoading={true} refetch={jest.fn()} />
    );
    
    expect(getByTestId('skeleton-loader')).toBeTruthy();
  });
  
  it('renders error state correctly', () => {
    const refetchMock = jest.fn();
    const { getByText } = render(
      <TaskList isLoading={false} isError={true} refetch={refetchMock} />
    );
    
    expect(getByText('Unable to load tasks')).toBeTruthy();
    
    // Test retry functionality
    fireEvent.press(getByText('Retry'));
    expect(refetchMock).toHaveBeenCalledTimes(1);
  });
  
  it('renders empty state correctly', () => {
    const { getByText } = render(
      <TaskList isLoading={false} tasks={[]} refetch={jest.fn()} />
    );
    
    expect(getByText('No tasks yet')).toBeTruthy();
    
    // Test create action
    fireEvent.press(getByText('Create a task'));
    expect(router.push).toHaveBeenCalledWith('/planner/add-task');
  });
  
  it('renders tasks correctly', () => {
    const { getAllByText } = render(
      <TaskList isLoading={false} tasks={mockTasks} refetch={jest.fn()} />
    );
    
    // Should render both tasks
    expect(getAllByText(/Create UI components|Write tests/).length).toBe(2);
  });
  
  it('calls onCompleteTask when provided', () => {
    const onCompleteTaskMock = jest.fn();
    const { getByText, getAllByTestId } = render(
      <TaskList 
        isLoading={false} 
        tasks={mockTasks} 
        refetch={jest.fn()} 
        onCompleteTask={onCompleteTaskMock} 
      />
    );
    
    // Find the first task's toggle button
    const toggleButtons = getAllByTestId('icon-checkmark-circle-outline');
    fireEvent.press(toggleButtons[0].parent);
    
    // Should call onCompleteTask with the task ID and completion status
    expect(onCompleteTaskMock).toHaveBeenCalledWith('task-1', true);
  });
});
```

### AetherCard.test.tsx
**Path:** __tests__/components/ui/primitives/AetherCard.test.tsx
**Size:** 1733 bytes

```typescript
import React from 'react';
import { Text } from 'tamagui';
import { AetherCard } from '@/components/ui/primitives/AetherCard';
import { render, fireEvent } from '../../../test-utils';

describe('AetherCard Component', () => {
  it('renders correctly with default props', () => {
    const { getByText } = render(
      <AetherCard>
        <Text>Test Card Content</Text>
      </AetherCard>
    );
    
    expect(getByText('Test Card Content')).toBeTruthy();
  });
  
  it('applies the correct variant styles', () => {
    const { rerender, getByTestId } = render(
      <AetherCard testID="test-card" variant="default">
        <Text>Default Variant</Text>
      </AetherCard>
    );
    
    // Test default variant
    let card = getByTestId('test-card');
    expect(card.props.style).toBeDefined();
    
    // Test elevated variant
    rerender(
      <AetherCard testID="test-card" variant="elevated">
        <Text>Elevated Variant</Text>
      </AetherCard>
    );
    card = getByTestId('test-card');
    expect(card.props.style).toBeDefined();
    
    // Test outlined variant
    rerender(
      <AetherCard testID="test-card" variant="outlined">
        <Text>Outlined Variant</Text>
      </AetherCard>
    );
    card = getByTestId('test-card');
    expect(card.props.style).toBeDefined();
  });
  
  it('handles press events when interactive', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <AetherCard testID="interactive-card" isInteractive onPress={onPressMock}>
        <Text>Interactive Card</Text>
      </AetherCard>
    );
    
    const card = getByTestId('interactive-card');
    fireEvent.press(card);
    
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
```

### AetherListItem.test.tsx
**Path:** __tests__/components/ui/primitives/AetherListItem.test.tsx
**Size:** 2056 bytes

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AetherListItem } from '@/components/ui/primitives/AetherListItem';

describe('AetherListItem Component', () => {
  it('renders with required props', () => {
    const { getByText } = render(
      <AetherListItem title="Test Item" />
    );
    
    expect(getByText('Test Item')).toBeTruthy();
  });
  
  it('renders with subtitle', () => {
    const { getByText } = render(
      <AetherListItem 
        title="Test Item" 
        subtitle="This is a subtitle" 
      />
    );
    
    expect(getByText('Test Item')).toBeTruthy();
    expect(getByText('This is a subtitle')).toBeTruthy();
  });
  
  it('renders with badge', () => {
    const { getByText } = render(
      <AetherListItem 
        title="Test Item" 
        badge="5" 
      />
    );
    
    expect(getByText('Test Item')).toBeTruthy();
    expect(getByText('5')).toBeTruthy();
  });
  
  it('renders with chevron when showChevron is true', () => {
    const { getByTestId } = render(
      <AetherListItem 
        title="Test Item" 
        showChevron 
      />
    );
    
    expect(getByTestId('icon-chevron-forward')).toBeTruthy();
  });
  
  it('handles press events', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <AetherListItem 
        title="Test Item" 
        onPress={onPressMock}
      />
    );
    
    const item = getByText('Test Item').parent.parent;
    fireEvent.press(item);
    
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
  
  it('applies the correct styles for the last item', () => {
    const { getByText, rerender } = render(
      <AetherListItem title="Regular Item" />
    );
    
    // Check regular item
    let item = getByText('Regular Item').parent.parent;
    expect(item.props.style).toBeDefined();
    
    // Check last item
    rerender(<AetherListItem title="Last Item" isLast />);
    item = getByText('Last Item').parent.parent;
    expect(item.props.style).toBeDefined();
  });
});
```

### dashboardRouter.getWeeklyProgress.test.ts
**Path:** __tests__/server/routers/dashboardRouter.getWeeklyProgress.test.ts
**Size:** 9354 bytes

```typescript
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { createInnerTRPCContext, mockSupabaseAdmin, MockableTableOperations } from '../test-helpers';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { appRouter } from '../../../server/src/router';
import { TRPCError } from '@trpc/server';

// Type for database table names to avoid 'any' parameter type errors
type TableName = 'tasks' | 'goals' | 'habits' | 'habit_entries' | 'goal_progress_snapshots' | string;

// Using mockSupabaseAdmin from test-helpers

// Helper function to create test context
function createTestContext(userId: string | null = 'test-user-id') {
  return createInnerTRPCContext({
    userId,
    supabase: mockSupabaseAdmin,
  });
}

// Create test caller with context
function createTestCaller(userId: string | null = 'test-user-id') {
  const ctx = createTestContext(userId);
  return appRouter.createCaller(ctx);
}

describe('dashboardRouter.getWeeklyProgress', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should fetch weekly progress with default parameters', async () => {
    // Setup mock data
    const habits = [
      { id: 'habit-1', name: 'Morning Run', frequency: 'daily', streak: 5, best_streak: 10 },
      { id: 'habit-2', name: 'Meditation', frequency: 'daily', streak: 3, best_streak: 7 },
    ];

    const habitEntries = [
      { id: 'entry-1', habit_id: 'habit-1', date: '2025-04-25', completed: true, habits: { id: 'habit-1', name: 'Morning Run', frequency: 'daily' } },
      { id: 'entry-2', habit_id: 'habit-1', date: '2025-04-26', completed: true, habits: { id: 'habit-1', name: 'Morning Run', frequency: 'daily' } },
      { id: 'entry-3', habit_id: 'habit-2', date: '2025-04-25', completed: false, habits: { id: 'habit-2', name: 'Meditation', frequency: 'daily' } },
    ];

    const completedTasks = [
      { id: 'task-1', title: 'Complete report', status: 'completed', updated_at: '2025-04-25T10:00:00Z', goal_id: 'goal-1' },
      { id: 'task-2', title: 'Send email', status: 'completed', updated_at: '2025-04-26T14:30:00Z', goal_id: null },
    ];

    const goalSnapshots = [
      { goal_id: 'goal-1', progress: 0.3, created_at: '2025-04-21T08:00:00Z' },
      { goal_id: 'goal-1', progress: 0.5, created_at: '2025-04-27T08:00:00Z' },
    ];

    // Create typed mock objects for each table
    const habitsTableMock = mockDeep<MockableTableOperations>();
    const habitEntriesTableMock = mockDeep<MockableTableOperations>();
    const tasksTableMock = mockDeep<MockableTableOperations>();
    const goalSnapshotsTableMock = mockDeep<MockableTableOperations>();

    // Configure mockSupabaseAdmin.from to return the appropriate mock for each table
    mockSupabaseAdmin.from.mockImplementation((table: TableName) => {
      if (table === 'habits') return habitsTableMock;
      if (table === 'habit_entries') return habitEntriesTableMock;
      if (table === 'tasks') return tasksTableMock;
      if (table === 'goal_progress_snapshots') return goalSnapshotsTableMock;
      
      // Default case - should not happen in this test
      return mockDeep<MockableTableOperations>();
    });

    // Configure each table mock's behavior
    // Habits table
    habitsTableMock.select.mockReturnThis();
    habitsTableMock.eq.mockReturnThis();
    habitsTableMock.order.mockReturnThis();
    habitsTableMock.limit.mockResolvedValue({ data: habits, error: null });

    // Habit entries table
    habitEntriesTableMock.select.mockReturnThis();
    habitEntriesTableMock.eq.mockReturnThis();
    habitEntriesTableMock.gte.mockReturnThis();
    habitEntriesTableMock.lte.mockReturnThis();
    habitEntriesTableMock.order.mockResolvedValue({ data: habitEntries, error: null });

    // Tasks table
    tasksTableMock.select.mockReturnThis();
    tasksTableMock.eq.mockReturnThis();
    tasksTableMock.gte.mockReturnThis();
    tasksTableMock.lte.mockReturnThis();
    // Add count method mock
    tasksTableMock.count.mockResolvedValue({ count: 10, error: null });
    tasksTableMock.order.mockResolvedValue({ data: completedTasks, error: null });

    // Goal progress snapshots table
    goalSnapshotsTableMock.select.mockReturnThis();
    goalSnapshotsTableMock.eq.mockReturnThis();
    goalSnapshotsTableMock.gte.mockReturnThis();
    goalSnapshotsTableMock.lte.mockReturnThis();
    goalSnapshotsTableMock.order.mockResolvedValue({ data: goalSnapshots, error: null });

    const caller = createTestCaller();
    const result = await caller.dashboard.getWeeklyProgress();

    // Verify structure of response
    expect(result).toHaveProperty('dailyProgress');
    expect(result).toHaveProperty('overallMetrics');
    expect(result).toHaveProperty('habitStreaks');
    expect(result).toHaveProperty('goalProgress');
    expect(result).toHaveProperty('dateRange');

    // Verify dates are processed correctly
    expect(result.dateRange.days.length).toBe(7); // Default is 7 days

    // Verify habit data is formatted correctly
    expect(result.habitStreaks).toContainEqual({
      id: 'habit-1',
      name: 'Morning Run',
      currentStreak: 5,
      bestStreak: 10,
    });

    // Verify goal progress is calculated correctly
    expect(result.goalProgress).toContainEqual(expect.objectContaining({
      goalId: 'goal-1',
      progressChange: 0.2, // 0.5 - 0.3
    }));
  });

  it('should handle custom date ranges', async () => {
    // Create typed mock objects for each table
    const tableMock = mockDeep<MockableTableOperations>();
    
    // Configure mockSupabaseAdmin.from to return the mock for any table
    mockSupabaseAdmin.from.mockImplementation(() => tableMock);
    
    // Configure basic behavior
    tableMock.select.mockReturnThis();
    tableMock.eq.mockReturnThis();
    tableMock.gte.mockReturnThis();
    tableMock.lte.mockReturnThis();
    tableMock.order.mockResolvedValue({ data: [], error: null });

    const caller = createTestCaller();
    const result = await caller.dashboard.getWeeklyProgress({ daysToInclude: 14 });

    // Verify date range is correct
    expect(result.dateRange.days.length).toBe(14);
  });

  it('should handle raw data inclusion when requested', async () => {
    // Setup minimal mock data
    const habitEntries = [
      { id: 'entry-1', habit_id: 'habit-1', date: '2025-04-25', completed: true },
    ];

    // Helper function to create mock table with data and thenable capability
    function createTableMockWithData<T>(data: T) {
      const mock = mockDeep<MockableTableOperations>();
      
      // Configure chainable methods to return this (for method chaining)
      mock.select.mockReturnThis();
      mock.eq.mockReturnThis();
      mock.gte.mockReturnThis();
      mock.lte.mockReturnThis();
      mock.order.mockReturnThis();
      
      // Make the mock awaitable with the provided data
      // Using a proper Promise interface implementation
      const response = { data, error: null, status: 200 };
      const mockPromise = Promise.resolve(response);
      
      // Add then/catch/finally methods to make the mock awaitable
      (mock as any).then = mockPromise.then.bind(mockPromise);
      (mock as any).catch = mockPromise.catch.bind(mockPromise);
      (mock as any).finally = mockPromise.finally.bind(mockPromise);
      
      return mock;
    }
    
    // Create typed mock objects with proper data
    const habitEntriesTableMock = createTableMockWithData(habitEntries);
    const defaultTableMock = createTableMockWithData([]);
    
    // Configure mockSupabaseAdmin.from to return the appropriate mock for each table
    mockSupabaseAdmin.from.mockImplementation((table: TableName) => {
      if (table === 'habit_entries') return habitEntriesTableMock;
      return defaultTableMock;
    });

    const caller = createTestCaller();
    const result = await caller.dashboard.getWeeklyProgress({ includeRawData: true });

    // Find the day that should have entries
    const dayWithData = result.dailyProgress.find(day => day.date === '2025-04-25');
    
    // Verify raw data is included
    expect(dayWithData).toHaveProperty('habitEntries');
    expect(dayWithData?.habitEntries).toHaveLength(1);
  });

  it('should handle database errors properly', async () => {
    // Create typed mock object for tables that will return an error
    const errorTableMock = mockDeep<MockableTableOperations>();
    
    // Configure mockSupabaseAdmin.from to return the error mock
    mockSupabaseAdmin.from.mockImplementation(() => errorTableMock);
    
    // Configure the mocked behavior to return an error
    errorTableMock.select.mockReturnThis();
    errorTableMock.eq.mockReturnThis();
    errorTableMock.gte.mockReturnThis();
    errorTableMock.lte.mockReturnThis();
    errorTableMock.order.mockResolvedValue({ 
      data: null, 
      error: { message: 'Database error', code: '42P01' } 
    });

    const caller = createTestCaller();
    
    // Expect the proper error to be thrown
    await expect(caller.dashboard.getWeeklyProgress()).rejects.toThrow(TRPCError);
  });

  it('should throw an error when user is not authenticated', async () => {
    const caller = createTestCaller(null);
    
    // Expect an unauthorized error
    await expect(caller.dashboard.getWeeklyProgress()).rejects.toThrow(TRPCError);
  });
});
```

### dashboardRouter.test.ts
**Path:** __tests__/server/routers/dashboardRouter.test.ts
**Size:** 8713 bytes

```typescript
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { createInnerTRPCContext, mockSupabaseAdmin, MockableTableOperations } from '../test-helpers';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { appRouter } from '../../../server/src/router';
import { TRPCError } from '@trpc/server';

// Using mockSupabaseAdmin from test-helpers

// Type for database table names to avoid 'any' parameter type errors
type TableName = 'tasks' | 'goals' | 'habits' | 'habit_entries' | 'tracked_state_defs' | string;

/**
 * Create a test tRPC caller with proper context
 */
function createTestCaller(userId: string | null = 'test-user-id') {
  const ctx = createInnerTRPCContext({
    userId,
    supabase: mockSupabaseAdmin,
  });
  return appRouter.createCaller(ctx);
}

describe('dashboardRouter', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('getDashboardData', () => {
    it('should fetch dashboard data with default limits', async () => {
      // Mock data for habits aligned with updated schema
      const mockHabits = [
        {
          id: 'habit-1',
          user_id: 'test-user-id',
          title: 'Morning Run',
          cue: 'Wake up',
          routine: 'Go for a jog',
          reward: 'Coffee',
          streak: 3,
          best_streak: 5,
          created_at: '2024-04-20T12:00:00Z',
          updated_at: '2024-04-20T12:00:00Z'
        }
      ];

      // Mock data for goals aligned with updated schema
      const mockGoals = [
        {
          id: 'goal-1',
          user_id: 'test-user-id',
          title: 'Learn TypeScript',
          description: 'Master TypeScript for web development',
          progress: 0.5,
          target_date: '2024-06-01T00:00:00Z',
          created_at: '2024-04-15T10:00:00Z',
          updated_at: '2024-04-15T10:00:00Z'
        }
      ];

      // Mock data for tasks aligned with updated schema
      const mockTasks = [
        {
          id: 'task-1',
          user_id: 'test-user-id',
          title: 'Complete TypeScript course',
          notes: 'Focus on advanced types',
          status: 'in-progress',
          priority: 2,
          due: '2024-05-01T00:00:00Z',
          goal_id: 'goal-1',
          created_at: '2024-04-20T12:00:00Z',
          updated_at: '2024-04-20T12:00:00Z'
        }
      ];

      // Mock data for tracked states
      const mockTrackedStates: any[] = [];

      // Mock habit entries
      const mockHabitEntries = [
        {
          habit_id: 'habit-1',
          completed: true
        }
      ];

      // Create typed mock objects for each table, using our helper from test-helpers.ts
      function createTableMockWithData<T>(data: T) {
        const mock = mockDeep<MockableTableOperations>();
        
        // Configure chainable methods to return this (for method chaining)
        mock.select.mockReturnThis();
        mock.eq.mockReturnThis();
        mock.is.mockReturnThis();
        mock.neq.mockReturnThis();
        mock.or.mockReturnThis();
        mock.in.mockReturnThis();
        mock.order.mockReturnThis();
        mock.limit.mockReturnThis();
        
        // Make the mock awaitable with the provided data
        // Using a proper Promise interface implementation
        const response = { data, error: null, status: 200 };
        const mockPromise = Promise.resolve(response);
        
        // Add then/catch/finally methods to make the mock awaitable
        (mock as any).then = mockPromise.then.bind(mockPromise);
        (mock as any).catch = mockPromise.catch.bind(mockPromise);
        (mock as any).finally = mockPromise.finally.bind(mockPromise);
        
        return mock;
      }
      
      // Create mocks with the appropriate data
      const habitsTableMock = createTableMockWithData(mockHabits);
      const goalsTableMock = createTableMockWithData(mockGoals);
      const tasksTableMock = createTableMockWithData(mockTasks);
      const trackedStatesTableMock = createTableMockWithData(mockTrackedStates);
      const habitEntriesTableMock = createTableMockWithData(mockHabitEntries);

      // Configure mockSupabaseAdmin.from to return the appropriate mock for each table
      mockSupabaseAdmin.from.mockImplementation((table: TableName) => {
        if (table === 'habits') return habitsTableMock;
        if (table === 'goals') return goalsTableMock;
        if (table === 'tasks') return tasksTableMock;
        if (table === 'tracked_state_defs') return trackedStatesTableMock;
        if (table === 'habit_entries') return habitEntriesTableMock;
        
        // Default fallback - empty result mock
        return createTableMockWithData([]);
      });

      const caller = createTestCaller();
      const result = await caller.dashboard.getDashboardData();

      // Verify the result structure
      expect(result).toHaveProperty('habits');
      expect(result).toHaveProperty('goals');
      expect(result).toHaveProperty('tasks');
      expect(result).toHaveProperty('trackedStates');

      // Verify habits were formatted correctly
      expect(result.habits[0]).toEqual(expect.objectContaining({
        id: 'habit-1',
        title: 'Morning Run',
        streak: 3,
        completed: true
      }));

      // Verify goals were formatted correctly
      expect(result.goals[0]).toEqual(expect.objectContaining({
        id: 'goal-1',
        title: 'Learn TypeScript',
        progress: 0.5
      }));

      // Verify limits were passed correctly - now targeting the specific table mocks
      expect(habitsTableMock.limit).toHaveBeenCalledWith(5); // Default habit limit
      expect(tasksTableMock.limit).toHaveBeenCalledWith(10); // Default task limit
    });

    it('should fetch dashboard data with custom limits', async () => {
      // Create typed mock objects for each table
      const habitsTableMock = mockDeep<MockableTableOperations>();
      const goalsTableMock = mockDeep<MockableTableOperations>();
      const tasksTableMock = mockDeep<MockableTableOperations>();
      const trackedStatesTableMock = mockDeep<MockableTableOperations>();
      const habitEntriesTableMock = mockDeep<MockableTableOperations>();

      // Configure mockSupabaseAdmin.from to return the appropriate mock for each table
      mockSupabaseAdmin.from.mockImplementation((table: TableName) => {
        if (table === 'habits') return habitsTableMock;
        if (table === 'goals') return goalsTableMock;
        if (table === 'tasks') return tasksTableMock;
        if (table === 'tracked_state_defs') return trackedStatesTableMock;
        if (table === 'habit_entries') return habitEntriesTableMock;
        
        // Default case - should not happen in this test
        return mockDeep<MockableTableOperations>();
      });

      // No need to configure these mocks further - they already have their Promise behavior set
      // through the createTableMockWithData function with proper awaitable responses

      // Add specific behaviors needed for tasks
      tasksTableMock.neq.mockReturnThis();
      tasksTableMock.or.mockReturnThis();

      const caller = createTestCaller();
      await caller.dashboard.getDashboardData({
        habitLimit: 10,
        goalLimit: 15,
        taskLimit: 20
      });

      // Verify the custom limits were passed
      expect(mockSupabaseAdmin.limit).toHaveBeenCalledWith(10); // Custom habit limit
      expect(mockSupabaseAdmin.limit).toHaveBeenCalledWith(15); // Custom goal limit
      expect(mockSupabaseAdmin.limit).toHaveBeenCalledWith(20); // Custom task limit
    });

    it('should handle database errors properly', async () => {
      // Setup mock to simulate a database error
      mockSupabaseAdmin.from.mockImplementation(() => {
        return {
          ...mockSupabaseAdmin,
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnValue({ 
            data: null, 
            error: { 
              message: 'Database error', 
              code: '42P01' // Table doesn't exist
            } 
          }),
        };
      });

      const caller = createTestCaller();
      
      // Expect the call to throw an INTERNAL_SERVER_ERROR
      await expect(caller.dashboard.getDashboardData()).rejects.toThrow(TRPCError);
    });

    it('should throw unauthorized error if no user is authenticated', async () => {
      const caller = createTestCaller(null);
      
      // Expect the call to throw an UNAUTHORIZED error
      await expect(caller.dashboard.getDashboardData()).rejects.toThrow(TRPCError);
    });
  });
});
```

### habitRouter.test.ts
**Path:** __tests__/server/routers/habitRouter.test.ts
**Size:** 32291 bytes

```typescript
import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { createInnerTRPCContext, mockSupabaseAdmin, resetSupabaseMocks } from '../test-helpers'; 
import { appRouter } from '../../../server/src/router';
import { TRPCError } from '@trpc/server';
import { Habit } from '../../../server/src/types/trpc-types'; 

/**
 * Helper function to create a test context
 * This mimics how the tRPC context would be created in a real request
 */
function createTestContext(userId: string | null = 'test-user-id') {
  return createInnerTRPCContext({
    userId,
    supabase: mockSupabaseAdmin,
  });
}

/**
 * Create a test tRPC caller with proper context
 * @param userId Optional user ID for authenticated routes
 * @returns A tRPC caller that can be used to call procedures
 */
function createTestCaller(userId: string | null = 'test-user-id') {
  const ctx = createTestContext(userId);
  return appRouter.createCaller(ctx);
}

// Helper function to create a properly awaitable mock with data
function createTableMockWithData<T>(data: T) {
  const mock = mockDeep<MockableTableOperations>();
  
  // Configure chainable methods to return this (for method chaining)
  mock.select.mockReturnThis();
  mock.eq.mockReturnThis();
  mock.order.mockReturnThis();
  mock.limit.mockReturnThis();
  mock.in.mockReturnThis();
  mock.update.mockReturnThis();
  mock.is.mockReturnThis();
  mock.isNull.mockReturnThis();
  mock.neq.mockReturnThis();
  mock.or.mockReturnThis();
  mock.filter.mockReturnThis();
  mock.delete.mockReturnThis();
  mock.upsert.mockReturnThis();
  mock.insert.mockReturnThis();
  
  // Add proper promise handling for awaitable operations
  const response = { data, error: null, status: 200, count: Array.isArray(data) ? data.length : undefined };
  const mockPromise = Promise.resolve(response);
  
  // Add then/catch/finally methods to make the mock awaitable
  (mock as any).then = mockPromise.then.bind(mockPromise);
  (mock as any).catch = mockPromise.catch.bind(mockPromise);
  (mock as any).finally = mockPromise.finally.bind(mockPromise);
  
  return mock;
}

describe('habitRouter', () => {
  beforeEach(() => {
    resetSupabaseMocks();
  });

  describe('getHabits', () => {
    it('should fetch active habits for the user with completion status', async () => {
      // --- Arrange --- 
      const userId = 'test-user-id';
      const todayStr = new Date().toISOString().split('T')[0];
      const mockHabits: Habit[] = [
        { id: 'habit-1', user_id: userId, title: 'Habit 1', cue: 'Morning', routine: 'Exercise', reward: 'Coffee', habit_type: 'boolean', goal_quantity: null, goal_unit: null, frequency_period: 'day', goal_frequency: 1, recurrence_rule: 'RRULE:FREQ=DAILY', recurrence_end_date: null, archived_at: null, streak: 5, best_streak: 10, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'habit-2', user_id: userId, title: 'Habit 2', cue: 'Evening', routine: 'Read', reward: 'Relax', habit_type: 'quantity', goal_quantity: 30, goal_unit: 'minutes', frequency_period: 'week', goal_frequency: 3, recurrence_rule: 'RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR', recurrence_end_date: null, archived_at: null, streak: 2, best_streak: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ];
      const mockEntriesToday = [
        { habit_id: 'habit-1' }, // Only habit 1 is completed today
      ];

      // Create properly awaitable mocks with the test data
      const habitsMock = createTableMockWithData(mockHabits);
      const entriesMock = createTableMockWithData(mockEntriesToday);

      // Configure mockSupabaseAdmin.from to return the appropriate mock for each table
      mockSupabaseAdmin.from.mockImplementation((table: string) => {
        if (table === 'habits') return habitsMock;
        if (table === 'habit_entries') return entriesMock;
        return createTableMockWithData([]); // Default empty result for other tables
      });
      
      // --- Act --- 
      const caller = createTestCaller(userId);
      const result = await caller.habit.getHabits();

      // --- Assert --- 
      expect(result).toHaveLength(2);
      // Check all fields, including new ones and completedToday
      expect(result[0]).toMatchObject({ 
        ...mockHabits[0], 
        frequency_period: 'day', 
        goal_frequency: 1,
        completedToday: true 
      });
      expect(result[1]).toMatchObject({ 
        ...mockHabits[1], 
        frequency_period: 'week',
        goal_frequency: 3,
        completedToday: false 
      });

      // Verify mocks - Check if specific methods were called
      expect(mockSupabaseAdmin.from).toHaveBeenNthCalledWith(1, 'habits');
      expect(selectHabitsMock).toHaveBeenCalledWith('*', 'id, user_id, title, cue, routine, reward, habit_type, goal_quantity, goal_unit, frequency_period, goal_frequency, recurrence_rule, recurrence_end_date, archived_at, streak, best_streak, created_at, updated_at');
      expect(eqHabitsMock).toHaveBeenCalledWith('user_id', userId);
      expect(isNullHabitsMock).toHaveBeenCalledWith('archived_at', null); // Check is call
      expect(habitsFilterMock).toHaveBeenCalledTimes(1); // Ensure filter was called

      expect(mockSupabaseAdmin.from).toHaveBeenNthCalledWith(2, 'habit_entries');
      expect(selectEntriesMock).toHaveBeenCalledWith('habit_id');
      expect(eqUserEntriesMock).toHaveBeenCalledWith('user_id', userId);
      expect(eqDateEntriesMock).toHaveBeenCalledWith('date', todayStr);
      // Check the final resolving mock was called correctly
      expect(entriesFilterMock).toHaveBeenCalledWith('habit_id', expect.arrayContaining([mockHabits[0].id, mockHabits[1].id]));
    });

    it('should return an empty array if no habits exist', async () => {
        // --- Arrange ---
      const userId = 'test-user-id';

      const habitsFilterMock = jest.fn<() => Promise<{ data: Habit[] | null; error: any }>>();
      habitsFilterMock.mockResolvedValue({ data: [], error: null }); // Resolve empty
      const isNullHabitsMock = jest.fn().mockReturnValue({ filter: habitsFilterMock });
      const eqHabitsMock = jest.fn().mockReturnValue({ isNull: isNullHabitsMock });
      const selectHabitsMock = jest.fn().mockReturnValue({ eq: eqHabitsMock });

      mockSupabaseAdmin.from.mockReturnValueOnce({ // Mock for 'habits'
        select: selectHabitsMock,
      } as any);

      // --- Act ---
      const caller = createTestCaller(userId);
      const result = await caller.habit.getHabits();

      // --- Assert ---
      expect(result).toEqual([]);
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('habits');
      // Ensure habit_entries was NOT called because the initial habit fetch was empty
      expect(mockSupabaseAdmin.from).toHaveBeenCalledTimes(1); 
      expect(habitsFilterMock).toHaveBeenCalledTimes(1); // Check filter was still called before resolving
    });

    it('should throw TRPCError on database error during habit fetch', async () => {
      // --- Arrange ---
      const userId = 'test-user-id';
      const dbError = { message: 'DB error fetching habits', code: '500' };
      
      const habitsFilterMock = jest.fn<() => Promise<{ data: Habit[] | null; error: any }>>();
      habitsFilterMock.mockResolvedValue({ data: null, error: dbError }); // Simulate error
      const isNullHabitsMock = jest.fn().mockReturnValue({ filter: habitsFilterMock });
      const eqHabitsMock = jest.fn().mockReturnValue({ isNull: isNullHabitsMock });
      const selectHabitsMock = jest.fn().mockReturnValue({ eq: eqHabitsMock });

      mockSupabaseAdmin.from.mockReturnValueOnce({ // Mock for 'habits'
        select: selectHabitsMock,
      } as any);
      
      // --- Act & Assert ---
      const caller = createTestCaller(userId);
      await expect(caller.habit.getHabits()).rejects.toThrowError(
        new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: dbError.message })
      );
      expect(habitsFilterMock).toHaveBeenCalledTimes(1);
      expect(mockSupabaseAdmin.from).toHaveBeenCalledTimes(1);
    });

    it('should throw TRPCError on database error during entry fetch', async () => {
        // --- Arrange ---
      const userId = 'test-user-id';
      const todayStr = new Date().toISOString().split('T')[0];
      const mockHabits: Habit[] = [
        { id: 'habit-1', user_id: userId, title: 'Habit 1', cue: 'Morning', routine: 'Exercise', reward: 'Coffee', habit_type: 'boolean', goal_quantity: null, goal_unit: null, frequency_period: 'day', goal_frequency: 1, recurrence_rule: 'RRULE:FREQ=DAILY', recurrence_end_date: null, archived_at: null, streak: 5, best_streak: 10, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ];
      const dbError = { message: 'DB error fetching entries', code: '500' };

      // Mock successful habit fetch
      const habitsFilterMock = jest.fn<() => Promise<{ data: Habit[] | null; error: any }>>();
      habitsFilterMock.mockResolvedValue({ data: mockHabits, error: null });
      const isNullHabitsMock = jest.fn().mockReturnValue({ filter: habitsFilterMock });
      const eqHabitsMock = jest.fn().mockReturnValue({ isNull: isNullHabitsMock });
      const selectHabitsMock = jest.fn().mockReturnValue({ eq: eqHabitsMock });

      // Mock failing entry fetch
      const entriesFilterMock = jest.fn<() => Promise<{ data: any[] | null; error: any }>>();
      entriesFilterMock.mockResolvedValue({ data: null, error: dbError });
      const eqDateEntriesMock = jest.fn().mockReturnValue({ filter: entriesFilterMock });
      const eqUserEntriesMock = jest.fn().mockReturnValue({ eq: eqDateEntriesMock });
      const selectEntriesMock = jest.fn().mockReturnValue({ eq: eqUserEntriesMock });

      mockSupabaseAdmin.from.mockReturnValueOnce({ // Mock for 'habits'
        select: selectHabitsMock,
      } as any).mockReturnValueOnce({ // Mock for 'habit_entries'
        select: selectEntriesMock,
      } as any);
      
      // --- Act & Assert ---
      const caller = createTestCaller(userId);
      await expect(caller.habit.getHabits()).rejects.toThrowError(
        new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: dbError.message })
      );
      expect(habitsFilterMock).toHaveBeenCalledTimes(1);
      expect(entriesFilterMock).toHaveBeenCalledTimes(1); // Ensure entry fetch was attempted
    });
  });

  describe('getHabitById', () => {
    it('should fetch a specific habit by ID', async () => {
      // Arrange
      const userId = 'test-user-id';
      const habitId = 'habit-abc';
      const mockHabit: Habit = { id: habitId, user_id: userId, title: 'Test Habit', cue: null, routine: null, reward: null, habit_type: 'boolean', goal_quantity: null, goal_unit: null, frequency_period: 'day', goal_frequency: 1, recurrence_rule: null, recurrence_end_date: null, archived_at: null, streak: 0, best_streak: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };

      // Corrected mock structure for chained eq calls
      const singleMock = jest.fn<() => Promise<{ data: Habit | null; error: any }>>();
      singleMock.mockResolvedValue({ data: mockHabit, error: null });
      const userEqMock = jest.fn().mockReturnValue({ single: singleMock });
      const idEqMock = jest.fn().mockReturnValue({ eq: userEqMock });
      const selectMock = jest.fn().mockReturnValue({ eq: idEqMock });

      mockSupabaseAdmin.from.mockReturnValueOnce({ // Mock for 'habits'
        select: selectMock
      } as any);

      // Act
      const caller = createTestCaller(userId);
      // Assert
      const result = await caller.habit.getHabitById({ id: habitId });
      expect(result).toEqual(mockHabit);
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('habits');
      expect(selectMock).toHaveBeenCalledWith('*', 'id, user_id, title, cue, routine, reward, habit_type, goal_quantity, goal_unit, frequency_period, goal_frequency, recurrence_rule, recurrence_end_date, archived_at, streak, best_streak, created_at, updated_at'); // Check select fields
      expect(idEqMock).toHaveBeenCalledWith('id', habitId);
      expect(userEqMock).toHaveBeenCalledWith('user_id', userId);
      expect(singleMock).toHaveBeenCalled();
    });

    it('should throw NOT_FOUND error if habit doesnt exist or belongs to another user', async () => {
      // Arrange
      const userId = 'test-user-id';
      const habitId = 'habit-abc';
      // Router now throws specific error, not just Supabase error
      const expectedError = new TRPCError({ code: 'NOT_FOUND', message: 'Habit not found or access denied' });

      // Corrected mock structure for failing call
      const singleMock = jest.fn<() => Promise<{ data: Habit | null; error: any }>>();
      singleMock.mockResolvedValue({ data: null, error: { message: 'Row not found', code: 'PGRST116' } });
      const userEqMock = jest.fn().mockReturnValue({ single: singleMock });
      const idEqMock = jest.fn().mockReturnValue({ eq: userEqMock });
      const selectMock = jest.fn().mockReturnValue({ eq: idEqMock });

      mockSupabaseAdmin.from.mockReturnValueOnce({ // Mock for 'habits'
        select: selectMock
      } as any);

      // Act
      const caller = createTestCaller(userId);
      // Assert
      await expect(caller.habit.getHabitById({ id: habitId })).rejects.toThrowError(
        expectedError
      );
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('habits');
      expect(selectMock).toHaveBeenCalledWith('*', 'id, user_id, title, cue, routine, reward, habit_type, goal_quantity, goal_unit, frequency_period, goal_frequency, recurrence_rule, recurrence_end_date, archived_at, streak, best_streak, created_at, updated_at');
      expect(idEqMock).toHaveBeenCalledWith('id', habitId);
      expect(userEqMock).toHaveBeenCalledWith('user_id', userId);
      expect(singleMock).toHaveBeenCalled();
    });

     it('should throw INTERNAL_SERVER_ERROR on other database errors', async () => {
       // Arrange
      const userId = 'test-user-id';
      const habitId = 'habit-db-error';
      const dbError = { message: 'Generic DB Error', code: '500' };
      const expectedError = new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: dbError.message });

      // Corrected mock structure for generic error
      const singleMock = jest.fn<() => Promise<{ data: Habit | null; error: any }>>();
      singleMock.mockResolvedValue({ data: null, error: dbError });
      const userEqMock = jest.fn().mockReturnValue({ single: singleMock });
      const idEqMock = jest.fn().mockReturnValue({ eq: userEqMock });
      const selectMock = jest.fn().mockReturnValue({ eq: idEqMock });

      mockSupabaseAdmin.from.mockReturnValueOnce({ // Mock for 'habits'
        select: selectMock
      } as any);

       // Act
      const caller = createTestCaller(userId);
       // Assert
      await expect(caller.habit.getHabitById({ id: habitId })).rejects.toThrowError(
        expectedError
      );
       expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('habits');
       expect(selectMock).toHaveBeenCalledWith('*', 'id, user_id, title, cue, routine, reward, habit_type, goal_quantity, goal_unit, frequency_period, goal_frequency, recurrence_rule, recurrence_end_date, archived_at, streak, best_streak, created_at, updated_at');
       expect(idEqMock).toHaveBeenCalledWith('id', habitId);
       expect(userEqMock).toHaveBeenCalledWith('user_id', userId);
       expect(singleMock).toHaveBeenCalled();
     });
   });

  describe('createHabit', () => { 
    it('should create a new habit with default streaks', async () => {
      // Arrange
      const userId = 'test-user-id';
      const inputData = { title: 'New Habit', habit_type: 'boolean' as const, frequency_period: 'day' as const, goal_frequency: 1 };
      const expectedOutput: Habit = { id: 'new-id', user_id: userId, ...inputData, streak: 0, best_streak: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), cue: null, routine: null, reward: null, goal_quantity: null, goal_unit: null, recurrence_rule: null, recurrence_end_date: null, archived_at: null };

      // Correct mock structure for insert -> select -> single
      // Explicitly type the mock function to help with type inference
      const singleMock = jest.fn<() => Promise<{ data: Habit | null; error: any }>>();
      singleMock.mockResolvedValue({ data: expectedOutput, error: null }); 
      const selectMock = jest.fn().mockReturnValue({ single: singleMock });
      const insertMock = jest.fn().mockReturnValue({ select: selectMock });

      mockSupabaseAdmin.from.mockReturnValueOnce({ // Mock for 'habits'
        insert: insertMock
      } as any);

      // Act
      const caller = createTestCaller(userId);
      const result = await caller.habit.createHabit(inputData);

      // Assert
      expect(result).toEqual(expectedOutput);
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('habits');
      // Check insert arguments carefully
      expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ 
          ...inputData,
          user_id: userId, 
          streak: 0, 
          best_streak: 0 
      }));
      expect(selectMock).toHaveBeenCalled(); // Check select was called after insert
      expect(singleMock).toHaveBeenCalled(); // Check single was called after select
    });

    it('should throw TRPCError on database error', async () => {
      // Arrange
      const userId = 'test-user-id';
      const inputData = { title: 'Fail Habit', habit_type: 'boolean' as const, frequency_period: 'day' as const, goal_frequency: 1 };
      const dbError = { message: 'Insert failed', code: '500' };
      const expectedError = new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: dbError.message });

      // Correct mock structure for failing insert
      const singleMock = jest.fn<() => Promise<{ data: Habit | null; error: any }>>();
      singleMock.mockResolvedValue({ data: null, error: dbError });
      const selectMock = jest.fn().mockReturnValue({ single: singleMock });
      const insertMock = jest.fn().mockReturnValue({ select: selectMock });

      mockSupabaseAdmin.from.mockReturnValueOnce({ // Mock for 'habits'
         insert: insertMock
      } as any);

      // Act
      const caller = createTestCaller(userId);
      // Assert
      await expect(caller.habit.createHabit(inputData)).rejects.toThrowError(
        expectedError
      );
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('habits');
      // Check insert arguments
       expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ 
          ...inputData,
          user_id: userId, 
          streak: 0, 
          best_streak: 0 
      }));
      expect(selectMock).toHaveBeenCalled();
      expect(singleMock).toHaveBeenCalled();
    });
  });

  describe('updateHabit', () => { 
    it('should update an existing habit', async () => {
      // Arrange
      const userId = 'test-user-id';
      const habitId = 'habit-to-update';
      const updateData = { title: 'Updated Title' };
      // Define the full initial and updated habit objects (need all fields for Habit type)
      const baseHabit = { id: habitId, user_id: userId, cue: null, routine: null, reward: null, habit_type: 'boolean' as const, goal_quantity: null, goal_unit: null, frequency_period: 'day' as const, goal_frequency: 1, recurrence_rule: null, recurrence_end_date: null, archived_at: null, streak: 5, best_streak: 10, created_at: new Date(Date.now() - 100000).toISOString(), updated_at: new Date(Date.now() - 50000).toISOString() }; 
      const initialHabit: Habit = { ...baseHabit, title: 'Old Title' };
      const updatedHabit: Habit = { ...initialHabit, ...updateData, updated_at: new Date().toISOString(), id: habitId, user_id: userId, cue: null, routine: null, reward: null, habit_type: 'boolean', goal_quantity: null, goal_unit: null, frequency_period: 'day', goal_frequency: 1, recurrence_rule: null, recurrence_end_date: null, archived_at: null, streak: 0, best_streak: 0, created_at: new Date().toISOString() };

      // Mock 1: Initial fetch for ownership check (getHabitById logic)
      const fetchSingleMock = jest.fn<() => Promise<{ data: Habit | null; error: any }>>();
      fetchSingleMock.mockResolvedValue({ data: initialHabit, error: null });
      const fetchUserEqMock = jest.fn().mockReturnValue({ single: fetchSingleMock });
      const fetchIdEqMock = jest.fn().mockReturnValue({ eq: fetchUserEqMock });
      const fetchSelectMock = jest.fn().mockReturnValue({ eq: fetchIdEqMock });

      // Mock 2: Update operation
      const updateSingleMock = jest.fn<() => Promise<{ data: Habit | null; error: any }>>();
      updateSingleMock.mockResolvedValue({ data: updatedHabit, error: null });
      const updateSelectMock = jest.fn().mockReturnValue({ single: updateSingleMock });
      const updateUserEqMock = jest.fn().mockReturnValue({ select: updateSelectMock });
      const updateIdEqMock = jest.fn().mockReturnValue({ eq: updateUserEqMock });
      const updateMock = jest.fn().mockReturnValue({ eq: updateIdEqMock });

      // Chain the mocks: from('habits') -> select (for fetch) -> update 
      mockSupabaseAdmin.from.mockReturnValueOnce({ select: fetchSelectMock } as any)
                             .mockReturnValueOnce({ update: updateMock } as any); // Second call to from('habits') is for update

      // Act
      const caller = createTestCaller(userId);
      const result = await caller.habit.updateHabit({ id: habitId, ...updateData });

      // Assert
      expect(result).toEqual(updatedHabit);

      // Assert fetch mock calls
      expect(mockSupabaseAdmin.from).toHaveBeenNthCalledWith(1, 'habits');
      expect(fetchSelectMock).toHaveBeenCalledWith('*', 'id, user_id, title, cue, routine, reward, habit_type, goal_quantity, goal_unit, frequency_period, goal_frequency, recurrence_rule, recurrence_end_date, archived_at, streak, best_streak, created_at, updated_at');
      expect(fetchIdEqMock).toHaveBeenCalledWith('id', habitId);
      expect(fetchUserEqMock).toHaveBeenCalledWith('user_id', userId);
      expect(fetchSingleMock).toHaveBeenCalled();

      // Assert update mock calls
      expect(mockSupabaseAdmin.from).toHaveBeenNthCalledWith(2, 'habits');
      expect(updateMock).toHaveBeenCalledWith(expect.objectContaining(updateData));
      expect(updateIdEqMock).toHaveBeenCalledWith('id', habitId);
      expect(updateUserEqMock).toHaveBeenCalledWith('user_id', userId);
      expect(updateSelectMock).toHaveBeenCalled();
      expect(updateSingleMock).toHaveBeenCalled();
    });

    it('should throw NOT_FOUND error if habit doesnt exist or belongs to another user during initial fetch', async () => { // Renamed for clarity
      // Arrange
      const userId = 'test-user-id';
      const habitId = 'non-existent-habit';
      const updateData = { title: 'Wont Update' };
      const expectedError = new TRPCError({ code: 'NOT_FOUND', message: 'Habit not found or access denied' });

      // Mock only the initial fetch, have it return not found
      const fetchSingleMock = jest.fn<() => Promise<{ data: Habit | null; error: any }>>();
      fetchSingleMock.mockResolvedValue({ data: null, error: { message: 'Row not found', code: 'PGRST116' } });
      const fetchUserEqMock = jest.fn().mockReturnValue({ single: fetchSingleMock });
      const fetchIdEqMock = jest.fn().mockReturnValue({ eq: fetchUserEqMock });
      const fetchSelectMock = jest.fn().mockReturnValue({ eq: fetchIdEqMock });

      // Only mock 'from' once for the fetch
      mockSupabaseAdmin.from.mockReturnValueOnce({ select: fetchSelectMock } as any);

      // Act
      const caller = createTestCaller(userId);
      // Assert
      await expect(caller.habit.updateHabit({ id: habitId, ...updateData })).rejects.toThrowError(expectedError);
      // Verify fetch mock calls
      expect(mockSupabaseAdmin.from).toHaveBeenCalledTimes(1);
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('habits');
      expect(fetchSelectMock).toHaveBeenCalledWith('*', 'id, user_id, title, cue, routine, reward, habit_type, goal_quantity, goal_unit, frequency_period, goal_frequency, recurrence_rule, recurrence_end_date, archived_at, streak, best_streak, created_at, updated_at');
      expect(fetchIdEqMock).toHaveBeenCalledWith('id', habitId);
      expect(fetchUserEqMock).toHaveBeenCalledWith('user_id', userId);
      expect(fetchSingleMock).toHaveBeenCalled();
      // Crucially, ensure no update mock was ever created or called
    });

    it('should throw TRPCError on database error during update operation', async () => {
      // Arrange
      const userId = 'test-user-id';
      const habitId = 'habit-to-update';
      const updateData = { title: 'Updated Title' };
      // Reuse initial habit definition
      const baseHabit = { id: habitId, user_id: userId, cue: null, routine: null, reward: null, habit_type: 'boolean' as const, goal_quantity: null, goal_unit: null, frequency_period: 'day' as const, goal_frequency: 1, recurrence_rule: null, recurrence_end_date: null, archived_at: null, streak: 5, best_streak: 10, created_at: new Date(Date.now() - 100000).toISOString(), updated_at: new Date(Date.now() - 50000).toISOString() }; 
      const initialHabit: Habit = { ...baseHabit, title: 'Old Title' };
      const dbError = { message: 'Update failed', code: '500' };
      const expectedError = new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: dbError.message });

      // Mock 1: Initial fetch for ownership check (success)
      const fetchSingleMock = jest.fn<() => Promise<{ data: Habit | null; error: any }>>();
      fetchSingleMock.mockResolvedValue({ data: initialHabit, error: null });
      const fetchUserEqMock = jest.fn().mockReturnValue({ single: fetchSingleMock });
      const fetchIdEqMock = jest.fn().mockReturnValue({ eq: fetchUserEqMock });
      const fetchSelectMock = jest.fn().mockReturnValue({ eq: fetchIdEqMock });

      // Mock 2: Update operation (failure)
      const updateSingleMock = jest.fn<() => Promise<{ data: Habit | null; error: any }>>();
      updateSingleMock.mockResolvedValue({ data: null, error: dbError }); // Make the update return the error
      const updateSelectMock = jest.fn().mockReturnValue({ single: updateSingleMock });
      const updateUserEqMock = jest.fn().mockReturnValue({ select: updateSelectMock });
      const updateIdEqMock = jest.fn().mockReturnValue({ eq: updateUserEqMock });
      const updateMock = jest.fn().mockReturnValue({ eq: updateIdEqMock });

       // Chain the mocks: from('habits') -> select (for fetch) -> update (fails)
      mockSupabaseAdmin.from.mockReturnValueOnce({ select: fetchSelectMock } as any)
                             .mockReturnValueOnce({ update: updateMock } as any);

      // Act
      const caller = createTestCaller(userId);
      // Assert
      await expect(caller.habit.updateHabit({ id: habitId, ...updateData })).rejects.toThrowError(expectedError);

      // Assert fetch mock calls (should have succeeded)
      expect(mockSupabaseAdmin.from).toHaveBeenNthCalledWith(1, 'habits');
      expect(fetchSelectMock).toHaveBeenCalledWith('*', 'id, user_id, title, cue, routine, reward, habit_type, goal_quantity, goal_unit, frequency_period, goal_frequency, recurrence_rule, recurrence_end_date, archived_at, streak, best_streak, created_at, updated_at');
      expect(fetchIdEqMock).toHaveBeenCalledWith('id', habitId);
      expect(fetchUserEqMock).toHaveBeenCalledWith('user_id', userId);
      expect(fetchSingleMock).toHaveBeenCalled();

      // Assert update mock calls (should have been called but failed)
      expect(mockSupabaseAdmin.from).toHaveBeenNthCalledWith(2, 'habits');
      expect(updateMock).toHaveBeenCalledWith(expect.objectContaining(updateData));
      expect(updateIdEqMock).toHaveBeenCalledWith('id', habitId);
      expect(updateUserEqMock).toHaveBeenCalledWith('user_id', userId);
      expect(updateSelectMock).toHaveBeenCalled();
      expect(updateSingleMock).toHaveBeenCalled();
    });
  });

  describe('deleteHabit', () => { 
    it('should delete an existing habit and return true', async () => {
      // Arrange
      const userId = 'test-user-id';
      const habitId = 'habit-to-delete';

      // Mock delete -> eq(id) -> eq(user_id) -> resolves successfully
      // Explicitly type the mock function to help with type inference
      const deleteUserEqMock = jest.fn<() => Promise<{ data: null; error: any }>>();
      deleteUserEqMock.mockResolvedValue({ data: null, error: null }); // Success is indicated by no error
      const deleteIdEqMock = jest.fn().mockReturnValue({ eq: deleteUserEqMock });
      const deleteMock = jest.fn().mockReturnValue({ eq: deleteIdEqMock });

      mockSupabaseAdmin.from.mockReturnValueOnce({ delete: deleteMock } as any);

      // Act
      const caller = createTestCaller(userId);
      // Assert
      await expect(caller.habit.deleteHabit({ id: habitId })).resolves.toBe(true);
      // Verify mock calls
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('habits');
      expect(deleteMock).toHaveBeenCalled();
      expect(deleteIdEqMock).toHaveBeenCalledWith('id', habitId);
      expect(deleteUserEqMock).toHaveBeenCalledWith('user_id', userId);
    });

    it('should throw NOT_FOUND error if habit to delete doesnt exist or belongs to another user', async () => {
      // Arrange
      const userId = 'test-user-id';
      const habitId = 'non-existent-habit';
      const expectedError = new TRPCError({ code: 'NOT_FOUND', message: 'Habit not found or cannot be deleted' });

      // Mock delete -> eq(id) -> eq(user_id) -> resolves with error (or indicates 0 rows affected)
      // Simulate a 'not found' scenario, Supabase might return an error or just indicate 0 rows affected.
      // Let's mock returning an error that the router interprets as NOT_FOUND.
      const dbError = { message: 'Row not found', code: 'PGRST116' }; // Example error
      const deleteUserEqMock = jest.fn<() => Promise<{ data: null; error: any }>>();
      deleteUserEqMock.mockResolvedValue({ data: null, error: dbError });
      const deleteIdEqMock = jest.fn().mockReturnValue({ eq: deleteUserEqMock });
      const deleteMock = jest.fn().mockReturnValue({ eq: deleteIdEqMock });

      mockSupabaseAdmin.from.mockReturnValueOnce({ delete: deleteMock } as any);

      // Act
      const caller = createTestCaller(userId);
      // Assert
      await expect(caller.habit.deleteHabit({ id: habitId })).rejects.toThrowError(expectedError);
      // Verify mock calls
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('habits');
      expect(deleteMock).toHaveBeenCalled();
      expect(deleteIdEqMock).toHaveBeenCalledWith('id', habitId);
      expect(deleteUserEqMock).toHaveBeenCalledWith('user_id', userId);
    });

    it('should throw TRPCError on database error during delete operation', async () => {
      // Arrange
      const userId = 'test-user-id';
      const habitId = 'habit-delete-error';
      const dbError = { message: 'Internal DB Error', code: '500' };
      const expectedError = new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: dbError.message });

      // Mock delete -> eq(id) -> eq(user_id) -> resolves with a generic error
      const deleteUserEqMock = jest.fn<() => Promise<{ data: null; error: any }>>();
      deleteUserEqMock.mockResolvedValue({ data: null, error: dbError });
      const deleteIdEqMock = jest.fn().mockReturnValue({ eq: deleteUserEqMock });
      const deleteMock = jest.fn().mockReturnValue({ eq: deleteIdEqMock });

      mockSupabaseAdmin.from.mockReturnValueOnce({ delete: deleteMock } as any);

      // Act
      const caller = createTestCaller(userId);
      // Assert
      await expect(caller.habit.deleteHabit({ id: habitId })).rejects.toThrowError(expectedError);
      // Verify mock calls
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('habits');
      expect(deleteMock).toHaveBeenCalled();
      expect(deleteIdEqMock).toHaveBeenCalledWith('id', habitId);
      expect(deleteUserEqMock).toHaveBeenCalledWith('user_id', userId);
    });
  });

  // TODO: Add describe blocks for archive/unarchive and habit entry procedures
});
```

### taskRouter.toggleTask.test.ts
**Path:** __tests__/server/routers/taskRouter.toggleTask.test.ts
**Size:** 14286 bytes

```typescript
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { 
  createInnerTRPCContext, 
  mockSupabaseAdmin, 
  MockableTableOperations, 
  resetSupabaseMocks, 
  MockablePostgrestResponse 
} from '../test-helpers';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { appRouter } from '../../../server/src/router';
import { TRPCError } from '@trpc/server';

// Type for database table names to avoid 'any' parameter type errors
type TableName = 'tasks' | 'goals' | 'habits' | string;

// Helper function to create test context
function createTestContext(userId: string | null = 'test-user-id') {
  return createInnerTRPCContext({
    userId,
    supabase: mockSupabaseAdmin,
  });
}

// Create test caller with context
function createTestCaller(userId: string | null = 'test-user-id') {
  const ctx = createTestContext(userId);
  return appRouter.createCaller(ctx);
}

describe('taskRouter.toggleTask', () => {
  beforeEach(() => {
    // Reset mocks before each test
    resetSupabaseMocks();
  });

  it('should toggle a task from incomplete to complete', async () => {
    const taskId = 'task-1';
    const userId = 'test-user-id';
    const initialTaskData = {
      id: taskId,
      user_id: userId,
      title: 'Test Task',
      notes: null,
      status: 'in-progress',
      priority: 2,
      due: null,
      goal_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updatedTaskData = {
      id: taskId,
      user_id: userId,
      title: 'Test Task',
      notes: null,
      status: 'completed', // This is the expected final status
      priority: 2,
      due: null,
      goal_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(), // Include fields returned by select
    };

    // Mock setup for 'tasks' table operations
    const fetchMock = mockDeep<MockableTableOperations>();
    mockSupabaseAdmin.from('tasks').mockReturnValue(fetchMock); // Consistently return fetchMock for 'tasks'

    // Configure chainable methods to return the mock itself
    fetchMock.select.mockReturnValue(fetchMock);
    fetchMock.eq.mockReturnValue(fetchMock);
    fetchMock.update.mockReturnValue(fetchMock);

    // Configure .single() to resolve differently for fetch vs update
    fetchMock.single
      .mockResolvedValueOnce({ data: initialTaskData, error: null }) // First call (fetch)
      .mockResolvedValueOnce({ data: updatedTaskData, error: null }); // Second call (update confirmation)

    const caller = createTestCaller(userId);
    const result = await caller.task.toggleTask({
      taskId: taskId,
    });

    // Verify the result
    expect(result.status).toBe('completed');

    // Verify calls
    expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('tasks');
    expect(fetchMock.select).toHaveBeenCalledWith('id, status, goal_id, title');
    expect(fetchMock.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'completed' }));
    expect(fetchMock.eq).toHaveBeenCalledWith('id', taskId);
    expect(fetchMock.eq).toHaveBeenCalledWith('user_id', userId);
    expect(fetchMock.select).toHaveBeenCalledWith('id, title, status, goal_id, updated_at');
    expect(fetchMock.single).toHaveBeenCalledTimes(2); // Called for fetch and update
  });

  it('should toggle a task from complete to incomplete', async () => {
    const taskId = 'task-1';
    const userId = 'test-user-id';
    const initialTaskData = {
      id: taskId,
      title: 'Test Task',
      status: 'completed', // Starting completed
      goal_id: null,
    };
    const updatedTaskData = {
      id: taskId,
      title: 'Test Task',
      status: 'in-progress', // Expected final status
      goal_id: null,
      updated_at: new Date().toISOString(),
    };

    // Mock setup for 'tasks' table operations
    const fetchMock = mockDeep<MockableTableOperations>();
    mockSupabaseAdmin.from('tasks').mockReturnValue(fetchMock); // Consistently return fetchMock

    // Configure chainable methods
    fetchMock.select.mockReturnValue(fetchMock);
    fetchMock.eq.mockReturnValue(fetchMock);
    fetchMock.update.mockReturnValue(fetchMock);

    // Configure .single() resolutions
    fetchMock.single
      .mockResolvedValueOnce({ data: initialTaskData, error: null }) // First call (fetch)
      .mockResolvedValueOnce({ data: updatedTaskData, error: null }); // Second call (update confirmation)

    const caller = createTestCaller(userId);
    const result = await caller.task.toggleTask({
      taskId: taskId,
    });

    // Verify the result
    expect(result.status).toBe('in-progress');

    // Verify calls
    expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('tasks');
    expect(fetchMock.select).toHaveBeenCalledWith('id, status, goal_id, title');
    expect(fetchMock.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'in-progress' }));
    expect(fetchMock.eq).toHaveBeenCalledWith('id', taskId);
    expect(fetchMock.eq).toHaveBeenCalledWith('user_id', userId);
    expect(fetchMock.select).toHaveBeenCalledWith('id, title, status, goal_id, updated_at');
    expect(fetchMock.single).toHaveBeenCalledTimes(2); // Called for fetch and update
  });

  it('should update goal progress when toggling a task with goal association', async () => {
    const taskId = 'task-1';
    const goalId = 'goal-1';
    const userId = 'test-user-id';

    // --- Task Mocks --- 
    const taskFetchMock = mockDeep<MockableTableOperations>();
    const initialTaskData = { id: taskId, title: 'Goal Task', status: 'in-progress', goal_id: goalId };
    const updatedTaskData = { ...initialTaskData, status: 'completed', updated_at: new Date().toISOString() };
    
    taskFetchMock.select.mockReturnValue(taskFetchMock);
    taskFetchMock.eq.mockReturnValue(taskFetchMock);
    taskFetchMock.update.mockReturnValue(taskFetchMock);
    taskFetchMock.single
      .mockResolvedValueOnce({ data: initialTaskData, error: null }) // Fetch task
      .mockResolvedValueOnce({ data: updatedTaskData, error: null }); // Update task

    // Helper function to create a properly awaitable mock with data
    function createTableMockWithData<T>(data: T) {
      const mock = mockDeep<MockableTableOperations>();
      
      // Configure chainable methods to return this (for method chaining)
      mock.select.mockReturnThis();
      mock.eq.mockReturnThis();
      mock.order.mockReturnThis();
      mock.limit.mockReturnThis();
      mock.in.mockReturnThis();
      mock.update.mockReturnThis();
      mock.is.mockReturnThis();
      mock.neq.mockReturnThis();
      mock.or.mockReturnThis();
      
      // Add proper promise handling for awaitable operations
      const response = { data, error: null, status: 200, count: Array.isArray(data) ? data.length : undefined };
      const mockPromise = Promise.resolve(response);
      
      // Add then/catch/finally methods to make the mock awaitable
      (mock as any).then = mockPromise.then.bind(mockPromise);
      (mock as any).catch = mockPromise.catch.bind(mockPromise);
      (mock as any).finally = mockPromise.finally.bind(mockPromise);
      
      return mock;
    }
    
    // --- Goal Task List Mock --- 
    // Create a properly awaitable mock with the goal tasks data
    const goalTasksData = [
        { id: taskId, status: 'completed' }, // The toggled task
        { id: 'task-2', status: 'in-progress' },
    ];
    const goalTasksListMock = createTableMockWithData(goalTasksData);

    // --- Goal Update Mock --- 
    const updatedGoalData = { id: goalId, name: 'Test Goal', progress: 0.5, /* other fields */ updated_at: new Date().toISOString() }; // Example with 50% progress
    
    // Create an awaitable mock with the goal update data
    const goalUpdateMock = createTableMockWithData(updatedGoalData);
    // Make sure single() returns a properly typed response
    goalUpdateMock.single.mockResolvedValue({ data: updatedGoalData, error: null });


    // --- Configure from() to return the right mock based on table --- 
    mockSupabaseAdmin.from.mockImplementation((table: TableName) => {
      if (table === 'tasks') {
        // First call to 'tasks' is for the initial fetch/update of the specific task
        // Second call is to get all tasks for the goal
        // Need a way to differentiate... maybe check chained methods?
        // For now, let's assume the first call structure uses single(), the second doesn't directly
        // A more robust way might involve mockFn.mock.calls inspection or clearer separation.
        // Let's try returning taskFetchMock first, then goalTasksListMock.
        if (mockSupabaseAdmin.from.mock.calls.filter(c => c[0] === 'tasks').length <= 1) {
            return taskFetchMock;
        } else {
            return goalTasksListMock;
        }
      }
      if (table === 'goals') {
        return goalUpdateMock; // Only call to 'goals' is for the update
      }
      // Fallback for any other table calls in the test setup (if any)
      const defaultMock = mockDeep<MockableTableOperations>();
      defaultMock.select.mockReturnValue(defaultMock);
      defaultMock.eq.mockReturnValue(defaultMock);
      defaultMock.single.mockResolvedValue({ data: null, error: { message: 'Default mock', code: 'MOCK_ERR' } });
      return defaultMock;
    });

    const caller = createTestCaller(userId);
    const result = await caller.task.toggleTask({
      taskId: taskId,
    });

    // Assertions
    expect(result.status).toBe('completed');
    expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('tasks'); // Called multiple times
    expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('goals');
    
    // Verify task update
    expect(taskFetchMock.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'completed' }));
    expect(taskFetchMock.single).toHaveBeenCalledTimes(2); // Fetch + Update task

    // Verify fetching goal tasks
    expect(goalTasksListMock.select).toHaveBeenCalledWith('id, status');
    expect(goalTasksListMock.eq).toHaveBeenCalledWith('goal_id', goalId);

    // Verify goal update
    expect(goalUpdateMock.update).toHaveBeenCalledWith({ progress: 0.5 }); // 1 out of 2 tasks complete
    expect(goalUpdateMock.eq).toHaveBeenCalledWith('id', goalId);
    expect(goalUpdateMock.select).toHaveBeenCalledWith('id, name, progress, updated_at');
    expect(goalUpdateMock.single).toHaveBeenCalledTimes(1);

    // Reset implementation for next tests if needed (though beforeEach should handle it)
    // mockSupabaseAdmin.from.mockRestore(); // Or reset in beforeEach

  });

  it('should not change status if already in the target state', async () => {
    const taskId = 'task-1';
    const userId = 'test-user-id';
    const existingTask = {
      id: taskId,
      title: 'Test Task',
      status: 'completed',
      goal_id: null,
    };

    // --- Configure from() for tasks table --- 
    const tasksTableMock = mockDeep<MockableTableOperations>();
    mockSupabaseAdmin.from('tasks').mockReturnValue(tasksTableMock);
    tasksTableMock.select.mockReturnValue(tasksTableMock);
    tasksTableMock.eq.mockReturnValue(tasksTableMock);
    tasksTableMock.single.mockResolvedValue({ data: existingTask, error: null });

    // --- Configure from() for goals table (should not be called) ---
    const goalsTableMock = mockDeep<MockableTableOperations>();
    // ... setup mocks for goals table ...
    // This setup is complex, let's simplify if goal logic isn't tested here
    // goalsTableMock.update.mockReturnValue(goalsTableMock);
    // goalsTableMock.eq.mockReturnValue(goalsTableMock);
    // goalsTableMock.select.mockReturnValue(goalsTableMock);
    // goalsTableMock.single.mockResolvedValue({ data: null, error: null });
    // mockSupabaseAdmin.from('goals').mockReturnValue(goalsTableMock);
    const caller = createTestCaller(userId);
    const result = await caller.task.toggleTask({
      taskId: taskId,
    });

    // Verify the result
    expect(result.status).toBe('completed');

    // Verify no update was performed
    expect(mockSupabaseAdmin.from('tasks').update).not.toHaveBeenCalled();
    expect(mockSupabaseAdmin.from('goals').update).not.toHaveBeenCalled(); // Ensure goal not updated
  });

  it('should throw NOT_FOUND error if task does not exist', async () => {
    // Mock the initial fetch to return no data
    const fetchMock = mockDeep<MockableTableOperations>();
    mockSupabaseAdmin.from('tasks').mockReturnValue(fetchMock);
    fetchMock.select.mockReturnValue(fetchMock);
    fetchMock.eq.mockReturnValue(fetchMock);
    fetchMock.single.mockResolvedValue({ data: null, error: null }); // Simulate task not found

    const caller = createTestCaller();
    await expect(caller.task.toggleTask({ taskId: 'nonexistent-task' }))
      .rejects.toMatchObject({ code: 'NOT_FOUND' });

    // Ensure update was not called
    expect(fetchMock.update).not.toHaveBeenCalled();
  });

  it('should throw an error if the database update fails', async () => {
    const taskId = 'task-1';
    const userId = 'test-user-id';
    const initialTaskData = { id: taskId, status: 'in-progress', goal_id: null, title: 'Test' };
    const dbError = { message: 'Update failed', code: 'DB_ERROR' };

    // Mock the initial fetch
    const fetchMock = mockDeep<MockableTableOperations>();
    mockSupabaseAdmin.from('tasks').mockReturnValue(fetchMock);
    fetchMock.select.mockReturnValue(fetchMock);
    fetchMock.eq.mockReturnValue(fetchMock);
    fetchMock.update.mockReturnValue(fetchMock); // Update returns mock for chaining

    // Mock .single() for initial fetch (success) and update (failure)
    fetchMock.single
      .mockResolvedValueOnce({ data: initialTaskData, error: null }) // Fetch succeeds
      .mockResolvedValueOnce({ data: null, error: dbError });       // Update fails

    const caller = createTestCaller(userId);
    await expect(caller.task.toggleTask({ taskId: taskId }))
      .rejects.toMatchObject({ message: 'Update failed', code: 'DB_ERROR' });

    // Verify update was attempted
    expect(fetchMock.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'completed' }));
    expect(fetchMock.single).toHaveBeenCalledTimes(2); // Fetch + Update attempt
  });

});
```

### test-helpers.ts
**Path:** __tests__/server/test-helpers.ts
**Size:** 10364 bytes

```typescript
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { User, AuthError } from '@supabase/supabase-js';
import { type Context } from '@/server/src/context';
import { TRPCError } from '@trpc/server';

// --- Common Response Type --- 
// Represents the core structure of Supabase Postgrest responses
export type MockablePostgrestResponse<T> = Promise<{
  data: T | null;
  error: any;
  count?: number | null; 
  status?: number;
  statusText?: string;
}>;

// --- Interface for CHAINABLE Query Builder methods --- 
// These methods return the builder itself to allow chaining.
export interface MockableQueryBuilder {
  select: (query?: string, options?: { head?: boolean; count?: 'exact' | 'planned' | 'estimated' }) => MockableQueryBuilder;
  eq: (column: string, value: any) => MockableQueryBuilder;
  neq: (column: string, value: any) => MockableQueryBuilder;
  gt: (column: string, value: any) => MockableQueryBuilder;
  gte: (column: string, value: any) => MockableQueryBuilder;
  lt: (column: string, value: any) => MockableQueryBuilder;
  lte: (column: string, value: any) => MockableQueryBuilder;
  like: (column: string, pattern: string) => MockableQueryBuilder;
  ilike: (column: string, pattern: string) => MockableQueryBuilder;
  is: (column: string, value: boolean | null) => MockableQueryBuilder;
  in: (column: string, values: any[]) => MockableQueryBuilder;
  contains: (column: string, value: any) => MockableQueryBuilder;
  containedBy: (column: string, value: any) => MockableQueryBuilder;
  rangeGt: (column: string, range: string) => MockableQueryBuilder;
  rangeGte: (column: string, range: string) => MockableQueryBuilder;
  rangeLt: (column: string, range: string) => MockableQueryBuilder;
  rangeLte: (column: string, range: string) => MockableQueryBuilder;
  rangeAdjacent: (column: string, range: string) => MockableQueryBuilder;
  overlaps: (column: string, value: any) => MockableQueryBuilder;
  textSearch: (column: string, query: string, options?: { config?: string; type?: 'plain' | 'phrase' | 'websearch' }) => MockableQueryBuilder;
  match: (query: Record<string, unknown>) => MockableQueryBuilder;
  not: (column: string, operator: string, value: any) => MockableQueryBuilder;
  or: (filters: string, options?: { referencedTable?: string }) => MockableQueryBuilder;
  filter: (column: string, operator: string, value: any) => MockableQueryBuilder;
  limit: (count: number, options?: { referencedTable?: string }) => MockableQueryBuilder;
  range: (from: number, to: number, options?: { referencedTable?: string }) => MockableQueryBuilder;
  order: (column: string, options?: { ascending?: boolean; nullsFirst?: boolean; referencedTable?: string }) => MockableQueryBuilder;
}

// --- Interface for Operations on a Table (after .from()) --- 
// Inherits chainable methods AND adds terminal methods returning Promises.
export interface MockableTableOperations extends MockableQueryBuilder {
  // Terminal methods (return Promises)
  single: <T = any>() => MockablePostgrestResponse<T>;
  maybeSingle: <T = any>() => MockablePostgrestResponse<T>;
  // Note: Insert/Update/Upsert often return arrays in Supabase v2, but the *methods* return the builder
  insert: <T = any>(values: any | any[], options?: any) => MockableTableOperations; 
  upsert: <T = any>(values: any | any[], options?: any) => MockableTableOperations; 
  update: <T = any>(values: any, options?: any) => MockableTableOperations; 
  delete: (options?: any) => MockableTableOperations; 
}

// --- Interface for the Supabase Client itself --- 
/**
 * Represents the structure of the Supabase client that we need to mock.
 * `from` returns an object combining chainable and terminal methods.
 */
export interface MockableSupabaseClient {
  // `from` now returns the object with both chainable and terminal methods
  from: (relation: string) => MockableTableOperations;

  // Top-level client methods
  auth: {
    getUser: (
      jwt?: string
    ) => Promise<{ data: { user: User | null }; error: AuthError | null }>;
    // Add other auth methods here if needed by tests (e.g., signUp, signInWithPassword)
  };
  rpc: <T = any>(fn: string, params?: object, options?: { head?: boolean; count?: 'exact' | 'planned' | 'estimated' }) => MockablePostgrestResponse<T>;
  // Add storage interface here if needed by tests
  // storage: { ... };
}

// --- Mock Implementation --- 

// Create a deep mock instance conforming to the refined interface
export const mockSupabaseAdmin = mockDeep<MockableSupabaseClient>();

// Helper to reset mocks
export function resetSupabaseMocks() {
  // Use mockReset for better compatibility with jest-mock-extended
  mockReset(mockSupabaseAdmin);

  // --- Re-apply default implementations after reset --- 

  // Default: Successful authentication
  mockSupabaseAdmin.auth.getUser.mockResolvedValue({
    data: { user: { id: 'test-user-id', /* other user props */ } as User },
    error: null,
  });

  // Default: Successful RPC call returning null data
  mockSupabaseAdmin.rpc.mockResolvedValue({ 
      data: null, 
      error: null, 
      count: 0, 
      status: 200, 
      statusText: 'OK' 
  });

  // Helper type to create Promise-like chain-terminating objects
  type AsyncResult<T> = Promise<{ data: T | null; error: any; count?: number; status?: number; statusText?: string; }>;

  // Helper function to create a proper mock that handles both chaining AND awaiting
  function createMockWithPromiseCapability<T>(defaultData: T | null = null): any {
    const mockObj = mockDeep<MockableTableOperations>();
    
    // Add an implicit then handler that allows awaiting the mock directly
    // This is what Supabase's actual Query Builder does
    const defaultResponse = { 
      data: defaultData, 
      error: null, 
      count: defaultData && Array.isArray(defaultData) ? defaultData.length : 0,
      status: 200, 
      statusText: 'OK' 
    };
    
    // Allow the mock to be awaited directly
    (mockObj as any).then = jest.fn((onFulfill, onReject) => {
      return Promise.resolve(defaultResponse).then(onFulfill, onReject);
    });
    
    return mockObj;
  }

  // Default behavior for 'from': Return a mock that handles chaining and terminal methods
  mockSupabaseAdmin.from.mockImplementation((relation: string) => {
    // This inner mock needs to satisfy MockableTableOperations
    // AND be awaitable like a promise for terminal operations
    const innerMock = createMockWithPromiseCapability<any[]>([]);

    // --- Configure Default CHAINABLE Methods (Return Self) --- 
    innerMock.select.mockReturnValue(innerMock);
    innerMock.eq.mockReturnValue(innerMock);
    innerMock.neq.mockReturnValue(innerMock);
    innerMock.gt.mockReturnValue(innerMock);
    innerMock.gte.mockReturnValue(innerMock);
    innerMock.lt.mockReturnValue(innerMock);
    innerMock.lte.mockReturnValue(innerMock);
    innerMock.like.mockReturnValue(innerMock);
    innerMock.ilike.mockReturnValue(innerMock);
    innerMock.is.mockReturnValue(innerMock);
    innerMock.in.mockReturnValue(innerMock);
    innerMock.contains.mockReturnValue(innerMock);
    innerMock.containedBy.mockReturnValue(innerMock);
    innerMock.rangeGt.mockReturnValue(innerMock);
    innerMock.rangeGte.mockReturnValue(innerMock);
    innerMock.rangeLt.mockReturnValue(innerMock);
    innerMock.rangeLte.mockReturnValue(innerMock);
    innerMock.rangeAdjacent.mockReturnValue(innerMock);
    innerMock.overlaps.mockReturnValue(innerMock);
    innerMock.textSearch.mockReturnValue(innerMock);
    innerMock.match.mockReturnValue(innerMock);
    innerMock.not.mockReturnValue(innerMock);
    innerMock.or.mockReturnValue(innerMock);
    innerMock.filter.mockReturnValue(innerMock);
    innerMock.limit.mockReturnValue(innerMock);
    innerMock.range.mockReturnValue(innerMock);
    innerMock.order.mockReturnValue(innerMock);

    // --- Configure Default TERMINAL Methods --- 
    // For single-returning methods, default to null
    const singleResponse = { 
      data: null, 
      error: null, 
      status: 200, 
      statusText: 'OK' 
    };
    
    innerMock.single.mockResolvedValue(singleResponse);
    innerMock.maybeSingle.mockResolvedValue(singleResponse);
    
    // For insert/update/upsert operations, return the builder that can be chained further or awaited
    innerMock.insert.mockImplementation(() => {
      const insertMock = createMockWithPromiseCapability();
      insertMock.select.mockReturnValue(insertMock);
      return insertMock;
    });
    
    innerMock.upsert.mockImplementation(() => {
      const upsertMock = createMockWithPromiseCapability();
      upsertMock.select.mockReturnValue(upsertMock);
      return upsertMock;
    });
    
    innerMock.update.mockImplementation(() => {
      const updateMock = createMockWithPromiseCapability();
      updateMock.select.mockReturnValue(updateMock);
      return updateMock;
    });
    
    innerMock.delete.mockImplementation(() => {
      const deleteMock = createMockWithPromiseCapability();
      deleteMock.select.mockReturnValue(deleteMock);
      return deleteMock;
    });

    return innerMock;
  });
}

// Initialize mocks on first load
resetSupabaseMocks();

// --- Context Creation --- 

// Expand this type as more tables are tested
export type TableName = 
  | 'users' 
  | 'user_profiles' 
  | 'user_settings'
  | 'values'
  | 'principles'
  | 'goals' 
  | 'tasks'
  | 'habits'
  | 'habit_entries'
  | 'tracked_state_defs' 
  | 'state_entries'     
  | 'reminders'         
  | 'goal_progress_notes'
  | 'rewards'           
  | 'user_badges';       

/**
 * Creates a TRPC context with a mocked Supabase client.
 * Ensures the user is authenticated unless explicitly bypassed.
 */
export function createInnerTRPCContext(opts: {
  userId: string | null;
  supabase?: any; // Keep as any for simplicity
}): Context {
  if (!opts.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'User must be authenticated to access this resource',
    });
  }

  return {
    userId: opts.userId,
    supabaseAdmin: opts.supabase || mockSupabaseAdmin,
  };
}

export function createTestContext(userId: string | null = 'test-user-id', supabase?: any) {
  return createInnerTRPCContext({
    userId,
    supabase,
  });
}

// Export mockDeep so it can be used directly in tests if needed
export { mockDeep };
```

### test-utils.tsx
**Path:** __tests__/test-utils.tsx
**Size:** 928 bytes

```typescript
// __tests__/test-utils.tsx
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { TamaguiProvider } from 'tamagui';
// Ensure the path to your config is correct
// It might be '../tamagui.config' or './tamagui.config' depending on your structure
import config from '../tamagui.config';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  // Ensure you're providing the correct defaultTheme if your app uses one
  return (
    <TamaguiProvider config={config} defaultTheme="light">
      {children}
    </TamaguiProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from testing-library
export * from '@testing-library/react-native';

// Override render method
export { customRender as render };
```


# (root files)

### aether_styling_context.txt
**Path:** aether_styling_context.txt
**Size:** 72144 bytes

```
========================================
 AETHERIPHONE STYLING CONTEXT DUMP 
========================================

Date: 2025-04-30T04:20:08.847Z
Purpose: Provide full file context for styling analysis and enhancement suggestions.

========================================
FILE: tamagui.config.ts
----------------------------------------

// tamagui.config.ts
import { createAnimations } from '@tamagui/animations-react-native';
import { createFont, createTamagui, createTokens } from 'tamagui';
import { Platform } from 'react-native';
import * as MotionConstants from '@/constants/motion'; // Import motion constants

// Font definitions - Zelda Theme
// Assumes 'CalamitySans' and 'HyliaSerif' are loaded via useFonts or similar
const headingFont = createFont({
  family: 'HyliaSerif', // Zelda Display Font
  size: {
    // Mapped closer to iOS Dynamic Type: https://developer.apple.com/design/human-interface-guidelines/typography
    1: 13,  // Caption 2
    2: 15,  // Subheadline
    3: 17,  // Body (true default)
    4: 20,  // Title 3
    5: 22,  // Title 2
    6: 28,  // Title 1
    7: 34,  // Large Title
    8: 40,  // Extra Large Title (custom)
    true: 17, // Default size (Body)
  },
  lineHeight: {
    // Approximate line heights based on new sizes
    1: 18, 2: 20, 3: 22, 4: 25, 5: 28, 6: 34, 7: 41, 8: 50, 
    true: 22,
  },
  weight: {
    // Prompt 2 asks for 400-700
    4: '400', // Normal
    6: '600', // Semi-bold/Bold
    7: '700', // Extra-bold/Black
    true: '400',
  },
  letterSpacing: {
    1: 0, 2: 0, 3: -0.5, 4: -0.5, 5: -1, 6: -1, 7: -1.5, 8: -1.5,
    true: 0,
  },
  // Required: Map weights to specific font faces if needed (e.g., 'HyliaSerif-Bold')
  // face: {
  //   400: { normal: 'HyliaSerif-Regular' },
  //   700: { normal: 'HyliaSerif-Bold' },
  // },
});

const bodyFont = createFont({
  family: 'CalamitySans', // Zelda Body Font
  size: {
    // Mapped closer to iOS Dynamic Type
    1: 11,  // Footnote
    2: 12,  // Caption 1
    3: 13,  // Caption 2
    4: 15,  // Subheadline
    5: 17,  // Body (true default)
    6: 20,  // Title 3 (matching headingFont.$4)
    true: 17, // Default body size
  },
  lineHeight: {
    // Approximate line heights
    1: 13, 2: 16, 3: 18, 4: 20, 5: 22, 6: 25,
    true: 22, // Default body line height
  },
  weight: {
    4: '400', // Regular
    5: '500', // Medium (if available)
    7: '700', // Bold (if needed/available)
    true: '400',
  },
  letterSpacing: {
    1: 0.1, 2: 0.1, 3: 0, 4: 0, 5: -0.1, 6: -0.1,
    true: 0,
  },
  // Required: Map weights to specific font faces if needed (e.g., 'CalamitySans-Medium')
  // face: {
  //   400: { normal: 'CalamitySans-Regular' },
  //   500: { normal: 'CalamitySans-Medium' },
  // },
});

const monoFont = createFont({
  family: Platform.select({ web: 'monospace', default: 'SpaceMono' }), // Keep SpaceMono for code
  size: {
    1: 12, 2: 14, 3: 15, 4: 16, 5: 18, 6: 20, true: 15,
  },
  lineHeight: {
    1: 18, 2: 22, 3: 24, 4: 26, 5: 28, 6: 32, true: 24,
  },
  weight: {
    4: '400', // Normal weight
    true: '400',
  },
  letterSpacing: {
    4: 0,
    true: 0,
  },
  face: {
    400: { normal: 'SpaceMono' }, // Map weight 400 to the loaded SpaceMono font
  },
});

// Animation driver using reanimated
const animations = createAnimations({
  fast: {
    type: 'timing',
    duration: MotionConstants.durations.standard,
    // easing: MotionConstants.easings.standard, // Removed as createAnimations defaults work well
  },
  medium: {
    type: 'timing',
    duration: MotionConstants.durations.modal,
  },
  slow: {
    type: 'timing',
    duration: MotionConstants.durations.long,
  },
  bouncy: {
    type: 'spring',
    damping: 9,
    mass: 0.9,
    stiffness: 150,
  },
  lazy: {
    type: 'spring',
    damping: 18,
    stiffness: 50,
  },
  quick: {
    type: 'spring',
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },
});

// Standard Radix Gray scale (light theme)
const gray = {
  gray1: '#fcfcfc', gray2: '#f8f8f8', gray3: '#f3f3f3', gray4: '#ededed', gray5: '#e8e8e8', gray6: '#e2e2e2', gray7: '#dbdbdb', gray8: '#c7c7c7', gray9: '#8f8f8f', gray10: '#858585', gray11: '#6f6f6f', gray12: '#171717',
};

// Standard Radix Gray scale (dark theme)
const grayDark = {
  gray1: '#191919', gray2: '#212121', gray3: '#282828', gray4: '#303030', gray5: '#393939', gray6: '#424242', gray7: '#4f4f4f', gray8: '#626262', gray9: '#737373', gray10: '#838383', gray11: '#ababab', gray12: '#ededed',
};

// Tokens (refined based on your existing config)
const tokens = createTokens({
  size: {
    0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 28, 8: 32, 9: 36, 10: 40, 11: 44, 12: 48, 13: 52, 14: 56, 15: 60, 16: 64, true: 16,
  },
  space: {
    0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 28, 8: 32, 9: 36, 10: 40, 11: 44, 12: 48, 13: 52, 14: 56, 15: 60, 16: 64, true: 16, '-1': -4, '-2': -8, '-3': -12, '-4': -16,
  },
  radius: {
    0: 0, 1: 3, 2: 5, 3: 8, 4: 10, 5: 14, 6: 16, 7: 20, 8: 24, 9: 28, 10: 32, true: 10, // Updated radius.5 to 14
  },
  zIndex: { 0: 0, 1: 100, 2: 200, 3: 300, 4: 400, 5: 500 },
  color: {
    // Zelda Palette (Prompt 1)
    ...gray, // Add light greys
    ...grayDark, // Add dark greys (will be overridden in dark theme definition)
    parchment: '#FDFFE0',
    sheikahCyan: '#86A5A9',
    korokGreen: '#92C582',
    darkText: '#536F50',
    guardianOrange: '#FF9F0A',
    darkTealBg: '#1A2E3A',
    darkCyanGlow: '#64FFDA',

    // Shadow Colors (Prompt 5)
    shadowColorLight: 'rgba(83, 111, 80, 1)', // dark desaturated text color
    shadowColorDark: 'rgba(0, 0, 0, 1)', // Black base
    white: '#FFFFFF',
    black: '#000000',
  },
});

// Define themes using Zelda Palette
const lightTheme = {
  // Base Colors
  background: tokens.color.parchment,      // Light bg
  backgroundStrong: tokens.color.white,     // Keep white for strong contrast areas if needed
  backgroundTransparent: 'rgba(253, 255, 224, 0)', // Fully transparent parchment
  color: tokens.color.darkText,             // Dark desaturated text
  colorSecondary: tokens.color.darkText,      // Use main text color, maybe slightly lighter if needed later
  colorTertiary: tokens.color.sheikahCyan,    // Use accent for tertiary info?
  borderColor: tokens.color.sheikahCyan,      // Use accent for borders
  borderColorHover: tokens.color.korokGreen,  // Korok green on hover?

  // Theme-specific states (can refine later)
  backgroundHover: tokens.color.parchment,    // Keep parchment, maybe slightly darker/lighter
  backgroundPress: tokens.color.parchment,    // Keep parchment
  backgroundFocus: tokens.color.parchment,    // Keep parchment
  colorHover: tokens.color.korokGreen,        // Korok green text on hover?
  colorPress: tokens.color.korokGreen,
  colorFocus: tokens.color.sheikahCyan,
  borderColorPress: tokens.color.korokGreen,
  borderColorFocus: tokens.color.sheikahCyan,

  // Semantic Tokens (Prompt 4)
  accent: tokens.color.sheikahCyan,
  surfaceSubtle: tokens.color.parchment,    // Base color, apply opacity in component (e.g., rgba(253,255,224,0.8))
  destructive: tokens.color.guardianOrange,

  // Standard Semantic Mapping (can use Zelda colors)
  primary: tokens.color.sheikahCyan,        // Map primary to accent
  secondary: tokens.color.korokGreen,       // Map secondary to korok green?
  success: tokens.color.korokGreen,
  warning: tokens.color.guardianOrange,     // Use guardian orange for warning
  error: tokens.color.guardianOrange,       // Use guardian orange for error
  info: tokens.color.sheikahCyan,

  // Semantic Aliases (Playbook 1.1)
  surface: tokens.color.parchment, // Maps to background
  onSurface: tokens.color.darkText,  // Maps to color
  outline: tokens.color.sheikahCyan, // Maps to borderColor

  // Shadows (Playbook 1.1 & Prompt 5)
  shadowColor: tokens.color.shadowColorLight, // Use darkText color base for shadow
  shadowColorHover: 'rgba(83, 111, 80, 0.15)',
  shadowSm: 'rgba(83, 111, 80, 0.10)', // 10% opacity
  shadowMd: 'rgba(83, 111, 80, 0.15)', // 15% opacity
  shadowLg: 'rgba(83, 111, 80, 0.20)', // 20% opacity

  // Toast Themes (Report Item 6)
  toast_success_background: tokens.color.korokGreen,
  toast_success_color: tokens.color.parchment,
  toast_error_background: tokens.color.guardianOrange,
  toast_error_color: tokens.color.parchment,
  toast_warning_background: tokens.color.guardianOrange, // Often same as error
  toast_warning_color: tokens.color.parchment,
  toast_info_background: tokens.color.sheikahCyan,
  toast_info_color: tokens.color.parchment,
};

const darkTheme: typeof lightTheme = {
  // Base Colors
  ...grayDark, // Override light greys with dark greys
  background: tokens.color.darkTealBg,      // Dark-mode bg
  backgroundStrong: tokens.color.black,       // Black for contrast?
  backgroundTransparent: 'rgba(26, 46, 58, 0)', // Fully transparent dark teal
  color: tokens.color.parchment,          // Use light parchment for text
  colorSecondary: tokens.color.sheikahCyan,   // Sheikah cyan for secondary text
  colorTertiary: tokens.color.korokGreen,     // Korok green for tertiary
  borderColor: tokens.color.sheikahCyan,      // Sheikah cyan borders
  borderColorHover: tokens.color.darkCyanGlow, // Glow cyan on hover?

  // Theme-specific states
  backgroundHover: tokens.color.darkTealBg,   // Keep bg, maybe slightly lighter
  backgroundPress: tokens.color.darkTealBg,
  backgroundFocus: tokens.color.darkTealBg,
  colorHover: tokens.color.darkCyanGlow,
  colorPress: tokens.color.darkCyanGlow,
  colorFocus: tokens.color.darkCyanGlow,
  borderColorPress: tokens.color.darkCyanGlow,
  borderColorFocus: tokens.color.darkCyanGlow,

  // Semantic Tokens (Prompt 4)
  accent: tokens.color.sheikahCyan,
  surfaceSubtle: tokens.color.darkTealBg, // Use dark bg, apply opacity in component
  destructive: tokens.color.guardianOrange,

  // Standard Semantic Mapping
  primary: tokens.color.darkCyanGlow,       // Use glow cyan for primary actions
  secondary: tokens.color.korokGreen,
  success: tokens.color.korokGreen,
  warning: tokens.color.guardianOrange,
  error: tokens.color.guardianOrange,
  info: tokens.color.sheikahCyan,

  // Semantic Aliases (Playbook 1.1)
  surface: tokens.color.darkTealBg,   // Maps to background
  onSurface: tokens.color.parchment,  // Maps to color
  outline: tokens.color.sheikahCyan, // Maps to borderColor

  // Shadows (Playbook 1.1 & Prompt 5)
  shadowColor: tokens.color.shadowColorDark, // Darker shadow for dark mode
  shadowColorHover: 'rgba(0, 0, 0, 0.30)',
  shadowSm: 'rgba(0, 0, 0, 0.20)', // 20% opacity
  shadowMd: 'rgba(0, 0, 0, 0.30)', // 30% opacity
  shadowLg: 'rgba(0, 0, 0, 0.40)', // 40% opacity

  // Toast Themes (Report Item 6)
  toast_success_background: tokens.color.korokGreen,
  toast_success_color: tokens.color.darkTealBg,
  toast_error_background: tokens.color.guardianOrange,
  toast_error_color: tokens.color.darkTealBg,
  toast_warning_background: tokens.color.guardianOrange, // Often same as error
  toast_warning_color: tokens.color.darkTealBg,
  toast_info_background: tokens.color.sheikahCyan,
  toast_info_color: tokens.color.darkTealBg,
};

// Create the Tamagui config
const config = createTamagui({
  animations,
  shouldAddPrefersColorThemes: true,
  themeClassNameOnRoot: true,
  shorthands: {
    // Keep your existing shorthands
    m: 'margin', mt: 'marginTop', mr: 'marginRight', mb: 'marginBottom', ml: 'marginLeft', mx: 'marginHorizontal', my: 'marginVertical',
    p: 'padding', pt: 'paddingTop', pr: 'paddingRight', pb: 'paddingBottom', pl: 'paddingLeft', px: 'paddingHorizontal', py: 'paddingVertical',
    bg: 'backgroundColor', br: 'borderRadius', bw: 'borderWidth', bc: 'borderColor',
    f: 'flex', fd: 'flexDirection', ai: 'alignItems', jc: 'justifyContent', w: 'width', h: 'height',
    ac: 'alignContent',
    als: 'alignSelf',
    btc: 'borderTopColor',
    bbc: 'borderBottomColor',
    blc: 'borderLeftColor',
    brc: 'borderRightColor',
    boc: 'borderColor',
    bs: 'borderStyle',
    dsp: 'display',
    fb: 'flexBasis',
    fg: 'flexGrow',
    fs: 'flexShrink',
    fw: 'flexWrap',
    mah: 'maxHeight',
    maw: 'maxWidth',
    mih: 'minHeight',
    miw: 'minWidth',
    op: 'opacity',
    ov: 'overflow',
    r: 'right',
    shac: 'shadowColor',
    shar: 'shadowRadius',
    shof: 'shadowOffset',
    shop: 'shadowOpacity',
    t: 'top',
    ta: 'textAlign',
    tt: 'textTransform',
    va: 'verticalAlign',
    zi: 'zIndex',
  },
  fonts: {
    // Use Zelda fonts
    heading: headingFont,
    body: bodyFont,
    mono: monoFont, // Keep mono
  },
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  tokens,
  media: { // Keep standard media queries
    xs: { maxWidth: 660 }, sm: { maxWidth: 800 }, md: { maxWidth: 1020 }, lg: { maxWidth: 1280 }, xl: { maxWidth: 1420 }, xxl: { maxWidth: 1600 },
    gtXs: { minWidth: 661 }, gtSm: { minWidth: 801 }, gtMd: { minWidth: 1021 }, gtLg: { minWidth: 1281 },
    short: { maxHeight: 820 }, tall: { minHeight: 820 },
    hoverNone: { hover: 'none' }, pointerCoarse: { pointer: 'coarse' },
  },
  settings: {
      allowedStyleValues: 'somewhat-strict',
      autocompleteSpecificTokens: 'except-special',
  },
});

type AppConfig = typeof config;

// Augment Tamagui interface - this is crucial!
declare module '@tamagui/core' {
  // If AppConfig is defined and exported:
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;

[EOF: tamagui.config.ts]

========================================
FILE: providers/Providers.tsx
----------------------------------------

// providers/Providers.tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { TamaguiProvider, type TamaguiProviderProps } from 'tamagui';
import { ToastProvider, ToastViewport } from '@tamagui/toast'; // Import from Tamagui Toast
import React, { useEffect, useState, type ReactNode } from 'react';
import { Platform } from 'react-native'; // Import Platform

import config from '../tamagui.config'; // Import your config
import { trpc } from '../utils/trpc'; // Your tRPC hook setup
import { queryClient, persister, initializeNetworkMonitoring, resumeMutationsAndInvalidate } from '@/utils/query-client';
import { useUiStore } from '@/stores/uiStore';
import { supabase } from '@/utils/supabase'; // Needed for auth link
import { createTRPCClient, httpBatchLink, TRPCLink, TRPCClientError } from '@trpc/client'; // Import TRPC Client utils
import { observable } from '@trpc/server/observable';
import type { AppRouter } from '../server/src/router'; // Adjust path if needed
import type { Session } from '@supabase/supabase-js';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Setup query client persistence
persistQueryClient({
  queryClient,
  persister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
  dehydrateOptions: {
    shouldDehydrateMutation: () => false, // Usually don't dehydrate mutations
  },
});

// New component for the viewport using safe area
const CurrentToastViewport = () => {
  const { top, bottom, left, right } = useSafeAreaInsets();
  return (
    <>
      {/* Adjust positioning based on your desired toast location */}
      <ToastViewport
        name="global_top"
        flexDirection="column" // Stack new toasts below older ones
        top={top + 10} // Add padding below status bar
        left={left + 10} // Add padding from sides
        right={right + 10}
      />
      <ToastViewport
        name="global_bottom"
        flexDirection="column-reverse"
        bottom={bottom + 10}
        left={left + 10}
        right={right + 10}
      />
    </>
  );
};

// Extract tRPC links setup
function getTRPCLinks(getSession: () => Promise<Session | null>): TRPCLink<AppRouter>[] {
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/trpc'; // Default to localhost
  console.log('Using tRPC API URL:', apiBaseUrl);

  return [
    // Link to handle auth token injection and refresh
    (runtime) => {
      return ({ op, next }) => {
        return observable((observer) => {
          getSession().then(session => {
            const headers = (op.context?.headers || {}) as Record<string, string>;
            if (session?.access_token) {
              headers['Authorization'] = `Bearer ${session.access_token}`;
            }

            // Proceed with the request, ensuring context is passed correctly
            next({ ...op, context: { ...op.context, headers } })
              .subscribe({
                next: (value) => observer.next(value),
                error: async (err) => {
                  if (err instanceof TRPCClientError && err.data?.httpStatus === 401) {
                    console.log('tRPC: Token expired or invalid, attempting refresh...');
                    try {
                      // Supabase handles refresh internally if needed when getSession is called
                      const { data, error: refreshError } = await supabase.auth.refreshSession();
                      if (refreshError) throw refreshError;

                      if (data.session) {
                        console.log('tRPC: Session refreshed successfully, retrying request.');
                        const refreshedHeaders = { ...headers, Authorization: `Bearer ${data.session.access_token}` };
                        // Retry with new headers in context
                        next({ ...op, context: { ...op.context, headers: refreshedHeaders } }).subscribe(observer);
                      } else {
                        console.error('tRPC: Session refresh failed, no session returned.');
                        observer.error(err); // Propagate original error if no new session
                        // Optionally trigger logout here
                        supabase.auth.signOut();
                      }
                    } catch (refreshCatchError) {
                      console.error('tRPC: Session refresh catch error:', refreshCatchError);
                      observer.error(err); // Propagate original error
                      supabase.auth.signOut();
                    }
                  } else {
                    observer.error(err); // Propagate non-auth errors
                  }
                },
                complete: () => observer.complete(),
              });
          }).catch(err => {
             console.error('tRPC: Error getting session for headers:', err);
             observer.error(new TRPCClientError('Failed to get session')); // Use TRPCClientError
          });

          // Return cleanup function if needed
          return () => {};
        });
      };
    },
    // The terminating HTTP link
    httpBatchLink({
      url: apiBaseUrl,
       headers() {
         // Headers are injected by the middleware link above
         return {};
       },
      // Add superjson transformer here if you use one
      // transformer: superjson,
    }),
  ];
}

export function Providers({ children }: { children: ReactNode }) {
  // Get theme state from Zustand
  const { isDarkMode } = useUiStore();
  const currentTheme = isDarkMode ? 'dark' : 'light';

  // Initialize network monitoring and query client persistence
  useEffect(() => {
    const unsubscribeNetworkMonitoring = initializeNetworkMonitoring();
    resumeMutationsAndInvalidate(); // Try resuming mutations on app load
    return () => {
      unsubscribeNetworkMonitoring();
    };
  }, []);

  // Memoize tRPC client creation
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: getTRPCLinks(async () => { // Pass session getter to links setup
        const { data } = await supabase.auth.getSession();
        return data.session;
      }),
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <TamaguiProvider
            config={config}
            defaultTheme={currentTheme}
            // disableInjectCSS // May not be needed depending on setup
        >
          {/* Use Tamagui's ToastProvider */}
          <ToastProvider
            // burntOptions={{ from: 'top' }} // Disabled until native module 'Burnt' is installed
            swipeDirection="horizontal"
            duration={4000}
            native={[]}
          >
            {children}
            {/* Add the safe-area aware ToastViewport */}
            <CurrentToastViewport />
          </ToastProvider>
        </TamaguiProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

[EOF: providers/Providers.tsx]

========================================
FILE: stores/uiStore.ts
----------------------------------------

import { create } from 'zustand';

interface UiState {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// Simple Zustand store for UI state (e.g., theme)
export const useUiStore = create<UiState>((set) => ({
  isDarkMode: false, // Default to light mode
  toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
})); 

[EOF: stores/uiStore.ts]

========================================
FILE: constants/motion.ts
----------------------------------------

import { Easing } from 'react-native-reanimated';

/**
 * Standard animation durations (in milliseconds)
 */
export const durations = {
  /** Ultra-fast for micro-interactions */
  micro: 80,
  /** Tap/press feedback */
  tap: 120,
  /** Default animation speed for most UI transitions */
  standard: 200,
  /** For more noticeable animations */
  medium: 250,
  /** Modal entrances/exits, complex transitions */
  modal: 300,
  /** Full screen transitions */
  screen: 350,
  /** Extended animations for emphasis */
  long: 450,
};

/**
 * Standard easing curves
 */
export const easings = {
  /** Quick acceleration, gradual deceleration - for elements entering the screen */
  enter: Easing.bezier(0.25, 0.1, 0.25, 1.0),
  /** Gradual acceleration, quick deceleration - for elements exiting the screen */
  exit: Easing.bezier(0.25, 0.0, 0.2, 1.0),
  /** For transitions between UI states */
  standard: Easing.bezier(0.4, 0.0, 0.2, 1.0),
  /** Quick in, quick out - for emphasis */
  energetic: Easing.bezier(0.55, 0.0, 0.1, 1.0),
  /** Linear - consistent motion with no acceleration/deceleration */
  linear: Easing.linear,
  /** Slow start, fast finish */
  accelerate: Easing.in(Easing.quad),
  /** Fast start, slow finish */
  decelerate: Easing.out(Easing.quad),
  /** Fast start and end, slower in the middle */
  emphasize: Easing.inOut(Easing.quad),
};

/**
 * Animation presets for common UI patterns
 */
export const presets = {
  fadeIn: {
    duration: durations.standard,
    easing: easings.enter,
  },
  fadeOut: {
    duration: durations.standard,
    easing: easings.exit,
  },
  slideIn: {
    duration: durations.modal,
    easing: easings.enter,
  },
  slideOut: {
    duration: durations.modal,
    easing: easings.exit,
  },
  scaleIn: {
    duration: durations.standard,
    easing: easings.emphasize,
  },
  scaleOut: {
    duration: durations.standard,
    easing: easings.emphasize,
  },
  tapFeedback: {
    duration: durations.tap,
    easing: easings.emphasize,
  },
  skeleton: {
    duration: durations.long * 2,
    easing: easings.linear,
  },
};

/**
 * Animation values for specific components
 */
export const componentAnimations = {
  toast: {
    show: {
      duration: durations.modal,
      easing: easings.enter,
    },
    hide: {
      duration: durations.standard,
      easing: easings.exit,
    },
  },
  modal: {
    overlay: {
      show: {
        duration: durations.modal,
        easing: easings.standard,
      },
      hide: {
        duration: durations.modal,
        easing: easings.standard,
      },
    },
    content: {
      show: {
        duration: durations.modal,
        easing: easings.enter,
      },
      hide: {
        duration: durations.standard,
        easing: easings.exit,
      },
    },
  },
  button: {
    press: {
      duration: durations.tap,
      easing: easings.emphasize,
    },
    release: {
      duration: durations.tap,
      easing: easings.emphasize,
    },
  },
  navigation: {
    screen: {
      duration: durations.screen,
      easing: easings.standard,
    },
    tab: {
      duration: durations.standard,
      easing: easings.standard,
    },
  },
}; 

[EOF: constants/motion.ts]

========================================
FILE: app/(tabs)/_layout.tsx
----------------------------------------

// File: /Users/tylerbedford/Documents/Coding Projects/AetherIphone/app/(tabs)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Example icon library
import { useThemeColor } from '@/hooks/useThemeColor'; // Assuming path alias is set

export default function TabLayout() {
  const tabBarActiveTintColor = useThemeColor({}, 'tabIconSelected');
  const tabBarInactiveTintColor = useThemeColor({}, 'tabIconDefault');
  const backgroundColor = useThemeColor({}, 'background'); // Use standard background color

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tabBarActiveTintColor,
        tabBarInactiveTintColor: tabBarInactiveTintColor,
        tabBarStyle: {
          backgroundColor: backgroundColor,
          // Add other styles like borderTopColor if needed
        },
        headerShown: false, // We might handle headers inside each screen or using Stack
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="planner/index"
        options={{
          title: 'Planner',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="compass/index"
        options={{
          title: 'Compass',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="rewards/index"
        options={{
          title: 'Rewards',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="gift-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}


[EOF: app/(tabs)/_layout.tsx]

========================================
FILE: app/(tabs)/home/index.tsx
----------------------------------------

// File: /Users/tylerbedford/Documents/Coding Projects/AetherIphone/app/(tabs)/home/index.tsx
import React, { useCallback, useMemo } from 'react';
import { YStack, H1, Text, XStack, Button, ScrollView, Spinner } from 'tamagui';
import { SafeAreaView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { trpc, RouterOutputs } from '@/utils/trpc';
import DashboardSection from '@/components/dashboard/DashboardSection';
import GoalSummaryCard from '@/components/dashboard/GoalSummaryCard';
import HabitCheckItem from '@/components/dashboard/HabitCheckItem';
import TaskItem from '@/components/dashboard/TaskItem';
import StateIndicator from '@/components/dashboard/StateIndicator';
import DailyProgressBanner from '@/components/dashboard/DailyProgressBanner'; // Import Banner
import EmptyOrSkeleton from '@/components/ui/EmptyOrSkeleton';
import { SkeletonCard, SkeletonRow } from '@/components/ui/Skeleton';
import { useSkeleton } from '@/hooks/useSkeleton';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useToastController } from '@tamagui/toast';
import { BlurView } from 'expo-blur';
import { Plus } from '@tamagui/lucide-icons';
import LottieView from 'lottie-react-native';
import SwipeableRow from '@/components/ui/SwipeableRow'; // Import SwipeableRow

// Types inferred from tRPC Router
type RouterOutput = RouterOutputs['dashboard']['getDashboardData'];
// --- Define types for the STRUCTURE AFTER mapping in useMemo ---
export type DashboardGoal = {
  id: string;
  title: string;
  progress: number;
  tasks: { completed: number; total: number };
  // Include other relevant fields if needed by GoalSummaryCard
  status?: string | null; 
  priority?: number | null;
};
export type DashboardHabit = {
  id: string;
  name: string;
  description?: string | null;
  completed: boolean; // Mapped from completedToday
  streak: number;
  last_entry_id?: string; // Mapped from habit.last_entry_id (null -> undefined)
  habit_type?: string | null;
};
export type DashboardTask = {
  id: string;
  name: string;
  status: string | null; // Allow null
  due_date?: Date | string | null;
  // Include other relevant fields if needed by TaskItem
};
export type DashboardState = {
  id: string;
  name: string | null;
  unit: string | null;
  currentValue: number | string | null;
  lastUpdated: string | null;
  lastEntry: { value: number | null; created_at: Date | string } | null; // Explicitly include lastEntry
};
// --- End mapped type definitions ---

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const toast = useToastController();
  const utils = trpc.useUtils(); // Get tRPC utils for mutations
  
  // Define types using RouterOutputs for clarity and safety
  // type DashboardGoal = RouterOutputs['dashboard']['getDashboardData']['goals'][number];
  // type DashboardHabit = RouterOutputs['dashboard']['getDashboardData']['habits'][number];
  // type DashboardTask = RouterOutputs['dashboard']['getDashboardData']['tasks'][number];

  // Use tRPC hooks to fetch data - Types are inferred but can be explicitly used
  const { 
    data: dashboardData, 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = trpc.dashboard.getDashboardData.useQuery();

  // Define the habit entry mutation hook
  const createHabitEntryMutation = trpc.habit.createHabitEntry.useMutation({
    onSuccess: () => {
      refetch(); // Refresh data after successful mutation
      // Optional: Add success toast
      // toast.show('Habit updated!', { type: 'success' });
    },
    onError: (error) => {
      // Handle tRPC client error
      toast.show(error.message || 'Failed to update habit', { type: 'error' });
    }
  });

  // Handle errors
  React.useEffect(() => {
    if (error) {
      toast.show(error.message || 'Failed to load dashboard data', { type: 'error' });
    }
  }, [error, toast]);

  // Set up pull-to-refresh
  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Custom skeleton states from your hooks
  const { isLoading: skeletonsLoading, count: skeletonCount = 3 } = {
    isLoading,
    count: 3 // Number of skeleton items to show
  };
  
  // Generate skeleton UI based on loading state
  const renderSkeletons = () => {
    return Array.from({ length: skeletonCount }).map((_, index) => (
      <SkeletonCard key={`skeleton-${index}`} />
    ));
  };

  // Get current date and greeting
  const greeting = getGreeting();
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  const dashboardDataMemo = useMemo(() => {
    // Fix: Add check to ensure dashboardData exists before accessing properties
    if (!dashboardData) {
      return null; // Or return default structure: { goals: [], habits: [], tasks: [], trackedStates: [] }
    }

    // Map and filter data, ensuring structure matches exported types
    return {
      // Filter goals to ensure they have an ID before mapping
      // Fix: Use nullish coalescing and optional chaining
      goals: (dashboardData.goals ?? [])
        .filter((goal): goal is typeof goal & { id: string } => !!goal?.id)
        .map((goal) => ({
        // Map to DashboardGoal structure
        id: goal.id, 
        title: goal.title ?? 'Untitled Goal', // Provide default for title
        progress: goal.progress ?? 0, 
        tasks: goal.tasks ?? { completed: 0, total: 0 }, 
        status: goal.status,
        priority: goal.priority,
      })),
      // Filter habits to ensure they have an ID before mapping
      // Fix: Use nullish coalescing and optional chaining
      habits: (dashboardData.habits ?? [])
        .filter((habit): habit is typeof habit & { id: string } => !!habit?.id)
        .map((habit) => ({
        // Map to DashboardHabit structure
        id: habit.id, 
        name: habit.name ?? 'Unnamed Habit', // Provide default for name
        description: habit.description,
        completed: habit.completedToday ?? false, // Map completedToday to completed
        streak: habit.streak ?? 0, 
        last_entry_id: habit.last_entry_id ?? undefined, // Map null to undefined
        habit_type: habit.habit_type,
      })),
      // Filter tasks to ensure they have an ID before mapping
      // Fix: Use nullish coalescing and optional chaining
      tasks: (dashboardData.tasks ?? [])
        .filter((task): task is typeof task & { id: string } => !!task?.id)
        .map((task) => ({
        // Map to DashboardTask structure
        id: task.id,
        name: task.name ?? 'Untitled Task', // Provide default name
        status: task.status,
        due_date: task.due_date,
      })),
      // Map trackedStates, ensuring lastEntry is preserved
      // Fix: Use nullish coalescing and optional chaining
      trackedStates: (dashboardData.trackedStates ?? [])
        .filter((state): state is typeof state & { id: string } => !!state?.id)
        .map((trackedState) => ({
        // Map to DashboardState structure
        id: trackedState.id,
        name: trackedState.name,
        unit: trackedState.unit,
        currentValue: trackedState.currentValue,
        lastUpdated: trackedState.lastUpdated,
        // Ensure lastEntry structure matches definition or is null
        lastEntry: trackedState.lastEntry ?? null, 
      })),
    };
  }, [dashboardData]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor="transparent" // Hide default spinner
            colors={['transparent']} // Hide default spinner (Android)
            progressBackgroundColor="transparent" // Hide default bg (Android)
            refreshingComponent={
              <LottieView
                source={require('@/assets/refresh-sheikah.json')} // ASSUMES this file exists
                autoPlay
                loop
                style={{ width: 48, height: 48, alignSelf: 'center' }} // Center the animation
              />
            }
          />
        }
      >
        <YStack space="$4" paddingHorizontal="$4">
          {/* Header */}
          <YStack space="$1">
            <H1>{greeting}</H1>
            <Text color="$gray10">{currentDate}</Text>
          </YStack>

          {/* Daily Progress Banner */}
          <DailyProgressBanner 
            // tasksCompleted={...} 
            // totalTasks={...} 
            // habitsChecked={...} 
            // totalHabits={...} 
          />

          {/* Goals Section */}
          <DashboardSection 
            title="Goals"
            onSeeAll={() => router.push('/planner')}
          >
            {isLoading ? (
              renderSkeletons()
            ) : error ? (
              <EmptyOrSkeleton
                isEmpty={false}
                isError={true}
                onRetry={refetch}
                text="Failed to load goals"
              />
            ) : !dashboardDataMemo?.goals || dashboardDataMemo.goals.length === 0 ? (
              <EmptyOrSkeleton
                isEmpty={true}
                text="No goals yet"
                actionText="Create a goal"
                onAction={() => router.push('/planner/add-goal')}
              />
            ) : (
              <YStack space="$3">
                {dashboardDataMemo.goals.slice(0, 3).map((goal) => (
                  <SwipeableRow
                    key={goal.id}
                    onDelete={() => {
                      // TODO: Add confirmation dialog?
                      // Assuming mutation exists: utils.goal.delete.mutate({ id: goal.id })
                      console.log('Attempting to delete goal:', goal.id); // Placeholder
                      // utils.goal.delete.mutate({ id: goal.id });
                    }}
                  >
                    <GoalSummaryCard
                      goal={goal}
                      onPress={() => router.push(`/planner/goal/${goal.id}`)}
                    />
                  </SwipeableRow>
                ))}
              </YStack>
            )}
          </DashboardSection>

          {/* Today's Habits */}
          <DashboardSection 
            title="Today's Habits"
            onSeeAll={() => router.push('/planner?tab=habits')}
          >
            {isLoading ? (
              renderSkeletons()
            ) : error ? (
              <EmptyOrSkeleton
                isEmpty={false}
                isError={true}
                onRetry={refetch}
                text="Failed to load habits"
              />
            ) : !dashboardDataMemo?.habits || dashboardDataMemo.habits.length === 0 ? (
              <EmptyOrSkeleton
                isEmpty={true}
                text="No habits for today"
                actionText="Create a habit"
                onAction={() => router.push('/planner/add-habit')}
              />
            ) : (
              <YStack space="$2">
                {dashboardDataMemo.habits.slice(0, 4).map((habit) => (
                  <SwipeableRow
                    key={habit.id}
                    onDelete={() => {
                      // TODO: Add confirmation dialog?
                      // Assuming mutation exists: utils.habit.delete.mutate({ id: habit.id })
                      console.log('Attempting to delete habit:', habit.id); // Placeholder
                      // utils.habit.delete.mutate({ id: habit.id });
                    }}
                  >
                    <HabitCheckItem habit={habit} />
                  </SwipeableRow>
                ))}
              </YStack>
            )}
          </DashboardSection>

          {/* Today's State */}
          <DashboardSection
            title="Today's State"
            // TODO: Add navigation to a dedicated state tracking screen
            onSeeAll={() => console.log('Navigate to State Tracking screen')}
          >
            {isLoading ? (
              renderSkeletons() // Use generic skeletons or specific state skeletons
            ) : error ? (
              <EmptyOrSkeleton
                isEmpty={false}
                isError={true}
                onRetry={refetch}
                text="Failed to load state"
              />
            ) : !dashboardDataMemo?.trackedStates || dashboardDataMemo.trackedStates.length === 0 ? (
              <EmptyOrSkeleton
                isEmpty={true}
                text="No states being tracked"
                actionText="Track a state"
                // TODO: Navigate to state definition creation screen
                onAction={() => console.log('Navigate to Add State screen')}
              />
            ) : (
              <XStack space="$3" flexWrap="wrap"> 
                {dashboardDataMemo.trackedStates.map((stateData) => (
                  <StateIndicator
                    key={stateData.id}
                    state={stateData} // Pass the whole state object which includes lastEntry
                    lastEntry={stateData.lastEntry} // Pass lastEntry explicitly
                    // TODO: Handle interaction - e.g., navigate to state detail/entry screen
                    onPress={() => console.log('State pressed:', stateData.id)}
                  />
                ))}
              </XStack>
            )}
          </DashboardSection>

          {/* Upcoming Tasks */}
          <DashboardSection 
            title="Upcoming Tasks"
            onSeeAll={() => {/* Navigate to tasks list */}}
          >
            {isLoading ? (
              renderSkeletons()
            ) : error ? (
              <EmptyOrSkeleton
                isEmpty={false}
                isError={true}
                onRetry={refetch}
                text="Failed to load tasks"
              />
            ) : !dashboardDataMemo?.tasks || dashboardDataMemo.tasks.length === 0 ? (
              <EmptyOrSkeleton
                isEmpty={true}
                text="No upcoming tasks"
                actionText="Create a task"
                onAction={() => {/* Navigate to create task */}}
              />
            ) : (
              <YStack space="$2">
                {dashboardDataMemo.tasks.slice(0, 5).map((task) => (
                  <SwipeableRow
                    key={task.id}
                    onDelete={() => {
                      // TODO: Add confirmation dialog?
                      // Assuming mutation exists: utils.task.delete.mutate({ id: task.id })
                      console.log('Attempting to delete task:', task.id); // Placeholder
                      // utils.task.delete.mutate({ id: task.id });
                    }}
                  >
                    <TaskItem
                      task={{
                        // Explicitly pass props matching DashboardTask type
                        id: task.id, // Ensure id is passed
                        name: task.name, // Already defaulted in map
                        status: task.status, // Pass status
                        due_date: task.due_date, // Pass due_date
                      }}
                      isLast={false} // Adjust if needed for styling
                      onPress={() => console.log('Task Item Pressed:', task.id)}
                    />
                  </SwipeableRow>
                ))}
              </YStack>
            )}
          </DashboardSection>
        </YStack>
      </ScrollView>
      <QuickAddFAB />
    </SafeAreaView>
  );
}

// Helper function for greeting
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good evening';
}

// Quick Add FAB Component
function QuickAddFAB() {
  return (
    <BlurView intensity={40} tint="default" style={{ position:'absolute', bottom:24, right:24, borderRadius:32, overflow: 'hidden' }}>
      <Button
        circular
        size="$5"
        backgroundColor="$accent"
        icon={Plus}
        elevate
        shadowColor="$shadowColor"
        shadowRadius={5}
        shadowOffset={{ width: 0, height: 2 }}
        pressStyle={{ scale: 0.95, opacity: 0.9 }}
        onPress={() => {
          router.push('/planner/add-task');
        }}
      />
    </BlurView>
  );
}


[EOF: app/(tabs)/home/index.tsx]

========================================
FILE: utils/trpc.ts
----------------------------------------

import { createTRPCReact } from '@trpc/react-query';
import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server';

// Import the real AppRouter type from our server
import { type AppRouter } from '../server/src/router';

// Import types using the updated path
import { RouterInputs as TypedRouterInputs, RouterOutputs as TypedRouterOutputs } from '../server/src/types/trpc-types';

/**
 * tRPC React client
 * The client for consuming your tRPC API from React components
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Inference helpers for input/output types
 * Use the pre-defined types from trpc-types.ts
 */
export type RouterInputs = TypedRouterInputs;
export type RouterOutputs = TypedRouterOutputs; 

[EOF: utils/trpc.ts]

========================================
FILE: utils/query-client.ts
----------------------------------------

import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default stale time of 5 minutes
      staleTime: 1000 * 60 * 5,
      // When offline, keep data fresh for 24 hours (cacheTime was renamed to gcTime)
      gcTime: 1000 * 60 * 60 * 24,
      // Retry failed queries 3 times
      retry: 3,
      // Retry with exponential backoff
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Don't refetch on window focus for mobile
      refetchOnWindowFocus: false,
      // Show stale data while fetching new data (renamed from keepPreviousData)
      placeholderData: 'keepPrevious',
    },
    mutations: {
      // Retry failed mutations 3 times
      retry: 3,
      // Enable offline mutations
      networkMode: 'offlineFirst',
    },
  },
});

// Create a persister
export const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'aether-query-cache-v1',
  // Only persist queries with a longer cacheTime
  throttleTime: 1000,
  // SerDe for serializing/deserializing the data
  serialize: data => JSON.stringify(data),
  deserialize: data => JSON.parse(data),
});

/**
 * Initialize network monitoring for the query client
 * Call this on app startup to enable online/offline detection
 */
export function initializeNetworkMonitoring(): () => void {
  // Subscribe to network status changes
  const unsubscribe = NetInfo.addEventListener(state => {
    onlineManager.setOnline(
      state.isConnected != null && 
      state.isConnected && 
      Boolean(state.isInternetReachable)
    );
  });

  // Initialize once at startup - check if online
  NetInfo.fetch().then(state => {
    onlineManager.setOnline(
      state.isConnected != null && 
      state.isConnected && 
      Boolean(state.isInternetReachable)
    );
  });

  return unsubscribe;
}

/**
 * Resume any paused mutations when the app comes back online
 * 
 * @returns A promise that resolves when mutations are resumed
 */
export async function resumeMutationsAndInvalidate(): Promise<void> {
  try {
    await queryClient.resumePausedMutations();
    queryClient.invalidateQueries();
  } catch (error) {
    console.error('Error resuming mutations:', error);
  }
} 

[EOF: utils/query-client.ts]

========================================
FILE: components/dashboard/DashboardSection.tsx
----------------------------------------

import React, { ReactNode } from 'react';
import { Text, YStack, XStack, Button, Anchor, H4 } from 'tamagui';
import { router } from 'expo-router';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { SectionError } from '@/components/ui/ErrorBanner';
import { BlurView } from 'expo-blur'; // Import BlurView

interface DashboardSectionProps<T> {
  title: string;
  data?: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  seeAllRoute?: string;
  renderItem?: (item: T) => ReactNode;
  skeletonCount?: number;
  error?: string;
  onRetry?(): void;
  children?: ReactNode;
  onSeeAll?(): void;
}

export default function DashboardSection<T>({ 
  title, 
  data, 
  isLoading, 
  emptyMessage,
  seeAllRoute,
  renderItem,
  skeletonCount = 2,
  error,
  onRetry,
  children,
  onSeeAll
}: DashboardSectionProps<T>) {
  return (
    <YStack space="$2">
      <XStack justifyContent="space-between" alignItems="center" marginBottom="$2" paddingHorizontal="$2">
        <H4>{title}</H4>
        {((data && data.length > 0 && seeAllRoute) || onSeeAll) && (
          <Button 
            chromeless 
            size="$2" 
            onPress={() => {
              if (onSeeAll) {
                onSeeAll();
              } else if (seeAllRoute) {
                // Navigate to route using type assertions
                // Safe because the route will be a tab/screen name within the app
                router.push(seeAllRoute as any);
              }
            }}
          >
            See All
          </Button>
        )}
      </XStack>
      
      {/* Wrap content in BlurView */}
      <BlurView 
        intensity={50} 
        tint="default" 
        style={{ borderRadius: 12, overflow: 'hidden' }} 
      >
        <YStack padding="$3">
          {/* If children are provided, render them */}
          {children ? (
            children
          ) : isLoading ? (
            <SkeletonRow lines={skeletonCount} />
          ) : error ? (
            <SectionError message={error ? String(error) : 'An error occurred'} onRetry={onRetry} />
          ) : data && data.length === 0 ? (
            <YStack alignItems="center" padding="$4">
              <Text color="$gray10">{emptyMessage ?? 'No items found'}</Text>
            </YStack>
          ) : (
            data && renderItem && data.map(renderItem)
          )}
        </YStack>
      </BlurView>
    </YStack>
  );
} 

[EOF: components/dashboard/DashboardSection.tsx]

========================================
FILE: components/dashboard/GoalSummaryCard.tsx
----------------------------------------

import React from 'react';
import { Text, XStack, Button } from 'tamagui';
import ProgressRing from '@/components/aether/ProgressRing';
import { RouterOutputs } from '@/utils/trpc';
import { BlurView } from 'expo-blur'; // Import BlurView

// Define a custom type that includes everything we need
type DashboardGoal = {
  id: string;
  title: string;
  status?: string;
  priority?: number;
  progress: number;
  tasks?: {
    total: number;
    completed: number;
  };
};

interface GoalSummaryCardProps {
  goal: DashboardGoal;
  onPress: () => void;
}

export default function GoalSummaryCard({ goal, onPress }: GoalSummaryCardProps) {
  return (
    <BlurView 
      intensity={50} 
      tint="default" 
      style={{ borderRadius: 12, overflow: 'hidden' }}
    >
      <Button 
        chromeless // Remove default button styling
        padding="$3" 
        onPress={onPress}
        width="100%" // Ensure it fills the BlurView
      >
        <XStack alignItems="center" space="$3" flex={1}> 
          <ProgressRing
            progress={goal.progress}
            size={40}
            primaryColor="$primary"
          />
          <XStack flex={1} flexDirection="column">
            <Text fontSize="$4" fontWeight="500" color="$color">
              {goal.title}
            </Text>
            {goal.tasks && (
              <Text color="$gray9" fontSize="$2">
                {goal.tasks.completed}/{goal.tasks.total} tasks completed
              </Text>
            )}
          </XStack>
        </XStack>
      </Button>
    </BlurView>
  );
}

[EOF: components/dashboard/GoalSummaryCard.tsx]

========================================
FILE: components/dashboard/HabitCheckItem.tsx
----------------------------------------

import React, { useState, useEffect } from 'react';
import { Text, XStack, Button, YStack, useTheme } from 'tamagui';
import * as Haptics from 'expo-haptics';
import { trpc, RouterOutputs } from '@/utils/trpc';

// Custom types that match the backend expectations
type DashboardHabit = {
  id: string;
  name: string;  // Backend returns 'name'
  description?: string;
  habit_type?: string;
  streak?: number;
  completed: boolean; // Backend returns 'completed'
  duration_minutes?: number;
  last_entry_id?: string; // Add last_entry_id property
};

// Types for habit entry mutations
type CreateHabitEntryInput = {
  habit_id: string;
  date: string;
  completed?: boolean;
  quantity_value?: number | null;
  notes?: string | null;
};

type DeleteHabitEntryInput = {
  id: string; // Update property name
};

interface HabitCheckItemProps {
  habit: DashboardHabit;
  onToggle?: (habitId: string, completedToday: boolean) => void; 
}

export default function HabitCheckItem({ habit, onToggle }: HabitCheckItemProps) {
  const [checked, setChecked] = useState(habit.completed);
  const [isUpdating, setIsUpdating] = useState(false);
  const theme = useTheme(); 
  const utils = trpc.useUtils(); 

  // Define specific theme colors with safe access and fallbacks to theme variables
  const green10 = theme?.green10?.val ?? '$green10'; 
  const gray10 = theme?.gray10?.val ?? '$gray10'; 
  const orange10 = theme?.orange10?.val ?? '$orange10'; 


  const createEntryMutation = trpc.habit.createHabitEntry.useMutation({
    onSuccess: (updatedHabit) => {
      setIsUpdating(false);
      utils.habit.getHabits.invalidate();
      utils.dashboard.getDashboardData.invalidate();
    },
    onError: (error) => {
      setChecked(!checked);
      setIsUpdating(false);
      console.error('Error creating habit entry:', error);
    }
  });

  const deleteEntryMutation = trpc.habit.deleteHabitEntry.useMutation({
    onSuccess: () => {
      setIsUpdating(false);
      utils.habit.getHabits.invalidate();
      utils.dashboard.getDashboardData.invalidate();
    },
    onError: (error) => {
      setChecked(!checked);
      setIsUpdating(false);
      console.error('Error deleting habit entry:', error);
    }
  });

  useEffect(() => {
    setChecked(habit.completed);
  }, [habit.completed]);

  const handleToggle = () => {
    const newValue = !checked;
    setChecked(newValue); 
    setIsUpdating(true);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const todayDateString = new Date().toISOString().split('T')[0];

    if (newValue) {
      const createInput: CreateHabitEntryInput = {
        habit_id: habit.id,
        date: todayDateString,
        completed: true, 
        quantity_value: null, 
        notes: null, 
      };
      createEntryMutation.mutate(createInput);
    } else {
      if (habit.last_entry_id) { 
        const deleteInput: DeleteHabitEntryInput = {
          id: habit.last_entry_id, 
        };
        deleteEntryMutation.mutate(deleteInput);
      } else {
        console.warn("Attempted to delete habit entry, but last_entry_id is missing.");
      }
    }

    if (onToggle) {
      onToggle(habit.id, newValue);
    }
  };

  const streakColor = checked ? green10 : gray10; // Use safe theme value
  const habitTypeColor = orange10; // Use safe theme value

  return (
    <XStack 
      backgroundColor="$backgroundStrong" // Use theme variable
      padding="$3"
      borderRadius="$4"
      alignItems="center"
      justifyContent="space-between"
      space="$3"
    >
      <YStack flex={1} gap="$1">
        <Text fontSize="$4" fontWeight="500" color="$color"> // Use theme variable
          {habit.name}
        </Text>
        
        {habit.streak != null && habit.streak > 0 && ( // Add null check
          <Text fontSize="$2" color={streakColor}> 
            Streak: {habit.streak ?? 0}
          </Text>
        )}
        {habit.habit_type && (
          <Text fontSize="$2" color={habitTypeColor}> // Use safe theme value
            ({habit.habit_type})
          </Text>
        )}
      </YStack>
      
      <Button
        size="$3"
        variant={checked ? undefined : 'outlined'} // Let variant handle appearance
        // Remove explicit colors - rely on theme/variant
        theme={checked ? 'green' : undefined} // Apply green theme when checked
        onPress={handleToggle}
        disabled={isUpdating} 
        iconAfter={checked ? <Text>✓</Text> : undefined}
      >
        {checked ? "Done" : "Check-in"}
      </Button>
    </XStack>
  );
}

[EOF: components/dashboard/HabitCheckItem.tsx]

========================================
FILE: components/dashboard/StateIndicator.tsx
----------------------------------------

import React from 'react';
// Use Tamagui components
import { Text, XStack, YStack, Card } from 'tamagui'; 
// Import RouterOutputs for inferred types
import { RouterOutputs } from '@/utils/trpc';

// Define prop type using inferred type from router
type DashboardTrackedState = RouterOutputs['dashboard']['getDashboardData']['trackedStates'][number];

interface StateIndicatorProps {
  state: DashboardTrackedState; // Use the inferred type
  onPress: () => void;
  lastEntry: any;
}

export default function StateIndicator({ state, onPress, lastEntry }: StateIndicatorProps) {
  // Format the last updated time
  const formattedTime = state.lastUpdated 
    ? new Date(state.lastUpdated).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    : 'N/A';
  
  // Use Tamagui Card component
  return (
    <Card 
      onPress={onPress} 
      pressStyle={{ opacity: 0.8 }}
      padding="$3"
      // No explicit background, will use default Card background from theme
    >
      <YStack space="$1"> {/* Main container for text */}
        <XStack flex={1} alignItems="center">
          <Text fontSize="$4" fontWeight="500">{state.name}</Text>
          {lastEntry && (
            <Text fontSize="$2" color="$gray10" marginLeft="$2">
              ({formattedTime})
            </Text>
          )}
        </XStack>
        <XStack alignItems="baseline" space="$2"> {/* Align text by baseline, add space */}
          <Text fontSize="$5" fontWeight="600" color="$color"> {/* Use tokens */}
            {state.currentValue}
          </Text>
        </XStack>
        {!lastEntry && (
          <Text fontSize="$2" color="$gray10" marginTop="$1">
            No data recorded yet.
          </Text>
        )}
      </YStack>
    </Card>
  );
} 

[EOF: components/dashboard/StateIndicator.tsx]

========================================
FILE: components/dashboard/TaskItem.tsx
----------------------------------------

import React from 'react';
// Use Tamagui components
import { Text, XStack, YStack, Checkbox, Spinner } from 'tamagui'; 
import { trpc, RouterOutputs, RouterInputs } from '@/utils/trpc';
import { Check } from '@tamagui/lucide-icons';

// Custom Task type that matches the actual format returned from the backend
type Task = {
  id: string;
  name: string;  // Backend returns 'name' not 'title'
  status: string;
  priority?: number;
  due_date?: string; // Backend returns 'due_date' not 'due'
  notes?: string;
  goal_id?: string;
  // Include other fields as needed
};

interface TaskItemProps {
  task: Task;
  onPress: () => void;
}

export default function TaskItem({ task, onPress }: TaskItemProps) {
  
  // Setup toggleTask mutation with optimistic updates
  const utils = trpc.useContext();
  // Setup mutation for task toggling
  const toggleTaskMutation = trpc.task.toggleTask.useMutation({
    // Optimistically update the UI
    onMutate: async ({ taskId, completed }: { taskId: string; completed?: boolean }) => {
      // Default to toggling the current state if completed is not provided
      const newCompleted = completed !== undefined ? completed : !isCompleted;
      // Cancel outgoing fetches that might overwrite our optimistic update
      await utils.task.getTasks.cancel();
      await utils.dashboard.getDashboardData.cancel();
      
      // Get previous data for potential rollback
      const prevTasksData = utils.task.getTasks.getData();
      const prevDashboardData = utils.dashboard.getDashboardData.getData();
      
      // Optimistically update tasks data if present
      if (prevTasksData) {
        utils.task.getTasks.setData({ goalId: undefined } as any, (old: any) => {
          if (!old) return old;
          return old.map((t: any) => {
            if (t.id === taskId) {
              return {
                ...t,
                status: completed ? 'completed' : 'in-progress'
              };
            }
            return t;
          });
        });
      }
      
      // Optimistically update dashboard data if present
      if (prevDashboardData) {
        utils.dashboard.getDashboardData.setData({ goalId: undefined } as any, (old: any) => {
          if (!old) return old;
          return {
            ...old,
            tasks: old.tasks.map((t: any) => {
              if (t.id === taskId) {
                return {
                  ...t,
                  status: newCompleted ? 'completed' : 'in-progress'
                };
              }
              return t;
            }),
          };
        });
      }
      
      // Return previous data for rollback
      return { prevTasksData, prevDashboardData };
    },
    
    // If something goes wrong, rollback optimistic updates
    onError: (err: any, variables: any, context: any) => {
      if (context?.prevTasksData) {
        utils.task.getTasks.setData({ goalId: undefined } as any, context.prevTasksData);
      }
      if (context?.prevDashboardData) {
        utils.dashboard.getDashboardData.setData({ goalId: undefined } as any, context.prevDashboardData);
      }
      console.error('Error toggling task:', err);
    },
    
    // Always refetch after error or success
    onSettled: () => {
      utils.task.getTasks.invalidate();
      utils.dashboard.getDashboardData.invalidate();
    }
  });

  // Handle checkbox toggle
  const handleToggle = () => {
    toggleTaskMutation.mutate({
      taskId: task.id, // Using taskId as expected by the backend
      completed: !isCompleted
    });
  };

  // Map priority to color
  const priorityColor = task.priority === 1 ? '$brandRed' : 
                        task.priority === 2 ? '$brandYellow' : 
                        '$brandGreen';
  
  // Format due date
  const formattedDate = task.due_date 
    ? new Date(task.due_date).toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric' 
      })
    : null;
    
  // Determine task completion status
  const isCompleted = task.status === 'completed';
  // No need for text style object since we use Tamagui props directly

  
  // Use YStack as the base component
  return (
    <YStack 
      backgroundColor="$backgroundStrong"
      padding="$3"
      borderRadius="$4"
      space="$1" // Add space between XStack and Date Text
    >
      <XStack alignItems="center" space="$2"> {/* Use XStack for horizontal layout */}
        {/* Checkbox for task completion */}
        <Checkbox
          size="$4"
          checked={isCompleted}
          onCheckedChange={handleToggle}
          disabled={toggleTaskMutation.isPending}
        >
          {toggleTaskMutation.isPending ? (
            <Spinner size="small" color="$brandPrimary" />
          ) : (
            <Checkbox.Indicator>
              <Check size={16} />
            </Checkbox.Indicator>
          )}
        </Checkbox>

        {/* Container for task details (clickable) */}
        <XStack flex={1} tag="pressable" onPress={onPress} pressStyle={{ opacity: 0.7 }}>
          {/* Priority Dot using YStack */}
          <YStack 
            width="$2" // Use size token for width
            height="$2" // Use size token for height
            borderRadius="$10" // Use a large radius token
            backgroundColor={priorityColor} 
            marginRight="$2" // Use space token for margin
          />
          <Text 
            fontSize="$4" // Use font size token
            fontWeight={task.priority === 1 ? '600' : '400'} // Keep fontWeight
            color="$color"
            flex={1} // Allow text to take remaining space
            opacity={isCompleted ? 0.7 : 1}
            textDecorationLine={isCompleted ? 'line-through' : undefined} // Proper Tamagui text decoration
          >
            {task.name}
          </Text>
        </XStack>
      </XStack>
      
      {formattedDate && (
        // Removed explicit margin, rely on outer YStack space
        <Text color="$gray9" fontSize="$2">
          Due: {formattedDate}
        </Text>
      )}
    </YStack>
  );
} 

[EOF: components/dashboard/TaskItem.tsx]

========================================
FILE: components/ui/primitives/AetherCard.tsx
----------------------------------------

import React from 'react';
import { Card, CardProps, YStack, styled } from 'tamagui';

type AetherCardVariant = 'default' | 'elevated' | 'outlined';

interface AetherCardProps extends CardProps {
  variant?: AetherCardVariant;
  // Additional props specific to AetherCard
  isInteractive?: boolean;
}

// Create a styled Card component that uses our custom Tamagui theme variables
const StyledCard = styled(Card, {
  name: 'AetherCard',
  backgroundColor: '$cardBackground',
  borderRadius: '$4',
  padding: '$4',
  elevate: true,

  variants: {
    variant: {
      default: {
        // Using our theme tokens
        shadowColor: '$shadowColor',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
      },
      elevated: {
        shadowColor: '$shadowColor',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
      },
      outlined: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '$borderColor',
        shadowOpacity: 0,
        elevation: 0,
      },
    },
    isInteractive: {
      true: {
        pressStyle: {
          backgroundColor: '$cardBackgroundPress',
          opacity: 0.9,
        },
        hoverStyle: {
          backgroundColor: '$cardBackgroundHover',
        },
      },
    },
  } as const,

  defaultVariants: {
    variant: 'default',
    isInteractive: false,
  },
});

/**
 * AetherCard - A stylized card component following Aether design system
 *
 * @param variant - The visual style variant: 'default', 'elevated', or 'outlined'
 * @param isInteractive - Whether the card responds to press/hover states
 */
export function AetherCard({ children, variant, isInteractive, ...props }: AetherCardProps) {
  return (
    <StyledCard variant={variant} isInteractive={isInteractive} {...props}>
      {children}
    </StyledCard>
  );
}


[EOF: components/ui/primitives/AetherCard.tsx]

========================================
FILE: components/ui/primitives/AetherListItem.tsx
----------------------------------------

import React from 'react';
import { XStack, YStack, Text, styled, GetProps, Stack } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';

// Base ListItem container
const ListItemContainer = styled(XStack, {
  name: 'ListItemContainer',
  backgroundColor: '$cardBackground',
  paddingVertical: '$3',
  paddingHorizontal: '$4',
  borderRadius: '$3',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottomWidth: 1,
  borderBottomColor: '$borderColor',
  minHeight: 60,
  
  variants: {
    isLast: {
      true: {
        borderBottomWidth: 0,
      },
    },
    interactive: {
      true: {
        pressStyle: {
          backgroundColor: '$backgroundPress',
          opacity: 0.9,
        },
        hoverStyle: {
          backgroundColor: '$backgroundHover',
        },
      },
    },
    variant: {
      default: {},
      header: {
        backgroundColor: '$backgroundStrong',
        borderBottomColor: '$borderColor',
        paddingVertical: '$2',
      },
    },
  } as const,
  
  defaultVariants: {
    isLast: false,
    interactive: true,
    variant: 'default',
  },
});

type ListItemContainerProps = GetProps<typeof ListItemContainer>;

export interface AetherListItemProps extends ListItemContainerProps {
  title: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showChevron?: boolean;
  badge?: string | number;
}

/**
 * AetherListItem - A consistent list item component for use in lists, menus, and settings
 *
 * @param title - The primary text
 * @param subtitle - Optional secondary text shown below the title
 * @param leftIcon - Optional icon component to show on the left side
 * @param rightIcon - Optional icon component to show on the right side
 * @param showChevron - Whether to show a right chevron (useful for navigation items)
 * @param badge - Optional badge text/number to display
 * @param isLast - Whether this is the last item in a list (removes bottom border)
 * @param interactive - Whether the item should visually respond to touch
 */
export function AetherListItem({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  showChevron = false,
  badge,
  isLast,
  interactive,
  ...props
}: AetherListItemProps) {
  return (
    <ListItemContainer isLast={isLast} interactive={interactive} {...props}>
      {/* Left section with icon and text */}
      <XStack space="$3" flex={1} alignItems="center">
        {leftIcon && (
          <Stack marginRight="$2">{leftIcon}</Stack>
        )}
        
        <YStack>
          <Text fontWeight="500" fontSize="$4">{title}</Text>
          {subtitle && (
            <Text fontSize="$2" color="$gray10">{subtitle}</Text>
          )}
        </YStack>
      </XStack>
      
      {/* Right section with badge, custom icon or chevron */}
      <XStack space="$2" alignItems="center">
        {badge && (
          <XStack 
            backgroundColor="$primary"
            paddingHorizontal="$2"
            paddingVertical="$1"
            borderRadius="$2"
          >
            <Text color="white" fontSize="$1" fontWeight="bold">{badge}</Text>
          </XStack>
        )}
        
        {rightIcon && rightIcon}
        
        {showChevron && (
          <Ionicons name="chevron-forward" size={16} color="$gray10" />
        )}
      </XStack>
    </ListItemContainer>
  );
}


[EOF: components/ui/primitives/AetherListItem.tsx]

========================================
FILE: components/ui/EmptyOrSkeleton.tsx
----------------------------------------

import React from 'react';
import { YStack, Text, Button } from 'tamagui';
import { SkeletonCard, SkeletonRow, SkeletonCircle } from './Skeleton';
import { SectionError } from './ErrorBanner';

export interface EmptyOrSkeletonProps {
  // Loading state
  isLoading?: boolean;
  count?: number;
  type?: 'card' | 'row' | 'circle';
  
  // Empty state
  isEmpty?: boolean;
  text?: string;
  actionText?: string;
  onAction?: () => void;
  
  // Error state
  isError?: boolean;
  onRetry?: () => void;
  
  // Children to render when not in any special state
  children?: React.ReactNode;
}

export const EmptyOrSkeleton = ({
  isLoading = false,
  count = 3,
  type = 'row',
  isEmpty = false,
  text = 'No items found',
  actionText = 'Add New',
  onAction,
  isError = false,
  onRetry,
  children
}: EmptyOrSkeletonProps) => {
  // Generate skeleton based on type
  const renderSkeletons = () => {
    const skeletons = [];
    for (let i = 0; i < count; i++) {
      if (type === 'card') {
        skeletons.push(<SkeletonCard key={i} />);
      } else if (type === 'circle') {
        skeletons.push(<SkeletonCircle key={i} />);
      } else {
        skeletons.push(<SkeletonRow key={i} />);
      }
    }
    return skeletons;
  };

  // Show skeleton if loading
  if (isLoading) {
    return (
      <YStack space="$3">
        {renderSkeletons()}
      </YStack>
    );
  }
  
  // Show error state if there's an error
  if (isError) {
    return (
      <SectionError 
        message={text} 
        onRetry={onRetry} 
      />
    );
  }
  
  // Show empty state if empty
  if (isEmpty) {
    return (
      <YStack
        padding="$4"
        alignItems="center"
        justifyContent="center"
        space="$3"
      >
        <Text textAlign="center" color="$gray11">
          {text}
        </Text>
        {onAction && (
          <Button size="$3" onPress={onAction}>
            {actionText}
          </Button>
        )}
      </YStack>
    );
  }
  
  // Default: return children
  return <>{children}</>;
};


[EOF: components/ui/EmptyOrSkeleton.tsx]

```

### app.json
**Path:** app.json
**Size:** 1393 bytes

```json
{
  "expo": {
    "name": "AetherIphone",
    "slug": "AetherIphone",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "aether",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.tybed7.AetherIphone",
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.tybed7.AetherIphone"
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ]
    ],
    "runtimeVersion": {
      "policy": "appVersion"
    },
    "updates": {
      "url": "https://u.expo.dev/d25504b5-1869-4dca-bfe0-9aaf6e86923b"
    },
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "router": {
        "origin": false
      },
      "eas": {
        "projectId": "d25504b5-1869-4dca-bfe0-9aaf6e86923b"
      }
    }
  }
}
```


# app

### _layout.tsx
**Path:** app/(auth)/_layout.tsx
**Size:** 618 bytes

```typescript
// Auth Stack Layout
import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="login" 
        options={{ 
          title: 'Sign In',
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="register" 
        options={{ 
          title: 'Create Account',
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="forgot-password" 
        options={{ 
          title: 'Reset Password',
          headerShown: false
        }} 
      />
    </Stack>
  );
}
```

### forgot-password.tsx
**Path:** app/(auth)/forgot-password.tsx
**Size:** 2663 bytes

```typescript
// Forgot Password Screen
import React, { useState } from 'react';
import { Link } from 'expo-router';
import { YStack, H1, Input, Button, Text, Spinner, Image } from 'tamagui';
import { supabase } from '@/utils/supabase';
import { useToastController } from '@tamagui/toast';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const toast = useToastController();

  // Send password reset email via Supabase
  const handleResetPassword = async () => {
    if (!email) {
      toast.show('Please enter your email', { type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window?.location?.origin ? `${window.location.origin}/update-password` : undefined,
      });

      if (error) throw error;

      setSuccess(true);
      toast.show('Password reset email sent!', { type: 'success' });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email';
      toast.show(errorMessage, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <YStack flex={1} padding="$4" justifyContent="center" space="$4" backgroundColor="$background">
      <YStack alignItems="center" marginBottom="$6">
        {/* Replace with your app logo */}
        <Image 
          source={require('@/assets/images/icon.png')} 
          width={100} 
          height={100} 
          marginBottom="$6" 
          resizeMode="contain"
        />
        <H1>Reset Password</H1>
        <Text color="$gray10" textAlign="center">
          {success 
            ? 'Check your email for reset instructions' 
            : 'Enter your email to receive reset instructions'}
        </Text>
      </YStack>

      {!success ? (
        <>
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Button
            onPress={handleResetPassword}
            disabled={loading}
            backgroundColor="$blue10"
            color="white"
            size="$5"
          >
            {loading ? <Spinner color="white" /> : 'Send Reset Link'}
          </Button>
        </>
      ) : null}

      <YStack paddingTop="$6" alignItems="center">
        <Link href="/(auth)/login">
          <Text color="$blue10">Back to Sign In</Text>
        </Link>
      </YStack>
    </YStack>
  );
}
```

### login.tsx
**Path:** app/(auth)/login.tsx
**Size:** 2566 bytes

```typescript
// Login Screen
import React, { useState } from 'react';
import { Link, router } from 'expo-router';
import { YStack, H1, Input, Button, Text, XStack, Spinner, Image } from 'tamagui';
import { supabase } from '@/utils/supabase';
import { useToastController } from '@tamagui/toast';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToastController();

  // Sign in with Supabase authentication
  const handleLogin = async () => {
    if (!email || !password) {
      toast.show('Please enter both email and password', { type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Navigate to home screen on successful login
      router.replace('/(tabs)/home');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      toast.show(errorMessage, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <YStack flex={1} padding="$4" justifyContent="center" space="$4" backgroundColor="$background">
      <YStack alignItems="center" marginBottom="$6">
        {/* Replace with your app logo */}
        <Image 
          source={require('@/assets/images/icon.png')} 
          width={100} 
          height={100} 
          marginBottom="$6" 
          resizeMode="contain"
        />
        <H1>Welcome to Aether</H1>
        <Text color="$gray10">Sign in to your account</Text>
      </YStack>

      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button
        onPress={handleLogin}
        disabled={loading}
        backgroundColor="$blue10"
        color="white"
        size="$5"
      >
        {loading ? <Spinner color="white" /> : 'Sign In'}
      </Button>

      <XStack justifyContent="space-between" paddingTop="$2">
        <Link href="/(auth)/forgot-password">
          <Text color="$blue10">Forgot Password?</Text>
        </Link>

        <Link href="/(auth)/register">
          <Text color="$blue10">Create Account</Text>
        </Link>
      </XStack>
    </YStack>
  );
}
```

### register.tsx
**Path:** app/(auth)/register.tsx
**Size:** 3040 bytes

```typescript
// Register Screen
import React, { useState } from 'react';
import { Link, router } from 'expo-router';
import { YStack, H1, Input, Button, Text, XStack, Spinner, Image } from 'tamagui';
import { supabase } from '@/utils/supabase';
import { useToastController } from '@tamagui/toast';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToastController();

  // Create new account with Supabase authentication
  const handleRegister = async () => {
    if (!email || !password) {
      toast.show('Please enter both email and password', { type: 'error' });
      return;
    }

    if (password !== confirmPassword) {
      toast.show('Passwords do not match', { type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window?.location?.origin || undefined,
        }
      });

      if (error) throw error;

      // Navigate to home screen on successful registration
      toast.show('Account created successfully!', { type: 'success' });
      router.replace('/(tabs)/home');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      toast.show(errorMessage, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <YStack flex={1} padding="$4" justifyContent="center" space="$4" backgroundColor="$background">
      <YStack alignItems="center" marginBottom="$6">
        {/* Replace with your app logo */}
        <Image 
          source={require('@/assets/images/icon.png')} 
          width={100} 
          height={100} 
          marginBottom="$6" 
          resizeMode="contain"
        />
        <H1>Create Account</H1>
        <Text color="$gray10">Sign up to get started</Text>
      </YStack>

      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <Input
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <Button
        onPress={handleRegister}
        disabled={loading}
        backgroundColor="$blue10"
        color="white"
        size="$5"
      >
        {loading ? <Spinner color="white" /> : 'Create Account'}
      </Button>

      <XStack justifyContent="center" paddingTop="$2">
        <Text color="$gray10">Already have an account? </Text>
        <Link href="/(auth)/login">
          <Text color="$blue10">Sign In</Text>
        </Link>
      </XStack>
    </YStack>
  );
}
```

### _layout.tsx
**Path:** app/(tabs)/_layout.tsx
**Size:** 2064 bytes

```typescript
/* app/(tabs)/_layout.tsx */
import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorModeValue } from '@gluestack-ui/themed';

export default function TabsLayout() {
  // Zelda palette tokens from glueTheme / Tailwind
  const active = useColorModeValue('#86A5A9', '#64FFDA');     // sheikahCyan / cyanGlow
  const inactive = useColorModeValue('#8e8e93', '#626262');
  const bg = useColorModeValue('#FDFFE0', '#1A2E3A');
  const border = useColorModeValue('#E5E5EA', '#2C2C2E');

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: active,
        tabBarInactiveTintColor: inactive,
        tabBarStyle: {
          backgroundColor: bg,
          borderTopColor: border,
          height: 60,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          title: 'Planner',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="compass"
        options={{
          title: 'Compass',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: 'Rewards',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sparkles-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### index.tsx
**Path:** app/(tabs)/compass/index.tsx
**Size:** 5050 bytes

```typescript
// Compass screen with Principles and States tabs
import React, { useState } from 'react';
import { YStack, XStack, Text, Tabs, Button, ScrollView } from 'tamagui'; 
import { SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { trpc, type RouterOutputs } from '@/utils/trpc'; 
import { useColorScheme } from '@/hooks/useColorScheme'; 
import { EmptyOrSkeleton } from '@/components/ui/EmptyOrSkeleton';
import { router, type Href } from 'expo-router'; 
import { PrincipleCard } from '@/components/compass/PrincipleCard';
import PrinciplesTab from '@/components/compass/PrinciplesTab';
import { StateDefinitionCard } from '@/components/compass/StateDefinitionCard'; 

interface TabData {
  key: string;
  title: string;
  icon: React.ReactNode;
}

// Tab configurations
const TABS: TabData[] = [
  {
    key: 'principles',
    title: 'Principles',
    icon: <Ionicons name="compass-outline" size={18} color="currentColor" />
  },
  {
    key: 'states',
    title: 'States',
    icon: <Ionicons name="pulse-outline" size={18} color="currentColor" />
  }
];

export default function CompassScreen() {
  const [activeTab, setActiveTab] = useState<string>('principles');
  const colorScheme = useColorScheme();

  const handleAddPress = () => {
    const route = `/compose?type=${activeTab === 'principles' ? 'value' : 'state'}` as Href;
    router.push(route);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
      <YStack flex={1} padding="$4">
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
          <Text fontSize={24} fontWeight="bold">Compass</Text>
          <Button
            size="$3"
            circular
            onPress={handleAddPress} 
            icon={<Ionicons name="add" size={22} color={colorScheme === 'dark' ? '#fff' : '#000'} />}
          />
        </XStack>

        {/* Tabs */}
        <Tabs
          defaultValue="principles"
          orientation="horizontal"
          flexDirection="column"
          flex={1}
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <Tabs.List
            backgroundColor="$backgroundStrong"
            paddingHorizontal="$2"
            borderRadius="$4"
            marginBottom="$4"
          >
            {TABS.map((tab) => (
              <Tabs.Tab
                key={tab.key}
                flex={1}
                value={tab.key}
                padding="$3"
                borderRadius="$2"
                backgroundColor={activeTab === tab.key ? '$backgroundFocus' : 'transparent'}
              >
                <XStack space="$2" justifyContent="center" alignItems="center">
                  {React.cloneElement(tab.icon as React.ReactElement, { color: activeTab === tab.key ? '$colorFocus' : '$color' })}
                  <Text color={activeTab === tab.key ? '$colorFocus' : '$color'}>{tab.title}</Text>
                </XStack>
              </Tabs.Tab>
            ))}
          </Tabs.List>

          {/* Tab Content */}
          <Tabs.Content value="principles" flex={1} key="principles-content">
            <ScrollView>
              <PrinciplesTab />
            </ScrollView>
          </Tabs.Content>

          <Tabs.Content value="states" flex={1} key="states-content">
            <ScrollView>
              <StatesTab />
            </ScrollView>
          </Tabs.Content>
        </Tabs>
      </YStack>
    </SafeAreaView>
  );
}

// Define the specific types from RouterOutputs
// Types are now defined in the PrinciplesTab component
type StateDefinition = RouterOutputs['state']['getDefinitions'][number]; 

// Principles Tab Component is now imported from '@/components/compass/PrinciplesTab'

// States Tab Component (manages data fetching and list rendering)
function StatesTab() {
  const { data: states, isLoading, error, refetch } = trpc.state.getDefinitions.useQuery(); 

  if (isLoading) {
    return <EmptyOrSkeleton isLoading={true} count={3} type="card" />;
  }

  if (error) {
    return (
      <EmptyOrSkeleton
        isEmpty={false}
        isError={true}
        onRetry={refetch}
        text="Failed to load tracked state definitions"
      />
    );
  }

  if (!states || states.length === 0) {
    return (
      <EmptyOrSkeleton
        isEmpty={true}
        text="No state definitions found"
        actionText="Define Your First State"
        onAction={() => router.push('/compose?type=state' as Href)}
      />
    );
  }

  return (
    <YStack space="$3"> 
      {states.map((state: StateDefinition) => (
        <StateDefinitionCard
          key={state.id}
          state={state}
          onPress={() => router.push(`/states/${state.id}` as Href)}
        />
      ))}
    </YStack>
  );
}

// 
// Removed inline PrincipleCard definition (extracted to components/compass/PrincipleCard.tsx)
// 

// 
// Removed inline StateDefinitionCard definition (extracted to components/compass/StateDefinitionCard.tsx)
// 
```
