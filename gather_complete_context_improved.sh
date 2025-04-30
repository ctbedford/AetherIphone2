#!/bin/bash

# Create output file with proper unicode encoding
OUTPUT_FILE="aether_migration_context.md"
echo -e "# Aether iPhone: Complete Migration Context" > "$OUTPUT_FILE"
echo -e "Generated on $(date)" >> "$OUTPUT_FILE"
echo -e "" >> "$OUTPUT_FILE"

# ====================================================================================
# UTILITY FUNCTIONS
# ====================================================================================

# Add a section header
add_section() {
  echo -e "\n\n# $1" >> "$OUTPUT_FILE"
  echo -e "$2" >> "$OUTPUT_FILE"
}

# Add a subsection header
add_subsection() {
  echo -e "\n\n## $1" >> "$OUTPUT_FILE"
  if [ ! -z "$2" ]; then
    echo -e "$2" >> "$OUTPUT_FILE"
  fi
}

# Add file content with header
add_file() {
  local file_path=$1
  local description=$2
  
  if [ -f "$file_path" ]; then
    echo -e "\n### $(basename "$file_path")" >> "$OUTPUT_FILE"
    echo -e "**Path:** $file_path" >> "$OUTPUT_FILE"
    if [ ! -z "$description" ]; then
      echo -e "**Description:** $description" >> "$OUTPUT_FILE"
    fi
    echo -e "\n\`\`\`$(get_file_extension "$file_path")" >> "$OUTPUT_FILE"
    cat "$file_path" >> "$OUTPUT_FILE"
    echo -e "\`\`\`" >> "$OUTPUT_FILE"
    echo "Added $file_path to $OUTPUT_FILE"
  else
    echo -e "\n### $(basename "$file_path") (planned)" >> "$OUTPUT_FILE"
    echo -e "**Path:** $file_path" >> "$OUTPUT_FILE"
    echo -e "**Status:** File planned but not yet created" >> "$OUTPUT_FILE"
    if [ ! -z "$description" ]; then
      echo -e "**Description:** $description" >> "$OUTPUT_FILE"
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

  echo -e "\n### $header" >> "$OUTPUT_FILE"
  echo -e "\`\`\`" >> "$OUTPUT_FILE"
  find . -path "$pattern" -type f | grep -v "node_modules\|.git" | sort | head -n "$limit" >> "$OUTPUT_FILE"
  echo -e "\`\`\`" >> "$OUTPUT_FILE"
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

  echo -e "\n### Code with pattern: '$pattern'" >> "$OUTPUT_FILE"
  echo -e "**Description:** $description" >> "$OUTPUT_FILE"
  
  # Find files matching pattern
  find . -path "$file_pattern" -type f -name "*.ts" -o -name "*.tsx" | \
    grep -v "node_modules\|.git\|dist\|build" | \
    xargs grep -l "$pattern" 2>/dev/null | \
    head -n "$limit" | while read file; do
      echo -e "\n#### From $(basename "$file")" >> "$OUTPUT_FILE"
      echo -e "\`\`\`$(get_file_extension "$file")" >> "$OUTPUT_FILE"
      grep -A 5 -B 5 "$pattern" "$file" | head -n 15 >> "$OUTPUT_FILE"
      echo -e "\`\`\`" >> "$OUTPUT_FILE"
    done
}

# ====================================================================================
# 1. PROJECT OVERVIEW AND MIGRATION PLAN
# ====================================================================================

add_section "1️⃣ Project Overview & Migration Plan" "Top-level overview and plan for Tamagui → Gluestack/NativeWind migration."

# Add the refactoring plan
cat << 'EOF' >> "$OUTPUT_FILE"

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
EOF

# Add key package.json for dependencies
add_file "package.json" "Current dependencies and scripts"

# ====================================================================================
# 2. CONFIGURATION FILES
# ====================================================================================

add_section "2️⃣ Key Configuration Files" "Configuration files critical to the Tamagui → Gluestack/NativeWind migration."

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

