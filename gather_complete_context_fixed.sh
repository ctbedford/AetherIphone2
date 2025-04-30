#!/bin/bash

# Create output file
OUTPUT_FILE="aether_migration_context.md"
echo "# Aether iPhone: Complete Migration Context" > "$OUTPUT_FILE"
echo "Generated on $(date)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# ====================================================================================
# UTILITY FUNCTIONS
# ====================================================================================

# Add a section header
add_section() {
  echo "\n\n# $1" >> "$OUTPUT_FILE"
  echo "$2" >> "$OUTPUT_FILE"
}

# Add a subsection header
add_subsection() {
  echo "\n\n## $1" >> "$OUTPUT_FILE"
  if [ ! -z "$2" ]; then
    echo "$2" >> "$OUTPUT_FILE"
  fi
}

# Add file content with header
add_file() {
  local file_path=$1
  local description=$2
  
  if [ -f "$file_path" ]; then
    echo "\n### $(basename "$file_path")" >> "$OUTPUT_FILE"
    echo "**Path:** $file_path" >> "$OUTPUT_FILE"
    if [ ! -z "$description" ]; then
      echo "**Description:** $description" >> "$OUTPUT_FILE"
    fi
    echo "\n\`\`\`$(get_file_extension "$file_path")" >> "$OUTPUT_FILE"
    cat "$file_path" >> "$OUTPUT_FILE"
    echo "\`\`\`" >> "$OUTPUT_FILE"
    echo "Added $file_path to $OUTPUT_FILE"
  else
    echo "\n### $(basename "$file_path") (planned)" >> "$OUTPUT_FILE"
    echo "**Path:** $file_path" >> "$OUTPUT_FILE"
    echo "**Status:** File planned but not yet created" >> "$OUTPUT_FILE"
    if [ ! -z "$description" ]; then
      echo "**Description:** $description" >> "$OUTPUT_FILE"
    fi
  fi
}

# Add compact file listing (not full content)
add_file_list() {
  local pattern=$1
  local header=$2
  local limit=$3
  
  # Use default limit if not specified
  if [ -z "$limit" ]; then
    limit=100
  fi

  echo "\n### $header" >> "$OUTPUT_FILE"
  echo "\`\`\`" >> "$OUTPUT_FILE"
  find . -path "$pattern" -type f | grep -v "node_modules\|.git" | sort | head -n "$limit" >> "$OUTPUT_FILE"
  echo "\`\`\`" >> "$OUTPUT_FILE"
}

# Get file extension for code formatting
get_file_extension() {
  local filename=$1
  local ext=${filename##*.}
  
  case "$ext" in
    ts|tsx) echo "typescript" ;;
    js|jsx) echo "javascript" ;;
    json) echo "json" ;;
    sh) echo "bash" ;;
    md) echo "markdown" ;;
    css) echo "css" ;;
    *) echo "" ;;
  esac
}

# Extract code patterns and add them
extract_patterns() {
  local pattern=$1
  local description=$2
  local file_pattern=$3
  local limit=$4
  
  # Use default limit if not specified
  if [ -z "$limit" ]; then
    limit=5
  fi
  
  if [ -z "$file_pattern" ]; then
    file_pattern="."
  fi

  echo "\n### Code with pattern: '$pattern'" >> "$OUTPUT_FILE"
  echo "**Description:** $description" >> "$OUTPUT_FILE"
  
  # Find files matching pattern
  find . -path "$file_pattern" -type f -name "*.ts" -o -name "*.tsx" | \
    grep -v "node_modules\|.git\|dist\|build" | \
    xargs grep -l "$pattern" 2>/dev/null | \
    head -n "$limit" | while read file; do
      echo "\n#### From $(basename "$file")" >> "$OUTPUT_FILE"
      echo "\`\`\`$(get_file_extension "$file")" >> "$OUTPUT_FILE"
      grep -A 5 -B 5 "$pattern" "$file" | head -n 15 >> "$OUTPUT_FILE"
      echo "\`\`\`" >> "$OUTPUT_FILE"
    done
}

# ====================================================================================
# 1. PROJECT OVERVIEW AND MIGRATION PLAN
# ====================================================================================

add_section "1ufe0fu20e3 Project Overview & Migration Plan" "Top-level overview and plan for Tamagui u2192 Gluestack/NativeWind migration."

# Add the refactoring plan
cat << 'EOF' >> "$OUTPUT_FILE"

## Refactoring Plan

File-by-file work-order for the frontend refactor.
* Top-level paths follow an Expo Router layout (app/u2026)
* ud83dudd2e marks assumptions to be confirmed

### 1ufe0fu20e3 Core Design System (/design-system)

| File | Action | Depends on | Why |
| --- | --- | --- | --- |
| tokens.ts | keep u2192 export Tailwind-ready object instead of Tamagui createTokens | n/a | single source for color / spacing across Gluestack and NativeWind |
| theme.glue.ts | new u2013 export const gluestackTheme = {tokens, components} | tokens.ts, Gluestack | wires Zelda palette + fonts into Gluestack provider |
| tailwind.config.js | rewrite with content: ["app/**/*.{tsx,ts}"] + colors from tokens | tokens.ts, NativeWind | unlocks className="bg-parchment" etc. in JSX |
| Primitives.tsx | new u2013 <Stack> <Text> <Button> wrappers u2b95 Gluestack equivalents | gluestackTheme | lets old code migrate screen-by-screen w/out mass edits |
| Animations.ts | new u2013 reusable Moti presets (fadeInUp, runePulse) | moti, react-native-reanimated | consistent motion language |

