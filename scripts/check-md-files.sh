#!/bin/bash

# Pre-commit check to prevent .md files in project root
# Only README.md and a few whitelisted files are allowed in root

set -e

echo "📄 Checking for misplaced .md files in root..."

# Define allowed .md files in root (case-insensitive)
ALLOWED_FILES=(
  "README.md"
  "CHANGELOG.md"
  "LICENSE.md"
  "CONTRIBUTING.md"
  "CODE_OF_CONDUCT.md"
)

# Get all .md files being committed in the root directory
STAGED_MD_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep '^[^/]*\.md$' || true)

if [ -z "$STAGED_MD_FILES" ]; then
  echo "✅ No .md files in root directory"
  exit 0
fi

# Check each file against the allowed list
BLOCKED_FILES=""
for file in $STAGED_MD_FILES; do
  filename=$(basename "$file")
  is_allowed=false

  for allowed in "${ALLOWED_FILES[@]}"; do
    if [ "${filename,,}" = "${allowed,,}" ]; then
      is_allowed=true
      break
    fi
  done

  if [ "$is_allowed" = false ]; then
    BLOCKED_FILES="$BLOCKED_FILES\n  - $file"
  fi
done

if [ -n "$BLOCKED_FILES" ]; then
  echo ""
  echo "❌ ERROR: .md files found in project root!"
  echo ""
  echo "The following files should be moved to the docs/ directory:"
  echo -e "$BLOCKED_FILES"
  echo ""
  echo "📁 Suggested locations:"
  echo "  - Research documents → docs/research/"
  echo "  - Development docs → docs/development/"
  echo "  - Feature docs → docs/features/"
  echo "  - Review/analysis → docs/archive/"
  echo ""
  echo "💡 To move files automatically, run: ./scripts/organize-md-files.sh"
  echo "   Or bypass this check with: git commit --no-verify"
  echo ""
  exit 1
fi

echo "✅ All .md files in root are whitelisted"
exit 0
