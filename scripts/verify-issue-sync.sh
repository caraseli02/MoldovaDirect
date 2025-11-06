#!/bin/bash
#
# Issue Synchronization Verification Script
#
# Purpose: Detect stale issue references in documentation
# Usage: ./scripts/verify-issue-sync.sh
# Exit Code: 0 = all synced, 1 = stale references found
#

set -e

echo "🔍 Issue Synchronization Verification"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

TRACKER_FILE="docs/meta/ISSUE_STATUS_TRACKER.md"
ISSUES_FOUND=0

# Check if tracker exists
if [ ! -f "$TRACKER_FILE" ]; then
  echo -e "${RED}❌ ERROR: Issue tracker not found at $TRACKER_FILE${NC}"
  exit 1
fi

echo "📄 Reading fixed issues from $TRACKER_FILE..."
echo ""

# Extract fixed issues - simpler approach
# Get issue numbers from lines like "#### #159 - Title" that are followed by "Status:** ✅ FIXED"
FIXED_ISSUES=$(grep -B 1 "Status.*✅.*FIXED" "$TRACKER_FILE" | grep "^####" | grep -oP '#\K[0-9]+' | sort -u)

if [ -z "$FIXED_ISSUES" ]; then
  echo -e "${YELLOW}⚠️  WARNING: No fixed issues found in tracker${NC}"
  echo "   Checked pattern: #### #XXX followed by Status:** ✅ FIXED"
  exit 0
fi

echo "✅ Found fixed issues:"
for issue in $FIXED_ISSUES; do
  echo "   - #$issue"
done
echo ""

echo "🔎 Searching for stale references..."
echo ""

# Search for each fixed issue being referenced as pending/TODO
for issue in $FIXED_ISSUES; do
  # Search patterns that would indicate the issue is still considered pending
  STALE_REFS=$(grep -rn \
    --include="*.md" \
    --exclude="ISSUE_STATUS_TRACKER.md" \
    --exclude="ISSUE_SYNC_PROCESS.md" \
    --exclude="*VERIFICATION*.md" \
    --exclude="MVP_STATUS_UPDATE*.md" \
    -E "#${issue}[^0-9].*([Pp]ending|TODO|MUST DO|NOT.*[Ff]ixed|⚠️.*[Ww]ork|🚨)" \
    docs/ todos/ .kiro/ 2>/dev/null || true)

  if [ -n "$STALE_REFS" ]; then
    echo -e "${RED}⚠️  Issue #$issue is marked as FIXED but found stale references:${NC}"
    echo "$STALE_REFS" | while IFS= read -r line; do
      echo "   $line"
    done
    echo ""
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
  fi
done

# Also check for references in Week 1/Week 2 sections that should be moved
echo "🔎 Checking for fixed issues in active work sections..."
echo ""

for issue in $FIXED_ISSUES; do
  # Check if issue is still in "Week 1" or "What You Need to Do" sections
  ACTIVE_REFS=$(grep -rn \
    --include="*.md" \
    --exclude="ISSUE_STATUS_TRACKER.md" \
    --exclude="*VERIFICATION*.md" \
    -B 10 "#${issue}" \
    docs/getting-started/ docs/meta/ 2>/dev/null | \
    grep -E "(Week 1:|What You Need to Do|MUST DO|Work on these)" || true)

  if [ -n "$ACTIVE_REFS" ]; then
    # Check if this section also mentions "Recently Completed" or "FIXED"
    # to filter out false positives
    if ! echo "$ACTIVE_REFS" | grep -q -E "(Recently Completed|FIXED|✅)"; then
      echo -e "${YELLOW}⚠️  Issue #$issue may be in wrong section:${NC}"
      echo "$ACTIVE_REFS" | head -3
      echo ""
      ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
  fi
done

# Summary
echo "======================================"
if [ $ISSUES_FOUND -eq 0 ]; then
  echo -e "${GREEN}✅ SUCCESS: All issue references are synchronized!${NC}"
  echo ""
  echo "All fixed issues are properly documented and no stale"
  echo "references were found in planning documents."
  exit 0
else
  echo -e "${RED}❌ FAILED: Found $ISSUES_FOUND stale issue reference(s)${NC}"
  echo ""
  echo "Action required:"
  echo "1. Update the files listed above"
  echo "2. Move fixed issues to 'Recently Completed' sections"
  echo "3. Update status from 'pending' to 'FIXED'"
  echo "4. Add commit hashes and dates"
  echo "5. Run this script again to verify"
  echo ""
  echo "See docs/meta/ISSUE_SYNC_PROCESS.md for details"
  exit 1
fi
