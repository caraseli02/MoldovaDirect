# Visual Regression Tests - Command Reference

Quick copy-paste commands for visual regression testing.

---

## Generate Baselines (First Time)

```bash
# Start dev server (required)
npm run dev

# Generate all checkout baselines (28 screenshots)
npx playwright test checkout-flow --config=playwright.visual-regression.config.ts
```

---

## Run Tests

```bash
# All checkout visual tests
npx playwright test checkout-flow --config=playwright.visual-regression.config.ts

# All visual tests (checkout + critical pages)
npx playwright test --config=playwright.visual-regression.config.ts
```

---

## View Results

```bash
# Open HTML report with visual diffs
npx playwright show-report test-results/visual-regression-html
```

---

## Update Baselines

```bash
# Update all baselines (after intentional UI changes)
npx playwright test checkout-flow --config=playwright.visual-regression.config.ts --update-snapshots

# Update specific category
npx playwright test checkout-flow --config=playwright.visual-regression.config.ts --update-snapshots -g "Guest Checkout"
```

---

## Run Specific Categories

```bash
# Guest checkout only (9 screenshots)
npx playwright test checkout-flow -g "Guest Checkout Flow" --config=playwright.visual-regression.config.ts

# Multi-locale only (4 screenshots)
npx playwright test checkout-flow -g "Multi-Locale" --config=playwright.visual-regression.config.ts

# Components only (4 screenshots)
npx playwright test checkout-flow -g "Component Screenshots" --config=playwright.visual-regression.config.ts

# Express checkout only (3 screenshots, requires auth)
npx playwright test checkout-flow -g "Express Checkout" --config=playwright.visual-regression.config.ts

# Tablet viewport only (2 screenshots)
npx playwright test checkout-flow -g "Tablet Viewport" --config=playwright.visual-regression.config.ts

# Error states only (1 screenshot)
npx playwright test checkout-flow -g "Error States" --config=playwright.visual-regression.config.ts
```

---

## Debug Mode

```bash
# Run with UI mode (interactive)
npx playwright test checkout-flow --config=playwright.visual-regression.config.ts --ui

# Run with debug mode (step through)
npx playwright test checkout-flow --config=playwright.visual-regression.config.ts --debug -g "specific test"

# Run specific test
npx playwright test checkout-flow --config=playwright.visual-regression.config.ts -g "ready to place order"
```

---

## Check Status

```bash
# List all baseline screenshots
ls -lh tests/visual-regression/screenshots/

# Count baselines
ls tests/visual-regression/screenshots/ | wc -l

# View test results
ls -lh test-results/visual-regression/
```

---

## Cleanup

```bash
# Remove test results (keep baselines)
rm -rf test-results/visual-regression/
rm -rf test-results/visual-regression-html/

# Remove baselines (regenerate from scratch)
rm -rf tests/visual-regression/screenshots/*.png
```

---

## Git Commands

```bash
# Add baselines to git
git add tests/visual-regression/screenshots/

# Commit baselines
git commit -m "feat: add visual regression baselines for checkout"

# Check what changed
git diff tests/visual-regression/screenshots/
```

---

## CI/CD

```bash
# Run in CI mode (no interactive)
npx playwright test checkout-flow --config=playwright.visual-regression.config.ts --reporter=github

# Run with retry on failure
npx playwright test checkout-flow --config=playwright.visual-regression.config.ts --retries=2

# Run with specific workers
npx playwright test checkout-flow --config=playwright.visual-regression.config.ts --workers=1
```

---

## Environment Setup

```bash
# Create .env.test for express checkout tests
cat > .env.test << 'EOF'
TEST_USER_EMAIL=teste2e@example.com
TEST_USER_PASSWORD=your-password
EOF

# Install Playwright browsers
npx playwright install chromium

# Check Playwright installation
npx playwright --version
```

---

## Quick Workflow

```bash
# Full workflow: generate → test → view
npm run dev &
sleep 5
npx playwright test checkout-flow --config=playwright.visual-regression.config.ts
npx playwright show-report test-results/visual-regression-html
```

---

## Common Issues

```bash
# Server not running?
curl http://localhost:3000

# Clear Playwright cache
npx playwright cache clean

# Reinstall browsers
npx playwright install chromium --force
```

---

For detailed documentation, see:
- `tests/visual-regression/README.md` - Full guide
- `tests/visual-regression/QUICK-START.md` - Quick reference
