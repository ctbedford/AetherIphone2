# Aether App – Holistic Refactor Checklist

> Generated: 2025-04-27

This document is derived from a **second-pass audit** of the current codebase (`app/`, `components/`, `utils/`, `types/`) and the **Supabase schema** in `types/database.types.ts`.  It enumerates every outstanding task, design consideration, and cross-dependency needed to land the new Home / Planner / Compass / Rewards architecture.

---

## 0  Legend
- [ ] = Not started   ☐
- [~] = In-progress    ~
- [x] = Done           ✔

---

## 1  Design-System / Tamagui
| ID | Task | Blocking / Notes |
|:-|---|---|
| DS-1 | [x] Finalize **brand tokens** (`$brandBlue`, `$brandGreen`, …) in `tamagui.config.ts`. | ✓ Added brand colors with light/dark variants |
| DS-2 | [x] Generate **light / dark** theme objects with Tamagui CLI, merge overrides. | ✓ Updated theme objects with brand colors |
| DS-3 | [x] Create shared **Card**, **ListItem**, **SectionHeader** primitives with spacing & shadows. | ✓ Created in components/ui/primitives |
| DS-4 | [ ] Audit code for **literal hex / spacing** → replace with tokens. | Will be done incrementally as we refactor screens |
| DS-5 | [x] Enable **system colour-scheme** in `Providers.tsx` (currently forced light). | ✓ Using currentTheme from useUiStore |

---

## 2  Data Layer (tRPC ⇄ Supabase)
| ID | Task | Tables / Types | Blocks |
|:-|---|---|---|
| DL-1 | [~] Ensure **goalRouter**, **habitRouter**, **taskRouter** have full CRUD + list procedures. | `goals`, `habits`, `tasks` | |
| DL-1a | [x] Implement **habitRouter.toggleHabit** for dashboard habit check-in. | `habits`, `habit_entries` | |
| DL-2 | [ ] Create **dashboardRouter.getDashboardData** aggregate query. | multiple | |
| DL-3 | [ ] Add **analyticsRouter** (`streaks`, `goalProgress`, `points`). | materialised views | Compass |
| DL-4 | [ ] Implement **rewardsRouter** (`list`, `earnReward`). | `rewards`, `points_ledger`, `badge_definitions` | Rewards |
| DL-5 | [ ] Wire **Supabase JWT refresh** in tRPC link (Providers). | | |
| DL-6 | [ ] Integrate **offline-mutation queue** helper in every mutation. | utils/offline-mutations.ts | |

---

## 3  Screens – Functional Requirements

### 3.1  Home (Dashboard)
- [ ] Fetch `dashboard.getDashboardData`.
- [ ] Render sections:
  - GoalProgressCard list (progress ring).
  - HabitCheckItem list (today entries).  **Mutation:** `habit.toggleEntry` (optimistic + haptics).
  - TaskRow list (upcoming ≤ tomorrow).
- [ ] Quick-action buttons → create modals.
- [ ] Empty & error states via `EmptyOrSkeleton` / `SectionError`.

### 3.2  Planner
- [ ] Segmented Tabs (`Goals | Habits | Tasks`).
- [ ] Each tab = `FlatList` powered by `goal.list`, `habit.list`, `task.list`.
- [ ] Pull-to-refresh, skeleton, empty.
- [ ] Swipe actions: delete / mark done.
- [ ] “+” FAB routes to context-aware add-* modal.

### 3.3  Compass
- [ ] Queries: `analytics.streaks`, `analytics.goalProgress`, `analytics.points`.
- [ ] Charts: `StreakChart`, `ProgressChart` (victory-native).
- [ ] Time-range filter (7 d / 30 d / All).
- [ ] Empty placeholder until views ready.

### 3.4  Rewards
- [ ] List `rewards.list` & `badges.list`.
- [ ] Grid / list toggle (existing code partial).
- [ ] `earnReward` mutation with confirmation alert & toast.
- [ ] Points balance top-bar (from `analytics.points`).

### 3.5  Settings
- [ ] Profile form (bind to `profiles` table).
- [ ] Toggle rows persisted via `utils/settings.ts`.
- [ ] Static pages (About, Help) markdown render.

---

## 4  Creation & Detail Screens
| Entity | Create Fields | Detail Functions |
|-|-|-|
| Goal | title, description, target_date | edit, delete, progress slider |
| Habit | title, cue, routine, reward | streak graph, edit, delete |
| Task | title, notes, due, priority, goal_id (optional) | mark done, edit, delete |

All use **react-hook-form + zod** and share `FormField` component.

---

## 5  Reusable Components to Implement
- [x] `GoalCard`, `HabitCard`, `TaskCard` (Tap-able Card rows) - implemented in components/lists/*.
- [x] `GoalList`, `HabitList`, `TaskList` (FlatList wrappers) - implemented in components/lists/*.
- [ ] `StreakChart`, `ProgressChart` (SVG charts).
- [ ] `BadgeCard`, `PointsBalanceBar`.
- [ ] `SectionError` banner.

---

## 6  UX Enhancements
- [ ] Global haptics: success/error cues (`utils/haptics.ts`).
- [ ] Toast feedback via `@tamagui/toast`.
- [ ] Safe-area aware `ToastViewport` (already done).

---

## 7  Testing & CI
- [x] Jest configuration with proper transformers for React Native and Tamagui.
- [x] Unit tests for primitive components (AetherCard, AetherListItem).
- [x] Unit tests for list components with mock data matching Supabase schema.
- [x] Type-safe tests ensuring database → server → UI type consistency.
- [ ] Test coverage for UI component edge cases (loading, error, empty states).
- [ ] Detox e2e: auth flow, add habit, toggle habit, dashboard refresh.
- [ ] GitHub Actions: lint, test, `expo prebuild`, `eas build --profile preview`.

---

## 8  Technical Debt / Notes
- Planner & Compass screens currently monolithic; will be split per list/tab.
- TypeScript strict mode is **on** – types must be correct.
- Some `ScrollView` imports still present after FlatList migration (clean up).
- `Providers.tsx` temporarily forces `light` theme; remove once DS-2 done.

---

## 9  Priority Roadmap (macro)
1. **DS-1 → DS-3** (Design system foundation)
2. **DL-1 + DL-2** (Core routers) & **DL-6** (offline queue)
3. **Home** rewrite (shows immediate value)
4. **Planner** refactor (lists & CRUD)
5. **Creation / Detail** screens
6. **Analytics views + Compass** MVP
7. **Rewards** MVP
8. **Testing & CI** hardening

> **Next Action:** Start DS-1: finalise brand tokens in `tamagui.config.ts`.
