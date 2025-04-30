#!/bin/bash

# Create or truncate the project.txt file
echo "# Aether iPhone Project Context for Tamagui to Gluestack/NativeWind Migration" > project.txt
echo "Generated on $(date)" >> project.txt
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

# Add main Tamagui configuration files
add_file "tamagui.config.ts"
add_file ".tamagui/tamagui.config.json"
add_file "app/_layout.tsx"

# Process all component directories
echo "\n\n===========================================================" >> project.txt
echo "# ALL COMPONENTS" >> project.txt
echo "===========================================================\n" >> project.txt

# Find all component files
find components -name "*.tsx" -type f | while read file; do
  add_file "$file"
done

# Process all app screens
echo "\n\n===========================================================" >> project.txt
echo "# APP SCREENS" >> project.txt
echo "===========================================================\n" >> project.txt

# Find all app screen files
find app -name "*.tsx" -type f | grep -v "_layout.tsx" | while read file; do
  add_file "$file"
done

# Add constants and utils
echo "\n\n===========================================================" >> project.txt
echo "# CONSTANTS AND UTILS" >> project.txt
echo "===========================================================\n" >> project.txt

# List of styling utility files
STYLING_FILES=(
  "constants/motion.ts"
  "constants/theme.ts"
  "utils/themes.ts"
  "utils/styleUtils.ts"
)

for file in "${STYLING_FILES[@]}"; do
  add_file "$file"
done

echo "\nAll styling-related files have been collected in project.txt"