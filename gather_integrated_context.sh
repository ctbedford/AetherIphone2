#!/bin/bash

# Create or truncate the project.txt file
echo "# Aether iPhone: Tamagui to Gluestack/NativeWind Migration" > project.txt
echo "Generated on $(date)" >> project.txt
echo "" >> project.txt

# Function to add a file to the project.txt with header
add_file_with_header() {
  local filename=$1
  local header=$2
  
  echo "\n\n## $header" >> project.txt
  
  if [ -f "$filename" ]; then
    echo "**Current implementation:** $filename" >> project.txt
    echo "\n\`\`\`" >> project.txt
    cat "$filename" >> project.txt
    echo "\`\`\`" >> project.txt
    echo "Added $filename to project.txt"
  else
    echo "**File planned but not yet created:** $filename" >> project.txt
  fi
}

# Function to add just the section header
add_section_header() {
  local header=$1
  echo "\n\n# $header" >> project.txt
}


# --- 1. Core Design System ---
add_section_header "1️⃣ Core Design System"
echo "\nMigration path: Tamagui tokens → Gluestack UI + NativeWind" >> project.txt

# Add current tamagui.config.ts
add_file_with_header "tamagui.config.ts" "Current tokens (tamagui.config.ts)"

# Add current tailwind.config.js
add_file_with_header "tailwind.config.js" "tailwind.config.js (to be rewritten)"

# Add constants/motion.ts for animation reference
add_file_with_header "constants/motion.ts" "Motion constants"

# Note planned files that don't exist yet
echo "\n\n## Planned new files" >> project.txt
echo "* tokens.ts - Export Tailwind-ready object instead of Tamagui createTokens" >> project.txt
echo "* theme.glue.ts - Wire Zelda palette & fonts into Gluestack provider" >> project.txt 
echo "* Primitives.tsx - Create wrappers for Gluestack equivalents" >> project.txt
echo "* Animations.ts - Create reusable Moti presets" >> project.txt


# --- 2. Global Providers ---
add_section_header "2️⃣ Global Providers"

# Current app/_layout.tsx implementation
add_file_with_header "app/_layout.tsx" "Current app/_layout.tsx (to be rewritten)"

# Show existing provider implementations
find providers -name "*.tsx" -type f 2>/dev/null | while read file; do
  filename=$(basename "$file")
  add_file_with_header "$file" "Current $filename (to be refactored)"
done

# Note planned providers
echo "\n\n## Planned new providers" >> project.txt
echo "* providers/TRPCProvider.tsx - Instantiate trpc.createClient() + React Query" >> project.txt
echo "* providers/SupabaseProvider.tsx - Context for supabase-js instance + session" >> project.txt


# --- 3. Navigation Shells ---
add_section_header "3️⃣ Navigation Shells (Expo Router)"

# Current tab layout implementation
add_file_with_header "app/(tabs)/_layout.tsx" "Current tab layout (to be rewritten)"

# Current auth layout implementation
add_file_with_header "app/(auth)/_layout.tsx" "Current auth layout"


# --- 4. Reusable Components ---
add_section_header "4️⃣ Reusable Components"

# Show current primitive components
echo "\n\n## Current UI primitives" >> project.txt
find components/ui/primitives -name "*.tsx" -type f 2>/dev/null | while read file; do
  component_name=$(basename "$file" .tsx)
  add_file_with_header "$file" "$component_name"
done

# Show some key components that will need conversion
echo "\n\n## Key components to migrate" >> project.txt
KEY_COMPONENTS=(
  "components/ui/Container.tsx"
  "components/ui/EmptyOrSkeleton.tsx"
  "components/dashboard/DashboardSection.tsx"
  "components/dashboard/GoalSummaryCard.tsx"
)

for file in "${KEY_COMPONENTS[@]}"; do
  if [ -f "$file" ]; then
    component_name=$(basename "$file" .tsx)
    add_file_with_header "$file" "$component_name"
  fi
done

# Note planned components
echo "\n\n## Planned new components" >> project.txt
echo "* SectionCard.tsx - Glazed parchment card with header, children slot" >> project.txt
echo "* StatBadge.tsx - Heart/rupee style KPI badge" >> project.txt
echo "* SkeletonCard.tsx - NativeWind animated placeholder" >> project.txt
echo "* EmptyState.tsx - Triforce-in-cloud illustration + call-to-action" >> project.txt


# --- 5. Feature Screens ---
add_section_header "5️⃣ Feature Screens"

# Show current implementations of main feature screens
echo "\n\n## Current implementations" >> project.txt
FEATURE_SCREENS=(
  "app/(tabs)/home/index.tsx"
  "app/(tabs)/planner/index.tsx"
  "app/(tabs)/compass/index.tsx"
  "app/(tabs)/rewards/index.tsx"
  "app/(tabs)/settings/index.tsx"
)

for file in "${FEATURE_SCREENS[@]}"; do
  if [ -f "$file" ]; then
    screen_name=$(echo "$file" | sed 's/.*\/(.*)\/\(.*\)\/index.tsx/\1-\2/')
    add_file_with_header "$file" "Current $screen_name screen"
  fi
done


# --- 6. Utilities & Hooks ---
add_section_header "6️⃣ Utils & Hooks"

# Show current client implementations
UTIL_FILES=(
  "utils/supabase.ts"
  "utils/trpc.ts"
)

for file in "${UTIL_FILES[@]}"; do
  if [ -f "$file" ]; then
    util_name=$(basename "$file" .ts)
    add_file_with_header "$file" "$util_name"
  fi
done

# --- 7. Type Definitions (for reference) ---
add_section_header "Type Definitions (for reference)"

TYPE_FILES=(
  "utils/api-types.ts"
  "server/src/types/trpc-types.ts"
)

for file in "${TYPE_FILES[@]}"; do
  if [ -f "$file" ]; then
    type_file=$(basename "$file" .ts)
    add_file_with_header "$file" "$type_file"
  fi
done


# --- 8. Assets ---
add_section_header "7️⃣ Assets"

# Just list asset directories
echo "\n\n## Font Files in assets/fonts:" >> project.txt
ls -la assets/fonts 2>/dev/null >> project.txt || echo "No font directory found" >> project.txt

echo "\n\n## Lottie Files in assets:" >> project.txt
find assets -name "*.json" 2>/dev/null | sort >> project.txt || echo "No Lottie files found" >> project.txt

echo "\n\nAll migration context has been collected in project.txt with integrated file contexts"