### 2ufe0fu20e3 Global Providers

| File | Action | Depends on | Why |
| --- | --- | --- | --- |
| app/_layout.tsx | rewrite u2013 wrap with <GluestackProvider theme={gluestackTheme}>, <TRPCProvider>, <SupabaseProvider> | theme.glue.ts, ud83dudd2e TRPCProvider, ud83dudd2e SupabaseProvider | guarantees every screen sees styled components + auth + queries |
| providers/TRPCProvider.tsx | new u2013 instantiates trpc.createClient() + React Query | @trpc/client, @tanstack/react-query | centralises tRPC; screens just useTRPCQuery() |

### 3ufe0fu20e3 Navigation Shells

| File | Action | Depends on | Why |
| --- | --- | --- | --- |
| app/(tabs)/_layout.tsx | keep u2013 Expo Router structure (tho migrate Tamagui instances) | n/a | tab layout doesn't need much refactoring |
| app/(auth)/_layout.tsx | keep u2013 Expo Router structure (tho migrate Tamagui instances) | n/a | auth layout doesn't need much refactoring |

### 4ufe0fu20e3 Reusable UI Components

| File | Action | Depends on | Why |
| --- | --- | --- | --- |
| SwipeableRow.tsx | implement u2013 left swipe to Complete, right swipe to Delete | react-native-gesture-handler, react-native-reanimated | enables task status changes with haptic confirmation |
| TaskRow.tsx | implement u2013 task row formatting for to-do lists | SwipeableRow | consistent per-task presentation (name, due date, etc) |
| SectionCard.tsx | implement u2013 glazed Sheikah-glass card section | tokens, useColorScheme | consistent dashboard UI module |

### 5ufe0fu20e3 Feature Screens Migration
Migrate each one with an index.gluestack.tsx, leave old versions until each can be tested.

| Screen | New Path | Action |
| --- | --- | --- |
| Dashboard | app/(tabs)/home/index.gluestack.tsx | Implement "Task Swipe u2192 Done" with SectionCard + Gluestack |
| Planner | app/(tabs)/planner/index.gluestack.tsx | Migrate later | 
| Compass | app/(tabs)/compass/index.gluestack.tsx | Migrate later |
| Rewards | app/(tabs)/rewards/index.gluestack.tsx | Migrate later |
| Settings | app/(tabs)/settings/index.gluestack.tsx | Migrate later |

### 6ufe0fu20e3 Utility Hooks

| File | Action | Depends on | Why |
| --- | --- | --- | --- |
| useDashboardQuery.ts | implement u2013 fetches active tasks, habits, goals via tRPC | TRPCProvider, React Query | clean abstraction to get status summary |
| useToggleTaskStatus.ts | implement u2013 mutates task status w/ optimistic update | TRPCProvider, React Query | toggle task (complete/not) with onSuccess/onError hooks |
EOF

# Add key package.json for dependencies
add_file "package.json" "Current dependencies and scripts"

# ====================================================================================
# 2. CONFIGURATION FILES
# ====================================================================================

add_section "2ufe0fu20e3 Key Configuration Files" "Configuration files critical to the Tamagui u2192 Gluestack/NativeWind migration."

# Add current Tamagui config (to be migrated from)
add_file "tamagui.config.ts" "Current Tamagui configuration (migration source)"

# Add current babel config
add_file "babel.config.js" "Babel configuration - needs updates for NativeWind"

# Add current tsconfig
add_file "tsconfig.json" "TypeScript configuration"

# Add current tailwind config (to be updated)
add_file "tailwind.config.js" "Tailwind CSS configuration - needs updates for NativeWind"

# Add metro config if it exists
add_file "metro.config.js" "Metro bundler configuration"

# Add app.json for Expo configuration
add_file "app.json" "Expo app configuration"

# ====================================================================================
# 3. DESIGN SYSTEM MIGRATION
# ====================================================================================

add_section "3ufe0fu20e3 Design System Migration" "Moving from Tamagui tokens to Gluestack UI theme & NativeWind classes."

# Core design system directories
add_file_list "./design-system/*" "Existing design system files"

# Current theme tokens from Tamagui
add_file "design-system/tokens.ts" "Current or new design tokens" "Single source for color/spacing across Gluestack and NativeWind"

# Add the new Gluestack theme file (if it exists)
add_file "design-system/theme.glue.ts" "New Gluestack theme configuration" "Wires Zelda palette + fonts into Gluestack provider"

# Add the Primitives wrapper (if it exists)
add_file "design-system/Primitives.tsx" "UI primitives wrapper" "Wrappers for Gluestack equivalents to ease migration"

# Add the Animations file (if it exists)
add_file "design-system/Animations.ts" "Animation presets" "Reusable Moti animation presets"

