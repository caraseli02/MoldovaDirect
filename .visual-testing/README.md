# Visual Testing

This directory contains all visual regression testing assets for the Moldova Direct project.

## Structure

```
.visual-testing/
├── baselines/          # Reference screenshots (git tracked)
│   └── [feature]/      # e.g., orders, products, checkout
│       └── [name]-[viewport].png
├── snapshots/          # Current test run (gitignored)
│   └── [timestamp]/    # e.g., 2024-01-15T10-30-00
│       └── [feature]/
│           └── [name]-[viewport].png
├── reports/            # HTML review reports (gitignored)
│   └── index.html
└── utils.ts            # Shared utilities
```

## Usage

### Running Visual Tests

```bash
# Run all visual tests
pnpm run test:visual

# Run specific feature
pnpm run test:visual -- --grep "orders"

# Update baselines (after reviewing snapshots)
pnpm run test:visual:update
```

### Reviewing Screenshots

After running tests, open the HTML report:
```bash
open .visual-testing/reports/index.html
```

### Updating Baselines

1. Run the visual tests
2. Review snapshots in `.visual-testing/snapshots/`
3. If changes are intentional, copy to baselines:
   ```bash
   pnpm run test:visual:update
   ```

## Naming Convention

Screenshots follow the pattern: `[name]-[viewport].png`

- **name**: Descriptive test name (kebab-case)
  - `full-page`, `metrics-section`, `filter-active`
- **viewport**: Screen size
  - `desktop` (1440px)
  - `tablet` (768px)
  - `mobile` (375px)

## Git Policy

- `baselines/` - **Committed** (reference images)
- `snapshots/` - **Ignored** (runtime only)
- `reports/` - **Ignored** (generated HTML)

## Adding New Visual Tests

1. Create test file in `tests/e2e/visual/[feature].spec.ts`
2. Use the `VisualTestUtils` helper
3. Run tests to generate snapshots
4. Review and approve as baselines
