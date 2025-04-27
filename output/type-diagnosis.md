# Aether iPhone App – End-to-End Type-System Diagnosis

> Date generated: 2025-04-27 12:45 (local)

---

## 1. Summary

This document audits the **client (Expo/React Native)** and **server (tRPC)** layers to ensure that:

1. Every screen/component receives the props it expects.
2. Every tRPC procedure returns the shape the client actually consumes.
3. The shared `zod` schemas in `server/src/types/trpc-types.ts` are used consistently.

Mismatches are called out with **❌ Problems** and recommended fixes with **✅ Fix**.

---

## 2. Screens & Components

| Screen / Component | Expected Props (runtime) | Source of Data | Diagnosis |
| --- | --- | --- | --- |
| `HomeScreen` (`app/(tabs)/home/index.tsx`) | `dashboardData.goals: { id, title, progress, tasks }[]`<br>`dashboardData.habits: { id, title, completed, streak }[]` | `trpc.dashboard.getDashboardData` | ❌ Server returns<br>• `goals.*` – no `progress`, no `tasks` aggregate.<br>• `habits.*` – field is `name`, not `title`; no `completed`. |
| `PlannerScreen.GoalsTab` | `trpc.goal.getGoals → Goal[]` where `Goal` has `title`, `dueDate` | `goalRouter.getGoals` | ✅ Matches (server returns `title`, `target_date`). Consider aliasing `target_date → dueDate` on client for clarity. |
| `PlannerScreen.HabitsTab` | `trpc.habit.getHabits → { id, title, completed }[]` | `habitRouter.getHabits` | ❌ Router returns `name` not `title`; no `completed` flag. |
| `HabitCheckItem` | `{ id, title, streak, completedToday }` | Comes from `HomeScreen` sliced habits | Same mismatch as above: `title` vs `name`. |
| `GoalSummaryCard` | `{ id, title, progress, tasks:{total,completed} }` | Comes from `HomeScreen` goals slice | Same mismatch: missing `progress` & `tasks` aggregation from server. |
| `CompassScreen` (`principles` / `states` tabs) | commented-out placeholders for `value` / `trackedState` lists | Server routers (`valueRouter`, `trackedStateRouter`) implemented; client not wired. | ⚠️ Implementation pending on client side. |
| `RewardsScreen` | Place-holder comments; expects `rewards.list` etc. | `rewardsRouter` exists. | ⚠️ Not wired. |

> **General pattern:** Most table columns are named `name`, but UI components uniformly expect `title`. Unify naming to avoid cast-as-any in UI.

---

## 3. tRPC Procedures

Below is the canonical list (from `server/src/router.ts`) with notes on client usage.

| Router | Procedure | Input Schema | Output | Consumed By | Diagnosis |
| --- | --- | --- | --- | --- | --- |
| `dashboard` | `getDashboardData` | none | `{ habits, goals, tasks, values, habitEntries }` (raw rows) | HomeScreen | ❌ Rows do **not** include computed fields `progress`, `tasks` (goal) or `completed` (habit).
| `dashboard` | `getWeeklyProgress` | none | metrics & arrays | Not yet used | – |
| `habit` | `getHabits` | none | `habits.*` | Planner.HabitsTab, HomeScreen | ❌ Field naming mismatch (`name` vs `title`); missing `completed` today flag.
| `habit` | `createHabitEntry` | `{ habitId, date, completed, notes? }` | HabitEntry row | HomeScreen & Planner.HabitsTab toggle | ✅ Matches.
| `goal` | `getGoals` | none | Goal rows | Planner.GoalsTab | ✅
| `goal` | `getGoalById` | `{ id }` | Goal row | Planner goal detail screen (not yet implemented) | –
| `task` | CRUD | – | – | Not yet consumed in UI; future work.
| `value`, `state`, `rewards`, `user` | various | – | – | Only stubbed on client. |

---

## 4. Shared Type Definitions (`server/src/types/trpc-types.ts`)

* Pros
  * 👍 Centralised Zod schemas for DB rows & common inputs.
  * 👍 `RouterInputs` / `RouterOutputs` exported for client inference.

* Issues
  * Client components are **not** importing these helpers; instead rely on implicit any-typed objects.
  * `utils/trpc.ts` re-exports `RouterInputs/Outputs`, but no UI code uses them.

**✅ Fix**: import as
```ts
import { RouterOutputs } from '@/utils/trpc';
type DashboardGoal = RouterOutputs['dashboard']['getDashboardData']['goals'][number];
```

---

## 5. Gaps & Recommendations

1. **Field Name Alignment**
   * Rename DB column `name` → `title` **or** map in router (`select('id, name as title, streak')`).
   * Add aggregates (progress %, task counts) inside `dashboard.getDashboardData` so UI stops faking them.
2. **Explicit Types in UI**
   * Stop inline object creation (`goal: { id, title, … }`). Use output inference helpers.
3. **Pass Query Params Correctly**
   * Currently using `router.push('/planner' as any)`; replace with strongly typed routes once Expo Router v2 type support lands.
4. **Unused Routers**
   * `valueRouter`, `trackedStateRouter`, `rewardsRouter` are implemented server-side but unused. Create UI fetch hooks or remove dead code.
5. **Shared Hooks Generator**
   * Consider running `trpc-codegen` to generate typed React Query hooks instead of `createTRPCReact` raw call.
6. **Testing**
   * Add unit tests ensuring router output matches Zod schema expected by UI.

---

## 6. Next Steps Checklist

- [ ] Refactor `dashboardRouter` to join/aggregate and return `progress`, `tasks`, `completedToday`.
- [ ] Update habit/goal components to consume new typed outputs.
- [ ] Replace magic strings (`'day'|'week'`) with enums imported from shared types.
- [ ] Wire Compass & Rewards screens to their routers.
- [ ] Enforce `strictNullChecks` and `--noImplicitAny` in `tsconfig`.

---

### 🚀 Once these fixes land, the client and server will share a robust, fully inferred end-to-end type-system.