# Identify existing theme/token imports for future reference
extract_patterns "from ['\"](.*tamagui.*|\.\./tokens)['\"]"\
"Theme/token imports to convert" "*.tsx" 10

# ====================================================================================
# 4. PROVIDER ARCHITECTURE
# ====================================================================================

add_section "4ufe0fu20e3 Provider Architecture" "Overview of providers wrapper architecture."

# Current app layout (root provider setup)
add_file "app/_layout.tsx" "Root layout with providers" "Configures global providers and theme"

# Current providers directory
add_file_list "./providers/*" "Current provider files"

# Add GluestackProvider if it exists
add_file "providers/GluestackProvider.tsx" "New Gluestack provider" "Provides Gluestack theme to app"

# Other key providers
add_file "providers/Providers.tsx" "Current providers wrapper (to be refactored)" 
add_file "providers/TRPCProvider.tsx" "tRPC client provider" "Centralizes tRPC + React Query setup"
add_file "providers/SupabaseProvider.tsx" "Supabase client provider" "Centralizes Supabase client + auth state"

# ====================================================================================
# 5. DASHBOARD IMPLEMENTATION
# ====================================================================================

add_section "5ufe0fu20e3 Dashboard Implementation" "Focus on the critical 'Task Swipe u2192 Done' feature for migration."

# Current home screen (to be migrated)
add_file "app/(tabs)/home/index.tsx" "Current dashboard implementation (to be migrated)"

# New Gluestack implementation (if exists)
add_file "app/(tabs)/home/index.gluestack.tsx" "New Gluestack dashboard implementation"

# SwipeableRow component (if exists)
add_file "app/components/SwipeableRow.tsx" "Swipeable row component for task actions"

# TaskRow component (if exists)
add_file "app/components/TaskRow.tsx" "Task row formatting for to-do lists"

# SectionCard component (if exists)
add_file "app/components/SectionCard.tsx" "Glazed Sheikah-glass card section"

# Dashboard query hook (if exists)
add_file "app/lib/useDashboardQuery.ts" "Hook for fetching dashboard data"

# Task toggle hook (if exists)
add_file "app/lib/useToggleTaskStatus.ts" "Hook for toggling task status"

# ====================================================================================
# 6. TASK/SWIPE IMPLEMENTATION DETAILS
# ====================================================================================

add_section "6ufe0fu20e3 Task Swipe Implementation Details" "Technical details of the swipe-to-complete feature."

# Find swipe implementations in the codebase
extract_patterns "SwipeableRow|onSwipe|onSwipeLeft|onSwipeRight" "Swipeable row implementation details"

# Find task completion logic in the codebase
extract_patterns "completeTask|markTaskComplete|toggleTaskStatus" "Task completion logic"

# ====================================================================================
# 7. TRPC INTEGRATION
# ====================================================================================

add_section "7ufe0fu20e3 tRPC Integration" "How tRPC is integrated with the frontend."

# Look for tRPC router and task-related procedures
find server/src/routers -name "*.ts" -type f 2>/dev/null | while read file; do
  if grep -q "task\|Task" "$file"; then
    add_file "$file" "tRPC router with task-related procedures"
  fi
done

# Look for tRPC utility files
add_file "utils/trpc.ts" "tRPC client utility"

# Find tRPC query/mutation usage
extract_patterns "trpc\..*\.useQuery|trpc\..*\.useMutation" "tRPC query and mutation usage"

# ====================================================================================
# 8. SUPABASE INTEGRATION
# ====================================================================================

add_section "8ufe0fu20e3 Supabase Integration" "How Supabase is integrated with the frontend."

# Look for Supabase client setup
add_file "utils/supabase.ts" "Supabase client utility"

# Find Supabase usage patterns
extract_patterns "supabase\.|from\(.*\)\." "Supabase client usage patterns"

# ====================================================================================
# 9. ASSETS & STYLES
# ====================================================================================

add_section "9ufe0fu20e3 Assets & Styles" "Fonts, images, and other assets."

# Add font asset listing
echo "\n### Font Assets" >> "$OUTPUT_FILE"
echo "\`\`\`" >> "$OUTPUT_FILE"
find assets -name "*.ttf" -o -name "*.otf" 2>/dev/null | sort >> "$OUTPUT_FILE"
echo "\`\`\`" >> "$OUTPUT_FILE"

# Add image asset listing
echo "\n### Image Assets" >> "$OUTPUT_FILE"
echo "\`\`\`" >> "$OUTPUT_FILE"
find assets -name "*.png" -o -name "*.jpg" -o -name "*.svg" 2>/dev/null | sort >> "$OUTPUT_FILE"
echo "\`\`\`" >> "$OUTPUT_FILE"

# Add animation asset listing
echo "\n### Animation Assets (Lottie)" >> "$OUTPUT_FILE"
echo "\`\`\`" >> "$OUTPUT_FILE"
find assets -name "*.json" 2>/dev/null | sort >> "$OUTPUT_FILE"
echo "\`\`\`" >> "$OUTPUT_FILE"

echo "Complete migration context has been generated in $OUTPUT_FILE"
