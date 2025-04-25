#!/bin/bash

# Create output directory if it doesn't exist
mkdir -p output

OUTPUT_FILE="output/app_code_overview.txt"

# Clear output file if it exists
echo "# Aether App Code Overview" > $OUTPUT_FILE
echo "Generated on $(date)" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# Function to add file content to the output file
add_file() {
  local file=$1
  echo "## File: $file" >> $OUTPUT_FILE
  echo '```' >> $OUTPUT_FILE
  cat "$file" >> $OUTPUT_FILE
  echo '```' >> $OUTPUT_FILE
  echo "" >> $OUTPUT_FILE
}

# Find all relevant files
# Exclude:
# - node_modules
# - .git
# - .expo
# - .tamagui (generated code)
# - Large files like package-lock.json
# - Binary files
# Include important code files with extensions:
# - .tsx, .ts, .js, .jsx
# - .json (except package-lock.json)
# - .md for documentation

echo "Finding and processing relevant files..."

find . -type f \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -not -path "*/.expo/*" \
  -not -path "*/.tamagui/*" \
  -not -name "package-lock.json" \
  -not -path "*/output/*" \
  \( -name "*.tsx" -o -name "*.ts" -o -name "*.js" -o -name "*.jsx" -o -name "*.md" \) | sort | while read -r file; do
  
  # Check if file size is less than 500KB (to avoid very large files)
  file_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
  if [ "$file_size" -lt 500000 ]; then
    echo "Processing: $file"
    add_file "$file"
  else
    echo "Skipping large file: $file"
    echo "## File: $file (skipped - too large, size: $file_size bytes)" >> $OUTPUT_FILE
    echo "" >> $OUTPUT_FILE
  fi
done

# Add select JSON files (excluding package-lock.json which is already excluded above)
find . -type f -name "*.json" \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -not -path "*/.expo/*" \
  -not -path "*/.tamagui/*" \
  -not -name "package-lock.json" \
  -not -path "*/output/*" | sort | while read -r file; do
  
  file_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
  if [ "$file_size" -lt 100000 ]; then
    echo "Processing: $file"
    add_file "$file"
  else
    echo "Skipping large file: $file"
    echo "## File: $file (skipped - too large, size: $file_size bytes)" >> $OUTPUT_FILE
    echo "" >> $OUTPUT_FILE
  fi
done

echo "Code overview generated at $OUTPUT_FILE"
echo "Total size: $(stat -f%z "$OUTPUT_FILE" 2>/dev/null || stat -c%s "$OUTPUT_FILE" 2>/dev/null) bytes" 