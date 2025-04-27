# Aether iPhone App – Routing Audit

> Generated: 2025-04-27 13:06 (local)

This audit inspects **all Expo Router routes, layouts, and navigation calls** in the repository and highlights every mismatch currently causing the “resource not available” / “no route named …” warnings seen at runtime.

---

## 1. Current Route File Structure (`app/`)

```plaintext
app/
├─ _layout.tsx                 ← Root stack (global providers)
├─ (auth)/                     ← Hidden segment – NOT shown in URL
│  ├─ _layout.tsx              ← <Stack> – login flow
│  ├─ login.tsx
│  ├─ register.tsx
│  └─ forgot-password.tsx
└─ (tabs)/                     ← Hidden segment – bottom-tab navigator
   ├─ _layout.tsx              ← <Tabs> (5 tabs)
   ├─ home/
   │  └─ index.tsx
   ├─ planner/
   │  └─ index.tsx
   ├─ compass/
   │  └─ index.tsx
   ├─ rewards/
   │  └─ index.tsx
   └─ settings/
      └─ index.tsx
```

>There is **no** `app/index.tsx`, so navigating to `/` currently resolves to a blank screen unless Expo Router falls back to the first child automatically. Creating a lightweight redirect (or turning `(tabs)` into `index.tsx`) is recommended.

---

## 2. Tab Layout vs. Discovered Children

`app/(tabs)/_layout.tsx` registers five `Tabs.Screen`s:

| Declared `name` prop | Actual generated route | Diagnosis |
| --- | --- | --- |
| `home` | `home/index` | ❌ **Mismatch** – Expo emits *exact* file paths (folder + `index`).* |
| `planner` | `planner/index` | ❌ |
| `compass` | `compass/index` | ❌ |
| `rewards` | `rewards/index` | ❌ |
| `settings` | `settings/index` | ❌ |

*Expo Router warning: “No route named `home` exists in nested children: ["home/index", …]”.*

**✅ Fix** – change the `name` props to include `/index`, e.g.

```tsx
<Tabs.Screen name="home/index" … />
```

OR create `home.tsx` files next to the folders to alias the index pages.

---

## 3. Navigation Calls (`router.push`) vs. Real Files

### 3.1  Planner-related pushes

| Push Target | File exists? | Notes |
| --- | --- | --- |
| `/planner` | ✔️ `(tabs)/planner/index.tsx` | OK |
| `/planner/add-task` | ❌ | Missing screen. |
| `/planner/add-habit` | ❌ | Missing. |
| `/planner/add-goal` | ❌ | Missing. |
| `/planner/goal/[id]` | ❌ | Needs `planner/goal/[id].tsx` folder/file pair. |
| `/planner/habit/[id]` | ❌ | Needs `planner/habit/[id].tsx`. |

### 3.2 Home quick-actions

Same missing targets as above because Home forwards to Planner.

### 3.3 Settings pushes

| Push Target | File exists? |
| --- | --- |
| `/settings/profile` | ❌ |
| `/settings/security` | ❌ |
| `/settings/privacy` | ❌ |
| `/settings/notifications` | ❌ |
| `/settings/help` | ❌ |
| `/settings/about` | ❌ |

All of these should live under `(tabs)/settings/` as separate files or a nested stack.

### 3.4 Auth flow

`/(auth)` screens match their pushes (`router.replace('/(auth)/login')`). ✅

---

## 4. Initial Route / Deep Linking

Because there is no `app/index.tsx`, cold-launching the app without a deep link may show the root &lt;Slot&gt; with nothing rendered. On some devices Expo Router silently chooses the first route (`home/index`), but this isn’t guaranteed. A robust pattern is:

```tsx
// app/index.tsx
import { Redirect } from 'expo-router';
export default function () {
  return <Redirect href="/home" />;
}
```

---

## 5. Recommended Fixes (Action List)

1. **Tab names** – update `Tabs.Screen name` props to include `/index` (or supply alias files).
2. **Create missing screens:**
   * `app/(tabs)/planner/add-task.tsx`
   * `app/(tabs)/planner/add-habit.tsx`
   * `app/(tabs)/planner/add-goal.tsx`
   * `app/(tabs)/planner/goal/[id].tsx`
   * `app/(tabs)/planner/habit/[id].tsx`
   * `app/(tabs)/settings/{profile,security,privacy,notifications,help,about}.tsx`
3. **Root redirect** – add `app/index.tsx` that redirects to `/home`.
4. **Use type-safe `router.push`** – once screens are in place, remove the `as any` casts.
5. **Optional** – wrap settings & planner sub-pages in their own `<Stack>` navigator for headers and back gestures.

---

## 6. After Patching

Running `npx expo start` should no longer print the “No route named …” warnings, and every button should open a valid screen. Add placeholder components first; design can be fleshed out later.
