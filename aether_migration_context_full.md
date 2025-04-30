# Aether iPhone: Complete Migration Context
Generated on Wed Apr 30 03:26:08 CDT 2025



# 📋 Table of Contents
Navigation for this comprehensive document.

1. [Project Overview & Migration Plan](#1️⃣-project-overview--migration-plan)
2. [Configuration Files](#2️⃣-configuration-files)
3. [Design System Migration](#3️⃣-design-system-migration)
4. [Provider Architecture](#4️⃣-provider-architecture)
5. [UI Components](#5️⃣-ui-components)
6. [App Screens](#6️⃣-app-screens)
7. [Backend & Data Layer](#7️⃣-backend--data-layer)
8. [Utilities & Hooks](#8️⃣-utilities--hooks)
9. [Zelda Styling Guide](#9️⃣-zelda-styling-guide)
10. [Assets & Files](#🎨-assets--files)
11. [Testing](#📊-testing)
12. [Supabase Integration](#💾-supabase-integration)



# 1️⃣ Project Overview & Migration Plan
Top-level overview and plan for Tamagui → Gluestack/NativeWind migration.

## Refactoring Plan

File-by-file work-order for the frontend refactor.
* Top-level paths follow an Expo Router layout (app/…)
* 🔮 marks assumptions to be confirmed

### 1️⃣ Core Design System (/design-system)

| File | Action | Depends on | Why |
| --- | --- | --- | --- |
| tokens.ts | keep → export Tailwind-ready object instead of Tamagui createTokens | n/a | single source for color / spacing across Gluestack and NativeWind |
| theme.glue.ts | new – export const gluestackTheme = {tokens, components} | tokens.ts, Gluestack | wires Zelda palette + fonts into Gluestack provider |
| tailwind.config.js | rewrite with content: ["app/**/*.{tsx,ts}"] + colors from tokens | tokens.ts, NativeWind | unlocks className="bg-parchment" etc. in JSX |
| Primitives.tsx | new – <Stack> <Text> <Button> wrappers ⮕ Gluestack equivalents | gluestackTheme | lets old code migrate screen-by-screen w/out mass edits |
| Animations.ts | new – reusable Moti presets (fadeInUp, runePulse) | moti, react-native-reanimated | consistent motion language |

### 2️⃣ Global Providers

| File | Action | Depends on | Why |
| --- | --- | --- | --- |
| app/_layout.tsx | rewrite – wrap with <GluestackProvider theme={gluestackTheme}>, <TRPCProvider>, <SupabaseProvider> | theme.glue.ts, 🔮 TRPCProvider, 🔮 SupabaseProvider | guarantees every screen sees styled components + auth + queries |
| providers/TRPCProvider.tsx | new – instantiates trpc.createClient() + React Query | @trpc/client, @tanstack/react-query | centralises tRPC; screens just useTRPCQuery() |

### 3️⃣ Navigation Shells

| File | Action | Depends on | Why |
| --- | --- | --- | --- |
| app/(tabs)/_layout.tsx | keep – Expo Router structure (tho migrate Tamagui instances) | n/a | tab layout doesn't need much refactoring |
| app/(auth)/_layout.tsx | keep – Expo Router structure (tho migrate Tamagui instances) | n/a | auth layout doesn't need much refactoring |

### 4️⃣ Reusable UI Components

| File | Action | Depends on | Why |
| --- | --- | --- | --- |
| SwipeableRow.tsx | implement – left swipe to Complete, right swipe to Delete | react-native-gesture-handler, react-native-reanimated | enables task status changes with haptic confirmation |
| TaskRow.tsx | implement – task row formatting for to-do lists | SwipeableRow | consistent per-task presentation (name, due date, etc) |
| SectionCard.tsx | implement – glazed Sheikah-glass card section | tokens, useColorScheme | consistent dashboard UI module |

### 5️⃣ Feature Screens Migration
Migrate each one with an index.gluestack.tsx, leave old versions until each can be tested.

| Screen | New Path | Action |
| --- | --- | --- |
| Dashboard | app/(tabs)/home/index.gluestack.tsx | Implement "Task Swipe → Done" with SectionCard + Gluestack |
| Planner | app/(tabs)/planner/index.gluestack.tsx | Migrate later | 
| Compass | app/(tabs)/compass/index.gluestack.tsx | Migrate later |
| Rewards | app/(tabs)/rewards/index.gluestack.tsx | Migrate later |
| Settings | app/(tabs)/settings/index.gluestack.tsx | Migrate later |

### 6️⃣ Utility Hooks

| File | Action | Depends on | Why |
| --- | --- | --- | --- |
| useDashboardQuery.ts | implement – fetches active tasks, habits, goals via tRPC | TRPCProvider, React Query | clean abstraction to get status summary |
| useToggleTaskStatus.ts | implement – mutates task status w/ optimistic update | TRPCProvider, React Query | toggle task (complete/not) with onSuccess/onError hooks |

### package.json
**Path:** package.json
**Description:** Current dependencies and scripts

```json
{
  "name": "aetheriphone",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "private": true,

  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "expo lint",
    "generate": "node ./scripts/generate-all.js",
    "dev": "npm run generate && expo start"
  },

  "dependencies": {
    "@tamagui/lucide-icons": "1.126.1",
    "@gluestack-ui/themed": "^1.1.73",
    "nativewind": "^4.1.23",
    "react-native-reanimated": "^3.17.5",
    "expo-router": "~4.0.20",
    "expo": "~52.0.46",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "react-native": "0.76.9",
    "expo-dev-client": "~5.0.20",
    "expo-constants": "~17.0.8",
    "expo-font": "~13.0.4",
    "expo-haptics": "~14.0.1",
    "expo-linking": "~7.0.5",
    "expo-splash-screen": "~0.29.24",
    "expo-status-bar": "~2.0.1",
    "expo-web-browser": "~14.0.2",

    "@react-navigation/native": "^7.0.14",
    "@react-navigation/bottom-tabs": "^7.2.0",
    "react-native-gesture-handler": "^2.25.0",
    "react-native-screens": "~4.4.0",
    "react-native-safe-area-context": "4.12.0",

    "@gluestack-ui/config": "^1.1.20",
    "@expo/vector-icons": "^14.0.2",
    "moti": "^0.30.0",
    "react-native-swipe-list-view": "^3.2.9",
    "@shopify/flash-list": "^1.8.0",

    "@tanstack/react-query": "^5.74.4",
    "@tanstack/query-async-storage-persister": "^5.74.4",
    "@tanstack/react-query-persist-client": "^5.74.4",
    "zustand": "^5.0.3",

    "@trpc/client": "^11.1.0",
    "@trpc/react-query": "^11.1.0",
    "@supabase/supabase-js": "^2.49.4",
    "expo-blur": "~14.0.3",
    "lottie-react-native": "7.1.0",
    "react-native-svg": "15.8.0",
    "expo-secure-store": "^14.0.1",

    "date-fns": "^4.1.0",
    "burnt": "^0.13.0",
    "text-encoding": "^0.7.0",
    "react-native-url-polyfill": "^2.0.0",

    "@tamagui/core": "1.126.1",
    "@tamagui/stacks": "1.126.1",
    "@tamagui/toast": "1.126.1",
    "@tamagui/themes": "1.126.1",
    "tamagui": "1.126.1"
  },

  "devDependencies": {
    "@types/react": "~18.3.12",
    "@types/react-test-renderer": "^18.3.0",
    "@testing-library/react-native": "^13.2.0",
    "jest-expo": "~52.0.6",
    "eslint": "^8.57.0",
    "eslint-config-expo": "~8.0.1",
    "nativewind": "^4.1.23",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.3.3"
  },

  "resolutions": {
    "@gluestack-ui/config": "^1.1.20",
    "react-native-gesture-handler": "^2.25.0"
  }
}
```

### README.md
**Path:** README.md
**Description:** Project documentation

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

### refactoring_plan.md
**Path:** refactoring_plan.md
**Description:** Migration plan details

```markdown
# Aether iOS App – Comprehensive Refactor Plan

> **Last updated:** 2025-04-27
>
> This document lays out, in exhaustive detail, how every screen, component, and data interaction in the app should be structured.  It weaves together best-practice guidance from **Expo**, **Tamagui**, **tRPC**, and **Supabase**.

---

## 1  Objectives

1.  Fully embrace iOS design conventions while staying cross-platform-ready.
2.  Establish a robust data layer (tRPC ⇄ Supabase) with offline resilience.
3.  Standardise UI via Tamagui tokens, themes, and reusable components.
4.  Tighten navigation, error handling, accessibility, and performance.
5.  Automate quality via tests and CI/EAS pipelines.

---

## 2  Guiding Principles & Key Packages

| Domain  | Principle | Practical Rules |
|---------|-----------|-----------------|
| **Expo** | Lean on file-based routing (Expo Router) and EAS Build/Submit. | • Keep `_layout.tsx` files focused on navigator config.<br>• Use `expo-constants` + `expo-secure-store` for env secrets in client.<br>• Always wrap root in `SafeAreaProvider`.<br>• Use `expo-updates` channels for staging & prod. |
| **Tamagui** | Treat `tamagui.config.ts` as single source of design truth. | • Reference tokens (`$blue9`, `$space.3`) – never hard-code.<br>• Theme switching: system‐color-scheme by default (re-enable once light theme stabilised).<br>• Respect iOS HIG: generous whitespace & 16 pt default body.<br>• Use `YStack/XStack` instead of `View`/`Row`. |
| **tRPC** | End-to-end types, react-query integration. | • Each model gets `list`, `getById`, `create`, `update`, `delete` procedures.<br>• Split routers by domain (goalRouter, habitRouter, taskRouter, authRouter).<br>• Authed links inject Supabase JWT, refresh on 401. |
| **Supabase** | Postgres + RLS for multitenancy. | • Tables: `goals`, `habits`, `tasks`, `habit_entries`, `rewards`.<br>• Use row-level security: policy `user_id = auth.uid()`.<br>• Database schema lives in `/supabase/migrations`. |

---

## 3  Navigation Hierarchy

```
app/
  _layout.tsx          ← root Stack (auth-gate)
  index.tsx            ← redirects based on auth
  (auth)/              ← login / register / forgot-password
  (tabs)/              ← MainBottomTabs
    _layout.tsx        ← Tab navigator
    home/
      index.tsx        ← Dashboard
    compass/
      index.tsx        ← Analytics / insights
    planner/
      _layout.tsx      ← Planner stack
      index.tsx        ← Master lists (Goals / Habits / Tasks)
      add-goal.tsx
      add-habit.tsx
      add-task.tsx
      goal/[id].tsx
      habit/[id].tsx
    rewards/
      index.tsx        ← Points & redemptions
    settings/
      _layout.tsx      ← Settings stack
      index.tsx        ← List of subsections
      profile.tsx • security.tsx • notifications.tsx • privacy.tsx • about.tsx • help.tsx
```

**Modal vs Push**  
Creation screens (`add-*`) open as **modal** (`presentation:"modal"` in route options). Detail screens push onto Planner stack.

---

## 4  Screen-by-Screen Specs

### 4.1  Home (`(tabs)/home/index.tsx`)
| Concern | Specification |
|---------|---------------|
| **Purpose** | Daily snapshot: goals progress, today’s habits, upcoming tasks. |
| **Data** | `trpc.dashboard.getDashboardData.useQuery()` returns:<br>• `todayHabits: HabitWithEntryStatus[]`<br>• `upcomingTasks: Task[]`<br>• `goalProgress: GoalProgressSummary[]` |
| **UI Layout** | `ScrollView` inside `SafeAreaView`<br>1.  Header (date, greeting).<br>2.  Quick actions (`Add Habit`, `Add Task`).<br>3.  Sections (each uses `DashboardSection`). |
| **Components** | `GoalProgressCard`, `HabitCheckItem`, `TaskRow`, `EmptyOrSkeleton`, `SectionError`. |
| **State Flow** | • Loading → skeleton placeholders.<br>• Error → `SectionError` with retry.<br>• Success → render data. |
| **Interactions** | • Habit toggle → `trpc.habit.toggleEntry.useMutation()` (optimistic).<br>• Quick actions navigate to modal create screens. |

### 4.2  Planner Index (`(tabs)/planner/index.tsx`)
| | |
|---|---|
| **Purpose** | Full management: list, filter, search all goals/habits/tasks. |
| **Data** | Three queries in parallel with `useSuspenseQueries`:<br>• `trpc.goal.list`<br>• `trpc.habit.list`<br>• `trpc.task.list` |
| **UI** | Segmented control (`Tabs` from Tamagui) switching between lists.<br>Each list is a `FlatList` with pull-to-refresh.<br>FAB (`+`) opens context-aware create modal. |
| **Empty State** | Illustrated placeholder with “Create first x” button. |

### 4.3  Creation Modals (`add-goal.tsx`, `add-habit.tsx`, `add-task.tsx`)
* Use `react-hook-form` + `zodResolver` for validation.
* Fields follow tamagui `<Fieldset><Label><Input/></Fieldset>` pattern.
* Submit triggers appropriate `create` mutation; on success:
  1. Invalidate relevant list/dash queries via `queryClient.invalidateQueries()`.
  2. Show success toast (`Toast.show({message})`).
  3. Dismiss modal (`router.back()`).

### 4.4  Detail Screens
* Fetch by ID query.
* Show read-only view first, edit via top-right `Edit`.
* Edit toggles form mode; on save uses `update` mutation.
* Danger zone section for `Delete` (with confirmation alert).  

### 4.5  Compass & Rewards (MVP)
* Placeholder charts via `react-native-svg` + `victory-native`.
* Data endpoints to be defined later (analytics / point ledger).

### 4.6  Settings Stack
* Grouped list UI (`ListItem` with chevron).
* Each subsection is a simple form or markdown doc.

---

## 5  Reusable Components Library
| Component | Description | Notes |
|-----------|-------------|-------|
| `DashboardSection` | Card-like container with title & optional action. | Accepts `isLoading`, `isError`, etc. |
| `EmptyOrSkeleton` | Wrapper deciding Skeleton / Empty state / children. | Centralises UX logic. |
| `SectionError` | Banner with retry button. | Use $gray3 background, $red9 accents. |
| `ProgressRing` | Circular SVG progress. | Now typed with `ColorTokens`. |
| `FormField` | Label + Input + error msg. | Driven by RHF context. |
| `ToastViewport` | Safe-area aware toasts (already implemented). | |

---

## 6  State & Logic
* **Zustand stores**: `uiStore` (theme, network), `authStore` (session, user).
* **Offline**: react-query mutation queue; network detector triggers flush.
* **Auth**: Supabase listener → refresh JWT → inject into tRPC link header.

---

## 7  Environment & Secrets
```ini
# app.config.js reads these via process.env
EXPO_PUBLIC_SUPABASE_URL     = https://xyz.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY= ********
EXPO_PUBLIC_API_URL          = https://api.myapp.com/trpc
```
* In EAS, configure **development**, **preview**, **production** channels each with distinct env groups.

---

## 8  Testing & CI
* **Unit**: Jest + @testing-library/react-native (components, hooks).
* **E2E**: Detox flows – login, create habit, toggle habit, logout.
* **CI**: GitHub Actions → run `yarn test`, `expo prebuild --platform ios`, `eas build --profile preview`.

---

## 9  TODO Checklist (Living)

- [ ] **Fix remaining TypeScript & Markdown lints**  
  _Context:_ CI must be green before EAS builds.

- [ ] **Home screen polish**  
  - [ ] Final spacing & theming tweaks  
  - [ ] Hook `utils/offline-mutations.ts` into habit toggle  
  - [ ] Add success haptic via `utils/haptics.ts`

- [ ] **Offline mutation wiring (global prerequisite)**  
  _Integrate `queueOfflineMutation()` into every create/update/toggle/delete mutation across the app._

- [ ] **Add haptics feedback (cross-cutting)**  
  _Call `triggerSuccess()` / `triggerError()` after key user actions._

- [ ] **Planner refactor**  
  - [ ] Implement segmented lists in `(tabs)/planner/index.tsx` using `useSuspenseQueries`  
  - [ ] Swipe-to-delete with optimistic update (depends on offline wiring)

- [ ] **Creation modals**  
  - [ ] Build `add-goal.tsx` (react-hook-form + zod)  
  - [ ] Build `add-habit.tsx`  
  - [ ] Build `add-task.tsx`  
  _Prerequisite:_ offline mutation wiring.

- [ ] **Detail screens**  
  - [ ] Fetch by ID queries  
  - [ ] Edit mode with update mutation  
  - [ ] Delete action with confirmation (depends on offline wiring)

- [ ] **Compass & Rewards MVP**  
  - [ ] Define Supabase views (`goal_progress_view`, `streaks_view`)  
  - [ ] Create `rewards` / `points_ledger` tables & tRPC routers  
  - [ ] Implement charts with `victory-native`

- [ ] **Settings stack implementation**  
  - [ ] Profile form bound to `profiles` table  
  - [ ] Toggle switches saved via `utils/settings.ts`

- [ ] **Token audit** – replace any literal colour/spacing values with Tamagui tokens.

- [ ] **Remove duplicate** `app/planner/add-habit.tsx` once confirmed unused.

- [ ] **Testing & CI**  
  - [ ] Jest unit coverage for utils & components  
  - [ ] Detox e2e flows (auth, create habit, toggle habit)  
  - [ ] GitHub Actions + EAS Build pipelines

> **Next Immediate Step:** Start Planner index refactor (checkbox above).
```

### REFACTORING_PLAN_V2.yaml
**Path:** REFACTORING_PLAN_V2.yaml
**Description:** Updated migration plan

```
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


# 2️⃣ Configuration Files
Configuration files critical to the Tamagui → Gluestack/NativeWind migration.

### tamagui.config.ts
**Path:** tamagui.config.ts
**Description:** Current Tamagui configuration (migration source)

```typescript
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

export default config;```

### babel.config.js
**Path:** babel.config.js
**Description:** Babel configuration - needs updates for NativeWind

```javascript
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'expo-router/babel',                                  // flatten helper
      ['nativewind/babel', { disableImportExportTransform: true }], // no nested plugins
      // single Reanimated plugin – classic mode (no nested plugins)
      ['react-native-reanimated/plugin', { globals: ['__reanimatedWorkletInit'] }],
    ],
  };
};
```

### tsconfig.json
**Path:** tsconfig.json
**Description:** TypeScript configuration

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "jsx": "react-native",
    "paths": {
      "@/*": [
        "./*"
      ],
      "server/*": [
        "./server/*"
      ]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts",
    "server/**/*.ts"
  ]
}
```

### tailwind.config.js
**Path:** tailwind.config.js
**Description:** Tailwind CSS configuration - needs updates for NativeWind

```javascript
/** @type {import('tailwindcss').Config} */
// Import the Zelda theme tokens
const zelda = require('./design-system/tokens');

module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./design-system/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'heading': ['HyliaSerif'],
        'body': ['CalamitySans'],
      },
      colors: {
        // Zelda theme colors
        'parchment': zelda.colors.parchment,
        'sheikahCyan': zelda.colors.sheikahCyan,
        'korokGreen': zelda.colors.korokGreen,
        'darkText': zelda.colors.darkText,
        'guardianOrange': zelda.colors.guardianOrange,
        'darkTealBg': zelda.colors.darkTealBg,
        'cyanGlow': zelda.colors.cyanGlow,
        
        // iOS standard colors
        // iOS system colors
        'ios-blue': '#007AFF',
        'ios-dark-blue': '#0A84FF', // dark mode variant
        'ios-red': '#FF3B30',
        'ios-dark-red': '#FF453A', // dark mode variant
        'ios-green': '#34C759',
        'ios-dark-green': '#30D158', // dark mode variant
        'ios-orange': '#FF9500',
        'ios-dark-orange': '#FF9F0A', // dark mode variant
        'ios-purple': '#AF52DE',
        'ios-dark-purple': '#BF5AF2', // dark mode variant
        'ios-yellow': '#FFCC00',
        'ios-dark-yellow': '#FFD60A', // dark mode variant
        'ios-pink': '#FF2D55',
        'ios-dark-pink': '#FF375F', // dark mode variant
        'ios-indigo': '#5856D6',
        'ios-dark-indigo': '#5E5CE6', // dark mode variant
        
        // iOS gray palette
        'ios-gray': {
          1: '#8E8E93',
          2: '#AEAEB2',
          3: '#C7C7CC',
          4: '#D1D1D6',
          5: '#E5E5EA',
          6: '#F2F2F7',
        },
        'ios-dark-gray': {
          1: '#8E8E93',
          2: '#636366',
          3: '#48484A',
          4: '#3A3A3C',
          5: '#2C2C2E',
          6: '#1C1C1E',
        },
        
        // System background colors
        'ios-system': {
          DEFAULT: '#FFFFFF',
          secondary: '#F2F2F7',
          tertiary: '#FFFFFF',
        },
        'ios-dark-system': {
          DEFAULT: '#000000',
          secondary: '#1C1C1E',
          tertiary: '#2C2C2E',
        },
      },
      
      // iOS standard spacing
      spacing: {
        // Added standard iOS spacing if needed beyond Tailwind defaults
      },
      
      // iOS standard border radius
      borderRadius: {
        'ios-small': '4px',
        'ios-regular': '8px',
        'ios-large': '12px',
        'ios-xl': '16px',
      },
      
      // iOS system font weights
      fontWeight: {
        'ios-regular': '400',
        'ios-medium': '500', 
        'ios-semibold': '600',
        'ios-bold': '700',
      },
      
      // iOS shadows
      boxShadow: {
        'ios-small': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'ios-medium': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'ios-large': '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}; ```

### metro.config.js
**Path:** metro.config.js
**Description:** Metro bundler configuration

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');
const path = require('path');
const exclusionList = require('metro-config/src/defaults/exclusionList');

// Get Expo's default Metro config
const config = getDefaultConfig(__dirname, { isCSSEnabled: true });

// Add .mjs extension support
config.resolver.sourceExts.push('mjs');

// Exclude rogue .babelrc files in node_modules
config.resolver.blockList = exclusionList([
  /.*\/node_modules\/.*\/\.babelrc/,
]);

// Force Metro to resolve Tamagui packages to a single path
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'tamagui': path.resolve(__dirname, 'node_modules/tamagui'),
  '@tamagui/core': path.resolve(__dirname, 'node_modules/@tamagui/core'),
  '@tamagui/config': path.resolve(__dirname, 'node_modules/@tamagui/config'),
  '@tamagui/toast': path.resolve(__dirname, 'node_modules/@tamagui/toast')
};

// Wrap with Reanimated's config for better error handling
module.exports = wrapWithReanimatedMetroConfig(config);```

### app.json
**Path:** app.json
**Description:** Expo app configuration

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

### postcss.config.js
**Path:** postcss.config.js
**Description:** PostCSS configuration for Tailwind

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}; ```

### .eslintrc.js
**Path:** .eslintrc.js
**Description:** ESLint configuration

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

### global.d.ts
**Path:** global.d.ts
**Description:** Global TypeScript declarations

```typescript
/// <reference types="nativewind/types" /> ```

### expo-env.d.ts
**Path:** expo-env.d.ts
**Description:** Expo environment type declarations

```typescript
/// <reference types="expo/types" />

// NOTE: This file should not be edited and should be in your git ignore```

### .env.example
**Path:** .env.example
**Description:** Environment variables template

```
# Supabase Configuration\nEXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here\nEXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```


# 3️⃣ Design System Migration
Moving from Tamagui tokens to Gluestack UI theme & NativeWind classes.

### Animations.ts
**Path:** ./design-system/Animations.ts
**Description:** Design system components, tokens, and utilities

```typescript
// design-system/Animations.ts
// Moti animation presets for consistent effects across the app

// Fade in from bottom
export const fadeInUp = {
  from: { opacity: 0, translateY: 16 },
  animate: { opacity: 1, translateY: 0 },
  exit: { opacity: 0, translateY: 16 },
  transition: { type: 'timing', duration: 350 },
};

// Slide out to left (for swipe to complete)
export const slideOutLeft = {
  from: { translateX: 0 },
  animate: { translateX: -100 },
  exit: { translateX: -100 },
  transition: { type: 'spring', dampingRatio: 0.7 },
};

// Zelda-themed glowing effect
export const sheikahGlow = {
  from: { opacity: 0.4, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0.4, scale: 0.95 },
  transition: { type: 'timing', duration: 800, loop: true },
};

// Task completion animation
export const taskComplete = {
  from: { opacity: 1, translateX: 0 },
  animate: { opacity: 0.6, translateX: -5 },
  transition: { type: 'spring', dampingRatio: 0.8 },
};

// Korok reveal animation (for success states)
export const korokReveal = {
  from: { opacity: 0, scale: 0.7, rotate: '-10deg' },
  animate: { opacity: 1, scale: 1, rotate: '0deg' },
  transition: { type: 'spring', dampingRatio: 0.6 },
};
```

### Primitives.tsx
**Path:** ./design-system/Primitives.tsx
**Description:** Design system components, tokens, and utilities

```typescript
// design-system/Primitives.tsx
import React from 'react';
import { styled } from 'nativewind';
import * as gs from '@gluestack-ui/themed';

// Styled components that accept className prop for NativeWind
export const Stack = styled(gs.View);
export const Text = styled(gs.Text);
export const Button = styled(gs.Button);
export const Pressable = styled(gs.Pressable);

// Re-export other Gluestack components that might be needed
export const HStack = styled(gs.HStack);
export const VStack = styled(gs.VStack);
export const Center = styled(gs.Center);
export const ScrollView = styled(gs.ScrollView);

// Forward gluestack hooks
export const useToast = gs.useToast;
export const useColorMode = gs.useColorMode;

// Export all other Gluestack components as-is
export { gs };
```

### theme.glue.ts
**Path:** ./design-system/theme.glue.ts
**Description:** Design system components, tokens, and utilities

```typescript
// design-system/theme.glue.ts
import { createConfig } from '@gluestack-ui/config';
import tokens from './tokens';

// Convert our tokens to Gluestack theme config
export const glueTheme = createConfig({
  tokens: {
    colors: tokens.colors,
    space: tokens.space,
    radii: tokens.radii,
    fonts: tokens.fonts,
  },
  aliases: {
    // Map our tokens to Gluestack's expected properties
    bg: 'backgroundColor',
    h: 'height',
    w: 'width',
    p: 'padding',
    px: 'paddingHorizontal',
    py: 'paddingVertical',
    m: 'margin',
    mx: 'marginHorizontal',
    my: 'marginVertical',
    rounded: 'borderRadius',
  },
  globalStyle: {
    variants: {
      light: {
        backgroundColor: tokens.colors.parchment,
        color: tokens.colors.darkText,
      },
      dark: {
        backgroundColor: tokens.colors.darkTealBg,
        color: tokens.colors.parchment,
      },
    },
  },
});
```

### tokens.ts
**Path:** ./design-system/tokens.ts
**Description:** Design system components, tokens, and utilities

```typescript
// design-system/tokens.ts
// Shared tokens used by both NativeWind and Gluestack UI

export const colors = {
  // Zelda theme colors from memories
  'parchment': '#FDFFE0',
  'sheikahCyan': '#86A5A9',
  'korokGreen': '#92C582',
  'darkText': '#536F50',
  'guardianOrange': '#FF9F0A',
  'darkTealBg': '#1A2E3A',
  'cyanGlow': '#64FFDA',
  
  // Semantic aliases
  'surface': '#FDFFE0', // parchment in light mode
  'onSurface': '#536F50', // darkText in light mode
  'outline': '#86A5A9', // sheikahCyan in both modes
  
  // Shadow colors with opacities
  'shadowSm': 'rgba(83, 111, 80, 0.10)', // Light theme
  'shadowMd': 'rgba(83, 111, 80, 0.15)',
  'shadowLg': 'rgba(83, 111, 80, 0.20)',
  'shadowDarkSm': 'rgba(0, 0, 0, 0.20)', // Dark theme
  'shadowDarkMd': 'rgba(0, 0, 0, 0.30)',
  'shadowDarkLg': 'rgba(0, 0, 0, 0.40)',
};

export const radii = {
  'sm': 4,
  'md': 8,
  'lg': 16,
  'xl': 24,
  'full': 9999,
};

export const space = {
  '0': 0,
  '0.5': 2,
  '1': 4,
  '2': 8,
  '3': 12,
  '4': 16,
  '5': 20,
  '6': 24,
  '8': 32,
  '10': 40,
  '12': 48,
  '16': 64,
};

export const sizes = {
  ...space,
};

export const fonts = {
  'heading': 'HyliaSerif',
  'body': 'CalamitySans',
  'mono': 'SpaceMono',
};

// Default export with all tokens
export default {
  colors,
  radii,
  space,
  sizes,
  fonts,
};
```

### Colors.ts
**Path:** ./constants/Colors.ts
**Description:** Application constants including colors and animations

```typescript
/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};
```

### motion.ts
**Path:** ./constants/motion.ts
**Description:** Application constants including colors and animations

```typescript
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
}; ```

### Code with pattern: 'from ['"](.*tamagui.*|\.\./tokens)['"]Theme/token imports to convert'
**Description:** *.tsx


# 4️⃣ Provider Architecture
Overview of providers wrapper architecture.

### _layout.tsx
**Path:** app/_layout.tsx
**Description:** Root layout with providers

```typescript
// app/_layout.tsx
import '../tamagui.config'; // Import config first!

import React, { useCallback, useEffect, useState, ReactNode, createContext, useContext } from 'react';
import { Slot, SplashScreen, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { useColorScheme } from 'react-native';
import { TamaguiProvider, Theme } from 'tamagui'; // Will be gradually removed
import { GluestackProvider } from '@/providers/GluestackProvider'; // New UI provider
// tamagui config is already imported at the top of the file
import type { ThemeName } from '@tamagui/core'; // Ensure ThemeName is imported from @tamagui/core
import * as SecureStore from 'expo-secure-store'; // Import SecureStore

import { supabase } from '@/utils/supabase';

import type { Session } from '@supabase/supabase-js';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

/* ------------------------------------------------------------------ */
/*  1. Simple Auth-aware context                                       */
/* ------------------------------------------------------------------ */
interface AuthCtx {
  session: Session | null;
  isLoading: boolean;
}
export const AuthContext = React.createContext<AuthCtx>({
  session: null,
  isLoading: true,
});
export const useAuth = () => React.useContext(AuthContext);

/* ------------------------------------------------------------------ */
/*  2. The actual Provider                                             */
/* ------------------------------------------------------------------ */
function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initial session check
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setIsLoading(false);
      console.log('Initial session check:', data.session ? 'Session found' : 'No session');
    }).catch(error => {
        console.error("Error getting initial session:", error);
        setIsLoading(false);
    });

    // Subscribe to auth changes (login / logout / token refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        console.log('Auth state changed:', _event, newSession ? 'New session' : 'No session');
        setSession(newSession ?? null);
        // If the event is SIGNED_IN or TOKEN_REFRESHED, loading might briefly be true again
        // depending on how you handle redirects, but usually setting session is enough.
        // If SIGNED_OUT, ensure loading is false.
        if (_event === 'SIGNED_OUT') {
          setIsLoading(false);
        }
      },
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  3. Enforce splash-screen logic & route guarding                    */
/* ------------------------------------------------------------------ */
function Root() {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments(); // e.g., ["(tabs)", "home"] or ["(auth)", "login"]

  /* Load Fonts ----------------------------------------------------- */
  const [fontsLoaded, fontError] = useFonts({
    // Ensure font names match those used in tamagui.config.ts
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  /* Handle Font Loading & Errors ----------------------------------- */
  useEffect(() => {
    if (fontError) {
      console.error("Font loading error:", fontError);
      // Decide how to handle font errors - maybe show an error message?
      // For now, we still need to hide splash eventually.
      SplashScreen.hideAsync();
    }
  }, [fontError]);

  /* Redirect Logic ------------------------------------------------- */
  useEffect(() => {
    // Wait until auth state is confirmed AND fonts are potentially loaded
    if (isLoading || !fontsLoaded && !fontError) return;

    const inAuthGroup = segments[0] === '(auth)';

    console.log(`Auth State: isLoading=${isLoading}, session=${!!session}, inAuthGroup=${inAuthGroup}, segments=${segments.join('/')}`);

    if (!session && !inAuthGroup) {
      console.log('Redirecting to login...');
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      console.log('Redirecting to home...');
      router.replace('/(tabs)/home');
    } else {
        console.log('No redirect needed.');
    }
  }, [isLoading, session, segments, router, fontsLoaded, fontError]);

  /* Hide splash only when fonts loaded/error AND auth check done ---- */
  useEffect(() => {
    if ((fontsLoaded || fontError) && !isLoading) {
        console.log('Hiding SplashScreen...');
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, isLoading]);

  /* Show loading indicator until ready ----------------------------- */
  if (!fontsLoaded && !fontError || isLoading) {
    // Optionally, return the Splash Screen component itself or a custom loading view
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1C1C1E' /* Approx dark bg */ }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  // Once loaded and auth checked, render the content based on route
  return (
    <>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      <Slot />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  4. Wrap everything with SafeArea, Providers, etc.                  */
/* ------------------------------------------------------------------ */
import { ToastProvider, Toast, useToastState, ToastViewport } from '@tamagui/toast';
import { CheckCircle, AlertCircle, AlertTriangle, Info } from '@tamagui/lucide-icons';
import { YStack, XStack } from 'tamagui';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';

const ACCENT_COLOR_KEY = 'userAccentColor';
const DEFAULT_ACCENT = 'blue'; // Set your default accent color theme name here

// Context to provide accent update function down the tree
const AccentContext = createContext({
  setAccent: (color: string) => {},
});
export const useAccent = () => useContext(AccentContext);

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const themeMode = colorScheme === 'dark' ? 'dark' : 'light';

  return (
    <ToastProvider swipeDirection="horizontal" duration={6000}>
      <Slot />
      <CurrentToast />
      <ToastViewport name="DefaultViewport" top={40} left={0} right={0} /> 
    </ToastProvider>
  );
}

function CurrentToast() {
  const currentToast = useToastState();

  if (!currentToast || currentToast.isHandledNatively) {
    return null;
  }

  const toastType = currentToast.customData?.type || 'info'; // Default to 'info'
  let themeName = 'toast_info'; // Default theme
  let IconComponent = Info;

  switch (toastType) {
    case 'success':
      themeName = 'toast_success';
      IconComponent = CheckCircle;
      break;
    case 'error':
      themeName = 'toast_error';
      IconComponent = AlertCircle;
      break;
    case 'warning':
      themeName = 'toast_warning';
      IconComponent = AlertTriangle;
      break;
  }

  return (
    <Theme name={themeName as ThemeName}> {/* Cast themeName to ThemeName */}
      <Toast
        key={currentToast.id}
        duration={currentToast.duration}
        enterStyle={{ opacity: 0, scale: 0.5, y: -25 }}
        exitStyle={{ opacity: 0, scale: 0.95, y: -10 }} // Adjusted exit style slightly
        y={0}
        opacity={1}
        scale={1}
        animation="bouncy" // Apply bouncy animation
        viewportName={currentToast.viewportName ?? 'DefaultViewport'}
        backgroundColor="$background" // Use background from the wrapped theme
        padding="$3"
        borderRadius="$4"
        marginHorizontal="$4"
        elevate
        shadowColor="$shadowColor"
      >
        <YStack space="$1">
          <XStack space="$2" alignItems="center">
            <IconComponent size={18} color="$color" /> {/* Use color from the wrapped theme */}
            <Toast.Title color="$color">{currentToast.title}</Toast.Title> {/* Use color from the wrapped theme */}
          </XStack>
          {!!currentToast.message && (
            <Toast.Description color="$color"> {/* Use color from the wrapped theme */}
              {currentToast.message}
            </Toast.Description>
          )}
        </YStack>
      </Toast>
    </Theme>
  );
}

function Providers({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const [accentColor, setAccentColor] = useState(DEFAULT_ACCENT);

  // Load accent color on mount
  useEffect(() => {
    const loadAccent = async () => {
      try {
        const savedAccent = await SecureStore.getItemAsync(ACCENT_COLOR_KEY);
        if (savedAccent) {
          setAccentColor(savedAccent);
        }
      } catch (error) {
        console.error('Failed to load accent color:', error);
      }
    };
    loadAccent();
  }, []);

  // Function to update and save accent color
  const handleSetAccent = useCallback(async (newColor: string) => {
    try {
      await SecureStore.setItemAsync(ACCENT_COLOR_KEY, newColor);
      setAccentColor(newColor);
    } catch (error) {
      console.error('Failed to save accent color:', error);
    }
  }, []);

  return (
    <AccentContext.Provider value={{ setAccent: handleSetAccent }}>
      <Theme name={accentColor as ThemeName}> {/* Cast accentColor to ThemeName */}
        {children}
      </Theme>
    </AccentContext.Provider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {/* Gluestack Provider (wraps everything for migration) */}
        <GluestackProvider>
          {/* Core Providers (Tamagui, QueryClient, tRPC) */}
          <Providers>
            {/* Auth Provider manages session state */}
            <AuthProvider>
              {/* Root handles splash, font loading, and redirects */}
              <RootLayoutNav />
            </AuthProvider>
          </Providers>
        </GluestackProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

### AppProvider.tsx
**Path:** ./providers/AppProvider.tsx
**Description:** Provider components for app-wide state and context

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useEffect, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';
import { TamaguiProvider } from 'tamagui';

import { NativeWindProvider } from '@/components/ui/nativewind-setup';
import config from '../tamagui.config';
import { trpc } from '@/utils/trpc';
import { useUiStore } from '@/stores/uiStore'; // Import store to get theme

/**
 * Complete app provider that integrates:
 * - tRPC
 * - React Query
 * - Tamagui
 * - NativeWind
 * - Additional providers can be added here
 */
export function AppProvider({ children }: { children: ReactNode }) {
  // Create Query Client
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 1000, // 5 seconds
        retry: Platform.OS === 'web' ? 3 : 1, // Less retries on mobile to save battery
      },
    },
  }));
  
  // Create tRPC client
  const [trpcClient] = useState(() => 
    trpc.createClient({
      links: [
        httpBatchLink({
          url: 'http://localhost:3000/api/trpc',
          fetch: (input, init) => {
            return fetch(input, {
              ...init,
              credentials: 'include',
            });
          },
        }),
      ],
    })
  );
  
  // Get theme state from Zustand
  const { isDarkMode } = useUiStore();
  const currentTheme = isDarkMode ? 'dark' : 'light';
  
  // You could add NATS initialization here
  useEffect(() => {
    // Example: Initialize NATS for real-time updates
    // Note: This is commented out since we don't have a real NATS server to connect to
    /*
    try {
      const url = 'ws://localhost:4222';
      initNatsClient(url, queryClient)
        .then(conn => {
          console.log('NATS client initialized successfully');
          // Set up subscriptions to relevant topics
          subscribeWithCache('users.updates', ['users']);
          subscribeWithCache('messages.updates', ['messages']);
        })
        .catch(err => {
          console.error('Failed to initialize NATS client:', err);
        });
    } catch (error) {
      console.error('Error in NATS setup:', error);
    }
    
    // Cleanup on unmount
    return () => {
      closeNatsConnection().catch(err => {
        console.error('Error closing NATS connection:', err);
      });
    };
    */
  }, [queryClient]);
  
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <NativeWindProvider theme={currentTheme}>
          <TamaguiProvider config={config}>
            {children}
          </TamaguiProvider>
        </NativeWindProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
} ```

### ConfettiProvider.tsx
**Path:** ./providers/ConfettiProvider.tsx
**Description:** Provider components for app-wide state and context

```typescript
import { ReactNode, createContext, useCallback, useContext, useRef, useState } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { View } from 'tamagui';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CONFETTI_COUNT = 50; // Number of confetti pieces
const COLORS = ['#ff4747', '#ffae47', '#fff347', '#47ff70', '#47d0ff', '#9147ff', '#ff47f3'];

interface ConfettiContextValue {
  showConfetti: () => void;
}

const ConfettiContext = createContext<ConfettiContextValue>({
  showConfetti: () => {},
});

export const useConfetti = () => useContext(ConfettiContext);

// Create a single confetti piece component
function ConfettiPiece({ 
  size, 
  color, 
  initialX, 
  initialY, 
  duration, 
  delay 
}: { 
  size: number, 
  color: string, 
  initialX: number, 
  initialY: number, 
  duration: number, 
  delay: number 
}) {
  const translateX = useSharedValue(initialX);
  const translateY = useSharedValue(initialY);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Create animation when component mounts
  useState(() => {
    // Random horizontal movement
    const targetX = initialX + (Math.random() * 2 - 1) * SCREEN_WIDTH * 0.5;
    
    // Fall down animation
    translateY.value = withDelay(
      delay,
      withTiming(SCREEN_HEIGHT + 100, { duration })
    );
    
    // Horizontal movement with some randomness
    translateX.value = withDelay(
      delay,
      withSequence(
        withTiming(targetX, { duration: duration * 0.4 }),
        withTiming(targetX + (Math.random() * 2 - 1) * 100, { duration: duration * 0.6 })
      )
    );
    
    // Rotation animation
    rotate.value = withDelay(
      delay,
      withTiming(Math.random() * 1080, { duration })
    );
    
    // Fade out toward the end
    opacity.value = withDelay(
      delay + duration * 0.7,
      withTiming(0, { duration: duration * 0.3 })
    );
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size * (Math.random() * 0.8 + 0.2), // Varying heights
          backgroundColor: color,
          borderRadius: Math.random() > 0.5 ? size / 2 : 0, // Some round, some square
        },
        animatedStyle,
      ]}
    />
  );
}

export function ConfettiProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const animationTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Generate confetti pieces data
  const generateConfettiData = useCallback(() => {
    const pieces = [];
    for (let i = 0; i < CONFETTI_COUNT; i++) {
      pieces.push({
        id: i,
        size: Math.random() * 8 + 4, // Size between 4-12
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        initialX: Math.random() * SCREEN_WIDTH,
        initialY: -20, // Start just above the screen
        duration: Math.random() * 1000 + 2000, // Duration between 2-3 seconds
        delay: Math.random() * 500, // Random delay up to 500ms
      });
    }
    return pieces;
  }, []);

  const [confettiPieces, setConfettiPieces] = useState(generateConfettiData());

  const showConfetti = useCallback(() => {
    // Trigger haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Clear any existing timeout
    if (animationTimeout.current) {
      clearTimeout(animationTimeout.current);
    }
    
    // Generate new confetti data and show
    setConfettiPieces(generateConfettiData());
    setIsVisible(true);
    
    // Hide confetti after animation completes
    animationTimeout.current = setTimeout(() => {
      setIsVisible(false);
    }, 3500); // Slightly longer than the max animation time to ensure all pieces are gone
  }, [generateConfettiData]);

  return (
    <ConfettiContext.Provider value={{ showConfetti }}>
      {children}
      {isVisible && (
        <View style={styles.confettiContainer} pointerEvents="none">
          {confettiPieces.map((piece) => (
            <ConfettiPiece
              key={piece.id}
              size={piece.size}
              color={piece.color}
              initialX={piece.initialX}
              initialY={piece.initialY}
              duration={piece.duration}
              delay={piece.delay}
            />
          ))}
        </View>
      )}
    </ConfettiContext.Provider>
  );
}

const styles = StyleSheet.create({
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    pointerEvents: 'none',
  },
}); ```

### GluestackProvider.tsx
**Path:** ./providers/GluestackProvider.tsx
**Description:** Provider components for app-wide state and context

```typescript
// providers/GluestackProvider.tsx
import React from 'react';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { glueTheme } from '@/design-system/theme.glue';

export const GluestackProvider = ({ children }: { children: React.ReactNode }) => (
  <GluestackUIProvider config={glueTheme}>
    {children}
  </GluestackUIProvider>
);
```

### Providers.tsx
**Path:** ./providers/Providers.tsx
**Description:** Provider components for app-wide state and context

```typescript
// providers/Providers.tsx
import '../tamagui.config'; // Ensure Tamagui config is loaded first!
import { getConfig } from '@tamagui/core';
console.log('Effective Tamagui config keys:', Object.keys(getConfig() ?? {}));
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
}```


# 5️⃣ UI Components
UI component library including new Gluestack implementations.


## Dashboard Components
Components used in the dashboard interface

### DailyProgressBanner.tsx
**Path:** ./components/dashboard/DailyProgressBanner.tsx
**Description:** Dashboard UI components

```typescript
import React from 'react';
import { XStack, YStack, Text, Progress, useTheme } from 'tamagui';
import { BlurView } from 'expo-blur';
import { CheckSquare, Target } from '@tamagui/lucide-icons'; // Example icons

type DailyProgressBannerProps = {
  tasksCompleted: number;
  totalTasks: number; // Needed for progress calculation
  habitsChecked: number;
  totalHabits: number; // Needed for progress calculation
};

export default function DailyProgressBanner({ 
  tasksCompleted = 3, // Placeholder
  totalTasks = 5, // Placeholder
  habitsChecked = 2, // Placeholder
  totalHabits = 4 // Placeholder
}: DailyProgressBannerProps) {
  const theme = useTheme();
  const taskProgress = totalTasks > 0 ? (tasksCompleted / totalTasks) * 100 : 0;
  const habitProgress = totalHabits > 0 ? (habitsChecked / totalHabits) * 100 : 0;

  return (
    <BlurView intensity={50} tint="default" style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
      <XStack 
        padding="$3"
        space="$4"
        alignItems="center" 
        backgroundColor="$surfaceSubtle" // Use subtle background from theme
      >
        {/* Tasks Progress */}
        <YStack flex={1} space="$1">
          <XStack space="$2" alignItems="center">
            <CheckSquare size={16} color={theme.accent?.get()} />
            <Text fontSize="$3" fontWeight="bold" color="$onSurface">
              Tasks
            </Text>
          </XStack>
          <Progress size="$1" value={taskProgress}>
            <Progress.Indicator animation="bouncy" backgroundColor="$accent" />
          </Progress>
          <Text fontSize="$1" color="$onSurfaceSubtle">
            {tasksCompleted} / {totalTasks} done
          </Text>
        </YStack>

        {/* Habits Progress */}
        <YStack flex={1} space="$1">
          <XStack space="$2" alignItems="center">
            <Target size={16} color={theme.accent?.get()} />
            <Text fontSize="$3" fontWeight="bold" color="$onSurface">
              Habits
            </Text>
          </XStack>
          <Progress size="$1" value={habitProgress}>
            <Progress.Indicator animation="bouncy" backgroundColor="$accent" />
          </Progress>
          <Text fontSize="$1" color="$onSurfaceSubtle">
            {habitsChecked} / {totalHabits} checked
          </Text>
        </YStack>
      </XStack>
    </BlurView>
  );
}
```

### DashboardSection.tsx
**Path:** ./components/dashboard/DashboardSection.tsx
**Description:** Dashboard UI components

```typescript
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
} ```

### GoalSummaryCard.tsx
**Path:** ./components/dashboard/GoalSummaryCard.tsx
**Description:** Dashboard UI components

```typescript
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
}```

### HabitCheckItem.tsx
**Path:** ./components/dashboard/HabitCheckItem.tsx
**Description:** Dashboard UI components

```typescript
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
}```

### StateIndicator.tsx
**Path:** ./components/dashboard/StateIndicator.tsx
**Description:** Dashboard UI components

```typescript
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
} ```

### TaskItem.tsx
**Path:** ./components/dashboard/TaskItem.tsx
**Description:** Dashboard UI components

```typescript
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
} ```


## UI Primitives
Basic UI building blocks

### AetherCard.tsx
**Path:** ./components/ui/primitives/AetherCard.tsx
**Description:** Primitive UI components

```typescript
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
```

### AetherListItem.tsx
**Path:** ./components/ui/primitives/AetherListItem.tsx
**Description:** Primitive UI components

```typescript
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
```

### SectionHeader.tsx
**Path:** ./components/ui/primitives/SectionHeader.tsx
**Description:** Primitive UI components

```typescript
import React from 'react';
import { XStack, Text, styled, GetProps, Button } from 'tamagui';

const SectionContainer = styled(XStack, {
  name: 'SectionContainer',
  paddingVertical: '$2',
  paddingHorizontal: '$4',
  marginTop: '$4',
  marginBottom: '$2',
  justifyContent: 'space-between',
  alignItems: 'center',
});

type SectionContainerProps = GetProps<typeof SectionContainer>;

export interface SectionHeaderProps extends SectionContainerProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * SectionHeader - A consistent section header with optional action button
 * 
 * Used to separate content sections in screens like Home, Settings, etc.
 *
 * @param title - The section title
 * @param actionLabel - Optional label for the action button
 * @param onAction - Optional callback when action button is pressed
 */
export function SectionHeader({ 
  title, 
  actionLabel, 
  onAction, 
  ...props 
}: SectionHeaderProps) {
  return (
    <SectionContainer {...props}>
      <Text 
        fontSize="$5" 
        fontWeight="600" 
        color="$color"
      >
        {title}
      </Text>
      
      {actionLabel && onAction && (
        <Button
          onPress={onAction}
          fontSize="$2"
          backgroundColor="transparent"
          color="$primary"
          paddingHorizontal="$2"
          height="$5"
        >
          {actionLabel}
        </Button>
      )}
    </SectionContainer>
  );
}
```


## General UI Components
Reusable UI components

### Container.tsx
**Path:** ./components/ui/Container.tsx
**Description:** General UI components

```typescript
import React, { ReactNode } from 'react';
import { SafeAreaView, SafeAreaViewProps } from 'react-native';
import { styled, useTheme, YStack } from 'tamagui';

interface ContainerProps extends SafeAreaViewProps {
  children: ReactNode;
}

const StyledSafeArea = styled(SafeAreaView, {
  name: 'StyledSafeArea',
  flex: 1,
});

export const Container: React.FC<ContainerProps> = ({ style, children, ...props }) => {
  const theme = useTheme();
  return (
    <StyledSafeArea
      style={[
        { backgroundColor: theme.background.val },
        style as any
      ]}
      {...props}
    >
      <YStack flex={1}>{children}</YStack>
    </StyledSafeArea>
  );
};

export default Container;
```

### EmptyOrSkeleton.tsx
**Path:** ./components/ui/EmptyOrSkeleton.tsx
**Description:** General UI components

```typescript
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
```

### ErrorBanner.tsx
**Path:** ./components/ui/ErrorBanner.tsx
**Description:** General UI components

```typescript
import React from 'react';
import { YStack, Text, Button, XStack, H4, useTheme } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';

interface ErrorBannerProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ title, message, onRetry }: ErrorBannerProps) {
  const theme = useTheme();

  const red3 = theme?.red3?.val ?? '#fee2e2';
  const red5 = theme?.red5?.val ?? '#f87171';
  const red6 = theme?.red6?.val ?? '#ef4444';
  const red7 = theme?.red7?.val ?? '#dc2626';
  const red10 = theme?.red10?.val ?? '#991b1b';
  const red11 = theme?.red11?.val ?? '#7f1d1d';

  return (
    <YStack 
      backgroundColor={red3} 
      borderColor={red7} 
      borderWidth={1} 
      borderRadius="$3"
      padding="$3"
      space="$2"
      alignItems="center"
    >
      <XStack width="100%" justifyContent="space-between" alignItems="center">
        <H4 color={red11}>{title || 'Error'}</H4> 
        {/* Optional: Add an icon */} 
        {/* <Ionicons name="alert-circle-outline" size={20} color={red10} /> */} 
      </XStack>
      <Text color={red11}>{message}</Text> 
      {onRetry && (
        <Button 
          // theme="red" 
          icon={<Ionicons name="refresh" size={16} color={red11} />} 
          onPress={onRetry}
          size="$2"
          backgroundColor={red5} 
          borderColor={red7} 
          borderWidth={1}
          pressStyle={{ backgroundColor: red6 }}
        >
          <Text color={red11}>Retry</Text>
        </Button>
      )}
    </YStack>
  );
}

interface SectionErrorProps {
  message: string;
  onRetry?: () => void;
}

export function SectionError({ message, onRetry }: SectionErrorProps) {
  const theme = useTheme();

  const red3 = theme?.red3?.val ?? '#fee2e2';
  const red5 = theme?.red5?.val ?? '#f87171';
  const red6 = theme?.red6?.val ?? '#ef4444';
  const red7 = theme?.red7?.val ?? '#dc2626';
  const red10 = theme?.red10?.val ?? '#991b1b';
  const red11 = theme?.red11?.val ?? '#7f1d1d';

  return (
    <YStack 
      padding="$3" 
      borderRadius="$3" 
      borderWidth={1} 
      borderColor={red7} 
      backgroundColor={red3} 
      alignItems="center" 
      space="$2"
    >
      <Ionicons name="warning-outline" size={24} color={red10} /> 
      <Text color={red11} textAlign="center"> 
        {message || 'Failed to load this section.'}
      </Text>
      {onRetry && (
        <Button 
          size="$2" 
          // theme="red"
          backgroundColor={red5} 
          icon={<Ionicons name="refresh" size={16} color={red11} />} 
          onPress={onRetry}
          pressStyle={{ backgroundColor: red6 }}
          borderColor={red7} 
          borderWidth={1} 
        >
          <Text color={red11}>Retry</Text>
        </Button>
      )}
    </YStack>
  );
}
```

### InteractiveCard.tsx
**Path:** ./components/ui/InteractiveCard.tsx
**Description:** General UI components

```typescript
import { Card, styled } from 'tamagui';

const InteractiveCard = styled(Card, {
  name: 'InteractiveCard',
  // default props
  elevate: true,
  bordered: true,
  animation: 'bouncy',
  padding: '$4',

  hoverStyle: {
    y: -2,
    shadowColor: '$color.transparent',
    backgroundColor: '$backgroundHover',
  },
  pressStyle: {
    scale: 0.97,
    backgroundColor: '$backgroundPress',
  },
  focusStyle: {
    backgroundColor: '$backgroundFocus',
    outlineColor: '$borderColorFocus',
  },
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
});

export default InteractiveCard;
```

### Section.tsx
**Path:** ./components/ui/Section.tsx
**Description:** General UI components

```typescript
import React, { ReactNode } from 'react';
import { YStack, Text } from 'tamagui';

interface SectionProps {
  title?: string;
  children: ReactNode;
}

/**
 * Semantic section wrapper with optional title and consistent spacing.
 */
const Section: React.FC<SectionProps> = ({ title, children }) => (
  <YStack marginVertical="$4">
    {title && (
      <Text fontSize="$6" fontWeight="bold" marginBottom="$2">
        {title}
      </Text>
    )}
    {children}
  </YStack>
);

export default Section;
```

### Skeleton.tsx
**Path:** ./components/ui/Skeleton.tsx
**Description:** General UI components

```typescript
import React from 'react';
import { DimensionValue } from 'react-native';
import { YStack, XStack, styled, Stack } from 'tamagui';
import { useColorScheme } from '@/hooks/useColorScheme';

const SkeletonBase = styled(Stack, {
  name: 'SkeletonBase',
  backgroundColor: '$gray5',
  overflow: 'hidden',
  position: 'relative',
  variants: {
    colorMode: {
      light: { backgroundColor: '$gray5' },
      dark: { backgroundColor: '$gray9' },
    },
  } as const,
});

const SkeletonShimmer = styled(Stack, {
  name: 'SkeletonShimmer',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  opacity: 0.5,
});

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 4 }: SkeletonProps) {
  const colorScheme = useColorScheme();
  
  return (
    <SkeletonBase
      colorMode={colorScheme === 'dark' ? 'dark' : 'light'}
      width={width}
      height={height}
      borderRadius={borderRadius}
    />
  );
}

interface SkeletonRowProps {
  height?: DimensionValue;
  width?: DimensionValue;
  lines?: number;
  spacing?: number;
}

export function SkeletonRow({ height = 20, width = '100%', lines = 3, spacing = 10 }: SkeletonRowProps) {
  return (
    <YStack space={spacing}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i}
          height={height}
          width={i === lines - 1 && typeof width === 'string' ? '70%' : width}
        />
      ))}
    </YStack>
  );
}

interface SkeletonCardProps {
  height?: DimensionValue;
  width?: DimensionValue;
}

export function SkeletonCard({ height = 100, width = '100%' }: SkeletonCardProps) {
  return (
    <YStack space="$2">
      <Skeleton height={height} width={width} borderRadius={8} />
    </YStack>
  );
}

interface SkeletonAvatarProps {
  size?: number;
}

export function SkeletonAvatar({ size = 40 }: SkeletonAvatarProps) {
  return <Skeleton width={size} height={size} borderRadius={size / 2} />;
}

interface SkeletonProfileProps {
  avatarSize?: number;
}

export function SkeletonProfile({ avatarSize = 40 }: SkeletonProfileProps) {
  return (
    <XStack space="$3" alignItems="center">
      <SkeletonAvatar size={avatarSize} />
      <YStack space="$1" flex={1}>
        <Skeleton width="60%" height={16} />
        <Skeleton width="40%" height={12} />
      </YStack>
    </XStack>
  );
}

interface SkeletonCircleProps {
  size?: number;
}

export function SkeletonCircle({ size = 60 }: SkeletonCircleProps) {
  return <Skeleton width={size} height={size} borderRadius={size / 2} />;
}
```

### SwipeableRow.tsx
**Path:** ./components/ui/SwipeableRow.tsx
**Description:** General UI components

```typescript
import React from 'react';
import { Swipeable } from 'react-native-gesture-handler';
import { XStack, Button, useTheme } from 'tamagui';
import { Trash, Check } from '@tamagui/lucide-icons';
import * as Haptics from 'expo-haptics';

type SwipeableRowProps = {
  children: React.ReactNode;
  onDelete?: () => void;
  onComplete?: () => void;
  // Add any other props needed, like unique key for Swipeable instance management
};

export default function SwipeableRow({ children, onDelete, onComplete }: SwipeableRowProps) {
  const theme = useTheme();

  const renderRightActions = () => {
    if (!onDelete) return null;
    return (
      <XStack flex={1} justifyContent="flex-end">
        <Button
          // size="$3" // Match ListItem size?
          backgroundColor="$destructive"
          borderTopRightRadius="$0" // Flatten edges
          borderBottomRightRadius="$0"
          icon={<Trash color={theme.color?.get()} />} // Use theme color for icon
          onPress={() => {
            Haptics.selectionAsync();
            onDelete();
            // Consider closing the Swipeable here if needed
          }}
          width={80} // Fixed width for the action button
          height="100%" // Fill height
          justifyContent="center"
          alignItems="center"
        />
      </XStack>
    );
  };

  const renderLeftActions = () => {
    if (!onComplete) return null;
    return (
      <XStack flex={1} justifyContent="flex-start">
        <Button
          // size="$3"
          backgroundColor="$success"
          borderTopLeftRadius="$0"
          borderBottomLeftRadius="$0"
          icon={<Check color={theme.color?.get()} />}
          onPress={() => {
            Haptics.selectionAsync();
            onComplete();
            // Consider closing the Swipeable here if needed
          }}
          width={80}
          height="100%"
          justifyContent="center"
          alignItems="center"
        />
      </XStack>
    );
  };

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      overshootFriction={8} // Standard friction
      containerStyle={{ backgroundColor: '$background' }} // Ensure background matches item
    >
      {children}
    </Swipeable>
  );
}
```

### AetherCard.tsx
**Path:** ./components/ui/primitives/AetherCard.tsx
**Description:** General UI components

```typescript
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
```

### AetherListItem.tsx
**Path:** ./components/ui/primitives/AetherListItem.tsx
**Description:** General UI components

```typescript
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
```

### SectionHeader.tsx
**Path:** ./components/ui/primitives/SectionHeader.tsx
**Description:** General UI components

```typescript
import React from 'react';
import { XStack, Text, styled, GetProps, Button } from 'tamagui';

const SectionContainer = styled(XStack, {
  name: 'SectionContainer',
  paddingVertical: '$2',
  paddingHorizontal: '$4',
  marginTop: '$4',
  marginBottom: '$2',
  justifyContent: 'space-between',
  alignItems: 'center',
});

type SectionContainerProps = GetProps<typeof SectionContainer>;

export interface SectionHeaderProps extends SectionContainerProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * SectionHeader - A consistent section header with optional action button
 * 
 * Used to separate content sections in screens like Home, Settings, etc.
 *
 * @param title - The section title
 * @param actionLabel - Optional label for the action button
 * @param onAction - Optional callback when action button is pressed
 */
export function SectionHeader({ 
  title, 
  actionLabel, 
  onAction, 
  ...props 
}: SectionHeaderProps) {
  return (
    <SectionContainer {...props}>
      <Text 
        fontSize="$5" 
        fontWeight="600" 
        color="$color"
      >
        {title}
      </Text>
      
      {actionLabel && onAction && (
        <Button
          onPress={onAction}
          fontSize="$2"
          backgroundColor="transparent"
          color="$primary"
          paddingHorizontal="$2"
          height="$5"
        >
          {actionLabel}
        </Button>
      )}
    </SectionContainer>
  );
}
```


## List Components
Components for displaying lists

### GoalList.tsx
**Path:** ./components/lists/GoalList.tsx
**Description:** List UI components

```typescript
import React from 'react';
import { FlatList, RefreshControl, ListRenderItem } from 'react-native';
import { YStack, Spinner, XStack, Text } from 'tamagui';
import { router } from 'expo-router';
import { RouterOutputs } from '@/utils/api-types';
import { AetherCard } from '@/components/ui/primitives';
import { EmptyOrSkeleton } from '@/components/ui/EmptyOrSkeleton';
import { Ionicons } from '@expo/vector-icons';

type Goal = RouterOutputs['goal']['list'][number];

interface GoalListProps {
  goals?: Goal[];
  isLoading: boolean;
  isError?: boolean;
  refetch: () => void;
  onSelectGoal?: (goal: Goal) => void;
}

/**
 * GoalCard - Individual goal card component
 */
export function GoalCard({ goal, onPress }: { goal: Goal; onPress: () => void }) {
  // Calculate progress percentage for the progress ring
  const progressPercent = goal.progress ? goal.progress : 0;
  
  // Format the target date
  const formattedDate = goal.target_date
    ? new Date(goal.target_date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : 'No due date';

  return (
    <AetherCard 
      isInteractive 
      variant="default"
      onPress={onPress}
    >
      <YStack space="$2">
        {/* Title */}
        <YStack>
          <XStack space="$2" alignItems="center">
            <Ionicons name="trophy-outline" size={18} color="$primary" />
            <Text fontSize="$5" fontWeight="bold" color="$color">
              {goal.title}
            </Text>
          </XStack>
        </YStack>
        
        {/* Description if available */}
        {goal.description && (
          <Text color="$colorMuted" fontSize="$3" numberOfLines={2}>
            {goal.description}
          </Text>
        )}
        
        {/* Footer with date and progress */}
        <XStack justifyContent="space-between" alignItems="center">
          <XStack space="$2" alignItems="center">
            <Ionicons name="calendar-outline" size={16} color="$colorMuted" />
            <Text fontSize="$2" color="$colorMuted">
              {formattedDate}
            </Text>
          </XStack>
          
          {/* Progress display */}
          <XStack backgroundColor="$background" paddingHorizontal="$2" paddingVertical="$1" borderRadius="$2">
            <Text fontSize="$2" fontWeight="bold" color={progressPercent >= 75 ? '$success' : '$primary'}>
              {progressPercent}%
            </Text>
          </XStack>
        </XStack>
      </YStack>
    </AetherCard>
  );
}

/**
 * GoalList - List component for displaying goals
 */
export function GoalList({ goals, isLoading, isError, refetch, onSelectGoal }: GoalListProps) {
  const renderGoalItem: ListRenderItem<Goal> = ({ item }) => (
    <GoalCard 
      goal={item} 
      onPress={() => {
        if (onSelectGoal) {
          onSelectGoal(item);
        } else {
          // Default navigation
          router.push({ 
            pathname: '/planner/goal/[id]', 
            params: { id: item.id } 
          });
        }
      }} 
    />
  );

  if (isLoading) {
    return <EmptyOrSkeleton isLoading count={3} type="card" />;
  }

  if (isError) {
    return (
      <YStack padding="$4" space="$4" alignItems="center" justifyContent="center">
        <Ionicons name="alert-circle-outline" size={48} color="$error" />
        <YStack>
          <YStack alignItems="center">
            <Text fontSize="$5" fontWeight="bold" color="$color" textAlign="center">
              Unable to load goals
            </Text>
            <Text fontSize="$3" color="$colorMuted" textAlign="center" marginTop="$2">
              Please check your connection and try again
            </Text>
          </YStack>
        </YStack>
        <AetherCard onPress={refetch} isInteractive padding="$3" paddingHorizontal="$5">
          <XStack alignItems="center" space="$2">
            <Ionicons name="refresh-outline" size={18} color="$primary" />
            <Text fontSize="$4" fontWeight="500" color="$primary">
              Retry
            </Text>
          </XStack>
        </AetherCard>
      </YStack>
    );
  }

  if (!goals || goals.length === 0) {
    return (
      <EmptyOrSkeleton 
        isEmpty 
        text="No goals yet" 
        actionText="Create a goal" 
        onAction={() => router.push('/planner/add-goal')} 
      />
    );
  }

  return (
    <FlatList
      data={goals}
      keyExtractor={(item) => item.id}
      renderItem={renderGoalItem}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      ItemSeparatorComponent={() => <YStack height="$4" />}
      refreshControl={
        <RefreshControl 
          refreshing={isLoading} 
          onRefresh={refetch} 
        />
      }
    />
  );
}
```

### HabitList.tsx
**Path:** ./components/lists/HabitList.tsx
**Description:** List UI components

```typescript
import React from 'react';
import { FlatList, RefreshControl, ListRenderItem } from 'react-native';
import { YStack, XStack, Text, Stack } from 'tamagui';
import { router } from 'expo-router';
import { RouterOutputs } from '@/utils/api-types';
import { AetherCard } from '@/components/ui/primitives';
import { EmptyOrSkeleton } from '@/components/ui/EmptyOrSkeleton';
import { Ionicons } from '@expo/vector-icons';

type Habit = RouterOutputs['habit']['list'][number];

interface HabitListProps {
  habits?: Habit[];
  isLoading: boolean;
  isError?: boolean;
  refetch: () => void;
  onSelectHabit?: (habit: Habit) => void;
  onToggleHabit?: (habitId: string, completed: boolean) => void;
}

/**
 * HabitCard - Individual habit card component
 */
export function HabitCard({ 
  habit, 
  onPress, 
  onToggle 
}: { 
  habit: Habit; 
  onPress: () => void; 
  onToggle?: (completed: boolean) => void;
}) {
  // Calculate progress streak display
  const streakText = habit.streak === 1 
    ? '1 day'
    : `${habit.streak} days`;

  const bestStreakText = habit.best_streak === 1
    ? '1 day'
    : `${habit.best_streak} days`;

  // Check if the habit has been completed today
  const [isCompleted, setIsCompleted] = React.useState(false); // This would come from habit entries

  const handleToggle = () => {
    const newStatus = !isCompleted;
    setIsCompleted(newStatus);
    if (onToggle) {
      onToggle(newStatus);
    }
  };

  return (
    <AetherCard 
      isInteractive 
      variant="default"
      onPress={onPress}
    >
      <YStack space="$2">
        {/* Title with completion toggle */}
        <XStack space="$3" justifyContent="space-between" alignItems="center">
          <XStack space="$2" alignItems="center" flex={1}>
            <Ionicons name="repeat-outline" size={18} color="$primary" />
            <Text fontSize="$5" fontWeight="bold" color="$color" numberOfLines={1} flex={1}>
              {habit.title}
            </Text>
          </XStack>
          
          {/* Toggle button for completing today's habit */}
          <Stack 
            onPress={handleToggle}
            pressStyle={{ opacity: 0.8 }}
          >
            <Ionicons 
              name={isCompleted ? "checkmark-circle" : "checkmark-circle-outline"} 
              size={26} 
              color={isCompleted ? "$success" : "$colorMuted"} 
            />
          </Stack>
        </XStack>
        
        {/* Streak information */}
        <XStack justifyContent="space-between" alignItems="center">
          <XStack space="$2" alignItems="center">
            <Ionicons name="flame-outline" size={16} color="$colorMuted" />
            <Text fontSize="$2" color="$colorMuted">
              Current: {streakText}
            </Text>
          </XStack>
          
          <XStack space="$2" alignItems="center">
            <Ionicons name="trophy-outline" size={16} color="$colorMuted" />
            <Text fontSize="$2" color="$colorMuted">
              Best: {bestStreakText}
            </Text>
          </XStack>
        </XStack>
      </YStack>
    </AetherCard>
  );
}

/**
 * HabitList - List component for displaying habits
 */
export function HabitList({ 
  habits, 
  isLoading, 
  isError, 
  refetch, 
  onSelectHabit,
  onToggleHabit 
}: HabitListProps) {
  const renderHabitItem: ListRenderItem<Habit> = ({ item }) => (
    <HabitCard 
      habit={item} 
      onPress={() => {
        if (onSelectHabit) {
          onSelectHabit(item);
        } else {
          // Default navigation
          router.push({ 
            pathname: '/planner/habit/[id]', 
            params: { id: item.id } 
          });
        }
      }}
      onToggle={(completed) => {
        if (onToggleHabit) {
          onToggleHabit(item.id, completed);
        }
      }}
    />
  );

  if (isLoading) {
    return <EmptyOrSkeleton isLoading count={3} type="card" />;
  }

  if (isError) {
    return (
      <YStack padding="$4" space="$4" alignItems="center" justifyContent="center">
        <Ionicons name="alert-circle-outline" size={48} color="$error" />
        <YStack>
          <YStack alignItems="center">
            <Text fontSize="$5" fontWeight="bold" color="$color" textAlign="center">
              Unable to load habits
            </Text>
            <Text fontSize="$3" color="$colorMuted" textAlign="center" marginTop="$2">
              Please check your connection and try again
            </Text>
          </YStack>
        </YStack>
        <AetherCard onPress={refetch} isInteractive padding="$3" paddingHorizontal="$5">
          <XStack alignItems="center" space="$2">
            <Ionicons name="refresh-outline" size={18} color="$primary" />
            <Text fontSize="$4" fontWeight="500" color="$primary">
              Retry
            </Text>
          </XStack>
        </AetherCard>
      </YStack>
    );
  }

  if (!habits || habits.length === 0) {
    return (
      <EmptyOrSkeleton 
        isEmpty 
        text="No habits yet" 
        actionText="Create a habit" 
        onAction={() => router.push('/planner/add-habit')} 
      />
    );
  }

  return (
    <FlatList
      data={habits}
      keyExtractor={(item) => item.id}
      renderItem={renderHabitItem}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      ItemSeparatorComponent={() => <YStack height="$4" />}
      refreshControl={
        <RefreshControl 
          refreshing={isLoading} 
          onRefresh={refetch} 
        />
      }
    />
  );
}
```

### TaskList.tsx
**Path:** ./components/lists/TaskList.tsx
**Description:** List UI components

```typescript
import React from 'react';
import { FlatList, RefreshControl, ListRenderItem } from 'react-native';
import { YStack, XStack, Text, Stack } from 'tamagui';
import { router } from 'expo-router';
import { RouterOutputs } from '@/utils/api-types';
import { AetherCard } from '@/components/ui/primitives';
import { EmptyOrSkeleton } from '@/components/ui/EmptyOrSkeleton';
import { Ionicons } from '@expo/vector-icons';

type Task = RouterOutputs['task']['list'][number];

interface TaskListProps {
  tasks?: Task[];
  isLoading: boolean;
  isError?: boolean;
  refetch: () => void;
  onSelectTask?: (task: Task) => void;
  onCompleteTask?: (taskId: string, completed: boolean) => void;
}

/**
 * TaskCard - Individual task card component
 */
export function TaskCard({ 
  task, 
  onPress, 
  onComplete 
}: { 
  task: Task; 
  onPress: () => void; 
  onComplete?: (completed: boolean) => void;
}) {
  // Get the completion status of the task
  const [isCompleted, setIsCompleted] = React.useState(Boolean(task.completed));
  
  // Format the due date
  const formattedDate = task.due
    ? new Date(task.due).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : 'No due date';
    
  // Check if task is overdue
  const isOverdue = task.due && new Date(task.due) < new Date() && !isCompleted;

  const handleToggle = () => {
    const newStatus = !isCompleted;
    setIsCompleted(newStatus);
    if (onComplete) {
      onComplete(newStatus);
    }
  };

  return (
    <AetherCard 
      isInteractive 
      variant="default"
      onPress={onPress}
    >
      <YStack space="$2">
        {/* Title with completion toggle */}
        <XStack space="$3" justifyContent="space-between" alignItems="center">
          <XStack space="$2" alignItems="center" flex={1}>
            <Stack 
              onPress={handleToggle}
              pressStyle={{ opacity: 0.8 }}
            >
              <Ionicons 
                name={isCompleted ? "checkmark-circle" : "checkmark-circle-outline"} 
                size={26} 
                color={isCompleted ? "$success" : "$colorMuted"} 
              />
            </Stack>
            <Text 
              fontSize="$5" 
              fontWeight="bold" 
              color={isCompleted ? "$colorMuted" : "$color"} 
              numberOfLines={1} 
              flex={1}
              textDecorationLine={isCompleted ? 'line-through' : 'none'}
            >
              {task.title}
            </Text>
          </XStack>
        </XStack>
        
        {/* Notes if available */}
        {task.notes && !isCompleted && (
          <Text color="$colorMuted" fontSize="$3" numberOfLines={2} paddingLeft="$7">
            {task.notes}
          </Text>
        )}
        
        {/* Footer with due date and goal information */}
        <XStack justifyContent="space-between" alignItems="center" paddingLeft="$7">
          <XStack space="$2" alignItems="center">
            <Ionicons 
              name="calendar-outline" 
              size={16} 
              color={isOverdue ? "$error" : "$colorMuted"} 
            />
            <Text 
              fontSize="$2" 
              color={isOverdue ? "$error" : "$colorMuted"}
              fontWeight={isOverdue ? "bold" : "normal"}
            >
              {isOverdue ? "Overdue: " : ""}{formattedDate}
            </Text>
          </XStack>
          
          {/* If task is linked to a goal, show goal name */}
          {task.goal_id && (
            <XStack 
              backgroundColor="$backgroundStrong" 
              paddingHorizontal="$2" 
              paddingVertical="$1" 
              borderRadius="$2"
            >
              <Text fontSize="$2" color="$primary">
                {task.goal?.title || 'Linked goal'}
              </Text>
            </XStack>
          )}
        </XStack>
      </YStack>
    </AetherCard>
  );
}

/**
 * TaskList - List component for displaying tasks
 */
export function TaskList({ 
  tasks, 
  isLoading, 
  isError, 
  refetch, 
  onSelectTask,
  onCompleteTask 
}: TaskListProps) {
  const renderTaskItem: ListRenderItem<Task> = ({ item }) => (
    <TaskCard 
      task={item} 
      onPress={() => {
        if (onSelectTask) {
          onSelectTask(item);
        } else {
          // Default navigation
          router.push({ 
            pathname: '/planner/task/[id]', 
            params: { id: item.id } 
          });
        }
      }}
      onComplete={(completed) => {
        if (onCompleteTask) {
          onCompleteTask(item.id, completed);
        }
      }}
    />
  );

  if (isLoading) {
    return <EmptyOrSkeleton isLoading count={3} type="card" />;
  }

  if (isError) {
    return (
      <YStack padding="$4" space="$4" alignItems="center" justifyContent="center">
        <Ionicons name="alert-circle-outline" size={48} color="$error" />
        <YStack>
          <YStack alignItems="center">
            <Text fontSize="$5" fontWeight="bold" color="$color" textAlign="center">
              Unable to load tasks
            </Text>
            <Text fontSize="$3" color="$colorMuted" textAlign="center" marginTop="$2">
              Please check your connection and try again
            </Text>
          </YStack>
        </YStack>
        <AetherCard onPress={refetch} isInteractive padding="$3" paddingHorizontal="$5">
          <XStack alignItems="center" space="$2">
            <Ionicons name="refresh-outline" size={18} color="$primary" />
            <Text fontSize="$4" fontWeight="500" color="$primary">
              Retry
            </Text>
          </XStack>
        </AetherCard>
      </YStack>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <EmptyOrSkeleton 
        isEmpty 
        text="No tasks yet" 
        actionText="Create a task" 
        onAction={() => router.push('/planner/add-task')} 
      />
    );
  }

  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => item.id}
      renderItem={renderTaskItem}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      ItemSeparatorComponent={() => <YStack height="$4" />}
      refreshControl={
        <RefreshControl 
          refreshing={isLoading} 
          onRefresh={refetch} 
        />
      }
    />
  );
}
```


## Planner Components
Components for planning features

### GoalsList.tsx
**Path:** ./components/planner/GoalsList.tsx
**Description:** Planner UI components

```typescript
import React from 'react';
import { StyleSheet, Pressable, ViewStyle, StyleProp } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { YStack, XStack, Text, View, Progress, ProgressIndicator } from 'tamagui';
import { useColors } from '@/utils/colors';
import EmptyOrSkeleton from '@/components/EmptyOrSkeleton';

// Goal interface - this should match your API schema
export interface Goal {
  id: string;
  title: string;
  description?: string;
  progress: number; // 0 to 1
  deadline?: string; // ISO date string
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoalsListProps {
  /** List of goals to display */
  goals?: Goal[];
  /** Whether the data is loading */
  isLoading?: boolean;
  /** Called when a goal is pressed */
  onGoalPress?: (goal: Goal) => void;
  /** Called when the add button is pressed */
  onAddPress?: () => void;
  /** Container style */
  style?: StyleProp<ViewStyle>;
}

/**
 * Component to render a goal card with progress bar
 */
function GoalCard({
  goal,
  onPress,
}: {
  goal: Goal;
  onPress?: (goal: Goal) => void;
}) {
  const colors = useColors();
  
  // Calculate remaining days if deadline is set
  const daysLeft = goal.deadline 
    ? Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  
  // Determine progress status color
  const getProgressColor = () => {
    if (goal.progress >= 1) return colors.status.success;
    if (daysLeft !== null && daysLeft < 3) return colors.status.error;
    if (daysLeft !== null && daysLeft < 7) return colors.status.warning;
    return colors.status.info;
  };
  
  const progressColor = getProgressColor();
  
  return (
    <Pressable
      onPress={() => onPress?.(goal)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.background.card,
          borderColor: colors.border.default,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <YStack space="$2" padding="$4">
        <Text fontSize="$5" fontWeight="$2" color={colors.content.primary}>
          {goal.title}
        </Text>
        
        {goal.description && (
          <Text fontSize="$3" color={colors.content.secondary} numberOfLines={2}>
            {goal.description}
          </Text>
        )}
        
        <YStack space="$1" marginTop="$2">
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize="$3" fontWeight="$2" color={colors.content.secondary}>
              Progress
            </Text>
            <Text fontSize="$3" color={colors.content.subtle}>
              {Math.round(goal.progress * 100)}%
            </Text>
          </XStack>
          
          <Progress value={goal.progress * 100} backgroundColor={colors.background.secondary}>
            <ProgressIndicator backgroundColor={progressColor} />
          </Progress>
        </YStack>
        
        {daysLeft !== null && (
          <XStack justifyContent="flex-end" marginTop="$1">
            <Text 
              fontSize="$2" 
              color={daysLeft < 0 ? colors.status.error : colors.content.subtle}
            >
              {daysLeft < 0 
                ? `Overdue by ${Math.abs(daysLeft)} days` 
                : daysLeft === 0 
                  ? "Due today" 
                  : `${daysLeft} days left`}
            </Text>
          </XStack>
        )}
      </YStack>
    </Pressable>
  );
}

/**
 * Component to display a list of goals with progress indicators
 */
export default function GoalsList({
  goals = [],
  isLoading = false,
  onGoalPress,
  onAddPress,
  style,
}: GoalsListProps) {
  const colors = useColors();
  
  return (
    <YStack flex={1} style={style}>
      <EmptyOrSkeleton
        isLoading={isLoading}
        isEmpty={goals.length === 0}
        skeletonCount={3}
        skeletonHeight={160}
        skeletonBorderRadius={12}
        title="No goals yet"
        message="Create a new goal to track your progress"
      >
        <FlashList
          data={goals}
          renderItem={({ item }) => (
            <GoalCard goal={item} onPress={onGoalPress} />
          )}
          estimatedItemSize={180}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </EmptyOrSkeleton>
      
      {onAddPress && (
        <Pressable
          onPress={onAddPress}
          style={({ pressed }) => [
            styles.addButton,
            {
              backgroundColor: colors.brand.primary,
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            }
          ]}
        >
          <Text fontSize="$4" fontWeight="$3" color="white">
            + Add Goal
          </Text>
        </Pressable>
      )}
    </YStack>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  separator: {
    height: 12,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
}); ```

### HabitTracker.tsx
**Path:** ./components/planner/HabitTracker.tsx
**Description:** Planner UI components

```typescript
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { XStack, YStack, Text, Button, H4, Separator } from "tamagui";
import StreakCalendar from './StreakCalendar';
import { Plus, Check } from "@tamagui/lucide-icons";
import { format } from "date-fns";

interface Habit {
  id: string;
  name: string;
  description?: string;
  completedDates: string[]; // ISO date strings
}

interface HabitTrackerProps {
  habits: Habit[];
  onAddHabit?: () => void;
  onToggleHabit?: (habitId: string, date: string, completed: boolean) => void;
  onHabitPress?: (habit: Habit) => void;
}

export function HabitTracker({
  habits = [],
  onAddHabit,
  onToggleHabit,
  onHabitPress,
}: HabitTrackerProps) {
  const today = format(new Date(), "yyyy-MM-dd");

  const handleToggleHabit = (habit: Habit) => {
    if (!onToggleHabit) return;
    
    const isCompleted = habit.completedDates.includes(today);
    onToggleHabit(habit.id, today, !isCompleted);
  };

  return (
    <YStack space="$4">
      <XStack justifyContent="space-between" alignItems="center">
        <H4>Habits</H4>
        <Button 
          size="$2" 
          circular 
          icon={<Plus size={16} />} 
          onPress={onAddHabit}
        />
      </XStack>

      {habits.length === 0 ? (
        <YStack 
          p="$4"
          alignItems="center" 
          justifyContent="center" 
          backgroundColor="$gray2" 
          borderRadius="$4"
        >
          <Text color="$gray11" textAlign="center">
            No habits yet. Add your first habit to start tracking.
          </Text>
        </YStack>
      ) : (
        <YStack space="$3">
          {habits.map((habit, index) => (
            <YStack key={habit.id} space="$2">
              {index > 0 && <Separator />}
              <HabitItem 
                habit={habit} 
                onToggle={() => handleToggleHabit(habit)}
                onPress={() => onHabitPress?.(habit)} 
              />
            </YStack>
          ))}
        </YStack>
      )}
    </YStack>
  );
}

interface HabitItemProps {
  habit: Habit;
  onToggle: () => void;
  onPress: () => void;
}

function HabitItem({ habit, onToggle, onPress }: HabitItemProps) {
  const today = format(new Date(), "yyyy-MM-dd");
  const isCompletedToday = habit.completedDates.includes(today);

  return (
    <XStack 
      p="$3"
      borderRadius="$4" 
      backgroundColor="$gray2"
      justifyContent="space-between"
      alignItems="center"
      pressStyle={{ opacity: 0.8 }}
      onPress={onPress}
    >
      <YStack space="$1" flex={1}>
        <Text fontSize="$3" fontWeight="$5">
          {habit.name}
        </Text>
        {habit.description && (
          <Text fontSize="$2" color="$gray11">
            {habit.description}
          </Text>
        )}
        
        <YStack mt="$2">
          <StreakCalendar
            completedDates={habit.completedDates}
          />
        </YStack>
      </YStack>

      <Button
        size="$3"
        circular
        backgroundColor={isCompletedToday ? "$primary9" : "$gray4"}
        onPress={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        pressStyle={{
          backgroundColor: isCompletedToday ? "$primary8" : "$gray5",
        }}
      >
        <Check 
          size={18} 
          color={isCompletedToday ? "$gray1" : "$gray11"} 
        />
      </Button>
    </XStack>
  );
} ```

### HabitsList.tsx
**Path:** ./components/planner/HabitsList.tsx
**Description:** Planner UI components

```typescript
import React, { useState } from 'react';
import { StyleSheet, Pressable, ViewStyle, StyleProp } from 'react-native';
import { YStack, XStack, Text, View, Checkbox } from 'tamagui';
import { useColors } from '@/utils/colors';
import EmptyOrSkeleton from '@/components/EmptyOrSkeleton';
import * as Haptics from 'expo-haptics';

// Habit interface - this should match your API schema
export interface Habit {
  id: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  completedToday: boolean;
  streak: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface HabitsListProps {
  /** List of habits to display */
  habits?: Habit[];
  /** Whether the data is loading */
  isLoading?: boolean;
  /** Called when a habit's completion status is toggled */
  onToggleHabit?: (habitId: string, completed: boolean) => Promise<void>;
  /** Called when a habit item is pressed */
  onHabitPress?: (habit: Habit) => void;
  /** Called when the add button is pressed */
  onAddPress?: () => void;
  /** Container style */
  style?: StyleProp<ViewStyle>;
}

/**
 * Component to render a habit item with checkbox
 */
function HabitItem({
  habit,
  onToggle,
  onPress,
}: {
  habit: Habit;
  onToggle?: (habitId: string, completed: boolean) => Promise<void>;
  onPress?: (habit: Habit) => void;
}) {
  const colors = useColors();
  const [isChecked, setIsChecked] = useState(habit.completedToday);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleToggle = async () => {
    if (isUpdating || !onToggle) return;
    
    // Optimistic update
    const newValue = !isChecked;
    setIsChecked(newValue);
    
    // Provide haptic feedback
    if (newValue) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    try {
      setIsUpdating(true);
      await onToggle(habit.id, newValue);
    } catch (error) {
      // Revert on error
      setIsChecked(!newValue);
      console.error('Failed to update habit:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Get frequency text
  const getFrequencyText = () => {
    switch (habit.frequency) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      default: return '';
    }
  };
  
  return (
    <Pressable
      onPress={() => onPress?.(habit)}
      style={({ pressed }) => [
        styles.habitItem,
        {
          backgroundColor: colors.background.card,
          borderColor: colors.border.default,
          opacity: isUpdating ? 0.7 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
      disabled={isUpdating}
    >
      <XStack space="$3" flex={1} alignItems="center">
        <Checkbox
          checked={isChecked}
          onCheckedChange={handleToggle}
          disabled={isUpdating}
          borderColor="$gray8"
          backgroundColor={isChecked ? "green" : undefined}
          opacity={isUpdating ? 0.5 : 1}
          size="$5"
        />
        
        <YStack flex={1} space="$1">
          <Text 
            fontSize="$4" 
            fontWeight="$2" 
            color="$color"
            textDecorationLine={isChecked ? 'line-through' : 'none'}
            opacity={isChecked ? 0.8 : 1}
          >
            {habit.title}
          </Text>
          
          <XStack space="$3" alignItems="center">
            <Text fontSize="$2" color="$gray10">
              {getFrequencyText()}
            </Text>
            
            {habit.streak > 0 && (
              <XStack space="$1" alignItems="center">
                <Text fontSize="$2" color={colors.status.success} fontWeight="$2">
                  {habit.streak} day streak 🔥
                </Text>
              </XStack>
            )}
          </XStack>
        </YStack>
      </XStack>
    </Pressable>
  );
}

/**
 * Component to display a list of habits with checkboxes
 */
export default function HabitsList({
  habits = [],
  isLoading = false,
  onToggleHabit,
  onHabitPress,
  onAddPress,
  style,
}: HabitsListProps) {
  const colors = useColors();
  
  return (
    <YStack flex={1} style={style}>
      <EmptyOrSkeleton
        isLoading={isLoading}
        isEmpty={habits.length === 0}
        skeletonCount={4}
        skeletonHeight={80}
        skeletonBorderRadius={12}
        title="No habits yet"
        message="Create a habit to track your daily progress"
      >
        <YStack space="$2" padding="$4">
          {habits.map((habit) => (
            <HabitItem
              key={habit.id}
              habit={habit}
              onToggle={onToggleHabit}
              onPress={onHabitPress}
            />
          ))}
        </YStack>
      </EmptyOrSkeleton>
      
      {onAddPress && (
        <Pressable
          onPress={onAddPress}
          style={({ pressed }) => [
            styles.addButton,
            {
              backgroundColor: colors.brand.primary,
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            }
          ]}
        >
          <Text fontSize="$4" fontWeight="$3" color="white">
            + Add Habit
          </Text>
        </Pressable>
      )}
    </YStack>
  );
}

const styles = StyleSheet.create({
  habitItem: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
}); ```

### StreakCalendar.tsx
**Path:** ./components/planner/StreakCalendar.tsx
**Description:** Planner UI components

```typescript
import React, { useMemo } from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { View, XStack, YStack, Text, Circle } from 'tamagui';
import { useColors } from '@/utils/colors';
import { format, startOfWeek, addDays, isSameDay, subWeeks, addWeeks } from 'date-fns';

export interface StreakCalendarProps {
  /** Array of dates (ISO strings) when the habit was completed */
  completedDates: string[];
  /** Number of weeks to display (default: 4) */
  weekCount?: number;
  /** Container style */
  style?: StyleProp<ViewStyle>;
}

/**
 * Component that displays a habit completion calendar with dots for each day
 */
export default function StreakCalendar({
  completedDates = [],
  weekCount = 4,
  style,
}: StreakCalendarProps) {
  const today = new Date();

  const completedDatesObjects = useMemo(() => {
    return completedDates.map(dateStr => new Date(dateStr));
  }, [completedDates]);

  // Generate weeks from the current week backwards
  const weeks = useMemo(() => {
    const result = [];
    const day = startOfWeek(today, { weekStartsOn: 0 }); // Sunday as first day

    // Get current week
    const currentWeek = Array(7)
      .fill(null)
      .map((_, i) => {
        const date = addDays(day, i);
        return {
          date,
          completed: completedDatesObjects.some((d) => isSameDay(d, date)),
          isToday: isSameDay(date, today),
          isPast: date < today,
          isFuture: date > today,
        };
      });
    result.push(currentWeek);

    // Get previous weeks
    for (let i = 1; i < weekCount; i++) {
      const startDay = subWeeks(day, i);
      const week = Array(7)
        .fill(null)
        .map((_, j) => {
          const date = addDays(startDay, j);
          return {
            date,
            completed: completedDatesObjects.some((d) => isSameDay(d, date)),
            isToday: false,
            isPast: date < today,
            isFuture: date > today,
          };
        });
      result.push(week);
    }

    // Reverse so most recent week is at the bottom
    return result.reverse();
  }, [completedDatesObjects, weekCount, today]);

  const dayNames = useMemo(() => {
    const firstDayOfWeek = startOfWeek(new Date(), { weekStartsOn: 0 });
    return Array(7)
      .fill(null)
      .map((_, i) => {
        return format(addDays(firstDayOfWeek, i), "EEE").charAt(0);
      });
  }, []);

  return (
    <YStack space="$3" style={style}>
      <Text fontSize="$3" fontWeight="$3" color="$content.primary">
        Activity
      </Text>
      
      <XStack justifyContent="space-between">
        {dayNames.map((day, index) => (
          <Text key={index} color="$gray11" textAlign="center" fontSize="$1">
            {day}
          </Text>
        ))}
      </XStack>
      
      <YStack space="$3">
        {weeks.map((week, weekIndex) => (
          <XStack key={`week-${weekIndex}`} justifyContent="space-between">
            {week.map((day, dayIndex) => (
              <YStack key={`day-${weekIndex}-${dayIndex}`} alignItems="center" space="$1">
                <Text 
                  fontSize="$1" 
                  color={day.isToday ? "$brand.primary" : "$content.subtle"}
                  fontWeight={day.isToday ? '$3' : '$2'}
                >
                  {day.date.getDate()}
                </Text>
                
                {/* Day circle */}
                <DayCircle 
                  completed={day.completed}
                  isToday={day.isToday}
                  isPast={day.isPast}
                  isFuture={day.isFuture}
                />
              </YStack>
            ))}
          </XStack>
        ))}
      </YStack>
      
      {/* Legend */}
      <XStack space="$4" justifyContent="center" marginTop="$2">
        <XStack space="$1" alignItems="center">
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: "$gray6",
            }}
          />
          <Text fontSize="$2" color="$content.subtle">Not completed</Text>
        </XStack>
        
        <XStack space="$1" alignItems="center">
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: "$primary9",
            }}
          />
          <Text fontSize="$2" color="$content.subtle">Completed</Text>
        </XStack>
      </XStack>
    </YStack>
  );
}

function DayCircle({ 
  completed, 
  isToday, 
  isPast, 
  isFuture 
}: { 
  completed: boolean; 
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
}) {
  let backgroundColor = completed 
    ? "$primary9" 
    : "transparent";
  
  // Future dates should be more faded
  if (isFuture) {
    backgroundColor = "transparent";
  }
  
  return (
    <View style={[
      styles.dayCircle,
      {
        backgroundColor,
        borderWidth: isToday ? 1 : 0,
        borderColor: "$primary9",
      }
    ]} />
  );
}

const styles = StyleSheet.create({
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
}); ```


## Auth Components
Authentication-related components

### FloatingInput.tsx
**Path:** ./components/auth/FloatingInput.tsx
**Description:** Authentication UI components

```typescript
import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, TextInput as RNTextInput, View, TextInputProps as RNTextInputProps } from 'react-native';
import { Text, InputProps, getTokens, useTheme } from 'tamagui';
import Animated, { useSharedValue, withTiming, useAnimatedStyle, Easing } from 'react-native-reanimated';
import { durations } from '@/constants/motion';

export interface FloatingInputProps extends RNTextInputProps {
  /** Label for the input */
  label: string;
  /** Error message to display */
  error?: string;
  /** Container style */
  containerStyle?: object;
  /** Label style */
  labelStyle?: object;
  /** Error style */
  errorStyle?: object;
  /** Tamagui tokens for theming */
  tokens?: ReturnType<typeof getTokens>;
  /** Called when focus changes */
  onFocusChange?: (focused: boolean) => void;
  /** Left icon to display */
  leftIcon?: React.ReactNode;
  /** Right icon to display */
  rightIcon?: React.ReactNode;
  /** Whether to adjust label position */
  adjustLabel?: boolean;
}

/**
 * Input component with animated floating label
 */
export default function FloatingInput({
  label,
  value,
  error,
  containerStyle,
  labelStyle,
  errorStyle,
  onFocusChange,
  leftIcon,
  rightIcon,
  adjustLabel = true,
  style,
  ...props
}: FloatingInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<RNTextInput | null>(null);
  const animatedLabelValue = useSharedValue(value ? 1 : 0);
  const theme = useTheme();
  
  // Handle label animation when focus or value changes
  useEffect(() => {
    animatedLabelValue.value = withTiming(
      (isFocused || !!value) ? 1 : 0,
      {
        duration: 200, // Match durations.standard
        easing: Easing.bezier(0.4, 0.0, 0.2, 1.0),
      }
    );
  }, [isFocused, value, animatedLabelValue]);
  
  // Get dynamic colors from theme
  const colors = {
    input: {
      background: theme.inputBackground?.get() || theme.backgroundHover?.get() || '#F3F4F6',
      text: theme.color?.get() || '#111827',
      border: theme.borderColor?.get() || '#E5E7EB',
      focusBorder: theme.borderColorFocus?.get() || '#93C5FD',
      placeholderText: theme.colorTransparent?.get() || '#6B7280',
    },
    error: theme.red10?.get() || '#EF4444',
  };
  
  // Determine text color based on disabled state
  const textColor = props.editable === false 
    ? theme.colorTransparent?.get() || '#9CA3AF'
    : colors.input.text;
  
  // Handle focus changes
  const handleFocus = (event: any) => {
    setIsFocused(true);
    if (onFocusChange) onFocusChange(true);
    if (props.onFocus) props.onFocus(event);
  };
  
  const handleBlur = (event: any) => {
    setIsFocused(false);
    if (onFocusChange) onFocusChange(false);
    if (props.onBlur) props.onBlur(event);
  };
  
  // Animated styles
  const animatedLabelStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      left: leftIcon ? 40 : 16,
      top: adjustLabel ? 
        (16 + (-24 * animatedLabelValue.value)) : 
        (12 + (-20 * animatedLabelValue.value)),
      fontSize: 16 - (4 * animatedLabelValue.value),
      color: error ? colors.error : 
        animatedLabelValue.value > 0 ? 
          (isFocused ? colors.input.focusBorder : colors.input.placeholderText) : 
          colors.input.placeholderText,
      backgroundColor: animatedLabelValue.value > 0 ? 
        (theme.background?.get() || '#FFFFFF') : 'transparent',
      paddingHorizontal: 4 * animatedLabelValue.value,
      zIndex: 10,
    };
  });
  
  // Focus the input when the component is tapped
  const handleContainerPress = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Prepare input styles - flatten the array and provide default
  const inputStyles = StyleSheet.flatten([
    styles.input, 
    { color: textColor },
    leftIcon && { paddingLeft: 40 },
    rightIcon && { paddingRight: 40 },
    style // Style prop from component props
  ]) || {}; // Provide default empty style object
  
  return (
    <View style={[styles.container, containerStyle]}>
      <View 
        style={[
          styles.inputContainer, 
          { backgroundColor: colors.input.background },
          { borderColor: isFocused ? colors.input.focusBorder : colors.input.border },
          error && { borderColor: colors.error },
        ]} 
        onTouchStart={handleContainerPress}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        <RNTextInput
          ref={inputRef}
          style={inputStyles}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={colors.input.placeholderText}
          {...props}
        />
        
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        
        <Animated.Text style={[animatedLabelStyle, labelStyle]}>
          {label}
        </Animated.Text>
      </View>
      
      {error && (
        <Text
          style={[styles.errorText, { color: colors.error }, errorStyle]}
          fontSize="$3"
          marginTop="$1"
        >
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 8,
    height: 56,
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    height: 56,
    paddingHorizontal: 16,
    fontSize: 16,
    flex: 1,
  },
  label: {
    zIndex: 10,
  },
  errorText: {
    marginLeft: 4,
  },
  leftIcon: {
    position: 'absolute',
    left: 12,
    top: 16,
    zIndex: 2,
  },
  rightIcon: {
    position: 'absolute',
    right: 12,
    top: 16,
    zIndex: 2,
  },
}); ```

### PrincipleCard.tsx
**Path:** ./components/compass/PrincipleCard.tsx
**Description:** Compass feature components

```typescript
// components/compass/PrincipleCard.tsx
import React from 'react';
import { Card, Text, YStack } from 'tamagui';
import { type RouterOutputs } from '@/utils/trpc';

// Use the correct type based on the query in PrinciplesTab
type Principle = RouterOutputs['value']['getValues'][number];

interface PrincipleCardProps {
  principle: Principle;
  onPress?: () => void; // Make onPress optional if not always needed
}

export function PrincipleCard({ principle, onPress }: PrincipleCardProps) {
  return (
    <Card
      bordered
      padding="$4"
      elevation="$1"
      pressTheme
      hoverTheme
      onPress={onPress}
      animation="bouncy"
      scale={onPress ? 0.98 : 1} // Only apply scale if pressable
      hoverStyle={onPress ? { scale: 0.99 } : {}}
      pressStyle={onPress ? { scale: 0.96 } : {}}
    >
      <YStack>
        <Text fontSize="$5" fontWeight="bold">
          {principle.name}
        </Text>
        {principle.description && (
          <Text color="$colorFocus" marginTop="$2">
            {principle.description}
          </Text>
        )}
      </YStack>
    </Card>
  );
}
```

### PrinciplesTab.tsx
**Path:** ./components/compass/PrinciplesTab.tsx
**Description:** Compass feature components

```typescript
import React from 'react';
import { YStack } from 'tamagui';
import { router, type Href } from 'expo-router';
import { EmptyOrSkeleton } from '@/components/ui/EmptyOrSkeleton';
import { trpc, type RouterOutputs } from '@/utils/trpc';
import { PrincipleCard } from './PrincipleCard';

type Principle = RouterOutputs['value']['getValues'][number];

export default function PrinciplesTab() {
  const { data, isLoading, error, refetch } =
    trpc.value.getValues.useQuery();

  if (isLoading) return <EmptyOrSkeleton isLoading count={3} type="card" />;

  if (error)
    return (
      <EmptyOrSkeleton
        isError
        onRetry={refetch}
        text={error.message ?? 'Failed to load principles'}
      />
    );

  if (!Array.isArray(data) || !data.length)
    return (
      <EmptyOrSkeleton
        isEmpty
        text="No principles yet"
        actionText="Add Principle"
        onAction={() => router.push('/compose?type=value' as Href)}
      />
    );

  return (
    <YStack space="$3">
      {data.map((p: Principle) => (
        <PrincipleCard
          key={p.id}
          principle={p}
          onPress={() => router.push(`/values/${p.id}` as Href)}
        />
      ))}
    </YStack>
  );
}
```

### StateDefinitionCard.tsx
**Path:** ./components/compass/StateDefinitionCard.tsx
**Description:** Compass feature components

```typescript
// components/compass/StateDefinitionCard.tsx
import React from 'react';
import { Card, Text, XStack, YStack } from 'tamagui';
import { type RouterOutputs } from '@/utils/trpc';

// Use the correct type based on the query in StatesTab (getDefinitions)
type StateDefinition = RouterOutputs['state']['getDefinitions'][number];

interface StateDefinitionCardProps {
  state: StateDefinition;
  onPress?: () => void; // Make onPress optional
}

export function StateDefinitionCard({ state, onPress }: StateDefinitionCardProps) {
  return (
    <Card
      bordered
      padding="$4"
      elevation="$1"
      pressTheme
      hoverTheme
      onPress={onPress}
      animation="bouncy"
      scale={onPress ? 0.98 : 1} // Only apply scale if pressable
      hoverStyle={onPress ? { scale: 0.99 } : {}}
      pressStyle={onPress ? { scale: 0.96 } : {}}
    >
      <YStack>
        <XStack alignItems="center" space="$3">
          <Text fontSize="$5" fontWeight="bold">
            {state.name}
          </Text>
          {/* Display scale type if available */}
          {state.scale && (
            <Text color="$colorFocus" fontSize="$2">({state.scale})</Text>
          )}
        </XStack>
        {state.description && (
          <Text color="$colorFocus" marginTop="$2">
            {state.description}
          </Text>
        )}
      </YStack>
    </Card>
  );
}
```

### ConfettiBurst.tsx
**Path:** ./components/rewards/ConfettiBurst.tsx
**Description:** Rewards feature components

```typescript
import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { View } from 'tamagui';
import Animated, {
  useSharedValue,
  withDelay,
  withTiming,
  useAnimatedStyle,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { durations, easings } from '@/constants/motion';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Define confetti piece colors
const COLORS = [
  '#FF5252', // Red
  '#FFD740', // Amber
  '#64FFDA', // Teal
  '#448AFF', // Blue
  '#B388FF', // Deep Purple
  '#FF80AB', // Pink
  '#1DE9B6', // Green
  '#F48FB1', // Light Pink
];

// Number of confetti pieces
const CONFETTI_COUNT = 50;

// Confetti piece configuration
interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  delay: number;
  duration: number;
}

interface ConfettiBurstProps {
  /** Whether to show the confetti */
  isVisible: boolean;
  /** Called when animation completes */
  onComplete?: () => void;
  /** Number of confetti pieces to display (default: 50) */
  count?: number;
  /** Custom colors to use for confetti pieces */
  colors?: string[];
  /** Duration of the animation in ms (default: 2000) */
  duration?: number;
}

/**
 * A component that displays a burst of confetti animation
 */
export default function ConfettiBurst({
  isVisible,
  onComplete,
  count = CONFETTI_COUNT,
  colors = COLORS,
  duration = 2000,
}: ConfettiBurstProps) {
  // Create confetti pieces
  const pieces = React.useMemo(() => {
    const result: ConfettiPiece[] = [];
    
    for (let i = 0; i < count; i++) {
      result.push({
        id: i,
        x: Math.random() * SCREEN_WIDTH,
        y: -20, // Start above the screen
        size: Math.random() * 8 + 4, // Size between 4-12
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        delay: Math.random() * 500, // Random delay up to 500ms
        duration: Math.random() * 1000 + 1500, // Duration between 1.5-2.5s
      });
    }
    
    return result;
  }, [count, colors]);
  
  // Trigger animation complete callback
  const animationComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };
  
  return (
    <>
      {isVisible && (
        <View style={styles.container} pointerEvents="none">
          {pieces.map((piece) => (
            <ConfettiPiece
              key={piece.id}
              piece={piece}
              animationDuration={duration}
              onComplete={animationComplete}
            />
          ))}
        </View>
      )}
    </>
  );
}

// Individual confetti piece component
function ConfettiPiece({
  piece,
  animationDuration,
  onComplete,
}: {
  piece: ConfettiPiece;
  animationDuration: number;
  onComplete: () => void;
}) {
  const translateY = useSharedValue(piece.y);
  const translateX = useSharedValue(piece.x);
  const rotate = useSharedValue(piece.rotation);
  const opacity = useSharedValue(1);
  
  // Track if this is the last piece to complete
  const wasLastPiece = React.useRef(false);
  
  useEffect(() => {
    // Last piece will trigger onComplete
    if (piece.id === CONFETTI_COUNT - 1) {
      wasLastPiece.current = true;
    }
    
    // Start Y animation (falling down)
    translateY.value = withDelay(
      piece.delay,
      withTiming(
        SCREEN_HEIGHT + 50, // End below the screen
        {
          duration: piece.duration,
          easing: easings.accelerate,
        },
        () => {
          if (wasLastPiece.current) {
            runOnJS(onComplete)();
          }
        }
      )
    );
    
    // Swaying horizontal movement
    translateX.value = withDelay(
      piece.delay,
      withSequence(
        withTiming(piece.x - 50 + Math.random() * 100, {
          duration: piece.duration * 0.3,
          easing: easings.standard,
        }),
        withTiming(piece.x + 50 + Math.random() * 100, {
          duration: piece.duration * 0.3,
          easing: easings.standard,
        }),
        withTiming(piece.x - 25 + Math.random() * 50, {
          duration: piece.duration * 0.4,
          easing: easings.standard,
        })
      )
    );
    
    // Rotation animation
    rotate.value = withDelay(
      piece.delay,
      withTiming(piece.rotation + Math.random() * 720, {
        duration: piece.duration,
        easing: easings.standard,
      })
    );
    
    // Fade out toward the end
    opacity.value = withDelay(
      piece.delay + (piece.duration * 0.7),
      withTiming(0, {
        duration: piece.duration * 0.3,
        easing: easings.standard,
      })
    );
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
      ],
      opacity: opacity.value,
    };
  });
  
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: piece.size,
          height: piece.size * (Math.random() * 0.8 + 0.2), // Varying heights
          backgroundColor: piece.color,
          borderRadius: Math.random() > 0.5 ? piece.size / 2 : 0, // Some round, some square
        },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    pointerEvents: 'none',
  },
}); ```

### NotificationRow.tsx
**Path:** ./components/settings/NotificationRow.tsx
**Description:** Settings UI components

```typescript
import React, { ReactNode } from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { XStack, Text, Switch, SwitchProps, YStack } from 'tamagui';
import { useColors } from '@/utils/colors';

export interface NotificationRowProps {
  /** Title of the notification setting */
  title: string;
  /** Optional description */
  description?: string;
  /** Whether the notification is turned on */
  enabled: boolean;
  /** Called when the switch is toggled */
  onToggle: (value: boolean) => void;
  /** Icon to display in the row */
  icon?: ReactNode;
  /** Whether the control is in loading state */
  isLoading?: boolean;
  /** Switch props */
  switchProps?: Omit<SwitchProps, 'checked' | 'onCheckedChange'>;
  /** Container style */
  style?: StyleProp<ViewStyle>;
}

/**
 * A component for displaying a notification setting row with toggle switch
 */
export default function NotificationRow({
  title,
  description,
  enabled,
  onToggle,
  icon,
  isLoading,
  switchProps,
  style,
}: NotificationRowProps) {
  const colors = useColors();
  
  const handleToggle = (value: boolean) => {
    if (!isLoading) {
      onToggle(value);
    }
  };
  
  return (
    <XStack
      style={[styles.container, style]}
      alignItems="center"
      justifyContent="space-between"
      padding="$4"
      backgroundColor={colors.background.card}
      borderRadius="$4"
    >
      <XStack alignItems="center" space="$3" flex={1}>
        {icon && <XStack opacity={isLoading ? 0.5 : 1}>{icon}</XStack>}
        
        <YStack space="$1" flex={1} opacity={isLoading ? 0.5 : 1}>
          <Text
            fontSize="$4"
            fontWeight="$2"
            color={colors.content.primary}
          >
            {title}
          </Text>
          
          {description && (
            <Text
              fontSize="$3"
              color={colors.content.secondary}
            >
              {description}
            </Text>
          )}
        </YStack>
      </XStack>
      
      <Switch
        size="$2"
        checked={enabled}
        onCheckedChange={handleToggle}
        disabled={isLoading}
        {...switchProps}
      />
    </XStack>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
}); ```

### ThemePreview.tsx
**Path:** ./components/settings/ThemePreview.tsx
**Description:** Settings UI components

```typescript
import React from 'react';
import { StyleSheet, ViewStyle, StyleProp, Pressable } from 'react-native';
import { View, Stack, YStack, Text, XStack, Theme } from 'tamagui';
import { useTheme } from 'tamagui';
import { useColors } from '@/utils/colors';
import { Check } from '@tamagui/lucide-icons';

export interface ThemePreviewProps {
  /** The theme name to display */
  themeName: string;
  /** Whether this theme is currently selected */
  isSelected: boolean;
  /** Called when this theme is selected */
  onSelect: () => void;
  /** Whether to force dark mode for this preview */
  forceDark?: boolean;
  /** Whether to force light mode for this preview */
  forceLight?: boolean;
  /** Container style */
  style?: StyleProp<ViewStyle>;
}

/**
 * A component that displays a preview of a theme with sample UI elements
 */
export default function ThemePreview({
  themeName,
  isSelected,
  onSelect,
  forceDark,
  forceLight,
  style,
}: ThemePreviewProps) {
  const currentTheme = useTheme();
  const previewTheme = forceDark ? 'dark' : forceLight ? 'light' : undefined;
  const colors = useColors();
  
  return (
    <Pressable 
      onPress={onSelect}
      style={({ pressed }) => [
        styles.container,
        {
          transform: [{ scale: pressed ? 0.97 : 1 }],
          borderColor: isSelected ? colors.border.focus : colors.border.default,
          borderWidth: isSelected ? 2 : 1,
        },
        style,
      ]}
    >
      <YStack space="$2">
        <Text
          fontSize="$4"
          fontWeight="$2"
          color={colors.content.primary}
          marginBottom="$1"
        >
          {themeName}
        </Text>
        
        <Theme name={previewTheme}>
          <YStack
            backgroundColor="$cardBackground"
            borderRadius="$3"
            padding="$2"
            space="$2"
          >
            {/* Header Preview */}
            <View 
              style={styles.header}
              backgroundColor="$primary"
            />
            
            {/* Content Preview */}
            <YStack space="$1">
              <View style={styles.textLine} backgroundColor="$color" opacity={0.9} />
              <View style={styles.textLine} backgroundColor="$color" opacity={0.7} width="80%" />
              <View style={styles.textLine} backgroundColor="$color" opacity={0.5} width="60%" />
            </YStack>
            
            {/* Button Preview */}
            <XStack space="$2">
              <View
                style={styles.button}
                backgroundColor="$primary"
              />
              <View
                style={styles.button}
                backgroundColor="$backgroundPress"
              />
            </XStack>
          </YStack>
        </Theme>
        
        {isSelected && (
          <View style={styles.checkContainer}>
            <XStack
              backgroundColor={colors.status.success}
              borderRadius={999}
              alignItems="center"
              justifyContent="center"
              width={24}
              height={24}
            >
              <Check color="white" size={16} />
            </XStack>
          </View>
        )}
      </YStack>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    position: 'relative',
  },
  header: {
    height: 24,
    borderRadius: 4,
  },
  textLine: {
    height: 8,
    borderRadius: 4,
  },
  button: {
    height: 20,
    flex: 1,
    borderRadius: 4,
  },
  checkContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
}); ```

### ProgressRing.tsx
**Path:** ./components/aether/ProgressRing.tsx
**Description:** Aether-specific components

```typescript
import React from 'react';
import { Stack, useTheme, ColorTokens } from 'tamagui';
import Svg, { Circle } from 'react-native-svg';

interface ProgressRingProps {
  progress: number;  // 0 to 1 (or 0 to 100 as percentage)
  size?: number;     // Diameter of the circle
  strokeWidth?: number;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: ColorTokens | 'transparent' | undefined;
}

/**
 * A circular progress indicator component
 */
export default function ProgressRing({
  progress: rawProgress,
  size = 60,
  strokeWidth = 6,
  primaryColor,
  secondaryColor,
  backgroundColor = 'transparent',
}: ProgressRingProps) {
  const theme = useTheme();
  
  // Normalize progress to 0-1 range
  const progress = rawProgress > 1 ? rawProgress / 100 : rawProgress;
  
  // Calculate radius and other dimensions
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  // Use theme colors if not explicitly provided
  const primary = primaryColor || theme.blue10.val;
  const secondary = secondaryColor || theme.gray4.val;

  return (
    <Stack width={size} height={size} backgroundColor={backgroundColor} alignItems="center" justifyContent="center">
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          stroke={secondary}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <Circle
          stroke={primary}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90, ${size / 2}, ${size / 2})`} // Start from top
        />
      </Svg>
    </Stack>
  );
}
```


## New Gluestack Components
New components using Gluestack UI

### SectionCard.tsx
**Path:** ./app/components/SectionCard.tsx
**Description:** New Gluestack UI components

```typescript
// app/components/SectionCard.tsx
import React from 'react';
import { Stack, Text } from '@/design-system/Primitives';
import { BlurView } from 'expo-blur';

type SectionCardProps = {
  title: string;
  children: React.ReactNode;
};

export const SectionCard: React.FC<SectionCardProps> = ({ title, children }) => {
  return (
    <Stack className="mb-6 overflow-hidden rounded-2xl">
      <BlurView intensity={30} tint="light" className="overflow-hidden rounded-2xl">
        <Stack className="p-4 bg-parchment/50 dark:bg-sheikahCyan/10">
          <Text className="font-heading text-lg mb-2 text-darkText dark:text-parchment">{title}</Text>
          {children}
        </Stack>
      </BlurView>
    </Stack>
  );
};
```

### SwipeableRow.tsx
**Path:** ./app/components/SwipeableRow.tsx
**Description:** New Gluestack UI components

```typescript
// app/components/SwipeableRow.tsx
import React from 'react';
import { View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Button } from '@/design-system/Primitives';
import { Ionicons } from '@expo/vector-icons';

type SwipeableRowProps = {
  children: React.ReactNode;
  onComplete?: () => void;
  onDelete?: () => void;
};

export const SwipeableRow = ({ children, onComplete, onDelete }: SwipeableRowProps) => {
  // Render left-swipe (complete) action
  const renderLeftActions = () => {
    if (!onComplete) return null;
    return (
      <View className="flex-row">
        <Button 
          className="w-20 h-full justify-center items-center bg-korokGreen" 
          onPress={onComplete}
          aria-label="Complete task"
        >
          <Ionicons name="checkmark-outline" size={20} color="#FDFFE0" /* parchment */ />
        </Button>
      </View>
    );
  };

  // Render right-swipe (delete) action
  const renderRightActions = () => {
    if (!onDelete) return null;
    return (
      <View className="flex-row justify-end">
        <Button 
          className="w-20 h-full justify-center items-center bg-guardianOrange" 
          onPress={onDelete}
          aria-label="Delete task"
        >
          <Ionicons name="trash-outline" size={20} color="#FDFFE0" /* parchment */ />
        </Button>
      </View>
    );
  };

  return (
    <Swipeable
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      overshootFriction={8}
      containerStyle={{ backgroundColor: 'transparent' }}
    >
      {children}
    </Swipeable>
  );
};
```

### TaskRow.tsx
**Path:** ./app/components/TaskRow.tsx
**Description:** New Gluestack UI components

```typescript
// app/components/TaskRow.tsx
import React, { memo } from 'react';
import { Text, Stack } from '@/design-system/Primitives';
import { Ionicons } from '@expo/vector-icons';
import { RouterOutputs } from '@/utils/trpc';

// Use the existing task type from your tRPC output
type DashboardData = RouterOutputs['dashboard']['getDashboardData'];
type Task = DashboardData['tasks'][number];

export const TaskRow = memo(({ task }: { task: Task }) => (
  <Stack className="flex-row items-center py-3 px-4 bg-parchment/80 dark:bg-darkTealBg/50">
    {task.status === 'completed' && (
      <Ionicons 
        name="checkmark-circle" 
        size={18} 
        color="#92C582" // korokGreen
        style={{ marginRight: 8 }} 
      />
    )}
    <Text 
      className={`flex-1 ${task.status === 'completed' 
        ? 'text-darkText/50 line-through' 
        : 'text-darkText dark:text-parchment'}`}
    >
      {task.name}
    </Text>
    {task.due_date && (
      <Text className="text-xs text-darkText/70 dark:text-parchment/70">
        {new Date(task.due_date).toLocaleDateString()}
      </Text>
    )}
  </Stack>
));
```


# 6️⃣ App Screens
Application screens and routing structure.


## Auth Screens
Authentication screens

### _layout.tsx
**Path:** app/(auth)/_layout.tsx
**Description:** Auth layout

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

### _layout.tsx
**Path:** ./app/(auth)/_layout.tsx
**Description:** Authentication screens

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
**Path:** ./app/(auth)/forgot-password.tsx
**Description:** Authentication screens

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
**Path:** ./app/(auth)/login.tsx
**Description:** Authentication screens

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
**Path:** ./app/(auth)/register.tsx
**Description:** Authentication screens

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


## Tab Navigation
Tab-based navigation structure

### _layout.tsx
**Path:** app/(tabs)/_layout.tsx
**Description:** Tabs layout

```typescript
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
```


## Home/Dashboard Screens
Dashboard main screens

### index.tsx
**Path:** app/(tabs)/home/index.tsx
**Description:** Original home screen

```typescript
// app/(tabs)/home/index.gluestack.tsx
// New implementation of Home tab using Gluestack UI + NativeWind

import React from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { Stack, Text, Button } from '@/design-system/Primitives';
import { router } from 'expo-router';
import { useDashboardQuery } from '@/app/lib/useDashboardQuery';
import { useToggleTaskStatus } from '@/app/lib/useToggleTaskStatus';
import { SectionCard } from '@/app/components/SectionCard';
import { SwipeableRow } from '@/app/components/SwipeableRow';
import { TaskRow } from '@/app/components/TaskRow';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons'; // Use Ionicons which is already in your project
import LottieView from 'lottie-react-native';

/**
 * Home Screen using Gluestack UI + NativeWind 
 * with Task Swipe → Done functionality
 */
export default function Home() {
  // Fetch dashboard data and task mutation
  const { data, isLoading, isRefetching, refetch } = useDashboardQuery();
  const toggleTaskMutation = useToggleTaskStatus();
  
  // Handle task completion with haptic feedback
  const handleCompleteTask = (taskId: string) => {
    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Call mutation to mark task as complete
    toggleTaskMutation.mutate({ taskId, completed: true });
  };

  // Handle task deletion (placeholder for now)
  const handleDeleteTask = (taskId: string) => {
    console.log(`Delete task: ${taskId}`);
    // TODO: Implement delete mutation
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          // Custom refresh colors aligned with Zelda theme
          tintColor="#86A5A9" // sheikahCyan
          colors={['#86A5A9', '#92C582']} // sheikahCyan, korokGreen
        />
      }
      className="bg-parchment/30 dark:bg-darkTealBg/90"
    >
      <Stack className="p-4">
        {/* Today's Tasks Section */}
        <SectionCard title="Today's Tasks">
          {isLoading ? (
            <Stack className="items-center justify-center py-4">
              <Text className="text-darkText/70 dark:text-parchment/70">Loading tasks...</Text>
            </Stack>
          ) : data?.tasks?.length ? (
            // Map through tasks and wrap each in SwipeableRow
            data.tasks.slice(0, 5).map((task) => (
              <SwipeableRow
                key={task.id}
                onComplete={() => handleCompleteTask(task.id)}
                onDelete={() => handleDeleteTask(task.id)}
              >
                <TaskRow task={task} />
              </SwipeableRow>
            ))
          ) : (
            <Stack className="items-center justify-center py-4">
              <Text className="text-darkText/70 dark:text-parchment/70">No tasks for today</Text>
            </Stack>
          )}
          
          {/* Add Task Button */}
          <Stack className="mt-3 self-center">
            <Button
              className="bg-sheikahCyan/10 rounded-full py-2 px-4 border border-sheikahCyan/50 flex-row items-center"
              onPress={() => router.push('/(tabs)/tasks/add-task' as any)}
            >
              <Ionicons name="add-outline" size={16} color="#86A5A9" />
              <Text className="text-sheikahCyan ml-1">New Task</Text>
            </Button>
          </Stack>
        </SectionCard>
        
        {/* Additional sections can be added here */}
      </Stack>
    </ScrollView>
  );
}
```

### index.gluestack.tsx
**Path:** app/(tabs)/home/index.gluestack.tsx
**Description:** Gluestack version of home screen

```typescript
// app/(tabs)/home/index.gluestack.tsx
// New implementation of Home tab using Gluestack UI + NativeWind

import React from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { Stack, Text, Button } from '@/design-system/Primitives';
import { router } from 'expo-router';
import { useDashboardQuery } from '@/app/lib/useDashboardQuery';
import { useToggleTaskStatus } from '@/app/lib/useToggleTaskStatus';
import { SectionCard } from '@/app/components/SectionCard';
import { SwipeableRow } from '@/app/components/SwipeableRow';
import { TaskRow } from '@/app/components/TaskRow';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons'; // Use Ionicons which is already in your project
import LottieView from 'lottie-react-native';

/**
 * Home Screen using Gluestack UI + NativeWind 
 * with Task Swipe → Done functionality
 */
export default function Home() {
  // Fetch dashboard data and task mutation
  const { data, isLoading, isRefetching, refetch } = useDashboardQuery();
  const toggleTaskMutation = useToggleTaskStatus();
  
  // Handle task completion with haptic feedback
  const handleCompleteTask = (taskId: string) => {
    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Call mutation to mark task as complete
    toggleTaskMutation.mutate({ taskId, completed: true });
  };

  // Handle task deletion (placeholder for now)
  const handleDeleteTask = (taskId: string) => {
    console.log(`Delete task: ${taskId}`);
    // TODO: Implement delete mutation
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          // Custom refresh colors aligned with Zelda theme
          tintColor="#86A5A9" // sheikahCyan
          colors={['#86A5A9', '#92C582']} // sheikahCyan, korokGreen
        />
      }
      className="bg-parchment/30 dark:bg-darkTealBg/90"
    >
      <Stack className="p-4">
        {/* Today's Tasks Section */}
        <SectionCard title="Today's Tasks">
          {isLoading ? (
            <Stack className="items-center justify-center py-4">
              <Text className="text-darkText/70 dark:text-parchment/70">Loading tasks...</Text>
            </Stack>
          ) : data?.tasks?.length ? (
            // Map through tasks and wrap each in SwipeableRow
            data.tasks.slice(0, 5).map((task) => (
              <SwipeableRow
                key={task.id}
                onComplete={() => handleCompleteTask(task.id)}
                onDelete={() => handleDeleteTask(task.id)}
              >
                <TaskRow task={task} />
              </SwipeableRow>
            ))
          ) : (
            <Stack className="items-center justify-center py-4">
              <Text className="text-darkText/70 dark:text-parchment/70">No tasks for today</Text>
            </Stack>
          )}
          
          {/* Add Task Button */}
          <Stack className="mt-3 self-center">
            <Button
              className="bg-sheikahCyan/10 rounded-full py-2 px-4 border border-sheikahCyan/50 flex-row items-center"
              onPress={() => router.push('/(tabs)/tasks/add-task' as any)}
            >
              <Ionicons name="add-outline" size={16} color="#86A5A9" />
              <Text className="text-sheikahCyan ml-1">New Task</Text>
            </Button>
          </Stack>
        </SectionCard>
        
        {/* Additional sections can be added here */}
      </Stack>
    </ScrollView>
  );
}
```


## Planner Screens
Task/habit/goal planning screens

### _layout.tsx
**Path:** app/(tabs)/planner/_layout.tsx
**Description:** Planner layout

```typescript
// File: /Users/tylerbedford/Documents/Coding Projects/AetherIphone/app/(tabs)/planner/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';

export default function PlannerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* The index screen is the default for the planner tab */}
      <Stack.Screen name="index" />
      {/* Add screens for the sub-pages */}
      <Stack.Screen name="add-task" options={{ presentation: 'modal', title: 'Add Task' }} />
      <Stack.Screen name="add-habit" options={{ presentation: 'modal', title: 'Add Habit' }} />
      <Stack.Screen name="add-goal" options={{ presentation: 'modal', title: 'Add Goal' }} />
      <Stack.Screen name="goal/[id]" options={{ title: 'Goal Details' }} />
      <Stack.Screen name="habit/[id]" options={{ title: 'Habit Details' }} />
    </Stack>
  );
}
```

### _layout.tsx
**Path:** ./app/(tabs)/planner/_layout.tsx
**Description:** Planning screens

```typescript
// File: /Users/tylerbedford/Documents/Coding Projects/AetherIphone/app/(tabs)/planner/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';

export default function PlannerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* The index screen is the default for the planner tab */}
      <Stack.Screen name="index" />
      {/* Add screens for the sub-pages */}
      <Stack.Screen name="add-task" options={{ presentation: 'modal', title: 'Add Task' }} />
      <Stack.Screen name="add-habit" options={{ presentation: 'modal', title: 'Add Habit' }} />
      <Stack.Screen name="add-goal" options={{ presentation: 'modal', title: 'Add Goal' }} />
      <Stack.Screen name="goal/[id]" options={{ title: 'Goal Details' }} />
      <Stack.Screen name="habit/[id]" options={{ title: 'Habit Details' }} />
    </Stack>
  );
}
```

### add-goal.tsx
**Path:** ./app/(tabs)/planner/add-goal.tsx
**Description:** Planning screens

```typescript
// Placeholder for Add Goal Screen
import React from 'react';
import { YStack, H1, Text, Button } from 'tamagui';
import { SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function AddGoalScreen() {
  const colorScheme = useColorScheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
      <YStack flex={1} padding="$4" space="$4">
        <H1>Add New Goal</H1>
        <Text>Goal details form will go here.</Text>
        <Button onPress={() => router.back()}>Cancel</Button>
      </YStack>
    </SafeAreaView>
  );
}
```

### add-habit.tsx
**Path:** ./app/(tabs)/planner/add-habit.tsx
**Description:** Planning screens

```typescript
// Placeholder for Add Habit Screen
import React from 'react';
import { YStack, H1, Text, Button } from 'tamagui';
import { SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function AddHabitScreen() {
  const colorScheme = useColorScheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
      <YStack flex={1} padding="$4" space="$4">
        <H1>Add New Habit</H1>
        <Text>Habit details form will go here.</Text>
        <Button onPress={() => router.back()}>Cancel</Button>
      </YStack>
    </SafeAreaView>
  );
}
```

### add-task.tsx
**Path:** ./app/(tabs)/planner/add-task.tsx
**Description:** Planning screens

```typescript
// Placeholder for Add Task Screen
import React from 'react';
import { YStack, H1, Text, Button } from 'tamagui';
import { SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function AddTaskScreen() {
  const colorScheme = useColorScheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
      <YStack flex={1} padding="$4" space="$4">
        <H1>Add New Task</H1>
        <Text>Task details form will go here.</Text>
        <Button onPress={() => router.back()}>Cancel</Button>
      </YStack>
    </SafeAreaView>
  );
}
```

### [id].tsx
**Path:** ./app/(tabs)/planner/goal/[id].tsx
**Description:** Planning screens

```typescript
// Placeholder for Goal Detail Screen
import React from 'react';
import { YStack, H1, Text, Button } from 'tamagui';
import { SafeAreaView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
      <YStack flex={1} padding="$4" space="$4">
        <H1>Goal Detail: {id}</H1>
        <Text>Details for goal {id} will be displayed here.</Text>
        {/* Add tRPC query to fetch goal data based on id */}
        <Button onPress={() => router.back()}>Back</Button>
      </YStack>
    </SafeAreaView>
  );
}
```

### [id].tsx
**Path:** ./app/(tabs)/planner/habit/[id].tsx
**Description:** Planning screens

```typescript
// Placeholder for Habit Detail Screen
import React from 'react';
import { YStack, H1, Text, Button } from 'tamagui';
import { SafeAreaView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
      <YStack flex={1} padding="$4" space="$4">
        <H1>Habit Detail: {id}</H1>
        <Text>Details for habit {id} will be displayed here.</Text>
        {/* Add tRPC query to fetch habit data based on id */}
        <Button onPress={() => router.back()}>Back</Button>
      </YStack>
    </SafeAreaView>
  );
}
```

### index.tsx
**Path:** ./app/(tabs)/planner/index.tsx
**Description:** Planning screens

```typescript
// File: /Users/tylerbedford/Documents/Coding Projects/AetherIphone/app/(tabs)/planner/index.tsx
import React, { useState, Suspense } from 'react';
import { YStack, XStack, Text, Tabs, Button, Spinner, Card, ScrollView } from 'tamagui';
import { SafeAreaView, FlatList, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { trpc } from '@/utils/trpc';
import { useColorScheme } from '@/hooks/useColorScheme';
import { EmptyOrSkeleton } from '@/components/ui/EmptyOrSkeleton';
import { RouterOutputs } from '@/utils/api-types';
import { SectionError } from '@/components/ui/ErrorBanner';


interface TabData {
  key: string;
  title: string;
  icon: React.ReactNode;
}

// Tab configurations
const TABS: TabData[] = [
  {
    key: 'goals',
    title: 'Goals',
    icon: <Ionicons name="trophy-outline" size={18} color="currentColor" />
  },
  {
    key: 'habits',
    title: 'Habits',
    icon: <Ionicons name="repeat-outline" size={18} color="currentColor" />
  },
  {
    key: 'calendar',
    title: 'Calendar',
    icon: <Ionicons name="calendar-outline" size={18} color="currentColor" />
  }
];

export default function PlannerScreen() {
  const [activeTab, setActiveTab] = useState<string>('goals');
  const colorScheme = useColorScheme();
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
      <YStack flex={1} padding="$4">
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
          <Text fontSize={24} fontWeight="bold">Planner</Text>
          <Button
            size="$3"
            circular
            onPress={() => {/* Handle new item */}}
            icon={<Ionicons name="add" size={22} color={colorScheme === 'dark' ? '#fff' : '#000'} />}
          />
        </XStack>
        
        {/* Tabs */}
        <Tabs
          defaultValue="goals"
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
                  {tab.icon}
                  <Text>{tab.title}</Text>
                </XStack>
              </Tabs.Tab>
            ))}
          </Tabs.List>
          
          {/* Tab Content */}
          <Tabs.Content value="goals" flex={1}>
            <ScrollView>
              <GoalsTab />
            </ScrollView>
          </Tabs.Content>
          
          <Tabs.Content value="habits" flex={1}>
            <ScrollView>
              <HabitsTab />
            </ScrollView>
          </Tabs.Content>
          
          <Tabs.Content value="calendar" flex={1}>
            <ScrollView>
              <CalendarTab />
            </ScrollView>
          </Tabs.Content>
        </Tabs>
      </YStack>
    </SafeAreaView>
  );
}

// Goals Tab
function GoalsTab() {
  // Fetch goals using tRPC
  const { data: goals, isLoading, error, refetch } = trpc.goal.getGoals.useQuery();
  
  // Define the inferred type for a single goal
  type PlannerGoal = RouterOutputs['goal']['getGoals'][number];

  if (isLoading) {
    return <EmptyOrSkeleton isLoading={true} count={3} type="card" />;
  }
  
  if (error) {
    return (
      <EmptyOrSkeleton 
        isEmpty={false} 
        isError={true} 
        onRetry={refetch} 
        text="Failed to load goals" 
      />
    );
  }
  
  if (!goals || goals.length === 0) {
    return (
      <EmptyOrSkeleton 
        isEmpty={true} 
        text="No goals yet" 
        actionText="Create a goal" 
        onAction={() => router.push('/planner/add-goal')} 
      />
    );
  }
  
  return (
    <YStack space="$4">
      {goals.map((goal: PlannerGoal) => (
        <Button 
          key={goal.id} 
          height="$12" 
          justifyContent="flex-start" 
          paddingHorizontal="$3"
          onPress={() => router.push({ pathname: '/planner/goal/[id]', params: { id: goal.id } })}
        >
          <YStack>
            <Text fontWeight="bold">{goal.title}</Text>
            <Text fontSize="$2" color="$gray10">
              {goal.dueDate ? new Date(goal.dueDate).toLocaleDateString() : 'No due date'}
            </Text>
          </YStack>
        </Button>
      ))}
    </YStack>
  );
}

// Habits Tab
function HabitsTab() {
  // Fetch habits using tRPC
  const { data: habits, isLoading, error, refetch } = trpc.habit.getHabits.useQuery();
  
  // Define the inferred type for a single habit
  type PlannerHabit = RouterOutputs['habit']['getHabits'][number];

  if (isLoading) {
    return <EmptyOrSkeleton isLoading={isLoading} count={3} type="row" />;
  }
  
  if (error) {
    return (
      <EmptyOrSkeleton 
        isEmpty={false} 
        isError={true} 
        onRetry={refetch} 
        text="Failed to load habits" 
      />
    );
  }
  
  if (!habits || habits.length === 0) {
    return (
      <EmptyOrSkeleton 
        isEmpty={true} 
        text="No habits yet" 
        actionText="Create a habit" 
        onAction={() => router.push('/planner/add-habit')} 
      />
    );
  }
  
  return (
    <YStack space="$3">
      {habits.map((habit: PlannerHabit) => (
        <XStack 
          key={habit.id} 
          justifyContent="space-between" 
          alignItems="center" 
          paddingVertical="$3" 
          paddingHorizontal="$3" 
          borderBottomWidth={1} 
          borderColor="$gray5"
          pressStyle={{ opacity: 0.7 }}
          tag="pressable"
          onPress={() => router.push({ pathname: '/planner/habit/[id]', params: { id: habit.id } })}
        >
          <Text>{habit.title}</Text>
          <Button
            size="$2"
            circular
            backgroundColor={habit.completed ? '$green9' : '$gray9'}
            onPress={() => {
              // Use today's date for the habit entry
              const today = new Date().toISOString().split('T')[0];
              
              // Create a mutation to toggle habit completion
              const toggleHabit = trpc.habit.createHabitEntry.useMutation({
                onSuccess: () => {
                  refetch(); // Refresh data after toggling
                },
                onError: (error) => {
                  // Show error message
                  console.error('Failed to toggle habit:', error.message);
                }
              });
              
              // Toggle the habit completion status
              toggleHabit.mutate({
                habitId: habit.id,
                completed: !habit.completed,
                date: today
              });
            }}
            icon={<Ionicons name="checkmark" size={18} color="white" />}
          />
        </XStack>
      ))}
    </YStack>
  );
}

// Calendar Tab
function CalendarTab() {
  return (
    <YStack alignItems="center" justifyContent="center" padding="$8">
      <Text fontSize="$5" textAlign="center">
        Calendar integration coming soon
      </Text>
      <Text marginTop="$2" color="$gray10" textAlign="center">
        This tab will display task and habit schedules in a calendar view
      </Text>
    </YStack>
  );
}
```


## Other Main Screens
Other main tab screens

### index.tsx
**Path:** app/(tabs)/compass/index.tsx
**Description:** Compass screen

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

### index.tsx
**Path:** app/(tabs)/rewards/index.tsx
**Description:** Rewards screen

```typescript
// Rewards screen with grid/list toggle and claim functionality
import React, { useState, useCallback } from 'react';
import { YStack, XStack, Text, Button, ScrollView, Card, Checkbox, useTheme, H1 } from 'tamagui';
import { SafeAreaView, View, FlatList, ImageBackground, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { trpc } from '@/utils/trpc';
import { useColorScheme } from '@/hooks/useColorScheme';
import { RouterOutputs } from '@/utils/trpc'; // Import RouterOutputs
import { EmptyOrSkeleton } from '@/components/ui/EmptyOrSkeleton'; // Import helper component

// Define inferred type for rewards
type RewardItem = RouterOutputs['rewards']['getAvailableRewards'][number];

enum ViewMode {
  Grid = 'grid',
  List = 'list'
}

export default function RewardsScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Grid);
  const colorScheme = useColorScheme();
  const theme = useTheme();

  // Define fallback colors
  const blue2 = theme?.blue2?.val ?? '#eff6ff';
  const blue5 = theme?.blue5?.val ?? '#60a5fa';
  const blue10 = theme?.blue10?.val ?? '#1e40af';
  const blue11 = theme?.blue11?.val ?? '#1e3a8a';
  const green9 = theme?.green9?.val ?? '#16a34a';

  // Fetch available rewards from tRPC
  const { 
    data: rewards, 
    isLoading, 
    error, 
    refetch 
  } = trpc.rewards.getAvailableRewards.useQuery();

  // Mutation for claiming rewards
  const claimMutation = trpc.rewards.earnReward.useMutation({
    onSuccess: (data) => {
      console.log('Reward claimed successfully:', data);
      // Maybe show confetti?
      Alert.alert('Reward Claimed!', `You spent ${data.reward.points_spent} points. Remaining: ${data.remainingPoints}`);
      refetch(); // Refetch the list of available rewards
    },
    onError: (err) => {
      console.error('Failed to claim reward:', err);
      Alert.alert('Claim Failed', err.message || 'Could not claim reward.');
    }
  });
  
  const handleClaimReward = useCallback((rewardId: string) => {
    if (claimMutation.isPending) return; // Prevent double-clicks
    
    Alert.alert(
      'Confirm Claim',
      'Are you sure you want to spend points on this reward?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Claim', 
          onPress: () => {
            claimMutation.mutate({ rewardId });
          },
          style: 'default'
        }
      ]
    );
  }, [claimMutation]);
  
  const renderItem = ({ item }: { item: RewardItem }) => { // Use inferred type
    // Assuming backend field is image_url, map to imagePath
    const imagePath = item.image_url; 
    // All items from getAvailableRewards are considered claimable (not yet claimed)
    const claimed = false; 
    // Map required_points to pointCost
    const pointCost = item.required_points;

    if (viewMode === ViewMode.Grid) {
      return (
        <Card
          size="$4"
          bordered
          width={160}
          height={200}
          margin="$2"
          overflow="hidden"
          elevation="$2"
          opacity={claimed ? 0.7 : 1}
        >
          <ImageBackground
            source={{ uri: imagePath }}
            style={{ width: '100%', height: 100 }}
          >
            <View style={{ 
              position: 'absolute', 
              top: 5, 
              right: 5, 
              backgroundColor: blue5,
              borderRadius: 10,
              padding: 4
            }}>
              <Text color="white" fontSize="$2" fontWeight="bold">
                {pointCost} pts
              </Text>
            </View>
          </ImageBackground>
          
          <YStack padding="$2" flex={1} justifyContent="space-between">
            <Text fontSize="$4" fontWeight="bold" numberOfLines={1}>
              {item.name}
            </Text>
            
            <Button
              size="$2"
              themeInverse={claimed}
              backgroundColor={claimed ? undefined : blue10}
              onPress={() => handleClaimReward(item.id)}
              disabled={claimed || claimMutation.isPending} // Disable if claimed or mutation pending
            >
              {claimMutation.isPending && claimMutation.variables?.rewardId === item.id ? 'Claiming...' : (claimed ? 'Claimed' : 'Claim')}
            </Button>
          </YStack>
        </Card>
      );
    } else {
      return (
        <Card
          bordered
          margin="$2"
          padding="$3"
          opacity={claimed ? 0.7 : 1}
        >
          <XStack space="$3" alignItems="center">
            {imagePath && (
              <View style={{ 
                width: 60, 
                height: 60, 
                borderRadius: 8, 
                overflow: 'hidden',
                backgroundColor: theme.gray3.val
              }}>
                <ImageBackground
                  source={{ uri: imagePath }}
                  style={{ width: '100%', height: '100%' }}
                />
              </View>
            )}
            
            <YStack flex={1} space="$1">
              <Text fontSize="$5" fontWeight="bold">{item.name}</Text>
              <Text fontSize="$3" color="$gray11" numberOfLines={2}>{item.description}</Text>
              <Text fontSize="$3" color={blue10} fontWeight="500">{pointCost} points</Text>
            </YStack>
            
            <Button
              size="$3"
              backgroundColor={claimed ? undefined : blue10}
              themeInverse={claimed}
              onPress={() => handleClaimReward(item.id)}
              disabled={claimed || claimMutation.isPending} // Disable if claimed or mutation pending
            >
              {claimMutation.isPending && claimMutation.variables?.rewardId === item.id ? 'Claiming...' : (claimed ? 'Claimed' : 'Claim')}
            </Button>
          </XStack>
        </Card>
      );
    }
  };
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
      <YStack flex={1} padding="$4">
        <YStack space="$4">
          {/* Header */}
          <XStack justifyContent="space-between" alignItems="center">
            <H1>Rewards</H1>
            
            <XStack space="$2">
              <Button
                chromeless
                circular
                padding="$2"
                backgroundColor={viewMode === ViewMode.Grid ? blue5 : 'transparent'}
                onPress={() => setViewMode(ViewMode.Grid)}
              >
                <Ionicons 
                  name="grid-outline" 
                  size={22} 
                  color={viewMode === ViewMode.Grid ? blue10 : (colorScheme === 'dark' ? '#fff' : '#000')} 
                />
              </Button>
              
              <Button
                chromeless
                circular
                padding="$2"
                backgroundColor={viewMode === ViewMode.List ? blue5 : 'transparent'}
                onPress={() => setViewMode(ViewMode.List)}
              >
                <Ionicons 
                  name="list-outline" 
                  size={22} 
                  color={viewMode === ViewMode.List ? blue10 : (colorScheme === 'dark' ? '#fff' : '#000')} 
                />
              </Button>
            </XStack>
          </XStack>
          
          {/* Stats */}
          <Card padding="$3" backgroundColor={blue2}>
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$5" fontWeight="bold" color={blue11}>Your Points</Text>
              <Text fontSize="$6" fontWeight="bold" color={blue10}>275</Text>
            </XStack>
          </Card>
        </YStack>
        
        {/* Content Area */} 
        <EmptyOrSkeleton 
          isLoading={isLoading}
          isEmpty={!isLoading && !error && (!rewards || rewards.length === 0)}
          isError={!!error}
          text={error ? error.message : 'No rewards available yet.'} // Use text for error OR empty msg
          onRetry={refetch}
          type={viewMode === ViewMode.Grid ? 'card' : 'row'}
          count={viewMode === ViewMode.Grid ? 6 : 3}
        >
          <FlatList
            key={viewMode} // Change key based on viewMode to force re-render
            data={rewards}
            renderItem={renderItem}
            keyExtractor={(item, index) =>
              `${item?.id ?? `tmp-${index}`}-${viewMode}`   // fall back to index if ID is missing
            }
            
            // Optional: Log corrupt data in development
            onLayout={() => {
              if (__DEV__) {
                const missing = (rewards ?? []).filter(r => !r?.id);
                if (missing.length) console.warn('Rewards missing id:', missing);
              }
            }}
            numColumns={viewMode === ViewMode.Grid ? 2 : 1}
            contentContainerStyle={{ paddingBottom: 50 }} // Add padding at the bottom
            // Optional Optimizations (Patch #6)
            initialNumToRender={8}
            removeClippedSubviews={true} // Note: Can have visual glitches on iOS sometimes
          />
        </EmptyOrSkeleton>

      </YStack>
    </SafeAreaView>
  );
}
```


## Settings Screens
Settings and configuration screens

### _layout.tsx
**Path:** app/(tabs)/settings/_layout.tsx
**Description:** Settings layout

```typescript
// File: /Users/tylerbedford/Documents/Coding Projects/AetherIphone/app/(tabs)/settings/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* The index screen is the default for the settings tab */}
      <Stack.Screen name="index" />
      {/* Add screens for the sub-pages */}
      <Stack.Screen name="profile" options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="security" options={{ title: 'Security' }} />
      <Stack.Screen name="privacy" options={{ title: 'Data & Privacy' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="help" options={{ title: 'Help & Support' }} />
      <Stack.Screen name="about" options={{ title: 'About Aether' }} />
    </Stack>
  );
}
```

### _layout.tsx
**Path:** ./app/(tabs)/settings/_layout.tsx
**Description:** Settings screens

```typescript
// File: /Users/tylerbedford/Documents/Coding Projects/AetherIphone/app/(tabs)/settings/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* The index screen is the default for the settings tab */}
      <Stack.Screen name="index" />
      {/* Add screens for the sub-pages */}
      <Stack.Screen name="profile" options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="security" options={{ title: 'Security' }} />
      <Stack.Screen name="privacy" options={{ title: 'Data & Privacy' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="help" options={{ title: 'Help & Support' }} />
      <Stack.Screen name="about" options={{ title: 'About Aether' }} />
    </Stack>
  );
}
```

### about.tsx
**Path:** ./app/(tabs)/settings/about.tsx
**Description:** Settings screens

```typescript
// Placeholder for About Screen
import React from 'react';
import { YStack, H1, Text, Button } from 'tamagui';
import { SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function AboutScreen() {
  const colorScheme = useColorScheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
      <YStack flex={1} padding="$4" space="$4">
        <H1>About Aether</H1>
        <Text>App version, terms of service, credits, etc.</Text>
        <Button onPress={() => router.back()}>Back</Button>
      </YStack>
    </SafeAreaView>
  );
}
```

### help.tsx
**Path:** ./app/(tabs)/settings/help.tsx
**Description:** Settings screens

```typescript
// Placeholder for Help Screen
import React from 'react';
import { YStack, H1, Text, Button } from 'tamagui';
import { SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function HelpScreen() {
  const colorScheme = useColorScheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
      <YStack flex={1} padding="$4" space="$4">
        <H1>Help & Support</H1>
        <Text>FAQ, contact support link, etc.</Text>
        <Button onPress={() => router.back()}>Back</Button>
      </YStack>
    </SafeAreaView>
  );
}
```

### index.tsx
**Path:** ./app/(tabs)/settings/index.tsx
**Description:** Settings screens

```typescript
// Settings screen with account, preferences, and app settings
import React, { useState } from 'react';
import { YStack, XStack, Text, Button, Switch, Separator, ScrollView, Card, H1 } from 'tamagui';
import { SafeAreaView, View, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '@/utils/supabase';
import { useColorScheme } from 'react-native';
import { useAccent } from '@/app/_layout'; // Import the useAccent hook

interface SettingsSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const SettingsSection = ({ title, icon, children }: SettingsSectionProps) => {
  return (
    <YStack marginVertical="$2">
      <XStack alignItems="center" space="$2" marginBottom="$2">
        {icon}
        <Text fontSize="$5" fontWeight="bold">{title}</Text>
      </XStack>
      <Card padding="$3" bordered>
        {children}
      </Card>
    </YStack>
  );
};

interface SettingsRowProps {
  label: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
}

const SettingsRow = ({ label, icon, rightElement, onPress, showChevron = false }: SettingsRowProps) => {
  return (
    <XStack
      paddingVertical="$3"
      justifyContent="space-between"
      alignItems="center"
      onPress={onPress}
      pressStyle={onPress ? { opacity: 0.7 } : undefined}
    >
      <XStack space="$3" alignItems="center" flex={1}>
        {icon}
        <Text fontSize="$4">{label}</Text>
      </XStack>
      <XStack space="$2" alignItems="center">
        {rightElement}
        {showChevron && <Ionicons name="chevron-forward" size={18} color="#A0A0A0" />}
      </XStack>
    </XStack>
  );
};

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const { setAccent } = useAccent(); // Get the function to update accent color
  const [selectedAccent, setSelectedAccent] = useState('blue'); // Placeholder state for selected accent

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  const AccentSelector = ({ currentAccent, onSelect }: { currentAccent: string, onSelect: (accent: string) => void }) => {
    const accents = ['blue', 'green', 'orange', 'red']; // Example accents corresponding to theme names
    return (
      <XStack space="$2">
        {accents.map((accent) => (
          <Button 
            key={accent} 
            onPress={() => {
              onSelect(accent);
              setAccent(accent); // Call setAccent with the selected accent
            }} 
            theme={accent as any} // Preview the theme (cast needed for demo)
            backgroundColor={accent === currentAccent ? '$backgroundStrong' : '$background'}
          >
            {accent.charAt(0).toUpperCase() + accent.slice(1)}
          </Button>
        ))}
      </XStack>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
      <ScrollView>
        <YStack flex={1} padding="$4">
          <H1 marginBottom="$4">Settings</H1>
          
          {/* Account Section */}
          <SettingsSection
            title="Account"
            icon={<Ionicons name="person-circle-outline" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />}
          >
            <YStack>
              <SettingsRow
                label="Edit Profile"
                icon={<Ionicons name="person-outline" size={20} color="#A0A0A0" />}
                showChevron
                onPress={() => router.push('/settings/profile' as any)}
              />
              <Separator marginVertical="$1" />
              <SettingsRow
                label="Security"
                icon={<Ionicons name="lock-closed-outline" size={20} color="#A0A0A0" />}
                showChevron
                onPress={() => router.push('/settings/security' as any)}
              />
              <Separator marginVertical="$1" />
              <SettingsRow
                label="Data & Privacy"
                icon={<Ionicons name="shield-outline" size={20} color="#A0A0A0" />}
                showChevron
                onPress={() => router.push('/settings/privacy' as any)}
              />
            </YStack>
          </SettingsSection>
          
          {/* Appearance Section */}
          <SettingsSection
            title="Appearance"
            icon={<Ionicons name="color-palette-outline" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />}
          >
            <YStack>
              <SettingsRow
                label="Theme"
                icon={<Ionicons name="moon-outline" size={20} color="#A0A0A0" />}
                rightElement={<Text color="$gray10">{colorScheme === 'dark' ? 'Dark (System)' : 'Light (System)'}</Text>}
              />
              <SettingsRow
                label="Accent Color"
                icon={<Ionicons name="color-palette-outline" size={20} color="#A0A0A0" />}
                rightElement={
                  <AccentSelector 
                    currentAccent={selectedAccent} 
                    onSelect={(accent) => setSelectedAccent(accent)} 
                  />
                }
              />
            </YStack>
          </SettingsSection>
          
          {/* Notifications Section */}
          <SettingsSection
            title="Notifications"
            icon={<Ionicons name="notifications-outline" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />}
          >
            <YStack>
              <SettingsRow
                label="Push Notifications"
                icon={<Ionicons name="push-outline" size={20} color="#A0A0A0" />}
                rightElement={
                  <Switch
                    size="$3"
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                }
              />
              <Separator marginVertical="$1" />
              <SettingsRow
                label="Notification Settings"
                icon={<Ionicons name="options-outline" size={20} color="#A0A0A0" />}
                showChevron
                onPress={() => router.push('/settings/notifications' as any)}
              />
            </YStack>
          </SettingsSection>
          
          {/* Privacy Section */}
          <SettingsSection
            title="Privacy & Data"
            icon={<Ionicons name="analytics-outline" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />}
          >
            <YStack>
              <SettingsRow
                label="Analytics Tracking"
                icon={<Ionicons name="trending-up-outline" size={20} color="#A0A0A0" />}
                rightElement={
                  <Switch
                    size="$3"
                    checked={trackingEnabled}
                    onCheckedChange={setTrackingEnabled}
                  />
                }
              />
              <Separator marginVertical="$1" />
              <SettingsRow
                label="Export Data"
                icon={<Ionicons name="download-outline" size={20} color="#A0A0A0" />}
                showChevron
                onPress={() => {
                  Alert.alert(
                    'Export Data',
                    'Your data will be prepared for export and sent to your email address.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Export', onPress: () => {
                        // Would call an API endpoint to initiate export
                        Alert.alert('Export Initiated', 'Check your email for the export file.');
                      }}
                    ]
                  );
                }}
              />
            </YStack>
          </SettingsSection>
          
          {/* Support Section */}
          <SettingsSection
            title="Support & About"
            icon={<Ionicons name="help-circle-outline" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />}
          >
            <YStack>
              <SettingsRow
                label="Help Center"
                icon={<Ionicons name="help-outline" size={20} color="#A0A0A0" />}
                showChevron
                onPress={() => router.push('/settings/help' as any)}
              />
              <Separator marginVertical="$1" />
              <SettingsRow
                label="About Aether"
                icon={<Ionicons name="information-circle-outline" size={20} color="#A0A0A0" />}
                showChevron
                onPress={() => router.push('/settings/about' as any)}
              />
              <Separator marginVertical="$1" />
              <SettingsRow
                label="App Version"
                icon={<Ionicons name="code-outline" size={20} color="#A0A0A0" />}
                rightElement={<Text color="$gray10">1.0.0</Text>}
              />
            </YStack>
          </SettingsSection>
          
          {/* Logout Button */}
          <Button
            marginTop="$6"
            marginBottom="$8"
            size="$4"
            themeInverse
            onPress={handleLogout}
          >
            Log Out
          </Button>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
```

### notifications.tsx
**Path:** ./app/(tabs)/settings/notifications.tsx
**Description:** Settings screens

```typescript
// Placeholder for Notification Settings Screen
import React from 'react';
import { YStack, H1, Text, Button } from 'tamagui';
import { SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function NotificationSettingsScreen() {
  const colorScheme = useColorScheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
      <YStack flex={1} padding="$4" space="$4">
        <H1>Notification Settings</H1>
        <Text>Granular controls for different notification types.</Text>
        <Button onPress={() => router.back()}>Back</Button>
      </YStack>
    </SafeAreaView>
  );
}
```

### privacy.tsx
**Path:** ./app/(tabs)/settings/privacy.tsx
**Description:** Settings screens

```typescript
// Placeholder for Privacy Settings Screen
import React from 'react';
import { YStack, H1, Text, Button } from 'tamagui';
import { SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function PrivacySettingsScreen() {
  const colorScheme = useColorScheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
      <YStack flex={1} padding="$4" space="$4">
        <H1>Data & Privacy</H1>
        <Text>Data management options, privacy policy link, etc.</Text>
        <Button onPress={() => router.back()}>Back</Button>
      </YStack>
    </SafeAreaView>
  );
}
```

### profile.tsx
**Path:** ./app/(tabs)/settings/profile.tsx
**Description:** Settings screens

```typescript
// Placeholder for Profile Settings Screen
import React from 'react';
import { YStack, H1, Text, Button } from 'tamagui';
import { SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function ProfileSettingsScreen() {
  const colorScheme = useColorScheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
      <YStack flex={1} padding="$4" space="$4">
        <H1>Edit Profile</H1>
        <Text>Profile editing form will go here.</Text>
        <Button onPress={() => router.back()}>Back</Button>
      </YStack>
    </SafeAreaView>
  );
}
```

### security.tsx
**Path:** ./app/(tabs)/settings/security.tsx
**Description:** Settings screens

```typescript
// Placeholder for Security Settings Screen
import React from 'react';
import { YStack, H1, Text, Button } from 'tamagui';
import { SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function SecuritySettingsScreen() {
  const colorScheme = useColorScheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
      <YStack flex={1} padding="$4" space="$4">
        <H1>Security Settings</H1>
        <Text>Password change, 2FA options, etc.</Text>
        <Button onPress={() => router.back()}>Back</Button>
      </YStack>
    </SafeAreaView>
  );
}
```


## Other Screens
Miscellaneous screens

### index.tsx
**Path:** app/index.tsx
**Description:** Root index (if exists)

```typescript
// File: /Users/tylerbedford/Documents/Coding Projects/AetherIphone/app/index.tsx
import { Redirect } from 'expo-router';

export default function RootIndex() {
  // Redirect directly to a specific tab without causing infinite redirects
  // Use the path that matches how it's accessed in the proper format
  // TypeScript suggests this is the correct format for Expo Router
  return <Redirect href="/(tabs)/home" />;
}
```

### compose.tsx
**Path:** app/compose.tsx
**Description:** Compose screen (if exists)

```typescript
// app/compose.tsx
import React from 'react';
import { ScrollView } from 'react-native'; // Using RN ScrollView directly
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { YStack, XStack, Form, Input, Label, TextArea, Button, Switch, Paragraph, Spinner } from 'tamagui';
import { useForm, Controller, ControllerRenderProps, FieldValues } from 'react-hook-form'; // Import ControllerRenderProps
import { zodResolver } from '@hookform/resolvers/zod';
import { useToastController } from '@tamagui/toast'; // Assuming ToastProvider is set up

import { trpc, type RouterInputs } from '@/utils/trpc'; // Assuming inputs are exported like this
import { haptics } from '@/utils/haptics'; // Assuming haptics helper exists

// Assuming your Zod schemas are exported like this. Adjust if necessary.
type CreateValueInput = RouterInputs['value']['createValue'];
type CreateStateInput = RouterInputs['state']['createDefinition'];

// 1️⃣ Define tagged types for discriminated union
type CreateValueInputTagged = CreateValueInput & { __type: 'value' };
type CreateStateInputTagged = CreateStateInput & { __type: 'state' };
type FormValues = CreateValueInputTagged | CreateStateInputTagged;

export default function ComposeModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type: string }>();
  const type = params.type === 'value' || params.type === 'state' ? params.type : undefined;
  const toast = useToastController();
  const utils = trpc.useUtils();

  const isValue = type === 'value';

  // 2️⃣ Define stricter default values using tagged types
  const defaultValueValues: CreateValueInputTagged = {
    __type: 'value',
    title: '', // Use 'title' instead of 'name' - Patch #4
    description: ''
  };
  const defaultStateValues: CreateStateInputTagged = {
    __type: 'state',
    name: '',
    scale: '1-5',
    description: '',
    active: true,
    priority: 50
  };

  // --- Separate useMutation hooks ---
  const createValueMutation = trpc.value.createValue.useMutation({
    onSuccess: (data) => handleSuccess(data),
    onError: (error) => handleError(error),
  });
  const createStateDefMutation = trpc.state.createDefinition.useMutation({
    onSuccess: (data) => handleSuccess(data),
    onError: (error) => handleError(error),
  });

  // --- Form setup ---
  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    // Note: ZodResolver might need specific configuration if schemas differ vastly
    // or consider not using it if relying solely on backend validation for this dynamic form.
    // Use the new stricter default value constants
    defaultValues: isValue ? defaultValueValues : defaultStateValues,
  });

  // Reset form if the type changes dynamically
  React.useEffect(() => {
    // Use the new stricter default value constants for reset
    reset(isValue ? defaultValueValues : defaultStateValues);
  }, [isValue, reset]);

  // --- Shared success/error handlers ---
  const handleSuccess = (data: any) => {
      toast.show('Created successfully!', { native: true });
      haptics.success();
      if (isValue) {
        utils.value.getValues.invalidate();
      } else {
        utils.state.getDefinitions.invalidate();
      }
      if (router.canGoBack()) {
        router.dismiss(); // Apply patch #5 - Use dismiss for modals
      } else {
        router.replace('/(tabs)/compass');
      }
  }

  const handleError = (error: any) => {
       toast.show(`Error: ${error.message}`, { type: 'error', native: true });
       haptics.error();
  }

  // --- Corrected onSubmit ---
  const onSubmit = (formData: FormValues) => {
    // 3️⃣ Use discriminant (__type) for type safety, remove casts
    if (formData.__type === 'value') {
      createValueMutation.mutate(formData);
    } else { // formData.__type === 'state'
      createStateDefMutation.mutate(formData);
    }
  };

  // Handle invalid type parameter gracefully
  if (!type) {
    return (
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
            <Paragraph color="$error">Invalid type specified.</Paragraph> {/* Use $error */}
            <Button onPress={() => router.back()} marginTop="$4">Go Back</Button>
        </YStack>
    );
  }

  // Determine current mutation state for button
  const isPending = isValue ? createValueMutation.isPending : createStateDefMutation.isPending;

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <Form onSubmit={handleSubmit(onSubmit)} flex={1} padding="$4" space="$4" backgroundColor="$background">
        <Stack.Screen options={{ title: isValue ? 'Add Principle' : 'Define State' }} />

        {/* Conditionally render form fields */}
        {isValue ? (
          <>
            {/* --- Fields for Principle/Value --- */}
            <YStack space="$2">
              <Label htmlFor="title">Title</Label> {/* Patch #4: name -> title */}
              <Controller
                name="title" /* Patch #4: name -> title */
                control={control}
                rules={{ required: 'Title is required' }} /* Patch #4 */
                render={({ field }) => ( /* Use inferred types from FormValues */
                  <Input
                    id="title"
                    onBlur={field.onBlur}
                    onChangeText={field.onChange} // Use onChangeText
                    value={field.value}
                    placeholder="Principle Title"
                  />
                )}
              />
              {/* Use $error token */}
              {errors.title && <Paragraph color="$error">{errors.title?.message}</Paragraph>}
            </YStack>

            <YStack space="$2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => ( // Use inferred types
                  <TextArea
                    id="description"
                    onBlur={field.onBlur}
                    onChangeText={field.onChange} // Use onChangeText
                    value={field.value ?? ''}
                    placeholder="Describe the principle..."
                    numberOfLines={3}
                  />
                )}
              />
              {errors.description && <Paragraph color="$error">{errors.description?.message}</Paragraph>}
            </YStack>
          </>
        ) : (
          <>
            {/* --- Fields for State Definition --- */}
            <YStack space="$2">
              <Label htmlFor="name">State Name</Label>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Name is required' }}
                render={({ field }) => ( // Use inferred types // Explicit type
                  <Input
                    id="name"
                    onBlur={field.onBlur}
                    onChangeText={field.onChange} // Use onChangeText
                    value={field.value}
                    placeholder="e.g., Energy Level, Mood" />
                )}
              />
              {errors.name && <Paragraph color="$error">{errors.name?.message}</Paragraph>}
            </YStack>

             <YStack space="$2">
               <Label htmlFor="scale">Scale</Label>
               <Controller
                 name="scale"
                 control={control}
                 rules={{ required: 'Scale is required' }}
                 render={({ field }) => ( // Use inferred types
                   <>
                    <Paragraph>Scale Selector Placeholder (Selected: {field.value})</Paragraph>
                    <XStack space="$2">
                      {/* Removed invalid theme prop */}
                      <Button size="$2" onPress={() => field.onChange('1-5')} theme={field.value === '1-5' ? 'active' : undefined}>1-5</Button>
                      <Button size="$2" onPress={() => field.onChange('1-10')} theme={field.value === '1-10' ? 'active' : undefined}>1-10</Button>
                    </XStack>
                   </>
                 )}
               />
                {errors.scale && <Paragraph color="$error">{errors.scale?.message}</Paragraph>}
             </YStack>

             <YStack space="$2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => ( // Use inferred types
                  <TextArea
                    id="description"
                    onBlur={field.onBlur}
                    onChangeText={field.onChange} // Use onChangeText
                    value={field.value ?? ''}
                    placeholder="Describe when/how to track this state..."
                    numberOfLines={3}
                  />
                )}
              />
              {errors.description && <Paragraph color="$error">{errors.description?.message}</Paragraph>}
            </YStack>

            <XStack space="$4" alignItems="center">
               <Label htmlFor="active" flex={1}>Active</Label>
               <Controller
                 name="active"
                 control={control}
                 render={({ field }: { field: ControllerRenderProps<FieldValues, 'active'> }) => ( // Explicit type
                    <Switch
                      id="active"
                      checked={!!field.value} // Use checked
                      onCheckedChange={field.onChange} // Use onCheckedChange
                      size="$3"
                    >
                        <Switch.Thumb animation="quick" />
                    </Switch>
                 )}
               />
            </XStack>
          </>
        )}

        {/* Removed invalid theme prop */}
        <Form.Trigger asChild disabled={isPending}>
          <Button icon={isPending ? <Spinner /> : undefined}>
            {isPending ? 'Saving...' : 'Save'}
          </Button>
        </Form.Trigger>
      </Form>
    </ScrollView>
  );
}```


## Screen Query Hooks
Hooks for screen data fetching

### useDashboardQuery.ts
**Path:** ./app/lib/useDashboardQuery.ts
**Description:** Screen-specific utility hooks

```typescript
// app/lib/useDashboardQuery.ts
import { trpc, RouterOutputs } from '@/utils/trpc';

// Export the dashboard data type for reuse
export type DashboardData = RouterOutputs['dashboard']['getDashboardData'];

/**
 * Hook to fetch dashboard data with caching
 */
export const useDashboardQuery = () =>
  trpc.dashboard.getDashboardData.useQuery(undefined, { 
    staleTime: 60_000, // 1 minute stale time
    refetchOnMount: 'always', // Always refetch when component mounts
  });
```

### useToggleTaskStatus.ts
**Path:** ./app/lib/useToggleTaskStatus.ts
**Description:** Screen-specific utility hooks

```typescript
// app/lib/useToggleTaskStatus.ts
import { trpc } from '@/utils/trpc';
// Import Alert from React Native instead of using a toast library for simplicity
import { Alert } from 'react-native';

/**
 * Hook for toggling task completion status with optimistic updates
 */
export const useToggleTaskStatus = () => {
  const utils = trpc.useUtils();
  
  return trpc.task.toggleTask.useMutation({
    // Optimistically update UI before server responds
    onMutate: async ({ taskId, completed }) => {
      // Cancel any outgoing refetches
      await utils.dashboard.getDashboardData.cancel();
      
      // Snapshot current data for potential rollback
      const previous = utils.dashboard.getDashboardData.getData();
      
      // Optimistically update to the new value
      utils.dashboard.getDashboardData.setData(undefined, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          tasks: oldData.tasks.map((task) => 
            task.id === taskId ? { ...task, status: completed ? 'completed' : 'in-progress' } : task
          ),
        };
      });
      
      return { previous };
    },
    
    // On successful mutation, show success message (silent in production)
    onSuccess: () => {
      if (__DEV__) {
        Alert.alert('Success', 'Task status updated');
      }
    },
    
    // If mutation fails, roll back optimistic update
    onError: (error, variables, context) => {
      if (context?.previous) {
        utils.dashboard.getDashboardData.setData(undefined, context.previous);
      }
      Alert.alert('Error', error.message || 'Failed to update task');
    },
    
    // Regardless of outcome, invalidate queries to refetch data
    onSettled: () => {
      utils.dashboard.getDashboardData.invalidate();
    },
  });
};
```


# 7️⃣ Backend & Data Layer
Server-side code, routers, API integration.


## Server Core
Server entry points and context

### index.ts
**Path:** server/src/index.ts
**Description:** Server entry point

```typescript
import express, { Request, Response } from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './router';
import { createContext } from './context';

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for client app
app.use(cors({
  origin: ['http://localhost:8081', 'http://localhost:19000', 'http://localhost:19006', 'exp://localhost:19000'],
  credentials: true,
}));

// Health check endpoint
app.get('/health', (_: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create tRPC middleware
app.use('/api/trpc', createExpressMiddleware({
  router: appRouter,
  createContext,
}));

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`tRPC API available at http://localhost:${port}/api/trpc`);
}); ```

### context.ts
**Path:** server/src/context.ts
**Description:** tRPC context setup

```typescript
import { createClient } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';
import dotenv from 'dotenv';

// Load environment variables from ./server/.env
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Add checks to ensure variables are loaded
if (!supabaseUrl) {
    console.log('Attempting Supabase init. URL found: No'); // Keep log here
    throw new Error('Missing environment variable: SUPABASE_URL in server/.env');
}
if (!supabaseServiceKey) {
    throw new Error('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY in server/.env');
}

console.log('Attempting Supabase init. URL found: Yes'); // Log success

// Initialize Supabase Admin client
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
  }
);

// Context passed to all tRPC resolvers
export interface Context {
  supabaseAdmin: typeof supabaseAdmin;
  userId: string;
}

// Build context from incoming request
export async function createContext({ req }: { req: any }): Promise<Context> {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Missing Authorization header' });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid Authorization header' });
  }

  // Validate JWT and get user
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: error?.message || 'Invalid token' });
  }

  return {
    supabaseAdmin,
    userId: data.user.id,
  };
} ```

### router.ts
**Path:** server/src/router.ts
**Description:** Main router configuration

```typescript
import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { supabaseAdmin, Context } from './context';

// Initialize tRPC with Supabase context
const t = initTRPC.context<Context>().create();

// Public procedure (no auth required)
export const router = t.router;
export const publicProcedure = t.procedure;

// Protected procedures ensure user is authenticated
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx: { supabaseAdmin: ctx.supabaseAdmin, userId: ctx.userId } });
});

// Import individual routers
import { dashboardRouter } from './routers/dashboardRouter';
import { valueRouter } from './routers/valueRouter';
import { principleRouter } from './routers/principleRouter';
import { goalRouter } from './routers/goalRouter';
import { taskRouter } from './routers/taskRouter';
import { habitRouter } from './routers/habitRouter';
import { trackedStateRouter } from './routers/trackedStateRouter';
import { userRouter } from './routers/userRouter';
import { rewardsRouter } from './routers/rewardsRouter';
import { reminderRouter } from './routers/reminderRouter';
import { goalProgressNoteRouter } from './routers/goalProgressNoteRouter';

// Create the router with Supabase-backed procedures
export const appRouter = router({
  greeting: {
    hello: publicProcedure
      .input(z.object({ name: z.string().optional() }))
      .query(async ({ input }) => {
        return { greeting: `Hello ${input.name ?? 'world'}` };
      }),
    goodbye: publicProcedure
      .query(() => {
        return { greeting: 'Goodbye!' };
      }),
  },
  user: userRouter,
  dashboard: dashboardRouter,
  value: valueRouter,
  principle: principleRouter,
  goal: goalRouter,
  task: taskRouter,
  habit: habitRouter,
  state: trackedStateRouter,
  rewards: rewardsRouter,
  reminder: reminderRouter,
  goalProgressNote: goalProgressNoteRouter,
});

// Export type router type
export type AppRouter = typeof appRouter; ```


## tRPC Routers
Backend tRPC routers

### dashboardRouter.ts
**Path:** ./server/src/routers/dashboardRouter.ts
**Description:** tRPC router implementation

```typescript
import { z } from 'zod';
import { router, protectedProcedure } from '../router';
import { TRPCError } from '@trpc/server';

// Define fields for consistent selection - align with Zod schemas & table structure
const HABIT_FIELDS = 'id, user_id, name, description, habit_type, goal_quantity, goal_units, frequency_type, frequency_details, reminder_id, streak, best_streak, sort_order, created_at, updated_at'; // Added reminder_id
const GOAL_FIELDS = 'id, user_id, name, description, priority, status, target_date, sort_order, created_at, updated_at'; // Use target_date
const TASK_FIELDS = 'id, user_id, name, notes, status, priority, due_date, reminder_id, goal_id, sort_order, created_at, updated_at'; // Use due_date, reminder_id
const HABIT_ENTRY_FIELDS = 'id, habit_id, user_id, date, quantity_value, notes, created_at';
const TRACKED_STATE_DEF_FIELDS = 'id, user_id, name, description, data_type, unit, sort_order, active, notes, created_at, updated_at'; // Adjusted based on potential schema changes

export const dashboardRouter = router({
  getDashboardData: protectedProcedure
    .input(
      z.object({
        habitLimit: z.number().min(1).default(5),
        goalLimit: z.number().min(1).default(5),
        taskLimit: z.number().min(1).default(10)
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      try {
        // Get limits from input or use defaults
        const habitLimit = input?.habitLimit || 5;
        const goalLimit = input?.goalLimit || 5;
        const taskLimit = input?.taskLimit || 10;

        // --- Fetch Habits ---
        const { data: habits, error: habitsError } = await ctx.supabaseAdmin
          .from('habits')
          .select(HABIT_FIELDS) // Use constant
          .eq('user_id', ctx.userId)
          .is('archived_at', null) // Filter out archived
          .order('sort_order', { ascending: true, nullsFirst: false }) // Correct: nullsFirst: false for nulls last
          .limit(habitLimit);
        if (habitsError) throw habitsError;

        // --- Fetch Goals ---
        const { data: goals, error: goalsError } = await ctx.supabaseAdmin
          .from('goals')
          .select(GOAL_FIELDS) // Use constant
          .eq('user_id', ctx.userId)
          .is('archived_at', null) // Filter out archived
          .order('sort_order', { ascending: true, nullsFirst: false }) // Correct: nullsFirst: false for nulls last
          .limit(goalLimit);
        if (goalsError) throw goalsError;

        // --- Fetch Upcoming Tasks (focus on upcoming tasks and prioritize those due soon) ---
        const today = new Date();
        const twoWeeksFromNow = new Date();
        twoWeeksFromNow.setDate(today.getDate() + 14);
        
        // We want to fetch tasks that are:
        // 1. Not completed
        // 2. Due within the next two weeks, or overdue
        // 3. Either unassigned or associated with the dashboard goals
        const { data: tasks, error: tasksError } = await ctx.supabaseAdmin
          .from('tasks')
          .select(TASK_FIELDS) // Use constant
          .eq('user_id', ctx.userId)
          .is('archived_at', null) // Filter out archived
          .neq('status', 'completed') // Use correct enum value
          .or(`due_date.lte.${twoWeeksFromNow.toISOString()},due_date.is.null`)
          .order('due_date', { ascending: true, nullsFirst: false }) // Use 'due_date'
          .limit(taskLimit);
        if (tasksError) throw tasksError;

        // --- Fetch Active Tracked State Definitions ---
        const { data: trackedStateDefinitions, error: statesError } = await ctx.supabaseAdmin
          .from('tracked_state_defs')
          .select(TRACKED_STATE_DEF_FIELDS) // Use constant
          .eq('user_id', ctx.userId)
          .eq('active', true)
          .order('sort_order', { ascending: true, nullsFirst: false }); // Correct: nullsFirst: false for nulls last
        if (statesError) throw statesError;
        
        // --- Fetch Latest State Entries for Active Definitions ---
        let latestEntriesMap: Record<string, { value: any; created_at: string }> = {};
        const stateDefIds = (trackedStateDefinitions || []).map(s => s.id);

        if (stateDefIds.length > 0) {
          // Use a CTE and ROW_NUMBER() to get the latest entry per state_id
          const { data: latestEntries, error: entriesError } = await ctx.supabaseAdmin.rpc(
            'get_latest_state_entries_for_user', 
            { p_user_id: ctx.userId, p_state_ids: stateDefIds }
          );

          if (entriesError) {
            console.error('Error fetching latest state entries:', entriesError);
            // Decide how to handle this - throw, or continue with empty/default values?
            // For now, log and continue, states will show default value
          } else {
            // Define expected type for entries from RPC
            type LatestEntry = { state_id: string; value: any; created_at: string };
            
            latestEntriesMap = (latestEntries as LatestEntry[] || []).reduce(
              (acc: Record<string, { value: any; created_at: string }>, entry: LatestEntry) => {
              acc[entry.state_id] = { value: entry.value, created_at: entry.created_at };
              return acc;
            }, {} as typeof latestEntriesMap);
          }
        }

        // --- Process Habits for 'completed' flag ---
        const todayStr = new Date().toISOString().split('T')[0];
        const habitIds = (habits || []).map(h => h.id);
        const { data: habitEntriesToday, error: todayEntriesError } = await ctx.supabaseAdmin
          .from('habit_entries')
          .select('habit_id') // Only need habit_id to check existence
          .eq('user_id', ctx.userId)
          .eq('date', todayStr) // Filter by date
          .in('habit_id', habitIds);
        if (todayEntriesError) throw todayEntriesError;

        const completedHabitIds = new Set((habitEntriesToday || []).map(e => e.habit_id));

        const formattedHabits = (habits || []).map(h => ({
          id: h.id,
          name: h.name, // Use name
          description: h.description, // Pass other potentially useful fields
          habit_type: h.habit_type,
          streak: h.streak,
          // Consider a habit completed if *any* entry exists for today
          completed: completedHabitIds.has(h.id)
        }));

        // --- Process Goals for 'progress' ---
        const goalIds = (goals || []).map(g => g.id);
        let tasksMap: Record<string, { total: number; completed: number }> = {};
        if (goalIds.length > 0) {
          const { data: allTasksForGoals, error: tasksError2 } = await ctx.supabaseAdmin
            .from('tasks')
            .select('goal_id, status')
            .eq('user_id', ctx.userId)
            .in('goal_id', goalIds);
          if (tasksError2) throw tasksError2;

          tasksMap = (allTasksForGoals || []).reduce<Record<string, { total: number; completed: number }>>((acc, task) => {
            if (task.goal_id) { // Ensure goal_id is not null
              const gid = task.goal_id;
              if (!acc[gid]) acc[gid] = { total: 0, completed: 0 };
              acc[gid].total++;
              if (task.status === 'completed') acc[gid].completed++;
            }
            return acc;
          }, {});
        }

        const formattedGoals = (goals || []).map((g) => {
          const { total = 0, completed: comp = 0 } = tasksMap[g.id] || {};
          // Calculate progress based on tasks, ignore goal.progress field for now
          const progress = total > 0 ? comp / total : 0;
          return {
            id: g.id,
            title: g.name, // Changed name to title to match frontend expectations
            status: g.status, // Pass status directly
            priority: g.priority, // Pass priority
            progress: Math.round(progress * 100) / 100, // Keep calculated progress
            tasks: { // Add tasks information expected by GoalSummaryCard
              total: total,
              completed: comp
            }
          };
        });

        // --- Format Tasks (Minimal formatting needed if TASK_FIELDS is correct) ---
        const formattedTasks = (tasks || []).map((t) => ({
          id: t.id,
          name: t.name,
          status: t.status,
          priority: t.priority,
          due_date: t.due_date, // Use due_date
          // Add other fields as needed by the dashboard UI
        }));

        // --- Format Tracked States with Latest Values ---
        const formattedTrackedStates = (trackedStateDefinitions || []).map((def) => {
          const latestEntry = latestEntriesMap[def.id];
          return {
            id: def.id,
            name: def.name,
            unit: def.unit, // Use 'unit' field
            currentValue: latestEntry ? latestEntry.value : null, // Default to null
            lastUpdated: latestEntry ? latestEntry.created_at : null,
          };
        });

        // Return formatted data including trackedStates
        return {
          habits: formattedHabits,
          goals: formattedGoals,
          tasks: tasks || [], // Ensure tasks is always an array
          trackedStates: formattedTrackedStates, // Use the newly formatted array
        };
      } catch (error: any) {
        console.error('Dashboard data fetch error:', error);
        
        // Handle specific error types with appropriate error codes
        if (error.code === '42P01') { // Table doesn't exist
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Database schema error',
          });
        }
        
        if (error.code === '23505') { // Unique violation
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Resource already exists',
          });
        }
        
        // Default error handling
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch dashboard data',
        });
      }
    }),
  
  getWeeklyProgress: protectedProcedure
    .input(z.object({
      daysToInclude: z.number().min(1).optional().default(7),
      includeRawData: z.boolean().optional().default(false),
    }).optional())
    .query(async ({ ctx, input }) => {
      try {
        // Calculate date range based on input or default to past week
        const daysToInclude = input?.daysToInclude || 7;
        const includeRawData = input?.includeRawData || false;
        
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - (daysToInclude - 1));
        
        const todayStr = endDate.toISOString().split('T')[0];
        const startDateStr = startDate.toISOString().split('T')[0];
        
        // Generate array of all dates in the range for daily aggregation
        const dateRange: string[] = [];
        const tempDate = new Date(startDate);
        while (tempDate <= endDate) {
          dateRange.push(tempDate.toISOString().split('T')[0]);
          tempDate.setDate(tempDate.getDate() + 1);
        }
        
        // Fetch habits relevant to the date range (active during any part of the range)
        // Need to consider habits created *before* the end date and not archived *before* the start date
        const HABIT_FIELDS_FOR_PROGRESS = 'id, name, habit_type, frequency_type, frequency_details, created_at, streak, best_streak'; // Add streak fields
        const { data: relevantHabits, error: habitsError } = await ctx.supabaseAdmin
          .from('habits')
          .select(HABIT_FIELDS_FOR_PROGRESS)
          .eq('user_id', ctx.userId)
          // Add logic here if needed to filter habits active within the date range
          // e.g., .lt('created_at', endDate.toISOString())
          //       .or(`archived_at.gte.${startDate.toISOString()},archived_at.is.null`)
          ;
        if (habitsError) throw habitsError;

        const relevantHabitIds = (relevantHabits || []).map(h => h.id);

        // Fetch habit entries within the date range for relevant habits
        const { data: habitEntries, error: entriesError } = await ctx.supabaseAdmin
          .from('habit_entries')
          .select('id, habit_id, date, completed, quantity_value, notes')
          .eq('user_id', ctx.userId)
          .in('habit_id', relevantHabitIds.length > 0 ? relevantHabitIds : ['dummy-uuid']) // Filter by relevant habits
          .gte('date', startDate.toISOString().split('T')[0])
          .lte('date', endDate.toISOString().split('T')[0])
          .order('date', { ascending: true });
 
        if (entriesError) throw entriesError;

        // Get all tasks completed or due within the date range
        const { data: relevantTasks, error: tasksError } = await ctx.supabaseAdmin
          .from('tasks')
          .select(TASK_FIELDS)
          .eq('user_id', ctx.userId)
          .is('archived_at', null)
          .or(`due_date.gte.${startDateStr}.and.due_date.lte.${todayStr},status.eq.completed.and.updated_at.gte.${startDateStr}.and.updated_at.lte.${todayStr}`);

        if (tasksError) throw tasksError;
        
        // Get total tasks count for completion rate
        const { count: totalTasks, error: countError } = await ctx.supabaseAdmin
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', ctx.userId);
          
        if (countError) throw countError;
        
        // Get goal progress snapshots for the period
        const { data: goalSnapshots, error: goalSnapshotsError } = await ctx.supabaseAdmin
          .from('goal_progress_snapshots') // Assuming we have this table
          .select('goal_id, progress, created_at')
          .eq('user_id', ctx.userId)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .order('created_at', { ascending: true });
          
        if (goalSnapshotsError) throw goalSnapshotsError;

        // -- AGGREGATE DATA BY DAY --
        
        // Create daily habit completion structure
        const habitsByDay: Record<string, { completed: number; total: number; entries: any[]; expected: number }> = {};
        dateRange.forEach(date => {
          habitsByDay[date] = { completed: 0, total: 0, entries: [], expected: 0 };
        });
        
        // Populate completed habits from entries (count existence, not completed flag)
        habitEntries?.forEach((entry: any) => {
          const dateStr = (entry.date as string).split('T')[0];
          if (habitsByDay[dateStr]) {
            // Only count one completion per habit per day
            if (!habitsByDay[dateStr].entries.some((e: any) => e.habit_id === entry.habit_id)) {
              habitsByDay[dateStr].completed++;
            }
            habitsByDay[dateStr].entries.push(entry);
          }
        });
        
        // Create daily task completion structure
        const tasksByDay: Record<string, { completed: number; entries: any[] }> = {};
        dateRange.forEach(date => {
          tasksByDay[date] = { completed: 0, entries: [] };
        });
        
        // Process completed tasks into daily stats
        relevantTasks?.forEach(task => {
          const completedDate = (task.updated_at as string).split('T')[0];
          if (tasksByDay[completedDate]) {
            tasksByDay[completedDate].completed++;
            tasksByDay[completedDate].entries.push(task);
          }
        });
        
        // Calculate expected habits per day based on frequency
        const isHabitExpected = (habit: any, date: string): boolean => {
          const dateObj = new Date(date + 'T00:00:00Z'); // Ensure UTC
          const dayOfWeek = dateObj.getUTCDay(); // 0 = Sunday, 6 = Saturday
          const dayOfMonth = dateObj.getUTCDate();
          const month = dateObj.getUTCMonth(); // 0 = January, 11 = December

          const habitCreatedDate = new Date(habit.created_at);
          if (dateObj < habitCreatedDate) {
            return false; // Cannot be expected before it was created
          }

          switch (habit.frequency_type) {
            case 'daily':
              return true;
            case 'specific_days':
              return Array.isArray(habit.frequency_details?.days) && habit.frequency_details.days.includes(dayOfWeek);
            // TODO: Add logic for 'weekly', 'monthly' etc. as needed
            default:
              return false;
          }
        };
        relevantHabits?.forEach(habit => {
          dateRange.forEach(date => {
            if (isHabitExpected(habit, date)) {
              habitsByDay[date].expected++;
            }
          });
        });
        
        // Format into daily progress reports
        const dailyProgress = dateRange.map(date => {
          const habitStats = habitsByDay[date];
          const taskStats = tasksByDay[date];
          
          const habitCompletionRate = habitStats.expected > 0 
            ? habitStats.completed / habitStats.expected 
            : 0;
            
          return {
            date,
            habits: {
              total: habitStats.total,
              completed: habitStats.completed,
              completionRate: habitCompletionRate,
              expected: habitStats.expected
            },
            tasks: {
              completed: taskStats.completed
            },
            // Optionally include raw entries if requested
            ...(includeRawData ? {
              habitEntries: habitStats.entries,
              completedTasks: taskStats.entries
            } : {})
          };
        });
        
        // Calculate overall metrics
        const totalHabitEntries = Object.values(habitsByDay).reduce(
          (sum, day) => sum + day.total, 0);
        const completedHabitEntries = Object.values(habitsByDay).reduce(
          (sum, day) => sum + day.completed, 0);
        const totalCompletedTasks = Object.values(tasksByDay).reduce(
          (sum, day) => sum + day.completed, 0);
          
        const taskCompletionRate = totalTasks ? totalCompletedTasks / totalTasks : 0;
        const habitConsistency = totalHabitEntries > 0 
          ? completedHabitEntries / totalHabitEntries 
          : 0;
          
        // Calculate habit streaks (could be moved to a separate helper function)
        const habitStreaks = (relevantHabits || []).map(habit => ({
          id: habit.id,
          name: habit.name,
          currentStreak: habit.streak || 0,
          bestStreak: habit.best_streak || 0
        }));
        
        // Prepare goal progress data
        const goalProgress: Record<string, { snapshots: any[]; startProgress?: number; endProgress?: number }> = {};
        
        (goalSnapshots || []).forEach(snapshot => {
          if (!goalProgress[snapshot.goal_id]) {
            goalProgress[snapshot.goal_id] = { snapshots: [] };
          }
          goalProgress[snapshot.goal_id].snapshots.push({
            progress: snapshot.progress,
            date: (snapshot.created_at as string).split('T')[0]
          });
        });
        
        // Calculate start and end progress for each goal
        Object.keys(goalProgress).forEach(goalId => {
          const snapshots = goalProgress[goalId].snapshots;
          if (snapshots.length > 0) {
            // Sort by date
            snapshots.sort((a, b) => a.date.localeCompare(b.date));
            goalProgress[goalId].startProgress = snapshots[0].progress;
            goalProgress[goalId].endProgress = snapshots[snapshots.length - 1].progress;
          }
        });
        
        return {
          dailyProgress,
          overallMetrics: {
            totalHabitEntries,
            completedHabitEntries,
            habitCompletionRate: habitConsistency,
            completedTasksCount: totalCompletedTasks,
            taskCompletionRate,
            // Trend indicators (compared to previous period)
            trends: {
              habitsImproving: true, // Placeholder - would compare to previous period
              tasksImproving: false // Placeholder - would compare to previous period
            }
          },
          habitStreaks,
          goalProgress: Object.entries(goalProgress).map(([goalId, data]) => ({
            goalId,
            progressChange: (data.endProgress || 0) - (data.startProgress || 0),
            currentProgress: data.endProgress || 0
          })),
          dateRange: {
            start: startDateStr,
            end: todayStr,
            days: dateRange
          }
        };
      } catch (error: any) {
        console.error('Weekly progress fetch error:', error);
        
        // Handle specific error types with appropriate error codes
        if (error.code === '42P01') { // Table doesn't exist
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Database schema error',
          });
        }
        
        if (error.code === '22P02') { // Invalid text representation
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid input format',
          });
        }
        
        // Default error handling
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch weekly progress',
        });
      }
    }),
}); ```

### goalProgressNoteRouter.ts
**Path:** ./server/src/routers/goalProgressNoteRouter.ts
**Description:** tRPC router implementation

```typescript
import { z } from 'zod';
import { router, protectedProcedure } from '../router';
import { TRPCError } from '@trpc/server';
import {
  createGoalProgressNoteInput,
  updateGoalProgressNoteInput,
  GetGoalProgressNotesInput,
  DeleteGoalProgressNoteInput,
} from '../types/trpc-types';

// Define fields for consistent selection
const GOAL_PROGRESS_NOTE_FIELDS = 'id, goal_id, user_id, note, created_at';

export const goalProgressNoteRouter = router({
  // Get all notes for a specific goal
  getNotesForGoal: protectedProcedure
    .input(GetGoalProgressNotesInput)
    .query(async ({ ctx, input }) => {
      try {
        // First, ensure the goal exists and belongs to the user
        const { error: goalError } = await ctx.supabaseAdmin
          .from('goals')
          .select('id')
          .eq('id', input.goal_id)
          .eq('user_id', ctx.userId)
          .single();

        if (goalError) {
          throw new TRPCError({
            code: goalError.code === 'PGRST116' ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
            message: 'Goal not found or access denied.',
          });
        }

        // Fetch the notes for that goal
        const { data, error } = await ctx.supabaseAdmin
          .from('goal_progress_notes')
          .select(GOAL_PROGRESS_NOTE_FIELDS)
          .eq('user_id', ctx.userId) // Redundant check, but good practice
          .eq('goal_id', input.goal_id)
          .order('created_at', { ascending: false }); // Newest first

        if (error) throw error;
        return data ?? [];
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch goal progress notes',
        });
      }
    }),

  createNote: protectedProcedure
    .input(createGoalProgressNoteInput)
    .mutation(async ({ ctx, input }) => {
      try {
        // Ensure the goal exists and belongs to the user before adding a note
        const { error: goalError } = await ctx.supabaseAdmin
          .from('goals')
          .select('id')
          .eq('id', input.goal_id)
          .eq('user_id', ctx.userId)
          .single();

        if (goalError) {
          throw new TRPCError({
            code: goalError.code === 'PGRST116' ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
            message: 'Goal not found or access denied.',
          });
        }

        const { data: note, error } = await ctx.supabaseAdmin
          .from('goal_progress_notes')
          .insert({
            ...input,
            user_id: ctx.userId,
          })
          .select(GOAL_PROGRESS_NOTE_FIELDS)
          .single();

        if (error) throw error;
        return note;
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to create goal progress note',
        });
      }
    }),

  updateNote: protectedProcedure
    .input(updateGoalProgressNoteInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;

        // Check existence and ownership of the note
        const { error: fetchError } = await ctx.supabaseAdmin
          .from('goal_progress_notes')
          .select('id')
          .eq('id', id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError) {
          throw new TRPCError({
            code: fetchError.code === 'PGRST116' ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
            message: 'Note not found or access denied.',
          });
        }

        const { data: updatedNote, error } = await ctx.supabaseAdmin
          .from('goal_progress_notes')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', ctx.userId)
          .select(GOAL_PROGRESS_NOTE_FIELDS)
          .single();

        if (error) throw error;
        return updatedNote;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to update goal progress note',
        });
      }
    }),

  deleteNote: protectedProcedure
    .input(DeleteGoalProgressNoteInput)
    .mutation(async ({ ctx, input }) => {
      try {
        // Check existence and ownership
        const { error: fetchError } = await ctx.supabaseAdmin
          .from('goal_progress_notes')
          .select('id')
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError) {
          throw new TRPCError({
            code: fetchError.code === 'PGRST116' ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
            message: 'Note not found or access denied.',
          });
        }

        const { error } = await ctx.supabaseAdmin
          .from('goal_progress_notes')
          .delete()
          .eq('id', input.id)
          .eq('user_id', ctx.userId);

        if (error) throw error;
        return { success: true, id: input.id };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to delete goal progress note',
        });
      }
    }),
});
```

### goalRouter.ts
**Path:** ./server/src/routers/goalRouter.ts
**Description:** tRPC router implementation

```typescript
import { z } from 'zod';
import { router, protectedProcedure } from '../router';
import { TRPCError } from '@trpc/server';
import { createGoalInput, updateGoalInput } from '../types/trpc-types';

const GOAL_FIELDS = 'id, user_id, title, description, progress, target_date, archived_at, sort_order, created_at, updated_at';

export const goalRouter = router({
  getGoals: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { data: goals, error } = await ctx.supabaseAdmin
          .from('goals')
          .select(GOAL_FIELDS)
          .eq('user_id', ctx.userId)
          .is('archived_at', null)
          .order('sort_order', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: false });

        if (error) throw error;

        return goals || [];
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch goals',
        });
      }
    }),

  getGoalById: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { data: goal, error } = await ctx.supabaseAdmin
          .from('goals')
          .select(GOAL_FIELDS)
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (error) throw error;
        if (!goal) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Goal not found',
          });
        }

        return goal;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch goal',
        });
      }
    }),

  createGoal: protectedProcedure
    .input(createGoalInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { data: goal, error } = await ctx.supabaseAdmin
          .from('goals')
          .insert({
            ...input,
            user_id: ctx.userId,
          })
          .select(GOAL_FIELDS)
          .single();

        if (error) throw error;
        return goal;
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to create goal',
        });
      }
    }),

  updateGoal: protectedProcedure
    .input(updateGoalInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;

        const { data: existingGoal, error: fetchError } = await ctx.supabaseAdmin
          .from('goals')
          .select('id')
          .eq('id', id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError || !existingGoal) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Goal not found or you do not have permission to update it',
          });
        }

        const { data: updatedGoal, error } = await ctx.supabaseAdmin
          .from('goals')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', ctx.userId)
          .select(GOAL_FIELDS)
          .single();

        if (error) throw error;
        return updatedGoal;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to update goal',
        });
      }
    }),

  deleteGoal: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { data: existingGoal, error: fetchError } = await ctx.supabaseAdmin
          .from('goals')
          .select('id')
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError || !existingGoal) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Goal not found or you do not have permission to delete it',
          });
        }

        const { error } = await ctx.supabaseAdmin
          .from('goals')
          .delete()
          .eq('id', input.id)
          .eq('user_id', ctx.userId);

        if (error) throw error;
        return { success: true, id: input.id };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to delete goal',
        });
      }
    }),

  listActive: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { data: goals, error } = await ctx.supabaseAdmin
          .from('goals')
          .select(GOAL_FIELDS)
          .eq('user_id', ctx.userId)
          .is('archived_at', null)
          .order('sort_order', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: false });
        if (error) throw error;
        return goals || [];
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch goals (in listActive stub)',
        });
      }
    }),

  listArchived: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { data: goals, error } = await ctx.supabaseAdmin
          .from('goals')
          .select(GOAL_FIELDS)
          .eq('user_id', ctx.userId)
          .not('archived_at', 'is', null)
          .order('archived_at', { ascending: false })
          .order('created_at', { ascending: false });
        if (error) throw error;
        return goals || [];
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch archived goals',
        });
      }
    }),

  archiveGoal: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { data: updatedGoal, error } = await ctx.supabaseAdmin
          .from('goals')
          .update({ archived_at: new Date().toISOString() })
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .select(GOAL_FIELDS)
          .single();

        if (error) {
          if (error.code === 'PGRST116') { 
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Goal not found or you do not have permission to archive it.',
            });
          }
          throw error;
        }
        return updatedGoal;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to archive goal',
        });
      }
    }),

  unarchiveGoal: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { data: updatedGoal, error } = await ctx.supabaseAdmin
          .from('goals')
          .update({ archived_at: null })
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .select(GOAL_FIELDS)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Goal not found or you do not have permission to unarchive it.',
            });
          }
          throw error;
        }
        return updatedGoal;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to unarchive goal',
        });
      }
    }),
});```

### habitRouter.ts
**Path:** ./server/src/routers/habitRouter.ts
**Description:** tRPC router implementation

```typescript
import { z } from "zod";
import { router, protectedProcedure } from "../router";
import { TRPCError } from "@trpc/server";
import {
  createHabitInput,
  updateHabitInput,
  createHabitEntryInput,
  updateHabitEntryInput,
} from '../types/trpc-types';
import {
  differenceInCalendarDays,
  parseISO,
  format
} from 'date-fns'; // Need date-fns

const HABIT_FIELDS =
  'id, user_id, title, cue, routine, reward, habit_type, goal_quantity, goal_unit, frequency_period, goal_frequency, recurrence_rule, recurrence_end_date, archived_at, sort_order, streak, best_streak, created_at, updated_at';

const HABIT_ENTRY_FIELDS =
  'id, user_id, habit_id, date, completed, quantity_value, notes, created_at';

async function calculateAndUpdateStreak(habitId: string, userId: string, supabase: any): Promise<{ currentStreak: number, bestStreak: number }> {
  try {
    // Fetch all entries for the habit, ordered by date descending
    const { data: entries, error: entriesError } = await supabase
      .from('habit_entries')
      .select('date, completed') // Only need date and completed status
      .eq('habit_id', habitId)
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (entriesError) {
      console.error(`Streak Calc Error: Failed to fetch entries for habit ${habitId}:`, entriesError);
      return { currentStreak: 0, bestStreak: 0 }; // Return 0 if entries can't be fetched
    }

    if (!entries || entries.length === 0) {
      // No entries, reset streak
      const { error: updateErr } = await supabase
        .from('habits')
        .update({ streak: 0 })
        .eq('id', habitId);
      if (updateErr) console.error(`Streak Calc Error: Failed to reset streak for habit ${habitId}`, updateErr);
      // Fetch best streak to return it accurately even if current is 0
      const { data: habitData } = await supabase.from('habits').select('best_streak').eq('id', habitId).single();
      return { currentStreak: 0, bestStreak: habitData?.best_streak || 0 };
    }

    let currentStreak = 0;
    const today = new Date();
    let expectedDate = today; // Start checking from today
    const todayStr = format(today, 'yyyy-MM-dd');
    const todayEntry = entries.find((e: any) => e.date === todayStr);

    // Determine starting point for streak check
    if (todayEntry?.completed) {
      currentStreak = 1;
      expectedDate = new Date(today.setDate(today.getDate() - 1)); // Start checking from yesterday
    } else {
      const yesterday = new Date(); // Need a fresh date object
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = format(yesterday, 'yyyy-MM-dd');
      const yesterdayEntry = entries.find((e: any) => e.date === yesterdayStr);
      if (yesterdayEntry?.completed) {
        currentStreak = 1;
        expectedDate = new Date(yesterday.setDate(yesterday.getDate() - 1)); // Start checking from day before yesterday
      } else {
        currentStreak = 0;
        // No need to loop if streak is already 0 based on today/yesterday
      }
    }

    // Only loop if there's a potential streak > 0
    if (currentStreak > 0) {
      // Find index of the entry *before* the expectedDate (since we check backwards)
      let startIndex = entries.findIndex((e: any) => e.date === format(expectedDate, 'yyyy-MM-dd'));
      // If expected date wasn't found (e.g., yesterday was the start), adjust index
      if (startIndex === -1) {
        // Start from the entry after the one that established the initial streak (today or yesterday)
        const initialStreakDateStr = todayEntry?.completed ? todayStr : (format(new Date(new Date().setDate(new Date().getDate() - 1)), 'yyyy-MM-dd'));
        const initialEntryIndex = entries.findIndex((e: any) => e.date === initialStreakDateStr);
        startIndex = initialEntryIndex !== -1 ? initialEntryIndex + 1 : 0;
      }

      for (let i = startIndex; i < entries.length; i++) {
        const entry = entries[i];
        const entryDate = parseISO(entry.date);
        const expectedDateStr = format(expectedDate, 'yyyy-MM-dd');

        if (entry.date === expectedDateStr) {
          if (entry.completed) {
            currentStreak++;
            expectedDate.setDate(expectedDate.getDate() - 1); // Move to check previous day
          } else {
            break; // Streak broken by uncompleted entry
          }
        } else {
          // Check if the date difference breaks the streak (allowing for gaps)
          const previousDate = i > 0 ? parseISO(entries[i - 1].date) : parseISO(entries[0].date);
          const dateDiff = differenceInCalendarDays(previousDate, entryDate);

          if (dateDiff > 1) {
            break; // Gap too large, streak broken
          }

          // If gap is 1 day, but this entry wasn't completed, streak is broken
          if (!entry.completed) {
            break;
          }

          // If gap is 1 day and completed, it doesn't continue the *current* consecutive sequence
          // but doesn't necessarily break it either (e.g., completed Mon, Wed - streak is 1 from Wed).
          // For simplicity, we break the loop here, assuming the *consecutive* streak from today/yesterday is what matters.
          // A more complex implementation could find the *longest* streak ending recently.
          break;
        }
      }
    }

    // Fetch current best_streak
    const { data: habitData, error: habitFetchError } = await supabase
      .from('habits')
      .select('best_streak')
      .eq('id', habitId)
      .single();

    if (habitFetchError) {
      console.error(`Streak Calc Error: Failed to fetch habit ${habitId} for best_streak:`, habitFetchError);
      // Fallback best streak if fetch fails
      const bestStreakFallback = Math.max(currentStreak, 0); 
      const { error: updateError } = await supabase
        .from('habits')
        .update({ streak: currentStreak, best_streak: bestStreakFallback })
        .eq('id', habitId);
      if (updateError) console.error(`Streak Calc Error: Failed to update streak (fallback) for habit ${habitId}:`, updateError);
      console.log(`Streak Updated (Fallback Best) for habit ${habitId}: Current=${currentStreak}, Best=${bestStreakFallback}`);
      return { currentStreak, bestStreak: bestStreakFallback };
    }

    const bestStreak = Math.max(currentStreak, habitData?.best_streak || 0);

    // Update the habit record
    const { error: updateError } = await supabase
      .from('habits')
      .update({ streak: currentStreak, best_streak: bestStreak })
      .eq('id', habitId);

    if (updateError) {
      console.error(`Streak Calc Error: Failed to update streak for habit ${habitId}:`, updateError);
    }

    console.log(`Streak Updated for habit ${habitId}: Current=${currentStreak}, Best=${bestStreak}`);
    return { currentStreak, bestStreak };

  } catch (error) {
    console.error(`Unexpected error calculating streak for habit ${habitId}:`, error);
    // Attempt to fetch best streak even on error
    const { data: habitData } = await supabase.from('habits').select('best_streak').eq('id', habitId).single();
    return { currentStreak: 0, bestStreak: habitData?.best_streak || 0 }; // Return 0 current streak on error
  }
}

export const habitRouter = router({
  getHabits: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { data: habits, error: habitsError } = await ctx.supabaseAdmin
          .from('habits')
          .select(HABIT_FIELDS)
          .eq('user_id', ctx.userId)
          .is('archived_at', null)
          .order('sort_order', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: false });

        if (habitsError) throw habitsError;
        if (!habits) return [];

        const todayStr = new Date().toISOString().split('T')[0];

        const { data: habitEntriesToday, error: todayEntriesError } = await ctx.supabaseAdmin
          .from('habit_entries')
          .select('habit_id')
          .eq('user_id', ctx.userId)
          .eq('date', todayStr)
          .in('habit_id', habits.map(h => h.id));

        if (todayEntriesError) throw todayEntriesError;

        const completedMap = (habitEntriesToday || []).reduce<Record<string, boolean>>((acc, entry) => {
          acc[entry.habit_id] = true;
          return acc;
        }, {});

        const formattedHabits = habits.map(h => ({
          ...h,
          completedToday: !!completedMap[h.id]
        }));

        return formattedHabits;
      } catch (error: any) {
        throw new TRPCError({ 
          code: 'INTERNAL_SERVER_ERROR', 
          message: error.message || 'Failed to fetch habits'
        });
      }
    }),

  getHabitById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabaseAdmin
        .from("habits")
        .select(HABIT_FIELDS)
        .eq("id", input.id)
        .eq("user_id", ctx.userId)
        .single();

      if (error) throw new TRPCError({ 
        code: error.code === "PGRST116" ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
        message: error.message 
      });
      return data;
    }),

  createHabit: protectedProcedure
    .input(createHabitInput)
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabaseAdmin
        .from("habits")
        .insert({
          ...input,
          user_id: ctx.userId,
          streak: 0,
          best_streak: 0
        })
        .select(HABIT_FIELDS)
        .single();

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      return data;
    }),

  updateHabit: protectedProcedure
    .input(updateHabitInput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const { data: habit, error: fetchError } = await ctx.supabaseAdmin
        .from("habits")
        .select("id")
        .eq("id", id)
        .eq("user_id", ctx.userId)
        .single();

      if (fetchError) throw new TRPCError({ 
        code: fetchError.code === "PGRST116" ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
        message: "Habit not found or access denied" 
      });

      const { data, error } = await ctx.supabaseAdmin
        .from("habits")
        .update(updateData)
        .eq("id", id)
        .eq('user_id', ctx.userId)
        .select(HABIT_FIELDS)
        .single();

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      return data;
    }),

  deleteHabit: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { data: habit, error: fetchError } = await ctx.supabaseAdmin
        .from("habits")
        .select("id")
        .eq("id", input.id)
        .eq("user_id", ctx.userId)
        .single();

      if (fetchError) throw new TRPCError({ 
        code: fetchError.code === "PGRST116" ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
        message: "Habit not found or access denied" 
      });

      const { error } = await ctx.supabaseAdmin
        .from("habits")
        .delete()
        .eq("id", input.id);

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      return { id: input.id };
    }),

  listArchivedHabits: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { data: habits, error } = await ctx.supabaseAdmin
          .from('habits')
          .select(HABIT_FIELDS)
          .eq('user_id', ctx.userId)
          .not('archived_at', 'is', null)
          .order('archived_at', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) throw error;
        return habits || [];
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch archived habits',
        });
      }
    }),

  archiveHabit: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { data: updatedHabit, error } = await ctx.supabaseAdmin
          .from('habits')
          .update({ archived_at: new Date().toISOString() })
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .select(HABIT_FIELDS)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Habit not found or access denied.' });
          }
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        }
        return updatedHabit;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to archive habit' });
      }
    }),

  unarchiveHabit: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { data: updatedHabit, error } = await ctx.supabaseAdmin
          .from('habits')
          .update({ archived_at: null })
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .select(HABIT_FIELDS)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Habit not found or access denied.' });
          }
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        }
        return updatedHabit;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to unarchive habit' });
      }
    }),

  getHabitEntries: protectedProcedure
    .input(z.object({
      habitId: z.string().uuid(),
      startDate: z.string().optional(), 
      endDate: z.string().optional(),   
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { error: habitError } = await ctx.supabaseAdmin
          .from("habits")
          .select("id")
          .eq("id", input.habitId)
          .eq("user_id", ctx.userId)
          .single();

        if (habitError) {
          if (habitError.code === 'PGRST116') {
             throw new TRPCError({ code: 'NOT_FOUND', message: 'Habit not found or access denied.' });
          }
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: habitError.message });
        }

        let query = ctx.supabaseAdmin
          .from('habit_entries')
          .select(HABIT_ENTRY_FIELDS)
          .eq('user_id', ctx.userId)
          .eq('habit_id', input.habitId);

        if (input.startDate) query = query.gte('date', input.startDate);
        if (input.endDate) query = query.lte('date', input.endDate);

        const { data, error: entriesError } = await query.order('date', { ascending: false });

        if (entriesError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: entriesError.message });
        return data || [];
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch habit entries' });
      }
    }),

  getHabitEntriesForHabit: protectedProcedure
    .input(z.object({ habitId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // TODO: Implement logic to fetch habit entries for a specific habit
      console.log(`Fetching entries for habit: ${input.habitId}, user: ${ctx.userId}`);
      // Example fetch:
      // const { data, error } = await ctx.supabaseAdmin
      //   .from('habit_entries')
      //   .select(HABIT_ENTRY_FIELDS)
      //   .eq('habit_id', input.habitId)
      //   .eq('user_id', ctx.userId)
      //   .order('date', { ascending: false });
      // if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      // return data || [];
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Not implemented yet' });
    }),

  createHabitEntry: protectedProcedure
    .input(createHabitEntryInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { data, error } = await ctx.supabaseAdmin
          .from('habit_entries')
          .insert({ ...input, user_id: ctx.userId })
          .select(HABIT_ENTRY_FIELDS)
          .single();

        if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });

        // Update streak after successful insert
        if (data) {
          await calculateAndUpdateStreak(input.habit_id, ctx.userId, ctx.supabaseAdmin);
        }

        return data;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to create habit entry',
        });
      }
    }),

  updateHabitEntry: protectedProcedure
    .input(updateHabitEntryInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;

        const { data: habitEntry, error: fetchError } = await ctx.supabaseAdmin
          .from('habit_entries')
          .select('id')
          .eq('id', id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError) throw new TRPCError({ 
          code: fetchError.code === "PGRST116" ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
          message: "Habit entry not found or access denied" 
        });

        const { data, error } = await ctx.supabaseAdmin
          .from('habit_entries')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', ctx.userId) // Ensure ownership
          .select(HABIT_ENTRY_FIELDS)
          .single();

        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });

        // Update streak after successful update
        if (data) {
          await calculateAndUpdateStreak(data.habit_id, ctx.userId, ctx.supabaseAdmin);
        }

        return data;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to update habit entry',
        });
      }
    }),

  deleteHabitEntry: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Fetch habitId *before* deleting the entry
        const { data: entryToDelete, error: fetchError } = await ctx.supabaseAdmin
          .from('habit_entries')
          .select('habit_id') // Fetch habit_id
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError || !entryToDelete) {
          throw new TRPCError({ 
            code: fetchError?.code === 'PGRST116' ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
            message: 'Habit entry not found or access denied.' 
          });
        }

        const { habit_id: habitIdForStreak } = entryToDelete; // Store before delete

        // Perform delete
        const { error } = await ctx.supabaseAdmin
          .from('habit_entries')
          .delete()
          .eq('id', input.id)
          .eq('user_id', ctx.userId); // Ensure user owns the entry being deleted

        if (error) throw error; // Throw if delete fails

        // Update streak *after* successful delete
        if (habitIdForStreak) { // Check if we got the habitId
          await calculateAndUpdateStreak(habitIdForStreak, ctx.userId, ctx.supabaseAdmin);
        }

        return { success: true, id: input.id };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to delete habit entry',
        });
      }
    }),

  toggleHabitEntry: protectedProcedure
    .input(z.object({ habitId: z.string().uuid(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Implement logic to find if entry exists for habitId/date/userId.
      // If exists, delete it.
      // If not exists, create it (need default values for boolean/quantity type).
      // Call calculateAndUpdateStreak after create/delete.
      console.log(`Toggling habit entry for habit: ${input.habitId}, date: ${input.date}`);
      // Example logic:
      // const { data: existingEntry, error: findError } = await ctx.supabaseAdmin
      //   .from('habit_entries')
      //   .select('id')
      //   .eq('habit_id', input.habitId)
      //   .eq('user_id', ctx.userId)
      //   .eq('date', input.date)
      //   .maybeSingle();
      // if (findError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: findError.message });

      // if (existingEntry) {
      //   // Delete existing
      //   const { error: deleteError } = await ctx.supabaseAdmin.from('habit_entries').delete().eq('id', existingEntry.id);
      //   if (deleteError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: deleteError.message });
      //   await calculateAndUpdateStreak(input.habitId, ctx.userId, input.date, ctx.supabaseAdmin);
      //   return { status: 'deleted', habitId: input.habitId, date: input.date };
      // } else {
      //   // Create new
      //   // Need to know habit type to set default 'completed' or 'quantity_value'
      //   const { data: newEntry, error: createError } = await ctx.supabaseAdmin
      //     .from('habit_entries')
      //     .insert({ habit_id: input.habitId, user_id: ctx.userId, date: input.date, completed: true /* or quantity_value: default */ })
      //     .select(HABIT_ENTRY_FIELDS)
      //     .single();
      //   if (createError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: createError.message });
      //   await calculateAndUpdateStreak(input.habitId, ctx.userId, input.date, ctx.supabaseAdmin);
      //   return { status: 'created', entry: newEntry };
      // }
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Not implemented yet' });
    }),
});```

### principleRouter.ts
**Path:** ./server/src/routers/principleRouter.ts
**Description:** tRPC router implementation

```typescript
// server/src/routers/principleRouter.ts
import { z } from 'zod';
import { router, protectedProcedure } from '../router';
import { TRPCError } from '@trpc/server';
import { createPrincipleInput, updatePrincipleInput } from '../types/trpc-types'; // These now expect 'title' and 'body'

// Define fields for consistent selection, using 'title' and 'body'
const PRINCIPLE_FIELDS = 'id, user_id, title, body, sort_order, created_at, updated_at';

export const principleRouter = router({
  getPrinciples: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { data: principles, error } = await ctx.supabaseAdmin
          .from('principles')
          .select(PRINCIPLE_FIELDS) // Use the constant with 'title' and 'body'
          .eq('user_id', ctx.userId)
          .order('sort_order', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: false });

        if (error) throw error;
        // TODO: Parse with Principle schema from trpc-types?
        return principles || []; // Return empty array if null
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch principles',
        });
      }
    }),

  getPrincipleById: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { data: principle, error } = await ctx.supabaseAdmin
          .from('principles')
          .select(PRINCIPLE_FIELDS) // Use the constant with 'title' and 'body'
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (error) {
           if (error.code === 'PGRST116') { // Handle not found specifically
             throw new TRPCError({ code: 'NOT_FOUND', message: 'Principle not found' });
           }
           throw error; // Rethrow other errors
        }
        // No need for !principle check if .single() is used and error isn't PGRST116

        // TODO: Parse with Principle schema from trpc-types?
        return principle;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch principle',
        });
      }
    }),

  createPrinciple: protectedProcedure
    .input(createPrincipleInput) // This Zod schema now expects 'title' and 'body'
    .mutation(async ({ ctx, input }) => {
      try {
        const { data: principle, error } = await ctx.supabaseAdmin
          .from('principles')
          .insert({
            ...input, // Spread validated input, already contains 'title' and 'body'
            user_id: ctx.userId,
          })
          .select(PRINCIPLE_FIELDS) // Use the constant
          .single();

        if (error) throw error;
        // TODO: Parse with Principle schema from trpc-types?
        return principle;
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to create principle',
        });
      }
    }),

  updatePrinciple: protectedProcedure
    .input(updatePrincipleInput) // This Zod schema now expects 'title' and 'body' (optional)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;

        // Check ownership
        const { data: existing, error: fetchError } = await ctx.supabaseAdmin
          .from('principles')
          .select('id')
          .eq('id', id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError) {
           if (fetchError.code === 'PGRST116') {
             throw new TRPCError({ code: 'NOT_FOUND', message: 'Principle not found or you do not have permission to update it' });
           }
           throw fetchError;
        }

        // Update
        const { data: updatedPrinciple, error } = await ctx.supabaseAdmin
          .from('principles')
          .update(updateData) // updateData contains validated 'title'/'body' if provided
          .eq('id', id)
          .eq('user_id', ctx.userId)
          .select(PRINCIPLE_FIELDS) // Use the constant
          .single();

        if (error) throw error;
        // TODO: Parse with Principle schema from trpc-types?
        return updatedPrinciple;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to update principle',
        });
      }
    }),

  deletePrinciple: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check ownership
        const { data: existing, error: fetchError } = await ctx.supabaseAdmin
          .from('principles')
          .select('id')
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError) {
            if (fetchError.code === 'PGRST116') {
             throw new TRPCError({ code: 'NOT_FOUND', message: 'Principle not found or you do not have permission to delete it' });
           }
           throw fetchError;
        }

        // Delete
        const { error } = await ctx.supabaseAdmin
          .from('principles')
          .delete()
          .eq('id', input.id)
          .eq('user_id', ctx.userId);

        if (error) throw error;
        return { success: true, id: input.id };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to delete principle',
        });
      }
    }),
});```

### reminderRouter.ts
**Path:** ./server/src/routers/reminderRouter.ts
**Description:** tRPC router implementation

```typescript
import { z } from 'zod';
import { router, protectedProcedure } from '../router';
import { TRPCError } from '@trpc/server';
import {
  createReminderInput,
  updateReminderInput,
  GetRemindersForEntityInput,
  DeleteReminderInput,
} from '../types/trpc-types';

// Define fields for consistent selection
const REMINDER_FIELDS = 'id, user_id, related_entity_type, related_entity_id, reminder_time, message, is_active, created_at, updated_at';

export const reminderRouter = router({
  // Get all active reminders for the user (might need refinement later)
  getActiveReminders: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { data, error } = await ctx.supabaseAdmin
          .from('reminders')
          .select(REMINDER_FIELDS)
          .eq('user_id', ctx.userId)
          .eq('is_active', true)
          .order('reminder_time', { ascending: true });

        if (error) throw error;
        return data ?? [];
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch active reminders',
        });
      }
    }),

  // Get reminders linked to a specific entity
  getRemindersForEntity: protectedProcedure
    .input(GetRemindersForEntityInput)
    .query(async ({ ctx, input }) => {
      try {
        const { data, error } = await ctx.supabaseAdmin
          .from('reminders')
          .select(REMINDER_FIELDS)
          .eq('user_id', ctx.userId)
          .eq('related_entity_type', input.related_entity_type)
          .eq('related_entity_id', input.related_entity_id)
          .order('reminder_time', { ascending: true });

        if (error) throw error;
        return data ?? [];
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch reminders for entity',
        });
      }
    }),

  createReminder: protectedProcedure
    .input(createReminderInput)
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Potentially validate that related_entity_id exists and belongs to user?
        // This requires knowing the related_entity_type and querying the correct table.
        // For now, assume valid input.
        const { data: reminder, error } = await ctx.supabaseAdmin
          .from('reminders')
          .insert({
            ...input,
            user_id: ctx.userId,
          })
          .select(REMINDER_FIELDS)
          .single();

        if (error) throw error;
        return reminder;
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to create reminder',
        });
      }
    }),

  updateReminder: protectedProcedure
    .input(updateReminderInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;

        // Check existence and ownership
        const { error: fetchError } = await ctx.supabaseAdmin
          .from('reminders')
          .select('id')
          .eq('id', id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError) {
          throw new TRPCError({
            code: fetchError.code === 'PGRST116' ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
            message: 'Reminder not found or access denied.',
          });
        }

        const { data: updatedReminder, error } = await ctx.supabaseAdmin
          .from('reminders')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', ctx.userId)
          .select(REMINDER_FIELDS)
          .single();

        if (error) throw error;
        return updatedReminder;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to update reminder',
        });
      }
    }),

  deleteReminder: protectedProcedure
    .input(DeleteReminderInput)
    .mutation(async ({ ctx, input }) => {
      try {
        // Check existence and ownership
        const { error: fetchError } = await ctx.supabaseAdmin
          .from('reminders')
          .select('id')
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError) {
          throw new TRPCError({
            code: fetchError.code === 'PGRST116' ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
            message: 'Reminder not found or access denied.',
          });
        }

        const { error } = await ctx.supabaseAdmin
          .from('reminders')
          .delete()
          .eq('id', input.id)
          .eq('user_id', ctx.userId);

        if (error) throw error;
        return { success: true, id: input.id };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to delete reminder',
        });
      }
    }),
});
```

### rewardsRouter.ts
**Path:** ./server/src/routers/rewardsRouter.ts
**Description:** tRPC router implementation

```typescript
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router, protectedProcedure } from '../router';
import { supabaseAdmin } from '../context';

// Corrected relative path
import { claimLootInput, awardBadgeInput } from '../types/trpc-types';

export const rewardsRouter = router({
  // Get all rewards for current user
  getUserRewards: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        // Select specific fields aligned with our Zod types
        const { data: rewards, error } = await ctx.supabaseAdmin
          .from('user_rewards')
          .select('id, user_id, reward_id, earned_at, rewards(id, name, description, emoji, image_url, required_points, type)')
          .eq('user_id', ctx.userId)
          .order('earned_at', { ascending: false });

        if (error) throw error;
        return rewards || [];
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch user rewards',
        });
      }
    }),

  // Get available rewards that can be earned
  getAvailableRewards: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        // Get all rewards with specific fields
        const { data: allRewards, error: rewardsError } = await ctx.supabaseAdmin
          .from('rewards')
          .select('id, name, description, emoji, image_url, required_points, type, can_earn_multiple')
          .order('required_points', { ascending: true });

        if (rewardsError) throw rewardsError;

        // Get already earned rewards
        const { data: earnedRewards, error: earnedError } = await ctx.supabaseAdmin
          .from('user_rewards')
          .select('reward_id')
          .eq('user_id', ctx.userId);

        if (earnedError) throw earnedError;

        // Filter out already earned one-time rewards
        const earnedIds = new Set((earnedRewards || []).map(er => er.reward_id));
        const availableRewards = allRewards?.filter(reward => 
          !earnedIds.has(reward.id) || reward.can_earn_multiple);

        return availableRewards || [];
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch available rewards',
        });
      }
    }),

  // Get user points
  getUserPoints: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { data: userProfile, error } = await ctx.supabaseAdmin
          .from('profiles')
          .select('points, lifetime_points')
          .eq('id', ctx.userId)
          .single();

        if (error) throw error;
        return {
          points: userProfile?.points || 0,
          lifetimePoints: userProfile?.lifetime_points || 0,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch user points',
        });
      }
    }),

  // Earn a reward if eligible
  earnReward: protectedProcedure
    .input(claimLootInput)
    .mutation(async ({ ctx, input }) => {
      try {
        // Get the reward details
        const { data: reward, error: rewardError } = await ctx.supabaseAdmin
          .from('rewards')
          .select('*')
          .eq('id', input.rewardId)
          .single();

        if (rewardError || !reward) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Reward not found',
          });
        }

        // Check if user has enough points
        const { data: userProfile, error: profileError } = await ctx.supabaseAdmin
          .from('profiles')
          .select('points')
          .eq('id', ctx.userId)
          .single();

        if (profileError || !userProfile) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch user profile',
          });
        }

        if (userProfile.points < reward.required_points) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Not enough points to earn this reward',
          });
        }

        // If the reward is one-time, check if already earned
        if (!reward.can_earn_multiple) {
          const { data: existingReward, error: existingError } = await ctx.supabaseAdmin
            .from('user_rewards')
            .select('id')
            .eq('user_id', ctx.userId)
            .eq('reward_id', input.rewardId)
            .single();

          if (existingReward) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'You have already earned this one-time reward',
            });
          }
        }

        // Begin transaction
        // 1. Deduct points from user
        const { error: updateError } = await ctx.supabaseAdmin
          .from('profiles')
          .update({
            points: userProfile.points - reward.required_points,
          })
          .eq('id', ctx.userId);

        if (updateError) throw updateError;

        // 2. Add reward to user's earned rewards
        const { data: userReward, error: insertError } = await ctx.supabaseAdmin
          .from('user_rewards')
          .insert({
            user_id: ctx.userId,
            reward_id: input.rewardId,
            earned_at: new Date().toISOString(),
            points_spent: reward.required_points,
          })
          .select()
          .single();

        if (insertError) {
          // Rollback points if adding reward failed
          await ctx.supabaseAdmin
            .from('profiles')
            .update({
              points: userProfile.points,
            })
            .eq('id', ctx.userId);

          throw insertError;
        }

        return {
          success: true,
          reward: userReward,
          remainingPoints: userProfile.points - reward.required_points,
        };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to earn reward',
        });
      }
    }),

  // Award points to user (e.g., for completing habits, tasks)
  awardPoints: protectedProcedure
    .input(awardBadgeInput)
    .mutation(async ({ ctx, input }) => {
      try {
        // Get current user points
        const { data: userProfile, error: profileError } = await ctx.supabaseAdmin
          .from('profiles')
          .select('points, lifetime_points')
          .eq('id', ctx.userId)
          .single();

        if (profileError || !userProfile) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch user profile',
          });
        }

        // Get badge details
        const { data: badge, error: badgeError } = await ctx.supabaseAdmin
          .from('rewards')
          .select('*')
          .eq('id', input.badgeId)
          .eq('type', 'badge')
          .single();

        if (badgeError || !badge) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Badge not found',
          });
        }

        // Default points to award
        const pointsToAward = 10;
        const currentPoints = userProfile.points || 0;
        const lifetimePoints = userProfile.lifetime_points || 0;
        const newPoints = currentPoints + pointsToAward;
        const newLifetimePoints = lifetimePoints + pointsToAward;

        // Update user points
        const { error: updateError } = await ctx.supabaseAdmin
          .from('profiles')
          .update({
            points: newPoints,
            lifetime_points: newLifetimePoints,
          })
          .eq('id', ctx.userId);

        if (updateError) throw updateError;

        // Record the point transaction
        const { data: pointTransaction, error: transactionError } = await ctx.supabaseAdmin
          .from('point_transactions')
          .insert({
            user_id: ctx.userId,
            points: pointsToAward,
            reason: `Earned badge: ${badge.name}`,
            source_type: 'badge',
            source_id: input.badgeId,
          })
          .select()
          .single();

        if (transactionError) throw transactionError;

        // Add badge to user's earned rewards
        const { data: userBadge, error: badgeInsertError } = await ctx.supabaseAdmin
          .from('user_rewards')
          .insert({
            user_id: ctx.userId,
            reward_id: input.badgeId,
            reward_type: 'badge',
            earned_at: new Date().toISOString(),
            points_spent: 0, // Badges don't cost points
          })
          .select()
          .single();

        if (badgeInsertError) throw badgeInsertError;

        return {
          success: true,
          previousPoints: currentPoints,
          newPoints,
          pointsAdded: pointsToAward,
          transaction: pointTransaction,
          badge: userBadge,
        };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to award badge',
        });
      }
    }),

  // Get point transaction history
  getPointHistory: protectedProcedure
    .input(z.object({
      limit: z.number().optional().default(20),
      cursor: z.string().optional(), // for pagination
    }))
    .query(async ({ ctx, input }) => {
      try {
        let query = ctx.supabaseAdmin
          .from('point_transactions')
          .select('*')
          .eq('user_id', ctx.userId)
          .order('created_at', { ascending: false })
          .limit(input.limit);
          
        // Handle cursor-based pagination
        if (input.cursor) {
          query = query.lt('created_at', input.cursor);
        }
        
        const { data: transactions, error } = await query;

        if (error) throw error;
        
        // Determine if there are more results
        const lastItem = transactions && transactions.length > 0 
          ? transactions[transactions.length - 1] 
          : null;
          
        return {
          items: transactions || [],
          nextCursor: lastItem?.created_at,
          hasMore: (transactions?.length || 0) === input.limit,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch point history',
        });
      }
    }),
}); ```

### taskRouter.ts
**Path:** ./server/src/routers/taskRouter.ts
**Description:** tRPC router implementation

```typescript
import { z } from 'zod';
import { router, protectedProcedure } from '../router';
import { TRPCError } from '@trpc/server';
import {
  createTaskInput,
  updateTaskInput,
  updateTaskStatusInput,
  TaskStatusEnum, // Import the enum
  TaskPriorityEnum,
} from '../types/trpc-types';

// Define fields for selection consistency
const TASK_FIELDS =
  'id, user_id, title, notes, status, priority, due_date, goal_id, parent_task_id, recurrence_rule, recurrence_end_date, archived_at, sort_order, created_at, updated_at'; // Corrected: 'priority' instead of 'priority_enum' if that's the actual column name after migration
const GOAL_FIELDS = 'id, user_id, title, description, progress, target_date, archived_at, sort_order, created_at, updated_at';


// --- Helper function to update goal progress ---
async function updateGoalProgress(goalId: string, userId: string, supabase: any) {
  try {
    // 1. Fetch all non-archived tasks for the goal
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, status') // Only need id and status
      .eq('goal_id', goalId)
      .eq('user_id', userId)
      .is('archived_at', null); // Exclude archived tasks

    if (tasksError) {
      console.error(`Error fetching tasks for goal ${goalId} during progress update:`, tasksError);
      // Decide how to handle this - maybe just log and skip update?
      return; // Exit if tasks can't be fetched
    }

    const totalTasks = tasks?.length || 0;
    const completedTasks = tasks?.filter((t: { status: string }) => t.status === TaskStatusEnum.enum.done).length || 0;

    // 2. Calculate progress (avoid division by zero)
    const newProgress = totalTasks > 0 ? completedTasks / totalTasks : 0;
    // Ensure progress is between 0 and 1, rounded to avoid floating point issues
    const clampedProgress = Math.round(Math.min(1, Math.max(0, newProgress)) * 100) / 100;

    // 3. Update the goal record
    const { error: updateError } = await supabase
      .from('goals')
      .update({ progress: clampedProgress })
      .eq('id', goalId)
      .eq('user_id', userId); // Ensure user owns the goal

    if (updateError) {
      console.error(`Error updating progress for goal ${goalId}:`, updateError);
      // Log error but don't necessarily throw, task toggle was successful
    } else {
        console.log(`Updated progress for goal ${goalId} to ${clampedProgress}`);
    }

  } catch (err) {
    console.error(`Unexpected error during goal progress update for goal ${goalId}:`, err);
    // Log unexpected errors
  }
}

export const taskRouter = router({
  getTasks: protectedProcedure // Gets non-archived tasks
    .input(z.object({
      goalId: z.string().uuid().optional(),
      // TODO: Add filters for status, priority, dates etc.?
    }))
    .query(async ({ ctx, input }) => {
      try {
        let query = ctx.supabaseAdmin
          .from('tasks')
          .select(TASK_FIELDS)
          .eq('user_id', ctx.userId)
          .is('archived_at', null); // Filter out archived

        if (input.goalId) {
          query = query.eq('goal_id', input.goalId);
        }

        // TODO: Add complex priority enum sorting? (e.g. high > medium > low)
        const { data: tasks, error } = await query
          .order('sort_order', { ascending: true, nullsFirst: false })
          .order('due_date', { ascending: true, nullsFirst: false }) // Order by due date (nulls last)
          .order('created_at', { ascending: false });

        if (error) throw error;
        // TODO: Parse with Task schema?
        return tasks || [];
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch tasks',
        });
      }
    }),

  getTaskById: protectedProcedure
    .input(z.object({
      id: z.string().uuid(), // Use uuid validation
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { data: task, error } = await ctx.supabaseAdmin
          .from('tasks')
          .select(TASK_FIELDS)
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (error) throw error;
        if (!task) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Task not found',
          });
        }

        // TODO: Parse with Task schema?
        return task;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch task',
        });
      }
    }),

  createTask: protectedProcedure
    .input(createTaskInput) // Use imported input type
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify goal_id if provided
        if (input.goal_id) {
          const { data: goal, error: goalError } = await ctx.supabaseAdmin
            .from('goals')
            .select('id')
            .eq('id', input.goal_id)
            .eq('user_id', ctx.userId) // Ensure goal belongs to user
            .is('archived_at', null) // Ensure goal is not archived
            .single();

          if (goalError || !goal) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Invalid or archived goal ID',
            });
          }
        }

        // Verify parent_task_id if provided
        if (input.parent_task_id) {
          const { data: parentTask, error: parentError } = await ctx.supabaseAdmin
            .from('tasks')
            .select('id')
            .eq('id', input.parent_task_id)
            .eq('user_id', ctx.userId) // Ensure parent belongs to user
            .is('archived_at', null) // Ensure parent is not archived
            .single();

          if (parentError || !parentTask) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Invalid or archived parent task ID',
            });
          }
        }

        const { data: task, error } = await ctx.supabaseAdmin
          .from('tasks')
          .insert({
            ...input, // Spread validated input (includes new fields like parent_task_id, recurrence etc)
            user_id: ctx.userId,
            // Ensure due_date is used if present in input
            due_date: input.due_date ?? null, // Use correct field name
          })
          .select(TASK_FIELDS)
          .single();

        if (error) {
           // Handle specific errors like FK violations?
           console.error("Create task error:", error);
           throw error;
        }
        // TODO: Parse with Task schema?
        return task;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to create task',
        });
      }
    }),

  updateTask: protectedProcedure
    .input(updateTaskInput) // Use imported input type
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input; // Separate id from update payload

        // Check ownership
        const { data: existingTask, error: fetchError } = await ctx.supabaseAdmin
          .from('tasks')
          .select('id, parent_task_id') // Select parent_task_id for cycle check
          .eq('id', id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError || !existingTask) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Task not found or you do not have permission to update it',
          });
        }

        // Verify goal_id if being updated
        if (updateData.goal_id) {
          const { data: goal, error: goalError } = await ctx.supabaseAdmin
            .from('goals')
            .select('id')
            .eq('id', updateData.goal_id)
            .eq('user_id', ctx.userId)
            .is('archived_at', null)
            .single();

          if (goalError || !goal) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Invalid or archived goal ID',
            });
          }
        }
        // Handle setting goal_id to null
        if (updateData.goal_id === null) {
          updateData.goal_id = null;
        }

        // Verify parent_task_id if being updated
        if (updateData.parent_task_id) {
           // Basic cycle check
           if (updateData.parent_task_id === id) {
             throw new TRPCError({
               code: 'BAD_REQUEST',
               message: 'Task cannot be its own parent',
             });
           }
          const { data: parentTask, error: parentError } = await ctx.supabaseAdmin
            .from('tasks')
            .select('id')
            .eq('id', updateData.parent_task_id)
            .eq('user_id', ctx.userId)
            .is('archived_at', null)
            .single();

          if (parentError || !parentTask) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Invalid or archived parent task ID',
            });
          }
          // TODO: Add deeper cycle detection if needed (check if new parent is a descendant)
        }
         // Handle setting parent_task_id to null
        if (updateData.parent_task_id === null) {
          updateData.parent_task_id = null;
        }

        // Ensure correct field name for due date if provided
        const payload: Record<string, any> = { ...updateData };
        if ('due_date' in payload) {
          payload.due_date = payload.due_date ?? null;
        }

        const { data: updatedTask, error } = await ctx.supabaseAdmin
          .from('tasks')
          .update(payload) // Pass validated update data
          .eq('id', id)
          .eq('user_id', ctx.userId)
          .select(TASK_FIELDS)
          .single();

        if (error) {
             // Handle specific errors like FK violations?
           console.error("Update task error:", error);
           throw error;
        }
        // TODO: Parse with Task schema?
        return updatedTask;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to update task',
        });
      }
    }),

  deleteTask: protectedProcedure
    .input(z.object({
      id: z.string().uuid(), // Use uuid validation
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check ownership
        const { data: existingTask, error: fetchError } = await ctx.supabaseAdmin
          .from('tasks')
          .select('id')
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError || !existingTask) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Task not found or you do not have permission to delete it',
          });
        }

        // Delete the task (consider implications for subtasks - maybe archive instead?)
        // For now, direct delete.
        const { error } = await ctx.supabaseAdmin
          .from('tasks')
          .delete()
          .eq('id', input.id)
          .eq('user_id', ctx.userId);

        if (error) throw error;
        return { success: true, id: input.id };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to delete task',
        });
      }
    }),

  // ---- Archive/Unarchive ----
  listArchivedTasks: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { data: tasks, error } = await ctx.supabaseAdmin
          .from('tasks')
          .select(TASK_FIELDS)
          .eq('user_id', ctx.userId)
          .not('archived_at', 'is', null) // Filter for archived tasks
          .order('archived_at', { ascending: false })
          .order('created_at', { ascending: false });
        if (error) throw error;
        // TODO: Parse with Task schema?
        return tasks || [];
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch archived tasks',
        });
      }
    }),

  archiveTask: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Consider archiving subtasks recursively?
      try {
        const { data: updatedTask, error } = await ctx.supabaseAdmin
          .from('tasks')
          .update({ archived_at: new Date().toISOString() })
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .select(TASK_FIELDS)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Task not found or you do not have permission to archive it.',
            });
          }
          throw error;
        }
        // TODO: Parse with Task schema?
        return updatedTask;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to archive task',
        });
      }
    }),

  unarchiveTask: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
       // TODO: Consider check if parent is archived?
      try {
        const { data: updatedTask, error } = await ctx.supabaseAdmin
          .from('tasks')
          .update({ archived_at: null })
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .select(TASK_FIELDS)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Task not found or you do not have permission to unarchive it.',
            });
          }
          throw error;
        }
        // TODO: Parse with Task schema?
        return updatedTask;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to unarchive task',
        });
      }
    }),

  // ---- Status Update ----
  updateTaskStatus: protectedProcedure
    .input(updateTaskStatusInput) // Uses { id: string().uuid(), status: TaskStatusEnum }
    .mutation(async ({ ctx, input }) => {
       try {
         // Check ownership first
         const { data: existing, error: fetchErr } = await ctx.supabaseAdmin
          .from('tasks')
          .select('id')
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

         if (fetchErr || !existing) {
           throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found or permission denied.' });
         }

         // Perform update
         const { data: updatedTask, error: updateErr } = await ctx.supabaseAdmin
           .from('tasks')
           .update({ status: input.status })
           .eq('id', input.id)
           .select(TASK_FIELDS)
           .single();

         if (updateErr) throw updateErr;
         // TODO: Parse with Task schema?
         return updatedTask;
       } catch (error: any) {
         if (error instanceof TRPCError) throw error;
         throw new TRPCError({
           code: 'INTERNAL_SERVER_ERROR',
           message: error.message || 'Failed to update task status',
         });
       }
    }),

  // ---- Refactored Stubs ----
  listToday: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const { data: tasks, error } = await ctx.supabaseAdmin
          .from('tasks')
          .select(TASK_FIELDS)
          .eq('user_id', ctx.userId)
          .is('archived_at', null)
          .gte('due_date', todayStart.toISOString())
          .lte('due_date', todayEnd.toISOString())
          .order('sort_order', { ascending: true, nullsFirst: false })
          .order('due_date', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: false });

        if (error) throw error;
        // TODO: Parse with Task schema?
        return tasks || [];
      } catch (error: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message || 'Failed to list tasks for today' });
      }
    }),

  listUpcoming: protectedProcedure
    .query(async ({ ctx }) => {
       try {
         const tomorrowStart = new Date();
         tomorrowStart.setDate(tomorrowStart.getDate() + 1);
         tomorrowStart.setHours(0, 0, 0, 0);

         const { data: tasks, error } = await ctx.supabaseAdmin
           .from('tasks')
           .select(TASK_FIELDS)
           .eq('user_id', ctx.userId)
           .is('archived_at', null)
           .gte('due_date', tomorrowStart.toISOString()) // Due date is tomorrow or later
           .order('due_date', { ascending: true, nullsFirst: false })
           .order('sort_order', { ascending: true, nullsFirst: false })
           .order('created_at', { ascending: false });

         if (error) throw error;
         // TODO: Parse with Task schema?
         return tasks || [];
       } catch (error: any) {
         throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message || 'Failed to list upcoming tasks' });
       }
    }),

 listOverdue: protectedProcedure
    .query(async ({ ctx }) => {
       try {
         const todayStart = new Date();
         todayStart.setHours(0, 0, 0, 0);

         const { data: tasks, error } = await ctx.supabaseAdmin
           .from('tasks')
           .select(TASK_FIELDS)
           .eq('user_id', ctx.userId)
           .is('archived_at', null)
           .lt('due_date', todayStart.toISOString()) // Due date is before today
           .not('status', 'in', `('${TaskStatusEnum.enum.done}')`) // Exclude completed tasks
           .order('due_date', { ascending: true, nullsFirst: false })
           .order('sort_order', { ascending: true, nullsFirst: false })
           .order('created_at', { ascending: false });

         if (error) throw error;
         // TODO: Parse with Task schema?
         return tasks || [];
       } catch (error: any) {
         throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message || 'Failed to list overdue tasks' });
       }
    }),

  toggleTask: protectedProcedure // Toggles between 'todo' and 'done'
    .input(z.object({
      taskId: z.string().uuid(),
      completed: z.boolean().optional() // Optional for backward compatibility
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // 1. Fetch the current task, including goal_id
        const { data: currentTask, error: fetchError } = await ctx.supabaseAdmin
          .from('tasks')
          .select('id, status, goal_id, title') // <-- Include goal_id and title
          .eq('id', input.taskId)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError || !currentTask) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found or permission denied.' });
        }

        // 2. Determine the new status
        let newStatus;
        if (input.completed !== undefined) {
          // If completed was explicitly provided, use it
          newStatus = input.completed ? TaskStatusEnum.enum.done : TaskStatusEnum.enum.todo;
        } else {
          // Otherwise toggle the current status
          newStatus = currentTask.status === TaskStatusEnum.enum.done
            ? TaskStatusEnum.enum.todo
            : TaskStatusEnum.enum.done;
        }

        // 3. Update the task status
        const { data: updatedTask, error: updateError } = await ctx.supabaseAdmin
          .from('tasks')
          .update({ status: newStatus })
          .eq('id', input.taskId)
          .select(TASK_FIELDS) // Return the full updated task
          .single();

        if (updateError) throw updateError;

        // 4. *** NEW: Update goal progress if applicable ***
        if (currentTask.goal_id) {
           // Call the helper function asynchronously - no need to await here
           // unless the UI needs the updated goal immediately (unlikely for a toggle)
          updateGoalProgress(currentTask.goal_id, ctx.userId, ctx.supabaseAdmin);
        }

        // 5. Return the updated task
        return updatedTask;

      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        console.error("Error in toggleTask:", error); // Log unexpected errors
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to toggle task status',
        });
      }
    }),

  // --- Obsolete Stubs (keep or remove based on client usage) ---
  /*
  getTasksByGoal: protectedProcedure ... // Covered by getTasks with goalId filter
  getTodaysTasks: protectedProcedure ... // Replaced by listToday
  getUpcomingTasks: protectedProcedure ... // Replaced by listUpcoming
  updateTaskStatus_OLD: protectedProcedure ... // Replaced by updateTaskStatus and toggleTask
  */

});```

### trackedStateRouter.ts
**Path:** ./server/src/routers/trackedStateRouter.ts
**Description:** tRPC router implementation

```typescript
// File: server/src/routers/trackedStateRouter.ts

import { z } from 'zod';
import { router, protectedProcedure } from '../router';
import { TRPCError } from '@trpc/server';
import {
  // Ensure all necessary input types from trpc-types are imported
  createTrackedStateDefInput,
  updateTrackedStateDefInput,
  GetTrackedStateDefByIdInput,
  DeleteTrackedStateDefInput,
  CreateStateEntryInput,      // <--- Import for createEntry
  updateStateEntryInput,      // <--- Import for updateEntry
  GetStateEntriesInput,       // <--- Import for getEntries
  DeleteStateEntryInput       // <--- Import for deleteEntry
} from '../types/trpc-types';

// Use correct field names from database.types.ts & trpc-types.ts
const TRACKED_STATE_DEF_FIELDS = 'id, user_id, name, description, scale, custom_labels, unit, icon, target_min_value, target_max_value, created_at, updated_at, active, priority';
const STATE_ENTRY_FIELDS = 'id, user_id, definition_id, value_numeric, value_text, entry_timestamp, notes';

export const trackedStateRouter = router({
  getDefinitions: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { data, error } = await ctx.supabaseAdmin
          .from('tracked_state_defs')
          .select(TRACKED_STATE_DEF_FIELDS)
          .eq('user_id', ctx.userId)
          .eq('active', true)
          .order('priority', { ascending: true, nullsFirst: false }) // Corrected: nullsFirst
          .order('created_at', { ascending: true });

        if (error) throw error;
        return data ?? [];
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch tracked state definitions',
        });
      }
    }),

  getDefinitionById: protectedProcedure
    .input(GetTrackedStateDefByIdInput) // Use correct Zod schema
    .query(async ({ ctx, input }) => {
       try {
        const { data: definition, error } = await ctx.supabaseAdmin
          .from('tracked_state_defs')
          .select(TRACKED_STATE_DEF_FIELDS)
          .eq('id', input.id) // input.id is now correctly typed
          .eq('user_id', ctx.userId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Tracked state definition not found.' });
          }
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        }
        return definition;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch tracked state definition',
        });
      }
    }),

  createDefinition: protectedProcedure
    .input(createTrackedStateDefInput) // Use correct Zod schema
    .mutation(async ({ ctx, input }) => {
       try {
        const { data: definition, error } = await ctx.supabaseAdmin
          .from('tracked_state_defs')
          .insert({
            ...input, // input is now correctly typed
            user_id: ctx.userId,
          })
          .select(TRACKED_STATE_DEF_FIELDS)
          .single();

        if (error) throw error;
        return definition;
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to create tracked state definition',
        });
      }
    }),

  updateDefinition: protectedProcedure
    .input(updateTrackedStateDefInput) // Use correct Zod schema
    .mutation(async ({ ctx, input }) => {
       try {
        const { id, ...updateData } = input; // input is now correctly typed

        const { error: fetchError } = await ctx.supabaseAdmin
          .from('tracked_state_defs')
          .select('id')
          .eq('id', id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError) {
          throw new TRPCError({
            code: fetchError.code === 'PGRST116' ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
            message: 'Definition not found or access denied.',
          });
        }

        const { data: updatedDefinition, error } = await ctx.supabaseAdmin
          .from('tracked_state_defs')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', ctx.userId)
          .select(TRACKED_STATE_DEF_FIELDS)
          .single();

        if (error) throw error;
        return updatedDefinition;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to update tracked state definition',
        });
      }
    }),

  deleteDefinition: protectedProcedure
    .input(DeleteTrackedStateDefInput) // Use correct Zod schema
    .mutation(async ({ ctx, input }) => {
       try {
        const { error: fetchError } = await ctx.supabaseAdmin
          .from('tracked_state_defs')
          .select('id')
          .eq('id', input.id) // input.id is now correctly typed
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError) {
          throw new TRPCError({
            code: fetchError.code === 'PGRST116' ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
            message: 'Definition not found or access denied.',
          });
        }

        const { error } = await ctx.supabaseAdmin
          .from('tracked_state_defs')
          .delete()
          .eq('id', input.id) // input.id is now correctly typed
          .eq('user_id', ctx.userId);

        if (error) throw error;
        return { success: true, id: input.id }; // input.id is now correctly typed
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to delete tracked state definition',
        });
      }
    }),

  // --- State Entry Procedures ---

  getEntries: protectedProcedure
    .input(GetStateEntriesInput) // <<<--- ADDED .input() BINDING
    .query(async ({ ctx, input }) => {
      try {
        let query = ctx.supabaseAdmin
          .from('state_entries')
          .select(STATE_ENTRY_FIELDS)
          .eq('user_id', ctx.userId)
          .eq('definition_id', input.tracked_state_def_id); // input is now typed

        if (input.startDate) { // input is now typed
          query = query.gte('entry_timestamp', input.startDate);
        }
        if (input.endDate) { // input is now typed
          query = query.lte('entry_timestamp', input.endDate);
        }

        query = query.order('entry_timestamp', { ascending: false });

        if (input.limit) { // input is now typed
          query = query.limit(input.limit);
        }

        const { data: entries, error } = await query;

        if (error) throw error;
        return entries ?? [];
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch state entries',
        });
      }
    }),

  createEntry: protectedProcedure
    .input(CreateStateEntryInput) // <<<--- ADDED .input() BINDING
    .mutation(async ({ ctx, input }) => {
      try {
        // Check definition ownership (already implemented correctly)
        const { error: defError } = await ctx.supabaseAdmin
          .from('tracked_state_defs')
          .select('id')
          .eq('id', input.tracked_state_def_id) // input is now typed
          .eq('user_id', ctx.userId)
          .single();

        if (defError) {
          throw new TRPCError({
            code: defError.code === 'PGRST116' ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
            message: 'Tracked state definition not found or invalid.',
          });
        }

        // Insert typed data
        const { data: entry, error } = await ctx.supabaseAdmin
          .from('state_entries')
          .insert({
            user_id: ctx.userId,
            definition_id: input.tracked_state_def_id, // input is now typed
            value_numeric: input.value_numeric,     // input is now typed
            value_text: input.value_text,         // input is now typed
            entry_timestamp: input.entry_timestamp || new Date().toISOString(), // input is now typed
            notes: input.notes,                 // input is now typed
          })
          .select(STATE_ENTRY_FIELDS)
          .single();

        if (error) throw error;
        return entry;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to create state entry',
        });
      }
    }),

  updateEntry: protectedProcedure
    .input(updateStateEntryInput) // <<<--- ADDED .input() BINDING
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input; // input is now typed

        // Check ownership (already implemented correctly)
        const { error: fetchError } = await ctx.supabaseAdmin
          .from('state_entries')
          .select('id')
          .eq('id', id) // Use id from destructured input
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError) {
          throw new TRPCError({
            code: fetchError.code === 'PGRST116' ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
            message: 'Entry not found or access denied.',
          });
        }

        // updateData is now correctly typed from the input schema
        const { data: updatedEntry, error } = await ctx.supabaseAdmin
          .from('state_entries')
          .update(updateData)
          .eq('id', id) // Use id from destructured input
          .eq('user_id', ctx.userId)
          .select(STATE_ENTRY_FIELDS)
          .single();

        if (error) throw error;
        return updatedEntry;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to update state entry',
        });
      }
    }),

  deleteEntry: protectedProcedure
    .input(DeleteStateEntryInput) // <<<--- ADDED .input() BINDING
    .mutation(async ({ ctx, input }) => {
       try {
        // Check ownership (already implemented correctly)
        const { error: fetchError } = await ctx.supabaseAdmin
          .from('state_entries')
          .select('id')
          .eq('id', input.id) // input is now typed
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError) {
          throw new TRPCError({
            code: fetchError.code === 'PGRST116' ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
            message: 'Entry not found or access denied.',
          });
        }

        const { error } = await ctx.supabaseAdmin
          .from('state_entries')
          .delete()
          .eq('id', input.id) // input is now typed
          .eq('user_id', ctx.userId);

        if (error) throw error;
        return { success: true, id: input.id }; // input is now typed
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to delete state entry',
        });
      }
    }),
});```

### userRouter.ts
**Path:** ./server/src/routers/userRouter.ts
**Description:** tRPC router implementation

```typescript
import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../router';
import { TRPCError } from '@trpc/server';

export const userRouter = router({
  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await ctx.supabaseAdmin
        .from('profiles')
        .select('id, username, avatar_url, full_name, bio, time_zone, onboarding_completed, created_at, updated_at')
        .eq('id', ctx.userId)
        .single();
        
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return data;
    }),
    
  updateProfile: protectedProcedure
    .input(z.object({
      full_name: z.string().optional(),
      avatar_url: z.string().optional(),
      theme: z.string().optional(),
      time_zone: z.string().optional(),
      display_name: z.string().optional(),
      bio: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabaseAdmin
        .from('profiles')
        .update(input)
        .eq('id', ctx.userId)
        .select()
        .single();
        
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return data;
    }),
    
  getUserSettings: protectedProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await ctx.supabaseAdmin
        .from('user_settings')
        .select('id, user_id, notification_preferences, ui_preferences')
        .eq('user_id', ctx.userId)
        .single();
        
      if (error) {
        // If settings don't exist, create default settings
        if (error.code === 'PGRST116') {
          const { data: newSettings, error: createError } = await ctx.supabaseAdmin
            .from('user_settings')
            .insert({
              user_id: ctx.userId,
              notification_preferences: {
                email: true,
                push: true,
                task_reminders: true,
                goal_updates: true,
                habit_reminders: true
              },
              ui_preferences: {
                theme: 'system',
                compact_view: false,
                show_completed_tasks: true
              }
            })
            .select()
            .single();
            
          if (createError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: createError.message });
          return newSettings;
        }
        
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      }
      
      return data;
    }),
    
  updateUserSettings: protectedProcedure
    .input(z.object({
      notification_preferences: z.object({
        email: z.boolean().optional(),
        push: z.boolean().optional(),
        task_reminders: z.boolean().optional(),
        goal_updates: z.boolean().optional(),
        habit_reminders: z.boolean().optional()
      }).optional(),
      ui_preferences: z.object({
        theme: z.string().optional(),
        compact_view: z.boolean().optional(),
        show_completed_tasks: z.boolean().optional()
      }).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // First check if settings exist
      const { data: existingSettings, error: fetchError } = await ctx.supabaseAdmin
        .from('user_settings')
        .select('id')
        .eq('user_id', ctx.userId)
        .single();
        
      if (fetchError && fetchError.code === 'PGRST116') {
        // Create settings if they don't exist
        const defaultSettings = {
          user_id: ctx.userId,
          notification_preferences: {
            email: true,
            push: true,
            task_reminders: true,
            goal_updates: true,
            habit_reminders: true,
            ...input.notification_preferences
          },
          ui_preferences: {
            theme: 'system',
            compact_view: false,
            show_completed_tasks: true,
            ...input.ui_preferences
          }
        };
        
        const { data, error } = await ctx.supabaseAdmin
          .from('user_settings')
          .insert(defaultSettings)
          .select()
          .single();
          
        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
        return data;
      } else if (fetchError) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: fetchError.message });
      }
      
      // Update existing settings
      const { data, error } = await ctx.supabaseAdmin
        .from('user_settings')
        .update(input)
        .eq('user_id', ctx.userId)
        .select()
        .single();
        
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return data;
    }),
    
  getOnboardingStatus: protectedProcedure
    .query(async ({ ctx }) => {
      const { data, error } = await ctx.supabaseAdmin
        .from('profiles')
        .select('id, onboarding_completed')
        .eq('id', ctx.userId)
        .single();
        
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return { onboardingCompleted: data?.onboarding_completed || false };
    }),
    
  completeOnboarding: protectedProcedure
    .mutation(async ({ ctx }) => {
      const { data, error } = await ctx.supabaseAdmin
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', ctx.userId)
        .select()
        .single();
        
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return { success: true };
    }),
}); ```

### valueRouter.ts
**Path:** ./server/src/routers/valueRouter.ts
**Description:** tRPC router implementation

```typescript
import { z } from 'zod';
import { router, protectedProcedure } from '../router';
import { TRPCError } from '@trpc/server';
import { createValueInput, updateValueInput } from '../types/trpc-types';

export const valueRouter = router({
  getValues: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { data: values, error } = await ctx.supabaseAdmin
          .from('values')
          .select('id, user_id, name, description, color, icon, sort_order, created_at, updated_at')
          .eq('user_id', ctx.userId)
          .order('sort_order', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: false });

        if (error) throw error;
        // TODO: Parse with Value schema from trpc-types?
        return values;
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch values',
        });
      }
    }),

  getValueById: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { data: value, error } = await ctx.supabaseAdmin
          .from('values')
          .select('id, user_id, name, description, color, icon, sort_order, created_at, updated_at')
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (error) throw error;
        if (!value) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Value not found',
          });
        }

        // TODO: Parse with Value schema from trpc-types?
        return value;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to fetch value',
        });
      }
    }),

  createValue: protectedProcedure
    .input(createValueInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { data: value, error } = await ctx.supabaseAdmin
          .from('values')
          .insert({
            ...input,
            user_id: ctx.userId,
          })
          .select('id, user_id, name, description, color, icon, sort_order, created_at, updated_at')
          .single();

        if (error) throw error;
        // TODO: Parse with Value schema from trpc-types?
        return value;
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to create value',
        });
      }
    }),

  updateValue: protectedProcedure
    .input(updateValueInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;

        // First check if the value exists and belongs to user
        const { data: existingValue, error: fetchError } = await ctx.supabaseAdmin
          .from('values')
          .select('id')
          .eq('id', id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError || !existingValue) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Value not found or you do not have permission to update it',
          });
        }

        // Update the value
        const { data: updatedValue, error } = await ctx.supabaseAdmin
          .from('values')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', ctx.userId)
          .select('id, user_id, name, description, color, icon, sort_order, created_at, updated_at')
          .single();

        if (error) throw error;
        // TODO: Parse with Value schema from trpc-types?
        return updatedValue;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to update value',
        });
      }
    }),

  deleteValue: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if the value exists and belongs to user
        const { data: existingValue, error: fetchError } = await ctx.supabaseAdmin
          .from('values')
          .select('id')
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError || !existingValue) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Value not found or you do not have permission to delete it',
          });
        }

        // Delete the value
        const { error } = await ctx.supabaseAdmin
          .from('values')
          .delete()
          .eq('id', input.id)
          .eq('user_id', ctx.userId);

        if (error) throw error;
        return { success: true, id: input.id };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to delete value',
        });
      }
    }),
});```


## Server Types
Backend type definitions

### index.ts
**Path:** ./server/src/types/index.ts
**Description:** Server-side type definitions

```typescript
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
} ```

### trpc-types.ts
**Path:** ./server/src/types/trpc-types.ts
**Description:** Server-side type definitions

```typescript
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
*/```


# 8️⃣ Utilities & Hooks
Reusable utilities and React hooks.


## Hooks
Custom React hooks

### useColorScheme.ts
**Path:** ./hooks/useColorScheme.ts
**Description:** Custom React hooks

```typescript
export { useColorScheme } from 'react-native';
```

### useColorScheme.web.ts
**Path:** ./hooks/useColorScheme.web.ts
**Description:** Custom React hooks

```typescript
import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}
```

### useOfflineSync.ts
**Path:** ./hooks/useOfflineSync.ts
**Description:** Custom React hooks

```typescript
import { useEffect, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { saveOfflineMutation, syncOfflineMutations, getPendingItems, PendingItem, setupBackgroundSync } from '@/utils/offline-sync';
import { useState } from 'react';

/**
 * Hook to provide offline sync functionality
 */
export function useOfflineSync<T extends { id: string }>(entityType: string) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load pending items on mount
  useEffect(() => {
    loadPendingItems();
    
    // Set up network status listener
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected !== false && state.isInternetReachable !== false;
      setIsOnline(online);
      
      // If going from offline to online, try to sync
      if (online) {
        syncItems();
      }
    });
    
    // Also set up background sync (network status changes outside this component)
    const unsubscribeBackground = setupBackgroundSync();
    
    return () => {
      unsubscribe();
      unsubscribeBackground();
    };
  }, [entityType]);

  // Load pending items from storage
  const loadPendingItems = useCallback(async () => {
    const items = await getPendingItems(entityType);
    setPendingItems(items);
  }, [entityType]);

  // Create an item (works offline)
  const createItem = useCallback(async (data: Omit<T, 'id'>): Promise<{ id: string, isOffline: boolean }> => {
    try {
      // Check if we're online
      const networkState = await NetInfo.fetch();
      const online = networkState.isConnected && networkState.isInternetReachable !== false;
      
      if (online) {
        // If online, create directly
        // In a real app, you'd use your API client (like supabase) here
        // const { data: newItem, error } = await supabase.from(entityType).insert(data).select();
        // if (error) throw error;
        // return { id: newItem.id, isOffline: false };
        
        // For demo purposes, simulate success
        return { id: `server-${Date.now()}`, isOffline: false };
      } else {
        // If offline, save to be synced later
        const tempId = await saveOfflineMutation('create', entityType, data);
        await loadPendingItems(); // Reload pending items
        return { id: tempId, isOffline: true };
      }
    } catch (error) {
      console.error('Error creating item:', error);
      // If API call fails, save offline
      const tempId = await saveOfflineMutation('create', entityType, data);
      await loadPendingItems(); // Reload pending items
      return { id: tempId, isOffline: true };
    }
  }, [entityType, loadPendingItems]);

  // Update an item (works offline)
  const updateItem = useCallback(async (item: T): Promise<{ isOffline: boolean }> => {
    try {
      // Check if we're online
      const networkState = await NetInfo.fetch();
      const online = networkState.isConnected && networkState.isInternetReachable !== false;
      
      if (online) {
        // If online, update directly
        // In a real app, you'd use your API client (like supabase) here
        // const { error } = await supabase.from(entityType).update(item).eq('id', item.id);
        // if (error) throw error;
        // return { isOffline: false };
        
        // For demo purposes, simulate success
        return { isOffline: false };
      } else {
        // If offline, save to be synced later
        await saveOfflineMutation('update', entityType, item);
        await loadPendingItems(); // Reload pending items
        return { isOffline: true };
      }
    } catch (error) {
      console.error('Error updating item:', error);
      // If API call fails, save offline
      await saveOfflineMutation('update', entityType, item);
      await loadPendingItems(); // Reload pending items
      return { isOffline: true };
    }
  }, [entityType, loadPendingItems]);

  // Delete an item (works offline)
  const deleteItem = useCallback(async (id: string): Promise<{ isOffline: boolean }> => {
    try {
      // Check if we're online
      const networkState = await NetInfo.fetch();
      const online = networkState.isConnected && networkState.isInternetReachable !== false;
      
      if (online) {
        // If online, delete directly
        // In a real app, you'd use your API client (like supabase) here
        // const { error } = await supabase.from(entityType).delete().eq('id', id);
        // if (error) throw error;
        // return { isOffline: false };
        
        // For demo purposes, simulate success
        return { isOffline: false };
      } else {
        // If offline, save to be synced later
        await saveOfflineMutation('delete', entityType, { id });
        await loadPendingItems(); // Reload pending items
        return { isOffline: true };
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      // If API call fails, save offline
      await saveOfflineMutation('delete', entityType, { id });
      await loadPendingItems(); // Reload pending items
      return { isOffline: true };
    }
  }, [entityType, loadPendingItems]);

  // Manually trigger sync
  const syncItems = useCallback(async (): Promise<boolean> => {
    if (isSyncing) return false;
    
    setIsSyncing(true);
    try {
      const success = await syncOfflineMutations();
      if (success) {
        await loadPendingItems(); // Reload pending items after successful sync
      }
      return success;
    } catch (error) {
      console.error('Error syncing items:', error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, loadPendingItems]);

  // Check if an item is pending sync
  const isItemPending = useCallback((id: string): boolean => {
    return pendingItems.some(item => item.id === id);
  }, [pendingItems]);

  return {
    isOnline,
    isSyncing,
    pendingItems,
    createItem,
    updateItem,
    deleteItem,
    syncItems,
    isItemPending,
  };
} ```

### useSkeleton.ts
**Path:** ./hooks/useSkeleton.ts
**Description:** Custom React hooks

```typescript
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { durations, easings } from '@/constants/motion';

export interface SkeletonOptions {
  /**
   * Width of the gradient shimmer (as % of the component width)
   * @default 0.7
   */
  shimmerWidth?: number;
  /**
   * Base color of the skeleton component
   * @default '#E1E9EE'
   */
  baseColor?: string;
  /**
   * Highlight color for the shimmer effect
   * @default '#F2F8FC'
   */
  highlightColor?: string;
  /**
   * Duration for a complete shimmer cycle in ms
   * @default 2000
   */
  duration?: number;
  /**
   * Delay before starting animation in ms
   * @default 0
   */
  delay?: number;
  /**
   * Whether animation should start automatically
   * @default true
   */
  autoStart?: boolean;
  /**
   * Loading state to determine if skeletons should be shown
   * @default false
   */
  isLoading?: boolean;
  /**
   * Number of skeleton items to generate
   * @default 1
   */
  count?: number;
  /**
   * Type of skeleton to generate
   * @default 'card'
   */
  type?: 'card' | 'row' | 'circle';
}

/**
 * Hook to create skeleton loading animations with shimmer effect
 */
export function useSkeleton(options: SkeletonOptions = {}) {
  const {
    shimmerWidth = 0.7,
    baseColor = '#E1E9EE',
    highlightColor = '#F2F8FC',
    duration = durations.long * 2,
    delay = 0,
    autoStart = true,
  } = options;
  
  // Animation value to track shimmer position
  const translateX = useSharedValue(-1);
  
  // Start the animation
  useEffect(() => {
    if (autoStart) {
      translateX.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(-1, { duration: 0 }),
            withTiming(1, { 
              duration, 
              easing: easings.linear 
            }),
          ),
          -1, // Infinite repeat
        ),
      );
    }
  }, [translateX, duration, delay, autoStart]);
  
  // Generate the animated styles for the shimmer effect
  const shimmerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value * (1 + shimmerWidth) }],
    };
  });
  
  // Create styles for both container and shimmer
  const styles = StyleSheet.create({
    container: {
      backgroundColor: baseColor,
      overflow: 'hidden',
    },
    shimmer: {
      width: `${shimmerWidth * 100}%`,
      height: '100%',
      backgroundColor: highlightColor,
      position: 'absolute',
      top: 0,
      bottom: 0,
      opacity: 0.7,
    },
  });
  
  // Utility function to manually start the animation
  const startAnimation = () => {
    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-1, { duration: 0 }),
          withTiming(1, { 
            duration, 
            easing: easings.linear 
          }),
        ),
        -1, // Infinite repeat
      ),
    );
  };
  
  // Utility function to stop the animation
  const stopAnimation = () => {
    translateX.value = withTiming(-1, { duration: 200 });
  };
  
  // Generate array of skeletons based on count and type
  const generateSkeletons = () => {
    if (!options.isLoading) return [];
    
    const count = options.count || 1;
    const type = options.type || 'card';
    
    return Array.from({ length: count }).map((_, index) => ({
      key: `skeleton-${index}`,
      type,
    }));
  };
  
  return {
    baseColor,
    shimmerStyle,
    styles,
    startAnimation,
    stopAnimation,
    skeletons: generateSkeletons(),
  };
} ```

### useThemeColor.ts
**Path:** ./hooks/useThemeColor.ts
**Description:** Custom React hooks

```typescript
/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
```


## Utilities
Helper utilities and functions

### api-types.ts
**Path:** ./utils/api-types.ts
**Description:** Utility functions and helpers

```typescript
/**
 * This file was auto-generated by the generate-trpc-types script.
 * Do not edit manually! Instead, run the script again.
 */

import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '../server/src/router';

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;
```

### auth.ts
**Path:** ./utils/auth.ts
**Description:** Utility functions and helpers

```typescript
import { supabase } from './supabase';
import { router } from 'expo-router';

/**
 * Logs the user out and redirects to the login screen
 */
export async function logout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Navigate to login screen
    router.replace('/auth/login');
  } catch (error) {
    console.error('Error signing out:', error);
    // Force navigation even if there was an error
    router.replace('/auth/login');
  }
}

/**
 * Gets the current user's profile data
 */
export async function getUserProfile() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    // If we have a user, get their profile from the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) {
      // If profile doesn't exist yet, return basic user info
      return {
        id: user.id,
        email: user.email,
        username: user.user_metadata?.username || 'User',
        created_at: user.created_at,
      };
    }
    
    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
} ```

### colors.ts
**Path:** ./utils/colors.ts
**Description:** Utility functions and helpers

```typescript
import { useTheme } from 'tamagui';

/**
 * Semantic color tokens that map to theme variables
 */
export const semanticTokens = {
  // Background colors
  background: {
    /** Main app background */
    app: '$background',
    /** Card/surface background */
    card: '$backgroundHover',
    /** Secondary surface background */
    secondary: '$backgroundPress',
    /** Tertiary surface background */
    tertiary: '$backgroundStrong',
    /** Input background */
    input: '$backgroundTransparent',
  },
  
  // Foreground/content colors
  content: {
    /** Primary text */
    primary: '$color',
    /** Secondary/dimmed text */
    secondary: '$colorTransparent',
    /** Subtle text - least emphasis */
    subtle: '$colorTransparent2',
    /** Disabled text */
    disabled: '$colorTransparent3',
  },
  
  // Border colors
  border: {
    /** Default border */
    default: '$borderColor',
    /** Focused border */
    focus: '$borderColorFocus',
    /** Border for hover state */
    hover: '$borderColorHover',
  },
  
  // Status colors
  status: {
    /** Success indicators */
    success: '$green10',
    /** Error indicators */
    error: '$red10',
    /** Warning indicators */
    warning: '$yellow10',
    /** Information indicators */
    info: '$blue10',
  },
  
  // Brand colors (adjust to match your brand)
  brand: {
    /** Primary brand color */
    primary: '$blue10',
    /** Secondary brand color */
    secondary: '$purple10',
    /** Accent brand color */
    accent: '$green10',
  }
};

/**
 * Hook that provides access to theme-aware colors from the semantic tokens
 * @returns An object with semantic color tokens mapped to actual theme colors
 */
export function useColors() {
  const theme = useTheme();
  
  return {
    background: {
      app: theme?.background?.get() || '#FFFFFF',
      card: theme?.backgroundHover?.get() || '#F3F4F6',
      secondary: theme?.backgroundPress?.get() || '#E5E7EB',
      tertiary: theme?.backgroundStrong?.get() || '#D1D5DB',
      input: theme?.backgroundTransparent?.get() || '#FFFFFF',
    },
    content: {
      primary: theme?.color?.get() || '#111827',
      secondary: theme?.colorTransparent?.get() || '#4B5563',
      subtle: theme?.colorTransparent2?.get() || theme?.colorTransparent?.get() || '#6B7280',
      disabled: theme?.colorTransparent3?.get() || theme?.colorTransparent?.get() || '#9CA3AF',
    },
    border: {
      default: theme?.borderColor?.get() || '#E5E7EB',
      focus: theme?.borderColorFocus?.get() || '#93C5FD',
      hover: theme?.borderColorHover?.get() || '#BFDBFE',
    },
    status: {
      success: theme?.green10?.get() || '#10B981',
      error: theme?.red10?.get() || '#EF4444',
      warning: theme?.yellow10?.get() || '#F59E0B',
      info: theme?.blue10?.get() || '#3B82F6',
    },
    brand: {
      primary: theme?.blue10?.get() || '#3B82F6',
      secondary: theme?.purple10?.get() || '#8B5CF6',
      accent: theme?.green10?.get() || '#10B981',
    }
  };
}

/**
 * Helper function to handle opacity for colors
 * @param hex Hex color code
 * @param alpha Opacity (0-1)
 * @returns RGBA color string
 */
export function withOpacity(hex: string, alpha: number): string {
  // Extract RGB components from hex
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Palette with static color values for when theme context is not available
 * These should be used sparingly, prefer the useColors hook when possible
 */
export const palette = {
  // Main UI colors
  black: '#000000',
  white: '#FFFFFF',
  
  // Grays
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // Blues
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  
  // Greens
  green: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  
  // Reds
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  
  // Yellows
  yellow: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  
  // Purples
  purple: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },
}; ```

### generated-hooks.ts
**Path:** ./utils/generated-hooks.ts
**Description:** Utility functions and helpers

```typescript
/**
 * GENERATED FILE - DO NOT EDIT
 * This file is automatically generated by the generate-trpc-client script.
 * To update this file, run: npm run generate-hooks
 */

import { trpc } from './trpc';
import { RouterInputs, RouterOutputs } from '../server/src/types/trpc-types';

/**
 * Type-safe hooks for TRPC procedures
 */

// user hooks
export const useUser = {
  // Add strongly typed hooks here
};

// dashboard hooks
export const useDashboard = {
  // Add strongly typed hooks here
};

// value hooks
export const useValue = {
  // Add strongly typed hooks here
};

// principle hooks
export const usePrinciple = {
  // Add strongly typed hooks here
};

// goal hooks
export const useGoal = {
  // Add strongly typed hooks here
};

// task hooks
export const useTask = {
  // Add strongly typed hooks here
};

// habit hooks
export const useHabit = {
  // Add strongly typed hooks here
};

// state hooks
export const useState = {
  // Add strongly typed hooks here
};

// rewards hooks
export const useRewards = {
  // Add strongly typed hooks here
};

// reminder hooks
export const useReminder = {
  // Add strongly typed hooks here
};

// goalProgressNote hooks
export const useGoalProgressNote = {
  // Add strongly typed hooks here
};


// Example type usage
type GreetingOutput = RouterOutputs['greeting']['hello'];
```

### haptics.ts
**Path:** ./utils/haptics.ts
**Description:** Utility functions and helpers

```typescript
import * as Haptics from 'expo-haptics';

/**
 * Haptic feedback utilities for iOS-style tactile feedback
 * Maps directly to iOS UIFeedbackGenerator patterns
 */
export const haptics = {
  /**
   * Light impact - subtle tap for small UI elements (buttons, toggles)
   */
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  
  /**
   * Medium impact - standard tap for medium elements (picker selections)
   */
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  
  /**
   * Heavy impact - stronger bump for significant actions
   */
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  
  /**
   * Selection feedback - subtle tap for navigating through options
   */
  selection: () => Haptics.selectionAsync(),
  
  /**
   * Success notification - double-tap vibration for completed actions
   */
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  
  /**
   * Warning notification - attention-grabbing pattern for warnings
   */
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  
  /**
   * Error notification - strong buzz pattern for errors
   */
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
}; ```

### mock-api.ts
**Path:** ./utils/mock-api.ts
**Description:** Utility functions and helpers

```typescript
import { initTRPC } from '@trpc/server';
import { z } from 'zod';

// Initialize tRPC for our mock API
const t = initTRPC.create();

// Export a procedure builder
const router = t.router;
const publicProcedure = t.procedure;

// Example router with some procedures
export const appRouter = router({
  greeting: {
    hello: publicProcedure
      .input(z.object({ name: z.string().optional() }))
      .query(({ input }) => {
        return {
          greeting: `Hello ${input.name ?? 'world'}`,
        };
      }),
    goodbye: publicProcedure
      .query(() => {
        return {
          greeting: 'Goodbye!',
        };
      }),
  },
  user: {
    get: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(({ input }) => {
        return {
          id: input.id,
          name: 'Mock User',
        };
      }),
    list: publicProcedure
      .query(() => {
        return [
          { id: '1', name: 'Mock User 1' },
          { id: '2', name: 'Mock User 2' },
        ];
      }),
  },
  auth: {
    refreshToken: publicProcedure
      .input(z.object({ refreshToken: z.string() }))
      .mutation(async ({ input }) => {
        console.log('Mock API: refreshToken called with', input.refreshToken);
        // Simulate checking refresh token and issuing new ones
        await new Promise(resolve => setTimeout(resolve, 300));
        if (input.refreshToken === 'valid-refresh-token') { // Example valid token
          return {
            accessToken: `mock-access-${Date.now()}`,
            refreshToken: `mock-refresh-${Date.now()}`,
          };
        } else {
          // Throw error for invalid refresh token
          throw new Error('Invalid refresh token'); 
        }
      }),
    // Add login/logout mutations here later
  },
  item: {
    add: publicProcedure
      .input(z.object({ name: z.string() }))
      .mutation(async ({ input }) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        // In a real backend, save to DB
        console.log('Mock API: Adding item', input);
        return {
          id: Math.random().toString(36).substring(7), // Generate random ID
          name: input.name,
          status: 'added'
        };
      }),
  },
});

// Export type router type
export type AppRouter = typeof appRouter; ```

### nats-client.ts
**Path:** ./utils/nats-client.ts
**Description:** Utility functions and helpers

```typescript
import { QueryClient } from '@tanstack/react-query';
import { connect, type ConnectionOptions, type NatsConnection, StringCodec } from 'nats.ws';

// Codec for encoding/decoding NATS messages
const sc = StringCodec();

// Type for cache update handlers
type CacheUpdateHandler = (data: any) => void;

// Global handlers for different subjects
const handlers: Record<string, CacheUpdateHandler[]> = {};

// Connection state
let natsConnection: NatsConnection | null = null;
let queryClient: QueryClient | null = null;
let isConnecting = false;

/**
 * Initialize the NATS client and connect to the server
 */
export async function initNatsClient(
  url: string, 
  qc: QueryClient,
  options: Partial<ConnectionOptions> = {}
): Promise<NatsConnection> {
  if (natsConnection) {
    return natsConnection;
  }
  
  if (isConnecting) {
    throw new Error('NATS connection is already in progress');
  }
  
  isConnecting = true;
  
  try {
    // Set the query client for cache updates
    queryClient = qc;
    
    // Connect to NATS server
    natsConnection = await connect({
      servers: url,
      // Add required polyfills for React Native
      // These would need to be properly implemented in a real app
      ...options,
    });
    
    console.log('Connected to NATS server');
    
    // Setup ping interval to keep connection alive
    const pingInterval = setInterval(() => {
      if (natsConnection && !natsConnection.isClosed) {
        // Note: Using a custom ping mechanism instead of the built-in one
        try {
          const start = Date.now();
          // Simple ping using a request to a dummy subject
          natsConnection.request('_PING_', undefined, { timeout: 1000 })
            .then(() => {
              const latency = Date.now() - start;
              console.log(`NATS server latency: ${latency}ms`);
            })
            .catch((err: Error) => {
              console.error('NATS ping error:', err.message);
            });
        } catch (err) {
          const error = err as Error;
          console.error('NATS ping error:', error.message);
        }
      } else {
        clearInterval(pingInterval);
      }
    }, 30000);
    
    // Handle connection close
    natsConnection.closed().then(() => {
      console.log('NATS connection closed');
      natsConnection = null;
      clearInterval(pingInterval);
      // Could implement reconnection logic here
    });
    
    return natsConnection;
  } catch (error) {
    console.error('Failed to connect to NATS server:', error);
    isConnecting = false;
    throw error;
  }
}

/**
 * Subscribe to a NATS subject and update the React Query cache
 */
export async function subscribeWithCache(
  subject: string,
  queryKey: unknown[],
  updateType: 'invalidate' | 'setData' = 'invalidate'
): Promise<() => void> {
  if (!natsConnection) {
    throw new Error('NATS client not initialized');
  }
  
  if (!queryClient) {
    throw new Error('QueryClient not set');
  }
  
  // Create subscription
  const subscription = natsConnection.subscribe(subject);
  
  // Setup message handler
  (async () => {
    for await (const msg of subscription) {
      try {
        const data = JSON.parse(sc.decode(msg.data));
        
        if (updateType === 'invalidate') {
          // Invalidate the cache for this query key
          queryClient.invalidateQueries({ queryKey });
        } else {
          // Update the cache directly
          queryClient.setQueryData(queryKey, data);
        }
        
        // Call any custom handlers
        if (handlers[subject]) {
          handlers[subject].forEach(handler => handler(data));
        }
      } catch (error) {
        const err = error as Error;
        console.error(`Error handling message for ${subject}:`, err.message);
      }
    }
  })();
  
  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Add a custom handler for a subject
 */
export function addSubjectHandler(subject: string, handler: CacheUpdateHandler): () => void {
  if (!handlers[subject]) {
    handlers[subject] = [];
  }
  
  handlers[subject].push(handler);
  
  // Return a function to remove the handler
  return () => {
    if (handlers[subject]) {
      handlers[subject] = handlers[subject].filter(h => h !== handler);
    }
  };
}

/**
 * Get the NATS connection
 */
export function getNatsConnection(): NatsConnection | null {
  return natsConnection;
}

/**
 * Close the NATS connection
 */
export async function closeNatsConnection(): Promise<void> {
  if (natsConnection) {
    await natsConnection.close();
    natsConnection = null;
  }
} ```

### offline-mutations.ts
**Path:** ./utils/offline-mutations.ts
**Description:** Utility functions and helpers

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  QueryClient,
  Mutation,
  MutationCache,
  onlineManager,
} from '@tanstack/react-query';
import {
  persistQueryClient,
  PersistQueryClientOptions,
} from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { useNetInfo, type NetInfoSubscription } from '@react-native-community/netinfo';
import { useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';

// Create a persister for React Query (AsyncStorage-based)
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

/**
 * React Query persistence options for offline support
 */
export const reactQueryPersistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
  persister: asyncStoragePersister,
  // Add custom serialization/deserialization if needed
  // We want to persist mutations especially for offline support
  buster: 'v1',
  dehydrateOptions: {
    shouldDehydrateMutation: () => true,
  },
};

/**
 * Hook to resume paused mutations when the device comes back online
 */
export function useResumeNetworkMutations(queryClient: QueryClient) {
  const netInfo = useNetInfo();
  const previousNetworkState = useRef(netInfo.isConnected);
  
  // Update React Query's online status manager
  useEffect(() => {
    onlineManager.setOnline(netInfo.isConnected === true);
  }, [netInfo.isConnected]);
  
  useEffect(() => {
    const isConnectedNow = netInfo.isConnected === true;
    const wasConnected = previousNetworkState.current === true;
    
    // If we just reconnected to the network
    if (isConnectedNow && !wasConnected) {
      console.log('Internet connection restored, resuming paused mutations');
      
      // Resume any paused mutations
      queryClient.resumePausedMutations().then(() => {
        // After resuming mutations, invalidate queries to refresh data
        queryClient.invalidateQueries();
      }).catch((error: Error) => {
        console.error('Error resuming mutations:', error.message);
      });
    }
    
    // Update our ref
    previousNetworkState.current = isConnectedNow;
  }, [netInfo.isConnected, queryClient]);
}

/**
 * Add a visual flag to offline-created items for UI feedback
 */
export function markItemAsOffline<T>(item: T): T & { isOffline: boolean } {
  return {
    ...item,
    isOffline: true,
  };
}

/**
 * Remove the offline flag from an item once it's synced
 */
export function markItemAsSynced<T extends { isOffline?: boolean }>(item: T): T {
  const result = { ...item };
  delete result.isOffline;
  return result;
}

/**
 * Get all pending mutations from the mutation cache
 */
export function getPendingMutations(mutationCache: MutationCache): Mutation[] {
  return mutationCache.getAll().filter((mutation: any) => 
    mutation?.state?.status === 'loading' || 
    (mutation?.state?.status === 'error' && mutation?.state?.isPaused)
  );
}

/**
 * Configure the query client for offline support and network state management
 */
export function configureQueryClientForOffline(queryClient: QueryClient): NetInfoSubscription {
  // Listen to network status changes and update onlineManager
  const unsubscribe = NetInfo.addEventListener(state => {
    onlineManager.setOnline(state.isConnected === true);
  });
  
  // When a mutation fails due to network error, pause it instead of failing
  queryClient.getMutationCache().config.onError = (error: unknown, _variables: unknown, _context: unknown, mutation: any) => {
    // Check if the error is a network error
    if (
      error instanceof Error && 
      (
        error.message.includes('network') || 
        error.message.includes('Network Error') ||
        error.message.includes('Failed to fetch')
      )
    ) {
      console.log('Network error detected, pausing mutation for later retry');
      
      // Pause the mutation instead of failing permanently
      mutation.state.isPaused = true;
    }
  };
  
  // Set up persistence
  persistQueryClient({
    queryClient,
    ...reactQueryPersistOptions,
  });

  // Return unsubscribe function for cleanup
  return unsubscribe;
} ```

### offline-sync.ts
**Path:** ./utils/offline-sync.ts
**Description:** Utility functions and helpers

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { queryClient } from './query-client';
import { supabase } from './supabase';

// Keys for offline data
const OFFLINE_MUTATIONS_KEY = 'aether-offline-mutations';
const PENDING_ITEMS_KEY = 'aether-pending-items';

// Types
export interface PendingItem {
  id: string;
  type: string;
  data: any;
  createdAt: number;
  isNotSynced: boolean;
}

interface OfflineMutation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: any;
  timestamp: number;
}

/**
 * Save a mutation to be processed when back online
 */
export async function saveOfflineMutation(
  type: 'create' | 'update' | 'delete',
  entity: string,
  data: any
): Promise<string> {
  try {
    // Generate a temporary ID for new items
    const id = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Create mutation object
    const mutation: OfflineMutation = {
      id,
      type,
      entity,
      data,
      timestamp: Date.now(),
    };
    
    // Get existing mutations
    const existingMutationsStr = await AsyncStorage.getItem(OFFLINE_MUTATIONS_KEY);
    const existingMutations: OfflineMutation[] = existingMutationsStr 
      ? JSON.parse(existingMutationsStr) 
      : [];
    
    // Add new mutation
    existingMutations.push(mutation);
    
    // Save mutations back to storage
    await AsyncStorage.setItem(OFFLINE_MUTATIONS_KEY, JSON.stringify(existingMutations));
    
    // Also add to pending items for UI
    if (type === 'create' || type === 'update') {
      await addToPendingItems(id, entity, data);
    }
    
    return id;
  } catch (error) {
    console.error('Error saving offline mutation:', error);
    throw error;
  }
}

/**
 * Add an item to the pending items list for UI display
 */
async function addToPendingItems(id: string, type: string, data: any): Promise<void> {
  try {
    const existingItemsStr = await AsyncStorage.getItem(PENDING_ITEMS_KEY);
    const existingItems: PendingItem[] = existingItemsStr 
      ? JSON.parse(existingItemsStr)
      : [];
    
    // Create a pending item
    const pendingItem: PendingItem = {
      id,
      type,
      data,
      createdAt: Date.now(),
      isNotSynced: true,
    };
    
    // Add to list
    existingItems.push(pendingItem);
    
    // Save back to storage
    await AsyncStorage.setItem(PENDING_ITEMS_KEY, JSON.stringify(existingItems));
  } catch (error) {
    console.error('Error adding to pending items:', error);
  }
}

/**
 * Get all pending items for a specific type
 */
export async function getPendingItems(type: string): Promise<PendingItem[]> {
  try {
    const itemsStr = await AsyncStorage.getItem(PENDING_ITEMS_KEY);
    if (!itemsStr) return [];
    
    const items: PendingItem[] = JSON.parse(itemsStr);
    return items.filter(item => item.type === type);
  } catch (error) {
    console.error('Error getting pending items:', error);
    return [];
  }
}

/**
 * Synchronize offline mutations with the server
 */
export async function syncOfflineMutations(): Promise<boolean> {
  try {
    // Check if we're online
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected || netInfo.isInternetReachable === false) {
      console.log('Not connected to the internet, skipping sync');
      return false;
    }
    
    // Get all pending mutations
    const mutationsStr = await AsyncStorage.getItem(OFFLINE_MUTATIONS_KEY);
    if (!mutationsStr) return true; // Nothing to sync
    
    const mutations: OfflineMutation[] = JSON.parse(mutationsStr);
    if (!mutations.length) return true; // Nothing to sync
    
    console.log(`Syncing ${mutations.length} offline mutations...`);
    
    // Process each mutation in order
    const results = await Promise.allSettled(
      mutations.map(async (mutation) => {
        try {
          switch (mutation.type) {
            case 'create':
              return await processMutation('create', mutation);
            case 'update':
              return await processMutation('update', mutation);
            case 'delete':
              return await processMutation('delete', mutation);
            default:
              console.error('Unknown mutation type:', mutation.type);
              return false;
          }
        } catch (error) {
          console.error('Error processing mutation:', error);
          return false;
        }
      })
    );
    
    // Check results
    const allSucceeded = results.every(
      result => result.status === 'fulfilled' && result.value === true
    );
    
    if (allSucceeded) {
      // Clear pending mutations if all succeeded
      await AsyncStorage.removeItem(OFFLINE_MUTATIONS_KEY);
      await AsyncStorage.removeItem(PENDING_ITEMS_KEY);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries();
      
      return true;
    } else {
      // Some mutations failed, remove the successful ones
      const successfulMutationIndexes = results.map((result, index) => 
        result.status === 'fulfilled' && result.value === true ? index : -1
      ).filter(index => index !== -1);
      
      const remainingMutations = mutations.filter(
        (_, index) => !successfulMutationIndexes.includes(index)
      );
      
      // Save remaining mutations
      await AsyncStorage.setItem(
        OFFLINE_MUTATIONS_KEY, 
        JSON.stringify(remainingMutations)
      );
      
      // Refresh query data
      queryClient.invalidateQueries();
      
      return false;
    }
  } catch (error) {
    console.error('Error syncing offline mutations:', error);
    return false;
  }
}

/**
 * Process a single mutation against the server
 */
async function processMutation(
  type: 'create' | 'update' | 'delete',
  mutation: OfflineMutation
): Promise<boolean> {
  try {
    // Get the entity table name
    const table = mutation.entity;
    
    switch (type) {
      case 'create': {
        // For create, we remove any temp id and insert the record
        const { id, ...data } = mutation.data;
        const { data: responseData, error } = await supabase
          .from(table)
          .insert(data)
          .select();
          
        if (error) throw error;
        return true;
      }
      
      case 'update': {
        // For update, we update the record by ID
        const { id, ...data } = mutation.data;
        const { error } = await supabase
          .from(table)
          .update(data)
          .eq('id', id);
          
        if (error) throw error;
        return true;
      }
      
      case 'delete': {
        // For delete, we delete the record by ID
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('id', mutation.data.id);
          
        if (error) throw error;
        return true;
      }
      
      default:
        return false;
    }
  } catch (error) {
    console.error('Error processing mutation:', error);
    return false;
  }
}

/**
 * Hook up background sync when app comes online
 */
export function setupBackgroundSync(): () => void {
  // Subscribe to network changes
  const unsubscribe = NetInfo.addEventListener(state => {
    // When we go from offline to online, sync mutations
    if (state.isConnected && state.isInternetReachable !== false) {
      syncOfflineMutations()
        .then(success => {
          console.log('Background sync completed:', success ? 'success' : 'with errors');
        })
        .catch(error => {
          console.error('Background sync failed:', error);
        });
    }
  });
  
  return unsubscribe;
} ```

### query-client.ts
**Path:** ./utils/query-client.ts
**Description:** Utility functions and helpers

```typescript
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
} ```

### settings.ts
**Path:** ./utils/settings.ts
**Description:** Utility functions and helpers

```typescript
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Settings keys
export const APP_SETTINGS_KEY = 'aether_app_settings';

// Default settings
const DEFAULT_SETTINGS = {
  enableNotifications: true,
  enableDarkMode: null, // null means "use system setting"
  enableOfflineMode: true,
  syncOnCellular: true,
  lastSyncTimestamp: null,
};

// Type for app settings
export type AppSettings = typeof DEFAULT_SETTINGS;

/**
 * Get app settings from secure storage
 */
export async function getSettings(): Promise<AppSettings> {
  try {
    const storedSettings = await SecureStore.getItemAsync(APP_SETTINGS_KEY);
    if (!storedSettings) return DEFAULT_SETTINGS;
    
    return { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) };
  } catch (error) {
    console.error('Error getting settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save app settings to secure storage
 */
export async function saveSettings(settings: Partial<AppSettings>): Promise<void> {
  try {
    const currentSettings = await getSettings();
    const newSettings = { ...currentSettings, ...settings };
    
    await SecureStore.setItemAsync(
      APP_SETTINGS_KEY, 
      JSON.stringify(newSettings)
    );
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

/**
 * Update a single setting
 */
export async function updateSetting<K extends keyof AppSettings>(
  key: K, 
  value: AppSettings[K]
): Promise<void> {
  await saveSettings({ [key]: value } as Partial<AppSettings>);
}

/**
 * Get app version
 */
export function getAppVersion(): string {
  // In a real app, you would use expo-constants to get the app version
  // import Constants from 'expo-constants';
  // return Constants.expoConfig.version;
  return '1.0.0';
}

/**
 * Get platform information
 */
export function getPlatformInfo(): string {
  return `${Platform.OS} ${Platform.Version}`;
} ```

### supabase.ts
**Path:** ./utils/supabase.ts
**Description:** Utility functions and helpers

```typescript
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// SecureStore adapter for Supabase auth persistence
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

// Get Supabase URL and anon key from environment variables
// In production, these should be set in app.config.js or via EAS secrets
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase URL or anon key not found. Make sure to set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY environment variables.'
  );
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  const { data, error } = await supabase.auth.getSession();
  return !!data.session;
};

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error.message);
    return null;
  }
  return data.user;
}; ```

### trpc.ts
**Path:** ./utils/trpc.ts
**Description:** Utility functions and helpers

```typescript
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
export type RouterOutputs = TypedRouterOutputs; ```


## State Stores
Global state management

### uiStore.ts
**Path:** ./stores/uiStore.ts
**Description:** State stores (Zustand/Redux)

```typescript
import { create } from 'zustand';

interface UiState {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// Simple Zustand store for UI state (e.g., theme)
export const useUiStore = create<UiState>((set) => ({
  isDarkMode: false, // Default to light mode
  toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
})); ```


# 9️⃣ Zelda Styling Guide
Zelda: Breath of the Wild / Sheikah Slate aesthetic guidelines.

### Zelda Theme Styling Guide
**Source:** aether_styling_context.txt

```
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


```


# 📊 Testing
Testing configuration and test files.


## Jest Configuration
Jest testing setup

### jest.config.ui.js
**Path:** jest.config.ui.js
**Description:** UI component testing config

```javascript
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|tamagui|@tamagui/.*|solito|moti|@motify/.*)'
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect', './jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  moduleDirectories: ['node_modules', '<rootDir>'], 
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/babel.config.js',
    '!**/jest.setup.js',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/test-utils\\.tsx$',
    '/__tests__/server/test-helpers\\.ts$'
  ],
};
```

### jest.config.server.js
**Path:** jest.config.server.js
**Description:** Server testing config

```javascript
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  displayName: 'Server',
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/__tests__/server/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // Do NOT include setupFilesAfterEnv that point to UI-specific setup (like jest.setup.js)
  // Add any server-specific setup files here if needed in the future
  // setupFilesAfterEnv: ['./jest.server.setup.js'],
  clearMocks: true, // Good practice to clear mocks between tests
};
```

### jest.setup.js
**Path:** jest.setup.js
**Description:** Jest setup file

```javascript
import '@testing-library/jest-native/extend-expect';
import { StyleSheet } from 'react-native';

// Mock tRPC procedures *before* routers are imported by tests
jest.mock('./server/src/router', () => {
  // console.log('MOCKING ./server/src/router'); // Debugging line
  const actualTrpc = jest.requireActual('./server/src/router');

  // Simple mock procedure chain structure
  const mockProcedure = {
    input: jest.fn().mockReturnThis(),
    output: jest.fn().mockReturnThis(),
    query: jest.fn((resolver) => resolver), // Pass resolver through
    mutation: jest.fn((resolver) => resolver), // Pass resolver through
    use: jest.fn().mockReturnThis(), // Mock middleware usage
  };

  return {
    ...actualTrpc, // Keep other exports (like appRouter if needed elsewhere, though unlikely in unit tests)
    router: jest.fn((definition) => definition), // Mock the router factory function
    publicProcedure: mockProcedure,
    protectedProcedure: mockProcedure,
  };
});

// No longer using global mockTamagui

// Mock the router from expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
  useLocalSearchParams: jest.fn().mockReturnValue({}),
}));

// Mock the Ionicons component
jest.mock('@expo/vector-icons', () => {
  const { View } = require('react-native');
  return {
    Ionicons: (props) => {
      return <View testID={`icon-${props.name}`} {...props} />;
    },
  };
});

// Mock the trpc hook
jest.mock('@/utils/trpc', () => ({
  trpc: {
    useQuery: jest.fn().mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    }),
    useMutation: jest.fn().mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
    }),
    useContext: jest.fn(),
  },
}));

// Silence React Native warnings during tests
global.console = {
  ...global.console,
  warn: jest.fn(),
  error: jest.fn(),
};
```

### jest.server.setup.js
**Path:** jest.server.setup.js
**Description:** Jest server setup file

```javascript
// Minimal Jest setup file for server-side tests
// No UI-related mocks needed for router tests

// Global mocks for server tests
global.mockSupabaseAdmin = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  neq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  is: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
  match: jest.fn().mockReturnThis(),
  rpc: jest.fn().mockReturnValue({ data: [], error: null }),
};

// Mock UUID for deterministic testing
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid-1234'),
}));

// Set test environment timezone
process.env.TZ = 'UTC';

console.log('Server test setup complete');
```


## Component Tests
UI component tests

### HabitCheckItem.test.tsx
**Path:** ./__tests__/components/dashboard/HabitCheckItem.test.tsx
**Description:** Component test files

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
**Path:** ./__tests__/components/lists/GoalList.test.tsx
**Description:** Component test files

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
**Path:** ./__tests__/components/lists/HabitList.test.tsx
**Description:** Component test files

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
**Path:** ./__tests__/components/lists/TaskList.test.tsx
**Description:** Component test files

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
**Path:** ./__tests__/components/ui/primitives/AetherCard.test.tsx
**Description:** Component test files

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
**Path:** ./__tests__/components/ui/primitives/AetherListItem.test.tsx
**Description:** Component test files

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


## Server Tests
Backend server tests

### dashboardRouter.getWeeklyProgress.test.ts
**Path:** ./__tests__/server/routers/dashboardRouter.getWeeklyProgress.test.ts
**Description:** Server test files

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
**Path:** ./__tests__/server/routers/dashboardRouter.test.ts
**Description:** Server test files

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
**Path:** ./__tests__/server/routers/habitRouter.test.ts
**Description:** Server test files

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
**Path:** ./__tests__/server/routers/taskRouter.toggleTask.test.ts
**Description:** Server test files

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


## Test Utilities
Testing utilities and helpers

### test-utils.tsx
**Path:** ./__tests__/test-utils.tsx
**Description:** Test utilities

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

### test-helpers.ts
**Path:** ./__tests__/server/test-helpers.ts
**Description:** Server test helpers

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


# 💾 Supabase Integration
Supabase database integration.


## Supabase Migrations
Database schema migrations

### 20250424033333_initial_schema.sql
**Path:** ./supabase/migrations/20250424033333_initial_schema.sql
**Description:** Supabase SQL migrations

```sql
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
create policy "Users can manage tracked_state_values for their own states/values" on public.tracked_state_values for all using (auth.uid() = user_id) with check (auth.uid() = user_id);```

### 20250424035232_add_missing_tables.sql
**Path:** ./supabase/migrations/20250424035232_add_missing_tables.sql
**Description:** Supabase SQL migrations

```sql
```

### 20250424035717_add_missing_tables.sql
**Path:** ./supabase/migrations/20250424035717_add_missing_tables.sql
**Description:** Supabase SQL migrations

```sql
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
```

### 20250425000000_create_user_settings_table.sql
**Path:** ./supabase/migrations/20250425000000_create_user_settings_table.sql
**Description:** Supabase SQL migrations

```sql
-- Add user_settings table and policies

-- Create user_settings table
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notification_preferences JSONB NOT NULL DEFAULT '{"email": true, "push": true, "task_reminders": true, "goal_updates": true, "habit_reminders": true}'::jsonb,
  ui_preferences JSONB NOT NULL DEFAULT '{"theme": "system", "compact_view": false, "show_completed_tasks": true}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add comment for the table
COMMENT ON TABLE public.user_settings IS 'Stores user preferences and settings';

-- Enable row level security
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own settings" 
  ON public.user_settings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" 
  ON public.user_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
  ON public.user_settings 
  FOR UPDATE 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings" 
  ON public.user_settings 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add function to create default settings on user creation
CREATE OR REPLACE FUNCTION public.create_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to create default settings when a new profile is created
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_user_settings(); ```

### 20250426000000_create_rewards_tables.sql
**Path:** ./supabase/migrations/20250426000000_create_rewards_tables.sql
**Description:** Supabase SQL migrations

```sql
-- Create rewards tables and related schemas

-- Rewards table for different types of rewards (badges, achievements, etc.)
CREATE TABLE public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('badge', 'achievement', 'item', 'discount')),
  required_points INTEGER NOT NULL DEFAULT 0,
  can_earn_multiple BOOLEAN NOT NULL DEFAULT FALSE,
  image_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.rewards IS 'Available rewards that users can earn';

-- Junction table for user-earned rewards
CREATE TABLE public.user_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
  reward_type TEXT, -- Denormalized for easier querying
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  points_spent INTEGER NOT NULL DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, reward_id) -- Only when can_earn_multiple is false
);

COMMENT ON TABLE public.user_rewards IS 'Rewards earned by users';

-- Point transactions table to track point history
CREATE TABLE public.point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.point_transactions IS 'History of point transactions';

-- Add points columns to profiles if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS lifetime_points INTEGER NOT NULL DEFAULT 0;

-- Enable RLS
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Rewards policies (public read, admin write)
CREATE POLICY "Anyone can view rewards" 
  ON public.rewards 
  FOR SELECT 
  USING (true);

-- User rewards policies (user can see their own)
CREATE POLICY "Users can view their rewards" 
  ON public.user_rewards 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their rewards" 
  ON public.user_rewards 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Point transactions policies (user can see their own)
CREATE POLICY "Users can view their point transactions" 
  ON public.point_transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Insert some sample rewards
INSERT INTO public.rewards (name, description, type, required_points, can_earn_multiple, image_url)
VALUES
  ('Early Bird', 'Complete 5 tasks before 9 AM', 'badge', 0, false, 'https://api.dicebear.com/7.x/icons/svg?icon=coffee'),
  ('Task Master', 'Complete 100 tasks', 'achievement', 0, false, 'https://api.dicebear.com/7.x/icons/svg?icon=checkSquare'),
  ('Habit Hero', 'Maintain a streak for 30 days', 'achievement', 0, false, 'https://api.dicebear.com/7.x/icons/svg?icon=award'),
  ('Goal Getter', 'Complete 10 goals', 'achievement', 0, false, 'https://api.dicebear.com/7.x/icons/svg?icon=target'),
  ('Theme Customization', 'Unlock custom themes', 'item', 500, false, 'https://api.dicebear.com/7.x/icons/svg?icon=palette'),
  ('Icon Pack', 'Unlock premium icons', 'item', 300, false, 'https://api.dicebear.com/7.x/icons/svg?icon=image'),
  ('Weekly Booster', 'Double points for one week', 'item', 200, true, 'https://api.dicebear.com/7.x/icons/svg?icon=zap'),
  ('Perfectionist', 'Complete all tasks for a week', 'badge', 0, true, 'https://api.dicebear.com/7.x/icons/svg?icon=clipboard');

-- Create function to award points on habit completion
CREATE OR REPLACE FUNCTION public.award_points_for_habit_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed = true THEN
    -- Insert a point transaction
    INSERT INTO public.point_transactions (user_id, points, reason, source_type, source_id)
    VALUES (NEW.user_id, 10, 'Completed habit', 'habit', NEW.habit_id);
    
    -- Update user points
    UPDATE public.profiles
    SET 
      points = points + 10,
      lifetime_points = lifetime_points + 10
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for habit entries to award points
CREATE TRIGGER on_habit_entry_completed
  AFTER INSERT OR UPDATE ON public.habit_entries
  FOR EACH ROW
  WHEN (NEW.completed = true)
  EXECUTE FUNCTION public.award_points_for_habit_completion();

-- Create function to award points on task completion
CREATE OR REPLACE FUNCTION public.award_points_for_task_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Insert a point transaction
    INSERT INTO public.point_transactions (user_id, points, reason, source_type, source_id)
    VALUES (NEW.user_id, 5, 'Completed task', 'task', NEW.id);
    
    -- Update user points
    UPDATE public.profiles
    SET 
      points = points + 5,
      lifetime_points = lifetime_points + 5
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for tasks to award points
CREATE TRIGGER on_task_completed
  AFTER INSERT OR UPDATE ON public.tasks
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION public.award_points_for_task_completion(); ```

### 20250428124230_standardize_field_naming.sql
**Path:** ./supabase/migrations/20250428124230_standardize_field_naming.sql
**Description:** Supabase SQL migrations

```sql
-- Migration: Standardize field naming (name → title)
-- Description: Ensure consistency across the database by standardizing on 'title' instead of 'name'

-- This migration doesn't need to modify tables that already use 'title' consistently
-- Based on database inspection, most tables already use 'title' correctly

-- Values table: Rename 'name' to 'title'
ALTER TABLE "public"."values" RENAME COLUMN "name" TO "title";

-- Update triggers and functions if they reference these columns
-- For any downstream foreign key constraints, they should continue to work since we're just renaming columns

-- Update any indexes that might reference the old column names
DROP INDEX IF EXISTS "public"."values_name_idx";
CREATE INDEX IF NOT EXISTS "values_title_idx" ON "public"."values" ("title");

-- Update any views that might reference the old column names
-- (Add appropriate view updates if needed)

-- Note: This migration assumes 'values' is the primary table needing column renaming
-- based on code inspection. If other tables need similar treatment, add them here.
```

### 20250428130834_enhance_functional_schema.sql
**Path:** ./supabase/migrations/20250428130834_enhance_functional_schema.sql
**Description:** Supabase SQL migrations

```sql
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
```


## Supabase Configuration
Supabase connection setup

### config.toml
**Path:** supabase/config.toml
**Description:** Supabase configuration

```toml
# For detailed configuration reference documentation, visit:
# https://supabase.com/docs/guides/local-development/cli/config
# A string used to distinguish different Supabase projects on the same host. Defaults to the
# working directory name when running `supabase init`.
project_id = "AetherIphone"

[api]
enabled = true
# Port to use for the API URL.
port = 54321
# Schemas to expose in your API. Tables, views and stored procedures in this schema will get API
# endpoints. `public` and `graphql_public` schemas are included by default.
schemas = ["public", "graphql_public"]
# Extra schemas to add to the search_path of every request.
extra_search_path = ["public", "extensions"]
# The maximum number of rows returns from a view, table, or stored procedure. Limits payload size
# for accidental or malicious requests.
max_rows = 1000

[api.tls]
# Enable HTTPS endpoints locally using a self-signed certificate.
enabled = false

[db]
# Port to use for the local database URL.
port = 54322
# Port used by db diff command to initialize the shadow database.
shadow_port = 54320
# The database major version to use. This has to be the same as your remote database's. Run `SHOW
# server_version;` on the remote database to check.
major_version = 15

[db.pooler]
enabled = false
# Port to use for the local connection pooler.
port = 54329
# Specifies when a server connection can be reused by other clients.
# Configure one of the supported pooler modes: `transaction`, `session`.
pool_mode = "transaction"
# How many server connections to allow per user/database pair.
default_pool_size = 20
# Maximum number of client connections allowed.
max_client_conn = 100

# [db.vault]
# secret_key = "env(SECRET_VALUE)"

[db.migrations]
# Specifies an ordered list of schema files that describe your database.
# Supports glob patterns relative to supabase directory: "./schemas/*.sql"
schema_paths = []

[db.seed]
# If enabled, seeds the database after migrations during a db reset.
enabled = true
# Specifies an ordered list of seed files to load during db reset.
# Supports glob patterns relative to supabase directory: "./seeds/*.sql"
sql_paths = ["./seed.sql"]

[realtime]
enabled = true
# Bind realtime via either IPv4 or IPv6. (default: IPv4)
# ip_version = "IPv6"
# The maximum length in bytes of HTTP request headers. (default: 4096)
# max_header_length = 4096

[studio]
enabled = true
# Port to use for Supabase Studio.
port = 54323
# External URL of the API server that frontend connects to.
api_url = "http://127.0.0.1"
# OpenAI API Key to use for Supabase AI in the Supabase Studio.
openai_api_key = "env(OPENAI_API_KEY)"

# Email testing server. Emails sent with the local dev setup are not actually sent - rather, they
# are monitored, and you can view the emails that would have been sent from the web interface.
[inbucket]
enabled = true
# Port to use for the email testing server web interface.
port = 54324
# Uncomment to expose additional ports for testing user applications that send emails.
# smtp_port = 54325
# pop3_port = 54326
# admin_email = "admin@email.com"
# sender_name = "Admin"

[storage]
enabled = true
# The maximum file size allowed (e.g. "5MB", "500KB").
file_size_limit = "50MiB"

# Image transformation API is available to Supabase Pro plan.
# [storage.image_transformation]
# enabled = true

# Uncomment to configure local storage buckets
# [storage.buckets.images]
# public = false
# file_size_limit = "50MiB"
# allowed_mime_types = ["image/png", "image/jpeg"]
# objects_path = "./images"

[auth]
enabled = true
# The base URL of your website. Used as an allow-list for redirects and for constructing URLs used
# in emails.
site_url = "http://127.0.0.1:3000"
# A list of *exact* URLs that auth providers are permitted to redirect to post authentication.
additional_redirect_urls = ["https://127.0.0.1:3000"]
# How long tokens are valid for, in seconds. Defaults to 3600 (1 hour), maximum 604,800 (1 week).
jwt_expiry = 3600
# If disabled, the refresh token will never expire.
enable_refresh_token_rotation = true
# Allows refresh tokens to be reused after expiry, up to the specified interval in seconds.
# Requires enable_refresh_token_rotation = true.
refresh_token_reuse_interval = 10
# Allow/disallow new user signups to your project.
enable_signup = true
# Allow/disallow anonymous sign-ins to your project.
enable_anonymous_sign_ins = false
# Allow/disallow testing manual linking of accounts
enable_manual_linking = false
# Passwords shorter than this value will be rejected as weak. Minimum 6, recommended 8 or more.
minimum_password_length = 6
# Passwords that do not meet the following requirements will be rejected as weak. Supported values
# are: `letters_digits`, `lower_upper_letters_digits`, `lower_upper_letters_digits_symbols`
password_requirements = ""

[auth.rate_limit]
# Number of emails that can be sent per hour. Requires auth.email.smtp to be enabled.
email_sent = 2
# Number of SMS messages that can be sent per hour. Requires auth.sms to be enabled.
sms_sent = 30
# Number of anonymous sign-ins that can be made per hour per IP address. Requires enable_anonymous_sign_ins = true.
anonymous_users = 30
# Number of sessions that can be refreshed in a 5 minute interval per IP address.
token_refresh = 150
# Number of sign up and sign-in requests that can be made in a 5 minute interval per IP address (excludes anonymous users).
sign_in_sign_ups = 30
# Number of OTP / Magic link verifications that can be made in a 5 minute interval per IP address.
token_verifications = 30

# Configure one of the supported captcha providers: `hcaptcha`, `turnstile`.
# [auth.captcha]
# enabled = true
# provider = "hcaptcha"
# secret = ""

[auth.email]
# Allow/disallow new user signups via email to your project.
enable_signup = true
# If enabled, a user will be required to confirm any email change on both the old, and new email
# addresses. If disabled, only the new email is required to confirm.
double_confirm_changes = true
# If enabled, users need to confirm their email address before signing in.
enable_confirmations = false
# If enabled, users will need to reauthenticate or have logged in recently to change their password.
secure_password_change = false
# Controls the minimum amount of time that must pass before sending another signup confirmation or password reset email.
max_frequency = "1s"
# Number of characters used in the email OTP.
otp_length = 6
# Number of seconds before the email OTP expires (defaults to 1 hour).
otp_expiry = 3600

# Use a production-ready SMTP server
# [auth.email.smtp]
# enabled = true
# host = "smtp.sendgrid.net"
# port = 587
# user = "apikey"
# pass = "env(SENDGRID_API_KEY)"
# admin_email = "admin@email.com"
# sender_name = "Admin"

# Uncomment to customize email template
# [auth.email.template.invite]
# subject = "You have been invited"
# content_path = "./supabase/templates/invite.html"

[auth.sms]
# Allow/disallow new user signups via SMS to your project.
enable_signup = false
# If enabled, users need to confirm their phone number before signing in.
enable_confirmations = false
# Template for sending OTP to users
template = "Your code is {{ .Code }}"
# Controls the minimum amount of time that must pass before sending another sms otp.
max_frequency = "5s"

# Use pre-defined map of phone number to OTP for testing.
# [auth.sms.test_otp]
# 4152127777 = "123456"

# Configure logged in session timeouts.
# [auth.sessions]
# Force log out after the specified duration.
# timebox = "24h"
# Force log out if the user has been inactive longer than the specified duration.
# inactivity_timeout = "8h"

# This hook runs before a token is issued and allows you to add additional claims based on the authentication method used.
# [auth.hook.custom_access_token]
# enabled = true
# uri = "pg-functions://<database>/<schema>/<hook_name>"

# Configure one of the supported SMS providers: `twilio`, `twilio_verify`, `messagebird`, `textlocal`, `vonage`.
[auth.sms.twilio]
enabled = false
account_sid = ""
message_service_sid = ""
# DO NOT commit your Twilio auth token to git. Use environment variable substitution instead:
auth_token = "env(SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN)"

# Multi-factor-authentication is available to Supabase Pro plan.
[auth.mfa]
# Control how many MFA factors can be enrolled at once per user.
max_enrolled_factors = 10

# Control MFA via App Authenticator (TOTP)
[auth.mfa.totp]
enroll_enabled = false
verify_enabled = false

# Configure MFA via Phone Messaging
[auth.mfa.phone]
enroll_enabled = false
verify_enabled = false
otp_length = 6
template = "Your code is {{ .Code }}"
max_frequency = "5s"

# Configure MFA via WebAuthn
# [auth.mfa.web_authn]
# enroll_enabled = true
# verify_enabled = true

# Use an external OAuth provider. The full list of providers are: `apple`, `azure`, `bitbucket`,
# `discord`, `facebook`, `github`, `gitlab`, `google`, `keycloak`, `linkedin_oidc`, `notion`, `twitch`,
# `twitter`, `slack`, `spotify`, `workos`, `zoom`.
[auth.external.apple]
enabled = false
client_id = ""
# DO NOT commit your OAuth provider secret to git. Use environment variable substitution instead:
secret = "env(SUPABASE_AUTH_EXTERNAL_APPLE_SECRET)"
# Overrides the default auth redirectUrl.
redirect_uri = ""
# Overrides the default auth provider URL. Used to support self-hosted gitlab, single-tenant Azure,
# or any other third-party OIDC providers.
url = ""
# If enabled, the nonce check will be skipped. Required for local sign in with Google auth.
skip_nonce_check = false

# Use Firebase Auth as a third-party provider alongside Supabase Auth.
[auth.third_party.firebase]
enabled = false
# project_id = "my-firebase-project"

# Use Auth0 as a third-party provider alongside Supabase Auth.
[auth.third_party.auth0]
enabled = false
# tenant = "my-auth0-tenant"
# tenant_region = "us"

# Use AWS Cognito (Amplify) as a third-party provider alongside Supabase Auth.
[auth.third_party.aws_cognito]
enabled = false
# user_pool_id = "my-user-pool-id"
# user_pool_region = "us-east-1"

# Use Clerk as a third-party provider alongside Supabase Auth.
[auth.third_party.clerk]
enabled = false
# Obtain from https://clerk.com/setup/supabase
# domain = "example.clerk.accounts.dev"

[edge_runtime]
enabled = true
# Configure one of the supported request policies: `oneshot`, `per_worker`.
# Use `oneshot` for hot reload, or `per_worker` for load testing.
policy = "oneshot"
# Port to attach the Chrome inspector for debugging edge functions.
inspector_port = 8083
# The Deno major version to use.
deno_version = 1

# [edge_runtime.secrets]
# secret_key = "env(SECRET_VALUE)"

[analytics]
enabled = true
port = 54327
# Configure one of the supported backends: `postgres`, `bigquery`.
backend = "postgres"

# Experimental features may be deprecated any time
[experimental]
# Configures Postgres storage engine to use OrioleDB (S3)
orioledb_version = ""
# Configures S3 bucket URL, eg. <bucket_name>.s3-<region>.amazonaws.com
s3_host = "env(S3_HOST)"
# Configures S3 bucket region, eg. us-east-1
s3_region = "env(S3_REGION)"
# Configures AWS_ACCESS_KEY_ID for S3 bucket
s3_access_key = "env(S3_ACCESS_KEY)"
# Configures AWS_SECRET_ACCESS_KEY for S3 bucket
s3_secret_key = "env(S3_SECRET_KEY)"
```

### SUPABASE_INTEGRATION.md
**Path:** SUPABASE_INTEGRATION.md
**Description:** Supabase integration documentation

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


## Database Types
Database type definitions

### database.types.ts
**Path:** types/database.types.ts
**Description:** Supabase database types

```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      badge_definitions: {
        Row: {
          description: string | null
          icon: string
          id: string
          title: string
        }
        Insert: {
          description?: string | null
          icon: string
          id: string
          title: string
        }
        Update: {
          description?: string | null
          icon?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      goal_progress_notes: {
        Row: {
          created_at: string
          goal_id: string
          id: string
          note: string
          user_id: string
        }
        Insert: {
          created_at?: string
          goal_id: string
          id?: string
          note: string
          user_id: string
        }
        Update: {
          created_at?: string
          goal_id?: string
          id?: string
          note?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_progress_notes_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_progress_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_values: {
        Row: {
          goal_id: string
          user_id: string
          value_id: string
        }
        Insert: {
          goal_id: string
          user_id: string
          value_id: string
        }
        Update: {
          goal_id?: string
          user_id?: string
          value_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_values_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_values_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_values_value_id_fkey"
            columns: ["value_id"]
            isOneToOne: false
            referencedRelation: "values"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          archived_at: string | null
          created_at: string | null
          description: string | null
          id: string
          progress: number | null
          sort_order: number | null
          target_date: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          progress?: number | null
          sort_order?: number | null
          target_date?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          progress?: number | null
          sort_order?: number | null
          target_date?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_entries: {
        Row: {
          completed: boolean
          created_at: string
          date: string
          habit_id: string
          id: string
          notes: string | null
          quantity_value: number | null
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          date: string
          habit_id: string
          id?: string
          notes?: string | null
          quantity_value?: number | null
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          date?: string
          habit_id?: string
          id?: string
          notes?: string | null
          quantity_value?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_entries_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_values: {
        Row: {
          habit_id: string
          user_id: string
          value_id: string
        }
        Insert: {
          habit_id: string
          user_id: string
          value_id: string
        }
        Update: {
          habit_id?: string
          user_id?: string
          value_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_values_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_values_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_values_value_id_fkey"
            columns: ["value_id"]
            isOneToOne: false
            referencedRelation: "values"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          archived_at: string | null
          best_streak: number
          created_at: string
          cue: string | null
          frequency_period: Database["public"]["Enums"]["habit_frequency_period"]
          goal_frequency: number
          goal_quantity: number | null
          goal_unit: string | null
          habit_type: Database["public"]["Enums"]["habit_type"]
          id: string
          recurrence_end_date: string | null
          recurrence_rule: string | null
          reward: string | null
          routine: string | null
          streak: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          best_streak?: number
          created_at?: string
          cue?: string | null
          frequency_period?: Database["public"]["Enums"]["habit_frequency_period"]
          goal_frequency?: number
          goal_quantity?: number | null
          goal_unit?: string | null
          habit_type?: Database["public"]["Enums"]["habit_type"]
          id?: string
          recurrence_end_date?: string | null
          recurrence_rule?: string | null
          reward?: string | null
          routine?: string | null
          streak?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          best_streak?: number
          created_at?: string
          cue?: string | null
          frequency_period?: Database["public"]["Enums"]["habit_frequency_period"]
          goal_frequency?: number
          goal_quantity?: number | null
          goal_unit?: string | null
          habit_type?: Database["public"]["Enums"]["habit_type"]
          id?: string
          recurrence_end_date?: string | null
          recurrence_rule?: string | null
          reward?: string | null
          routine?: string | null
          streak?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      key_results: {
        Row: {
          created_at: string
          goal_id: string
          id: string
          progress: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          goal_id: string
          id?: string
          progress?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          goal_id?: string
          id?: string
          progress?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "key_results_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "key_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      point_transactions: {
        Row: {
          created_at: string
          id: string
          points: number
          reason: string
          source_id: string | null
          source_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points: number
          reason: string
          source_id?: string | null
          source_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points?: number
          reason?: string
          source_id?: string | null
          source_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "point_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      principle_values: {
        Row: {
          principle_id: string
          user_id: string
          value_id: string
        }
        Insert: {
          principle_id: string
          user_id: string
          value_id: string
        }
        Update: {
          principle_id?: string
          user_id?: string
          value_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "principle_values_principle_id_fkey"
            columns: ["principle_id"]
            isOneToOne: false
            referencedRelation: "principles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "principle_values_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "principle_values_value_id_fkey"
            columns: ["value_id"]
            isOneToOne: false
            referencedRelation: "values"
            referencedColumns: ["id"]
          },
        ]
      }
      principles: {
        Row: {
          body: string
          created_at: string
          id: string
          sort_order: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          sort_order?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          sort_order?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "principles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          lifetime_points: number
          points: number
          username: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          lifetime_points?: number
          points?: number
          username?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          lifetime_points?: number
          points?: number
          username?: string | null
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          related_entity_id: string
          related_entity_type: string
          reminder_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          related_entity_id: string
          related_entity_type: string
          reminder_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          related_entity_id?: string
          related_entity_type?: string
          reminder_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          can_earn_multiple: boolean
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          metadata: Json | null
          name: string
          required_points: number
          type: Database["public"]["Enums"]["reward_type"]
          updated_at: string
        }
        Insert: {
          can_earn_multiple?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          name: string
          required_points?: number
          type: Database["public"]["Enums"]["reward_type"]
          updated_at?: string
        }
        Update: {
          can_earn_multiple?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          name?: string
          required_points?: number
          type?: Database["public"]["Enums"]["reward_type"]
          updated_at?: string
        }
        Relationships: []
      }
      state_entries: {
        Row: {
          definition_id: string
          entry_timestamp: string
          id: string
          notes: string | null
          user_id: string
          value_numeric: number | null
          value_text: string | null
        }
        Insert: {
          definition_id: string
          entry_timestamp?: string
          id?: string
          notes?: string | null
          user_id: string
          value_numeric?: number | null
          value_text?: string | null
        }
        Update: {
          definition_id?: string
          entry_timestamp?: string
          id?: string
          notes?: string | null
          user_id?: string
          value_numeric?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "state_entries_definition_id_fkey"
            columns: ["definition_id"]
            isOneToOne: false
            referencedRelation: "tracked_state_defs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "state_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_values: {
        Row: {
          task_id: string
          user_id: string
          value_id: string
        }
        Insert: {
          task_id: string
          user_id: string
          value_id: string
        }
        Update: {
          task_id?: string
          user_id?: string
          value_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_values_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_values_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_values_value_id_fkey"
            columns: ["value_id"]
            isOneToOne: false
            referencedRelation: "values"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          archived_at: string | null
          created_at: string | null
          due: string | null
          goal_id: string | null
          id: string
          notes: string | null
          parent_task_id: string | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          recurrence_end_date: string | null
          recurrence_rule: string | null
          sort_order: number | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string | null
          due?: string | null
          goal_id?: string | null
          id?: string
          notes?: string | null
          parent_task_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          recurrence_end_date?: string | null
          recurrence_rule?: string | null
          sort_order?: number | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string | null
          due?: string | null
          goal_id?: string | null
          id?: string
          notes?: string | null
          parent_task_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          recurrence_end_date?: string | null
          recurrence_rule?: string | null
          sort_order?: number | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tracked_state_defs: {
        Row: {
          active: boolean
          created_at: string
          custom_labels: string[] | null
          id: string
          name: string
          priority: number
          scale: Database["public"]["Enums"]["tracked_state_scale"]
          target_max_value: number | null
          target_min_value: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          custom_labels?: string[] | null
          id?: string
          name: string
          priority?: number
          scale: Database["public"]["Enums"]["tracked_state_scale"]
          target_max_value?: number | null
          target_min_value?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          custom_labels?: string[] | null
          id?: string
          name?: string
          priority?: number
          scale?: Database["public"]["Enums"]["tracked_state_scale"]
          target_max_value?: number | null
          target_min_value?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracked_state_defs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tracked_state_values: {
        Row: {
          state_id: string
          user_id: string
          value_id: string
        }
        Insert: {
          state_id: string
          user_id: string
          value_id: string
        }
        Update: {
          state_id?: string
          user_id?: string
          value_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracked_state_values_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "tracked_state_defs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracked_state_values_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracked_state_values_value_id_fkey"
            columns: ["value_id"]
            isOneToOne: false
            referencedRelation: "values"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          progress: number | null
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          progress?: number | null
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          progress?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badge_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_rewards: {
        Row: {
          created_at: string
          earned_at: string
          id: string
          metadata: Json | null
          points_spent: number
          reward_id: string
          reward_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          points_spent?: number
          reward_id: string
          reward_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          points_spent?: number
          reward_id?: string
          reward_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_rewards_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string
          id: string
          notification_preferences: Json
          ui_preferences: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notification_preferences?: Json
          ui_preferences?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notification_preferences?: Json
          ui_preferences?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      values: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          domain_id: string | null
          id: string
          sort_order: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          domain_id?: string | null
          id?: string
          sort_order?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          domain_id?: string | null
          id?: string
          sort_order?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "values_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      habit_frequency_period: "day" | "week" | "month"
      habit_type: "boolean" | "quantity"
      reward_type: "badge" | "achievement" | "item" | "discount"
      task_priority: "low" | "medium" | "high"
      task_status: "todo" | "doing" | "done" | "blocked" | "pending"
      tracked_state_scale: "1-5" | "low-high" | "custom"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      habit_frequency_period: ["day", "week", "month"],
      habit_type: ["boolean", "quantity"],
      reward_type: ["badge", "achievement", "item", "discount"],
      task_priority: ["low", "medium", "high"],
      task_status: ["todo", "doing", "done", "blocked", "pending"],
      tracked_state_scale: ["1-5", "low-high", "custom"],
    },
  },
} as const
```


# 🎨 Assets & Files
Fonts, images, and other assets.

### Font Assets
```
assets/fonts/SpaceMono-Regular.ttf
```

### Image Assets
```
assets/images/adaptive-icon.png
assets/images/favicon.png
assets/images/icon.png
assets/images/partial-react-logo.png
assets/images/react-logo.png
assets/images/react-logo@2x.png
assets/images/react-logo@3x.png
assets/images/splash-icon.png
```

### Animation Assets (Lottie)
```
assets/refresh-sheikah.json
```
