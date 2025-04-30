#!/bin/bash

# Create or truncate the implementation_details.txt file
echo "# Aether iPhone: Implementation Details for Migration Questions" > implementation_details.txt
echo "Generated on $(date)" >> implementation_details.txt
echo "" >> implementation_details.txt

# Function to add a file to the output with header
add_file_with_header() {
  local filename=$1
  local header=$2
  
  echo "\n\n## $header" >> implementation_details.txt
  
  if [ -f "$filename" ]; then
    echo "**File:** $filename" >> implementation_details.txt
    echo "\n\`\`\`" >> implementation_details.txt
    cat "$filename" >> implementation_details.txt
    echo "\`\`\`" >> implementation_details.txt
    echo "Added $filename to implementation_details.txt"
  else
    echo "**File not found:** $filename" >> implementation_details.txt
  fi
}

# Function to add just a section header
add_section_header() {
  local header=$1
  echo "\n\n# $header" >> implementation_details.txt
}

# 1. tRPC Routers and Procedures
add_section_header "1️⃣ tRPC Router Names & Procedure Signatures"

# First, find all router files
echo "\n## Router Definitions" >> implementation_details.txt
find server/src/routers -name "*.ts" -type f 2>/dev/null | while read file; do
  router_name=$(basename "$file" .ts)
  add_file_with_header "$file" "Router: $router_name"
done

# Look for router imports/exports to find the main app router
echo "\n## Router Import/Export Structure" >> implementation_details.txt
add_file_with_header "server/src/routers/index.ts" "Main App Router"

# Check if there's a dashboard-specific router
add_file_with_header "server/src/routers/dashboardRouter.ts" "Dashboard Router"

# Core entity routers (based on user's mention)
ROUTERS=(
  "server/src/routers/goalRouter.ts"
  "server/src/routers/taskRouter.ts"
  "server/src/routers/habitRouter.ts"
  "server/src/routers/profileRouter.ts"
  "server/src/routers/principleRouter.ts"
  "server/src/routers/rewardRouter.ts"
)

for file in "${ROUTERS[@]}"; do
  router_name=$(basename "$file" .ts | sed 's/Router//')
  add_file_with_header "$file" "$router_name Router"
done

# 2. Points Economy Endpoint
add_section_header "2️⃣ Points Economy Endpoint"

# Look for reward or points related files
echo "\n## Reward System Implementation" >> implementation_details.txt

# Check for reward/points routers
add_file_with_header "server/src/routers/rewardRouter.ts" "Reward Router"

# Check for points mutation handlers
find server/src -name "*.ts" -type f -exec grep -l "points\|rupees\|reward" {} \; 2>/dev/null | while read file; do
  if [[ $file != *test* ]]; then
    add_file_with_header "$file" "Points/Rewards Handler: $(basename "$file")"
  fi
done

# Frontend reward/points components
find components -name "*.tsx" -type f -exec grep -l "points\|rupees\|reward" {} \; 2>/dev/null | while read file; do
  if [[ $file != *test* ]]; then
    component_name=$(basename "$file" .tsx)
    add_file_with_header "$file" "Points/Rewards Component: $component_name"
  fi
done

# 3. Realtime Strategy
add_section_header "3️⃣ Realtime Strategy"

# Check for Supabase realtime implementation
echo "\n## Supabase Realtime Implementation" >> implementation_details.txt

# Look for channel subscriptions
find . -name "*.ts" -o -name "*.tsx" | grep -v "node_modules\|.git" | xargs grep -l "supabase.*channel\|on(\|channel" 2>/dev/null | while read file; do
  add_file_with_header "$file" "Realtime Channel: $(basename "$file")"
done

# Check for polling mechanisms
echo "\n## Polling Implementation" >> implementation_details.txt
find . -name "*.ts" -o -name "*.tsx" | grep -v "node_modules\|.git" | xargs grep -l "refetchInterval\|polling\|setInterval" 2>/dev/null | while read file; do
  add_file_with_header "$file" "Polling: $(basename "$file")"
done

# 4. Core Query Hooks
add_section_header "4️⃣ Core Query Hooks"

# Extract query hooks from the codebase
find hooks -name "*.ts" -type f 2>/dev/null | while read file; do
  hook_name=$(basename "$file" .ts)
  add_file_with_header "$file" "Hook: $hook_name"
done

# Look for any usage of tRPC queries
echo "\n## tRPC Query Usage Examples" >> implementation_details.txt
find app -name "*.tsx" -type f | xargs grep -l "useQuery\|useMutation\|trpc" 2>/dev/null | head -5 | while read file; do
  add_file_with_header "$file" "tRPC Query Example: $(basename "$file")"
done

# 5. Swipe-to-Complete Implementation
add_section_header "5️⃣ Dashboard "Task Swipe → Done" Flow"

# Look for swipe implementations
add_file_with_header "components/ui/SwipeableRow.tsx" "SwipeableRow Component"
add_file_with_header "components/dashboard/TaskItem.tsx" "TaskItem Component"

# Check task completion handlers
find . -name "*.ts" -o -name "*.tsx" | grep -v "node_modules\|.git" | xargs grep -l "completeTask\|onComplete\|markTaskComplete" 2>/dev/null | while read file; do
  add_file_with_header "$file" "Task Completion Handler: $(basename "$file")"
done

echo "\nAll implementation details for your open questions have been collected in implementation_details.txt"
