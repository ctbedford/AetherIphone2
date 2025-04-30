#!/bin/bash

# Create or truncate the project.txt file
echo "# Aether iPhone Project Context for Tamagui to Gluestack/NativeWind Migration" > project.txt
echo "Generated on $(date)" >> project.txt

# Add refactoring plan to the beginning
cat << 'EOF' >> project.txt

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
| providers/SupabaseProvider.tsx | new – context for supabase-js instance + session | @supabase/auth-helpers-react | avoids prop-drilling, keeps auth refresh logic isolated |

### 3️⃣ Navigation Shells (Expo Router)

| File | Action | Depends on | Why |
| --- | --- | --- | --- |
| app/(tabs)/_layout.tsx | rewrite – BottomTabs with icons (Shield, Scroll, Compass, Ruby, Cog) | gluestack/svg icons | Zelda-flavoured nav & group-wide background parchment |
| app/(tabs)/index.tsx | rewrite – Home list (see SectionCard) | 📄 SectionCard.tsx, 🔮 trpc.dashboard.getDashboardData | one entry to test new DS without touching others |
| app/(auth)/ | unchanged aside from Tailwind classes | existing screens | auth flow continues to work |

### 4️⃣ Reusable Components (app/components)

| File | Action | Depends on | Why |
| --- | --- | --- | --- |
| SectionCard.tsx | new – glazed parchment card with header, children slot | Primitives, Animations | reusable for Dashboard sections, Planner lists, etc. |
| StatBadge.tsx | new – heart/rupee style KPI badge | Primitives | quick "level / points" readouts |
| SkeletonCard.tsx | port from Tamagui variant → NativeWind animated placeholder | react-native-linear-gradient | keeps perceived performance |
| EmptyState.tsx | new – Triforce-in-cloud illustration + call-to-action | svg-asset | encourages first-time engagement |

### 5️⃣ Feature Folders

#### 🛡 Home app/dashboard

| File | Action | Depends on | Why |
| --- | --- | --- | --- |
| index.tsx | new (move logic from old screen) – <FlatList> of section data | SectionCard, StatBadge, 🔮 useDashboardQuery | declarative; pull-to-refresh Lottie spinner |
| hooks/useDashboardQuery.ts | new – typed wrapper around trpc.dashboard.getDashboardData | RouterOutputs | co-locates data logic with UI |

#### 📜 Planner app/planner

| File | Action | Depends on | Why |
| --- | --- | --- | --- |
| _layout.tsx | new – SegmentedControl (Goals / Tasks / Habits) | Gluestack SegmentedControl | local navigation |
| Goals.tsx / Tasks.tsx / Habits.tsx | rewrite each list-view with RecyclerListView + swipe actions | 🔮 useGoalsQuery, etc. | performant infinite scrolling |
| hooks/useGoalsQuery.ts etc. | new wrappers | RouterOutputs | enforce Zod types end-to-end |
| components/GoalRow.tsx | new card with progress bar | Primitives, Animations | consistent visual language |

#### 🧭 Compass app/compass

| File | Action | Depends on | Why |
| --- | --- | --- | --- |
| index.tsx | rewrite – master/detail responsive layout | react-native-responsive-layout | quick principle lookup & edit |
| components/PrinciplePreview.tsx | new | Primitives | mini-card list |
| hooks/usePrinciplesQuery.ts | new | RouterOutputs | typed |

#### 🎁 Rewards app/rewards

| File | Action | Depends on | Why |
| --- | --- | --- | --- |
| index.tsx | rewrite – Grid/List toggle with derived animation | Moti | engaging loot boutique |
| components/RewardTile.tsx | new | Primitives | highlights image + cost |
| hooks/useRewardsQuery.ts | new | RouterOutputs | realtime claim updates |

#### ⚙️ Settings app/settings

| File | Action | Depends on | Why |
| --- | --- | --- | --- |
| index.tsx | rewrite – grouped list with divide-y classes | NativeWind | cleaner iOS look |
| hooks/useProfileMutation.ts | new | RouterInputs | patch profile + toast |

### 6️⃣ Utils & Hooks (app/lib)

| File | Action | Depends on | Why |
| --- | --- | --- | --- |
| supabaseClient.ts | keep | @supabase/supabase-js | single import site |
| trpcClient.ts | keep (point to new URL if needed) | @trpc/client | no API change |
| useOfflineCache.ts | new – queryClient.persist() to SQLite | expo-sqlite | offline UX on flights |
| useAuthGuard.tsx | new – redirect unauth users to (auth) stack | Supabase session | consistent gating |

### 7️⃣ Assets

| Item | Action | Why |
| --- | --- | --- |
| assets/fonts/HyliaSerif.ttf CalamitySans.ttf | keep | brand typefaces |
| assets/lottie/sheikah_spinner.json | keep | loading flair |
| assets/svg/triforce_cloud.svg | new | EmptyState illustration |

### 8️⃣ Testing & CI

| File | Action | Depends on | Why |
| --- | --- | --- | --- |
| e2e/Home.spec.ts | new – Playwright test clicks through sections | expo-playwright | prevents regressions |
| jest/setup.ts | update mocks for Gluestack primitives | jest | green unit tests |
| .eas.json | update channel preview-green | Expo EAS | staged rollout |

### 🔮 Assumptions / Unknowns
* TRPC routers exist for dashboard, goal, task, habit, principle, reward, profile. If any are missing we'll stub until backend delivers.
* Auth context – I assumed you expose useSession() from Supabase; if not we'll craft it.
* SVG icon set – I'm planning to import Heroicons + custom Zelda glyphs; confirm license.
EOF

