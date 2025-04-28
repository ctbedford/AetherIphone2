# Testing Strategy

> “If you don’t like unit testing your product, most likely your customers won’t like to test it either.” – Anonymous

This document codifies **how and why** we test every layer of the Aether iPhone application to enable **Test-Driven Development (TDD)**, short feedback cycles, and confidently ship high-quality code.

---

## 1. Tech-Stack & How the Pieces Interact

| Layer | Primary Tech | Purpose | Notes |
|-------|--------------|---------|-------|
| **UI** | Expo + React Native, Tamagui (design system), React Navigation | Interactive surfaces | Tamagui primitives → feature components → screens → stacks/tabs |
| **State** | TanStack Query, Zustand | Remote & local state | React Query for server cache, Async-Storage persister; Zustand for ephemeral UI state |
| **Networking** | tRPC 11, Supabase JS v2 | RPC & DB access | Procedures call Supabase; auth context injected |
| **Backend** | Supabase Postgres (hosted) | Data persistence | Tested via mocked Supabase client to avoid network |
| **Utility** | date-fns, utils/* | Pure helpers | No side-effects, easiest to unit-test |
| **Tooling** | TypeScript, ESLint, Prettier | Static guarantees | `ts-jest` reuses the same TS config |
| **Testing** | Jest 29, Jest-Expo 52, React-Native-Testing-Library 13, Jest-Mock-Extended 4, MSW 2 | Unit / integration | UI runner vs Node runner share config fragments |

> All technologies above are **typed** and **mock-friendly**, which is critical for TDD.

### 1.1 Supabase Schema & Type-Generation

* **Source of Truth** – `/supabase/schema.sql` maintained via Supabase Studio migrations.
* **Type Generation** – `npm run generate-types` executes `supabase gen types typescript --project-id <id>`. Output lives at `types/supabase.ts` and is imported everywhere (`Database['public']['Tables']['tasks']`).
* **Why** – guarantees compile-time correctness of column names, data shapes, and row-level security (RLS) policies exposed via `insert()/update()`.
* **Testing Impact** – mocks use these generated types so any schema drift instantly breaks tests.

---

## 2. Pyramid of Tests

```
          E2E (future: Detox)
        Integration (tRPC ↔ Supabase, Screen ↔ Store)
      Unit (Components, Hooks, Utils, Routers)
  Static Analysis (TypeScript, ESLint)
```

1. **Static Analysis** – compile & lint gates prevent many runtime errors.
2. **Unit Tests** – fast, deterministic, isolate a single module.
3. **Integration Tests** – wire several modules; catch contract drift.
4. **(Optional) E2E** – device-level confidence once the core is solid.

Coverage goal: **≥90 % lines / 100 % critical paths**.

---

## 3. Testing Concerns by Folder

| Path | What to Test | Example Utilities |
|------|--------------|-------------------|
| `components/ui/primitives` | Rendering, style props, accessibility | Snapshot + RTL queries |
| `components/*` lists/cards | Interaction callbacks, conditional rendering | Fire events, assert mockFn calls |
| `screens/*` | Navigation, data hooks, optimistic updates | Mock React-Navigation & React Query provider |
| `modals/*` | Visibility toggles, onDismiss side-effects | Render with mocked store |
| `hooks/*` | Return value, edge cases | Jest timers for async hooks |
| `stores/*` (Zustand) | Initial state, actions mutate correctly | Wrap in `act()` |
| `server/src/routers` | Input validation, happy/edge/error paths | `createCaller()` with DeepMock Supabase |
| `utils/*` | Pure output given input | Table-driven tests |
| **tRPC ↔ Supabase** | Procedure executes correct query chain, returns typed data, handles errors | DeepMock Supabase, assert `.from('tasks').update(...).eq(...).single()` |

### 3.1 Mapping of Procedures ➟ Tables ➟ UI

| Procedure | Supabase Table/Function | Primary UI Consumer | Key Assertions |
|-----------|-------------------------|---------------------|----------------|
| `tasks.list` | `public.tasks` | `TaskList` screen | Returns tasks belonging to user ordered by `created_at` |
| `tasks.toggleTask` | `public.tasks`, `public.goals` (progress calc) | Checkbox in `TaskListItem` | Updates status, cascades goal progress, optimistic cache update |
| `goals.list` | `public.goals` | `GoalList` screen | Pagination & total progress |
| `dashboard.getWeeklyProgress` | SQL `select_weekly_progress` function | Dashboard chart | Aggregates by date; ensures 7 entries |
| `habits.completeHabit` | `public.habits`, `public.habit_completions` | `HabitCheckItem` | Inserts completion row, updates streak |

For each mapping we create **router unit tests** (mock Supabase) **and** **hook/UI integration tests** (MSW mocks). This guarantees end-to-end correctness without real network.

---

## 4. Bidirectional Coverage Matrix (Screen → DB and DB → Screen)

> To ensure **holistic** coverage we loop through the stack **twice**:
>
> 1. **Screen-centric** – every user-facing route is traced down to the exact DB rows it eventually mutates or reads.
> 2. **Schema-centric** – every table/function is traced upward to the screens that surface or modify its data.
>
>  Any missing arrow in either loop exposes a **testing gap**.

### 4.1 Screen-Centric Trace

| Screen (Route) | Primary Hooks | tRPC Procedure(s) | Supabase Table(s)/Function(s) | Current Tests? |
|---------------|--------------|-------------------|-------------------------------|----------------|
| `(tabs)/home` → `TaskList` | `useTasks()` | `tasks.list`, `tasks.toggleTask` | `public.tasks`, `public.goals` | ✅ (`TaskList`, `TaskListItem`, router tests) |
| `(tabs)/planner` → `PlannerScreen` | `usePlanner()` | `planner.getPlan`, `tasks.create` | `public.tasks`, `public.planner` | ⚠️ **Missing Planner tests** |
| `(tabs)/compass` → `CompassScreen` | `useGoals()` | `goals.list`, `goals.create` | `public.goals` | ⚠️ Only router tests, no UI integration |
| `(tabs)/rewards` → `RewardsScreen` | `useRewards()` | `rewards.list`, `rewards.claim` | `public.rewards`, `public.reward_claims` | ❌ **No tests** |
| `(tabs)/settings` → `SettingsScreen` | — (local) | — | — | n/a |
| `(auth)/signin` | Supabase Auth UI | — | `auth.users` | Jest-Expo snapshot only |
| `planner/*` nested routes | `useTaskForm()` | `tasks.create`, `tasks.update` | `public.tasks` | ✅ unit but ⚠️ missing form validation tests |

### 4.2 Schema-Centric Trace

| Table / Function | Used By Procedure(s) | Surface Screen(s) | Tests Present? |
|------------------|----------------------|-------------------|----------------|
| `public.tasks` | `tasks.*`, `planner.getPlan` | Home, Planner | ✅ many but form gaps |
| `public.goals` | `goals.*`, `tasks.toggleTask` | Compass, Home (goal badges) | ⚠️ missing Compass UI tests |
| `public.habits` & `public.habit_completions` | `habits.*` | Dashboard HabitCheck | ✅ router, ⚠️ UI integration flaky |
| `public.rewards`, `public.reward_claims` | `rewards.*` | Rewards Screen | ❌ no tests |
| `select_weekly_progress()` | `dashboard.getWeeklyProgress` | Dashboard Charts | ✅ router + chart snapshot |
| `auth.users` | Supabase Auth | Auth stack | Manual e2e only |

### 4.3 Gap List & Action Items

1. **PlannerScreen integration** – build MSW mocks for `planner.getPlan`, test drag-and-drop reorder.
2. **CompassScreen goal list** – RTL tests verifying progress bars and empty-state.
3. **Rewards flow** – unit tests for `rewards` router + UI tests for claim interaction.
4. **Task Form validation** – test Zod schema errors render helper text.
5. **HabitCheckItem race condition** – flaky UI test; stabilise with fake timers.
6. **Auth flow** – light coverage acceptable until E2E added.

> All new tests should follow the Contract Flow (4.4) and update this matrix.

---

## 5. Tooling Configuration

### 5.1 Jest Runners

| Runner | Config | Targets |
|--------|--------|---------|
| **UI** | `jest.config.ui.js` (jest-expo preset) | RN components/screens |
| **Server** | `jest.config.server.js` (ts-jest preset) | tRPC routers, utils |

Both share `jest.setup.js` for globals and custom matchers.

### 5.2 Mocking Conventions

| Dependency | Technique | File |
|------------|-----------|------|
| Supabase client | `jest-mock-extended` deep mocks with chainable builders | `__tests__/server/test-helpers.ts` |
| React Navigation | Manual stubs | `jest.setup.js` |
| Tamagui | `@tamagui/core/testing` → **TODO** replace with custom fallback until package publishes CJS build |
| Network / 3rd-party | MSW request handlers | `__tests__/mocks/server.ts` |

### 5.3 Utilities

* **`createTestCaller(userId?)`** – spins up tRPC caller with desired auth context.
* **`resetSupabaseMocks()`** – zeroes call counts between tests.
* **Fixtures** – stored under `__tests__/fixtures` for large JSON blobs.

### 5.4 Contract & Integration Testing Flow

1. **Router → Supabase Contract**
   * Deep-mock Supabase with `jest-mock-extended` typed by `types/supabase.ts`.
   * Use `expect(mock.from('tasks').update).toHaveBeenCalledWith(/* typed */)`.
2. **Hook → Router Contract** (`src/hooks/trpc/*`)
   * Mock tRPC client with MSW; return fixture data that matches Supabase types.
   * Assert React Query cache keys and optimistic rollback.
3. **UI → Hook Contract**
   * Render component with `TestWrapper` (React Query provider + Navigation).
   * Fire events, assert that mutation hook was called and UI updates (loading states, toasts).

> These layers mirror production call-stack: **UI → Hook → tRPC → Supabase**. Each layer is verified in isolation **and** in pairwise combination to spot contract drift early.

---

## 6. Red-Green-Refactor Workflow

1. **Write a failing test first** (red) – describe desired behaviour.
2. **Make it pass** (green) – minimal implementation.
3. **Refactor safely** – rely on green suite; improve design.
4. **Commit** – each passing step; CI gate rejects red.

> The rule of thumb: *No production code without a failing test*.

---

## 7. Continuous Integration

* **GitHub Actions** workflow `ci.yml` (TBD)
  * Install deps with cache.
  * Run `yarn test:ci` (UI & server) and `expo lint`.
  * Upload coverage to Codecov.
* Pull-request status required before merge.

---

## 8. Future Work

1. **E2E with Detox / Maestro** once UI stabilises.
2. **Visual regression** snapshots via Loki.
3. **Performance** tests for large lists with Flash-List.
4. **Contract testing** of Supabase RPC functions with the staging DB.

---

## 9. Appendix – Why This Approach?

* **Type Safety + Unit Tests** catch ~80 % of bugs before runtime.
* **Jest single toolchain** keeps cognitive load low for both Node & RN.
* **Deep mocks** for Supabase isolate server logic from network flakiness while still asserting correct query chains.
* **MSW** enables true integration tests for React Query hooks without hitting real endpoints.
* **Separation of runners** makes RN tests boot faster; Node tests avoid Metro.
* **TDD** enforces design clarity – API surfaces are defined by test expectations.

> This strategy lets us iterate quickly while maintaining iron-clad confidence across the entire stack.
