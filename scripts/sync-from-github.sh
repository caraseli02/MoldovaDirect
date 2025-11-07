#!/bin/bash
#
# Sync Issue Status from GitHub
#
# Purpose: Query GitHub Issues API to get current status and generate reports
# Usage: ./scripts/sync-from-github.sh
# Requires: gh CLI (GitHub CLI)
#

set -e

echo "🔄 Syncing Issue Status from GitHub"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ ERROR: GitHub CLI (gh) not found${NC}"
    echo ""
    echo "Install it:"
    echo "  macOS:   brew install gh"
    echo "  Linux:   https://github.com/cli/cli/blob/trunk/docs/install_linux.md"
    echo "  Windows: https://github.com/cli/cli#installation"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not authenticated with GitHub${NC}"
    echo ""
    echo "Run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI ready"
echo ""

# Get MVP milestone issues
echo "📊 Fetching MVP Launch Blockers milestone..."

# Get all issues from MVP milestone
MILESTONE_NAME="MVP Launch Blockers"
MVP_ISSUES=$(gh issue list \
    --milestone "$MILESTONE_NAME" \
    --state all \
    --json number,title,state,closedAt,labels \
    --limit 100 2>/dev/null || echo "[]")

if [ "$MVP_ISSUES" = "[]" ]; then
    echo -e "${YELLOW}⚠️  No issues found in '$MILESTONE_NAME' milestone${NC}"
    echo ""
    echo "Either:"
    echo "  1. The milestone doesn't exist"
    echo "  2. No issues are assigned to it"
    echo ""
    echo "Create milestone and assign issues on GitHub:"
    echo "  https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/milestones"
    exit 1
fi

# Parse issue counts
TOTAL=$(echo "$MVP_ISSUES" | jq length)
CLOSED=$(echo "$MVP_ISSUES" | jq '[.[] | select(.state == "CLOSED")] | length')
OPEN=$((TOTAL - CLOSED))
PERCENT=$((CLOSED * 100 / TOTAL))

echo ""
echo "📈 MVP Milestone Status:"
echo "   Total Issues: $TOTAL"
echo "   Closed: $CLOSED ($PERCENT%)"
echo "   Open: $OPEN"
echo ""

# Generate status report
OUTPUT_FILE="docs/meta/MVP_STATUS_FROM_GITHUB.md"

cat > "$OUTPUT_FILE" << EOF
# MVP Status Report (from GitHub)

**Generated:** $(date +"%Y-%m-%d %H:%M:%S")
**Source:** GitHub Issues via \`gh\` CLI
**Milestone:** $MILESTONE_NAME

---

## 📊 Summary

| Metric | Count | Percentage |
|--------|-------|------------|
| **Total Issues** | $TOTAL | 100% |
| **Closed** | $CLOSED | $PERCENT% |
| **Open** | $OPEN | $((100 - PERCENT))% |

---

## ✅ Closed Issues

EOF

# Add closed issues
echo "$MVP_ISSUES" | jq -r '.[] | select(.state == "CLOSED") |
"- ✅ [#\(.number)](\(.url)) - \(.title)
  Closed: \(.closedAt // "unknown" | split("T")[0])"' >> "$OUTPUT_FILE"

if [ "$CLOSED" -eq 0 ]; then
    echo "No issues closed yet." >> "$OUTPUT_FILE"
fi

cat >> "$OUTPUT_FILE" << EOF

---

## ⚠️ Open Issues

EOF

# Add open issues with priority labels
echo "$MVP_ISSUES" | jq -r '.[] | select(.state == "OPEN") |
"- [ ] [#\(.number)](https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/issues/\(.number)) - \(.title)
  Labels: \(.labels | map(.name) | join(", "))"' >> "$OUTPUT_FILE"

if [ "$OPEN" -eq 0 ]; then
    echo -e "${GREEN}🎉 All MVP issues closed!${NC}" >> "$OUTPUT_FILE"
fi

cat >> "$OUTPUT_FILE" << EOF

---

## 🔗 Links

- [View all MVP issues](https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/milestone/1)
- [Create new issue](https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/issues/new)

---

**Note:** This file is auto-generated. Do not edit manually.
Run \`./scripts/sync-from-github.sh\` to regenerate.
EOF

echo -e "${GREEN}✅ Generated: $OUTPUT_FILE${NC}"
echo ""

# Show summary
echo "📝 Quick Summary:"
echo ""
cat "$OUTPUT_FILE" | grep -A 10 "## 📊 Summary"
echo ""

# Optionally commit if in CI or if --commit flag passed
if [ "$1" = "--commit" ]; then
    echo "💾 Committing changes..."
    git add "$OUTPUT_FILE"
    git commit -m "docs: sync MVP status from GitHub Issues

Updated: $(date +"%Y-%m-%d")
Closed: $CLOSED/$TOTAL issues ($PERCENT% complete)" || true
    echo -e "${GREEN}✅ Committed${NC}"
fi

echo ""
echo "🎯 Next Steps:"
if [ "$OPEN" -gt 0 ]; then
    echo "   1. Review open issues on GitHub"
    echo "   2. Fix issues and close them with 'Fixes #XXX' in commit"
    echo "   3. Re-run this script to update status"
else
    echo "   🎉 All MVP issues closed! Ready to launch!"
fi
echo ""
echo "📋 View full report: $OUTPUT_FILE"