add_section "3️⃣ Design System Migration" "Moving from Tamagui tokens to Gluestack UI theme & NativeWind classes."

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

add_section "4️⃣ Provider Architecture" "Overview of providers wrapper architecture."

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

add_section "5️⃣ Dashboard Implementation" "Focus on the critical 'Task Swipe → Done' feature for migration."

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

add_section "6️⃣ Task Swipe Implementation Details" "Technical details of the swipe-to-complete feature."

# Find swipe implementations in the codebase
extract_patterns "SwipeableRow|onSwipe|onSwipeLeft|onSwipeRight" "Swipeable row implementation details"

# Find task completion logic in the codebase
extract_patterns "completeTask|markTaskComplete|toggleTaskStatus" "Task completion logic"

# ====================================================================================
# 7. TRPC INTEGRATION
# ====================================================================================

add_section "7️⃣ tRPC Integration" "How tRPC is integrated with the frontend."

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

add_section "8️⃣ Supabase Integration" "How Supabase is integrated with the frontend."

# Look for Supabase client setup
add_file "utils/supabase.ts" "Supabase client utility"

# Find Supabase usage patterns
extract_patterns "supabase\.|from\(.*\)\." "Supabase client usage patterns"

# ====================================================================================
# 9. ZELDA STYLING GUIDE
# ====================================================================================

add_section "9️⃣ Zelda Styling Guide" "Zelda: Breath of the Wild / Sheikah Slate aesthetic guidelines."

# Add styling context if available
if [ -f "aether_styling_context.txt" ]; then
  echo -e "\n### Zelda Theme Styling Guide" >> "$OUTPUT_FILE"
  echo -e "**Source:** aether_styling_context.txt" >> "$OUTPUT_FILE"
  echo -e "\n\`\`\`" >> "$OUTPUT_FILE"
  grep -A 20 -B 2 "hex codes\|fonts\|Sheikah\|Korok\|parchment" aether_styling_context.txt | head -30 >> "$OUTPUT_FILE"
  echo -e "\n\`\`\`" >> "$OUTPUT_FILE"
fi

# Find existing UI primitives to migrate
echo -e "\n### UI Primitives to Migrate" >> "$OUTPUT_FILE"
find components/ui/primitives -name "*.tsx" -type f 2>/dev/null | while read file; do
  component_name=$(basename "$file" .tsx)
  echo -e "\n#### $component_name" >> "$OUTPUT_FILE"
  echo -e "**File:** $file" >> "$OUTPUT_FILE"
  echo -e "\n\`\`\`typescript" >> "$OUTPUT_FILE"
  head -30 "$file" >> "$OUTPUT_FILE"
  echo -e "\n...\n\`\`\`" >> "$OUTPUT_FILE"
done

# ====================================================================================
# 10. ASSETS & STYLES
# ====================================================================================

add_section "🎨 Assets & Styles" "Fonts, images, and other assets."

# Add font asset listing
echo -e "\n### Font Assets" >> "$OUTPUT_FILE"
echo -e "\`\`\`" >> "$OUTPUT_FILE"
find assets -name "*.ttf" -o -name "*.otf" 2>/dev/null | sort >> "$OUTPUT_FILE"
echo -e "\`\`\`" >> "$OUTPUT_FILE"

# Add image asset listing
echo -e "\n### Image Assets" >> "$OUTPUT_FILE"
echo -e "\`\`\`" >> "$OUTPUT_FILE"
find assets -name "*.png" -o -name "*.jpg" -o -name "*.svg" 2>/dev/null | sort >> "$OUTPUT_FILE"
echo -e "\`\`\`" >> "$OUTPUT_FILE"

# Add animation asset listing
echo -e "\n### Animation Assets (Lottie)" >> "$OUTPUT_FILE"
echo -e "\`\`\`" >> "$OUTPUT_FILE"
find assets -name "*.json" 2>/dev/null | sort >> "$OUTPUT_FILE"
echo -e "\`\`\`" >> "$OUTPUT_FILE"

echo "Complete migration context has been generated in $OUTPUT_FILE"
