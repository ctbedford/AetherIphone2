#!/bin/bash

# Create output file with proper unicode encoding
OUTPUT_FILE="aether_migration_context_full.md"
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
    limit=500
  fi

  echo -e "\n### $header" >> "$OUTPUT_FILE"
  echo -e "\`\`\`" >> "$OUTPUT_FILE"
  find . -path "$pattern" -type f | grep -v "node_modules\|.git" | sort | head -n "$limit" >> "$OUTPUT_FILE"
  echo -e "\`\`\`" >> "$OUTPUT_FILE"
}

# Add all files in a directory recursively
add_directory_files() {
  local dir_path=$1
  local file_pattern=$2
  local description=$3
  
  # Default to all files if pattern not specified
  if [ -z "$file_pattern" ]; then
    file_pattern="*"
  fi
  
  # Get list of files
  files=$(find "$dir_path" -type f -name "$file_pattern" | grep -v "node_modules\|.git" | sort)
  
  # Process each file
  for file in $files; do
    add_file "$file" "$description"
  done
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
    toml) echo "toml" ;;
    sql) echo "sql" ;;
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
# TABLE OF CONTENTS
# ====================================================================================

add_section "📋 Table of Contents" "Navigation for this comprehensive document."

cat << 'EOF' >> "$OUTPUT_FILE"