echo "\n## Migration Overview" >> project.txt
echo "Current: Tamagui-based design system" >> project.txt
echo "Target: Gluestack UI + NativeWind" >> project.txt
echo "" >> project.txt

# Function to add a file to the project.txt
add_file() {
  local filename=$1
  
  if [ -f "$filename" ]; then
    echo "\n\n===========================================================" >> project.txt
    echo "# FILE: $filename" >> project.txt
    echo "===========================================================\n" >> project.txt
    cat "$filename" >> project.txt
    echo "Added $filename to project.txt"
  else
    echo "Warning: File $filename not found"
  fi
}

# 1) Core Configuration Files
echo "\n\n===========================================================" >> project.txt
echo "# 1️⃣ CORE DESIGN SYSTEM" >> project.txt
echo "===========================================================\n" >> project.txt

# Main config files
CORE_CONFIG_FILES=(
  "tamagui.config.ts"
  "tailwind.config.js"
  "constants/motion.ts"
  "constants/theme.ts"
  "package.json"
)

for file in "${CORE_CONFIG_FILES[@]}"; do
  add_file "$file"
done

# 2) Type Definitions (important for migrating to new system)
echo "\n\n===========================================================" >> project.txt
echo "# TYPE DEFINITIONS" >> project.txt
echo "===========================================================\n" >> project.txt

TYPE_FILES=(
  "types/database.types.ts"
  "utils/api-types.ts"
  "server/src/types/trpc-types.ts"
  "utils/generated-hooks.ts"
)

for file in "${TYPE_FILES[@]}"; do
  add_file "$file"
done

# 3) Global Providers
echo "\n\n===========================================================" >> project.txt
echo "# 2️⃣ GLOBAL PROVIDERS" >> project.txt
echo "===========================================================\n" >> project.txt

add_file "app/_layout.tsx"

# Find all provider files
find providers -name "*.tsx" -type f 2>/dev/null | while read file; do
  add_file "$file"
done

# Find utils with client setup (for trpc and supabase)
echo "\n\n===========================================================" >> project.txt
echo "# 6️⃣ CLIENT UTILITIES" >> project.txt
echo "===========================================================\n" >> project.txt

UTIL_FILES=(
  "utils/supabase.ts"
  "utils/trpc.ts"
  "utils/api.ts"
)

for file in "${UTIL_FILES[@]}"; do
  add_file "$file"
done

# 4) Navigation Layout Files
echo "\n\n===========================================================" >> project.txt
echo "# 3️⃣ NAVIGATION SHELLS" >> project.txt
echo "===========================================================\n" >> project.txt

NAV_FILES=(
  "app/(tabs)/_layout.tsx"
  "app/(tabs)/index.tsx"
  "app/(auth)/_layout.tsx"
)

for file in "${NAV_FILES[@]}"; do
  add_file "$file"
done

# 5) Key UI Components for Migration
echo "\n\n===========================================================" >> project.txt
echo "# 4️⃣ REUSABLE COMPONENTS" >> project.txt
echo "===========================================================\n" >> project.txt

# UI primitives first
find components/ui/primitives -name "*.tsx" -type f 2>/dev/null | while read file; do
  add_file "$file"
done

# Core shared components that will need migration
KEY_COMPONENTS=(
  "components/ui/Container.tsx"
  "components/ui/EmptyOrSkeleton.tsx"
  "components/ui/SwipeableRow.tsx"
  "components/dashboard/DashboardSection.tsx"
  "components/dashboard/GoalSummaryCard.tsx"
  "components/dashboard/DailyProgressBanner.tsx"
  "components/dashboard/TaskItem.tsx"
  "components/dashboard/HabitCheckItem.tsx"
  "components/lists/GoalList.tsx"
  "components/lists/TaskList.tsx"
  "components/lists/HabitList.tsx"
  "components/settings/ThemePreview.tsx"
  "components/compass/PrincipleCard.tsx"
  "components/rewards/ConfettiBurst.tsx"
)

for file in "${KEY_COMPONENTS[@]}"; do
  add_file "$file"
done

# 6) Feature Screens
echo "\n\n===========================================================" >> project.txt
echo "# 5️⃣ FEATURE SCREENS" >> project.txt
echo "===========================================================\n" >> project.txt

# Core feature screens
FEATURE_SCREENS=(
  "app/(tabs)/home/index.tsx"
  "app/(tabs)/planner/index.tsx"
  "app/(tabs)/compass/index.tsx"
  "app/(tabs)/rewards/index.tsx"
  "app/(tabs)/settings/index.tsx"
)

for file in "${FEATURE_SCREENS[@]}"; do
  add_file "$file"
done

# 7) Assets
echo "\n\n===========================================================" >> project.txt
echo "# 7️⃣ ASSETS" >> project.txt
echo "===========================================================\n" >> project.txt

# Just list asset directories
echo "Font Files in assets/fonts:" >> project.txt
ls -la assets/fonts 2>/dev/null >> project.txt || echo "No font directory found" >> project.txt

echo "\nLottie Files in assets:" >> project.txt
find assets -name "*.json" 2>/dev/null | sort >> project.txt || echo "No Lottie files found" >> project.txt

echo "\nSVG Files in assets:" >> project.txt
find assets -name "*.svg" 2>/dev/null | sort >> project.txt || echo "No SVG files found" >> project.txt

echo "\nAll project context has been collected in project.txt"
