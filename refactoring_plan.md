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