1. [Project Overview & Migration Plan](#1️⃣-project-overview--migration-plan)
2. [Configuration Files](#2️⃣-configuration-files)
3. [Design System Migration](#3️⃣-design-system-migration)
4. [Provider Architecture](#4️⃣-provider-architecture)
5. [UI Components](#5️⃣-ui-components)
6. [App Screens](#6️⃣-app-screens)
7. [Backend & Data Layer](#7️⃣-backend--data-layer)
8. [Utilities & Hooks](#8️⃣-utilities--hooks)
9. [Zelda Styling Guide](#9️⃣-zelda-styling-guide)
10. [Assets & Files](#🎨-assets--files)
11. [Testing](#📊-testing)
12. [Supabase Integration](#💾-supabase-integration)

EOF

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

# Add basic readme
add_file "README.md" "Project documentation"

# Add any refactoring plans
add_file "refactoring_plan.md" "Migration plan details"
add_file "REFACTORING_PLAN_V2.yaml" "Updated migration plan"

# ====================================================================================
# 2. CONFIGURATION FILES
# ====================================================================================

add_section "2️⃣ Configuration Files" "Configuration files critical to the Tamagui → Gluestack/NativeWind migration."

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

# Add postcss config
add_file "postcss.config.js" "PostCSS configuration for Tailwind"

# Add eslint config
add_file ".eslintrc.js" "ESLint configuration"

# Add global types
add_file "global.d.ts" "Global TypeScript declarations"
add_file "expo-env.d.ts" "Expo environment type declarations"

# Add env example
add_file ".env.example" "Environment variables template"

# ====================================================================================
# 3. DESIGN SYSTEM MIGRATION
# ====================================================================================

add_section "3️⃣ Design System Migration" "Moving from Tamagui tokens to Gluestack UI theme & NativeWind classes."

# Add all design system files
add_directory_files "./design-system" "*" "Design system components, tokens, and utilities"

# Add color constant files
add_directory_files "./constants" "*" "Application constants including colors and animations"

# Identify existing theme/token imports for future reference
extract_patterns "from ['\"](.*tamagui.*|\.\./tokens)['\"]"\
"Theme/token imports to convert" "*.tsx" 10

# ====================================================================================
# 4. PROVIDER ARCHITECTURE
# ====================================================================================

add_section "4️⃣ Provider Architecture" "Overview of providers wrapper architecture."

# Current app layout (root provider setup)
add_file "app/_layout.tsx" "Root layout with providers" "Configures global providers and theme"

# Add all provider files
add_directory_files "./providers" "*.tsx" "Provider components for app-wide state and context"

# ====================================================================================
# 5. UI COMPONENTS
# ====================================================================================

add_section "5️⃣ UI Components" "UI component library including new Gluestack implementations."

# Add all component files grouped by category

# Dashboard components
add_subsection "Dashboard Components" "Components used in the dashboard interface"
add_directory_files "./components/dashboard" "*.tsx" "Dashboard UI components"

# UI primitives
add_subsection "UI Primitives" "Basic UI building blocks"
add_directory_files "./components/ui/primitives" "*.tsx" "Primitive UI components"

# General UI components
add_subsection "General UI Components" "Reusable UI components"
add_directory_files "./components/ui" "*.tsx" "General UI components"

# Lists components
add_subsection "List Components" "Components for displaying lists"
add_directory_files "./components/lists" "*.tsx" "List UI components"

# Planner components
add_subsection "Planner Components" "Components for planning features"
add_directory_files "./components/planner" "*.tsx" "Planner UI components"

# Auth components
add_subsection "Auth Components" "Authentication-related components"
add_directory_files "./components/auth" "*.tsx" "Authentication UI components"

# Other component directories
add_directory_files "./components/compass" "*.tsx" "Compass feature components"
add_directory_files "./components/rewards" "*.tsx" "Rewards feature components"
add_directory_files "./components/settings" "*.tsx" "Settings UI components"
add_directory_files "./components/aether" "*.tsx" "Aether-specific components"

# New Gluestack components (app/components)
add_subsection "New Gluestack Components" "New components using Gluestack UI"
add_directory_files "./app/components" "*.tsx" "New Gluestack UI components"

# ====================================================================================
# 6. APP SCREENS
# ====================================================================================

add_section "6️⃣ App Screens" "Application screens and routing structure."

# Add auth screens
add_subsection "Auth Screens" "Authentication screens"
add_file "app/(auth)/_layout.tsx" "Auth layout"
add_directory_files "./app/(auth)" "*.tsx" "Authentication screens"

# Add tabs layout
add_subsection "Tab Navigation" "Tab-based navigation structure"
add_file "app/(tabs)/_layout.tsx" "Tabs layout"

# Add home screens (original and Gluestack version)
add_subsection "Home/Dashboard Screens" "Dashboard main screens"
add_file "app/(tabs)/home/index.tsx" "Original home screen"
add_file "app/(tabs)/home/index.gluestack.tsx" "Gluestack version of home screen"

# Add planner screens
add_subsection "Planner Screens" "Task/habit/goal planning screens"
add_file "app/(tabs)/planner/_layout.tsx" "Planner layout"
add_directory_files "./app/(tabs)/planner" "*.tsx" "Planning screens"

# Add other tab screens
add_subsection "Other Main Screens" "Other main tab screens"
add_file "app/(tabs)/compass/index.tsx" "Compass screen"
add_file "app/(tabs)/rewards/index.tsx" "Rewards screen"

# Add settings screens
add_subsection "Settings Screens" "Settings and configuration screens"
add_file "app/(tabs)/settings/_layout.tsx" "Settings layout"
add_directory_files "./app/(tabs)/settings" "*.tsx" "Settings screens"

# Add other root-level screens
add_subsection "Other Screens" "Miscellaneous screens"
add_file "app/index.tsx" "Root index (if exists)"
add_file "app/compose.tsx" "Compose screen (if exists)"

# Add utility query hooks
add_subsection "Screen Query Hooks" "Hooks for screen data fetching"
add_directory_files "./app/lib" "*.ts" "Screen-specific utility hooks"

# ====================================================================================
# 7. BACKEND & DATA LAYER
# ====================================================================================

add_section "7️⃣ Backend & Data Layer" "Server-side code, routers, API integration."

# Add server entry points
add_subsection "Server Core" "Server entry points and context"
add_file "server/src/index.ts" "Server entry point"
add_file "server/src/context.ts" "tRPC context setup"
add_file "server/src/router.ts" "Main router configuration"

# Add server routers
add_subsection "tRPC Routers" "Backend tRPC routers"
add_directory_files "./server/src/routers" "*.ts" "tRPC router implementation"

# Add server types
add_subsection "Server Types" "Backend type definitions"
add_directory_files "./server/src/types" "*.ts" "Server-side type definitions"

# ====================================================================================
# 8. UTILITIES & HOOKS
# ====================================================================================

add_section "8️⃣ Utilities & Hooks" "Reusable utilities and React hooks."

# Add hooks
add_subsection "Hooks" "Custom React hooks"
add_directory_files "./hooks" "*.ts" "Custom React hooks"

# Add utilities
add_subsection "Utilities" "Helper utilities and functions"
add_directory_files "./utils" "*.ts" "Utility functions and helpers"

# Add stores
add_subsection "State Stores" "Global state management"
add_directory_files "./stores" "*.ts" "State stores (Zustand/Redux)"

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

# ====================================================================================
# 10. TESTING SETUP
# ====================================================================================

add_section "📊 Testing" "Testing configuration and test files."

# Add Jest config files
add_subsection "Jest Configuration" "Jest testing setup"
add_file "jest.config.ui.js" "UI component testing config"
add_file "jest.config.server.js" "Server testing config"
add_file "jest.setup.js" "Jest setup file"
add_file "jest.server.setup.js" "Jest server setup file"

# Add component tests
add_subsection "Component Tests" "UI component tests"
add_directory_files "./__tests__/components" "*.test.tsx" "Component test files"

# Add server tests
add_subsection "Server Tests" "Backend server tests"
add_directory_files "./__tests__/server" "*.test.ts" "Server test files"

# Add test utilities
add_subsection "Test Utilities" "Testing utilities and helpers"
add_file "./__tests__/test-utils.tsx" "Test utilities"
add_file "./__tests__/server/test-helpers.ts" "Server test helpers"

# ====================================================================================
# 11. SUPABASE INTEGRATION
# ====================================================================================

add_section "💾 Supabase Integration" "Supabase database integration."

# Add Supabase migration files
add_subsection "Supabase Migrations" "Database schema migrations"
add_directory_files "./supabase/migrations" "*.sql" "Supabase SQL migrations"

# Add Supabase config
add_subsection "Supabase Configuration" "Supabase connection setup"
add_file "supabase/config.toml" "Supabase configuration"
add_file "SUPABASE_INTEGRATION.md" "Supabase integration documentation"

# Add database types
add_subsection "Database Types" "Database type definitions"
add_file "types/database.types.ts" "Supabase database types"

# ====================================================================================
# 12. ASSETS & FILES
# ====================================================================================

add_section "🎨 Assets & Files" "Fonts, images, and other assets."

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

echo "Complete comprehensive migration context has been generated in $OUTPUT_FILE"
