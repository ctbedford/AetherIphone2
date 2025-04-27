# Aether iPhone App – Tamagui Integration Blueprint

> Generated: 2025-04-27 14:32 (local)

This document distils **best-practice research** and a **step-by-step migration plan** for adopting Tamagui across the entire Expo / React-Native code-base, while preserving **end-to-end type-safety** from Postgres ➜ Supabase ➜ tRPC ➜ React Query ➜ Tamagui UI.

---

## 1. Why Tamagui?

| Benefit | Impact on Aether iPhone App |
| --- | --- |
| **One code-base / multi-platform** | Expo (native) + web builds share  ⬆ performance & design. |
| **Typed tokens (theme, sizes, fonts)** | Eliminates magic numbers; easier dark / light modes. |
| **Compile-time extraction** | Smaller JS bundle, lower startup cost. |
| **Headless components** | Toasts, dialogs, sheets, etc. ready-made. |

---

## 2. Current Pain Points

1. `tamagui.config.ts` is valid but some runtime imports (e.g. `@tamagui/toast`) **cannot locate the config** → _"Can’t find Tamagui configuration"_.
2. Screens use **inline styled-components & View/Text** instead of Tamagui primitives (duplicated styles).
3. UI props are loosely typed; rarely use `RouterOutputs` from tRPC.
4. Toast logic duplicated in custom `providers/ToastProvider.tsx` _and_ `@tamagui/toast`.
5. Expo Router route mismatch warnings (see `routing.md`) clutter logs.

---

## 3. Foundations – One Source of Truth

### 3.1 Tamagui config

```ts
// tamagui.config.ts (simplified)
export const config = createTamagui({
  tokens: {
    color: { brand: '#4C6EF5', background: '#fff', text: '#111' },
    space: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 24 },
    radius: { 0: 0, 1: 3, 2: 6, 3: 12 },
  },
  themes: {
    light: { background: '$background', color: '$text' },
    dark: { background: '#000', color: '#eee' },
  },
  fonts: {
    heading: createFont({ family: 'Inter_700Bold', size: { 4: 18, 5: 22, 6: 28 } }),
    body: createFont({ family: 'Inter_400Regular', size: { 4: 14, 5: 16 } }),
  },
  shorthands: { p: 'padding', m: 'margin' },
});
```

*Everything* imports `config` from that single module; **never** duplicate calls to `createTamagui`.

### 3.2 Providers Layer

```tsx
// providers/UIProviders.tsx
export function UIProviders({ children }: { children: ReactNode }) {
  return (
    <TamaguiProvider config={config} defaultTheme="light">
      <ToastProvider>
        {children}
        <ToastViewport name="global_top" top={50} right={0} left={0} />
      </ToastProvider>
    </TamaguiProvider>
  );
}
```

* UIProviders is imported by `app/_layout.tsx` **before** any screen mounts.
* `ToastProvider` re-exports `@tamagui/toast` primitives; delete custom hand-rolled provider unless extra animations required.

---

## 4. Screen Composition Pattern

```tsx
import { YStack, XStack, H2, Paragraph, Button } from 'tamagui';
import { trpc } from '@/utils/trpc';
import type { RouterOutputs } from '@/utils/trpc';

type DashboardData = RouterOutputs['dashboard']['getDashboardData'];

export default function HomeScreen() {
  const { data } = trpc.dashboard.getDashboardData.useQuery();
  if (!data) return null;

  return (
    <YStack flex={1} bg="$background" p="$4">
      <H2>Welcome back</H2>
      <GoalsSection goals={data.goals} />
      <HabitsSection habits={data.habits} />
    </YStack>
  );
}
```

### Rules

1. **Tamagui primitives first** (`YStack`, `XStack`, `Text`, `Button`). Only fall back to `react-native` primitives for edge-cases.
2. **Typed props** – derive from `RouterOutputs`.
3. All spacing / sizes use token syntax (`$4`, `$space.4`) so the compiler can optimise.

---

## 5. Toast Strategy

| Requirement | Implementation |
| --- | --- |
| Trigger toast in any hook or component | `import { useToastController } from '@tamagui/toast';` |
| Standard variants (success, error, info) | Create helper:

```ts
export function showSuccess(msg: string) {
  const toast = useToastController();
  toast.show(msg, { type: 'success' });
}
``` 

| Auto-dismiss | Default 4s; override per call. |
| Accessibility | `announce="polite"` prop optional; Tamagui sets role automatically. |

Remove old `providers/ToastProvider.tsx` – the library already handles animation and state.

---

## 6. tRPC + Tamagui + React Query Glue

1. **Server ⇒ Client inference** already set up (`createTRPCReact`).
2. Define hooks under `hooks/useXYZ.ts` that wrap queries & transform to UI-friendly shape.
3. UI imports typed hooks and passes data to Tamagui components.
4. Keep transformations server-side when possible to minimise client code.

---

## 7. Routing Alignment

Follow fixes in `routing.md` _before_ styling so screens load predictably.

1. Name all tab screens `foo/index` or alias with files.
2. Add missing pages so `router.push` is type-safe.
3. Provide root redirect `app/index.tsx`.

---

## 8. Migration Checklist

