#!/bin/bash

# Script to create milestones and assign issues
# Usage: ./create-milestones.sh [--dry-run]

set -e

DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
  DRY_RUN=true
  echo "🔍 DRY RUN MODE - No changes will be made"
  echo ""
fi

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🎯 Creating Milestones for Moldova Direct"
echo "=========================================="
echo ""

# Function to create milestone
create_milestone() {
  local title="$1"
  local description="$2"
  local due_date="$3"

  if [ "$DRY_RUN" = true ]; then
    echo -e "${BLUE}[DRY RUN]${NC} Would create milestone: ${GREEN}$title${NC}"
    echo "  Description: $description"
    echo "  Due date: $due_date"
    echo ""
    return 0
  fi

  echo -e "Creating milestone: ${GREEN}$title${NC}"

  if [ -z "$due_date" ]; then
    gh api repos/caraseli02/MoldovaDirect/milestones \
      -X POST \
      -f title="$title" \
      -f description="$description" \
      -f state="open" > /dev/null
  else
    gh api repos/caraseli02/MoldovaDirect/milestones \
      -X POST \
      -f title="$title" \
      -f description="$description" \
      -f due_on="$due_date" \
      -f state="open" > /dev/null
  fi

  echo -e "  ${GREEN}✓${NC} Created successfully"
  echo ""
}

# Function to assign issues to milestone
assign_issues() {
  local milestone="$1"
  shift
  local issues=("$@")

  if [ "$DRY_RUN" = true ]; then
    echo -e "${BLUE}[DRY RUN]${NC} Would assign ${#issues[@]} issues to: ${GREEN}$milestone${NC}"
    echo "  Issues: ${issues[*]}"
    echo ""
    return 0
  fi

  echo -e "Assigning ${#issues[@]} issues to: ${GREEN}$milestone${NC}"

  local count=0
  for issue in "${issues[@]}"; do
    gh issue edit "$issue" --milestone "$milestone" 2>/dev/null && ((count++)) || true
  done

  echo -e "  ${GREEN}✓${NC} Assigned $count issues"
  echo ""
}

# Create Milestones

echo "📋 Step 1: Creating Milestones"
echo "------------------------------"
echo ""

create_milestone \
  "🚨 Security & GDPR Sprint" \
  "Critical security and GDPR compliance issues blocking production launch. Zero P0 vulnerabilities, GDPR Article 5/17 compliance, admin endpoint authentication, production monitoring." \
  "2025-11-26T23:59:59Z"

create_milestone \
  "⚡ Performance Optimization Sprint" \
  "Performance improvements targeting 40-60% faster application. Lighthouse >85, LCP <2.5s, Bundle <250KB, zero N+1 queries in critical paths." \
  "2025-12-10T23:59:59Z"

create_milestone \
  "🔧 Technical Debt Reduction Sprint" \
  "Code quality improvements and refactoring for maintainability. Remove 2,550 lines, split large components, improve type safety. Target: -2.5% codebase size, <500 LOC per file." \
  "2025-12-24T23:59:59Z"

create_milestone \
  "🎨 UX & Accessibility Polish" \
  "User experience improvements and WCAG 2.1 AA compliance. Checkout flow enhancements, product browsing features, keyboard navigation, screen reader support. Target: >95 Lighthouse Accessibility score." \
  "2026-01-07T23:59:59Z"

create_milestone \
  "🛡️ Data Integrity & Reliability Sprint" \
  "Race condition fixes, transaction wrapping, error handling improvements. Target: Zero race conditions, all DB ops in transactions, 99.9% uptime." \
  "2026-01-21T23:59:59Z"

create_milestone \
  "🔐 Security Hardening Sprint" \
  "Defense-in-depth security: rate limiting, CSRF protection, CSP headers, input validation. PCI DSS documentation and compliance. Target: Security audit passed." \
  "2026-02-04T23:59:59Z"

create_milestone \
  "🧪 Testing & Quality Sprint" \
  "Comprehensive test coverage (80% target), type safety improvements, translation coverage audit. E2E tests for admin workflows, eliminate test anti-patterns." \
  "2026-02-18T23:59:59Z"

create_milestone \
  "🚀 Post-Launch Features" \
  "Features to implement after MVP launch based on user feedback and analytics. Includes shipping calculations, review system, enhanced filters, skeleton loaders, FAQ content." \
  ""

create_milestone \
  "💡 Future Enhancements" \
  "Low-priority features for quarterly review and validation. Includes blog section, stock notifications, wishlist refinements, advanced automation. Review quarterly before promoting to active milestones." \
  ""

echo ""
echo "📌 Step 2: Assigning Issues to Milestones"
echo "-----------------------------------------"
echo ""

# Security & GDPR Sprint (P0 Critical)
assign_issues "🚨 Security & GDPR Sprint" \
  224 225 226 173 174 175 176 177 178 90 119 120 101

# Performance Optimization Sprint (P1 Performance)
assign_issues "⚡ Performance Optimization Sprint" \
  227 228 229 237 238 79 109 108 112

# Technical Debt Reduction Sprint (P1 Refactoring)
assign_issues "🔧 Technical Debt Reduction Sprint" \
  230 231 236 65 115 114 81 67

# UX & Accessibility Polish (P1-P2 UX/A11y)
assign_issues "🎨 UX & Accessibility Polish" \
  184 185 189 126 130 181 182 183 188 110 116 179 180 186 187 123 106 107

# Data Integrity & Reliability Sprint (P1-P2 Data/Error Handling)
assign_issues "🛡️ Data Integrity & Reliability Sprint" \
  235 77 124 103 131 78 113 127 70 102 104

# Security Hardening Sprint (P2 Security)
assign_issues "🔐 Security Hardening Sprint" \
  232 233 234 80 71 94 93 185

# Testing & Quality Sprint (P2 Testing)
assign_issues "🧪 Testing & Quality Sprint" \
  100 69 68 63 62 61 125 114 66 64 133

# Post-Launch Features (🔜 Post-Launch label)
assign_issues "🚀 Post-Launch Features" \
  152 151 150 149 148 147 153 134 133 129 128 127 126 125 124 123 \
  120 113 112 111 110 109 108 136 135 134 137 131 138 56 72

# Future Enhancements (💡 Future label)
assign_issues "💡 Future Enhancements" \
  154 117 122 105 143 144 132 118 115 114

echo ""
echo "=========================================="
echo -e "${GREEN}✓ Milestone creation complete!${NC}"
echo ""
echo "📊 Summary:"
echo "  - 9 milestones created"
echo "  - ~89 issues assigned"
echo ""
echo "Next steps:"
echo "  1. Review milestones: gh api repos/caraseli02/MoldovaDirect/milestones"
echo "  2. View issues by milestone: gh issue list --milestone \"🚨 Security & GDPR Sprint\""
echo "  3. Start working on Security & GDPR Sprint (highest priority)"
echo ""

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}⚠️  This was a DRY RUN - no changes were made${NC}"
  echo "Run without --dry-run to create milestones and assign issues"
  echo ""
fi
