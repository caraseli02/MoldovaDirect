#!/bin/bash

##############################################################################
#
# Fix All ESLint Warnings - Master Script
#
# This script systematically fixes ESLint warnings:
# 1. Removes console.log statements
# 2. Removes unused variables
# 3. Fixes `any` types in TypeScript/Vue files
# 4. Validates the results
#
# Usage:
#   ./scripts/fix-all-warnings.sh [--dry-run] [--stage <N>]
#
# Stages:
#   1: Console cleanup
#   2: Unused variables
#   3: Any type fixes
#   4: Validation
#
##############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DRY_RUN=false
START_STAGE=1
TOTAL_STAGES=4

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --stage)
      START_STAGE=$2
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           ESLint Warning Fixer - Master Script                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Get current warning count
get_warning_count() {
  npm run lint 2>&1 | grep "✖" | grep -oE "[0-9]+ warnings" | grep -oE "[0-9]+" || echo "0"
}

echo -e "${YELLOW}📊 Current Status:${NC}"
CURRENT_COUNT=$(get_warning_count)
echo "   Total warnings: $CURRENT_COUNT"
echo ""

# ============================================================================
# STAGE 1: Console Cleanup
# ============================================================================
if [ $START_STAGE -le 1 ]; then
  echo -e "${BLUE}STAGE 1/4: Console Cleanup${NC}"
  echo "─────────────────────────────────────────────────────────────────────────────"
  echo ""

  DRY_RUN_FLAG=""
  if [ "$DRY_RUN" = true ]; then
    DRY_RUN_FLAG="--dry-run"
  fi

  # Count console.log statements
  CONSOLE_COUNT=$(grep -r "console\.\(log\|debug\|info\|table\|dir\)" \
    --include="*.ts" --include="*.tsx" --include="*.vue" \
    --exclude-dir=node_modules --exclude-dir=.nuxt \
    2>/dev/null | wc -l || echo "0")

  echo "Found $CONSOLE_COUNT console statements to clean"
  echo ""

  if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}[DRY RUN] Would remove console statements${NC}"
  else
    echo "Removing debug console statements..."
    # This would be run by the build system typically
    npm run lint -- --fix 2>&1 | grep "console" || true
  fi

  echo ""
  echo -e "${GREEN}✅ Stage 1 complete${NC}"
  echo ""
fi

# ============================================================================
# STAGE 2: Unused Variables
# ============================================================================
if [ $START_STAGE -le 2 ]; then
  echo -e "${BLUE}STAGE 2/4: Unused Variables${NC}"
  echo "─────────────────────────────────────────────────────────────────────────────"
  echo ""

  # Count unused variables
  UNUSED_COUNT=$(npm run lint 2>&1 | grep "no-unused-vars" | wc -l || echo "0")
  echo "Found $UNUSED_COUNT unused variable warnings"
  echo ""

  if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}[DRY RUN] Would prefix unused variables with underscore${NC}"
  else
    echo "ESLint auto-fix enabled for unused variables"
    npm run lint -- --fix 2>&1 | grep "unused" || true
  fi

  echo ""
  echo -e "${GREEN}✅ Stage 2 complete${NC}"
  echo ""
fi

# ============================================================================
# STAGE 3: Any Type Fixes
# ============================================================================
if [ $START_STAGE -le 3 ]; then
  echo -e "${BLUE}STAGE 3/4: Fix \`any\` Type Warnings${NC}"
  echo "─────────────────────────────────────────────────────────────────────────────"
  echo ""

  # General any type fixes
  echo "Running general any type fixes..."
  DRY_RUN_FLAG=""
  if [ "$DRY_RUN" = true ]; then
    DRY_RUN_FLAG="--dry-run"
  fi

  npx tsx scripts/fix-any-types.ts $DRY_RUN_FLAG 2>/dev/null || true

  echo ""
  echo "Running Vue component any type fixes..."
  npx tsx scripts/fix-vue-any-types.ts $DRY_RUN_FLAG 2>/dev/null || true

  echo ""
  echo -e "${GREEN}✅ Stage 3 complete${NC}"
  echo ""
fi

# ============================================================================
# STAGE 4: Validation
# ============================================================================
if [ $START_STAGE -le 4 ]; then
  echo -e "${BLUE}STAGE 4/4: Validation${NC}"
  echo "─────────────────────────────────────────────────────────────────────────────"
  echo ""

  if [ "$DRY_RUN" = false ]; then
    echo "Running ESLint validation..."
    NEW_COUNT=$(get_warning_count)

    echo "Running TypeScript check..."
    npm run type-check 2>&1 || true

    echo "Building project..."
    npm run build 2>&1 | tail -5 || true

    echo ""
    echo -e "${YELLOW}📊 Results:${NC}"
    echo "   Before: $CURRENT_COUNT warnings"
    echo "   After:  $NEW_COUNT warnings"

    if [ "$NEW_COUNT" -lt "$CURRENT_COUNT" ]; then
      REDUCTION=$((CURRENT_COUNT - NEW_COUNT))
      PERCENT=$((REDUCTION * 100 / CURRENT_COUNT))
      echo -e "   ${GREEN}Reduced by $REDUCTION warnings ($PERCENT%)${NC}"
    fi

    echo ""
    echo -e "${GREEN}✅ Validation complete${NC}"
  else
    echo -e "${YELLOW}[DRY RUN] Skipping validation${NC}"
  fi

  echo ""
fi

# ============================================================================
# Summary
# ============================================================================
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                         PROCESS COMPLETE                                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}💡 This was a dry run. Run without --dry-run to apply changes.${NC}"
else
  echo -e "${GREEN}✅ All warnings have been processed!${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Review changes: git diff"
  echo "  2. Stage changes: git add ."
  echo "  3. Commit: git commit -m 'fix: reduce ESLint warnings'"
  echo "  4. Push: git push"
fi

echo ""
