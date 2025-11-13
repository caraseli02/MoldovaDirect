#!/bin/bash

# Script to organize .md files from project root into appropriate docs/ subdirectories
# This helps maintain clean project structure and documentation organization

set -e

echo "🗂️  Organizing .md files from project root..."
echo ""

# Create necessary directories if they don't exist
mkdir -p docs/research
mkdir -p docs/development
mkdir -p docs/archive
mkdir -p docs/features

# Define allowed files in root
ALLOWED_FILES=(
  "README.md"
  "CHANGELOG.md"
  "LICENSE.md"
  "CONTRIBUTING.md"
  "CODE_OF_CONDUCT.md"
)

# Function to check if file is allowed in root
is_allowed() {
  local file="$1"
  local filename=$(basename "$file")

  for allowed in "${ALLOWED_FILES[@]}"; do
    if [ "${filename,,}" = "${allowed,,}" ]; then
      return 0
    fi
  done

  return 1
}

# Function to determine destination based on filename
get_destination() {
  local filename="$1"

  # Research documents
  if [[ "$filename" =~ ^research- ]] || \
     [[ "$filename" =~ RESEARCH ]] || \
     [[ "$filename" =~ ^FILTER.*RESEARCH ]] || \
     [[ "$filename" =~ LANDING_PAGE.*ANALYSIS ]] || \
     [[ "$filename" =~ build-performance ]]; then
    echo "docs/research"
    return
  fi

  # Review and analysis documents (archive them)
  if [[ "$filename" =~ REVIEW ]] || \
     [[ "$filename" =~ VERIFICATION ]] || \
     [[ "$filename" =~ SUMMARY ]] || \
     [[ "$filename" =~ ^PR_REVIEW ]] || \
     [[ "$filename" =~ ^CODE_REVIEW ]]; then
    echo "docs/archive"
    return
  fi

  # Strategy and planning documents
  if [[ "$filename" =~ STRATEGY ]] || \
     [[ "$filename" =~ MILESTONE ]] || \
     [[ "$filename" =~ QUICK_START ]]; then
    echo "docs/development"
    return
  fi

  # Repository guidelines
  if [[ "$filename" =~ ^AGENTS\.md$ ]]; then
    echo "docs/development"
    return
  fi

  # Default to archive for unknown files
  echo "docs/archive"
}

# Track moved files
MOVED_COUNT=0
SKIPPED_COUNT=0

# Find and process all .md files in root
for file in *.md; do
  # Skip if no .md files found
  [ -e "$file" ] || continue

  # Skip allowed files
  if is_allowed "$file"; then
    echo "⏭️  Skipping $file (allowed in root)"
    ((SKIPPED_COUNT++))
    continue
  fi

  # Determine destination
  dest=$(get_destination "$file")
  dest_file="$dest/$file"

  # Check if destination file already exists
  if [ -f "$dest_file" ]; then
    echo "⚠️  $dest_file already exists, skipping $file"
    echo "   Please review manually and delete if needed"
    ((SKIPPED_COUNT++))
    continue
  fi

  # Move the file
  echo "📦 Moving $file → $dest/"
  if git ls-files --error-unmatch "$file" > /dev/null 2>&1; then
    # File is tracked by git, use git mv
    git mv "$file" "$dest_file"
  else
    # File is not tracked, use regular mv
    mv "$file" "$dest_file"
  fi
  ((MOVED_COUNT++))
done

echo ""
echo "✅ Organization complete!"
echo "   Moved: $MOVED_COUNT files"
echo "   Skipped: $SKIPPED_COUNT files"
echo ""

if [ $MOVED_COUNT -gt 0 ]; then
  echo "💡 Next steps:"
  echo "   1. Review the moved files in docs/ subdirectories"
  echo "   2. Delete any obsolete files from docs/archive/"
  echo "   3. Commit the changes: git commit -m 'docs: organize .md files into proper directories'"
  echo ""
fi

exit 0
