# Local Testing Guide

This guide explains how to use the local testing setup to ensure code quality without CI/CD integration.

## Overview

The project uses a multi-layered local testing approach:

1. **Git Hooks** - Automatic checks before commits and pushes
2. **Test Coverage Checks** - Enforce coverage thresholds locally
3. **Manual Test Commands** - Run specific test suites as needed

## Prerequisites

After cloning the repository, install dependencies:

```bash
pnpm install
```

This will automatically set up git hooks via the `prepare` script.

## Git Hooks

### Pre-Commit Hook

Runs automatically before each commit to catch issues early.

**What it does:**
- Runs unit tests for changed files only
- Fast feedback loop (tests only affected code)
- Prevents committing broken code

**To skip (not recommended):**
```bash
git commit --no-verify -m "your message"
```

### Pre-Push Hook

Runs automatically before pushing to remote to ensure comprehensive quality.

**What it does:**
- Runs all unit tests with coverage
- Enforces coverage thresholds (70% branches, 75% functions, 80% lines/statements)
- Generates coverage report

**To skip (not recommended):**
```bash
git push --no-verify
```

## Coverage Thresholds

Current thresholds (configured in `vitest.config.ts`):
- **Lines:** 80%
- **Functions:** 75%
- **Branches:** 70%
- **Statements:** 80%

These thresholds are enforced on push to ensure code quality remains high.

**Note:** Critical paths like checkout components and shipping composables have higher thresholds (85-90%) to ensure comprehensive testing of payment and shipping logic.

## Test Commands

### Unit Tests

```bash
# Run all unit tests
pnpm run test:unit

# Run unit tests in watch mode (for development)
pnpm run test:unit:watch

# Run unit tests with UI
pnpm run test:unit:ui

# Run only changed tests (fast!)
pnpm run test:quick
```

### Coverage Commands

```bash
# Run tests with coverage report
pnpm run test:coverage

# Run coverage check (enforces thresholds)
pnpm run test:coverage:check

# Run coverage with UI
pnpm run test:coverage:ui

# View HTML coverage report
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

### E2E Tests

```bash
# Run all e2e tests
pnpm test

# Run e2e tests with UI
pnpm run test:ui

# Run specific browser
pnpm run test:chromium
pnpm run test:firefox
pnpm run test:webkit

# Run specific test suites
pnpm run test:auth
pnpm run test:products
pnpm run test:checkout
```

### Integration Tests

```bash
# Run all integration tests
pnpm run test:integration

# Run auth integration tests
pnpm run test:integration:auth
```

## Testing Workflow

### Before Committing

1. Make your changes
2. Run quick tests to verify:
   ```bash
   pnpm run test:quick
   ```
3. Commit (pre-commit hook runs automatically)

### Before Pushing

1. Ensure all tests pass:
   ```bash
   pnpm run test:unit
   ```
2. Check coverage:
   ```bash
   pnpm run test:coverage
   ```
3. If coverage is low, add more tests
4. Push (pre-push hook runs automatically)

### During Development

Use watch mode for instant feedback:
```bash
pnpm run test:unit:watch
```

This re-runs tests automatically when you save files.

## Manual Coverage Checks

You can manually run the coverage check script:

```bash
./scripts/check-coverage.sh
```

This provides a detailed coverage summary and fails if thresholds aren't met.

## Troubleshooting

### Hook Not Running

If git hooks aren't running:

```bash
# Reinstall husky
pnpm run prepare

# Verify hooks are executable
chmod +x .husky/pre-commit .husky/pre-push
chmod +x scripts/*.sh
```

### Coverage Below Threshold

If pre-push fails due to low coverage:

1. View the coverage report:
   ```bash
   open coverage/index.html
   ```
2. Identify uncovered code (shown in red)
3. Add tests for uncovered code
4. Re-run coverage check:
   ```bash
   pnpm run test:coverage:check
   ```

### Tests Failing

1. Run tests in watch mode to debug:
   ```bash
   pnpm run test:unit:watch
   ```
2. Run specific test files:
   ```bash
   pnpm run test:unit tests/unit/specific-file.test.ts
   ```
3. Use the test UI for debugging:
   ```bash
   pnpm run test:unit:ui
   ```

### Temporarily Disabling Hooks

For emergency situations only:

```bash
# Disable all hooks temporarily
export HUSKY=0

# Make your commit/push
git commit -m "emergency fix"
git push

# Re-enable hooks
unset HUSKY
```

## Best Practices

1. **Run tests frequently** - Use watch mode during development
2. **Check coverage locally** - Don't wait for push to discover coverage issues
3. **Write tests first** - TDD helps achieve better coverage
4. **Don't skip hooks** - They catch issues before they reach the repository
5. **Review coverage reports** - Look for untested edge cases

## Coverage Reports

Coverage reports are generated in multiple formats:

- **Text** - Terminal output
- **HTML** - Interactive browser view (`coverage/index.html`)
- **JSON** - Machine-readable (`coverage/coverage-summary.json`)
- **LCOV** - For IDE integration (`coverage/lcov.info`)

The `coverage/` directory is git-ignored and generated locally.

## IDE Integration

### VS Code

Install recommended extensions:
- **Vitest** - Run and debug tests in VS Code
- **Coverage Gutters** - Show coverage in the editor

Add to `.vscode/settings.json`:
```json
{
  "coverage-gutters.coverageFileNames": [
    "coverage/lcov.info"
  ]
}
```

### WebStorm/IntelliJ

1. Go to Run > Edit Configurations
2. Add Vitest configuration
3. Enable coverage in run settings
4. Coverage will be displayed inline

## What's Next?

Once these local checks are working well, you can:

1. **Integrate with CI/CD** - Run the same checks in GitHub Actions
2. **Add status badges** - Show coverage percentage in README
3. **Set up quality gates** - Block merges if coverage drops
4. **Add performance tests** - Monitor test execution time

## Questions?

- **Why these thresholds?** - The global thresholds (70-80%) provide a solid baseline, while critical paths have higher thresholds (85-90%) to ensure comprehensive testing of payment and shipping logic
- **Why both pre-commit and pre-push?** - Pre-commit is fast (changed files only), pre-push is comprehensive
- **Can I adjust thresholds?** - Yes, edit `vitest.config.ts` and update the coverage thresholds

---

Remember: These checks are here to help you catch issues early, not to slow you down. Use them as safety nets, not obstacles!
