#!/bin/bash

# GitHub API token
TOKEN="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"
REPO="caraseli02/MoldovaDirect"

# Function to create label
create_label() {
    local name=$1
    local color=$2
    local description=$3

    echo "Creating label: $name"
    curl -s -X POST \
        -H "Authorization: token $TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/repos/$REPO/labels" \
        -d "{\"name\":\"$name\",\"color\":\"$color\",\"description\":\"$description\"}" \
        | jq -r 'if .name then "✓ Created: \(.name)" else "✗ \(.message)" end'
}

# Create all labels
create_label "P2-medium" "ffeb3b" "Medium priority - fix when possible"
create_label "P3-low" "4caf50" "Low priority - nice to have"
create_label "testing" "9c27b0" "Testing related"
create_label "a11y" "2196f3" "Accessibility"
create_label "cart" "03a9f4" "Shopping cart related"
create_label "checkout" "00bcd4" "Checkout flow related"
create_label "performance" "8bc34a" "Performance optimization"
create_label "security" "f44336" "Security related"
create_label "ux" "e91e63" "User experience"
create_label "i18n" "9e9e9e" "Internationalization"
create_label "technical-debt" "795548" "Technical debt"
create_label "data-integrity" "ff5722" "Data integrity issues"
create_label "maintainability" "607d8b" "Code maintainability"
create_label "wcag" "1976d2" "WCAG compliance"
create_label "reliability" "673ab7" "Reliability issues"
create_label "error-handling" "ff6f00" "Error handling"
create_label "ui" "00acc1" "User interface"
create_label "consistency" "009688" "Code consistency"
create_label "typescript" "3f51b5" "TypeScript related"
create_label "refactor" "ffc107" "Code refactoring"

echo ""
echo "✓ All labels created!"