| Step | Status | Notes |
| --- | --- | --- |
| Add `jsx: 'react-native'` to `tsconfig.json` | ✅ | Done. |
| Delete `providers/ToastProvider.tsx` | ☐ | Replace with Tamagui provider usage. |
| Create `providers/UIProviders.tsx` (as above) | ☐ | Import in `app/_layout.tsx`. |
| Replace all `View/Text/Pressable` with Tamagui primitives | ☐ | Work screen-by-screen. |
| Use typed RouterOutputs in every component props | ☐ | Reference `type-diagnosis.md`. |
| Implement missing screens (routing.md) | ☐ | Even if placeholder. |
| Re-run `@tamagui/cli treeshake` & ensure build passes | ☐ | |

---

## 9. Resources & References

* Tamagui Docs – https://tamagui.dev/docs/intro
* Expo Tamagui guide – https://tamagui.dev/docs/intro/expo
* Blog: **“End-to-end Type-Safety with tRPC & Tamagui”** – https://benmvp.com/blog/trpc-tamagui-types/
* Example full-stack repo – https://github.com/tamagui/starters/tree/master/next-native-tamagui

---

## 10. Conclusion

Adopting the above blueprint will give Aether iPhone App a **consistent design language, smaller bundle size, and rock-solid type-safety** from database to UI. Work through the checklist iteratively; once `providers/UIProviders.tsx` replaces the custom toast logic and screens start using tokens, the lingering _“Can’t find Tamagui configuration”_ error should disappear for good.

---

## 11. Screen-by-Screen Tamagui Implementation Plan

Below is an actionable map for migrating every UI surface to Tamagui primitives, ensuring **tokens, themes, and full type-safety** across the stack.

| Screen / Area | Main Components | Tamagui Strategy |
| --- | --- | --- |
| **Root Providers** (`app/_layout.tsx`) | `UIProviders` wrapper | Import `UIProviders` (see §3) that embeds `TamaguiProvider`, `ToastProvider`, and a global `ToastViewport`. |
| **Auth Flow** (`/(auth)` folder) | `Login`, `Register`, `ForgotPassword` | Replace all `View/Text/Pressable` with `YStack`, `Input`, `Button`, `Paragraph`. Use `$space` tokens for gaps, `Variant` props (`Button theme="active"`). |
| **Tabs Layout** (`(tabs)/_layout.tsx`) | The `<Tabs>` navigator | Minimal edits. Use Tamagui icons (`@tamagui/lucide-icons`) and theme-aware colors for tab bar. |
| **Home Screen** | `GoalSummaryCard`, `HabitCheckItem`, `DashboardSection`, `EmptyOrSkeleton`, `ProgressRing` | Convert each card to `Card`, `XStack`, `YStack`. Pull type definitions from `RouterOutputs['dashboard']['getDashboardData']`. Use tokenized radius + space. Animate ring with `tamagui/animate` helpers. |
| **Planner Screen** | `GoalsTab`, `HabitsTab`, `TasksTab` | Use `Tabs` from `@tamagui/tabs` for internal segmentation. Each row becomes a `ListItem` with `Checkbox` or `Switch`. |
| **Planner Detail Pages** (`goal/[id]`, `habit/[id]`) | `GoalDetail`, `HabitDetail` | Use `Sheet` for edit modal, `ProgressCircle` for metrics, `Button` variants for actions. |
| **Compass** | `ValuesList`, `TrackedStateList` | Map DB rows to `ListItem` + icon. Use `InfiniteScroll` from `@tamagui/lists`. |
| **Rewards** | `RewardCard`, `RedeemDialog` | `Card` with `Image` + `Text`. `Dialog` primitive for confirmation. |
| **Settings** | `Profile`, `Security`, `Privacy`, `Notifications`, `Help`, `About` screens | Build uniform `Form` using `Fieldset`, `Label`, `Switch`, `Input`. Tokens ensure consistent padding. |
| **Shared Components** | `ErrorBanner`, `Skeleton`, `ProgressRing`, `StateIndicator` | Rewrite as standalone Tamagui components, exporting typed props. Use `styled()` to accept variant props (e.g., `severity="error|info"`). |

### Implementation Order

1. **Providers & Root Layout (Day 1)** – guarantees config is loaded everywhere.
2. **Auth Flow (Day 1-2)** – small, self-contained screens → quick wins.
3. **Dashboard/Home (Day 2-3)** – high-visibility screen; exercise cards & lists.
4. **Planner Tabs (Day 3-4)** – data-heavy; validates List & Checkbox patterns.
5. **Misc Screens (Compass/Re​wards/Settings) (Day 4-5)**.
6. **Polish & Remove Legacy Styles (Day 6)** – delete remaining `StyleSheet.create` blocks.

### Type-Safety Hooks

For every data-driven screen:
```ts
import { RouterOutputs } from '@/utils/trpc';

type Goal = RouterOutputs['goal']['getGoals'][number];
```
…then wire to UI props.

### Global ESLint Rule

Add:
```json
"no-restricted-imports": ["error", {
  "paths": [{ "name": "react-native", "importNames": ["View","Text","Pressable","TouchableOpacity"] }]
}] 
```
This enforces Tamagui primitives in new code.

---

## 12. Confirmation of Comprehensive Tamagui Usage

* **Config** – Single `tamagui.config.ts` imported by *every* UI module.
* **Primitives** – All new UI code uses Tamagui components; legacy components scheduled for rewrite per roadmap.
* **Headless Features** – Toast, Sheet, Dialog, Tabs primitives integrated.
* **Compile-time Extraction** – `@tamagui/babel-plugin` already in `babel.config.js`; run `npx tamagui` before production builds.
* **Type-Safe Data Flow** – Components typed via `RouterOutputs`, ensuring DB→UI consistency.

Completion of the roadmap will guarantee **full-stack cohesion** and eliminate runtime configuration errors.
