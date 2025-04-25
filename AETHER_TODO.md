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
- [ ] 100% ESLint clean (`npm run lint` passes) 