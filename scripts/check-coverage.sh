#!/bin/bash

# Check test coverage and enforce thresholds
# This script runs unit tests with coverage and fails if thresholds are not met

set -e

echo "🧪 Running unit tests with coverage..."
echo ""

# Run tests with coverage
pnpm run test:coverage:check

# Check if coverage directory exists
if [ ! -d "coverage" ]; then
  echo "❌ Coverage directory not found!"
  exit 1
fi

# Parse coverage summary if available
if [ -f "coverage/coverage-summary.json" ]; then
  echo ""
  echo "📊 Coverage Summary:"
  echo "-------------------"

  # Use node to parse JSON and display results
  node -e "
    const fs = require('fs');
    const summary = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8'));
    const total = summary.total;

    console.log('Lines:      ' + total.lines.pct.toFixed(2) + '%');
    console.log('Statements: ' + total.statements.pct.toFixed(2) + '%');
    console.log('Functions:  ' + total.functions.pct.toFixed(2) + '%');
    console.log('Branches:   ' + total.branches.pct.toFixed(2) + '%');
    console.log('');

    // Check thresholds (these should match vitest.config.ts)
    const thresholds = {
      lines: 70,
      statements: 70,
      functions: 70,
      branches: 70
    };

    let failed = false;

    if (total.lines.pct < thresholds.lines) {
      console.log('❌ Lines coverage below threshold: ' + total.lines.pct.toFixed(2) + '% < ' + thresholds.lines + '%');
      failed = true;
    }
    if (total.statements.pct < thresholds.statements) {
      console.log('❌ Statements coverage below threshold: ' + total.statements.pct.toFixed(2) + '% < ' + thresholds.statements + '%');
      failed = true;
    }
    if (total.functions.pct < thresholds.functions) {
      console.log('❌ Functions coverage below threshold: ' + total.functions.pct.toFixed(2) + '% < ' + thresholds.functions + '%');
      failed = true;
    }
    if (total.branches.pct < thresholds.branches) {
      console.log('❌ Branches coverage below threshold: ' + total.branches.pct.toFixed(2) + '% < ' + thresholds.branches + '%');
      failed = true;
    }

    if (failed) {
      console.log('');
      console.log('❌ Coverage check failed!');
      process.exit(1);
    } else {
      console.log('✅ All coverage thresholds met!');
    }
  "
else
  echo "⚠️  Coverage summary not found, but tests passed"
fi

echo ""
echo "✅ Coverage check complete!"
